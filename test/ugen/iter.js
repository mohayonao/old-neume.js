"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/iter"));

describe("ugen/iter", function() {
  var Neume = null;

  before(function() {
    Neume = neume.exports(new global.AudioContext());
  });

  describe("$(iter)", function() {
    it("returns a GainNode that is connected with a DC(1)", function() {
      var synth = new Neume(function($) {
        return $("iter");
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

  describe("$(iter iter:iter)", function() {
    var iter = null;
    beforeEach(function() {
      iter = {
        index: 0,
        values: [ 3, 1, 4, 1, 5 ],
        next: function() {
          if (iter.index < iter.values.length) {
            return { value: iter.values[iter.index++], done: false };
          }
          return { value: undefined, done: true };
        },
        reset: function() {
          iter.index = 0;
        }
      };
    });
    it("returns a GainNode that is connected with a DC(1)", function() {
      var synth = new Neume(function($) {
        return $("iter", { init: 3, iter: iter });
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
        return $("iter", { iter: iter });
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0).on("end", function(e) {
        ended = e.playbackTime;
      });

      synth.next(0.100);
      synth.next(0.200);
      synth.next(0.300);
      synth.next(0.400);
      synth.next(0.500);
      synth.next(0.600);

      audioContext.$processTo("00:00.600");
      assert(outlet.gain.$valueAtTime(0.000) === 3);
      assert(outlet.gain.$valueAtTime(0.050) === 3);
      assert(outlet.gain.$valueAtTime(0.100) === 1);
      assert(outlet.gain.$valueAtTime(0.150) === 1);
      assert(outlet.gain.$valueAtTime(0.200) === 4);
      assert(outlet.gain.$valueAtTime(0.250) === 4);
      assert(outlet.gain.$valueAtTime(0.300) === 1);
      assert(outlet.gain.$valueAtTime(0.350) === 1);
      assert(outlet.gain.$valueAtTime(0.400) === 5);
      assert(outlet.gain.$valueAtTime(0.450) === 5);
      assert(outlet.gain.$valueAtTime(0.500) === 5);
      assert(outlet.gain.$valueAtTime(0.600) === 5);

      assert(ended === 0.500);
    });

    it("works with null", function() {
      var synth = new Neume(function($) {
        return $("iter");
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0).on("end", function(e) {
        ended = e.playbackTime;
      });

      synth.next(0.100);
      synth.next(0.200);

      audioContext.$processTo("00:00.600");
      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(outlet.gain.$valueAtTime(0.150) === 0);
      assert(outlet.gain.$valueAtTime(0.200) === 0);
      assert(outlet.gain.$valueAtTime(0.250) === 0);

      assert(ended === 0.000);
    });

    it("works with setValue", function() {
      var synth = new Neume(function($) {
        return $("iter", { iter: iter });
      })();

      var audioContext = Neume.audioContext;
      var outlet = synth.toAudioNode().$inputs[0];

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      synth.setValue(0.100, 0);
      synth.setValue(0.400, {
        next: function() {
          return 30;
        }
      });
      synth.next(0.100);
      synth.next(0.200);
      synth.next(0.300);
      synth.next(0.400);
      synth.next(0.500);
      synth.next(0.600);

      audioContext.$processTo("00:00.500");
      assert(outlet.gain.$valueAtTime(0.050) === 3);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(outlet.gain.$valueAtTime(0.150) === 0);
      assert(outlet.gain.$valueAtTime(0.200) === 0);
      assert(outlet.gain.$valueAtTime(0.250) === 0);
      assert(outlet.gain.$valueAtTime(0.300) === 0);
      assert(outlet.gain.$valueAtTime(0.350) === 0);
      assert(outlet.gain.$valueAtTime(0.400) === 30);
      assert(outlet.gain.$valueAtTime(0.450) === 30);
      assert(outlet.gain.$valueAtTime(0.500) === 30);
    });
  });

  describe("$(iter, $(iter), $(iter))", function() {
    it("returns a GainNode that is connected with $(iter) x2", function() {
      var synth = new Neume(function($) {
        return $("iter", $("iter"), $("iter"));
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
});
