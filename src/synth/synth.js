"use strict";

var _              = require("../utils");
var NeuSynthDB     = require("./db");
var NeuSynthDollar = require("./dollar");
var makeOutlet     = require("./synth-makeOutlet");

var EMPTY_DB = new NeuSynthDB();
var INIT  = 0;
var START = 1;
var STOP  = 2;

function NeuSynth(context, func, args) {
  this.$context = context;

  var $ = new NeuSynthDollar(this);
  var result = makeOutlet(context, func.apply(null, [ $.builder ].concat(args)));

  if ($.outputs[0] == null) {
    $.outputs[0] = result;
  }

  this.$inputs  = $.inputs;
  this.$outputs = $.outputs;
  this._routing = [];
  this._db = $.outputs.length ? $.db : EMPTY_DB;
  this._state = INIT;
  this._stateString = "UNSCHEDULED";
  this._timers = $.timers;
  this._methodNames = [];

  Object.defineProperties(this, {
    context: {
      value: _.findAudioContext(this.$context),
      enumerable: true
    },
    currentTime: {
      get: function() {
        return this.$context.currentTime;
      },
      enumerable: true
    },
    outlet: {
      value: _.findAudioNode(this.$outputs[0]),
      enumerable: true
    },
    state: {
      get: function() {
        return this._stateString;
      },
      enumerable: true
    },
  });

  _.each($.methods, function(method, methodName) {
    this._methodNames.push(methodName);
    Object.defineProperty(this, methodName, {
      value: function() {
        method.apply(this, _.toArray(arguments));
      }
    });
  }, this);

  this._db.all().forEach(function(ugen) {
    _.keys(ugen.$unit.$methods).forEach(function(methodName) {
      if (!this.hasOwnProperty(methodName)) {
        this._methodNames.push(methodName);
        Object.defineProperty(this, methodName, {
          value: function() {
            return this.apply(methodName, _.toArray(arguments));
          }
        });
      }
    }, this);
  }, this);

  this._methodNames = this._methodNames.sort();
}
NeuSynth.$name = "NeuSynth";

NeuSynth.prototype.getMethods = function() {
  return this._methodNames.slice();
};

NeuSynth.prototype.start = function(t) {
  t = _.defaults(t, this.$context.currentTime);

  if (this._state === INIT) {
    this._state = START;
    this._stateString = "SCHEDULED";

    this.$context.sched(t, function() {
      this._stateString = "PLAYING";
    }, this);

    if (this._routing.length === 0) {
      this.$context.connect(this.$outputs[0], this.$context.$outlet);
    } else {
      this._routing.forEach(function(destinations, output) {
        destinations.forEach(function(destination) {
          this.$context.connect(this.$outputs[output], destination);
        }, this);
      }, this);
    }

    this._db.all().forEach(function(ugen) {
      ugen.$unit.start(t);
    });

    this._timers.forEach(function(timer) {
      timer.start(t);
    });

    this.$context.start(); // auto start(?)
  }

  return this;
};

NeuSynth.prototype.stop = function(t) {
  var context = this.$context;
  t = _.defaults(t, context.currentTime);

  if (this._state === START) {
    this._state = STOP;

    context.sched(t, function(t) {
      this._stateString = "FINISHED";

      context.nextTick(function() {
        this.$outputs.forEach(function(output) {
          context.disconnect(output);
        });
      }, this);

      this._db.all().forEach(function(ugen) {
        ugen.$unit.stop(t);
      });

      this._timers.forEach(function(timer) {
        timer.stop(t);
      });
    }, this);
  }

  return this;
};

NeuSynth.prototype.apply = function(method, args) {
  iterateOverTargetss(this._db, method, function(ugen, method) {
    ugen.$unit.apply(method, args);
  });
  return this;
};

NeuSynth.prototype.call = function() {
  var args = _.toArray(arguments);
  var method = args.shift();

  return this.apply(method, args);
};

NeuSynth.prototype.connect = function(destination, output, input) {
  output = Math.max(0, _.int(output));
  input  = Math.max(0, _.int(input));

  if (destination instanceof NeuSynth && this.$outputs[output] && destination.$inputs[input]) {
    if (!this._routing[output]) {
      this._routing[output] = [];
    }
    this._routing[output].push(_.findAudioNode(destination.$inputs[input]));
  }

  return this;
};

NeuSynth.prototype.hasListeners = function(event) {
  var result = false;

  iterateOverTargetss(this._db, event, function(ugen, event) {
    result = result || ugen.hasListeners(event);
  });

  return result;
};

NeuSynth.prototype.listeners = function(event) {
  var listeners = [];

  iterateOverTargetss(this._db, event, function(ugen, event) {
    ugen.listeners(event).forEach(function(listener) {
      if (listeners.indexOf(listener) === -1) {
        listeners.push(listener);
      }
    });
  });

  return listeners;
};

NeuSynth.prototype.on = function(event, listener) {
  iterateOverTargetss(this._db, event, function(ugen, event) {
    ugen.on(event, listener);
  });
  return this;
};

NeuSynth.prototype.once = function(event, listener) {
  iterateOverTargetss(this._db, event, function(ugen, event) {
    ugen.once(event, listener);
  });
  return this;
};

NeuSynth.prototype.off = function(event, listener) {
  iterateOverTargetss(this._db, event, function(ugen, event) {
    ugen.off(event, listener);
  });
  return this;
};

function iterateOverTargetss(db, event, callback) {
  var parsed = parseEvent(event);

  if (parsed) {
    var targets = parsed.selector ? db.find(parsed.selector) : db.all();
    targets.forEach(function(ugen) {
      callback(ugen, parsed.name);
    });
  }
}

function parseEvent(event) {
  var matched = /^(?:(.*?):([a-z]\w+)|([a-z]\w+))$/.exec(event);

  if (!matched) {
    return null;
  }

  if (matched[3] != null) {
    return { selector: null, name: matched[3]};
  }

  return { selector: matched[1], name: matched[2] };
}

module.exports = NeuSynth;
