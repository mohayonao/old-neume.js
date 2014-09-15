"use strict";

var neume = require("../src/neume");

neume.use(require("../src/ugen/env"));

describe("ugen/env", function() {
  describe("$(env)", function() {
    it("return a GainNode that is connected with DC(1)", function() {
      var synth = neume.Neume(function($) {
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
      var synth = neume.Neume(function($) {
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

      var audioContext = neume._.findAudioContext(synth);
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

      audioContext.$process(1.000);
      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 87.15395010584841, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 89.91            , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 80.31338171612276, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 80.00991         , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 60, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 50, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 50, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 50, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 50, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 50, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 20.94868329805053   , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 20.029999999999923  , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 3.561893658307925   , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.6334042153317155  , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.11263696743562424 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.020029999999999385, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.003561893658307831, 1e-6));

      assert(ended === 0.8999999999999999);
    });
    it("works", function() {
      var synth = neume.Neume(function($) {
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

      var audioContext = neume._.findAudioContext(synth);
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

      audioContext.$process(1.000);
      assert(closeTo(outlet.gain.$valueAtTime(0.000), 0, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 0, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 0, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 87.15395010584841, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 89.91, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 80.31338171612276, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 80.00991, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 60, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 50, 1e-6));

      assert(ended === 0);
    });
  });

  describe("$(env, $(env), $(env))", function() {
    it("returns a GainNode that is connected with $(env) x2", function() {
      var synth = neume.Neume(function($) {
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
      var synth = neume.Neume(function($) {
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
