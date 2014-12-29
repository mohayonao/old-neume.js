"use strict";

var neume = require("../../src");

describe("neume.Sched", function() {
  var context = null;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination, {
      scheduleInterval: 0.05, scheduleAheadTime: 0.05
    });
  });

  describe("constructor", function() {
    it("(context: neume.Context, schedIter: iterator, callback: function)", function() {
      assert(new neume.Sched(context, 1, NOP) instanceof neume.Sched);
    });
  });

  describe("#start", function() {
    it("(startTime: timevalue): neume.Sched", function() {
      var sched = new neume.Sched(context, 0, NOP);

      useTimer(context, function() {
        assert(sched.start() === sched);
      });
    });
  });

  describe("#stop", function() {
    it("(startTime: timevalue): neume.Sched", function() {
      var sched = new neume.Sched(context, 0, NOP);

      useTimer(context, function() {
        assert(sched.stop() === sched);
      });
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
      assert(this === sched);
      assert(start === null);
      assert(stop === null);
      start = e;
    }).on("sched", function(e) {
      assert(this === sched);
      assert(start !== null);
      assert(stop === null);
      passed = e;
    }).on("stop", function(e) {
      assert(this === sched);
      assert(start !== null);
      assert(stop === null);
      stop = e;
    });

    useTimer(context, function(tick) {
      context.start();

      assert(sched.state === "UNSCHEDULED", "00:00.000");
      assert(start === null);
      assert(passed === null);
      assert(stop === null);

      sched.stop(0.100);
      sched.start(0.200);
      sched.start(0.100);
      sched.stop(0.375);

      tick(50);
      assert(start === null, "00:00.050");
      assert(passed === null, "00:00.050");
      assert(stop === null, "00:00.050");

      tick(50);
      assert(start === null, "00:00.100");
      assert(passed === null, "00:00.100");
      assert(stop === null, "00:00.100");

      tick(50);
      assert(start === null, "00:00.150");
      assert(passed === null, "00:00.150");
      assert(stop === null, "00:00.150");

      tick(50);
      assert(start !== null, "00:00.200");
      assert(start.count === 0, "00:00.200");
      assert(start.done === false, "00:00.200");
      assert(start.playbackTime === 0.2, "00:00.200");
      assert(passed === null, "00:00.200");
      assert(stop === null, "00:00.200");

      tick(50);
      assert(passed !== null, "00:00.250");
      assert(passed.count === 1, "00:00.250");
      assert(passed.done === false, "00:00.250");
      assert(closeTo(passed.playbackTime, 0.250, 1e-6), "00:00.250");
      assert(stop === null, "00:00.250");

      tick(50);
      assert(passed.count === 2, "00:00.300");
      assert(passed.done === false, "00:00.300");
      assert(closeTo(passed.playbackTime, 0.300, 1e-6), "00:00.300");
      assert(stop === null, "00:00.300");

      tick(50);
      assert(passed.count === 3, "00:00.350");
      assert(passed.done === false, "00:00.350");
      assert(closeTo(passed.playbackTime, 0.350, 1e-6), "00:00.350");
      assert(stop === null, "00:00.350");

      tick(50);
      assert(passed.count === 3, "00:00.400");
      assert(passed.done === false, "00:00.400");
      assert(closeTo(passed.playbackTime, 0.350, 1e-6), "00:00.400");
      assert(stop !== null, "00:00.400");
      assert(stop.count === 4, "00:00.400");
      assert(stop.done === false, "00:00.400");
      assert(stop.playbackTime === 0.375, "00:00.400");
    });
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
      assert(this === sched);
      assert(start === null);
      assert(stop === null);
      start = e;
    }).on("sched", function(e) {
      assert(this === sched);
      assert(start !== null);
      assert(stop === null);
      passed = e;
    }).on("stop", function(e) {
      assert(this === sched);
      assert(start !== null);
      assert(stop === null);
      stop = e;
    });

    useTimer(context, function(tick) {
      context.start();

      assert(sched.state === "UNSCHEDULED", "00:00.000");
      assert(start === null);
      assert(passed === null);
      assert(stop === null);

      sched.stop(0.100);
      sched.start(0.200);
      sched.start(0.100);
      sched.stop(0.375);

      tick(50);
      assert(start === null, "00:00.100");
      assert(passed === null, "00:00.100");
      assert(stop === null, "00:00.100");

      tick(50);
      assert(start === null, "00:00.100");
      assert(passed === null, "00:00.100");
      assert(stop === null, "00:00.100");

      tick(50);
      assert(start === null, "00:00.100");
      assert(passed === null, "00:00.100");
      assert(stop === null, "00:00.100");

      tick(50);
      assert(start !== null, "00:00.200");
      assert(start.count === 0, "00:00.250");
      assert(start.done === false, "00:00.250");
      assert(start.playbackTime === 0.2, "00:00.200");
      assert(passed === null, "00:00.200");
      assert(stop === null, "00:00.200");

      tick(50);
      assert(passed !== null, "00:00.250");
      assert(passed.count === 1, "00:00.250");
      assert(passed.done === false, "00:00.250");
      assert(closeTo(passed.playbackTime, 0.250, 1e-6), "00:00.250");
      assert(stop === null, "00:00.250");

      tick(50);
      assert(passed.count === 2, "00:00.300");
      assert(passed.done === false, "00:00.300");
      assert(closeTo(passed.playbackTime, 0.300, 1e-6), "00:00.300");
      assert(stop === null, "00:00.300");

      tick(50);
      assert(passed.count === 2, "00:00.350");
      assert(passed.done === false, "00:00.350");
      assert(closeTo(passed.playbackTime, 0.300, 1e-6), "00:00.305");
      assert(stop !== null, "00:00.350");
      assert(stop.count === 3, "00:00.350");
      assert(stop.done === true, "00:00.350");
      assert(stop.playbackTime === 0.350, "00:00.350");
    });
  });

});
