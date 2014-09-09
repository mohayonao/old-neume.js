"use strict";

var neuma = require("../src/neuma");

neuma.use(require("../src/ugen/osc"));
neuma.use(require("../src/ugen/clip"));

describe("ugen/clip", function() {
  describe("$(clip $(sin))", function() {
    /*
     * +--------+
     * | $(sin) |
     * +--------+
     *   |
     * +---------------------+
     * | WaveShaperNode      |
     * | - curve: [ -1, +1 ] |
     * | - oversample: none  |
     * +---------------------+
     *   |
     */
    it("return a WaveShaperNode that is connected with $(sin)", function() {
      var synth = neuma.Neuma(function($) {
        return $("clip", $("sin"));
      })();

      assert.deepEqual(synth.outlet.toJSON(), {
        name: "WaveShaperNode",
        oversample: "none",
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

      assert.deepEqual(synth.outlet.curve, new Float32Array([ -1, +1 ]));
    });
  });

});
