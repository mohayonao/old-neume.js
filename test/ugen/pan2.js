"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/pan2"));

describe("ugen/pan2", function() {
  var neu = null;

  beforeEach(function() {
    neu = neume(new global.AudioContext());
  });

  describe("graph", function() {
    it("$('pan2', $('sin'))", function() {
      var synth = neu.Synth(function($) {
        return $("pan2", { pos: 0 }, $("sin"));
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "ChannelMergerNode",
            inputs: [
              {
                name: "GainNode",
                gain: {
                  value: Math.cos(0.5 * Math.PI * 0.5),
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
              },
              {
                name: "GainNode",
                gain: {
                  value: Math.sin(0.5 * Math.PI * 0.5),
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
          }
        ]
      });
    });
    it("$('pan2', { pos: $('sin', { freq: 1 }) }, $('sin'))", function() {
      var synth = neu.Synth(function($) {
        return $("pan2", { pos: $("sin", { freq: 1 }) }, $("sin"));
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "ChannelMergerNode",
            inputs: [
              {
                name: "GainNode",
                gain: {
                  value: 0,
                  inputs: [
                    {
                      name: "WaveShaperNode",
                      oversample: "none",
                      inputs: [
                        {
                          name: "OscillatorNode",
                          type: "sine",
                          frequency: {
                            value: 1,
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
              },
              {
                name: "GainNode",
                gain: {
                  value: 0,
                  inputs: [
                    {
                      name: "WaveShaperNode",
                      oversample: "none",
                      inputs: [
                        {
                          name: "OscillatorNode",
                          type: "sine",
                          frequency: {
                            value: 1,
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
          }
        ]
      });
    });
  });

});
