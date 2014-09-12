module.exports = function(neume, _) {
  "use strict";

  /**
   * +------------+
   * | ...inputs  |
   * +------------+
   *   |
   * +-----------------------------+
   * | DynamicsCompressorNode      |
   * | - threshold: threshold(-24) |
   * | - knee: knee(30)            |
   * | - ratio: ratio(12)          |
   * | - attack: attack(0.003)     |
   * | - release: release(0.25)    |
   * +-----------------------------+
   *   |
   */
  neume.register("comp", function(ugen, spec, inputs) {
    var comp = ugen.$context.createDynamicsCompressor();

    comp.threshold.value = 0;
    comp.knee.value = 0;
    comp.ratio.value = 0;
    comp.attack.value = 0;
    comp.release.value = 0;
    _.connect({ from: _.defaults(spec.threshold,   -24), to: comp.threshold });
    _.connect({ from: _.defaults(spec.knee     ,    30), to: comp.knee });
    _.connect({ from: _.defaults(spec.ratio    ,    12), to: comp.ratio });
    _.connect({ from: _.defaults(spec.attack   , 0.003), to: comp.attack });
    _.connect({ from: _.defaults(spec.release  , 0.250), to: comp.release });

    inputs.forEach(function(node) {
      _.connect({ from: node, to: comp });
    });

    return new neume.Unit({
      outlet: comp
    });
  });

};
