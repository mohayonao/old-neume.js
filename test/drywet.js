"use strict";

var NeuDryWet = require("../src/drywet");

describe("NeuDryWet", function() {
  var audioContext;

  beforeEach(function() {
    audioContext = new window.AudioContext();
  });

  describe("(context, inputs, wetNode, 1)", function() {
    it("returns wetNode", function() {
      var inputs  =  [ audioContext.createOscillator(), audioContext.createOscillator() ];
      var wetNode = audioContext.createConvolver();

      var mixNode = new NeuDryWet(audioContext, inputs, wetNode, 1);

      assert.deepEqual(mixNode.toJSON(), {
        name: "ConvolverNode",
        normalize: true,
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
          }
        ]
      });
    });
  });

  describe("(context, inputs, wetNode, 0)", function() {
    it("returns inputs[0]", function() {
      var inputs  = [ audioContext.createOscillator() ];
      var wetNode = audioContext.createConvolver();

      var mixNode = new NeuDryWet(audioContext, inputs, wetNode, 0);

      assert.deepEqual(mixNode.toJSON(), {
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
    it("returns sum inputs", function() {
      var inputs  = [ audioContext.createOscillator(), audioContext.createOscillator() ];
      var wetNode = audioContext.createConvolver();

      var mixNode = new NeuDryWet(audioContext, inputs, wetNode, 0);

      assert.deepEqual(mixNode.toJSON(), {
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
          }
        ]
      });
    });
  });

  describe("(context, inputs, wetNode, 0.25)", function() {
    it("returns mixNode", function() {
      var inputs  = [ audioContext.createOscillator() ];
      var wetNode = audioContext.createConvolver();

      var mixNode = new NeuDryWet(audioContext, inputs, wetNode, 0.25);

      assert.deepEqual(mixNode.toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 0.25,
              inputs: []
            },
            inputs: [
              {
                name: "ConvolverNode",
                normalize: true,
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
              }
            ]
          },
          {
            name: "GainNode",
            gain: {
              value: 0.75,
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
          }
        ]
      });
    });
  });

  describe("(context, inputs, wetNode, node)", function() {
    it("return mixNode", function() {
      var node = audioContext.createGain();
      var inputs  = [ audioContext.createOscillator() ];
      var wetNode = audioContext.createConvolver();

      node.$id = "mix";

      var mixNode = new NeuDryWet(audioContext, inputs, wetNode, node);

      assert.deepEqual(mixNode.toJSON(), {
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
              inputs: [
                {
                  name: "GainNode#mix",
                  gain: {
                    value: 1,
                    inputs: []
                  },
                  inputs: []
                }
              ]
            },
            inputs: [
              {
                name: "ConvolverNode",
                normalize: true,
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
              }
            ]
          },
          {
            name: "GainNode",
            gain: {
              value: 0,
              inputs: [
                DC(1),
                {
                  name: "GainNode",
                  gain: {
                    value: -1,
                    inputs: []
                  },
                  inputs: [
                    {
                      name: "GainNode#mix",
                      gain: {
                        value: 1,
                        inputs: []
                      },
                      inputs: []
                    }
                  ]
                }
              ]
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
          }
        ]
      });
    });
  });

});
