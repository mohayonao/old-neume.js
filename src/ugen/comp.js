module.exports = function(neume, _) {
  "use strict";

  /**
   * $("comp", {
   *   thresh: [number|UGen] = -24
   *   knee: [number|UGen] =  30
   *   ratio: [number|UGen] =  12
   *   a: [number|UGen] =  0.003
   *   r: [number|UGen] =  0.250
   * } ... inputs)
   *
   * +--------+
   * | inputs |
   * +--------+
   *   ||||||
   * +------------------------+
   * | DynamicsCompressorNode |
   * | - threshold: thresh    |
   * | - knee: knee           |
   * | - ratio: ratio         |
   * | - attack: a            |
   * | - release: r           |
   * +------------------------+
   *   |
   */
  neume.register("comp", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var comp = context.createDynamicsCompressor();

    comp.threshold.value = 0;
    comp.knee.value = 0;
    comp.ratio.value = 0;
    comp.attack.value = 0;
    comp.release.value = 0;
    context.connect(_.defaults(spec.thresh, -24), comp.threshold);
    context.connect(_.defaults(spec.knee, 30), comp.knee);
    context.connect(_.defaults(spec.ratio, 12), comp.ratio);
    context.connect(_.defaults(context.toSeconds(spec.a), 0.003), comp.attack);
    context.connect(_.defaults(context.toSeconds(spec.r), 0.250), comp.release);

    context.createSum(inputs).connect(comp);

    return new neume.Unit({
      outlet: comp
    });
  });

};
