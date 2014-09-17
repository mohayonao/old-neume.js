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
    var i, imax;

    for (i = 0, imax = inputs.length; i < imax; i++) {
      if (typeof inputs[i] === "number")  {
        multiple *= inputs[i];
      } else {
        nodes.push(inputs[i]);
      }
    }

    multiple = _.finite(multiple);

    if (nodes.length && multiple !== 0) {
      outlet = nodes.shift();

      for (i = 0, imax = nodes.length; i < imax; i++) {
        var gain = context.createGain();

        gain.gain.value = 0;

        _.connect({ from: nodes[i], to: gain.gain });
        _.connect({ from: outlet  , to: gain });

        outlet = gain;
      }

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
