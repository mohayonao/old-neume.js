"use strict";

var neume = require("../../src");

var NeuContext = neume.Context;
var NeuSynth = neume.Synth;
var NeuUGen = neume.UGen;
var NeuControlBus = neume.ControlBus;
var NeuAudioBus = neume.AudioBus;
var NeuParam = neume.Param;
var NOP = function() {};

describe("NeuSynthDollar", function() {
  var audioContext = null;
  var context = null;

  beforeEach(function() {
    audioContext = new global.AudioContext();
    context = new NeuContext(audioContext.destination);
  });

  describe("(context, func, args)", function() {
    it("returns an instance of NeuSynth", function() {
      assert(new NeuSynth(context, NOP, []) instanceof NeuSynth);
    });
    describe("$", function() {
      it("works", sinon.test(function() {
        var spy = this.spy(NeuUGen, "build");

        var synth = new NeuSynth(context, function($) {
          return $("sin", { freq: 880 }, 1, 2, 3);
        }, []);

        assert(spy.calledOnce === true);
        assert.deepEqual(spy.firstCall.args, [
          synth, "sin", { freq: 880 }, [ 1, 2, 3 ]
        ]);
      }));
      describe(".params(name, defaultValue)", function() {
        it("works", function() {
          var params = {};

          var synth = new NeuSynth(context, function($) {
            params.freq = $.param("freq", 440);
            params.amp = $.param("amp", 0.25);
            params.amp2 = $.param("amp");
          }, []);

          assert(params.freq instanceof NeuParam);
          assert(params.amp  instanceof NeuParam);
          assert(params.freq === synth.freq);
          assert(params.amp === synth.amp );
          assert(params.amp === params.amp2);

          synth.freq.value = 880;

          assert(params.freq.value === 880);
        });
        it("throw an error if given an invalid name", function() {
          var func = function($) {
            $.param("*", Infinity);
          };

          assert.throws(function() {
            new NeuSynth(context, func, []);
          }, TypeError);
        });
      });
      describe(".method(methodName, func)", function() {
        it("works", function() {
          var passed = null;
          var synth = new NeuSynth(context, function($) {
            $.method("func", function(a, b) {
              passed = [ "func", a, b ];
            });
            $.method("****", function( a, b) {
              passed = [ "****", a, b ];
            });
          });

          assert.deepEqual(synth.methods, [ "func" ]);

          synth.func(1, 2);
          assert.deepEqual(passed, [ "func", 1, 2 ]);
        });
      });
      describe(".timeout(timeout, ... callbacks)", function() {
        it("works", function() {
          var passed = [];
          var synth = new NeuSynth(context, function($) {
            $.timeout(0.030, function(t, i) {
              passed.push([ "fizz", t, i ]);
            });
            $.timeout(0.050, function(t, i) {
              passed.push([ "buzz", t, i ]);
            });
            $.timeout(0.150, function(t, i) {
              passed.push([ "fizzbuzz", t, i ]);
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
      describe(".interval(interval, ... callbacks)", function() {
        it("works", function() {
          var passed = [];
          var synth = new NeuSynth(context, function($) {
            $.interval(0.030, function(t, i) {
              passed.push([ "fizz", t, i ]);
            });
            $.interval(0.050, function(t, i) {
              passed.push([ "buzz", t, i ]);
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
        it("works relative", function() {
          var passed = [];
          var synth = new NeuSynth(context, function($) {
            $.interval("32n", function(t, i) {
              passed.push([ "fizz", t, i ]);
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
    describe(".sec(value)", function() {
      it("works", function() {
        var passed = 0;
        var synth = new NeuSynth(context, function($) {
          passed = $.sec("4n");
        }, []);
        assert(passed === 0.5);
      });
    });
    describe(".freq(value)", function() {
      it("works", function() {
        var passed = 0;
        var synth = new NeuSynth(context, function($) {
          passed = $.freq("4n");
        }, []);
        assert(passed === 2);
      });
    });
  });

});
