"use strict";

var neume = require("../../src");

describe("neume.KVS", function() {
  it("works", function() {
    var a = {}, b = {};

    assert(neume.KVS.exists("test-data#01") === false);

    neume.KVS.set("test-data#01", a);
    assert(neume.KVS.get("test-data#01") === a);
    assert(neume.KVS.get("test-data#01") === a);
    assert(neume.KVS.get("test-data#01") === a);

    neume.KVS.set("test-data#01", b);
    assert(neume.KVS.get("test-data#01") === b);
    assert(neume.KVS.get("test-data#01") === b);
    assert(neume.KVS.get("test-data#01") === b);

    assert(neume.KVS.exists("test-data#01") === true);
  });
  it("works with function", function() {
    var a = {};
    var val2 = 20;
    var f = function(val) {
      a.val1 = val;
      a.val2 = val2++;
      return a;
    };

    neume.KVS.set("test-data#02", f);
    neume.KVS.set("@test-data#02", f);

    assert(neume.KVS.get("test-data#02") === f);
    assert(neume.KVS.get("test-data#02") === f);

    assert(neume.KVS.get("@test-data#02", 10) === a);
    assert(neume.KVS.get("@test-data#02", 20) === a);
    assert.deepEqual(neume.KVS.get("@test-data#02", 30), {
      val1: 10, val2: 20
    });
  });
  it("error", function() {
    assert.throws(function() {
      neume.KVS.get("test-data#03");
    });
  });

});
