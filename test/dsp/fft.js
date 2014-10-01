"use strict";

var FFT = require("../../src/dsp/fft");

describe("FFT", function() {

  describe("#forward(buffer)", function() {
    it("returns real, imag", function() {
      var result = FFT.forward(new Float32Array(128));

      assert(result.real instanceof Float32Array);
      assert(result.real.length === 128);
      assert(result.imag instanceof Float32Array);
      assert(result.imag.length === 128);
    });
  });

  describe("#inverse(real, imag)", function() {
    it("returns buffer", function() {
      var result = FFT.inverse(new Float32Array(128), new Float32Array(128));

      assert(result instanceof Float32Array);
      assert(result.length === 128);
    });
  });

});
