module.exports = function(neume, _) {
  "use strict";

  /*
   * +-----------+
   * | inputs[0] |
   * +-----------+
   *   |
   * +-----------+
   * | GainNode  |  +-----------+
   * | - gain: 0 |--| inputs[1] |
   * +-----------+  +-----------+
   *   |
   * +-----------+
   * | GainNode  |  +-----------+
   * | - gain: 0 |--| inputs[2] |
   * +-----------+  +-----------+
   *   |
   * +-----------------------------------+
   * | GainNode                          |
   * | - gain: mul extracted from inputs |
   * +-----------------------------------+
   *   |
   */
  neume.register("*", function(ugen, spec, inputs) {
    var outlet = null;

    var context = ugen.$context;
    var parts  = _.partition(inputs, _.isNumber);
    var nodes  = _.second(parts);
    var multiple = _.reduce(_.first(parts), function(a, b) {
      return a * b;
    }, 1);

    if (multiple === 0) {
      outlet = new neume.DC(context, 0);
      nodes  = [];
    } else {
      outlet = _.first(nodes) || new neume.DC(context, 1);
      nodes  = _.rest(nodes);
    }

    outlet = _.reduce(nodes, function(outlet, node) {
      var gain = context.createGain();

      gain.gain.value = 0;

      _.connect({ from: node, to: gain.gain });
      _.connect({ from: outlet, to: gain });

      return gain;
    }, outlet);

    if (multiple !== 0 && multiple !== 1) {
      var tmp = outlet;

      outlet = context.createGain();

      outlet.gain.value = multiple;
      _.connect({ from: tmp, to: outlet });
    }

    return new neume.Unit({
      outlet: outlet
    });

  });

};
