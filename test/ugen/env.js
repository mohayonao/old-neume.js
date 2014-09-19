"use strict";

var neume = require("../../src/neume");

neume.use(require("../../src/ugen/env"));

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
    it("works", function() {
      var synth = neume.Neume(function($) {
        return $("adsr", { a: 0.1, d: 0.2, s: 0.3, r: 0.5 });
      })();

      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.600);

      audioContext.$process(1.000);

      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 0.8999999999999999 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.99               , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.5181971585516186 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.3690000000000003 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.32181971585516195, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.30690000000000006, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.3021819715855162 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.30069            , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.30021819715855164, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.300069           , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.18933073940082704, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.1194596205608174 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.07537392496166481, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.04755773153686137, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.03000690000000000, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.01893307394008270, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.01194596205608174, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.00753739249616648, 1e-6));
    });
  });

  describe("$(dadsr)", function() {
    it("return a GainNode that is connected with DC(1)", function() {
      var synth = neume.Neume(function($) {
        return $("dadsr");
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
    it("works", function() {
      var synth = neume.Neume(function($) {
        return $("dadsr", { delay: 0.1, a: 0.1, d: 0.2, s: 0.3, r: 0.5 });
      })();

      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.600);

      audioContext.$process(1.000);

      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(outlet.gain.$valueAtTime(0.150) === 0);
      assert(outlet.gain.$valueAtTime(0.200) === 0);
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.8999999999999999 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.99               , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.5181971585516186 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.3690000000000003 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.32181971585516195, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.30690000000000006, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.3021819715855162 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.30069            , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.18972256391174924, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.11970684511373113, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.07552991310906157, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.04765615340411321, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.03006900000000000, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.01897225639117493, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.01197068451137311, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.00755299131090615, 1e-6));
    });
  });

  describe("$(asr)", function() {
    it("return a GainNode that is connected with DC(1)", function() {
      var synth = neume.Neume(function($) {
        return $("asr");
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
    it("works", function() {
      var synth = neume.Neume(function($) {
        return $("asr", { a: 0.1, s: 0.3, r: 0.5 });
      })();

      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.600);

      audioContext.$process(1.000);

      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 0.26999999999999996, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.297              , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.29969999999999997, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.29997            , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.299997           , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.2999997          , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.29999997         , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.29999999699999996, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.29999999969999996, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.29999999997      , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.1892872033251292 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.11943215115410599, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.07535659293775174, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.04754679576907870, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.02999999999700000, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.01892872033251292, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.01194321511541060, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.00753565929377517, 1e-6));
    });
  });

  describe("$(cutoff)", function() {
    it("return a GainNode that is connected with DC(1)", function() {
      var synth = neume.Neume(function($) {
        return $("cutoff");
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ DC(1) ]
      });
    });
    it("works", function() {
      var synth = neume.Neume(function($) {
        return $("cutoff", { releaseTime: 0.5, level: 0.8 });
      })();

      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.600);

      audioContext.$process(1.000);

      assert(outlet.gain.$valueAtTime(0.000) === 0.8);
      assert(outlet.gain.$valueAtTime(0.050) === 0.8);
      assert(outlet.gain.$valueAtTime(0.100) === 0.8);
      assert(outlet.gain.$valueAtTime(0.150) === 0.8);
      assert(outlet.gain.$valueAtTime(0.200) === 0.8);
      assert(outlet.gain.$valueAtTime(0.250) === 0.8);
      assert(outlet.gain.$valueAtTime(0.300) === 0.8);
      assert(outlet.gain.$valueAtTime(0.350) === 0.8);
      assert(outlet.gain.$valueAtTime(0.400) === 0.8);
      assert(outlet.gain.$valueAtTime(0.450) === 0.8);
      assert(outlet.gain.$valueAtTime(0.500) === 0.8);
      assert(outlet.gain.$valueAtTime(0.550) === 0.8);
      assert(outlet.gain.$valueAtTime(0.600) === 0.8);
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.5047658755841544 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.31848573644279793, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.2009509145207664 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.12679145539688905, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.08000000000000002, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.05047658755841545, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.0318485736442798 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.02009509145207664, 1e-6));
    });
  });

});
