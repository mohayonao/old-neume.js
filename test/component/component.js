"use strict";

var neume = require("../../src");

describe("neume.Component", function() {
  var context = null;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination);
  });

  describe("constructor", function() {
    it("(context: neume.Context, [ node: any ]): neume.Component", function() {
      var node = context.createOscillator();
      var a = new neume.Component(context, node);

      assert(a instanceof neume.Component);
    });
  });

  describe("#mul", function() {
    it("(value: any): neume.Component", function() {
      var node = new neume.DC(context, 2);
      var a = new neume.Component(context, node);
      var b = a.mul(10);

      assert(a !== b);
      assert(b instanceof neume.Component);
      assert(b.valueOf() === 20);
    });
  });

  describe("#add", function() {
    it("(value: any): neume.Component", function() {
      var node = new neume.DC(context, 2);
      var a = new neume.Component(context, node);
      var b = a.add(10);

      assert(a !== b);
      assert(b instanceof neume.Component);
      assert(b.valueOf() === 12);
    });
  });

  describe("#toAudioNode", function() {
    it("(): AudioNode", function() {
      var node = context.createOscillator();
      var a = new neume.Component(context, node);

      assert(a.toAudioNode() instanceof global.AudioNode);
      assert(a.toAudioNode() === a.toAudioNode());
      assert(a.toAudioNode() === node);
    });
  });

  describe("#connect", function() {
    it("(to: any): self", function() {
      var node = context.createOscillator();
      var toNode = context.createGain();
      var a = new neume.Component(context, node);

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
  });

  describe("#disconnect", function() {
    it("(to: any): self", function() {
      var node = context.createOscillator();
      var toNode = context.createGain();
      var a = new neume.Component(context, node);

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

});
