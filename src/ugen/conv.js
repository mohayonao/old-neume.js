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
    var buffer = _.findAudioBuffer(spec.buffer);
    var conv = ugen.$context.createConvolver();

    /* istanbul ignore else */
    if (buffer != null) {
      conv.buffer = buffer;
    }
    conv.normalize = !!_.defaults(spec.normalize, true);

    inputs.forEach(function(node) {
      _.connect({ from: node, to: conv });
    });

    return new neume.Unit({
      outlet: conv
    });
  });

};
