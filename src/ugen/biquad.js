module.exports = function(neuma, _) {
  "use strict";

  _.each({
    lpf: "lowpass",
    hpf: "highpass",
    bpf: "bandpass",
    lowshelf: "lowshelf",
    highshelf: "highshelf",
    peaking: "peaking",
    brf: "notch",
    apf: "allpass",
  }, function(type, name) {
    /**
     * +--------+
     * | inputs |
     * +--------+
     *   |
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
    neuma.register(name, function(ugen, spec, inputs) {
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

      return new neuma.Unit({
        outlet: biquad
      });
    });
  });

};
