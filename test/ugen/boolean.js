"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/boolean"));

describe("ugen/boolean", function() {
  var Neume = null;

  beforeEach(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("$graph", function() {
    it("$(true)", function() {
      var synth = Neume.Synth(function($) {
        return $(true);
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
              value: 1,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
    });
    it("$(false)", function() {
      var synth = Neume.Synth(function($) {
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
  });

  describe("works", function() {
    it("setValue", function() {
      var synth = Neume.Synth(function($) {
        return $(true);
      });

      synth.start(0);

      synth.setValue(0.100, false);
      synth.setValue(0.200, "true");
      synth.setValue(0.300, true);
      synth.setValue(0.400, false);

      Neume.audioContext.$processTo("00:00.500");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(outlet.gain.$valueAtTime(0.000) === 1);
      assert(outlet.gain.$valueAtTime(0.050) === 1);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(outlet.gain.$valueAtTime(0.150) === 0);
      assert(outlet.gain.$valueAtTime(0.200) === 0);
      assert(outlet.gain.$valueAtTime(0.250) === 0);
      assert(outlet.gain.$valueAtTime(0.300) === 1);
      assert(outlet.gain.$valueAtTime(0.350) === 1);
      assert(outlet.gain.$valueAtTime(0.400) === 0);
      assert(outlet.gain.$valueAtTime(0.450) === 0);
      assert(outlet.gain.$valueAtTime(0.500) === 0);
    });
    it("toggle", function() {
      var synth = Neume.Synth(function($) {
        return $(false);
      });

      synth.start(0);

      synth.toggle(0.100);
      synth.toggle(0.200);
      synth.toggle(0.300);
      synth.toggle(0.400);

      Neume.audioContext.$processTo("00:00.500");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(outlet.gain.$valueAtTime(0.000) === 0);
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

});
