module.exports = function(neume) {
  "use strict";

  [
    "AudioBufferSourceNode",
    "MediaElementAudioSourceNode",
    "MediaStreamAudioSourceNode",
    "ScriptProcessorNode",
    "GainNode",
    "BiquadFilterNode",
    "DelayNode",
    "PannerNode",
    "ConvolverNode",
    "AnalyserNode",
    "DynamicsCompressorNode",
    "WaveShaperNode",
    "OscillatorNode",
  ].forEach(function(name) {
    neume.register(name, function(ugen, spec, inputs) {
      return make(ugen, spec, inputs);
    });
  });

  function make(ugen, spec, inputs) {
    var context = ugen.$context;
    var outlet = spec.value;

    if (outlet.numberOfInputs) {
      context.connect(inputs, outlet);
    }

    return new neume.Unit({
      outlet: outlet
    });
  }

};
