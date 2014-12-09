"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/delay"));

describe("ugen/delay", function() {
  var Neume = null;

  beforeEach(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("graph", function() {
    it("$('delay')", function() {
      var synth = Neume.Synth(function($) {
        return $("delay");
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
              inputs: []
            },
            inputs: []
          }
        ]
      });
    });
    it("$('delay', $('sin'))", function() {
      var synth = Neume.Synth(function($) {
        return $("delay", $("sin"));
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
    it("$('delay', { feedback: 0.5 })", function() {
      var synth = Neume.Synth(function($) {
        return $("delay", { feedback: 0.5 });
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
              inputs: []
            },
            inputs: [
              {
                name: "GainNode",
                gain: {
                  value: 0.5,
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
    });

    it("$('delay', { feedback: 0.5 })", function() {
      var synth = Neume.Synth(function($) {
        return $("delay", { feedback: 0.5 }, $("sin"));
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
                  value: 0.5,
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
    });
  });

  describe("parameters", function() {
    it("full name", function() {
      var json = Neume.Synth(function($) {
        return $("delay", { delayTime: 1 });
      }).toAudioNode().toJSON().inputs[0];

      assert(json.delayTime.value === 1);

      var synth = Neume.Synth(function($) {
        return $("delay", { delay: $("sin"), maxDelayTime: 2 });
      });

      assert(synth.toAudioNode().$inputs[0].$maxDelayTime === 2);
    });
    it("short name", function() {
      var json = Neume.Synth(function($) {
        return $("delay", { delay: 1 });
      }).toAudioNode().toJSON().inputs[0];

      assert(json.delayTime.value === 1);

      var synth = Neume.Synth(function($) {
        return $("delay", { delay: $("sin"), maxDelay: 2 });
      });

      assert(synth.toAudioNode().$inputs[0].$maxDelayTime === 2);
    });
  });

});
