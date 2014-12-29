"use strict";

if (typeof Promise === "undefined") {
  global.Promise = require("es6-promise").Promise;
}

global.XMLHttpRequest = (function() {
  function XMLHttpRequest() {
  }
  XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
  };
  XMLHttpRequest.prototype.send = function() {
    setTimeout(function() {
      if (this._url === "/success") {
        this.readyState = 4;
        this.status = 200;
        this.response = new Uint32Array(16).buffer;
        this.onload();
      } else {
        this.onerror();
      }
    }.bind(this), 0);
  };
  return XMLHttpRequest;
})();

require("web-audio-test-api");

global.assert = require("power-assert");
global.sinon = require("sinon");

global.useTimer = function(context, fn) {
  var ms = 50;
  var audioContext = context.audioContext;
  var clock = sinon.useFakeTimers();

  fn.call(this, function(tick) {
    var n = Math.ceil(tick / ms);
    for (var i = 0; i < n; i++) {
      clock.tick(ms);
      audioContext.$process(ms / 1000);
    }
  });

  clock.restore();
};

global.closeTo = function(actual, expected, delta) {
  return Math.abs(actual - expected) <= delta;
};

global.NOP = function() {};

global.BUFSRC = function(length) {
  return {
    name: "AudioBufferSourceNode",
    buffer: {
      name: "AudioBuffer",
      length: length,
      duration: length / 44100,
      sampleRate: 44100,
      numberOfChannels: 1
    },
    playbackRate: {
      value: 1,
      inputs: []
    },
    loop: true,
    loopStart: 0,
    loopEnd: 0,
    inputs: []
  };
};

global.OSCILLATOR = function(type, freq) {
  return {
    name: "OscillatorNode",
    type: type,
    frequency: {
      value: freq,
      inputs: []
    },
    detune: {
      value: 0,
      inputs: []
    },
    inputs: []
  };
};
