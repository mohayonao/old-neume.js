module.exports = function(neuma, _) {
  "use strict";

  var ZERO = 0.0001;

  /**
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
  neuma.register("adsr", function(ugen, spec, inputs) {
    var context = ugen.$context;

    var adsr = context.createGain();
    var attackTime   = _.finite(_.defaults(spec.a, 0.01));
    var decayTime    = _.finite(_.defaults(spec.d, 0.30));
    var sustainLevel = _.finite(_.defaults(spec.s, 0.50));
    var releaseTime  = _.finite(_.defaults(spec.r, 1.00));
    var curve = {
      lin: "linearRampToValueAtTime",
    }[spec.curve] || /* istanbul ignore next*/ "exponentialRampToValueAtTime";
    var schedId = 0;

    if (_.isEmpty(inputs)) {
      inputs = [ new neuma.DC(context, 1) ];
    }

    inputs.forEach(function(node) {
      _.connect({ from: node, to: adsr });
    });

    sustainLevel = Math.max(ZERO, Math.min(sustainLevel, 1));
    adsr.gain.setValueAtTime(ZERO, 0);

    return new neuma.Unit({
      outlet: adsr,
      start: function(t) {
        var t0 = t;
        var t1 = t0 + attackTime;
        var t2 = t1 + decayTime;
        // init(a)
        adsr.gain.setValueAtTime(ZERO, t0);
        // a -> d
        adsr.gain[curve](1, t1);
        // d -> s
        adsr.gain[curve](sustainLevel, t2);
      },
      stop: function() {
        context.unsched(schedId);
      },
      methods: {
        release: function(t) {
          var t3 = _.finite(_.defaults(t, context.currentTime));
          var t4 = t3 + releaseTime;
          schedId = context.sched(t3, function() {
            adsr.gain.cancelScheduledValues(0);
            // init(s)
            adsr.gain.setValueAtTime(adsr.gain.value, t3);
            // s -> r
            adsr.gain[curve](ZERO, t4);
            schedId = context.sched(t4, function(t) {
              schedId = 0;
              ugen.emit("end", { playbackTime: t }, ugen.$synth);
            });
          });
        }
      }
    });
  });
};
