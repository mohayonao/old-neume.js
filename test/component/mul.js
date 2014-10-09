"use strict";

var neume = require("../../src");

var NeuContext   = neume.Context;
var NeuComponent = neume.Component;
var NeuDC        = neume.DC;
var NeuMul       = neume.Mul;

describe("NeuMul", function() {
  var context = null;

  beforeEach(function() {
    context = new NeuContext(new window.AudioContext().destination);
  });

  describe("(context, a, b)", function() {
    it("returns a NeuMul", function() {
      var mul = new NeuMul(
        context, context.createOscillator(), context.createGain()
      );
      assert(mul instanceof NeuMul);
      assert(mul instanceof NeuComponent);
    });
    it("returns a NeuDC when number * number", function() {
      var mul = new NeuMul(context, 5, 2);
      assert(mul instanceof NeuDC);
      assert(mul.valueOf() === 10);
    });
    it("returns a NeuDC when NeuDC * NeuDC", function() {
      var mul = new NeuMul(context, new NeuDC(context, 5), new NeuDC(context, 2));
      assert(mul instanceof NeuDC);
      assert(mul.valueOf() === 10);
    });
    it("returns a NeuDC when node * 0", function() {
      var node = context.createGain();
      var mul  = new NeuMul(context, node, 0);
      assert(mul instanceof NeuDC);
      assert(mul.valueOf() === 0);
    });
    it("returns a NeuDC when 0 * node", function() {
      var node = context.createGain();
      var mul  = new NeuMul(context, node, 0);
      assert(mul instanceof NeuDC);
      assert(mul.valueOf() === 0);
    });
    it("returns a node when node * 1", function() {
      var node = context.createGain();
      var mul  = new NeuMul(context, node, 1);
      assert(mul instanceof NeuComponent);
      assert(mul.toAudioNode() === node);
    });
    it("returns a node when 1 * node", function() {
      var node = context.createGain();
      var mul  = new NeuMul(context, 1, node);
      assert(mul instanceof NeuComponent);
      assert(mul.toAudioNode() === node);
    });
  });

  describe("#add(value)", function() {
    it("works", function() {
      var add = new NeuMul(
        context, context.createOscillator(), context.createGain()
      ).add(context.createDelay()).toAudioNode();

      assert.deepEqual(add.toJSON(), {
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
                  name: "GainNode",
                  gain: {
                    value: 1,
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

  describe("#mul(value)", function() {
    it("works", function() {
      var mul = new NeuMul(
        context, context.createOscillator(), context.createGain()
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
            name: "GainNode",
            gain: {
              value: 0,
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
    it("works with number", function() {
      var mul = new NeuMul(
        context, context.createOscillator(), 5
      ).mul(new NeuDC(context, 2)).toAudioNode();

      assert.deepEqual(mul.toJSON(), {
        name: "GainNode",
        gain: {
          value: 10,
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

  describe("#toAudioNode()", function() {
    it("return an AudioNode", function() {
      var mul = new NeuMul(
        context, context.createOscillator(), context.createGain()
      );
      assert(mul.toAudioNode() instanceof window.AudioNode);
      assert(mul.toAudioNode() === mul.toAudioNode());
    });
  });

  describe("#connect(to)", function() {
    it("connect to node", function() {
      var to = context.createDelay();

      new NeuMul(
        context, context.createOscillator(), context.createGain()
      ).connect(to);

      assert.deepEqual(to.toJSON(), {
        name: "DelayNode",
        delayTime: {
          value: 0,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 0,
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

  describe("#disconnect(to)", function() {
    it("works", function() {
      var to = context.createDelay();

      new NeuMul(
        context, context.createOscillator(), context.createGain()
      ).connect(to).disconnect();

      assert.deepEqual(to.toJSON(), {
        name: "DelayNode",
        delayTime: {
          value: 0,
          inputs: []
        },
        inputs: []
      });
    });
  });

});
