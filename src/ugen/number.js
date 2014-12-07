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
    var context = ugen.$context;
    var outlet = null;

    var data = util.finite(spec.value);
    var param = new neume.Param(context, data, spec);

    if (inputs.length) {
      outlet = context.createGain();
      new neume.Sum(context, inputs).connect(outlet);
      context.connect(param, outlet.gain);
    } else {
      outlet = param;
    }

    function update(t0, v0, v1, nextData) {
      param.update({ startValue: v0, endValue: v1, startTime: t0 });
      data = nextData;
    }

    return new neume.Unit({
      outlet: outlet,
      methods: {
        setValue: function(t, value) {
          if (util.isFinite(value)) {
            context.sched(util.finite(context.toSeconds(t)), function() {
              update(t, data, value, value);
            });
          }
        }
      }
    });
  });

};
