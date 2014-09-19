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
  neume.register("*", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet  = null;

    var nodes    = [];
    var multiple = 1;

    inputs.forEach(function(node) {
      if (typeof node === "number") {
        multiple *= node;
      } else {
        nodes.push(node);
      }
    });
    multiple = _.finite(multiple);

    if (nodes.length && multiple !== 0) {
      outlet = nodes.shift();

      outlet = nodes.reduce(function(outlet, node) {
        var gain = context.createGain();

        gain.gain.value = 0;

        _.connect({ from: node  , to: gain.gain });
        _.connect({ from: outlet, to: gain });

        return gain;
      }, outlet);

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
