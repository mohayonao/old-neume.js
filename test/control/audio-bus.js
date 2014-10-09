"use strict";

var neume = require("../../src");

describe("NeuAudioBus", function() {
  var context = null;

  beforeEach(function() {
    context = new neume.Context(new window.AudioContext().destination);
  });

  describe("(context)", function() {
    it("returns a NeuAudioBus", function() {
      var bus = new neume.AudioBus(context);

      assert(bus instanceof neume.AudioBus);
    });
  });

  describe("#toAudioNode()", function() {
    it("returns an AudioNode", function() {
      var bus = new neume.AudioBus(context);

      assert(bus.toAudioNode() instanceof window.AudioNode);
      assert(bus.toAudioNode() === bus.toAudioNode());
    });
  });

  describe("#connect(to)", function() {
    it("returns self", function() {
      var delay = context.createDelay();
      var bus = new neume.AudioBus(context);

      assert(bus.connect(delay) === bus);
      assert.deepEqual(delay.toJSON(), {
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
    it("returns self", function() {
      var bus = new neume.AudioBus(context);

      assert(bus.disconnect() === bus);
    });
  });

});
