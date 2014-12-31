"use strict";

var neume = require("../../src");

describe("neume.UGenPromise", function() {
  var context = null;
  var synth = null;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination);
    synth = new neume.Synth(context, NOP, []);
  });

  describe("constructor", function() {
    it("(synth: neume.Synth, id: string)", function() {
      var promise = new neume.UGenPromise(synth, "foo");

      assert(promise instanceof neume.UGenPromise);
    });
  });
  describe("resolve", function() {
    it("(ugen: neume.UGen)", function() {
      var promise = new neume.UGenPromise(synth, "foo");
      var input = context.createOscillator();
      var ugen = context.createBiquadFilter();
      var output = context.createDelay();

      context.connect(input, promise);
      context.connect(promise, output);

      promise.resolve(ugen);

      assert(output.toJSON(), {
        name: "DelayNode",
        delayTime: {
          value: 0,
          inputs: []
        },
        inputs: [
          {
            name: "BiquadFilterNode",
            type: "lowpass",
            frequency: {
              value: 350,
              inputs: []
            },
            detune: {
              value: 0,
              inputs: []
            },
            Q: {
              value: 1,
              inputs: []
            },
            gain: {
              value: 0,
              inputs: []
            },
            inputs: [ OSCILLATOR("sine", 440) ]
          }
        ]
      });
    });
  });
  describe("not resolved", function() {
    it("works", function() {
      var promise = new neume.UGenPromise(synth, "foo");
      var output = context.createGain();

      context.connect(promise, output);

      assert(output.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: []
      });
    });
  });
});
