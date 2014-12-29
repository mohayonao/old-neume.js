"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/env"));

describe("ugen/env", function() {
  var neu = null;

  beforeEach(function() {
    neu = neume(new global.AudioContext(), {
      scheduleInterval: 0.05, scheduleAheadTime: 0.05
    });
  });

  describe("graph", function() {
    it("$('env')", function() {
      var synth = neu.Synth(function($) {
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
            inputs: [ BUFSRC(128) ]
          }
        ]
      });
      assert(synth.toAudioNode().$inputs[0].$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("$('env', $('sin'))", function() {
      var synth = neu.Synth(function($) {
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
            inputs: [ OSCILLATOR("sine", 440) ]
          }
        ]
      });
    });
    it("$('env', { curve: 'sine' })", function() {
      var synth = neu.Synth(function($) {
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
                inputs: [ BUFSRC(128) ]
              }
            ]
          }
        ]
      });

      var curve = neu.Synth(function($) {
        return $("env", { curve: "sine" });
      }).toAudioNode().$inputs[0].curve;

      assert(curve instanceof Float32Array);
      assert(synth.toAudioNode().$inputs[0].curve === curve);
      assert(synth.toAudioNode().$inputs[0].$inputs[0].$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("$('env', { curve: 'welch' })", function() {
      var synth = neu.Synth(function($) {
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
                inputs: [ BUFSRC(128) ]
              }
            ]
          }
        ]
      });

      var curve = neu.Synth(function($) {
        return $("env", { curve: "welch" });
      }).toAudioNode().$inputs[0].curve;

      assert(curve instanceof Float32Array);
      assert(synth.toAudioNode().$inputs[0].curve === curve);
      assert(synth.toAudioNode().$inputs[0].$inputs[0].$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("$('env', { curve: 'squared' })", function() {
      var synth = neu.Synth(function($) {
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
                inputs: [ BUFSRC(128) ]
              }
            ]
          }
        ]
      });

      var curve = neu.Synth(function($) {
        return $("env", { curve: "squared" });
      }).toAudioNode().$inputs[0].curve;

      assert(curve instanceof Float32Array);
      assert(synth.toAudioNode().$inputs[0].curve === curve);
      assert(synth.toAudioNode().$inputs[0].$inputs[0].$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("$('env', { curve: 'cubic' })", function() {
      var synth = neu.Synth(function($) {
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
                inputs: [ BUFSRC(128) ]
              }
            ]
          }
        ]
      });

      var curve = neu.Synth(function($) {
        return $("env", { curve: "cubic" });
      }).toAudioNode().$inputs[0].curve;

      assert(curve instanceof Float32Array);
      assert(synth.toAudioNode().$inputs[0].curve === curve);
      assert(synth.toAudioNode().$inputs[0].$inputs[0].$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("$('env', { curve: -4 })", function() {
      var synth = neu.Synth(function($) {
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
                inputs: [ BUFSRC(128) ]
              }
            ]
          }
        ]
      });

      var curve = neu.Synth(function($) {
        return $("env", { curve: -4 });
      }).toAudioNode().$inputs[0].curve;
      var curve2 = neu.Synth(function($) {
        return $("env", { curve: +4 });
      }).toAudioNode().$inputs[0].curve;

      assert(curve instanceof Float32Array);
      assert(synth.toAudioNode().$inputs[0].curve === curve);
      assert(curve2 instanceof Float32Array);
      assert(curve !== curve2);
      assert(synth.toAudioNode().$inputs[0].$inputs[0].$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
    it("$('env', { curve: 0 })", function() {
      var synth = neu.Synth(function($) {
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
            inputs: [ BUFSRC(128) ]
          }
        ]
      });

      assert(synth.toAudioNode().$inputs[0].$inputs[0].buffer.getChannelData(0)[0] === 1);
    });
  });

  describe("works", function() {
    it("loopNode", function() {
      var synth = neu.Synth(function($) {
        return $("env", { table: [
          0, "<", 1, 0.1, 0, 0.1
        ] }).on("end", function() {
          throw new Error("NOT REACHED");
        });
      });

      var outlet = synth.toAudioNode().$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0);

        tick(1000);

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
      });
    });
    it("loopNode & releaseNode", function() {
      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 1.000, 1e-2));
      });
      var synth = neu.Synth(function($) {
        return $("env", { table: [
          0, "<", 1, 0.1, 0, 0.1, ">", 0, 0.5
        ] }).on("end", spy);
      });

      var outlet = synth.toAudioNode().$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0).release(0.500);

        tick(1000);

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
        assert(spy.calledOnce);
      });
    });
    it("release in the phase", function() {
      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 1.000, 1e-2));
      });
      var synth = neu.Synth(function($) {
        return $("env", { table: [
          0, 1, 10, ">", 0, 0.5
        ] }).on("end", spy);
      });

      var outlet = synth.toAudioNode().$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0).release(0.500);

        tick(1000);

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
        assert(spy.calledOnce);
      });
    });
    it("stop", function() {
      var synth = neu.Synth(function($) {
        return $("env", { table: [
          0, 1, 1
        ] }).on("end", function() {
          throw new Error("NOT REACHED");
        });
      });

      var outlet = synth.toAudioNode().$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0).stop(0.500);

        tick(1000);

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
      });
    });
    it("release after stop", function() {
      var synth = neu.Synth(function($) {
        return $("env", { table: [
          0, 1, 10, ">", 0, 0.5
        ] }).on("end", function() {
          throw new Error("NOT REACHED");
        });
      });

      var outlet = synth.toAudioNode().$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0).stop(0.100).release(0.500).release(0.250);

        tick(1000);

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
      });
    });
    it("curve:step", function() {
      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 1.000, 1e-2));
      });
      var synth = neu.Synth(function($) {
        return $("env", { table: [
          0, 1, 0.1, 0.25, 0.2, 0.25, 0.15, 0, 0.5
        ], curve: "step" }).on("end", spy);
      });

      var outlet = synth.toAudioNode().$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0.050);

        tick(1000);

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
        assert(spy.calledOnce);
      });
    });
    it("curve:hold", function() {
      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 1.000, 1e-2));
      });
      var synth = neu.Synth(function($) {
        return $("env", { table: [
          0, 1, 0.1, 0.25, 0.2, 0.25, 0.15, 0, 0.5
        ], curve: "hold" }).on("end", spy);
      });

      var outlet = synth.toAudioNode().$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0.050);

        tick(1000);

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
        assert(spy.calledOnce);
      });
    });
    it("curve:lin", function() {
      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 1.000, 1e-2));
      });
      var synth = neu.Synth(function($) {
        return $("env", { table: [
          0, 1, 0.1, 0.25, 0.2, 0.25, 0.15, 0, 0.5
        ], curve: "lin" }).on("end", spy);
      });

      var outlet = synth.toAudioNode().$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0.050);

        tick(1000);

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
        assert(spy.calledOnce);
      });
    });
    it("curve:exp", function() {
      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 1.000, 1e-2));
      });
      var synth = neu.Synth(function($) {
        return $("env", { table: [
          0, 1, 0.1, 0.25, 0.2, 0.25, 0.15, 0, 0.5
        ], curve: "exp" }).on("end", spy);
      });

      var outlet = synth.toAudioNode().$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0.050);

        tick(1000);

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
        assert(spy.calledOnce);
      });
    });
    // NOTE:
    // Tests below are approximate estimate.
    // We should check rendered curves actually.
    it("curve:sine", function() {
      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 1.000, 1e-2));
      });
      var synth = neu.Synth(function($) {
        return $("env", { table: [
          0, 1, 0.1, 0.25, 0.2, 0.25, 0.15, 0, 0.5
        ], curve: "sine" }).on("end", spy);
      });

      var outlet = synth.toAudioNode().$inputs[0].$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0.050);

        tick(1000);

        assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.000, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.100), 0.500, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.150), 1.000, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.840, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.681, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.522, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.363, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.363, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.363, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.363, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.327, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.290, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.254, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.218, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.181, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.145, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.109, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.072, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.036, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));
        assert(spy.calledOnce);
      });
    });
    it("curve:welch", function() {
      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 1.000, 1e-2));
      });
      var synth = neu.Synth(function($) {
        return $("env", { table: [
          0, 1, 0.1, 0.25, 0.2, 0.25, 0.15, 0, 0.5
        ], curve: "welch" }).on("end", spy);
      });

      var outlet = synth.toAudioNode().$inputs[0].$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0.050);

        tick(1000);

        assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.000, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.100), 0.500, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.150), 1.000, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.790, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.580, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.370, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.160, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.160, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.160, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.160, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.144, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.128, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.112, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.096, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.080, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.064, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.048, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.032, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.016, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));
        assert(spy.calledOnce);
      });
    });
    it("curve:squared", function() {
      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 1.000, 1e-2));
      });
      var synth = neu.Synth(function($) {
        return $("env", { table: [
          0, 1, 0.1, 0.25, 0.2, 0.25, 0.15, 0, 0.5
        ], curve: "squared" }).on("end", spy);
      });

      var outlet = synth.toAudioNode().$inputs[0].$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0.050);

        tick(1000);

        assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.000, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.100), 0.500, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.150), 1.000, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.875, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.750, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.625, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.500, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.500, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.500, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.500, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.450, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.400, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.350, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.300, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.250, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.200, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.150, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.100, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.050, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));
        assert(spy.calledOnce);
      });
    });
    it("curve:cubic", function() {
      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 1.000, 1e-2));
      });
      var synth = neu.Synth(function($) {
        return $("env", { table: [
          0, 1, 0.1, 0.25, 0.2, 0.25, 0.15, 0, 0.5
        ], curve: "cubic" }).on("end", spy);
      });

      var outlet = synth.toAudioNode().$inputs[0].$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0.050);

        tick(1000);

        assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.000, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.100), 0.500, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.150), 1.000, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.907, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.814, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.722, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.629, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.629, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.629, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.629, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.566, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.503, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.440, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.377, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.314, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.251, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.188, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.125, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.062, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));
        assert(spy.calledOnce);
      });
    });
    it("curve:-4", function() {
      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 1.000, 1e-2));
      });
      var synth = neu.Synth(function($) {
        return $("env", { table: [
          0, 1, 0.1, 0.25, 0.2, 0.25, 0.15, 0, 0.5
        ], curve: -4 }).on("end", spy);
      });

      var outlet = synth.toAudioNode().$inputs[0].$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0.050);

        tick(1000);

        assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.000, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.100), 0.500, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.150), 1.000, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.767, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.535, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.302, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.070, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.070, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.070, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.070, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.063, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.056, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.049, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.042, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.035, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.028, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.021, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.014, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.007, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));
        assert(spy.calledOnce);
      });
    });
    it("curve:+4", function() {
      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 1.000, 1e-2));
      });
      var synth = neu.Synth(function($) {
        return $("env", { table: [
          0, 1, 0.1, 0.25, 0.2, 0.25, 0.15, 0, 0.5
        ], curve: +4 }).on("end", spy);
      });

      var outlet = synth.toAudioNode().$inputs[0].$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0.050);

        tick(1000);

        assert(closeTo(outlet.gain.$valueAtTime(0.000), 0.000, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.050), 0.000, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.100), 0.500, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.150), 1.000, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.916, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.833, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.750, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.666, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.666, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.666, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.666, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.600, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.533, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.466, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.400, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.333, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.266, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.200, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.133, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.066, 1e-2));
        assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.000, 1e-2));
        assert(spy.calledOnce);
      });
    });
  });

  describe("$('adsr')", function() {
    it("works", function() {
      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 1.000, 1e-2));
      });
      var synth = neu.Synth(function($) {
        return $("adsr", { a: 0.1, d: 0.2, s: 0.25, r: 0.5 }).on("end", spy);
      });

      var outlet = synth.toAudioNode().$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0.050).release(0.500);

        tick(1000);

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
        assert(spy.calledOnce);
      });
    });
  });

  describe("$('asr')", function() {
    it("works", function() {
      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 1.000, 1e-2));
      });
      var synth = neu.Synth(function($) {
        return $("asr", { a: 0.3, s: 0.25, r: 0.5 }).on("end", spy);
      });

      var outlet = synth.toAudioNode().$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0.050).release(0.500);

        tick(1000);

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
        assert(spy.calledOnce);
      });
    });
  });

  describe("$('cutoff')", function() {
    it("works", function() {
      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 1.000, 1e-2));
      });
      var synth = neu.Synth(function($) {
        return $("cutoff", { r: 0.5 }).on("end", spy);
      });

      var outlet = synth.toAudioNode().$inputs[0];

      useTimer(neu.context, function(tick) {
        synth.start(0.050).release(0.500);

        tick(1000);

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
        assert(spy.calledOnce);
      });
    });
  });

});
