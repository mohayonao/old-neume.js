"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));

describe("ugen/osc", function() {
  var Neume = null;

  before(function() {
    Neume = neume.exports(new window.AudioContext());
  });

  describe("$(sin)", function() {
    var synth = null;
    /*
     * +------------------+
     * | OscillatorNode   |
     * | - type: sine     |
     * | - frequency: 440 |
     * | - detune: 0      |
     * +------------------+
     *   |
     */
    beforeEach(function() {
      synth = new Neume(function($) {
        return $("sin");
      })();
    });
    it("returns a OscillatorNode", function() {
      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "OscillatorNode",
        type: "sine",
        frequency: {
          value: 440,
          inputs: []
        },
        detune: {
          value: 0,
          inputs: []
        },
        inputs: []
      });
    });
    it("works", function() {
      var audioContext = Neume.context;
      var outlet = synth.toAudioNode();

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

  describe("$(sin $(saw))", function() {
    /*
     * +--------+
     * | $(saw) |
     * +--------+     +------------------+
     *   |            | OscillatorNode   |
     * +-----------+  | - type: sawtooth |
     * | GainNode  |  | - frequency: 2   |
     * | - gain: 0 |--| - detune: 0      |
     * +-----------+  +------------------+
     *  |
     */
    it("returns a GainNode that is connected with a OscillatorNode", function() {
      var synth = new Neume(function($) {
        return $("sin", $("saw"));
      })();
      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 0,
          inputs: [
            {
              name: "OscillatorNode",
              type: "sine",
              frequency: {
                value: 2,
                inputs: []
              },
              detune: {
                value: 0,
                inputs: []
              },
              inputs: []
            }
          ]
        },
        inputs: [
          {
            name: "OscillatorNode",
            type: "sawtooth",
            frequency: {
              value: 440,
              inputs: []
            },
            detune: {
              value: 0,
              inputs: []
            },
            inputs: []
          }
        ]
      });
    });
  });

  describe("type", function() {
    it("(default) -> sine", function() {
      var synth = new Neume(function($) {
        return $("osc");
      })();
      assert(synth.toAudioNode().type === "sine");
    });
    it("sin -> sine", function() {
      var synth = new Neume(function($) {
        return $("osc", { type: "sin" });
      })();
      assert(synth.toAudioNode().type === "sine");
    });
    it("square -> square", function() {
      var synth = new Neume(function($) {
        return $("osc", { type: "square" });
      })();
      assert(synth.toAudioNode().type === "square");
    });
    it("saw -> sawtooth", function() {
      var synth = new Neume(function($) {
        return $("osc", { type: "saw" });
      })();
      assert(synth.toAudioNode().type === "sawtooth");
    });
    it("tri -> triangle", function() {
      var synth = new Neume(function($) {
        return $("osc", { type: "tri" });
      })();
      assert(synth.toAudioNode().type === "triangle");
    });
    it("pulse -> custom", function() {
      var synth = new Neume(function($) {
        return $("osc", { type: "pulse", width: 0.25 });
      })();
      assert(synth.toAudioNode().type === "custom");
    });
    it("PeriodicWave -> custom", function() {
      var wave = Neume.context.createPeriodicWave(
        new Float32Array(128), new Float32Array(128)
      );
      var synth = new Neume(function($) {
        return $("osc", { type: wave });
      })();
      assert(synth.toAudioNode().type === "custom");
    });
  });

  describe("aliases", function() {
    it("sin -> sine", function() {
      var synth = new Neume(function($) {
        return $("sin");
      })();
      assert(synth.toAudioNode().type === "sine");
    });
    it("square -> square", function() {
      var synth = new Neume(function($) {
        return $("square");
      })();
      assert(synth.toAudioNode().type === "square");
    });
    it("saw -> sawtooth", function() {
      var synth = new Neume(function($) {
        return $("saw");
      })();
      assert(synth.toAudioNode().type === "sawtooth");
    });
    it("tri -> triangle", function() {
      var synth = new Neume(function($) {
        return $("tri");
      })();
      assert(synth.toAudioNode().type === "triangle");
    });
    it("pulse -> custom", function() {
      var synth = new Neume(function($) {
        return $("pulse", { width: 0.25 });
      })();
      assert(synth.toAudioNode().type === "custom");
    });
    it("PeriodicWave -> custom", function() {
      var wave = Neume.context.createPeriodicWave(
        new Float32Array(128), new Float32Array(128)
      );
      var synth = new Neume(function($) {
        return $(wave);
      })();
      assert(synth.toAudioNode().type === "custom");
    });
    it("invalid periodicwave -> sine", function() {
      var synth = new Neume(function($) {
        return $("periodicwave");
      })();
      assert(synth.toAudioNode().type === "sine");
    });
  });

});
