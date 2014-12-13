"use strict";

var neume = require("../../src");
var pkg = require("../../package.json");
var NOP = function() {};

describe("neume", function() {
  var audioContext = null;

  beforeEach(function() {
    audioContext = new global.AudioContext();
  });

  describe("constructor", function() {
    it("(destination: AudioContext)", sinon.test(function() {
      var Neume = neume(audioContext);

      assert(typeof Neume === "function");
      assert(Neume.audioContext === audioContext);
      assert(Neume.destination === audioContext.destination);

      var stub = this.stub(neume, "SynthDef", function() {
        return { result: "ok" };
      });

      var spec = {};
      var result = new Neume(spec);

      assert.deepEqual(result, { result: "ok" });
      assert(stub.calledOnce);
      assert(stub.calledWithNew);
      assert(stub.calledWith(Neume.context, spec));
    }));
    it("(destination: AudioNode)", function() {
      var lpf = audioContext.createBiquadFilter();
      var Neume = neume(lpf);

      assert(typeof Neume === "function");
      assert(Neume.audioContext === audioContext);
      assert(Neume.destination === lpf);
    });
    it("failed", function() {
      assert.throws(function() {
        neume("INVALID");
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
  describe(".PROCESS_BUF_SIZE", function() {
    it("\\getter: number", function() {
      assert(typeof neume.PROCESS_BUF_SIZE === "number");
    });
  });

  describe("Neume", function() {
    var Neume = null;

    beforeEach(function() {
      Neume = neume(new global.AudioContext());
    });

    describe(".render", function() {
      it("(duration: number, func: function): Promise", sinon.test(function(done) {
        var OfflineAudioContext = global.OfflineAudioContext;
        var offlineContext = null;

        this.stub(global, "OfflineAudioContext", function(ch, len, sampleRate) {
          return (offlineContext = new OfflineAudioContext(ch, len, sampleRate));
        });

        var spy = sinon.spy();
        var promise = Neume.render(0.1, spy).then(function(buffer) {
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
        var spy = this.spy(Neume.context, "start");

        assert(Neume.start() === Neume);
        assert(spy.calledOnce);
      }));
    });
    describe(".stop", function() {
      it("(): self", sinon.test(function() {
        var spy = this.spy(Neume.context, "stop");

        assert(Neume.stop() === Neume);
        assert(spy.calledOnce);
      }));
    });
    describe(".reset", function() {
      it("(): self", sinon.test(function() {
        var spy = this.spy(Neume.context, "reset");

        assert(Neume.reset() === Neume);
        assert(spy.calledOnce);
      }));
    });
    describe(".analyser", function() {
      it("\\getter: AnalyserNode", function() {
        assert(Neume.analyser instanceof global.AnalyserNode);
      });
    });
    describe(".audioContext", function() {
      it("\\getter: AudioContext", function() {
        assert(Neume.audioContext instanceof global.AudioContext);
      });
    });
    describe(".context", function() {
      it("\\getter: neume.Context", function() {
        assert(Neume.context instanceof neume.Context);
      });
    });
    describe(".destination", function() {
      it("\\getter: AudioNode", function() {
        assert(Neume.destination instanceof global.AudioNode);
      });
    });
    describe(".currentTime", function() {
      it("\\getter: number", function() {
        assert(Neume.currentTime === Neume.context.currentTime);
      });
    });
    describe(".bpm", function() {
      var savedBPM;
      before(function() {
        savedBPM = Neume.bpm;
      });
      after(function() {
        Neume.bpm = savedBPM;
      });
      it("\\getter", function() {
        Neume.bpm = 240;
        assert(Neume.bpm === Neume.context.bpm);

        Neume.bpm = 120;
        assert(Neume.bpm === Neume.context.bpm);
      });
    });
    describe(".Synth", function() {
      it("(func: function ...arguments): neume.Synth", function() {
        assert(Neume.Synth(function() {}) instanceof neume.Synth);
      });
    });
    describe(".Buffer", function() {
      it("(channels: number, length: number, sampleRate: number): neume.Buffer", sinon.test(function() {
        this.spy(neume.Buffer, "create");

        assert(Neume.Buffer(2, 4096, 8192) instanceof neume.Buffer);
        assert(neume.Buffer.create.calledOnce);
        assert.deepEqual(neume.Buffer.create.firstCall.args.slice(1), [
          2, 4096, 8192
        ]);
      }));
      describe(".from", function() {
        it("(data: Array<number>|Float32Array): neume.Buffer", sinon.test(function() {
          this.spy(neume.Buffer, "from");

          assert(Neume.Buffer.from([ 1, 2, 3, 4 ]) instanceof neume.Buffer);
          assert(neume.Buffer.from.calledOnce);
          assert.deepEqual(neume.Buffer.from.firstCall.args.slice(1), [
          [ 1, 2, 3, 4 ]
          ]);
        }));
      });
      describe(".load", function() {
        it("(url: string): Promise", sinon.test(function() {
          this.spy(neume.Buffer, "load");

          assert(Neume.Buffer.load("url") instanceof Promise);
          assert(neume.Buffer.load.calledOnce);
          assert.deepEqual(neume.Buffer.load.firstCall.args.slice(1), [
          "url"
          ]);
        }));
      });
    });
    describe(".Sched", function() {
      it("(callback: function): neume.Sched", function() {
        assert(Neume.Sched(0) instanceof neume.Sched);
      });
    });
    describe(".Interval", function() {
      it("(interval: number, callback: function): neume.Interval", function() {
        assert(Neume.Interval(0, NOP) instanceof neume.Interval);
      });
    });
    describe(".Timeout", function() {
      it("(interval: number, callback: function): neume.Timeout", function() {
        assert(Neume.Timeout(0, NOP) instanceof neume.Timeout);
      });
    });
    describe(".toSeconds", function() {
      it("(value: number|string): number", function() {
        assert(Neume.toSeconds("4n") === 0.5);
      });
    });
    describe(".toFrequency", function() {
      it("(value: number|string): number", function() {
        assert(Neume.toFrequency("4n") === 2);
      });
    });
  });
});
