module.exports = function(neume, _) {
  "use strict";

  /**
   * $([], {
   *   mode : enum[ clip, wrap, fold ] = clip
   *   lag  : [number] = 0
   *   curve: [number] = 0
   * } ... inputs)
   *
   * methods:
   *   setValue(t, value)
   *   at(t, index)
   *   next(t)
   *   prev(t)
   *
   * +--------+      +-------+
   * | inputs |  or  | DC(1) |
   * +--------+      +-------+
   *   ||||||
   * +----------------------+
   * | GainNode             |
   * | - gain: array[index] |
   * +----------------------+
   *   |
   */
  neume.register("array", function(ugen, spec, inputs) {
    var context = ugen.$context;

    var gain  = context.createGain();
    var index = 0;
    var data  = spec.value;
    var mode  = {
      clip: _.clipAt,
      wrap: _.wrapAt,
      fold: _.foldAt,
    }[spec.mode] || /* istanbul ignore next*/ _.clipAt;
    var lag   = _.finite(spec.lag);
    var curve = _.finite(spec.curve);

    if (!Array.isArray(data) || data.length === 0)  {
      data = [ 0 ];
    }

    if (inputs.length === 0) {
      inputs = [ new neume.DC(context, 1) ];
    }

    inputs.forEach(function(node) {
      _.connect({ from: node, to: gain });
    });

    var prevValue = _.finite(data[0]);

    gain.gain.setValueAtTime(prevValue, 0);

    function update(t0, nextIndex) {
      var v0 = prevValue;
      var v1 = _.finite(mode(data, nextIndex));

      if (lag <= 0 || curve < 0 || 1 <= curve) {
        gain.gain.setValueAtTime(v1, t0);
      } else {
        gain.gain.setTargetAtTime(v1, t0, timeConstant(lag, v0, v1, curve));
      }

      prevValue = v1;
      index = nextIndex;
    }

    return new neume.Unit({
      outlet: gain,
      methods: {
        setValue: function(t, value) {
          if (Array.isArray(value)) {
            context.sched(t, function() {
              data = value;
            });
          }
        },
        at: function(t, index) {
          context.sched(t, function() {
            update(t, _.int(index));
          });
        },
        next: function(t) {
          context.sched(t, function() {
            update(t, index + 1);
          });
        },
        prev: function(t) {
          context.sched(t, function() {
            update(t, index - 1);
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
