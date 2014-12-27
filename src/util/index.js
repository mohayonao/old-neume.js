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
