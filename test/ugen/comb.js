"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/comb"));

describe("ugen/comb", function() {
  var Neume = null;

  before(function() {
    Neume = neume.exports(new global.AudioContext());
  });

  describe("$(comb, $(osc))", function() {
    it("graph", function() {
      var synth = new Neume(function($) {
        return $("comb", $("osc"));
      })();

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [ DC(0) ]
      });
    });
  });

  describe("$(comb gain:0.3, ffGain:0.4, fbGain:0.5, $(osc))", function() {
    it("graph", function() {
      var synth = new Neume(function($) {
        return $("comb", {
          gain: 0.3, ffGain: 0.4, fbGain: 0.5
        }, $("osc"));
      })();

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 1,
              inputs: []
            },
            inputs: [
              {
                name: "GainNode",
                gain: {
                  value: 0.3,
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
              },
              {
                name: "GainNode",
                gain: {
                  value: 0.4,
                  inputs: []
                },
                inputs: [
                  {
                    name: "DelayNode",
                    delayTime: {
                      value: 0.001,
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
              },
              {
                name: "GainNode",
                gain: {
                  value: 0.5,
                  inputs: []
                },
                inputs: [
                  {
                    name: "DelayNode",
                    delayTime: {
                      value: 0.001,
                      inputs: []
                    },
                    inputs: [
                      "<circular:GainNode>"
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });
    });
  });

  describe("$(comb gain:0.3, delay: 0, ffGain:0.4, fbGain:0.5, $(osc))", function() {
    it("graph", function() {
      var synth = new Neume(function($) {
        return $("comb", {
          gain: 0.3, delay: 0, ffGain: 0.4, fbGain: 0.5
        }, $("osc"));
      })();

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 1,
              inputs: []
            },
            inputs: [
              {
                name: "GainNode",
                gain: {
                  value: 0.3,
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
              },
              {
                name: "GainNode",
                gain: {
                  value: 0.4,
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
              },
              {
                name: "GainNode",
                gain: {
                  value: 0.5,
                  inputs: []
                },
                inputs: [
                  "<circular:GainNode>"
                ]
              }
            ]
          }
        ]
      });
    });
  });

  describe("$(comb, fbGain:$(osc) $(osc))", function() {
    it("graph", function() {
      var synth = new Neume(function($) {
        return $("comb", { fbGain: $("saw"), delay: $("pulse") }, $("osc"));
      })();

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
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
                name: "GainNode",
                gain: {
                  value: 0,
                  inputs: [
                    {
                      name: "OscillatorNode",
                      type: "sawtooth",
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
                },
                inputs: [
                  {
                    name: "DelayNode",
                    delayTime: {
                      value: 0,
                      inputs: [
                        {
                          name: "OscillatorNode",
                          type: "custom",
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
                    },
                    inputs: [
                      "<circular:GainNode>"
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });
    });
  });

  describe("$(teeth, gain: 0.2, ffGain: 0.3, fbGain: 0.4, ffDelay: 0.5, fbDelay: 0.6, $(osc))", function() {
    it("graph", function() {
      var synth = new Neume(function($) {
        return $("teeth", {
          gain: 0.2, ffGain: 0.3, fbGain: 0.4, ffDelay: 0.5, fbDelay: 0.6
        }, $("osc"));
      })();

      assert.deepEqual(synth.toAudioNode().toJSON(), {
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 1,
              inputs: []
            },
            inputs: [
              {
                name: "GainNode",
                gain: {
                  value: 0.2,
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
              },
              {
                name: "GainNode",
                gain: {
                  value: 0.3,
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
                  value: 0.4,
                  inputs: []
                },
                inputs: [
                  {
                    name: "DelayNode",
                    delayTime: {
                      value: 0.6,
                      inputs: []
                    },
                    inputs: [
                      "<circular:GainNode>"
                    ]
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
