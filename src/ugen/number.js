module.exports = function(neuma, _) {
  "use strict";

  /**
   * +-------+
   * | DC(1) |
   * +-------+
   *   |
   * +---------------+
   * | GainNode      |
   * | - gain: value |
   * +---------------+
   *   |
   */
  neuma.register("number", function(ugen, spec) {
    var gain = ugen.$context.createGain();

    gain.gain.value = _.num(spec.value);

    _.connect({ from: new neuma.DC(ugen.$context, 1), to: gain });

    return new neuma.Unit({
      outlet: gain
    });

  });

};
