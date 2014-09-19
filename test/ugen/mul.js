"use strict";

var neume = require("../../src/neume");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/mul"));

describe("ugen/mul", function() {
  var Neume = null;

  before(function() {
    Neume = neume.exports(new window.AudioContext());
  });

  describe("$(*)", function() {
    /*
     * +-------+
     * | DC(1) |
     * +-------+
     *   |
     */
    it("returns a DC(1)", function() {
      var synth = new Neume(function($) {
        return $("*");
      })();

      assert(synth.outlet === null);
    });
  });

  describe("$(* $(sin) 0)", function() {
    /*
     * +-------+
     * | DC(0) |
     * +-------+
     *   |
     */
    it("returns a DC(0)", function() {
      var synth = new Neume(function($) {
        return $("*", $("sin"), 0);
      })();

      assert(synth.outlet === null);
    });
  });

  describe("$(* $(sin) 1)", function() {
    /*
     * +--------+
     * | $(sin) |
     * +--------+
     *   |
     */
    it("returns $(sin)", function() {
      var synth = new Neume(function($) {
        return $("*", $("sin"), 1);
      })();

      assert.deepEqual(synth.outlet.toJSON(), {
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
      });
    });
  });

  describe("$(* $(sin) 0.5)", function() {
    /*
     * +--------+
     * | $(sin) |
     * +--------+
     *   |
     * +-------------+
     * | GainNode    |
     * | - gain: 0.5 |
     * +-------------+
     *   |
     */
    it("returns a GainNode(0.5) that is connected with $(sin)", function() {
      var synth = new Neume(function($) {
        return $("*", $("sin"), 0.5);
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

  describe("$(* 1 $(sin freq:1) 2 $(sin freq:2) 3 $(sin freq:3))", function() {
    /*
     * +----------------+
     * | $(sin, freq:1) |
     * +----------------+
     *   |
     * +-----------+
     * | GainNode  |  +----------------+
     * | - gain: 0 |--| $(sin, freq:2) |
     * +-----------+  +----------------+
     *   |
     * +-----------+
     * | GainNode  |  +----------------+
     * | - gain: 0 |--| $(sin, freq:3) |
     * +-----------+  +----------------+
     *   |
     * +-----------+
     * | GainNode  |
     * | - gain: 6 |
     * +-----------+
     *   |
     */
    it("returns chain of GainNodes", function() {
      var synth = new Neume(function($) {
        return $("*", 1, $("sin", { freq: 1 }), 2, $("sin", { freq: 2 }), 3, $("sin", { freq: 3 }));
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 6,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 0,
              inputs: [
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
            },
            inputs: [
              {
                name: "GainNode",
                gain: {
                  value: 0,
                  inputs: [
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
                    }
                  ]
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
                  }
                ]
              }
            ]
          }
        ]
      });
    });
  });

});
