module.exports = function(neume, util) {
  "use strict";

  /* istanbul ignore next */
  var NOP = function() {};

  /**
   * $(function, {
   *   curve: string|number = "step",
   *   lag: timevalue = 0,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * methods:
   *   setValue(startTime: timevalue, value: ({ playbackTime: number, count: number })->number)
   *   execute(startTime: timevalue)
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   * +----------+
   * | GainNode |
   * | - gain: <--- evaluated value
   * +----------+
   *   |
   */
  neume.register("function", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;

    var data = typeof spec.value === "function" ? spec.value : /* istanbul ignore next */ NOP;
    var count = 0;
    var param = new neume.Param(context, util.finite(data(0, count++)), spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function setValue(t, value) {
      if (typeof value === "function") {
        data = value;
      }
    }

    function evaluate(t) {
      t = util.finite(context.toSeconds(t));

      var value = data({
        playbackTime: t,
        count: count++
      });

      param.update(value, t);
    }

    return new neume.Unit({
      outlet: outlet,
      methods: {
        setValue: setValue,
        evaluate: evaluate
      }
    });
  }

};
