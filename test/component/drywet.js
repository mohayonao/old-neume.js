"use strict";

var neume = require("../../src");

describe("neume.DryWet", function() {
  var context = null;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination);
  });

  describe("constructor", function() {
    it("(context: neume.Context, dryIn: any, wetIn: any, mixIn: any)", function() {
      var dryIn = context.createOscillator();
      var wetIn = context.createDelay();
      var mixIn = context.createGain();
      var instance = new neume.DryWet(context, dryIn, wetIn, mixIn);

      assert(instance instanceof neume.DryWet);
      assert(instance instanceof neume.Component);
    });
    it("constructor: (dryIn) // when mixIn is 0", function() {
      var dryIn = context.createOscillator();
      var wetIn = context.createDelay();
      var mixIn = 0;
      var instance = new neume.DryWet(context, dryIn, wetIn, mixIn);

      assert(instance instanceof neume.Component);
      assert.deepEqual(dryIn.toJSON(), instance.toAudioNode().toJSON());
    });
    it("constructor: (wetIn) // when mixIn is 1", function() {
      var dryIn = context.createOscillator();
      var wetIn = context.createDelay();
      var mixIn = 1;
      var instance = new neume.DryWet(context, dryIn, wetIn, mixIn);

      assert(instance instanceof neume.Component);
      assert.deepEqual(wetIn.toJSON(), instance.toAudioNode().toJSON());
    });
  });

  describe("#toAudioNode", function() {
    it("(): AudioNode // when dryIn, wetIn, number", function() {
      var dryIn = context.createOscillator();
      var wetIn = context.createDelay();
      var mixIn = Math.random();
      var a = new neume.DryWet(context, dryIn, wetIn, mixIn);

      assert(a.toAudioNode() instanceof global.AudioNode);
      assert(a.toAudioNode() === a.toAudioNode());
      assert.deepEqual(a.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: mixIn,
              inputs: []
            },
            inputs: [ wetIn.toJSON() ]
          },
          {
            name: "GainNode",
            gain: {
              value: 1 - mixIn,
              inputs: []
            },
            inputs: [ dryIn.toJSON() ]
          }
        ]
      });
    });
    it("(): AudioNode // when dryIn, wetIn, node", function() {
      var dryIn = context.createOscillator();
      var wetIn = context.createDelay();
      var mixIn = context.createBufferSource();
      var a = new neume.DryWet(context, dryIn, wetIn, mixIn);

      assert(a.toAudioNode() instanceof global.AudioNode);
      assert(a.toAudioNode() === a.toAudioNode());
      assert.deepEqual(a.toAudioNode().toJSON(), {
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
              inputs: [
                {
                  name: "WaveShaperNode",
                  oversample: "none",
                  inputs: [ mixIn.toJSON() ]
                }
              ]
            },
            inputs: [ wetIn.toJSON() ]
          },
          {
            name: "GainNode",
            gain: {
              value: 0,
              inputs: [
                {
                  name: "WaveShaperNode",
                  oversample: "none",
                  inputs: [ mixIn.toJSON() ]
                }
              ]
            },
            inputs: [ dryIn.toJSON() ]
          }
        ]
      });
    });
  });

  describe("#connect", function() {
    it("(to: any): self", function() {
      var toNode = context.createGain();
      var dryIn = context.createOscillator();
      var wetIn = context.createDelay();
      var mixIn = context.createBufferSource();
      var a = new neume.DryWet(context, dryIn, wetIn, mixIn);

      assert(a.connect(toNode) === a);
      assert.deepEqual(toNode.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ a.toAudioNode().toJSON() ]
      });
    });
  });

});
