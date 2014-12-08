module.exports = function(neume, util) {
  "use strict";

  /**
   * $([], {
   *   mode: enum[ clip, wrap, fold ] = clip
   *   tC: [number] = 0
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
    var outlet = null;

    var index = 0;
    var data = spec.value;
    var mode = {
      clip: util.clipAt,
      wrap: util.wrapAt,
      fold: util.foldAt,
    }[spec.mode] || /* istanbul ignore next*/ util.clipAt;

    if (!Array.isArray(data) || data.length === 0)  {
      data = [ 0 ];
    }

    var prevValue = util.finite(data[0]);
    var param = new neume.Param(context, prevValue, spec);

    if (inputs.length) {
      outlet = context.createGain();
      context.connect(inputs, outlet);
      context.connect(param, outlet.gain);
    } else {
      outlet = param;
    }

    function update(t0, nextIndex) {
      var v0 = prevValue;
      var v1 = mode(data, nextIndex);

      param.update({ startValue: v0, endValue: v1, startTime: t0 });

      prevValue = v1;
      index = nextIndex;
    }

    return new neume.Unit({
      outlet: outlet,
      methods: {
        setValue: function(t, value) {
          if (Array.isArray(value)) {
            context.sched(util.finite(context.toSeconds(t)), function() {
              data = value;
            });
          }
        },
        at: function(t, index) {
          context.sched(util.finite(context.toSeconds(t)), function(t) {
            update(t, util.int(index));
          });
        },
        next: function(t) {
          context.sched(util.finite(context.toSeconds(t)), function(t) {
            update(t, index + 1);
          });
        },
        prev: function(t) {
          context.sched(util.finite(context.toSeconds(t)), function(t) {
            update(t, index - 1);
          });
        }
      }
    });
  });

};
