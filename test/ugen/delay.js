"use strict";

var neume = require("../../src/neume");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/line"));
neume.use(require("../../src/ugen/delay"));

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
      var synth = neume.Neume(function($) {
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
  describe("$(delay delayTime:$(line) $(sin))", function() {
    var synth = neume.Neume(function($) {
      return $("delay", { delayTime: $("line") }, $("sin"));
    })();

    assert.deepEqual(synth.outlet.toJSON(), {
      name: "DelayNode",
      delayTime: {
        value: 0,
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 1,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
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
