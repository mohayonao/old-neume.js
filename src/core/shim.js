/* istanbul ignore next */
(function() {
  "use strict";

  global.AudioContext = global.AudioContext || global.webkitAudioContext;
  global.OfflineAudioContext = global.OfflineAudioContext || global.webkitOfflineAudioContext;

  if (typeof global.AudioContext !== "undefined") {
    if (typeof global.AudioContext.prototype.createGain !== "function") {
      global.AudioContext.prototype.createGain = global.AudioContext.prototype.createGainNode;
    }
    if (typeof global.AudioContext.prototype.createDelay !== "function") {
      global.AudioContext.prototype.createDelay = global.AudioContext.prototype.createDelayNode;
    }
    if (typeof global.AudioContext.prototype.createPeriodicWave !== "function") {
      global.AudioContext.prototype.createPeriodicWave = global.AudioContext.prototype.createWaveTable;
    }
    if (typeof global.AudioBufferSourceNode.prototype.start !== "function") {
      global.AudioBufferSourceNode.prototype.start = global.AudioBufferSourceNode.prototype.noteGrainOn;
    }
    if (typeof global.AudioBufferSourceNode.prototype.stop !== "function") {
      global.AudioBufferSourceNode.prototype.stop = global.AudioBufferSourceNode.prototype.noteOff;
    }
    if (typeof global.OscillatorNode.prototype.start !== "function") {
      global.OscillatorNode.prototype.start = global.OscillatorNode.prototype.noteOn;
    }
    if (typeof global.OscillatorNode.prototype.stop !== "function") {
      global.OscillatorNode.prototype.stop = global.OscillatorNode.prototype.noteOff;
    }
    if (typeof global.OscillatorNode.prototype.setPeriodicWave !== "function") {
      global.OscillatorNode.prototype.setPeriodicWave = global.OscillatorNode.prototype.setWaveTable;
    }
    if (typeof global.PeriodicWave === "undefined" && typeof global.WaveTable !== "undefined") {
      global.PeriodicWave = global.WaveTable;
      global.WaveTable.$$name = "PeriodicWave";
    }
  }
})();
