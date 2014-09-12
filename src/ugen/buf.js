module.exports = function(neuma, _) {
  "use strict";

  /**
   * $("buf", {
   *   buffer      : AudioBuffer|NeuBuffer = null,
   *   playbackRate: number|UGen = 1
   *   loop        : boolean = false
   *   loopStart   : number = 0
   *   loopEnd     : number = 0
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
   * +---------------------------+
   * | BufferSourceNode          |
   * | - buffer: buffer(null)    |
   * | - playbackRate: rate(1)   |
   * | - loop: loop(false)       |
   * | - loopStart: loopStart(0) |
   * | - loopEnd: loopEnd(0)     |
   * +---------------------------+
   *   |
   */
  neuma.register("buf", function(ugen, spec) {
    return make(spec.buffer, ugen, spec);
  });

  neuma.register("audiobuffer", function(ugen, spec) {
    return make(spec.value, ugen, spec);
  });

  neuma.register("neubuffer", function(ugen, spec) {
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
    bufSrc.loopStart = _.finite(_.defaults(spec.loopStart, 0));
    bufSrc.loopEnd   = _.finite(_.defaults(spec.loopEnd  , 0));

    bufSrc.playbackRate.value = 0;
    _.connect({ from: _.defaults(spec.rate, 1), to: bufSrc.playbackRate });

    var offset = _.finite(_.defaults(spec.offset, 0));
    var duration = _.defaults(spec.duration, null);
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
        ugen.emit("end", {
          playbackTime: context.currentTime
        }, ugen.$synth);
      };
    }

    function stop(t) {
      bufSrc.stop(t);
    }

    return new neuma.Unit({
      outlet: bufSrc,
      start : start,
      stop  : stop
    });
  }

};
