"use strict";

var selectorParser = require("../../src/parser/selector");

describe("selectorParser", function() {
  describe(".isValidUGenName", function() {
    it("(name: string): boolean", function() {
      assert(selectorParser.isValidUGenName("sin"));
      assert(selectorParser.isValidUGenName("fb-sin"));
      assert(selectorParser.isValidUGenName("s-i-n-e"));
      assert(selectorParser.isValidUGenName("DX7"));
      assert(selectorParser.isValidUGenName("OD-1"));
      assert(selectorParser.isValidUGenName("<@-@>"));
      assert(selectorParser.isValidUGenName("sin!"));
      assert(selectorParser.isValidUGenName("sin?"));
      assert(selectorParser.isValidUGenName("sin!?"));
      assert(selectorParser.isValidUGenName("cycle~"));

      assert(!selectorParser.isValidUGenName(" sin"));
      assert(!selectorParser.isValidUGenName("sin "));
      assert(!selectorParser.isValidUGenName("si!n"));
      assert(!selectorParser.isValidUGenName("si?n"));
      assert(!selectorParser.isValidUGenName("sin?!"));
      assert(!selectorParser.isValidUGenName("s!n"));
      assert(!selectorParser.isValidUGenName("0"));
      assert(!selectorParser.isValidUGenName("sin.kr"));
      assert(!selectorParser.isValidUGenName("sin#lfo"));
      assert(!selectorParser.isValidUGenName("-fb"));
      assert(!selectorParser.isValidUGenName("fb-"));
      assert(!selectorParser.isValidUGenName("fb--sin"));
      assert(!selectorParser.isValidUGenName("<@-@>b"));
      assert(!selectorParser.isValidUGenName("\t"));
    });
  });
  describe(".parse", function() {
    it("(selector:string): { key: string, id: string?, class: Array<string> }", function() {
      assert.deepEqual(selectorParser.parse(""), {
        key: "",
        id: null,
        class: []
      });
      assert.deepEqual(selectorParser.parse("sin"), {
        key: "sin",
        id: null,
        class: []
      });
      assert.deepEqual(selectorParser.parse("sin#id"), {
        key: "sin",
        id: "id",
        class: []
      });
      assert.deepEqual(selectorParser.parse("sin#id#ignoreSecondId"), {
        key: "sin",
        id: "id",
        class: []
      });
      assert.deepEqual(selectorParser.parse("sin.ar"), {
        key: "sin",
        id: null,
        class: [ "ar" ]
      });
      assert.deepEqual(selectorParser.parse("sin.ar.amp"), {
        key: "sin",
        id: null,
        class: [ "ar", "amp" ]
      });
      assert.deepEqual(selectorParser.parse("sin.ar.amp#id"), {
        key: "sin",
        id: "id",
        class: [ "ar", "amp" ]
      });
      assert.deepEqual(selectorParser.parse("sin#id.ar.amp"), {
        key: "sin",
        id: "id",
        class: [ "ar", "amp" ]
      });
    });
  });
});
