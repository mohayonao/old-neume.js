"use strict";

var neume = require("../../src");

describe("neume.Emitter", function() {
  var emitter = null;

  beforeEach(function() {
    emitter = new neume.Emitter();
  });

  describe("constructor", function() {
    it("()", function() {
      assert(emitter instanceof neume.Emitter);
    });
  });

  describe("#hasListeners", function() {
    it("(event: string): boolean", function() {
      emitter.on("bang", it);

      assert(emitter.hasListeners("bang") === true);
      assert(emitter.hasListeners("ding") === false);
    });
  });

  describe("#listeners", function() {
    it("(event: string): Array<function>", function() {
      emitter.on("bang", it);

      assert.deepEqual(emitter.listeners("bang"), [ it ]);
      assert.deepEqual(emitter.listeners("ding"), []);
    });
  });

  describe("#on", function() {
    it("(event: string, listener: function): self", function() {
      var passed = [];

      emitter.on("bang", function(val) {
        passed.push("!", val);
      });

      emitter.on("bang", function(val) {
        passed.push("?", val);
      });

      emitter.on("ding", "ding");

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, [ "!", 1, "?", 1, "!", 3, "?", 3 ]);
    });
  });

  describe("#once", function() {
    it("(event: string, listener: function): self", function() {
      var passed = [];

      emitter.once("bang", function(val) {
        passed.push("!", val);
      });

      emitter.once("bang", function(val) {
        passed.push("?", val);
      });

      emitter.once("ding", "ding");

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, [ "!", 1, "?", 1 ]);
    });
  });

  describe("#off", function() {
    it("(event: string, listener: function): self", function() {
      var passed = [];

      function bang(val) {
        passed.push("!", val);
      }

      emitter.on("bang", bang);

      emitter.on("bang", function(val) {
        passed.push("?", val);
      });

      emitter.off("bang", bang);
      emitter.off("ding", bang);

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, [ "?", 1, "?", 3 ]);
    });
    it("(event: string, listener: function): self // works with #once()", function() {
      var passed = [];

      function bang(val) {
        passed.push("!", val);
      }

      emitter.once("bang", bang);

      emitter.once("bang", function(val) {
        passed.push("?", val);
      });

      emitter.off("bang", bang);
      emitter.off("ding", bang);

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, [ "?", 1 ]);
    });
  });

  describe("#off", function() {
    it("(event: string): self", function() {
      var passed = [];

      emitter.once("bang", function(val) {
        passed.push("!", val);
      });

      emitter.once("bang", function(val) {
        passed.push("?", val);
      });

      emitter.off("bang");
      emitter.off("ding");

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, []);
    });
  });

  describe("#off", function() {
    it("(): self", function() {
      var passed = [];

      emitter.once("bang", function(val) {
        passed.push("!", val);
      });

      emitter.once("bang", function(val) {
        passed.push("?", val);
      });

      emitter.off();

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, []);
    });
  });

  describe("#emit", function() {
    it("(event: string, payload: any, context: any): void", function() {
      var object = {};
      var passed = [];

      emitter.on("bang", function(val) {
        assert(this === object);
        passed.push(val);
      });
      emitter.on("ding", function(val) {
        assert(this === emitter);
        passed.push(val);
      });

      emitter.emit("bang", 1, object);
      emitter.emit("ding", 2);

      assert.deepEqual(passed, [ 1, 2 ]);
    });
  });

});
