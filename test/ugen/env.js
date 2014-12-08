"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/env"));
neume.use(require("../../src/ugen/osc"));

describe("ugen/env", function() {
  var Neume = null;

  beforeEach(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("$('env')", function() {
    describe("graph", function() {
      it("when have no inputs", function() {
        var synth = Neume.Synth(function($) {
          return $("env");
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
                inputs: []
              },
              inputs: [ DC(1) ]
            }
          ]
        });
      });
      it("when have inputs", function() {
        var synth = Neume.Synth(function($) {
          return $("env", $("sin"));
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
      it("when curve: sine", function() {
        var synth = Neume.Synth(function($) {
          return $("env", { curve: "sine" });
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
                  name: "GainNode",
                  gain: {
                    value: 0,
                    inputs: []
                  },
                  inputs: [ DC(1) ]
                }
              ]
            }
          ]
        });

        var curve = Neume.Synth(function($) {
          return $("env", { curve: "sine" });
        }).toAudioNode().$inputs[0].curve;

        assert(curve instanceof Float32Array);
        assert(synth.toAudioNode().$inputs[0].curve === curve);
      });
      it("when curve: welch", function() {
        var synth = Neume.Synth(function($) {
          return $("env", { curve: "welch" });
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
                  name: "GainNode",
                  gain: {
                    value: 0,
                    inputs: []
                  },
                  inputs: [ DC(1) ]
                }
              ]
            }
          ]
        });

        var curve = Neume.Synth(function($) {
          return $("env", { curve: "welch" });
        }).toAudioNode().$inputs[0].curve;

        assert(curve instanceof Float32Array);
        assert(synth.toAudioNode().$inputs[0].curve === curve);
      });
      it("when curve: squared", function() {
        var synth = Neume.Synth(function($) {
          return $("env", { curve: "squared" });
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
                  name: "GainNode",
                  gain: {
                    value: 0,
                    inputs: []
                  },
                  inputs: [ DC(1) ]
                }
              ]
            }
          ]
        });

        var curve = Neume.Synth(function($) {
          return $("env", { curve: "squared" });
        }).toAudioNode().$inputs[0].curve;

        assert(curve instanceof Float32Array);
        assert(synth.toAudioNode().$inputs[0].curve === curve);
      });
      it("when curve: cubic", function() {
        var synth = Neume.Synth(function($) {
          return $("env", { curve: "cubic" });
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
                  name: "GainNode",
                  gain: {
                    value: 0,
                    inputs: []
                  },
                  inputs: [ DC(1) ]
                }
              ]
            }
          ]
        });

        var curve = Neume.Synth(function($) {
          return $("env", { curve: "cubic" });
        }).toAudioNode().$inputs[0].curve;

        assert(curve instanceof Float32Array);
        assert(synth.toAudioNode().$inputs[0].curve === curve);
      });
      it("when curve: number", function() {
        var synth = Neume.Synth(function($) {
          return $("env", { curve: -4 });
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
                  name: "GainNode",
                  gain: {
                    value: 0,
                    inputs: []
                  },
                  inputs: [ DC(1) ]
                }
              ]
            }
          ]
        });

        var curve = Neume.Synth(function($) {
          return $("env", { curve: -4 });
        }).toAudioNode().$inputs[0].curve;
        var curve2 = Neume.Synth(function($) {
          return $("env", { curve: +4 });
        }).toAudioNode().$inputs[0].curve;

        assert(curve instanceof Float32Array);
        assert(synth.toAudioNode().$inputs[0].curve === curve);
        assert(curve2 instanceof Float32Array);
        assert(curve !== curve2);
      });
      it("when curve: 0", function() {
        var synth = Neume.Synth(function($) {
          return $("env", { curve: 0 });
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
                inputs: []
              },
              inputs: [ DC(1) ]
            }
          ]
        });
      });
    });
    it("loopNode", function() {
      var synth = Neume.Synth(function($) {
        return $("env", { table: [
          0, "<", 1, 0.1, 0, 0.1
        ] });
      });

      var ended = 0;

      synth.start(0).on("end", function(e) {
        ended = e.playbackTime;
      });

      Neume.audioContext.$processTo("00:01.000");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.151), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));

      assert(ended === 0);
    });
    it("loopNode & releaseNode", function() {
      var synth = Neume.Synth(function($) {
        return $("env", { table: [
          0, "<", 1, 0.1, 0, 0.1, ">", 0, 0.5
        ] });
      });

      var ended = 0;

      synth.start(0).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.500);

      Neume.audioContext.$processTo("00:01.000");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.151), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.900, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.800, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.700, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.600, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.400, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.300, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.200, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.100, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));

      assert(closeTo(ended, 1.000, 1e-2));
    });
    it("release in the phase", function() {
      var synth = Neume.Synth(function($) {
        return $("env", { table: [
          0, 1, 10, ">", 0, 0.5
        ] });
      });

      var ended = 0;

      synth.start(0).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.500);

      Neume.audioContext.$processTo("00:01.000");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.005, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.151), 0.015, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.020, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.025, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.030, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.035, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.040, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.045, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.050, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.045, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.040, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.035, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.030, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.025, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.020, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.015, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.005, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));

      assert(closeTo(ended, 1.000, 1e-2));
    });
    it("stop", function() {
      var synth = Neume.Synth(function($) {
        return $("env", { table: [
          0, 1, 1
        ] });
      });

      var ended = 0;

      synth.start(0).on("end", function(e) {
        ended = e.playbackTime;
      }).stop(0.500);

      Neume.audioContext.$processTo("00:01.000");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.050, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 0.100, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.151), 0.150, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.200, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.300, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.350, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.400, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.450, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.500, 1e-2));

      assert(ended === 0);
    });
    it("release after stop", function() {
      var synth = Neume.Synth(function($) {
        return $("env", { table: [
          0, 1, 10, ">", 0, 0.5
        ] });
      });

      var ended = 0;

      synth.start(0).on("end", function(e) {
        ended = e.playbackTime;
      }).stop(0.100).release(0.500).release(0.250);

      Neume.audioContext.$processTo("00:01.000");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.005, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.151), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.010, 1e-2));

      assert(ended === 0);
    });
    it("curve:step", function() {
      var synth = Neume.Synth(function($) {
        return $("env", { table: [
          0, 1, 0.1, 0.25, 0.2, 0.25, 0.15, 0, 0.5
        ], curve: "step" });
      });

      var ended = 0;

      synth.start(0.050).on("end", function(e) {
        ended = e.playbackTime;
      });

      Neume.audioContext.$processTo("00:01.000");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.151), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));

      assert(closeTo(ended, 1.000, 1e-2));
    });
    it("curve:hold", function() {
      var synth = Neume.Synth(function($) {
        return $("env", { table: [
          0, 1, 0.1, 0.25, 0.2, 0.25, 0.15, 0, 0.5
        ], curve: "hold" });
      });

      var ended = 0;

      synth.start(0.050).on("end", function(e) {
        ended = e.playbackTime;
      });

      Neume.audioContext.$processTo("00:01.000");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.151), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.351), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));

      assert(closeTo(ended, 1.000, 1e-2));
    });
    it("curve:lin", function() {
      var synth = Neume.Synth(function($) {
        return $("env", { table: [
          0, 1, 0.1, 0.25, 0.2, 0.25, 0.15, 0, 0.5
        ], curve: "lin" });
      });

      var ended = 0;

      synth.start(0.050).on("end", function(e) {
        ended = e.playbackTime;
      });

      Neume.audioContext.$processTo("00:01.000");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.812, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.625, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.437, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.225, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.200, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.175, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.150, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.125, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.100, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.075, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.050, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.025, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));

      assert(closeTo(ended, 1.000, 1e-2));
    });
    it("curve:exp", function() {
      var synth = Neume.Synth(function($) {
        return $("env", { table: [
          0, 1, 0.1, 0.25, 0.2, 0.25, 0.15, 0, 0.5
        ], curve: "exp" });
      });

      var ended = 0;

      synth.start(0.050).on("end", function(e) {
        ended = e.playbackTime;
      });

      Neume.audioContext.$processTo("00:01.000");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 0.001, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.707, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.353, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.072, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.020, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.006, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.001, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));

      assert(closeTo(ended, 1.000, 1e-2));
    });
  });

  describe("$('adsr')", function() {
    it("works", function() {
      var synth = Neume.Synth(function($) {
        return $("adsr", { a: 0.1, d: 0.2, s: 0.25, r: 0.5 });
      });

      var ended = 0;

      synth.start(0.050).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.500);

      Neume.audioContext.$processTo("00:01.000");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.812, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.625, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.437, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.225, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.200, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.175, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.150, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.125, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.100, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.075, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.050, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.025, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));

      assert(closeTo(ended, 1.000, 1e-2));
    });
  });

  describe("$('dadsr')", function() {
    it("works", function() {
      var synth = Neume.Synth(function($) {
        return $("dadsr", { delay: 0.05, a: 0.1, d: 0.2, s: 0.25, r: 0.5 });
      });

      var ended = 0;

      synth.start(0.000).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.500);

      Neume.audioContext.$processTo("00:01.000");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.812, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.625, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.437, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.225, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.200, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.175, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.150, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.125, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.100, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.075, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.050, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.025, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));

      assert(closeTo(ended, 1.000, 1e-2));
    });
  });

  describe("$('asr')", function() {
    it("works", function() {
      var synth = Neume.Synth(function($) {
        return $("asr", { a: 0.3, s: 0.25, r: 0.5 });
      });

      var ended = 0;

      synth.start(0.050).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.500);

      Neume.audioContext.$processTo("00:01.000");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 0.041, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 0.083, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.125, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.166, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.208, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.250, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.225, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.200, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.175, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.150, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.125, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.100, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.075, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.050, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.025, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));

      assert(closeTo(ended, 1.000, 1e-2));
    });
  });

  describe("$('cutoff')", function() {
    it("works", function() {
      var synth = Neume.Synth(function($) {
        return $("cutoff", { r: 0.5 });
      });

      var ended = 0;

      synth.start(0.050).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.500);

      Neume.audioContext.$processTo("00:01.000");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(closeTo(outlet.gain.$valueAtTime(0.000), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 1.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.900, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.800, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.700, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.600, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.500, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.400, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.300, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.200, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.100, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));

      assert(closeTo(ended, 1.000, 1e-2));
    });
  });

});
