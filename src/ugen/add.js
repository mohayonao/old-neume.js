module.exports = function(neuma, _) {
  "use strict";

  /**
   * +------------+
   * | ...inputs  |
   * +------------+
   *   |
   * +------------+
   * | GainNode   |
   * | - gain: 1  |
   * +------------+
   *   |
   */
  neuma.register("+", function(ugen, spec, inputs) {
    var parts = _.partition(inputs, _.isNumber);
    var nodes = _.second(parts);
    var offset = _.reduce(_.first(parts), function(a, b) {
      return a + b;
    }, 0);

    if (offset !== 0) {
      nodes.push(new neuma.DC(ugen.$context, offset));
    }

    var outlet = ugen.$context.createGain();

    nodes.forEach(function(node) {
      _.connect({ from: node, to: outlet });
    });

    return new neuma.Unit({
      outlet: outlet
    });
  });

};
