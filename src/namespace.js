"use strict";

function neume() {
  return neume.impl.apply(null, arguments);
}

neume.version = "0.8.0";

module.exports = neume;
