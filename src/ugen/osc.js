module.exports = function(neume, util) {
  "use strict";

  var KVSKEY = "@neume:osc";

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

    if (!isPeriodicWave(type)) {
      type = type2wave(context, WAVE_TYPES[type] || "sine");
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
      return make(type2wave(ugen.$context, type), ugen, spec, inputs);
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
    var osc = createOscillator(ugen.$context, wave, spec, 440);
    return { outlet: osc, ctrl: osc };
  }

  function hasInputs(wave, ugen, spec, inputs) {
    var context = ugen.$context;

    var osc = createOscillator(context, wave, spec, 2);
    var gain = ugen.$context.createGain();

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

    var frequency = context.toFrequency(util.defaults(spec.freq, spec.frequency, defaultFreq));
    var detune = util.defaults(spec.dt, spec.detune, 0);

    context.connect(frequency, osc.frequency);
    context.connect(detune, osc.detune);

    return osc;
  }

  function isPeriodicWave(wave) {
    return !!(global.PeriodicWave && wave instanceof global.PeriodicWave);
  }

  function type2wave(context, type) {
    return neume.KVS.get(KVSKEY + type, context);
  }

  neume.KVS.set(KVSKEY + "sine", "sine");

  neume.KVS.set(KVSKEY + "square", function(context) {
    var real = new Float32Array(4096);
    var imag = new Float32Array(4096);

    for (var i = 1; i < 4096; i++) {
      if (i % 2 === 1) {
        imag[i] = 1 / i;
      }
    }

    return context.createPeriodicWave(real, imag);
  });

  neume.KVS.set(KVSKEY + "sawtooth", function(context) {
    var real = new Float32Array(4096);
    var imag = new Float32Array(4096);

    for (var i = 1; i < 4096; i++) {
      imag[i] = 1 / i;
      if (i % 2 === 0) {
        imag[i] *= -1;
      }
    }

    return context.createPeriodicWave(real, imag);
  });

  neume.KVS.set(KVSKEY + "triangle", function(context) {
    var real = new Float32Array(4096);
    var imag = new Float32Array(4096);

    for (var i = 1, imax = imag.length; i < imax; i++) {
      if (i % 2) {
        imag[i] = 1 / (i * i);
        if (i % 4 === 3) {
          imag[i] *= -1;
        }
      }
    }

    return context.createPeriodicWave(real, imag);
  });

};
