"use strict";

var _ = require("../src/utils");
var NeuContext = require("../src/context");
var NeuSynth = require("../src/synth");
var Emitter = require("../src/emitter");

var NeuUGen  = _.NeuUGen;
var NeuParam = _.NeuParam;
var NOP = function() {};

describe("NeuSynth", function() {
  var audioContext = null;
  var context = null;
  var osc = null;

  beforeEach(function() {
    audioContext = new window.AudioContext();
    context = new NeuContext(audioContext);
    osc = context.createOscillator();
  });

  describe("(context, func, args)", function() {
    it("returns an instance of NeuSynth", function() {
      assert(new NeuSynth(context, NOP, []) instanceof NeuSynth);
    });
    describe("$", function() {
      it("works", sinon.test(function() {
        var count = 0;

        var stub = this.stub(NeuUGen, "build", function() {
          return { id: count++ };
        });

        var synth = new NeuSynth(context, function($) {
          return $("sin", { freq: 880 }, 1, 2, 3);
        }, []);

        assert(stub.calledOnce === true);
        assert.deepEqual(stub.firstCall.args, [
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

          synth.freq = 220;
          synth.amp  = 0.1;

          assert(params.freq.valueOf() === 220);
          assert(params.amp .valueOf() === 0.1);
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
    });
  });

  describe("#context", function() {
    it("is an instance of AudioContext", function() {
      var synth = new NeuSynth(context, NOP, []);

      assert(synth.context instanceof window.AudioContext);
    });
  });

  describe("#outlet", function() {
    it("is an instance of AudioNode", sinon.test(function() {
      this.stub(NeuUGen, "build", function() {
        return { $outlet: osc };
      });

      var synth = new NeuSynth(context, function($) {
        return $("sin");
      }, []);

      assert(synth.outlet instanceof window.AudioNode);
    }));
  });

  describe("#start(t)", function() {
    it("returns self", function() {
      var synth = new NeuSynth(context, NOP, []);

      assert(synth.start() === synth);
    });
    it("calls each ugen.start(t) only once", sinon.test(function() {
      var ugens = [];

      this.stub(NeuUGen, "build", function() {
        var ugen = { $outlet: osc, start: sinon.spy() };
        ugens.push(ugen);
        return ugen;
      });

      var synth = new NeuSynth(context, function($) {
        return $("+", $("sin"), $("sin"), $("sin"));
      }, []);

      assert(synth.state === "init", "00:00.000");
      ugens.forEach(function(ugen) {
        assert(ugen.start.called === false, "00:00.000");
      });

      synth.start(1.000);
      synth.start(1.250);

      audioContext.$process(0.5);
      assert(synth.state === "ready", "00:00.500");
      ugens.forEach(function(ugen) {
        assert(ugen.start.called === false, "00:00.500");
      });

      audioContext.$process(0.5);
      assert(synth.state === "start", "00:01.000");
      ugens.forEach(function(ugen) {
        assert(ugen.start.calledOnce === true, "00:01.000");
        assert.deepEqual(ugen.start.firstCall.args, [ 1 ]);
      });

      audioContext.$process(0.5);
      assert(synth.state === "start", "00:01.500");
      ugens.forEach(function(ugen) {
        assert(ugen.start.calledTwice === false, "00:01.500");
      });
    }));
  });

  describe("#stop(t)", function() {
    it("returns self", function() {
      var synth = new NeuSynth(context, NOP, []);

      assert(synth.stop() === synth);
    });
    it("calls each ugen.stop(t) only once with calling start first", sinon.test(function() {
      var ugens = [];

      this.stub(NeuUGen, "build", function() {
        var ugen = { $outlet: osc, start: function() {}, stop: sinon.spy() };
        ugens.push(ugen);
        return ugen;
      });

      var synth = new NeuSynth(context, function($) {
        return $("+", $("sin"), $("sin"), $("sin"));
      }, []);

      assert(synth.state === "init", "00:00.000");
      ugens.forEach(function(ugen) {
        assert(ugen.stop.called === false, "00:00.000");
      });

      synth.stop(0.000);
      synth.start(1.000);
      synth.stop(2.000);

      audioContext.$process(0.5);
      assert(synth.state === "ready", "00:00.500");
      ugens.forEach(function(ugen) {
        assert(ugen.stop.called === false, "00:00.500");
      });

      audioContext.$process(0.5);
      assert(synth.state === "start", "00:01.000");
      ugens.forEach(function(ugen) {
        assert(ugen.stop.called === false, "00:01.000");
      });

      audioContext.$process(0.5);
      assert(synth.state === "start", "00:01.500");
      ugens.forEach(function(ugen) {
        assert(ugen.stop.called === false, "00:01.500");
      });

      audioContext.$process(0.5);
      assert(synth.state === "stop", "00:02.000");
      ugens.forEach(function(ugen) {
        assert(ugen.stop.calledOnce === true, "00:02.000");
        assert.deepEqual(ugen.stop.firstCall.args, [ 2 ]);
      });

      var destination = _.findAudioNode(context);
      assert(destination.$inputs.indexOf(osc) !== -1);

      audioContext.$process(0.5);
      assert(destination.$inputs.indexOf(osc) === -1);
    }));
  });

  describe("events", function() {
    var synth = null;
    var ugen1 = null;
    var ugen2 = null;
    var ugen3 = null;
    var ugen4 = null;

    before(function() {
      sinon.stub(NeuUGen, "build", function(synth, key, spec) {
        var ugen = new Emitter();

        ugen.$key    = key;
        ugen.$id     = spec.id;
        ugen.$class  = spec.class;
        ugen.$outlet = osc;

        return ugen;
      });
    });

    beforeEach(function() {
      synth = new NeuSynth(context, function($) {
        ugen1 = $("line", { id: "ugen1", class: "amp" });
        ugen2 = $("adsr", { id: "ugen2", class: "amp" });
        ugen3 = $("line", { id: "ugen3", class: "lfo" });
        ugen4 = $("adsr", { id: "ugen4", class: "lfo" });
        return $("+", ugen1, ugen2, ugen3, ugen4);
      }, []);
    });

    after(function() {
      NeuUGen.build.restore();
    });

    describe("#hasListeners(event)", function() {
      it("checks if event targets have any listeners", function() {
        synth.on(".amp:end", it);

        assert(synth.hasListeners("end")        === true);
        assert(synth.hasListeners("line:end")   === true);
        assert(synth.hasListeners("adsr:end")   === true);
        assert(synth.hasListeners("#ugen1:end") === true);
        assert(synth.hasListeners("#ugen2:end") === true);
        assert(synth.hasListeners("#ugen3:end") === false);
        assert(synth.hasListeners("#ugen4:end") === false);
        assert(synth.hasListeners(".amp:end")   === true);
        assert(synth.hasListeners(".lfo:end")   === false);
        assert(synth.hasListeners("done")       === false);
      });
      it("case of an invalid event name", function() {
        synth.on("*", it);

        assert(synth.hasListeners("*") === false);
      });
    });

    describe("#listeners(event)", function() {
      it("returns listeners of event targets", function() {
        synth.on("end", it);

        assert.deepEqual(synth.listeners("end"), [ it ]);
      });
    });

    describe("#on(event, listener)", function() {
      it("returns self", function() {
        assert(synth.on("end", it) === synth);
      });
      it("adds the listener to event targets", function() {
        var passed = [];
        var listener = function(n) {
          passed.push(n);
        };

        synth.on(".amp:end", listener);

        ugen1.emit("end", 1); // .amp *
        ugen2.emit("end", 2); // .amp *
        ugen3.emit("end", 3); // .lfo
        ugen4.emit("end", 4); // .lfo

        ugen1.emit("end", 1); // .amp *
        ugen2.emit("end", 2); // .amp *
        ugen3.emit("end", 3); // .lfo
        ugen4.emit("end", 4); // .lfo

        assert.deepEqual(passed, [ 1, 2, 1, 2 ]);
      });
    });

    describe("#once(event, listener)", function() {
      it("returns self", function() {
        assert(synth.once("end", it) === synth);
      });
      it("adds the single-shot listener to event targets", function() {
        var passed = [];
        var listener = function(n) {
          passed.push(n);
        };

        synth.once("line:end", listener);

        ugen1.emit("end", 1); // line *
        ugen2.emit("end", 2); // adsr
        ugen3.emit("end", 3); // line *
        ugen4.emit("end", 4); // adsr

        ugen1.emit("end", 1); // line
        ugen2.emit("end", 2); // adsr
        ugen3.emit("end", 3); // line
        ugen4.emit("end", 4); // adsr

        assert.deepEqual(passed, [ 1, 3 ]);
      });
    });

    describe("#off(event, listener)", function() {
      it("returns self", function() {
        assert(synth.off("end", it) === synth);
      });
      it("removes the listener from event targets", function() {
        var passed = [];
        var listener = function(n) {
          passed.push(n);
        };

        synth.on("end", listener);
        synth.off("#ugen4:end", listener);

        ugen1.emit("end", 1); // #ugen1 *
        ugen2.emit("end", 2); // #ugen2 *
        ugen3.emit("end", 3); // #ugen3 *
        ugen4.emit("end", 4); // #ugen4

        ugen1.emit("end", 1); // #ugen1 *
        ugen2.emit("end", 2); // #ugen2 *
        ugen3.emit("end", 3); // #ugen3 *
        ugen4.emit("end", 4); // #ugen4

        assert.deepEqual(passed, [ 1, 2, 3, 1, 2, 3 ]);
      });
    });

  });

});
