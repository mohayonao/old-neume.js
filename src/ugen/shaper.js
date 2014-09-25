module.exports = function(neume, _) {
  "use strict";

  var WS_CURVE_SIZE = neume.WS_CURVE_SIZE;

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
      curve = createCurve(_.finite(spec.curve));
    } else {
      curve = spec.curve;
    }
    return make(setup(curve, ugen, spec, inputs));
  });

  neume.register("clip", function(ugen, spec, inputs) {
    var curve = createCurve(0);
    return make(setup(curve, ugen, spec, inputs));
  });

  function setup(curve, ugen, spec, inputs) {
    var shaper = ugen.$context.createWaveShaper();

    if (curve instanceof Float32Array) {
      shaper.curve = curve;
    }
    shaper.oversample = { "2x":"2x", "4x":"4x" }[spec.oversample] || "none";

    inputs.forEach(function(node) {
      _.connect({ from: node, to: shaper });
    });

    return shaper;
  }

  function make(outlet) {
    return new neume.Unit({
      outlet: outlet
    });
  }

  var curves = {};

  function createCurve(amount) {
    amount = _.clip(amount, 0, 1);

    if (!curves[amount]) {
      curves[amount] = (amount === 1) ? createSquare() : createWSCurve(amount);
    }

    return curves[amount];
  }

  // http://stackoverflow.com/questions/7840347/web-audio-api-waveshapernode
  function createWSCurve(amount) {
    var curve = new Float32Array(WS_CURVE_SIZE);

    var k = 2 * amount / (1 - amount);

    for (var i = 0; i < WS_CURVE_SIZE; i++) {
      var x = i * 2 / WS_CURVE_SIZE - 1;
      curve[i] = (1 + k) * x / (1 + k * Math.abs(x));
    }

    return curve;
  }

  function createSquare() {
    var curve = new Float32Array(WS_CURVE_SIZE);
    var half  = WS_CURVE_SIZE >> 1;

    for (var i = 0; i < WS_CURVE_SIZE; i++) {
      curve[i] = i < half ? -1 : +1;
    }

    return curve;
  }
};
