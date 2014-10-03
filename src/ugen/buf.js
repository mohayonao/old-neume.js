module.exports = function(neume, _) {
  "use strict";

  /**
   * $("buf", {
   *   buf  : [AudioBuffer|NeuBuffer] = null
   *   rate : [number|UGen] = 1
   *   loop : [boolean] = false
   *   start: [number] = 0
   *   end  : [number] = 0
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
    return make(spec.buf, ugen, spec);
  });

  neume.register("audiobuffer", function(ugen, spec) {
    return make(spec.value, ugen, spec);
  });

  neume.register("neubuffer", function(ugen, spec) {
    return make(spec.value, ugen, spec);
  });

  function make(buffer, ugen, spec) {
    buffer = _.findAudioBuffer(buffer);

    var context = ugen.$context;
    var bufSrc  = context.createBufferSource();

    /* istanbul ignore else */
    if (buffer != null) {
      bufSrc.buffer = buffer;
    }
    bufSrc.loop = !!_.defaults(spec.loop, false);
    bufSrc.loopStart = _.finite(_.defaults(spec.start, 0));
    bufSrc.loopEnd   = _.finite(_.defaults(spec.end  , 0));

    bufSrc.playbackRate.value = 0;
    context.connect(_.defaults(spec.rate, 1), bufSrc.playbackRate);

    var offset = _.finite(_.defaults(spec.offset, 0));
    var duration = _.defaults(spec.dur, null);
    if (duration != null) {
      duration = _.finite(duration);
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
      start : start,
      stop  : stop
    });
  }

};
