module.exports = function(neuma, _) {
  "use strict";

  /**
   * $("biquad", {
   *   type  : [string]="lowpass",
   *   freq  : [number|UGen]=350,
   *   detune: [number|UGen]=0,
   *   Q     : [number|UGen]=1,
   *   gain  : [number|UGen] = 0
   * } ... inputs)
   *
   * aliases:
   *   $("lowpass"), $("highpass"),
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
    lowpass  : "lowpass",
    highpass : "highpass",
    lowshelf : "lowshelf",
    highshelf: "highshelf",
    peaking  : "peaking",
    notch    : "notch",
    allpass  : "allpass",
    lpf      : "lowpass",
    hpf      : "highpass",
    bpf      : "bandpass",
  };

  neuma.register("biquad", function(ugen, spec, inputs) {
    var type = FILTER_TYPES[spec.type] || "lowpass";
    return make(setup(type, ugen, spec, inputs));
  });

  _.each(FILTER_TYPES, function(type, name) {
    neuma.register(name, function(ugen, spec, inputs) {
      return make(setup(type, ugen, spec, inputs));
    });
  });

  function setup(type, ugen, spec, inputs) {
    var biquad = ugen.$context.createBiquadFilter();

    biquad.type = type;
    biquad.frequency.value = 0;
    biquad.detune.value    = 0;
    biquad.Q.value         = 0;
    biquad.gain.value      = 0;
    _.connect({ from: _.defaults(spec.freq  , 350), to: biquad.frequency });
    _.connect({ from: _.defaults(spec.detune,   0), to: biquad.detune    });
    _.connect({ from: _.defaults(spec.Q     ,   1), to: biquad.Q         });
    _.connect({ from: _.defaults(spec.gain  ,   0), to: biquad.gain      });

    _.each(inputs, function(node) {
      _.connect({ from: node, to: biquad });
    });

    return biquad;
  }

  function make(biquad) {
    return new neuma.Unit({
      outlet: biquad
    });
  }

};
