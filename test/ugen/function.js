"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/function"));

var NOP = function() {};

describe("ugen/function", function() {
  var Neume = null;

  beforeEach(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("$(func)", function() {
    it("returns a GainNode that is connected with a DC(1)", function() {
      var synth = Neume.Synth(function($) {
        return $(NOP);
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
      var synth = Neume.Synth(function($) {
        return $(function(t, count) {
          return count;
        });
      });

      synth.start(0);

      var outlet = synth.toAudioNode().$inputs[0];
      assert(outlet.gain.value === 0, "00:00.000");

      synth.evaluate(0.100);
      synth.evaluate(0.300);
      synth.setValue(0.200, 0);
      synth.setValue(0.200, function(t, count) {
        return count * 2;
      });

      Neume.audioContext.$processTo("00:00.500");

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

  describe("$(func, $(func))", function() {
    it("returns a GainNode that is connected with inputs", function() {
      var synth = Neume.Synth(function($) {
        return $(NOP, $(NOP));
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
                  value: 0,
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
