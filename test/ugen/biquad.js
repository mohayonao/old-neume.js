"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/biquad"));

describe("ugen/biquad", function() {
  var Neume = null;

  beforeEach(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("$(lpf, $(sin))", function() {
    /*
     * +------------------+
     * | OscillatorNode   |
     * | - type: sine     |
     * | - frequency: 440 |
     * | - detune: 0      |
     * +------------------+
     *   |
     * +------------------+
     * | BiquadFilterNode |
     * | - type: lowpass  |
     * | - frequency: 350 |
     * | - detune: 0      |
     * | - Q: 1           |
     * | - gain: 0        |
     * +------------------+
     *   |
     */
    it("returns a BiquadFilterNode", function() {
      var synth = Neume.Synth(function($) {
        return $("lpf", $("sin"));
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
              value: 350,
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
  });

  describe("parameter check", function() {
    it("full name", function() {
      var json = Neume.Synth(function($) {
        return $("lpf", { frequency: 220, detune: 1200, Q: 10, gain: 5 });
      }).toAudioNode().toJSON().inputs[0];

      assert(json.frequency.value === 220);
      assert(json.detune.value === 1200);
      assert(json.Q.value === 10);
      assert(json.gain.value === 5);
    });
    it("alias", function() {
      var json = Neume.Synth(function($) {
        return $("lpf", { freq: 220, dt: 1200 });
      }).toAudioNode().toJSON().inputs[0];

      assert(json.frequency.value === 220);
      assert(json.detune.value === 1200);
    });
  });

  describe("type", function() {
    it("(default) -> lowpass", function() {
      var synth = Neume.Synth(function($) {
        return $("biquad");
      });
      assert(synth.toAudioNode().$inputs[0].type === "lowpass");
    });
    it("lowpass -> lowpass", function() {
      var synth = Neume.Synth(function($) {
        return $("biquad", { type: "lowpass" });
      });
      assert(synth.toAudioNode().$inputs[0].type === "lowpass");
    });
    it("highpass -> highpass", function() {
      var synth = Neume.Synth(function($) {
        return $("biquad", { type: "highpass" });
      });
      assert(synth.toAudioNode().$inputs[0].type === "highpass");
    });
    it("bandpass -> bandpass", function() {
      var synth = Neume.Synth(function($) {
        return $("biquad", { type: "bandpass" });
      });
      assert(synth.toAudioNode().$inputs[0].type === "bandpass");
    });
    it("lowshelf -> lowshelf", function() {
      var synth = Neume.Synth(function($) {
        return $("biquad", { type: "lowshelf" });
      });
      assert(synth.toAudioNode().$inputs[0].type === "lowshelf");
    });
    it("highshelf -> highshelf", function() {
      var synth = Neume.Synth(function($) {
        return $("biquad", { type: "highshelf" });
      });
      assert(synth.toAudioNode().$inputs[0].type === "highshelf");
    });
    it("peaking -> peaking", function() {
      var synth = Neume.Synth(function($) {
        return $("peaking", { type: "peaking" });
      });
      assert(synth.toAudioNode().$inputs[0].type === "peaking");
    });
    it("notch -> notch", function() {
      var synth = Neume.Synth(function($) {
        return $("biquad", { type: "notch" });
      });
      assert(synth.toAudioNode().$inputs[0].type === "notch");
    });
    it("allpass -> allpass", function() {
      var synth = Neume.Synth(function($) {
        return $("biquad", { type: "allpass" });
      });
      assert(synth.toAudioNode().$inputs[0].type === "allpass");
    });
    it("lpf -> lowpass", function() {
      var synth = Neume.Synth(function($) {
        return $("biquad", { type: "lpf" });
      });
      assert(synth.toAudioNode().$inputs[0].type === "lowpass");
    });
    it("hpf -> highpass", function() {
      var synth = Neume.Synth(function($) {
        return $("biquad", { type: "hpf" });
      });
      assert(synth.toAudioNode().$inputs[0].type === "highpass");
    });
    it("bpf -> bandpass", function() {
      var synth = Neume.Synth(function($) {
        return $("biquad", { type: "bpf" });
      });
      assert(synth.toAudioNode().$inputs[0].type === "bandpass");
    });
  });

  describe("aliases", function() {
    it("lowpass -> lowpass", function() {
      var synth = Neume.Synth(function($) {
        return $("lowpass");
      });
      assert(synth.toAudioNode().$inputs[0].type === "lowpass");
    });
    it("highpass -> highpass", function() {
      var synth = Neume.Synth(function($) {
        return $("highpass");
      });
      assert(synth.toAudioNode().$inputs[0].type === "highpass");
    });
    it("bandpass -> bandpass", function() {
      var synth = Neume.Synth(function($) {
        return $("bandpass");
      });
      assert(synth.toAudioNode().$inputs[0].type === "bandpass");
    });
    it("lowshelf -> lowshelf", function() {
      var synth = Neume.Synth(function($) {
        return $("lowshelf");
      });
      assert(synth.toAudioNode().$inputs[0].type === "lowshelf");
    });
    it("highshelf -> highshelf", function() {
      var synth = Neume.Synth(function($) {
        return $("highshelf");
      });
      assert(synth.toAudioNode().$inputs[0].type === "highshelf");
    });
    it("peaking -> peaking", function() {
      var synth = Neume.Synth(function($) {
        return $("peaking");
      });
      assert(synth.toAudioNode().$inputs[0].type === "peaking");
    });
    it("notch -> notch", function() {
      var synth = Neume.Synth(function($) {
        return $("notch");
      });
      assert(synth.toAudioNode().$inputs[0].type === "notch");
    });
    it("allpass -> allpass", function() {
      var synth = Neume.Synth(function($) {
        return $("allpass");
      });
      assert(synth.toAudioNode().$inputs[0].type === "allpass");
    });
    it("lpf -> lowpass", function() {
      var synth = Neume.Synth(function($) {
        return $("lpf");
      });
      assert(synth.toAudioNode().$inputs[0].type === "lowpass");
    });
    it("hpf -> highpass", function() {
      var synth = Neume.Synth(function($) {
        return $("hpf");
      });
      assert(synth.toAudioNode().$inputs[0].type === "highpass");
    });
    it("bpf -> bandpass", function() {
      var synth = Neume.Synth(function($) {
        return $("bpf");
      });
      assert(synth.toAudioNode().$inputs[0].type === "bandpass");
    });
  });

});
