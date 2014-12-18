"use strict";

var util = require("../util");
var neume = require("../namespace");

require("../component/param");
require("./ugen");
require("./ugen-promise");

function NeuSynthDollar(synth) {
  var db = new neume.DB();

  this.db = db;
  this.timers = [];

  var atParam = createParamBuilder(synth);
  var promises = {};

  function builder() {
    var args = util.toArray(arguments);
    var key = args.shift();
    var spec = util.isDictionary(args[0]) ? args.shift() : {};
    var inputs = util.flatten(args);
    var ugen, promise;

    if (typeof key === "string") {
      if (key.charAt(0) === "@") {
        key = key.substr(1);
        return atParam(key, spec, inputs.pop(), inputs);
      }
      if (key.charAt(0) === "#") {
        key = key.substr(1);
        ugen = promises[key] || db.find({ id: key })[0];
        if (ugen == null) {
          ugen = new neume.UGenPromise(synth, key);
          promises[key] = ugen;
        }
        return ugen;
      }
    }

    ugen = neume.UGen.build(synth, key, spec, inputs);

    if (ugen.$id) {
      promise = promises[ugen.$id];
      if (promise) {
        promise.resolve(ugen);
      }
      promises[ugen.$id] = null;
    }

    db.append(ugen);

    return ugen;
  }

  builder.timeout = $timeout(synth, this.timers);
  builder.interval = $interval(synth, this.timers);
  builder.stop = $stop(synth);

  this.builder = builder;
}

function createParamBuilder(synth) {
  var params = {};

  return function(name, spec, defaultValue, inputs) {
    if (params.hasOwnProperty(name)) {
      return params[name];
    }
    validateParam(name, defaultValue);

    defaultValue = util.finite(util.defaults(defaultValue, 0));

    var param = new neume.Param(synth.$context, defaultValue, spec);

    Object.defineProperty(synth, name, {
      value: param,
      enumerable: true
    });

    var ugen;

    if (inputs.length) {
      ugen = neume.UGen.build(synth, "+", spec, [ inputs ]);
      ugen = neume.UGen.build(synth, "+", { mul: param }, [ ugen ]);
    } else {
      ugen = neume.UGen.build(synth, "+", spec, [ param ]);
    }

    params[name] = ugen;

    return ugen;
  };
}

function $timeout(synth, timers) {
  var context = synth.$context;

  return function(timeout) {
    timeout = Math.max(0, util.finite(context.toSeconds(timeout)));

    var schedId = 0;
    var callbacks = util.toArray(arguments).slice(1).filter(util.isFunction);

    function sched(t) {
      schedId = context.sched(t, function(playbackTime) {
        schedId = 0;
        for (var i = 0, imax = callbacks.length; i < imax; i++) {
          callbacks[i].call(synth, {
            playbackTime: playbackTime,
            count: 1
          });
        }
      });
    }

    timers.push({
      start: function(t) {
        sched(t + timeout);
      },
      stop: function() {
        context.unsched(schedId);
        schedId = 0;
      }
    });
  };
}

function $interval(synth, timers) {
  var context = synth.$context;
  var minInterval = 1 / context.sampleRate;

  return function(interval) {
    var relative;

    if (/\d+(ticks|n)|\d+\.\d+\.\d+/.test(interval)) {
      relative = true;
    } else {
      relative = false;
      interval = Math.max(minInterval, util.finite(context.toSeconds(interval)));
    }

    var schedId = 0;
    var callbacks = util.toArray(arguments).slice(1).filter(util.isFunction);
    var startTime = 0;
    var count = 0;

    function sched(t) {
      schedId = context.sched(t, function(playbackTime) {
        schedId = 0;
        count += 1;
        for (var i = 0, imax = callbacks.length; i < imax; i++) {
          callbacks[i].call(synth, {
            playbackTime: playbackTime,
            count: count
          });
        }

        var nextTime = relative ?
          playbackTime + Math.max(minInterval, util.finite(context.toSeconds(interval))) :
          startTime + interval * (count + 1);

        sched(nextTime);
      });
    }

    timers.push({
      start: function(t) {
        startTime = t;

        var nextTime = relative ?
          startTime + Math.max(minInterval, util.finite(context.toSeconds(interval))) :
          startTime + interval;

        sched(nextTime);
      },
      stop: function() {
        context.unsched(schedId);
        schedId = 0;
      }
    });
  };
}

function $stop(synth) {
  var context = synth.$context;

  return function(stopTime) {
    context.sched(context.toSeconds(stopTime), function(t0) {
      synth.stop(t0);
    });
  };
}

function validateParam(name) {
  if (!/^[a-z]\w*$/.test(name)) {
    throw new TypeError(util.format(
      "invalid parameter name: #{name}", { name: name }
    ));
  }
}

module.exports = neume.SynthDollar = NeuSynthDollar;
