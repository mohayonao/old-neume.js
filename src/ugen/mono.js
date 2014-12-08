module.exports = function(neume) {
  "use strict";

  /**
   * $("mono", {
   *   mul: 1, add: 0
   * } ... inputs)
   *
   * +--------+
   * | inputs |
   * +--------+
   *   |
   * +-----------+
   * | GainNode  |
   * | - gain: 1 |
   * +-----------+
   *   |
   */
  neume.register("mono", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet = context.createGain();

    outlet.channelCount = 1;
    outlet.channelCountMode = "explicit";
    outlet.channelInterpretation = "speakers";

    context.connect(inputs, outlet);

    return new neume.Unit({
      outlet: outlet
    });
  }

};
