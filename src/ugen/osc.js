module.exports = function(neume, _) {
  "use strict";

  var WS_CURVE_SIZE = neume.WS_CURVE_SIZE;

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

    if (!isWave(type)) {
      if (type === "pulse") {
        type = makePulseWave(ugen.$context, _.finite(_.defaults(spec.width, 0.5)));
      } else {
        type = WAVE_TYPES[type] || "sine";
      }
    }

    return make(setup(type, ugen, spec, inputs));
  });

  neume.register("periodicwave", function(ugen, spec, inputs) {
    var type = spec.value;

    if (!isWave(type)) {
      type = "sine";
    }

    return make(setup(type, ugen, spec, inputs));
  });

  _.each(WAVE_TYPES, function(type, name) {
    neume.register(name, function(ugen, spec, inputs) {
      return make(setup(type, ugen, spec, inputs));
    });
  });

  neume.register("pulse", function(ugen, spec, inputs) {
    var type = makePulseWave(ugen.$context, _.finite(_.defaults(spec.width, 0.5)));
    return make(setup(type, ugen, spec, inputs));
  });

  function isWave(wave) {
    if (window.PeriodicWave && wave instanceof window.PeriodicWave) {
      return true;
    }
    return false;
  }

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

  function createOscillator(context, type, spec, defaultFreq) {
    var osc = context.createOscillator();

    if (isWave(type)) {
      osc.setPeriodicWave(type);
    } else {
      osc.type = type;
    }
    osc.frequency.value = 0;
    osc.detune.value    = 0;
    context.connect(_.defaults(spec.freq, defaultFreq), osc.frequency);
    context.connect(_.defaults(spec.detune, 0), osc.detune);

    return osc;
  }

  function noInputs(type, ugen, spec) {
    var osc = createOscillator(ugen.$context, type, spec, 440);
    return { outlet: osc, ctrl: osc };
  }

  function hasInputs(type, ugen, spec, inputs) {
    var context = ugen.$context;

    var osc  = createOscillator(context, type, spec, 2);
    var gain = ugen.$context.createGain();

    gain.gain.value = 0;
    context.connect(osc, gain.gain);

    context.createSum(inputs).connect(gain);

    return { outlet: gain, ctrl: osc };
  }

  var _wave = new Array(256);

  function makePulseWave(context, width) {
    width = (Math.max(0, Math.min(width, 1)) * 256)|0;

    if (_wave[width]) {
      return _wave[width];
    }

    var wave = new Float32Array(WS_CURVE_SIZE);
    var width2 = width * (WS_CURVE_SIZE / 256);

    for (var i = 0; i < WS_CURVE_SIZE; i++) {
      wave[i] = i < width2 ? -1 : +1;
    }

    var fft = neume.FFT.forward(wave);

    var periodicWave = context.createPeriodicWave(fft.real, fft.imag);

    _wave[width] = periodicWave;

    return periodicWave;
  }

};
