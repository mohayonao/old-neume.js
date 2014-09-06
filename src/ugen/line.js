module.exports = function(neuma, _) {
  "use strict";

  /*
   * +--------+      +-------+
   * | inputs |  or  | DC(1) |
   * +--------+      +-------+
   *   |
   * +---------------+
   * | GainNode      |
   * | - gain: value |
   * +---------------+
   *   |
   */
  neuma.register("line", function(ugen, spec, inputs) {
    var context = ugen.$context;

    var line  = context.createGain();
    var gain  = line.gain;
    var start = _.finite(_.defaults(spec.start, 1));
    var end   = _.finite(_.defaults(spec.end  , 0));
    var dur   = _.finite(_.defaults(spec.dur  , 1));
    var schedId = 0;

    if (_.isEmpty(inputs)) {
      inputs = [ new neuma.DC(context, 1) ];
    }

    _.each(inputs, function(inp) {
      _.connect({ from: inp, to: line });
    });

    gain.setValueAtTime(start, 0);

    return new neuma.Unit({
      outlet: line,
      start: function(t) {
        var t0 = t;
        var t1 = t0 + dur;
        gain.setValueAtTime(start, t0);
        gain.linearRampToValueAtTime(end, t1);
        schedId = context.sched(t1, function(t) {
          schedId = 0;
          ugen.emit("end", { playbackTime: t }, ugen.$synth);
        });
      },
      stop: function() {
        context.unsched(schedId);
      }
    });
  });

};
