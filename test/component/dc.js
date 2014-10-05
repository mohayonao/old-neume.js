"use strict";

var neume = require("../../src");

var _          = neume._;
var NeuContext = neume.Context;
var NeuDC      = neume.DC;

describe("NeuDC", function() {
  var context = null;

  beforeEach(function() {
    context = new NeuContext(new window.AudioContext().destination);
  });

  describe("(context, value)", function() {
    it("returns an instance of NeuDC", function() {
      assert(new NeuDC(context, 220) instanceof NeuDC);
    });
  });

  describe("#toAudioNode()", function() {
    it("returns an AudioNode", function() {
      var dc = new NeuDC(context, 0);
      assert(dc.toAudioNode() instanceof window.AudioNode);
      assert(dc.toAudioNode() === dc.toAudioNode());
    });
  });

  describe("#connect(to)", function() {
    it("0 -> AudioNode", function() {
      var gain = context.createGain();

      context.connect(new NeuDC(context, 0), gain);

      assert.deepEqual(gain.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ DC(0) ]
      });

      assert(gain.$inputs[0].buffer.getChannelData(0)[0] === 0);
    });
    it("1 -> AudioNode", function() {
      var gain = context.createGain();

      context.connect(new NeuDC(context, 1), gain);

      assert.deepEqual(gain.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ DC(1) ]
      });

      assert(gain.$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("2 -> AudioNode", function() {
      var gain = context.createGain();

      context.connect(new NeuDC(context, 2), gain);

      assert.deepEqual(gain.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 2,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });

      assert(gain.$inputs[0].$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("3 -> AudioParam", function() {
      var gain = context.createGain();

      context.connect(new NeuDC(context, 3), gain.gain);

      assert.deepEqual(gain.toJSON(), {
        name: "GainNode",
        gain: {
          value: 3,
          inputs: []
        },
        inputs: []
      });
    });
  });

  describe("#valueOf()", function() {
    it("returns the value", function() {
      assert(new NeuDC(context, 0).valueOf() === 0);
      assert(new NeuDC(context, 1).valueOf() === 1);
      assert(new NeuDC(context, 2).valueOf() === 2);
    });
  });

});
