"use strict";

var neume = require("../../src");

describe("neume.Mul", function() {
  var context = null;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination);
  });

  describe("constructor", function() {
    it("(context: neume.Context, a: any, b: any)", function() {
      var a = context.createOscillator();
      var b = context.createGain();
      var mul = new neume.Mul(context, a, b);

      assert(mul instanceof neume.Mul);
      assert(mul instanceof neume.Component);
    });
    it("constructor: neume.DC // when number * number", function() {
      var a = Math.floor(Math.random() * 65536);
      var b = Math.floor(Math.random() * 65536);
      var mul = new neume.Mul(context, a, b);

      assert(mul instanceof neume.DC);
      assert(mul.valueOf() === a.valueOf() * b.valueOf());
    });
    it("constructor: neume.DC // when neume.DC * neume.DC", function() {
      var a = new neume.DC(context, Math.floor(Math.random() * 65536));
      var b = new neume.DC(context, Math.floor(Math.random() * 65536));
      var mul = new neume.Mul(context, a, b);

      assert(mul instanceof neume.DC);
      assert(mul.valueOf() === a.valueOf() * b.valueOf());
    });
    it("constructor: neume.DC // when node * 0", function() {
      var a = context.createGain();
      var b = 0;
      var mul = new neume.Mul(context, a, b);

      assert(mul instanceof neume.DC);
      assert(mul.valueOf() === 0);
    });
    it("constructor: neume.DC // when 0 * node", function() {
      var a = 0;
      var b = context.createGain();
      var mul = new neume.Mul(context, a, b);

      assert(mul instanceof neume.DC);
      assert(mul.valueOf() === 0);
    });
    it("constructor: neume.Component // when node * 1", function() {
      var a = context.createGain();
      var b = 1;
      var mul = new neume.Mul(context, a, b);

      assert(mul instanceof neume.Component);
      assert(mul.toAudioNode() === a);
    });
    it("constructor: neume.Component // when 1 * node", function() {
      var a = 1;
      var b = context.createGain();
      var mul = new neume.Mul(context, a, b);

      assert(mul instanceof neume.Component);
      assert(mul.toAudioNode() === b);
    });
  });

  describe("#mul", function() {
    it("(value: AudioNode): neume.Mul", function() {
      var a = context.createOscillator();
      var b = context.createBufferSource();
      var c = context.createDelay();
      var mul = new neume.Mul(context, a, b);
      var mul2 = mul.mul(c);

      assert(mul2 instanceof neume.Mul);
      assert.deepEqual(mul2.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 0,
          inputs: [ c.toJSON() ]
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 0,
              inputs: [ b.toJSON() ]
            },
            inputs: [ a.toJSON() ]
          }
        ]
      });
    });
    it("(value: number): neume.Mul", function() {
      var a = context.createOscillator();
      var b = 5;
      var c = new neume.DC(context, 2);
      var mul = new neume.Mul(context, a, b);
      var mul2 = mul.mul(c);

      assert(mul2 instanceof neume.Mul);
      assert.deepEqual(mul2.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: b.valueOf() * c.valueOf(),
          inputs: []
        },
        inputs: [ a.toJSON() ]
      });
    });
  });

  describe("#toAudioNode", function() {
    it("(): AudioNode", function() {
      var a = context.createOscillator();
      var b = context.createBufferSource();
      var mul = new neume.Mul(context, a, b);

      assert(mul.toAudioNode() instanceof global.AudioNode);
      assert(mul.toAudioNode() === mul.toAudioNode());
    });
  });

  describe("#connect", function() {
    it("(to: any): self", function() {
      var toNode = context.createDelay();
      var a = context.createOscillator();
      var b = context.createBufferSource();
      var mul = new neume.Mul(context, a, b);

      assert(mul.connect(toNode), mul);
      assert.deepEqual(toNode.toJSON(), {
        name: "DelayNode",
        delayTime: {
          value: 0,
          inputs: []
        },
        inputs: [ mul.toAudioNode().toJSON() ]
      });
    });
  });

  describe("#disconnect", function() {
    it("(): self", function() {
      var toNode = context.createDelay();
      var a = context.createOscillator();
      var b = context.createBufferSource();
      var mul = new neume.Mul(context, a, b);

      mul = mul.connect(toNode);

      assert(mul.disconnect(), mul);
      assert.deepEqual(toNode.toJSON(), {
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
