"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/conv"));

describe("ugen/conv", function() {
  var Neume = null;

  beforeEach(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("$(conv $(sin))", function() {
    /*
     * +--------+
     * | $(sin) |
     * +--------+
     *   |
     * +-------------------+
     * | ConvolverNode     |
     * | - buffer: null    |
     * | - normalize: true |
     * +-------------------+
     *   |
     */
    it("return a ConvolverNode that is connected with $(sin)", function() {
      var buffer = neume.Buffer.from(Neume.context, [ 1, 2, 3, 4 ]);

      var synth = Neume.Synth(function($) {
        return $("conv", { buf: buffer, normalize: false }, $("sin"));
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "ConvolverNode",
            normalize: false,
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

      assert.deepEqual(synth.toAudioNode().$inputs[0].buffer.toJSON(), {
        name: "AudioBuffer",
        sampleRate: 44100,
        length: 4,
        duration: 0.00009070294784580499,
        numberOfChannels: 1
      });
    });
  });

  describe("parameter check", function() {
    var buffer;

    beforeEach(function() {
      buffer = Neume.Buffer.from([ 1, 2, 3, 4 ]);
    });

    it("full name", function() {
      var json = Neume.Synth(function($) {
        return $("conv", { buffer: buffer, normalize: false });
      }).toAudioNode().toJSON().inputs[0];

      // assert.deepEqual(json.buffer, buffer.toAudioBuffer().toJSON());
      assert(json.normalize === false);
    });
    it("alias", function() {
      var json = Neume.Synth(function($) {
        return $("conv", { buf: buffer, normalize: false });
      }).toAudioNode().toJSON().inputs[0];

      // assert.deepEqual(json.buffer, buffer.toAudioBuffer().toJSON());
      assert(json.normalize === false);
    });
  });

});
