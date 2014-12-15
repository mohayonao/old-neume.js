"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/add"));
neume.use(require("../../src/ugen/env"));
neume.use(require("../../src/ugen/array"));

var NOP = function() {};

describe("neume.Synth", function() {
  var audioContext = null;
  var context = null;

  beforeEach(function() {
    audioContext = new global.AudioContext();
    context = new neume.Context(audioContext.destination);
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

  describe("#hasListeners", function() {
    it("(event: string): boolean", function() {
      var synth = new neume.Synth(context, function($) {
        return $("+", $("sin"), $("saw"));
      });

      synth.query("sin").on("foo", it);
      synth.query("saw").on("foo", it).on("bar", it);

      assert(synth.hasListeners("foo") === true);
      assert(synth.hasListeners("bar") === true);
      assert(synth.hasListeners("baz") === false);
    });
  });

  describe("#listeners", function() {
    it("(event: string): Array<function>", function() {
      var synth = new neume.Synth(context, function($) {
        return $("+", $("sin"), $("saw"));
      });

      synth.query("sin").on("foo", it);
      synth.query("saw").on("foo", it).on("bar", describe);

      assert.deepEqual(synth.listeners("foo"), [ it ]);
      assert.deepEqual(synth.listeners("bar"), [ describe ]);
      assert.deepEqual(synth.listeners("bax"), []);
    });
  });

  describe("#on", function() {
    it("(event: string, listener:function): self", function() {
      var spy1, spy2;
      var synth = new neume.Synth(context, function($) {
        var a = $("sin"), b = $("saw");
        spy1 = sinon.spy(a, "on");
        spy2 = sinon.spy(b, "on");
        return $("+", a, b);
      });

      assert(synth.on("foo", it) === synth);

      assert(spy1.calledOnce);
      assert(spy1.calledWith("foo", it));
      assert(spy2.calledOnce);
      assert(spy2.calledWith("foo", it));
    });
  });

  describe("#once", function() {
    it("(event: string, listener:function): self", function() {
      var spy1, spy2;
      var synth = new neume.Synth(context, function($) {
        var a = $("sin"), b = $("saw");
        spy1 = sinon.spy(a, "once");
        spy2 = sinon.spy(b, "once");
        return $("+", a, b);
      });

      assert(synth.once("foo", it) === synth);

      assert(spy1.calledOnce);
      assert(spy1.calledWith("foo", it));
      assert(spy2.calledOnce);
      assert(spy2.calledWith("foo", it));
    });
  });

  describe("#off", function() {
    it("(event: string, listener:function): self", function() {
      var spy1, spy2;
      var synth = new neume.Synth(context, function($) {
        var a = $("sin"), b = $("saw");
        spy1 = sinon.spy(a, "off");
        spy2 = sinon.spy(b, "off");
        return $("+", a, b);
      });

      assert(synth.off("foo", it) === synth);

      assert(spy1.calledOnce);
      assert(spy1.calledWith("foo", it));
      assert(spy2.calledOnce);
      assert(spy2.calledWith("foo", it));
    });
  });

  describe("method bindings", function() {
    it("works", function() {
      var synth = new neume.Synth(context, function($) {
        return $("sin").$("env");
      });

      assert(synth.release() === synth);
      assert(synth.release(0) === synth);
    });
  });

});
