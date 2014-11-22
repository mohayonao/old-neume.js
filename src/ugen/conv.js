module.exports = function(neume, util) {
  "use strict";

  /**
   * $("conv", {
   *   buf: [AudioBuffer|NeuBuffer] = null
   *   normalize: [boolean] = true
   *   mix: [number|UGen] = 1
   * } ... inputs)
   *
   * +--------+
   * | inputs |
   * +--------+
   *   |    |
   *   |  +------------------------------+
   *   |  | ConvolverNode                |
   *   |  | - buffer: buffer(null)       |
   *   |  | - normalize: normalize(true) |
   *   |  +------------------------------+
   *   |    |
   * +--------+
   * | DryWet |
   * +--------+
   *   |
   */
  neume.register("conv", function(ugen, spec, inputs) {
    var context = ugen.$context;

    var buffer = context.toAudioBuffer(spec.buf);
    var conv = context.createConvolver();

    var mix = util.defaults(spec.mix, 1);

    /* istanbul ignore else */
    if (buffer != null) {
      conv.buffer = buffer;
    }
    conv.normalize = !!util.defaults(spec.normalize, true);

    var sum = context.createSum(inputs);

    context.connect(sum, conv);

    var outlet = context.createDryWet(sum, conv, mix);

    return new neume.Unit({
      outlet: outlet
    });
  });

};
