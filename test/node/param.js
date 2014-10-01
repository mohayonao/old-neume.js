"use strict";

var neume = require("../../src");

var NeuContext = neume.Context;
var NeuParam   = neume.Param;

describe("NeuParam", function() {
  var audioContext = null;
  var context = null;
  var param = null;

  beforeEach(function() {
    audioContext = new window.AudioContext();
    context = new NeuContext(audioContext.destination);
    param = new NeuParam({ $context: context }, "freq", 440);
    param._connect(context.destination);
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

  describe("#setAt(value, startTime)", function() {
    it("returns self", function() {
      assert(param.setAt(880, 0.500) === param);
    });
    it("works", function() {
      param.setAt(880, 0.250);
      assert(param.valueOf() === 440, "00:00.000");

      audioContext.$process(0.255);
      assert(param.valueOf() === 880, "00:00.250");

      audioContext.$process(0.25);
      assert(param.valueOf() === 880, "00:00.500");

      audioContext.$process(0.25);
      assert(param.valueOf() === 880, "00:00.750");

      audioContext.$process(0.25);
      assert(param.valueOf() === 880, "00:01.000");
    });
  });

  describe("#linTo(value, endTime)", function() {
    it("returns self", function() {
      assert(param.linTo(880, 1) === param);
    });
    it("works", function() {
      param.linTo(880, 1.000);
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

  describe("#expTo(value, endTime)", function() {
    it("returns self", function() {
      assert(param.expTo(880, 1.000) === param);
    });
    it("works", function() {
      param.expTo(880, 1.000);

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

  describe("#targetAt(target, startTime, timeConstant)", function() {
    it("returns self", function() {
      assert(param.targetAt(880, 0.500, 0.25) === param);
    });
    it("works", function() {
      param.targetAt(880, 0.250, 0.25);

      assert(param.valueOf() === 440, "00:00.000");

      audioContext.$process(0.25);
      assert(param.valueOf() === 440, "00:00.250");

      audioContext.$process(0.25);
      assert(param.valueOf() === 718.1330458845654, "00:00.500");

      audioContext.$process(0.25);
      assert(param.valueOf() === 820.4524753758905, "00:00.750");

      audioContext.$process(0.25);
      assert(param.valueOf() === 858.0936899181398, "00:01.000");
    });
  });

  describe("#curveAt(values, startTime, duration)", function() {
    it("returns self", function() {
      assert(param.curveAt(new Float32Array([]), 0.500, 0.25) === param);
    });
    it("schedules the value change exponentially without third argument", function() {
      param.curveAt(new Float32Array([ 660, 330 ]), 0.250, 0.25);

      assert(param.valueOf() === 440, "00:00.000");

      audioContext.$process(0.25);
      assert(param.valueOf() === 660, "00:00.250");

      audioContext.$process(0.25);
      assert(param.valueOf() === 330, "00:00.500");

      audioContext.$process(0.25);
      assert(param.valueOf() === 330, "00:00.750");

      audioContext.$process(0.25);
      assert(param.valueOf() === 330, "00:01.000");
    });
  });

  describe("#cancel(startTime)", function() {
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

  describe("#_connect(to)", function() {
    it("works", function() {
      param = new NeuParam({ $context: context }, "freq", 440);

      var to1 = context.createGain();
      var to2 = context.createGain();
      var to3 = context.createGain();
      var to4 = context.createGain();

      to1.$id = "to1";
      to2.$id = "to2";
      to3.$id = "to3";
      to4.$id = "to4";

      param._connect(to1);
      param._connect(to1);
      param._connect(to2);
      param._connect(to2);
      param._connect(to3.gain);
      param._connect(to3.gain);
      param._connect(to4.gain);
      param._connect(to4.gain);

      assert.deepEqual(to1.toJSON(), {
        name: "GainNode#to1",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 440,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
      assert(to1.$inputs[0].$inputs[0].buffer.getChannelData(0)[0] === 1);
      assert.deepEqual(to2.toJSON(), {
        name: "GainNode#to2",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 440,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
      assert(to2.$inputs[0].$inputs[0].buffer.getChannelData(0)[0] === 1);
      assert.deepEqual(to3.toJSON(), {
        name: "GainNode#to3",
        gain: {
          value: 440,
          inputs: []
        },
        inputs: []
      });
      assert(to3.gain.value === 440);

      assert.deepEqual(to4.toJSON(), {
        name: "GainNode#to4",
        gain: {
          value: 440,
          inputs: []
        },
        inputs: []
      });

      assert(to1.$inputs[0].gain.value === 440);
      assert(to2.$inputs[0].gain.value === 440);
      assert(to3.gain.value === 440);
      assert(to4.gain.value === 440);

      param.set(220);

      assert(to1.$inputs[0].gain.value === 220);
      assert(to2.$inputs[0].gain.value === 220);
      assert(to3.gain.value === 220);
      assert(to4.gain.value === 220);
    });
  });

});
