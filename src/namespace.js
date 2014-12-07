"use strict";

function neume() {
  return neume.impl.apply(null, arguments);
}

module.exports = neume;
