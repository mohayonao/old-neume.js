module.exports = function(neume, _) {
  "use strict";

  /**
   * $("conv", {
   *   buf      : [AudioBuffer|NeuBuffer] = null
   *   normalize: [boolean]               = true
   *   mix      : [number|UGen]           = 1
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

    var mix = _.defaults(spec.mix, 1);

    /* istanbul ignore else */
    if (buffer != null) {
      conv.buffer = buffer;
    }
    conv.normalize = !!_.defaults(spec.normalize, true);

    var outlet = context.createDryWet(inputs, conv, mix);

    return new neume.Unit({
      outlet: outlet
    });
  });

};
