"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/tap-delay"));

describe("ugen/tap-delay", function() {
  var Neume = null;

  before(function() {
    Neume = neume.exports(new window.AudioContext());
  });

  describe("$(tap-delay, $(osc))", function() {
    it("graph", function() {
      var synth = new Neume(function($) {
        return $("tap-delay", $("osc"));
      })();

      assert.deepEqual(synth.toAudioNode().toJSON(),{
        name: "GainNode",
        gain: {
          value: 1,
          inputs: []
        },
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 0.5,
              inputs: []
            },
            inputs: []
          }
        ]
      });
    });
  });

  describe("$(tap-delay, [ delays ], $(osc))", function() {
    it("graph", function() {
      var synth = new Neume(function($) {
        return $("tap-delay", {
          delays: [
            [ 0.000, 0.85 ],
            [ 0.005, 0.45 ],
            [ 0.010, 0.20 ],
            [ 0.020 ]
          ]
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
              value: 0.5,
              inputs: []
            },
            inputs: []
          },
          {
            name: "GainNode",
            gain: {
              value: 0.85,
              inputs: []
            },
            inputs: [
              {
                name: "DelayNode",
                delayTime: {
                  value: 0,
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
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: "GainNode",
            gain: {
              value: 0.45,
              inputs: []
            },
            inputs: [
              {
                name: "DelayNode",
                delayTime: {
                  value: 0.005,
                  inputs: []
                },
                inputs: [
                  {
                    name: "DelayNode",
                    delayTime: {
                      value: 0,
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
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: "GainNode",
            gain: {
              value: 0.2,
              inputs: []
            },
            inputs: [
              {
                name: "DelayNode",
                delayTime: {
                  value: 0.01,
                  inputs: []
                },
                inputs: [
                  {
                    name: "DelayNode",
                    delayTime: {
                      value: 0.005,
                      inputs: []
                    },
                    inputs: [
                      {
                        name: "DelayNode",
                        delayTime: {
                          value: 0,
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
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: "GainNode",
            gain: {
              value: 0,
              inputs: []
            },
            inputs: [
              {
                name: "DelayNode",
                delayTime: {
                  value: 0.02,
                  inputs: []
                },
                inputs: [
                  {
                    name: "DelayNode",
                    delayTime: {
                      value: 0.01,
                      inputs: []
                    },
                    inputs: [
                      {
                        name: "DelayNode",
                        delayTime: {
                          value: 0.005,
                          inputs: []
                        },
                        inputs: [
                          {
                            name: "DelayNode",
                            delayTime: {
                              value: 0,
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
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
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

  describe("$(tap-delay, [ delays ], feedback: 0.1, $(osc))", function() {
    it("graph", function() {
      var synth = new Neume(function($) {
        return $("tap-delay", {
          delays: [ $("tri", { freq: 0.001 }), 0.85 ], feedback: 0.1
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
              value: 0.5,
              inputs: []
            },
            inputs: []
          },
          {
            name: "GainNode",
            gain: {
              value: 0.85,
              inputs: []
            },
            inputs: [
              {
                name: "DelayNode",
                delayTime: {
                  value: 0,
                  inputs: [
                    {
                      name: "OscillatorNode",
                      type: "triangle",
                      frequency: {
                        value: 0.001,
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
                          value: 0.1,
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
          }
        ]
      });
    });
  });

});
