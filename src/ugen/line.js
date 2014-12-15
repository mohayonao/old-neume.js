module.exports = function(neume, util) {
  "use strict";

  /*
   * $("line", {
   *   start: number = 1,
   *   end: number = 0,
   *   duration: timevlaue = 1,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * $("xline", {
   *   start: number = 1,
   *   end: number = 0,
   *   duration: timevalue = 1,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   * +----------+
   * | GainNode |
   * | - gain: <--- line value
   * +----------+
   *   |
   */
  neume.register("line", function(ugen, spec, inputs) {
    var startValue = util.finite(util.defaults(spec.start, spec.startValue, 1));
    var endValue = util.finite(util.defaults(spec.end, spec.endValue, 0));
    var duration = util.finite(util.defaults(ugen.$context.toSeconds(spec.dur, spec.duration), 1));
    return make("linTo", ugen, startValue, endValue, duration, inputs);
  });

  neume.register("xline", function(ugen, spec, inputs) {
    var startValue = Math.max(1e-6, util.finite(util.defaults(spec.start, spec.startValue, 1)));
    var endValue = Math.max(1e-6, util.finite(util.defaults(spec.end, spec.endValue, 0)));
    var duration = util.finite(util.defaults(ugen.$context.toSeconds(spec.dur, spec.duration), 1));
    return make("expTo", ugen, startValue, endValue, duration, inputs);
  });

  function make(curve, ugen, startValue, endValue, duration, inputs) {
    var context = ugen.$context;

    var schedId = 0;
    var param = new neume.Param(context, startValue);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function start(t) {
      var t0 = t;
      var t1 = t0 + duration;

      param.setAt(startValue, t0);
      param[curve](endValue, t1);

      schedId = context.sched(t1, function(t) {
        schedId = 0;
        ugen.emit("end", { playbackTime: t }, ugen.$synth);
      });
    }

    function stop() {
      context.unsched(schedId);
    }

    return new neume.Unit({
      outlet: outlet,
      start: start,
      stop: stop
    });
  }

};
