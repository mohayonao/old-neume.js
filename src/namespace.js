"use strict";

function neume() {
  return neume.impl.apply(null, arguments);
}

neume.version = "0.7.1";

module.exports = neume;
