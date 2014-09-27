module.exports = function(neume, _) {
  "use strict";

  /**
   * $("comp", {
   *   thresh: [number|UGen] = -24
   *   knee  : [number|UGen] =  30
   *   ratio : [number|UGen] =  12
   *   a     : [number|UGen] =  0.003
   *   r     : [number|UGen] =  0.250
   * } ... inputs)
   *
   * +--------+
   * | inputs |
   * +--------+
   *   ||||||
   * +------------------------+
   * | DynamicsCompressorNode |
   * | - threshold: thresh    |
   * | - knee     : knee      |
   * | - ratio    : ratio     |
   * | - attack   : a         |
   * | - release  : r         |
   * +------------------------+
   *   |
   */
  neume.register("comp", function(ugen, spec, inputs) {
    var comp = ugen.$context.createDynamicsCompressor();

    comp.threshold.value = 0;
    comp.knee.value = 0;
    comp.ratio.value = 0;
    comp.attack.value = 0;
    comp.release.value = 0;
    _.connect({ from: _.defaults(spec.thresh,   -24), to: comp.threshold });
    _.connect({ from: _.defaults(spec.knee  ,    30), to: comp.knee });
    _.connect({ from: _.defaults(spec.ratio ,    12), to: comp.ratio });
    _.connect({ from: _.defaults(spec.a, 0.003), to: comp.attack });
    _.connect({ from: _.defaults(spec.r, 0.250), to: comp.release });

    inputs.forEach(function(node) {
      _.connect({ from: node, to: comp });
    });

    return new neume.Unit({
      outlet: comp
    });
  });

};
