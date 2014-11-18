"use strict";

var neume = require("../../src");

var NeuContext   = neume.Context;
var NeuComponent = neume.Component;

describe("NeuComponent", function() {
  var context = null;

  beforeEach(function() {
    context = new NeuContext(new global.AudioContext().destination);
  });

  describe("(context, node)", function() {
    it("returns a NeuComponent", function() {
      var component = new NeuComponent(
        context, context.createOscillator()
      );
      assert(component instanceof NeuComponent);
    });
  });

  describe("#mul(value)", function() {
    it("works", function() {
      var mul = new NeuComponent(
        context, context.createOscillator()
      ).mul(context.createDelay()).toAudioNode();

      assert.deepEqual(mul.toJSON(), {
        name: "GainNode",
        gain: {
          value: 0,
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

  describe("#add(value)", function() {
    it("works", function() {
      var add = new NeuComponent(
        context, context.createOscillator()
      ).add(context.createDelay()).toAudioNode();

      assert.deepEqual(add.toJSON(), {
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
  });

  describe("#madd(mul, add)", function() {
    it("works", function() {
      var madd = new NeuComponent(
        context, context.createOscillator()
      ).madd(context.createDelay(), 100).toAudioNode();

      assert.deepEqual(madd.toJSON(), {
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
                  name: "DelayNode",
                  delayTime: {
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
              value: 100,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
    });
  });

  describe("#toAudioNode()", function() {
    it("return an AudioNode", function() {
      var component = new NeuComponent(
        context, context.createOscillator()
      );
      assert(component.toAudioNode() instanceof global.AudioNode);
      assert(component.toAudioNode() === component.toAudioNode());
    });
  });

  describe("#connect(to)", function() {
    it("connect to node", function() {
      var to = context.createGain();

      new NeuComponent(
        context, context.createOscillator()
      ).connect(to);

      assert.deepEqual(to.toJSON(), {
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

  describe("#disconnect(to)", function() {
    it("disconnect from node", function() {
      var to = context.createGain();

      new NeuComponent(
        context, context.createOscillator()
      ).connect(to).disconnect();

      assert.deepEqual(to.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: []
      });
    });
  });

});
