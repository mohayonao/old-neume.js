"use strict";

var neume = require("../../src/neume");

neume.use(require("../../src/ugen/array"));

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

      synth.next(0.100);
      synth.at(0.250, 4);
      synth.prev(0.400);

      audioContext.$process(0.500);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 1);
      assert(outlet.gain.$valueAtTime(0.150) === 1);
      assert(outlet.gain.$valueAtTime(0.200) === 1);
      assert(outlet.gain.$valueAtTime(0.250) === 4);
      assert(outlet.gain.$valueAtTime(0.300) === 4);
      assert(outlet.gain.$valueAtTime(0.350) === 4);
      assert(outlet.gain.$valueAtTime(0.400) === 3);
      assert(outlet.gain.$valueAtTime(0.450) === 3);
      assert(outlet.gain.$valueAtTime(0.500) === 3);
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

      synth.setValue(0.100, 0);
      synth.setValue(0.400, [ 0, 10, 20, 30, 40 ]);
      synth.next(0.100);
      synth.at(0.250, 4);
      synth.prev(0.400);

      audioContext.$process(0.500);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 1);
      assert(outlet.gain.$valueAtTime(0.150) === 1);
      assert(outlet.gain.$valueAtTime(0.200) === 1);
      assert(outlet.gain.$valueAtTime(0.250) === 4);
      assert(outlet.gain.$valueAtTime(0.300) === 4);
      assert(outlet.gain.$valueAtTime(0.350) === 4);
      assert(outlet.gain.$valueAtTime(0.400) === 30);
      assert(outlet.gain.$valueAtTime(0.450) === 30);
      assert(outlet.gain.$valueAtTime(0.500) === 30);
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

      synth.next(0.100);
      synth.at(0.250, 4);
      synth.prev(0.400);

      audioContext.$process(0.500);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 0.683772233983162 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 0.9               , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 0.9683772233983161, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 3.0413167019494862, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 3.6968377223398314, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 3.904131670194949 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 3.2859115382508213, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 3.090413167019495 , 1e-6));
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
