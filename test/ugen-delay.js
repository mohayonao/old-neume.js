"use strict";

var neuma = require("../src/neuma");

neuma.use(require("../src/ugen/osc"));
neuma.use(require("../src/ugen/delay"));

describe("ugen/delay", function() {
  describe("$(delay delayTime:0.5 $(sin))", function() {
    /*
     * +--------+
     * | $(sin) |
     * +--------+
     *   |
     * +------------------+
     * | DelayNode        |
     * | - delayTime: 0.5 |
     * +------------------+
     *   |
     */
    it("return a DelayNode that is connected with $(sin)", function() {
      var synth = neuma.Neuma(function($) {
        return $("delay", { delayTime: 0.5 }, $("sin"));
      })();

      assert.deepEqual(synth.outlet.toJSON(), {
        name: "DelayNode",
        delayTime: {
          value: 0.5,
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

      // assert(synth.outlet.$maxDelayTime === 0.5);
    });
  });

});
