"use strict";

var neuma = require("../src/neuma");

neuma.use(require("../src/ugen/osc"));
neuma.use(require("../src/ugen/add"));

describe("ugen/add", function() {
  describe("$(+ 0)", function() {
    /*
     * +-----------+
     * | GainNode  |
     * | - gain: 1 |
     * +-----------+
     *   |
     */
    it("returns a GainNode", function() {
      var synth = neuma.Neuma(function($) {
        return $("+", 0);
      })();

      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: []
      });
    });
  });

  describe("$(+ 1 2 3)", function() {
    /*
     * +-------+
     * | DC(6) |
     * +-------+
     *   |
     * +-----------+
     * | GainNode  |
     * | - gain: 1 |
     * +-----------+
     *   |
     */
    it("return a GainNode that is connected with a DC(6)", function() {
      var synth = neuma.Neuma(function($) {
        return $("+", 1, 2, 3);
      })();

      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ DC(6) ]
      });

      assert(synth.outlet.$inputs[0].buffer.getChannelData(0)[0] === 6);
    });
  });

  describe("$(+ $(sin freq:1) $(sin freq:2) $(sin freq:3))", function() {
    /*
     * +----------------+  +----------------+  +----------------+
     * | $(sin, freq:1) |  | $(sin, freq:2) |  | $(sin, freq:3) |
     * +----------------+  +----------------+  +----------------+
     *   |                   |                   |
     * +-------------------------------------------+
     * | GainNode                                  |
     * | - gain: 1                                 |
     * +-------------------------------------------+
     *   |
     */
    it("returns a GainNode that is connected with $(sin) x 3", function() {
      var synth = neuma.Neuma(function($) {
        return $("+", $("sin", { freq: 1 }), $("sin", { freq: 2 }), $("sin", { freq: 3 }));
      })();

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
              value: 1,
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
              value: 2,
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
              value: 3,
              inputs: []
            },
            detune: {
              value: 0,
              inputs: []
            },
            inputs: []
          }
        ]
      });
    });
  });

  describe("$(+ mul:0.5 $(sin))", function() {
    /*
     * +----------------+
     * | $(sin, freq:1) |
     * +----------------+
     *   |
     * +-------------+
     * | GainNode    |
     * | - gain: 0.5 |
     * +-------------+
     *   |
     */
    it("returns a GainNode(0.5) that is connected with a $(sin)", function() {
      var synth = neuma.Neuma(function($) {
        return $("+", { mul: 0.5 }, $("sin"));
      })();

      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 0.5,
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
          }
        ]
      });
    });
  });

});
