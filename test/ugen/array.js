"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/array"));

describe("ugen/array", function() {
  var Neume = null;

  before(function() {
    Neume = neume.exports(new global.AudioContext());
  });

  describe("$([])", function() {
    it("returns a GainNode that is connected with a DC(1)", function() {
      var synth = new Neume(function($) {
        return $([]);
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

  describe("$[ 1, 2, 3, 4, 5 ]", function() {
    it("returns a GainNode that is connected with a DC(1)", function() {
      var synth = new Neume(function($) {
        return $([ 1, 2, 3, 4, 5 ]);
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
        return $([ 0, 1, 2, 3, 4 ]);
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      synth.next(0.100);
      synth.at(0.250, 4);
      synth.prev(0.400);

      audioContext.$processTo("00:00.500");
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
      var synth = new Neume(function($) {
        return $([ 0, 1, 2, 3, 4 ]);
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      synth.setValue(0.100, 0);
      synth.setValue(0.400, [ 0, 10, 20, 30, 40 ]);
      synth.next(0.100);
      synth.at(0.250, 4);
      synth.prev(0.400);

      audioContext.$processTo("00:00.500");
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

  describe("$([], $([]), $([]))", function() {
    it("returns a GainNode that is connected with $([]) x2", function() {
      var synth = new Neume(function($) {
        return $([ 2 ], $([ 3 ]), $([ 4 ]));
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
              value: 2,
              inputs: []
            },
            inputs: [
              {
                name: "GainNode",
                gain: {
                  value: 3,
                  inputs: []
                },
                inputs: [ DC(1) ]
              },
              {
                name: "GainNode",
                gain: {
                  value: 4,
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
});
