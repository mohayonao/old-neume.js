(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var neume = require("./src/");

neume.use(require("./src/ugen/"));

if (typeof window !== "undefined") {
  window.neume = neume;
}

module.exports = neume;

},{"./src/":21,"./src/ugen/":41}],2:[function(require,module,exports){
"use strict";

var util = require("../util");
var neume = require("../namespace");
var Emitter = require("../event/emitter");

function NeuComponent(context, node) {
  Emitter.call(this);
  this.$context = context;
  this.$outlet = null;
  this._node = util.defaults(node, null);
}
util.inherits(NeuComponent, Emitter);

NeuComponent.$name = "NeuComponent";

NeuComponent.prototype.mul = function(value) {
  return new neume.Mul(this.$context, util.defaults(this._node, this), util.defaults(value, 1));
};

NeuComponent.prototype.add = function(value) {
  return new neume.Sum(this.$context, [ util.defaults(this._node, this), util.defaults(value, 0) ]);
};

NeuComponent.prototype.toAudioNode = function() {
  if (this.$outlet === null) {
    this.$outlet = this.$context.toAudioNode(util.defaults(this._node, this));
  }
  return this.$outlet;
};

NeuComponent.prototype.connect = function(to) {
  this.$context.connect(util.defaults(this._node, this), to);
  return this;
};

NeuComponent.prototype.disconnect = function() {
  this.$context.disconnect(util.defaults(this._node, this));
  return this;
};

module.exports = NeuComponent;

},{"../event/emitter":20,"../namespace":22,"../util":54}],3:[function(require,module,exports){
(function (global){
"use strict";

var C = require("../const");
var util = require("../util");
var NeuComponent = require("./component");

var filled0 = new FilledFloat32Array(C.DC_BUF_SIZE, 0);
var filled1 = new FilledFloat32Array(C.DC_BUF_SIZE, 1);

function NeuDC(context, value) {
  NeuComponent.call(this, context);
  this._value = util.finite(value);
}
util.inherits(NeuDC, NeuComponent);

NeuDC.$name = "NeuDC";

NeuDC.prototype.toAudioNode = function() {
  if (this.$outlet === null) {
    this.$outlet = createDCNode(this.$context, this._value);
  }
  return this.$outlet;
};

NeuDC.prototype.connect = function(to) {
  if (to instanceof global.AudioParam) {
    to.value = this._value;
  } else {
    this.$context.connect(this.toAudioNode(), to);
  }
  return this;
};

NeuDC.prototype.disconnect = function() {
  this.$context.disconnect(this.$outlet);
  return this;
};

NeuDC.prototype.valueOf = function() {
  return this._value;
};

function FilledFloat32Array(size, value) {
  var result = new Float32Array(size);

  for (var i = 0; i < size; i++) {
    result[i] = value;
  }

  return result;
}

function createDCNode(context, value) {
  var node = null;
  var buf = context.createBuffer(1, C.DC_BUF_SIZE, context.sampleRate);
  var bufSrc = (node = context.createBufferSource());

  buf.getChannelData(0).set(value === 0 ? filled0 : filled1);

  bufSrc.buffer = buf;
  bufSrc.loop = true;
  bufSrc.start(0);

  if (value !== 0 && value !== 1) {
    node = context.createGain();
    node.gain.value = util.finite(value);
    context.connect(bufSrc, node);
  }

  return node;
}

module.exports = NeuDC;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../const":8,"../util":54,"./component":2}],4:[function(require,module,exports){
"use strict";

var C = require("../const");
var util = require("../util");
var neume = require("../namespace");
var NeuComponent = require("./component");

var WS_CURVE_SIZE = C.WS_CURVE_SIZE;
var curveWet = new Float32Array(WS_CURVE_SIZE);
var curveDry = new Float32Array(WS_CURVE_SIZE);

(function() {
  var halfSize = WS_CURVE_SIZE >> 1;

  for (var i = 0; i < halfSize; i++) {
    curveWet[i] = 0;
    curveDry[i] = 1;
    curveWet[i + halfSize] = Math.sin(i / halfSize * Math.PI * 0.5);
    curveDry[i + halfSize] = Math.cos(i / halfSize * Math.PI * 0.5);
  }
})();

function NeuDryWet(context, dryIn, wetIn, mixIn) {
  NeuComponent.call(this, context);

  mixIn = mixIn.valueOf();

  if (typeof mixIn === "number") {
    if (mixIn === 0) {
      return new neume.Component(context, dryIn);
    }
    if (mixIn === 1) {
      return new neume.Component(context, wetIn);
    }
  }

  this._dryIn = dryIn;
  this._wetIn = wetIn;
  this._mixIn = mixIn;
}
util.inherits(NeuDryWet, NeuComponent);

NeuDryWet.$name = "NeuDryWet";

NeuDryWet.prototype.toAudioNode = function() {
  if (this.$outlet === null) {
    var context = this.$context;
    var outlet;

    if (typeof this._mixIn === "number") {
      outlet = createMixNodeWithNumber(context, this._dryIn, this._wetIn, this._mixIn);
    } else {
      outlet = createMixNodeWithNode(context, this._dryIn, this._wetIn, this._mixIn);
    }

    this.$outlet = context.toAudioNode(outlet);
    this._dryIn = null;
    this._wetIn = null;
    this._mixIn = null;
  }
  return this.$outlet;
};

NeuDryWet.prototype.connect = function(to) {
  this.$context.connect(this.toAudioNode(), to);
  return this;
};

function createMixNodeWithNumber(context, dryIn, wetIn, mix) {
  mix = util.clip(util.finite(mix), 0, 1);

  var wetNode = context.createGain();
  var dryNode = context.createGain();
  var mixNode = context.createGain();

  wetNode.gain.value = mix;
  dryNode.gain.value = 1 - mix;

  context.connect(dryIn, dryNode);
  context.connect(wetIn, wetNode);
  context.connect(wetNode, mixNode);
  context.connect(dryNode, mixNode);

  return mixNode;
}

function createMixNodeWithNode(context, dryIn, wetIn, mixIn) {
  var wetNode = context.createGain();
  var dryNode = context.createGain();
  var mixNode = context.createGain();
  var wsWet = context.createWaveShaper();
  var wsDry = context.createWaveShaper();

  wsWet.curve = curveWet;
  wsDry.curve = curveDry;

  context.connect(mixIn, wsWet);
  context.connect(mixIn, wsDry);

  wetNode.gain.value = 0;
  dryNode.gain.value = 0;

  context.connect(wsWet, wetNode.gain);
  context.connect(wsDry, dryNode.gain);

  context.connect(dryIn, dryNode);
  context.connect(wetIn, wetNode);
  context.connect(wetNode, mixNode);
  context.connect(dryNode, mixNode);

  return mixNode;
}

module.exports = NeuDryWet;

},{"../const":8,"../namespace":22,"../util":54,"./component":2}],5:[function(require,module,exports){
"use strict";

var util = require("../util");
var neume = require("../namespace");
var NeuComponent = require("./component");

function NeuMul(context, a, b) {
  a = a.valueOf();
  b = b.valueOf();

  if (typeof a === "number" && typeof b === "number") {
    return new neume.DC(context, a * b);
  }

  NeuComponent.call(this, context);

  if (typeof a === "number") {
    var t = a; a = b; b = t;
  }
  if (b === 0) {
    return new neume.DC(context, 0);
  } else if (b === 1) {
    return new neume.Component(context, a);
  }
  this._a = a;
  this._b = b;
}
util.inherits(NeuMul, NeuComponent);

NeuMul.$name = "NeuMul";

NeuMul.prototype.mul = function(value) {
  value = value.valueOf();

  if (typeof this._b === "number" && typeof value === "number") {
    return new neume.Mul(this.$context, this._a, util.finite(this._b * value));
  }

  return new neume.Mul(this.$context, this.toAudioNode(), value);
};

NeuMul.prototype.toAudioNode = function() {
  if (this.$outlet === null) {
    this.$outlet = this.$context.createGain();
    this.$outlet.gain.value = 0;
    this.$context.connect(this._a, this.$outlet);
    this.$context.connect(this._b, this.$outlet.gain);
  }
  return this.$outlet;
};

NeuMul.prototype.connect = function(to) {
  this.$context.connect(this.toAudioNode(), to);
  return this;
};

NeuMul.prototype.disconnect = function() {
  this.$context.disconnect(this.$outlet);
  return this;
};

module.exports = NeuMul;

},{"../namespace":22,"../util":54,"./component":2}],6:[function(require,module,exports){
(function (global){
"use strict";

var util = require("../util");
var neume = require("../namespace");
var NeuComponent = require("./component");

function NeuParam(context, value, spec) {
  spec = spec || {};
  NeuComponent.call(this, context);
  this._value = util.finite(value);
  this._params = [];
  this._events = [];
  this._curve = spec.curve;
  this._lag = util.defaults(spec.lag, 0);
  this._scheduled = null;
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
      value = calcLinearRampToValue(value, e0.value, e1.value, t0, e0.time, e1.time);
    } else if (e1 && e1.type === "ExponentialRampToValue") {
      value = calcExponentialRampToValue(value, e0.value, e1.value, t0, e0.time, e1.time);
    } else {
      switch (e0.type) {
      case "SetValue":
      case "LinearRampToValue":
      case "ExponentialRampToValue":
        value = e0.value;
        break;
      case "SetTarget":
        value = calcTarget(value, e0.value, t0, e0.time, e0.timeConstant);
        break;
      case "SetValueCurve":
        value = calcValueCurve(value, t0, e0.time, e0.time + e0.duration, e0.curve);
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

NeuParam.prototype.update = function(value, startTime, lag) {
  var context = this.$context;
  var endTime = startTime + util.finite(context.toSeconds(util.defaults(lag, this._lag, 0)));
  var startValue = this.valueAtTime(startTime);
  var curve = this._curve;
  var scheduled = null;

  terminateAudioParamScheduling(this, startValue, startTime);

  if (endTime <= startTime) {
    curve = "step";
  }

  switch (curve) {
  case "exp":
  case "exponential":
    this.setValueAtTime(Math.max(1e-6, startValue), startTime);
    this.exponentialRampToValueAtTime(Math.max(1e-6, value), endTime);
    scheduled = { method: "exponentialRampToValueAtTime", time: endTime };
    break;
  case "lin":
  case "linear":
    this.setValueAtTime(startValue, startTime);
    this.linearRampToValueAtTime(value, endTime);
    scheduled = { method: "linearRampToValueAtTime", time: endTime };
    break;
  // case "step":
  default:
    this.setValueAtTime(value, startTime);
    break;
  }

  this._scheduled = scheduled;

  return this;
};

function terminateAudioParamScheduling(_this, startValue, startTime) {
  var scheduled = _this._scheduled;

  if (scheduled == null || scheduled.time <= startTime) {
    return;
  }

  _this.cancelScheduledValues(scheduled.time);
  _this[scheduled.method](startValue, startTime);
}

NeuParam.prototype.toAudioNode = function(input) {
  var context = this.$context;

  if (this.$outlet == null) {
    this.$outlet = context.createGain();
    this.$outlet.gain.value = this._value;
    this._params.push(this.$outlet.gain);
    if (input) {
      context.connect(input, this.$outlet);
    } else {
      context.connect(new neume.DC(context, 1), this.$outlet);
    }
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

function calcLinearRampToValue(v, v0, v1, t, t0, t1) {
  var dt = (t - t0) / (t1 - t0);
  return (1 - dt) * v0 + dt * v1;
}

function calcExponentialRampToValue(v, v0, v1, t, t0, t1) {
  var dt = (t - t0) / (t1 - t0);
  return 0 < v0 && 0 < v1 ? v0 * Math.pow(v1 / v0, dt) : /* istanbul ignore next */ v;
}

function calcTarget(v0, v1, t, t0, timeConstant) {
  return v1 + (v0 - v1) * Math.exp((t0 - t) / timeConstant);
}

function calcValueCurve(v, t, t0, t1, curve) {
  var dt = (t - t0) / (t1 - t0);

  if (dt <= 0) {
    return util.defaults(curve[0], v);
  }

  if (1 <= dt) {
    return util.defaults(curve[curve.length - 1], v);
  }

  return util.defaults(curve[(curve.length * dt)|0], v);
}

module.exports = NeuParam;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../namespace":22,"../util":54,"./component":2}],7:[function(require,module,exports){
"use strict";

var util = require("../util");
var neume = require("../namespace");
var NeuComponent = require("./component");

function NeuSum(context, inputs) {
  NeuComponent.call(this, context);

  var number = 0;
  var hasNumber = false;
  var param = null;
  var nodes = [];

  for (var i = 0, imax = inputs.length; i < imax; i++) {
    var x = inputs[i].valueOf();

    if (typeof x === "number") {
      number += util.finite(x);
      hasNumber = true;
    } else if (!param && x instanceof neume.Param) {
      param = x;
    } else {
      nodes.push(x);
    }
  }

  if (nodes.length === 0) {
    if (param) {
      return param;
    }
    return new neume.DC(context, number);
  }

  if (number === 0 && param === null && nodes.length === 1) {
    return new neume.Component(context, nodes[0]);
  }

  this._hasNumber = hasNumber;
  this._number = number;
  this._param = param;
  this._nodes = nodes;
  this._inputs = inputs;
}
util.inherits(NeuSum, NeuComponent);

NeuSum.$name = "NeuSum";

NeuSum.prototype.add = function(value) {
  return new neume.Sum(this.$context, this._inputs.concat(value));
};

NeuSum.prototype.toAudioNode = function() {
  if (this.$outlet === null) {
    var context = this.$context;
    var nodes = this._nodes;

    var sumNode = context.createGain();

    for (var i = 0, imax = nodes.length; i < imax; i++) {
      context.connect(nodes[i], sumNode);
    }
    if (this._param)  {
      context.connect(this._param, sumNode);
    }
    if (this._number) {
      context.connect(this._number, sumNode);
    }

    this.$outlet = sumNode;
  }

  return this.$outlet;
};

NeuSum.prototype.connect = function(to) {
  var context = this.$context;
  var number = this._number;
  var param = this._param;
  var nodes = this._nodes;

  for (var i = 0, imax = nodes.length; i < imax; i++) {
    context.connect(context.toAudioNode(nodes[i]), to);
  }

  if (param) {
    context.connect(param, to);
    if (number !== 0) {
      context.connect(new neume.DC(context, number).toAudioNode(), to);
    }
  } else if (number !== 0) {
    context.connect(number, to);
  }

  return this;
};

NeuSum.prototype.disconnect = function() {
  var context = this.$context;
  var inputs = this._inputs;

  for (var i = 0, imax = inputs.length; i < imax; i++) {
    context.disconnect(inputs[i]);
  }

  return this;
};

module.exports = NeuSum;

},{"../namespace":22,"../util":54,"./component":2}],8:[function(require,module,exports){
"use strict";

module.exports = {
  PROCESS_BUF_SIZE: 1024,
  DC_BUF_SIZE: 128,
  WS_CURVE_SIZE: 4096,
  MAX_RENDERING_SEC: 180,
  MAX_DELAY_SEC: 180,
  AUDIO_BUS_CHANNELS: 1023,
  DEFAULT_MAX_NODES_OF_BUS: 64,
};

},{}],9:[function(require,module,exports){
"use strict";

var C = require("../const");
var util = require("../util");

function NeuAudioBus(context) {
  this.$context = context;
  this.$outlet = context.createGain();
  this.$maxNodes = C.DEFAULT_MAX_NODES_OF_BUS;
  this.$inputs = [];

  Object.defineProperties(this, {
    maxNodes: {
      set: function(value) {
        this.$maxNodes = Math.max(0, util.int(value));
      },
      get: function() {
        return this.$maxNodes;
      }
    },
    nodes: {
      get: function() {
        return this.$inputs.slice();
      }
    }
  });
}

NeuAudioBus.$name = "NeuAudioBus";

NeuAudioBus.prototype.fade = function(t, val, dur) {
  t = util.finite(this.$context.toSeconds(t)) || this.$context.currentTime;
  val = util.finite(val);
  dur = util.finite(this.$context.toSeconds(dur));

  var v0 = this.$outlet.gain.value;
  var v1 = val;
  var vT = v0 + (v1 - v0) * 0.99;
  var tC = -Math.max(1e-6, dur) / Math.log((vT - v1) / (v0 - v1));

  this.$outlet.gain.setTargetAtTime(v1, t, tC);
  this.$outlet.gain.setValueAtTime(v1, t + dur);

  return this;
};

NeuAudioBus.prototype.toAudioNode = function() {
  return this.$outlet;
};

NeuAudioBus.prototype.connect = function(to) {
  this.$context.connect(this.$outlet, to);
  return this;
};

NeuAudioBus.prototype.disconnect = function() {
  return this;
};

NeuAudioBus.prototype.onconnected = function(from) {
  var index = this.$inputs.indexOf(from);

  if (index !== -1) {
    this.$inputs.splice(index, 1);
  }
  this.$inputs.push(from);

  while (this.$maxNodes < this.$inputs.length) {
    this.$context.disconnect(this.$inputs.shift());
  }

  from.$outputs = from.$outputs || [];
  if (from.$outputs.indexOf(this) === -1) {
    from.$outputs.push(this);
  }
};

NeuAudioBus.prototype.ondisconnected = function(from) {
  var index = this.$inputs.indexOf(from);

  if (index !== -1) {
    this.$inputs.splice(index, 1);
  }

  /* istanbul ignore else */
  if (from.$outputs) {
    index = from.$outputs.indexOf(this);
    /* istanbul ignore else */
    if (index !== -1) {
      from.$outputs.splice(index, 1);
    }
  }
};

module.exports = NeuAudioBus;

},{"../const":8,"../util":54}],10:[function(require,module,exports){
(function (global){
"use strict";

var util = require("../util");
var FFT = require("../dsp/fft");

function NeuBuffer(context, buffer) {
  this.$context = context;
  this._buffer = buffer;

  Object.defineProperties(this, {
    sampleRate: {
      value: this._buffer.sampleRate,
      enumerable: true
    },
    length: {
      value: this._buffer.length,
      enumerable: true
    },
    duration: {
      value: this._buffer.duration,
      enumerable: true
    },
    numberOfChannels: {
      value: this._buffer.numberOfChannels,
      enumerable: true
    },
  });

  for (var i = 0; i < this._buffer.numberOfChannels; i++) {
    Object.defineProperty(this, i, {
      value: this._buffer.getChannelData(i)
    });
  }
}
NeuBuffer.$name = "NeuBuffer";

NeuBuffer.create = function(context, channels, length, sampleRate) {
  channels = util.int(util.defaults(channels, 1));
  length = util.int(util.defaults(length, 0));
  sampleRate = util.int(util.defaults(sampleRate, context.sampleRate));

  return new NeuBuffer(context, context.createBuffer(channels, length, sampleRate));
};

NeuBuffer.from = function(context, data) {
  var buffer = context.createBuffer(1, data.length, context.sampleRate);

  buffer.getChannelData(0).set(data);

  return new NeuBuffer(context, buffer);
};

NeuBuffer.load = function(context, url) {
  return new Promise(function(resolve, reject) {
    loadWithXHR(url).then(function(audioData) {
      return decodeAudioData(context, audioData);
    }).then(function(decodedData) {
      resolve(new NeuBuffer(context, decodedData));
    }).catch(function(e) {
      reject(e);
    });
  });
};

function loadWithXHR(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new global.XMLHttpRequest();

    xhr.open("GET", url);
    xhr.responseType = "arraybuffer";

    xhr.onload = function() {
      resolve(xhr.response);
    };

    xhr.onerror = function() {
      reject({/* TODO: error object */});
    };

    xhr.send();
  });
}

function decodeAudioData(context, audioData) {
  return new Promise(function(resolve, reject) {
    context.decodeAudioData(audioData, function(decodedData) {
      resolve(decodedData);
    }, function() {
      reject({/* TODO: error object */});
    });
  });
}

NeuBuffer.prototype.getChannelData = function(ch) {
  ch = util.clip(util.int(ch), 0, this.numberOfChannels - 1);

  return this._buffer.getChannelData(ch);
};

NeuBuffer.prototype.concat = function() {
  var args = util.toArray(arguments).filter(function(elem) {
    return (elem instanceof NeuBuffer) && (this.numberOfChannels === elem.numberOfChannels);
  }, this);
  var channels = this.numberOfChannels;
  var length = args.reduce(function(a, b) {
    return a + b.length;
  }, this.length);
  var sampleRate = this.sampleRate;
  var buffer = this.$context.createBuffer(channels, length, sampleRate);

  args.unshift(this);

  var argslen = args.length;

  for (var i = 0; i < channels; i++) {
    var data = buffer.getChannelData(i);
    var pos = 0;
    for (var j = 0; j < argslen; j++) {
      data.set(args[j][i], pos);
      pos += args[j].length;
    }
  }

  return new NeuBuffer(this.$context, buffer);
};

NeuBuffer.prototype.reverse = function() {
  var channels = this.numberOfChannels;
  var buffer = this.$context.createBuffer(channels, this.length, this.sampleRate);

  for (var i = 0; i < channels; i++) {
    buffer.getChannelData(i).set(util.toArray(this[i]).reverse());
  }

  return new NeuBuffer(this.$context, buffer);
};

NeuBuffer.prototype.slice = function(start, end) {
  start = util.int(util.defaults(start, 0));
  end = util.int(util.defaults(end, this.length));

  if (start < 0) {
    start += this.length;
  } else {
    start = Math.min(start, this.length);
  }
  if (end < 0) {
    end += this.length;
  } else {
    end = Math.min(end, this.length);
  }

  var channels = this.numberOfChannels;
  var length = end - start;
  var sampleRate = this.sampleRate;
  var buffer = null;

  if (length <= 0) {
    buffer = this.$context.createBuffer(channels, 1, sampleRate);
  } else {
    buffer = this.$context.createBuffer(channels, length, sampleRate);
    for (var i = 0; i < channels; i++) {
      buffer.getChannelData(i).set(this[i].subarray(start, end));
    }
  }

  return new NeuBuffer(this.$context, buffer);
};

NeuBuffer.prototype.split = function(n) {
  n = util.int(util.defaults(n, 2));

  if (n <= 0) {
    return [];
  }

  var result = new Array(n);
  var len = this.length / n;
  var start = 0;
  var end = 0;

  for (var i = 0; i < n; i++) {
    end = Math.round(start + len);
    result[i] = this.slice(start, end);
    start = end;
  }

  return result;
};

NeuBuffer.prototype.normalize = function() {
  var channels = this.numberOfChannels;
  var buffer = this.$context.createBuffer(channels, this.length, this.sampleRate);

  for (var i = 0; i < channels; i++) {
    buffer.getChannelData(i).set(normalize(this[i]));
  }

  return new NeuBuffer(this.$context, buffer);
};

NeuBuffer.prototype.resample = function(size, interpolation) {
  size = Math.max(0, util.int(util.defaults(size, this.length)));
  interpolation = !!util.defaults(interpolation, true);

  var channels = this.numberOfChannels;
  var buffer = this.$context.createBuffer(channels, size, this.sampleRate);

  for (var i = 0; i < channels; i++) {
    buffer.getChannelData(i).set(resample(this[i], size, interpolation));
  }

  return new NeuBuffer(this.$context, buffer);
};

NeuBuffer.prototype.toAudioBuffer = function() {
  return this._buffer;
};

NeuBuffer.prototype.toPeriodicWave = function(ch) {
  ch = util.clip(util.int(ch), 0, this.numberOfChannels - 1);

  var buffer = this._buffer.getChannelData(ch);

  if (4096 < buffer.length) {
    buffer = buffer.subarray(0, 4096);
  }

  var fft = FFT.forward(buffer);

  return this.$context.createPeriodicWave(fft.real, fft.imag);
};

function normalize(data) {
  var maxamp = peak(data);

  /* istanbul ignore else */
  if (maxamp !== 0) {
    var ampfac = 1 / maxamp;
    for (var i = 0, imax = data.length; i < imax; ++i) {
      data[i] *= ampfac;
    }
  }

  return data;
}

function peak(data) {
  var maxamp = 0;

  for (var i = 0, imax = data.length; i < imax; ++i) {
    var absamp = Math.abs(data[i]);
    if (maxamp < absamp) {
      maxamp = absamp;
    }
  }

  return maxamp;
}

function resample(data, size, interpolation) {
  if (data.length === size) {
    return new Float32Array(data);
  }

  if (interpolation) {
    return resample1(data, size);
  }

  return resample0(data, size);
}

function resample0(data, size) {
  var factor = (data.length - 1) / (size - 1);
  var result = new Float32Array(size);

  for (var i = 0; i < size; i++) {
    result[i] = data[Math.round(i * factor)];
  }

  return result;
}

function resample1(data, size) {
  var factor = (data.length - 1) / (size - 1);
  var result = new Float32Array(size);
  var len = data.length - 1;

  for (var i = 0; i < size; i++) {
    var x = i * factor;
    var x0 = x|0;
    var x1 = Math.min(x0 + 1, len);
    result[i] = data[x0] + Math.abs(x - x0) * (data[x1] - data[x0]);
  }

  return result;
}

module.exports = NeuBuffer;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../dsp/fft":19,"../util":54}],11:[function(require,module,exports){
"use strict";

var util = require("../util");

var NeuSched = require("./sched");

function NeuInterval(context, schedTime, callback) {
  NeuSched.call(this, context, schedTime, callback);
}
util.inherits(NeuInterval, NeuSched);

NeuInterval.$name = "NeuInterval";

NeuInterval.prototype._onsched = function(t0) {
  if (this._stopTime <= t0) {
    this._state = NeuSched.STATE_STOP;
    this._stateString = "FINISHED";
    return;
  }

  this._stateString = "PLAYING";
  this._callback({
    playbackTime: t0,
    count: this._count++
  });

  var context = this.$context;
  var schedTime = util.finite(context.toSeconds(this._schedTime));

  schedTime = Math.max(1 / context.sampleRate, schedTime);

  context.sched(t0 + schedTime, this._onsched, this);
};

module.exports = NeuInterval;

},{"../util":54,"./sched":12}],12:[function(require,module,exports){
"use strict";

var util = require("../util");

function NeuSched(context, schedTime, callback) {
  this.$context = context;

  this._schedTime = schedTime;
  this._callback = callback;

  this._state = NeuSched.STATE_INIT;
  this._stateString = "UNSCHEDULED";
  this._startTime = 0;
  this._stopTime = Infinity;
  this._count = 0;

  Object.defineProperties(this, {
    context: {
      value: this.$context,
      enumerable: true
    },
    state: {
      get: function() {
        return this._stateString;
      },
      enumerable: true
    },
  });
}
NeuSched.$name = "NeuSched";

NeuSched.STATE_INIT = 0;
NeuSched.STATE_START = 1;
NeuSched.STATE_STOP = 2;

NeuSched.prototype.start = function(t0) {
  var context = this.$context;

  t0 = util.finite(util.defaults(context.toSeconds(t0), context.currentTime));

  if (this._state === NeuSched.STATE_INIT) {
    if (util.isFunction(this._callback)) {
      this._state = NeuSched.STATE_START;
      this._stateString = "SCHEDULED";
      this._startTime = t0;

      context.sched(t0, this._onsched, this);
    } else {
      this._state = NeuSched.STATE_STOP;
      this._stateString = "FINISHED";
    }

    context.start(); // auto start(?)
  }

  return this;
};

NeuSched.prototype.stop = function(t0) {
  var context = this.$context;

  t0 = util.finite(util.defaults(context.toSeconds(t0), context.currentTime));

  if (this._state === NeuSched.STATE_START) {
    this._state = NeuSched.STATE_STOP;
    this._stopTime = t0;
    this.$context.sched(this._stopTime, function() {
      this._stateString = "FINISHED";
    }, this);
  }

  return this;
};

NeuSched.prototype._onsched = function(t0) {
  if (this._stopTime <= t0) {
    this._state = NeuSched.STATE_STOP;
    this._stateString = "FINISHED";
    return;
  }

  this._stateString = "PLAYING";

  var result = this._callback({
    playbackTime: t0,
    count: this._count++
  });

  var context = this.$context;

  /* istanbul ignore else */
  if (typeof result === "object") {
    var schedTime = util.finite(context.toSeconds(result.next));

    if (t0 < schedTime) {
      if (util.isFunction(result.callback)) {
        this._callback = result.callback;
      }
      this._schedTime = schedTime;

      return context.sched(this._schedTime, this._onsched, this);
    }
  }

  this._state = NeuSched.STATE_STOP;
  this._stopTime = t0;
  this._stateString = "FINISHED";
};

module.exports = NeuSched;

},{"../util":54}],13:[function(require,module,exports){
"use strict";

var util = require("../util");

var NeuSched = require("./sched");

function NeuTimeout(context, schedTime, callback) {
  NeuSched.call(this, context, schedTime, callback);
}
util.inherits(NeuTimeout, NeuSched);

NeuTimeout.$name = "NeuTimeout";

NeuTimeout.prototype._onsched = function(t0) {
  if (this._count > 1 || this._stopTime <= t0) {
    this._state = NeuSched.STATE_STOP;
    this._stateString = "FINISHED";
    return;
  }

  this._stateString = "PLAYING";
  this._callback({
    playbackTime: t0,
    count: this._count++
  });

  var context = this.$context;
  var schedTime = util.finite(context.toSeconds(this._schedTime));

  schedTime = Math.max(1 / context.sampleRate, schedTime);

  context.sched(t0 + schedTime, this._onsched, this);
};

module.exports = NeuTimeout;

},{"../util":54,"./sched":12}],14:[function(require,module,exports){
(function (global){
"use strict";

var C = require("../const");
var util = require("../util");
var neume = require("../namespace");

var INIT = 0;
var START = 1;
var MAX_RENDERING_SEC = C.MAX_RENDERING_SEC;

var schedId = 1;

function NeuContext(destination, duration, spec) {
  spec = spec || {};
  this.$context = destination.context;
  this.$destination = destination;

  this._transport = new neume.Transport(this);
  this.$analyser = this.$context.createAnalyser();
  this.connect(this.$analyser, this.$destination);
  this._scriptProcessor = null;
  this._audioBuses = [];
  this._processBufSize = util.int(util.defaults(spec.processBufSize, C.PROCESS_BUF_SIZE));

  this.$inlet = null;
  this.$outlet = this.$analyser;

  Object.defineProperties(this, {
    context: {
      value: this,
      enumerable: true
    },
    audioContext: {
      value: this.$context,
      enumerable: true
    },
    sampleRate: {
      value: this.$context.sampleRate,
      enumerable: true
    },
    currentTime: {
      get: function() {
        return this._currentTime || this.$context.currentTime;
      },
      enumerable: true
    },
    destination: {
      value: destination,
      enumerable: true
    },
    listener: {
      value: this.$context.listener,
      enumerable: true
    },
    bpm: {
      get: function() {
        return this._transport.getBpm();
      },
      set: function(value) {
        this._transport.setBpm(value);
      },
      enumerable: true
    },
  });

  this._duration = duration;
  this.reset();
}
NeuContext.$name = "NeuContext";

Object.keys(global.AudioContext.prototype).forEach(function(key) {
  var desc = Object.getOwnPropertyDescriptor(global.AudioContext.prototype, key);

  /* istanbul ignore next */
  if (typeof desc.value !== "function") {
    return;
  }

  var method = global.AudioContext.prototype[key];

  NeuContext.prototype[key] = function() {
    return method.apply(this.$context, arguments);
  };
});

/**
 * @deprecated since version 0.3.0
 */
NeuContext.prototype.createNeuComponent = function(node) {
  return new neume.Component(this, node);
};

/**
* @deprecated since version 0.3.0
*/
NeuContext.prototype.createNeuDC = function(value) {
  return new neume.DC(this, util.finite(value));
};

/**
* @deprecated since version 0.3.0
*/
NeuContext.prototype.createNeuMul = function(a, b) {
  return new neume.Mul(this, a, b);
};

/**
* @deprecated since version 0.3.0
*/
NeuContext.prototype.createNeuSum = function(inputs) {
  return new neume.Sum(this, inputs);
};

/**
* @deprecated since version 0.3.0
*/
NeuContext.prototype.createNeuParam = function(value, spec) {
  return new neume.Param(this, util.finite(value), spec);
};

/**
* @deprecated since version 0.3.0
*/
NeuContext.prototype.createNeuDryWet = function(dryIn, wetIn, mixIn) {
  return new neume.DryWet(this, dryIn, wetIn, mixIn);
};

NeuContext.prototype.getAudioBus = function(index) {
  index = util.clip(util.int(util.defaults(index, 0)), 0, C.AUDIO_BUS_CHANNELS);
  if (!this._audioBuses[index]) {
    this._audioBuses[index] = new neume.AudioBus(this);
  }
  return this._audioBuses[index];
};

NeuContext.prototype.reset = function() {
  if (this.$inlet) {
    this.$inlet.disconnect();
  }

  this._audioBuses.splice(0).forEach(function(bus) {
    bus.toAudioNode().disconnect();
  }, this);

  this.$inlet = this._audioBuses[0] = this.getAudioBus(0);
  this.connect(this.$inlet, this.$analyser);

  this.disconnect(this._scriptProcessor);

  this._events = [];
  this._nextTicks = [];
  this._state = INIT;
  this._currentTime = 0;
  this._scriptProcessor = null;

  return this;
};

NeuContext.prototype.start = function() {
  if (this._state === INIT) {
    this._state = START;
    if (this.$context instanceof global.OfflineAudioContext) {
      startRendering.call(this);
    } else {
      startAudioTimer.call(this);
    }
  }
  return this;
};

function startRendering() {
  this._currentTimeIncr = util.clip(util.finite(this._duration), 0, MAX_RENDERING_SEC);
  onaudioprocess.call(this, { playbackTime: 0 });
}

function startAudioTimer() {
  var context = this.$context;
  var scriptProcessor = context.createScriptProcessor(this._processBufSize, 1, 1);
  var bufferSource = context.createBufferSource();

  this._currentTimeIncr = this._processBufSize / context.sampleRate;
  this._scriptProcessor = scriptProcessor;
  scriptProcessor.onaudioprocess = onaudioprocess.bind(this);

  // this is needed for iOS Safari
  bufferSource.start(0);
  this.connect(bufferSource, scriptProcessor);

  this.connect(scriptProcessor, context.destination);
}

NeuContext.prototype.stop = function() {
  return this;
};

NeuContext.prototype.sched = function(time, callback, ctx) {
  time = util.finite(time);

  if (!util.isFunction(callback)) {
    return 0;
  }

  var events = this._events;
  var event = {
    id: schedId++,
    time: time,
    callback: callback,
    context: ctx || this
  };

  if (events.length === 0 || events[events.length - 1].time <= time) {
    events.push(event);
  } else {
    for (var i = 0, imax = events.length; i < imax; i++) {
      if (time < events[i].time) {
        events.splice(i, 0, event);
        break;
      }
    }
  }

  return event.id;
};

NeuContext.prototype.unsched = function(id) {
  id = util.finite(id);

  if (id !== 0) {
    var events = this._events;
    for (var i = 0, imax = events.length; i < imax; i++) {
      if (id === events[i].id) {
        events.splice(i, 1);
        break;
      }
    }
  }

  return id;
};

NeuContext.prototype.nextTick = function(callback, ctx) {
  this._nextTicks.push(callback.bind(ctx || this));
  return this;
};

NeuContext.prototype.toAudioNode = function(obj) {
  if (obj && obj.toAudioNode) {
    obj = obj.toAudioNode();
  } else if (typeof obj === "number") {
    obj = new neume.DC(this, obj).toAudioNode();
  }
  if (!(obj instanceof global.AudioNode)) {
    obj = null;
  }
  return obj;
};

NeuContext.prototype.toAudioBuffer = function(obj) {
  if (obj && obj.toAudioBuffer) {
    return obj.toAudioBuffer();
  }
  if (!(obj instanceof global.AudioBuffer)) {
    obj = null;
  }
  return obj;
};

NeuContext.prototype.connect = function(from, to) {
  if (to) {
    if (Array.isArray(from)) {
      if (from.length) {
        new neume.Sum(this, from).connect(to);
      }
    } else if (from instanceof neume.Component || from instanceof neume.UGen) {
      from.connect(to);
    } else if (to instanceof global.AudioParam) {
      if (typeof from === "number") {
        to.value = util.finite(from);
      } else {
        from = this.toAudioNode(from);
        if (from) {
          from.connect(to);
        }
      }
    } else if (to instanceof global.AudioNode) {
      from = this.toAudioNode(from);
      if (from) {
        from.connect(to);
      }
    } else if (to instanceof neume.AudioBus) {
      this.connect(from, to.toAudioNode());
    }
    if (to.onconnected) {
      to.onconnected(from);
    }
  }
  return this;
};

NeuContext.prototype.disconnect = function(from) {
  if (from && from.disconnect) {
    from.disconnect();
    if (from.$outputs) {
      from.$outputs.forEach(function(to) {
        return to.ondisconnected && to.ondisconnected(from);
      });
    }
  }
  return this;
};

NeuContext.prototype.getBpm = function() {
  return this._transport.getBpm();
};

NeuContext.prototype.setBpm = function(value, rampTime) {
  this._transport.setBpm(value, rampTime);
  return this;
};

NeuContext.prototype.toSeconds = function(value) {
  return this._transport.toSeconds(value);
};

NeuContext.prototype.toFrequency = function(value) {
  return this._transport.toFrequency(value);
};

function onaudioprocess(e) {
  // Safari 7.0.6 does not support e.playbackTime
  var currentTime = e.playbackTime || /* istanbul ignore next */ this.$context.currentTime;
  var nextCurrentTime = currentTime + this._currentTimeIncr;
  var events = this._events;

  this._currentTime = currentTime;

  this._nextTicks.splice(0).forEach(function(callback) {
    callback(currentTime);
  });

  while (events.length && events[0].time <= nextCurrentTime) {
    var event = events.shift();

    this._currentTime = Math.max(this._currentTime, event.time);

    event.callback.call(event.context, event.time);
  }
}

module.exports = NeuContext;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../const":8,"../namespace":22,"../util":54}],15:[function(require,module,exports){
"use strict";

var util = require("../util");

var cached = {};
var registered = {};

module.exports = {
  exists: function(key) {
    key = String(key);
    return registered.hasOwnProperty(key);
  },
  set: function(key, value) {
    key = String(key);
    if (registered.hasOwnProperty(key)) {
      delete cached[key];
    }
    registered[key] = value;
  },
  get: function(key) {
    key = String(key);
    if (!cached.hasOwnProperty(key)) {
      if (!registered.hasOwnProperty(key)) {
        throw new Error("key '" + key + "' is not registered.");
      }
      if (key.charAt(0) === "@" && typeof registered[key] === "function") {
        cached[key] = registered[key].apply(null, util.toArray(arguments).slice(1));
      } else {
        cached[key] = registered[key];
      }
      registered[key] = null;
    }
    return cached[key];
  }
};

},{"../util":54}],16:[function(require,module,exports){
(function (global){
"use strict";

require("./shim");

var util = require("../util");
var neume = require("../namespace");

function Neume(context) {
  function fn(spec) {
    return new neume.SynthDef(context, spec);
  }

  Object.defineProperties(fn, {
    context: {
      value: context,
      enumerable: true
    },
    audioContext: {
      value: context.audioContext,
      enumerable: true
    },
    sampleRate: {
      value: context.sampleRate,
      enumerable: true
    },
    destination: {
      value: context.$destination,
      enumerable: true
    },
    currentTime: {
      get: function() {
        return context.currentTime;
      },
      enumerable: true
    },
    bpm: {
      get: function() {
        return context.bpm;
      },
      set: function(value) {
        context.bpm = value;
      },
      enumerable: true
    },
    toSeconds: {
      value: context.toSeconds.bind(context),
      enumerable: true
    },
    toFrequency: {
      value: context.toFrequency.bind(context),
      enumerable: true
    },
    Synth: {
      value: function(func) {
        return new neume.Synth(context, func, util.toArray(arguments).slice(1));
      },
      enumerable: true
    },
    Buffer: {
      value: Object.defineProperties(function(channels, length, sampleRate) {
        return neume.Buffer.create(context, channels, length, sampleRate);
      }, {
        from: {
          value: function(data) {
            return neume.Buffer.from(context, data);
          },
          enumerable: true
        },
        load: {
          value: function(url) {
            return neume.Buffer.load(context, url);
          },
          enumerable: true
        }
      }),
      enumerable: true
    },
    Sched: {
      value: function(callback) {
        return new neume.Sched(context, 0, callback);
      },
      enumerable: true
    },
    Interval: {
      value: function(schedTime, callback) {
        return new neume.Interval(context, schedTime, callback);
      },
      enumerable: true
    },
    Timeout: {
      value: function(schedTime, callback) {
        return new neume.Timeout(context, schedTime, callback);
      },
      enumerable: true
    },
  });

  return fn;
}

neume.impl = function(destination, spec) {
  if (destination instanceof global.AudioContext) {
    destination = destination.destination;
  }
  if (!(destination instanceof global.AudioNode)) {
    throw new TypeError("neume(): Illegal arguments");
  }

  var context = new neume.Context(destination, Infinity, spec);

  return Object.defineProperties(
    new Neume(context), {
      render: {
        value: function(duration, func) {
          var sampleRate = context.sampleRate;
          var length = util.int(sampleRate * duration);

          return new Promise(function(resolve) {
            var audioContext = new global.OfflineAudioContext(2, length, sampleRate);
            audioContext.oncomplete = function(e) {
              resolve(new neume.Buffer(context, e.renderedBuffer));
            };
            func(new Neume(new neume.Context(audioContext.destination, duration)));
            audioContext.startRendering();
          });
        }
      },
      start: {
        value: function() {
          context.start();
          return this;
        },
        enumerable: true
      },
      stop: {
        value: function() {
          context.stop();
          return this;
        },
        enumerable: true
      },
      reset: {
        value: function() {
          context.reset();
          return this;
        },
        enumerable: true
      },
      analyser: {
        value: context.$analyser,
        enumerable: true
      }
    }
  );
};

neume.util = util;
neume.KVS = require("./kvs");
neume.Context = require("./context");
neume.Transport = require("./transport");
neume.Component = require("../component/component");
neume.DC = require("../component/dc");
neume.DryWet = require("../component/drywet");
neume.Mul = require("../component/mul");
neume.Sum = require("../component/sum");
neume.Param = require("../component/param");
neume.AudioBus = require("../control/audio-bus");
neume.Buffer = require("../control/buffer");
neume.Sched = require("../control/sched");
neume.Interval = require("../control/interval");
neume.Timeout = require("../control/timeout");
neume.FFT = require("../dsp/fft");
neume.Emitter = require("../event/emitter");
neume.SynthDB = require("../synth/db");
neume.Synth = require("../synth/synth");
neume.SynthDef = require("../synth/synthdef");
neume.UGen = require("../synth/ugen");
neume.Unit = require("../synth/unit");

(function(C) {
  Object.keys(C).forEach(function(key) {
    neume[key] = C[key];
  });
})(require("../const"));

neume.register = function(name, func) {
  neume.UGen.register(name, func);
  return neume;
};

neume.use = function(fn) {
  /* istanbul ignore else */
  if (neume.use.used.indexOf(fn) === -1) {
    fn(neume, util);
    neume.use.used.push(fn);
  }
  return neume;
};
neume.use.used = [];

module.exports = neume;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../component/component":2,"../component/dc":3,"../component/drywet":4,"../component/mul":5,"../component/param":6,"../component/sum":7,"../const":8,"../control/audio-bus":9,"../control/buffer":10,"../control/interval":11,"../control/sched":12,"../control/timeout":13,"../dsp/fft":19,"../event/emitter":20,"../namespace":22,"../synth/db":24,"../synth/synth":26,"../synth/synthdef":27,"../synth/ugen":28,"../synth/unit":29,"../util":54,"./context":14,"./kvs":15,"./shim":17,"./transport":18}],17:[function(require,module,exports){
(function (global){
/* istanbul ignore next */
(function() {
  "use strict";

  global.AudioContext = global.AudioContext || global.webkitAudioContext;
  global.OfflineAudioContext = global.OfflineAudioContext || global.webkitOfflineAudioContext;

  if (typeof global.AudioContext !== "undefined") {
    if (typeof global.AudioContext.prototype.createGain !== "function") {
      global.AudioContext.prototype.createGain = global.AudioContext.prototype.createGainNode;
    }
    if (typeof global.AudioContext.prototype.createDelay !== "function") {
      global.AudioContext.prototype.createDelay = global.AudioContext.prototype.createDelayNode;
    }
    if (typeof global.AudioContext.prototype.createPeriodicWave !== "function") {
      global.AudioContext.prototype.createPeriodicWave = global.AudioContext.prototype.createWaveTable;
    }
    if (typeof global.AudioBufferSourceNode.prototype.start !== "function") {
      global.AudioBufferSourceNode.prototype.start = global.AudioBufferSourceNode.prototype.noteGrainOn;
    }
    if (typeof global.AudioBufferSourceNode.prototype.stop !== "function") {
      global.AudioBufferSourceNode.prototype.stop = global.AudioBufferSourceNode.prototype.noteOff;
    }
    if (typeof global.OscillatorNode.prototype.start !== "function") {
      global.OscillatorNode.prototype.start = global.OscillatorNode.prototype.noteOn;
    }
    if (typeof global.OscillatorNode.prototype.stop !== "function") {
      global.OscillatorNode.prototype.stop = global.OscillatorNode.prototype.noteOff;
    }
    if (typeof global.OscillatorNode.prototype.setPeriodicWave !== "function") {
      global.OscillatorNode.prototype.setPeriodicWave = global.OscillatorNode.prototype.setWaveTable;
    }
    if (typeof global.PeriodicWave === "undefined" && typeof global.WaveTable !== "undefined") {
      global.PeriodicWave = global.WaveTable;
      global.WaveTable.$name = "PeriodicWave";
    }
  }
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],18:[function(require,module,exports){
"use strict";

var util = require("../util");

function NeuTransport(context) {
  this.$context = context;
  this._bpm = 120;
  this._ramp = null;
}
NeuTransport.$name = "NeuTransport";

NeuTransport.prototype.getBpm = function() {
  var ramp = this._ramp;

  if (ramp !== null) {
    var t = this.$context.currentTime;
    if (ramp.t1 <= t) {
      this._bpm = ramp.v1;
      this._ramp = null;
    } else {
      var dt = (t - ramp.t0) / (ramp.t1 - ramp.t0);
      this._bpm = ramp.v0 * Math.pow(ramp.v1 / ramp.v0, dt);
    }
  }

  return this._bpm;
};

NeuTransport.prototype.setBpm = function(value, rampTime) {
  rampTime = this.toSeconds(util.defaults(rampTime, 0));

  var bpm = util.clip(util.finite(value), 1, 1000);

  if (rampTime <= 0) {
    this._bpm = bpm;
    this._ramp = null;
  } else {
    var t0 = this.$context.currentTime;
    this._ramp = {
      v0: this.getBpm(),
      t0: t0,
      v1: bpm,
      t1: t0 + rampTime
    };
  }

  return this;
};

NeuTransport.prototype.toSeconds = function(value) {
  if (typeof value === "number") {
    return util.finite(value);
  }

  if (value && typeof value === "object" && typeof value.playbackTime === "number") {
    return util.finite(value.playbackTime);
  }

  if (typeof value === "string") {
    var m, offset = 0, time = 0;

    if (value.charAt(0) === "+") {
      offset = this.$context.currentTime;
      value = value.slice(1);
    }

    var components = value.split(/[\(\)\-\+\/\*]/);

    if (components.length > 1) {
      var oringalTime = value;
      var expr = value;

      for (var i = 0, imax = components.length; i < imax; i++) {
        var symb = components[i].trim();
        if (symb !== "") {
          expr = expr.replace(symb, this.toSeconds(symb));
        }
      }

      try {
        time = eval(expr); // jshint ignore:line
      } catch (e) {
        throw new EvalError("Invalid Time Value Syntax: " + oringalTime);
      }

    } else if ((m = /^(\d+)ms$/.exec(value)) !== null) {
      time = +m[1] * 0.001;
    } else if ((m = /^(\d+(?:\.\d+)?)hz$/.exec(value)) !== null) {
      time = util.finite(1 / +m[1]);
    } else if ((m = /^(\d+)ticks$/.exec(value)) !== null) {
      time = ticks2sec(+m[1], this.getBpm());
    } else if ((m = /^(\d+)(n[td]?)$/.exec(value)) !== null) {
      time = note2sec(+m[1], m[2], this.getBpm());
    } else if ((m = /^(\d+)\.(\d+)\.(\d+)$/.exec(value)) !== null) {
      time = ticks2sec((+m[1] * 4 + (+m[2])) * 480 + (+m[3]), this.getBpm());
    } else if ((m = /^(\d\d):(\d\d):(\d\d)(?:\.(\d+))?$/.exec(value)) !== null) {
      time = ((+m[1] * 3600) + (+m[2] * 60) + (+m[3]) + (((m[4] || "") + "000").substr(0, 3) * 0.001));
    } else if ((m = /^(\d+)samples$/.exec(value)) !== null) {
      time = (+m[1] / this.$context.sampleRate);
    } else if (value === "now") {
      return this.$context.currentTime;
    } else {
      time = util.finite(+value);
    }

    return time + offset;
  }

  return value;
};

NeuTransport.prototype.toFrequency = function(value) {
  if (typeof value === "number") {
    return util.finite(value);
  }
  if (typeof value === "string") {
    return util.finite(1 / this.toSeconds(value));
  }
  return value;
};

function ticks2sec(ticks, bpm) {
  return 60 / bpm * (ticks / 480);
}

function note2sec(num, note, bpm) {
  var acc = {
    nt: 2 / 3,
    nd: 3 / 2,
  }[note] || 1;
  return num === 0 ? 0 : ticks2sec((4 / num) * 480 * acc, bpm);
}

module.exports = NeuTransport;

},{"../util":54}],19:[function(require,module,exports){
"use strict";

var util = require("../util");

function forward(_buffer) {
  var n = 1 << Math.ceil(Math.log(util.finite(_buffer.length)) * Math.LOG2E);
  var buffer = new Float32Array(n);
  var real = new Float32Array(n);
  var imag = new Float32Array(n);
  var params = getParams(n);
  var bitrev = params.bitrev;
  var sintable = params.sintable;
  var costable = params.costable;
  var i, j, k, k2, h, d, c, s, ik, dx, dy;

  for (i = 0; i < n; i++) {
    buffer[i] = _buffer[i];
    real[i] = _buffer[bitrev[i]];
    imag[i] = 0.0;
  }

  for (k = 1; k < n; k = k2) {
    h = 0;
    k2 = k + k;
    d = n / k2;
    for (j = 0; j < k; j++) {
      c = costable[h];
      s = sintable[h];
      for (i = j; i < n; i += k2) {
        ik = i + k;
        dx = s * imag[ik] + c * real[ik];
        dy = c * imag[ik] - s * real[ik];
        real[ik] = real[i] - dx;
        imag[ik] = imag[i] - dy;
        real[i] += dx;
        imag[i] += dy;
      }
      h += d;
    }
  }

  return { real: real, imag: imag };
}

function inverse(_real, _imag) {
  var n = 1 << Math.ceil(Math.log(util.finite(_real.length)) * Math.LOG2E);
  var buffer = new Float32Array(n);
  var real = new Float32Array(n);
  var imag = new Float32Array(n);
  var params = getParams(n);
  var bitrev = params.bitrev;
  var sintable = params.sintable;
  var costable = params.costable;
  var i, j, k, k2, h, d, c, s, ik, dx, dy;

  for (i = 0; i < n; i++) {
    j = bitrev[i];
    real[i] = +_real[j];
    imag[i] = -_imag[j];
  }

  for (k = 1; k < n; k = k2) {
    h = 0;
    k2 = k + k;
    d = n / k2;
    for (j = 0; j < k; j++) {
      c = costable[h];
      s = sintable[h];
      for (i = j; i < n; i += k2) {
        ik = i + k;
        dx = s * imag[ik] + c * real[ik];
        dy = c * imag[ik] - s * real[ik];
        real[ik] = real[i] - dx;
        imag[ik] = imag[i] - dy;
        real[i] += dx;
        imag[i] += dy;
      }
      h += d;
    }
  }

  for (i = 0; i < n; i++) {
    buffer[i] = real[i] / n;
  }

  return buffer;
}

function calcBitRev(n) {
  var x = new Int16Array(n);

  var n2 = n >> 1;
  var i = 0;
  var j = 0;

  while (true) {
    x[i] = j;

    if (++i >= n) {
      break;
    }

    var k = n2;

    while (k <= j) {
      j -= k;
      k >>= 1;
    }

    j += k;
  }

  return x;
}

function getParams(n) {
  if (getParams.cache[n]) {
    return getParams.cache[n];
  }

  var bitrev = calcBitRev(n);
  var k = Math.floor(Math.log(n) / Math.LN2);
  var sintable = new Float32Array((1 << k) - 1);
  var costable = new Float32Array((1 << k) - 1);

  for (var i = 0, imax = sintable.length; i < imax; i++) {
    sintable[i] = Math.sin(Math.PI * 2 * (i / n));
    costable[i] = Math.cos(Math.PI * 2 * (i / n));
  }

  getParams.cache[n] = {
    bitrev: bitrev,
    sintable: sintable,
    costable: costable,
  };

  return getParams.cache[n];
}
getParams.cache = [];

module.exports = {
  forward: forward,
  inverse: inverse,
};

},{"../util":54}],20:[function(require,module,exports){
"use strict";

function Emitter() {
  this._callbacks = {};
}

Emitter.prototype.hasListeners = function(event) {
  return this._callbacks.hasOwnProperty(event);
};

Emitter.prototype.listeners = function(event) {
  return this.hasListeners(event) ? this._callbacks[event].slice() : [];
};

Emitter.prototype.on = function(event, listener) {

  if (!this.hasListeners(event)) {
    this._callbacks[event] = [];
  }

  this._callbacks[event].push(listener);

  return this;
};

Emitter.prototype.once = function(event, listener) {

  function fn(payload) {
    this.off(event, fn);
    listener.call(this, payload);
  }

  fn.listener = listener;

  this.on(event, fn);

  return this;
};

Emitter.prototype.off = function(event, listener) {

  if (typeof listener === "undefined") {
    if (typeof event === "undefined") {
      this._callbacks = {};
    } else if (this.hasListeners(event)) {
      delete this._callbacks[event];
    }
  } else if (this.hasListeners(event)) {
    this._callbacks[event] = this._callbacks[event].filter(function(fn) {
      return !(fn === listener || fn.listener === listener);
    });
  }

  return this;
};

Emitter.prototype.emit = function(event, payload, ctx) {
  this.listeners(event).forEach(function(fn) {
    fn.call(this, payload);
  }, ctx || this);
};

module.exports = Emitter;

},{}],21:[function(require,module,exports){
module.exports = require("./core/neume");

},{"./core/neume":16}],22:[function(require,module,exports){
"use strict";

function neume() {
  return neume.impl.apply(null, arguments);
}

neume.version = "0.4.0";

module.exports = neume;

},{}],23:[function(require,module,exports){
"use strict";

var reUGenName = /^([a-zA-Z](-?[a-zA-Z0-9]+)*!?\??~?|[-+*\/%<=>!?&|@]+~?)/;

function isValidUGenName(name) {
  var exec = reUGenName.exec(name);
  return !!exec && exec[0] === name;
}

function parse(selector) {
  selector = String(selector);

  var parsed = { key: "", id: null, class: [] };

  var keyMatched = selector.match(reUGenName);
  if (keyMatched) {
    parsed.key = keyMatched[0];
    selector = selector.substr(parsed.key.length);
  }

  var matched = selector.match(/[.#][a-zA-Z](-?[a-zA-Z0-9]+)*/g);
  if (matched) {
    matched.forEach(function(match) {
      var ch0 = match.charAt(0);
      if (ch0 === "#") {
        if (!parsed.id) {
          parsed.id = match.substr(1);
        }
      } else {
        parsed.class.push(match.substr(1));
      }
    });
  }

  return parsed;
}

module.exports = {
  isValidUGenName: isValidUGenName,
  parse: parse
};

},{}],24:[function(require,module,exports){
"use strict";

var util = require("../util");
var selectorParser = require("../parser/selector");

function NeuSynthDB() {
  this._all = [];
  this._ids = {};
}

NeuSynthDB.prototype.append = function(obj) {
  if (util.isObject(obj)) {
    this._all.push(obj);
    if (obj.hasOwnProperty("$id")) {
      this._ids[obj.$id] = obj;
    }
  }
  return this;
};
NeuSynthDB.$name = "NeuSynthDB";

NeuSynthDB.prototype.all = function() {
  return this._all;
};

NeuSynthDB.prototype.find = function(selector) {
  var result = null;
  var parsed = selectorParser.parse(selector);

  if (parsed.id) {
    result = this._ids[parsed.id] ? [ this._ids[parsed.id] ] : [];
  } else {
    result = this._all;
  }

  parsed.class.forEach(function(cls) {
    result = result.filter(function(obj) {
      return obj.$class.indexOf(cls) !== -1;
    });
  });

  if (parsed.key) {
    result = result.filter(function(obj) {
      return obj.$key === parsed.key;
    });
  }

  return result;
};

module.exports = NeuSynthDB;

},{"../parser/selector":23,"../util":54}],25:[function(require,module,exports){
"use strict";

var util = require("../util");
var NeuParam = require("../component/param");
var NeuSynthDB = require("./db");
var NeuUGen = require("./ugen");

function NeuSynthDollar(synth) {
  var db = new NeuSynthDB();

  this.db = db;
  this.params = {};
  this.methods = {};
  this.timers = [];

  function builder() {
    var args = util.toArray(arguments);
    var key = args.shift();
    var spec = util.isDictionary(args[0]) ? args.shift() : {};
    var inputs = Array.prototype.concat.apply([], args);
    var ugen = NeuUGen.build(synth, key, spec, inputs);

    db.append(ugen);

    return ugen;
  }

  builder.param = $param(synth, this.params);
  builder.method = $method(synth, this.methods);
  builder.timeout = $timeout(synth, this.timers);
  builder.interval = $interval(synth, this.timers);
  builder.stop = $stop(synth);

  this.builder = builder;
}

function $param(synth, params) {
  return function(name, defaultValue) {
    if (params.hasOwnProperty(name)) {
      return params[name];
    }

    defaultValue = util.finite(util.defaults(defaultValue, 0));

    validateParam(name, defaultValue);

    var param = new NeuParam(synth.$context, defaultValue);

    Object.defineProperty(synth, name, {
      value: param,
      enumerable: true
    });

    params[name] = param;

    return param;
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

module.exports = NeuSynthDollar;

},{"../component/param":6,"../util":54,"./db":24,"./ugen":28}],26:[function(require,module,exports){
"use strict";

var util = require("../util");
var neume = require("../namespace");
var NeuSynthDB = require("./db");
var NeuSynthDollar = require("./dollar");

var EMPTY_DB = new NeuSynthDB();
var INIT = 0;
var START = 1;
var STOP = 2;

function NeuSynth(context, func, args) {
  this.$context = context;
  this.$routes = [];
  this.$localBuses = [];

  var $ = new NeuSynthDollar(this);

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

  var methodNames = [];

  Object.keys($.methods).forEach(function(methodName) {
    var method = $.methods[methodName];

    methodNames.push(methodName);

    Object.defineProperty(this, methodName, {
      value: function() {
        method.apply(this, util.toArray(arguments));
        return this;
      }
    });
  }, this);

  this._db.all().forEach(function(ugen) {
    Object.keys(ugen.$unit.$methods).forEach(function(methodName) {
      if (!this.hasOwnProperty(methodName)) {
        methodNames.push(methodName);
        Object.defineProperty(this, methodName, {
          value: function(t, v) {
            var e;
            if (t != null && typeof t !== "object") {
              e = { playbackTime: t, value: v };
            } else {
              e = t || {};
            }
            this.call(methodName, e);
            return this;
          }
        });
      }
    }, this);
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
      value: methodNames.sort(),
      enumerable: true
    }
  });
}
NeuSynth.$name = "NeuSynth";

NeuSynth.prototype.find = function(selector) {
  return this._db.find(selector);
};

NeuSynth.prototype.start = function(startTime) {
  var context = this.$context;

  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  startTime = util.finite(startTime);

  if (this._state === INIT) {
    this._state = START;
    this._stateString = "SCHEDULED";

    context.sched(startTime, function() {
      this._stateString = "PLAYING";
    }, this);

    this.$routes.forEach(function(node, index) {
      this.connect(node, this.getAudioBus(index));
    }, context);

    this._db.all().forEach(function(ugen) {
      ugen.$unit.start(startTime);
    });

    this._timers.forEach(function(timer) {
      timer.start(startTime);
    });

    context.start(); // auto start(?)
  }

  return this;
};

NeuSynth.prototype.stop = function(startTime) {
  var context = this.$context;

  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  startTime = util.finite(startTime);

  if (this._state === START) {
    this._state = STOP;

    context.sched(startTime, function(t0) {
      this._stateString = "FINISHED";

      context.nextTick(function() {
        this.$routes.forEach(function(node) {
          context.disconnect(node);
        });
      }, this);

      this._db.all().forEach(function(ugen) {
        ugen.$unit.stop(t0);
      });

      this._timers.forEach(function(timer) {
        timer.stop(t0);
      });
    }, this);
  }

  return this;
};

NeuSynth.prototype.fadeIn = function(startTime, duration) {
  var context = this.$context;

  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  duration = util.defaults(context.toSeconds(duration), 0.5);

  startTime = util.finite(startTime);
  duration = util.finite(duration);

  if (this._state === INIT) {
    if (this.$routes.length) {
      this._param.value = 0;
      context.sched(startTime, function(t0) {
        this._param.update(1, t0, duration);
      }, this);
    }
    this.start(startTime);
  }

  return this;
};

NeuSynth.prototype.fadeOut = function(startTime, duration) {
  var context = this.$context;

  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  duration = util.defaults(context.toSeconds(duration), 0.5);

  startTime = util.finite(startTime);
  duration = util.finite(duration);

  if (this._state === START) {
    if (this.$routes.length) {
      context.sched(startTime, function(t0) {
        this._param.update(0, t0, duration);
      }, this);
    }
    this.stop(startTime + duration);
  }

  return this;
};

NeuSynth.prototype.fade = function(startTime, value, duration) {
  var context = this.$context;

  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  duration = util.defaults(context.toSeconds(duration), 0.5);

  startTime = util.finite(startTime);
  value = util.finite(value);
  duration = util.finite(duration);

  if (this._state === START) {
    if (this.$routes.length) {
      context.sched(startTime, function(t0) {
        this._param.update(value, t0, duration);
      }, this);
    }
  }

  return this;
};

NeuSynth.prototype.apply = function(method, args) {
  iterateOverTargets(this._db, method, function(ugen, method) {
    ugen.$unit.apply(method, args);
  });
  return this;
};

NeuSynth.prototype.call = function() {
  var args = util.toArray(arguments);
  var method = args.shift();

  return this.apply(method, args);
};

NeuSynth.prototype.toAudioNode = function() {
  return this.$context.toAudioNode(this.$routes[0]);
};

NeuSynth.prototype.hasListeners = function(event) {
  var result = false;

  iterateOverTargets(this._db, event, function(ugen, event) {
    result = result || ugen.hasListeners(event);
  });

  return result;
};

NeuSynth.prototype.listeners = function(event) {
  var listeners = [];

  iterateOverTargets(this._db, event, function(ugen, event) {
    ugen.listeners(event).forEach(function(listener) {
      if (listeners.indexOf(listener) === -1) {
        listeners.push(listener);
      }
    });
  });

  return listeners;
};

NeuSynth.prototype.on = function(event, listener) {
  iterateOverTargets(this._db, event, function(ugen, event) {
    ugen.on(event, listener);
  });
  return this;
};

NeuSynth.prototype.once = function(event, listener) {
  iterateOverTargets(this._db, event, function(ugen, event) {
    ugen.once(event, listener);
  });
  return this;
};

NeuSynth.prototype.off = function(event, listener) {
  iterateOverTargets(this._db, event, function(ugen, event) {
    ugen.off(event, listener);
  });
  return this;
};

function getTargets(db, selector) {
  return selector ? db.find(selector) : db.all();
}

function iterateOverTargets(db, event, callback) {
  var parsed = parseEvent(event);

  if (parsed) {
    getTargets(db, parsed.selector).forEach(function(ugen) {
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
    return { selector: null, name: matched[3] };
  }

  return { selector: matched[1], name: matched[2] };
}

module.exports = NeuSynth;

},{"../namespace":22,"../util":54,"./db":24,"./dollar":25}],27:[function(require,module,exports){
(function (global){
"use strict";

var util = require("../util");
var neume = require("../namespace");

function NeuSynthDef(defaultContext, func) {
  if (!util.isFunction(func)) {
    throw new TypeError("NeuSynthDef func is not a function");
  }

  function SynthDef() {
    var context = defaultContext;
    var args = util.toArray(arguments);

    if (args[0] instanceof global.AudioContext) {
      context = args.shift();
    }

    return new neume.Synth(context, func, args);
  }

  Object.defineProperties(SynthDef, {
    context: {
      value: defaultContext,
      enumerable: true
    }
  });

  return SynthDef;
}

module.exports = NeuSynthDef;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../namespace":22,"../util":54}],28:[function(require,module,exports){
"use strict";

var util = require("../util");
var neume = require("../namespace");
var Emitter = require("../event/emitter");
var SelectorParser = require("../parser/selector");

function NeuUGen(synth, key, spec, inputs) {
  Emitter.call(this);

  var parsed = SelectorParser.parse(key);

  if (!NeuUGen.registered.hasOwnProperty(parsed.key)) {
    throw new Error("unknown key: " + key);
  }

  this.$context = synth.$context;
  this.$synth = synth;
  this.$key = parsed.key;
  this.$class = parsed.class;
  this.$id = parsed.id;
  this.$outlet = null;

  this.$builder = synth.$builder;

  var unit = NeuUGen.registered[parsed.key](this, spec, inputs);

  this._node = unit.$outlet;
  this._node = mul(this.$context, this._node, util.defaults(spec.mul, 1));
  this._node = add(this.$context, this._node, util.defaults(spec.add, 0));

  this.$isOutput = unit.$isOutput;

  this.$unit = unit;

  Object.keys(unit.$methods).forEach(function(name) {
    var method = unit.$methods[name];
    util.definePropertyIfNotExists(this, name, {
      value: function(t, v) {
        var e;
        if (t != null && typeof t !== "object") {
          e = { playbackTime: t, value: v };
        } else {
          e = t || {};
        }
        method.call(this, e);
        return this;
      }
    });
  }, this);
}
util.inherits(NeuUGen, Emitter);

NeuUGen.$name = "NeuUGen";

NeuUGen.registered = {};

NeuUGen.register = function(name, func) {
  if (!SelectorParser.isValidUGenName(name)) {
    throw new Error("invalid ugen name: " + name);
  }
  if (typeof func !== "function") {
    throw new TypeError("ugen must be a function");
  }
  NeuUGen.registered[name] = func;
};

NeuUGen.build = function(synth, key, spec, inputs) {
  if (typeof key !== "string") {
    var type = util.typeOf(key);

    if (typeof key === "object" && !NeuUGen.registered.hasOwnProperty(type)) {
      type = "object";
    }

    spec.value = key;
    key = type;
  }

  return new NeuUGen(synth, key, spec, inputs);
};

NeuUGen.prototype.$ = function() {
  var args = util.toArray(arguments);
  var key = args.shift();
  var spec = util.isDictionary(args[0]) ? args.shift() : {};
  var inputs = Array.prototype.concat.apply([ this ], args);

  return this.$builder(key, spec, inputs);
};

NeuUGen.prototype.mul = function(value) {
  return this.$builder("*", this, util.defaults(value, 1));
};

NeuUGen.prototype.add = function(value) {
  return this.$builder("+", this, util.defaults(value, 0));
};

NeuUGen.prototype.toAudioNode = function() {
  if (this.$outlet === null) {
    this.$outlet = this.$context.toAudioNode(this._node);
  }
  return this.$outlet;
};

NeuUGen.prototype.connect = function(to) {
  this._node.connect(to);
  return this;
};

NeuUGen.prototype.disconnect = function() {
  this._node.disconnect();
  return this;
};

function mul(context, a, b) {
  if (b === 1) {
    return a;
  }
  if (b === 0) {
    return new neume.DC(context, 0);
  }

  var mulNode = context.createGain();

  mulNode.gain.value = 0;

  context.connect(a, mulNode);
  context.connect(b, mulNode.gain);

  return mulNode;
}

function add(context, a, b) {
  return new neume.Sum(context, [ a, b ]);
}

module.exports = NeuUGen;

},{"../event/emitter":20,"../namespace":22,"../parser/selector":23,"../util":54}],29:[function(require,module,exports){
"use strict";

var util = require("../util");

var INIT = 0;
var START = 1;
var STOP = 2;

function NeuUnit(spec) {
  this._spec = spec;
  this._state = INIT;
  this.$outlet = util.defaults(spec.outlet, null);
  this.$methods = util.defaults(spec.methods, {});
  this.$isOutput = !!spec.isOutput;
}
NeuUnit.$name = "NeuUnit";

NeuUnit.prototype.start = function(t) {
  if (this._state === INIT && util.isFunction(this._spec.start)) {
    this._state = START;
    this._spec.start(util.finite(t));
  }
};

NeuUnit.prototype.stop = function(t) {
  if (this._state === START && util.isFunction(this._spec.stop)) {
    this._state = STOP;
    this._spec.stop(util.finite(t));
  }
};

NeuUnit.prototype.apply = function(method, args) {
  if (this.$methods[method]) {
    this.$methods[method].apply(null, args);
  }
};

NeuUnit.prototype.toAudioNode = function() {
  return this.$outlet;
};

module.exports = NeuUnit;

},{"../util":54}],30:[function(require,module,exports){
module.exports = function(neume) {
  "use strict";

  /**
   * $("+" ... inputs)
   *
   * +--------+
   * | inputs |
   * +--------+
   *   ||||||
   * +------------+
   * | GainNode   |
   * | - gain: 1  |
   * +------------+
   *   |
   */
  neume.register("+", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    return new neume.Unit({
      outlet: new neume.Sum(ugen.$context, inputs)
    });
  }

};

},{}],31:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /**
   * $([], {
   *   mode: enum[ clip, wrap, fold ] = clip
   *   tC: [number] = 0
   * } ... inputs)
   *
   * methods:
   *   setValue(t, value)
   *   at(t, index)
   *   next(t)
   *   prev(t)
   *
   * +--------+      +-------+
   * | inputs |  or  | DC(1) |
   * +--------+      +-------+
   *   ||||||
   * +----------------------+
   * | GainNode             |
   * | - gain: array[index] |
   * +----------------------+
   *   |
   */
  neume.register("array", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;

    var index = 0;
    var data = spec.value;
    var mode = {
      clip: util.clipAt,
      wrap: util.wrapAt,
      fold: util.foldAt,
    }[spec.clip || spec.mode] || /* istanbul ignore next*/ util.clipAt;

    if (!Array.isArray(data) || data.length === 0)  {
      data = [ 0 ];
    }

    var param = new neume.Param(context, util.finite(data[0]), spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function setValue(e) {
      var t0 = util.finite(context.toSeconds(e.playbackTime));
      var value = e.value;
      if (Array.isArray(value)) {
        context.sched(util.finite(t0), function() {
          data = value;
        });
      }
    }

    function at(e) {
      var t0 = util.finite(context.toSeconds(e.playbackTime));
      var index = util.defaults(e.value, e.index, e.count);
      context.sched(t0, function(startTime) {
        update(util.int(index), startTime);
      });
    }

    function next(e) {
      var t0 = util.finite(context.toSeconds(e.playbackTime));
      context.sched(t0, function(startTime) {
        update(index + 1, startTime);
      });
    }

    function prev(e) {
      var t0 = util.finite(context.toSeconds(e.playbackTime));
      context.sched(t0, function(startTime) {
        update(index - 1, startTime);
      });
    }

    function update(nextIndex, startTime) {
      var value = mode(data, nextIndex);

      param.update(value, startTime);

      index = nextIndex;
    }

    return new neume.Unit({
      outlet: outlet,
      methods: {
        setValue: setValue,
        at: at,
        next: next,
        prev: prev
      }
    });
  }

};

},{}],32:[function(require,module,exports){
(function (global){
module.exports = function(neume) {
  "use strict";

  [
    "AudioBufferSourceNode",
    "MediaElementAudioSourceNode",
    "MediaStreamAudioSourceNode",
    "ScriptProcessorNode",
    "GainNode",
    "BiquadFilterNode",
    "DelayNode",
    "PannerNode",
    "ConvolverNode",
    "AnalyserNode",
    "DynamicsCompressorNode",
    "WaveShaperNode",
    "OscillatorNode",
  ].forEach(function(name) {
    neume.register(name, function(ugen, spec, inputs) {
      return make(ugen, spec, inputs);
    });
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet = spec.value;

    Object.keys(spec).forEach(function(name) {
      if (typeof outlet[name] !== "undefined") {
        if (outlet[name] instanceof global.AudioParam) {
          context.connect(spec[name], outlet[name]);
        } else {
          outlet[name] = spec[name];
        }
      }
    });

    if (outlet.numberOfInputs) {
      context.connect(inputs, outlet);
    }

    return new neume.Unit({
      outlet: outlet
    });
  }

};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],33:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /**
   * $("biquad", {
   *   type: enum[ lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass ] = lowpass
   *   freq: [number|UGen] = 350
   *   dt: [number|UGen] = 0
   *   Q: [number|UGen] = 1
   *   gain: [number|UGen] = 0
   * } ... inputs)
   *
   * aliases:
   *   $("lowpass"), $("highpass"), $("bandpass"),
   *   $("lowshelf"), $("highshelf"), $("peaking"), $("notch"), $("allpass")
   *   $("lpf"), $("hpf"), $("bpf")
   *
   * +--------+
   * | inputs |
   * +--------+
   *   ||||||
   * +-------------------------+
   * | BiquadFilterNode        |
   * | - type: type            |
   * | - frequency: freq(350)  |
   * | - detune: detune(0)     |
   * | - Q: Q(1)               |
   * | - gain: gain(0)         |
   * +-------------------------+
   *  |
   */

  var FILTER_TYPES = {
    lowpass: "lowpass",
    highpass: "highpass",
    bandpass: "bandpass",
    lowshelf: "lowshelf",
    highshelf: "highshelf",
    peaking: "peaking",
    notch: "notch",
    allpass: "allpass",
    lpf: "lowpass",
    hpf: "highpass",
    bpf: "bandpass",
  };

  neume.register("biquad", function(ugen, spec, inputs) {
    var type = FILTER_TYPES[spec.type] || "lowpass";
    return make(type, ugen, spec, inputs);
  });

  Object.keys(FILTER_TYPES).forEach(function(name) {
    var type = FILTER_TYPES[name];
    neume.register(name, function(ugen, spec, inputs) {
      return make(type, ugen, spec, inputs);
    });
  });

  function make(type, ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet = context.createBiquadFilter();

    outlet.type = type;
    outlet.frequency.value = 0;
    outlet.detune.value = 0;
    outlet.Q.value = 0;
    outlet.gain.value = 0;

    var frequency = context.toFrequency(util.defaults(spec.freq, spec.frequency, 350));
    var detune = util.defaults(spec.dt, spec.detune, 0);
    var q = util.defaults(spec.Q, 1);
    var gain = util.defaults(spec.gain, 0);

    context.connect(frequency, outlet.frequency);
    context.connect(detune, outlet.detune);
    context.connect(q, outlet.Q);
    context.connect(gain, outlet.gain);
    context.connect(inputs, outlet);

    return new neume.Unit({
      outlet: outlet
    });
  }

};

},{}],34:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /**
   * $(boolean, {
   *   true: [number] = 1
   *   false: [number] = 0
   *   tC: [number] = 0
   * } ... inputs)
   *
   * methods:
   *   setValue(t, value)
   *   toggle(t)
   *
   * +--------+      +-------+
   * | inputs |  or  | DC(1) |
   * +--------+      +-------+
   *   ||||||
   * +------------------------------------+
   * | GainNode                           |
   * | - gain: value ? trueVal : falseVal |
   * +------------------------------------+
   *   |
   */
  neume.register("boolean", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;

    var data = !!spec.value;
    var trueVal = util.finite(util.defaults(spec.true, 1));
    var falseVal = util.finite(util.defaults(spec.false, 0));
    var param = new neume.Param(context, data ? trueVal : falseVal, spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function setValue(e) {
      var t0 = util.finite(context.toSeconds(e.playbackTime));
      var value = e.value;
      if (typeof value === "boolean") {
        context.sched(t0, function(startTime) {
          update(value ? trueVal : falseVal, startTime, value);
        });
      }
    }

    function toggle(e) {
      var t0 = util.finite(context.toSeconds(e.playbackTime));
      context.sched(t0, function(startTime) {
        update(data ? falseVal : trueVal, startTime, !data);
      });
    }

    function update(value, startTime, nextData) {
      param.update(value, startTime);
      data = nextData;
    }

    return new neume.Unit({
      outlet: outlet,
      methods: {
        setValue: setValue,
        toggle: toggle
      }
    });
  }

};

},{}],35:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /**
   * $("buf", {
   *   buf: [AudioBuffer|NeuBuffer] = null
   *   rate: [number|UGen] = 1
   *   loop: [boolean] = false
   *   start: [number] = 0
   *   end: [number] = 0
   * })
   *
   * aliases:
   *   $(AudioBuffer), $(NeuBuffer)
   *
   * start:
   *   start BufferSourceNode
   *
   * stop:
   *   stop BufferSourceNode
   *
   * +-------------------------+
   * | BufferSourceNode        |
   * | - buffer: buf(null)     |
   * | - playbackRate: rate(1) |
   * | - loop: loop(false)     |
   * | - loopStart: start(0)   |
   * | - loopEnd: end(0)       |
   * +-------------------------+
   *   |
   */
  neume.register("buf", function(ugen, spec) {
    return make(spec.buf || spec.buffer, ugen, spec);
  });

  neume.register("AudioBuffer", function(ugen, spec) {
    return make(spec.value, ugen, spec);
  });

  neume.register("NeuBuffer", function(ugen, spec) {
    return make(spec.value, ugen, spec);
  });

  function make(buffer, ugen, spec) {
    var context = ugen.$context;
    var bufSrc = context.createBufferSource();

    buffer = context.toAudioBuffer(buffer);

    /* istanbul ignore else */
    if (buffer != null) {
      bufSrc.buffer = buffer;
    }
    bufSrc.loop = !!util.defaults(spec.loop, false);
    bufSrc.loopStart = util.finite(util.defaults(spec.start, spec.loopStart, 0));
    bufSrc.loopEnd = util.finite(util.defaults(spec.end, spec.loopEnd, 0));

    bufSrc.playbackRate.value = 0;
    context.connect(util.defaults(spec.rate, spec.playbackRate, 1), bufSrc.playbackRate);

    var offset = util.finite(util.defaults(spec.offset, 0));
    var duration = context.toSeconds(util.defaults(spec.dur, spec.duration, null));
    if (duration != null) {
      duration = util.finite(duration);
    }

    function start(t) {
      if (duration != null) {
        bufSrc.start(t, offset, duration);
      } else {
        bufSrc.start(t, offset);
      }
      bufSrc.onended = function() {
        ugen.emit("end", {
          playbackTime: context.currentTime
        }, ugen.$synth);
      };
    }

    function stop(t) {
      bufSrc.stop(t);
    }

    return new neume.Unit({
      outlet: bufSrc,
      start: start,
      stop: stop
    });
  }

};

},{}],36:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /**
   * $("comp", {
   *   thresh: [number|UGen] = -24
   *   knee: [number|UGen] =  30
   *   ratio: [number|UGen] =  12
   *   a: [number|UGen] =  0.003
   *   r: [number|UGen] =  0.250
   * } ... inputs)
   *
   * +--------+
   * | inputs |
   * +--------+
   *   ||||||
   * +------------------------+
   * | DynamicsCompressorNode |
   * | - threshold: thresh    |
   * | - knee: knee           |
   * | - ratio: ratio         |
   * | - attack: a            |
   * | - release: r           |
   * +------------------------+
   *   |
   */
  neume.register("comp", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet = context.createDynamicsCompressor();

    outlet.threshold.value = 0;
    outlet.knee.value = 0;
    outlet.ratio.value = 0;
    outlet.attack.value = 0;
    outlet.release.value = 0;

    var threshold = util.defaults(spec.thresh, spec.threshold, -24);
    var knee = util.defaults(spec.knee, 30);
    var ratio = util.defaults(spec.ratio, 12);
    var attack = context.toSeconds(util.defaults(spec.a, spec.attack, 0.003));
    var release = context.toSeconds(util.defaults(spec.r, spec.release, 0.250));

    context.connect(threshold, outlet.threshold);
    context.connect(knee, outlet.knee);
    context.connect(ratio, outlet.ratio);
    context.connect(attack, outlet.attack);
    context.connect(release, outlet.release);
    context.connect(inputs, outlet);

    return new neume.Unit({
      outlet: outlet
    });
  }

};

},{}],37:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /**
   * $("conv", {
   *   buf: [AudioBuffer|NeuBuffer] = null
   *   normalize: [boolean] = true
   * } ... inputs)
   *
   * +--------+
   * | inputs |
   * +--------+
   *   |
   * +------------------------------+
   * | ConvolverNode                |
   * | - buffer: buffer(null)       |
   * | - normalize: normalize(true) |
   * +------------------------------+
   *   |
   */
  neume.register("conv", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet = context.createConvolver();

    var buffer = context.toAudioBuffer(spec.buf || spec.buffer);

    if (buffer != null) {
      outlet.buffer = buffer;
    }
    outlet.normalize = !!util.defaults(spec.normalize, true);

    context.connect(inputs, outlet);

    return new neume.Unit({
      outlet: outlet
    });
  }

};

},{}],38:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  var WEB_AUDIO_MAX_DELAY_TIME = neume.MAX_DELAY_SEC;

  /**
   * $("delay", {
   *   delayTime: [number|UGen] = 0
   *   feedback: [number|UGen] = 0
   *   maxDelay: [number] = delay
   * } ... inputs)
   *
   * +--------+
   * | inputs |
   * +--------+             +-----+
   *   ||||||               |     |
   * +------------------------+   |
   * | DelayNode              |   |
   * | - delayTime: delayTime |   |
   * +------------------------+   |
   *   |      |                   |
   *   |    +------------------+  |
   *   |    | GainNode         |  |
   *   |    | - gain: feedback |  |
   *   |    +------------------+  |
   *   |      |                   |
   *   |      +-------------------+
   *   |
   */
  neume.register("delay", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;

    var delayTime = context.toSeconds(util.defaults(spec.delay, spec.delayTime, 0));
    var feedback = util.defaults(spec.fb, spec.feedback, 0);
    var maxDelayTime;

    if (typeof delayTime === "number") {
      delayTime = util.clip(util.finite(delayTime), 0, WEB_AUDIO_MAX_DELAY_TIME);
      maxDelayTime = delayTime;
    } else {
      maxDelayTime = util.finite(context.toSeconds(util.defaults(spec.maxDelay, spec.maxDelayTime, 1)));
    }
    maxDelayTime = util.clip(maxDelayTime, 1 / context.sampleRate, WEB_AUDIO_MAX_DELAY_TIME);

    var outlet = context.createDelay(maxDelayTime);

    outlet.delayTime.value = 0;
    context.connect(delayTime, outlet.delayTime);

    if (feedback !== 0) {
      var feedbackNode = context.createGain();

      feedbackNode.gain.value = 0;

      context.connect(outlet, feedbackNode);
      context.connect(feedback, feedbackNode.gain);

      inputs = inputs.concat(feedbackNode);
    }

    context.connect(inputs, outlet);

    return new neume.Unit({
      outlet: outlet
    });
  }

};

},{}],39:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  var KVSKEY = "@neume:env:";

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

},{}],40:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /* istanbul ignore next */
  var NOP = function() {};

  /**
   * $(function, {
   *   tC: [number] = 0
   * } ... inputs)
   *
   * methods:
   *   setValue(t, value)
   *   execute(t)
   *
   * +--------+      +-------+
   * | inputs |  or  | DC(1) |
   * +--------+      +-------+
   *   ||||||
   * +-------------------------+
   * | GainNode                |
   * | - gain: evaluated value |
   * +-------------------------+
   *   |
   */
  neume.register("function", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;

    var data = typeof spec.value === "function" ? spec.value : /* istanbul ignore next */ NOP;
    var count = 0;
    var param = new neume.Param(context, util.finite(data(0, count++)), spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function setValue(e) {
      var t0 = util.finite(context.toSeconds(e.playbackTime));
      var value = e.value;
      if (typeof value === "function") {
        context.sched(t0, function() {
          data = value;
        });
      }
    }

    function evaluate(e) {
      var t0 = util.finite(context.toSeconds(e.playbackTime));
      context.sched(t0, function(startTime) {
        update(startTime);
      });
    }

    function update(startTime) {
      var value = data({
        playbackTime: startTime,
        count: count++
      });

      param.update(value, startTime);
    }

    return new neume.Unit({
      outlet: outlet,
      methods: {
        setValue: setValue,
        evaluate: evaluate
      }
    });
  }

};

},{}],41:[function(require,module,exports){
module.exports = function(neume) {
  "use strict";

  neume.use(require("./add"));
  neume.use(require("./array"));
  neume.use(require("./audio-node"));
  neume.use(require("./biquad"));
  neume.use(require("./boolean"));
  neume.use(require("./buf"));
  neume.use(require("./comp"));
  neume.use(require("./conv"));
  neume.use(require("./delay"));
  neume.use(require("./env"));
  neume.use(require("./function"));
  neume.use(require("./inout"));
  neume.use(require("./iter"));
  neume.use(require("./lfpulse"));
  neume.use(require("./line"));
  neume.use(require("./mono"));
  neume.use(require("./mul"));
  neume.use(require("./noise"));
  neume.use(require("./number"));
  neume.use(require("./object"));
  neume.use(require("./osc"));
  neume.use(require("./pan2"));
  neume.use(require("./shaper"));

};

},{"./add":30,"./array":31,"./audio-node":32,"./biquad":33,"./boolean":34,"./buf":35,"./comp":36,"./conv":37,"./delay":38,"./env":39,"./function":40,"./inout":42,"./iter":43,"./lfpulse":44,"./line":45,"./mono":46,"./mul":47,"./noise":48,"./number":49,"./object":50,"./osc":51,"./pan2":52,"./shaper":53}],42:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  var AUDIO_BUS_CHANNELS = neume.AUDIO_BUS_CHANNELS;

  neume.register("in", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet = null;

    inputs = inputs.filter(util.isFinite).map(function(index) {
      return getAudioBus(context, index);
    });

    outlet = new neume.Sum(context, inputs);

    return new neume.Unit({
      outlet: outlet
    });
  });

  neume.register("out", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var synth = ugen.$synth;
    var outlet = new neume.Sum(context, inputs);

    var index = util.clip(util.int(util.defaults(spec.bus, 0)), 0, AUDIO_BUS_CHANNELS);

    synth.$routes[index] = outlet;

    return new neume.Unit({
      outlet: outlet,
      isOutput: true
    });
  });

  neume.register("local-in", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var synth = ugen.$synth;
    var outlet = null;

    inputs = inputs.filter(util.isFinite).map(function(index) {
      return getLocalBus(context, synth, index);
    });

    outlet = new neume.Sum(context, inputs);

    return new neume.Unit({
      outlet: outlet
    });
  });

  neume.register("local-out", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var synth = ugen.$synth;
    var outlet = null;

    var index = util.clip(util.int(util.defaults(spec.bus, 0)), 0, AUDIO_BUS_CHANNELS);
    var bus = getLocalBus(context, synth, index);

    outlet = new neume.Sum(context, inputs).connect(bus);

    return new neume.Unit({
      outlet: outlet
    });
  });

  function getAudioBus(context, index) {
    index = util.clip(util.int(util.defaults(index, 0)), 0, AUDIO_BUS_CHANNELS);

    return context.getAudioBus(index);
  }

  function getLocalBus(context, synth, index) {
    index = util.clip(util.int(util.defaults(index, 0)), 0, AUDIO_BUS_CHANNELS);

    if (!synth.$localBuses[index]) {
      synth.$localBuses[index] = context.createGain();
    }

    return synth.$localBuses[index];
  }
};

},{}],43:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  var ITERATE = 0;
  var FINISHED = 1;

  /**
   * $("iter", {
   *   iter: [iterator] = null
   *   tC: [number] = 0
   * } ... inputs)
   *
   * methods:
   *   next(t)
   *   reset(t)
   *
   * +--------+      +-------+
   * | inputs |  or  | DC(1) |
   * +--------+      +-------+
   *   ||||||
   * +----------------------+
   * | GainNode             |
   * | - gain: array[index] |
   * +----------------------+
   *   |
   */
  neume.register("iter", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;

    var iter = util.defaults(spec.iter, null);
    var state = ITERATE;
    var param = new neume.Param(context, 0, spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function start(t) {
      var items = iterNext();

      if (items.done) {
        state = FINISHED;
        ugen.emit("end", { playbackTime: t }, ugen.$synth);
      } else {
        param.setValueAtTime(util.finite(items.value), t);
      }
    }

    function setValue(e) {
      var t0 = util.finite(context.toSeconds(e.playbackTime));
      var value = e.value;
      if (typeof value === "object" && typeof value.next === "function") {
        context.sched(t0, function() {
          iter = value;
        });
      }
    }

    function next(e) {
      var t0 = util.finite(context.toSeconds(e.playbackTime));
      context.sched(t0, function(startTime) {
        if (state === ITERATE) {
          var items = iterNext();

          if (items.done) {
            state = FINISHED;
            ugen.emit("end", { playbackTime: startTime }, ugen.$synth);
          } else {
            param.update(util.finite(items.value), startTime);
          }
        }
      });
    }

    function iterNext() {
      if (iter == null) {
        return { value: undefined, done: true };
      }
      var items;
      if (typeof iter.next === "function") {
        items = iter.next();
        if (!util.isObject(items)) {
          items = { value: items, done: false };
        }
      } else {
        items = { value: iter.valueOf(), done: false };
      }
      return items;
    }

    return new neume.Unit({
      outlet: outlet,
      start: start,
      methods: {
        setValue: setValue,
        next: next
      }
    });
  }

};

},{}],44:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  var KVSKEY = "@neume:lfpulse:";

  /**
   * $("lfpulse", {
   *  freq: audiolet=440,
   *  detune: audiolet=0,
   *  width: audiolet=0.5,
   *  mul: audiolet=1,
   *  add: audiolet=0,
   * }, ...inputs:audiolet)
   *
   * +----------------------+  +-------+  +-------+
   * | OscillatorNode       |  | DC(1) |  | DC(1) |
   * | type: triangle       |  +-------+  +-------+
   * | frequency: frequency |    |          |
   * | detune: 0            |    |        +--------------+
   * +----------------------+    |        | GainNode     |
   *   |                         |        | value: width |
   *   |                         |        +--------------+
   *   |                         |          |
   *   |                         |        +-----------+
   *   |                         |        | GainNode  |
   *   |                         |        | value: -2 |
   *   |                         |        +-----------+
   *   |                         |          |
   *   +-------------------------+----------+
   *   |
   * +-----------------------+
   * | WaveShaperNode        |
   * | curve: (tri -> pulse) |
   * +-----------------------+
   *   |
   *
   * See also:
   * https://github.com/pendragon-andyh/WebAudio-PulseOscillator
   */
  neume.register("lfpulse", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var elem = inputs.length ? hasInputs(ugen, spec, inputs) : noInputs(ugen, spec);
    var outlet = elem.outlet;
    var ctrl = elem.ctrl;

    return new neume.Unit({
      outlet: outlet,
      start: function(t) {
        ctrl.start(t);
      },
      stop: function(t) {
        ctrl.stop(t);
      }
    });
  }

  function noInputs(ugen, spec) {
    var pulse = createPulseOscillator(ugen.$context, spec, 440);
    return { outlet: pulse.outlet, ctrl: pulse.ctrl };
  }

  function hasInputs(ugen, spec, inputs) {
    var context = ugen.$context;

    var pulse = createPulseOscillator(context, spec, 2);
    var gain = ugen.$context.createGain();

    gain.gain.value = 0;
    context.connect(pulse.outlet, gain.gain);
    context.connect(inputs, gain);

    return { outlet: gain, ctrl: pulse.ctrl };
  }

  function createPulseOscillator(context, spec, defaultFreq) {
    var duty = util.defaults(spec.width, spec.duty, 0.5);
    var osc = createOscillator(context, spec, defaultFreq);
    var ws = createWaveShaper(context, neume.KVS.get(KVSKEY + "ws-curve"));
    var offset;

    if (typeof duty === "number") {
      offset = duty * -2;
    } else {
      offset = createGain(context, -2);
      context.connect(duty, offset);
    }

    context.connect([ osc, 1, offset ], ws);

    return { outlet: ws, ctrl: osc };
  }

  function createOscillator(context, spec, defaultFreq) {
    var osc = context.createOscillator();

    osc.setPeriodicWave(neume.KVS.get(KVSKEY + "src", context));

    osc.frequency.value = 0;
    osc.detune.value = 0;

    var frequency = context.toFrequency(util.defaults(spec.freq, spec.frequency, defaultFreq));
    var detune = util.defaults(spec.dt, spec.detune, 0);

    context.connect(frequency, osc.frequency);
    context.connect(detune, osc.detune);

    return osc;
  }

  function createWaveShaper(context, curve) {
    var ws = context.createWaveShaper();

    ws.curve = curve;

    return ws;
  }

  function createGain(context, value) {
    var gain = context.createGain();

    gain.gain.value = value;

    return gain;
  }

  neume.KVS.set(KVSKEY + "src", function(context) {
    var real = new Float32Array(4096);
    var imag = new Float32Array(4096);

    for (var i = 1; i < 4096; i++) {
      imag[i] = 1 / i;
      if (i % 2 === 0) {
        imag[i] *= -1;
      }
    }

    return context.createPeriodicWave(real, imag);
  });

  neume.KVS.set(KVSKEY + "ws-curve", function() {
    var curve = new Float32Array(4096);

    for (var i = 0; i < 2048; i++) {
      curve[i] = -1;
      curve[i + 2048] = +1;
    }

    return curve;
  });

};

},{}],45:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /*
   * $("line", {
   *   start: [number] = 1
   *   end: [number] = 0
   *   dur: [number] = 1
   * } ... inputs)
   *
   * $("xline", {
   *   start: [number] = 1
   *   end: [number] = 0
   *   dur: [number] = 1
   * } ... inputs)
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
  neume.register("line", function(ugen, spec, inputs) {
    var startValue = util.finite(util.defaults(spec.start, spec.startValue, 1));
    var endValue = util.finite(util.defaults(spec.end, spec.endValue, 0));
    var duration = util.finite(util.defaults(ugen.$context.toSeconds(spec.dur, spec.duration), 1));
    return make("linTo", ugen, startValue, endValue, duration, inputs);
  });

  neume.register("xline", function(ugen, spec, inputs) {
    var startValue = Math.max(1e-6, util.finite(util.defaults(spec.start, spec.startValue, 1)));
    var endValue = Math.max(1e-6, util.finite(util.defaults(spec.end, spec.endValue, 0)));
    var duration = util.finite(util.defaults(ugen.$context.toSeconds(spec.dur, spec.duration), 1));
    return make("expTo", ugen, startValue, endValue, duration, inputs);
  });

  function make(curve, ugen, startValue, endValue, duration, inputs) {
    var context = ugen.$context;

    var schedId = 0;
    var param = new neume.Param(context, startValue);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function start(t) {
      var t0 = t;
      var t1 = t0 + duration;

      param.setAt(startValue, t0);
      param[curve](endValue, t1);

      schedId = context.sched(t1, function(t) {
        schedId = 0;
        ugen.emit("end", { playbackTime: t }, ugen.$synth);
      });
    }

    function stop() {
      context.unsched(schedId);
    }

    return new neume.Unit({
      outlet: outlet,
      start: start,
      stop: stop
    });
  }

};

},{}],46:[function(require,module,exports){
module.exports = function(neume) {
  "use strict";

  /**
   * $("mono", {
   *   mul: 1, add: 0
   * } ... inputs)
   *
   * +--------+
   * | inputs |
   * +--------+
   *   |
   * +-----------+
   * | GainNode  |
   * | - gain: 1 |
   * +-----------+
   *   |
   */
  neume.register("mono", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet = context.createGain();

    outlet.channelCount = 1;
    outlet.channelCountMode = "explicit";
    outlet.channelInterpretation = "speakers";

    context.connect(inputs, outlet);

    return new neume.Unit({
      outlet: outlet
    });
  }

};

},{}],47:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /*
   * +-----------+
   * | inputs[0] |
   * +-----------+
   *   |
   * +-----------+
   * | GainNode  |  +-----------+
   * | - gain: 0 |--| inputs[1] |
   * +-----------+  +-----------+
   *   |
   * +-----------+
   * | GainNode  |  +-----------+
   * | - gain: 0 |--| inputs[2] |
   * +-----------+  +-----------+
   *   |
   * +------------------+
   * | GainNode         |
   * | - gain: multiple |
   * +------------------+
   *   |
   */
  neume.register("*", function(ugen, spec, inputs) {
    var elem = partition(inputs);

    return make(setup(ugen, elem.nodes, elem.multiple));
  });

  function partition(inputs) {
    var multiple = 1;
    var nodes = [];

    for (var i = 0, imax = inputs.length; i < imax; i++) {
      if (typeof inputs[i] === "number") {
        multiple *= inputs[i];
      } else {
        nodes.push(inputs[i]);
      }
    }

    return { multiple: util.finite(multiple), nodes: nodes };
  }

  function setup(ugen, nodes, multiple) {
    var context = ugen.$context;

    if (multiple === 0) {
      return new neume.DC(context, 0);
    }
    if (nodes.length === 0) {
      return new neume.DC(context, multiple);
    }
    if (nodes.length === 1 && multiple === 1) {
      return nodes[0];
    }

    if (multiple !== 1) {
      nodes.push(multiple);
    }

    var mulNode = nodes[0];
    var nextMulNode;

    for (var i = 1, imax = nodes.length; i < imax; i++) {
      nextMulNode = createMulNode(context, nodes[i]);

      context.connect(mulNode, nextMulNode);

      mulNode = nextMulNode;
    }

    return mulNode;
  }

  function make(outlet) {
    return new neume.Unit({
      outlet: outlet
    });
  }

  function createMulNode(context, mul) {
    var mulNode = context.createGain();

    if (typeof mul === "number") {
      mulNode.gain.value = mul;
    } else {
      mulNode.gain.value = 0;
      context.connect(mul, mulNode.gain);
    }

    return mulNode;
  }

};

},{}],48:[function(require,module,exports){
module.exports = function(neume) {
  "use strict";

  var NOISE_DURATION = 4;
  var KVSKEY = "@neume:noise:";

  /**
   * $("white")
   *
   * $("pink")
   *
   * +------------------+
   * | BufferSourceNode |
   * | - loop: true     |
   * +------------------+
   *   |
   */
  neume.register("noise", function(ugen, spec) {
    var type = {
      pink: "pink",
      brown: "brown"
    }[spec.type] || "white";
    return make(type, ugen);
  });

  [
    "white", "pink", "brown"
  ].forEach(function(type) {
    neume.register(type, function(ugen) {
      return make(type, ugen);
    });
  });

  function make(type, ugen) {
    var context = ugen.$context;
    var bufSrc = context.createBufferSource();

    bufSrc.buffer = neume.KVS.get(KVSKEY + type, context, NOISE_DURATION);
    bufSrc.loop = true;

    return new neume.Unit({
      outlet: bufSrc,
      start: function(t) {
        bufSrc.start(t);
      },
      stop: function(t) {
        bufSrc.stop(t);
      }
    });
  }

  // http://noisehack.com/generate-noise-web-audio-api/

  neume.KVS.set(KVSKEY + "white", function(context, duration) {
    var length = context.sampleRate * duration;
    var data = new Float32Array(length);

    for (var i = 0, imax = data.length; i < imax; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    var buf = context.createBuffer(1, length, context.sampleRate);
    buf.getChannelData(0).set(data);
    return buf;
  });

  neume.KVS.set(KVSKEY + "pink", function(context, duration) {
    var length = context.sampleRate * duration;
    var data = new Float32Array(length);

    var white;
    var b0 = 0;
    var b1 = 0;
    var b2 = 0;
    var b3 = 0;
    var b4 = 0;
    var b5 = 0;
    var b6 = 0;

    for (var i = 0, imax = data.length; i < imax; i++) {
      white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // (roughly) compensate for gain
      b6 = white * 0.115926;
    }

    var buf = context.createBuffer(1, length, context.sampleRate);
    buf.getChannelData(0).set(data);
    return buf;
  });

  neume.KVS.set(KVSKEY + "brown", function(context, duration) {
    var length = context.sampleRate * duration;
    var data = new Float32Array(length);

    var white;
    var lastOut = 0;

    for (var i = 0, imax = data.length; i < imax; i++) {
      white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // (roughly) compensate for gain
    }

    var buf = context.createBuffer(1, length, context.sampleRate);
    buf.getChannelData(0).set(data);
    return buf;
  });

};

},{}],49:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /**
   * $(number, {
   *   tC: [number] = 0
   * } ... inputs)
   *
   * methods:
   *   setValue(t, value)
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
  neume.register("number", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;

    var param = new neume.Param(context, util.finite(spec.value), spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function setValue(e) {
      var t0 = util.finite(context.toSeconds(e.playbackTime));
      var value = util.defaults(e.value, e.count, 0);
      if (util.isFinite(value)) {
        context.sched(t0, function(startTime) {
          update(value, startTime);
        });
      }
    }

    function update(value, startTime) {
      param.update(value, startTime);
    }

    return new neume.Unit({
      outlet: outlet,
      methods: {
        setValue: setValue
      }
    });
  }

};

},{}],50:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  neume.register("object", make);
  neume.register("Float32Array", make);

  function make(ugen, spec, inputs) {
    var context = ugen.$context;

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

    var prevVal = util.finite(valueOf());
    var param = new neume.Param(context, prevVal, spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function update(t0) {
      var value = util.finite(valueOf());

      if (value !== prevVal) {
        param.update(value, t0);
        prevVal = value;
      }

      var nextInterval = Math.max(minInterval, util.finite(context.toSeconds(interval)));

      schedId = context.sched(t0 + nextInterval, update);
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

},{}],51:[function(require,module,exports){
(function (global){
module.exports = function(neume, util) {
  "use strict";

  var KVSKEY = "@neume:osc";

  /**
   * $("osc", {
   *   type: [string|PeriodicWave]="sin",
   *   freq: [number|UGen]=440,
   *   dt: [number|UGen]=0
   * } ... inputs)
   *
   * aliases:
   *   $("sin"), $("square"), $("saw"), $("tri"), $(PeriodicWave)
   *
   * start:
   *   start OscillatorNode
   *
   * stop:
   *   stop OscillatorNode
   *
   *
   * no inputs
   * +------------------------+
   * | OscillatorNode         |
   * | - type: type           |
   * | - frequency: freq(440) |
   * | - detune: detune(0)    |
   * +------------------------+
   *   |
   *
   * has inputs
   * +--------+
   * | inputs |
   * +--------+     +----------------------+
   *   ||||||       | OscillatorNode       |
   * +-----------+  | - type: type         |
   * | GainNode  |  | - frequency: freq(2) |
   * | - gain: 0 |--| - detune: detune(0)  |
   * +-----------+  +----------------------+
   *   |
   */

  var WAVE_TYPES = {
    sin: "sine",
    square: "square",
    saw: "sawtooth",
    tri: "triangle"
  };

  neume.register("osc", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var type = spec.type;

    if (!isPeriodicWave(type)) {
      type = type2wave(context, WAVE_TYPES[type] || "sine");
    }

    return make(type, ugen, spec, inputs);
  });

  neume.register("PeriodicWave", function(ugen, spec, inputs) {
    var type = spec.value;

    if (!isPeriodicWave(type)) {
      type = "sine";
    }

    return make(type, ugen, spec, inputs);
  });

  Object.keys(WAVE_TYPES).forEach(function(name) {
    var type = WAVE_TYPES[name];
    neume.register(name, function(ugen, spec, inputs) {
      return make(type2wave(ugen.$context, type), ugen, spec, inputs);
    });
  });

  function make(wave, ugen, spec, inputs) {
    var elem = inputs.length ?
      hasInputs(wave, ugen, spec, inputs) : noInputs(wave, ugen, spec);
    var outlet = elem.outlet;
    var ctrl = elem.ctrl;

    return new neume.Unit({
      outlet: outlet,
      start: function(t) {
        ctrl.start(t);
      },
      stop: function(t) {
        ctrl.stop(t);
      }
    });
  }

  function noInputs(wave, ugen, spec) {
    var osc = createOscillator(ugen.$context, wave, spec, 440);
    return { outlet: osc, ctrl: osc };
  }

  function hasInputs(wave, ugen, spec, inputs) {
    var context = ugen.$context;

    var osc = createOscillator(context, wave, spec, 2);
    var gain = ugen.$context.createGain();

    gain.gain.value = 0;
    context.connect(osc, gain.gain);
    context.connect(inputs, gain);

    return { outlet: gain, ctrl: osc };
  }

  function createOscillator(context, type, spec, defaultFreq) {
    var osc = context.createOscillator();

    if (isPeriodicWave(type)) {
      osc.setPeriodicWave(type);
    } else {
      osc.type = type;
    }
    osc.frequency.value = 0;
    osc.detune.value = 0;

    var frequency = context.toFrequency(util.defaults(spec.freq, spec.frequency, defaultFreq));
    var detune = util.defaults(spec.dt, spec.detune, 0);

    context.connect(frequency, osc.frequency);
    context.connect(detune, osc.detune);

    return osc;
  }

  function isPeriodicWave(wave) {
    return !!(global.PeriodicWave && wave instanceof global.PeriodicWave);
  }

  function type2wave(context, type) {
    return neume.KVS.get(KVSKEY + type, context);
  }

  neume.KVS.set(KVSKEY + "sine", "sine");

  neume.KVS.set(KVSKEY + "square", function(context) {
    var real = new Float32Array(4096);
    var imag = new Float32Array(4096);

    for (var i = 1; i < 4096; i++) {
      if (i % 2 === 1) {
        imag[i] = 1 / i;
      }
    }

    return context.createPeriodicWave(real, imag);
  });

  neume.KVS.set(KVSKEY + "sawtooth", function(context) {
    var real = new Float32Array(4096);
    var imag = new Float32Array(4096);

    for (var i = 1; i < 4096; i++) {
      imag[i] = 1 / i;
      if (i % 2 === 0) {
        imag[i] *= -1;
      }
    }

    return context.createPeriodicWave(real, imag);
  });

  neume.KVS.set(KVSKEY + "triangle", function(context) {
    var real = new Float32Array(4096);
    var imag = new Float32Array(4096);

    for (var i = 1, imax = imag.length; i < imax; i++) {
      if (i % 2) {
        imag[i] = 1 / (i * i);
        if (i % 4 === 3) {
          imag[i] *= -1;
        }
      }
    }

    return context.createPeriodicWave(real, imag);
  });

};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],52:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  var WS_CURVE_SIZE = neume.WS_CURVE_SIZE;
  var KVSKEY = "@neume:pan2:";

  /**
   * $("pan2", {
   *   pos: [number|UGen] = 0
   * } ... inputs)
   *
   * +-----+              +--------+
   * | pos |              | inputs |
   * +-----+              +--------+
   *   |                    |
   *   +--------------------|-----------------------------+
   *   |                    +--------------+              |
   *   |                    |              |              |
   * +-----------------+  +-----------+  +-----------+  +-----------------+
   * | WaveShaperNode  |  | GainNode  |  | GainNode  |  | WaveShaperNode  |
   * | - curve: curveL |--| - gain: 0 |  | - gain: 0 |--| - curve: curveR |
   * +-----------------+  +-----------+  +-----------+  +-----------------+
   *   |                                                  |
   *   |               +----------------------------------+
   *   |               |
   * +-------------------+
   * | ChannelMergerNode |
   * +-------------------+
   *   |
   */
  neume.register("pan2", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;

    var gainL = context.createGain();
    var gainR = context.createGain();

    gainL.channelCount = 1;
    gainL.channelCountMode = "explicit";
    gainL.channelInterpretation = "speakers";

    gainR.channelCount = 1;
    gainR.channelCountMode = "explicit";
    gainR.channelInterpretation = "speakers";

    var pos = util.defaults(spec.pos, spec.pan, 0);

    if (typeof pos === "number") {
      pos = util.clip(pos, -1, +1) * 0.5 + 0.5;
      gainL.gain.value = Math.cos(pos * Math.PI * 0.5);
      gainR.gain.value = Math.sin(pos * Math.PI * 0.5);
    } else {
      var wsL = context.createWaveShaper();
      var wsR = context.createWaveShaper();
      var panCurve = neume.KVS.get(KVSKEY + "curve");

      wsL.curve = panCurve.L;
      wsR.curve = panCurve.R;

      context.connect(pos, wsL);
      context.connect(pos, wsR);

      gainL.gain.value = 0;
      gainR.gain.value = 0;

      wsL.connect(gainL.gain);
      wsR.connect(gainR.gain);
    }

    var merger = context.createChannelMerger(2);

    gainL.connect(merger, 0, 0);
    gainR.connect(merger, 0, 1);
    context.connect(inputs, gainL);
    context.connect(inputs, gainR);

    return new neume.Unit({
      outlet: merger
    });
  }

  neume.KVS.set(KVSKEY + "curve", function() {
    var curveL = new Float32Array(WS_CURVE_SIZE);
    var curveR = new Float32Array(WS_CURVE_SIZE);

    for (var i = 0; i < WS_CURVE_SIZE; i++) {
      curveL[i] = Math.cos((i / WS_CURVE_SIZE) * Math.PI * 0.5);
      curveR[i] = Math.sin((i / WS_CURVE_SIZE) * Math.PI * 0.5);
    }

    return { L: curveL, R: curveR };
  });

};

},{}],53:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  var WS_CURVE_SIZE = neume.WS_CURVE_SIZE;
  var KVSKEY = "@neume:shaper:";

  /**
   * $("shaper", {
   *   curve: [Float32Array|number] = 0
   * } ... inputs)
   *
   * aliases:
   *   $("clip")
   *
   * +--------+
   * | inputs |
   * +--------+
   *   ||||||
   * +--------------------------+
   * | WaveShaperNode           |
   * | - curve: curve           |
   * | - oversample: oversample |
   * +--------------------------+
   *   |
   */
  neume.register("shaper", function(ugen, spec, inputs) {
    var curve = null;
    if (typeof spec.curve === "number") {
      var n = Math.floor(util.clip(util.finite(spec.curve), 0, 1) * 256);
      curve = neume.KVS.get(KVSKEY + n, n);
    } else {
      curve = spec.curve;
    }
    return make(curve, ugen, spec, inputs);
  });

  neume.register("clip", function(ugen, spec, inputs) {
    var curve = neume.KVS.get(KVSKEY + "0");
    return make(curve, ugen, spec, inputs);
  });

  function make(curve, ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet = context.createWaveShaper();

    if (curve instanceof Float32Array) {
      outlet.curve = curve;
    }
    outlet.oversample = { "2x":"2x", "4x":"4x" }[spec.oversample] || "none";

    context.connect(inputs, outlet);

    return new neume.Unit({
      outlet: outlet
    });
  }

  (function() {
    // http://stackoverflow.com/questions/7840347/web-audio-api-waveshapernode
    function createCurve(amount) {
      var curve = new Float32Array(WS_CURVE_SIZE);

      var k = 2 * amount / (1 - amount);
      var x;

      for (var i = 0; i < WS_CURVE_SIZE; i++) {
        x = i * 2 / WS_CURVE_SIZE - 1;
        curve[i] = (1 + k) * x / (1 + k * Math.abs(x));
      }

      return curve;
    }

    function _createCurve(amount) {
      return function() {
        return createCurve(amount);
      };
    }

    for (var i = 1; i < 256; i++) {
      neume.KVS.set(KVSKEY + i, _createCurve(i / 256));
    }
  })();

  neume.KVS.set(KVSKEY + "0", function() {
    var curve = new Float32Array(WS_CURVE_SIZE);

    for (var i = 0; i < WS_CURVE_SIZE; i++) {
      curve[i] = (i / WS_CURVE_SIZE) * 2 - 1;
    }

    return curve;
  });

  neume.KVS.set(KVSKEY + "256", function() {
    var curve = new Float32Array(WS_CURVE_SIZE);
    var half = WS_CURVE_SIZE >> 1;

    for (var i = 0; i < WS_CURVE_SIZE; i++) {
      curve[i] = i < half ? -1 : +1;
    }

    return curve;
  });

};

},{}],54:[function(require,module,exports){
"use strict";

var util = {};

util.isArray = function(value) {
  return Array.isArray(value);
};

util.isBoolean = function(value) {
  return typeof value === "boolean";
};

util.isDictionary = function(value) {
  return value != null && value.constructor === Object;
};

util.isFunction = function(value) {
  return typeof value === "function";
};

util.isFinite = function(value) {
  return typeof value === "number" && isFinite(value);
};

util.isNaN = function(value) {
  return value !== value;
};

util.isNull = function(value) {
  return value === null;
};

util.isNumber = function(value) {
  return typeof value === "number" && !isNaN(value);
};

util.isObject = function(value) {
  var type = typeof value;
  return type === "function" || type === "object" && value !== null;
};

util.isString = function(value) {
  return typeof value === "string";
};

util.isTypedArray = function(value) {
  return value instanceof Float32Array ||
    value instanceof Uint8Array ||
    value instanceof Int8Array ||
    value instanceof Uint16Array ||
    value instanceof Int16Array ||
    value instanceof Uint32Array ||
    value instanceof Int32Array ||
    value instanceof Float64Array ||
    value instanceof Uint8ClampedArray;
};

util.isUndefined = function(value) {
  return value === void 0;
};

util.toArray = function(value) {
  if (value == null) {
    return [];
  }
  return Array.prototype.slice.call(value);
};

util.clipAt = function(list, index) {
  return list[Math.max(0, Math.min(index|0, list.length - 1))];
};

util.wrapAt = function(list, index) {
  index = index|0;

  index %= list.length;
  if (index < 0) {
    index += list.length;
  }

  return list[index];
};

util.foldAt = function(list, index) {
  index = index|0;

  var len2 = list.length * 2 - 2;

  index = index % len2;

  if (index < 0) {
    index += len2;
  }

  if (list.length <= index) {
    index = len2 - index;
  }

  return list[index];
};

util.definePropertyIfNotExists = function(obj, prop, descriptor) {
  if (!obj.hasOwnProperty(prop)) {
    Object.defineProperty(obj, prop, descriptor);
  }
  return obj;
};

util.format = function(fmt, dict) {
  Object.keys(dict).forEach(function(key) {
    if (/^\w+$/.test(key)) {
      fmt = fmt.replace(new RegExp("#\\{" + key + "\\}", "g"), dict[key]);
    }
  });
  return fmt;
};

util.num = function(value) {
  return +value||0;
};

util.int = function(value) {
  return +value|0;
};

util.finite = function(value) {
  value = +value||0;
  if (!util.isFinite(value)) {
    value = 0;
  }
  return value;
};

util.clip = function(value, min, max) {
  return Math.max(min, Math.min(value, max));
};

util.typeOf = function(value) {
  if (util.isNumber(value)) {
    return "number";
  }
  if (util.isArray(value)) {
    return "array";
  }
  if (util.isString(value)) {
    return "string";
  }
  if (util.isFunction(value)) {
    return "function";
  }
  if (util.isBoolean(value)) {
    return "boolean";
  }
  if (util.isNull(value)) {
    return "null";
  }
  if (util.isUndefined(value)) {
    return "undefined";
  }
  if (util.isNaN(value)) {
    return "nan";
  }

  var name;

  if (value.constructor) {
    if (typeof value.constructor.$name === "string") {
      name = value.constructor.$name;
    } else if (value.constructor.name && typeof value.constructor.name === "string") {
      name = value.constructor.name;
    }
  }

  if (!name) {
    name = Object.prototype.toString.call(value).slice(8, -1);
  }

  if (name === "Object") {
    name = "object";
  }

  return name;
};

util.defaults = function(value1, value2, defaultValue) {
  return value1 != null ? value1 : value2 != null ? value2 : defaultValue;
};

util.inherits = function(ctor, superCtor) {
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: { value: ctor, enumerable: false, writable: true, configurable: true }
  });
};

module.exports = util;

},{}]},{},[1]);
