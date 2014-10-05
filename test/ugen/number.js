"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/number"));

describe("ugen/number", function() {
  var Neume = null;

  before(function() {
    Neume = neume.exports(new window.AudioContext());
  });

  describe("$(440)", function() {
    it("returns a GainNode that is connected with a DC(1)", function() {
      var synth = new Neume(function($) {
        return $(0);
      })();
      assert.deepEqual(synth.toAudioNode().toJSON(), {
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
        return $(0);
      })();

      var audioContext = Neume.context;
      var outlet = synth.toAudioNode();

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      assert(outlet.gain.value === 0, "00:00.000");

      synth.setValue(0.100, "1");
      synth.setValue(0.200, 2);

      audioContext.$processTo("00:00.500");
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(outlet.gain.$valueAtTime(0.150) === 0);
      assert(outlet.gain.$valueAtTime(0.200) === 2);
      assert(outlet.gain.$valueAtTime(0.250) === 2);
      assert(outlet.gain.$valueAtTime(0.300) === 2);
      assert(outlet.gain.$valueAtTime(0.350) === 2);
      assert(outlet.gain.$valueAtTime(0.400) === 2);
      assert(outlet.gain.$valueAtTime(0.450) === 2);
      assert(outlet.gain.$valueAtTime(0.500) === 2);
    });
  });

  describe("$(0 lag:0.1, curve:0.1)", function() {
    it("works", function() {
      var synth = new Neume(function($) {
        return $(0, { lag: 0.1, curve: 0.1 });
      })();

      var audioContext = Neume.context;
      var outlet = synth.toAudioNode();

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      assert(outlet.gain.value === 0, "00:00.000");

      synth.setValue(0.100, "1");
      synth.setValue(0.200, 2);

      audioContext.$processTo("00:00.500");
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(outlet.gain.$valueAtTime(0.150) === 0);
      assert(outlet.gain.$valueAtTime(0.200) === 0);
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 1.367544467966324 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 1.7999999999999998, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 1.9367544467966324, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 1.98              , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 1.9936754446796632, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 1.998             , 1e-6));
    });
  });

  describe("$(1, $(2), $(3))", function() {
    it("returns a GainNode that is connected with inputs", function() {
      var synth = new Neume(function($) {
        return $(1, $(2), $(3));
      })();
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
