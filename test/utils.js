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

  describe(".isString(value)", function() {
    it("checks if value is a string.", function() {
      assert(_.isString("") === true);
      assert(_.isString([]) === false);
    });
  });

  describe(".isUndefined(value)", function() {
    it("checks if value is undefined", function() {
      assert(_.isUndefined(undefined) === true);
      assert(_.isUndefined(0)         === false);
      assert(_.isUndefined(null)      === false);
    });
  });

  describe(".toArray(list)", function() {
    it("converts the list to an array", function() {
      assert.deepEqual(_.toArray(arguments), []);
      assert.deepEqual(_.toArray([ 5, 10 ]), [ 5, 10 ]);
      assert.deepEqual(_.toArray(null)     , []);
    });
  });

  describe(".fill(list, value)", function() {
    it("fills the value to the list", function() {
      assert.deepEqual(_.fill(new Array(4), 1)     , [ 1, 1, 1, 1 ]);
      assert.deepEqual(_.fill(new Uint8Array(4), 1), new Uint8Array([ 1, 1, 1, 1 ]));
    });
  });

  describe(".isEmpty(list)", function() {
    it("checks if value is empty", function() {
      assert(_.isEmpty([]) === true);
      assert(_.isEmpty("") === true);
    });
  });

  describe(".first(list)", function() {
    it("gets the first element of the list", function() {
      assert(_.first([ 1, 2, 3 ]) === 1);
      assert(_.first([]) === undefined);
    });
  });

  describe(".second(list)", function() {
    it("gets the second element of the list", function() {
      assert(_.second([ 1, 2, 3 ]) === 2);
      assert(_.second([ 1 ]) === undefined);
    });
  });

});
