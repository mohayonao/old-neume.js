module.exports = function(neume, util) {
  "use strict";

  /**
   * $("biquad", {
   *   type: string = "lowpass",
   *   frequency: signal = 350,
   *   detune: signal = 0,
   *   Q: signal = 1,
   *   gain: signal = 0,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * aliases:
   *   $("lowpass"), $("highpass"), $("bandpass"),
   *   $("lowshelf"), $("highshelf"), $("peaking"), $("notch"), $("allpass")
   *   $("lpf"), $("hpf"), $("bpf")
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   * +------------------------+
   * | BiquadFilterNode       |
   * | - type: type           |
   * | - frequency: frequency |
   * | - detune: detune       |
   * | - Q: Q                 |
   * | - gain: gain           |
   * +------------------------+
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
    return make(type, ugen, spec, inputs);
  });

  Object.keys(FILTER_TYPES).forEach(function(name) {
    var type = FILTER_TYPES[name];
    neume.register(name, function(ugen, spec, inputs) {
      return make(type, ugen, spec, inputs);
    });
  });

  function make(type, ugen, spec, inputs) {
    var context = ugen.context;
    var outlet = context.createBiquadFilter();

    outlet.type = type;
    outlet.frequency.value = 0;
    outlet.detune.value = 0;
    outlet.Q.value = 0;
    outlet.gain.value = 0;

    var frequency = util.defaults(spec.freq, spec.frequency, 350);
    var detune = util.defaults(spec.dt, spec.detune, 0);
    var q = util.defaults(spec.q, spec.Q, 1);
    var gain = util.defaults(spec.gain, 0);

    context.connect(frequency, outlet.frequency);
    context.connect(detune, outlet.detune);
    context.connect(q, outlet.Q);
    context.connect(gain, outlet.gain);
    context.connect(inputs, outlet);

    return new neume.Unit({
      outlet: outlet
    });
  }

};
