"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/line"));

describe("ugen/line", function() {
  var neu = null;

  beforeEach(function() {
    neu = neume(new global.AudioContext(), {
      scheduleInterval: 0.05, scheduleAheadTime: 0.05
    });
  });

  describe("graph", function() {
    it("$('line')", function() {
      var synth = neu.Synth(function($) {
        return $("line");
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
              value: 1,
              inputs: []
            },
            inputs: [ DC(1) ]
          }
        ]
      });
    });
    it("$('line', $('sin'))", function() {
      var synth = neu.Synth(function($) {
        return $("line", $("sin"));
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
      });
    });
  });

  describe("works", function() {
    it("$('line')", sinon.test(function() {
      var tick = function(t) {
        for (var i = 0; i < t / 50; i++) {
          this.clock.tick(50);
          neu.audioContext.$process(0.05);
        }
      }.bind(this);

      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 0.300, 1e-2));
      });
      var synth = neu.Synth(function($) {
        return $("line", { start: 880, end: 440, dur: 0.200 }).on("end", spy);
      });

      synth.start(0.100);

      tick(500);

      var outlet = synth.toAudioNode().$inputs[0];
      assert(closeTo(outlet.gain.$valueAtTime(0.000), 880, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 880, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 880, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 770, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 660, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 550, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 440, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 440, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 440, 1e-2));
    }));
    it("$('xline')", sinon.test(function() {
      var tick = function(t) {
        for (var i = 0; i < t / 50; i++) {
          this.clock.tick(50);
          neu.audioContext.$process(0.05);
        }
      }.bind(this);

      var spy = sinon.spy(function(e) {
        assert(this instanceof neume.UGen);
        assert(e.synth instanceof neume.Synth);
        assert(closeTo(e.playbackTime, 0.300, 1e-2));
      });
      var synth = neu.Synth(function($) {
        return $("xline", { start: 880, end: 440, dur: 0.200 }).on("end", spy);
      });

      synth.start(0.100);

      tick(500);

      var outlet = synth.toAudioNode().$inputs[0];
      assert(closeTo(outlet.gain.$valueAtTime(0.000), 880.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.050), 880.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.100), 880.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.125), 806.963, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 739.988, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.175), 678.572, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 622.253, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.225), 570.609, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 523.251, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.275), 479.823, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 440.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.325), 440.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 440.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.375), 440.000, 1e-2));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 440.000, 1e-2));
    }));
    it("stop", sinon.test(function() {
      var tick = function(t) {
        for (var i = 0; i < t / 50; i++) {
          this.clock.tick(50);
          neu.audioContext.$process(0.05);
        }
      }.bind(this);

      var synth = neu.Synth(function($) {
        return $("line", { start: 880, end: 440, dur: 0.200 });
      });

      synth.start(0.100).on("end", function() {
        assert(!"NOT REACHED");
      });
      synth.stop(0.200);

      tick(500);
    }));
  });

});
