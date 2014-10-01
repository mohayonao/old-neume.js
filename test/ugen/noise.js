"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/noise"));

describe("ugen/noise", function() {
  var Neume = null;

  before(function() {
    Neume = neume.exports(new window.AudioContext());
  });

  describe("$(white)", function() {
    it("returns a OscillatorNode", function() {
      var synth = new Neume(function($) {
        return $("white");
      })();

      assert.deepEqual(synth.outlet.toJSON(), {
        name: "AudioBufferSourceNode",
        buffer: {
          name: "AudioBuffer",
          length: 44100,
          duration: 1,
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
      });
    });
    it("works", function() {
      var synth = new Neume(function($) {
        return $("white");
      })();

      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100);
      synth.stop(0.200);

      audioContext.$process(0.300);
      assert(outlet.$stateAtTime(0.000) === "SCHEDULED");
      assert(outlet.$stateAtTime(0.050) === "SCHEDULED");
      assert(outlet.$stateAtTime(0.100) === "PLAYING");
      assert(outlet.$stateAtTime(0.150) === "PLAYING");
      assert(outlet.$stateAtTime(0.200) === "FINISHED");
      assert(outlet.$stateAtTime(0.250) === "FINISHED");
    });
  });
  describe("$(pink)", function() {
    it("returns a OscillatorNode", function() {
      var synth = new Neume(function($) {
        return $("pink");
      })();

      assert.deepEqual(synth.outlet.toJSON(), {
        name: "AudioBufferSourceNode",
        buffer: {
          name: "AudioBuffer",
          length: 44100,
          duration: 1,
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
      });
    });
    it("works", function() {
      var synth = new Neume(function($) {
        return $("pink");
      })();

      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100);
      synth.stop(0.200);

      audioContext.$process(0.300);
      assert(outlet.$stateAtTime(0.000) === "SCHEDULED");
      assert(outlet.$stateAtTime(0.050) === "SCHEDULED");
      assert(outlet.$stateAtTime(0.100) === "PLAYING");
      assert(outlet.$stateAtTime(0.150) === "PLAYING");
      assert(outlet.$stateAtTime(0.200) === "FINISHED");
      assert(outlet.$stateAtTime(0.250) === "FINISHED");
    });
  });
});
