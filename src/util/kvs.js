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
