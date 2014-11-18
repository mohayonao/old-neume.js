"use strict";

var neume = require("../../src");

var NeuContext   = neume.Context;
var NeuComponent = neume.Component;
var NeuDC        = neume.DC;
var NeuParam     = neume.Param;
var NeuSum       = neume.Sum;

describe("NeuSum", function() {
  var context = null;

  beforeEach(function() {
    context = new NeuContext(new global.AudioContext().destination);
  });

  describe("(context, inputs)", function() {
    it("returns an instanceof NeuSum", function() {
      var sum = new NeuSum(context, []);
      assert(sum instanceof NeuSum);
      assert(sum instanceof NeuComponent);
    });
  });

  describe("#add(value)", function() {
    it("works", function() {
      var add = new NeuSum(context, [ context.createGain() ])
        .add(10).add([ new NeuDC(context, -5), context.createOscillator() ]).toAudioNode();

      assert(add.toJSON(), {
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
              intpus: []
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
          },
          {
            name: "GainNode",
            gain: {
              value: 5,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
    });
    it("works with 0", function() {
      var add = new NeuSum(context, [ context.createGain() ])
        .add(10).add(-5).add([ context.createOscillator(), new NeuDC(context, -5) ]).toAudioNode();

      assert(add.toJSON(), {
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
              intpus: []
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

  describe("#mul(value)", function() {
    it("works", function() {
      var mul = new NeuSum(context, [
        context.createOscillator(), context.createDelay()
      ]).mul(context.createWaveShaper()).toAudioNode();

      assert.deepEqual(mul.toJSON(), {
        name: "GainNode",
        gain: {
          value: 0,
          inputs: [
            {
              name: "WaveShaperNode",
              oversample: "none",
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

  describe("#toAudioNode()", function() {
    it("return an AudioNode []", function() {
      var sum = new NeuSum(context, []);
      assert(sum.toAudioNode() instanceof global.AudioNode);
      assert(sum.toAudioNode() === sum.toAudioNode());

      assert.deepEqual(sum.toAudioNode().toJSON(),DC(0));
      assert(sum.toAudioNode().buffer.getChannelData(0)[0] === 0);
    });
    it("return an AudioNode [ node ]", function() {
      var sum = new NeuSum(context, [ context.createDelay() ]);
      assert(sum.toAudioNode() instanceof global.AudioNode);
      assert(sum.toAudioNode() === sum.toAudioNode());

      assert.deepEqual(sum.toAudioNode().toJSON(), {
        name: "DelayNode",
        delayTime: {
          value: 0,
          inputs: []
        },
        inputs: []
      });
    });
    it("return an AudioNode [ node, node ]", function() {
      var sum = new NeuSum(context, [ context.createOscillator(), context.createDelay() ]);
      assert(sum.toAudioNode() instanceof global.AudioNode);
      assert(sum.toAudioNode() === sum.toAudioNode());

      assert.deepEqual(sum.toAudioNode().toJSON(), {
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
    it("return an AudioNode [ number, number, dc ]", function() {
      var sum = new NeuSum(context, [ 1, 2, new NeuDC(context, 3) ]);
      assert(sum.toAudioNode() instanceof global.AudioNode);
      assert(sum.toAudioNode() === sum.toAudioNode());

      assert.deepEqual(sum.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 6,
          inputs: []
        },
        inputs: [ DC(1) ]
      });
      assert(sum.toAudioNode().$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("return an AudioNode [ number, node ]", function() {
      var sum = new NeuSum(context, [ 880, context.createOscillator() ]);
      assert(sum.toAudioNode() instanceof global.AudioNode);
      assert(sum.toAudioNode() === sum.toAudioNode());

      assert.deepEqual(sum.toAudioNode().toJSON(), {
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
              value: 880,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
    });
  });

  describe("#connect(to)", function() {
    it("connect to node", function() {
      var to = context.createGain();

      new NeuSum(context, [
        context.createOscillator(), new NeuParam(context, 440), 110, new NeuDC(context, 110)
      ]).connect(to);

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
            name: "GainNode",
            gain: {
              value: 440,
              inputs: []
            },
            inputs: [ DC(1) ]
          },
          {
            name: "GainNode",
            gain: {
              value: 220,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
    });
    it("[ node, param, number ] connect to param", function() {
      var to = context.createGain();

      new NeuSum(context, [
        context.createOscillator(), new NeuParam(context, 440), 110, new NeuDC(context, 110)
      ]).connect(to.gain);

      assert.deepEqual(to.toJSON(), {
        name: "GainNode",
        gain: {
          value: 440,
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
                value: 220,
                inputs: []
              },
              inputs: [ DC(1) ]
            }
          ]
        },
        inputs: []
      });
    });
    it("[ node, param, 0 ] connect to param", function() {
      var to = context.createGain();

      new NeuSum(context, [
        context.createOscillator(), new NeuParam(context, 440), 10, new NeuDC(context, -10)
      ]).connect(to.gain);

      assert.deepEqual(to.toJSON(), {
        name: "GainNode",
        gain: {
          value: 440,
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
        inputs: []
      });
    });
    it("[ node, param, param ] connect to param", function() {
      var to = context.createGain();

      new NeuSum(context, [
        context.createOscillator(), new NeuParam(context, 440), new NeuParam(context, 220)
      ]).connect(to.gain);

      assert.deepEqual(to.toJSON(), {
        name: "GainNode",
        gain: {
          value: 440,
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
                value: 220,
                inputs: []
              },
              inputs: [ DC(1) ]
            }
          ]
        },
        inputs: []
      });
    });
    it("[ node, node, number ] connect to param", function() {
      var to = context.createGain();

      new NeuSum(context, [
        context.createOscillator(), context.createDelay(), 110, new NeuDC(context, 110)
      ]).connect(to.gain);

      assert.deepEqual(to.toJSON(), {
        name: "GainNode",
        gain: {
          value: 220,
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
        },
        inputs: []
      });
    });
    it("[ node, node, 0 ] connect to param", function() {
      var to = context.createGain();

      new NeuSum(context, [
        context.createOscillator(), context.createDelay(), 10, new NeuDC(context, -10)
      ]).connect(to.gain);

      assert.deepEqual(to.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
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
        },
        inputs: []
      });
    });
  });

  describe("#disconnect()", function() {
    it("works", function() {
      var to = context.createGain();

      new NeuSum(context, [
        context.createOscillator(), context.createDelay(), 10, new NeuDC(context, -10)
      ]).connect(to).disconnect();

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
