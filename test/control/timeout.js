"use strict";

var neume = require("../../src");

var NOP = function() {};

describe("neume.Timeout", function() {
  var context = null;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination, {
      scheduleInterval: 0.05, scheduleAheadTime: 0.05
    });
  });

  describe("constructor", function() {
    it("(context: neume.Context, timeout: timevalue, callback: function)", function() {
      assert(new neume.Timeout(context, 1, NOP) instanceof neume.Timeout);
    });
  });

  describe("#start", function() {
    it("(startTime: timevalue): neume.Timeout", sinon.test(function() {
      var sched = new neume.Timeout(context, 1, NOP);

      assert(sched.start() === sched);
    }));
  });

  describe("#stop", function() {
    it("(startTime: timevalue): neume.Timeout", sinon.test(function() {
      var sched = new neume.Timeout(context, 1, NOP);

      assert(sched.stop() === sched);
    }));
  });

  it("works", sinon.test(function() {
    var tick = function(t) {
      for (var i = 0; i < t / 50; i++) {
        this.clock.tick(50);
        context.audioContext.$process(0.05);
      }
    }.bind(this);

    var passed = null;

    var sched = new neume.Timeout(context, 0.05, function(e) {
      assert(this === sched);
      passed = e;
    });

    context.start();

    assert(sched.state === "UNSCHEDULED", "00:00.000");
    assert(passed === null);

    sched.stop(0.100);
    sched.start(0.200);
    sched.start(0.100);
    sched.stop(0.400);

    tick(50);
    assert(sched.state === "SCHEDULED", "00:00.050");
    assert(passed === null, "00:00.050");

    tick(50);
    assert(sched.state === "SCHEDULED", "00:00.100");
    assert(passed === null, "00:00.100");

    tick(50);
    assert(sched.state === "SCHEDULED", "00:00.150");
    assert(passed === null, "00:00.150");

    tick(50);
    assert(sched.state === "PLAYING", "00:00.200");
    assert(passed === null, "00:00.200");

    tick(50);
    assert(sched.state === "FINISHED", "00:00.250");
    assert(passed !== null, "00:00.250");
    assert(passed.count === 1, "00:00.250");
    assert(passed.done === true, "00:00.250");
    assert(closeTo(passed.playbackTime, 0.250, 1e-6), "00:00.250");
  }));

});
