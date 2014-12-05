"use strict";

var neume = require("../../src");

var NeuContext = neume.Context;
var NeuParam = neume.Param;

describe("NeuParam", function() {
  var audioContext = null;
  var context = null;
  var param = null;

  beforeEach(function() {
    audioContext = new global.AudioContext();
    context = new NeuContext(audioContext.destination);
    param = new NeuParam(context, 440);
  });

  describe("(synth, name, value)", function() {
    it("returns an instance of NeuParam", function() {
      assert(param instanceof NeuParam);
    });
  });

  describe("#valueOf()", function() {
    it("returns the value", function() {
      assert(param.valueOf() === 440);
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
      param.connect(context.destination);

      param.setAt(880, 0.250);
      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.000");

      audioContext.$processTo("00:00.250");
      assert(closeTo(param.valueOf(), 880.000, 1e-2), "00:00.250");

      audioContext.$processTo("00:00.500");
      assert(closeTo(param.valueOf(), 880.000, 1e-2), "00:00.500");

      audioContext.$processTo("00:00.750");
      assert(closeTo(param.valueOf(), 880.000, 1e-2), "00:00.750");

      audioContext.$processTo("00:01.000");
      assert(closeTo(param.valueOf(), 880.000, 1e-2), "00:01.000");

      assert(closeTo(param.valueAtTime(0.000), 440.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.250), 880.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.500), 880.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.750), 880.000, 1e-2));
      assert(closeTo(param.valueAtTime(1.000), 880.000, 1e-2));
    });
  });

  describe("#setValueAtTime", function() {
    it("alias of #setAt", function() {
      assert(param.setValueAtTime === param.setAt);
    });
  });

  describe("#linTo(value, endTime)", function() {
    it("returns self", function() {
      assert(param.linTo(880, 1) === param);
    });
    it("works", function() {
      param.connect(context.destination);

      param.setAt(440, 0.000);
      param.linTo(880, 1.000);
      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.000");

      audioContext.$processTo("00:00.250");
      assert(closeTo(param.valueOf(), 550.000, 1e-2), "00:00.250");

      audioContext.$processTo("00:00.500");
      assert(closeTo(param.valueOf(), 660.000, 1e-2), "00:00.500");

      audioContext.$processTo("00:00.750");
      assert(closeTo(param.valueOf(), 770.000, 1e-2), "00:00.750");

      audioContext.$processTo("00:01.000");
      assert(closeTo(param.valueOf(), 880.000, 1e-2), "00:01.000");

      assert(closeTo(param.valueAtTime(0.000), 440.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.250), 550.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.500), 660.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.750), 770.000, 1e-2));
      assert(closeTo(param.valueAtTime(1.000), 880.000, 1e-2));
    });
  });

  describe("#linearRampToValueAtTime", function() {
    it("alias of #linTo", function() {
      assert(param.linearRampToValueAtTime === param.linTo);
    });
  });

  describe("#expTo(value, endTime)", function() {
    it("returns self", function() {
      assert(param.expTo(880, 1.000) === param);
    });
    it("works", function() {
      param.connect(context.destination);

      param.setAt(440, 0.000);
      param.expTo(880, 1.000);
      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.000");

      audioContext.$processTo("00:00.250");
      assert(closeTo(param.valueOf(), 523.251, 1e-2), "00:00.250");

      audioContext.$processTo("00:00.500");
      assert(closeTo(param.valueOf(), 622.253, 1e-2), "00:00.500");

      audioContext.$processTo("00:00.750");
      assert(closeTo(param.valueOf(), 739.988, 1e-2), "00:00.750");

      audioContext.$processTo("00:01.000");
      assert(closeTo(param.valueOf(), 880.000, 1e-2), "00:01.000");

      assert(closeTo(param.valueAtTime(0.000), 440.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.250), 523.251, 1e-2));
      assert(closeTo(param.valueAtTime(0.500), 622.253, 1e-2));
      assert(closeTo(param.valueAtTime(0.750), 739.988, 1e-2));
      assert(closeTo(param.valueAtTime(1.000), 880.000, 1e-2));
    });
  });

  describe("#exponentialRampToValueAtTime", function() {
    it("alias of #expTo", function() {
      assert(param.exponentialRampToValueAtTime === param.expTo);
    });
  });

  describe("#targetAt(target, startTime, timeConstant)", function() {
    it("returns self", function() {
      assert(param.targetAt(880, 0.500, 0.25) === param);
    });
    it("works", function() {
      param.connect(context.destination);

      param.targetAt(880, 0.250, 0.25);
      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.000");

      audioContext.$processTo("00:00.250");
      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.250");

      audioContext.$processTo("00:00.500");
      assert(closeTo(param.valueOf(), 718.133, 1e-2), "00:00.500");

      audioContext.$processTo("00:00.750");
      assert(closeTo(param.valueOf(), 820.452, 1e-2), "00:00.750");

      audioContext.$processTo("00:01.000");
      assert(closeTo(param.valueOf(), 858.093, 1e-2), "00:01.000");

      assert(closeTo(param.valueAtTime(0.000), 440.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.250), 440.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.500), 718.133, 1e-2));
      assert(closeTo(param.valueAtTime(0.750), 820.452, 1e-2));
      assert(closeTo(param.valueAtTime(1.000), 858.093, 1e-2));
    });
  });

  describe("#setTargetAtTime", function() {
    it("alias of #targetAt", function() {
      assert(param.setTargetAtTime === param.targetAt);
    });
  });

  describe("#curveAt(values, startTime, duration)", function() {
    it("returns self", function() {
      assert(param.curveAt(new Float32Array([]), 0.500, 0.25) === param);
    });
    it("works", function() {
      param.connect(context.destination);

      param.curveAt(new Float32Array([ 660, 330, 550, 440 ]), 0.250, 0.25);
      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.000");

      audioContext.$processTo("00:00.250");
      assert(closeTo(param.valueOf(), 660.000, 1e-2), "00:00.250");

      audioContext.$processTo("00:00.500");
      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.500");

      audioContext.$processTo("00:00.750");
      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.750");

      audioContext.$processTo("00:01.000");
      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:01.000");

      assert(closeTo(param.valueAtTime(0.000), 440.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.250), 660.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.300), 660.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.350), 330.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.400), 550.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.450), 440.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.500), 440.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.750), 440.000, 1e-2));
      assert(closeTo(param.valueAtTime(1.000), 440.000, 1e-2));
    });
  });

  describe("#setValueCurveAtTime", function() {
    it("alias of #curveAt", function() {
      assert(param.setValueCurveAtTime === param.curveAt);
    });
  });

  describe("#cancel(startTime)", function() {
    it("returns self", function() {
      assert(param.cancel() === param);
    });
    it("cancels all schedules", function() {
      param.connect(context.destination);

      param.setAt(440, 0);
      param.linTo(880, 1);
      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.000");

      audioContext.$processTo("00:00.250");
      assert(closeTo(param.valueOf(), 550.000, 1e-2), "00:00.250");

      param.cancel(0.5);

      audioContext.$processTo("00:00.500");
      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.500");

      audioContext.$processTo("00:00.750");
      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.750");

      audioContext.$processTo("00:01.000");
      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:01.000");
    });
  });

  describe("#cancelScheduledValues", function() {
    it("alias of #cancel", function() {
      assert(param.cancelScheduledValues === param.cancel);
    });
  });

  describe("#update(v1, v0, t0)", function() {
    it("works1", function() {
      param = new NeuParam(context, 440);
      param.connect(context.destination);

      param.update(660, 440, 0.2);
      param.update(220, 660, 0.4);

      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.000");

      audioContext.$processTo("00:00.100");
      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.100");

      audioContext.$processTo("00:00.200");
      assert(closeTo(param.valueOf(), 660.000, 1e-2), "00:00.200");

      audioContext.$processTo("00:00.300");
      assert(closeTo(param.valueOf(), 660.000, 1e-2), "00:00.300");

      audioContext.$processTo("00:00.400");
      assert(closeTo(param.valueOf(), 220.000, 1e-2), "00:00.400");

      audioContext.$processTo("00:00.500");
      assert(closeTo(param.valueOf(), 220.000, 1e-2), "00:00.500");
    });
    it("works with timeConstant", function() {
      param = new NeuParam(context, 440, { timeConstant: 0.1 });
      param.connect(context.destination);

      param.update(660, 440, 0.2);
      param.update(220, 660, 0.4);

      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.000");

      audioContext.$processTo("00:00.100");
      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.100");

      audioContext.$processTo("00:00.200");
      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.200");

      audioContext.$processTo("00:00.300");
      assert(closeTo(param.valueOf(), 579.066, 1e-2), "00:00.300");

      audioContext.$processTo("00:00.400");
      assert(closeTo(param.valueOf(), 630.226, 1e-2), "00:00.400");

      audioContext.$processTo("00:00.500");
      assert(closeTo(param.valueOf(), 370.913, 1e-2), "00:00.500");
    });
    it("works with relative timeConstant", function() {
      param = new NeuParam(context, 440, { timeConstant: "32n" });
      param.connect(context.destination);

      param.update(660, 440, 0.2);
      context.bpm = 240;
      param.update(220, 660, 0.4);

      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.000");

      audioContext.$processTo("00:00.100");
      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.100");

      audioContext.$processTo("00:00.200");
      assert(closeTo(param.valueOf(), 440.000, 1e-2), "00:00.200");

      audioContext.$processTo("00:00.300");
      assert(closeTo(param.valueOf(), 615.582, 1e-2), "00:00.300");

      audioContext.$processTo("00:00.400");
      assert(closeTo(param.valueOf(), 651.032, 1e-2), "00:00.400");

      audioContext.$processTo("00:00.500");
      assert(closeTo(param.valueOf(), 237.569, 1e-2), "00:00.500");
    });
  });

  describe("#toAudioNode()", function() {
    it("returns an AudioNode", function() {
      assert(param.toAudioNode() instanceof global.AudioNode);
    });
  });

  describe("#connect(to)", function() {
    it("works", function() {
      param = new NeuParam(context, 440);

      var to1 = context.createGain();
      var to2 = context.createGain();
      var to3 = context.createGain();
      var to4 = context.createGain();

      to1.$id = "to1";
      to2.$id = "to2";
      to3.$id = "to3";
      to4.$id = "to4";

      param.connect(to1);
      param.connect(to1);
      param.connect(to2);
      param.connect(to2);
      param.connect(to3.gain);
      param.connect(to3.gain);
      param.connect(to4.gain);
      param.connect(to4.gain);

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

      param.setAt(220, 0);

      assert(to1.$inputs[0].gain.value === 220);
      assert(to2.$inputs[0].gain.value === 220);
      assert(to3.gain.value === 220);
      assert(to4.gain.value === 220);
    });
  });

  describe("#disconnect()", function() {
    it("works", function() {
      var node = context.createDelay();

      new NeuParam(context, 0).connect(node).disconnect();

      assert.deepEqual(node.toJSON(), {
        name: "DelayNode",
        delayTime: {
          value: 0,
          inputs: []
        },
        inputs: []
      });
    });
  });

});
