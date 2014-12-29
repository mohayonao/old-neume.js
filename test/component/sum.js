"use strict";

var neume = require("../../src");

describe("neume.Sum", function() {
  var context = null;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination);
  });

  describe("constructor", function() {
    it("(context: neume.Context, inputs: Array<any>)", function() {
      var a = context.createOscillator();
      var b = context.createOscillator();
      var sum = new neume.Sum(context, [ a, b ]);

      assert(sum instanceof neume.Sum);
      assert(sum instanceof neume.Component);
    });
    it("(context: neume.Context, inputs: [ node ]): neume.Component", function() {
      var a = context.createOscillator();
      var sum = new neume.Sum(context, [ a ]);

      assert(sum instanceof neume.Component);
    });
    it("(context: neume.Context, inputs: Array<number>): neume.DC", function() {
      var a = 1;
      var b = new neume.DC(context, 2);
      var sum = new neume.Sum(context, [ a, b ]);

      assert(sum instanceof neume.DC);
    });
    it("(context: neume.Context, inputs: [ neume.Param ]): neume.Param", function() {
      var a = new neume.Param(context, 0);
      var sum = new neume.Sum(context, [ a ]);

      assert(sum instanceof neume.Param);
    });
  });

  describe("#add", function() {
    it("(value: any): neume.Sum", function() {
      var a = context.createGain();
      var b = context.createGain();
      var c = context.createGain();
      var sum = new neume.Sum(context, [ a, b ]);

      var result = sum.add(c);

      assert(result instanceof neume.Sum);
      assert(result !== sum);
      assert.deepEqual(result._inputs, [ a, b, c ]);
    });
  });

  describe("#toAudioNode", function() {
    it("(): AudioNode // when []", function() {
      var sum = new neume.Sum(context, []);

      assert(sum.toAudioNode() instanceof global.AudioNode);
      assert(sum.toAudioNode() === sum.toAudioNode());
      assert.deepEqual(sum.toAudioNode().toJSON(), BUFSRC(128));
      assert(sum.toAudioNode().buffer.getChannelData(0)[0] === 0);
    });
    it("(): AudioNode // when [ 1 ]", function() {
      var sum = new neume.Sum(context, [ 1 ]);

      assert(sum.toAudioNode() instanceof global.AudioNode);
      assert(sum.toAudioNode() === sum.toAudioNode());
      assert.deepEqual(sum.toAudioNode().toJSON(), BUFSRC(128));
      assert(sum.toAudioNode().buffer.getChannelData(0)[0] === 1);
    });
    it("(): AudioNode // when [ node ]", function() {
      var a = context.createDelay();
      var sum = new neume.Sum(context, [ a ]);

      assert(sum.toAudioNode() instanceof global.AudioNode);
      assert(sum.toAudioNode() === sum.toAudioNode());
      assert.deepEqual(sum.toAudioNode().toJSON(), a.toJSON());
    });
    it("(): AudioNode // when [ node, 0 ]", function() {
      var a = context.createDelay();
      var sum = new neume.Sum(context, [ a, 0 ]);

      assert(sum.toAudioNode() instanceof global.AudioNode);
      assert(sum.toAudioNode() === sum.toAudioNode());
      assert.deepEqual(sum.toAudioNode().toJSON(), a.toJSON());
    });
    it("(): AudioNode // when [ node, param ]", function() {
      var a = context.createDelay();
      var b = new neume.Param(context, 220);
      var sum = new neume.Sum(context, [ a, b ]);

      assert(sum.toAudioNode() instanceof global.AudioNode);
      assert(sum.toAudioNode() === sum.toAudioNode());
      assert.deepEqual(sum.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          a.toJSON(),
          {
            name: "GainNode",
            gain: {
              value: b.value,
              inputs: []
            },
            inputs: [ BUFSRC(128) ]
          }
        ]
      });
      assert(sum.toAudioNode().$inputs[1].$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("(): AudioNode // when [ node, node ]", function() {
      var a = context.createOscillator();
      var b = context.createDelay();
      var sum = new neume.Sum(context, [ a, b ]);

      assert(sum.toAudioNode() instanceof global.AudioNode);
      assert(sum.toAudioNode() === sum.toAudioNode());
      assert.deepEqual(sum.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ a.toJSON(), b.toJSON() ]
      });
    });
    it("(): AudioNode // when [ number, number, dc ]", function() {
      var a = 1;
      var b = 2;
      var c = new neume.DC(context, 3);
      var sum = new neume.Sum(context, [ a, b, c ]);

      assert(sum.toAudioNode() instanceof global.AudioNode);
      assert(sum.toAudioNode() === sum.toAudioNode());
      assert.deepEqual(sum.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: a.valueOf() + b.valueOf() + c.valueOf(),
          inputs: []
        },
        inputs: [ BUFSRC(128) ]
      });
      assert(sum.toAudioNode().$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("(): AudioNode // when [ number, node ]", function() {
      var a = 880;
      var b = context.createOscillator();
      var sum = new neume.Sum(context, [ a, b ]);

      assert(sum.toAudioNode() instanceof global.AudioNode);
      assert(sum.toAudioNode() === sum.toAudioNode());
      assert.deepEqual(sum.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          b.toJSON(),
          {
            name: "GainNode",
            gain: {
              value: a.valueOf(),
              inputs: []
            },
            inputs: [ BUFSRC(128) ]
          }
        ]
      });
      assert(sum.toAudioNode().$inputs[1].$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
  });

  describe("#connect", function() {
    it("(to: AudioNode): self // when []", function() {
      var toNode = context.createGain();
      var sum = new neume.Sum(context, []);

      assert(sum.connect(toNode), sum);
      assert.deepEqual(toNode.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ BUFSRC(128) ]
      });
      assert(toNode.$inputs[0].buffer.getChannelData(0)[0] === 0);
    });
    it("(to: AudioNode): self // when [ 0 ]", function() {
      var toNode = context.createGain();
      var a = 0;
      var sum = new neume.Sum(context, [ a ]);

      assert(sum.connect(toNode), sum);
      assert.deepEqual(toNode.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ BUFSRC(128) ]
      });
      assert(toNode.$inputs[0].buffer.getChannelData(0)[0] === 0);
    });

    it("(to: AudioNode): self // when [ node, param, number, dc ]", function() {
      var toNode = context.createGain();
      var a = context.createOscillator();
      var b = new neume.Param(context, 330);
      var c = 220;
      var d = new neume.DC(context, 110);
      var sum = new neume.Sum(context, [ a, b, c, d ]);

      assert(sum.connect(toNode) === sum);
      assert.deepEqual(toNode.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          a.toJSON(),
          {
            name: "GainNode",
            gain: {
              value: b.value,
              inputs: []
            },
            inputs: [ BUFSRC(128) ]
          },
          {
            name: "GainNode",
            gain: {
              value: c.valueOf() + d.valueOf(),
              inputs: []
            },
            inputs: [ BUFSRC(128) ]
          }
        ]
      });
      assert(sum.toAudioNode().$inputs[1].$inputs[0].buffer.getChannelData(0)[0] === 1);
      assert(sum.toAudioNode().$inputs[2].$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("(to: AudioParam): self // when []", function() {
      var toNode = context.createGain();
      var sum = new neume.Sum(context, []);

      assert(sum.connect(toNode.gain) === sum);
      assert.deepEqual(toNode.toJSON(), {
        name: "GainNode",
        gain: {
          value: 0,
          inputs: []
        },
        inputs: []
      });
    });
    it("(to: AudioParam): self // when [ 0 ]", function() {
      var toNode = context.createGain();
      var a = Math.floor(Math.random() * 65536);
      var sum = new neume.Sum(context, [ a ]);

      assert(sum.connect(toNode.gain) === sum);
      assert.deepEqual(toNode.toJSON(), {
        name: "GainNode",
        gain: {
          value: a,
          inputs: []
        },
        inputs: []
      });
    });
    it("(to: AudioParam): self // when [ node, node, number ]", function() {
      var toNode = context.createGain();
      var a = context.createOscillator();
      var b = context.createDelay();
      var c = 110;
      var d = new neume.DC(context, 220);
      var sum = new neume.Sum(context, [ a, b, c, d ]);

      assert(sum.connect(toNode.gain), sum);
      assert.deepEqual(toNode.toJSON(), {
        name: "GainNode",
        gain: {
          value: c.valueOf() + d.valueOf(),
          inputs: [ a.toJSON(), b.toJSON() ]
        },
        inputs: []
      });
    });
    it("(to: AudioParam): self // when [ node, node, +/-0 ]", function() {
      var toNode = context.createGain();
      var a = context.createOscillator();
      var b = context.createDelay();
      var c = 10;
      var d = new neume.DC(context, -10);
      var sum = new neume.Sum(context, [ a, b, c, d ]);

      assert(sum.connect(toNode.gain), sum);
      assert.deepEqual(toNode.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: [ a.toJSON(), b.toJSON() ]
        },
        inputs: []
      });
    });
    it("(to: AudioParam): self // [ node, param, number ]", function() {
      var toNode = context.createGain();
      var a = context.createOscillator();
      var b = new neume.Param(context, 330);
      var c = 220;
      var d = new neume.DC(context, 110);
      var sum = new neume.Sum(context, [ a, b, c, d ]);

      assert(sum.connect(toNode.gain) === sum);
      assert.deepEqual(toNode.toJSON(), {
        name: "GainNode",
        gain: {
          value: b.value,
          inputs: [
            a.toJSON(),
            {
              name: "GainNode",
              gain: {
                value: c.valueOf() + d.valueOf(),
                inputs: []
              },
              inputs: [ BUFSRC(128) ]
            }
          ]
        },
        inputs: []
      });
      assert(sum.toAudioNode().$inputs[1].$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("(to: AudioParam): self // when [ node, param, +/-0 ]", function() {
      var toNode = context.createGain();
      var a = context.createOscillator();
      var b = new neume.Param(context, 220);
      var c = 10;
      var d = new neume.DC(context, -10);
      var sum = new neume.Sum(context, [ a, b, c, d ]);

      assert(sum.connect(toNode.gain), sum);
      assert.deepEqual(toNode.toJSON(), {
        name: "GainNode",
        gain: {
          value: b.value,
          inputs: [ a.toJSON() ]
        },
        inputs: []
      });
    });
    it("(to: AudioParam): self // when [ node, param, param ]", function() {
      var toNode = context.createGain();
      var a = context.createOscillator();
      var b = new neume.Param(context, 440);
      var c = new neume.Param(context, 220);
      var sum = new neume.Sum(context, [ a, b, c ]);

      assert(sum.connect(toNode.gain), sum);
      assert.deepEqual(toNode.toJSON(), {
        name: "GainNode",
        gain: {
          value: b.value,
          inputs: [
            a.toJSON(),
            {
              name: "GainNode",
              gain: {
                value: c.value,
                inputs: []
              },
              inputs: [ BUFSRC(128) ]
            }
          ]
        },
        inputs: []
      });
      assert(sum.toAudioNode().$inputs[1].$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
  });

  describe("#disconnect", function() {
    it("(): self", function() {
      var toNode = context.createGain();
      var a = context.createOscillator();
      var b = context.createDelay();
      var c = 10;
      var d = new neume.DC(context, -10);
      var sum = new neume.Sum(context, [ a, b, c, d ]);

      sum = sum.connect(toNode);

      assert(sum.disconnect(), sum);
      assert.deepEqual(toNode.toJSON(), {
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
