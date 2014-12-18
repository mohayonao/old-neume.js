"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/inout"));
neume.use(require("../../src/ugen/osc"));

describe("ugen/inout", function() {
  var Neume = null;

  beforeEach(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("$(in)", function() {
    it("graph", function() {
      var synth = Neume.Synth(function($) {
        return $("in", 1);
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
              value: 1,
              inputs: []
            },
            inputs: []
          }
        ]
      });
      assert(synth.toAudioNode().$inputs[0] === synth.context.getAudioBus(1).toAudioNode());
    });
  });

  describe("$(out)", function() {
    it("graph", function() {
      var synth = Neume.Synth(function($) {
        return $("out", { bus: 1 }, $("osc"));
      });

      synth.start(0);

      Neume.context.audioContext.$processTo("00:00.010");

      assert.deepEqual(synth.context.getAudioBus(1).toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 1,
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
