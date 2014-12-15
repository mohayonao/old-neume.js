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
    }[spec.clip || spec.mode] || /* istanbul ignore next*/ util.clipAt;

    if (!Array.isArray(data) || data.length === 0)  {
      data = [ 0 ];
    }

    var param = new neume.Param(context, util.finite(data[0]), spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function setValue(e) {
      if (Array.isArray(e.value)) {
        data = e.value;
      }
    }

    function at(e) {
      var index = util.int(util.defaults(e.value, e.index, e.count));
      update(index, e.playbackTime);
    }

    function next(e) {
      update(index + 1, e.playbackTime);
    }

    function prev(e) {
      update(index - 1, e.playbackTime);
    }

    function update(nextIndex, startTime) {
      var value = mode(data, nextIndex);

      param.update(value, util.finite(context.toSeconds(startTime)));

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
