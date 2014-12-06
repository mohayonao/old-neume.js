"use strict";

var neume = require("../../src");
var pkg = require("../../package.json");
var NOP = function() {};

describe("neume", function() {

  describe("(destination)", function() {
    var audioContext = null;

    beforeEach(function() {
      audioContext = new global.AudioContext();
    });

    it("return Neume", sinon.test(function() {
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
    it("custom destination", function() {
      var lpf = audioContext.createBiquadFilter();
      var Neume = neume(lpf);
      assert(typeof Neume === "function");
      assert(Neume.audioContext === audioContext);
      assert(Neume.destination === lpf);
    });
    it("failed", function() {
      assert.throws(function() {
        neume.exports("NotAudioContext");
      }, TypeError);
    });
    describe(".use(fn)", function() {
      it("is a function", function() {
        assert(typeof neume.use === "function");
      });
    });
    describe(".version", function() {
      it("points to version that defined in package.json", function() {
        assert(neume.version === pkg.version);
      });
    });
    describe(".PROCESS_BUF_SIZE", function() {
      it("has", function() {
        assert(typeof neume.PROCESS_BUF_SIZE === "number");
      });
    });
    describe("invalid argument", function() {
      it("throw error", function() {
        assert.throws(function() {
          neume("INVALID");
        });
      });
    });
  });

  describe("Neume", function() {
    var Neume = null;

    before(function() {
      Neume = neume(new global.AudioContext());
    });

    describe(".render(duration, func)", function() {
      it("points to neume.render(context, duration, func)", function() {
        var spy = sinon.spy();
        var promise = Neume.render(10, spy);

        assert(promise instanceof Promise);
        assert(spy.calledOnce);
      });
    });
    describe(".analyser", function() {
      it("points to AnalyserNode", function() {
        assert(Neume.analyser instanceof global.AnalyserNode);
      });
    });
    describe(".audioContext", function() {
      it("points to AudioContext", function() {
        assert(Neume.audioContext instanceof global.AudioContext);
      });
    });
    describe(".context", function() {
      it("points to neume.Context", function() {
        assert(Neume.context instanceof neume.Context);
      });
    });
    describe(".destination", function() {
      it("points to AudioNode", function() {
        assert(Neume.destination instanceof global.AudioNode);
      });
    });
    describe(".currentTime", function() {
      it("points to audioContext.currentTime", function() {
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
      it("points to context.bpm", function() {
        Neume.bpm = 240;
        assert(Neume.bpm === Neume.context.bpm);
      });
    });
    describe(".Synth(func ...)", function() {
      it("return neume.Synth", function() {
        assert(Neume.Synth(function() {}) instanceof neume.Synth);
      });
    });
    describe(".Buffer(channels, length, sampleRate)", function() {
      it("return neume.Buffer", sinon.test(function() {
        this.spy(neume.Buffer, "create");

        assert(Neume.Buffer(2, 4096, 8192) instanceof neume.Buffer);
        assert(neume.Buffer.create.calledOnce);
        assert.deepEqual(neume.Buffer.create.firstCall.args.slice(1), [
          2, 4096, 8192
        ]);
      }));
    });
    describe(".Buffer.from(data)", function() {
      it("return neume.Buffer", sinon.test(function() {
        this.spy(neume.Buffer, "from");

        assert(Neume.Buffer.from([ 1, 2, 3, 4 ]) instanceof neume.Buffer);
        assert(neume.Buffer.from.calledOnce);
        assert.deepEqual(neume.Buffer.from.firstCall.args.slice(1), [
          [ 1, 2, 3, 4 ]
        ]);
      }));
    });
    describe(".Buffer.load(url)", function() {
      it("return Promise", sinon.test(function() {
        this.spy(neume.Buffer, "load");

        assert(Neume.Buffer.load("url") instanceof Promise);
        assert(neume.Buffer.load.calledOnce);
        assert.deepEqual(neume.Buffer.load.firstCall.args.slice(1), [
          "url"
        ]);
      }));
    });
    describe(".Sched(callback)", function() {
      it("return neume.Sched", function() {
        assert(Neume.Sched(0) instanceof neume.Sched);
      });
    });
    describe(".Interval(interval, callback)", function() {
      it("return neume.Interval", function() {
        assert(Neume.Interval(0, NOP) instanceof neume.Interval);
      });
    });
    describe(".Timeout(interval, callback)", function() {
      it("return neume.Timeout", function() {
        assert(Neume.Timeout(0, NOP) instanceof neume.Timeout);
      });
    });
    describe(".toSeconds(value)", function() {
      it("works", function() {
        assert(Neume.toSeconds("4n") === 0.5);
      });
    });
    describe(".toFrequency(value)", function() {
      it("works", function() {
        assert(Neume.toFrequency("4n") === 2);
      });
    });
  });
});
