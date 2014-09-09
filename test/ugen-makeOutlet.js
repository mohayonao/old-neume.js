"use strict";

var NeuContext = require("../src/context");
var makeOutlet = require("../src/ugen-makeOutlet");

describe("makeOutlet", function() {
  var context = null;
  var node = null;

  beforeEach(function() {
    context = new NeuContext(new window.AudioContext());
    node = context.createOscillator();
  });

  describe("(context, null, {})", function() {
    it("returns null", function() {
      assert(makeOutlet(context, null, {}) === null);
    });
  });

  describe("(context, node, {})", function() {
    it("returns the node without change", function() {
      assert(makeOutlet(context, node, {}) === node);
    });
  });

  describe("(context, node, { mul: 1 })", function() {
    it("returns the node without change", function() {
      assert(makeOutlet(context, node, {}) === node);
    });
  });

  describe("(context, node, { add: 0 })", function() {
    it("returns the node without change", function() {
      assert(makeOutlet(context, node, {}) === node);
    });
  });

  describe("(context, node, { mul: 1, add: 0 })", function() {
    it("returns the node without change", function() {
      assert(makeOutlet(context, node, {}) === node);
    });
  });

  describe("(context, node, { mul: 0, add: number })", function() {
    it("returns a DC(number)", function() {
      /*
       * +------------+
       * | DC(number) |
       * +------------+
       *   |
       */
      var outlet = makeOutlet(context, node, { mul: 0, add: 440 });

      assert(outlet.toJSON(), DC(440));
      assert(outlet.buffer.getChannelData(0)[0] === 440);
    });
  });

  describe("(context, node, { mul: 0, add: add })", function() {
    it("returns the add node", function() {
      /*
       * +-----+
       * | add |
       * +-----+
       *   |
       */
      var amp = context.createGain();
      var outlet = makeOutlet(context, node, { mul: 0, add: amp });

      amp.$id = "amp";

      assert(outlet.toJSON(), {
        name: "GainNode#amp",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: []
      });
    });
  });

  describe("(context, node, { mul: 0 })", function() {
    it("returns a DC(0)", function() {
      /*
       * +-------+
       * | DC(0) |
       * +-------+
       *   |
       */
      var outlet = makeOutlet(context, node, { mul: 0 });

      assert(outlet.toJSON(), DC(0));
      assert(outlet.buffer.getChannelData(0)[0] === 0);
    });
  });

  describe("(context, node, { mul: 2, add: 0 })", function() {
    it("connects to a GainNode(2) that is connected with the node", function() {
      /**
       * +------+
       * | node |
       * +------+
       *   |
       * +-----------+
       * | GainNode  |
       * | - gain: 2 |
       * +-----------+
       *   |
       */
      var outlet = makeOutlet(context, node, { mul: 2, add: 0 });

      assert.deepEqual(outlet.toJSON(), {
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
    });
  });

  describe("(context, node[gain:1], { mul: 0.5 })", function() {
    it("changes GainNode.value if has a $maddOptimizable option", function() {
      /**
      *    |
       * +-----------------+
       * | (node) GainNode |
       * | - gain: 0.5     |
       * +-----------------+
       *   |
       */
      node = context.createGain();
      node.$maddOptimizable = true;

      var outlet = makeOutlet(context, node, { mul: 0.5 });

      assert.deepEqual(outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 0.5,
          inputs: []
        },
        inputs: []
      });
    });
  });

  describe("(context, node, { add: number })", function() {
    it("returns a GainNode that is connected with the node and a DC(number)", function() {
      /*
       * +------+  +------------+
       * | node |  | DC(number) |
       * +------+  +------------+
       *   |         |
       * +-------------+
       * | GainNode    |
       * | - gain: 1   |
       * +-------------+
       *   |
       */
      var outlet = makeOutlet(context, node, { add: 440 });

      assert.deepEqual(outlet.toJSON(), {
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
          DC(440)
        ]
      });
      assert(outlet.$inputs[1].buffer.getChannelData(0)[0] === 440);
    });
  });

  describe("(context, node, { add: add })", function() {
    it("returns a GainNode that is connected with the node and the add node", function() {
      /*
       * +------+  +-----+
       * | node |  | add |
       * +------+  +-----+
       *   |         |
       * +---------------+
       * | GainNode      |
       * | - gain: 1     |
       * +---------------+
       *  |
       */
      var amp = context.createGain();
      var outlet = makeOutlet(context, node, { add: amp });

      amp.$id = "amp";

      assert.deepEqual(outlet.toJSON(), {
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
    });
  });

});
