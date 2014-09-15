"use strict";

var neume = require("../src/neume");

neume.use(require("../src/ugen/osc"));

describe("ugen/osc", function() {
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
      synth = neume.Neume(function($) {
        return $("sin");
      })();
    });
    it("returns a OscillatorNode", function() {
      assert.deepEqual(synth.outlet.toJSON(), {
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
      var audioContext = neume.Neume.context;
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
      var synth = neume.Neume(function($) {
        return $("sin", $("saw"));
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
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
      var synth = neume.Neume(function($) {
        return $("osc");
      })();
      assert(synth.outlet.type === "sine");
    });
    it("sin -> sine", function() {
      var synth = neume.Neume(function($) {
        return $("osc", { type: "sin" });
      })();
      assert(synth.outlet.type === "sine");
    });
    it("square -> square", function() {
      var synth = neume.Neume(function($) {
        return $("osc", { type: "square" });
      })();
      assert(synth.outlet.type === "square");
    });
    it("saw -> sawtooth", function() {
      var synth = neume.Neume(function($) {
        return $("osc", { type: "saw" });
      })();
      assert(synth.outlet.type === "sawtooth");
    });
    it("tri -> triangle", function() {
      var synth = neume.Neume(function($) {
        return $("osc", { type: "tri" });
      })();
      assert(synth.outlet.type === "triangle");
    });
    it("PeriodicWave -> custom", function() {
      var wave = neume.Neume.context.createPeriodicWave(
        new Float32Array(128), new Float32Array(128)
      );
      var synth = neume.Neume(function($) {
        return $("osc", { type: wave });
      })();
      assert(synth.outlet.type === "custom");
    });
  });

  describe("aliases", function() {
    it("sin -> sine", function() {
      var synth = neume.Neume(function($) {
        return $("sin");
      })();
      assert(synth.outlet.type === "sine");
    });
    it("square -> square", function() {
      var synth = neume.Neume(function($) {
        return $("square");
      })();
      assert(synth.outlet.type === "square");
    });
    it("saw -> sawtooth", function() {
      var synth = neume.Neume(function($) {
        return $("saw");
      })();
      assert(synth.outlet.type === "sawtooth");
    });
    it("tri -> triangle", function() {
      var synth = neume.Neume(function($) {
        return $("tri");
      })();
      assert(synth.outlet.type === "triangle");
    });
    it("PeriodicWave -> custom", function() {
      var wave = neume.Neume.context.createPeriodicWave(
        new Float32Array(128), new Float32Array(128)
      );
      var synth = neume.Neume(function($) {
        return $(wave);
      })();
      assert(synth.outlet.type === "custom");
    });
    it("invalid periodicwave -> sine", function() {
      var synth = neume.Neume(function($) {
        return $("periodicwave");
      })();
      assert(synth.outlet.type === "sine");
    });
  });

});
