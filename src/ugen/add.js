module.exports = function(neume, _) {
  "use strict";

  /**
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
  neume.register("+", function(ugen, spec, inputs, offset) {
    var outlet = null;

    if (inputs.length) {
      outlet = ugen.$context.createGain();

      inputs.forEach(function(node) {
        _.connect({ from: node, to: outlet });
      });

      outlet.$maddOptimizable = true;
    }

    return new neume.Unit({
      outlet: outlet,
      offset: offset
    });
  });

};
