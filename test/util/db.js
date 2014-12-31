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
    it("(selector: string): any[]", function() {
      var db = new neume.DB();

      function ugen(spec) {
        return Object.defineProperties({}, {
          key: {
            value: spec.key,
            enumerable: true
          },
          id: {
            value: spec.id,
            enumerable: true
          },
          class: {
            value: spec.class,
            enumerable: true
          },
          hasClass: {
            value: function(className) {
              return spec.class.split(" ").indexOf(className) !== -1;
            },
            enumerable: false
          }
        });
      }

      db.append(ugen({ key: "line", id: "id1", class: "amp" }));
      db.append(ugen({ key: "line", id: "id2", class: "amp" }));
      db.append(ugen({ key: "line", id: "id3", class: "mod" }));
      db.append(ugen({ key: "line", id: "id4", class: "mod" }));
      db.append(ugen({ key: "gate", id: "id5", class: "amp" }));
      db.append(ugen({ key: "gate", id: "id6", class: "amp" }));
      db.append(ugen({ key: "gate", id: "id7", class: "mod ar" }));
      db.append(ugen({ key: "gate", id: "id8", class: "mod kr" }));

      assert.deepEqual(db.find({ key: "line" }), [
        { key: "line", id: "id1", class: "amp" },
        { key: "line", id: "id2", class: "amp" },
        { key: "line", id: "id3", class: "mod" },
        { key: "line", id: "id4", class: "mod" },
      ], "line:end");

      assert.deepEqual(db.find({ id: "id1" }), [
        { key: "line", id: "id1", class: "amp" },
      ], "#id:end");

      assert.deepEqual(db.find({ classes: [ "mod" ] }), [
        { key: "line", id: "id3", class: "mod" },
        { key: "line", id: "id4", class: "mod" },
        { key: "gate", id: "id7", class: "mod ar" },
        { key: "gate", id: "id8", class: "mod kr" },
      ], ".mod:end");

      assert.deepEqual(db.find({ key: "gate", classes: [ "mod" ] }), [
        { key: "gate", id: "id7", class: "mod ar" },
        { key: "gate", id: "id8", class: "mod kr" },
      ], "gate.mod:end");

      assert.deepEqual(db.find({ key: "gate", classes: [ "mod", "kr" ] }), [
        { key: "gate", id: "id8", class: "mod kr" },
      ], "gate.mod:end");

      assert.deepEqual(db.find({ key: "gate", id: "id1" }), [], "gate#id1");

      assert.deepEqual(db.find({ id: "notExists" }), [], "#notExists");
    });
  });

});
