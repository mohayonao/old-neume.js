"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/delay"));

describe("ugen/delay", function() {
  var Neume = null;

  before(function() {
    Neume = neume(new global.AudioContext());
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
      var synth = new Neume.Synth(function($) {
        return $("delay", { delay: 0.5 }, $("delay"));
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
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
                inputs: [ DC(0) ]
              }
            ]
          }
        ]
      });

      assert(synth.toAudioNode().$inputs[0].$maxDelayTime === 0.5);
    });
  });
  describe("$(delay delay:$(delay) $(delay))", function() {
    it("return a DelayNode that is connected with $(delay)", function() {
      var synth = new Neume.Synth(function($) {
        return $("delay", { delay: $("delay") }, $("delay"));
      });

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
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
                  inputs: [ DC(0) ]
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
                inputs: [ DC(0) ]
              }
            ]
          }
        ]
      });
    });
  });

  describe("parameter check", function() {
    it("full name", function() {
      var json = new Neume.Synth(function($) {
        return $("delay", { delayTime: 1 });
      }).toAudioNode().toJSON().inputs[0];

      assert(json.delayTime.value === 1);
    });
    it("alias", function() {
      var json = new Neume.Synth(function($) {
        return $("delay", { delay: 1 });
      }).toAudioNode().toJSON().inputs[0];

      assert(json.delayTime.value === 1);
    });
  });

});
