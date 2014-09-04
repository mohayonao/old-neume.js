"use strict";

var neuma = require("../src/neuma");

neuma.use(require("../src/ugen/osc"));
neuma.use(require("../src/ugen/line"));

describe("ugen/line", function() {
  var synth = null;

  describe("$(line start:880, end:440, dur:0.200)", function() {
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
        return $("line", { start: 880, end: 440, dur: 0.200 });
      })();
    });
    it("returns a GainNode that is connected with DC(1)", function() {
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 880,
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
      assert(outlet.gain.value === 880, "00:00.000");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 880, "00:00.050");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 880, "00:00.100");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 770, "00:00.150");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 660, "00:00.200");

      audioContext.$process(0.055);
      assert(outlet.gain.value === 539, "00:00.255");

      audioContext.$process(0.045);
      assert(outlet.gain.value === 440.00000000000006, "00:00.300");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 440, "00:00.350");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 440, "00:00.400");

      assert(ended === 0.30000000000000004);
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

      assert(outlet.gain.value === 880, "00:00.000");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 880, "00:00.050");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 880, "00:00.100");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 770, "00:00.150");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 660, "00:00.200");

      audioContext.$process(0.055);
      assert(outlet.gain.value === 640.2448979591834, "00:00.255");

      audioContext.$process(0.045);
      assert(outlet.gain.value === 640.2448979591834, "00:00.300");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 640.2448979591834, "00:00.350");

      audioContext.$process(0.050);
      assert(outlet.gain.value === 640.2448979591834, "00:00.400");

      assert(ended === 0);
    });
  });

  describe("$(line, $(sin), $(sin))", function() {
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
        return $("line", $("sin"), $("sin"));
      })();
    });
    it("returns a GainNode that is connected with $(sin) x2", function() {
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
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
