module.exports = function(neume, _) {
  "use strict";


  /**
   * $("env", {
   *   init   : [number]    = 0
   *   table  : [env-table] = []
   *   release: [number]    = Infinity
   * })
   *
   * env-table:
   *   [ [ duration, target, curve ], ... ]
   *
   * aliases:
   *   $("adsr", {
   *     a    : [number] = 0.01   attackTime
   *     d    : [number] = 0.30   decayTime
   *     s    : [number] = 0.50   sustainLevel
   *     r    : [number] = 1.00   releaseTime
   *     curve: [number] = 0.01  curve
   *   })
   *
   *   $("dadsr", {
   *     delay : [number] = 0.10   delayTime
   *     a     : [number] = 0.01   attackTime
   *     d     : [number] = 0.30   decayTime
   *     s     : [number] = 0.50   sustainLevel
   *     r     : [number] = 1.00   releaseTime
   *     curve : [number] = 0.01  curve
   *   })
   *
   *   $("asr", {
   *     a    : [number] = 0.01   attackTime
   *     s    : [number] = 1.00   sustainLevel
   *     r    : [number] = 1.00   releaseTime
   *     curve: [number] = 0.01  curve
   *   })
   *
   *   $("cutoff", {
   *     r    : [number] = 0.1    releaseTime
   *     level: [number] = 1.00   peakLevel
   *     curve: [number] = 0.01  curve
   *   })
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
  neume.register("env", function(ugen, spec, inputs) {
    var init  = _.finite(_.defaults(spec.init, 0));
    var table = _.isArray(spec.table) ? spec.table : [];
    var releaseNode = _.num(_.defaults(spec.release, Infinity));

    return make(init, table, releaseNode, ugen, spec, inputs);
  });

  neume.register("adsr", function(ugen, spec, inputs) {
    var a = _.finite(_.defaults(spec.a, 0.01));
    var d = _.finite(_.defaults(spec.d, 0.30));
    var s = _.finite(_.defaults(spec.s, 0.50));
    var r = _.finite(_.defaults(spec.r, 1.00));
    var curve = _.finite(_.defaults(spec.curve, 0.01));

    var init = 0;
    var table = [
      [ a, 1, curve ], // a
      [ d, s, curve ], // d
      [ r, 0, curve ], // r
    ];
    var releaseNode = 2;

    return make(init, table, releaseNode, ugen, spec, inputs);
  });

  neume.register("dadsr", function(ugen, spec, inputs) {
    var delay = _.finite(_.defaults(spec.delay, 0.1));
    var a = _.finite(_.defaults(spec.a, 0.01));
    var d = _.finite(_.defaults(spec.d, 0.30));
    var s = _.finite(_.defaults(spec.s, 0.50));
    var r = _.finite(_.defaults(spec.r, 1.00));
    var curve = _.finite(_.defaults(spec.curve, 0.01));

    var init = 0;
    var table = [
      [ delay, 0, curve ], // d
      [ a    , 1, curve ], // a
      [ d    , s, curve ], // d
      [ r    , 0, curve ], // r
    ];
    var releaseNode = 3;

    return make(init, table, releaseNode, ugen, spec, inputs);
  });

  neume.register("asr", function(ugen, spec, inputs) {
    var a = _.finite(_.defaults(spec.a, 0.01));
    var s = _.finite(_.defaults(spec.s, 1.00));
    var r = _.finite(_.defaults(spec.r, 1.00));
    var curve = _.finite(_.defaults(spec.curve, 0.01));

    var init = 0;
    var table = [
      [ a, s, curve ], // a
      [ r, 0, curve ], // r
    ];
    var releaseNode = 1;

    return make(init, table, releaseNode, ugen, spec, inputs);
  });

  neume.register("cutoff", function(ugen, spec, inputs) {
    var releaseTime = _.finite(_.defaults(spec.r, 0.1));
    var level = _.finite(_.defaults(spec.level, 1.00));
    var curve = _.finite(_.defaults(spec.curve, 0.01));

    var init = level;
    var table = [
      [ releaseTime, 0, curve ], // r
    ];
    var releaseNode = 0;

    return make(init, table, releaseNode, ugen, spec, inputs);
  });

  function make(init, table, releaseNode, ugen, spec, inputs) {
    var context = ugen.$context;

    var env  = context.createGain();
    var gain = env.gain;
    var startTable = table.slice(0, releaseNode);
    var stopTable  = table.slice(releaseNode);

    var releaseValue = startTable.length ? _.finite(_.last(startTable)[1]) : init;
    var schedId = 0;

    if (inputs.length === 0) {
      inputs = [ new neume.DC(context, 1) ];
    }

    inputs.forEach(function(node) {
      context.connect(node, env);
    });

    gain.value = init;

    function start(t) {
      var v0 = init;
      var t0 = t;

      gain.setValueAtTime(v0, t0);
      schedule(gain, startTable, v0, t0);
    }

    function stop() {
      context.unsched(schedId);
      schedId = 0;
    }

    function release(t) {
      var v0 = releaseValue;
      var t0 = _.finite(_.defaults(t, context.currentTime));
      var t1 = schedule(gain, stopTable, v0, t0);

      schedId = context.sched(t1, function(t) {
        schedId = 0;
        ugen.emit("end", { playbackTime: t }, ugen.$synth);
      });
    }

    return new neume.Unit({
      outlet: env,
      start : start,
      stop  : stop,
      methods: {
        release: release
      }
    });
  }

  function schedule(gain, table, v0, t0) {
    table.forEach(function(params) {
      var dur = _.finite(params[0]);
      var t1  = t0 + dur;
      var v1  = _.finite(params[1]);
      var cur = _.finite(params[2]);

      if (v0 === v1 || dur <= 0) {
        gain.setValueAtTime(v1, t0);
      } else if (0 < cur && cur < 1) {
        gain.setTargetAtTime(v1, t0, timeConstant(dur, v0, v1, cur));
      }

      t0 = t1;
      v0 = v1;
    });

    return t0;
  }

  function timeConstant(duration, startValue, endValue, curve) {
    var targetValue = startValue + (endValue - startValue) * (1 - curve);

    return -duration / Math.log((targetValue - endValue) / (startValue - endValue));
  }

};
