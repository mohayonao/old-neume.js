module.exports = function(neume, util) {
  "use strict";

  /**
   * $("buf", {
   *   buffer: AudioBuffer|neume.Buffer = null,
   *   playbackRate: signal = 1,
   *   loop: boolean = false,
   *   loopStart: number = 0,
   *   loopEnd: number = 0,
   *   mul: signal = 1,
   *   add: signal = 0,
   * }, ...inputs:signal)
   *
   * aliases:
   *   $(AudioBuffer), $(neume.Buffer)
   *
   * no inputs
   * +------------------------------+
   * | BufferSourceNode             |
   * | - buffer: buffer             |
   * | - playbackRate: playbackRate |
   * | - loop: loop                 |
   * | - loopStart: loopStart       |
   * | - loopEnd: loopEnd           |
   * +------------------------------+
   *   |
   *
   * has inputs
   * +-----------+     +-----------+
   * | inputs[0] | ... | inputs[N] |
   * +-----------+     +-----------+
   *   |                 |
   *   +-----------------+
   *   |
   *   |             +------------------------------+
   *   |             | BufferSourceNode             |
   *   |             | - buffer: buffer             |
   *   |             | - playbackRate: playbackRate |
   * +-----------+   | - loop: loop                 |
   * | GainNode  |   | - loopStart: loopStart       |
   * | - gain: 0 <---| - loopEnd: loopEnd           |
   * +-----------+   +------------------------------+
   *   |
   */
  neume.register("buf", function(ugen, spec, inputs) {
    return make(util.defaults(spec.buf, spec.buffer), ugen, spec, inputs);
  });

  neume.register("AudioBuffer", function(ugen, spec, inputs) {
    return make(spec.value, ugen, spec, inputs);
  });

  neume.register("NeuBuffer", function(ugen, spec, inputs) {
    return make(spec.value, ugen, spec, inputs);
  });

  function make(buffer, ugen, spec, inputs) {
    var context = ugen.context;
    var outlet = null;

    var bufSrc = context.createBufferSource();
    var gain = null;
    var duration = 0;

    buffer = context.toAudioBuffer(buffer);

    /* istanbul ignore else */
    if (buffer != null) {
      bufSrc.buffer = buffer;
      duration = buffer.duration;
    }

    var loop = !!util.defaults(spec.loop, false);
    var loopStart = util.finite(util.defaults(spec.start, spec.loopStart, 0));
    var loopEnd = util.finite(util.defaults(spec.end, spec.loopEnd, 0));
    var playbackRate = util.defaults(spec.rate, spec.playbackRate, 1);

    bufSrc.loop = loop;
    bufSrc.loopStart = loopStart;
    bufSrc.loopEnd = loopEnd;
    bufSrc.playbackRate.value = 0;
    context.connect(playbackRate, bufSrc.playbackRate);

    if (inputs.length) {
      gain = context.createGain();

      gain.gain.value = 0;

      context.connect(inputs, gain);
      context.connect(bufSrc, gain.gain);

      outlet = gain;
    } else {
      outlet = bufSrc;
    }

    function start(t) {
      bufSrc.start(t);
      bufSrc.onended = function() {
        ugen.emit("end", {
          type: "end",
          synth: ugen.synth,
          playbackTime: t + duration
        });
      };
    }

    function stop(t) {
      bufSrc.onended = null;
      bufSrc.stop(t);
    }

    return new neume.Unit({
      outlet: outlet,
      start: start,
      stop: stop
    });
  }

};
