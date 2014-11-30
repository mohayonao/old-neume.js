"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/env"));

describe("ugen/env", function() {
  var Neume = null;

  before(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("$(env)", function() {
    it("return a GainNode that is connected with DC(1)", function() {
      var synth = new Neume(function($) {
        return $("env");
      })();

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
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
          }
        ]
      });
    });
  });

  describe("$(env, init:0, table:[], release:3)", function() {
    it("works", function() {
      var synth = new Neume(function($) {
        return $("env", {
          init: 0,
          table: [
            [ 90, 0.100, 1e-3 ],
            [ 80, 0.100, 1e-3 ],
            [ 60, 0.000, 1e-3 ],
            [ 50, 0.100, 1e-3 ],
            [ 50, 0.100, 1e-3 ],
            ///// release /////
            [ 20, 0.100, 1e-3 ],
            [  0, 0.200, 1e-3 ],
          ],
          release: 5
        });
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      // 0.000
      // 0.100 :  0 <- start
      // 0.200 : 90
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

      audioContext.$processTo("00:01.500");

      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 87.153, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 89.910, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 80.313, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 80.009, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.301), 59.332, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 50.316, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 50.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 50.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 50.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 50.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 50.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 20.948, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 20.029, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750),  3.561, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800),  0.633, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850),  0.112, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900),  0.020, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950),  0.003, 1e-2));

      assert(closeTo(ended, 1.186, 1e-2));
    });
    it("works with stop", function() {
      var synth = new Neume(function($) {
        return $("env", {
          init: 0,
          table: [
            [ 90, 0.100, 1e-3 ],
            [ 80, 0.100, 1e-3 ],
            [ 60, 0.000, 1e-3 ],
            [ 50, 0.100, 1e+3 ],
            [ 50, 0.100, 1e+3 ],
            ///// release /////
            [ 20, 0.100, 1e-3 ],
            [  0, 0.200, 1e-3 ],
          ],
          release: 5
        });
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      // 0.000
      // 0.100 :  0 <- start
      // 0.200 : 90
      //            <- stop
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
      }).release(0.600).stop(0.225);

      audioContext.$processTo("00:01.500");

      assert(closeTo(outlet.gain.$valueAtTime(0.000),  0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050),  0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100),  0.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 87.153, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 89.910, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.225), 86.512, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 86.512, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 86.512, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 86.512, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 86.512, 1e-2));

      assert(ended === 0);
    });

    it("works with loop", function() {
      var synth = new Neume(function($) {
        return $("env", {
          init: 0,
          table: [
            [ 90, 0.100, 1e-3 ],
            [ 80, 0.100, 1e-3 ],
            ////// loop ///////
            [ 60, 0.050, 1e-3 ],
            [ 50, 0.050, 1e-3 ],
            ///// release /////
            [ 20, 0.100, 1e-3 ],
            [  0, 0.200, 1e-3 ],
          ],
          release: 4, loop: 2
        });
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      // 0.000
      // 0.100 :  0 <- start
      // 0.200 : 90
      // 0.300 : 80
      // 0.350 : 60 ..
      // 0.400 : 50 ..
      // 0.450 : 60 -- loop
      // 0.500 : 50
      // 0.550 : 60 -- loop
      // -----------
      // 0.600 : 50 <- release
      // 0.700 : 20
      // 0.900 :  0 -> end

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.600);

      audioContext.$processTo("00:01.500");

      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 87.153, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 89.910, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 80.313, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 80.009, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 60.020, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 50.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 59.990, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 50.009, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 59.990, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 50.009, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 20.948, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 20.030, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750),  3.561, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800),  0.633, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850),  0.112, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900),  0.020, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950),  0.003, 1e-2));

      assert(closeTo(ended, 1.186, 1e-2));
    });

    it("works without releaseNode", function() {
      var synth = new Neume(function($) {
        return $("env", {
          init: 0,
          table: [
            [ 90, 0.100, 1e-3 ],
            [ 80, 0.100, 1e-3 ],
            [ 60, 0.100, 1e-3 ],
            [ 50, 0.100, 1e-3 ],
            [ 20, 0.100, 1e-3 ],
            [  0, 0.200, 1e-3 ],
          ],
        });
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      // 0.000
      // 0.100 :  0 <- start
      // 0.200 : 90
      // 0.300 : 80
      // 0.400 : 60
      // 0.500 : 50
      // 0.600 : 20
      // 0.700 :  0 <- end

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.600);

      audioContext.$processTo("00:01.500");

      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 87.153, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 89.910, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 80.313, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 80.009, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 60.632, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 60.020, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 50.316, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 50.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 20.949, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 20.030, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 3.5618, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.6334, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.1126, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.0200, 1e-2));

      assert(closeTo(ended, 1.086, 1e-2));
    });
    it("_ style", function() {
      var synth = new Neume(function($) {
        return $("env", { _: [
          0, 90, 0.100, 80, 0.100, "L", 60, 0.050, 50, 0.050, "R", 20, 0.100, 0, 0.200, "X"
        ], curve: 1e-3 });
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      // 0.000
      // 0.100 :  0 <- start
      // 0.200 : 90
      // 0.300 : 80
      // 0.350 : 60 ..
      // 0.400 : 50 ..
      // 0.450 : 60 -- loop
      // 0.500 : 50
      // 0.550 : 60 -- loop
      // -----------
      // 0.600 : 50 <- release
      // 0.700 : 20
      // 0.900 :  0 -> end

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.600);

      audioContext.$processTo("00:01.500");

      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 87.153, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 89.910, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 80.313, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 80.009, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 60.020, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 50.010, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 59.990, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 50.009, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 59.990, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 50.009, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 20.948, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 20.030, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750),  3.561, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800),  0.633, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850),  0.112, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900),  0.020, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950),  0.003, 1e-2));

      assert(closeTo(ended, 1.186, 1e-2));
    });
  });

  describe("$(env, $(env), $(env))", function() {
    it("returns a GainNode that is connected with $(env) x2", function() {
      var synth = new Neume(function($) {
        return $("env", $("env"), $("env"));
      })();
      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
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
          }
        ]
      });
    });
  });

  describe("$(adsr)", function() {
    it("return a GainNode that is connected with DC(1)", function() {
      var synth = new Neume(function($) {
        return $("adsr");
      })();
      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
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
          }
        ]
      });
    });
    it("works", function() {
      var synth = new Neume(function($) {
        return $("adsr", { a: 0.1, d: 0.2, s: 0.3, r: 0.5, curve: 0.01 });
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.600);

      audioContext.$processTo("00:01.000");

      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 0.899, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.990, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.518, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.369, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.321, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.306, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.302, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.300, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.300, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.300, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.189, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.119, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.075, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.047, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.030, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.018, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.011, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.007, 1e-2));
    });
  });

  describe("$(dadsr)", function() {
    it("return a GainNode that is connected with DC(1)", function() {
      var synth = new Neume(function($) {
        return $("dadsr");
      })();

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
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
          }
        ]
      });
    });
    it("works", function() {
      var synth = new Neume(function($) {
        return $("dadsr", { delay: 0.1, a: 0.1, d: 0.2, s: 0.3, r: 0.5, curve: 0.01 });
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.600);

      audioContext.$processTo("00:01.000");

      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(outlet.gain.$valueAtTime(0.150) === 0);
      assert(outlet.gain.$valueAtTime(0.200) === 0);
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.899, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.990, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.518, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.369, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.321, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.306, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.302, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.300, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.189, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.119, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.075, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.047, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.030, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.018, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.011, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.007, 1e-2));
    });
  });

  describe("$(asr)", function() {
    it("return a GainNode that is connected with DC(1)", function() {
      var synth = new Neume(function($) {
        return $("asr");
      })();

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
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
          }
        ]
      });
    });
    it("works", function() {
      var synth = new Neume(function($) {
        return $("asr", { a: 0.1, s: 0.3, r: 0.5, curve: 0.01 });
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.600);

      audioContext.$processTo("00:01.000");

      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 0.269, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.297, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.299, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 0.299, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 0.299, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 0.299, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 0.299, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 0.299, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.550), 0.299, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.600), 0.299, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.189, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.119, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.075, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.047, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.029, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.018, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.011, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.007, 1e-2));
    });
  });

  describe("$(cutoff)", function() {
    it("return a GainNode that is connected with DC(1)", function() {
      var synth = new Neume(function($) {
        return $("cutoff");
      })();
      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 1,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
    });
    it("works", function() {
      var synth = new Neume(function($) {
        return $("cutoff", { r: 0.5, level: 0.8, curve: 0.01 });
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      }).release(0.600);

      audioContext.$processTo("00:01.000");

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
      assert(closeTo(outlet.gain.$valueAtTime(0.650), 0.504, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.700), 0.318, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.750), 0.200, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.800), 0.126, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.850), 0.080, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.900), 0.050, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.950), 0.031, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(1.000), 0.020, 1e-2));
    });
  });

});
