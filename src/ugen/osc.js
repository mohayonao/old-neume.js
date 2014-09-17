module.exports = function(neume, _) {
  "use strict";

  /**
   * $("osc", {
   *   type  : [string|PeriodicWave]="sin",
   *   freq  : [number|UGen]=440,
   *   detune: [number|UGen]=0
   * } ... inputs)
   *
   * aliases:
   *   $("sin"), $("square"), $("saw"), $("tri"), $(PeriodicWave)
   *
   * start:
   *   start OscillatorNode
   *
   * stop:
   *   stop OscillatorNode
   *
   *
   * no inputs
   * +------------------------+
   * | OscillatorNode         |
   * | - type: type           |
   * | - frequency: freq(440) |
   * | - detune: detune(0)    |
   * +------------------------+
   *   |
   *
   * has inputs
   * +--------+
   * | inputs |
   * +--------+     +----------------------+
   *   ||||||       | OscillatorNode       |
   * +-----------+  | - type: type         |
   * | GainNode  |  | - frequency: freq(2) |
   * | - gain: 0 |--| - detune: detune(0)  |
   * +-----------+  +----------------------+
   *   |
   */

  var WAVE_TYPES = {
    sin   : "sine",
    square: "square",
    saw   : "sawtooth",
    tri   : "triangle"
  };

  neume.register("osc", function(ugen, spec, inputs) {
    var type = spec.type;
    var wave = null;

    if (type instanceof window.PeriodicWave) {
      wave = type;
      type = "custom";
    } else {
      type = WAVE_TYPES[type] || "sine";
    }

    var osc  = setup(type, ugen, spec, inputs);
    var ctrl = osc.ctrl;

    if (wave) {
      ctrl.setPeriodicWave(wave);
    }

    return make(osc);
  });

  neume.register("periodicwave", function(ugen, spec, inputs) {
    var type = "custom";
    var wave = spec.value;

    if (!(wave instanceof window.PeriodicWave)) {
      type = "sine";
      wave = null;
    }

    var osc  = setup(type, ugen, spec, inputs);
    var ctrl = osc.ctrl;

    if (wave) {
      ctrl.setPeriodicWave(wave);
    }

    return make(osc);
  });

  _.each(WAVE_TYPES, function(type, name) {
    neume.register(name, function(ugen, spec, inputs) {
      return make(setup(type, ugen, spec, inputs));
    });
  });

  function setup(type, ugen, spec, inputs) {
    return inputs.length ?
      hasInputs(type, ugen, spec, inputs) : noInputs(type, ugen, spec);
  }

  function make(osc) {
    var ctrl = osc.ctrl;

    return new neume.Unit({
      outlet: osc.outlet,
      start: function(t) {
        ctrl.start(t);
      },
      stop: function(t) {
        ctrl.stop(t);
      }
    });
  }

  function noInputs(type, ugen, spec) {
    var osc = ugen.$context.createOscillator();

    osc.type = type;
    osc.frequency.value = 0;
    osc.detune.value    = 0;
    _.connect({ from: _.defaults(spec.freq, 440), to: osc.frequency });
    _.connect({ from: _.defaults(spec.detune, 0), to: osc.detune });

    return { outlet: osc, ctrl: osc };
  }

  function hasInputs(type, ugen, spec, inputs) {
    var osc  = ugen.$context.createOscillator();
    var gain = ugen.$context.createGain();

    osc.type = type;
    osc.frequency.value = 0;
    osc.detune.value    = 0;
    _.connect({ from: _.defaults(spec.freq, 2), to: osc.frequency });
    _.connect({ from: _.defaults(spec.detune, 0), to: osc.detune });

    gain.gain.value = 0;
    _.connect({ from: osc, to: gain.gain });

    inputs.forEach(function(node) {
      _.connect({ from: node, to: gain });
    });

    return { outlet: gain, ctrl: osc };
  }

};
