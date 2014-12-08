module.exports = function(neume, util) {
  "use strict";

  /**
   * $(boolean, {
   *   true: [number] = 1
   *   false: [number] = 0
   *   tC: [number] = 0
   * } ... inputs)
   *
   * methods:
   *   setValue(t, value)
   *   toggle(t)
   *
   * +--------+      +-------+
   * | inputs |  or  | DC(1) |
   * +--------+      +-------+
   *   ||||||
   * +------------------------------------+
   * | GainNode                           |
   * | - gain: value ? trueVal : falseVal |
   * +------------------------------------+
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
        context.sched(util.finite(context.toSeconds(t)), function(t) {
          update(t, value ? trueVal : falseVal, value);
        });
      }
    }

    function toggle(t) {
      context.sched(util.finite(context.toSeconds(t)), function(t) {
        update(t, data ? falseVal : trueVal, !data);
      });
    }

    function update(startTime, value, nextData) {
      param.update(value, startTime);
      data = nextData;
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
