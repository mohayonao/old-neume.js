module.exports = function(neume, util) {
  "use strict";

  /**
   * $("buf", {
   *   buf: [AudioBuffer|NeuBuffer] = null
   *   rate: [number|UGen] = 1
   *   loop: [boolean] = false
   *   start: [number] = 0
   *   end: [number] = 0
   * })
   *
   * aliases:
   *   $(AudioBuffer), $(NeuBuffer)
   *
   * start:
   *   start BufferSourceNode
   *
   * stop:
   *   stop BufferSourceNode
   *
   * +-------------------------+
   * | BufferSourceNode        |
   * | - buffer: buf(null)     |
   * | - playbackRate: rate(1) |
   * | - loop: loop(false)     |
   * | - loopStart: start(0)   |
   * | - loopEnd: end(0)       |
   * +-------------------------+
   *   |
   */
  neume.register("buf", function(ugen, spec) {
    return make(spec.buf || spec.buffer, ugen, spec);
  });

  neume.register("AudioBuffer", function(ugen, spec) {
    return make(spec.value, ugen, spec);
  });

  neume.register("NeuBuffer", function(ugen, spec) {
    return make(spec.value, ugen, spec);
  });

  function make(buffer, ugen, spec) {
    var context = ugen.$context;
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
        // TODO: test!!
        ugen.emit("end", {
          playbackTime: context.currentTime
        }, ugen.$synth);
      };
    }

    function stop(t) {
      bufSrc.stop(t);
    }

    return new neume.Unit({
      outlet: bufSrc,
      start: start,
      stop: stop
    });
  }

};
