"use strict";

var util = require("../util");
var NeuComponent = require("./component");

function NeuParam(context, value, spec) {
  spec = spec || {};
  NeuComponent.call(this, context);
  this._value = util.finite(value);
  this._params = [];

  var timeConstant = util.defaults(spec.tC, spec.timeConstant, 0);

  this._timeConstant = timeConstant;
  this._events = [];
}
util.inherits(NeuParam, NeuComponent);

NeuParam.$name = "NeuParam";

Object.defineProperties(NeuParam.prototype, {
  events: {
    get: function() {
      return this._events.slice();
    },
    enumerable: true
  },
  value: {
    set: function(value) {
      value = util.finite(value);

      var params = this._params;

      this._value = value;

      for (var i = 0, imax = params.length; i < imax; i++) {
        params[i].value = value;
      }
    },
    get: function() {
      return this._params.length ? this._params[0].value : this._value;
    },
    enumerable: true
  }
});

NeuParam.prototype.valueAtTime = function(t) {
  t = util.finite(this.$context.toSeconds(t));

  var value  = this._value;
  var events = this._events;
  var t0;

  for (var i = 0; i < events.length; i++) {
    var e0 = events[i];
    var e1 = events[i + 1];

    if (t < e0.time) {
      break;
    }
    t0 = Math.min(t, e1 ? e1.time : t);

    if (e1 && e1.type === "LinearRampToValue") {
      value = linTo(value, e0.value, e1.value, t0, e0.time, e1.time);
    } else if (e1 && e1.type === "ExponentialRampToValue") {
      value = expTo(value, e0.value, e1.value, t0, e0.time, e1.time);
    } else {
      switch (e0.type) {
      case "SetValue":
      case "LinearRampToValue":
      case "ExponentialRampToValue":
        value = e0.value;
        break;
      case "SetTarget":
        value = setTarget(value, e0.value, t0, e0.time, e0.timeConstant);
        break;
      case "SetValueCurve":
        value = setCurveValue(value, t0, e0.time, e0.time + e0.duration, e0.curve);
        break;
      }
    }
  }

  return value;
};

NeuParam.prototype.setAt = function(value, startTime) {
  value = util.finite(value);
  startTime = util.finite(this.$context.toSeconds(startTime));

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].setValueAtTime(value, startTime);
  }

  insertEvent(this, {
    type: "SetValue",
    value: value,
    time: startTime,
  });

  return this;
};

NeuParam.prototype.setValueAtTime = NeuParam.prototype.setAt;

NeuParam.prototype.linTo = function(value, endTime) {
  value = util.finite(value);
  endTime = util.finite(this.$context.toSeconds(endTime));

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].linearRampToValueAtTime(value, endTime);
  }

  insertEvent(this, {
    type: "LinearRampToValue",
    value: value,
    time: endTime,
  });

  return this;
};

NeuParam.prototype.linearRampToValueAtTime = NeuParam.prototype.linTo;

NeuParam.prototype.expTo = function(value, endTime) {
  value = util.finite(value);
  endTime = util.finite(this.$context.toSeconds(endTime));

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].exponentialRampToValueAtTime(value, endTime);
  }

  insertEvent(this, {
    type: "ExponentialRampToValue",
    value: value,
    time: endTime,
  });

  return this;
};

NeuParam.prototype.exponentialRampToValueAtTime = NeuParam.prototype.expTo;

NeuParam.prototype.targetAt = function(target, startTime, timeConstant) {
  target = util.finite(target);
  startTime = util.finite(this.$context.toSeconds(startTime));
  timeConstant = util.finite(this.$context.toSeconds(timeConstant));

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].setTargetAtTime(target, startTime, timeConstant);
  }

  insertEvent(this, {
    type: "SetTarget",
    value: target,
    time: startTime,
    timeConstant: timeConstant
  });

  return this;
};

