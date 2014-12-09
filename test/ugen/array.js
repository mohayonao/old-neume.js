"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/array"));

describe("ugen/array", function() {
  var Neume = null;

  beforeEach(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("graph", function() {
    it("$([])", function() {
      var synth = Neume.Synth(function($) {
        return $([]);
      });

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
              value: 0,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
    });
    it("$([ number ])", function() {
      var n = Math.floor(Math.random() * 65536);
      var synth = Neume.Synth(function($) {
        return $([ n ]);
      });

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
              value: n,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
    });
    it("$([ number ], $('sin'))", function() {
      var n = Math.floor(Math.random() * 65536);
      var synth = Neume.Synth(function($) {
        return $([ n ], $("sin"));
      });

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
              value: n,
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

  describe("works", function() {
    it("at", function() {
      var synth = Neume.Synth(function($) {
        return $([ 0, 1, 2, 3, 4 ]);
      });

      synth.start(0);

      synth.at(0.100, 3);
      synth.at(0.200, 1);
      synth.at(0.300, 4);
      synth.at(0.400, 2);

      Neume.audioContext.$processTo("00:00.500");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 3);
      assert(outlet.gain.$valueAtTime(0.150) === 3);
      assert(outlet.gain.$valueAtTime(0.200) === 1);
      assert(outlet.gain.$valueAtTime(0.250) === 1);
      assert(outlet.gain.$valueAtTime(0.300) === 4);
      assert(outlet.gain.$valueAtTime(0.350) === 4);
      assert(outlet.gain.$valueAtTime(0.400) === 2);
      assert(outlet.gain.$valueAtTime(0.450) === 2);
      assert(outlet.gain.$valueAtTime(0.500) === 2);
    });
    it("next", function() {
      var synth = Neume.Synth(function($) {
        return $([ 0, 1, 2, 3, 4 ]);
      });

      synth.start(0);

      synth.next(0.100);
      synth.next(0.200);
      synth.next(0.300);
      synth.next(0.400);

      Neume.audioContext.$processTo("00:00.500");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 1);
      assert(outlet.gain.$valueAtTime(0.150) === 1);
      assert(outlet.gain.$valueAtTime(0.200) === 2);
      assert(outlet.gain.$valueAtTime(0.250) === 2);
      assert(outlet.gain.$valueAtTime(0.300) === 3);
      assert(outlet.gain.$valueAtTime(0.350) === 3);
      assert(outlet.gain.$valueAtTime(0.400) === 4);
      assert(outlet.gain.$valueAtTime(0.450) === 4);
      assert(outlet.gain.$valueAtTime(0.500) === 4);
    });
    it("prev", function() {
      var synth = Neume.Synth(function($) {
        return $([ 0, 1, 2, 3, 4 ]);
      });

      synth.start(0);

      synth.at(0.000, 4);
      synth.prev(0.100);
      synth.prev(0.200);
      synth.prev(0.300);
      synth.prev(0.400);

      Neume.audioContext.$processTo("00:00.500");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(outlet.gain.$valueAtTime(0.000) === 4);
      assert(outlet.gain.$valueAtTime(0.050) === 4);
      assert(outlet.gain.$valueAtTime(0.100) === 3);
      assert(outlet.gain.$valueAtTime(0.150) === 3);
      assert(outlet.gain.$valueAtTime(0.200) === 2);
      assert(outlet.gain.$valueAtTime(0.250) === 2);
      assert(outlet.gain.$valueAtTime(0.300) === 1);
      assert(outlet.gain.$valueAtTime(0.350) === 1);
      assert(outlet.gain.$valueAtTime(0.400) === 0);
      assert(outlet.gain.$valueAtTime(0.450) === 0);
      assert(outlet.gain.$valueAtTime(0.500) === 0);
    });
    it("setValue", function() {
      var synth = Neume.Synth(function($) {
        return $([ 0, 1, 2, 3, 4 ]);
      });

      synth.start(0);

      synth.setValue(0.300, [ 5, 6, 7, 8, 9 ]);
      synth.setValue(0.400, " 0, 1, 2, 3, 4 ");
      synth.next(0.100);
      synth.next(0.200);
      synth.next(0.300);
      synth.next(0.400);

      Neume.audioContext.$processTo("00:00.500");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 1);
      assert(outlet.gain.$valueAtTime(0.150) === 1);
      assert(outlet.gain.$valueAtTime(0.200) === 2);
      assert(outlet.gain.$valueAtTime(0.250) === 2);
      assert(outlet.gain.$valueAtTime(0.300) === 8);
      assert(outlet.gain.$valueAtTime(0.350) === 8);
      assert(outlet.gain.$valueAtTime(0.400) === 9);
      assert(outlet.gain.$valueAtTime(0.450) === 9);
      assert(outlet.gain.$valueAtTime(0.500) === 9);
    });
  });

});
