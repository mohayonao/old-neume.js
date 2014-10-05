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
    name = name.toLowerCase();

    neume.register(name, function(ugen, spec, inputs) {
      var node = spec.value;

      if (node && node.numberOfInputs === 0) {
        inputs = [];
      }

      return make(setup(ugen.$context, node, inputs));
    });
  });

  function setup(context, audioNode, inputs) {
    context.createSum(inputs).connect(audioNode);
    return audioNode;
  }

  function make(audioNode) {
    return new neume.Unit({
      outlet: audioNode
    });
  }

};
