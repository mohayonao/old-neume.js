module.exports = function(neume, util) {
  "use strict";

  var AUDIO_BUS_CHANNELS = neume.AUDIO_BUS_CHANNELS;

  neume.register("in", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet = null;

    inputs = inputs.filter(util.isFinite).map(function(index) {
      return getAudioBus(context, index);
    });

    outlet = context.createSum(inputs);

    return new neume.Unit({
      outlet: outlet
    });
  });

  neume.register("out", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var synth = ugen.$synth;
    var outlet = context.createSum(inputs);

    var index = util.clip(util.int(util.defaults(spec.bus, 0)), 0, AUDIO_BUS_CHANNELS);

    synth.$routes[index] = outlet;

    return new neume.Unit({
      outlet: outlet,
      isOutput: true
    });
  });

  neume.register("local-in", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var synth = ugen.$synth;
    var outlet = null;

    inputs = inputs.filter(util.isFinite).map(function(index) {
      return getLocalBus(context, synth, index);
    });

    outlet = context.createSum(inputs);

    return new neume.Unit({
      outlet: outlet
    });
  });

  neume.register("local-out", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var synth = ugen.$synth;
    var outlet = null;

    var index = util.clip(util.int(util.defaults(spec.bus, 0)), 0, AUDIO_BUS_CHANNELS);
    var bus = getLocalBus(context, synth, index);

    outlet = context.createSum(inputs).connect(bus);

    return new neume.Unit({
      outlet: outlet
    });
  });

  function getAudioBus(context, index) {
    index = util.clip(util.int(util.defaults(index, 0)), 0, AUDIO_BUS_CHANNELS);

    return context.getAudioBus(index);
  }

  function getLocalBus(context, synth, index) {
    index = util.clip(util.int(util.defaults(index, 0)), 0, AUDIO_BUS_CHANNELS);

    if (!synth.$localBuses[index]) {
      synth.$localBuses[index] = context.createGain();
    }

    return synth.$localBuses[index];
  }
};
