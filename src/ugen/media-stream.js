module.exports = function(neume) {
  "use strict";

  neume.register("media-stream", function(ugen, spec) {
    return make(setup(ugen, spec.stream));
  });

  function setup(ugen, stream) {
    if (window.MediaStream && stream instanceof window.MediaStream) {
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
