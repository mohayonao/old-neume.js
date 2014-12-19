"use strict";

var toSeconds = require("../../src/util/toSeconds");

describe("neume.toSeconds", function() {
  it("(value: number): number", function() {
    assert(toSeconds(1) === 1);
    assert(toSeconds(2) === 2);
    assert(toSeconds(Infinity) === 0);
  });
  it("(value: { playbackTime: number }): number", function() {
    var obj = { foo: "bar" };
    assert(toSeconds({ playbackTime: 2.5 }) === 2.5);
    assert(toSeconds(null) === null);
    assert(toSeconds(obj) === toSeconds(obj));
  });
  it("(value: string): number // when milliseconds", function() {
    assert(toSeconds("500ms") === 0.5);
    assert(toSeconds("750ms") === 0.75);
  });
  it("(value: string): number // when frequency", function() {
    assert(toSeconds("10hz") === 0.1);
    assert(toSeconds("50hz") === 0.02);
  });
  it("(value: string, bpm: number): number // when ticks", function() {
    assert(closeTo(toSeconds("640ticks", 120), 0.666, 1e-2));
    assert(closeTo(toSeconds("480ticks", 120), 0.500, 1e-2));
    assert(closeTo(toSeconds("240ticks", 120), 0.250, 1e-2));
    assert(closeTo(toSeconds("640ticks", 240), 0.333, 1e-2));
    assert(closeTo(toSeconds("480ticks", 240), 0.250, 1e-2));
    assert(closeTo(toSeconds("240ticks", 240), 0.120, 1e-2));
  });
  it("(value: string, bpm: number): number // when note values", function() {
    assert(toSeconds("0n", 120) === toSeconds("0ticks", 120));
    assert(toSeconds("4n", 120) === toSeconds("480ticks", 120));
    assert(toSeconds("8n", 120) === toSeconds("240ticks", 120));
    assert(toSeconds("16nd", 120) === toSeconds("180ticks", 120));
    assert(toSeconds("16nt", 120) === toSeconds("80ticks", 120));
  });
  it("(value: string, bpm: number): number // when bars/beats/units", function() {
    assert(toSeconds("0.0.480", 120) === toSeconds("480ticks", 120));
    assert(toSeconds("0.1.000", 120) === toSeconds("480ticks", 120));
    assert(toSeconds("1.0.000", 120) === toSeconds("480ticks", 120) * 4);
  });
  it("(value: string): number // when hours:minutes:seconds.milliseconds", function() {
    assert(toSeconds("00:00:01") === 1);
    assert(toSeconds("00:01:00") === 60);
    assert(toSeconds("01:00:00") === 3600);
    assert(toSeconds("00:00:00.5") === 0.5);
    assert(toSeconds("00:00:00.250") === 0.25);
  });
  it("(value: string, _, sampleRate: number): number // when samples", function() {
    assert(toSeconds("44100samples", 120, 44100) === 44100 / 44100);
    assert(toSeconds("22050samples", 120, 44100) === 22050 / 44100);
    assert(toSeconds("44100samples", 120, 48000) === 44100 / 48000);
    assert(toSeconds("22050samples", 120, 48000) === 22050 / 48000);
  });
  it("(value: string, _, _, currentTime: number): number // when now", function() {
    assert(toSeconds("now", 120, 44100, 0.25) === 0.25);
    assert(toSeconds("now", 120, 44100, 0.50) === 0.50);
  });
  it("(value: string): number // when string", function() {
    assert(toSeconds("0.5") === 0.5);
    assert(toSeconds("2.5") === 2.5);
  });
  it("(value: string, _, _, currentTime: number): number // when relative", function() {
    assert(toSeconds("+250ms", 120, 44100, 1.000) === 1.250);
    assert(toSeconds("+500ms", 120, 44100, 1.000) === 1.500);
    assert(toSeconds("+250ms", 120, 44100, 2.000) === 2.250);
    assert(toSeconds("+500ms", 120, 44100, 2.000) === 2.500);
  });
  it("(value: string): number // when expression", function() {
    assert(toSeconds("500ms+2hz") === toSeconds("500ms") + toSeconds("2hz"));
    assert(toSeconds("500ms * (2hz + 4)") === toSeconds("500ms") * (toSeconds("2hz") + 4));

    assert.throws(function() {
      toSeconds("2 ** 10");
    }, EvalError);
  });
  it("(value: any): any // else", function() {
    var a = {};

    assert(toSeconds(a) === a);
    assert(toSeconds(null) === null);
    assert(toSeconds() === undefined);
  });
});
