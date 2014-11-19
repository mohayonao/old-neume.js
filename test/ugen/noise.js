"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/noise"));

describe("ugen/noise", function() {
  var Neume = null;

  before(function() {
    Neume = neume.exports(new global.AudioContext());
  });

  describe("$(white)", function() {
    it("returns a OscillatorNode", function() {
      var synth = new Neume(function($) {
        return $("white");
      })();

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "AudioBufferSourceNode",
            buffer: {
              name: "AudioBuffer",
              length: 44100 * 4,
              duration: 4,
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
          }
        ]
      });
    });
    it("works", function() {
      var synth = new Neume(function($) {
        return $("white");
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100);
      synth.stop(0.200);

      audioContext.$processTo("00:00.300");
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

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "AudioBufferSourceNode",
            buffer: {
              name: "AudioBuffer",
              length: 44100 * 4,
              duration: 4,
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
          }
        ]
      });
    });
    it("works", function() {
      var synth = new Neume(function($) {
        return $("pink");
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100);
      synth.stop(0.200);

      audioContext.$processTo("00:00.300");
      assert(outlet.$stateAtTime(0.000) === "SCHEDULED");
      assert(outlet.$stateAtTime(0.050) === "SCHEDULED");
      assert(outlet.$stateAtTime(0.100) === "PLAYING");
      assert(outlet.$stateAtTime(0.150) === "PLAYING");
      assert(outlet.$stateAtTime(0.200) === "FINISHED");
      assert(outlet.$stateAtTime(0.250) === "FINISHED");
    });
  });
});
