"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/comp"));

describe("ugen/comp", function() {
  var Neume = null;

  before(function() {
    Neume = neume(new global.AudioContext());
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
      var synth = new Neume.Synth(function($) {
        return $("comp", {
          thresh: -20, knee: 25, ratio: 10, a: 0.05, r: 0.1
        }, $("sin"));
      });

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

  describe("parameter check", function() {
    it("full name", function() {
      var json = new Neume.Synth(function($) {
        return $("comp", { threshold: 1, knee: 2, ratio: 3, attack: 4, release: 5 });
      }).toAudioNode().toJSON().inputs[0];

      assert(json.threshold.value === 1);
      assert(json.knee.value === 2);
      assert(json.ratio.value === 3);
      assert(json.attack.value === 4);
      assert(json.release.value === 5);
    });
    it("alias", function() {
      var json = new Neume.Synth(function($) {
        return $("comp", { thresh: 1, knee: 2, ratio: 3, a: 4, r: 5 });
      }).toAudioNode().toJSON().inputs[0];

      assert(json.threshold.value === 1);
      assert(json.knee.value === 2);
      assert(json.ratio.value === 3);
      assert(json.attack.value === 4);
      assert(json.release.value === 5);
    });
  });

});
