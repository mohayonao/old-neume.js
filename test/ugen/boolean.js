"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/boolean"));

describe("ugen/boolean", function() {
  var Neume = null;

  before(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("$(false)", function() {
    it("returns a GainNode that is connected with a DC(1)", function() {
      var synth = new Neume.Synth(function($) {
        return $(false);
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
            inputs: [ DC(1) ]
          }
        ]
      });
    });
    it("works", function() {
      var synth = new Neume.Synth(function($) {
        return $(false);
      });

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      synth.toggle(0.100);
      synth.toggle(0.200);
      synth.setValue(0.300, 0);
      synth.setValue(0.300, true);
      synth.setValue(0.400, false);

      audioContext.$processTo("00:00.500");
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 1);
      assert(outlet.gain.$valueAtTime(0.150) === 1);
      assert(outlet.gain.$valueAtTime(0.200) === 0);
      assert(outlet.gain.$valueAtTime(0.250) === 0);
      assert(outlet.gain.$valueAtTime(0.300) === 1);
      assert(outlet.gain.$valueAtTime(0.350) === 1);
      assert(outlet.gain.$valueAtTime(0.400) === 0);
      assert(outlet.gain.$valueAtTime(0.450) === 0);
      assert(outlet.gain.$valueAtTime(0.500) === 0);
    });
  });

  describe("$(false, $(true))", function() {
    it("returns a GainNode that is connected with inputs", function() {
      var synth = new Neume.Synth(function($) {
        return $(false, $(true));
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
          }
        ]
      });
    });
  });
});
