"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));

var NOP = function() {};

describe("neume.SynthDollar", function() {
  var audioContext = null;
  var context = null;

  beforeEach(function() {
    audioContext = new global.AudioContext();
    context = new neume.Context(audioContext.destination);
  });

  describe("$", function() {
    it("works", sinon.test(function() {
      var spy = this.spy(neume.UGen, "build");

      var synth = new neume.Synth(context, function($) {
        return $("sin", { freq: 880 }, 1, 2, 3);
      }, []);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [
        synth, "sin", { freq: 880 }, [ 1, 2, 3 ]
      ]);
    }));
    it("works", sinon.test(function() {
      var spy = this.spy(neume.UGen, "build");

      var synth = new neume.Synth(context, function($) {
        return $(10);
      }, []);

      assert(spy.calledOnce === true);
    }));
    describe("@params", function() {
      it("works", function() {
        var params = {};

        var synth = new neume.Synth(context, function($) {
          params.freq = $("@freq", 440);
          params.amp1 = $("@amp", 0.25);
          params.amp2 = $("@amp");
        }, []);

        assert(synth.freq instanceof neume.Param);
        assert(synth.amp  instanceof neume.Param);
        assert(params.freq instanceof neume.UGen);
        assert(params.amp1 instanceof neume.UGen);
        assert(params.amp1 === params.amp2);
      });
      it("invalidName -> throw an error", function() {
        var func = function($) {
          $("@@", Infinity);
        };

        assert.throws(function() {
          new neume.Synth(context, func, []);
        }, TypeError);
      });
    });
    describe(".timeout", function() {
      it("(timeout: number, ...callbacks: Array<function>): void", function() {
        var passed = [];
        var synth = new neume.Synth(context, function($) {
          $.timeout(0.030, function(e) {
            passed.push([ "fizz", e.playbackTime, e.count ]);
          });
          $.timeout(0.050, function(e) {
            passed.push([ "buzz", e.playbackTime, e.count ]);
          });
          $.timeout(0.150, function(e) {
            passed.push([ "fizzbuzz", e.playbackTime, e.count ]);
          });
        }, []);

        synth.start(0.010);
        synth.stop(0.100);

        audioContext.$processTo("00:00.200");

        assert.deepEqual(passed, [
          [ "fizz", 0.040, 1 ],
          [ "buzz", 0.060000000000000005, 1 ],
        ]);
      });
    });
    describe(".interval", function() {
      it("(interval: number, ...callbacks: Array<function>): void", function() {
        var passed = [];
        var synth = new neume.Synth(context, function($) {
          $.interval(0.030, function(e) {
            passed.push([ "fizz", e.playbackTime, e.count ]);
          });
          $.interval(0.050, function(e) {
            passed.push([ "buzz", e.playbackTime, e.count ]);
          });
        }, []);

        synth.start(0.010);
        synth.stop(0.100);

        audioContext.$processTo("00:00.200");

        assert.deepEqual(passed, [
          [ "fizz", 0.04, 1 ],
          [ "buzz", 0.060000000000000005, 1 ],
          [ "fizz", 0.06999999999999999, 2 ],
          [ "fizz", 0.09999999999999999, 3 ]
        ]);
      });
      it("works", function() {
        var passed = [];
        var synth = new neume.Synth(context, function($) {
          $.interval("32n", function(e) {
            passed.push([ "fizz", e.playbackTime, e.count ]);
          });
        }, []);

        synth.start(0.010);
        synth.stop(0.200);

        audioContext.$processTo("00:00.500");

        assert.deepEqual(passed, [
          [ "fizz", 0.0725, 1 ],
          [ "fizz", 0.1350, 2 ],
          [ "fizz", 0.1975, 3 ]
        ]);
      });
    });
  });
  describe(".stop", function() {
    it("(t: number|string): void", function() {
      var synth = new neume.Synth(context, function($) {
        $.stop("+0.100");
      }, []);

      var spy = sinon.spy(synth, "stop");

      synth.start(0.100);

      audioContext.$processTo("00:00.500");

      assert(spy.calledOnce);
      assert(spy.calledWith(0.100));
    });
  });

});
