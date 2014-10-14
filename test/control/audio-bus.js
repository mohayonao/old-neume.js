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

  describe("#maxNodes", function() {
    it("works", function() {
      var bus = new neume.AudioBus(context);

      assert(typeof bus.maxNodes === "number");

      bus.maxNodes = 2;
      assert(bus.maxNodes === 2);

      bus.maxNodes = -1;
      assert(bus.maxNodes === 0);
    });
  });

  describe("#nodes", function() {
    it("works", function() {
      var bus = new neume.AudioBus(context);

      assert(Array.isArray(bus.nodes));
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

  describe("#onconnected(from)", function() {
    it("works", function() {
      var delay = context.createDelay();
      var bus = new neume.AudioBus(context);

      context.connect(delay, bus);
      context.connect(delay, bus);

      assert.deepEqual(bus.nodes, [ delay ]);
    });
  });

  describe("#onconnected(from)", function() {
    it("works", function() {
      var delay = context.createDelay();
      var bus = new neume.AudioBus(context);

      context.connect(delay, bus);
      context.disconnect(delay);

      assert.deepEqual(bus.nodes, []);
    });
  });

  describe("auto disconnect", function() {
    it("works", function() {
      var delay1 = context.createDelay();
      var delay2 = context.createDelay();
      var delay3 = context.createDelay();
      var bus = new neume.AudioBus(context);

      sinon.spy(delay1, "disconnect");
      sinon.spy(delay2, "disconnect");
      sinon.spy(delay3, "disconnect");

      bus.maxNodes = 2;

      context.connect(delay1, bus);
      context.connect(delay2, bus);
      context.connect(delay3, bus);

      assert.deepEqual(bus.nodes, [ delay2, delay3 ]);
      assert(delay1.disconnect.callCount === 1);
      assert(delay2.disconnect.callCount === 0);
      assert(delay3.disconnect.callCount === 0);
    });
  });

});
