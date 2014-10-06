module.exports = function(neume, _) {
  "use strict";

  /*
   * $("line", {
   *   start: [number] = 1
   *   end  : [number] = 0
   *   dur  : [number] = 1
   * } ... inputs)
   *
   * $("xline", {
   *   start: [number] = 1
   *   end  : [number] = 0
   *   dur  : [number] = 1
   * } ... inputs)
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
  neume.register("line", function(ugen, spec, inputs) {
    var startValue = _.finite(_.defaults(spec.start, 1));
    var endValue   = _.finite(_.defaults(spec.end  , 0));
    var duration   = _.finite(_.defaults(ugen.$context.toSeconds(spec.dur), 1));
    return make("linTo", ugen, startValue, endValue, duration, inputs);
  });

  neume.register("xline", function(ugen, spec, inputs) {
    var startValue = Math.max(1e-6, _.finite(_.defaults(spec.start, 1)));
    var endValue   = Math.max(1e-6, _.finite(_.defaults(spec.end  , 0)));
    var duration   = _.finite(_.defaults(ugen.$context.toSeconds(spec.dur), 1));
    return make("expTo", ugen, startValue, endValue, duration, inputs);
  });

  function make(curve, ugen, startValue, endValue, duration, inputs) {
    var context = ugen.$context;
    var outlet  = null;

    var schedId = 0;
    var param = context.createParam(startValue);

    if (inputs.length) {
      outlet = context.createGain();
      context.createSum(inputs).connect(outlet);
      context.connect(param, outlet.gain);
    } else {
      outlet = param;
    }

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
      start : start,
      stop  : stop
    });
  }

};
