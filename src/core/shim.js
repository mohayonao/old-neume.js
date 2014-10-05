/* istanbul ignore next */
(function() {
  "use strict";

  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;

  if (typeof window.AudioContext !== "undefined") {
    if (typeof window.AudioContext.prototype.createGain !== "function"){
      window.AudioContext.prototype.createGain = window.AudioContext.prototype.createGainNode;
    }
    if (typeof window.AudioContext.prototype.createDelay !== "function"){
      window.AudioContext.prototype.createDelay = window.AudioContext.prototype.createDelayNode;
    }
    if (typeof window.AudioContext.prototype.createPeriodicWave !== "function") {
      window.AudioContext.prototype.createPeriodicWave = window.AudioContext.prototype.createWaveTable;
    }
    if (typeof window.AudioBufferSourceNode.prototype.start !== "function"){
  		window.AudioBufferSourceNode.prototype.start = window.AudioBufferSourceNode.prototype.noteGrainOn;
  	}
  	if (typeof window.AudioBufferSourceNode.prototype.stop !== "function"){
  		window.AudioBufferSourceNode.prototype.stop = window.AudioBufferSourceNode.prototype.noteOff;
  	}
  	if (typeof window.OscillatorNode.prototype.start !== "function"){
  		window.OscillatorNode.prototype.start = window.OscillatorNode.prototype.noteOn;
  	}
  	if (typeof window.OscillatorNode.prototype.stop !== "function"){
  		window.OscillatorNode.prototype.stop = window.OscillatorNode.prototype.noteOff;
  	}
    if (typeof window.OscillatorNode.prototype.setPeriodicWave !== "function"){
  		window.OscillatorNode.prototype.setPeriodicWave = window.OscillatorNode.prototype.setWaveTable;
  	}
    if (typeof window.PeriodicWave === "undefined" && typeof window.WaveTable !== "undefined") {
      window.PeriodicWave = window.WaveTable;
      window.WaveTable.$name = "PeriodicWave";
    }
  }
})();
