"use strict";

var neuma = require("../src/neuma");

neuma.use(require("../src/ugen/osc"));

describe("ugen/osc", function() {
  var synth = null;

  describe("$(sin)", function() {
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
      synth = neuma.Neuma(function($) {
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
      var audioContext = neuma._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100);
      synth.stop(0.200);

      assert(outlet.$state === "init", "00:00.000");

      audioContext.$process(0.050);
      assert(outlet.$state === "init", "00:00.050");

      audioContext.$process(0.050);
      assert(outlet.$state === "start", "00:00.100");

      audioContext.$process(0.050);
      assert(outlet.$state === "start", "00:00.150");

      audioContext.$process(0.050);
      assert(outlet.$state === "stop", "00:00.200");

      audioContext.$process(0.050);
      assert(outlet.$state === "stop", "00:00.250");
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
    beforeEach(function() {
      synth = neuma.Neuma(function($) {
        return $("sin", $("saw"));
      })();
    });
    it("returns a GainNode that is connected with a OscillatorNode", function() {
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

});
