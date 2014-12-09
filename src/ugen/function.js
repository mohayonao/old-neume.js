module.exports = function(neume, util) {
  "use strict";

  /* istanbul ignore next */
  var NOP = function() {};

  /**
   * $(function, {
   *   tC: [number] = 0
   * } ... inputs)
   *
   * methods:
   *   setValue(t, value)
   *   execute(t)
   *
   * +--------+      +-------+
   * | inputs |  or  | DC(1) |
   * +--------+      +-------+
   *   ||||||
   * +-------------------------+
   * | GainNode                |
   * | - gain: evaluated value |
   * +-------------------------+
   *   |
   */
  neume.register("function", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;

    var data = typeof spec.value === "function" ? spec.value : /* istanbul ignore next */ NOP;
    var count = 0;
    var param = new neume.Param(context, util.finite(data(0, count++)), spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function setValue(e) {
      var t0 = util.finite(context.toSeconds(e.playbackTime));
      var value = e.value;
      if (typeof value === "function") {
        context.sched(t0, function() {
          data = value;
        });
      }
    }

    function evaluate(e) {
      var t0 = util.finite(context.toSeconds(e.playbackTime));
      context.sched(t0, function(startTime) {
        update(startTime);
      });
    }

    function update(startTime) {
      var value = data({
        playbackTime: startTime,
        count: count++
      });

      param.update(value, startTime);
    }

    return new neume.Unit({
      outlet: outlet,
      methods: {
        setValue: setValue,
        evaluate: evaluate
      }
    });
  }

};
