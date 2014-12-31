"use strict";

var neume = require("../../src");

describe("neume.DC", function() {
  var context = null;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination);
  });

  describe("constructor", function() {
    it("(context: neume.Context, value: number)", function() {
      var a = new neume.DC(context, 220);

      assert(a instanceof neume.DC);
    });
    it("context cache", function() {
      var a = new neume.DC(context, 220);
      var b = new neume.DC(context, 440);
      var c = new neume.DC(context, 220);

      assert(a !== b);
      assert(a === c);
    });
  });

  describe("#toAudioNode", function() {
    it("(): AudioNode // when 0", function() {
      var a = new neume.DC(context, 0);

      assert(a.toAudioNode() === null);
    });
    it("(): AudioNode // when 1", function() {
      var a = new neume.DC(context, 1);

      assert(a.toAudioNode() instanceof global.AudioNode);
      assert(a.toAudioNode() === a.toAudioNode());
      assert.deepEqual(a.toAudioNode().toJSON(), BUFSRC(128));
      assert(a.toAudioNode().buffer.getChannelData(0)[0] === 1);
    });
    it("(): AudioNode // else", function() {
      var n = Math.floor(Math.random() * 65536);
      var a = new neume.DC(context, n);

      assert(a.toAudioNode() instanceof global.AudioNode);
      assert(a.toAudioNode() === a.toAudioNode());
      assert.deepEqual(a.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: n,
          inputs: []
        },
        inputs: [ BUFSRC(128) ]
      });
      assert(a.toAudioNode().$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
  });

  describe("#connect", function() {
    it("(to: AudioNode): self", function() {
      var toNode = context.createGain();
      var a = new neume.DC(context, 1);

      assert(a.connect(toNode) === a);
      assert.deepEqual(toNode.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ a.toAudioNode().toJSON() ]
      });
    });
    it("(to: AudioParam): self", function() {
      var toNode = context.createGain();
      var n = Math.floor(Math.random() * 65536);
      var a = new neume.DC(context, n);

      assert(a.connect(toNode.gain) === a);
      assert.deepEqual(toNode.toJSON(), {
        name: "GainNode",
        gain: {
          value: n,
          inputs: []
        },
        inputs: []
      });
    });
  });

  describe("#disconnect", function() {
    it("(): self", function() {
      var toNode = context.createGain();
      var a = new neume.DC(context, 1);

      a.connect(toNode);

      assert(a.disconnect() === a);
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

  describe("#stop", function() {
    it("(): self", function() {
      var toNode = context.createGain();
      var a = new neume.DC(context, 1);

      assert(a.connect(toNode) === a);
      assert(a._bufSrc.$state === "PLAYING");

      assert(a.stop() === a);
      assert(a._bufSrc.$state === "FINISHED");

      assert.doesNotThrow(function() {
        a.stop();
      });
    });
  });

  describe("#valueOf", function() {
    it("(): number", function() {
      assert(new neume.DC(context, 0).valueOf() === 0);
      assert(new neume.DC(context, 1).valueOf() === 1);
      assert(new neume.DC(context, 2).valueOf() === 2);
    });
  });

});
