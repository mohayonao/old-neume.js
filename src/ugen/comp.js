module.exports = function(neume, util) {
  "use strict";

  /**
   * $("comp", {
   *   threshold: signal = -24,
   *   knee: signal = 30,
   *   ratio: signal = 12,
   *   attack: signal = 0.003,
   *   release: signal = 0.250,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   * +------------------------+
   * | DynamicsCompressorNode |
   * | - threshold: threshold |
   * | - knee: knee           |
   * | - ratio: ratio         |
   * | - attack: attack       |
   * | - release: release     |
   * +------------------------+
   *   |
   */
  neume.register("comp", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet = context.createDynamicsCompressor();

    outlet.threshold.value = 0;
    outlet.knee.value = 0;
    outlet.ratio.value = 0;
    outlet.attack.value = 0;
    outlet.release.value = 0;

    var threshold = util.defaults(spec.thresh, spec.threshold, -24);
    var knee = util.defaults(spec.knee, 30);
    var ratio = util.defaults(spec.ratio, 12);
    var attack = util.defaults(spec.a, spec.attack, spec.attackTime, 0.003);
    var release = util.defaults(spec.r, spec.release, spec.releaseTime, 0.250);

    attack = context.toSeconds(attack);
    release = context.toSeconds(release);

    context.connect(threshold, outlet.threshold);
    context.connect(knee, outlet.knee);
    context.connect(ratio, outlet.ratio);
    context.connect(attack, outlet.attack);
    context.connect(release, outlet.release);
    context.connect(inputs, outlet);

    return new neume.Unit({
      outlet: outlet
    });
  }

};
