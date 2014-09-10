"use strict";

var neuma = require("../src/neuma");

neuma.use(require("../src/ugen/shaper"));

describe("ugen/shaper", function() {
  describe("$(shaper)", function() {
    it("return a WaveShaperNode", function() {
      var synth = neuma.Neuma(function($) {
        return $("shaper");
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "WaveShaperNode",
        oversample: "none",
        inputs: []
      });
    });
  });

  describe("$(shaper curve:curve)", function() {
    it("return a WaveShaperNode", function() {
      var synth = neuma.Neuma(function($) {
        return $("shaper", { curve: new Float32Array([ -1, +1 ]) });
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "WaveShaperNode",
        oversample: "none",
        inputs: []
      });
      assert.deepEqual(synth.outlet.curve, new Float32Array([ -1, +1 ]));
    });
    it("return a WaveShaperNode with curve number", function() {
      var synth1 = neuma.Neuma(function($) {
        return $("shaper", { curve: 1 });
      })();
      var synth2 = neuma.Neuma(function($) {
        return $("shaper", { curve: 1 });
      })();
      var synth3 = neuma.Neuma(function($) {
        return $("shaper", { curve: 0.5 });
      })();
      assert.deepEqual(synth1.outlet.toJSON(), {
        name: "WaveShaperNode",
        oversample: "none",
        inputs: []
      });
      assert(synth1.outlet.curve === synth2.outlet.curve);
      assert(synth2.outlet.curve !== synth3.outlet.curve);
    });
  });

  describe("$(shaper, $(shaper), $(shaper))", function() {
    it("return a WaveShaperNode", function() {
      var synth = neuma.Neuma(function($) {
        return $("shaper", $("shaper"), $("shaper"));
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "WaveShaperNode",
        oversample: "none",
        inputs: [
          {
            name: "WaveShaperNode",
            oversample: "none",
            inputs: []
          },
          {
            name: "WaveShaperNode",
            oversample: "none",
            inputs: []
          }
        ]
      });
    });
  });

  describe("$(clip)", function() {
    it("return a WaveShaperNode", function() {
      var synth1 = neuma.Neuma(function($) {
        return $("clip");
      })();
      var synth2 = neuma.Neuma(function($) {
        return $("clip");
      })();
      assert.deepEqual(synth1.outlet.toJSON(), {
        name: "WaveShaperNode",
        oversample: "none",
        inputs: []
      });
      assert(synth1.outlet.curve === synth2.outlet.curve);
    });

  });
});
