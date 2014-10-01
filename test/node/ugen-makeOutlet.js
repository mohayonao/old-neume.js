"use strict";

var NeuContext = require("../../src/context");
var makeOutlet = require("../../src/node/ugen-makeOutlet");

describe("makeOutlet", function() {
  var context = null;
  var node = null;
  var unit = null;

  beforeEach(function() {
    context = new NeuContext(new window.AudioContext().destination);
    node = context.createOscillator();
    unit = { $outlet: node, $offset: 0 };
  });

  describe("(context, null, {})", function() {
    it("returns { outlet: null, offset: 0 }", function() {
      assert.deepEqual(makeOutlet(context, null, {}), {
        outlet: null, offset: 0
      });
    });
  });

  describe("(context, unit, {})", function() {
    it("returns { outlet: node, offset: 0 }", function() {
      assert.deepEqual(makeOutlet(context, unit, {}), {
        outlet: node, offset: 0
      });
    });
  });

  describe("(context, unit(offset:10), {})", function() {
    it("returns { outlet: node, offset: 10 }", function() {
      unit.$offset = 10;
      assert.deepEqual(makeOutlet(context, unit, {}), {
        outlet: node, offset: 10
      });
    });
  });

  describe("(context, unit, { mul: 1 })", function() {
    it("returns { outlet: node, offset: 0 }", function() {
      assert.deepEqual(makeOutlet(context, unit, {}), {
        outlet: node, offset: 0
      });
    });
  });

  describe("(context, unit(offset:10), { mul: 1 })", function() {
    it("returns { outlet: node, offset: 10 }", function() {
      unit.$offset = 10;
      assert.deepEqual(makeOutlet(context, unit, {}), {
        outlet: node, offset: 10
      });
    });
  });

  describe("(context, unit, { add: 0 })", function() {
    it("returns { outlet: node, offset: 0 }", function() {
      assert.deepEqual(makeOutlet(context, unit, {}), {
        outlet: node, offset: 0
      });
    });
  });

  describe("(context, unit(offset:10), { add: 0 })", function() {
    it("returns { outlet: node, offset: 10 }", function() {
      unit.$offset = 10;
      assert.deepEqual(makeOutlet(context, unit, {}), {
        outlet: node, offset: 10
      });
    });
  });

  describe("(context, unit, { mul: 1, add: 0 })", function() {
    it("returns { outlet: node, offset: 0 }", function() {
      assert.deepEqual(makeOutlet(context, unit, {}), {
        outlet: node, offset: 0
      });
    });
  });

  describe("(context, unit(offset:10), { mul: 1, add: 0 })", function() {
    it("returns { outlet: node, offset: 10 }", function() {
      unit.$offset = 10;
      assert.deepEqual(makeOutlet(context, unit, {}), {
        outlet: node, offset: 10
      });
    });
  });

  describe("(context, unit, { mul: 0, add: 440 })", function() {
    it("returns { outlet: null, offset: 440 }", function() {
      assert.deepEqual(makeOutlet(context, unit, { mul: 0, add: 440 }), {
        outlet: null, offset: 440
      });
    });
  });

  describe("(context, unit(offset:10), { mul: 0, add: 440 })", function() {
    it("returns { outlet: null, offset: 450 }", function() {
      unit.$offset = 10;
      assert.deepEqual(makeOutlet(context, unit, { mul: 0, add: 440 }), {
        outlet: null, offset: 450
      });
    });
  });

  describe("(context, unit, { mul: 0, add: node })", function() {
    it("returns { outlet: node, offset: 0 }", function() {
      var amp = context.createGain();
      assert.deepEqual(makeOutlet(context, unit, { mul: 0, add: amp }), {
        outlet: amp, offset: 0
      });
    });
  });

  describe("(context, unit(offset:10), { mul: 0, add: node })", function() {
    it("returns { outlet: node, offset: 10 }", function() {
      var amp = context.createGain();
      unit.$offset = 10;
      assert.deepEqual(makeOutlet(context, unit, { mul: 0, add: amp }), {
        outlet: amp, offset: 10
      });
    });
  });

  describe("(context, unit, { mul: 0 })", function() {
    it("returns { outlet: null, offset: 0 }", function() {
      assert.deepEqual(makeOutlet(context, unit, { mul: 0 }), {
        outlet: null, offset: 0
      });
    });
  });

  describe("(context, unit(offset:10), { mul: 0 })", function() {
    it("returns { outlet: null, offset: 10 }", function() {
      unit.$offset = 10;
      assert.deepEqual(makeOutlet(context, unit, { mul: 0 }), {
        outlet: null, offset: 10
      });
    });
  });

  describe("(context, unit, { mul: 2, add: 0 })", function() {
    it("connects { outlet: node * GainNode(2), offset: 0 }", function() {
      var outlet = makeOutlet(context, unit, { mul: 2, add: 0 });

      assert.deepEqual(outlet.outlet.toJSON(), {
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
          }
        ]
      });
      assert(outlet.offset === 0);
    });
  });

  describe("(context, unit(offset:10), { mul: 2, add: 0 })", function() {
    it("connects { outlet: node * GainNode(2), offset: 10 }", function() {
      unit.$offset = 10;

      var outlet = makeOutlet(context, unit, { mul: 2, add: 0 });

      assert.deepEqual(outlet.outlet.toJSON(), {
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
          }
        ]
      });
      assert(outlet.offset === 10);
    });
  });

  describe("(context, node[gain:1], { mul: 0.5 })", function() {
    it("return { outlet: gain(0.5), offset: 0 }", function() {
      node = context.createGain();
      node.$maddOptimizable = true;

      unit.$outlet = node;

      var outlet = makeOutlet(context, unit, { mul: 0.5 });

      assert.deepEqual(outlet.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 0.5,
          inputs: []
        },
        inputs: []
      });
      assert(outlet.offset === 0);
    });
  });

  describe("(context, unit, { add: number })", function() {
    it("returns { outlet: node, offset: number }", function() {
      assert.deepEqual(makeOutlet(context, unit, { add: 220 }), {
        outlet: node, offset: 220
      });
    });
  });

  describe("(context, unit(offset:10), { add: number })", function() {
    it("returns { outlet: node, offset: number + 10 }", function() {
      unit.$offset = 10;
      assert.deepEqual(makeOutlet(context, unit, { add: 220 }), {
        outlet: node, offset: 230
      });
    });
  });

  describe("(context, unit, { add: node })", function() {
    it("returns { outlet: node + GainNode(node), offset: 0 }", function() {
      var amp = context.createGain();
      var outlet = makeOutlet(context, unit, { add: amp });

      amp.$id = "amp";

      assert.deepEqual(outlet.outlet.toJSON(), {
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
            name: "GainNode#amp",
            gain: {
              value: 1,
              inputs: []
            },
            inputs: []
          }
        ]
      });
      assert(outlet.offset === 0);
    });
  });

  describe("(context, unit(offset:10), { add: node })", function() {
    it("returns { outlet: node + GainNode(node), offset: 10 }", function() {
      unit.$offset = 10;

      var amp = context.createGain();
      var outlet = makeOutlet(context, unit, { add: amp });

      amp.$id = "amp";

      assert.deepEqual(outlet.outlet.toJSON(), {
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
            name: "GainNode#amp",
            gain: {
              value: 1,
              inputs: []
            },
            inputs: []
          }
        ]
      });
      assert(outlet.offset === 10);
    });
  });

});
