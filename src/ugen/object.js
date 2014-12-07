module.exports = function(neume, util) {
  "use strict";

  neume.register("object", make);
  neume.register("Float32Array", make);

  function make(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet = null;

    var data = util.defaults(spec.value, 0);
    var key = util.defaults(spec.key, "");
    var interval = util.defaults(spec.interval, 0.250);
    var schedId = 0;
    var valueOf = null;

    if ((typeof key === "string" || typeof key === "number") && data.hasOwnProperty(key)) {
      if (typeof data[key] === "function") {
        valueOf = function() {
          return data[key]();
        };
      } else {
        valueOf = function() {
          return data[key];
        };
      }
    } else {
      valueOf = function() {
        return data.valueOf();
      };
    }

    var minInterval = 1 / context.sampleRate;
    var relativeInterval = true;

    if (!/\d+(ticks|n)|\d+\.\d+\.\d+/.test(interval)) {
      relativeInterval = false;
      interval = Math.max(minInterval, util.finite(context.toSeconds(interval)));
    }

    var prevVal = util.finite(valueOf());
    var param = context.createNeuParam(prevVal, spec);

    if (inputs.length) {
      outlet = context.createGain();
      context.createNeuSum(inputs).connect(outlet);
      context.connect(param, outlet.gain);
    } else {
      outlet = param;
    }

    function update(t0) {
      var value = util.finite(valueOf());

      if (value !== prevVal) {
        param.update({ startValue: prevVal, endValue: value, startTime: t0 });
        prevVal = value;
      }

      var nextTime = relativeInterval ?
        t0 + Math.max(minInterval, util.finite(context.toSeconds(interval))) :
        t0 + interval;

      schedId = context.sched(nextTime, update);
    }

    return new neume.Unit({
      outlet: outlet,
      start: function(t) {
        update(t);
      },
      stop: function() {
        context.unsched(schedId);
        schedId = 0;
      }
    });
  }
};
