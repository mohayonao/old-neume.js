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

});
