"use strict";

var neume = require("../../src");

describe("neume.Context", function() {
  var audioContext = null;
  var context = null;

  beforeEach(function() {
    audioContext = new global.AudioContext();
    context = new neume.Context(audioContext.destination, {
      scheduleInterval: 0.05, scheduleAheadTime: 0.05
    });
  });

  describe("constructor", function() {
    it("(audioContext: AudioContext)", function() {
      assert(context instanceof neume.Context);
    });
  });

  describe("#context", function() {
    it("\\getter: self", function() {
      assert(context.context === context);
    });
  });

  describe("#audioContext", function() {
    it("\\getter: AudioContext", function() {
      assert(audioContext === audioContext);
    });
  });

  describe("#sampleRate", function() {
    it("\\getter: number", function() {
      assert(context.sampleRate === audioContext.sampleRate);
    });
  });

  describe("#currentTime", function() {
    it("\\getter: number", function() {
      assert(typeof context.currentTime === "number");
    });
  });

  describe("#bpm", function() {
    it("\\getter: number", function() {
      assert(typeof context.bpm === "number");
    });
    it("\\setter: number", function() {
      context.bpm = 200;
      assert(context.bpm === 200);

      context.bpm = 300;
      assert(context.bpm === 300);
    });
  });

  describe("#destination", function() {
    it("\\getter: AudioDestinationNode", function() {
      assert(context.destination === audioContext.destination);
    });
  });

  describe("#listener", function() {
    it("\\getter: AudioListenerNode", function() {
      assert(context.listener === audioContext.listener);
    });
  });

  describe("#cureateBuffer", function() {
    it("(...arguments): AudioBuffer", function() {
      var spy = sinon.spy(context, "createBuffer");

      context.createBuffer(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createBufferSource", function() {
    it("(...arguments): AudioBufferSourceNode", function() {
      var spy = sinon.spy(context, "createBufferSource");

      context.createBufferSource(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createMediaElementSource", function() {
    it("(...arguments): MediaElementSourceNode", function() {
      var spy = sinon.spy(context, "createMediaElementSource");

      context.createMediaElementSource(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createMediaStreamSource", function() {
    it("(...arguments): MediaStreamSourceNode", function() {
      var spy = sinon.spy(context, "createMediaStreamSource");

      context.createMediaStreamSource(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createMediaStreamDestination", function() {
    it("(...arguments): MediaStreamDestinationNode", function() {
      var spy = sinon.spy(context, "createMediaStreamDestination");

      context.createMediaStreamDestination(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createScriptProcessor", function() {
    it("(...arguments): ScriptProcessorNode", function() {
      var spy = sinon.spy(context, "createScriptProcessor");

      context.createScriptProcessor(1024, 0, 1);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1024, 0, 1 ]);
    });
  });

  describe("#createAnalyser", function() {
    it("(...arguments): AnalyserNode", function() {
      var spy = sinon.spy(context, "createAnalyser");

      context.createAnalyser(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createGain", function() {
    it("(...arguments): GainNode", function() {
      var spy = sinon.spy(context, "createGain");

      context.createGain(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createDelay", function() {
    it("(...arguments): DelayNode", function() {
      var spy = sinon.spy(context, "createDelay");

      context.createDelay(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createBiquadFilter", function() {
    it("(...arguments): BiquadFilterNode", function() {
      var spy = sinon.spy(context, "createBiquadFilter");

      context.createBiquadFilter(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createWaveShaper", function() {
    it("(...arguments): WaveShaperNode", function() {
      var spy = sinon.spy(context, "createWaveShaper");

      context.createWaveShaper(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createPanner", function() {
    it("(...arguments): PannerNode", function() {
      var spy = sinon.spy(context, "createPanner");

      context.createPanner(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createConvolver", function() {
    it("(...arguments): ConvolverNode", function() {
      var spy = sinon.spy(context, "createConvolver");

      context.createConvolver(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createChannelSplitter", function() {
    it("(...arguments): ChannelSplitterNode", function() {
      var spy = sinon.spy(context, "createChannelSplitter");

      context.createChannelSplitter(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createChannelMerger", function() {
    it("(...arguments): ChannelMergerNode", function() {
      var spy = sinon.spy(context, "createChannelMerger");

      context.createChannelMerger(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createDynamicsCompressor", function() {
    it("(...arguments): DynamicsCompressorNode", function() {
      var spy = sinon.spy(context, "createDynamicsCompressor");

      context.createDynamicsCompressor(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createOscillator", function() {
    it("(...arguments): OscillatorNode", function() {
      var spy = sinon.spy(context, "createOscillator");

      context.createOscillator(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#decodeAudioData", function() {
    it("(...arguments): void", function() {
      var spy = sinon.stub(context, "decodeAudioData");

      context.decodeAudioData(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createPeriodicWave", function() {
    it("(...arguments)", function() {
      var spy = sinon.spy(context, "createPeriodicWave");
      var imag = new Float32Array([ 1, 2, 3, 4 ]);
      var real = new Float32Array([ 5, 6, 7, 8 ]);

      context.createPeriodicWave(imag, real);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ imag, real ]);
    });
  });

  describe("#getAudioBus", function() {
    it("(index: number): neume.AudioBus", function() {
      assert(context.getAudioBus(0) instanceof neume.AudioBus);
      assert(context.getAudioBus(0) !== context.getAudioBus(1));
      assert(context.getAudioBus(1) === context.getAudioBus(1));
    });
  });

  describe("#start", function() {
    it("(): self", function() {
      useTimer(context, function() {
        assert(context.start() === context);
        assert(context.start() === context);
      });
    });
  });

  describe("#stop", function() {
    it("(): self", function() {
      useTimer(context, function() {
        assert(context.start() === context);
        assert(context.stop() === context);
        assert(context.stop() === context);
      });
    });
  });

  describe("#reset", function() {
    it("(): self", function() {
      useTimer(context, function() {
        assert(context.start() === context);
        assert(context.reset() === context);
        assert(context.reset() === context);
      });
    });
  });

  describe("#dispose", function() {
    it("(): self", function() {
      var osc = context.createOscillator();
      var amp = context.createGain();

      context.connect(osc, amp);

      assert.deepEqual(amp.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ OSCILLATOR("sine", 440) ]
      });

      assert(context.dispose() === context);

      assert.deepEqual(amp.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: []
      });
    });
  });

  describe("#sched", function() {
    it("(time: number, callback: !function, context: any): 0", function() {
      assert(context.sched(10, "INVALID") === 0);
    });
    it("(time: number, callback: function, context: any): number // works", function() {
      var passed = [];

      var pass = function(i) {
        return function(e) {
          passed.push([ i, e ]);
        };
      };

      useTimer(context, function(tick) {
        context.start();

        context.sched(0.100, pass(1));
        context.sched(0.500, pass(5));
        context.sched(0.200, pass(2));
        context.sched(0.400, pass(4));
        context.sched(0.300, pass(3));

        assert(passed.length === 0, "00:00.000");

        tick(100);
        assert.deepEqual(passed[0], [ 1, 0.1 ], "00:00.100");

        tick(100);
        assert.deepEqual(passed[1], [ 2, 0.2 ], "00:00.200");

        tick(350);
        assert.deepEqual(passed, [
          [ 1, 0.1 ],
          [ 2, 0.2 ],
          [ 3, 0.3 ],
          [ 4, 0.4 ],
          [ 5, 0.5 ],
        ], "00:00.550");
      });
    });
    it("same time order", function() {
      var passed = [];

      var pass = function(i) {
        return function(e) {
          passed.push([ i, e ]);
        };
      };

      useTimer(context, function(tick) {
        context.start();

        context.sched(0.100, pass(1));
        context.sched(0.100, pass(2));
        context.sched(0.100, pass(3));
        context.sched(0.100, pass(4));
        context.sched(0.100, pass(5));

        assert(passed.length === 0, "00:00.000");

        tick(100);
        assert.deepEqual(passed, [
          [ 1, 0.1 ],
          [ 2, 0.1 ],
          [ 3, 0.1 ],
          [ 4, 0.1 ],
          [ 5, 0.1 ],
        ], "00:00.100");
      });
    });
  });

  describe("#unsched", function() {
    it("(id: !number): 0", function() {
      assert(context.unsched("INVALID") === 0);
    });
    it("(id: number): number", function() {
      var passed = [];
      var schedIds = [];

      var pass = function(i) {
        return function(e) {
          passed.push([ i, e ]);
        };
      };

      useTimer(context, function(tick) {
        context.start();

        schedIds[1] = context.sched(0.100, pass(1));
        schedIds[5] = context.sched(0.500, pass(5));
        schedIds[2] = context.sched(0.200, pass(2));
        schedIds[4] = context.sched(0.400, pass(4));
        schedIds[3] = context.sched(0.300, pass(3));

        context.unsched(schedIds[2]);

        assert(passed.length === 0, "00:00.000");

        tick(100);
        assert.deepEqual(passed[0], [ 1, 0.1 ], "00:00.100");

        tick(100);
        assert.deepEqual(passed[1], undefined, "00:00.200");

        tick(350);
        assert.deepEqual(passed, [
          [ 1, 0.1 ],
          [ 3, 0.3 ],
          [ 4, 0.4 ],
          [ 5, 0.5 ],
        ], "00:00.550");
      });
    });
  });

  describe("#nextTick", function() {
    it("(callback: function, context: any): self", function() {
      var passed = 0;

      useTimer(context, function(tick) {
        context.start();

        context.nextTick(function() {
          passed = 1;
        });

        assert(passed === 0);

        tick(100);
        assert(passed === 1);
      });
    });
  });

  describe("#toAudioNode", function() {
    it("(): AudioNode", function() {
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
        inputs: [ BUFSRC(128) ]
      });
      assert(node.$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("null", function() {
      var node = {};
      assert(context.toAudioNode(node) === null);
    });
  });

  describe("#toAudioBuffer", function() {
    it("(): AudioBuffer", function() {
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

  describe("#connect", function() {
    it("(from: any, to: any)", function() {
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
          inputs: [ OSCILLATOR("sine", 440) ]
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
            inputs: [ BUFSRC(128) ]
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
        inputs: [ OSCILLATOR("sine", 440) ]
      });
    });
    it("Array<AudioNode> -> AudioNode", function() {
      var node1 = context.createOscillator();
      var node2 = context.createBufferSource();
      var toNode = context.createGain();

      context.connect([ node1, node2 ], toNode);

      assert.deepEqual(toNode.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: [],
        },
        inputs: [ node1.toJSON(), node2.toJSON() ]
      });
    });
    it("[] -> AudioNode", function() {
      var toNode = context.createGain();

      context.connect([], toNode);

      assert.deepEqual(toNode.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: [],
        },
        inputs: []
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
    it("onconnected", function() {
      var from = context.createDelay();
      var to = { onconnected: sinon.spy() };

      context.connect(from, to);

      assert(to.onconnected.callCount === 1);
      assert(to.onconnected.calledWith(from));
    });
  });

  describe("#disconnect", function() {
    it("(node: any): self", function() {
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
    it("(node: Array<any>): self", function() {
      var osc = context.createOscillator();
      var amp = context.createGain();

      context.connect(osc, amp.gain);

      context.disconnect([ osc ]);

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

  describe("#toSeconds", function() {
    it("(): number", function() {
      assert(context.toSeconds("2hz") === 0.5);
    });
  });

  describe("offline rendering", function() {
    it("works", function() {
      var audioContext = new global.OfflineAudioContext(2, 44100 * 0.5, 44100);
      var context = new neume.Context(audioContext.destination, { duration: 2 });
      var passed = [ ];

      var pass = function(i) {
        return function() {
          passed.push(i);
        };
      };

      context.sched(0.100, pass(1));
      context.sched(0.500, pass(5));
      context.sched(0.200, pass(2));
      context.sched(0.400, pass(4));
      context.sched(0.300, pass(3));
      context.start();

      assert.deepEqual(passed, [ 1, 2, 3, 4, 5 ]);
    });
  });

});
