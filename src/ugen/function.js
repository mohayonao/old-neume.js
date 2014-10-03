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

    var gain  = context.createGain();
    var data  = typeof spec.value === "function" ? spec.value : /* istanbul ignore next */ NOP;
    var lag   = _.finite(spec.lag);
    var curve = _.finite(spec.curve);
    var count = 0;

    if (inputs.length === 0) {
      inputs = [ new neume.DC(context, 1) ];
    }

    inputs.forEach(function(node) {
      context.connect(node, gain);
    });

    var prevValue = _.finite(data(0, count++));

    gain.gain.setValueAtTime(prevValue, 0);

    function update(t0) {
      var v0 = prevValue;
      var v1 = _.finite(data(t0, count++));

      if (lag <= 0 || curve < 0 || 1 <= curve) {
        gain.gain.setValueAtTime(v1, t0);
      } else {
        gain.gain.setTargetAtTime(v1, t0, timeConstant(lag, v0, v1, curve));
      }

      prevValue = v1;
    }

    return new neume.Unit({
      outlet: gain,
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
