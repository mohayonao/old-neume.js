"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/audio-node"));

describe("ugen/audio-node", function() {
  var neu = null;

  beforeEach(function() {
    neu = neume(new global.AudioContext());
  });

  describe("graph", function() {
    it("$(DelayNode)", function() {
      var synth = neu.Synth(function($) {
        return $(neu.context.createDelay());
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
      var synth = neu.Synth(function($) {
        return $(neu.context.createBiquadFilter(), { type: "highpass", frequency: 1000 });
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
      var synth = neu.Synth(function($) {
        return $(neu.context.createDelay(), $("sin"));
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
            inputs: [ OSCILLATOR("sine", 440) ]
          }
        ]
      });
    });
    it("$(OscillatorNode, $('sin'))", function() {
      var synth = neu.Synth(function($) {
        return $(neu.context.createOscillator(), $("sin", { freq: 220 }));
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
              value: 0,
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
            },
            inputs: [
              {
                name: "OscillatorNode",
                type: "sine",
                frequency: {
                  value: 220,
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
