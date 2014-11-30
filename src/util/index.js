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

utils.definePropertyIfNotExists = function(obj, prop, descriptor) {
  if (!obj.hasOwnProperty(prop)) {
    Object.defineProperty(obj, prop, descriptor);
  }
  return obj;
};

utils.format = function(fmt, dict) {
  Object.keys(dict).forEach(function(key) {
    if (/^\w+$/.test(key)) {
      fmt = fmt.replace(new RegExp("#\\{" + key + "\\}", "g"), dict[key]);
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

utils.clip = function(value, min, max) {
  return Math.max(min, Math.min(value, max));
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

utils.defaults = function(value, defaultValue) {
  return value == null ? defaultValue : value;
};

utils.inherits = function(ctor, superCtor) {
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: { value: ctor, enumerable: false, writable: true, configurable: true }
  });
};

module.exports = utils;
