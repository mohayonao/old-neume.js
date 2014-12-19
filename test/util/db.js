"use strict";

var neume = require("../../src");

describe("neume.DB", function() {
  describe("constructor", function() {
    it("()", function() {
      var db = new neume.DB();

      assert(db instanceof neume.DB);
    });
  });

  describe("#append", function() {
    it("(obj: any): self", function() {
      var db = new neume.DB();

      assert(db.append({ a: 0 }) === db);
      assert(db.append({ b: 1 }) === db);

      assert.deepEqual(db.all(), [ { a: 0 }, { b: 1 } ]);
    });
  });

  describe("#all", function() {
    it("(): Array<any>", function() {
      var db = new neume.DB();

      db.append({ a: 0 });
      db.append({ b: 1 });
      db.append({ c: 2 });

      assert.deepEqual(db.all(), [ { a: 0 }, { b: 1 }, { c: 2 } ]);
    });
  });

  describe("#find", function() {
    it("(selector: string): Array<any>", function() {
      var db = new neume.DB();

      db.append({ key: "line", id: "id1", classes: [ "amp" ] });
      db.append({ key: "line", id: "id2", classes: [ "amp" ] });
      db.append({ key: "line", id: "id3", classes: [ "mod" ] });
      db.append({ key: "line", id: "id4", classes: [ "mod" ] });
      db.append({ key: "gate", id: "id5", classes: [ "amp" ] });
      db.append({ key: "gate", id: "id6", classes: [ "amp" ] });
      db.append({ key: "gate", id: "id7", classes: [ "mod", "ar" ] });
      db.append({ key: "gate", id: "id8", classes: [ "mod", "kr" ] });

      assert.deepEqual(db.find({ key: "line" }), [
        { key: "line", id: "id1", classes: [ "amp" ] },
        { key: "line", id: "id2", classes: [ "amp" ] },
        { key: "line", id: "id3", classes: [ "mod" ] },
        { key: "line", id: "id4", classes: [ "mod" ] },
      ], "line:end");

      assert.deepEqual(db.find({ id: "id1" }), [
        { key: "line", id: "id1", classes: [ "amp" ] },
      ], "#id:end");

      assert.deepEqual(db.find({ classes: [ "mod" ] }), [
        { key: "line", id: "id3", classes: [ "mod" ] },
        { key: "line", id: "id4", classes: [ "mod" ] },
        { key: "gate", id: "id7", classes: [ "mod", "ar" ] },
        { key: "gate", id: "id8", classes: [ "mod", "kr" ] },
      ], ".mod:end");

      assert.deepEqual(db.find({ key: "gate", classes: [ "mod" ] }), [
        { key: "gate", id: "id7", classes: [ "mod", "ar" ] },
        { key: "gate", id: "id8", classes: [ "mod", "kr" ] },
      ], "gate.mod:end");

      assert.deepEqual(db.find({ key: "gate", classes: [ "mod", "kr" ] }), [
        { key: "gate", id: "id8", classes: [ "mod", "kr" ] },
      ], "gate.mod:end");

      assert.deepEqual(db.find({ key: "gate", id: "id1" }), [], "gate#id1");

      assert.deepEqual(db.find({ id: "notExists" }), [], "#notExists");
    });
  });

});
