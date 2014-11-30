"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/mono"));
neume.use(require("../../src/ugen/osc"));

describe("ugen/mono", function() {
  var Neume = null;

  before(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("$(mono, $(sin))", function() {
    it("graph", function() {
      var audioContext = Neume.context;
      var synth = new Neume(function($) {
        return $("mono", $("sin"));
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
              value: 1,
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

});
