module.exports = function(neuma, _) {
  "use strict";

  /**
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
    var buffer = _.findAudioBuffer(spec.buffer);
    var bufSrc = ugen.$context.createBufferSource();

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

    return new neuma.Unit({
      outlet: bufSrc,
      start: function(t) {
        if (duration != null) {
          bufSrc.start(t, offset, duration);
        } else {
          bufSrc.start(t, offset);
        }
        bufSrc.onended = function() {
          ugen.emit("end", {
            // TODO: calculate end time
            playbackTime: ugen.$context.currentTime
          }, ugen.$synth);
        };
      },
      stop: function(t) {
        bufSrc.stop(t);
      }
    });
  });

};
