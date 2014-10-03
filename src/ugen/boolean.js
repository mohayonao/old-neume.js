module.exports = function(neume, _) {
  "use strict";

  /**
   * $(boolean, {
   *   true : [number] = 1
   *   false: [number] = 0
   *   lag  : [number] = 0
   *   curve: [number] = 0
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
    var context = ugen.$context;

    var gain  = context.createGain();
    var data  = !!spec.value;

    var trueVal  = _.finite(_.defaults(spec.true , 1));
    var falseVal = _.finite(_.defaults(spec.false, 0));
    var lag   = _.finite(spec.lag);
    var curve = _.finite(spec.curve);

    if (inputs.length === 0) {
      inputs = [ new neume.DC(context, 1) ];
    }

    inputs.forEach(function(node) {
      context.connect(node, gain);
    });

    gain.gain.setValueAtTime(data ? trueVal : falseVal, 0);

    function update(t0, v0, v1, nextData) {
      if (lag <= 0 || curve < 0 || 1 <= curve) {
        gain.gain.setValueAtTime(v1, t0);
      } else {
        gain.gain.setTargetAtTime(v1, t0, timeConstant(lag, v0, v1, curve));
      }
      data = nextData;
    }

    return new neume.Unit({
      outlet: gain,
      methods: {
        setValue: function(t, value) {
          if (typeof value === "boolean") {
            t = _.finite(_.defaults(t, context.currentTime));
            context.sched(t, function() {
              var v0 = data  ? trueVal : falseVal;
              var v1 = value ? trueVal : falseVal;
              update(t, v0, v1, value);
            });
          }
        },
        toggle: function(t) {
          t = _.finite(_.defaults(t, context.currentTime));
          context.sched(t, function() {
            var v0 = data ? trueVal : falseVal;
            var v1 = data ? falseVal : trueVal;
            update(t, v0, v1, !data);
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
