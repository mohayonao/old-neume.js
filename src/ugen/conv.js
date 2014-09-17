module.exports = function(neume, _) {
  "use strict";

  /**
   * +------------+
   * | ...inputs  |
   * +------------+
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
    var buffer = _.findAudioBuffer(spec.buffer);
    var conv = context.createConvolver();

    var mix = _.defaults(spec.mix, 1);

    /* istanbul ignore else */
    if (buffer != null) {
      conv.buffer = buffer;
    }
    conv.normalize = !!_.defaults(spec.normalize, true);

    var outlet = new neume.DryWet(context, inputs, conv, mix);

    return new neume.Unit({
      outlet: outlet
    });
  });

};
