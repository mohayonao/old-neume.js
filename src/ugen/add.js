module.exports = function(neume) {
  "use strict";

  /**
   * $("+" ... inputs)
   *
   * +--------+
   * | inputs |
   * +--------+
   *   ||||||
   * +------------+
   * | GainNode   |
   * | - gain: 1  |
   * +------------+
   *   |
   */
  neume.register("+", function(ugen, spec, inputs) {
    return new neume.Unit({
      outlet: ugen.$context.createNeuSum(inputs)
    });
  });

};
