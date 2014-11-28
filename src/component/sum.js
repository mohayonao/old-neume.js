"use strict";

var util = require("../util");
var NeuComponent = require("./component");

function NeuSum(context, inputs) {
  NeuComponent.call(this, context);

  var number = 0;
  var hasNumber = false;
  var param = null;
  var nodes = [];

  for (var i = 0, imax = inputs.length; i < imax; i++) {
    if (typeof inputs[i] === "number") {
      number += util.finite(inputs[i]);
      hasNumber = true;
    } else if (inputs[i] instanceof util.NeuDC) {
      number += inputs[i].valueOf();
      hasNumber = true;
    } else if (!param && inputs[i] instanceof util.NeuParam) {
      param = inputs[i];
    } else {
      nodes.push(inputs[i]);
    }
  }
  this._hasNumber = hasNumber;
  this._number = number;
  this._param = param;
  this._nodes = nodes;
  this._inputs = inputs;
}
util.inherits(NeuSum, NeuComponent);

NeuSum.$name = "NeuSum";

NeuSum.prototype.add = function(value) {
  return this.$context.createSum(this._inputs.concat(value));
};

NeuSum.prototype.toAudioNode = function() {
  if (this.$outlet === null) {
    if (this._inputs.length === 1) {
      this.$outlet = this.$context.toAudioNode(this._inputs[0]);
    } else {
      this.$outlet = createSumNode(this.$context, this._inputs);
    }
  }
  return this.$outlet;
};

NeuSum.prototype.connect = function(to) {
  var context = this.$context;
  var number = this._number;
  var param = this._param;
  var nodes = this._nodes;

  if (number === 0 && param === null && nodes.length === 0) {
    if (this._hasNumber) {
      context.connect(number, to);
    }
  } else {
    for (var i = 0, imax = nodes.length; i < imax; i++) {
      context.connect(context.toAudioNode(nodes[i]), to);
    }

    if (param) {
      context.connect(param, to);
      if (number !== 0) {
        context.connect(context.createDC(number).toAudioNode(), to);
      }
    } else if (number !== 0) {
      context.connect(number, to);
    }
  }

  return this;
};

function createSumNode(context, inputs) {
  var node = null;
  var number = 0;

  for (var i = 0, imax = inputs.length; i < imax; i++) {
    if (typeof inputs[i] === "number") {
      number += util.finite(inputs[i]);
    } else if (inputs[i] instanceof util.NeuDC) {
      number += inputs[i].valueOf();
    } else {
      if (node === null) {
        node = context.createGain();
      }
      context.connect(inputs[i], node);
    }
  }

  if (node) {
    if (number !== 0) {
      context.connect(context.createDC(number), node);
    }
  } else {
    node = context.createDC(number).toAudioNode();
  }

  return node;
}

NeuSum.prototype.disconnect = function() {
  var context = this.$context;
  var inputs = this._inputs;

  for (var i = 0, imax = inputs.length; i < imax; i++) {
    context.disconnect(inputs[i]);
  }

  return this;
};

module.exports = util.NeuSum = NeuSum;
