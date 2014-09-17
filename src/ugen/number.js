module.exports = function(neume, _) {
  "use strict";

  /**
   * $(number, {
   *   lag  : number = 0
   *   curve: number = 0
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

    var gain  = context.createGain();
    var data  = _.finite(spec.value);
    var lag   = _.finite(spec.lag);
    var curve = _.finite(spec.curve);

    if (inputs.length === 0) {
      inputs = [ new neume.DC(context, 1) ];
    }

    inputs.forEach(function(node) {
      _.connect({ from: node, to: gain });
    });

    gain.gain.setValueAtTime(data, 0);

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
          if (_.isFinite(value)) {
            context.sched(t, function() {
              update(t, data, value, value);
            });
          }
        }
      }
    });
  });

  function timeConstant(duration, startValue, endValue, curve) {
    var targetValue = startValue + (endValue - startValue) * (1 - curve);

    return -duration / Math.log((targetValue - endValue) / (startValue - endValue));
  }

};
