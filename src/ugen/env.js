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
   *     a    : [number] = 0.01  attackTime
   *     d    : [number] = 0.30  decayTime
   *     s    : [number] = 0.50  sustainLevel
   *     r    : [number] = 1.00  releaseTime
   *     curve: [number] = 0.01  curve
   *   })
   *
   *   $("dadsr", {
   *     delay : [number] = 0.10  delayTime
   *     a     : [number] = 0.01  attackTime
   *     d     : [number] = 0.30  decayTime
   *     s     : [number] = 0.50  sustainLevel
   *     r     : [number] = 1.00  releaseTime
   *     curve : [number] = 0.01  curve
   *   })
   *
   *   $("asr", {
   *     a    : [number] = 0.01  attackTime
   *     s    : [number] = 1.00  sustainLevel
   *     r    : [number] = 1.00  releaseTime
   *     curve: [number] = 0.01  curve
   *   })
   *
   *   $("cutoff", {
   *     r    : [number] = 0.1   releaseTime
   *     level: [number] = 1.00  peakLevel
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
    var releaseNode = _.int(_.defaults(spec.release, -1));
    var loopNode    = _.int(_.defaults(spec.loop   , -1));

    return make(init, table, releaseNode, loopNode, ugen, spec, inputs);
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

    return make(init, table, releaseNode, -1, ugen, spec, inputs);
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

    return make(init, table, releaseNode, -1, ugen, spec, inputs);
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

    return make(init, table, releaseNode, -1, ugen, spec, inputs);
  });

  neume.register("cutoff", function(ugen, spec, inputs) {
    var r = _.finite(_.defaults(spec.r, 0.1));
    var level = _.finite(_.defaults(spec.level, 1.00));
    var curve = _.finite(_.defaults(spec.curve, 0.01));

    var init = level;
    var table = [
      [ 0, level, 0 ],
      [ r, 0, curve ], // r
    ];
    var releaseNode = 1;

    return make(init, table, releaseNode, -1, ugen, spec, inputs);
  });

  function make(init, table, releaseNode, loopNode, ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet  = null;

    var index   = 0;
    var schedId = 0;
    var releaseSchedId = 0;
    var param   = context.createParam(init);

    if (inputs.length) {
      outlet = context.createGain();
      context.createSum(inputs).connect(outlet);
      context.connect(param, outlet.gain);
    } else {
      outlet = param;
    }

    function stop(t0) {
      param.setAt(param.valueOf(), t0);
      context.unsched(schedId);
      context.unsched(releaseSchedId);
      schedId = 0;
      index = table.length;
    }

    function resume(t0) {
      var params = table[index];

      /* istanbul ignore next */
      if (params == null) {
        return;
      }

      index += 1;

      var dur = _.finite(context.toSeconds(params[0]));
      var t1  = t0 + dur;
      var v0  = param.valueOf();
      var v1  = _.finite(params[1]);
      var cur = Math.max(1e-6, Math.min(_.finite(params[2]), 1-1e-6));

      if (v0 === v1 || dur <= 0) {
        param.setAt(v1, t1);
      } else {
        var vT = v0 + (v1 - v0) * (1 - cur);
        var tC = -Math.max(1e-6, dur) / Math.log((vT - v1) / (v0 - v1));

        if (index === table.length) {
          t1 = t0 + tC * Math.abs(Math.log(Math.max(1e-6, Math.abs(v1)) / Math.max(1e-6, Math.abs(v0))));
        }

        param.targetAt(v1, t0, tC);
      }

      if (loopNode >= 0 && index === releaseNode && loopNode < releaseNode) {
        index = loopNode;
      }

      if (index === table.length) {
        schedId = context.sched(t1, function(t) {
          schedId = 0;
          ugen.emit("end", { playbackTime: t }, ugen.$synth);
        });
      } else if (index !== releaseNode) {
        schedId = context.sched(t1, resume);
      }
    }

    return new neume.Unit({
      outlet: outlet,
      start : function(t0) {
        context.sched(t0, resume);
      },
      stop  : stop,
      methods: {
        release: function(t0) {
          if (releaseNode > 0 && releaseSchedId === 0) {
            releaseSchedId = context.sched(_.finite(context.toSeconds(t0)), function(t0) {
              context.unsched(schedId);
              schedId = 0;
              index = releaseNode;
              resume(t0);
            });
          }
        }
      }
    });
  }

};
