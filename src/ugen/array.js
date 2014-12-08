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
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;

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

    var param = new neume.Param(context, util.finite(data[0]), spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function setValue(t, value) {
      if (Array.isArray(value)) {
        context.sched(util.finite(context.toSeconds(t)), function() {
          data = value;
        });
      }
    }

    function at(t, index) {
      context.sched(util.finite(context.toSeconds(t)), function(t) {
        update(t, util.int(index));
      });
    }

    function next(t) {
      context.sched(util.finite(context.toSeconds(t)), function(t) {
        update(t, index + 1);
      });
    }

    function prev(t) {
      context.sched(util.finite(context.toSeconds(t)), function(t) {
        update(t, index - 1);
      });
    }

    function update(t0, nextIndex) {
      var value = mode(data, nextIndex);

      param.update(value, t0);

      index = nextIndex;
    }

    return new neume.Unit({
      outlet: outlet,
      methods: {
        setValue: setValue,
        at: at,
        next: next,
        prev: prev
      }
    });
  }

};
