"use strict";

var neume = require("../../src");
var pkg = require("../../package.json");

describe("neume", function() {
  var audioContext = null;

  beforeEach(function() {
    audioContext = new global.AudioContext();
  });

  describe("constructor", function() {
    it("()", function() {
      var neu = neume();

      assert(typeof neu === "object");
      assert(neu.audioContext instanceof global.AudioContext);
    });
    it("({ context: AudioContext })", sinon.test(function() {
      var neu = neume({ context: audioContext });

      assert(typeof neu === "object");
      assert(neu.audioContext === audioContext);
      assert(neu.destination === audioContext.destination);
    }));
    it("({ destination: AudioContext })", sinon.test(function() {
      var neu = neume({ destination: audioContext });

      assert(typeof neu === "object");
      assert(neu.audioContext === audioContext);
      assert(neu.destination === audioContext.destination);
    }));
    it("({ destination: AudioNode })", function() {
      var lpf = audioContext.createBiquadFilter();
      var neu = neume({ destination: lpf });

      assert(typeof neu === "object");
      assert(neu.audioContext === audioContext);
      assert(neu.destination === lpf);
    });
    it("failed", function() {
      assert.throws(function() {
        neume({ destination: "INVALID" });
      });
    });
  });
  describe(".use", function() {
    it("(fn: function): neume", function() {
      assert(typeof neume.use === "function");
    });
  });
  describe(".version", function() {
    it("\\getter: number", function() {
      assert(neume.version === pkg.version);
    });
  });

  describe("neu", function() {
    var neu = null;

    beforeEach(function() {
      neu = neume({ context: new global.AudioContext() });
    });

    describe(".render", function() {
      it("(duration: number, func: function): Promise", sinon.test(function(done) {
        var OfflineAudioContext = global.OfflineAudioContext;
        var offlineContext = null;

        this.stub(global, "OfflineAudioContext", function(ch, len, sampleRate) {
          return (offlineContext = new OfflineAudioContext(ch, len, sampleRate));
        });

        var spy = sinon.spy();
        var promise = neu.render(0.1, spy).then(function(buffer) {
          assert(buffer instanceof neume.Buffer);
          done();
        });

        offlineContext.$processTo("00:00.125");

        assert(promise instanceof Promise);
        assert(spy.calledOnce);
      }));
    });
    describe(".start", function() {
      it("(): self", sinon.test(function() {
        var spy = this.spy(neu.context, "start");

        assert(neu.start() === neu);
        assert(spy.calledOnce);
      }));
    });
    describe(".stop", function() {
      it("(): self", sinon.test(function() {
        var spy = this.spy(neu.context, "stop");

        assert(neu.stop() === neu);
        assert(spy.calledOnce);
      }));
    });
    describe(".reset", function() {
      it("(): self", sinon.test(function() {
        var spy = this.spy(neu.context, "reset");

        assert(neu.reset() === neu);
        assert(spy.calledOnce);
      }));
    });
    describe(".master", function() {
      it("\\getter: GainNode", function() {
        assert(neu.master instanceof global.GainNode);
      });
    });
    describe(".analyser", function() {
      it("\\getter: AnalyserNode", function() {
        assert(neu.analyser instanceof global.AnalyserNode);
      });
    });
    describe(".audioContext", function() {
      it("\\getter: AudioContext", function() {
        assert(neu.audioContext instanceof global.AudioContext);
      });
    });
    describe(".context", function() {
      it("\\getter: neume.Context", function() {
        assert(neu.context instanceof neume.Context);
      });
    });
    describe(".destination", function() {
      it("\\getter: AudioNode", function() {
        assert(neu.destination instanceof global.AudioNode);
      });
    });
    describe(".currentTime", function() {
      it("\\getter: number", function() {
        assert(neu.currentTime === neu.context.currentTime);
      });
    });
    describe(".bpm", function() {
      var savedBPM;
      before(function() {
        savedBPM = neu.bpm;
      });
      after(function() {
        neu.bpm = savedBPM;
      });
      it("\\getter", function() {
        neu.bpm = 240;
        assert(neu.bpm === neu.context.bpm);

        neu.bpm = 120;
        assert(neu.bpm === neu.context.bpm);
      });
    });
    describe(".Synth", function() {
      it("(func: function ...arguments): neume.Synth", function() {
        assert(neu.Synth(function() {}) instanceof neume.Synth);
      });
    });
    describe(".Buffer", function() {
      it("(channels: number, length: number, sampleRate: number): neume.Buffer", sinon.test(function() {
        this.spy(neume.Buffer, "create");

        assert(neu.Buffer(2, 4096, 8192) instanceof neume.Buffer);
        assert(neume.Buffer.create.calledOnce);
        assert.deepEqual(neume.Buffer.create.firstCall.args.slice(1), [
          2, 4096, 8192
        ]);
      }));
      describe(".from", function() {
        it("(data: Array<number>|Float32Array): neume.Buffer", sinon.test(function() {
          this.spy(neume.Buffer, "from");

          assert(neu.Buffer.from([ 1, 2, 3, 4 ]) instanceof neume.Buffer);
          assert(neume.Buffer.from.calledOnce);
          assert.deepEqual(neume.Buffer.from.firstCall.args.slice(1), [
          [ 1, 2, 3, 4 ]
          ]);
        }));
      });
      describe(".load", function() {
        it("(url: string): Promise", sinon.test(function() {
          this.spy(neume.Buffer, "load");

          assert(neu.Buffer.load("url") instanceof Promise);
          assert(neume.Buffer.load.calledOnce);
          assert.deepEqual(neume.Buffer.load.firstCall.args.slice(1), [
          "url"
          ]);
        }));
      });
    });
    describe(".Sched", function() {
      it("(callback: function): neume.Sched", function() {
        assert(neu.Sched(0) instanceof neume.Sched);
      });
    });
    describe(".Interval", function() {
      it("(interval: number, callback: function): neume.Interval", function() {
        assert(neu.Interval(0, NOP) instanceof neume.Interval);
      });
    });
    describe(".Timeout", function() {
      it("(interval: number, callback: function): neume.Timeout", function() {
        assert(neu.Timeout(0, NOP) instanceof neume.Timeout);
      });
    });
    describe(".toSeconds", function() {
      it("(value: number|string): number", function() {
        assert(neu.toSeconds("4n") === 0.5);
      });
    });
  });
});
