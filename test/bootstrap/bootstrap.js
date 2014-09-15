"use strict";

global.window = global;
global.assert = require("power-assert");
global.sinon  = require("sinon");

require("espower-loader")({
  cwd: process.cwd(),
  pattern: "test/**/*.js"
});

global.closeTo = function(actual, expected, delta) {
  return Math.abs(actual - expected) <= delta;
};

global.navigator = {};

global.Promise = require("promise");

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

global.DC = function(/* value */) {
  return {
    name: "AudioBufferSourceNode",
    buffer: {
      name: "AudioBuffer",
      length: 128,
      duration: 0.0029024943310657597,
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

require("web-audio-test-api");
