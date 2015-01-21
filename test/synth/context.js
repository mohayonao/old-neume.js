"use strict";

var neume = require("../../src");

describe("neume.SynthContext", function() {
  var audioContext = null;
  var neuContext = null;
  var synContext = null;

  beforeEach(function() {
    audioContext = new global.AudioContext();
    neuContext = new neume.Context(audioContext.destination);
    synContext = new neume.SynthContext(neuContext);
  });

  describe("constructor", function() {
    it("(context: neume.Context)", function() {
      assert(synContext instanceof neume.SynthContext);
    });
  });

  describe("#context", function() {
    it("\\getter: self", function() {
      assert(synContext.context === synContext);
    });
  });

  describe("#audioContext", function() {
    it("\\getter: self", function() {
      assert(synContext.audioContext === audioContext);
    });
  });

  describe("#sampleRate", function() {
    it("\\getter: self", function() {
      assert(synContext.sampleRate === audioContext.sampleRate);
    });
  });

  describe("#cureateBuffer", function() {
    it("(...arguments): AudioBuffer", function() {
      var spy = sinon.spy(synContext, "createBuffer");

      synContext.createBuffer(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createBufferSource", function() {
    it("(...arguments): AudioBufferSourceNode", function() {
      var spy = sinon.spy(synContext, "createBufferSource");

      synContext.createBufferSource(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createMediaElementSource", function() {
    it("(...arguments): MediaElementSourceNode", function() {
      var spy = sinon.spy(synContext, "createMediaElementSource");

      synContext.createMediaElementSource(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createMediaStreamSource", function() {
    it("(...arguments): MediaStreamSourceNode", function() {
      var spy = sinon.spy(synContext, "createMediaStreamSource");

      synContext.createMediaStreamSource(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createMediaStreamDestination", function() {
    it("(...arguments): MediaStreamDestinationNode", function() {
      var spy = sinon.spy(synContext, "createMediaStreamDestination");

      synContext.createMediaStreamDestination(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createScriptProcessor", function() {
    it("(...arguments): ScriptProcessorNode", function() {
      var spy = sinon.spy(synContext, "createScriptProcessor");

      synContext.createScriptProcessor(1024, 0, 1);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1024, 0, 1 ]);
    });
  });

  describe("#createAnalyser", function() {
    it("(...arguments): AnalyserNode", function() {
      var spy = sinon.spy(synContext, "createAnalyser");

      synContext.createAnalyser(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createGain", function() {
    it("(...arguments): GainNode", function() {
      var spy = sinon.spy(synContext, "createGain");

      synContext.createGain(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createDelay", function() {
    it("(...arguments): DelayNode", function() {
      var spy = sinon.spy(synContext, "createDelay");

      synContext.createDelay(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createBiquadFilter", function() {
    it("(...arguments): BiquadFilterNode", function() {
      var spy = sinon.spy(synContext, "createBiquadFilter");

      synContext.createBiquadFilter(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createWaveShaper", function() {
    it("(...arguments): WaveShaperNode", function() {
      var spy = sinon.spy(synContext, "createWaveShaper");

      synContext.createWaveShaper(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createPanner", function() {
    it("(...arguments): PannerNode", function() {
      var spy = sinon.spy(synContext, "createPanner");

      synContext.createPanner(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createConvolver", function() {
    it("(...arguments): ConvolverNode", function() {
      var spy = sinon.spy(synContext, "createConvolver");

      synContext.createConvolver(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createChannelSplitter", function() {
    it("(...arguments): ChannelSplitterNode", function() {
      var spy = sinon.spy(synContext, "createChannelSplitter");

      synContext.createChannelSplitter(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createChannelMerger", function() {
    it("(...arguments): ChannelMergerNode", function() {
      var spy = sinon.spy(synContext, "createChannelMerger");

      synContext.createChannelMerger(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createDynamicsCompressor", function() {
    it("(...arguments): DynamicsCompressorNode", function() {
      var spy = sinon.spy(synContext, "createDynamicsCompressor");

      synContext.createDynamicsCompressor(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createOscillator", function() {
    it("(...arguments): OscillatorNode", function() {
      var spy = sinon.spy(synContext, "createOscillator");

      synContext.createOscillator(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#decodeAudioData", function() {
    it("(...arguments): void", function() {
      var spy = sinon.stub(synContext, "decodeAudioData");

      synContext.decodeAudioData(1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

  describe("#createPeriodicWave", function() {
    it("(...arguments)", function() {
      var spy = sinon.spy(synContext, "createPeriodicWave");
      var imag = new Float32Array([ 1, 2, 3, 4 ]);
      var real = new Float32Array([ 5, 6, 7, 8 ]);

      synContext.createPeriodicWave(imag, real);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ imag, real ]);
    });
  });

  describe("#start", function() {
    it("(): self", sinon.test(function() {
      var spy = sinon.spy(neuContext, "start");

      assert(synContext.start() === synContext);
      assert(spy.calledOnce);
    }));
  });

  describe("#stop", function() {
    it("(): self", sinon.test(function() {
      var spy = sinon.spy(neuContext, "stop");

      assert(synContext.stop() === synContext);
      assert(spy.calledOnce);
    }));
  });

  describe("#reset", function() {
    it("(): self", sinon.test(function() {
      var spy = sinon.spy(neuContext, "reset");

      assert(synContext.reset() === synContext);
      assert(spy.calledOnce);
    }));
  });

  describe("#sched", function() {
    it("(time: timevalue, callback: function): number", function() {
      var spy = sinon.spy(neuContext, "sched");

      assert(typeof synContext.sched(1, it) === "number");
      assert(spy.calledOnce);
      assert(spy.calledWith(1, it));
    });
  });

  describe("#unsched", function() {
    it("(schedId: number): number", function() {
      var spy = sinon.spy(neuContext, "unsched");

      assert(typeof synContext.unsched(1) === "number");
      assert(spy.calledOnce);
      assert(spy.calledWith(1));
    });
  });

  describe("#nextTick", function() {
    it("(callback: function): self", function() {
      var spy = sinon.spy(neuContext, "nextTick");

      assert(synContext.nextTick(it) === synContext);
      assert(spy.calledOnce);
      assert(spy.calledWith(it));
    });
  });

  describe("#getAudioBus", function() {
    it("(index: number): AudioBus", function() {
      var spy = sinon.spy(neuContext, "getAudioBus");

      assert(synContext.getAudioBus(0) instanceof neume.AudioBus);
      assert(spy.calledOnce);
      assert(spy.calledWith(0));
    });
  });

  describe("#toSeconds", function() {
    it("(value: timevalue): number", function() {
      var spy = sinon.spy(neuContext, "toSeconds");

      assert(synContext.toSeconds("1hz") === 1);
      assert(spy.calledOnce);
      assert(spy.calledWith("1hz"));
    });
  });

});
