"use strict";

var neume = require("../../src");

var NeuContext  = neume.Context;
var NeuInterval = neume.Interval;
var NOP = function() {};

describe("NeuInterval", function() {
  var audioContext = null;
  var context = null;

  beforeEach(function() {
    audioContext = new window.AudioContext();
    context = new NeuContext(audioContext.destination);
  });

  describe("(context, interval, callback)", function() {
    it("returns an instance of NeuInterval", function() {
      assert(new NeuInterval(context, 1, NOP) instanceof NeuInterval);
    });
    it("works", function() {
      var passed = null;

      var interval = new NeuInterval(context, 0.1, function(e) {
        passed = e;
      });

      audioContext.$reset();
      context.reset();
      context.start();

      assert(interval.state === "UNSCHEDULED", "00:00.000");
      assert(passed === null);

      interval.stop(0.100);
      interval.start(0.200);
      interval.start(0.100);
      interval.stop(0.400);

      audioContext.$process(0.050);
      assert(interval.state === "SCHEDULED", "00:00.050");
      assert(passed === null, "00:00.050");

      audioContext.$process(0.050);
      assert(interval.state === "SCHEDULED", "00:00.100");
      assert(passed === null, "00:00.100");

      audioContext.$process(0.050);
      assert(interval.state === "SCHEDULED", "00:00.150");
      assert(passed === null, "00:00.150");

      audioContext.$process(0.050);
      assert(interval.state === "PLAYING", "00:00.200");
      assert.deepEqual(passed, { playbackTime: 0.200, count: 0 }, "00:00.200");

      audioContext.$process(0.050);
      assert(interval.state === "PLAYING", "00:00.250");
      assert.deepEqual(passed, { playbackTime: 0.200, count: 0 }, "00:02.500");

      audioContext.$process(0.055);
      assert(interval.state === "PLAYING", "00:00.305");
      assert.deepEqual(passed, { playbackTime: 0.30000000000000004, count: 1 }, "00:00.305");

      audioContext.$process(0.045);
      assert(interval.state === "PLAYING", "00:00.350");
      assert.deepEqual(passed, { playbackTime: 0.30000000000000004, count: 1 }, "00:00.350");

      audioContext.$process(0.050);
      assert(interval.state === "FINISHED", "00:00.400");
      assert.deepEqual(passed, { playbackTime: 0.30000000000000004, count: 1 }, "00:00.400");

      audioContext.$process(0.050);
      assert(interval.state === "FINISHED", "00:00.450");
      assert.deepEqual(passed, { playbackTime: 0.30000000000000004, count: 1 }, "00:00.450");
    });
    describe("invalid case", function() {
      it("callback is not a function", function() {
        var interval = new NeuInterval(context, 1, "INVALID");

        audioContext.$reset();
        interval.$context.reset();

        assert(interval.state === "UNSCHEDULED", "00:00.000");

        interval.start(0.000);

        audioContext.$process(0.010);
        assert(interval.state === "SCHEDULED", "00:00.010");

        audioContext.$process(0.020);
        assert(interval.state === "SCHEDULED", "00:00.020");
      });
    });

  });

  describe("#start(t)", function() {
    it("returns self", function() {
      var interval = new NeuInterval(context, 1, NOP);
      assert(interval.start() === interval);
    });
  });

  describe("#stop(t)", function() {
    it("returns self", function() {
      var interval = new NeuInterval(context, 1, NOP);
      assert(interval.stop() === interval);
    });
  });

});
