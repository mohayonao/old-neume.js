module.exports = function(neume, util) {
  "use strict";

  /**
   * $(boolean, {
   *   true: number = 1,
   *   false: number = 0,
   *   curve: string|number = "step",
   *   lag: timevalue = 0,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * methods:
   *   setValue(startTime: timevalue, value: boolean)
   *   toggle(startTime: timevalue)
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   * +----------+
   * | GainNode |
   * | - gain: <--- value ? trueVal : falseVal
   * +----------+
   *   |
   */
  neume.register("boolean", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;

    var data = !!spec.value;
    var trueVal = util.finite(util.defaults(spec.true, 1));
    var falseVal = util.finite(util.defaults(spec.false, 0));
    var param = new neume.Param(context, data ? trueVal : falseVal, spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function setValue(t, value) {
      if (typeof value === "boolean") {
        update(value, t);
      }
    }

    function toggle(t) {
      update(!data, t);
    }

    function update(value, startTime) {
      param.update(value ? trueVal : falseVal, util.finite(context.toSeconds(startTime)));
      data = value;
    }

    return new neume.Unit({
      outlet: outlet,
      methods: {
        setValue: setValue,
        toggle: toggle
      }
    });
  }

};
