"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/add"));

describe("ugen/add", function() {
  var Neume = null;

  beforeEach(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("graph", function() {
    it("$('+', 0)", function() {
      var synth = Neume.Synth(function($) {
        return $("+", 0);
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: [],
        },
        inputs: [ DC(0) ]
      });
    });
    it("$('+', 1, 2, 3)", function() {
      var synth = Neume.Synth(function($) {
        return $("+", 1, 2, 3);
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 6,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });

      assert(synth.toAudioNode().$inputs[0].$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("$('+', $('sin', {freq:1}), $('sin', {freq:2}), $('sin', {freq:3}))", function() {
      var synth = Neume.Synth(function($) {
        return $("+", $("sin", { freq: 1 }), $("sin", { freq: 2 }), $("sin", { freq: 3 }));
      });

      function oscillator(freq) {
        var node = Neume.context.createOscillator();
        node.frequency.value = freq;
        return node.toJSON();
      }

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ oscillator(1), oscillator(2), oscillator(3) ]
      });
    });
  });

});
