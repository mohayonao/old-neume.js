"use strict";

var _ = require("./utils");

_.NeuDC      = require("./dc");
_.NeuUGen    = require("./ugen");
_.NeuParam   = require("./param");
_.NeuIn      = require("./in");
_.NeuSynthDB = require("./synthdb");

var EMPTY_DB = new _.NeuSynthDB();
var INIT  = 0;
var START = 1;
var STOP  = 2;

function NeuSynth(context, func, args) {
  var _this = this;

  this.$context = context;

  var db = new _.NeuSynthDB();

  function $() {
    var args = _.toArray(arguments);
    var key  = args.shift();
    var spec = _.isDictionary(_.first(args)) ? args.shift() : {};
    var inputs = Array.prototype.concat.apply([], args);
    var ugen = _.NeuUGen.build(_this, key, spec, inputs);

    db.append(ugen);

    return ugen;
  }

  var params  = {};
  var inputs  = [];
  var outputs = [];
  var methods = {};
  var timers  = [];

  $.param = function(name, defaultValue) {
    if (_.has(params, name)) {
      return params[name];
    }

    defaultValue = _.finite(_.defaults(defaultValue, 0));

    validateParam(name, defaultValue);

    var param = new _.NeuParam(_this, name, defaultValue);

    Object.defineProperty(_this, name, {
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

  $.in = function(index) {
    index = Math.max(0, _.int(index));

    if (!inputs[index]) {
      inputs[index] = new _.NeuIn(_this);
    }

    return inputs[index];
  };

  $.out = function(index, ugen) {
    index = Math.max(0, _.int(index));

    if (ugen instanceof _.NeuUGen) {
      outputs[index] = ugen;
    }

    return null;
  };

  $.method = function(methodName, func) {
    if (/^[a-z]\w*$/.test(methodName) && _.isFunction(func)) {
      methods[methodName] = func;
    }
  };

  $.timeout = function(timeout) {
    timeout = Math.max(0, _.finite(timeout));

    var schedId   = 0;
    var callbacks = _.toArray(arguments).slice(1).filter(_.isFunction);

    function sched(t) {
      schedId = context.sched(t, function(t) {
        schedId = 0;
        callbacks.forEach(function(func) {
          func.call(_this, t, 1);
        });
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

  $.interval = function(interval) {
    interval = Math.max(1 / context.sampleRate, _.finite(interval));

    var schedId   = 0;
    var callbacks = _.toArray(arguments).slice(1).filter(_.isFunction);
    var startTime = 0;
    var count     = 0;

    function sched(t) {
      schedId = context.sched(t, function(t) {
        schedId = 0;
        count  += 1;
        callbacks.forEach(function(func) {
          func.call(_this, t, count);
        });
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

  var result = makeOutlet(context, func.apply(null, [ $ ].concat(args)));

  if (outputs[0] == null) {
    outputs[0] = result;
  }

  this.$inputs  = inputs;
  this.$outputs = outputs;
  this._routing = [];
  this._db = outputs.length ? db : EMPTY_DB;
  this._state = INIT;
  this._stateString = "init";
  this._timers = timers;
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

  _.each(methods, function(method, methodName) {
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

NeuSynth.prototype.getMethods = function() {
  return this._methodNames.slice();
};

NeuSynth.prototype.start = function(t) {
  t = _.defaults(t, this.$context.currentTime);

  if (this._state === INIT) {
    this._state = START;
    this._stateString = "ready";

    this.$context.sched(t, function(t) {
      this._stateString = "start";

      if (this._routing.length === 0) {
        _.connect({ from: this.$outputs[0], to: this.$context.$outlet });
      } else {
        this._routing.forEach(function(destinations, output) {
          destinations.forEach(function(destination) {
            _.connect({ from: this.$outputs[output], to: destination });
          }, this);
        }, this);
      }

      this._db.all().forEach(function(ugen) {
        ugen.$unit.start(t);
      });

      this._timers.forEach(function(timer) {
        timer.start(t);
      });
    }, this);

    this.$context.start(); // auto start(?)
  }

  return this;
};

NeuSynth.prototype.stop = function(t) {
  t = _.defaults(t, this.$context.currentTime);

  if (this._state === START) {
    this._state = STOP;

    this.$context.sched(t, function(t) {
      this._stateString = "stop";

      this.$context.nextTick(function() {
        this.$outputs.forEach(function(output) {
          _.disconnect({ from: output });
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

function validateParam(name) {
  if (!/^[a-z]\w*$/.test(name)) {
    throw new TypeError(_.format(
      "invalid parameter name: #{name}", {
        name: name
      }
    ));
  }
}

function makeOutlet(context, ugen) {
  if (!(ugen instanceof _.NeuUGen)) {
    return context.createGain(); // FIXME: ???
  }

  var outlet = ugen.$outlet;
  var offset = ugen.$offset;
  var gain;

  if (offset !== 0) {
    var dc = new _.NeuDC(context, offset);
    if (outlet) {
      gain = context.createGain();
      gain.$id = "synth-outlet";
      _.connect({ from: outlet, to: gain });
      _.connect({ from: dc    , to: gain });
      outlet = gain;
    } else {
      outlet = dc.$outlet;
    }
  }

  return outlet;
}

module.exports = NeuSynth;
