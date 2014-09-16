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
   * +------------------+
   * | GainNode         |
   * | - gain: multiple |
   * +------------------+
   *   |
   */
  neume.register("*", function(ugen, spec, inputs, multiple) {
    var context = ugen.$context;
    var outlet  = null;

    if (inputs.length && multiple !== 0) {
      outlet = _.rest(inputs).reduce(function(outlet, node) {
        var gain = context.createGain();

        gain.gain.value = 0;

        _.connect({ from: node, to: gain.gain });
        _.connect({ from: outlet, to: gain });

        return gain;
      }, _.first(inputs));

      if (multiple !== 1) {
        var tmp = outlet;

        outlet = context.createGain();

        outlet.gain.value = multiple;
        _.connect({ from: tmp, to: outlet });
      }
    }

    return new neume.Unit({
      outlet: outlet,
      offset: 0
    });

  });

};
