"use strict";

var _ = require("./utils");

function NeuSynthDB() {
  this._all = [];
  this._ids = {};
}

NeuSynthDB.prototype.append = function(obj) {
  if (_.isObject(obj)) {
    this._all.push(obj);
    if (_.has(obj, "$id")) {
      this._ids[obj.$id] = obj;
    }
  }
  return this;
};

NeuSynthDB.prototype.all = function() {
  return this._all;
};

NeuSynthDB.prototype.find = function(selector) {
  var result = null;

  var id = selector.match(/#[a-zA-Z](-?[a-zA-Z0-9]+)*/);
  if (id) {
    id = id[0].substr(1);
    result = this._ids[id] ? [ this._ids[id] ] : [];
  } else {
    result = this._all;
  }

  var cls = selector.match(/\.[a-zA-Z](-?[a-zA-Z0-9]+)*/g);
  if (cls) {
    cls.forEach(function(cls) {
      cls = cls.substr(1);
      result = result.filter(function(obj) {
        return obj.$class.indexOf(cls) !== -1;
      });
    });
  }

  var key = selector.match(/^[a-zA-Z](-?[a-zA-Z0-9]+)*/);
  if (key) {
    key = key[0];
    result = result.filter(function(obj) {
      return obj.$key === key;
    });
  }

  return result;
};

module.exports = NeuSynthDB;
