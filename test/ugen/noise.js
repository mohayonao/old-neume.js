"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/noise"));

describe("ugen/noise", function() {
  var Neume = null;

  beforeEach(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("graph", function() {
    it("$('noise', { type: 'white' })", function() {
      var synth = Neume.Synth(function($) {
        return $("noise", { type: "white" });
      });

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
    it("$('white')", function() {
      var synth = Neume.Synth(function($) {
        return $("white");
      });

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
    it("$('pink')", function() {
      var synth = Neume.Synth(function($) {
        return $("pink");
      });

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
    it("$('brown')", function() {
      var synth = Neume.Synth(function($) {
        return $("brown");
      });

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
  });
  describe("works", function() {
    it("start/stop", function() {
      var synth = Neume.Synth(function($) {
        return $("white");
      });

      synth.start(0.100);
      synth.stop(0.200);

      Neume.audioContext.$processTo("00:00.300");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(outlet.$stateAtTime(0.000) === "SCHEDULED");
      assert(outlet.$stateAtTime(0.050) === "SCHEDULED");
      assert(outlet.$stateAtTime(0.100) === "PLAYING");
      assert(outlet.$stateAtTime(0.150) === "PLAYING");
      assert(outlet.$stateAtTime(0.200) === "FINISHED");
      assert(outlet.$stateAtTime(0.250) === "FINISHED");
    });
  });

});
