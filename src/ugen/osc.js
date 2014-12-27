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
    var elem = inputs.length ?
      hasInputs(wave, ugen, spec, inputs) : noInputs(wave, ugen, spec);
    var outlet = elem.outlet;
    var ctrl = elem.ctrl;

    return new neume.Unit({
      outlet: outlet,
      start: function(t) {
        ctrl.start(t);
      },
      stop: function(t) {
        ctrl.stop(t);
      }
    });
  }

  function noInputs(wave, ugen, spec) {
    var osc = createOscillator(ugen.context, wave, spec, 440);
    return { outlet: osc, ctrl: osc };
  }

  function hasInputs(wave, ugen, spec, inputs) {
    var context = ugen.context;

    var osc = createOscillator(context, wave, spec, 2);
    var gain = ugen.context.createGain();

    gain.gain.value = 0;
    context.connect(osc, gain.gain);
    context.connect(inputs, gain);

    return { outlet: gain, ctrl: osc };
  }

  function createOscillator(context, type, spec, defaultFreq) {
    var osc = context.createOscillator();

    if (isPeriodicWave(type)) {
      osc.setPeriodicWave(type);
    } else {
      osc.type = type;
    }
    osc.frequency.value = 0;
    osc.detune.value = 0;

    var frequency = util.defaults(spec.freq, spec.frequency, defaultFreq);
    var detune = util.defaults(spec.dt, spec.detune, 0);

    context.connect(frequency, osc.frequency);
    context.connect(detune, osc.detune);

    return osc;
  }

  function isPeriodicWave(wave) {
    return wave instanceof neume.webaudio.PeriodicWave;
  }

};
