"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/delay"));

describe("ugen/delay", function() {
  var Neume = null;

  before(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("$(delay delay:0.5 $(sin))", function() {
    it("return a DelayNode that is connected with $(sin)", function() {
      var synth = new Neume.Synth(function($) {
        return $("delay", { delay: 0.5 }, $("sin"));
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "DelayNode",
            delayTime: {
              value: 0.5,
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

      assert(synth.toAudioNode().$inputs[0].$maxDelayTime === 0.5);
    });
  });

  describe("$(delay delay:0.5, feedback:0.2 $(sin))", function() {
    it("return a DelayNode that is connected with $(sin)", function() {
      var synth = new Neume.Synth(function($) {
        return $("delay", { delay: 0.5, feedback: 0.2 }, $("sin"));
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "DelayNode",
            delayTime: {
              value: 0.5,
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
              },
              {
                name: "GainNode",
                gain: {
                  value: 0.2,
                  inputs: []
                },
                inputs: [
                  "<circular:DelayNode>"
                ]
              }
            ]
          }
        ]
      });

      assert(synth.toAudioNode().$inputs[0].$maxDelayTime === 0.5);
    });
  });

  describe("$(delay delay:$(delay) $(sin))", function() {
    it("return a DelayNode that is connected with $(sin)", function() {
      var synth = new Neume.Synth(function($) {
        return $("delay", { delay: $("delay") }, $("sin"));
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "DelayNode",
            delayTime: {
              value: 0,
              inputs: [
                {
                  name: "DelayNode",
                  delayTime: {
                    value: 0,
                    inputs: []
                  },
                  inputs: [ DC(0) ]
                }
              ]
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

  describe("parameter check", function() {
    it("full name", function() {
      var json = new Neume.Synth(function($) {
        return $("delay", { delayTime: 1 });
      }).toAudioNode().toJSON().inputs[0];

      assert(json.delayTime.value === 1);
    });
    it("alias", function() {
      var json = new Neume.Synth(function($) {
        return $("delay", { delay: 1 });
      }).toAudioNode().toJSON().inputs[0];

      assert(json.delayTime.value === 1);
    });
  });

});
