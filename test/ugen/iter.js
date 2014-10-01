"use strict";

var neume = require("../../src");

neume.use(require("../../src/ugen/iter"));

describe("ugen/iter", function() {
  var Neume = null;

  before(function() {
    Neume = neume.exports(new window.AudioContext());
  });

  describe("$(iter)", function() {
    it("returns a GainNode that is connected with a DC(1)", function() {
      var synth = new Neume(function($) {
        return $("iter");
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 0,
          inputs: []
        },
        inputs: [ DC(1) ]
      });
    });
  });

  describe("$(iter iter:iter)", function() {
    var iter = null;
    beforeEach(function() {
      var i = 0;
      iter = {
        next: function() {
          return [ 3, 1, 4, 1, 5 ][i++] || null;
        },
        reset: function() {
          i = 0;
        }
      };
    });
    it("returns a GainNode that is connected with a DC(1)", function() {
      var synth = new Neume(function($) {
        return $("iter", { init: 3, iter: iter });
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
        name: "GainNode",
        gain: {
          value: 0,
          inputs: []
        },
        inputs: [ DC(1) ]
      });
    });
    it("works", function() {
      var synth = new Neume(function($) {
        return $("iter", { iter: iter });
      })();
      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0).on("end", function(e) {
        ended = e.playbackTime;
      });

      synth.next(0.100);
      synth.next(0.200);
      synth.next(0.300);
      synth.next(0.400);
      synth.next(0.500);
      synth.next(0.600);

      audioContext.$process(0.600);
      assert(outlet.gain.$valueAtTime(0.000) === 3);
      assert(outlet.gain.$valueAtTime(0.050) === 3);
      assert(outlet.gain.$valueAtTime(0.100) === 1);
      assert(outlet.gain.$valueAtTime(0.150) === 1);
      assert(outlet.gain.$valueAtTime(0.200) === 4);
      assert(outlet.gain.$valueAtTime(0.250) === 4);
      assert(outlet.gain.$valueAtTime(0.300) === 1);
      assert(outlet.gain.$valueAtTime(0.350) === 1);
      assert(outlet.gain.$valueAtTime(0.400) === 5);
      assert(outlet.gain.$valueAtTime(0.450) === 5);
      assert(outlet.gain.$valueAtTime(0.500) === 5);
      assert(outlet.gain.$valueAtTime(0.600) === 5);

      assert(ended === 0.500);
    });
    it("works with reset", function() {
      var synth = new Neume(function($) {
        return $("iter", { iter: iter });
      })();
      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;
      var ended = 0;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0).on("end", function(e) {
        ended = e.playbackTime;
      });

      synth.next(0.100);
      synth.next(0.200);
      synth.next(0.300);
      synth.next(0.400);
      synth.next(0.500);
      synth.next(0.600);
      synth.reset(0.425);

      audioContext.$process(0.600);
      assert(outlet.gain.$valueAtTime(0.000) === 3);
      assert(outlet.gain.$valueAtTime(0.050) === 3);
      assert(outlet.gain.$valueAtTime(0.100) === 1);
      assert(outlet.gain.$valueAtTime(0.150) === 1);
      assert(outlet.gain.$valueAtTime(0.200) === 4);
      assert(outlet.gain.$valueAtTime(0.250) === 4);
      assert(outlet.gain.$valueAtTime(0.300) === 1);
      assert(outlet.gain.$valueAtTime(0.350) === 1);
      assert(outlet.gain.$valueAtTime(0.400) === 5);
      assert(outlet.gain.$valueAtTime(0.450) === 3);
      assert(outlet.gain.$valueAtTime(0.500) === 1);
      assert(outlet.gain.$valueAtTime(0.600) === 4);

      assert(ended === 0.000);
    });

    it("works with setValue", function() {
      var synth = new Neume(function($) {
        return $("iter", { iter: iter });
      })();
      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      synth.setValue(0.100, 0);
      synth.setValue(0.400, {
        next: function() {
          return 30;
        }
      });
      synth.next(0.100);
      synth.next(0.200);
      synth.next(0.300);
      synth.next(0.400);
      synth.next(0.500);
      synth.next(0.600);

      synth.reset(0.200);
      synth.reset(0.500);

      audioContext.$process(0.500);
      assert(outlet.gain.$valueAtTime(0.050) === 3);
      assert(outlet.gain.$valueAtTime(0.100) === 0);
      assert(outlet.gain.$valueAtTime(0.150) === 0);
      assert(outlet.gain.$valueAtTime(0.200) === 0);
      assert(outlet.gain.$valueAtTime(0.250) === 0);
      assert(outlet.gain.$valueAtTime(0.300) === 0);
      assert(outlet.gain.$valueAtTime(0.350) === 0);
      assert(outlet.gain.$valueAtTime(0.400) === 30);
      assert(outlet.gain.$valueAtTime(0.450) === 30);
      assert(outlet.gain.$valueAtTime(0.500) === 30);
    });
  });

  describe("$(iter iter:iter, lag:0.1, curve:0.1)", function() {
    var iter = null;
    beforeEach(function() {
      var i = 0;
      iter = {
        next: function() {
          return [ 3, 1, 4, 1, 5 ][i++] || null;
        },
        reset: function() {
          i = 0;
        }
      };
    });
    it("works", function() {
      var synth = new Neume(function($) {
        return $("iter", { iter: iter, lag: 0.1, curve: 0.1 });
      })();
      var audioContext = neume._.findAudioContext(synth);
      var outlet = synth.outlet;

      audioContext.$reset();
      synth.$context.reset();

      synth.start(0);

      synth.next(0.100);
      synth.next(0.200);
      synth.next(0.300);
      synth.next(0.400);
      synth.next(0.500);

      audioContext.$process(0.500);
      assert(outlet.gain.$valueAtTime(0.050) === 3);
      assert(outlet.gain.$valueAtTime(0.100) === 3);
      assert(closeTo(outlet.gain.$valueAtTime(0.150), 1.632455532033676 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.200), 1.2000000000000002, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.250), 3.114562255152854 , 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.300), 3.7199999999999998, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.350), 1.8601395235657994, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.400), 1.2719999999999998, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.450), 3.8211028882892277, 1e-6));
      assert(closeTo(outlet.gain.$valueAtTime(0.500), 4.627199999999999 , 1e-6));
    });
  });

  describe("$(iter, $(iter), $(iter))", function() {
    it("returns a GainNode that is connected with $(iter) x2", function() {
      var synth = new Neume(function($) {
        return $("iter", $("iter"), $("iter"));
      })();
      assert.deepEqual(synth.outlet.toJSON(), {
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
          },
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
  });
});
