module.exports = function(neume) {
  "use strict";

  neume.register("media", function(ugen, spec) {
    return make(setup(ugen, spec.media));
  });

  neume.register("htmlaudioelement", function(ugen, spec) {
    return make(setup(ugen, spec.value));
  });

  neume.register("htmlvideoelement", function(ugen, spec) {
    return make(setup(ugen, spec.value));
  });

  function setup(ugen, media) {
    if (window.HTMLMediaElement && media instanceof window.HTMLMediaElement) {
      return ugen.$context.createMediaElementSource(media);
    }
    return null;
  }

  function make(outlet) {
    return new neume.Unit({
      outlet: outlet
    });
  }
};
