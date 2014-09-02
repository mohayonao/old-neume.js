"use strict";

var neuma = require("../src/neuma");

neuma.use(require("../src/ugen/number"));

describe("ugen/number", function() {

  describe("$(440)", function() {
    /*
     * +---------+
     * | DC(1) |
     * +---------+
     *   |
     * +-------------+
     * | GainNode    |
     * | - gain: 440 |
     * +-------------+
     *   |
     */
    it("returns a GainNode that is connected with a DC(0)", function() {
      var synth = neuma.Neuma(function($) {
        return $(440);
      })();

      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 440,
          inputs: []
        },
        inputs: [ DC(1) ]
      });
    });
  });

});
