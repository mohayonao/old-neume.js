module.exports = function(neume, _) {
  "use strict";

  var ITERATE  = 0;
  var FINISHED = 1;

  /**
   * $("iter", {
   *   iter : [iterator] = null
   *   lag  : [number] = 0
   *   curve: [number] = 0
   * } ... inputs)
   *
   * methods:
   *   next(t)
   *   reset(t)
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
  neume.register("iter", function(ugen, spec, inputs) {
    var context = ugen.$context;

    var gain  = context.createGain();
    var iter  = _.defaults(spec.iter, {});
    var lag   = _.finite(spec.lag);
    var curve = _.finite(spec.curve);
    var state = ITERATE;

    if (inputs.length === 0) {
      inputs = [ new neume.DC(context, 1) ];
    }

    inputs.forEach(function(node) {
      context.connect(node, gain);
    });

    var prevValue = 0;

    gain.gain.setValueAtTime(prevValue, 0);

    function iterNext() {
      return typeof iter.next === "function" ? iter.next() : 0;
    }

    function update(t, v1) {
      v1 = _.finite(v1);

      if (lag <= 0 || curve < 0 || 1 <= curve) {
        gain.gain.setValueAtTime(v1, t);
      } else {
        gain.gain.setTargetAtTime(v1, t, timeConstant(lag, prevValue, v1, curve));
      }

      prevValue = v1;
    }

    function next(t) {
      if (state !== ITERATE) {
        return;
      }

      var v1 = iterNext();

      if (v1 == null) {
        state = FINISHED;
        ugen.emit("end", { playbackTime: t }, ugen.$synth);
      } else {
        update(t, v1);
      }
    }

    function reset(t) {
      if (typeof iter.reset === "function") {
        iter.reset();
      }
      update(t, iterNext());
    }

    return new neume.Unit({
      outlet: gain,
      start: function(t) {
        prevValue = _.finite(iterNext());
        gain.gain.setValueAtTime(prevValue, t);
      },
      methods: {
        setValue: function(t, value) {
          t = _.finite(_.defaults(t, context.currentTime));
          context.sched(t, function() {
            iter = _.defaults(value, {});
          });
        },
        next: function(t) {
          t = _.finite(_.defaults(t, context.currentTime));
          context.sched(t, function() {
            next(t);
          });
        },
        reset: function(t) {
          t = _.finite(_.defaults(t, context.currentTime));
          context.sched(t, function() {
            reset(t);
          });
        },
      }
    });
  });

  function timeConstant(duration, startValue, endValue, curve) {
    var targetValue = startValue + (endValue - startValue) * (1 - curve);

    return -duration / Math.log((targetValue - endValue) / (startValue - endValue));
  }

};
