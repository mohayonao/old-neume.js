"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/mul"));

describe("ugen/mul", function() {
  var neu = null;

  beforeEach(function() {
    neu = neume({
      scheduleInterval: 0.05,
      scheduleAheadTime: 0.05,
      scheduleOffsetTime: 0.00,
    });
  });

  describe("graph", function() {
    it("$('*'')", function() {
      var synth = neu.Synth(function($) {
        return $("*");
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ BUFSRC(128) ]
      });
      assert(synth.toAudioNode().$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("$('*', $('sin'), 0)", function() {
      var synth = neu.Synth(function($) {
        return $("*", $("sin"), 0);
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: []
      });
    });
    it("$('*', $('sin'), 1)", function() {
      var synth = neu.Synth(function($) {
        return $("*", $("sin"), 1);
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ OSCILLATOR("sine", 440) ]
      });
    });
    it("$('*', $('sin'), 0.5)", function() {
      var synth = neu.Synth(function($) {
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
            inputs: [ OSCILLATOR("sine", 440) ]
          }
        ]
      });
    });
    it("$('*', 1, $('sin', {freq:1}), $('sin', {freq:2}), $('sin', {freq:3}))", function() {
      var synth = neu.Synth(function($) {
        return $("*", 1, $("sin", { freq: 1 }), $("sin", { freq: 2 }), $("sin", { freq: 3 }));
      });

      function oscillator(freq) {
        var node = neu.context.createOscillator();
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
      var synth = neu.Synth(function($) {
        return $("*", 1, $("sin", { freq: 1 }), 2, $("sin", { freq: 2 }), 3, $("sin", { freq: 3 }));
      });

      function oscillator(freq) {
        var node = neu.context.createOscillator();
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
