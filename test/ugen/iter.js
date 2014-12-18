"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/iter"));

describe("ugen/iter", function() {
  var neu = null;

  beforeEach(function() {
    neu = neume(new global.AudioContext());
  });

  describe("graph", function() {
    it("$('iter')", function() {
      var synth = neu.Synth(function($) {
        return $("iter");
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
    it("$('iter', $('sin'))", function() {
      var synth = neu.Synth(function($) {
        return $("iter", $("sin"));
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
    it("next", function() {
      var synth = neu.Synth(function($) {
        var iter = {
          count: 0,
          next: function() {
            return { value: this.count++, done: false };
          }
        };
        return $("iter", { iter: iter }).on("end", function() {
          assert(!"NOT REACHED");
        });
      });

      synth.start(0);

      synth.next(0.100);
      synth.next(0.200);
      synth.next(0.300);
      synth.next(0.400);

      neu.audioContext.$processTo("00:00.500");

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
    it("next // done", function(done) {
      var synth = neu.Synth(function($) {
        var iter = {
          count: 0,
          next: function() {
            if (this.count === 3) {
              return { done: true };
            }
            return { value: this.count++, done: false };
          }
        };
        return $("iter", { iter: iter }).on("end", function(e) {
          assert(e.playbackTime === 0.3);
          done();
        });
      });

      synth.start(0);

      synth.next(0.100);
      synth.next(0.200);
      synth.next(0.300);
      synth.next(0.400);

      neu.audioContext.$processTo("00:00.500");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 1);
      assert(outlet.gain.$valueAtTime(0.150) === 1);
      assert(outlet.gain.$valueAtTime(0.200) === 2);
      assert(outlet.gain.$valueAtTime(0.250) === 2);
      assert(outlet.gain.$valueAtTime(0.300) === 2);
      assert(outlet.gain.$valueAtTime(0.350) === 2);
      assert(outlet.gain.$valueAtTime(0.400) === 2);
      assert(outlet.gain.$valueAtTime(0.450) === 2);
      assert(outlet.gain.$valueAtTime(0.500) === 2);
    });
    it("next // done when start", function(done) {
      var synth = neu.Synth(function($) {
        return $("iter").on("end", function(e) {
          assert(e.playbackTime === 0.0);
          done();
        });
      });

      synth.start(0);

      synth.next(0.100);
      synth.next(0.200);
      synth.next(0.300);
      synth.next(0.400);

      neu.audioContext.$processTo("00:00.500");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(outlet.gain.$valueAtTime(0.000) === 0);
      assert(outlet.gain.$valueAtTime(0.050) === 0);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(outlet.gain.$valueAtTime(0.150) === 0);
      assert(outlet.gain.$valueAtTime(0.200) === 0);
      assert(outlet.gain.$valueAtTime(0.250) === 0);
      assert(outlet.gain.$valueAtTime(0.300) === 0);
      assert(outlet.gain.$valueAtTime(0.350) === 0);
      assert(outlet.gain.$valueAtTime(0.400) === 0);
      assert(outlet.gain.$valueAtTime(0.450) === 0);
      assert(outlet.gain.$valueAtTime(0.500) === 0);
    });
    it("setValue", function() {
      var synth = neu.Synth(function($) {
        return $("iter", {
          iter: {
            next: function() {
              return { value: 1, done: false };
            }
          }
        }).on("end", function() {
          assert(!"NOT REACHED");
        });
      });

      synth.start(0);

      synth.setValue(0.100, {
        count: 5,
        next: function() {
          return { value: this.count++, done: false };
        }
      });
      synth.setValue(0.200, "not iterator");
      synth.next(0.100);
      synth.next(0.150);
      synth.next(0.200);
      synth.next(0.250);
      synth.next(0.300);

      neu.audioContext.$processTo("00:00.500");

      var outlet = synth.toAudioNode().$inputs[0];
      assert(outlet.gain.$valueAtTime(0.000) === 1);
      assert(outlet.gain.$valueAtTime(0.050) === 1);
      assert(outlet.gain.$valueAtTime(0.100) === 5);
      assert(outlet.gain.$valueAtTime(0.150) === 6);
      assert(outlet.gain.$valueAtTime(0.200) === 7);
      assert(outlet.gain.$valueAtTime(0.250) === 8);
      assert(outlet.gain.$valueAtTime(0.300) === 9);
      assert(outlet.gain.$valueAtTime(0.350) === 9);
      assert(outlet.gain.$valueAtTime(0.400) === 9);
      assert(outlet.gain.$valueAtTime(0.450) === 9);
      assert(outlet.gain.$valueAtTime(0.500) === 9);
    });
  });

});
