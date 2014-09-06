"use strict";

var _ = require("./utils");

_.NeuDC = require("./dc");

/**
 * Apply mul, add
 *
 * @param {AudioContext} context
 * @param {NeuUGen}      ugen
 * @param {object}       spec
 * @return {AudioNode}   applied mul, add
 */
function makeOutlet(context, ugen, spec) {
  var outlet;

  var mul = spec.mul;
  var add = spec.add;
  var node = _.findAudioNode(ugen);

  if (!_.isAudioNode(node)) {
    return null;
  }

  if (mul === 0) {
    if (_.isValidInput(add)) {
      if (_.isNumber(add)) {
        add = _.findAudioNode(new _.NeuDC(context, add));
      }
      return add;
    }
    return _.findAudioNode(new _.NeuDC(context, 0));
  }

  if (_.isValidInput(mul) && mul !== 0 && mul !== 1) {
    /*
     * +------+
     * | node |
     * +------+
     *   |
     * +--------------+
     * | GainNode     |
     * | - gain: mul  |
     * +--------------+
     *   |
     */
    outlet = context.createGain();
    outlet.gain.value = 0;

    _.connect({ from: mul , to: outlet.gain });
    _.connect({ from: node, to: outlet      });

    node = outlet;
  }

  if (_.isValidInput(add) && add !== 0) {
    /*
     * +------+  +-----+
     * | node |  | add |
     * +------+  +-----+
     *   |         |
     * +---------------+
     * | GainNode      |
     * | - gain: 1     |
     * +---------------+
     *   |
     */
    outlet = context.createGain();

    if (_.isNumber(add)) {
      add = new _.NeuDC(context, add);
    }

    _.connect({ from: node, to: outlet });
    _.connect({ from: add , to: outlet });

    node = outlet;
  }

  return node;
}

module.exports = makeOutlet;
