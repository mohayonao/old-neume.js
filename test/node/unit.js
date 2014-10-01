"use strict";

var NeuUnit = require("../../src/node/unit");

describe("NeuUnit", function() {
  var spec = null;
  var unit = null;

  beforeEach(function() {
    spec = {
      outlet: {},
      start : function() {},
      stop  : function() {},
      methods: {
        bang: function() {}
      }
    };
    unit = new NeuUnit(spec);
  });

  describe("#start(t)", function() {
    it("calls spec.start(t) only once", function() {
      var spy = sinon.spy(spec, "start");

      unit.start(10);
      unit.start(20);
      unit.start(30);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 10 ]);
    });
  });

  describe("#stop(t)", function() {
    it("calls spec.stop(t) only once with calling start first", function() {
      var spy = sinon.spy(spec, "stop");

      unit.stop(10);
      assert(spec.stop.called === false, "call without calling start first");

      unit.start(10);

      unit.stop(20);
      unit.stop(30);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 20 ]);
    });
  });

  describe("#apply(method, args)", function() {
    it("apply spec.method", function() {
      var spy = sinon.spy(spec.methods, "bang");

      unit.apply("bang", [ 1, 2, 3 ]);
      unit.apply("bong", [ 4, 5, 6 ]);

      assert(spy.calledOnce === true);
      assert.deepEqual(spy.firstCall.args, [ 1, 2, 3 ]);
    });
  });

});
