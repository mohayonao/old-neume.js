"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/comp"));

describe("ugen/comp", function() {
  var Neume = null;

  before(function() {
    Neume = neume.exports(new window.AudioContext());
  });

  describe("$(comp thresh:-20 knee:25 ratio:10 a:0.05 r:0.1 $(sin))", function() {
    /*
     * +--------+
     * | $(sin) |
     * +--------+
     *   |
     * +------------------------+
     * | DynamicsCompressorNode |
     * | - threshold:-20        |
     * | - knee: 25             |
     * | - ratio: 10            |
     * | - attack: 0.05         |
     * | - release: 0.1         |
     * +------------------------+
     *   |
     */
    it("return a DynamicsCompressorNode that is connected with $(sin)", function() {
      var synth = new Neume(function($) {
        return $("comp", {
          thresh: -20, knee: 25, ratio: 10, a: 0.05, r: 0.1
        }, $("sin"));
      })();

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "DynamicsCompressorNode",
            threshold: {
              value: -20,
              inputs: []
            },
            knee: {
              value: 25,
              inputs: []
            },
            ratio: {
              value: 10,
              inputs: []
            },
            reduction: {
              value: 0,
              inputs: []
            },
            attack: {
              value: 0.05,
              inputs: []
            },
            release: {
              value: 0.1,
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
          }
        ]
      });
    });
  });

});
