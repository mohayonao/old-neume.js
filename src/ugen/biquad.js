module.exports = function(neume, util) {
  "use strict";

  /**
   * $("biquad", {
   *   type: enum[ lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass ] = lowpass
   *   freq: [number|UGen] = 350
   *   dt: [number|UGen] = 0
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
   * | - frequency: freq(350)  |
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
    var biquadNode = context.createBiquadFilter();

    biquadNode.type = type;
    biquadNode.frequency.value = 0;
    biquadNode.detune.value = 0;
    biquadNode.Q.value = 0;
    biquadNode.gain.value = 0;

    var frequency = context.toFrequency(util.defaults(spec.freq, spec.frequency, 350));
    var detune = util.defaults(spec.dt, spec.detune, 0);
    var q = util.defaults(spec.Q, 1);
    var gain = util.defaults(spec.gain, 0);

    context.connect(frequency, biquadNode.frequency);
    context.connect(detune, biquadNode.detune);
    context.connect(q, biquadNode.Q);
    context.connect(gain, biquadNode.gain);
    context.connect(inputs, biquadNode);

    return biquadNode;
  }

  function make(outlet) {
    return new neume.Unit({
      outlet: outlet
    });
  }

};
