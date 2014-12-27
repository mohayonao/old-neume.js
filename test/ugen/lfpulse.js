"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/lfpulse"));

describe("ugen/lfpulse", function() {
  var neu = null;

  beforeEach(function() {
    neu = neume(new global.AudioContext(), {
      scheduleInterval: 0.05, scheduleAheadTime: 0.05
    });
  });

  describe("graph", function() {
    it("$('lfpulse')", function() {
      var synth = neu.Synth(function($) {
        return $("lfpulse");
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "WaveShaperNode",
            oversample: "none",
            inputs: [
              {
                name: "OscillatorNode",
                type: "custom",
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
    it("$('lfpulse', { width: 0.25 })", function() {
      var synth = neu.Synth(function($) {
        return $("lfpulse", { width: 0.25 });
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "WaveShaperNode",
            oversample: "none",
            inputs: [
              {
                name: "OscillatorNode",
                type: "custom",
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
                inputs: [ DC(1) ]
              }
            ]
          }
        ]
      });
    });
    it("$('lfpulse', { width: $('delay') })", function() {
      var synth = neu.Synth(function($) {
        return $("lfpulse", { width: $("delay") });
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "WaveShaperNode",
            oversample: "none",
            inputs: [
              {
                name: "OscillatorNode",
                type: "custom",
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
                  value: -2,
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
              },
              DC(1)
            ]
          }
        ]
      });
    });
    it("$('lfpulse', $('sin'))", function() {
      var synth = neu.Synth(function($) {
        return $("lfpulse", $("sin"));
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
                      type: "custom",
                      frequency: {
                        value: 2,
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
          }
        ]
      });
    });
  });

  describe("works", function() {
    it("start/stop", sinon.test(function() {
      var tick = function(t) {
        for (var i = 0; i < t / 50; i++) {
          this.clock.tick(50);
          neu.audioContext.$process(0.05);
        }
      }.bind(this);

      var synth = neu.Synth(function($) {
        return $("lfpulse");
      });

      synth.start(0.100);
      synth.stop(0.200);

      var outlet = synth.toAudioNode().$inputs[0].$inputs[0];

      tick(300);
      assert(outlet.$stateAtTime(0.000) === "SCHEDULED");
      assert(outlet.$stateAtTime(0.050) === "SCHEDULED");
      assert(outlet.$stateAtTime(0.100) === "PLAYING");
      assert(outlet.$stateAtTime(0.150) === "PLAYING");
      assert(outlet.$stateAtTime(0.200) === "FINISHED");
      assert(outlet.$stateAtTime(0.250) === "FINISHED");
    }));
  });

});
