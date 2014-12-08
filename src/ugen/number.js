module.exports = function(neume, util) {
  "use strict";

  /**
   * $(number, {
   *   tC: [number] = 0
   * } ... inputs)
   *
   * methods:
   *   setValue(t, value)
   *
   * +--------+      +-------+
   * | inputs |  or  | DC(1) |
   * +--------+      +-------+
   *   ||||||
   * +---------------+
   * | GainNode      |
   * | - gain: value |
   * +---------------+
   *   |
   */
  neume.register("number", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;

    var data = util.finite(spec.value);
    var param = new neume.Param(context, data, spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function setValue(t, value) {
      if (util.isFinite(value)) {
        context.sched(util.finite(context.toSeconds(t)), function() {
          update(t, data, value, value);
        });
      }
    }

    function update(t0, v0, v1, nextData) {
      param.update({ startValue: v0, endValue: v1, startTime: t0 });
      data = nextData;
    }

    return new neume.Unit({
      outlet: outlet,
      methods: {
        setValue: setValue
      }
    });
  }

};
