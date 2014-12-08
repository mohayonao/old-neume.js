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
    var compNode = context.createDynamicsCompressor();

    compNode.threshold.value = 0;
    compNode.knee.value = 0;
    compNode.ratio.value = 0;
    compNode.attack.value = 0;
    compNode.release.value = 0;

    var threshold = util.defaults(spec.thresh, spec.threshold, -24);
    var knee = util.defaults(spec.knee, 30);
    var ratio = util.defaults(spec.ratio, 12);
    var attack = context.toSeconds(util.defaults(spec.a, spec.attack, 0.003));
    var release = context.toSeconds(util.defaults(spec.r, spec.release, 0.250));

    context.connect(threshold, compNode.threshold);
    context.connect(knee, compNode.knee);
    context.connect(ratio, compNode.ratio);
    context.connect(attack, compNode.attack);
    context.connect(release, compNode.release);
    context.connect(inputs, compNode);

    return new neume.Unit({
      outlet: compNode
    });
  });

};
