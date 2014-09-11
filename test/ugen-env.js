"use strict";

var neuma = require("../src/neuma");

neuma.use(require("../src/ugen/env"));

describe("ugen/env", function() {
  describe("$(env)", function() {
    it("return a GainNode that is connected with DC(1)", function() {
      var synth = neuma.Neuma(function($) {
        return $("env");
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 0,
          inputs: []
        },
        inputs: [ DC(1) ]
      });
    });
  });

  describe("$(env, init:0, table:[], release:3)", function() {
    it("works", function() {
      var synth = neuma.Neuma(function($) {
        return $("env", {
          init: 0,
          table: [
            [ 0.100, 90, 1e-3 ],
            [ 0.100, 80, 1e-3 ],
            [ 0.000, 60, 1e-3 ],
            [ 0.100, 50, 1e+3 ],
            [ 0.100, 50, 1e+3 ],
            [ 0.100, 20, 1e-3 ],
            [ 0.200,  0, 1e-3 ],
          ],
          release: 5
        });
      })();

      var audioContext = neuma._.findAudioContext(synth);
      var outlet = synth.outlet;
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      // 0.000
      // 0.100 :  0 <- start
      // 0.200 : 10
      // 0.300 : 80
      // 0.300 : 60
      // 0.400 : 50
      // 0.500 : 50
      // -----------
      // 0.600 : 50 <- release
      // 0.700 : 20
      // 0.900 :  0 -> end

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.600);

      assert(outlet.gain.value === 0, "00:00.000");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.050");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.100");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 87.15395010584841, "00:00.150");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 89.91, "00:00.200");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 80.31338171612276, "00:00.250");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 80.00991, "00:00.300");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 60, "00:00.350");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 60, "00:00.400");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 50, "00:00.450");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 50, "00:00.500");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 50, "00:00.550");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 50, "00:00.600");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 20.94868329805053, "00:00.650");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 20.029999999999923, "00:00.700");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 3.561893658307925, "00:00.750");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.6334042153317155, "00:00.800");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.11263696743562424, "00:00.850");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.020029999999999385, "00:00.900");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.003561893658307831, "00:00.950");

      assert(ended === 0.8999999999999999);
    });
    it("works", function() {
      var synth = neuma.Neuma(function($) {
        return $("env", {
          init: 0,
          table: [
            [ 0.100, 90, 1e-3 ],
            [ 0.100, 80, 1e-3 ],
            [ 0.000, 60, 1e-3 ],
            [ 0.100, 50, 1e+3 ],
            [ 0.100, 50, 1e+3 ],
            [ 0.100, 20, 1e-3 ],
            [ 0.200,  0, 1e-3 ],
          ],
          release: 5
        });
      })();

      var audioContext = neuma._.findAudioContext(synth);
      var outlet = synth.outlet;
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      // 0.000
      // 0.100 :  0 <- start
      //            <- stop
      // 0.200 : 10
      // 0.300 : 80
      // 0.300 : 60
      // 0.400 : 50
      // 0.500 : 50
      // -----------
      // 0.600 : 50 <- release
      // 0.700 : 20
      // 0.900 :  0 -> end

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.600).stop(0.150);

      assert(outlet.gain.value === 0, "00:00.000");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.050");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.100");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 87.15395010584841, "00:00.150");

      audioContext.$process(0.250);
      assert(outlet.gain.value === 88.80311607744336, "00:00.400");

      assert(ended === 0);
    });
  });

  describe("$(env, $(env), $(env))", function() {
    it("returns a GainNode that is connected with $(env) x2", function() {
      var synth = neuma.Neuma(function($) {
        return $("env", $("env"), $("env"));
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 0,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 0,
              inputs: []
            },
            inputs: [ DC(1) ]
          },
          {
            name: "GainNode",
            gain: {
              value: 0,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
    });
  });

  describe("$(adsr)", function() {
    it("return a GainNode that is connected with DC(1)", function() {
      var synth = neuma.Neuma(function($) {
        return $("adsr");
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 0,
          inputs: []
        },
        inputs: [ DC(1) ]
      });
    });
  });

});
