module.exports = function(neume, util) {
  "use strict";

  /**
   * $("conv", {
   *   buffer: AudioBuffer|neume.Buffer = null,
   *   normalize: boolean = true,
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
   * | ConvolverNode          |
   * | - buffer: buffer       |
   * | - normalize: normalize |
   * +------------------------+
   *   |
   */
  neume.register("conv", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet = context.createConvolver();

    var buffer = util.defaults(spec.buf, spec.buffer);

    buffer = context.toAudioBuffer(buffer);

    if (buffer != null) {
      outlet.buffer = buffer;
    }
    outlet.normalize = !!util.defaults(spec.norm, spec.normalize, true);

    context.connect(inputs, outlet);

    return new neume.Unit({
      outlet: outlet
    });
  }

};
