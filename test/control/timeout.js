"use strict";

var neume = require("../../src");

var NOP = function() {};

describe("neume.Timeout", function() {
  var context = null;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination);
  });

  describe("constructor", function() {
    it("(context: neume.Context, interval: number, callback: function)", function() {
      assert(new neume.Timeout(context, 1, NOP) instanceof neume.Timeout);
    });
  });

  describe("#start", function() {
    it("(t: number): neume.Timeout", function() {
      var sched = new neume.Timeout(context, 1, NOP);

      assert(sched.start() === sched);
    });
  });

  describe("#stop", function() {
    it("(t: number): neume.Timeout", function() {
      var sched = new neume.Timeout(context, 1, NOP);

      assert(sched.stop() === sched);
    });
  });

  it("works", function() {
    var passed = null;

    var sched = new neume.Timeout(context, 0.1, function(e) {
      passed = e;
    });

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
    assert.deepEqual(passed, { playbackTime: 0.200, count: 0 }, "00:02.500");

    audioContext.$processTo("00:00.305");
    assert(sched.state === "PLAYING", "00:00.305");
    assert.deepEqual(passed, { playbackTime: 0.30000000000000004, count: 1 }, "00:00.305");

    audioContext.$processTo("00:00.350");
    assert(sched.state === "PLAYING", "00:00.350");
    assert.deepEqual(passed, { playbackTime: 0.30000000000000004, count: 1 }, "00:00.350");

    audioContext.$processTo("00:00.400");
    assert(sched.state === "FINISHED", "00:00.400");
    assert.deepEqual(passed, { playbackTime: 0.30000000000000004, count: 1 }, "00:00.400");

    audioContext.$processTo("00:00.450");
    assert(sched.state === "FINISHED", "00:00.450");
    assert.deepEqual(passed, { playbackTime: 0.30000000000000004, count: 1 }, "00:00.450");
  });
  it("works: invalid case", function() {
    var sched = new neume.Timeout(context, 1, "INVALID");

    assert(sched.state === "UNSCHEDULED", "00:00.000");

    sched.start(0.000);

    var audioContext = context.audioContext;

    audioContext.$processTo("00:00.010");
    assert(sched.state === "FINISHED", "00:00.010");

    audioContext.$processTo("00:00.020");
    assert(sched.state === "FINISHED", "00:00.020");
  });

});
