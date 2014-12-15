module.exports = function(neume, util) {
  "use strict";

  var KVSKEY = "@neume:env:";

  /**
   * $("env", {
   *   table: Array<number|string> = [],
   *   curve: number|string = "lin",
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * aliases:
   *   $("adsr", {
   *     attackTime: timevalue = 0.01,
   *     decayTime: timevalue = 0.30,
   *     sustainLevel: number = 0.50,
   *     releaseTime: timevalue = 1.00,
   *     curve: number|string = "lin",
   *     mul: signal = 1,
   *     add: signal = 0,
   *   }, ...inputs: signal)
   *
   *   $("dadsr", {
   *     delayTime: timevalue = 0.10,
   *     attackTime: timevalue = 0.01,
   *     decayTime: timevalue = 0.30,
   *     sustainLevel: number = 0.50,
   *     releaseTime: timevalue = 1.00,
   *     curve: number|string = "lin",
   *     mul: signal = 1,
   *     add: signal = 0,
   *   }, ...inputs: signal)
   *
   *   $("asr", {
   *     attackTime: timevalue = 0.01,
   *     sustainLevel: number = 0.50,
   *     releaseTime: timevalue = 1.00,
   *     curve: number|string = "lin",
   *     mul: signal = 1,
   *     add: signal = 0,
   *   }, ...inputs: signal)
   *
   *   $("cutoff", {
   *     releaseTime: timevalue = 1.00,
   *     curve: number|string = "lin",
   *     mul: signal = 1,
   *     add: signal = 0,
   *   }, ...inputs: signal)
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   * +----------+
   * | GainNode |
   * | - gain: <--- envelope value
   * +----------+
   *   |
   * +----------------+
   * | WaveShaperNode |
   * | - curve: curve |
   * +----------------+
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

  function toEnv(src, conv) {
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
        list.push([ conv(util.clip(util.finite(value), 0, 1)), src[i++] ]);
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
      if (!neume.KVS.exists(KVSKEY + curve)) {
        neume.KVS.set(KVSKEY + curve, makeCurveFrom(curve));
      }
    }
    if (neume.KVS.exists(KVSKEY + curve)) {
      wsCurve = neume.KVS.get(KVSKEY + curve);
    }

    if (wsCurve != null) {
      ws = context.createWaveShaper();
      ws.curve = wsCurve;
      context.connect(outlet, ws);
      outlet = ws;
    }

    return outlet;
  }

  neume.KVS.set(KVSKEY + "sine", function() {
    var data = new Float32Array(4096);

    for (var i = 0; i < 2048; i++) {
      var x = i / 2048;
      data[i + 2048] = x - Math.sin(x * 2 * Math.PI) * 0.15;
    }

    return data;
  });

  neume.KVS.set(KVSKEY + "welch", function() {
    var data = new Float32Array(4096);

    for (var i = 0; i < 2048; i++) {
      var x = i / 2048;
      data[i + 2048] = Math.sin(x * 0.5 * Math.PI);
    }

    return data;
  });

  neume.KVS.set(KVSKEY + "squared", function() {
    var data = new Float32Array(4096);

    for (var i = 0; i < 2048; i++) {
      var x = i / 2048;
      data[i + 2048] = x * x;
    }

    return data;
  });

  neume.KVS.set(KVSKEY + "cubic", function() {
    var data = new Float32Array(4096);

    for (var i = 0; i < 2048; i++) {
      var x = i / 2048;
      data[i + 2048] = x * x * x;
    }

    return data;
  });

  function makeCurveFrom(curve) {
    var data = new Float32Array(4096);
    var grow = Math.exp(curve);
    var a = 1 / (1 - grow);

    for (var i = 0; i < 2048; i++) {
      var x = i / 2048;
      data[i + 2048] = a - (a * Math.pow(grow, x));
    }

    return data;
  }

  var invFunc = {
    sine: function(x) {
      // HACK: umm, uncool..
      var h = 1, m, l = 0, y;

      if (x === 0) {
        return 0;
      }
      if (x === 1) {
        return 1;
      }

      while (true) {
        m = (h + l) * 0.5;
        y = m - Math.sin(m * 2 * Math.PI) * 0.15;
        if (Math.abs(x - y) < 1e-6) {
          break;
        }
        if (y < x) {
          l = m;
        } else {
          h = m;
        }
      }

      return m;
    },
    welch: function(x) {
      return 2 * Math.asin(x) / Math.PI;
    },
    squared: function(x) {
      return Math.pow(x, 1 / 2);
    },
    cubic: function(x) {
      return Math.pow(x, 1 / 3);
    },
    identity: function(x) {
      return x;
    }
  };

  function curveInv(curve) {
    if (typeof curve === "number") {
      return function(x) {
        var a = 1 / (1 - Math.exp(curve));
        return Math.log((a - x) / a) / curve;
      };
    }
    return invFunc[curve] || invFunc.identity;
  }


  function make(src, ugen, spec, inputs) {
    var context = ugen.$context;

    var curve = util.defaults(spec.curve, "lin");
    if (typeof curve === "number") {
      curve = util.finite(curve);
      if (Math.abs(curve) < 0.001) {
        curve = "lin";
      }
    }
    var env = toEnv(src, curveInv(curve));
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
