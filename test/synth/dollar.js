"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen"));

describe("neume.SynthDollar", function() {
  var audioContext = null;
  var context = null;

  beforeEach(function() {
    audioContext = new global.AudioContext();
    context = new neume.Context(audioContext.destination, {
      scheduleInterval: 0.05, scheduleAheadTime: 0.05
    });
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
        return $("sin");
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
      it("graph: param", function() {
        var synth = new neume.Synth(context, function($) {
          return $("sin", { freq: $("@freq", 220) });
        }, []);

        assert(synth.toAudioNode().toJSON(), {
          name: "GainNode",
          gain: {
            value: 1,
            inputs: []
          },
          inputs: [ OSCILLATOR("sine", 220) ]
        });
      });
      it("graph: inputs", function() {
        var synth = new neume.Synth(context, function($) {
          return $("sin").$("@amp", 0.25);
        }, []);

        assert(synth.toAudioNode().toJSON(), {
          name: "GainNode",
          gain: {
            value: 1,
            inputs: []
          },
          inputs: [
            {
              name: "GainNode",
              gain: {
                value: 0.25,
                inputs: []
              },
              inputs: [ OSCILLATOR("sine", 440) ]
            }
          ]
        });
      });
      it("graph: standalone", function() {
        var synth = new neume.Synth(context, function($) {
          return $("@param", 1000);
        }, []);

        assert(synth.toAudioNode().toJSON(), {
          name: "GainNode",
          gain: {
            value: 1,
            inputs: []
          },
          inputs: [
            {
              name: "GainNode",
              gain: {
                value: 1000,
                inputs: []
              },
              inputs: [ BUFSRC(128) ]
            }
          ]
        });
        assert(synth.toAudioNode().$inputs[0].$inputs[0].buffer.getChannelData(0)[0] === 1);
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
    describe("#id", function() {
      it("works", function() {
        var saved = {};

        var synth = new neume.Synth(context, function($) {
          saved.osc1 = $("#osc");
          saved.osc2 = $("#osc");
          saved.sin1 = $("sin#osc");
          saved.sin2 = $("sin#amp");
          saved.osc3 = $("#osc");
        }, []);

        assert(saved.osc1 instanceof neume.UGenPromise);
        assert(saved.osc1 === saved.osc2);
        assert(saved.osc3 === saved.sin1);
      });
      it("graph", function() {
        /*
         * +------------+
         * | sin        |
         * +------------+
         *   |        |
         * +-------+  |
         * | delay |  |
         * +-------+  |
         *   |        |
         * +------------+
         * | +          |
         * +------------+
         */
        var synth = new neume.Synth(context, function($) {
          return $("sin#osc")
          .$("delay")
          .$("+", $("#osc"));
        }, []);

        assert(synth.toAudioNode().toJSON(), {
          name: "GainNode",
          gain: {
            value: 1,
            inputs: []
          },
          inputs: [
            {
              name: "DelayNode",
              delay: {
                value: 0,
                inputs: []
              },
              inputs: [ OSCILLATOR("sine", 440) ]
            },
            OSCILLATOR("sine", 440)
          ]
        });
      });
      it("graph: feedback", function() {
        /*
         * +----------------+
         * | sin            |
         * | freq: 880 + x <---+
         * +----------------+  |
         *   |    |            |
         *   |  +-------+      |
         *   |  | * 100 |------+
         *   |  +-------+
         *   |
         */
        var synth = new neume.Synth(context, function($) {
          return $("sin#osc", {
            freq: $("+", 880, $("#osc").mul(100))
          });
        }, []);

        assert.deepEqual(synth.toAudioNode().toJSON(), {
          name: "GainNode",
          gain: {
            value: 1,
            inputs: []
          },
          inputs: [
            {
              name: "OscillatorNode",
              type: "sine",
              frequency: {
                value: 880,
                inputs: [
                  {
                    name: "GainNode",
                    gain: {
                      value: 100,
                      inputs: []
                    },
                    inputs: [
                      "<circular:OscillatorNode>"
                    ]
                  }
                ]
              },
              detune: {
                value: 0,
                inputs: []
              },
              inputs: []
            }
          ]
        });
      });
      it("graph: standalone", function() {
        var synth = new neume.Synth(context, function($) {
          return $("#osc");
        }, []);

        assert.deepEqual(synth.toAudioNode().toJSON(), {
          name: "GainNode",
          gain: {
            value: 1,
            inputs: []
          },
          inputs: []
        });
      });
    });

    describe(".timeout", function() {
      it("(timeout: number, ...callbacks: Array<function>): void", function() {
        var passed = [];
        var synth = new neume.Synth(context, function($) {
          return $("sin")
          .sched($.timeout(0.030), function(e) {
            assert(this instanceof neume.Synth);
            passed.push([ "fizz", e.playbackTime, e.count ]);
          })
          .sched($.timeout(0.050), function(e) {
            assert(this instanceof neume.Synth);
            passed.push([ "buzz", e.playbackTime, e.count ]);
          })
          .sched($.timeout(0.150), function(e) {
            throw new Error("NOT REACHED");
          });
        }, []);

        useTimer(context, function(tick) {
          synth.start(0.010);
          synth.stop(0.100);

          tick(500);
        });

        assert(passed.length === 2);
        assert(passed[0][0] === "fizz");
        assert(closeTo(passed[0][1], 0.04, 1e-2));
        assert(passed[0][2] === 1);
        assert(passed[1][0] === "buzz");
        assert(closeTo(passed[1][1], 0.06, 1e-2));
        assert(passed[1][2] === 1);
      });
    });
    describe(".interval", function() {
      it("(interval: number, ...callbacks: Array<function>): void", function() {
        var passed = [];
        var synth = new neume.Synth(context, function($) {
          return $("sin")
          .sched($.interval(0.030), function(e) {
            assert(this instanceof neume.Synth);
            passed.push([ "fizz", e.playbackTime, e.count ]);
          })
          .sched($.interval(0.050), function(e) {
            assert(this instanceof neume.Synth);
            passed.push([ "buzz", e.playbackTime, e.count ]);
          });
        }, []);

        useTimer(context, function(tick) {
          synth.start(0.010);
          synth.stop(0.100);

          tick(500);
        });

        assert(passed.length === 4);
        assert(passed[0][0] === "fizz");
        assert(closeTo(passed[0][1], 0.04, 1e-2));
        assert(passed[0][2] === 1);
        assert(passed[1][0] === "buzz");
        assert(closeTo(passed[1][1], 0.06, 1e-2));
        assert(passed[1][2] === 1);
        assert(passed[2][0] === "fizz");
        assert(closeTo(passed[2][1], 0.07, 1e-2));
        assert(passed[2][2] === 2);
        assert(passed[3][0] === "fizz");
        assert(closeTo(passed[3][1], 0.10, 1e-2));
        assert(passed[3][2] === 3);
      });
      it("works", function() {
        var passed = [];
        var synth = new neume.Synth(context, function($) {
          return $("sin")
          .sched($.interval("32n"), function(e) {
            assert(this instanceof neume.Synth);
            passed.push([ "fizz", e.playbackTime, e.count ]);
          });
        }, []);

        useTimer(context, function(tick) {
          synth.start(0.010);
          synth.stop(0.200);

          tick(500);
        });

        assert(passed.length === 3);
        assert(passed[0][0] === "fizz");
        assert(closeTo(passed[0][1], 0.0725, 1e-2));
        assert(passed[0][2] === 1);
        assert(passed[1][0] === "fizz");
        assert(closeTo(passed[1][1], 0.1350, 1e-2));
        assert(passed[1][2] === 2);
        assert(passed[2][0] === "fizz");
        assert(closeTo(passed[2][1], 0.1975, 1e-2));
        assert(passed[2][2] === 3);
      });
    });
  });
  describe(".stop", function() {
    it("(t: number|string): void", function() {
      var synth = new neume.Synth(context, function($) {
        $.stop("+0.100");
      }, []);

      var spy = sinon.spy(synth, "stop");

      useTimer(context, function(tick) {
        synth.start(0.100);

        tick(500);
      });

      assert(spy.calledOnce);
      assert(spy.calledWith(0.100));
    });
  });

});
