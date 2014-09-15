"use strict";

var neume = require("../src/neume");

neume.use(require("../src/ugen/boolean"));

describe("ugen/boolean", function() {
  describe("$(false)", function() {
    it("returns a GainNode that is connected with a DC(1)", function() {
      var synth = neume.Neume(function($) {
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
      var synth = neume.Neume(function($) {
        return $(false);
      })();
      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      synth.toggle(0.100);
      synth.toggle(0.300);
      synth.setValue(0.400, 0);
      synth.setValue(0.400, true);

      audioContext.$process(0.500);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 1);
      assert(outlet.gain.$valueAtTime(0.150) === 1);
      assert(outlet.gain.$valueAtTime(0.200) === 1);
      assert(outlet.gain.$valueAtTime(0.250) === 1);
      assert(outlet.gain.$valueAtTime(0.300) === 0);
      assert(outlet.gain.$valueAtTime(0.350) === 0);
      assert(outlet.gain.$valueAtTime(0.400) === 1);
      assert(outlet.gain.$valueAtTime(0.450) === 1);
      assert(outlet.gain.$valueAtTime(0.500) === 1);
    });
  });

  describe("$(true lag:0.1, curve:0.1)", function() {
    it("works", function() {
      var synth = neume.Neume(function($) {
        return $(true, { lag: 0.1, curve: 0.1 });
      })();
      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      assert(outlet.gain.value === 1, "00:00.000");

      synth.toggle(0.100);
      synth.toggle(0.300);
      synth.setValue(0.400, 0);
      synth.setValue(0.400, false);

      audioContext.$process(0.500);
      assert(outlet.gain.$valueAtTime(0.050) === 1);
      assert(outlet.gain.$valueAtTime(0.100) === 1);
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 0.31622776601683783 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.09999999999999998 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.0316227766016838  , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.010000000000000004, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.6869345116433303  , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.9009999999999999  , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.2849212171811714  , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.09010000000000014 , 1e-6));
    });
  });

  describe("$(false, $(true))", function() {
    it("returns a GainNode that is connected with inputs", function() {
      var synth = neume.Neume(function($) {
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
