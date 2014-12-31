(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var neume = require("./src/");

neume.use(require("./src/ugen/"));

if (typeof window !== "undefined") {
  window.neume = neume;
}

module.exports = neume;

},{"./src/":20,"./src/ugen/":39}],2:[function(require,module,exports){
"use strict";

var neume = require("../namespace");

var util = require("../util");
var Emitter = require("../util/emitter");

function NeuComponent(context, node) {
  Emitter.call(this);
  Object.defineProperties(this, {
    context: {
      value: context,
      enumerable: true
    },
  });
  this._outlet = null;
  this._node = util.defaults(node, null);
}
util.inherits(NeuComponent, Emitter);

NeuComponent.$$name = "NeuComponent";

NeuComponent.prototype.mul = function(value) {
  return new neume.Mul(this.context, util.defaults(this._node, this), util.defaults(value, 1));
};

NeuComponent.prototype.add = function(value) {
  return new neume.Sum(this.context, [ util.defaults(this._node, this), util.defaults(value, 0) ]);
};

NeuComponent.prototype.toAudioNode = function() {
  if (this._outlet === null) {
    this._outlet = this.context.toAudioNode(util.defaults(this._node, this));
  }
  return this._outlet;
};

NeuComponent.prototype.connect = function(to) {
  this.context.connect(util.defaults(this._node, this), to);
  return this;
};

NeuComponent.prototype.disconnect = function() {
  this.context.disconnect(util.defaults(this._node, this));
  return this;
};

module.exports = neume.Component = NeuComponent;

},{"../namespace":21,"../util":54,"../util/emitter":52}],3:[function(require,module,exports){
"use strict";

var neume = require("../namespace");

require("./component");

var util = require("../util");

var FILLED1 = (function() {
  var result = new Float32Array(128);
  for (var i = 0, imax = result.length; i < imax; i++) {
    result[i] = 1;
  }
  return result;
})();

var INIT = 0, START = 1, STOP = 2;

function NeuDC(context, value) {
  value = util.finite(value);

  context.$$neuDC = context.$$neuDC || {};
  if (context.$$neuDC[value]) {
    return context.$$neuDC[value];
  }
  context.$$neuDC[value] = this;

  neume.Component.call(this, context);
  this._value = value;
  this._bufSrc = null;
  this._state = INIT;
}
util.inherits(NeuDC, neume.Component);

NeuDC.$$name = "NeuDC";

NeuDC.prototype.toAudioNode = function() {
  var value = this._value;

  if (this._outlet === null && value !== 0) {
    var context = this.context;
    var buf, bufSrc, gain;

    if (value === 1) {
      buf = context.createBuffer(1, FILLED1.length, context.sampleRate);
      buf.getChannelData(0).set(FILLED1);

      bufSrc = context.createBufferSource();
      bufSrc.buffer = buf;
      bufSrc.loop = true;
      bufSrc.start(0);

      this._bufSrc = bufSrc;
      this._state = START;
      this._outlet = bufSrc;
    } else {
      bufSrc = new NeuDC(context, 1).toAudioNode();

      gain = context.createGain();
      gain.gain.value = value;
      bufSrc.connect(gain);

      this._outlet = gain;
    }
  }
  return this._outlet;
};

NeuDC.prototype.connect = function(to) {
  if (to instanceof neume.webaudio.AudioParam) {
    to.value = this._value;
  } else {
    this.context.connect(this.toAudioNode(), to);
  }
  return this;
};

NeuDC.prototype.disconnect = function() {
  this.stop(this.context.currentTime);
  this.context.disconnect(this._outlet);
  return this;
};

NeuDC.prototype.stop = function(t) {
  if (this._state === START) {
    this._bufSrc.stop(util.finite(t));
    this._state = STOP;
  }
  return this;
};

NeuDC.prototype.valueOf = function() {
  return this._value;
};

module.exports = neume.DC = NeuDC;

},{"../namespace":21,"../util":54,"./component":2}],4:[function(require,module,exports){
require("./component");
require("./dc");
require("./mul");
require("./param");
require("./sum");

},{"./component":2,"./dc":3,"./mul":5,"./param":6,"./sum":7}],5:[function(require,module,exports){
"use strict";

var neume = require("../namespace");

require("./component");

var util = require("../util");

function NeuMul(context, a, b) {
  a = a.valueOf();
  b = b.valueOf();

  if (typeof a === "number" && typeof b === "number") {
    return new neume.DC(context, a * b);
  }

  neume.Component.call(this, context);

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
util.inherits(NeuMul, neume.Component);

NeuMul.$$name = "NeuMul";

NeuMul.prototype.mul = function(value) {
  value = value.valueOf();

  if (typeof this._b === "number" && typeof value === "number") {
    return new neume.Mul(this.context, this._a, util.finite(this._b * value));
  }

  return new neume.Mul(this.context, this.toAudioNode(), value);
};

NeuMul.prototype.toAudioNode = function() {
  if (this._outlet === null) {
    this._outlet = this.context.createGain();
    this._outlet.gain.value = 0;
    this.context.connect(this._a, this._outlet);
    this.context.connect(this._b, this._outlet.gain);
  }
  return this._outlet;
};

NeuMul.prototype.connect = function(to) {
  this.context.connect(this.toAudioNode(), to);
  return this;
};

NeuMul.prototype.disconnect = function() {
  this.context.disconnect(this._outlet);
  return this;
};

module.exports = neume.Mul = NeuMul;

},{"../namespace":21,"../util":54,"./component":2}],6:[function(require,module,exports){
"use strict";

var neume = require("../namespace");

require("./component");

var util = require("../util");

function NeuParam(context, value, spec) {
  spec = spec || {};
  neume.Component.call(this, context);
  this._value = util.finite(value);
  this._params = [];
  this._events = [];
  this._curve = spec.curve;
  this._lag = util.defaults(spec.lag, 0);
  this._scheduled = null;
}
util.inherits(NeuParam, neume.Component);

NeuParam.$$name = "NeuParam";

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
  t = util.finite(this.context.toSeconds(t));

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
  startTime = util.finite(this.context.toSeconds(startTime));

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
  endTime = util.finite(this.context.toSeconds(endTime));

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
  endTime = util.finite(this.context.toSeconds(endTime));

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
  startTime = util.finite(this.context.toSeconds(startTime));
  timeConstant = util.finite(this.context.toSeconds(timeConstant));

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
  startTime = util.finite(this.context.toSeconds(startTime));
  duration = util.finite(this.context.toSeconds(duration));

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
  startTime = util.finite(this.context.toSeconds(startTime));

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
  var context = this.context;
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
  var context = this.context;

  if (this._outlet == null) {
    this._outlet = context.createGain();
    this._outlet.gain.value = this._value;
    this._params.push(this._outlet.gain);
    if (input) {
      context.connect(input, this._outlet);
    } else {
      context.connect(new neume.DC(context, 1), this._outlet);
    }
  }

  return this._outlet;
};

NeuParam.prototype.connect = function(to) {
  if (to instanceof neume.webaudio.AudioParam) {
    to.value = this._value;
    this._params.push(to);
  } else {
    this.context.connect(this.toAudioNode(), to);
  }
  return this;
};

NeuParam.prototype.disconnect = function() {
  this.context.disconnect(this._outlet);
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

module.exports = neume.Param = NeuParam;

},{"../namespace":21,"../util":54,"./component":2}],7:[function(require,module,exports){
"use strict";

var neume = require("../namespace");

require("./component");

var util = require("../util");

function NeuSum(context, inputs) {
  neume.Component.call(this, context);

  var number = 0;
  var hasNumber = false;
  var param = null;
  var nodes = [];

  inputs = util.flatten(inputs);

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
util.inherits(NeuSum, neume.Component);

NeuSum.$$name = "NeuSum";

NeuSum.prototype.add = function(value) {
  return new neume.Sum(this.context, this._inputs.concat(value));
};

NeuSum.prototype.toAudioNode = function() {
  if (this._outlet === null) {
    var context = this.context;
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

    this._outlet = sumNode;
  }

  return this._outlet;
};

NeuSum.prototype.connect = function(to) {
  var context = this.context;
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
  this.context.disconnect(this._inputs);
  return this;
};

module.exports = neume.Sum = NeuSum;

},{"../namespace":21,"../util":54,"./component":2}],8:[function(require,module,exports){
"use strict";

module.exports = {
  DC_BUF_SIZE: 128,
  WS_CURVE_SIZE: 4096,
  MAX_RENDERING_SEC: 180,
  MAX_DELAY_SEC: 180,
  DEFAULT_MAX_NODES_OF_BUS: 64,
};

},{}],9:[function(require,module,exports){
"use strict";

var neume = require("../namespace");

var C = require("../const");
var util = require("../util");

function NeuAudioBus(context, index) {
  index = util.finite(index)|0;

  this._outlet = context.createGain();
  this._maxNodes = C.DEFAULT_MAX_NODES_OF_BUS;
  this._inputs = [];

  Object.defineProperties(this, {
    context: {
      value: context,
      enumerable: true
    },
    index: {
      value: index,
      enumerable: true
    },
    maxNodes: {
      set: function(value) {
        this._maxNodes = Math.max(0, util.int(value));
      },
      get: function() {
        return this._maxNodes;
      },
      enumerable: true
    },
    nodes: {
      get: function() {
        return this._inputs.slice();
      },
      enumerable: true
    },
  });
}

NeuAudioBus.$$name = "NeuAudioBus";

NeuAudioBus.prototype.append = function(synth) {
  this.context.connect(synth.toAudioNode(this.index), this._outlet);

  this._inputs.push(synth);

  if (this._maxNodes < this._inputs.length) {
    this._inputs.shift().stop();
  }

  return this;
};

NeuAudioBus.prototype.remove = function(synth) {
  var index = this._inputs.indexOf(synth);

  if (index !== -1) {
    this._inputs.splice(index, 1);
  }

  return this;
};

NeuAudioBus.prototype.toAudioNode = function() {
  return this._outlet;
};

module.exports = neume.AudioBus = NeuAudioBus;

},{"../const":8,"../namespace":21,"../util":54}],10:[function(require,module,exports){
"use strict";

var neume = require("../namespace");

var util = require("../util");
var FFT = require("../util/fft");

function NeuBuffer(context, buffer) {
  Object.defineProperties(this, {
    context: {
      value: context,
      enumerable: true
    },
    sampleRate: {
      value: buffer.sampleRate,
      enumerable: true
    },
    length: {
      value: buffer.length,
      enumerable: true
    },
    duration: {
      value: buffer.duration,
      enumerable: true
    },
    numberOfChannels: {
      value: buffer.numberOfChannels,
      enumerable: true
    },
  });

  function getChannelData(ch) {
    return function() {
      return buffer.getChannelData(ch);
    };
  }

  for (var i = 0; i < buffer.numberOfChannels; i++) {
    Object.defineProperty(this, i, { get: getChannelData(i) });
  }

  this._buffer = buffer;
}
NeuBuffer.$$name = "NeuBuffer";

NeuBuffer.create = function(context, channels, length, sampleRate) {
  channels = util.int(util.defaults(channels, 1));
  length = util.int(util.defaults(length, 0));
  sampleRate = util.int(util.defaults(sampleRate, context.sampleRate));

  return new NeuBuffer(context, context.createBuffer(channels, length, sampleRate));
};

NeuBuffer.from = function(context) {
  var args = util.toArray(arguments).slice(1);
  var numberOfChannels = args.length;
  var length = args.reduce(function(a, b) {
    return Math.max(a, b.length);
  }, 0);

  var buffer = context.createBuffer(numberOfChannels, length, context.sampleRate);

  for (var i = 0; i < numberOfChannels; i++) {
    buffer.getChannelData(i).set(args[i]);
  }

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
    var xhr = new XMLHttpRequest();

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
  var buffer = this.context.createBuffer(channels, length, sampleRate);

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

  return new NeuBuffer(this.context, buffer);
};

NeuBuffer.prototype.reverse = function() {
  var channels = this.numberOfChannels;
  var buffer = this.context.createBuffer(channels, this.length, this.sampleRate);

  for (var i = 0; i < channels; i++) {
    buffer.getChannelData(i).set(util.toArray(this[i]).reverse());
  }

  return new NeuBuffer(this.context, buffer);
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
    buffer = this.context.createBuffer(channels, 1, sampleRate);
  } else {
    buffer = this.context.createBuffer(channels, length, sampleRate);
    for (var i = 0; i < channels; i++) {
      buffer.getChannelData(i).set(this[i].subarray(start, end));
    }
  }

  return new NeuBuffer(this.context, buffer);
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
  var buffer = this.context.createBuffer(channels, this.length, this.sampleRate);

  for (var i = 0; i < channels; i++) {
    buffer.getChannelData(i).set(normalize(this[i]));
  }

  return new NeuBuffer(this.context, buffer);
};

NeuBuffer.prototype.resample = function(size, interpolation) {
  size = Math.max(0, util.int(util.defaults(size, this.length)));
  interpolation = !!util.defaults(interpolation, true);

  var channels = this.numberOfChannels;
  var buffer = this.context.createBuffer(channels, size, this.sampleRate);

  for (var i = 0; i < channels; i++) {
    buffer.getChannelData(i).set(resample(this[i], size, interpolation));
  }

  return new NeuBuffer(this.context, buffer);
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

  return this.context.createPeriodicWave(fft.real, fft.imag);
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

module.exports = neume.Buffer = NeuBuffer;

},{"../namespace":21,"../util":54,"../util/fft":53}],11:[function(require,module,exports){
require("./audio-bus");
require("./buffer");
require("./interval");
require("./sched");
require("./timeout");

},{"./audio-bus":9,"./buffer":10,"./interval":12,"./sched":13,"./timeout":14}],12:[function(require,module,exports){
"use strict";

var neume = require("../namespace");

require("./sched");

var util = require("../util");

function NeuInterval(context, schedTime, callback) {
  var minSchedTime = 1 / context.sampleRate;
  var schedIter = {
    next: function() {
      var interval = Math.max(minSchedTime, util.finite(context.toSeconds(schedTime)));
      return { value: interval, done: false };
    }
  };
  neume.Sched.call(this, context, schedIter);

  this.on("start", callback).on("sched", callback);
}
util.inherits(NeuInterval, neume.Sched);

NeuInterval.$$name = "NeuInterval";

module.exports = neume.Interval = NeuInterval;

},{"../namespace":21,"../util":54,"./sched":13}],13:[function(require,module,exports){
"use strict";

var neume = require("../namespace");

var util = require("../util");
var Emitter = require("../util/emitter");

var STATE_INIT = 0;
var STATE_START = 1;
var STATE_RUNNING = 2;
// var STATE_STOP = 3;
var STATE_DONE = 4;

function NeuSched(context, schedIter, callback) {
  Emitter.call(this);

  Object.defineProperties(this, {
    context: {
      value: context,
      enumerable: true
    },
  });

  this._schedIter = schedIter;
  this._state = STATE_INIT;
  this._count = 0;

  this.on("start", callback).on("sched", callback).on("stop", callback);
}
util.inherits(NeuSched, Emitter);

NeuSched.$$name = "NeuSched";

NeuSched.prototype.start = function(startTime) {
  if (this._state !== STATE_INIT) {
    return this;
  }

  var context = this.context;

  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  startTime = util.finite(startTime);

  this._state = STATE_START;

  context.sched(startTime, function(t0) {
    this._state = STATE_RUNNING;
    emit(this, t0, false);
  }, this);

  context.start(); // auto start

  return this;
};

NeuSched.prototype.stop = function(startTime) {
  if (this._state !== STATE_RUNNING && this._state !== STATE_START) {
    return this;
  }

  var context = this.context;

  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  startTime = util.finite(startTime);

  context.sched(startTime, function(t0) {
    this.emit("stop", {
      type: "stop",
      playbackTime: t0,
      duration: 0,
      count: this._count,
      done: false
    });
    this._state = STATE_DONE;
  }, this);

  return this;
};

function emit(_this, t0, done) {
  if (_this._state !== STATE_RUNNING) {
    return;
  }

  var context = _this.context;
  var type = done ? "stop" : _this._count ? "sched" : "start";
  var result = _this._schedIter.next();
  var duration = done ? 0 : util.finite(context.toSeconds(result.value));

  _this.emit(type, {
    type: type,
    playbackTime: t0,
    duration: duration,
    count: _this._count++,
    done: done
  });

  if (done) {
    _this._state = STATE_DONE;
  } else {
    context.sched(t0 + duration, function(t0) {
      emit(_this, t0, result.done);
    });
  }

}

module.exports = neume.Sched = NeuSched;

},{"../namespace":21,"../util":54,"../util/emitter":52}],14:[function(require,module,exports){
"use strict";

var neume = require("../namespace");

require("./sched");

var util = require("../util");

function NeuTimeout(context, schedTime, callback) {
  var schedIter = {
    next: function() {
      var timeout = util.finite(context.toSeconds(schedTime));
      return { value: timeout, done: true };
    }
  };
  neume.Sched.call(this, context, schedIter);

  this.on("stop", callback);
}
util.inherits(NeuTimeout, neume.Sched);

NeuTimeout.$$name = "NeuTimeout";

module.exports = neume.Timeout = NeuTimeout;

},{"../namespace":21,"../util":54,"./sched":13}],15:[function(require,module,exports){
"use strict";

var neume = require("../namespace");

require("./transport");

var util = require("../util");

var INIT = 0, START = 1;

function NeuContext(destination, spec) {
  spec = spec || /* istanbul ignore next */ {};

  var audioContext = destination.context;

  Object.defineProperties(this, {
    context: {
      value: this,
      enumerable: true
    },
    audioContext: {
      value: audioContext,
      enumerable: true
    },
    destination: {
      value: destination,
      enumerable: true
    },
    sampleRate: {
      value: audioContext.sampleRate,
      enumerable: true
    },
    listener: {
      value: audioContext.listener,
      enumerable: true
    },
    analyser: {
      value: audioContext.createAnalyser(),
      enumerable: true
    },
  });

  this._transport = new neume.Transport(this, spec);
  this._nodes = [];
  this._audioBuses = [];

  this.$$neuDC = null;

  this.connect(this.analyser, this.destination);

  Object.defineProperties(this, {
    currentTime: {
      get: function() {
        return this._transport.currentTime;
      },
      enumerable: true
    },
    bpm: {
      get: function() {
        return this._transport.bpm;
      },
      set: function(value) {
        this._transport.bpm = value;
      },
      enumerable: true
    },
  });

  this.reset();
}
NeuContext.$$name = "NeuContext";

[
  "createBuffer",
  "decodeAudioData",
  "createPeriodicWave",
  "startRendering",
].forEach(function(methodName) {
  var method = neume.webaudio.AudioContext.prototype[methodName];

  NeuContext.prototype[methodName] = function() {
    return method.apply(this.audioContext, arguments);
  };
});

[
  "createBufferSource",
  "createMediaElementSource",
  "createMediaStreamSource",
  "createMediaStreamDestination",
  "createGain",
  "createDelay",
  "createBiquadFilter",
  "createWaveShaper",
  "createPanner",
  "createConvolver",
  "createDynamicsCompressor",
  "createAnalyser",
  "createScriptProcessor",
  "createOscillator",
  "createChannelSplitter",
  "createChannelMerger",
].forEach(function(methodName) {
  var method = neume.webaudio.AudioContext.prototype[methodName];

  NeuContext.prototype[methodName] = function() {
    var node = method.apply(this.audioContext, arguments);

    this._nodes.push(node);

    return node;
  };
});

NeuContext.prototype.getAudioBus = function(index) {
  index = Math.max(0, util.int(index));
  if (!this._audioBuses[index]) {
    this._audioBuses[index] = new neume.AudioBus(this, index);
  }
  return this._audioBuses[index];
};

NeuContext.prototype.start = function() {
  if (this._state === INIT) {
    this._state = START;
    this._transport.start();
    this.connect(this.getAudioBus(0).toAudioNode(), this.analyser);
  }
  return this;
};

NeuContext.prototype.stop = function() {
  if (this._state === START) {
    this.reset();
    this._transport.stop();
  }
  return this;
};

NeuContext.prototype.reset = function() {
  this.dispose();
  this._audioBuses = [];
  this._transport.reset();
  this._state = INIT;
  return this;
};

NeuContext.prototype.dispose = function() {
  if (this.$$neuDC) {
    var neuDC = this.$$neuDC;
    var t = this.currentTime;
    Object.keys(neuDC).forEach(function(value) {
      neuDC[value].stop(t);
    });
    this.$$neuDC = null;
  }
  this._nodes.splice(0).forEach(function(node) {
    node.disconnect();
  });
  return this;
};

NeuContext.prototype.sched = function(time, callback, context) {
  return this._transport.sched(time, callback, context);
};

NeuContext.prototype.unsched = function(id) {
  return this._transport.unsched(id);
};

NeuContext.prototype.nextTick = function(callback, context) {
  this._transport.nextTick(callback, context);
  return this;
};

NeuContext.prototype.toAudioNode = function(obj) {
  if (obj && obj.toAudioNode) {
    obj = obj.toAudioNode();
  } else if (typeof obj === "number") {
    obj = new neume.DC(this, obj).toAudioNode();
  }
  if (!(obj instanceof neume.webaudio.AudioNode)) {
    obj = null;
  }
  return obj;
};

NeuContext.prototype.toAudioBuffer = function(obj) {
  if (obj && obj.toAudioBuffer) {
    return obj.toAudioBuffer();
  }
  if (!(obj instanceof neume.webaudio.AudioBuffer)) {
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
    } else if (to instanceof neume.webaudio.AudioParam) {
      if (typeof from === "number") {
        to.value = util.finite(from);
      } else {
        from = this.toAudioNode(from);
        if (from) {
          from.connect(to);
        }
      }
    } else if (to instanceof neume.webaudio.AudioNode) {
      from = this.toAudioNode(from);
      if (from) {
        from.connect(to);
      }
    }
    if (to.onconnected) {
      to.onconnected(from);
    }
  }
  return this;
};

NeuContext.prototype.disconnect = function(node) {
  if (node) {
    if (typeof node.disconnect === "function") {
      node.disconnect();
    } else if (Array.isArray(node)) {
      node.forEach(function(node) {
        this.disconnect(node);
      }, this);
    }
  }
  return this;
};

NeuContext.prototype.toSeconds = function(value) {
  return this._transport.toSeconds(value);
};

module.exports = neume.Context = NeuContext;

},{"../namespace":21,"../util":54,"./transport":19}],16:[function(require,module,exports){
(function (global){
"use strict";

var neume = require("../namespace");

require("./shim");

var util = require("../util");

neume.webaudio = global;
neume.util = util;
neume._ = require("../util/underscore");
neume.DB = require("../util/db");
neume.Emitter = require("../util/emitter");
neume.FFT = require("../util/fft");
neume.KVS = require("../util/kvs");

require("./context");
require("../component");
require("../control");
require("../synth");

function NEU(context) {
  return Object.defineProperties({}, {
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
      value: context.destination,
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
      value: function(schedIter, callback) {
        return new neume.Sched(context, schedIter, callback);
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
}

neume.impl = function(destination, spec) {
  spec = spec || /* istanbulg ignore next */ {};

  if (destination instanceof neume.webaudio.AudioContext) {
    destination = destination.destination;
  } else if (typeof destination === "undefined") {
    destination = new neume.webaudio.AudioContext().destination;
  }
  if (!(destination instanceof neume.webaudio.AudioNode)) {
    throw new TypeError("neume(): Illegal arguments");
  }

  var context = new neume.Context(destination, spec);
  var autoPlayFunction = null;

  /* istanbul ignore next */
  if (global.navigator && /iPhone|iPad|iPod/.test(global.navigator.userAgent)) {
    if (context.audioContext.currentTime === 0) {
      autoPlayFunction = function() {
        var bufSrc = context.audioContext.createBufferSource();
        bufSrc.start(0);
        bufSrc.stop(0);
        bufSrc.connect(context.audioContext.destination);
        bufSrc.disconnect();
      };
    }
  }

  return Object.defineProperties(
    new NEU(context), {
      render: {
        value: function(duration, func) {
          var sampleRate = context.sampleRate;
          var length = util.int(sampleRate * duration);

          return new Promise(function(resolve) {
            var audioContext = new neume.webaudio.OfflineAudioContext(2, length, sampleRate);
            audioContext.oncomplete = function(e) {
              resolve(new neume.Buffer(context, e.renderedBuffer));
            };
            func(new NEU(new neume.Context(audioContext.destination, {
              duration: duration
            })));
            audioContext.startRendering();
          });
        }
      },
      start: {
        value: function() {
          /* istanbul ignore next */
          if (autoPlayFunction) {
            autoPlayFunction();
            autoPlayFunction = null;
          }
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
      master: {
        get: function() {
          return context.getAudioBus(0).toAudioNode();
        },
        enumerable: true
      },
      analyser: {
        value: context.analyser,
        enumerable: true
      }
    }
  );
};

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
},{"../component":4,"../const":8,"../control":11,"../namespace":21,"../synth":24,"../util":54,"../util/db":51,"../util/emitter":52,"../util/fft":53,"../util/kvs":55,"../util/underscore":56,"./context":15,"./shim":17}],17:[function(require,module,exports){
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
      global.WaveTable.$$name = "PeriodicWave";
    }
  }
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],18:[function(require,module,exports){
(function (global){
"use strict";

var neume = require("../namespace");

var NeuTimer;

/* istanbul ignore else */
if (typeof global.window === "undefined") {
  NeuTimer = (function() {
    function NodeNeuTimer(callback, interval) {
      this._callback = callback;
      this._interval = interval;
      this._timerId = 0;
    }
    NodeNeuTimer.$$name = "NeuTimer";

    NodeNeuTimer.prototype.start = function() {
      clearInterval(this._timerId);
      this._timerId = setInterval(this._callback, this._interval);
      return this;
    };

    NodeNeuTimer.prototype.stop = function() {
      this._timerId = clearInterval(this._timerId)|0;
      return this;
    };

    return NodeNeuTimer;
  })();
} else {
  NeuTimer = (function() {
    var timerJS = global.URL.createObjectURL(
      new global.Blob([
        "var t=0;onmessage=function(e){clearInterval(t);if(e.data)t=setInterval(function(){postMessage(0)},e.data)}"
      ], { type: "text/javascript" })
    );

    function WorkerNeuTimer(callback, interval) {
      this._callback = callback;
      this._interval = interval;
      this._worker = new global.Worker(timerJS);
      this._worker.onmessage = callback;
    }
    WorkerNeuTimer.$$name = "NeuTimer";

    WorkerNeuTimer.prototype.start = function() {
      this._worker.postMessage(this._interval);
      return this;
    };

    WorkerNeuTimer.prototype.stop = function() {
      this._worker.postMessage(0);
      return this;
    };

    return WorkerNeuTimer;
  })();
}


module.exports = neume.Timer = NeuTimer;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../namespace":21}],19:[function(require,module,exports){
"use strict";

var neume = require("../namespace");

require("./timer");

var C = require("../const");
var util = require("../util");

var INIT = 0, START = 1, STOP = 2;
var MAX_RENDERING_SEC = C.MAX_RENDERING_SEC;

var schedId = 1;

function NeuTransport(context, spec) {
  spec = spec || /* istanbul ignore next */ {};

  Object.defineProperties(this, {
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
  });

  this._bpm = 120;
  this._events = [];
  this._nextTicks = [];
  this._state = INIT;
  this._currentTime = 0;

  this._duration = util.defaults(spec.duration, Infinity);
  this._scheduleInterval = util.defaults(spec.scheduleInterval, 0.025);
  this._scheduleAheadTime = util.defaults(spec.scheduleAheadTime, 0.1);

  Object.defineProperties(this, {
    currentTime: {
      get: function() {
        return this._currentTime || this.audioContext.currentTime;
      },
      enumerable: true
    },
    bpm: {
      get: function() {
        return this._bpm;
      },
      set: function(value) {
        this._bpm = Math.max(1e-6, util.finite(value));
      },
      enumerable: true
    },
  });
}
NeuTransport.$$name = "NeuTransport";

NeuTransport.prototype.start = function() {
  if (this._state === INIT) {
    this._state = START;
    if (this.audioContext instanceof neume.webaudio.OfflineAudioContext) {
      startRendering.call(this);
    } else {
      startAudioTimer.call(this);
    }
  }
  return this;
};

NeuTransport.prototype.stop = function() {
  if (this._state === START) {
    this._state = STOP;
    this.reset();
  }
  return this;
};

NeuTransport.prototype.reset = function() {
  if (this._timer) {
    this._timer.stop();
    this._timer = null;
  }
  this._events = [];
  this._nextTicks = [];
  this._state = INIT;
  this._currentTime = 0;

  return this;
};

function startRendering() {
  var t0 = 0;
  var t1 = util.clip(util.finite(this._duration), 0, MAX_RENDERING_SEC);

  onaudioprocess(this, t0, t1);
}

function startAudioTimer() {
  var _this = this;
  var context = this.audioContext;
  var scheduleAheadTime = this._scheduleAheadTime;

  this._timer = new neume.Timer(function() {
    var t0 = context.currentTime;
    var t1 = t0 + scheduleAheadTime;

    onaudioprocess(_this, t0, t1);
  }, this._scheduleInterval * 1000).start();
}

NeuTransport.prototype.sched = function(time, callback, context) {
  if (typeof callback !== "function") {
    return 0;
  }

  time = util.finite(time);

  var events = this._events;
  var event = {
    id: schedId++,
    time: time,
    callback: callback,
    context: context || this
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

NeuTransport.prototype.unsched = function(id) {
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

NeuTransport.prototype.nextTick = function(callback, context) {
  this._nextTicks.push(callback.bind(context || this));
  return this;
};

NeuTransport.prototype.toSeconds = function(value) {
  if (typeof value === "number") {
    return util.finite(value);
  }

  if (value && typeof value.playbackTime === "number") {
    return util.finite(value.playbackTime);
  }

  if (typeof value === "string") {
    var m, offset = 0, time = 0;

    if (value.charAt(0) === "+") {
      offset = this.currentTime;
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

    } else if (value === "now") {
      return this.currentTime;
    } else if ((m = /^(\d+)ms$/.exec(value)) !== null) {
      time = +m[1] * 0.001;
    } else if ((m = /^(\d+(?:\.\d+)?)hz$/.exec(value)) !== null) {
      time = util.finite(1 / +m[1]);
    } else if ((m = /^(\d+)ticks$/.exec(value)) !== null) {
      time = ticks2sec(+m[1], this._bpm);
    } else if ((m = /^(\d+)(n[td]?)$/.exec(value)) !== null) {
      time = note2sec(+m[1], m[2], this._bpm);
    } else if ((m = /^(\d+)\.(\d+)\.(\d+)$/.exec(value)) !== null) {
      time = ticks2sec((+m[1] * 4 + (+m[2])) * 480 + (+m[3]), this._bpm);
    } else if ((m = /^(\d\d):(\d\d):(\d\d)(?:\.(\d+))?$/.exec(value)) !== null) {
      time = ((+m[1] * 3600) + (+m[2] * 60) + (+m[3]) + (((m[4] || "") + "000").substr(0, 3) * 0.001));
    } else if ((m = /^(\d+)samples$/.exec(value)) !== null) {
      time = (+m[1] / this.sampleRate);
    } else {
      time = util.finite(+value);
    }

    return time + offset;
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

function onaudioprocess(_this, t0, t1) {
  // Safari 7.0.6 does not support e.playbackTime
  var events = _this._events;

  _this._currentTime = t0;

  _this._nextTicks.splice(0).forEach(function(callback) {
    callback(t0);
  });

  while (events.length && events[0].time <= t1) {
    var event = events.shift();

    _this._currentTime = Math.max(_this._currentTime, event.time);

    event.callback.call(event.context, event.time);
  }

  _this._currentTime = t0;
}

module.exports = neume.Transport = NeuTransport;

},{"../const":8,"../namespace":21,"../util":54,"./timer":18}],20:[function(require,module,exports){
module.exports = require("./core/neume");

},{"./core/neume":16}],21:[function(require,module,exports){
"use strict";

function neume() {
  return neume.impl.apply(null, arguments);
}

neume.version = "0.9.0";

module.exports = neume;

},{}],22:[function(require,module,exports){
"use strict";

var neume = require("../namespace");

require("../core/context");

var util = require("../util");

function NeuSynthContext(context) {
  Object.defineProperties(this, {
    context: {
      value: this,
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
  });
  this._context = context;
  this._nodes = [];
}
util.inherits(NeuSynthContext, neume.Context);

NeuSynthContext.$$name = "NeuSynthContext";

NeuSynthContext.prototype.start = function() {
  this._context.start();
  return this;
};

NeuSynthContext.prototype.stop = function() {
  this._context.stop();
  return this;
};

NeuSynthContext.prototype.reset = function() {
  this._context.reset();
  return this;
};

NeuSynthContext.prototype.sched = function(time, callback, context) {
  return this._context.sched(time, callback, context);
};

NeuSynthContext.prototype.unsched = function(id) {
  return this._context.unsched(id);
};

NeuSynthContext.prototype.nextTick = function(callback, context) {
  this._context.nextTick(callback, context);
  return this;
};

NeuSynthContext.prototype.getAudioBus = function(index) {
  return this._context.getAudioBus(index);
};

NeuSynthContext.prototype.toSeconds = function(value) {
  return this._context.toSeconds(value);
};

module.exports = neume.SynthContext = NeuSynthContext;

},{"../core/context":15,"../namespace":21,"../util":54}],23:[function(require,module,exports){
"use strict";

var neume = require("../namespace");

require("../component/param");
require("./ugen");
require("./ugen-promise");

var util = require("../util");

function NeuSynthDollar(synth) {
  var db = new neume.DB();

  var atParam = createParamBuilder(synth);
  var promises = {};

  function builder() {
    var args = util.toArray(arguments);
    var key = args.shift();
    var spec = util.isPlainObject(args[0]) ? args.shift() : {};
    var inputs = args;
    var ugen, promise;

    if (typeof key === "string") {
      if (key.charAt(0) === "@") {
        key = key.substr(1);
        return atParam(key, spec, inputs);
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

    if (ugen.id) {
      promise = promises[ugen.id];
      if (promise) {
        promise.resolve(ugen);
      }
      promises[ugen.id] = null;
    }

    db.append(ugen);

    return ugen;
  }

  builder.timeout = function(value) {
    return {
      next: function() {
        return { value: value, done: true };
      }
    };
  };
  builder.interval = function(value) {
    return {
      next: function() {
        return { value: value, done: false };
      }
    };
  };
  builder.stop = function(stopTime) {
    synth.context.sched(synth.context.toSeconds(stopTime), function(t0) {
      synth.stop(t0);
    });
  };

  builder.inputs = [];

  this.db = db;
  this.builder = builder;
}

function createParamBuilder(synth) {
  var params = {};

  return function(name, spec, inputs) {
    if (params.hasOwnProperty(name)) {
      return params[name];
    }
    validateParam(name);

    var value = util.finite(util.defaults(spec.value, 0));
    var param = new neume.Param(synth.context, value, spec);

    Object.defineProperty(synth, name, {
      value: param, enumerable: true
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

function validateParam(name) {
  if (!/^[a-z]\w*$/.test(name)) {
    throw new TypeError(util.format(
      "invalid parameter name: #{name}", { name: name }
    ));
  }
}

module.exports = neume.SynthDollar = NeuSynthDollar;

},{"../component/param":6,"../namespace":21,"../util":54,"./ugen":28,"./ugen-promise":27}],24:[function(require,module,exports){
require("./dollar");
require("./synth");
require("./ugen");
require("./unit");

},{"./dollar":23,"./synth":26,"./ugen":28,"./unit":29}],25:[function(require,module,exports){
"use strict";

var reUGenName = /^([a-zA-Z](-?[a-zA-Z0-9]+)*!?\??~?|[-+*\/%<=>!?&|]+~?)/;

function isValidUGenName(name) {
  var exec = reUGenName.exec(name);
  return !!exec && exec[0] === name;
}

function parse(selector) {
  selector = String(selector);

  var parsed = { key: "", id: null, classes: [] };

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
        parsed.classes.push(match.substr(1));
      }
    });
  }

  return parsed;
}

module.exports = {
  isValidUGenName: isValidUGenName,
  parse: parse
};

},{}],26:[function(require,module,exports){
"use strict";

var neume = require("../namespace");

require("./dollar");
require("./context");

var util = require("../util");
var DB = require("../util/db");
var Emitter = require("../util/emitter");
var Parser = require("./parser");

var EMPTY_DB = new DB();
var INIT = 0, START = 1, STOP = 2;

function NeuSynth(context, func, args) {
  Emitter.call(this);

  context = new neume.SynthContext(context);

  Object.defineProperties(this, {
    context: {
      value: context,
      enumerable: true
    },
  });

  var $ = new neume.SynthDollar(this);

  this.builder = $.builder;

  this.__scheds = [];
  this.__nodes = [];

  var param = new neume.Param(context, 1, { curve: "lin" });
  var result = func.apply(this, [ $.builder ].concat(args));

  if (result && result.toAudioNode && !result.isOutput) {
    this._dispatchNode(result, 0);
  }

  this._nodes = this.__nodes.map(function(node) {
    var gain = context.createGain();

    context.connect(node, gain);
    context.connect(param, gain.gain);

    return gain;
  });
  this.__nodes = null;

  this._scheds = this.__scheds.map(function(set) {
    return new neume.Sched(context, set[0], set[1]);
  });
  this.__scheds = null;

  this._db = this._nodes.length ? $.db : /* istanbul ignore next */ EMPTY_DB;
  this._state = INIT;
  this._param = param;

  var methods = getMethods(this._db).filter(function(methodName) {
    return !this.hasOwnProperty(methodName);
  }, this).sort();

  methods.forEach(function(methodName) {
    Object.defineProperty(this, methodName, {
      value: function() {
        var args = util.toArray(arguments);
        this._db.all().forEach(function(ugen) {
          if (typeof ugen[methodName] === "function") {
            ugen[methodName].apply(ugen, args);
          }
        });
        return this;
      },
      enumerable: false
    });
  }, this);

  Object.defineProperties(this, {
    methods: {
      get: function() {
        return methods.slice();
      },
      enumerable: true
    }
  });
}
util.inherits(NeuSynth, Emitter);

NeuSynth.$$name = "NeuSynth";

NeuSynth.prototype.hasClass = function(className) {
  return this._db.all().some(function(ugen) {
    return ugen.hasClass(className);
  });
};

NeuSynth.prototype.query = function(selector) {
  var array = this._db.find(Parser.parse(selector));

  [
    "on", "once", "off", "hasClass", "trig"
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

NeuSynth.prototype.start = function(startTime) {
  if (this._state !== INIT) {
    return this;
  }

  var context = this.context;
  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  startTime = util.finite(startTime);

  this._state = START;

  context.sched(startTime, function(t0) {
    this._nodes.forEach(function(_, index) {
      context.getAudioBus(index).append(this);
    }, this);

    this._db.all().concat(this._scheds).forEach(function(item) {
      item.start(t0);
    });

    this.emit("start", {
      type: "start",
      playbackTime: startTime
    });
  }, this);

  context.start(); // auto start(?)

  return this;
};

NeuSynth.prototype.stop = function(stopTime) {
  if (this._state !== START) {
    return this;
  }

  var context = this.context;
  stopTime = util.defaults(context.toSeconds(stopTime), context.currentTime);
  stopTime = util.finite(stopTime);

  this._state = STOP;

  context.sched(stopTime, function(t0) {
    this._nodes.forEach(function(_, index) {
      context.getAudioBus(index).remove(this);
    });

    context.nextTick(function() {
      context.dispose();
    });

    this._db.all().concat(this._scheds).forEach(function(item) {
      item.stop(t0);
    });

    this.emit("stop", {
      type: "stop",
      playbackTime: t0
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

  var context = this.context;
  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  startTime = util.finite(startTime);

  if (this._nodes.length) {
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

  var context = this.context;

  startTime = util.defaults(context.toSeconds(startTime), context.currentTime);
  startTime = util.finite(startTime);

  duration = util.defaults(context.toSeconds(duration), 0.5);
  duration = util.finite(duration);

  if (this._nodes.length) {
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

  var context = this.context;

  if (this._nodes.length) {
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

NeuSynth.prototype.toAudioNode = function(index) {
  index = util.int(index);
  if (this._nodes[index]) {
    return this.context.toAudioNode(this._nodes[index]);
  }
  return null;
};

NeuSynth.prototype._dispatchNode = function(node, index) {
  if (this.__nodes) {
    index = Math.max(0, util.int(index));
    if (!this.__nodes[index]) {
      this.__nodes[index] = [];
    }
    this.__nodes[index].push(node);
  }
};

NeuSynth.prototype._dispatchSched = function(schedIter, callback) {
  if (this.__scheds && util.isIterator(schedIter) && typeof callback === "function") {
    this.__scheds.push([ schedIter, callback ]);
  }
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

},{"../namespace":21,"../util":54,"../util/db":51,"../util/emitter":52,"./context":22,"./dollar":23,"./parser":25}],27:[function(require,module,exports){
"use strict";

var neume = require("../namespace");

require("./ugen");

var util = require("../util");

function NeuUGenPromise(synth, id) {
  Object.defineProperties(this, {
    context: {
      value: synth.context,
      enumerable: true
    },
    synth: {
      value: synth,
      enumerable: true
    },
    key: {
      value: "",
      enumerable: true
    },
    id: {
      value: id,
      enumerable: true
    },
  });

  this._classes = {};
  this._outlet = null;
  this._resolved = false;
  this._to = [];
  this._from = [];
}
util.inherits(NeuUGenPromise, neume.UGen);

NeuUGenPromise.$$name = "NeuUGenPromise";

NeuUGenPromise.prototype.resolve = function(ugen) {

  this._to.forEach(function(node) {
    this.context.connect(ugen, node);
  }, this);
  this._from.forEach(function(node) {
    this.context.connect(node, ugen);
  }, this);

  this._to = this._from = null;

  return this;
};

NeuUGenPromise.prototype.connect = function(to) {
  this._to.push(to);
  return this;
};

NeuUGenPromise.prototype.onconnected = function(from) {
  this._from.push(from);
};

module.exports = neume.UGenPromise = NeuUGenPromise;

},{"../namespace":21,"../util":54,"./ugen":28}],28:[function(require,module,exports){
"use strict";

var neume = require("../namespace");

var util = require("../util");
var Emitter = require("../util/emitter");
var Parser = require("./parser");

function NeuUGen(synth, key, spec, inputs) {
  Emitter.call(this);

  var parsed = Parser.parse(key);

  if (!NeuUGen.registered.hasOwnProperty(parsed.key)) {
    throw new Error("unknown key: " + key);
  }

  var listOfClass = parsed.classes;
  var classes = {};

  if (typeof spec.class === "string" && spec.class.trim()) {
    listOfClass = listOfClass.concat(spec.class.split(/\s+/));
  }

  listOfClass.forEach(function(className) {
    classes[className] = true;
  });

  Object.defineProperties(this, {
    context: {
      value: synth.context,
      enumerable: true
    },
    synth: {
      value: synth,
      enumerable: true
    },
    key: {
      value: parsed.key,
      enumerable: true
    },
    id: {
      value: util.defaults(spec.id, parsed.id),
      enumerable: true
    },
    class: {
      value: Object.keys(classes).sort().join(" "),
      enumerable: true
    },
  });

  this._classes = classes;

  if (this.hasClass("mute")) {
    this._unit = new neume.Unit({});
    this._node = this.context.createGain();
  } else if (this.hasClass("bypass")) {
    this._unit = NeuUGen.registered["+"](this, {}, inputs);
    this._node = this._unit.outlet;
  } else {
    this._unit = NeuUGen.registered[parsed.key](this, spec, inputs);
    this._node = this._unit.outlet;
    this._node = mul(this.context, this._node, util.defaults(spec.mul, 1));
    this._node = add(this.context, this._node, util.defaults(spec.add, 0));
  }

  this.isOutput = !!this._unit.isOutput;
  this.methods = Object.keys(this._unit.methods).sort();

  this.methods.forEach(function(methodName) {
    var method = this._unit.methods[methodName];
    util.definePropertyIfNotExists(this, methodName, {
      value: function() {
        var context = this.context;
        var args = util.toArray(arguments);
        context.sched(context.toSeconds(args[0]), function() {
          method.apply(null, args);
        });
        return this;
      }
    });
  }, this);

  this._outlet = null;
  this._scheds = [];
}
util.inherits(NeuUGen, Emitter);

NeuUGen.$$name = "NeuUGen";

NeuUGen.registered = {};

NeuUGen.register = function(name, func) {
  if (!Parser.isValidUGenName(name)) {
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

NeuUGen.prototype.hasClass = function(className) {
  return !!this._classes[className];
};

NeuUGen.prototype.$ = function() {
  var args = util.toArray(arguments);
  var key = args.shift();
  var spec = util.isPlainObject(args[0]) ? args.shift() : {};
  var inputs = Array.prototype.concat.apply([ this ], args);

  return this.synth.builder(key, spec, inputs);
};

NeuUGen.prototype.mul = function(value) {
  return this.synth.builder("*", this, util.defaults(value, 1));
};

NeuUGen.prototype.add = function(value) {
  return this.synth.builder("+", this, util.defaults(value, 0));
};

NeuUGen.prototype.start = function(startTime) {
  if (!this.hasClass("trig")) {
    this._unit.start(startTime);
  }
  return this;
};

NeuUGen.prototype.stop = function(startTime) {
  this._unit.stop(startTime);
  return this;
};

NeuUGen.prototype.patch = function(patcher) {
  var args = util.toArray(arguments).slice(1);
  var $ = this.synth.builder;

  if (typeof patcher === "function") {
    var builder = function() {
      return $.apply(null, arguments);
    };
    builder.timeout = $.timeout;
    builder.interval = $.interval;
    builder.stop = $.stop;
    builder.inputs = [ this ];

    return patcher.apply(this.synth, [ builder ].concat(args));
  }

  return $("+", this);
};

NeuUGen.prototype.trig = function(startTime) {
  var context = this.context;

  startTime = util.finite(context.toSeconds(startTime));

  context.sched(startTime, function() {
    this._unit.start(startTime);
  }, this);

  return this;
};

NeuUGen.prototype.sched = function(schedIter, callback) {
  var _this = this;

  this.synth._dispatchSched(schedIter, function(e) {
    if (e.type === "start" || (e.type === "stop" && !e.done)) {
      return;
    }
    e = Object.create(e);
    e.synth = _this.synth;
    callback.call(_this, e);
  });

  return this;
};

NeuUGen.prototype.toAudioNode = function() {
  if (this._outlet === null) {
    this._outlet = this.context.toAudioNode(this._node);
  }
  return this._outlet;
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

module.exports = neume.UGen = NeuUGen;

},{"../namespace":21,"../util":54,"../util/emitter":52,"./parser":25}],29:[function(require,module,exports){
"use strict";

var neume = require("../namespace");

var util = require("../util");
var INIT = 0, START = 1, STOP = 2;

function NeuUnit(spec) {
  this.outlet = util.defaults(spec.outlet, null);
  this.methods = util.defaults(spec.methods, {});
  this.isOutput = !!spec.isOutput;

  this._spec = spec;
  this._state = INIT;
}
NeuUnit.$$name = "NeuUnit";

NeuUnit.prototype.start = function(t) {
  if (this._state === INIT && typeof this._spec.start === "function") {
    this._state = START;
    this._spec.start(util.finite(t));
  }
};

NeuUnit.prototype.stop = function(t) {
  if (this._state === START && typeof this._spec.stop === "function") {
    this._state = STOP;
    this._spec.stop(util.finite(t));
  }
};

module.exports = neume.Unit = NeuUnit;

},{"../namespace":21,"../util":54}],30:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /**
   * $("+", {
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   */
  neume.register("+", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  neume.register("array", function(ugen, spec, inputs) {
    inputs = util.toArray(spec.value).concat(inputs);
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    return new neume.Unit({
      outlet: new neume.Sum(ugen.context, inputs)
    });
  }

};

},{}],31:[function(require,module,exports){
module.exports = function(neume) {
  "use strict";

  /**
   * $(AudioNode, {
   *   [attributes],
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   *  +-----------+
   *  | AudioNode |
   *  +-----------+
   *    |
   */

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
    var context = ugen.context;
    var outlet = spec.value;

    var gain = null;

    Object.keys(spec).forEach(function(name) {
      if (typeof outlet[name] !== "undefined") {
        if (outlet[name] instanceof neume.webaudio.AudioParam) {
          context.connect(spec[name], outlet[name]);
        } else {
          outlet[name] = spec[name];
        }
      }
    });
    if (inputs.length) {
      if (outlet.numberOfInputs) {
        context.connect(inputs, outlet);
      } else {
        gain = context.createGain();

        gain.gain.value = 0;

        context.connect(inputs, gain);
        context.connect(outlet, gain.gain);

        outlet = gain;
      }
    }

    return new neume.Unit({
      outlet: outlet
    });
  }

};

},{}],32:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /**
   * $("biquad", {
   *   type: string = "lowpass",
   *   frequency: signal = 350,
   *   detune: signal = 0,
   *   Q: signal = 1,
   *   gain: signal = 0,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * aliases:
   *   $("lowpass"), $("highpass"), $("bandpass"),
   *   $("lowshelf"), $("highshelf"), $("peaking"), $("notch"), $("allpass")
   *   $("lpf"), $("hpf"), $("bpf")
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   * +------------------------+
   * | BiquadFilterNode       |
   * | - type: type           |
   * | - frequency: frequency |
   * | - detune: detune       |
   * | - Q: Q                 |
   * | - gain: gain           |
   * +------------------------+
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
    var context = ugen.context;
    var outlet = context.createBiquadFilter();

    outlet.type = type;
    outlet.frequency.value = 0;
    outlet.detune.value = 0;
    outlet.Q.value = 0;
    outlet.gain.value = 0;

    var frequency = util.defaults(spec.freq, spec.frequency, 350);
    var detune = util.defaults(spec.dt, spec.detune, 0);
    var q = util.defaults(spec.q, spec.Q, 1);
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

},{}],33:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /**
   * $("buf", {
   *   buffer: AudioBuffer|neume.Buffer = null,
   *   playbackRate: signal = 1,
   *   loop: boolean = false,
   *   loopStart: number = 0,
   *   loopEnd: number = 0,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs:signal)
   *
   * aliases:
   *   $(AudioBuffer), $(neume.Buffer)
   *
   * no inputs
   * +------------------------------+
   * | BufferSourceNode             |
   * | - buffer: buffer             |
   * | - playbackRate: playbackRate |
   * | - loop: loop                 |
   * | - loopStart: loopStart       |
   * | - loopEnd: loopEnd           |
   * +------------------------------+
   *   |
   *
   * has inputs
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   *   |             +------------------------------+
   *   |             | BufferSourceNode             |
   *   |             | - buffer: buffer             |
   *   |             | - playbackRate: playbackRate |
   * +-----------+   | - loop: loop                 |
   * | GainNode  |   | - loopStart: loopStart       |
   * | - gain: 0 <---| - loopEnd: loopEnd           |
   * +-----------+   +------------------------------+
   *   |
   */
  neume.register("buf", function(ugen, spec, inputs) {
    return make(util.defaults(spec.buf, spec.buffer), ugen, spec, inputs);
  });

  neume.register("AudioBuffer", function(ugen, spec, inputs) {
    return make(spec.value, ugen, spec, inputs);
  });

  neume.register("NeuBuffer", function(ugen, spec, inputs) {
    return make(spec.value, ugen, spec, inputs);
  });

  function make(buffer, ugen, spec, inputs) {
    var context = ugen.context;
    var outlet = null;

    var bufSrc = context.createBufferSource();
    var gain = null;
    var duration = 0;

    buffer = context.toAudioBuffer(buffer);

    /* istanbul ignore else */
    if (buffer != null) {
      bufSrc.buffer = buffer;
      duration = buffer.duration;
    }

    var loop = !!util.defaults(spec.loop, false);
    var loopStart = util.finite(util.defaults(spec.start, spec.loopStart, 0));
    var loopEnd = util.finite(util.defaults(spec.end, spec.loopEnd, 0));
    var playbackRate = util.defaults(spec.rate, spec.playbackRate, 1);

    bufSrc.loop = loop;
    bufSrc.loopStart = loopStart;
    bufSrc.loopEnd = loopEnd;
    bufSrc.playbackRate.value = 0;
    context.connect(playbackRate, bufSrc.playbackRate);

    if (inputs.length) {
      gain = context.createGain();

      gain.gain.value = 0;

      context.connect(inputs, gain);
      context.connect(bufSrc, gain.gain);

      outlet = gain;
    } else {
      outlet = bufSrc;
    }

    function start(t) {
      bufSrc.start(t);
      bufSrc.onended = function() {
        ugen.emit("end", {
          type: "end",
          synth: ugen.synth,
          playbackTime: t + duration
        });
      };
    }

    function stop(t) {
      bufSrc.onended = null;
      bufSrc.stop(t);
    }

    return new neume.Unit({
      outlet: outlet,
      start: start,
      stop: stop
    });
  }

};

},{}],34:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /**
   * $("comp", {
   *   threshold: signal = -24,
   *   knee: signal = 30,
   *   ratio: signal = 12,
   *   attack: signal = 0.003,
   *   release: signal = 0.250,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   * +------------------------+
   * | DynamicsCompressorNode |
   * | - threshold: threshold |
   * | - knee: knee           |
   * | - ratio: ratio         |
   * | - attack: attack       |
   * | - release: release     |
   * +------------------------+
   *   |
   */
  neume.register("comp", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.context;
    var outlet = context.createDynamicsCompressor();

    outlet.threshold.value = 0;
    outlet.knee.value = 0;
    outlet.ratio.value = 0;
    outlet.attack.value = 0;
    outlet.release.value = 0;

    var threshold = util.defaults(spec.thresh, spec.threshold, -24);
    var knee = util.defaults(spec.knee, 30);
    var ratio = util.defaults(spec.ratio, 12);
    var attack = util.defaults(spec.a, spec.attack, spec.attackTime, 0.003);
    var release = util.defaults(spec.r, spec.release, spec.releaseTime, 0.250);

    attack = context.toSeconds(attack);
    release = context.toSeconds(release);

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

},{}],35:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /**
   * $("conv", {
   *   buffer: AudioBuffer|neume.Buffer = null,
   *   normalize: boolean = true,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   * +------------------------+
   * | ConvolverNode          |
   * | - buffer: buffer       |
   * | - normalize: normalize |
   * +------------------------+
   *   |
   */
  neume.register("conv", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.context;
    var outlet = context.createConvolver();

    var buffer = util.defaults(spec.buf, spec.buffer);

    buffer = context.toAudioBuffer(buffer);

    if (buffer != null) {
      outlet.buffer = buffer;
    }
    outlet.normalize = !!util.defaults(spec.norm, spec.normalize, true);

    context.connect(inputs, outlet);

    return new neume.Unit({
      outlet: outlet
    });
  }

};

},{}],36:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  var WEB_AUDIO_MAX_DELAY_TIME = neume.MAX_DELAY_SEC;

  /**
   * $("delay", {
   *   delayTime: signal = 0,
   *   feedback: signal = 0,
   *   maxDelayTime: number = 0,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   *   |                    +-----+
   *   |                    |     |
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
    var context = ugen.context;

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

},{}],37:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  var WS_CURVE_SIZE = neume.WS_CURVE_SIZE;
  var KVSKEY = "@neume:drywet:";

  /*
   * $("drywet", {
   *   mix: signal = 0,
   *   patch: function = null,
   *   args: any[] = [],
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * +-----------+     +-----------+  +-----+
   * | inputs[0] | ... | inputs[N] |  | mix |
   * +-----------+     +-----------+  +-----+
   *   |                 |               |
   *   +-----------------+               |
   *   |                                 |
   *   |    +----------------------------+
   *   |    |                            |
   *   |  +-------------------+  +-------------------+
   *   |  | WaveShaperNode    |  | WaveShaperNode    |
   *   |  | - curve: dryCurve |  | - curve: wetCurve |
   *   |  +-------------------+  +-------------------+
   *   |           |                 |
   *   +------------------+          |
   *   |           |      |          |
   *   |           |   +-----+       |
   *   |           |   | efx |       |
   *   |           |   +-----+       |
   *   |           |      |          |
   * +----------+  |   +----------+  |
   * | GainNode |  |   | GainNode |  |
   * | - gain: <---+   | - gain: <---+
   * +----------+      +----------+
   *   |                 |
   *   +-----------------+
   *   |
   */
  neume.register("drywet", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.context;

    var mix = util.defaults(spec.mix, 0);
    var efx = util.defaults(spec.patch, spec.efx, spec.wet, null);
    var args = util.defaults(spec.args, []);
    var dry = inputs;
    var wet = null;

    if (typeof efx === "function") {
      var $ = ugen.synth.builder;
      var builder = function() {
        return $.apply(null, arguments);
      };
      builder.timeout = $.timeout;
      builder.interval = $.interval;
      builder.stop = $.stop;
      builder.inputs = inputs;

      wet = efx.apply(ugen.synth, [ builder ].concat(args));
    }

    var outlet;

    if (wet == null || typeof mix === "number") {
      outlet = makeWithNumber(context, dry, wet, mix);
    } else {
      outlet = makeWithNode(context, dry, wet, mix);
    }

    return new neume.Unit({
      outlet: outlet
    });
  }

  function makeWithNumber(context, dry, wet, mix) {
    mix = util.clip(util.finite(mix), -1, +1);

    if (mix === -1 || wet == null) {
      return new neume.Sum(context, dry);
    }
    if (mix === +1) {
      return new neume.Sum(context, wet);
    }

    mix = (mix + 1) * 0.25 * Math.PI;

    var dryGain = context.createGain();
    var wetGain = context.createGain();

    dryGain.gain.value = Math.cos(mix);
    wetGain.gain.value = Math.sin(mix);

    context.connect(dry, dryGain);
    context.connect(wet, wetGain);

    return new neume.Sum(context, [ dryGain, wetGain ]);
  }

  function makeWithNode(context, dry, wet, mix) {
    var dryGain = context.createGain();
    var wetGain = context.createGain();
    var dryWS = context.createWaveShaper();
    var wetWS = context.createWaveShaper();
    var curve = neume.KVS.get(KVSKEY + "curve");

    dryWS.curve = curve.dry;
    wetWS.curve = curve.wet;

    dryGain.gain.value = 0;
    wetGain.gain.value = 0;

    context.connect(mix, dryWS);
    context.connect(mix, wetWS);
    context.connect(dryWS, dryGain.gain);
    context.connect(wetWS, wetGain.gain);
    context.connect(dry, dryGain);
    context.connect(wet, wetGain);

    return new neume.Sum(context, [ dryGain, wetGain ]);
  }

  neume.KVS.set(KVSKEY + "curve", function() {
    var curveDry = new Float32Array(WS_CURVE_SIZE);
    var curveWet = new Float32Array(WS_CURVE_SIZE);

    for (var i = 0; i < WS_CURVE_SIZE; i++) {
      curveDry[i] = Math.cos((i / WS_CURVE_SIZE) * Math.PI * 0.5);
      curveWet[i] = Math.sin((i / WS_CURVE_SIZE) * Math.PI * 0.5);
    }

    return { dry: curveDry, wet: curveWet };
  });
};

},{}],38:[function(require,module,exports){
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
    var context = ugen.context;

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

    function release(t) {
      if (isStopped || releaseSchedId || env.releaseNode === -1) {
        return;
      }

      t = util.finite(context.toSeconds(t));

      releaseSchedId = context.sched(t, function(t0) {
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
          ugen.emit("end", {
            type: "end",
            synth: ugen.synth,
            playbackTime: t
          });
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

},{}],39:[function(require,module,exports){
module.exports = function(neume) {
  "use strict";

  neume.use(require("./add"));
  neume.use(require("./audio-node"));
  neume.use(require("./biquad"));
  neume.use(require("./buf"));
  neume.use(require("./comp"));
  neume.use(require("./conv"));
  neume.use(require("./delay"));
  neume.use(require("./drywet"));
  neume.use(require("./env"));
  neume.use(require("./inout"));
  neume.use(require("./iter"));
  neume.use(require("./lfpulse"));
  neume.use(require("./line"));
  neume.use(require("./mono"));
  neume.use(require("./mul"));
  neume.use(require("./noise"));
  neume.use(require("./object"));
  neume.use(require("./osc"));
  neume.use(require("./pan2"));
  neume.use(require("./shaper"));

};

},{"./add":30,"./audio-node":31,"./biquad":32,"./buf":33,"./comp":34,"./conv":35,"./delay":36,"./drywet":37,"./env":38,"./inout":40,"./iter":41,"./lfpulse":42,"./line":43,"./mono":44,"./mul":45,"./noise":46,"./object":47,"./osc":48,"./pan2":49,"./shaper":50}],40:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /**
   * $("in", {
   *   bus: number = 0,
   *   mul: signal = 1,
   *   add: signal = 0,
   * })
   *
   *  +---------------+
   *  | AudioBus[bus] |
   *  +---------------+
   *   |
   */
  neume.register("in", function(ugen, spec) {
    var context = ugen.context;
    var index = Math.max(0, util.int(spec.bus));

    return new neume.Unit({
      outlet: context.getAudioBus(index)
    });
  });

  /**
   * $("out", {
   *   bus: number = 0,
   * }, ...inputs: signal)
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   * +---------------+
   * | AudioBus[bus] |
   * +---------------+
   */
  neume.register("out", function(ugen, spec, inputs) {
    var context = ugen.context;
    var outlet = new neume.Sum(context, inputs);
    var index = Math.max(0, util.int(spec.bus));

    ugen.synth._dispatchNode(outlet, index);

    return new neume.Unit({
      outlet: outlet,
      isOutput: true
    });
  });
};

},{}],41:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  var ITERATE = 0;
  var FINISHED = 1;

  /**
   * $("iter", {
   *   iter: iterator = null,
   *   curve: string|number = "step",
   *   lag: timevalue = 0,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * methods:
   *   next(startTime: timevalue)
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   * +----------+
   * | GainNode |
   * | - gain: <--- iterator value
   * +----------+
   *   |
   */
  neume.register("iter", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.context;

    var iter = util.defaults(spec.iter, null);
    var state = ITERATE;
    var param = new neume.Param(context, 0, spec);
    var outlet = inputs.length ? param.toAudioNode(inputs) : param;

    function start(t) {
      var items = iterNext();
      if (items.done) {
        state = FINISHED;
        ugen.emit("end", {
          type: "end",
          synth: ugen.synth,
          playbackTime: t
        });
      } else {
        param.setValueAtTime(util.finite(items.value), t);
      }
    }

    function next(t) {
      if (state !== ITERATE) {
        return;
      }

      t = util.finite(context.toSeconds(t));

      var items = iterNext();

      if (items.done) {
        state = FINISHED;
        ugen.emit("end", {
          type: "end",
          synth: ugen.synth,
          playbackTime: t
        });
      } else {
        param.update(util.finite(items.value), t);
      }
    }

    function iterNext() {
      return util.isIterator(iter) ? iter.next() : { done: true };
    }

    return new neume.Unit({
      outlet: outlet,
      start: start,
      methods: {
        next: next
      }
    });
  }

};

},{}],42:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  var KVSKEY = "@neume:lfpulse:";

  /**
   * $("lfpulse", {
   *   frequency: signal = 440,
   *   detune: signal = 0,
   *   width: signal = 0.5,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs:signal)
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
    var context = ugen.context;
    var outlet = null;

    var defaultFreq = inputs.length ? 2 : 440;
    var pulse = createPulseOscillator(context, spec, defaultFreq);
    var gain = null;

    if (inputs.length) {
      gain = context.createGain();

      gain.gain.value = 0;

      context.connect(inputs, gain);
      context.connect(pulse.outlet, gain.gain);

      outlet = gain;
    } else {
      outlet = pulse.outlet;
    }

    return new neume.Unit({
      outlet: outlet,
      start: function(t) {
        pulse.ctrl.start(t);
      },
      stop: function(t) {
        pulse.ctrl.stop(t);
      }
    });
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

    var frequency = util.defaults(spec.freq, spec.frequency, defaultFreq);
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

},{}],43:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /*
   * $("line", {
   *   start: number = 1,
   *   end: number = 0,
   *   duration: timevlaue = 1,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * $("xline", {
   *   start: number = 1,
   *   end: number = 0,
   *   duration: timevalue = 1,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   * +----------+
   * | GainNode |
   * | - gain: <--- line value
   * +----------+
   *   |
   */
  neume.register("line", function(ugen, spec, inputs) {
    var startValue = util.finite(util.defaults(spec.start, spec.startValue, spec.from, 1));
    var endValue = util.finite(util.defaults(spec.end, spec.endValue, spec.to, 0));
    var duration = util.finite(ugen.context.toSeconds(util.defaults(spec.dur, spec.duration, 1)));
    return make("linTo", ugen, startValue, endValue, duration, inputs);
  });

  neume.register("xline", function(ugen, spec, inputs) {
    var startValue = Math.max(1e-6, util.finite(util.defaults(spec.start, spec.startValue, spec.from, 1)));
    var endValue = Math.max(1e-6, util.finite(util.defaults(spec.end, spec.endValue, spec.to, 0)));
    var duration = util.finite(ugen.context.toSeconds(util.defaults(spec.dur, spec.duration, 1)));
    return make("expTo", ugen, startValue, endValue, duration, inputs);
  });

  function make(curve, ugen, startValue, endValue, duration, inputs) {
    var context = ugen.context;

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
        ugen.emit("end", {
          type: "end",
          synth: ugen.synth,
          playbackTime: t
        });
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

},{}],44:[function(require,module,exports){
module.exports = function(neume) {
  "use strict";

  /**
   * $("mono", {
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
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
    var context = ugen.context;
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

},{}],45:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /**
   * $("*", {
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * +-----------+
   * | inputs[0] |
   * +-----------+
   *   |
   * +-----------+
   * | GainNode  |  +-----------+
   * | - gain: 0 <--| inputs[N] |
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
    var context = ugen.context;

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

},{}],46:[function(require,module,exports){
module.exports = function(neume) {
  "use strict";

  var NOISE_DURATION = 4;
  var KVSKEY = "@neume:noise:";

  /**
   * $("noise", {
   *   type: string = "white",
   *   mul: signal = 1,
   *   add: signal = 0,
   * })
   *
   * aliases:
   * $("white"), $("pink"), $("brown")
   *
   * no inputs
   * +------------------+
   * | BufferSourceNode |
   * | - loop: true     |
   * +------------------+
   *   |
   *
   * has inputs
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   * +-----------+   +------------------+
   * | GainNode  |   | BufferSourceNode |
   * | - gain: 0 <---| - loop: true     |
   * +-----------+   +------------------+
   *   |
   */
  neume.register("noise", function(ugen, spec, inputs) {
    var type = {
      pink: "pink",
      brown: "brown"
    }[spec.type] || "white";
    return make(type, ugen, inputs);
  });

  [
    "white", "pink", "brown"
  ].forEach(function(type) {
    neume.register(type, function(ugen, spec, inputs) {
      return make(type, ugen, inputs);
    });
  });

  function make(type, ugen, inputs) {
    var context = ugen.context;
    var outlet = null;

    var bufSrc = context.createBufferSource();
    var gain = null;

    bufSrc.buffer = neume.KVS.get(KVSKEY + type, context, NOISE_DURATION);
    bufSrc.loop = true;

    if (inputs.length) {
      gain = context.createGain();

      gain.gain.value = 0;

      context.connect(inputs, gain);
      context.connect(bufSrc, gain.gain);

      outlet = gain;
    } else {
      outlet = bufSrc;
    }

    return new neume.Unit({
      outlet: outlet,
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

},{}],47:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /**
  * $(object, {
  *   key: string|number = "",
  *   curve: string|number = "step",
  *   lag: timevalue = 0,
  *   mul: signal = 1,
  *   add: signal = 0,
  * }, ...inputs: signal)
  *
  * $(Float32Array, {
  *   key: number = 0,
  *   curve: string|number = "step",
  *   lag: timevalue = 0,
  *   mul: signal = 1,
  *   add: signal = 0,
  * }, ...inputs: signal)
  *
  * +-----------+     +-----------+
  * | inputs[0] | ... | inputs[N] |
  * +-----------+     +-----------+
  *   |                 |
  *   +-----------------+
  *   |
  * +----------+
  * | GainNode |
  * | - gain: <--- value
  * +----------+
  *   |
  */
  neume.register("object", make);
  neume.register("Float32Array", make);

  function make(ugen, spec, inputs) {
    var context = ugen.context;

    var data = util.defaults(spec.value, 0);
    var key = util.defaults(spec.i, spec.index, spec.key, "");
    var interval = util.defaults(spec.poll, spec.pollTime, spec.interval, 0.250);
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

},{}],48:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  /**
   * $("osc", {
   *   type: string|PeriodicWave = "sin",
   *   frequency: signal = 440,
   *   detune: signal = 0,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * aliases:
   *   $("sin"), $("square"), $("saw"), $("tri"), $(PeriodicWave)
   *
   * no inputs
   * +------------------------+
   * | OscillatorNode         |
   * | - type: type           |
   * | - frequency: frequency |
   * | - detune: detune       |
   * +------------------------+
   *   |
   *
   * has inputs
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   *   |             +------------------------+
   *   |             | OscillatorNode         |
   * +-----------+   | - type: type           |
   * | GainNode  |   | - frequency: frequency |
   * | - gain: 0 <---| - detune: detune       |
   * +-----------+   +------------------------+
   *   |
   */

  var WAVE_TYPES = {
    sin: "sine",
    square: "square",
    saw: "sawtooth",
    tri: "triangle"
  };

  neume.register("osc", function(ugen, spec, inputs) {
    var type = spec.type;

    if (!isPeriodicWave(type)) {
      type = WAVE_TYPES[type] || "sine";
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
      return make(type, ugen, spec, inputs);
    });
  });

  function make(wave, ugen, spec, inputs) {
    var context = ugen.context;
    var outlet = null;

    var osc = context.createOscillator();
    var gain = null;

    var defaultFreq = inputs.length ? 2 : 440;
    var frequency = util.defaults(spec.freq, spec.frequency, defaultFreq);
    var detune = util.defaults(spec.dt, spec.detune, 0);

    if (isPeriodicWave(wave)) {
      osc.setPeriodicWave(wave);
    } else {
      osc.type = wave;
    }

    osc.frequency.value = 0;
    osc.detune.value = 0;

    context.connect(frequency, osc.frequency);
    context.connect(detune, osc.detune);

    if (inputs.length) {
      gain = context.createGain();

      gain.gain.value = 0;

      context.connect(inputs, gain);
      context.connect(osc, gain.gain);

      outlet = gain;
    } else {
      outlet = osc;
    }

    return new neume.Unit({
      outlet: outlet,
      start: function(t) {
        osc.start(t);
      },
      stop: function(t) {
        osc.stop(t);
      }
    });
  }

  function isPeriodicWave(wave) {
    return wave instanceof neume.webaudio.PeriodicWave;
  }

};

},{}],49:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  var WS_CURVE_SIZE = neume.WS_CURVE_SIZE;
  var KVSKEY = "@neume:pan2:";

  /**
   * $("pan2", {
   *   pos: signal = 0,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * +-----------+     +-----------+     +-----+
   * | inputs[0] | ... | inputs[N] |     | pos |
   * +-----------+     +-----------+     +-----+
   *   |                 |                  |
   *   +-----------------+   +--------------+------+
   *   |                     |                     |
   *   |     +-----------------+   +-----------------+
   *   |     | WaveShaperNode  |   | WaveShaperNode  |
   *   |     | - curve: curveL |   | - curve: curveR |
   *   |     +-----------------+   +-----------------+
   *   |             |                   |
   *   +-------------|------+            |
   *   |             |      |            |
   * +-----------+   |   +-----------+   |
   * | GainNode  |   |   | GainNode  |   |
   * | - gain: 0 <---+   | - gain: 0 <---+
   * +-----------+       +-----------+
   *   |                   |
   * +-----------------------+
   * | ChannelMergerNode     |
   * +-----------------------+
   *   |
   */
  neume.register("pan2", function(ugen, spec, inputs) {
    return make(ugen, spec, inputs);
  });

  function make(ugen, spec, inputs) {
    var context = ugen.context;

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

},{}],50:[function(require,module,exports){
module.exports = function(neume, util) {
  "use strict";

  var WS_CURVE_SIZE = neume.WS_CURVE_SIZE;
  var KVSKEY = "@neume:shaper:";

  /**
   * $("shaper", {
   *   curve: Float32Array|number = 0,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs: signal)
   *
   * aliases:
   *   $("clip")
   *
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
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
    var context = ugen.context;
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

},{}],51:[function(require,module,exports){
"use strict";

function DB() {
  this._all = [];
  this._ids = {};
}

DB.prototype.append = function(obj) {
  this._all.push(obj);
  if (obj.id) {
    this._ids[obj.id] = obj;
  }
  return this;
};

DB.prototype.all = function() {
  return this._all;
};

DB.prototype.find = function(parsed) {
  var result = null;

  if (parsed.id) {
    result = this._ids[parsed.id] ? [ this._ids[parsed.id] ] : [];
  } else {
    result = this._all;
  }

  if (parsed.classes) {
    parsed.classes.forEach(function(className) {
      result = result.filter(function(obj) {
        return obj.hasClass && obj.hasClass(className);
      });
    });
  }

  if (parsed.key) {
    result = result.filter(function(obj) {
      return obj.key === parsed.key;
    });
  }

  return result;
};

module.exports = DB;

},{}],52:[function(require,module,exports){
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
  if (typeof listener === "function") {
    if (!this.hasListeners(event)) {
      this._callbacks[event] = [];
    }

    this._callbacks[event].push(listener);
  }

  return this;
};

Emitter.prototype.once = function(event, listener) {
  if (typeof listener === "function") {
    var fn = function(payload) {
      this.off(event, fn);
      listener.call(this, payload);
    };

    fn.listener = listener;

    this.on(event, fn);
  }

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

},{}],53:[function(require,module,exports){
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

},{"../util":54}],54:[function(require,module,exports){
"use strict";

var util = {};

util.isPlainObject = function(value) {
  return value != null && value.constructor === Object;
};

util.isFinite = function(value) {
  return typeof value === "number" && isFinite(value);
};

util.isIterator = function(value) {
  return !!value && typeof value.next === "function";
};

util.toArray = function(value) {
  if (value == null) {
    return [];
  }
  return Array.prototype.slice.call(value);
};

util.flatten = function(list) {
  return Array.isArray(list) ? list.reduce(function(a, b) {
    return a.concat(Array.isArray(b) ? util.flatten(b) : b);
  }, []) : [ list ];
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
  var type = typeof value;

  if (type === "number") {
    return value === value ? "number" : "nan";
  }
  if (type === "string") {
    return "string";
  }
  if (type === "function") {
    return "function";
  }
  if (type === "boolean") {
    return "boolean";
  }
  if (value === null) {
    return "null";
  }
  if (value === void 0) {
    return "undefined";
  }
  if (Array.isArray(value)) {
    return "array";
  }

  var name;

  if (value.constructor) {
    if (typeof value.constructor.$$name === "string") {
      name = value.constructor.$$name;
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

util.defaults = function() {
  var args = util.toArray(arguments);
  var i, imax;

  for (i = 0, imax = args.length; i < imax; i++) {
    if (args[i] != null) {
      return args[i];
    }
  }

  return null;
};

util.inherits = function(ctor, superCtor) {
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: { value: ctor, enumerable: false, writable: true, configurable: true }
  });
};

module.exports = util;

},{}],55:[function(require,module,exports){
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

},{"../util":54}],56:[function(require,module,exports){
"use strict";

var util = require("./");

var _ = {};

_.exports = function() {
  return Object.create(_);
};

_.asInt = util.int;

_.midicps = function(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
};

_.mtof = _.midicps;

_.cpsmidi = function(cps) {
  return Math.log(cps / 440) * Math.LOG2E * 12 + 69;
};

_.ftom = _.cpsmidi;

_.midiratio = function(midi) {
  return Math.pow(2, midi / 12);
};

_.ratiomidi = function(ratio) {
  return Math.log(Math.abs(ratio)) * Math.LOG2E * 12;
};

_.dbamp = function(db) {
  return Math.pow(10, db * 0.05);
};

_.ampdb = function(amp) {
  return Math.log(amp) * Math.LOG10E * 20;
};

_.linlin = function(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
};

_.linexp = function(value, inMin, inMax, outMin, outMax) {
  return Math.pow(outMax / outMin, (value - inMin) / (inMax - inMin)) * outMin;
};

_.explin = function(value, inMin, inMax, outMin, outMax) {
  return (((Math.log(value / inMin)) / (Math.log(inMax / inMin))) * (outMax - outMin)) + outMin;
};

_.expexp = function(value, inMin, inMax, outMin, outMax) {
  return Math.pow(outMax / outMin, Math.log(value / inMin) / Math.log(inMax / inMin)) * outMin;
};

_.coin = function(value, random) {
  value = util.finite(util.defaults(value, 0.5));
  random = util.defaults(random, Math.random);
  return random() < value;
};

_.rand = function(value, random) {
  value = util.finite(util.defaults(value, 1.0));
  random = util.defaults(random, Math.random);
  return random() * value;
};

_.rand2 = function(value, random) {
  value = util.finite(util.defaults(value, 1.0));
  random = util.defaults(random, Math.random);
  return (random() * 2 - 1) * value;
};

_.rrand = function(lo, hi, random) {
  lo = util.finite(util.defaults(lo, 0.0));
  hi = util.finite(util.defaults(hi, 1.0));
  random = util.defaults(random, Math.random);
  return _.linlin(random(), 0, 1, lo, hi);
};

_.exprand = function(lo, hi, random) {
  lo = util.finite(util.defaults(lo, 1e-6));
  hi = util.finite(util.defaults(hi, 1.00));
  random = util.defaults(random, Math.random);
  return _.linexp(random(), 0, 1, lo, hi);
};

_.at = function(list, index) {
  return list[index|0];
};

_.clipAt = function(list, index) {
  return list[Math.max(0, Math.min(index|0, list.length - 1))];
};

_.wrapAt = function(list, index) {
  index = index|0;

  index %= list.length;
  if (index < 0) {
    index += list.length;
  }

  return list[index];
};

_.foldAt = function(list, index) {
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

module.exports = _;

},{"./":54}]},{},[1]);
