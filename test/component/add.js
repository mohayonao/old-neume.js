"use strict";

var neume = require("../../src");

var NeuContext   = neume.Context;
var NeuComponent = neume.Component;
var NeuDC        = neume.DC;
var NeuParam     = neume.Param;
var NeuAdd       = neume.Add;

describe("NeuAdd", function() {
  var context = null;

  beforeEach(function() {
    context = new NeuContext(new global.AudioContext().destination);
  });

  describe("(context, a, b)", function() {
    it("returns a NeuAdd", function() {
      var add = new NeuAdd(
        context, context.createOscillator(), context.createGain()
      );
      assert(add instanceof NeuAdd);
      assert(add instanceof NeuComponent);
    });
    it("returns a NeuDC when number + number", function() {
      var add = new NeuAdd(context, 5, 2);
      assert(add instanceof NeuDC);
      assert(add.valueOf() === 7);
    });
    it("returns a NeuDC when NeuDC + NeuDC", function() {
      var add = new NeuAdd(context, new NeuDC(context, 5), new NeuDC(context, 2));
      assert(add instanceof NeuDC);
      assert(add.valueOf() === 7);
    });
    it("returns a node when node + 0", function() {
      var node = context.createGain();
      var mul  = new NeuAdd(context, node, 0);
      assert(mul instanceof NeuComponent);
      assert(mul.toAudioNode() === node);
    });
    it("returns a node when 0 + node", function() {
      var node = context.createGain();
      var mul  = new NeuAdd(context, 0, node);
      assert(mul instanceof NeuComponent);
      assert(mul.toAudioNode() === node);
    });
  });

  describe("#mul(value)", function() {
    it("works", function() {
      var mul = new NeuAdd(
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
            name: "GainNode",
            gain: {
              value: 1,
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
      var add = new NeuAdd(
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
            name: "GainNode",
            gain: {
              value: 1,
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
    it("works with number", function() {
      var add = new NeuAdd(
        context, context.createOscillator(), 5
      ).add(new NeuDC(context, 2)).toAudioNode();

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
            name: "GainNode",
            gain: {
              value: 7,
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
      var add = new NeuAdd(
        context, context.createOscillator(), context.createGain()
      );
      assert(add.toAudioNode() instanceof global.AudioNode);
      assert(add.toAudioNode() === add.toAudioNode());
    });
  });

  describe("#connect(to)", function() {
    it("connect to node", function() {
      var to = context.createGain();

      new NeuAdd(
        context, context.createOscillator(), context.createDelay()
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
    it("(param, number) connect to param", function() {
      var to = context.createGain();

      new NeuAdd(
        context, new NeuParam(context, 2), 5
      ).connect(to.gain);

      assert.deepEqual(to.toJSON(), {
        name: "GainNode",
        gain: {
          value: 2,
          inputs: [
            {
              name: "GainNode",
              gain: {
                value: 5,
                inputs: []
              },
              inputs: [ DC(1) ]
            }
          ]
        },
        inputs: []
      });
    });
    it("(param, param) connect to param", function() {
      var to = context.createGain();

      new NeuAdd(
        context, new NeuParam(context, 2), new NeuParam(context, 5)
      ).connect(to.gain);

      assert.deepEqual(to.toJSON(), {
        name: "GainNode",
        gain: {
          value: 2,
          inputs: [
            {
              name: "GainNode",
              gain: {
                value: 5,
                inputs: []
              },
              inputs: [ DC(1) ]
            }
          ]
        },
        inputs: []
      });
    });
    it("(param, node) connect to param", function() {
      var to = context.createGain();

      new NeuAdd(
        context, new NeuParam(context, 2), context.createDelay()
      ).connect(to.gain);

      assert.deepEqual(to.toJSON(), {
        name: "GainNode",
        gain: {
          value: 2,
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
        inputs: []
      });
    });
    it("(node, number) connect to param", function() {
      var to = context.createGain();

      new NeuAdd(
        context, context.createDelay(), 2
      ).connect(to.gain);

      assert.deepEqual(to.toJSON(), {
        name: "GainNode",
        gain: {
          value: 2,
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
        inputs: []
      });
    });
    it("(node, param) connect to param", function() {
      var to = context.createGain();

      new NeuAdd(
        context, context.createDelay(), new NeuParam(context, 2)
      ).connect(to.gain);

      assert.deepEqual(to.toJSON(), {
        name: "GainNode",
        gain: {
          value: 2,
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
        inputs: []
      });
    });
    it("(node, node) connect to param", function() {
      var to = context.createGain();

      new NeuAdd(
        context, context.createDelay(), context.createWaveShaper()
      ).connect(to.gain);

      assert.deepEqual(to.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: [
            {
              name: "DelayNode",
              delayTime: {
                value: 0,
                inputs: []
              },
              inputs: []
            },
            {
              name: "WaveShaperNode",
              oversample: "none",
              inputs: []
            }
          ]
        },
        inputs: []
      });
    });
  });

  describe("#disconnect()", function() {
    it("works", function() {
      var to = context.createGain();

      new NeuAdd(
        context, context.createOscillator(), context.createDelay()
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
