module.exports = function(neume, util) {
  "use strict";

  /**
   * $(number, {
   *   curve: string|number = "step",
   *   lag: timevalue = 0,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * methods:
   *   setValue(startTime: timevalue, value: number)
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   * +----------+
   * | GainNode |
   * | - gain: <--- number
   * +----------+
   *   |
   */
  neume.register("number", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.context;

    var param = new neume.Param(context, util.finite(spec.value), spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function setValue(t, value) {
      if (util.isFinite(value)) {
        update(value, t);
      }
    }

    function update(value, startTime) {
      param.update(value, util.finite(context.toSeconds(startTime)));
    }

    return new neume.Unit({
      outlet: outlet,
      methods: {
        setValue: setValue
      }
    });
  }

};
