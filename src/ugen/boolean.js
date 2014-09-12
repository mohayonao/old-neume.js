module.exports = function(neuma, _) {
  "use strict";

  /**
   * $(boolean, {
   *   lag  : number = 0
   *   curve: number = 0
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
   * +-----------------------+
   * | GainNode              |
   * | - gain: value ? 0 : 1 |
   * +-----------------------+
   *   |
   */
  neuma.register("boolean", function(ugen, spec, inputs) {
    var context = ugen.$context;

    var gain  = context.createGain();
    var data  = !!spec.value;
    var lag   = _.finite(spec.lag);
    var curve = _.finite(spec.curve);

    if (_.isEmpty(inputs)) {
      inputs = [ new neuma.DC(context, 1) ];
    }

    inputs.forEach(function(node) {
      _.connect({ from: node, to: gain });
    });

    gain.gain.setValueAtTime(data ? 1 : 0, 0);

    function update(t0, v0, v1, nextData) {
      if (lag <= 0 || curve < 0 || 1 <= curve) {
        gain.gain.setValueAtTime(v1, t0);
      } else {
        gain.gain.setTargetAtTime(v1, t0, timeConstant(lag, v0, v1, curve));
      }
      data = nextData;
    }

    return new neuma.Unit({
      outlet: gain,
      methods: {
        setValue: function(t, value) {
          if (_.isBoolean(value)) {
            context.sched(t, function() {
              var v0 = data  ? 1 : 0;
              var v1 = value ? 1 : 0;
              update(t, v0, v1, value);
            });
          }
        },
        toggle: function(t) {
          context.sched(t, function() {
            var v0 = data ? 1 : 0;
            var v1 = data ? 0 : 1;
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
