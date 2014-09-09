"use strict";

var neuma = require("../src/neuma");

neuma.use(require("../src/ugen/osc"));
neuma.use(require("../src/ugen/adsr"));

describe("ugen/adsr", function() {
  var synth = null;

  describe("$(adsr)", function() {
    /*
     * +-------+
     * | DC(1) |
     * +-------+
     *   |
     * +---------------+
     * | GainNode      |
     * | - gain: value |
     * +---------------+
     *   |
     */
    beforeEach(function() {
      synth = neuma.Neuma(function($) {
        return $("adsr", { a: 0.05, d: 0.1, s:0.8, r:0.15, curve:"lin" });
      })();
    });
    it("returns a GainNode that is connected with DC(1)", function() {
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 0.0001,
          inputs: []
        },
        inputs: [ DC(1) ]
      });
    });
    it("works", function() {
      var audioContext = neuma._.findAudioContext(synth);
      var outlet = synth.outlet;
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      });

      assert(outlet.gain.value === 0.0001, "00:00.000");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.0001, "00:00.050");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.0001, "00:00.100");

      audioContext.$process(0.025);
      assert(outlet.gain.value === 0.5000499999999998, "00:00.175");

      audioContext.$process(0.025);
      assert(outlet.gain.value === 0.9999999999999994, "00:00.150");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.9, "00:00.200");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.8, "00:00.250");

      synth.release(0.4);

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.8, "00:00.300");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.8, "00:00.350");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.8, "00:00.400");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.5333666666666671, "00:00.450");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.2667333333333338, "00:00.500");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.00010000000000062165, "00:00.550");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.0001, "00:00.600");

      assert(ended === 0.55);
    });
    it("works with stop", function() {
      var audioContext = neuma._.findAudioContext(synth);
      var outlet = synth.outlet;
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0.100).on("end", function(e) {
        ended = e.playbackTime;
      });
      synth.stop(0.200);

      assert(outlet.gain.value === 0.0001, "00:00.000");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.0001, "00:00.050");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.0001, "00:00.100");

      audioContext.$process(0.025);
      assert(outlet.gain.value === 0.5000499999999998, "00:00.175");

      audioContext.$process(0.025);
      assert(outlet.gain.value === 0.9999999999999994, "00:00.150");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.9, "00:00.200");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.8820408163265303, "00:00.250");

      synth.release(0.4);

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.8820408163265303, "00:00.300");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.8820408163265303, "00:00.350");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 0.8820408163265303, "00:00.400");

      assert(ended === 0);
    });
  });

  describe("$(adsr, $(sin), $(sin))", function() {
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
        return $("adsr", $("sin"), $("sin"));
      })();
    });
    it("returns a GainNode that is connected with $(sin) x2", function() {
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 0.0001,
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
