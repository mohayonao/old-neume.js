"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/audio-node"));

describe("ugen/audio-node", function() {
  var Neume = null;

  beforeEach(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("graph", function() {
    it("$(DelayNode)", function() {
      var synth = Neume.Synth(function($) {
        return $(Neume.context.createDelay());
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "DelayNode",
            delayTime: {
              value: 0,
              inputs: []
            },
            inputs: []
          }
        ]
      });
    });
    it("$(BiquadFilterNode, { type: 'highpass', frequency: 1000, foo: 10 })", function() {
      var synth = Neume.Synth(function($) {
        return $(Neume.context.createBiquadFilter(), { type: "highpass", frequency: 1000 });
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "BiquadFilterNode",
            type: "highpass",
            frequency: {
              value: 1000,
              inputs: []
            },
            detune: {
              value: 0,
              inputs: []
            },
            Q: {
              value: 1,
              inputs: []
            },
            gain: {
              value: 0,
              inputs: []
            },
            inputs: []
          }
        ]
      });
    });
    it("$(DelayNode, $('sin'))", function() {
      var synth = Neume.Synth(function($) {
        return $(Neume.context.createDelay(), $("sin"));
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "DelayNode",
            delayTime: {
              value: 0,
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
    it("$(OscillatorNode, $('sin'))", function() {
      var synth = Neume.Synth(function($) {
        return $(Neume.context.createOscillator(), $("sin"));
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
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
      });
    });
  });

});
