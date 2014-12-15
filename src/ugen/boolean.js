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
      if (typeof e.value === "boolean") {
        update(e.value, e.playbackTime);
      }
    }

    function toggle(e) {
      update(!data, e.playbackTime);
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
