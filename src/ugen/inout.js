module.exports = function(neume, _) {
  "use strict";

  var MAX_AUDIO_BUS_SIZE = neume.MAX_AUDIO_BUS_SIZE;
  var MAX_CONTROL_BUS_SIZE = neume.MAX_CONTROL_BUS_SIZE;

  neume.register("in", function(ugen, spec, inputs) {
    var rate = _.defaults(spec.rate, "a");

    if (rate === "a" || rate === "ar" || rate === "audio") {
      return audioIn(ugen, spec, inputs);
    }

    return controlIn(ugen, spec, inputs);
  });

  neume.register("audio-in", audioIn);
  neume.register("control-in", controlIn);

  function audioIn(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet  = null;

    inputs = inputs.filter(_.isFinite).map(function(index) {
      return createAudioIn(context, index);
    });

    outlet = context.createSum(inputs);

    return new neume.Unit({
      outlet: outlet
    });
  }

  function controlIn(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet  = null;

    inputs = inputs.filter(_.isFinite).map(function(index) {
      return createControlIn(context, index);
    });

    outlet = context.createSum(inputs);

    return new neume.Unit({
      outlet: outlet
    });
  }

  neume.register("out", function(ugen, spec, inputs) {
    var context = ugen.$context;
    var synth   = ugen.$synth;
    var outlet  = context.createSum(inputs);

    var index = Math.max(0, Math.min(_.finite(_.defaults(spec.bus, 0))|0, MAX_AUDIO_BUS_SIZE));

    synth.$outputs[index] = outlet;

    return new neume.Unit({
      outlet: outlet,
      isOutput: true
    });
  });

  function createAudioIn(context, index) {
    index = Math.max(0, Math.min(_.finite(_.defaults(index, 0))|0, MAX_AUDIO_BUS_SIZE));

    return context.getAudioBus(index);
  }

  function createControlIn(context, index) {
    index = Math.max(0, Math.min(_.finite(_.defaults(index, 0))|0, MAX_CONTROL_BUS_SIZE));

    return context.getControlBus(index);
  }
};
