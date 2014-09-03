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

utils.format = function(fmt, dict) {
  utils.each(dict, function(val, key) {
    if (/^\w+$/.test(key)) {
      fmt = fmt.replace(new RegExp("#\\{" + key + "\\}", "g"), val);
    }
  });
  return fmt;
};

module.exports = utils;
