"use strict";

var neume = require("../../src");
var pkg = require("../../package.json");

var NeuContext = neume.Context;
var NeuSynth = neume.Synth;
var NeuBuffer = neume.Buffer;
var NeuInterval = neume.Interval;
var NeuTimeout = neume.Timeout;
var NOP = function() {};

describe("neume", function() {

  describe("(destination)", function() {
    var audioContext = null;

    beforeEach(function() {
      audioContext = new global.AudioContext();
    });

    it("return Neume", function() {
      var Neume = neume(audioContext);
      assert(typeof Neume === "function");
      assert(Neume.audioContext === audioContext);
      assert(Neume.destination === audioContext.destination);
    });
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
      it("points to NeuContext", function() {
        assert(Neume.context instanceof NeuContext);
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
    describe(".Synth(func ...)", function() {
      it("return NeuSynth", function() {
        assert(Neume.Synth(function() {}) instanceof NeuSynth);
      });
    });
    describe(".Buffer(channels, length, sampleRate)", function() {
      it("return NeuBuffer", sinon.test(function() {
        this.spy(neume.Buffer, "create");

        assert(Neume.Buffer(2, 4096, 8192) instanceof NeuBuffer);
        assert(neume.Buffer.create.calledOnce);
        assert.deepEqual(neume.Buffer.create.firstCall.args.slice(1), [
          2, 4096, 8192
        ]);
      }));
    });
    describe(".Buffer.from(data)", function() {
      it("return NeuBuffer", sinon.test(function() {
        this.spy(neume.Buffer, "from");

        assert(Neume.Buffer.from([ 1, 2, 3, 4 ]) instanceof NeuBuffer);
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
    describe(".Interval(interval, callback)", function() {
      it("return NeuInterval", function() {
        assert(Neume.Interval(0, NOP) instanceof NeuInterval);
      });
    });
    describe(".Timeout(interval, callback)", function() {
      it("return NeuTimeout", function() {
        assert(Neume.Timeout(0, NOP) instanceof NeuTimeout);
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
