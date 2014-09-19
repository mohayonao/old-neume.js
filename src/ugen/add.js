module.exports = function(neume, _) {
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
    var context = ugen.$context;
    var outlet  = null;

    var nodes  = [];
    var offset = 0;

    inputs.forEach(function(node) {
      if (typeof node === "number") {
        offset += node;
      } else {
        nodes.push(node);
      }
    });
    offset = _.finite(offset);

    if (nodes.length) {
      outlet = context.createGain();

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
