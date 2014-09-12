"use strict";

var neume = require("../src/neume");

neume.use(require("../src/ugen/osc"));
neume.use(require("../src/ugen/biquad"));

describe("ugen/biquad", function() {
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
      var synth = neume.Neume(function($) {
        return $("lpf", $("sin"));
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
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
      var synth = neume.Neume(function($) {
        return $("biquad");
      })();
      assert(synth.outlet.type === "lowpass");
    });
    it("lowpass -> lowpass", function() {
      var synth = neume.Neume(function($) {
        return $("biquad", { type: "lowpass" });
      })();
      assert(synth.outlet.type === "lowpass");
    });
    it("highpass -> highpass", function() {
      var synth = neume.Neume(function($) {
        return $("biquad", { type: "highpass" });
      })();
      assert(synth.outlet.type === "highpass");
    });
    it("lowshelf -> lowshelf", function() {
      var synth = neume.Neume(function($) {
        return $("biquad", { type: "lowshelf" });
      })();
      assert(synth.outlet.type === "lowshelf");
    });
    it("highshelf -> highshelf", function() {
      var synth = neume.Neume(function($) {
        return $("biquad", { type: "highshelf" });
      })();
      assert(synth.outlet.type === "highshelf");
    });
    it("peaking -> peaking", function() {
      var synth = neume.Neume(function($) {
        return $("peaking", { type: "peaking" });
      })();
      assert(synth.outlet.type === "peaking");
    });
    it("notch -> notch", function() {
      var synth = neume.Neume(function($) {
        return $("biquad", { type: "notch" });
      })();
      assert(synth.outlet.type === "notch");
    });
    it("allpass -> allpass", function() {
      var synth = neume.Neume(function($) {
        return $("biquad", { type: "allpass" });
      })();
      assert(synth.outlet.type === "allpass");
    });
    it("lpf -> lowpass", function() {
      var synth = neume.Neume(function($) {
        return $("biquad", { type: "lpf" });
      })();
      assert(synth.outlet.type === "lowpass");
    });
    it("hpf -> highpass", function() {
      var synth = neume.Neume(function($) {
        return $("biquad", { type: "hpf" });
      })();
      assert(synth.outlet.type === "highpass");
    });
    it("bpf -> bandpass", function() {
      var synth = neume.Neume(function($) {
        return $("biquad", { type: "bpf" });
      })();
      assert(synth.outlet.type === "bandpass");
    });
  });

  describe("aliases", function() {
    it("lowpass -> lowpass", function() {
      var synth = neume.Neume(function($) {
        return $("lowpass");
      })();
      assert(synth.outlet.type === "lowpass");
    });
    it("highpass -> highpass", function() {
      var synth = neume.Neume(function($) {
        return $("highpass");
      })();
      assert(synth.outlet.type === "highpass");
    });
    it("lowshelf -> lowshelf", function() {
      var synth = neume.Neume(function($) {
        return $("lowshelf");
      })();
      assert(synth.outlet.type === "lowshelf");
    });
    it("highshelf -> highshelf", function() {
      var synth = neume.Neume(function($) {
        return $("highshelf");
      })();
      assert(synth.outlet.type === "highshelf");
    });
    it("peaking -> peaking", function() {
      var synth = neume.Neume(function($) {
        return $("peaking");
      })();
      assert(synth.outlet.type === "peaking");
    });
    it("notch -> notch", function() {
      var synth = neume.Neume(function($) {
        return $("notch");
      })();
      assert(synth.outlet.type === "notch");
    });
    it("allpass -> allpass", function() {
      var synth = neume.Neume(function($) {
        return $("allpass");
      })();
      assert(synth.outlet.type === "allpass");
    });
    it("lpf -> lowpass", function() {
      var synth = neume.Neume(function($) {
        return $("lpf");
      })();
      assert(synth.outlet.type === "lowpass");
    });
    it("hpf -> highpass", function() {
      var synth = neume.Neume(function($) {
        return $("hpf");
      })();
      assert(synth.outlet.type === "highpass");
    });
    it("bpf -> bandpass", function() {
      var synth = neume.Neume(function($) {
        return $("bpf");
      })();
      assert(synth.outlet.type === "bandpass");
    });
  });

});
