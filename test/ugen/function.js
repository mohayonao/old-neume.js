"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/function"));

var NOP = function() {};

describe("ugen/function", function() {
  var Neume = null;

  beforeEach(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("graph", function() {
    it("$(function)", function() {
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
    it("$(function, $('sin'))", function() {
      var synth = Neume.Synth(function($) {
        return $(NOP, $("sin"));
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
                name: "OscillatorNode",
                type: "sine",
                frequency: {
                  value: 440,
                  inputs: []
                },
                detune: {
                  value: 0,
                  inputs: []
                },
                inputs: []
              }
            ]
          }
        ]
      });
    });
  });

  describe("works", function() {
    it("evaluate", function() {
      var count = 0;
      var synth = Neume.Synth(function($) {
        return $(function() {
          return count++;
        });
      });

      synth.start(0);

      synth.evaluate(0.100);
      synth.evaluate(0.200);
      synth.evaluate(0.300);
      synth.evaluate(0.400);

      Neume.audioContext.$processTo("00:00.500");

      var outlet = synth.toAudioNode().$inputs[0];
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
    it("setValue", function() {
      var count = 0;
      var synth = Neume.Synth(function($) {
        return $(function() {
          return count++;
        });
      });

      synth.start(0);

      synth.setValue(0.300, function() {
        return 5;
      });
      synth.setValue(0.400, "not function");
      synth.evaluate(0.100);
      synth.evaluate(0.200);
      synth.evaluate(0.300);
      synth.evaluate(0.400);

      Neume.audioContext.$processTo("00:00.500");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 1);
      assert(outlet.gain.$valueAtTime(0.150) === 1);
      assert(outlet.gain.$valueAtTime(0.200) === 2);
      assert(outlet.gain.$valueAtTime(0.250) === 2);
      assert(outlet.gain.$valueAtTime(0.300) === 5);
      assert(outlet.gain.$valueAtTime(0.350) === 5);
      assert(outlet.gain.$valueAtTime(0.400) === 5);
      assert(outlet.gain.$valueAtTime(0.450) === 5);
      assert(outlet.gain.$valueAtTime(0.500) === 5);
    });
  });

});
