module.exports = function(neume, util) {
  "use strict";

  /**
   * $("biquad", {
   *   type: enum[ lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass ] = lowpass
   *   freq: [number|UGen] = 350
   *   detune: [number|UGen] = 0
   *   Q: [number|UGen] = 1
   *   gain: [number|UGen] = 0
   * } ... inputs)
   *
   * aliases:
   *   $("lowpass"), $("highpass"), $("bandpass"),
   *   $("lowshelf"), $("highshelf"), $("peaking"), $("notch"), $("allpass")
   *   $("lpf"), $("hpf"), $("bpf")
   *
   * +--------+
   * | inputs |
   * +--------+
   *   ||||||
   * +-------------------------+
   * | BiquadFilterNode        |
   * | - type: type            |
   * | - freqquency: freq(350) |
   * | - detune: detune(0)     |
   * | - Q: Q(1)               |
   * | - gain: gain(0)         |
   * +-------------------------+
   *  |
   */

  var FILTER_TYPES = {
    lowpass: "lowpass",
    highpass: "highpass",
    bandpass: "bandpass",
    lowshelf: "lowshelf",
    highshelf: "highshelf",
    peaking: "peaking",
    notch: "notch",
    allpass: "allpass",
    lpf: "lowpass",
    hpf: "highpass",
    bpf: "bandpass",
  };

  neume.register("biquad", function(ugen, spec, inputs) {
    var type = FILTER_TYPES[spec.type] || "lowpass";
    return make(setup(type, ugen, spec, inputs));
  });

  Object.keys(FILTER_TYPES).forEach(function(name) {
    var type = FILTER_TYPES[name];
    neume.register(name, function(ugen, spec, inputs) {
      return make(setup(type, ugen, spec, inputs));
    });
  });

  function setup(type, ugen, spec, inputs) {
    var context = ugen.$context;
    var biquad = context.createBiquadFilter();

    biquad.type = type;
    biquad.frequency.value = 0;
    biquad.detune.value = 0;
    biquad.Q.value = 0;
    biquad.gain.value = 0;
    context.connect(util.defaults(context.toFrequency(spec.freq), 350), biquad.frequency);
    context.connect(util.defaults(spec.detune, 0), biquad.detune);
    context.connect(util.defaults(spec.Q, 1), biquad.Q);
    context.connect(util.defaults(spec.gain, 0), biquad.gain);

    context.createNeuSum(inputs).connect(biquad);

    return biquad;
  }

  function make(biquad) {
    return new neume.Unit({
      outlet: biquad
    });
  }

};
