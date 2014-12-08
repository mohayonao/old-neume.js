module.exports = function(neume, util) {
  "use strict";

  /* istanbul ignore next */
  var NOP = function() {};

  /**
   * $(function, {
   *   tC: [number] = 0
   * } ... inputs)
   *
   * methods:
   *   setValue(t, value)
   *   execute(t)
   *
   * +--------+      +-------+
   * | inputs |  or  | DC(1) |
   * +--------+      +-------+
   *   ||||||
   * +-------------------------+
   * | GainNode                |
   * | - gain: evaluated value |
   * +-------------------------+
   *   |
   */
  neume.register("function", function(ugen, spec, inputs) {
    var context = ugen.$context;

    var data = typeof spec.value === "function" ? spec.value : /* istanbul ignore next */ NOP;
    var count = 0;
    var prevValue = util.finite(data(0, count++));
    var param = new neume.Param(context, prevValue, spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function update(t0) {
      var v0 = prevValue;
      var v1 = data(t0, count++);

      param.update({ startValue: v0, endValue: v1, startTime: t0 });

      prevValue = v1;
    }

    return new neume.Unit({
      outlet: outlet,
      methods: {
        setValue: function(t, value) {
          if (typeof value === "function") {
            context.sched(util.finite(context.toSeconds(t)), function() {
              data = value;
            });
          }
        },
        evaluate: function(t) {
          context.sched(util.finite(context.toSeconds(t)), function(t) {
            update(t);
          });
        }
      }
    });
  });

};
