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
