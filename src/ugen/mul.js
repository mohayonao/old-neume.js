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
    var elem = partition(inputs);

    return make(setup(ugen, elem.nodes, elem.multiple));
  });

  function partition(inputs) {
    var multiple = 1;
    var nodes = [];

    for (var i = 0, imax = inputs.length; i < imax; i++) {
      if (typeof inputs[i] === "number") {
        multiple *= inputs[i];
      } else {
        nodes.push(inputs[i]);
      }
    }

    return { multiple: util.finite(multiple), nodes: nodes };
  }

  function setup(ugen, nodes, multiple) {
    var context = ugen.$context;

    if (multiple === 0) {
      return new neume.DC(context, 0);
    }
    if (nodes.length === 0) {
      return new neume.DC(context, multiple);
    }
    if (nodes.length === 1 && multiple === 1) {
      return nodes[0];
    }

    if (multiple !== 1) {
      nodes.push(multiple);
    }

    var mulNode = nodes[0];
    var nextMulNode;

    for (var i = 1, imax = nodes.length; i < imax; i++) {
      nextMulNode = createMulNode(context, nodes[i]);

      context.connect(mulNode, nextMulNode);

      mulNode = nextMulNode;
    }

    return mulNode;
  }

  function createMulNode(context, mul) {
    var mulNode = context.createGain();

    if (typeof mul === "number") {
      mulNode.gain.value = mul;
    } else {
      mulNode.gain.value = 0;
      context.connect(mul, mulNode.gain);
    }

    return mulNode;
  }

  function make(outlet) {
    return new neume.Unit({
      outlet: outlet
    });
  }

};
