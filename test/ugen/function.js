"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/function"));

var NOP = function() {};

describe("ugen/function", function() {
  var Neume = null;

  before(function() {
    Neume = neume.exports(new window.AudioContext());
  });

  describe("$(func)", function() {
    it("returns a GainNode that is connected with a DC(1)", function() {
      var synth = new Neume(function($) {
        return $(NOP);
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 0,
          inputs: []
        },
        inputs: [ DC(1) ]
      });
    });
    it("works", function() {
      var synth = new Neume(function($) {
        return $(function(t, count) { return count; });
      })();
      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      assert(outlet.gain.value === 0, "00:00.000");

      synth.evaluate(0.100);
      synth.evaluate(0.300);
      synth.setValue(0.200, 0);
      synth.setValue(0.200, function(t, count) {
        return count * 2;
      });

      audioContext.$processTo("00:00.500");
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 1);
      assert(outlet.gain.$valueAtTime(0.150) === 1);
      assert(outlet.gain.$valueAtTime(0.200) === 1);
      assert(outlet.gain.$valueAtTime(0.250) === 1);
      assert(outlet.gain.$valueAtTime(0.305) === 4);
      assert(outlet.gain.$valueAtTime(0.350) === 4);
      assert(outlet.gain.$valueAtTime(0.400) === 4);
      assert(outlet.gain.$valueAtTime(0.450) === 4);
      assert(outlet.gain.$valueAtTime(0.500) === 4);
    });
  });

  describe("$(true lag:0.1, curve:0.1)", function() {
    it("works", function() {
      var synth = new Neume(function($) {
        return $(function(t, count) { return count; }, { lag: 0.1, curve: 0.1 });
      })();
      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      assert(outlet.gain.value === 0, "00:00.000");

      synth.evaluate(0.100);
      synth.evaluate(0.300);
      synth.setValue(0.200, 0);
      synth.setValue(0.200, function(t, count) {
        return count * 2;
      });

      audioContext.$processTo("00:00.500");
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 0.683772233983162 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.9               , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.9683772233983162, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.99              , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 3.048154424289319 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 3.6990000000000003, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 3.904815442428932 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 3.9699            , 1e-6));
    });
  });

  describe("$(func, $(func))", function() {
    it("returns a GainNode that is connected with inputs", function() {
      var synth = new Neume(function($) {
        return $(NOP, $(NOP));
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 0,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 0,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
    });
  });
});
