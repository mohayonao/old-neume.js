module.exports = function(neume, util) {
  "use strict";

  var WS_CURVE_SIZE = neume.WS_CURVE_SIZE;
  var KVSKEY = "@neume:shaper:";

  /**
   * $("shaper", {
   *   curve: [Float32Array|number] = 0
   * } ... inputs)
   *
   * aliases:
   *   $("clip")
   *
   * +--------+
   * | inputs |
   * +--------+
   *   ||||||
   * +--------------------------+
   * | WaveShaperNode           |
   * | - curve: curve           |
   * | - oversample: oversample |
   * +--------------------------+
   *   |
   */
  neume.register("shaper", function(ugen, spec, inputs) {
    var curve = null;
    if (typeof spec.curve === "number") {
      var n = Math.floor(util.clip(util.finite(spec.curve), 0, 1) * 256);
      curve = neume.KVS.get(KVSKEY + n, n);
    } else {
      curve = spec.curve;
    }
    return make(curve, ugen, spec, inputs);
  });

  neume.register("clip", function(ugen, spec, inputs) {
    var curve = neume.KVS.get(KVSKEY + "0");
    return make(curve, ugen, spec, inputs);
  });

  function make(curve, ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet = context.createWaveShaper();

    if (curve instanceof Float32Array) {
      outlet.curve = curve;
    }
    outlet.oversample = { "2x":"2x", "4x":"4x" }[spec.oversample] || "none";

    context.connect(inputs, outlet);

    return new neume.Unit({
      outlet: outlet
    });
  }

  (function() {
    // http://stackoverflow.com/questions/7840347/web-audio-api-waveshapernode
    function createCurve(amount) {
      var curve = new Float32Array(WS_CURVE_SIZE);

      var k = 2 * amount / (1 - amount);
      var x;

      for (var i = 0; i < WS_CURVE_SIZE; i++) {
        x = i * 2 / WS_CURVE_SIZE - 1;
        curve[i] = (1 + k) * x / (1 + k * Math.abs(x));
      }

      return curve;
    }

    function _createCurve(amount) {
      return function() {
        return createCurve(amount);
      };
    }

    for (var i = 1; i < 256; i++) {
      neume.KVS.set(KVSKEY + i, _createCurve(i / 256));
    }
  })();

  neume.KVS.set(KVSKEY + "0", function() {
    var curve = new Float32Array(WS_CURVE_SIZE);

    for (var i = 0; i < WS_CURVE_SIZE; i++) {
      curve[i] = (i / WS_CURVE_SIZE) * 2 - 1;
    }

    return curve;
  });

  neume.KVS.set(KVSKEY + "256", function() {
    var curve = new Float32Array(WS_CURVE_SIZE);
    var half = WS_CURVE_SIZE >> 1;

    for (var i = 0; i < WS_CURVE_SIZE; i++) {
      curve[i] = i < half ? -1 : +1;
    }

    return curve;
  });

};
