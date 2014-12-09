module.exports = function(neume, util) {
  "use strict";

  /**
   * $(number, {
   *   tC: [number] = 0
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
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;

    var param = new neume.Param(context, util.finite(spec.value), spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function setValue(e) {
      var t0 = util.finite(context.toSeconds(e.playbackTime));
      var value = util.defaults(e.value, e.count, 0);
      if (util.isFinite(value)) {
        context.sched(t0, function(startTime) {
          update(value, startTime);
        });
      }
    }

    function update(value, startTime) {
      param.update(value, startTime);
    }

    return new neume.Unit({
      outlet: outlet,
      methods: {
        setValue: setValue
      }
    });
  }

};
