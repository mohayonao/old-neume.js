"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/conv"));

describe("ugen/conv", function() {
  var neu = null;

  beforeEach(function() {
    neu = neume(new global.AudioContext());
  });

  describe("graph", function() {
    it("$('conv')", function() {
      var synth = neu.Synth(function($) {
        return $("conv");
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "ConvolverNode",
            normalize: true,
            inputs: []
          }
        ]
      });
    });
  });

  describe("parameters", function() {
    it("full name", function() {
      var buffer = neu.context.createBuffer(1, 16, 44100);
      var synth = neu.Synth(function($) {
        return $("conv", { buffer: buffer, normalize: false });
      });

      var json = synth.toAudioNode().toJSON().inputs[0];

      assert(synth.toAudioNode().$inputs[0].buffer === buffer);
      assert(json.normalize === false);
    });
    it("short name", function() {
      var buffer = neu.context.createBuffer(1, 16, 44100);
      var synth = neu.Synth(function($) {
        return $("conv", { buf: buffer, normalize: false });
      });

      var json = synth.toAudioNode().toJSON().inputs[0];

      assert(synth.toAudioNode().$inputs[0].buffer === buffer);
      assert(json.normalize === false);
    });
  });

});
