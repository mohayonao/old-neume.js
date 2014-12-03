"use strict";

var neume = require("../../src");

var NeuComponent = neume.Component;
var NeuDryWet = neume.DryWet;

describe("NeuDryWet", function() {
  var context;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination);
  });

  describe("(context, dryIn, wetIn, mixIn)", function() {
    it("returns an instance of NeuDryWet", function() {
      var instance = new NeuDryWet(context, 0, 0, 0);

      assert(instance instanceof NeuDryWet);
      assert(instance instanceof NeuComponent);
    });
  });

  describe("#toAudioNode()", function() {
    it("works", function() {
      var mixNode = new NeuDryWet(context, context.createGain(), context.createGain(), context.createGain());

      assert(mixNode.toAudioNode() instanceof global.AudioNode);
      assert(mixNode.toAudioNode() === mixNode.toAudioNode());
    });
    it("graph (dryIn, wetIn, 0)", function() {
      var mixNode = new NeuDryWet(context, context.createGain(), context.createOscillator(), 0);

      assert.deepEqual(mixNode.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: []
      });
    });
    it("graph (dryIn, wetIn, 0.2)", function() {
      var mixNode = new NeuDryWet(context, context.createGain(), context.createOscillator(), 0.2);

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
              value: 0.2,
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
              value: 0.8,
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
          }
        ]
      });
    });
    it("graph (dryIn, wetIn, 1)", function() {
      var mixNode = new NeuDryWet(context, context.createGain(), context.createOscillator(), 1);

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
    it("graph (dryIn, wetIn, mixIn)", function() {
      var mixNode = new NeuDryWet(context, context.createGain(), context.createOscillator(), context.createDelay());

      assert(mixNode.toAudioNode().toJSON(), {
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
                      name: "DelayNode",
                      delayTime: {
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
                      name: "DelayNode",
                      delayTime: {
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
              name: "GainNode",
              gain: {
                value: 1,
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
