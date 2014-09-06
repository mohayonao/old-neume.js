"use strict";

var Emitter = require("../src/emitter");

describe("Emitter", function() {
  var emitter = null;

  beforeEach(function() {
    emitter = new Emitter();
  });

  describe("()", function() {
    it("returns an instance of Emitter", function() {
      assert(emitter instanceof Emitter);
    });
  });

  describe("#hasListeners(event)", function() {
    it("checks if it has listeners", function() {
      emitter.on("bang", it);

      assert(emitter.hasListeners("bang") === true);
      assert(emitter.hasListeners("ding") === false);
    });
  });

  describe("#listeners(event)", function() {
    it("returns an array of listeners", function() {
      emitter.on("bang", it);

      assert.deepEqual(emitter.listeners("bang"), [ it ]);
      assert.deepEqual(emitter.listeners("ding"), []);
    });
  });

  describe("#on(event, listener)", function() {
    it("it adds the listener to event listeners", function() {
      var passed = [];

      emitter.on("bang", function(val) {
        passed.push("!", val);
      });

      emitter.on("bang", function(val) {
        passed.push("?", val);
      });

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, [ "!", 1, "?", 1, "!", 3, "?", 3 ]);
    });
  });

  describe("#once(event, listener)", function() {
    it("adds the single-shot listener to event listeners", function() {
      var passed = [];

      emitter.once("bang", function(val) {
        passed.push("!", val);
      });

      emitter.once("bang", function(val) {
        passed.push("?", val);
      });

      emitter.emit("bang", 1);
      emitter.emit("ding", 2);
      emitter.emit("bang", 3);

      assert.deepEqual(passed, [ "!", 1, "?", 1 ]);
    });
  });

  describe("#off(event, listener)", function() {
    it("removes the listener from event listeners", function() {
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

    it("works with #once()", function() {
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

  describe("#off(event)", function() {
    it("removes all listeners from the event", function(){
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

  describe("#off()", function() {
    it("removes all listeners", function(){
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

  describe("#emit(event, payload, ctx)", function() {
    it("emits an event with given payload and this-context", function() {
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
