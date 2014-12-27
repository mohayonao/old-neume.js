"use strict";

var neume = require("../../src");

var NOP = function() {};

describe("neume.AudioBus", function() {
  var context = null;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination);
  });

  describe("constructor", function() {
    it("(context: neume.Context)", function() {
      var bus = new neume.AudioBus(context, 0);

      assert(bus instanceof neume.AudioBus);
    });
  });

  describe("#index", function() {
    it("\\getter: number", function() {
      var bus = new neume.AudioBus(context, 1);

      assert(bus.index === 1);
    });
  });

  describe("#maxNodes", function() {
    it("\\getter: number", function() {
      var bus = new neume.AudioBus(context, 0);

      assert(typeof bus.maxNodes === "number");
    });
    it("\\setter: number", function() {
      var bus = new neume.AudioBus(context, 0);

      bus.maxNodes = 2;
      assert(bus.maxNodes === 2);

      bus.maxNodes = -1;
      assert(bus.maxNodes === 0);
    });
    it("works", function() {
      var synth1 = { toAudioNode: NOP, stop: sinon.spy() };
      var synth2 = { toAudioNode: NOP, stop: sinon.spy() };
      var synth3 = { toAudioNode: NOP, stop: sinon.spy() };
      var bus = new neume.AudioBus(context, 0);

      bus.maxNodes = 2;

      bus.append(synth1);
      bus.append(synth2);
      bus.append(synth3);

      assert.deepEqual(bus.nodes, [ synth2, synth3 ]);
      assert(synth1.stop.callCount === 1);
      assert(synth2.stop.callCount === 0);
      assert(synth3.stop.callCount === 0);
    });
  });

  describe("#nodes", function() {
    it("\\getter: neume.Synth[]", function() {
      var bus = new neume.AudioBus(context, 0);

      assert(Array.isArray(bus.nodes));
    });
  });

  describe("#append", function() {
    it("(synth: neume.Synth): self", function() {
      var synth1 = { toAudioNode: NOP };
      var synth2 = { toAudioNode: NOP };

      var bus = new neume.AudioBus(context, 0);

      bus.append(synth1);
      bus.append(synth2);

      assert.deepEqual(bus.nodes, [ synth1, synth2 ]);
    });
  });

  describe("#remove", function() {
    it("(synth: neume.Synth): self", function() {
      var synth1 = { toAudioNode: NOP };
      var synth2 = { toAudioNode: NOP };
      var synth3 = { toAudioNode: NOP };

      var bus = new neume.AudioBus(context, 0);

      bus.append(synth1);
      bus.append(synth2);
      bus.remove(synth1);
      bus.remove(synth3);

      assert.deepEqual(bus.nodes, [ synth2 ]);
    });
  });

  describe("#toAudioNode", function() {
    it("(): AudioNode", function() {
      var bus = new neume.AudioBus(context, 0);

      assert(bus.toAudioNode() instanceof global.AudioNode);
    });
  });

});
