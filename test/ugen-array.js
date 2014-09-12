"use strict";

var neume = require("../src/neume");

neume.use(require("../src/ugen/array"));

describe("ugen/array", function() {
  describe("$([])", function() {
    it("returns a GainNode that is connected with a DC(1)", function() {
      var synth = neume.Neume(function($) {
        return $([]);
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

  describe("$[ 1, 2, 3, 4, 5 ]", function() {
    it("returns a GainNode that is connected with a DC(1)", function() {
      var synth = neume.Neume(function($) {
        return $([ 1, 2, 3, 4, 5 ]);
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
        return $([ 0, 1, 2, 3, 4 ]);
      })();
      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      assert(outlet.gain.value === 0, "00:00.000");

      synth.next(0.100);
      synth.at(0.250, 4);
      synth.prev(0.400);

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.050");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1, "00:00.100");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1, "00:00.150");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1, "00:00.200");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 4, "00:00.250");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 4, "00:00.300");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 4, "00:00.350");

      audioContext.$process(0.051);
      assert(outlet.gain.value === 3, "00:00.401");

      audioContext.$process(0.049);
      assert(outlet.gain.value === 3, "00:00.450");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 3, "00:00.500");
    });
    it("works with setValue", function() {
      var synth = neume.Neume(function($) {
        return $([ 0, 1, 2, 3, 4 ]);
      })();
      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      assert(outlet.gain.value === 0, "00:00.000");

      synth.setValue(0.100, 0);
      synth.setValue(0.400, [ 0, 10, 20, 30, 40 ]);

      synth.next(0.100);
      synth.at(0.250, 4);
      synth.prev(0.400);

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.050");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1, "00:00.100");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1, "00:00.150");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1, "00:00.200");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 4, "00:00.250");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 4, "00:00.300");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 4, "00:00.350");

      audioContext.$process(0.051);
      assert(outlet.gain.value === 30, "00:00.401");

      audioContext.$process(0.049);
      assert(outlet.gain.value === 30, "00:00.450");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 30, "00:00.500");
    });
  });

  describe("$[ 1, 2, 3, 4, 5 ] lag:0.1, curve:0.1)", function() {
    it("works", function() {
      var synth = neume.Neume(function($) {
        return $([ 0, 1, 2, 3, 4 ], { lag: 0.1, curve: 0.1 });
      })();
      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      assert(outlet.gain.value === 0, "00:00.000");

      synth.next(0.100);
      synth.at(0.250, 4);
      synth.prev(0.400);

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.050");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0, "00:00.100");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.6837722339831622, "00:00.150");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.9, "00:00.200");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.9683772233983161, "00:00.250");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 3.0413167019494862, "00:00.300");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 3.6968377223398314, "00:00.350");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 3.9041316701949484, "00:00.400");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 3.286289062850121, "00:00.450");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 3.0905325507801478, "00:00.500");
    });
  });

  describe("$([], $([]), $([]))", function() {
    it("returns a GainNode that is connected with $([]) x2", function() {
      var synth = neume.Neume(function($) {
        return $([ 1 ], $([ 2 ]), $([ 3 ]));
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 2,
              inputs: []
            },
            inputs: [ DC(1) ]
          },
          {
            name: "GainNode",
            gain: {
              value: 3,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
    });
  });
});
