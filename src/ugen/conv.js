module.exports = function(neume, util) {
  "use strict";

  /**
   * $("conv", {
   *   buf: [AudioBuffer|NeuBuffer] = null
   *   normalize: [boolean] = true
   * } ... inputs)
   *
   * +--------+
   * | inputs |
   * +--------+
   *   |
   * +------------------------------+
   * | ConvolverNode                |
   * | - buffer: buffer(null)       |
   * | - normalize: normalize(true) |
   * +------------------------------+
   *   |
   */
  neume.register("conv", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet = null;

    var buffer = context.toAudioBuffer(spec.buf || spec.buffer);

    outlet = context.createConvolver();

    /* istanbul ignore else */
    if (buffer != null) {
      outlet.buffer = buffer;
    }
    outlet.normalize = !!util.defaults(spec.normalize, true);

    context.createNeuSum(inputs).connect(outlet);

    return new neume.Unit({
      outlet: outlet
    });
  });

};
