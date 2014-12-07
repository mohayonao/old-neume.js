"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/object"));

describe("ugen/object", function() {
  var Neume = null;

  beforeEach(function() {
    Neume = neume(new global.AudioContext());
  });

  describe("$({})", function() {
    it("returns a GainNode that is connected with a DC(1)", function() {
      var synth = Neume.Synth(function($) {
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

    it("works", function() {
      var obj = { foo: 0 };
      var synth = Neume.Synth(function($) {
        return $(obj, { key: "foo", interval: 0.05 });
      });

      synth.start(0.000);
      synth.stop(0.200);

      var outlet = synth.toAudioNode().$inputs[0];

      obj.foo = 10;
      Neume.audioContext.$processTo("00:00.050");
      assert(outlet.gain.$valueAtTime(0.050) === 10);

      obj.foo = 20;
      Neume.audioContext.$processTo("00:00.100");
      assert(outlet.gain.$valueAtTime(0.100) === 20);

      obj.foo = 30;
      Neume.audioContext.$processTo("00:00.151");
      assert(outlet.gain.$valueAtTime(0.151) === 30);

      obj.foo = 40;
      Neume.audioContext.$processTo("00:00.201");
      assert(outlet.gain.$valueAtTime(0.201) === 30);
    });

    it("works with function", function() {
      var val = 0;
      var obj = { foo: function() {
        return val;
      } };
      var synth = Neume.Synth(function($) {
        return $(obj, { key: "foo", interval: 0.05 });
      });

      synth.start(0.000);
      synth.stop(0.200);

      var outlet = synth.toAudioNode().$inputs[0];

      val = 10;
      Neume.audioContext.$processTo("00:00.050");
      assert(outlet.gain.$valueAtTime(0.050) === 10);

      val = 20;
      Neume.audioContext.$processTo("00:00.100");
      assert(outlet.gain.$valueAtTime(0.100) === 20);

      val = 30;
      Neume.audioContext.$processTo("00:00.151");
      assert(outlet.gain.$valueAtTime(0.151) === 30);

      val = 40;
      Neume.audioContext.$processTo("00:00.201");
      assert(outlet.gain.$valueAtTime(0.201) === 30);
    });

    it("works with valueOf", function() {
      var val = 0;
      var obj = { valueOf: function() {
        return val;
      } };
      var synth = Neume.Synth(function($) {
        return $(obj, { interval: 0.05 });
      });

      synth.start(0.000);
      synth.stop(0.200);

      var outlet = synth.toAudioNode().$inputs[0];

      val = 10;
      Neume.audioContext.$processTo("00:00.050");
      assert(outlet.gain.$valueAtTime(0.050) === 10);

      val = 20;
      Neume.audioContext.$processTo("00:00.100");
      assert(outlet.gain.$valueAtTime(0.100) === 20);

      val = 30;
      Neume.audioContext.$processTo("00:00.151");
      assert(outlet.gain.$valueAtTime(0.151) === 30);

      val = 40;
      Neume.audioContext.$processTo("00:00.201");
      assert(outlet.gain.$valueAtTime(0.201) === 30);
    });

    it("works with relative interval", function() {
      var obj = { foo: 0 };
      var synth = Neume.Synth(function($) {
        return $(obj, { key: "foo", interval: "64n" });
      });

      synth.start(0.000);
      synth.stop(0.200);

      var outlet = synth.toAudioNode().$inputs[0];

      obj.foo = 10;
      Neume.audioContext.$processTo("00:00.050");
      assert(outlet.gain.$valueAtTime(0.050) === 10);
    });
  });

  describe("$(new Float32Array())", function() {
    it("works", function() {
      var obj = new Float32Array([ 0 ]);
      var synth = Neume.Synth(function($) {
        return $(obj, { key: 0, interval: 0.05 });
      });

      synth.start(0.000);
      synth.stop(0.200);

      var outlet = synth.toAudioNode().$inputs[0];

      obj[0] = 10;
      Neume.audioContext.$processTo("00:00.050");
      assert(outlet.gain.$valueAtTime(0.050) === 10);

      obj[0] = 20;
      Neume.audioContext.$processTo("00:00.100");
      assert(outlet.gain.$valueAtTime(0.100) === 20);

      obj[0] = 30;
      Neume.audioContext.$processTo("00:00.151");
      assert(outlet.gain.$valueAtTime(0.151) === 30);

      obj[0] = 40;
      Neume.audioContext.$processTo("00:00.201");
      assert(outlet.gain.$valueAtTime(0.201) === 30);
    });
  });

  describe("$({}, $({}))", function() {
    it("returns a GainNode that is connected with inputs", function() {
      var synth = Neume.Synth(function($) {
        return $({}, $({}));
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
                name: "GainNode",
                gain: {
                  value: 0,
                  inputs: []
                },
                inputs: [ DC(1) ]
              }
            ]
          }
        ]
      });
    });
  });
});
