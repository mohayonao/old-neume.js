module.exports = function(neume, util) {
  "use strict";

  /**
   * $("in", {
   *   bus: number = 0,
   *   mul: signal = 1,
   *   add: signal = 0,
   * })
   *
   *  +---------------+
   *  | AudioBus[bus] |
   *  +---------------+
   *   |
   */
  neume.register("in", function(ugen, spec) {
    var context = ugen.context;
    var index = Math.max(0, util.int(spec.bus));

    return new neume.Unit({
      outlet: context.getAudioBus(index)
    });
  });

  /**
   * $("out", {
   *   bus: number = 0,
   * }, ...inputs: signal)
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   * +---------------+
   * | AudioBus[bus] |
   * +---------------+
   */
  neume.register("out", function(ugen, spec, inputs) {
    var context = ugen.context;
    var outlet = new neume.Sum(context, inputs);
    var index = Math.max(0, util.int(spec.bus));

    ugen.synth._dispatchNode(outlet, index);

    return new neume.Unit({
      outlet: outlet,
      isOutput: true
    });
  });
};
