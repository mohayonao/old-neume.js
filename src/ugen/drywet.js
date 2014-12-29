module.exports = function(neume, util) {
  "use strict";

  var WS_CURVE_SIZE = neume.WS_CURVE_SIZE;
  var KVSKEY = "@neume:drywet:";

  /*
   * $("drywet", {
   *   mix: signal = 0,
   *   patch: function = null,
   *   args: any[] = [],
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * +-----------+     +-----------+  +-----+
   * | inputs[0] | ... | inputs[N] |  | mix |
   * +-----------+     +-----------+  +-----+
   *   |                 |               |
   *   +-----------------+               |
   *   |                                 |
   *   |    +----------------------------+
   *   |    |                            |
   *   |  +-------------------+  +-------------------+
   *   |  | WaveShaperNode    |  | WaveShaperNode    |
   *   |  | - curve: dryCurve |  | - curve: wetCurve |
   *   |  +-------------------+  +-------------------+
   *   |           |                 |
   *   +------------------+          |
   *   |           |      |          |
   *   |           |   +-----+       |
   *   |           |   | efx |       |
   *   |           |   +-----+       |
   *   |           |      |          |
   * +----------+  |   +----------+  |
   * | GainNode |  |   | GainNode |  |
   * | - gain: <---+   | - gain: <---+
   * +----------+      +----------+
   *   |                 |
   *   +-----------------+
   *   |
   */
  neume.register("drywet", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.context;

    var mix = util.defaults(spec.mix, 0);
    var efx = util.defaults(spec.patch, spec.efx, spec.wet, null);
    var args = util.defaults(spec.args, []);
    var dry = inputs;
    var wet = null;

    if (typeof efx === "function") {
      var $ = ugen.synth.builder;
      var builder = function() {
        return $.apply(null, arguments);
      };
      builder.timeout = $.timeout;
      builder.interval = $.interval;
      builder.stop = $.stop;
      builder.inputs = inputs;

      wet = efx.apply(ugen.synth, [ builder ].concat(args));
    }

    var outlet;

    if (wet == null || typeof mix === "number") {
      outlet = makeWithNumber(context, dry, wet, mix);
    } else {
      outlet = makeWithNode(context, dry, wet, mix);
    }

    return new neume.Unit({
      outlet: outlet
    });
  }

  function makeWithNumber(context, dry, wet, mix) {
    mix = util.clip(util.finite(mix), -1, +1);

    if (mix === -1 || wet == null) {
      return new neume.Sum(context, dry);
    }
    if (mix === +1) {
      return new neume.Sum(context, wet);
    }

    mix = (mix + 1) * 0.25 * Math.PI;

    var dryGain = context.createGain();
    var wetGain = context.createGain();

    dryGain.gain.value = Math.cos(mix);
    wetGain.gain.value = Math.sin(mix);

    context.connect(dry, dryGain);
    context.connect(wet, wetGain);

    return new neume.Sum(context, [ dryGain, wetGain ]);
  }

  function makeWithNode(context, dry, wet, mix) {
    var dryGain = context.createGain();
    var wetGain = context.createGain();
    var dryWS = context.createWaveShaper();
    var wetWS = context.createWaveShaper();
    var curve = neume.KVS.get(KVSKEY + "curve");

    dryWS.curve = curve.dry;
    wetWS.curve = curve.wet;

    dryGain.gain.value = 0;
    wetGain.gain.value = 0;

    context.connect(mix, dryWS);
    context.connect(mix, wetWS);
    context.connect(dryWS, dryGain.gain);
    context.connect(wetWS, wetGain.gain);
    context.connect(dry, dryGain);
    context.connect(wet, wetGain);

    return new neume.Sum(context, [ dryGain, wetGain ]);
  }

  neume.KVS.set(KVSKEY + "curve", function() {
    var curveDry = new Float32Array(WS_CURVE_SIZE);
    var curveWet = new Float32Array(WS_CURVE_SIZE);

    for (var i = 0; i < WS_CURVE_SIZE; i++) {
      curveDry[i] = Math.cos((i / WS_CURVE_SIZE) * Math.PI * 0.5);
      curveWet[i] = Math.sin((i / WS_CURVE_SIZE) * Math.PI * 0.5);
    }

    return { dry: curveDry, wet: curveWet };
  });
};
