"use strict";

function neume() {
  return neume.impl.apply(null, arguments);
}

neume.version = "0.7.0";

module.exports = neume;
