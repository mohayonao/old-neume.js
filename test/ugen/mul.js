"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/mul"));

describe("ugen/mul", function() {
  var Neume = null;

  beforeEach(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("graph", function() {
    it("$('*'')", function() {
      var synth = Neume.Synth(function($) {
        return $("*");
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ DC(1) ]
      });
      assert(synth.toAudioNode().$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("$('*', $('sin'), 0)", function() {
      var synth = Neume.Synth(function($) {
        return $("*", $("sin"), 0);
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ DC(0) ]
      });
      assert(synth.toAudioNode().$inputs[0].buffer.getChannelData(0)[0] === 0);
    });
    it("$('*', $('sin'), 1)", function() {
      var synth = Neume.Synth(function($) {
        return $("*", $("sin"), 1);
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
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
      });
    });
    it("$('*', $('sin'), 0.5)", function() {
      var synth = Neume.Synth(function($) {
        return $("*", $("sin"), 0.5);
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
    });
    it("$('*', 1, $('sin', {freq:1}), $('sin', {freq:2}), $('sin', {freq:3}))", function() {
      var synth = Neume.Synth(function($) {
        return $("*", 1, $("sin", { freq: 1 }), $("sin", { freq: 2 }), $("sin", { freq: 3 }));
      });

      function oscillator(freq) {
        var node = Neume.context.createOscillator();
        node.frequency.value = freq;
        return node.toJSON();
      }

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
              inputs: [ oscillator(3) ]
            },
            inputs: [
              {
                name: "GainNode",
                gain: {
                  value: 0,
                  inputs: [ oscillator(2) ]
                },
                inputs: [ oscillator(1) ]
              }
            ]
          }
        ]
      });
    });
    it("$('*', 1, $('sin', {freq:1}), 2, $('sin', {freq:2}), 3, $('sin', {freq:3}))", function() {
      var synth = Neume.Synth(function($) {
        return $("*", 1, $("sin", { freq: 1 }), 2, $("sin", { freq: 2 }), 3, $("sin", { freq: 3 }));
      });

      function oscillator(freq) {
        var node = Neume.context.createOscillator();
        node.frequency.value = freq;
        return node.toJSON();
      }

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
              value: 6,
              inputs: []
            },
            inputs: [
              {
                name: "GainNode",
                gain: {
                  value: 0,
                  inputs: [ oscillator(3) ]
                },
                inputs: [
                  {
                    name: "GainNode",
                    gain: {
                      value: 0,
                      inputs: [ oscillator(2) ]
                    },
                    inputs: [ oscillator(1) ]
                  }
                ]
              }
            ]
          }
        ]
      });
    });
  });

});
