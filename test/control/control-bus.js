"use strict";

var neume = require("../../src");

describe("NeuControlBus", function() {
  var audioContext = null;
  var context = null;

  beforeEach(function() {
    audioContext = new window.AudioContext();
    context = new neume.Context(audioContext.destination);
  });

  describe("(context)", function() {
    it("returns a NeuControlBus", function() {
      var bus = new neume.ControlBus(context);

      assert(bus instanceof neume.ControlBus);
    });
  });

  describe("#setValue(value)", function() {
    it("works", function() {
      var bus = new neume.ControlBus(context);

      bus.connect(context.createGain().gain);

      bus.setValue(880, 0.005);
      assert(bus.valueOf() === 0, "00:00.000");

      audioContext.$processTo("00:00.100");
      assert(closeTo(bus.valueOf(), 879.9999981861848, 1e-6), "00:00.100");
    });
  });

  describe("#toAudioNode()", function() {
    it("returns an AudioNode", function() {
      var bus = new neume.ControlBus(context);

      assert(bus.toAudioNode() instanceof window.AudioNode);
      assert(bus.toAudioNode() === bus.toAudioNode());
    });
  });

  describe("#connect(to)", function() {
    it("returns self", function() {
      var delay = context.createDelay();
      var bus = new neume.ControlBus(context);

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
              value: 0,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
    });
  });

  describe("#disconnect()", function() {
    it("returns self", function() {
      var bus = new neume.ControlBus(context);

      assert(bus.disconnect() === bus);
    });
  });

});
