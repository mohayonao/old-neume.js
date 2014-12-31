"use strict";

var neume = require("../../src");

describe("neume.Param", function() {
  var context = null;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination);
  });

  describe("constructor", function() {
    it("(context: neume.Context, value: number)", function() {
      var param = new neume.Param(context, 440);

      assert(param instanceof neume.Param);
    });
  });

  describe("#events", function() {
    it("\\getter: Array<type: string, value:number, time: number>", function() {
      var param = new neume.Param(context, 0);

      param.setAt(0, 0);
      param.setAt(1, 0);
      param.setAt(2, 2);
      param.setAt(3, 1);

      assert.deepEqual(param.events, [
        {
          type: "SetValue",
          value: 1,
          time: 0
        },
        {
          type: "SetValue",
          value: 3,
          time: 1
        },
        {
          type: "SetValue",
          value: 2,
          time: 2
        }
      ]);
    });
  });

  describe("#value", function() {
    it("\\getter: number", function() {
      var param = new neume.Param(context, 0);

      assert(param.value === 0, "00:00.000");
    });
    it("\\setter: number", function() {
      var param = new neume.Param(context, 0);

      param.connect(context.destination);
      param.value = 880;

      assert(param.value === 880, "00:00.000");
    });
  });

  describe("#setAt", function() {
    it("(value: number, startTime: number): self", function() {
      var param = new neume.Param(context, 440.0);

      param.connect(context.destination);

      assert(param.setAt(880, 0.250) === param);
      assert(closeTo(param.value, 440.000, 1e-2), "00:00.000");

      param.context.audioContext.$processTo("00:00.250");
      assert(closeTo(param.value, 880.000, 1e-2), "00:00.250");

      param.context.audioContext.$processTo("00:00.500");
      assert(closeTo(param.value, 880.000, 1e-2), "00:00.500");

      param.context.audioContext.$processTo("00:00.750");
      assert(closeTo(param.value, 880.000, 1e-2), "00:00.750");

      param.context.audioContext.$processTo("00:01.000");
      assert(closeTo(param.value, 880.000, 1e-2), "00:01.000");

      assert(closeTo(param.valueAtTime(0.000), 440.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.250), 880.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.500), 880.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.750), 880.000, 1e-2));
      assert(closeTo(param.valueAtTime(1.000), 880.000, 1e-2));
    });
    it("alias: #setValueAtTime", function() {
      var param = new neume.Param(context, 440.0);

      assert(param.setAt === param.setValueAtTime);
    });
  });

  describe("#linTo", function() {
    it("(value: number, endTime: number): self", function() {
      var param = new neume.Param(context, 440.0);

      param.connect(context.destination);
      param.setAt(440, 0.000);

      assert(param.linTo(880, 1.000) === param);
      assert(closeTo(param.value, 440.000, 1e-2), "00:00.000");

      param.context.audioContext.$processTo("00:00.250");
      assert(closeTo(param.value, 550.000, 1e-2), "00:00.250");

      param.context.audioContext.$processTo("00:00.500");
      assert(closeTo(param.value, 660.000, 1e-2), "00:00.500");

      param.context.audioContext.$processTo("00:00.750");
      assert(closeTo(param.value, 770.000, 1e-2), "00:00.750");

      param.context.audioContext.$processTo("00:01.000");
      assert(closeTo(param.value, 880.000, 1e-2), "00:01.000");

      assert(closeTo(param.valueAtTime(0.000), 440.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.250), 550.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.500), 660.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.750), 770.000, 1e-2));
      assert(closeTo(param.valueAtTime(1.000), 880.000, 1e-2));
    });
    it("alias: #linearRampToValueAtTime", function() {
      var param = new neume.Param(context, 440.0);

      assert(param.linTo === param.linearRampToValueAtTime);
    });
  });

  describe("#expTo", function() {
    it("(value: number, endTime: number): self", function() {
      var param = new neume.Param(context, 440.0);

      param.connect(context.destination);
      param.setAt(440, 0.000);

      assert(param.expTo(880, 1.000) === param);
      assert(closeTo(param.value, 440.000, 1e-2), "00:00.000");

      param.context.audioContext.$processTo("00:00.250");
      assert(closeTo(param.value, 523.251, 1e-2), "00:00.250");

      param.context.audioContext.$processTo("00:00.500");
      assert(closeTo(param.value, 622.253, 1e-2), "00:00.500");

      param.context.audioContext.$processTo("00:00.750");
      assert(closeTo(param.value, 739.988, 1e-2), "00:00.750");

      param.context.audioContext.$processTo("00:01.000");
      assert(closeTo(param.value, 880.000, 1e-2), "00:01.000");

      assert(closeTo(param.valueAtTime(0.000), 440.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.250), 523.251, 1e-2));
      assert(closeTo(param.valueAtTime(0.500), 622.253, 1e-2));
      assert(closeTo(param.valueAtTime(0.750), 739.988, 1e-2));
      assert(closeTo(param.valueAtTime(1.000), 880.000, 1e-2));
    });
    it("alias: #exponentialRampToValueAtTime", function() {
      var param = new neume.Param(context, 440.0);

      assert(param.expTo === param.exponentialRampToValueAtTime);
    });
  });

  describe("#targetAt", function() {
    it("(target: number, startTime: number, timeConstant: number): self", function() {
      var param = new neume.Param(context, 440.0);

      param.connect(context.destination);
      param.setAt(440, 0.000);

      assert(param.targetAt(880, 0.250, 0.25) === param);
      assert(closeTo(param.value, 440.000, 1e-2), "00:00.000");

      param.context.audioContext.$processTo("00:00.250");
      assert(closeTo(param.value, 440.000, 1e-2), "00:00.250");

      param.context.audioContext.$processTo("00:00.500");
      assert(closeTo(param.value, 718.133, 1e-2), "00:00.500");

      param.context.audioContext.$processTo("00:00.750");
      assert(closeTo(param.value, 820.452, 1e-2), "00:00.750");

      param.context.audioContext.$processTo("00:01.000");
      assert(closeTo(param.value, 858.093, 1e-2), "00:01.000");

      assert(closeTo(param.valueAtTime(0.000), 440.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.250), 440.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.500), 718.133, 1e-2));
      assert(closeTo(param.valueAtTime(0.750), 820.452, 1e-2));
      assert(closeTo(param.valueAtTime(1.000), 858.093, 1e-2));
    });
    it("alias: #setTargetAtTime", function() {
      var param = new neume.Param(context, 440.0);

      assert(param.targetAt === param.setTargetAtTime);
    });
  });

  describe("#curveAt", function() {
    it("(values: Float32Array, startTime: number, duration: number): self", function() {
      var param = new neume.Param(context, 440.0);
      var values = new Float32Array([ 660, 330, 550, 220 ]);

      param.connect(context.destination);

      assert(param.curveAt(values, 0.250, 0.25) === param);
      assert(closeTo(param.value, 440.000, 1e-2), "00:00.000");

      param.context.audioContext.$processTo("00:00.250");
      assert(closeTo(param.value, values[0], 1e-2), "00:00.250");

      param.context.audioContext.$processTo("00:00.300");
      assert(closeTo(param.value, values[0], 1e-2), "00:00.300");

      param.context.audioContext.$processTo("00:00.350");
      assert(closeTo(param.value, values[1], 1e-2), "00:00.350");

      param.context.audioContext.$processTo("00:00.400");
      assert(closeTo(param.value, values[2], 1e-2), "00:00.400");

      param.context.audioContext.$processTo("00:00.450");
      assert(closeTo(param.value, values[3], 1e-2), "00:00.450");

      param.context.audioContext.$processTo("00:00.500");
      assert(closeTo(param.value, values[3], 1e-2), "00:00.500");

      param.context.audioContext.$processTo("00:00.750");
      assert(closeTo(param.value, values[3], 1e-2), "00:00.750");

      param.context.audioContext.$processTo("00:01.000");
      assert(closeTo(param.value, values[3], 1e-2), "00:01.000");

      assert(closeTo(param.valueAtTime(0.000), 440.000, 1e-2));
      assert(closeTo(param.valueAtTime(0.250), values[0], 1e-2));
      assert(closeTo(param.valueAtTime(0.300), values[0], 1e-2));
      assert(closeTo(param.valueAtTime(0.350), values[1], 1e-2));
      assert(closeTo(param.valueAtTime(0.400), values[2], 1e-2));
      assert(closeTo(param.valueAtTime(0.450), values[3], 1e-2));
      assert(closeTo(param.valueAtTime(0.500), values[3], 1e-2));
      assert(closeTo(param.valueAtTime(0.750), values[3], 1e-2));
      assert(closeTo(param.valueAtTime(1.000), values[3], 1e-2));
    });
    it("alias: #setValueCurveAtTime", function() {
      var param = new neume.Param(context, 440.0);

      assert(param.curveAt === param.setValueCurveAtTime);
    });
  });

  describe("#cancel", function() {
    it("(startTime: number): self", function() {
      var param = new neume.Param(context, 440.0);

      param.connect(context.destination);
      param.setAt(440, 0);
      param.linTo(880, 1);

      assert(closeTo(param.value, 440.000, 1e-2), "00:00.000");

      param.context.audioContext.$processTo("00:00.250");
      assert(closeTo(param.value, 550.000, 1e-2), "00:00.250");

      assert(param.cancel(0.5) === param);

      param.context.audioContext.$processTo("00:00.500");
      assert(closeTo(param.value, 440.000, 1e-2), "00:00.500");

      param.context.audioContext.$processTo("00:00.750");
      assert(closeTo(param.value, 440.000, 1e-2), "00:00.750");

      param.context.audioContext.$processTo("00:01.000");
      assert(closeTo(param.value, 440.000, 1e-2), "00:01.000");
    });
    it("alias: #cancelScheduledValues", function() {
      var param = new neume.Param(context, 440.0);

      assert(param.cancel === param.cancelScheduledValues);
    });
  });

  describe("#update", function() {
    it("(value, startTime): self // when step", function() {
      var param = new neume.Param(context, 440);

      param.connect(context.destination);

      param.setAt(440, 0.000);
      param.update(220, 0.100);
      param.update(660, 0.200);

      assert(closeTo(param.value, 440.000, 1e-2), "00:00.000");

      param.context.audioContext.$processTo("00:00.050");
      assert(closeTo(param.value, 440.000, 1e-2), "00:00.050");

      param.context.audioContext.$processTo("00:00.100");
      assert(closeTo(param.value, 220.000, 1e-2), "00:00.100");

      param.context.audioContext.$processTo("00:00.150");
      assert(closeTo(param.value, 220.000, 1e-2), "00:00.150");

      param.context.audioContext.$processTo("00:00.200");
      assert(closeTo(param.value, 660.000, 1e-2), "00:00.200");

      param.context.audioContext.$processTo("00:00.250");
      assert(closeTo(param.value, 660.000, 1e-2), "00:00.250");

      param.context.audioContext.$processTo("00:00.300");
      assert(closeTo(param.value, 660.000, 1e-2), "00:00.300");
    });
    it("(value, startTime): self // when curve:lin, lag:0.1", function() {
      var param = new neume.Param(context, 440, { curve: "lin", lag: 0.1 });

      param.connect(context.destination);

      param.setAt(440, 0.000);
      param.update(220, 0.100);
      param.update(660, 0.200);

      assert(closeTo(param.value, 440.000, 1e-2), "00:00.000");

      param.context.audioContext.$processTo("00:00.050");
      assert(closeTo(param.value, 440.000, 1e-2), "00:00.050");

      param.context.audioContext.$processTo("00:00.100");
      assert(closeTo(param.value, 440.000, 1e-2), "00:00.100");

      param.context.audioContext.$processTo("00:00.150");
      assert(closeTo(param.value, 330.000, 1e-2), "00:00.150");

      param.context.audioContext.$processTo("00:00.200");
      assert(closeTo(param.value, 220.000, 1e-2), "00:00.200");

      param.context.audioContext.$processTo("00:00.250");
      assert(closeTo(param.value, 440.000, 1e-2), "00:00.250");

      param.context.audioContext.$processTo("00:00.300");
      assert(closeTo(param.value, 660.000, 1e-2), "00:00.300");
    });
    it("(value, startTime): self // when curve:exp, lag:0.1", function() {
      var param = new neume.Param(context, 440, { curve: "exp", lag: 0.1 });

      param.connect(context.destination);

      param.setAt(440, 0.000);
      param.update(220, 0.100);
      param.update(660, 0.200);

      assert(closeTo(param.value, 440.000, 1e-2), "00:00.000");

      param.context.audioContext.$processTo("00:00.050");
      assert(closeTo(param.value, 440.000, 1e-2), "00:00.050");

      param.context.audioContext.$processTo("00:00.100");
      assert(closeTo(param.value, 440.000, 1e-2), "00:00.100");

      param.context.audioContext.$processTo("00:00.150");
      assert(closeTo(param.value, 311.126, 1e-2), "00:00.150");

      param.context.audioContext.$processTo("00:00.200");
      assert(closeTo(param.value, 220.000, 1e-2), "00:00.200");

      param.context.audioContext.$processTo("00:00.250");
      assert(closeTo(param.value, 381.051, 1e-2), "00:00.250");

      param.context.audioContext.$processTo("00:00.300");
      assert(closeTo(param.value, 660.000, 1e-2), "00:00.300");
    });
    it("(value, startTime): self // when curve:lin, lag:0.2", function() {
      var param = new neume.Param(context, 440, { curve: "lin", lag: 0.2 });

      param.connect(context.destination);

      param.setAt(440, 0.000);
      param.update(220, 0.100);
      param.update(660, 0.200);

      assert(closeTo(param.value, 440.000, 1e-2), "00:00.000");

      param.context.audioContext.$processTo("00:00.050");
      assert(closeTo(param.value, 440.000, 1e-2), "00:00.050");

      param.context.audioContext.$processTo("00:00.100");
      assert(closeTo(param.value, 440.000, 1e-2), "00:00.100");

      param.context.audioContext.$processTo("00:00.150");
      assert(closeTo(param.value, 385.000, 1e-2), "00:00.150");

      param.context.audioContext.$processTo("00:00.200");
      assert(closeTo(param.value, 330.000, 1e-2), "00:00.200");

      param.context.audioContext.$processTo("00:00.250");
      assert(closeTo(param.value, 412.500, 1e-2), "00:00.250");

      param.context.audioContext.$processTo("00:00.300");
      assert(closeTo(param.value, 495.000, 1e-2), "00:00.300");
    });
    it("(value, startTime, lag): self // when curve:lin", function() {
      var param = new neume.Param(context, 440, { curve: "lin" });

      param.connect(context.destination);

      param.setAt(440, 0.000);
      param.update(220, 0.100, 0.2);
      param.update(660, 0.200, 0.2);

      assert(closeTo(param.value, 440.000, 1e-2), "00:00.000");

      param.context.audioContext.$processTo("00:00.050");
      assert(closeTo(param.value, 440.000, 1e-2), "00:00.050");

      param.context.audioContext.$processTo("00:00.100");
      assert(closeTo(param.value, 440.000, 1e-2), "00:00.100");

      param.context.audioContext.$processTo("00:00.150");
      assert(closeTo(param.value, 385.000, 1e-2), "00:00.150");

      param.context.audioContext.$processTo("00:00.200");
      assert(closeTo(param.value, 330.000, 1e-2), "00:00.200");

      param.context.audioContext.$processTo("00:00.250");
      assert(closeTo(param.value, 412.500, 1e-2), "00:00.250");

      param.context.audioContext.$processTo("00:00.300");
      assert(closeTo(param.value, 495.000, 1e-2), "00:00.300");
    });
  });

  describe("#toAudioNode", function() {
    it("(): AudioNode", function() {
      var param = new neume.Param(context, 2);
      var node = param.toAudioNode();

      assert(param.toAudioNode() === param.toAudioNode());
      assert(node instanceof global.AudioNode);
      assert.deepEqual(node.toJSON(), {
        name: "GainNode",
        gain: {
          value: param.value,
          inputs: []
        },
        inputs: [ BUFSRC(128) ]
      });
      assert(node.$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("(input): AudioNode", function() {
      var input = context.createOscillator();
      var param = new neume.Param(context, 2);
      var node = param.toAudioNode(input);

      assert(param.toAudioNode() === param.toAudioNode());
      assert(node instanceof global.AudioNode);
      assert.deepEqual(node.toJSON(), {
        name: "GainNode",
        gain: {
          value: param.value,
          inputs: []
        },
        inputs: [ input.toJSON() ]
      });
    });
  });

  describe("#connect", function() {
    it("(to: any): self", function() {
      var param = new neume.Param(context, 440);

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
        inputs: [ param.toAudioNode().toJSON() ]
      });

      assert.deepEqual(to2.toJSON(), {
        name: "GainNode#to2",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ param.toAudioNode().toJSON() ]
      });

      assert.deepEqual(to3.toJSON(), {
        name: "GainNode#to3",
        gain: {
          value: param.value,
          inputs: []
        },
        inputs: []
      });

      assert.deepEqual(to4.toJSON(), {
        name: "GainNode#to4",
        gain: {
          value: param.value,
          inputs: []
        },
        inputs: []
      });

      param.value = 880;
      assert(to1.$inputs[0].gain.value === 880);
      assert(to2.$inputs[0].gain.value === 880);
      assert(to3.gain.value === 880);
      assert(to4.gain.value === 880);

      param.value = 220;
      assert(to1.$inputs[0].gain.value === 220);
      assert(to2.$inputs[0].gain.value === 220);
      assert(to3.gain.value === 220);
      assert(to4.gain.value === 220);
    });
  });

  describe("#disconnect", function() {
    it("(): self", function() {
      var nodeTo = context.createDelay();
      var param = new neume.Param(context, 0);

      param = param.connect(nodeTo);

      assert(param.disconnect(), param);
      assert.deepEqual(nodeTo.toJSON(), {
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
