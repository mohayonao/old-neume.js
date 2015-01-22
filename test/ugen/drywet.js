"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/biquad"));
neume.use(require("../../src/ugen/drywet"));

describe("ugen/drywet", function() {
  var neu = null;

  beforeEach(function() {
    neu = neume({
      scheduleInterval: 0.05,
      scheduleAheadTime: 0.05,
      scheduleOffsetTime: 0.00,
    });
  });

  describe("graph", function() {
    it("$('drywet')", function() {
      var synth = neu.Synth(function($) {
        return $("drywet");
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
    it("$('drywet', { mix: -1 })", function() {
      var synth = neu.Synth(function($) {
        return $("sin")
        .$("drywet", { mix: -1, patch: function($, cutoff) {
          return $("lpf", { freq: cutoff }, $.inputs);
        }, args: [ 1200 ] });
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
    it("$('drywet', { mix: +1 })", function() {
      var synth = neu.Synth(function($) {
        return $("sin")
        .$("drywet", { mix: +1, patch: function($, cutoff) {
          return $("lpf", { freq: cutoff }, $.inputs);
        }, args: [ 1200 ] });
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "BiquadFilterNode",
            type: "lowpass",
            frequency: {
              value: 1200,
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
    it("$('drywet', { mix: 0 })", function() {
      var synth = neu.Synth(function($) {
        return $("sin")
        .$("drywet", { mix: 0, patch: function($, cutoff) {
          return $("lpf", { freq: cutoff }, $.inputs);
        }, args: [ 1200 ] });
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
              value: 0.7071067811865475,
              inputs: []
            },
            inputs: [ OSCILLATOR("sine", 440) ]
          },
          {
            name: "GainNode",
            gain: {
              value: 0.7071067811865475,
              inputs: []
            },
            inputs: [
              {
                name: "BiquadFilterNode",
                type: "lowpass",
                frequency: {
                  value: 1200,
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
          }
        ]
      });
    });
  });
  it("$('drywet', { mix: node })", function() {
    var synth = neu.Synth(function($) {
      return $("sin")
      .$("drywet", { mix: $("sin", { freq: 1 }), patch: function($, cutoff) {
        return $("lpf", { freq: cutoff }, $.inputs);
      }, args: [ 1200 ] });
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
            inputs: [
              {
                name: "WaveShaperNode",
                oversample: "none",
                inputs: [ OSCILLATOR("sine", 1) ]
              }
            ]
          },
          inputs: [ OSCILLATOR("sine", 440) ]
        },
        {
          name: "GainNode",
          gain: {
            value: 0,
            inputs: [
              {
                name: "WaveShaperNode",
                oversample: "none",
                inputs: [ OSCILLATOR("sine", 1) ]
              }
            ]
          },
          inputs: [
            {
              name: "BiquadFilterNode",
              type: "lowpass",
              frequency: {
                value: 1200,
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
        }
      ]
    });
  });

});
