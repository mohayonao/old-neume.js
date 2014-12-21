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
   * })
   *
   * aliases:
   *   $(AudioBuffer), $(neume.Buffer)
   *
   * +------------------------------+
   * | BufferSourceNode             |
   * | - buffer: buffer             |
   * | - playbackRate: playbackRate |
   * | - loop: loop                 |
   * | - loopStart: loopStart       |
   * | - loopEnd: loopEnd           |
   * +------------------------------+
   *   |
   */
  neume.register("buf", function(ugen, spec) {
    return make(util.defaults(spec.buf, spec.buffer), ugen, spec);
  });

  neume.register("AudioBuffer", function(ugen, spec) {
    return make(spec.value, ugen, spec);
  });

  neume.register("NeuBuffer", function(ugen, spec) {
    return make(spec.value, ugen, spec);
  });

  function make(buffer, ugen, spec) {
    var context = ugen.context;
    var bufSrc = context.createBufferSource();

    buffer = context.toAudioBuffer(buffer);

    /* istanbul ignore else */
    if (buffer != null) {
      bufSrc.buffer = buffer;
    }
    bufSrc.loop = !!util.defaults(spec.loop, false);
    bufSrc.loopStart = util.finite(util.defaults(spec.start, spec.loopStart, 0));
    bufSrc.loopEnd = util.finite(util.defaults(spec.end, spec.loopEnd, 0));

    bufSrc.playbackRate.value = 0;
    context.connect(util.defaults(spec.rate, spec.playbackRate, 1), bufSrc.playbackRate);

    var offset = util.finite(util.defaults(spec.offset, 0));
    var duration = context.toSeconds(util.defaults(spec.dur, spec.duration, null));
    if (duration != null) {
      duration = util.finite(duration);
    }

    function start(t) {
      if (duration != null) {
        bufSrc.start(t, offset, duration);
      } else {
        bufSrc.start(t, offset);
      }
      bufSrc.onended = function() {
        ugen.emit("end", {
          type: "end",
          synth: ugen.synth,
          playbackTime: context.currentTime
        });
      };
    }

    function stop(t) {
      bufSrc.onended = null;
      bufSrc.stop(t);
    }

    return new neume.Unit({
      outlet: bufSrc,
      start: start,
      stop: stop
    });
  }

};
