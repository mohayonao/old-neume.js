"use strict";

var neume = require("../../src");

describe("neume.Transport", function() {
  var context = null;

  beforeEach(function() {
    context = new neume.Context(new global.AudioContext().destination);
  });

  describe("(context: neume.Context)", function() {
    it("constructor", function() {
      var transport = new neume.Transport(context);

      assert(transport instanceof neume.Transport);
    });
  });

  describe("#getBpm", function() {
    it("(): number", function() {
      var transport = new neume.Transport(context);

      assert(transport.getBpm() === 120);
    });
  });

  describe("#setBpm", function() {
    it("(value: number): self", function() {
      var transport = new neume.Transport(context);

      assert(transport.setBpm(140) === transport);
      assert(transport.getBpm() === 140);
    });
    it("(value: number, ramp: number): self", function() {
      var transport = new neume.Transport(context);

      context.start();

      transport.setBpm(160, 0.5);
      assert(transport.getBpm() === 120, "00:00.000");

      context.$context.$processTo("00:00.100");
      assert(closeTo(transport.getBpm(), 126.375, 1e-2), "00:00.100");

      context.$context.$processTo("00:00.200");
      assert(closeTo(transport.getBpm(), 133.313, 1e-2), "00:00.200");

      context.$context.$processTo("00:00.300");
      assert(closeTo(transport.getBpm(), 140.631, 1e-2), "00:00.300");

      context.$context.$processTo("00:00.400");
      assert(closeTo(transport.getBpm(), 150.346, 1e-2), "00:00.400");

      context.$context.$processTo("00:00.500");
      assert(closeTo(transport.getBpm(), 158.599, 1e-2), "00:00.500");

      context.$context.$processTo("00:00.600");
      assert(transport.getBpm() === 160, "00:00.600");
    });
  });

  describe("#toSeconds", function() {
    it("(value: number): number", function() {
      var transport = new neume.Transport(context);

      assert(transport.toSeconds(1) === 1);
      assert(transport.toSeconds(2) === 2);
      assert(transport.toSeconds(Infinity) === 0);
    });
    it("(value: string): number // when milliseconds", function() {
      var transport = new neume.Transport(context);

      assert(transport.toSeconds("500ms") === 0.5);
      assert(transport.toSeconds("750ms") === 0.75);
    });
    it("(value: string): number // when frequency", function() {
      var transport = new neume.Transport(context);

      assert(transport.toSeconds("10hz") === 0.1);
      assert(transport.toSeconds("50hz") === 0.02);
    });
    it("(value: string): number // when ticks", function() {
      var transport = new neume.Transport(context);

      assert(transport.toSeconds("640ticks") === 0.6666666666666666);
      assert(transport.toSeconds("480ticks") === 0.5);
      assert(transport.toSeconds("240ticks") === 0.25);
    });
    it("(value: string): number // when note values", function() {
      var transport = new neume.Transport(context);

      assert(transport.toSeconds("0n") === transport.toSeconds("0ticks"));
      assert(transport.toSeconds("4n") === transport.toSeconds("480ticks"));
      assert(transport.toSeconds("8n") === transport.toSeconds("240ticks"));
      assert(transport.toSeconds("16nd") === transport.toSeconds("180ticks"));
      assert(transport.toSeconds("16nt") === transport.toSeconds("80ticks"));
    });
    it("(value: string): number // when bars/beats/units", function() {
      var transport = new neume.Transport(context);

      assert(transport.toSeconds("0.0.480") === 0.5);
      assert(transport.toSeconds("0.1.000") === 0.5);
      assert(transport.toSeconds("1.0.000") === 2.0);
    });
    it("(value: string): number // when hours:minutes:seconds.milliseconds", function() {
      var transport = new neume.Transport(context);

      assert(transport.toSeconds("00:00:01") === 1);
      assert(transport.toSeconds("00:01:00") === 60);
      assert(transport.toSeconds("01:00:00") === 3600);
      assert(transport.toSeconds("00:00:00.5") === 0.5);
      assert(transport.toSeconds("00:00:00.250") === 0.25);
    });
    it("(value: string): number // when samples", function() {
      var transport = new neume.Transport(context);

      assert(transport.toSeconds("44100samples") === 1);
      assert(transport.toSeconds("22050samples") === 0.5);
    });
    it("(value: string): number // when now", function() {
      var transport = new neume.Transport(context);

      assert(transport.toSeconds("now") === context.currentTime);
    });
    it("(value: string): number // when string", function() {
      var transport = new neume.Transport(context);

      assert(transport.toSeconds("0.5") === 0.5);
    });
    it("(value: string): number // when relative", function() {
      var transport = new neume.Transport(context);

      context.$context.$processTo("00:00.100");

      assert(transport.toSeconds("+500ms") === context.currentTime + 0.5);
    });
    it("(value: string): number // when expression", function() {
      var transport = new neume.Transport(context);

      assert(transport.toSeconds("500ms+2hz") === 1);

      assert.throws(function() {
        transport.toSeconds("2 ** 10");
      }, EvalError);
    });
    it("(value: any): any // else", function() {
      var transport = new neume.Transport(context);
      var a = {};

      assert(transport.toSeconds(a) === a);
      assert(transport.toSeconds(null) === null);
      assert(transport.toSeconds() === undefined);
    });
  });

  describe("#toFrequency", function() {
    it("(value: number): number", function() {
      var transport = new neume.Transport(context);

      assert(transport.toFrequency(1) === 1);
      assert(transport.toFrequency(2) === 2);
      assert(transport.toFrequency(Infinity) === 0);
    });
    it("(value: string): number // when milliseconds", function() {
      var transport = new neume.Transport(context);

      assert(transport.toFrequency("500ms") === 2);
      assert(transport.toFrequency("750ms") === 1.3333333333333333);
    });
    it("(value: any): any // else", function() {
      var transport = new neume.Transport(context);
      var a = {};

      assert(transport.toFrequency(a) === a);
      assert(transport.toFrequency(null) === null);
      assert(transport.toFrequency() === undefined);
    });
  });

});
