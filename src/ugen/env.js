module.exports = function(neume, util) {
  "use strict";

  /**
   * $("env", {
   *   table: Array<number|string> = []
   *   curve: number|string = "lin"
   * })
   *
   * aliases:
   *   $("adsr", {
   *     a: [number|string] = 0.01  attackTime
   *     d: [number|string] = 0.30  decayTime
   *     s: [number] = 0.50  sustainLevel
   *     r: [number|string] = 1.00  releaseTime
   *     curve: [number|string] = "lin"  curve
   *   })
   *
   *   $("dadsr", {
   *     delay: [number|string] = 0.10  delayTime
   *     a: [number|string] = 0.01  attackTime
   *     d: [number|string] = 0.30  decayTime
   *     s: [number] = 0.50  sustainLevel
   *     r: [number|string] = 1.00  releaseTime
   *     curve: [number|string] = "lin"  curve
   *   })
   *
   *   $("asr", {
   *     a: [number|string] = 0.01  attackTime
   *     s: [number] = 1.00  sustainLevel
   *     r: [number|string] = 1.00  releaseTime
   *     curve: [number|string] = "lin"  curve
   *   })
   *
   *   $("cutoff", {
   *     r: [number|string] = 0.1   releaseTime
   *     curve: [number|string] = "lin"  curve
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
    return make(util.toArray(spec.table), ugen, spec, inputs);
  });

  neume.register("adsr", function(ugen, spec, inputs) {
    var a = util.defaults(spec.a, spec.attackTime, 0.01);
    var d = util.defaults(spec.d, spec.decayTime, 0.30);
    var s = util.defaults(spec.s, spec.sustainLevel, 0.50);
    var r = util.defaults(spec.r, spec.releaseTime, 1.00);

    return make([ 0, 1, a, s, d, ">", 0, r ], ugen, spec, inputs);
  });

  neume.register("dadsr", function(ugen, spec, inputs) {
    var delay = util.defaults(spec.delay, spec.delayTime, 0.1);
    var a = util.defaults(spec.a, spec.attackTime, 0.01);
    var d = util.defaults(spec.d, spec.decayTime, 0.30);
    var s = util.defaults(spec.s, spec.sustainLevel, 0.50);
    var r = util.defaults(spec.r, spec.releaseTime, 1.00);

    return make([ 0, 0, delay, 1, a, s, d, ">", 0, r ], ugen, spec, inputs);
  });

  neume.register("asr", function(ugen, spec, inputs) {
    var a = util.defaults(spec.a, spec.attackTime, 0.01);
    var s = util.defaults(spec.s, spec.sustainLevel, 1.00);
    var r = util.defaults(spec.r, spec.releaseTime, 1.00);

    return make([ 0, s, a, ">", 0, r ], ugen, spec, inputs);
  });

  neume.register("cutoff", function(ugen, spec, inputs) {
    var r = util.defaults(spec.r, spec.releaseTime, 0.1);

    return make([ 1, ">", 0, r ], ugen, spec, inputs);
  });

  function toEnv(src) {
    var list = [], env = {
      init: util.finite(src.shift()),
      list: list,
      releaseNode: -1,
      loopNode: -1,
      index: 0,
      length: 0
    };

    for (var i = 0, imax = src.length; i < imax; ) {
      var value = src[i++];

      if (typeof value === "number") {
        list.push([ util.clip(util.finite(value), 0, 1), src[i++] ]);
      } else {
        if (/^(>|r(elease)?)$/i.test(value)) {
          env.releaseNode = list.length;
        }
        if (/^(<|l(oop)?)$/i.test(value)) {
          env.loopNode = list.length;
        }
      }
    }

    env.length = list.length;

    return env;
  }

  function setCurve(context, outlet, curve) {
    var ws, wsCurve = null;

    if (typeof curve === "number") {
      curve = util.finite(curve);
      if (0.001 <= Math.abs(curve)) {
        wsCurve = makeCurveFromNumber(curve);
      }
    } else {
      wsCurve = makeCurveFromType(curve);
    }

    if (wsCurve != null) {
      ws = context.createWaveShaper();
      ws.curve = wsCurve;
      context.connect(outlet, ws);
      outlet = ws;
    }

    return outlet;
  }

  function makeCurveFromNumber(type) {
    if (makeCurveFromNumber[type]) {
      return makeCurveFromNumber[type];
    }

    var curve = new Float32Array(4096);
    var a1 = 1 / (1.0 - Math.exp(type));
    var grow = Math.exp(type / 2048);

    for (var i = 0; i < 2048; i++) {
      curve[i + 2048] = a1 - a1 * Math.pow(grow, i);
    }

    makeCurveFromNumber[type] = curve;

    return curve;
  }

  function makeCurveFromType(type) {
    if (makeCurveFromType[type]) {
      return makeCurveFromType[type];
    }
    var func = shapeFunc[type];
    if (!func) {
      return;
    }

    var curve = new Float32Array(4096);

    for (var i = 0; i < 2048; i++) {
      curve[i + 2048] = func(i / 2048);
    }

    makeCurveFromType[type] = curve;

    return curve;
  }

  var shapeFunc = {};

  shapeFunc.sine = function(x) {
    // TODO: FIX
    return x - Math.sin(x * 2 * Math.PI) * 0.10355338794738156;
  };

  shapeFunc.welch = function(x) {
    return Math.sin(x * Math.PI * 0.5);
  };

  shapeFunc.squared = function(x) {
    return x * x;
  };

  shapeFunc.cubic = function(x) {
    return x * x * x;
  };

  function make(src, ugen, spec, inputs) {
    var context = ugen.$context;

    var env = toEnv(src);
    var curve = util.defaults(spec.curve, "lin");
    var param = new neume.Param(context, env.init);

    var schedId, releaseSchedId, scheduled;
    var isReleased = false, isStopped = false;
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    outlet = setCurve(context, outlet, curve);

    function start(t0) {
      env.index = 0;
      param.setValueAtTime(env.init, t0);
      if (env.releaseNode !== 0) {
        schedId = context.sched(t0, resume);
      }
    }

    function stop(t0) {
      terminateAudioParamScheduling(t0);
      param.setValueAtTime(param.valueAtTime(t0), t0);

      context.unsched(schedId);
      context.unsched(releaseSchedId);

      schedId = 0;
      env.index = env.length;
      isStopped = true;
    }

    function release(e) {
      if (isStopped || releaseSchedId || env.releaseNode === -1) {
        return;
      }

      var t0 = util.finite(context.toSeconds(e.playbackTime));

      releaseSchedId = context.sched(t0, function(t0) {
        context.unsched(schedId);

        schedId = 0;
        env.index = env.releaseNode;
        isReleased = true;

        terminateAudioParamScheduling(t0);
        resume(t0);
      });
    }

    function resume(t0) {
      var params = env.list[env.index];

      /* istanbul ignore next */
      if (params == null) {
        return;
      }

      env.index += 1;

      var dur = util.finite(context.toSeconds(params[1]));
      var t1 = t0 + dur;
      var v0 = param.valueAtTime(t0);
      var v1 = util.finite(params[0]);

      switch (curve) {
      case "step":
        param.setValueAtTime(v1, t0);
        break;
      case "hold":
        param.setValueAtTime(v0, t0);
        param.setValueAtTime(v1, t1);
        break;
      case "exp":
      case "exponential":
        param.setValueAtTime(Math.max(1e-6, v0), t0);
        param.exponentialRampToValueAtTime(Math.max(1e-6, v1), t1);
        scheduled = { method: "exponentialRampToValueAtTime", time: t1 };
        break;
      // case "lin":
      // case "linear":
      default:
        param.setValueAtTime(v0, t0);
        param.linearRampToValueAtTime(v1, t1);
        scheduled = { method: "linearRampToValueAtTime", time: t1 };
        break;
      }

      if (!isReleased && env.loopNode !== -1) {
        if (env.index === env.releaseNode || env.index === env.length) {
          env.index = env.loopNode;
        }
      }

      schedId = 0;

      if (env.index === env.length) {
        schedId = context.sched(t1, function(t) {
          schedId = 0;
          ugen.emit("end", { playbackTime: t }, ugen.$synth);
        });
      } else if (env.index !== env.releaseNode) {
        schedId = context.sched(t1, resume);
      }
    }

    function terminateAudioParamScheduling(t0) {
      if (scheduled == null || scheduled.time <= t0) {
        return;
      }
      var endValue = param.valueAtTime(t0);

      param.cancelScheduledValues(scheduled.time);
      param[scheduled.method](endValue, t0);
    }

    return new neume.Unit({
      outlet: outlet,
      start: start,
      stop: stop,
      methods: {
        release: release
      }
    });
  }

};
