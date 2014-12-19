"use strict";

var neume = require("../../src");

var NOP = function() {};

describe("neume.Interval", function() {
  var context = null;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination);
  });

  describe("constructor", function() {
    it("(context: neume.Context, interval: timevalue, callback: function)", function() {
      assert(new neume.Interval(context, 1, NOP) instanceof neume.Interval);
    });
  });

  describe("#start", function() {
    it("(startTime: timevalue): neume.Interval", function() {
      var sched = new neume.Interval(context, 1, NOP);

      assert(sched.start() === sched);
    });
  });

  describe("#stop", function() {
    it("(startTime: timevalue): neume.Interval", function() {
      var sched = new neume.Interval(context, 1, NOP);

      assert(sched.stop() === sched);
    });
  });

  it("works", function() {
    var passed = null;

    var sched = new neume.Interval(context, 0.05, function(e) {
      passed = e;
    });

    context.start();

    assert(sched.state === "UNSCHEDULED", "00:00.000");
    assert(passed === null);

    sched.stop(0.100);
    sched.start(0.200);
    sched.start(0.100);
    sched.stop(0.390);

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
    assert(passed.count === 0, "00:00.200");
    assert(passed.done === false, "00:00.250");
    assert(closeTo(passed.playbackTime, 0.200, 1e-6), "00:00.200");

    audioContext.$processTo("00:00.250");
    assert(sched.state === "PLAYING", "00:00.250");
    assert(passed !== null, "00:00.250");
    assert(passed.count === 1, "00:00.250");
    assert(passed.done === false, "00:00.250");
    assert(closeTo(passed.playbackTime, 0.250, 1e-6), "00:00.250");

    audioContext.$processTo("00:00.305");
    assert(sched.state === "PLAYING", "00:00.300");
    assert(passed.count === 2, "00:00.300");
    assert(passed.done === false, "00:00.300");
    assert(closeTo(passed.playbackTime, 0.300, 1e-6), "00:00.300");

    audioContext.$processTo("00:00.350");
    assert(sched.state === "PLAYING", "00:00.350");
    assert(passed.count === 3, "00:00.350");
    assert(passed.done === false, "00:00.350");
    assert(closeTo(passed.playbackTime, 0.350, 1e-6), "00:00.350");

    audioContext.$processTo("00:00.400");
    assert(sched.state === "FINISHED", "00:00.400");
    assert(passed.count === 3, "00:00.400");
    assert(passed.done === false, "00:00.350");
    assert(closeTo(passed.playbackTime, 0.350, 1e-6), "00:00.400");
  });

});
