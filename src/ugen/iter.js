module.exports = function(neume, util) {
  "use strict";

  var ITERATE = 0;
  var FINISHED = 1;

  /**
   * $("iter", {
   *   iter: [iterator] = null
   *   tC: [number] = 0
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
    var outlet = null;

    var iter = util.defaults(spec.iter, null);
    var state = ITERATE;
    var prevValue = 0;
    var param = context.createNeuParam(prevValue, spec);

    if (inputs.length) {
      outlet = context.createGain();
      context.createNeuSum(inputs).connect(outlet);
      context.connect(param, outlet.gain);
    } else {
      outlet = param;
    }

    function iterNext() {
      if (iter == null) {
        return { value: undefined, done: true };
      }
      var items;
      if (typeof iter.next === "function") {
        items = iter.next();
        if (!util.isObject(items)) {
          items = { value: items, done: false };
        }
      } else {
        items = { value: iter.valueOf(), done: false };
      }
      return items;
    }

    return new neume.Unit({
      outlet: outlet,
      start: function(t) {
        var items = iterNext();

        if (items.done) {
          state = FINISHED;
          ugen.emit("end", { playbackTime: t }, ugen.$synth);
        } else {
          prevValue = util.finite(items.value);
          param.setAt(prevValue, t);
        }
      },
      methods: {
        setValue: function(t, value) {
          context.sched(util.finite(context.toSeconds(t)), function() {
            iter = util.defaults(value, {});
          });
        },
        next: function(t) {
          context.sched(util.finite(context.toSeconds(t)), function(t) {
            if (state === ITERATE) {
              var items = iterNext();
              var value;

              if (items.done) {
                state = FINISHED;
                ugen.emit("end", { playbackTime: t }, ugen.$synth);
              } else {
                value = util.finite(items.value);
                param.update(value, prevValue, t);
                prevValue = value;
              }
            }
          });
        }
      }
    });
  });

};
