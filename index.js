"use strict";

var neume = require("./src/");

neume.use(require("./src/ugen/"));

if (typeof window !== "undefined") {
  window.neume = neume;
}

module.exports = neume;
