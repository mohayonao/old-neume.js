"use strict";

var _ = require("./utils");

function forward(_buffer) {
  var n = 1 << Math.ceil(Math.log(_.finite(_buffer.length)) * Math.LOG2E);
  var buffer = new Float32Array(n);
  var real   = new Float32Array(n);
  var imag   = new Float32Array(n);
  var params = getParams(n);
  var bitrev = params.bitrev;
  var sintable = params.sintable;
  var costable = params.costable;
  var i, j, k, k2, h, d, c, s, ik, dx, dy;

  for (i = 0; i < n; i++) {
    buffer[i] = _buffer[i];
    real[i]   = _buffer[bitrev[i]];
    imag[i]   = 0.0;
  }

  for (k = 1; k < n; k = k2) {
    h = 0;
    k2 = k + k;
    d = n / k2;
    for (j = 0; j < k; j++) {
      c = costable[h];
      s = sintable[h];
      for (i = j; i < n; i += k2) {
        ik = i + k;
        dx = s * imag[ik] + c * real[ik];
        dy = c * imag[ik] - s * real[ik];
        real[ik] = real[i] - dx;
        imag[ik] = imag[i] - dy;
        real[i] += dx;
        imag[i] += dy;
      }
      h += d;
    }
  }

  return { real: real, imag: imag };
}

function inverse(_real, _imag) {
  var n = 1 << Math.ceil(Math.log(_.finite(_real.length)) * Math.LOG2E);
  var buffer = new Float32Array(n);
  var real   = new Float32Array(n);
  var imag   = new Float32Array(n);
  var params = getParams(n);
  var bitrev = params.bitrev;
  var sintable = params.sintable;
  var costable = params.costable;
  var i, j, k, k2, h, d, c, s, ik, dx, dy;

  for (i = 0; i < n; i++) {
    j = bitrev[i];
    real[i] = +_real[j];
    imag[i] = -_imag[j];
  }

  for (k = 1; k < n; k = k2) {
    h = 0;
    k2 = k + k;
    d = n / k2;
    for (j = 0; j < k; j++) {
      c = costable[h];
      s = sintable[h];
      for (i = j; i < n; i += k2) {
        ik = i + k;
        dx = s * imag[ik] + c * real[ik];
        dy = c * imag[ik] - s * real[ik];
        real[ik] = real[i] - dx;
        imag[ik] = imag[i] - dy;
        real[i] += dx;
        imag[i] += dy;
      }
      h += d;
    }
  }

  for (i = 0; i < n; i++) {
    buffer[i] = real[i] / n;
  }

  return buffer;
}

function calcBitRev(n) {
  var x = new Int16Array(n);

  var n2 = n >> 1;
  var i = 0;
  var j = 0;

  while (true) {
    x[i] = j;

    if (++i >= n) {
      break;
    }

    var k = n2;

    while (k <= j) {
      j -= k;
      k >>= 1;
    }

    j += k;
  }

  return x;
}

function getParams(n) {
  if (getParams.cache[n]) {
    return getParams.cache[n];
  }

  var bitrev = calcBitRev(n);
  var k = Math.floor(Math.log(n) / Math.LN2);
  var sintable = new Float32Array((1 << k) - 1);
  var costable = new Float32Array((1 << k) - 1);

  for (var i = 0, imax = sintable.length; i < imax; i++) {
    sintable[i] = Math.sin(Math.PI * 2 * (i / n));
    costable[i] = Math.cos(Math.PI * 2 * (i / n));
  }

  getParams.cache[n] = {
    bitrev  : bitrev,
    sintable: sintable,
    costable: costable,
  };

  return getParams.cache[n];
}
getParams.cache = [];

module.exports = {
  forward: forward,
  inverse: inverse,
};
