"use strict";

var neuma = require("../src/neuma");

neuma.use(require("../src/ugen/boolean"));

describe("ugen/boolean", function() {
  describe("$(false)", function() {
    it("returns a GainNode that is connected with a DC(1)", function() {
      var synth = neuma.Neuma(function($) {
        return $(false);
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
      var synth = neuma.Neuma(function($) {
        return $(false);
      })();
      var audioContext = neuma._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      assert(outlet.gain.value === 0, "00:00.000");

      synth.toggle(0.100);
      synth.toggle(0.300);
      synth.setValue(0.400, 0);
      synth.setValue(0.400, true);

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

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1, "00:00.300");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.350");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.400");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1, "00:00.450");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1, "00:00.500");
    });
  });

  describe("$(true lag:0.1, curve:0.1)", function() {
    it("works", function() {
      var synth = neuma.Neuma(function($) {
        return $(true, { lag: 0.1, curve: 0.1 });
      })();
      var audioContext = neuma._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      assert(outlet.gain.value === 1, "00:00.000");

      synth.toggle(0.100);
      synth.toggle(0.300);
      synth.setValue(0.400, 0);
      synth.setValue(0.400, false);

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1, "00:00.050");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1, "00:00.100");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.31622776601683783, "00:00.150");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.09999999999999998, "00:00.200");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.0316227766016838, "00:00.250");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.010000000000000004, "00:00.300");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.6869345116433303, "00:00.350");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.9009999999999999, "00:00.400");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.28531107413817314, "00:00.450");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.09022328359457893, "00:00.500");
    });
  });

  describe("$(false, $(true))", function() {
    it("returns a GainNode that is connected with inputs", function() {
      var synth = neuma.Neuma(function($) {
        return $(false, $(true));
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
              value: 1,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
    });
  });
});
