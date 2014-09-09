"use strict";

var neuma = require("../src/neuma");

neuma.use(require("../src/ugen/array"));

describe("ugen/array", function() {
  var synth = null;

  describe("$([])", function() {
    /*
     * +---------+
     * | DC(1)   |
     * +---------+
     *   |
     * +------------+
     * | GainNode   |
     * | - gain: 0  |
     * +------------+
     *   |
     */
    it("returns a GainNode that is connected with a DC(0)", function() {
      synth = neuma.Neuma(function($) {
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

  describe("$([ 1, 2, 3 ])", function() {
    beforeEach(function() {
      synth = neuma.Neuma(function($) {
        return $([ 1, 2, 3 ], { mode: "wrap", curve: "lin", lag: 0.1 });
      })();
    });
    /*
     * +---------+
     * | DC(1)   |
     * +---------+
     *   |
     * +------------+
     * | GainNode   |
     * | - gain: 1  |
     * +------------+
     *   |
     */
    it("returns a GainNode that is connected with a DC(0)", function() {
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
      var audioContext = neuma._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      assert(outlet.gain.value === 1, "00:00.000");

      synth.next(0.100);

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1, "00:00.050");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1, "00:00.100");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1.5, "00:00.150");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 2, "00:00.200");

      synth.prev(0.200);

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1.5000000000000002, "00:00.250");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1.0000000000000004, "00:00.300");

      synth.at(0.300, 5);

      audioContext.$process(0.050);
      assert(outlet.gain.value === 1.9999999999999993, "00:00.350");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 2.9999999999999987, "00:00.400");
    });
  });

  describe("$([ 2, 3 ], $(sin), $(sin))", function() {
    /*
     * +--------+  +--------+
     * | $(sin) |  | $(sin) |
     * +--------+  +--------+
     *   |           |
     * +---------------+
     * | GainNode      |
     * | - gain: value |
     * +---------------+
     *   |
     */
    beforeEach(function() {
      synth = neuma.Neuma(function($) {
        return $([ 2, 3 ], $("sin"), $("sin"));
      })();
    });
    it("returns a GainNode that is connected with $(sin) x2", function() {
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 2,
          inputs: []
        },
        inputs: [
          {
            name: "OscillatorNode",
            type: "sine",
            frequency: {
              value: 440,
              inputs: []
            },
            detune: {
              value: 0,
              inputs: []
            },
            inputs: []
          },
          {
            name: "OscillatorNode",
            type: "sine",
            frequency: {
              value: 440,
              inputs: []
            },
            detune: {
              value: 0,
              inputs: []
            },
            inputs: []
          },
        ]
      });
    });
  });

});
