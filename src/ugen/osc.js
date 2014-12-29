module.exports = function(neume, util) {
  "use strict";

  /**
   * $("osc", {
   *   type: string|PeriodicWave = "sin",
   *   frequency: signal = 440,
   *   detune: signal = 0,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * aliases:
   *   $("sin"), $("square"), $("saw"), $("tri"), $(PeriodicWave)
   *
   * no inputs
   * +------------------------+
   * | OscillatorNode         |
   * | - type: type           |
   * | - frequency: frequency |
   * | - detune: detune       |
   * +------------------------+
   *   |
   *
   * has inputs
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   *   |             +------------------------+
   *   |             | OscillatorNode         |
   * +-----------+   | - type: type           |
   * | GainNode  |   | - frequency: frequency |
   * | - gain: 0 <---| - detune: detune       |
   * +-----------+   +------------------------+
   *   |
   */

  var WAVE_TYPES = {
    sin: "sine",
    square: "square",
    saw: "sawtooth",
    tri: "triangle"
  };

  neume.register("osc", function(ugen, spec, inputs) {
    var type = spec.type;

    if (!isPeriodicWave(type)) {
      type = WAVE_TYPES[type] || "sine";
    }

    return make(type, ugen, spec, inputs);
  });

  neume.register("PeriodicWave", function(ugen, spec, inputs) {
    var type = spec.value;

    if (!isPeriodicWave(type)) {
      type = "sine";
    }

    return make(type, ugen, spec, inputs);
  });

  Object.keys(WAVE_TYPES).forEach(function(name) {
    var type = WAVE_TYPES[name];
    neume.register(name, function(ugen, spec, inputs) {
      return make(type, ugen, spec, inputs);
    });
  });

  function make(wave, ugen, spec, inputs) {
    var context = ugen.context;
    var outlet = null;

    var osc = context.createOscillator();
    var gain = null;

    var defaultFreq = inputs.length ? 2 : 440;
    var frequency = util.defaults(spec.freq, spec.frequency, defaultFreq);
    var detune = util.defaults(spec.dt, spec.detune, 0);

    if (isPeriodicWave(wave)) {
      osc.setPeriodicWave(wave);
    } else {
      osc.type = wave;
    }

    osc.frequency.value = 0;
    osc.detune.value = 0;

    context.connect(frequency, osc.frequency);
    context.connect(detune, osc.detune);

    if (inputs.length) {
      gain = context.createGain();

      gain.gain.value = 0;

      context.connect(inputs, gain);
      context.connect(osc, gain.gain);

      outlet = gain;
    } else {
      outlet = osc;
    }

    return new neume.Unit({
      outlet: outlet,
      start: function(t) {
        osc.start(t);
      },
      stop: function(t) {
        osc.stop(t);
      }
    });
  }

  function isPeriodicWave(wave) {
    return wave instanceof neume.webaudio.PeriodicWave;
  }

};
