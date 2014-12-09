"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/shaper"));

describe("ugen/shaper", function() {
  var Neume = null;

  beforeEach(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("graph", function() {
    it("$('shaper')", function() {
      var synth = Neume.Synth(function($) {
        return $("shaper");
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "WaveShaperNode",
            oversample: "none",
            inputs: []
          }
        ]
      });
    });
    it("$('clip')", function() {
      var synth = Neume.Synth(function($) {
        return $("clip");
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "WaveShaperNode",
            oversample: "none",
            inputs: []
          }
        ]
      });
    });
  });

  describe("works", function() {
    it("curve(number)", function() {
      var synth1 = Neume.Synth(function($) {
        return $("shaper", { curve: 1 });
      });
      var synth2 = Neume.Synth(function($) {
        return $("shaper", { curve: 1 });
      });
      var synth3 = Neume.Synth(function($) {
        return $("shaper", { curve: 0.5 });
      });

      assert.deepEqual(synth1.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "WaveShaperNode",
            oversample: "none",
            inputs: []
          }
        ]
      });
      assert(synth1.toAudioNode().$inputs[0].curve === synth2.toAudioNode().$inputs[0].curve);
      assert(synth2.toAudioNode().$inputs[0].curve !== synth3.toAudioNode().$inputs[0].curve);
    });
  });

});
