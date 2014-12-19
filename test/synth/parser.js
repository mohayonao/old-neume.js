"use strict";

var Parser = require("../../src/synth/parser");

describe("Parser", function() {
  describe(".isValidUGenName", function() {
    it("(name: string): boolean", function() {
      assert(Parser.isValidUGenName("sin"));
      assert(Parser.isValidUGenName("fb-sin"));
      assert(Parser.isValidUGenName("s-i-n-e"));
      assert(Parser.isValidUGenName("DX7"));
      assert(Parser.isValidUGenName("OD-1"));
      assert(Parser.isValidUGenName("<*-*>"));
      assert(Parser.isValidUGenName("sin!"));
      assert(Parser.isValidUGenName("sin?"));
      assert(Parser.isValidUGenName("sin!?"));
      assert(Parser.isValidUGenName("cycle~"));

      assert(!Parser.isValidUGenName(" sin"));
      assert(!Parser.isValidUGenName("sin "));
      assert(!Parser.isValidUGenName("si!n"));
      assert(!Parser.isValidUGenName("si?n"));
      assert(!Parser.isValidUGenName("sin?!"));
      assert(!Parser.isValidUGenName("s!n"));
      assert(!Parser.isValidUGenName("0"));
      assert(!Parser.isValidUGenName("sin.kr"));
      assert(!Parser.isValidUGenName("sin#lfo"));
      assert(!Parser.isValidUGenName("-fb"));
      assert(!Parser.isValidUGenName("fb-"));
      assert(!Parser.isValidUGenName("fb--sin"));
      assert(!Parser.isValidUGenName("<@-@>b"));
      assert(!Parser.isValidUGenName("\t"));
    });
  });
  describe(".parse", function() {
    it("(selector:string): { key: string, id: string?, classes: Array<string> }", function() {
      assert.deepEqual(Parser.parse(""), {
        key: "",
        id: null,
        classes: []
      });
      assert.deepEqual(Parser.parse("sin"), {
        key: "sin",
        id: null,
        classes: []
      });
      assert.deepEqual(Parser.parse("sin#id"), {
        key: "sin",
        id: "id",
        classes: []
      });
      assert.deepEqual(Parser.parse("sin#id#ignoreSecondId"), {
        key: "sin",
        id: "id",
        classes: []
      });
      assert.deepEqual(Parser.parse("sin.ar"), {
        key: "sin",
        id: null,
        classes: [ "ar" ]
      });
      assert.deepEqual(Parser.parse("sin.ar.amp"), {
        key: "sin",
        id: null,
        classes: [ "ar", "amp" ]
      });
      assert.deepEqual(Parser.parse("sin.ar.amp#id"), {
        key: "sin",
        id: "id",
        classes: [ "ar", "amp" ]
      });
      assert.deepEqual(Parser.parse("sin#id.ar.amp"), {
        key: "sin",
        id: "id",
        classes: [ "ar", "amp" ]
      });
    });
  });
});
