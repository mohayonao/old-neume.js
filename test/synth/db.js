"use strict";

var NeuSynthDB = require("../../src/synth/db");

describe("NeuSynthDB", function() {
  describe("constructor", function() {
    it("()", function() {
      var db = new NeuSynthDB();

      assert(db instanceof NeuSynthDB);
    });
  });

  describe("#append", function() {
    it("(obj: any): self", function() {
      var db = new NeuSynthDB();

      assert(db.append() === db);
      db.append({ a: 0 });
      db.append({ b: 1 });
      db.append("string");

      assert.deepEqual(db.all(), [ { a: 0 }, { b: 1 } ]);
    });
  });

  describe("#all", function() {
    it("(): Array<any>", function() {
      var db = new NeuSynthDB();

      db.append({ a: 0 });
      db.append({ b: 1 });
      db.append({ c: 2 });

      assert.deepEqual(db.all(), [ { a: 0 }, { b: 1 }, { c: 2 } ]);
    });
  });

  describe("#find", function() {
    it("(selector: string): Array<any>", function() {
      var db = new NeuSynthDB();

      db.append({ $key: "line", $id: "id1", $class: [ "amp" ] });
      db.append({ $key: "line", $id: "id2", $class: [ "amp" ] });
      db.append({ $key: "line", $id: "id3", $class: [ "mod" ] });
      db.append({ $key: "line", $id: "id4", $class: [ "mod" ] });
      db.append({ $key: "gate", $id: "id5", $class: [ "amp" ] });
      db.append({ $key: "gate", $id: "id6", $class: [ "amp" ] });
      db.append({ $key: "gate", $id: "id7", $class: [ "mod", "ar" ] });
      db.append({ $key: "gate", $id: "id8", $class: [ "mod", "kr" ] });

      assert.deepEqual(db.find("line"), [
        { $key: "line", $id: "id1", $class: [ "amp" ] },
        { $key: "line", $id: "id2", $class: [ "amp" ] },
        { $key: "line", $id: "id3", $class: [ "mod" ] },
        { $key: "line", $id: "id4", $class: [ "mod" ] },
      ], "line:end");

      assert.deepEqual(db.find("#id1"), [
        { $key: "line", $id: "id1", $class: [ "amp" ] },
      ], "#id:end");

      assert.deepEqual(db.find(".mod"), [
        { $key: "line", $id: "id3", $class: [ "mod" ] },
        { $key: "line", $id: "id4", $class: [ "mod" ] },
        { $key: "gate", $id: "id7", $class: [ "mod", "ar" ] },
        { $key: "gate", $id: "id8", $class: [ "mod", "kr" ] },
      ], ".mod:end");

      assert.deepEqual(db.find("gate.mod"), [
        { $key: "gate", $id: "id7", $class: [ "mod", "ar" ] },
        { $key: "gate", $id: "id8", $class: [ "mod", "kr" ] },
      ], "gate.mod:end");

      assert.deepEqual(db.find("gate.mod.kr"), [
        { $key: "gate", $id: "id8", $class: [ "mod", "kr" ] },
      ], "gate.mod:end");

      assert.deepEqual(db.find("gate#id1"), [], "gate#id1");

      assert.deepEqual(db.find("#notExists"), [], "#notExists");
    });
  });

});
