"use strict";

var NeuContext = require("../src/context");
var NeuTimeout = require("../src/timeout");
var NOP = function() {};

describe("NeuTimeout", function() {
  var audioContext = null;
  var context = null;

  beforeEach(function() {
    audioContext = new window.AudioContext();
    context = new NeuContext(audioContext.destination);
  });

  describe("(context, interval, callback)", function() {
    it("returns an instance of NeuInterval", function() {
      assert(new NeuTimeout(context, 1, NOP) instanceof NeuTimeout);
    });
    it("works", function() {
      var passed = null;

      var timeout = new NeuTimeout(context, 0.1, function(e) {
        passed = e;
      });

      audioContext.$reset();
      context.reset();
      context.start();

      assert(timeout.state === "UNSCHEDULED", "00:00.000");
      assert(passed === null);

      timeout.stop(0.100);
      timeout.start(0.200);
      timeout.start(0.100);
      timeout.stop(0.400);

      audioContext.$process(0.050);
      assert(timeout.state === "SCHEDULED", "00:00.050");
      assert(passed === null, "00:00.050");

      audioContext.$process(0.050);
      assert(timeout.state === "SCHEDULED", "00:00.100");
      assert(passed === null, "00:00.100");

      audioContext.$process(0.050);
      assert(timeout.state === "SCHEDULED", "00:00.150");
      assert(passed === null, "00:00.150");

      audioContext.$process(0.050);
      assert(timeout.state === "SCHEDULED", "00:00.200");
      assert(passed === null, "00:00.200");

      audioContext.$process(0.050);
      assert(timeout.state === "SCHEDULED", "00:00.250");
      assert(passed === null, "00:02.500");

      audioContext.$process(0.055);
      assert(timeout.state === "FINISHED", "00:00.305");
      assert.deepEqual(passed, { playbackTime: 0.30000000000000004, count: 0 }, "00:00.305");

      audioContext.$process(0.045);
      assert(timeout.state === "FINISHED", "00:00.350");
      assert.deepEqual(passed, { playbackTime: 0.30000000000000004, count: 0 }, "00:00.350");

      audioContext.$process(0.050);
      assert(timeout.state === "FINISHED", "00:00.400");
      assert.deepEqual(passed, { playbackTime: 0.30000000000000004, count: 0 }, "00:00.400");

      audioContext.$process(0.050);
      assert(timeout.state === "FINISHED", "00:00.450");
      assert.deepEqual(passed, { playbackTime: 0.30000000000000004, count: 0 }, "00:00.450");
    });
    describe("invalid case", function() {
      it("callback is not a function", function() {
        var timeout = new NeuTimeout(context, 1, "INVALID");

        audioContext.$reset();
        timeout.$context.reset();

        assert(timeout.state === "UNSCHEDULED", "00:00.000");

        timeout.start(0.000);

        audioContext.$process(0.010);
        assert(timeout.state === "SCHEDULED", "00:00.010");

        audioContext.$process(0.020);
        assert(timeout.state === "SCHEDULED", "00:00.020");
      });
    });

  });

  describe("#start(t)", function() {
    it("returns self", function() {
      var timeout = new NeuTimeout(context, 1, NOP);
      assert(timeout.start() === timeout);
    });
  });

  describe("#stop(t)", function() {
    it("returns self", function() {
      var timeout = new NeuTimeout(context, 1, NOP);
      assert(timeout.stop() === timeout);
    });
  });

});
