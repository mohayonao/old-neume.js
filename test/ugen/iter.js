"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/iter"));

describe("ugen/iter", function() {
  var neu = null;

  beforeEach(function() {
    neu = neume(new global.AudioContext(), {
      scheduleInterval: 0.05, scheduleAheadTime: 0.05
    });
  });

  describe("graph", function() {
    it("$('iter')", function() {
      var synth = neu.Synth(function($) {
        return $("iter");
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 0,
              inputs: []
            },
            inputs: [ BUFSRC(128) ]
          }
        ]
      });
      assert(synth.toAudioNode().$inputs[0].$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("$('iter', $('sin'))", function() {
      var synth = neu.Synth(function($) {
        return $("iter", $("sin"));
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 0,
              inputs: []
            },
            inputs: [ OSCILLATOR("sine", 440) ]
          }
        ]
      });
    });
  });

  describe("works", function() {
    it("next", function() {
      var synth = neu.Synth(function($) {
        var iter = {
          count: 0,
          next: function() {
            return { value: this.count++, done: false };
          }
        };
        return $("iter", { iter: iter }).on("end", function() {
          throw new Error("NOT REACHED");
        });
      });

      var outlet = synth.toAudioNode().$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0);

        synth.next(0.100);
        synth.next(0.200);
        synth.next(0.300);
        synth.next(0.400);

        tick(500);
      });

      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 1);
      assert(outlet.gain.$valueAtTime(0.150) === 1);
      assert(outlet.gain.$valueAtTime(0.200) === 2);
      assert(outlet.gain.$valueAtTime(0.250) === 2);
      assert(outlet.gain.$valueAtTime(0.300) === 3);
      assert(outlet.gain.$valueAtTime(0.350) === 3);
      assert(outlet.gain.$valueAtTime(0.400) === 4);
      assert(outlet.gain.$valueAtTime(0.450) === 4);
      assert(outlet.gain.$valueAtTime(0.500) === 4);
    });
    it("next // done", function() {
      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 0.300, 1e-2));
      });
      var synth = neu.Synth(function($) {
        var iter = {
          count: 0,
          next: function() {
            if (this.count === 3) {
              return { done: true };
            }
            return { value: this.count++, done: false };
          }
        };
        return $("iter", { iter: iter }).on("end", spy);
      });

      var outlet = synth.toAudioNode().$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0);

        synth.next(0.100);
        synth.next(0.200);
        synth.next(0.300);
        synth.next(0.400);

        tick(500);
      });

      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 1);
      assert(outlet.gain.$valueAtTime(0.150) === 1);
      assert(outlet.gain.$valueAtTime(0.200) === 2);
      assert(outlet.gain.$valueAtTime(0.250) === 2);
      assert(outlet.gain.$valueAtTime(0.300) === 2);
      assert(outlet.gain.$valueAtTime(0.350) === 2);
      assert(outlet.gain.$valueAtTime(0.400) === 2);
      assert(outlet.gain.$valueAtTime(0.450) === 2);
      assert(outlet.gain.$valueAtTime(0.500) === 2);
      assert(spy.calledOnce);
    });
    it("next // done when start", function() {
      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 0.000, 1e-2));
      });
      var synth = neu.Synth(function($) {
        return $("iter").on("end", spy);
      });

      var outlet = synth.toAudioNode().$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0);

        synth.next(0.100);
        synth.next(0.200);
        synth.next(0.300);
        synth.next(0.400);

        tick(500);
      });

      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(outlet.gain.$valueAtTime(0.150) === 0);
      assert(outlet.gain.$valueAtTime(0.200) === 0);
      assert(outlet.gain.$valueAtTime(0.250) === 0);
      assert(outlet.gain.$valueAtTime(0.300) === 0);
      assert(outlet.gain.$valueAtTime(0.350) === 0);
      assert(outlet.gain.$valueAtTime(0.400) === 0);
      assert(outlet.gain.$valueAtTime(0.450) === 0);
      assert(outlet.gain.$valueAtTime(0.500) === 0);
      assert(spy.calledOnce);
    });
  });

});
