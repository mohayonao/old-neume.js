module.exports = function(neume) {
  "use strict";

  /**
   * $("media-stream", {
   *   stream: [MediaStream] = null
   * })
   */
  neume.register("media-stream", function(ugen, spec) {
    return make(setup(ugen, spec.stream));
  });

  function setup(ugen, stream) {
    if (global.MediaStream && stream instanceof global.MediaStream) {
      return ugen.$context.createMediaStreamSource(stream);
    }
    return null;
  }

  function make(outlet) {
    return new neume.Unit({
      outlet: outlet
    });
  }
};
