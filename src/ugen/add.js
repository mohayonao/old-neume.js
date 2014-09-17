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
  neume.register("+", function(ugen, spec, inputs) {
    var outlet = null;

    var nodes  = [];
    var offset = 0;

    for (var i = 0, imax = inputs.length; i < imax; i++) {
      if (typeof inputs[i] === "number")  {
        offset += inputs[i];
      } else {
        nodes.push(inputs[i]);
      }
    }

    offset = _.finite(offset);

    if (nodes.length) {
      outlet = ugen.$context.createGain();

      nodes.forEach(function(node) {
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
