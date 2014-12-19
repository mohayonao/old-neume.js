"use strict";

var neume = require("../../src");

var NOP = function() {};

describe("neume.Sched", function() {
  var context = null;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination);
  });

  describe("constructor", function() {
    it("(context: neume.Context, schedIter: iterator, callback: function)", function() {
      assert(new neume.Sched(context, 1, NOP) instanceof neume.Sched);
    });
  });

  describe("#start", function() {
    it("(startTime: timevalue): neume.Sched", function() {
      var sched = new neume.Sched(context, 0, NOP);

      assert(sched.start() === sched);
    });
  });

  describe("#stop", function() {
    it("(startTime: timevalue): neume.Sched", function() {
      var sched = new neume.Sched(context, 0, NOP);

      assert(sched.stop() === sched);
    });
  });

  it("works", function() {
    var start = null, passed = null, stop = null;

    var iter = {
      next: function() {
        return { value: 0.05, done: false };
      }
    };

    var sched = new neume.Sched(context, iter).on("start", function(e) {
      start = e;
    }).on("sched", function(e) {
      passed = e;
    }).on("stop", function(e) {
      stop = e;
    });

    context.start();

    assert(sched.state === "UNSCHEDULED", "00:00.000");
    assert(start === null);
    assert(passed === null);
    assert(stop === null);

    sched.stop(0.100);
    sched.start(0.200);
    sched.start(0.100);
    sched.stop(0.375);

    var audioContext = context.audioContext;

    audioContext.$processTo("00:00.100");
    assert(start === null, "00:00.100");
    assert(passed === null, "00:00.100");
    assert(stop === null, "00:00.100");

    audioContext.$processTo("00:00.200");
    assert(start !== null, "00:00.200");
    assert(start.count === 0, "00:00.200");
    assert(start.done === false, "00:00.200");
    assert(start.playbackTime === 0.2, "00:00.200");
    assert(passed === null, "00:00.200");
    assert(stop === null, "00:00.200");

    audioContext.$processTo("00:00.250");
    assert(passed !== null, "00:00.250");
    assert(passed.count === 1, "00:00.250");
    assert(passed.done === false, "00:00.250");
    assert(closeTo(passed.playbackTime, 0.250, 1e-6), "00:00.250");
    assert(stop === null, "00:00.250");

    audioContext.$processTo("00:00.305");
    assert(passed.count === 2, "00:00.305");
    assert(passed.done === false, "00:00.305");
    assert(closeTo(passed.playbackTime, 0.300, 1e-6), "00:00.305");
    assert(stop === null, "00:00.305");

    audioContext.$processTo("00:00.350");
    assert(passed.count === 3, "00:00.350");
    assert(passed.done === false, "00:00.350");
    assert(closeTo(passed.playbackTime, 0.350, 1e-6), "00:00.350");
    assert(stop === null, "00:00.350");

    audioContext.$processTo("00:00.400");
    assert(passed.count === 3, "00:00.400");
    assert(passed.done === false, "00:00.400");
    assert(closeTo(passed.playbackTime, 0.350, 1e-6), "00:00.400");
    assert(stop !== null, "00:00.400");
    assert(stop.count === 4, "00:00.400");
    assert(stop.done === false, "00:00.400");
    assert(stop.playbackTime === 0.375, "00:00.400");
  });
  it("works: autostop", function() {
    var start = null, passed = null, stop = null;

    var iter = {
      count: 0,
      next: function() {
        return { value: 0.05, done: 2 < ++this.count };
      }
    };

    var sched = new neume.Sched(context, iter).on("start", function(e) {
      start = e;
    }).on("sched", function(e) {
      passed = e;
    }).on("stop", function(e) {
      stop = e;
    });

    context.start();

    assert(sched.state === "UNSCHEDULED", "00:00.000");
    assert(start === null);
    assert(passed === null);
    assert(stop === null);

    sched.stop(0.100);
    sched.start(0.200);
    sched.start(0.100);
    sched.stop(0.375);

    var audioContext = context.audioContext;

    audioContext.$processTo("00:00.100");
    assert(start === null, "00:00.100");
    assert(passed === null, "00:00.100");
    assert(stop === null, "00:00.100");

    audioContext.$processTo("00:00.200");
    assert(start !== null, "00:00.200");
    assert(start.count === 0, "00:00.250");
    assert(start.done === false, "00:00.250");
    assert(start.playbackTime === 0.2, "00:00.200");
    assert(passed === null, "00:00.200");
    assert(stop === null, "00:00.200");

    audioContext.$processTo("00:00.250");
    assert(passed !== null, "00:00.250");
    assert(passed.count === 1, "00:00.250");
    assert(passed.done === false, "00:00.250");
    assert(closeTo(passed.playbackTime, 0.250, 1e-6), "00:00.250");
    assert(stop === null, "00:00.250");

    audioContext.$processTo("00:00.305");
    assert(passed.count === 2, "00:00.305");
    assert(passed.done === false, "00:00.305");
    assert(closeTo(passed.playbackTime, 0.300, 1e-6), "00:00.305");
    assert(stop === null, "00:00.305");

    audioContext.$processTo("00:00.350");
    assert(passed.count === 2, "00:00.350");
    assert(passed.done === false, "00:00.350");
    assert(closeTo(passed.playbackTime, 0.300, 1e-6), "00:00.305");
    assert(stop !== null, "00:00.350");
    assert(stop.count === 3, "00:00.350");
    assert(stop.done === true, "00:00.350");
    assert(stop.playbackTime === 0.350, "00:00.350");
  });

});
