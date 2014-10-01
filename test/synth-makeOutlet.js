"use strict";

var _ = require("../src/utils");

var NeuContext = require("../src/context");
var NeuUGen    = require("../src/node/ugen");
var makeOutlet = require("../src/synth-makeOutlet");

function NeuUGenMock() {
  this.$outlet = null;
  this.$offset = 0;
}
_.inherits(NeuUGenMock, NeuUGen);

describe("NeuSynth::makeOutlet", function() {
  var context = null;

  beforeEach(function() {
    context = new NeuContext(new window.AudioContext().destination);
  });

  it("works with non UGen", function() {
    var outlet = makeOutlet(context, null);

    assert(outlet === null);
  });
  it("works with an empty UGen", function() {
    var ugen = new NeuUGenMock();
    var outlet = makeOutlet(context, ugen);

    assert(outlet === null);
  });
  it("works with an outlet only", function() {
    var ugen = new NeuUGenMock();

    ugen.$outlet = context.createGain();
    ugen.$outlet.$id = "outlet";

    var outlet = makeOutlet(context, ugen);

    assert.deepEqual(outlet.toJSON(), {
      name: "GainNode#outlet",
      gain: {
        value: 1,
        inputs: []
      },
      inputs: []
    });
  });
  it("works with an offset only", function() {
    var ugen = new NeuUGenMock();

    ugen.$offset = 100;

    var outlet = makeOutlet(context, ugen);

    assert.deepEqual(outlet.toJSON(), {
      name: "GainNode",
      gain: {
        value: 100,
        inputs: []
      },
      inputs: [ DC(1) ]
    });
  });
  it("works with an outlet and an offset", function() {
    var ugen = new NeuUGenMock();

    ugen.$outlet = context.createGain();
    ugen.$outlet.$id = "outlet";
    ugen.$offset = 100;

    var outlet = makeOutlet(context, ugen);

    assert.deepEqual(outlet.toJSON(), {
      name: "GainNode",
      gain: {
        value: 1,
        inputs: []
      },
      inputs: [
        {
          name: "GainNode#outlet",
          gain: {
            value: 1,
            inputs: []
          },
          inputs: []
        },
        {
          name: "GainNode",
          gain: {
            value: 100,
            inputs: []
          },
          inputs: [ DC(1) ]
        }
      ]
    });
  });

});
