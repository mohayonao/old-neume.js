"use strict";

var neume = require("../src/neume");

neume.use(require("../src/ugen/function"));

var NOP = function() {};

describe("ugen/function", function() {
  describe("$(func)", function() {
    it("returns a GainNode that is connected with a DC(1)", function() {
      var synth = neume.Neume(function($) {
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
      var synth = neume.Neume(function($) {
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

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.050");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1, "00:00.100");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1, "00:00.150");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1, "00:00.200");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1, "00:00.250");

      audioContext.$process(0.055);
      assert(outlet.gain.value === 4, "00:00.305");

      audioContext.$process(0.045);
      assert(outlet.gain.value === 4, "00:00.350");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 4, "00:00.400");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 4, "00:00.450");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 4, "00:00.500");
    });
  });

  describe("$(true lag:0.1, curve:0.1)", function() {
    it("works", function() {
      var synth = neume.Neume(function($) {
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

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.050");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.100");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.6837722339831622, "00:00.150");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.9, "00:00.200");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.9683772233983162, "00:00.250");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.99, "00:00.300");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 3.0481544242893177, "00:00.350");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 3.699, "00:00.400");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 3.904815442428932, "00:00.450");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 3.9699, "00:00.500");
    });
  });

  describe("$(func, $(func))", function() {
    it("returns a GainNode that is connected with inputs", function() {
      var synth = neume.Neume(function($) {
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
