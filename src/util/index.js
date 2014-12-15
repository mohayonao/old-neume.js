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

util.flatten = function(list) {
  return list.reduce(function(a, b) {
    return a.concat(Array.isArray(b) ? util.flatten(b) : b);
  }, []);
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
