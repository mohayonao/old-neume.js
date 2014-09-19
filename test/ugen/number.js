"use strict";

var neume = require("../../src/neume");

neume.use(require("../../src/ugen/number"));

describe("ugen/number", function() {
  describe("$(440)", function() {
    it("returns a GainNode that is connected with a DC(1)", function() {
      var synth = neume.Neume(function($) {
        return $(0);
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
        return $(0);
      })();
      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      assert(outlet.gain.value === 0, "00:00.000");

      synth.setValue(0.100, "1");
      synth.setValue(0.200, 2);

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.050");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.100");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.150");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 2, "00:00.200");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 2, "00:00.250");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 2, "00:00.300");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 2, "00:00.350");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 2, "00:00.400");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 2, "00:00.450");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 2, "00:00.500");
    });
  });

  describe("$(0 lag:0.1, curve:0.1)", function() {
    it("works", function() {
      var synth = neume.Neume(function($) {
        return $(0, { lag: 0.1, curve: 0.1 });
      })();
      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      assert(outlet.gain.value === 0, "00:00.000");

      synth.setValue(0.100, "1");
      synth.setValue(0.200, 2);

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.050");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.100");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.150");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.200");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1.367544467966324, "00:00.250");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1.7999999999999998, "00:00.300");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1.9367544467966324, "00:00.350");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1.98, "00:00.400");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1.9936754446796632, "00:00.450");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1.998, "00:00.500");
    });
  });

  describe("$(1, $(2), $(3))", function() {
    it("returns a GainNode that is connected with inputs", function() {
      var synth = neume.Neume(function($) {
        return $(1, $(2), $(3));
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 2,
              inputs: []
            },
            inputs: [ DC(1) ]
          },
          {
            name: "GainNode",
            gain: {
              value: 3,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
    });
  });
});
