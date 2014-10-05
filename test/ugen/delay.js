"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/delay"));

describe("ugen/delay", function() {
  var Neume = null;

  before(function() {
    Neume = neume.exports(new window.AudioContext());
  });

  describe("$(delay delay:0.5 $(delay))", function() {
    /*
     * +----------+
     * | $(delay) |
     * +----------+
     *   |
     * +------------------+
     * | DelayNode        |
     * | - delayTime: 0.5 |
     * +------------------+
     *   |
     */
    it("return a DelayNode that is connected with $(delay)", function() {
      var synth = new Neume(function($) {
        return $("delay", { delay: 0.5 }, $("delay"));
      })();

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "DelayNode",
        delayTime: {
          value: 0.5,
          inputs: []
        },
        inputs: [
          {
            name: "DelayNode",
            delayTime: {
              value: 0,
              inputs: []
            },
            inputs: []
          }
        ]
      });

      assert(synth.toAudioNode().$maxDelayTime === 0.5);
    });
  });
  describe("$(delay delay:$(delay) $(delay))", function() {
    it("return a DelayNode that is connected with $(delay)", function() {
      var synth = new Neume(function($) {
        return $("delay", { delay: $("delay") }, $("delay"));
      })();

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "DelayNode",
        delayTime: {
          value: 0,
          inputs: [
            {
              name: "DelayNode",
              delayTime: {
                value: 0,
                inputs: []
              },
              inputs: []
            }
          ]
        },
        inputs: [
          {
            name: "DelayNode",
            delayTime: {
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
