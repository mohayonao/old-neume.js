module.exports = function(neume, util) {
  "use strict";

  var KVSKEY = "@neume:lfpulse:";

  /**
   * $("lfpulse", {
   *   frequency: signal = 440,
   *   detune: signal = 0,
   *   width: signal = 0.5,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs:signal)
   *
   * +----------------------+  +-------+  +-------+
   * | OscillatorNode       |  | DC(1) |  | DC(1) |
   * | type: triangle       |  +-------+  +-------+
   * | frequency: frequency |    |          |
   * | detune: 0            |    |        +--------------+
   * +----------------------+    |        | GainNode     |
   *   |                         |        | value: width |
   *   |                         |        +--------------+
   *   |                         |          |
   *   |                         |        +-----------+
   *   |                         |        | GainNode  |
   *   |                         |        | value: -2 |
   *   |                         |        +-----------+
   *   |                         |          |
   *   +-------------------------+----------+
   *   |
   * +-----------------------+
   * | WaveShaperNode        |
   * | curve: (tri -> pulse) |
   * +-----------------------+
   *   |
   *
   * See also:
   * https://github.com/pendragon-andyh/WebAudio-PulseOscillator
   */
  neume.register("lfpulse", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.context;
    var outlet = null;

    var defaultFreq = inputs.length ? 2 : 440;
    var pulse = createPulseOscillator(context, spec, defaultFreq);
    var gain = null;

    if (inputs.length) {
      gain = context.createGain();

      gain.gain.value = 0;

      context.connect(inputs, gain);
      context.connect(pulse.outlet, gain.gain);

      outlet = gain;
    } else {
      outlet = pulse.outlet;
    }

    return new neume.Unit({
      outlet: outlet,
      start: function(t) {
        pulse.ctrl.start(t);
      },
      stop: function(t) {
        pulse.ctrl.stop(t);
      }
    });
  }

  function createPulseOscillator(context, spec, defaultFreq) {
    var duty = util.defaults(spec.width, spec.duty, 0.5);
    var osc = createOscillator(context, spec, defaultFreq);
    var ws = createWaveShaper(context, neume.KVS.get(KVSKEY + "ws-curve"));
    var offset;

    if (typeof duty === "number") {
      offset = duty * -2;
    } else {
      offset = createGain(context, -2);
      context.connect(duty, offset);
    }

    context.connect([ osc, 1, offset ], ws);

    return { outlet: ws, ctrl: osc };
  }

  function createOscillator(context, spec, defaultFreq) {
    var osc = context.createOscillator();

    osc.setPeriodicWave(neume.KVS.get(KVSKEY + "src", context));

    osc.frequency.value = 0;
    osc.detune.value = 0;

    var frequency = util.defaults(spec.freq, spec.frequency, defaultFreq);
    var detune = util.defaults(spec.dt, spec.detune, 0);

    context.connect(frequency, osc.frequency);
    context.connect(detune, osc.detune);

    return osc;
  }

  function createWaveShaper(context, curve) {
    var ws = context.createWaveShaper();

    ws.curve = curve;

    return ws;
  }

  function createGain(context, value) {
    var gain = context.createGain();

    gain.gain.value = value;

    return gain;
  }

  neume.KVS.set(KVSKEY + "src", function(context) {
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

  neume.KVS.set(KVSKEY + "ws-curve", function() {
    var curve = new Float32Array(4096);

    for (var i = 0; i < 2048; i++) {
      curve[i] = -1;
      curve[i + 2048] = +1;
    }

    return curve;
  });

};
