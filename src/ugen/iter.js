module.exports = function(neume, _) {
  "use strict";

  var ITERATE  = 0;
  var FINISHED = 1;

  /**
   * $("iter", {
   *   iter : [iterator] = null
   *   timeConstant: [number] = 0
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

    var iter  = _.defaults(spec.iter, null);
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
      if (iter == null) {
        return { value: undefined, done: true };
      }
      var items;
      if (typeof iter.next === "function") {
        items = iter.next();
        if (!_.isObject(items)) {
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
          prevValue = _.finite(items.value);
          param.setAt(prevValue, t);
        }
      },
      methods: {
        setValue: function(t, value) {
          context.sched(_.finite(context.toSeconds(t)), function() {
            iter = _.defaults(value, {});
          });
        },
        next: function(t) {
          context.sched(_.finite(context.toSeconds(t)), function(t) {
            if (state === ITERATE) {
              var items = iterNext();
              var value;

              if (items.done) {
                state = FINISHED;
                ugen.emit("end", { playbackTime: t }, ugen.$synth);
              } else {
                value = _.finite(items.value);
                param.update(t, value, prevValue);
                prevValue = value;
              }
            }
          });
        }
      }
    });
  });

};
