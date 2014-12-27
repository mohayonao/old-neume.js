"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/biquad"));
neume.use(require("../../src/ugen/drywet"));

describe("ugen/drywet", function() {
  var neu = null;

  beforeEach(function() {
    neu = neume(new global.AudioContext());
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
        inputs: [ DC(0) ]
      });
    });
    it("$('drywet', { mix: -1 })", function() {
      var synth = neu.Synth(function($) {
        return $("sin")
        .$("drywet", { mix: -1, efx: function($, cutoff) {
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
    it("$('drywet', { mix: +1 })", function() {
      var synth = neu.Synth(function($) {
        return $("sin")
        .$("drywet", { mix: +1, efx: function($, cutoff) {
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
    it("$('drywet', { mix: 0 })", function() {
      var synth = neu.Synth(function($) {
        return $("sin")
        .$("drywet", { mix: 0, efx: function($, cutoff) {
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
          }
        ]
      });
    });
  });
  it("$('drywet', { mix: node })", function() {
    var synth = neu.Synth(function($) {
      return $("sin")
      .$("drywet", { mix: $("sin", { freq: 1 }), efx: function($, cutoff) {
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
                inputs: [
                  {
                    name: "OscillatorNode",
                    type: "sine",
                    frequency: {
                      value: 1,
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
        },
        {
          name: "GainNode",
          gain: {
            value: 0,
            inputs: [
              {
                name: "WaveShaperNode",
                oversample: "none",
                inputs: [
                  {
                    name: "OscillatorNode",
                    type: "sine",
                    frequency: {
                      value: 1,
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
        }
      ]
    });
  });

});
