"use strict";

var _ = require("../../src/utils");
var NeuContext = require("../../src/core/context");
var NeuSynth = require("../../src/synth/synth");
var NeuUGen = require("../../src/node/ugen");
var NeuIn = require("../../src/node/in");
var NeuParam = require("../../src/node/param");

var NOP = function() {};

describe("NeuSynthDollar", function() {
  var audioContext = null;
  var context = null;

  beforeEach(function() {
    audioContext = new window.AudioContext();
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
            params.amp  = $.param("amp", 0.25);
            params.amp2 = $.param("amp");
          }, []);

          assert(params.freq instanceof NeuParam);
          assert(params.amp  instanceof NeuParam);
          assert(params.freq === synth.freq);
          assert(params.amp  === synth.amp );
          assert(params.amp  === params.amp2);

          synth.freq = 880;

          assert(params.freq.valueOf() === 880);
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
      describe(".in(index)", function() {
        it("works", function() {
          var in0 = null;
          var in1 = null;
          var in2 = null;

          var synth = new NeuSynth(context, function($) {
            in0 = $.in(0);
            in1 = $.in(1);
            in2 = $.in(0);
          }, []);

          assert(in0 instanceof NeuIn);
          assert(in1 instanceof NeuIn);
          assert(in0 !== in1);
          assert(in0 === in2);
          assert(synth.$inputs[0] === in0);
          assert(synth.$inputs[1] === in1);
        });
      });
      describe(".out(index, ugen)", function() {
        it("works", function() {
          var ugen0 = null;
          var ugen1 = null;
          var ugen2 = null;
          var ugen3 = null;

          var synth = new NeuSynth(context, function($) {
            ugen0 = $("sin");
            ugen1 = $("sin");
            // ugen2 is null
            ugen3 = $("sin");
            assert($.out( 0, ugen0) === null);
            assert($.out( 1, ugen1) === null);
            assert($.out( 2, ugen2) === null);
            assert($.out( 3, ugen3) === null);
          }, []);

          assert(synth.$outputs[0] === ugen0);
          assert(synth.$outputs[1] === ugen1);
          assert(synth.$outputs[2] === undefined);
          assert(synth.$outputs[3] === ugen3);
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

          assert.deepEqual(synth.getMethods(), [ "func" ]);

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
          audioContext.$process(0.200);

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
          audioContext.$process(0.200);

          assert.deepEqual(passed, [
            [ "fizz", 0.04, 1 ],
            [ "buzz", 0.060000000000000005, 1 ],
            [ "fizz", 0.06999999999999999, 2 ],
            [ "fizz", 0.09999999999999999, 3 ]
          ]);
        });
      });
    });
  });

});
