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
      return make(setup(ugen.$context, spec.value, inputs));
    });
  });

  function setup(context, audioNode, inputs) {
    if (audioNode.numberOfInputs) {
      context.createNeuSum(inputs).connect(audioNode);
    }
    return audioNode;
  }

  function make(audioNode) {
    return new neume.Unit({
      outlet: audioNode
    });
  }

};
