"use strict";

var neume = require("../../src");

describe("neume.Transport", function() {
  var audioContext = null;
  var context = null;
  var transport = null;

  beforeEach(function() {
    audioContext = new global.AudioContext();
    context = new neume.Context(audioContext.destination);
    transport = new neume.Transport(context);
  });

  describe("constructor", function() {
    it("(context: neume.Context, duration: number)", function() {
      assert(transport instanceof neume.Transport);
    });
  });

  describe("#context", function() {
    it("\\getter: self", function() {
      assert(transport.context === context);
    });
  });

  describe("#audioContext", function() {
    it("\\getter: AudioContext", function() {
      assert(transport.audioContext === audioContext);
    });
  });

  describe("#sampleRate", function() {
    it("\\getter: number", function() {
      assert(transport.sampleRate === audioContext.sampleRate);
    });
  });

  describe("#currentTime", function() {
    it("\\getter: number", function() {
      assert(typeof transport.currentTime === "number");
    });
  });

  describe("#bpm", function() {
    it("\\getter: number", function() {
      assert(typeof transport.bpm === "number");
    });
    it("\\setter: number", function() {
      transport.bpm = 200;
      assert(transport.bpm === 200);

      transport.bpm = 300;
      assert(transport.bpm === 300);
    });
  });

  describe("#reset", function() {
    it("(): self", function() {
      assert(transport.reset() === transport);
      assert(transport.reset() === transport);
    });
  });

  describe("#start", function() {
    it("(): self", function() {
      assert(transport.start() === transport);
      assert(transport.start() === transport);
    });
  });

  describe("#stop", function() {
    it("(): self", function() {
      assert(transport.start() === transport);
      assert(transport.stop() === transport);
      assert(transport.stop() === transport);
    });
  });

  describe("#sched", function() {
    it("(time: number, callback: !function, context: any): 0", function() {
      assert(transport.sched(10, "INVALID") === 0);
    });
    it("(time: number, callback: function, context: any): number // works", function() {
      var passed = 0;

      var pass = function(i) {
        return function() {
          passed = i;
        };
      };

      transport.start();
      transport.sched(0.100, pass(1));
      transport.sched(0.500, pass(5));
      transport.sched(0.200, pass(2));
      transport.sched(0.400, pass(4));
      transport.sched(0.300, pass(3));

      assert(passed === 0, "00:00.000");

      audioContext.$processTo("00:00.100");
      assert(passed === 1, "00:00.100");

      audioContext.$processTo("00:00.200");
      assert(passed === 2, "00:00.200");

      audioContext.$processTo("00:00.310");
      assert(passed === 3, "00:00.310");

      audioContext.$processTo("00:00.400");
      assert(passed === 4, "00:00.400");

      audioContext.$processTo("00:00.500");
      assert(passed === 5, "00:00.500");
    });
    it("same time order", function() {
      var passed = [];

      var pass = function(i) {
        return function() {
          passed.push(i);
        };
      };

      transport.start();
      transport.sched(0.100, pass(1));
      transport.sched(0.100, pass(2));
      transport.sched(0.100, pass(3));
      transport.sched(0.100, pass(4));
      transport.sched(0.100, pass(5));

      assert.deepEqual(passed, [], "00:00.000");

      audioContext.$processTo("00:00.100");
      assert.deepEqual(passed, [ 1, 2, 3, 4, 5 ], "00:00.100");
    });
  });

  describe("#unsched", function() {
    it("(id: !number): 0", function() {
      assert(transport.unsched("INVALID") === 0);
    });
    it("(id: number): number", function() {
      var passed = 0;
      var schedIds = [];

      var pass = function(i) {
        return function() {
          passed = i;
        };
      };

      transport.start();
      schedIds[1] = transport.sched(0.100, pass(1));
      schedIds[5] = transport.sched(0.500, pass(5));
      schedIds[2] = transport.sched(0.200, pass(2));
      schedIds[4] = transport.sched(0.400, pass(4));
      schedIds[3] = transport.sched(0.300, pass(3));

      transport.unsched(schedIds[2]);

      assert(passed === 0, "00:00.000");

      audioContext.$processTo("00:00.100");
      assert(passed === 1, "00:00.100");

      audioContext.$processTo("00:00.200");
      assert(passed === 1, "00:00.200"); // removed callback

      audioContext.$processTo("00:00.310");
      assert(passed === 3, "00:00.310");

      audioContext.$processTo("00:00.400");
      assert(passed === 4, "00:00.400");

      audioContext.$processTo("00:00.500");
      assert(passed === 5, "00:00.500");
    });
  });

  describe("#nextTick", function() {
    it("(callback: function, context: any): self", function() {
      var passed = 0;

      transport.start();

      transport.nextTick(function() {
        passed = 1;
      });

      assert(passed === 0);

      audioContext.$process(1024 / audioContext.sampleRate);
      assert(passed === 1);
    });
  });

  describe("#toSeconds", function() {
    it("(): number", function() {
      assert(transport.toSeconds("2hz") === 0.5);
    });
  });

  describe("offline rendering", function() {
    it("works", function() {
      var audioContext = new global.OfflineAudioContext(2, 44100 * 0.5, 44100);
      var context = new neume.Context(audioContext.destination, 2);
      var passed = [ ];

      var pass = function(i) {
        return function() {
          passed.push(i);
        };
      };

      context.sched(0.100, pass(1));
      context.sched(0.500, pass(5));
      context.sched(0.200, pass(2));
      context.sched(0.400, pass(4));
      context.sched(0.300, pass(3));
      context.start();

      assert.deepEqual(passed, [ 1, 2, 3, 4, 5 ]);
    });
  });

});
