"use strict";

var util = require("../../src/util");

describe("util", function() {

  describe(".isArray(value)", function() {
    it("checks if value is an array", function() {
      assert(util.isArray([]) === true);
      assert(util.isArray(arguments) === false);
    });
  });

  describe(".isBoolean(value)", function() {
    it("checks if value is a boolean value", function() {
      assert(util.isBoolean(true ) === true);
      assert(util.isBoolean(false) === true);
      assert(util.isBoolean(null ) === false);
    });
  });

  describe(".isDictionary(value)", function() {
    it("checks if value is an object created by the Object constructor", function() {
      assert(util.isDictionary({}) === true);
      assert(util.isDictionary(new RegExp()) === false);
    });
  });

  describe(".isFunction(value)", function() {
    it("checks if value is a function", function() {
      assert(util.isFunction(it) === true);
      assert(util.isFunction("") === false);
    });
  });

  describe(".isFinite(value)", function() {
    it("checks if value is, or can be coerced to, a finite number", function() {
      assert(util.isFinite(10) === true);
      assert(util.isFinite(Infinity) === false);
      assert(util.isFinite(NaN) === false);
      assert(util.isFinite("10") === false);
    });
  });

  describe(".isNaN", function() {
    it("checks if value is NaN.", function() {
      assert(util.isNaN(NaN) === true);
      assert(util.isNaN(10) === false);
      assert(util.isNaN(Infinity) === false);
      assert(util.isNaN("NaN") === false);
    });
  });

  describe(".isNull(value)", function() {
    it("checks if value is null", function() {
      assert(util.isNull(null) === true);
      assert(util.isNull(0) === false);
      assert(util.isNull(undefined) === false);
    });
  });

  describe(".isNumber(value)", function() {
    it("checks if value is a number", function() {
      assert(util.isNumber(10) === true);
      assert(util.isNumber(Infinity) === true);
      assert(util.isNumber(NaN) === false);
      assert(util.isNumber("10") === false);
    });
  });

  describe(".isObject(value)", function() {
    it("checks if value is the language type of Object", function() {
      assert(util.isObject({}) === true);
      assert(util.isObject(it) === true);
      assert(util.isObject(null) === false);
      assert(util.isObject(1000) === false);
      assert(util.isObject("10") === false);
    });
  });

  describe(".isString(value)", function() {
    it("checks if value is a string.", function() {
      assert(util.isString("") === true);
      assert(util.isString([]) === false);
    });
  });

  describe(".isTypedArray(value)", function() {
    it("checks if value is an instance of TypedArray", function() {
      assert(util.isTypedArray(new Float32Array()) === true);
      assert(util.isTypedArray(new Uint8Array()) === true);
      assert(util.isTypedArray(new Int8Array()) === true);
      assert(util.isTypedArray(new Uint16Array()) === true);
      assert(util.isTypedArray(new Int16Array()) === true);
      assert(util.isTypedArray(new Uint32Array()) === true);
      assert(util.isTypedArray(new Int32Array()) === true);
      assert(util.isTypedArray(new Float64Array()) === true);
      assert(util.isTypedArray(new Uint8ClampedArray()) === true);
      assert(util.isTypedArray([]) === false);
      assert(util.isTypedArray("") === false);
    });
  });

  describe(".isUndefined(value)", function() {
    it("checks if value is undefined", function() {
      assert(util.isUndefined(undefined) === true);
      assert(util.isUndefined(0) === false);
      assert(util.isUndefined(null) === false);
    });
  });

  describe(".toArray(list)", function() {
    it("converts the list to an array", function() {
      assert.deepEqual(util.toArray(arguments), []);
      assert.deepEqual(util.toArray([ 5, 10 ]), [ 5, 10 ]);
      assert.deepEqual(util.toArray(null), []);
    });
  });

  describe(".clipAt(list, index)", function() {
    it("gets the element with the clipped index", function() {
      var list = [ 0, 1, 2, 3, 4, 5 ];
      assert(util.clipAt(list, -9) === 0);
      assert(util.clipAt(list, -8) === 0);
      assert(util.clipAt(list, -7) === 0);
      assert(util.clipAt(list, -6) === 0);
      assert(util.clipAt(list, -5) === 0);
      assert(util.clipAt(list, -4) === 0);
      assert(util.clipAt(list, -3) === 0);
      assert(util.clipAt(list, -2) === 0);
      assert(util.clipAt(list, -1) === 0);
      assert(util.clipAt(list,  0) === 0);
      assert(util.clipAt(list,  1) === 1);
      assert(util.clipAt(list,  2) === 2);
      assert(util.clipAt(list,  3) === 3);
      assert(util.clipAt(list,  4) === 4);
      assert(util.clipAt(list,  5) === 5);
      assert(util.clipAt(list,  6) === 5);
      assert(util.clipAt(list,  7) === 5);
      assert(util.clipAt(list,  8) === 5);
      assert(util.clipAt(list,  9) === 5);
    });
  });

  describe(".wrapAt(list, index)", function() {
    it("gets the element with the clipped index", function() {
      var list = [ 0, 1, 2, 3, 4, 5 ];
      assert(util.wrapAt(list, -9) === 3);
      assert(util.wrapAt(list, -8) === 4);
      assert(util.wrapAt(list, -7) === 5);
      assert(util.wrapAt(list, -6) === 0);
      assert(util.wrapAt(list, -5) === 1);
      assert(util.wrapAt(list, -4) === 2);
      assert(util.wrapAt(list, -3) === 3);
      assert(util.wrapAt(list, -2) === 4);
      assert(util.wrapAt(list, -1) === 5);
      assert(util.wrapAt(list,  0) === 0);
      assert(util.wrapAt(list,  1) === 1);
      assert(util.wrapAt(list,  2) === 2);
      assert(util.wrapAt(list,  3) === 3);
      assert(util.wrapAt(list,  4) === 4);
      assert(util.wrapAt(list,  5) === 5);
      assert(util.wrapAt(list,  6) === 0);
      assert(util.wrapAt(list,  7) === 1);
      assert(util.wrapAt(list,  8) === 2);
      assert(util.wrapAt(list,  9) === 3);
    });
  });

  describe(".foldAt(list, index)", function() {
    it("gets the element with the clipped index", function() {
      var list = [ 0, 1, 2, 3, 4, 5 ];
      assert(util.foldAt(list, -9) === 1);
      assert(util.foldAt(list, -8) === 2);
      assert(util.foldAt(list, -7) === 3);
      assert(util.foldAt(list, -6) === 4);
      assert(util.foldAt(list, -5) === 5);
      assert(util.foldAt(list, -4) === 4);
      assert(util.foldAt(list, -3) === 3);
      assert(util.foldAt(list, -2) === 2);
      assert(util.foldAt(list, -1) === 1);
      assert(util.foldAt(list,  0) === 0);
      assert(util.foldAt(list,  1) === 1);
      assert(util.foldAt(list,  2) === 2);
      assert(util.foldAt(list,  3) === 3);
      assert(util.foldAt(list,  4) === 4);
      assert(util.foldAt(list,  5) === 5);
      assert(util.foldAt(list,  6) === 4);
      assert(util.foldAt(list,  7) === 3);
      assert(util.foldAt(list,  8) === 2);
      assert(util.foldAt(list,  9) === 1);
    });
  });

  describe(".definePropertyIfNotExists(obj, prop, descriptor)", function() {
    it("defines a property if not exists", function() {
      var obj = {};

      util.definePropertyIfNotExists(obj, "value", { value: 100 });
      util.definePropertyIfNotExists(obj, "value", { value: 200 });

      assert(obj.value === 100);
    });
  });

  describe(".format(fmt, dict)", function() {
    it("should format with an array", function() {
      assert(util.format("#{0} is #{1}", [
        "rock and roll", "dead", "!?"
      ]) === "rock and roll is dead");
    });
    it("should format with a dictionary", function() {
      assert(util.format("#{a} is #{b}", {
        a: "rock and roll", b: "dead", ".": "!?"
      }) === "rock and roll is dead");
    });
  });

  describe(".num(value)", function() {
    it("converts into a number", function() {
      assert(util.num(10) === 10);
      assert(util.num("10") === 10);
      assert(util.num(Infinity) === Infinity);
      assert(util.num(NaN) === 0);
      assert(util.num("zero") === 0);
    });
  });

  describe(".int(value)", function() {
    it("converts into an integer", function() {
      assert(util.int(10.5) === 10);
      assert(util.int("10.5") === 10);
      assert(util.int(Infinity) === 0);
      assert(util.int(NaN) === 0);
      assert(util.int("zero") === 0);
    });
  });

  describe(".finite(value)", function() {
    it("converts into a finite number", function() {
      assert(util.finite(10) === 10);
      assert(util.finite(10.5) === 10.5);
      assert(util.finite("10") === 10);
      assert(util.finite("10.5") === 10.5);
      assert(util.finite(Infinity) === 0);
      assert(util.finite(NaN) === 0);
      assert(util.finite("zero") === 0);
    });
  });

  describe(".clip(value, min, max)", function() {
    it("clip a value", function() {
      assert(util.clip(-1.5, -1, +1) === -1);
      assert(util.clip(-0.5, -1, +1) === -0.5);
      assert(util.clip(+0.5, -1, +1) === +0.5);
      assert(util.clip(+1.5, -1, +1) === +1);
    });
  });

  describe(".typeOf(value)", function() {
    it("returns type name", function() {
      assert(util.typeOf(10) === "number");
      assert(util.typeOf([]) === "array");
      assert(util.typeOf("") === "string");
      assert(util.typeOf(it) === "function");
      assert(util.typeOf({}) === "object");
      assert(util.typeOf(true) === "boolean");
      assert(util.typeOf(null) === "null");
      assert(util.typeOf(undefined) === "undefined");
      assert(util.typeOf(NaN) === "nan");
      assert(util.typeOf(new Float32Array()) === "Float32Array");
      assert(util.typeOf({ constructor: null }) === "object");
      assert(util.typeOf({ constructor: true }) === "object");

      function A() {} // minified
      A.$name = "NeuBuffer";

      var a = new A();

      assert(util.typeOf(a) === "NeuBuffer");
    });
  });

  describe(".defaults(value, defaultValue)", function() {
    it("return default value if it receives null or undefined", function() {
      assert(util.defaults(1, 10) === 1);
      assert(util.defaults(0, 10) === 0);
      assert(util.defaults(null, 10) === 10);
      assert(util.defaults(undefined, 10) === 10);
    });
  });

  describe(".inherits(ctor, superCtor)", function() {
    it("inherit the prototype methods from one constructor into another. ", function() {
      function A() {}
      function B() {}
      util.inherits(B, A);
      assert(new B() instanceof A);
    });
  });

});
