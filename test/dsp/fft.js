"use strict";

var neume = require("../../src");

describe("FFT", function() {

  describe("#forward", function() {
    it("(buffer: Float32Array): { real: Float32Array, imag: Float32Array }", function() {
      var result = neume.FFT.forward(new Float32Array(128));

      assert(result.real instanceof Float32Array);
      assert(result.real.length === 128);
      assert(result.imag instanceof Float32Array);
      assert(result.imag.length === 128);
    });
  });

  describe("#inverse", function() {
    it("(real: Float32Array, imag: Float32Array): Float32Array", function() {
      var result = neume.FFT.inverse(new Float32Array(128), new Float32Array(128));

      assert(result instanceof Float32Array);
      assert(result.length === 128);
    });
  });

});
