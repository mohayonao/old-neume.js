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
      if (typeof e.value === "function") {
        data = e.value;
      }
    }

    function evaluate(e) {
      update(e.playbackTime);
    }

    function update(startTime) {
      startTime = util.finite(context.toSeconds(startTime));

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
