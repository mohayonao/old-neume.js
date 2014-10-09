"use strict";

var neume = require("../../src");

var _          = neume._;
var NeuContext = neume.Context;
var NeuSynth   = neume.Synth;
var NeuUGen    = neume.UGen;
var NeuIn      = neume.In;
var NeuParam   = neume.Param;
var NOP = function() {};

describe("NeuSynth", function() {
  var audioContext = null;
  var context = null;
  var osc = null;

  beforeEach(function() {
    audioContext = new window.AudioContext();
    context = new NeuContext(audioContext.destination);
    osc = context.createOscillator();
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
    });
  });

  describe("#context", function() {
    it("is an instance of AudioContext", function() {
      var synth = new NeuSynth(context, NOP, []);

      assert(synth.context instanceof neume.Context);
    });
  });

  describe("#currentTime", function() {
    it("points to context.currentTime", function() {
      var synth = new NeuSynth(context, NOP, []);

      assert(synth.currentTime === context.currentTime);
    });
  });

  describe("#getMethods()", function() {
    it("returns method names", sinon.test(function() {
      var synth = new NeuSynth(context, function($) {
        return $("boolean", $("array"));
      }, []);

      assert.deepEqual(synth.getMethods(), [ "at", "next", "prev", "setValue", "toggle" ]);
    }));
  });

  describe("#start(t)", function() {
    it("returns self", function() {
      var synth = new NeuSynth(context, NOP, []);

      assert(synth.start() === synth);
    });
    it("calls each ugen.$unit.start(t) only once", sinon.test(function() {
      var synth = new NeuSynth(context, function($) {
        return $("+", $("sin"), $("sin"), $("sin"));
      }, []);

      var ugens = synth._db.all();
      ugens.forEach(function(ugen) {
        sinon.spy(ugen.$unit, "start");
      });

      assert(synth.state === "UNSCHEDULED", "00:00.000");
      ugens.forEach(function(ugen) {
        assert(ugen.$unit.start.called === false, "00:00.000");
      });

      synth.start(1.000);
      synth.start(1.250);

      audioContext.$process(0.5);
      assert(synth.state === "SCHEDULED", "00:00.500");
      ugens.forEach(function(ugen) {
        assert(ugen.$unit.start.called === true, "00:00.500");
      });

      audioContext.$process(0.5);
      assert(synth.state === "PLAYING", "00:01.000");
      ugens.forEach(function(ugen) {
        assert(ugen.$unit.start.calledOnce === true, "00:01.000");
        assert.deepEqual(ugen.$unit.start.firstCall.args, [ 1 ]);
      });

      audioContext.$process(0.5);
      assert(synth.state === "PLAYING", "00:01.500");
      ugens.forEach(function(ugen) {
        assert(ugen.$unit.start.calledTwice === false, "00:01.500");
      });
    }));
  });

  describe("#stop(t)", function() {
    it("returns self", function() {
      var synth = new NeuSynth(context, NOP, []);

      assert(synth.stop() === synth);
    });
    it("calls each ugen.$unit.stop(t) only once with calling start first", sinon.test(function() {
      var synth = new NeuSynth(context, function($) {
        return $("+", $("sin"), $("sin"), $("sin"));
      }, []);

      var ugens = synth._db.all();
      ugens.forEach(function(ugen) {
        sinon.spy(ugen.$unit, "stop");
      });

      assert(synth.state === "UNSCHEDULED", "00:00.000");
      ugens.forEach(function(ugen) {
        assert(ugen.$unit.stop.called === false, "00:00.000");
      });

      synth.stop(0.000);
      synth.start(1.000);
      synth.stop(2.000);

      audioContext.$process(0.5);
      assert(synth.state === "SCHEDULED", "00:00.500");
      ugens.forEach(function(ugen) {
        assert(ugen.$unit.stop.called === false, "00:00.500");
      });

      audioContext.$process(0.5);
      assert(synth.state === "PLAYING", "00:01.000");
      ugens.forEach(function(ugen) {
        assert(ugen.$unit.stop.called === false, "00:01.000");
      });

      audioContext.$process(0.5);
      assert(synth.state === "PLAYING", "00:01.500");
      ugens.forEach(function(ugen) {
        assert(ugen.$unit.stop.called === false, "00:01.500");
      });

      audioContext.$process(0.5);
      assert(synth.state === "FINISHED", "00:02.000");
      ugens.forEach(function(ugen) {
        assert(ugen.$unit.stop.calledOnce === true, "00:02.000");
        assert.deepEqual(ugen.$unit.stop.firstCall.args, [ 2 ]);
      });

      // var destination = _.findAudioNode(context);
      // assert(destination.$inputs.indexOf(osc) !== -1);
      //
      // audioContext.$process(0.5);
      // assert(destination.$inputs.indexOf(osc) === -1);
    }));
  });

  describe("#call(method, ...args)", function() {
    it("returns self", function() {
      var synth = new NeuSynth(context, NOP, []);

      assert(synth.call() === synth);
    });
    it("calls #apply(method, args)", function() {
      var synth = new NeuSynth(context, NOP, []);
      var spy = sinon.spy(synth, "apply");

      synth.call("method", 1, 2, 3);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ "method", [ 1, 2, 3 ] ]);
    });
  });

  describe("works", function() {
    var synth = null;
    var ugen1 = null;
    var ugen2 = null;
    var ugen3 = null;
    var ugen4 = null;
    var passed = null;

    beforeEach(function() {
      passed = [];
      synth = new NeuSynth(context, function($) {
        ugen1 = $("line#ugen1.amp");
        ugen2 = $("adsr#ugen2.amp");
        ugen3 = $("line#ugen3.fo");
        ugen4 = $("adsr#ugen4.lfo");
        return $("+", ugen1, ugen2, ugen3, ugen4);
      }, []);
    });

    describe("#apply(method, args)", function() {
      it("returns self", function() {
        assert(synth.apply() === synth);
      });

      it("calls ugen.$unit.apply(method, args)", function() {
        synth.apply(".amp:release", [ 10, 20 ]);
        //
        // assert.deepEqual(passed, [
        //   [ "ugen1", "release", [ 10, 20 ]],
        //   [ "ugen2", "release", [ 10, 20 ]],
        // ]);
      });
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
