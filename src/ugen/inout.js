module.exports = function(neume, util) {
  "use strict";

  var AUDIO_BUS_CHANNELS = neume.AUDIO_BUS_CHANNELS;

  /**
  * $("in", {
  *   mul: signal = 1,
  *   add: signal = 0,
  * }, ...bus: number)
  *
  *  +-------------+     +-------------+
  *  | AudioBus[0] | ... | AudioBus[0] |
  *  +-------------+     +-------------+
  *   |                    |
  *   +--------------------+
  *   |
  */
  neume.register("in", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet = null;

    inputs = inputs.filter(util.isFinite).map(function(index) {
      return getAudioBus(context, index);
    });

    outlet = new neume.Sum(context, inputs);

    return new neume.Unit({
      outlet: outlet
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
    var context = ugen.$context;
    var synth = ugen.$synth;
    var outlet = new neume.Sum(context, inputs);

    var index = util.clip(util.int(util.defaults(spec.bus, 0)), 0, AUDIO_BUS_CHANNELS);

    synth.$routes[index] = outlet;

    return new neume.Unit({
      outlet: outlet,
      isOutput: true
    });
  });

  function getAudioBus(context, index) {
    index = util.clip(util.int(util.defaults(index, 0)), 0, AUDIO_BUS_CHANNELS);

    return context.getAudioBus(index);
  }
};
