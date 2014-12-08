module.exports = function(neume, util) {
  "use strict";

  /**
   * $("osc", {
   *   type: [string|PeriodicWave]="sin",
   *   freq: [number|UGen]=440,
   *   dt: [number|UGen]=0
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
    sin: "sine",
    square: "square",
    saw: "sawtooth",
    tri: "triangle"
  };

  neume.register("osc", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var type = spec.type;

    if (!isWave(type)) {
      if (type === "pulse") {
        type = makePeriodicWave(context, util.finite(util.defaults(spec.width, 0.5)));
      } else {
        type = makePeriodicWave(context, WAVE_TYPES[type] || "sine");
      }
    }

    return make(setup(type, ugen, spec, inputs));
  });

  neume.register("PeriodicWave", function(ugen, spec, inputs) {
    var type = spec.value;

    if (!isWave(type)) {
      type = makePeriodicWave(ugen.$context, "sine");
    }

    return make(setup(type, ugen, spec, inputs));
  });

  Object.keys(WAVE_TYPES).forEach(function(name) {
    var type = WAVE_TYPES[name];
    neume.register(name, function(ugen, spec, inputs) {
      return make(setup(makePeriodicWave(ugen.$context, type), ugen, spec, inputs));
    });
  });

  neume.register("pulse", function(ugen, spec, inputs) {
    var type = makePeriodicWave(ugen.$context, util.finite(util.defaults(spec.width, 0.5)));
    return make(setup(type, ugen, spec, inputs));
  });

  function isWave(wave) {
    if (global.PeriodicWave && wave instanceof global.PeriodicWave) {
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
    osc.detune.value = 0;

    var frequency = context.toFrequency(util.defaults(spec.freq, spec.frequency, defaultFreq));
    var detune = util.defaults(spec.dt, spec.detune, 0);

    context.connect(frequency, osc.frequency);
    context.connect(detune, osc.detune);

    return osc;
  }

  function noInputs(type, ugen, spec) {
    var osc = createOscillator(ugen.$context, type, spec, 440);
    return { outlet: osc, ctrl: osc };
  }

  function hasInputs(type, ugen, spec, inputs) {
    var context = ugen.$context;

    var osc = createOscillator(context, type, spec, 2);
    var gain = ugen.$context.createGain();

    gain.gain.value = 0;
    context.connect(osc, gain.gain);
    context.connect(inputs, gain);

    return { outlet: gain, ctrl: osc };
  }

  var _waves = {};

  function makePeriodicWave(context, type) {
    if (type === "sine") {
      return "sine";
    }

    if (typeof type === "number") {
      type = util.int(util.clip(type, 0, 1) * 256);
    }

    if (_waves[type]) {
      return _waves[type];
    }

    var real = new Float32Array(2048);
    var imag = new Float32Array(2048);

    switch (type) {
    case "square":
      makePeriodicWaveSquare(real, imag);
      break;
    case "sawtooth":
      makePeriodicWaveSawtooth(real, imag);
      break;
    case "triangle":
      makePeriodicWaveTriangle(real, imag);
      break;
    default:
      makePeriodicWavePulse(real, imag, type);
      break;
    }

    var wave = context.createPeriodicWave(real, imag);

    _waves[type] = wave;

    return wave;
  }

  function makePeriodicWaveSquare(real, imag) {
    for (var i = 1, imax = real.length; i < imax; i++) {
      var omega = 2 * Math.PI * i;
      var invOmega = 1 / omega;

      imag[i] = invOmega * ((i & 1) ? 2 : 0);
    }
  }

  function makePeriodicWaveSawtooth(real, imag) {
    for (var i = 1, imax = real.length; i < imax; i++) {
      var omega = 2 * Math.PI * i;
      var invOmega = 1 / omega;

      imag[i] = -invOmega * Math.cos(0.5 * omega);
    }
  }

  function makePeriodicWaveTriangle(real /*, imag*/) {
    for (var i = 1, imax = real.length; i < imax; i++) {
      var omega = 2 * Math.PI * i;

      real[i] = (4 - 4 * Math.cos(0.5 * omega)) / (i * i * Math.PI * Math.PI);
    }
  }

  function makePeriodicWavePulse(real, imag, width) {
    var buffer = new Float32Array(2048);
    var width2 = width * (2048 / 256);

    for (var i = 0; i < 2048; i++) {
      buffer[i] = i < width2 ? -1 : +1;
    }

    var fft = neume.FFT.forward(buffer);

    real.set(fft.real);
    imag.set(fft.imag);
  }

};
