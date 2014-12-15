"use strict";

var util = require("../util");
var DB = require("../util/db");
var neume = require("../namespace");
var Parser = require("./parser");

require("./dollar");

var EMPTY_DB = new DB();
var INIT = 0;
var START = 1;
var STOP = 2;

function NeuSynth(context, func, args) {
  this.$context = context;
  this.$routes = [];
  this.$localBuses = [];

  var $ = new neume.SynthDollar(this);

  this.$builder = $.builder;

  var param = new neume.Param(context, 1, { curve: "lin" });
  var result = func.apply(null, [ $.builder ].concat(args));

  if (result && result.toAudioNode && !result.$isOutput) {
    this.$routes[0] = result;
  }

  this.$routes = this.$routes.map(function(node) {
    var gain = context.createGain();

    context.connect(node, gain);
    context.connect(param, gain.gain);

    return gain;
  });

  this._connected = false;
  this._db = this.$routes.length ? $.db : /* istanbul ignore next */ EMPTY_DB;
  this._state = INIT;
  this._stateString = "UNSCHEDULED";
  this._timers = $.timers;
  this._param = param;

  var methods = getMethods(this._db);

  methods.filter(function(methodName) {
    return !this.hasOwnProperty(methodName);
  }, this).forEach(function(methodName) {
    Object.defineProperty(this, methodName, {
      value: function() {
        var args = util.toArray(arguments);
        this._db.all().forEach(function(ugen) {
          if (typeof ugen[methodName] === "function") {
            ugen[methodName].apply(ugen, args);
          }
        });
        return this;
      }
    });
  }, this);

  Object.defineProperties(this, {
    context: {
      value: this.$context,
      enumerable: true
    },
    currentTime: {
      get: function() {
        return this.$context.currentTime;
      },
      enumerable: true
    },
    state: {
      get: function() {
        return this._stateString;
      },
      enumerable: true
    },
    methods: {
      value: methods,
      enumerable: true
    }
  });
}
NeuSynth.$name = "NeuSynth";

NeuSynth.prototype.query = function(selector) {
  var array = this._db.find(Parser.parse(selector));

  [
    "on", "once", "off", "trig"
  ].concat(this.methods).forEach(function(methodName) {
    array[methodName] = function() {
      var args = util.toArray(arguments);
      array.forEach(function(ugen) {
        if (typeof ugen[methodName] === "function") {
          ugen[methodName].apply(ugen, args);
        }
      });
      return array;
    };
  });

  return array;
};

/**
* @deprecated since version 0.5.0
*/
NeuSynth.prototype.find = NeuSynth.prototype.query;

NeuSynth.prototype.start = function(startTime) {
  if (this._state !== INIT) {
    return this;
  }

  var context = this.$context;
  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  startTime = util.finite(startTime);

  this._state = START;
  this._stateString = "SCHEDULED";

  context.sched(startTime, function() {
    this._stateString = "PLAYING";

    this.$routes.forEach(function(node, index) {
      this.connect(node, this.getAudioBus(index));
    }, context);

    this._db.all().forEach(function(ugen) {
      ugen.start(startTime);
    });

    this._timers.forEach(function(timer) {
      timer.start(startTime);
    });
  }, this);

  context.start(); // auto start(?)

  return this;
};

NeuSynth.prototype.stop = function(startTime) {
  if (this._state !== START) {
    return this;
  }

  var context = this.$context;
  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  startTime = util.finite(startTime);

  this._state = STOP;

  context.sched(startTime, function(t0) {
    this._stateString = "FINISHED";

    context.nextTick(function() {
      this.$routes.forEach(function(node) {
        context.disconnect(node);
      });
    }, this);

    this._db.all().forEach(function(ugen) {
      ugen.stop(t0);
    });

    this._timers.forEach(function(timer) {
      timer.stop(t0);
    });
  }, this);

  return this;
};

NeuSynth.prototype.trig = function(startTime) {
  this._db.all().forEach(function(ugen) {
    ugen.trig(startTime);
  });
  return this;
};

NeuSynth.prototype.fadeIn = function(startTime, duration) {
  if (this._state !== INIT) {
    return this;
  }

  var context = this.$context;
  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  startTime = util.finite(startTime);

  if (this.$routes.length) {
    duration = util.defaults(context.toSeconds(duration), 0.5);
    duration = util.finite(duration);

    this._param.value = 0;
    context.sched(startTime, function(t0) {
      this._param.update(1, t0, duration);
    }, this);
  }
  this.start(startTime);

  return this;
};

NeuSynth.prototype.fadeOut = function(startTime, duration) {
  if (this._state !== START) {
    return this;
  }

  var context = this.$context;

  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  startTime = util.finite(startTime);

  duration = util.defaults(context.toSeconds(duration), 0.5);
  duration = util.finite(duration);

  if (this.$routes.length) {
    context.sched(startTime, function(t0) {
      this._param.update(0, t0, duration);
    }, this);
  }
  this.stop(startTime + duration);

  return this;
};

NeuSynth.prototype.fade = function(startTime, value, duration) {
  if (this._state !== START) {
    return this;
  }

  var context = this.$context;

  if (this.$routes.length) {
    startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
    startTime = util.finite(startTime);

    value = util.finite(value);

    duration = util.defaults(context.toSeconds(duration), 0.5);
    duration = util.finite(duration);

    context.sched(startTime, function(t0) {
      this._param.update(value, t0, duration);
    }, this);
  }

  return this;
};

NeuSynth.prototype.toAudioNode = function() {
  return this.$context.toAudioNode(this.$routes[0]);
};

NeuSynth.prototype.hasListeners = function(event) {
  return this._db.all().reduce(function(a, b) {
    return a || b.hasListeners(event);
  }, false);
};

NeuSynth.prototype.listeners = function(event) {
  var tmp = this._db.all().reduce(function(a, b) {
    return a.concat(b.listeners(event));
  }, []);

  var listeners = [];

  for (var i = 0, imax = tmp.length; i < imax; i++) {
    if (listeners.indexOf(tmp[i]) === -1) {
      listeners.push(tmp[i]);
    }
  }

  return listeners;
};

NeuSynth.prototype.on = function(event, listener) {
  this._db.all().forEach(function(ugen) {
    ugen.on(event, listener);
  });
  return this;
};

NeuSynth.prototype.once = function(event, listener) {
  this._db.all().forEach(function(ugen) {
    ugen.once(event, listener);
  });
  return this;
};

NeuSynth.prototype.off = function(event, listener) {
  this._db.all().forEach(function(ugen) {
    ugen.off(event, listener);
  });
  return this;
};

function getMethods(db) {
  var methodNames = {};

  db.all().forEach(function(ugen) {
    ugen.methods.forEach(function(methodName) {
      methodNames[methodName] = true;
    });
  });

  return Object.keys(methodNames).sort();
}

module.exports = neume.Synth = NeuSynth;
