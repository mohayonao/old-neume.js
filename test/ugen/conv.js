"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/conv"));

describe("ugen/conv", function() {
  var Neume = null;

  before(function() {
    Neume = neume.exports(new window.AudioContext());
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
      var context = new neume.Context(new window.AudioContext().destination);
      var buffer = neume.Buffer.from(context, [ 1, 2, 3, 4 ]);

      var synth = new Neume(function($) {
        return $("conv", { buf: buffer, normalize: false }, $("sin"));
      })();

      assert.deepEqual(synth.toAudioNode().toJSON(), {
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
      });

      assert.deepEqual(synth.toAudioNode().buffer.toJSON(), {
        name: "AudioBuffer",
        sampleRate: 44100,
        length: 4,
        duration: 0.00009070294784580499,
        numberOfChannels: 1
      });
    });
  });

});
