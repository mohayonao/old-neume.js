"use strict";

var neume = require("../../src");

var NeuContext = neume.Context;

describe("NeuContext", function() {
  var audioContext = null;
  var context = null;

  beforeEach(function() {
    audioContext = new window.AudioContext();
    context = new NeuContext(audioContext.destination);
  });

  describe("(audioContext)", function() {
    it("returns an instance of NeuContext", function() {
      assert(context instanceof NeuContext);
    });
  });

  describe("#sampleRate", function() {
    it("points to AudioContext#sampleRate", function() {
      assert(context.sampleRate === audioContext.sampleRate);
    });
  });

  describe("#currentTime", function() {
    it("points to AudioContext#currentTime", function() {
      assert(typeof context.currentTime === "number");
    });
  });

  describe("#bpm", function() {
    it("points to NeuTransport#bpm", function() {
      assert(typeof context.bpm === "number");

      context.bpm = 200;
      assert(context.bpm === 200);
    });
  });

  describe("#destination", function() {
    it("points to AudioContext#destination", function() {
      assert(context.destination === audioContext.destination);
    });
  });

  describe("#listener", function() {
    it("points to AudioContext#listener", function() {
      assert(context.listener === audioContext.listener);
    });
  });

  describe("#cureateBuffer()", function() {
    it("call AudioContext#createBuffer()", function() {
      var spy = sinon.spy(context, "createBuffer");

      context.createBuffer(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createBufferSource()", function() {
    it("call AudioContext#createBufferSource()", function() {
      var spy = sinon.spy(context, "createBufferSource");

      context.createBufferSource(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createMediaElementSource()", function() {
    it("call AudioContext#createMediaElementSource()", function() {
      var spy = sinon.spy(context, "createMediaElementSource");

      context.createMediaElementSource(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createMediaStreamSource()", function() {
    it("call AudioContext#createMediaStreamSource()", function() {
      var spy = sinon.spy(context, "createMediaStreamSource");

      context.createMediaStreamSource(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createMediaStreamDestination()", function() {
    it("call AudioContext#createMediaStreamDestination()", function() {
      var spy = sinon.spy(context, "createMediaStreamDestination");

      context.createMediaStreamDestination(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createScriptProcessor()", function() {
    it("call AudioContext#createScriptProcessor()", function() {
      var spy = sinon.spy(context, "createScriptProcessor");

      context.createScriptProcessor(1024, 0, 1);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1024, 0, 1 ]);
    });
  });

  describe("#createAnalyser()", function() {
    it("call AudioContext#createAnalyser()", function() {
      var spy = sinon.spy(context, "createAnalyser");

      context.createAnalyser(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createGain()", function() {
    it("call AudioContext#createGain()", function() {
      var spy = sinon.spy(context, "createGain");

      context.createGain(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createDelay()", function() {
    it("call AudioContext#createDelay()", function() {
      var spy = sinon.spy(context, "createDelay");

      context.createDelay(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createBiquadFilter()", function() {
    it("call AudioContext#createBiquadFilter()", function() {
      var spy = sinon.spy(context, "createBiquadFilter");

      context.createBiquadFilter(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createWaveShaper()", function() {
    it("call AudioContext#createWaveShaper()", function() {
      var spy = sinon.spy(context, "createWaveShaper");

      context.createWaveShaper(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createPanner()", function() {
    it("call AudioContext#createPanner()", function() {
      var spy = sinon.spy(context, "createPanner");

      context.createPanner(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createConvolver()", function() {
    it("call AudioContext#createConvolver()", function() {
      var spy = sinon.spy(context, "createConvolver");

      context.createConvolver(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createChannelSplitter()", function() {
    it("call AudioContext#createChannelSplitter()", function() {
      var spy = sinon.spy(context, "createChannelSplitter");

      context.createChannelSplitter(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createChannelMerger()", function() {
    it("call AudioContext#createChannelMerger()", function() {
      var spy = sinon.spy(context, "createChannelMerger");

      context.createChannelMerger(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createDynamicsCompressor()", function() {
    it("call AudioContext#createDynamicsCompressor()", function() {
      var spy = sinon.spy(context, "createDynamicsCompressor");

      context.createDynamicsCompressor(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createOscillator()", function() {
    it("call AudioContext#createOscillator()", function() {
      var spy = sinon.spy(context, "createOscillator");

      context.createOscillator(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createPeriodicWave()", function() {
    it("call AudioContext#createPeriodicWave()", function() {
      var spy = sinon.stub(context, "createPeriodicWave");

      context.createPeriodicWave(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#decodeAudioData()", function() {
    it("call AudioContext#decodeAudioData()", function() {
      var spy = sinon.stub(context, "decodeAudioData");

      context.decodeAudioData(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createPeriodicWave()", function() {
    it("call AudioContext#createPeriodicWave()", function() {
      var spy = sinon.spy(context, "createPeriodicWave");
      var imag = new Float32Array([ 1, 2, 3, 4 ]);
      var real = new Float32Array([ 5, 6, 7, 8 ]);

      context.createPeriodicWave(imag, real);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ imag, real ]);
    });
  });

  describe("#createComponent(node)", function() {
    it("returns a NeuComponent", function() {
      assert(context.createComponent({}) instanceof neume.Component);
    });
  });

  describe("#createDC(value)", function() {
    it("returns a NeuDC", function() {
      assert(context.createDC(0) instanceof neume.DC);
    });
  });

  describe("#createMul(a, b)", function() {
    it("returns a NeuMul", function() {
      assert(context.createMul({}, {}) instanceof neume.Mul);
    });
  });

  describe("#createAdd(a, b)", function() {
    it("returns a NeuAdd", function() {
      assert(context.createAdd({}, {}) instanceof neume.Add);
    });
  });

  describe("#createSum(inputs)", function() {
    it("returns a NeuSum", function() {
      assert(context.createSum({}) instanceof neume.Sum);
      assert(context.createSum([]) instanceof neume.Sum);
    });
  });

  describe("#createParam(inputs)", function() {
    it("returns a NeuParam", function() {
      assert(context.createParam(0) instanceof neume.Param);
    });
  });

  describe.skip("#createDeyWet(inputs, node, mix)", function() {
    it("returns a NeuDryWet", function() {
    });
  });

  describe("#getMasterGain()", function() {
    it("returns a GainNode", function() {
      assert(context.getMasterGain() instanceof window.GainNode);
      assert(context.getMasterGain() === context.getMasterGain());
    });
  });

  describe("#getAnalyser()", function() {
    it("returns an AnalyserNode", function() {
      assert(context.getAnalyser() instanceof window.AnalyserNode);
      assert(context.getAnalyser() === context.getAnalyser());
    });
  });

  describe("#reset()", function() {
    it("returns self", function() {
      assert(context.reset() === context);
      assert(context.reset() === context);
    });
  });

  describe("#start()", function() {
    it("returns self", function() {
      assert(context.start() === context);
      assert(context.start() === context);
    });
  });

  describe("#stop()", function() {
    it("returns self", function() {
      assert(context.stop() === context);
      assert(context.stop() === context);
    });
  });

  describe("#sched(time, callback, ctx)", function() {
    it("do nothing if given an invalid callback", function() {
      assert(context.sched(10, "INVALID") === 0);
    });
    it("append the callback and order by specified time", function() {
      var passed = 0;

      context.start();
      context.sched(0.100, function() { passed = 1; });
      context.sched(0.500, function() { passed = 5; });
      context.sched(0.200, function() { passed = 2; });
      context.sched(0.400, function() { passed = 4; });
      context.sched(0.300, function() { passed = 3; });

      assert(passed === 0, "00:00.000");

      audioContext.$processTo("00:00.100");
      assert(passed === 1, "00:00.100");

      audioContext.$processTo("00:00.200");
      assert(passed === 2, "00:00.200");

      audioContext.$processTo("00:00.310");
      assert(passed === 3, "00:00.310");

      audioContext.$processTo("00:00.400");
      assert(passed === 4, "00:00.400");

      audioContext.$processTo("00:00.500");
      assert(passed === 5, "00:00.500");
    });
    it("same time order", function() {
      var passed = [];

      context.start();
      context.sched(0.100, function() { passed.push(1); });
      context.sched(0.100, function() { passed.push(2); });
      context.sched(0.100, function() { passed.push(3); });
      context.sched(0.100, function() { passed.push(4); });
      context.sched(0.100, function() { passed.push(5); });

      assert.deepEqual(passed, [], "00:00.000");

      audioContext.$processTo("00:00.100");
      assert.deepEqual(passed, [ 1, 2, 3, 4, 5 ], "00:00.100");
    });
  });

  describe("#unsched(id)", function() {
    it("do nothing if given an invalid id", function() {
      assert(context.unsched("INVALID") === 0);
    });
    it("append the callback and order by specified time", function() {
      var passed = 0;
      var schedIds = [];

      context.start();
      schedIds[1] = context.sched(0.100, function() { passed = 1; });
      schedIds[5] = context.sched(0.500, function() { passed = 5; });
      schedIds[2] = context.sched(0.200, function() { passed = 2; });
      schedIds[4] = context.sched(0.400, function() { passed = 4; });
      schedIds[3] = context.sched(0.300, function() { passed = 3; });

      context.unsched(schedIds[2]);

      assert(passed === 0, "00:00.000");

      audioContext.$processTo("00:00.100");
      assert(passed === 1, "00:00.100");

      audioContext.$processTo("00:00.200");
      assert(passed === 1, "00:00.200"); // removed callback

      audioContext.$processTo("00:00.310");
      assert(passed === 3, "00:00.310");

      audioContext.$processTo("00:00.400");
      assert(passed === 4, "00:00.400");

      audioContext.$processTo("00:00.500");
      assert(passed === 5, "00:00.500");
    });
  });

  describe("#nextTick(callback, ctx)", function() {
    it("append the callback that executed next tick", function() {
      var passed = 0;

      context.start();

      context.nextTick(function() { passed = 1; });

      assert(passed === 0);

      audioContext.$process(1024 / audioContext.sampleRate);
      assert(passed === 1);
    });
  });

  describe("#toAudioNode()", function() {
    it("calls toAudioNode() if exists", function() {
      var gain = context.createGain();
      var node = {
        toAudioNode: function() {
          return gain;
        }
      };
      assert(context.toAudioNode(node) === gain);
    });
    it("returns a given AudioNode when given an AudioNode", function() {
      var gain = context.createGain();
      assert(context.toAudioNode(gain) === gain);
    });
    it("returns a DC when given a number", function() {
      var node = context.toAudioNode(100);
      assert.deepEqual(node.toJSON(), {
        name: "GainNode",
        gain: {
          value: 100,
          inputs: []
        },
        inputs: [ DC(1) ]
      });
      assert(node.$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("null", function() {
      var node = {};
      assert(context.toAudioNode(node) === null);
    });
  });

  describe("#toAudioBuffer()", function() {
    it("calls toAudioBuffer() if exists", function() {
      var buf = context.createBuffer(1, 128, 44100);
      var node = {
        toAudioBuffer: function() {
          return buf;
        }
      };
      assert(context.toAudioBuffer(node) === buf);
    });
    it("returns a given AudioBuffer when given an AudioBuffer", function() {
      var buf = context.createBuffer(1, 128, 44100);
      assert(context.toAudioBuffer(buf) === buf);
    });
    it("null", function() {
      var node = {};
      assert(context.toAudioBuffer(node) === null);
    });
  });

  describe("#connect(from, to)", function() {
    it("apply from.connect(to)", function() {
      var osc = new neume.Component(context);
      var amp = context.createGain();

      sinon.stub(osc, "connect");

      context.connect(osc, amp);

      assert(osc.connect.calledOnce);
      assert.deepEqual(osc.connect.firstCall.args, [ amp ]);
    });
    it("number -> AudioParam", function() {
      var node = context.createGain();

      context.connect(100, node.gain);

      assert.deepEqual(node.toJSON(), {
        name: "GainNode",
        gain: {
          value: 100,
          inputs: []
        },
        inputs: []
      });
    });
    it("AudioNode -> AudioParam", function() {
      var node = context.createGain();

      context.connect(context.createOscillator(), node.gain);

      assert.deepEqual(node.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: [
            {
              name: "OscillatorNode",
              type: "sine",
              frequency: {
                value: 440,
                inputs: []
              },
              detune: {
                value: 0,
                inputs: []
              },
              inputs: []
            }
          ]
        },
        inputs: []
      });
    });
    it("invalid -> AudioParam", function() {
      var node = context.createGain();

      context.connect({}, node.gain);

      assert.deepEqual(node.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: []
      });
    });
    it("number -> AudioNode", function() {
      var node = context.createDelay();

      context.connect(100, node);

      assert.deepEqual(node.toJSON(), {
        name: "DelayNode",
        delayTime: {
          value: 0,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 100,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
      assert(node.$inputs[0].$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("AudioNode -> AudioNode", function() {
      var node = context.createDelay();

      context.connect(context.createOscillator(), node);

      assert.deepEqual(node.toJSON(), {
        name: "DelayNode",
        delayTime: {
          value: 0,
          inputs: []
        },
        inputs: [
          {
            name: "OscillatorNode",
            type: "sine",
            frequency: {
              value: 440,
              inputs: []
            },
            detune: {
              value: 0,
              inputs: []
            },
            inputs: []
          }
        ]
      });
    });
    it("invalid -> AudioNode", function() {
      var node = context.createDelay();

      context.connect({}, node);

      assert.deepEqual(node.toJSON(), {
        name: "DelayNode",
        delayTime: {
          value: 0,
          inputs: []
        },
        inputs: []
      });
    });
    it("invalid -> invalid", function() {
      assert.doesNotThrow(function() {
        context.connect({}, {});
        context.connect(null, {});
        context.connect({}, null);
        context.connect(null, null);
      });
    });
  });

  describe("#disconnect(from)", function() {
    it("disconnect nodes", function() {
      var osc = context.createOscillator();
      var amp = context.createGain();

      context.connect(osc, amp.gain);

      context.disconnect(osc);

      assert.deepEqual(amp.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: []
      });
    });
    it("invalid", function() {
      assert.doesNotThrow(function() {
        context.disconnect({});
        context.disconnect(null);
      });
    });
  });

  describe("#getBpm()", function() {
    it("works", function() {
      assert(context.getBpm() === 120);
    });
  });

  describe("#setBpm(value, rampTime)", function() {
    it("works", function() {
      assert(context.setBpm(200, 0) === context);
      assert(context.getBpm() === 200);
    });
  });

  describe("#toSeconds()", function() {
    it("works", function() {
      assert(context.toSeconds("2hz") === 0.5);
    });
  });

  describe("#toFrequency()", function() {
    it("works", function() {
      assert(context.toFrequency("500ms") === 2);
    });
  });

  describe("offline-rendering", function() {
    it("works", function() {
      var audioContext = new window.OfflineAudioContext(2, 44100 * 0.5, 44100);
      var context = new NeuContext(audioContext.destination, 2);
      var passed = [ ];

      context.sched(0.100, function() { passed.push(1); });
      context.sched(0.500, function() { passed.push(5); });
      context.sched(0.200, function() { passed.push(2); });
      context.sched(0.400, function() { passed.push(4); });
      context.sched(0.300, function() { passed.push(3); });
      context.start();

      assert.deepEqual(passed, [ 1, 2, 3, 4, 5 ]);
    });
  });

});
