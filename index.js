"use strict";

var neuma = require("./src/neuma");

neuma.use(require("./src/ugen/index"));

if (typeof window !== "undefined") {
  window.Neuma = neuma.Neuma;
}

module.exports = neuma;
