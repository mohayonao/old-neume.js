"use strict";

var neume = require("../../src");

var NeuContext = neume.Context;
var NeuSched = neume.Sched;
var NOP = function() {};

describe("NeuSched", function() {
  var audioContext = null;
  var context = null;

  beforeEach(function() {
    audioContext = new global.AudioContext();
    context = new NeuContext(audioContext.destination);
  });

  describe("(context, interval, callback)", function() {
    it("returns an instance of NeuSched", function() {
      assert(new NeuSched(context, 1, NOP) instanceof NeuSched);
    });
    it("works", function() {
      var passed = null;

      var sched = new NeuSched(context, 0, function(e) {
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

      audioContext.$reset();
      context.reset();
      context.start();

      assert(sched.state === "UNSCHEDULED", "00:00.000");
      assert(passed === null);

      sched.stop(0.100);
      sched.start(0.200);
      sched.start(0.100);
      sched.stop(0.400);

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
    it("works not reached", function() {
      var sched = new NeuSched(context, 0, function() {
        assert(!"not reached");
      });

      audioContext.$reset();
      sched.$context.reset();

      assert(sched.state === "UNSCHEDULED", "00:00.000");

      sched.start(0.020);
      sched.stop(0.010);

      audioContext.$processTo("00:00.010");
      assert(sched.state === "FINISHED", "00:00.010");

      audioContext.$processTo("00:00.020");
      assert(sched.state === "FINISHED", "00:00.020");
    });
    describe("invalid case", function() {
      it("callback is not a function", function() {
        var sched = new NeuSched(context, 0, "INVALID");

        audioContext.$reset();
        sched.$context.reset();

        assert(sched.state === "UNSCHEDULED", "00:00.000");

        sched.start(0.000);

        audioContext.$processTo("00:00.010");
        assert(sched.state === "FINISHED", "00:00.010");

        audioContext.$processTo("00:00.020");
        assert(sched.state === "FINISHED", "00:00.020");
      });
    });
  });

  describe("#start(t)", function() {
    it("returns self", function() {
      var sched = new NeuSched(context, 0, NOP);
      assert(sched.start() === sched);
    });
  });

  describe("#stop(t)", function() {
    it("returns self", function() {
      var sched = new NeuSched(context, 0, NOP);
      assert(sched.stop() === sched);
    });
  });

});
