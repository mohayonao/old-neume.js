"use strict";

var _ = require("../src/utils");

describe("utils", function() {

  describe(".isArray(value)", function() {
    it("checks if value is an array", function() {
      assert(_.isArray([]) === true);
      assert(_.isArray(arguments) === false);
    });
  });

  describe(".isBoolean(value)", function() {
    it("checks if value is a boolean value", function() {
      assert(_.isBoolean(true ) === true);
      assert(_.isBoolean(false) === true);
      assert(_.isBoolean(null ) === false);
    });
  });

  describe(".isDictionary(value)", function() {
    it("checks if value is an object created by the Object constructor", function() {
      assert(_.isDictionary({}) === true);
      assert(_.isDictionary(new RegExp()) === false);
    });
  });

  describe(".isFunction(value)", function() {
    it("checks if value is a function", function() {
      assert(_.isFunction(it) === true);
      assert(_.isFunction("") === false);
    });
  });

  describe(".isFinite(value)", function() {
    it("checks if value is, or can be coerced to, a finite number", function() {
      assert(_.isFinite(10)       === true);
      assert(_.isFinite(Infinity) === false);
      assert(_.isFinite(NaN)      === false);
      assert(_.isFinite("10")     === false);
    });
  });

  describe(".isNaN", function() {
    it("checks if value is NaN.", function() {
      assert(_.isNaN(NaN)      === true);
      assert(_.isNaN(10)       === false);
      assert(_.isNaN(Infinity) === false);
      assert(_.isNaN("NaN")    === false);
    });
  });

  describe(".isNull(value)", function() {
    it("checks if value is null", function() {
      assert(_.isNull(null)      === true);
      assert(_.isNull(0)         === false);
      assert(_.isNull(undefined) === false);
    });
  });

  describe(".isNumber(value)", function() {
    it("checks if value is a number", function() {
      assert(_.isNumber(10)       === true);
      assert(_.isNumber(Infinity) === true);
      assert(_.isNumber(NaN)      === false);
      assert(_.isNumber("10")     === false);
    });
  });

  describe(".isObject(value)", function() {
    it("checks if value is the language type of Object", function() {
      assert(_.isObject({})   === true);
      assert(_.isObject(it)   === true);
      assert(_.isObject(null) === false);
      assert(_.isObject(1000) === false);
      assert(_.isObject("10") === false);
    });
  });

});
