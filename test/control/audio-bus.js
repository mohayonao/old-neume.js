"use strict";

var neume = require("../../src");

describe("neume.AudioBus", function() {
  var context = null;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination);
  });

  describe("constructor", function() {
    it("(context: neume.Context)", function() {
      var bus = new neume.AudioBus(context);

      assert(bus instanceof neume.AudioBus);
    });
  });

  describe("#maxNodes", function() {
    it("\\getter: number", function() {
      var bus = new neume.AudioBus(context);

      assert(typeof bus.maxNodes === "number");
    });
    it("\\setter: number", function() {
      var bus = new neume.AudioBus(context);

      bus.maxNodes = 2;
      assert(bus.maxNodes === 2);

      bus.maxNodes = -1;
      assert(bus.maxNodes === 0);
    });
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

  describe("#nodes", function() {
    it("\\getter: Array<object>", function() {
      var bus = new neume.AudioBus(context);

      assert(Array.isArray(bus.nodes));
    });
  });

  describe("#fade", function() {
    it("(): self", function() {
      var bus = new neume.AudioBus(context);
      var outlet = bus.toAudioNode();

      bus.fade();

      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.250), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.500), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.750), 0.000, 1e-2));
    });
    it("(t: number|string, val: number, dur: number|string): self", function() {
      var bus = new neume.AudioBus(context);
      var outlet = bus.toAudioNode();

      bus.fade(2, 0.5, 2);

      assert(closeTo(outlet.gain.$valueAtTime(1.000), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.250), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.500), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.750), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(2.000), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(2.250), 0.781, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(2.500), 0.658, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(2.750), 0.588, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(3.000), 0.550, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(3.250), 0.528, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(3.500), 0.515, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(3.750), 0.508, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(4.000), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(4.500), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(5.000), 0.500, 1e-2));
    });
  });

  describe("#toAudioNode", function() {
    it("(): self", function() {
      var bus = new neume.AudioBus(context);

      assert(bus.toAudioNode() instanceof global.AudioNode);
      assert(bus.toAudioNode() === bus.toAudioNode());
    });
  });

  describe("#connect", function() {
    it("(to: AudioNode): self", function() {
      var toNode = context.createDelay();
      var bus = new neume.AudioBus(context);

      assert(bus.connect(toNode) === bus);
      assert.deepEqual(toNode.toJSON(), {
        name: "DelayNode",
        delayTime: {
          value: 0,
          inputs: []
        },
        inputs: [ bus.toAudioNode().toJSON() ]
      });
    });
  });

  describe("#disconnect", function() {
    it("(): self", function() {
      var toNode = context.createDelay();
      var bus = new neume.AudioBus(context);

      assert(bus.disconnect() === bus);
    });
  });

  describe("#onconnected", function() {
    it("(from: AudioNode): void", function() {
      var fromNode = context.createDelay();
      var bus = new neume.AudioBus(context);

      context.connect(fromNode, bus);
      context.connect(fromNode, bus);

      assert.deepEqual(bus.nodes, [ fromNode ]);
    });
  });

  describe("#ondisconnected", function() {
    it("(from: AudioNode): void", function() {
      var fromNode = context.createDelay();
      var bus = new neume.AudioBus(context);

      context.connect(fromNode, bus);
      context.disconnect(fromNode);

      assert.deepEqual(bus.nodes, []);
    });
  });

});
