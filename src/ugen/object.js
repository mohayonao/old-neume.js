module.exports = function(neume, _) {
  "use strict";

  neume.register("object", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet  = null;

    var data = _.defaults(spec.value, 0);
    var name = _.defaults(spec.name, "");
    var interval = _.defaults(spec.interval, 0.250);
    var schedId = 0;
    var prevVal = 0;
    var valueOf = null;

    if (typeof name === "string" && data.hasOwnProperty(name)) {
      if (typeof data[name] === "function") {
        valueOf = function() {
          return data[name]();
        };
      } else {
        valueOf = function() {
          return data[name];
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
      interval = Math.max(minInterval, _.finite(context.toSeconds(interval)));
    }

    var param = context.createParam(prevVal, spec);

    if (inputs.length) {
      outlet = context.createGain();
      context.createSum(inputs).connect(outlet);
      context.connect(param, outlet.gain);
    } else {
      outlet = param;
    }

    function update(t0) {
      var value = _.finite(valueOf());

      if (value !== prevVal) {
        param.update(t0, value, prevVal);
        prevVal = value;
      }

      var nextTime = relativeInterval ?
        t0 + Math.max(minInterval, _.finite(context.toSeconds(interval))) :
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
  });
};
