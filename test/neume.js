"use strict";

var neume = require("../src/neume");
var NeuBuffer   = require("../src/buffer");
var NeuInterval = require("../src/interval");

var NOP = function() {};

describe("Neume", function() {
  var Neume = neume.Neume;
  describe(".use(fn)", function() {
    it("points to neume.use(fn)", function() {
      assert(Neume.use === neume.use);
    });
  });
  describe(".render(duration, func)", function() {
    it("points to neume.render(context, duration, func)", function() {
      var spy = sinon.spy();
      var promise = Neume.render(10, spy);

      assert(promise instanceof window.Promise);
      assert(spy.calledOnce);
    });
  });
  describe(".master", function() {
    it("points to GainNode", function() {
      assert(Neume.master instanceof window.GainNode);
    });
  });
  describe(".analyser", function() {
    it("points to AnalyserNode", function() {
      assert(Neume.analyser instanceof window.AnalyserNode);
    });
  });
  describe(".context", function() {
    it("points to AudioContext", function() {
      assert(Neume.context instanceof window.AudioContext);
    });
  });
  describe(".outlet", function() {
    it("points to AudioNode", function() {
      assert(Neume.outlet instanceof window.AudioNode);
    });
  });
  describe(".currentTime", function() {
    it("points to audioContext.currentTime", function() {
      assert(Neume.currentTime === Neume.context.currentTime);
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

      assert(Neume.Buffer.load("url") instanceof window.Promise);
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
});
