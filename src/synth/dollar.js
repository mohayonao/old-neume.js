"use strict";

var _          = require("../utils");
var NeuParam   = require("../component/param");
var NeuIn      = require("../component/in");
var NeuSynthDB = require("./db");
var NeuUGen    = require("./ugen");

function NeuSynthDollar(synth) {
  var db = new NeuSynthDB();

  this.db      = db;
  this.params  = {};
  this.inputs  = [];
  this.outputs = [];
  this.methods = {};
  this.timers  = [];

  function builder() {
    var args = _.toArray(arguments);
    var key  = args.shift();
    var spec = _.isDictionary(args[0]) ? args.shift() : {};
    var inputs = Array.prototype.concat.apply([], args);
    var ugen = NeuUGen.build(synth, key, spec, inputs);

    db.append(ugen);

    return ugen;
  }

  builder.param    = $param(synth, this.params);
  builder.in       = $input(synth, this.inputs);
  builder.out      = $output(synth, this.outputs);
  builder.method   = $method(synth, this.methods);
  builder.timeout  = $timeout(synth, this.timers);
  builder.interval = $interval(synth, this.timers);

  this.builder = builder;
}

function $param(synth, params) {
  return function(name, defaultValue) {
    if (params.hasOwnProperty(name)) {
      return params[name];
    }

    defaultValue = _.finite(_.defaults(defaultValue, 0));

    validateParam(name, defaultValue);

    var param = new NeuParam(synth, defaultValue);

    Object.defineProperty(synth, name, {
      set: function(value) {
        param.set(value);
      },
      get: function() {
        return param;
      }
    });

    params[name] = param;

    return param;
  };
}

function $input(synth, inputs) {
  return function(index) {
    index = Math.max(0, index|0);

    if (!inputs[index]) {
      inputs[index] = new NeuIn(synth.$context);
    }

    return inputs[index];
  };
}

function $output(synth, outputs) {
  return function(index, ugen) {
    index = Math.max(0, index|0);

    if (ugen instanceof NeuUGen) {
      outputs[index] = ugen;
    }

    return null;
  };
}

function $method(synth, methods) {
  return function(methodName, func) {
    if (/^[a-z]\w*$/.test(methodName) && typeof func === "function") {
      methods[methodName] = func;
    }
  };
}

function $timeout(synth, timers) {
  var context = synth.$context;

  return function(timeout) {
    timeout = Math.max(0, _.finite(timeout));

    var schedId   = 0;
    var callbacks = _.toArray(arguments).slice(1).filter(_.isFunction);

    function sched(t) {
      schedId = context.sched(t, function(t) {
        schedId = 0;
        for (var i = 0 , imax = callbacks.length; i < imax; i++) {
          callbacks[i].call(synth, t, 1);
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

  return function(interval) {
    interval = Math.max(1 / context.sampleRate, _.finite(interval));

    var schedId   = 0;
    var callbacks = _.toArray(arguments).slice(1).filter(_.isFunction);
    var startTime = 0;
    var count     = 0;

    function sched(t) {
      schedId = context.sched(t, function(t) {
        schedId = 0;
        count  += 1;
        for (var i = 0, imax = callbacks.length; i < imax; i++) {
          callbacks[i].call(synth, t, count);
        }
        sched(startTime + interval * (count + 1));
      });
    }

    timers.push({
      start: function(t) {
        startTime = t;
        sched(t + interval);
      },
      stop: function() {
        context.unsched(schedId);
        schedId = 0;
      }
    });
  };
}

function validateParam(name) {
  if (!/^[a-z]\w*$/.test(name)) {
    throw new TypeError(_.format(
      "invalid parameter name: #{name}", { name: name }
    ));
  }
}

module.exports = NeuSynthDollar;
