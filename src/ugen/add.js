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
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    return new neume.Unit({
      outlet: new neume.Sum(ugen.$context, inputs)
    });
  }

};
