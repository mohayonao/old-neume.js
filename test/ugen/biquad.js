"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/biquad"));

describe("ugen/biquad", function() {
  var Neume = null;

  before(function() {
    Neume = neume.exports(new window.AudioContext());
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
      var synth = new Neume(function($) {
        return $("lpf", $("sin"));
      })();
      assert.deepEqual(synth.toAudioNode().toJSON(), {
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
      });
    });
  });

  describe("type", function() {
    it("(default) -> lowpass", function() {
      var synth = new Neume(function($) {
        return $("biquad");
      })();
      assert(synth.toAudioNode().type === "lowpass");
    });
    it("lowpass -> lowpass", function() {
      var synth = new Neume(function($) {
        return $("biquad", { type: "lowpass" });
      })();
      assert(synth.toAudioNode().type === "lowpass");
    });
    it("highpass -> highpass", function() {
      var synth = new Neume(function($) {
        return $("biquad", { type: "highpass" });
      })();
      assert(synth.toAudioNode().type === "highpass");
    });
    it("lowshelf -> lowshelf", function() {
      var synth = new Neume(function($) {
        return $("biquad", { type: "lowshelf" });
      })();
      assert(synth.toAudioNode().type === "lowshelf");
    });
    it("highshelf -> highshelf", function() {
      var synth = new Neume(function($) {
        return $("biquad", { type: "highshelf" });
      })();
      assert(synth.toAudioNode().type === "highshelf");
    });
    it("peaking -> peaking", function() {
      var synth = new Neume(function($) {
        return $("peaking", { type: "peaking" });
      })();
      assert(synth.toAudioNode().type === "peaking");
    });
    it("notch -> notch", function() {
      var synth = new Neume(function($) {
        return $("biquad", { type: "notch" });
      })();
      assert(synth.toAudioNode().type === "notch");
    });
    it("allpass -> allpass", function() {
      var synth = new Neume(function($) {
        return $("biquad", { type: "allpass" });
      })();
      assert(synth.toAudioNode().type === "allpass");
    });
    it("lpf -> lowpass", function() {
      var synth = new Neume(function($) {
        return $("biquad", { type: "lpf" });
      })();
      assert(synth.toAudioNode().type === "lowpass");
    });
    it("hpf -> highpass", function() {
      var synth = new Neume(function($) {
        return $("biquad", { type: "hpf" });
      })();
      assert(synth.toAudioNode().type === "highpass");
    });
    it("bpf -> bandpass", function() {
      var synth = new Neume(function($) {
        return $("biquad", { type: "bpf" });
      })();
      assert(synth.toAudioNode().type === "bandpass");
    });
  });

  describe("aliases", function() {
    it("lowpass -> lowpass", function() {
      var synth = new Neume(function($) {
        return $("lowpass");
      })();
      assert(synth.toAudioNode().type === "lowpass");
    });
    it("highpass -> highpass", function() {
      var synth = new Neume(function($) {
        return $("highpass");
      })();
      assert(synth.toAudioNode().type === "highpass");
    });
    it("lowshelf -> lowshelf", function() {
      var synth = new Neume(function($) {
        return $("lowshelf");
      })();
      assert(synth.toAudioNode().type === "lowshelf");
    });
    it("highshelf -> highshelf", function() {
      var synth = new Neume(function($) {
        return $("highshelf");
      })();
      assert(synth.toAudioNode().type === "highshelf");
    });
    it("peaking -> peaking", function() {
      var synth = new Neume(function($) {
        return $("peaking");
      })();
      assert(synth.toAudioNode().type === "peaking");
    });
    it("notch -> notch", function() {
      var synth = new Neume(function($) {
        return $("notch");
      })();
      assert(synth.toAudioNode().type === "notch");
    });
    it("allpass -> allpass", function() {
      var synth = new Neume(function($) {
        return $("allpass");
      })();
      assert(synth.toAudioNode().type === "allpass");
    });
    it("lpf -> lowpass", function() {
      var synth = new Neume(function($) {
        return $("lpf");
      })();
      assert(synth.toAudioNode().type === "lowpass");
    });
    it("hpf -> highpass", function() {
      var synth = new Neume(function($) {
        return $("hpf");
      })();
      assert(synth.toAudioNode().type === "highpass");
    });
    it("bpf -> bandpass", function() {
      var synth = new Neume(function($) {
        return $("bpf");
      })();
      assert(synth.toAudioNode().type === "bandpass");
    });
  });

});
