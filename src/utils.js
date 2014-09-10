"use strict";

var utils = {};

utils.isArray = function(value) {
  return Array.isArray(value);
};

utils.isBoolean = function(value) {
  return typeof value === "boolean";
};

utils.isDictionary = function(value) {
  return value != null && value.constructor === Object;
};

utils.isFunction = function(value) {
  return typeof value === "function";
};

utils.isFinite = function(value) {
  return typeof value === "number" && isFinite(value);
};

utils.isNaN = function(value) {
  return value !== value;
};

utils.isNull = function(value) {
  return value === null;
};

utils.isNumber = function(value) {
  return typeof value === "number" && !isNaN(value);
};

utils.isObject = function(value) {
  var type = typeof value;
  return type === "function" || type === "object" && value !== null;
};

utils.isString = function(value) {
  return typeof value === "string";
};

utils.isTypedArray = function(value) {
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

utils.isUndefined = function(value) {
  return value === void 0;
};

utils.toArray = function(value) {
  if (value == null) {
    return [];
  }
  return Array.prototype.slice.call(value);
};

utils.fill = function(list, value) {
  for (var i = 0, imax = list.length; i < imax; i++) {
    list[i] = value;
  }
  return list;
};

utils.isEmpty = function(list) {
  return list.length === 0;
};

utils.first = function(list) {
  return list[0];
};

utils.second = function(list) {
  return list[1];
};

utils.last = function(list) {
  return list[list.length - 1];
};

utils.clipAt = function(list, index) {
  return list[Math.max(0, Math.min(index|0, list.length - 1))];
};

utils.wrapAt = function(list, index) {
  index = index|0;

  index %= list.length;
  if (index < 0) {
    index += list.length;
  }

  return list[index];
};

utils.foldAt = function(list, index) {
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

utils.rest = function(list) {
  return list.slice(1);
};

utils.each = function(list, func, ctx) {
  var i, len, keys;

  if (list != null) {
    func = func.bind(ctx);
    len  = list.length;
    if (len === +len) {
      for (i = 0; i < len; ++i) {
        func(list[i], i, list);
      }
    } else {
      keys = Object.keys(list);
      len  = keys.length;
      for (i = 0; i < len; ++i) {
        func(list[keys[i]], keys[i], list);
      }
    }
  }

  return list;
};

utils.collect = function(list, func, ctx) {
  var result = [];

  func = func.bind(ctx);

  utils.each(list, function(elem, index) {
    result.push(func(elem, index, list));
  });

  return result;
};

utils.select = function(list, pred, ctx) {
  var result = [];

  pred = pred.bind(ctx);

  utils.each(list, function(elem, index) {
    if (pred(elem, index, list)) {
      result.push(elem);
    }
  });

  return result;
};

utils.reject = function(list, pred, ctx) {
  var result = [];

  pred = pred.bind(ctx);

  utils.each(list, function(elem, index) {
    if (!pred(elem, index, list)) {
      result.push(elem);
    }
  });

  return result;
};

utils.partition = function(list, pred, ctx) {
  var selected = [];
  var rejected = [];

  pred = pred.bind(ctx);

  utils.each(list, function(elem, index) {
    (pred(elem, index, list) ? selected : rejected).push(elem);
  });

  return [ selected, rejected ];
};

utils.reduce = function(list, func, init, ctx) {
  var result = init;

  func = func.bind(ctx);

  utils.each(list, function(elem, index) {
    result = func(result, elem, index, list);
  });

  return result;
};

utils.has = function(obj, key) {
  return obj != null && obj.hasOwnProperty(key);
};

utils.keys = function(obj) {
  return Object.keys(obj);
};

utils.values = function(obj) {
  return Object.keys(obj).map(function(key) {
    return obj[key];
  });
};

utils.pairs = function(obj) {
  return Object.keys(obj).map(function(key) {
    return [ key, obj[key] ];
  });
};

utils.definePropertyIfNotExists = function(obj, prop, descriptor) {
  if (!obj.hasOwnProperty(prop)) {
    Object.defineProperty(obj, prop, descriptor);
  }
  return obj;
};

utils.format = function(fmt, dict) {
  utils.each(dict, function(val, key) {
    if (/^\w+$/.test(key)) {
      fmt = fmt.replace(new RegExp("#\\{" + key + "\\}", "g"), val);
    }
  });
  return fmt;
};

utils.num = function(value) {
  return +value||0;
};

utils.int = function(value) {
  return +value|0;
};

utils.finite = function(value) {
  value = +value||0;
  if (!utils.isFinite(value)) {
    value = 0;
  }
  return value;
};

utils.typeOf = function(value) {
  if (utils.isNumber(value)) {
    return "number";
  }
  if (utils.isArray(value)) {
    return "array";
  }
  if (utils.isString(value)) {
    return "string";
  }
  if (utils.isFunction(value)) {
    return "function";
  }
  if (utils.isBoolean(value)) {
    return "boolean";
  }
  if (utils.isNull(value)) {
    return "null";
  }
  if (utils.isUndefined(value)) {
    return "undefined";
  }
  if (utils.isNaN(value)) {
    return "nan";
  }
  if (value.constructor && utils.isString(value.constructor.name)) {
    return value.constructor.name.toLowerCase();
  }
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
};

utils.defaults = function(value, defaultValue) {
  return value == null ? defaultValue : value;
};

utils.inherits = function(ctor, superCtor) {
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: { value: ctor, enumerable: false, writable: true, configurable: true }
  });
};

utils.isAudioContext = function(value) {
  return value instanceof window.AudioContext;
};

utils.isAudioNode = function(value) {
  return value instanceof window.AudioNode;
};

utils.isAudioParam = function(value) {
  return value instanceof window.AudioParam;
};

utils.findAudioContext = function(obj) {
  while (!(obj == null || utils.isAudioContext(obj))) {
    obj = obj.$context;
  }
  return obj || null;
};

utils.findAudioNode = function(obj) {
  while (!(obj == null || utils.isAudioNode(obj))) {
    obj = obj.$outlet;
  }
  return obj || null;
};

utils.findAudioBuffer = function(obj) {
  while (!(obj == null || obj instanceof window.AudioBuffer)) {
    obj = obj.$buffer;
  }
  return obj || null;
};

utils.isValidInput = function(value) {
  return utils.isFinite(value) || utils.isAudioNode(utils.findAudioNode(value));
};

utils.connect = function(spec) {
  var from = spec.from;
  var to   = spec.to;

  if (utils.isFinite(from) && utils.isAudioParam(to)) {
    return to.setValueAtTime(from, 0);
  }

  if (utils.isAudioNode(to) || utils.isAudioParam(to)) {
    from = utils.findAudioNode(from);
    if (from) {
      return from.connect(to);
    }
  }
};

utils.disconnect = function(spec) {
  var from = utils.findAudioNode(spec.from);

  /* istanbul ignore else */
  if (from) {
    from.disconnect();
  }
};

module.exports = utils;
