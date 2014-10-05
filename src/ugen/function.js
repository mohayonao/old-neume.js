module.exports = function(neume, _) {
  "use strict";

  /* istanbul ignore next */
  var NOP = function() {};

  /**
   * $(function, {
   *   lag  : [number] = 0
   *   curve: [number] = 0
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
    var outlet  = null;

    var data  = typeof spec.value === "function" ? spec.value : /* istanbul ignore next */ NOP;
    var lag   = _.finite(spec.lag);
    var curve = _.finite(spec.curve);
    var count = 0;

    var prevValue = _.finite(data(0, count++));
    var param = context.createParam(prevValue);

    if (inputs.length) {
      outlet = context.createGain();
      context.createSum(inputs).connect(outlet);
      context.connect(param, outlet.gain);
    } else {
      outlet = param;
    }

    function update(t0) {
      var v0 = prevValue;
      var v1 = _.finite(data(t0, count++));

      if (lag <= 0 || curve < 0 || 1 <= curve) {
        param.setAt(v1, t0);
      } else {
        param.targetAt(v1, t0, timeConstant(lag, v0, v1, curve));
      }

      prevValue = v1;
    }

    return new neume.Unit({
      outlet: outlet,
      methods: {
        setValue: function(t, value) {
          if (typeof value === "function") {
            t = _.finite(_.defaults(t, context.currentTime));
            context.sched(t, function() {
              data = value;
            });
          }
        },
        evaluate: function(t) {
          t = _.finite(_.defaults(t, context.currentTime));
          context.sched(t, function() {
            update(t);
          });
        }
      }
    });
  });

  function timeConstant(duration, startValue, endValue, curve) {
    var targetValue = startValue + (endValue - startValue) * (1 - curve);

    return -duration / Math.log((targetValue - endValue) / (startValue - endValue));
  }

};
