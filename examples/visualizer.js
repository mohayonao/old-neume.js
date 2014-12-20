window.Visualizer = (function() {
  "use strict";

  function Visualizer(canvas, init) {
    this.canvas = canvas;
    this.width  = canvas.width  = canvas.offsetWidth;
    this.height = canvas.height = canvas.offsetHeight;

    this.fps = 60;
    this.state = "init";

    if (this.canvas.getContext) {
      this.context = this.canvas.getContext("2d");
    } else {
      this.context = null;
    }

    this._lock = false;

    if (init) {
      init.call(this);
    }
  }

  Visualizer.canUseWebGL = function () {
    try {
      return !!window.WebGLRenderingContext && !!document.createElement("canvas").getContext("experimental-webgl");
    } catch(e) {
      return false;
    }
  };

  Visualizer.prototype.canUseWebGL = Visualizer.canUseWebGL;

  Visualizer.prototype.start = function() {
    if (this.state !== "start") {
      this.state = "start";
      if (this.onstart) {
        this.onstart();
      }
      this.animate();
    }
    return this;
  };

  Visualizer.prototype.stop = function() {
    if (this.state === "start") {
      this.state = "stop";
      if (this.onstop) {
        this.onstop();
      }
    }
    return this;
  };

  Visualizer.prototype.animate = function() {
    var _this = this;
    if (!this._lock) {
      this._lock = true;
      requestAnimationFrame(function() {
        _this.render(Date.now());
        _this._lock = false;
      });
    }
    if (this.state === "start") {
      setTimeout(function() {
        _this.animate();
      }, 1000 / this.fps);
    }
    return this;
  };

  Visualizer.prototype.render = function() {
  };

  return Visualizer;
})();