NeuParam.prototype.setTargetAtTime = NeuParam.prototype.targetAt;

NeuParam.prototype.curveAt = function(values, startTime, duration) {
  startTime = util.finite(this.$context.toSeconds(startTime));
  duration = util.finite(this.$context.toSeconds(duration));

  var params = this._params;

  for (var i = 0, imax = params.length; i < imax; i++) {
    params[i].setValueCurveAtTime(values, startTime, duration);
  }

  insertEvent(this, {
    type: "SetValueCurve",
    time: startTime,
    duration: duration,
    curve: values
  });

  return this;
};

NeuParam.prototype.setValueCurveAtTime = NeuParam.prototype.curveAt;

NeuParam.prototype.cancel = function(startTime) {
  startTime = util.finite(this.$context.toSeconds(startTime));

  var params = this._params;
  var events = this._events;
  var i, imax;

  for (i = 0, imax = params.length; i < imax; i++) {
    params[i].cancelScheduledValues(startTime);
  }

  for (i = 0, imax = events.length; i < imax; ++i) {
    if (events[i].time >= startTime) {
      events.splice(i);
      break;
    }
  }

  return this;
};

NeuParam.prototype.cancelScheduledValues = NeuParam.prototype.cancel;

NeuParam.prototype.update = function(spec) {
  spec = spec || {};

  var context = this.$context;
  var t0 = util.finite(context.toSeconds(spec.startTime));
  var v1 = util.finite(spec.endValue);
  var v0 = util.finite(util.defaults(spec.startValue, v1));
  var timeConstant = util.finite(context.toSeconds(this._timeConstant));

  timeConstant = Math.max(0, timeConstant);

  if (timeConstant === 0 || v0 === v1) {
    this.setAt(v1, t0);
  } else {
    this.targetAt(v1, t0, timeConstant);
  }

  return this;
};

NeuParam.prototype.toAudioNode = function() {
  if (this.$outlet == null) {
    this.$outlet = this.$context.createGain();
    this.$outlet.gain.value = this._value;
    this._params.push(this.$outlet.gain);
    this.$context.connect(this.$context.createNeuDC(1), this.$outlet);
  }
  return this.$outlet;
};

NeuParam.prototype.connect = function(to) {
  if (to instanceof global.AudioParam) {
    to.value = this._value;
    this._params.push(to);
  } else {
    this.$context.connect(this.toAudioNode(), to);
  }
  return this;
};

NeuParam.prototype.disconnect = function() {
  this.$context.disconnect(this.$outlet);
  return this;
};

function insertEvent(_this, event) {
  var time = event.time;
  var events = _this._events;
  var replace = 0;
  var i, imax;

  for (i = 0, imax = events.length; i < imax; ++i) {
    if (events[i].time === time && events[i].type === event.type) {
      replace = 1;
      break;
    }

    if (events[i].time > time) {
      break;
    }
  }

  events.splice(i, replace, event);
}

function linTo(v, v0, v1, t, t0, t1) {
  var dt = (t - t0) / (t1 - t0);
  return (1 - dt) * v0 + dt * v1;
}

function expTo(v, v0, v1, t, t0, t1) {
  var dt = (t - t0) / (t1 - t0);
  return 0 < v0 && 0 < v1 ? v0 * Math.pow(v1 / v0, dt) : /* istanbul ignore next */ v;
}

function setTarget(v0, v1, t, t0, timeConstant) {
  return v1 + (v0 - v1) * Math.exp((t0 - t) / timeConstant);
}

function setCurveValue(v, t, t0, t1, curve) {
  var dt = (t - t0) / (t1 - t0);

  if (dt <= 0) {
    return util.defaults(curve[0], v);
  }

  if (1 <= dt) {
    return util.defaults(curve[curve.length - 1], v);
  }

  return util.defaults(curve[(curve.length * dt)|0], v);
}

module.exports = util.NeuParam = NeuParam;
