module.exports = function(neume, _) {
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

      return make(setup(node, inputs));
    });
  });

  function setup(audioNode, inputs) {
    inputs.forEach(function(node) {
      _.connect({ from: node, to: audioNode });
    });
    return audioNode;
  }

  function make(audioNode) {
    return new neume.Unit({
      outlet: audioNode
    });
  }

};
