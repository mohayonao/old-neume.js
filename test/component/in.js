"use strict";

var neume = require("../../src");

var NeuContext = neume.Context;
var NeuComponent = neume.Component;
var NeuIn      = neume.In;

describe("NeuIn", function() {
  var context = null;
  var _in = null;

  beforeEach(function() {
    context = new NeuContext(new window.AudioContext().destination);
    _in = new NeuIn(context);
  });

  describe("(synth)", function() {
    it("returns an instance of NeuIn", function() {
      assert(_in instanceof NeuIn);
      assert(_in instanceof NeuComponent);
    });
  });

  describe("#toAudioNode()", function() {
    it("returns an AudioNode", function() {
      assert(_in.toAudioNode() instanceof window.AudioNode);
    });
  });
  describe("#connect(to)", function() {
    it("works", function() {
      var node = context.createDelay();

      new NeuIn(context).connect(node);

      assert.deepEqual(node.toJSON(), {
        name: "DelayNode",
        delayTime: {
          value: 0,
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
      });
    });
  });

  describe("#disconnect()", function() {
    it("works", function() {
      var node = context.createDelay();

      new NeuIn(context).connect(node).disconnect();

      assert.deepEqual(node.toJSON(), {
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
