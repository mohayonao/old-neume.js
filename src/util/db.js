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
    parsed.classes.forEach(function(cls) {
      result = result.filter(function(obj) {
        return obj.classes.indexOf(cls) !== -1;
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
