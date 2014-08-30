"use strict";

global.window = global;
global.assert = require("power-assert");
global.sinon  = require("sinon");

require("espower-loader")({
  cwd: process.cwd(),
  pattern: "test/**/*.js"
});

global.Promise = require("promise");

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

require("web-audio-mock");
