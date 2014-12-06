module.exports = function(neume, util) {
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

    var threshold = util.defaults(spec.thresh, spec.threshold, -24);
    var knee = util.defaults(spec.knee, 30);
    var ratio = util.defaults(spec.ratio, 12);
    var attack = context.toSeconds(util.defaults(spec.a, spec.attack, 0.003));
    var release = context.toSeconds(util.defaults(spec.r, spec.release, 0.250));

    context.connect(threshold, comp.threshold);
    context.connect(knee, comp.knee);
    context.connect(ratio, comp.ratio);
    context.connect(attack, comp.attack);
    context.connect(release, comp.release);

    context.createNeuSum(inputs).connect(comp);

    return new neume.Unit({
      outlet: comp
    });
  });

};
