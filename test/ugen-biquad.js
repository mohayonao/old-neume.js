"use strict";

var neuma = require("../src/neuma");

neuma.use(require("../src/ugen/osc"));
neuma.use(require("../src/ugen/biquad"));

describe("ugen/biquad", function() {
  var synth = null;

  describe("$(lpf, $(sin))", function() {
    /*
     * +------------------+
     * | OscillatorNode   |
     * | - type: sine     |
     * | - frequency: 440 |
     * | - detune: 0      |
     * +------------------+
     *   |
     * +------------------+
     * | BiquadFilterNode |
     * | - type: lowpass  |
     * | - frequency: 350 |
     * | - detune: 0      |
     * | - Q: 1           |
     * | - gain: 0        |
     * +------------------+
     *   |
     */
    beforeEach(function() {
      synth = neuma.Neuma(function($) {
        return $("lpf", $("sin"));
      })();
    });
    it("returns a BiquadFilterNode", function() {
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "BiquadFilterNode",
        type: "lowpass",
        frequency: {
          value: 350,
          inputs: []
        },
        detune: {
          value: 0,
          inputs: []
        },
        Q: {
          value: 1,
          inputs: []
        },
        gain: {
          value: 0,
          inputs: []
        },
        inputs: [
          {
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
          }
        ]
      });
    });
  });

});
