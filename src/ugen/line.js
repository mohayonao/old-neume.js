module.exports = function(neume, _) {
  "use strict";

  /*
   * $("line", {
   *   start: number=1
   *   end  : number=1e-6
   *   dur  : number=1
   * } ... inputs)
   *
   * $("xline", {
   *   start: number=1
   *   end  : number=1e-6
   *   dur  : number=1
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
    return make("linearRampToValueAtTime", ugen, spec, inputs);
  });

  neume.register("xline", function(ugen, spec, inputs) {
    return make("exponentialRampToValueAtTime", ugen, spec, inputs);
  });

  function make(curve, ugen, spec, inputs) {
    var context = ugen.$context;

    var line  = context.createGain();
    var gain  = line.gain;
    var startValue = _.finite(_.defaults(spec.start, 1));
    var endValue   = _.finite(_.defaults(spec.end  , 1e-6));
    var duration   = _.finite(_.defaults(spec.dur  , 1));
    var schedId = 0;

    if (_.isEmpty(inputs)) {
      inputs = [ new neume.DC(context, 1) ];
    }

    inputs.forEach(function(input) {
      _.connect({ from: input, to: line });
    });

    gain.setValueAtTime(startValue, 0);

    function start(t) {
      var t0 = t;
      var t1 = t0 + duration;

      gain.setValueAtTime(startValue, t0);
      gain[curve](endValue, t1);

      schedId = context.sched(t1, function(t) {
        schedId = 0;
        ugen.emit("end", { playbackTime: t }, ugen.$synth);
      });
    }

    function stop() {
      context.unsched(schedId);
    }

    return new neume.Unit({
      outlet: line,
      start : start,
      stop  : stop
    });
  }

};
