"use strict";

var neume = require("../../src");

var NeuDryWet = neume.DryWet;

describe("NeuDryWet", function() {
  var context;

  beforeEach(function() {
    context = new neume.Context(new window.AudioContext().destination);
  });

  describe("(context, inputs, wetNode, 1)", function() {
    it("returns wetNode", function() {
      var inputs  =  [ context.createOscillator(), context.createOscillator() ];
      var wetNode = context.createConvolver();

      var mixNode = new NeuDryWet(context, inputs, wetNode, 1);

      assert.deepEqual(mixNode.toJSON(), {
        name: "ConvolverNode",
        normalize: true,
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
          },
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

  describe("(context, inputs, wetNode, 0)", function() {
    it("returns inputs[0]", function() {
      var inputs  = [ context.createOscillator() ];
      var wetNode = context.createConvolver();

      var mixNode = new NeuDryWet(context, inputs, wetNode, 0);

      assert.deepEqual(mixNode.toJSON(), {
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
      });
    });
    it("returns sum inputs", function() {
      var inputs  = [ context.createOscillator(), context.createOscillator() ];
      var wetNode = context.createConvolver();

      var mixNode = new NeuDryWet(context, inputs, wetNode, 0);

      assert.deepEqual(mixNode.toJSON(), {
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
          },
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

  describe("(context, inputs, wetNode, 0.25)", function() {
    it("returns mixNode", function() {
      var inputs  = [ context.createOscillator() ];
      var wetNode = context.createConvolver();

      var mixNode = new NeuDryWet(context, inputs, wetNode, 0.25);

      assert.deepEqual(mixNode.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 0.25,
              inputs: []
            },
            inputs: [
              {
                name: "ConvolverNode",
                normalize: true,
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
          },
          {
            name: "GainNode",
            gain: {
              value: 0.75,
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

  describe("(context, inputs, wetNode, node)", function() {
    it("2return mixNode", function() {
      var node = context.createGain();
      var inputs  = [ context.createOscillator() ];
      var wetNode = context.createConvolver();

      node.$id = "mix";

      var mixNode = new NeuDryWet(context, inputs, wetNode, node);

      assert.deepEqual(mixNode.toJSON(), {
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
                  name: "WaveShaperNode",
                  oversample: "none",
                  inputs: [
                    {
                      name: "GainNode#mix",
                      gain: {
                        value: 1,
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
                name: "ConvolverNode",
                normalize: true,
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
                      name: "GainNode#mix",
                      gain: {
                        value: 1,
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
      });
    });
  });

});
