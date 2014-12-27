"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/osc"));
neume.use(require("../../src/ugen/object"));

describe("ugen/object", function() {
  var neu = null;

  beforeEach(function() {
    neu = neume(new global.AudioContext(), {
      scheduleInterval: 0.05, scheduleAheadTime: 0.05
    });
  });

  describe("graph", function() {
    it("$({})", function() {
      var synth = neu.Synth(function($) {
        return $({});
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
    it("$(Float32Array)", function() {
      var synth = neu.Synth(function($) {
        return $(new Float32Array(16));
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
    it("$({}, $('sin'))", function() {
      var synth = neu.Synth(function($) {
        return $({}, $("sin"));
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
    it("$(Float32Array, $('sin'))", function() {
      var synth = neu.Synth(function($) {
        return $(new Float32Array(16), $("sin"));
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
    it("object", sinon.test(function() {
      var tick = function(t) {
        for (var i = 0; i < t / 50; i++) {
          this.clock.tick(50);
          neu.audioContext.$process(0.05);
        }
      }.bind(this);

      var obj = { foo: 0 };
      var synth = neu.Synth(function($) {
        return $(obj, { key: "foo", interval: 0.1 });
      });

      synth.start(0);

      var outlet = synth.toAudioNode().$inputs[0];

      assert(outlet.gain.$valueAtTime(0.000) === 0);

      obj.foo = 1;
      tick(100);
      assert(outlet.gain.$valueAtTime(0.100) === 1);

      obj.foo = 2;
      tick(100);
      assert(outlet.gain.$valueAtTime(0.200) === 2);
    }));
    it("function", sinon.test(function() {
      var tick = function(t) {
        for (var i = 0; i < t / 50; i++) {
          this.clock.tick(50);
          neu.audioContext.$process(0.05);
        }
      }.bind(this);

      var obj = { foo: function() {
        return this.count;
      }, count: 0 };
      var synth = neu.Synth(function($) {
        return $(obj, { key: "foo", interval: 0.1 });
      });

      synth.start(0);

      var outlet = synth.toAudioNode().$inputs[0];

      assert(outlet.gain.$valueAtTime(0.000) === 0);

      obj.count = 1;
      tick(100);
      assert(outlet.gain.$valueAtTime(0.100) === 1);

      obj.count = 2;
      tick(100);
      assert(outlet.gain.$valueAtTime(0.200) === 2);
    }));
    it("Float32Array", sinon.test(function() {
      var tick = function(t) {
        for (var i = 0; i < t / 50; i++) {
          this.clock.tick(50);
          neu.audioContext.$process(0.05);
        }
      }.bind(this);

      var f32 = new Float32Array(16);
      var synth = neu.Synth(function($) {
        return $(f32, { key: 1, interval: 0.1 });
      });

      synth.start(0);

      var outlet = synth.toAudioNode().$inputs[0];

      assert(outlet.gain.$valueAtTime(0.000) === 0);

      f32[1] = 1;
      tick(100);
      assert(outlet.gain.$valueAtTime(0.100) === 1);

      f32[1] = 2;
      tick(100);
      assert(outlet.gain.$valueAtTime(0.200) === 2);
    }));
    it("stop", sinon.test(function() {
      var tick = function(t) {
        for (var i = 0; i < t / 50; i++) {
          this.clock.tick(50);
          neu.audioContext.$process(0.05);
        }
      }.bind(this);

      var obj = { foo: 0 };
      var synth = neu.Synth(function($) {
        return $(obj, { key: "foo", interval: 0.1 });
      });

      synth.start(0);
      synth.stop(0.150);

      var outlet = synth.toAudioNode().$inputs[0];

      assert(outlet.gain.$valueAtTime(0.000) === 0);

      obj.foo = 1;
      tick(100);
      assert(outlet.gain.$valueAtTime(0.100) === 1);

      obj.foo = 2;
      tick(100);
      assert(outlet.gain.$valueAtTime(0.200) === 1);
    }));
  });

});
