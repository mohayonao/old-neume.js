"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/array"));

var NOP = function() {};

describe("neume.Synth", function() {
  var audioContext = null;
  var context = null;
  var osc = null;

  beforeEach(function() {
    audioContext = new global.AudioContext();
    context = new neume.Context(audioContext.destination);
    osc = context.createOscillator();
  });

  describe("constructor", function() {
    it("(context: neume.Context, func: function, args:Array<any>)", function() {
      assert(new neume.Synth(context, NOP, []) instanceof neume.Synth);
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
    });
  });

  describe("#context", function() {
    it("\\getter: neume.Context", function() {
      var synth = new neume.Synth(context, NOP, []);

      assert(synth.context instanceof neume.Context);
    });
  });

  describe("#currentTime", function() {
    it("\\getter: number", function() {
      var synth = new neume.Synth(context, NOP, []);

      assert(synth.currentTime === context.currentTime);
    });
  });

  describe("#methods", function() {
    it("\\getter: Array<string>", sinon.test(function() {
      var synth = new neume.Synth(context, function($) {
        return $("boolean", $("array"));
      }, []);

      assert.deepEqual(synth.methods, [ "at", "next", "prev", "setValue", "toggle" ]);
    }));
  });

  describe("#query", function() {
    it("(selector: string): Array<neume.UGen>", function() {
      var a, b, c, d, spy;
      var synth = new neume.Synth(context, function($) {
        a = $("sin");
        b = $("tri");
        c = $("sin");
        d = $([ 1 ]);
        spy = sinon.spy(a, "on");
        return $("+", a, b, c, d);
      }, []);

      assert.deepEqual(synth.query("sin").slice(), [ a, c ]);
      assert.deepEqual(synth.query("tri").slice(), [ b ]);
      assert.deepEqual(synth.query("saw").slice(), []);

      assert(synth.query("sin").on("foo", it).slice(), [ a, c ]);
      assert(synth.query("sin").next().slice(), [ a, c ]);
      assert(spy.calledOnce);
      assert(spy.calledWith("foo", it));
    });
  });

  describe("#start", function() {
    it("([startTime: timevalue]): self", function() {
      var synth = new neume.Synth(context, NOP, []);

      assert(synth.start() === synth);
    });
    it("calls each ugen.$unit.start(t) only once", sinon.test(function() {
      var synth = new neume.Synth(context, function($) {
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

      audioContext.$processTo("00:00.500");
      assert(synth.state === "SCHEDULED", "00:00.500");
      ugens.forEach(function(ugen) {
        assert(ugen.$unit.start.called === true, "00:00.500");
      });

      audioContext.$processTo("00:01.000");
      assert(synth.state === "PLAYING", "00:01.000");
      ugens.forEach(function(ugen) {
        assert(ugen.$unit.start.calledOnce === true, "00:01.000");
        assert.deepEqual(ugen.$unit.start.firstCall.args, [ 1 ]);
      });

      audioContext.$processTo("00:01.500");
      assert(synth.state === "PLAYING", "00:01.500");
      ugens.forEach(function(ugen) {
        assert(ugen.$unit.start.calledTwice === false, "00:01.500");
      });
    }));
  });

  describe("#stop", function() {
    it("([startTime: timevalue]): self", function() {
      var synth = new neume.Synth(context, NOP, []);

      assert(synth.stop() === synth);
    });
    it("calls each ugen.$unit.stop(t) only once with calling start first", sinon.test(function() {
      var synth = new neume.Synth(context, function($) {
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

      audioContext.$processTo("00:00.500");
      assert(synth.state === "SCHEDULED", "00:00.500");
      ugens.forEach(function(ugen) {
        assert(ugen.$unit.stop.called === false, "00:00.500");
      });

      audioContext.$processTo("00:01.000");
      assert(synth.state === "PLAYING", "00:01.000");
      ugens.forEach(function(ugen) {
        assert(ugen.$unit.stop.called === false, "00:01.000");
      });

      audioContext.$processTo("00:01.500");
      assert(synth.state === "PLAYING", "00:01.500");
      ugens.forEach(function(ugen) {
        assert(ugen.$unit.stop.called === false, "00:01.500");
      });

      audioContext.$processTo("00:02.000");
      assert(synth.state === "FINISHED", "00:02.000");
      ugens.forEach(function(ugen) {
        assert(ugen.$unit.stop.calledOnce === true, "00:02.000");
        assert.deepEqual(ugen.$unit.stop.firstCall.args, [ 2 ]);
      });

      audioContext.$processTo("00:02.250");
    }));
  });

  describe("#fadeIn", function() {
    it("([startTime: timevalue, duration: timevalue]): self", function() {
      var synth = new neume.Synth(context, NOP, []);

      assert(synth.fadeIn() === synth);
    });
    it("works", function() {
      var synth = new neume.Synth(context, function($) {
        return $("sin");
      }, []);

      var outlet = synth.toAudioNode();

      synth.fadeIn(1.000, 2);
      synth.fadeIn(1.250, 5);

      audioContext.$processTo("00:00.500");
      assert(synth.state === "SCHEDULED", "00:00.500");

      audioContext.$processTo("00:01.000");
      assert(synth.state === "PLAYING", "00:01.000");

      audioContext.$processTo("00:01.500");
      assert(synth.state === "PLAYING", "00:01.500");

      audioContext.$processTo("00:02.000");
      assert(synth.state === "PLAYING", "00:02.000");

      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.250), 0.125, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.500), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.750), 0.375, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(2.000), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(2.250), 0.625, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(2.500), 0.750, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(2.750), 0.875, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(3.000), 1.000, 1e-2));
    });
  });

  describe("#fadeOut", function() {
    it("([startTime: timevalue, duration: timevalue]): self", function() {
      var synth = new neume.Synth(context, NOP, []);

      synth.start();

      assert(synth.fadeOut() === synth);
    });
    it("works", function() {
      var synth = new neume.Synth(context, function($) {
        return $("sin");
      }, []);

      var outlet = synth.toAudioNode();

      synth.fadeOut(0.000, 2);
      synth.start(1.000);
      synth.fadeOut(2.000, 2);

      audioContext.$processTo("00:00.500");
      assert(synth.state === "SCHEDULED", "00:00.500");

      audioContext.$processTo("00:01.000");
      assert(synth.state === "PLAYING", "00:01.000");

      audioContext.$processTo("00:01.500");
      assert(synth.state === "PLAYING", "00:01.500");

      audioContext.$processTo("00:02.000");
      assert(synth.state === "PLAYING", "00:02.000");

      audioContext.$processTo("00:02.500");
      assert(synth.state === "PLAYING", "00:02.500");

      audioContext.$processTo("00:03.000");
      assert(synth.state === "PLAYING", "00:03.000");

      audioContext.$processTo("00:03.500");
      assert(synth.state === "PLAYING", "00:03.500");

      audioContext.$processTo("00:04.000");
      assert(synth.state === "FINISHED", "00:04.000");

      assert(closeTo(outlet.gain.$valueAtTime(1.000), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.250), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.500), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.750), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(2.000), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(2.250), 0.875, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(2.500), 0.750, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(2.750), 0.625, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(3.000), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(3.250), 0.375, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(3.500), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(3.750), 0.125, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(4.000), 0.000, 1e-2));
    });
  });

  describe("#fade", function() {
    it("([startTime: timevalue, value: number, duration: timevalue]): self", function() {
      var synth = new neume.Synth(context, NOP, []);

      synth.start();

      assert(synth.fade() === synth);
    });
    it("works", function() {
      var synth = new neume.Synth(context, function($) {
        return $("sin");
      }, []);

      var outlet = synth.toAudioNode();

      synth.fade(0.000, 0.5, 2);
      synth.start(1.000);
      synth.fade(2.000, 0.5, 2);

      audioContext.$processTo("00:02.000");

      assert(closeTo(outlet.gain.$valueAtTime(1.000), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.250), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.500), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.750), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(2.000), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(2.250), 0.937, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(2.500), 0.875, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(2.750), 0.812, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(3.000), 0.750, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(3.250), 0.687, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(3.500), 0.625, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(3.750), 0.562, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(4.000), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(4.500), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(5.000), 0.500, 1e-2));
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
      synth = new neume.Synth(context, function($) {
        ugen1 = $("line#ugen1.amp");
        ugen2 = $("adsr#ugen2.amp");
        ugen3 = $("line#ugen3.fo");
        ugen4 = $("adsr#ugen4.lfo");

        return $("+", ugen1, ugen2, ugen3, ugen4);
      }, []);
    });

    describe("#hasListeners", function() {
      it("(event: string): boolean", function() {
        synth.on(".amp:end", it);

        assert(synth.hasListeners("end") === true);
        assert(synth.hasListeners("line:end") === true);
        assert(synth.hasListeners("adsr:end") === true);
        assert(synth.hasListeners("#ugen1:end") === true);
        assert(synth.hasListeners("#ugen2:end") === true);
        assert(synth.hasListeners("#ugen3:end") === false);
        assert(synth.hasListeners("#ugen4:end") === false);
        assert(synth.hasListeners(".amp:end") === true);
        assert(synth.hasListeners(".lfo:end") === false);
        assert(synth.hasListeners("done") === false);
      });
      it("case of an invalid event name", function() {
        synth.on("*", it);

        assert(synth.hasListeners("*") === false);
      });
    });

    describe("#listeners", function() {
      it("(event: string): Array<function>", function() {
        synth.on("end", it);

        assert.deepEqual(synth.listeners("end"), [ it ]);
      });
    });

    describe("#on", function() {
      it("(event: string, listener: function): self", function() {
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

    describe("#once", function() {
      it("(event: string, listener: function): self", function() {
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

    describe("#off", function() {
      it("(event: string, listener: function): self", function() {
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

    describe("method bindings", function() {
      it("works", function() {
        assert(synth.release() === synth);
        assert(synth.release(0) === synth);
      });
    });

  });

});
