"use strict";

var NeuContext = require("../src/context");
var NeuParam = require("../src/param");

describe("NeuParam", function() {
  var audioContext = null;
  var context = null;
  var param = null;

  beforeEach(function() {
    audioContext = new window.AudioContext();
    context = new NeuContext(audioContext);
    param = new NeuParam({ $context: context }, "freq", 440);
    param.$outlet.connect(context.destination);
  });

  describe("(synth, name, value)", function() {
    it("returns an instance of NeuParam", function() {
      assert(param instanceof NeuParam);
    });
  });

  describe("#valueOf()", function() {
    it("returns the value", function() {
      assert(typeof param.valueOf() === "number");
    });
  });

  describe("#set(value)", function() {
    it("returns self", function() {
      assert(param.set(880) === param);
    });
    it("sets the value immediately", function() {
      assert(param.set(880).valueOf() === 880, "00:00.000");
    });
  });

  describe("#setAt(value, duratoin)", function() {
    it("returns self", function() {
      assert(param.setAt(880, 0.5) === param);
    });
    it("schedules the value change after the duration", function() {
      param.setAt(880, 0.5);
      assert(param.valueOf() === 440, "00:00.000");

      audioContext.$process(0.25);
      assert(param.valueOf() === 440, "00:00.250");

      audioContext.$process(0.25);
      assert(param.valueOf() === 880, "00:00.500");

      audioContext.$process(0.25);
      assert(param.valueOf() === 880, "00:00.750");

      audioContext.$process(0.25);
      assert(param.valueOf() === 880, "00:01.000");
    });
  });

  describe("#linTo(value, duration)", function() {
    it("returns self", function() {
      assert(param.linTo(880, 1) === param);
    });
    it("schedules the value change linearly", function() {
      param.linTo(880, 1);
      assert(param.valueOf() === 440, "00:00.000");

      audioContext.$process(0.25);
      assert(param.valueOf() === 550, "00:00.250");

      audioContext.$process(0.25);
      assert(param.valueOf() === 660, "00:00.500");

      audioContext.$process(0.25);
      assert(param.valueOf() === 770, "00:00.750");

      audioContext.$process(0.25);
      assert(param.valueOf() === 880, "00:01.000");
    });
  });

  describe("#expTo(value, duration)", function() {
    it("returns self", function() {
      assert(param.expTo(880, 1) === param);
    });
    it("schedules the value change exponentially", function() {
      param.expTo(880, 1);

      assert(param.valueOf() === 440, "00:00.000");

      audioContext.$process(0.25);
      assert(param.valueOf() === 523.2511306011972, "00:00.250");

      audioContext.$process(0.25);
      assert(param.valueOf() === 622.2539674441618, "00:00.500");

      audioContext.$process(0.25);
      assert(param.valueOf() === 739.9888454232688, "00:00.750");

      audioContext.$process(0.25);
      assert(param.valueOf() === 880, "00:01.000");
    });
  });

  describe("#cancel()", function() {
    it("returns self", function() {
      assert(param.cancel() === param);
    });
    it("cancels all schedules", function() {
      param.linTo(880, 1);

      assert(param.valueOf() === 440, "00:00.000");

      audioContext.$process(0.25);
      assert(param.valueOf() === 550, "00:00.250");

      param.cancel();

      audioContext.$process(0.25);
      assert(param.valueOf() === 550, "00:00.500");

      audioContext.$process(0.25);
      assert(param.valueOf() === 550, "00:00.750");

      audioContext.$process(0.25);
      assert(param.valueOf() === 550, "00:01.000");
    });
  });

});
