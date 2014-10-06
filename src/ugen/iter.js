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
    var outlet  = null;

    var iter  = _.defaults(spec.iter, {});
    var state = ITERATE;
    var prevValue = 0;
    var param = context.createParam(prevValue, spec);

    if (inputs.length) {
      outlet = context.createGain();
      context.createSum(inputs).connect(outlet);
      context.connect(param, outlet.gain);
    } else {
      outlet = param;
    }

    function iterNext() {
      return typeof iter.next === "function" ? iter.next() : 0;
    }

    function update(t0, v1) {
      var v0 = prevValue;

      param.update(t0, v1, v0);

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
      outlet: outlet,
      start: function(t) {
        prevValue = _.finite(iterNext());
        param.setAt(prevValue, t);
      },
      methods: {
        setValue: function(t, value) {
          context.sched(_.finite(context.toSeconds(t)), function() {
            iter = _.defaults(value, {});
          });
        },
        next: function(t) {
          context.sched(_.finite(context.toSeconds(t)), function(t) {
            next(t);
          });
        },
        reset: function(t) {
          context.sched(_.finite(context.toSeconds(t)), function(t) {
            reset(t);
          });
        },
      }
    });
  });

};
