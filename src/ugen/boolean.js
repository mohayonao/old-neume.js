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

    function setValue(e) {
      var t0 = util.finite(context.toSeconds(e.playbackTime));
      var value = e.value;
      if (typeof value === "boolean") {
        context.sched(t0, function(startTime) {
          update(value ? trueVal : falseVal, startTime, value);
        });
      }
    }

    function toggle(e) {
      var t0 = util.finite(context.toSeconds(e.playbackTime));
      context.sched(t0, function(startTime) {
        update(data ? falseVal : trueVal, startTime, !data);
      });
    }

    function update(value, startTime, nextData) {
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
