module.exports = function(neume, util) {
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
    var outlet = null;

    var nodes = [];
    var multiple = 1;

    inputs.forEach(function(node) {
      if (typeof node === "number") {
        multiple *= node;
      } else {
        nodes.push(node);
      }
    });
    multiple = util.finite(multiple);

    if (nodes.length === 0) {
      nodes.push(1);
    }

    outlet = nodes[0];
    for (var i = 1, imax = nodes.length; i < imax; i++) {
      outlet = context.createMul(outlet, nodes[i]);
    }
    outlet = context.createMul(outlet, multiple);

    return new neume.Unit({
      outlet: outlet
    });
  });

};
