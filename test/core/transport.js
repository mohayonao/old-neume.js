"use strict";

var neume = require("../../src");

var NeuContext   = neume.Context;
var NeuTransport = neume.Transport;

describe("NeuTransport", function() {
  var context = null;
  var transport = null;

  beforeEach(function() {
    context = new NeuContext(new window.AudioContext().destination);
    transport = new NeuTransport(context);
  });

  describe("(context)", function() {
    it("return a NeuTransport", function() {
      assert(transport instanceof NeuTransport);
    });
  });

  describe("#getBpm()", function() {
    it("return a bpm", function() {
      assert(transport.getBpm() === 120);
    });
  });

  describe("#setBpm()", function() {
    it("set a bpm", function() {
      assert(transport.setBpm(140) === transport);
      assert(transport.getBpm() === 140);
    });
    it("set a bpm with ramp", function() {
      context.start();

      transport.setBpm(160, 0.5);
      assert(transport.getBpm() === 120, "00:00.000");

      context.$context.$processTo("00:00.100");
      assert(closeTo(transport.getBpm(), 126.37598467698214, 1e-6), "00:00.100");

      context.$context.$processTo("00:00.200");
      assert(closeTo(transport.getBpm(), 133.31319191899797, 1e-6), "00:00.200");

      context.$context.$processTo("00:00.300");
      assert(closeTo(transport.getBpm(), 140.63120604011894, 1e-6), "00:00.300");

      context.$context.$processTo("00:00.400");
      assert(closeTo(transport.getBpm(), 150.34618734471195, 1e-6), "00:00.400");

      context.$context.$processTo("00:00.500");
      assert(closeTo(transport.getBpm(), 158.5992004652275, 1e-6), "00:00.500");

      context.$context.$processTo("00:00.600");
      assert(transport.getBpm() === 160, "00:00.600");
    });
  });

  describe("#toSeconds(value)", function() {
    it("number", function() {
      assert(transport.toSeconds(1) === 1);
      assert(transport.toSeconds(2) === 2);
      assert(transport.toSeconds(Infinity) === 0);
    });
    it("milliseconds", function() {
      assert(transport.toSeconds("500ms") === 0.5);
      assert(transport.toSeconds("750ms") === 0.75);
    });
    it("frequency", function() {
      assert(transport.toSeconds("10hz") === 0.1);
      assert(transport.toSeconds("50hz") === 0.02);
    });
    it("ticks", function() {
      assert(transport.toSeconds("640ticks") === 0.6666666666666666);
      assert(transport.toSeconds("480ticks") === 0.5);
      assert(transport.toSeconds("240ticks") === 0.25);
    });
    it("note values", function() {
      assert(transport.toSeconds("0n") === transport.toSeconds("0ticks"));
      assert(transport.toSeconds("4n") === transport.toSeconds("480ticks"));
      assert(transport.toSeconds("8n") === transport.toSeconds("240ticks"));
      assert(transport.toSeconds("16nd") === transport.toSeconds("180ticks"));
      assert(transport.toSeconds("16nt") === transport.toSeconds("80ticks"));
    });
    it("bars/beats/units", function() {
      assert(transport.toSeconds("0.0.480") === 0.5);
      assert(transport.toSeconds("0.1.000") === 0.5);
      assert(transport.toSeconds("1.0.000") === 2.0);
    });
    it("hours:minutes:seconds.milliseconds", function() {
      assert(transport.toSeconds("00:00:01") === 1);
      assert(transport.toSeconds("00:01:00") === 60);
      assert(transport.toSeconds("01:00:00") === 3600);
      assert(transport.toSeconds("00:00:00.5") === 0.5);
      assert(transport.toSeconds("00:00:00.250") === 0.25);
    });
    it("samples", function() {
      assert(transport.toSeconds("44100samples") === 1);
      assert(transport.toSeconds("22050samples") === 0.5);
    });
    it("now", function() {
      assert(transport.toSeconds("now") === context.currentTime);
    });
    it("string", function() {
      assert(transport.toSeconds("0.5") === 0.5);
    });
    it("relative", function() {
      context.start();
      context.$context.$processTo("00:00.100");

      assert(transport.toSeconds("+500ms") === context.currentTime + 0.5);
    });
    it("expression", function() {
      assert(transport.toSeconds("500ms+2hz") === 1);

      assert.throws(function() {
        transport.toSeconds("2 ** 10");
      }, EvalError);
    });
    it("othres", function() {
      var a = {};
      assert(transport.toSeconds(a) === a);
      assert(transport.toSeconds(null) === null);
      assert(transport.toSeconds() === undefined);
    });
  });

  describe("#toFrequency(value)", function() {
    it("number", function() {
      assert(transport.toFrequency(1) === 1);
      assert(transport.toFrequency(2) === 2);
      assert(transport.toFrequency(Infinity) === 0);
    });
    it("milliseconds", function() {
      assert(transport.toFrequency("500ms") === 2);
      assert(transport.toFrequency("750ms") === 1.3333333333333333);
    });
    it("othres", function() {
      var a = {};
      assert(transport.toFrequency(a) === a);
      assert(transport.toFrequency(null) === null);
      assert(transport.toFrequency() === undefined);
    });
  });

});
