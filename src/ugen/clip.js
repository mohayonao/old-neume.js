module.exports = function(neuma, _) {
  "use strict";

  var curve = null;

  if (/safari/i.test(window.navigator.userAgent)) {
    // Safari 7.0.6 does not support interpolation
    curve = (function() {
      var data = new Float32Array(8192);
      for (var i = 0; i < data.length; i++) {
        data[i] = ((i / data.length) - 0.5) * 2;
      }
      return data;
    })();
  } else {
    curve = new Float32Array([ -1, +1 ]);
  }

  /**
   * +------------+
   * | ...inputs  |
   * +------------+
   *   |
   * +--------------------------+
   * | WaveShaperNode           |
   * | - curve: [ -1, +1 ]      |
   * | - oversample: oversample |
   * +--------------------------+
   *   |
   */
  neuma.register("clip", function(ugen, spec, inputs) {
    var shaper = ugen.$context.createWaveShaper();

    shaper.curve = curve;
    shaper.oversample = { "2x":"2x", "4x":"4x" }[spec.oversample] || "none";

    inputs.forEach(function(node) {
      _.connect({ from: node, to: shaper });
    });

    return new neuma.Unit({
      outlet: shaper
    });
  });

};
