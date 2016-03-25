"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/comp"));

describe("ugen/comp", function() {
  var neu = null;

  beforeEach(function() {
    neu = neume({
      scheduleInterval: 0.05,
      scheduleAheadTime: 0.05,
      scheduleOffsetTime: 0.00,
    });
  });

  describe("graph", function() {
    it("$('comp')", function() {
      var synth = neu.Synth(function($) {
        return $("comp");
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
              value: -24,
              inputs: []
            },
            knee: {
              value: 30,
              inputs: []
            },
            ratio: {
              value: 12,
              inputs: []
            },
            reduction: {
              value: 0,
              inputs: []
            },
            attack: {
              value: 0.003,
              inputs: []
            },
            release: {
              value: 0.250,
              inputs: []
            },
            inputs: []
          }
        ]
      });
    });
    it("$('comp', $('sin'))", function() {
      var synth = neu.Synth(function($) {
        return $("comp", $("sin"));
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
              value: -24,
              inputs: []
            },
            knee: {
              value: 30,
              inputs: []
            },
            ratio: {
              value: 12,
              inputs: []
            },
            reduction: {
              value: 0,
              inputs: []
            },
            attack: {
              value: 0.003,
              inputs: []
            },
            release: {
              value: 0.250,
              inputs: []
            },
            inputs: [ OSCILLATOR("sine", 440) ]
          }
        ]
      });
    });
  });

  describe("parameters", function() {
    it("full name", function() {
      var json = neu.Synth(function($) {
        return $("comp", { threshold: 1, knee: 2, ratio: 3, attack: 4, release: 5 });
      }).toAudioNode().toJSON().inputs[0];

      assert(json.threshold.value === 1);
      assert(json.knee.value === 2);
      assert(json.ratio.value === 3);
      assert(json.attack.value === 4);
      assert(json.release.value === 5);
    });
    it("short name", function() {
      var json = neu.Synth(function($) {
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
