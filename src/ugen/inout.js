module.exports = function(neume, util) {
  "use strict";

  var AUDIO_BUS_CHANNELS = neume.AUDIO_BUS_CHANNELS;

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
    var index = util.clip(util.int(util.defaults(spec.bus, 0)), 0, AUDIO_BUS_CHANNELS);

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

    var index = util.clip(util.int(util.defaults(spec.bus, 0)), 0, AUDIO_BUS_CHANNELS);

    ugen.synth.routes[index] = outlet;

    return new neume.Unit({
      outlet: outlet,
      isOutput: true
    });
  });
};
