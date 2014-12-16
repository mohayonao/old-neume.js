"use strict";

var neume = require("../../src");

describe("neume.underscore", function() {
  var _, random;

  before(function() {
    _ = neume._;
  });

  beforeEach(function() {
    var seed = [ 0.1, 0.8, 0.5, 0.2, 0.4 ];
    var index = 0;
    random = function() {
      return seed[index++ % seed.length];
    };
  });

  it("exports(): object", function() {
    assert(typeof _.exports() === "object");
    assert(_.exports() !== _.exports());
    assert.deepEqual(_.exports(), _.exports());
  });
  it("asInt(value: number): number", function() {
    assert(_.asInt(+3.14) === 3);
    assert(_.asInt(+1.41) === 1);
    assert(_.asInt(-1.73) === -1);
  });
  it("midicps(midi: number): number", function() {
    assert(closeTo(_.midicps(68), 415.3046975, 1e-6));
    assert(closeTo(_.midicps(69), 440.0000000, 1e-6));
    assert(closeTo(_.midicps(70), 466.1637615, 1e-6));
    assert(_.midicps === _.mtof);
  });
  it("cpsmidi(cps: number): number", function() {
    assert(closeTo(_.cpsmidi(415.3046975), 68, 1e-6));
    assert(closeTo(_.cpsmidi(440.0000000), 69, 1e-6));
    assert(closeTo(_.cpsmidi(466.1637615), 70, 1e-6));
    assert(_.cpsmidi === _.ftom);
  });
  it("midiratio(midi: number): number", function() {
    assert(closeTo(_.midiratio(0), 1.0000000, 1e-6));
    assert(closeTo(_.midiratio(1), 1.0594630, 1e-6));
    assert(closeTo(_.midiratio(7), 1.4983070, 1e-6));
  });
  it("ratiomidi(ratio: number): number", function() {
    assert(closeTo(_.ratiomidi(1.0000000), 0.0000000, 1e-6));
    assert(closeTo(_.ratiomidi(1.0594630), 0.9999984, 1e-6));
    assert(closeTo(_.ratiomidi(1.4983070), 7.0000000, 1e-6));
  });
  it("dbamp(db: number): number", function() {
    assert(closeTo(_.dbamp(1.00), 1.1220184, 1e-6));
    assert(closeTo(_.dbamp(3.00), 1.4125375, 1e-6));
    assert(closeTo(_.dbamp(6.00), 1.9952623, 1e-6));
  });
  it("ampdb(amp: number): number", function() {
    assert(closeTo(_.ampdb(1.1220184), 1.00, 1e-6));
    assert(closeTo(_.ampdb(1.4125375), 3.00, 1e-6));
    assert(closeTo(_.ampdb(1.9952623), 6.00, 1e-6));
  });
  it("linlin(value: number, inMin, inMax, outMin, outMax): number", function() {
    assert(closeTo(_.linlin(0.000, 0.000, 1.0, 0.000, 10.0),  0.000000, 1e-6));
    assert(closeTo(_.linlin(0.200, 0.000, 1.0, 0.000, 10.0),  2.000000, 1e-6));
    assert(closeTo(_.linlin(0.500, 0.000, 1.0, 0.000, 10.0),  5.000000, 1e-6));
    assert(closeTo(_.linlin(0.800, 0.000, 1.0, 0.000, 10.0),  8.000000, 1e-6));
    assert(closeTo(_.linlin(1.000, 0.000, 1.0, 0.000, 10.0), 10.000000, 1e-6));
  });
  it("linexp(value: number, inMin, inMax, outMin, outMax): number", function() {
    assert(closeTo(_.linexp(0.000, 0.000, 1.0, 0.001, 10.0),  0.0010000, 1e-6));
    assert(closeTo(_.linexp(0.200, 0.000, 1.0, 0.001, 10.0),  0.0063095, 1e-6));
    assert(closeTo(_.linexp(0.500, 0.000, 1.0, 0.001, 10.0),  0.1000000, 1e-6));
    assert(closeTo(_.linexp(0.800, 0.000, 1.0, 0.001, 10.0),  1.5848931, 1e-6));
    assert(closeTo(_.linexp(1.000, 0.000, 1.0, 0.001, 10.0), 10.0000000, 1e-6));
  });
  it("explin(value: number, inMin, inMax, outMin, outMax): number", function() {
    assert(closeTo(_.explin(0.001, 0.001, 1.0, 0.000, 10.0),  0.0000000, 1e-6));
    assert(closeTo(_.explin(0.200, 0.001, 1.0, 0.000, 10.0),  7.6700999, 1e-6));
    assert(closeTo(_.explin(0.500, 0.001, 1.0, 0.000, 10.0),  8.9965666, 1e-6));
    assert(closeTo(_.explin(0.800, 0.001, 1.0, 0.000, 10.0),  9.6769666, 1e-6));
    assert(closeTo(_.explin(1.000, 0.001, 1.0, 0.000, 10.0), 10.0000000, 1e-6));
  });
  it("expexp(value: number, inMin, inMax, outMin, outMax): number", function() {
    assert(closeTo(_.expexp(0.001, 0.001, 1.0, 0.001, 10.0),  0.0010000, 1e-6));
    assert(closeTo(_.expexp(0.200, 0.001, 1.0, 0.001, 10.0),  1.1696070, 1e-6));
    assert(closeTo(_.expexp(0.500, 0.001, 1.0, 0.001, 10.0),  3.9685026, 1e-6));
    assert(closeTo(_.expexp(0.800, 0.001, 1.0, 0.001, 10.0),  7.4265421, 1e-6));
    assert(closeTo(_.expexp(1.000, 0.001, 1.0, 0.001, 10.0), 10.0000000, 1e-6));
  });
  it("coin(value: number=0.5, random: ()->number=Math.random): boolean", function() {
    assert(_.coin(0.5, random) === true);
    assert(_.coin(0.5, random) === false);
    assert(_.coin(0.5, random) === false);
    assert(_.coin(0.5, random) === true);
    assert(_.coin(0.5, random) === true);
  });
  it("rand(value: number=1.0, random: ()->number=Math.random): boolean", function() {
    assert(closeTo(_.rand(0.5, random), 0.05, 1e-6));
    assert(closeTo(_.rand(0.5, random), 0.40, 1e-6));
    assert(closeTo(_.rand(0.5, random), 0.25, 1e-6));
    assert(closeTo(_.rand(0.5, random), 0.10, 1e-6));
    assert(closeTo(_.rand(0.5, random), 0.20, 1e-6));
  });
  it("rand2(value: number=1.0, random: ()->number=Math.random): boolean", function() {
    assert(closeTo(_.rand2(0.5, random), -0.4, 1e-6));
    assert(closeTo(_.rand2(0.5, random), +0.3, 1e-6));
    assert(closeTo(_.rand2(0.5, random), +0.0, 1e-6));
    assert(closeTo(_.rand2(0.5, random), -0.3, 1e-6));
    assert(closeTo(_.rand2(0.5, random), -0.1, 1e-6));
  });
  it("rrand(lo: number=0.0, hi: number=1.0, random: ()->number=Math.random): boolean", function() {
    assert(closeTo(_.rrand(0.5, 1.0, random), 0.55, 1e-6));
    assert(closeTo(_.rrand(0.5, 1.0, random), 0.90, 1e-6));
    assert(closeTo(_.rrand(0.5, 1.0, random), 0.75, 1e-6));
    assert(closeTo(_.rrand(0.5, 1.0, random), 0.60, 1e-6));
    assert(closeTo(_.rrand(0.5, 1.0, random), 0.70, 1e-6));
  });
  it("exprand(lo: number=0.0, hi: number=11e-6, random: ()->number=Math.random): boolean", function() {
    assert(closeTo(_.exprand(0.5, 1.0, random), 0.5358867312, 1e-6));
    assert(closeTo(_.exprand(0.5, 1.0, random), 0.8705505632, 1e-6));
    assert(closeTo(_.exprand(0.5, 1.0, random), 0.7071067811, 1e-6));
    assert(closeTo(_.exprand(0.5, 1.0, random), 0.5743491774, 1e-6));
    assert(closeTo(_.exprand(0.5, 1.0, random), 0.6597539553, 1e-6));
  });
  it("at(list: Array<any>, index: number): any", function() {
    var list = [ 0, 1, 2, 3, 4, 5 ];

    assert(_.at(list, -9) === undefined);
    assert(_.at(list, -8) === undefined);
    assert(_.at(list, -7) === undefined);
    assert(_.at(list, -6) === undefined);
    assert(_.at(list, -5) === undefined);
    assert(_.at(list, -4) === undefined);
    assert(_.at(list, -3) === undefined);
    assert(_.at(list, -2) === undefined);
    assert(_.at(list, -1) === undefined);
    assert(_.at(list,  0) === 0);
    assert(_.at(list,  1) === 1);
    assert(_.at(list,  2) === 2);
    assert(_.at(list,  3) === 3);
    assert(_.at(list,  4) === 4);
    assert(_.at(list,  5) === 5);
    assert(_.at(list,  6) === undefined);
    assert(_.at(list,  7) === undefined);
    assert(_.at(list,  8) === undefined);
    assert(_.at(list,  9) === undefined);
  });
  it("clipAt(list: Array<any>, index: number): any", function() {
    var list = [ 0, 1, 2, 3, 4, 5 ];

    assert(_.clipAt(list, -9) === 0);
    assert(_.clipAt(list, -8) === 0);
    assert(_.clipAt(list, -7) === 0);
    assert(_.clipAt(list, -6) === 0);
    assert(_.clipAt(list, -5) === 0);
    assert(_.clipAt(list, -4) === 0);
    assert(_.clipAt(list, -3) === 0);
    assert(_.clipAt(list, -2) === 0);
    assert(_.clipAt(list, -1) === 0);
    assert(_.clipAt(list,  0) === 0);
    assert(_.clipAt(list,  1) === 1);
    assert(_.clipAt(list,  2) === 2);
    assert(_.clipAt(list,  3) === 3);
    assert(_.clipAt(list,  4) === 4);
    assert(_.clipAt(list,  5) === 5);
    assert(_.clipAt(list,  6) === 5);
    assert(_.clipAt(list,  7) === 5);
    assert(_.clipAt(list,  8) === 5);
    assert(_.clipAt(list,  9) === 5);
  });
  it("wrapAt(list: Array<any>, index: number): any", function() {
    var list = [ 0, 1, 2, 3, 4, 5 ];

    assert(_.wrapAt(list, -9) === 3);
    assert(_.wrapAt(list, -8) === 4);
    assert(_.wrapAt(list, -7) === 5);
    assert(_.wrapAt(list, -6) === 0);
    assert(_.wrapAt(list, -5) === 1);
    assert(_.wrapAt(list, -4) === 2);
    assert(_.wrapAt(list, -3) === 3);
    assert(_.wrapAt(list, -2) === 4);
    assert(_.wrapAt(list, -1) === 5);
    assert(_.wrapAt(list,  0) === 0);
    assert(_.wrapAt(list,  1) === 1);
    assert(_.wrapAt(list,  2) === 2);
    assert(_.wrapAt(list,  3) === 3);
    assert(_.wrapAt(list,  4) === 4);
    assert(_.wrapAt(list,  5) === 5);
    assert(_.wrapAt(list,  6) === 0);
    assert(_.wrapAt(list,  7) === 1);
    assert(_.wrapAt(list,  8) === 2);
    assert(_.wrapAt(list,  9) === 3);
  });
  it("foldAt(list: Array<any>, index: number): any", function() {
    var list = [ 0, 1, 2, 3, 4, 5 ];

    assert(_.foldAt(list, -9) === 1);
    assert(_.foldAt(list, -8) === 2);
    assert(_.foldAt(list, -7) === 3);
    assert(_.foldAt(list, -6) === 4);
    assert(_.foldAt(list, -5) === 5);
    assert(_.foldAt(list, -4) === 4);
    assert(_.foldAt(list, -3) === 3);
    assert(_.foldAt(list, -2) === 2);
    assert(_.foldAt(list, -1) === 1);
    assert(_.foldAt(list,  0) === 0);
    assert(_.foldAt(list,  1) === 1);
    assert(_.foldAt(list,  2) === 2);
    assert(_.foldAt(list,  3) === 3);
    assert(_.foldAt(list,  4) === 4);
    assert(_.foldAt(list,  5) === 5);
    assert(_.foldAt(list,  6) === 4);
    assert(_.foldAt(list,  7) === 3);
    assert(_.foldAt(list,  8) === 2);
    assert(_.foldAt(list,  9) === 1);
  });

});
