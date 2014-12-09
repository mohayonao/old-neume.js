"use strict";

var neume = require("../../src");

var NOP = function() {};

describe("neume.Sched", function() {
  var context = null;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination);
  });

  describe("constructor", function() {
    it("(context: neume.Context, interval: number, callback: function)", function() {
      assert(new neume.Sched(context, 1, NOP) instanceof neume.Sched);
    });
  });

  describe("#start", function() {
    it("(t: number): neume.Sched", function() {
      var sched = new neume.Sched(context, 0, NOP);

      assert(sched.start() === sched);
    });
  });

  describe("#stop", function() {
    it("(t: number): neume.Sched", function() {
      var sched = new neume.Sched(context, 0, NOP);

      assert(sched.stop() === sched);
    });
  });

  it("works", function() {
    var passed = null;

    var sched = new neume.Sched(context, 0, function(e) {
      passed = e;

      switch (e.count) {
        case 0:
          return { next: e.playbackTime + 0.025 };
        case 1:
          return { next: e.playbackTime + 0.050 };
        case 2:
          return { next: e.playbackTime + 0.100, callback: nextFunction };
      }
    });

    var nextFunction = function(e) {
      passed = "nextFunction";

      return {};
    };

    context.start();

    assert(sched.state === "UNSCHEDULED", "00:00.000");
    assert(passed === null);

    sched.stop(0.100);
    sched.start(0.200);
    sched.start(0.100);
    sched.stop(0.400);

    var audioContext = context.audioContext;

    audioContext.$processTo("00:00.050");
    assert(sched.state === "SCHEDULED", "00:00.050");
    assert(passed === null, "00:00.050");

    audioContext.$processTo("00:00.100");
    assert(sched.state === "SCHEDULED", "00:00.100");
    assert(passed === null, "00:00.100");

    audioContext.$processTo("00:00.150");
    assert(sched.state === "SCHEDULED", "00:00.150");
    assert(passed === null, "00:00.150");

    audioContext.$processTo("00:00.200");
    assert(sched.state === "PLAYING", "00:00.200");
    assert.deepEqual(passed, { playbackTime: 0.200, count: 0 }, "00:00.200");

    audioContext.$processTo("00:00.250");
    assert(sched.state === "PLAYING", "00:00.250");
    assert.deepEqual(passed, { playbackTime: 0.225, count: 1 }, "00:00.250");

    audioContext.$processTo("00:00.300");
    assert(sched.state === "PLAYING", "00:00.300");
    assert.deepEqual(passed, { playbackTime: 0.275, count: 2 }, "00:00.300");

    audioContext.$processTo("00:00.350");
    assert(sched.state === "PLAYING", "00:00.350");
    assert.deepEqual(passed, { playbackTime: 0.275, count: 2 }, "00:00.350");

    audioContext.$processTo("00:00.400");
    assert(sched.state === "FINISHED", "00:00.400");
    assert.deepEqual(passed, "nextFunction", "00:00.400");

    audioContext.$processTo("00:00.450");
    assert(sched.state === "FINISHED", "00:00.450");
    assert.deepEqual(passed, "nextFunction", "00:00.450");
  });
  it("works: not reached", function() {
    var sched = new neume.Sched(context, 0, function() {
      assert(!"not reached");
    });

    assert(sched.state === "UNSCHEDULED", "00:00.000");

    sched.start(0.020);
    sched.stop(0.010);

    var audioContext = context.audioContext;

    audioContext.$processTo("00:00.010");
    assert(sched.state === "FINISHED", "00:00.010");

    audioContext.$processTo("00:00.020");
    assert(sched.state === "FINISHED", "00:00.020");
  });
  it("works: invalid case", function() {
    var sched = new neume.Sched(context, 0, "INVALID");

    assert(sched.state === "UNSCHEDULED", "00:00.000");

    sched.start(0.000);

    var audioContext = context.audioContext;

    audioContext.$processTo("00:00.010");
    assert(sched.state === "FINISHED", "00:00.010");

    audioContext.$processTo("00:00.020");
    assert(sched.state === "FINISHED", "00:00.020");
  });

});
