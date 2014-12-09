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
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet = context.createConvolver();

    var buffer = context.toAudioBuffer(spec.buf || spec.buffer);

    if (buffer != null) {
      outlet.buffer = buffer;
    }
    outlet.normalize = !!util.defaults(spec.normalize, true);

    context.connect(inputs, outlet);

    return new neume.Unit({
      outlet: outlet
    });
  }

};
