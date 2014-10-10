"use strict";

var neume = require("../../src");

var NeuComponent = neume.Component;
var NeuDryWet    = neume.DryWet;

describe("NeuDryWet", function() {
  var context;

  beforeEach(function() {
    context = new neume.Context(new window.AudioContext().destination);
  });

  describe("(context, dryNode, wetNode, 1)", function() {
    it("returns wetNode", function() {
      var dryNode = context.createSum([
        context.createOscillator(), context.createOscillator()
      ]);
      var wetNode = context.createConvolver();

      context.connect(dryNode, wetNode);

      var mixNode = new NeuDryWet(context, dryNode, wetNode, 1);

      assert.deepEqual(mixNode.toAudioNode().toJSON(), {
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

  describe("(context, dryNode, wetNode, 0)", function() {
    it("returns inputs[0]", function() {
      var dryNode = context.createSum([
        context.createOscillator()
      ]);
      var wetNode = context.createConvolver();

      context.connect(dryNode, wetNode);

      var mixNode = new NeuDryWet(context, dryNode, wetNode, 0);

      assert.deepEqual(mixNode.toAudioNode().toJSON(), {
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
      var dryNode = context.createSum([
        context.createOscillator(), context.createOscillator()
      ]);
      var wetNode = context.createConvolver();

      context.connect(dryNode, wetNode);

      var mixNode = new NeuDryWet(context, dryNode, wetNode, 0);

      assert.deepEqual(mixNode.toAudioNode().toJSON(), {
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

  describe("(context, dryNode, wetNode, 0.25)", function() {
    it("returns mixNode", function() {
      var dryNode = context.createSum([
        context.createOscillator()
      ]);
      var wetNode = context.createConvolver();

      context.connect(dryNode, wetNode);

      var mixNode = new NeuDryWet(context, dryNode, wetNode, 0.25);

      assert.deepEqual(mixNode.toAudioNode().toJSON(), {
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

  describe("(context, dryNode, wetNode, node)", function() {
    it("2return mixNode", function() {
      var node = context.createGain();
      var dryNode = context.createSum([
        context.createOscillator()
      ]);
      var wetNode = context.createConvolver();

      context.connect(dryNode, wetNode);

      node.$id = "mix";

      var mixNode = new NeuDryWet(context, dryNode, wetNode, node);

      assert.deepEqual(mixNode.toAudioNode().toJSON(), {
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
