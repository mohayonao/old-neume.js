module.exports = function(neuma, _) {
  "use strict";

  var curve = new Float32Array([ -1, +1 ]);

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
