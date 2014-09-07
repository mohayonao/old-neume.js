"use strict";

var _ = require("./utils");

function NeuBuffer(context, buffer) {
  this.$context = context;
  this.$buffer = buffer;

  Object.defineProperties(this, {
    sampleRate: {
      value: this.$buffer.sampleRate,
      enumerable: true
    },
    length: {
      value: this.$buffer.length,
      enumerable: true
    },
    duration: {
      value: this.$buffer.duration,
      enumerable: true
    },
    numberOfChannels: {
      value: this.$buffer.numberOfChannels,
      enumerable: true
    },
  });

  for (var i = 0; i < this.$buffer.numberOfChannels; i++) {
    Object.defineProperty(this, i, {
      value: this.$buffer.getChannelData(i)
    });
  }
}

NeuBuffer.create = function(context, channels, length, sampleRate) {
  channels   = _.int(_.defaults(channels, 1));
  length     = _.int(_.defaults(length, 0));
  sampleRate = _.int(_.defaults(sampleRate, context.sampleRate));

  return new NeuBuffer(context, context.createBuffer(channels, length, sampleRate));
};

NeuBuffer.from = function(context, data) {
  var buffer = context.createBuffer(1, data.length, context.sampleRate);
  var chData = buffer.getChannelData(0);

  for (var i = 0, imax = data.length; i < imax; i++) {
    chData[i] = data[i];
  }

  return new NeuBuffer(context, buffer);
};

NeuBuffer.load = function(context, url) {
  return new window.Promise(function(resolve, reject) {
    loadWithXHR(url).then(function(audioData) {
      return decodeAudioData(context, audioData);
    }).then(function(decodedData) {
      resolve(new NeuBuffer(context, decodedData));
    }).catch(function(e) {
      reject(e);
    });
  });
};

function loadWithXHR(url) {
  return new window.Promise(function(resolve, reject) {
    var xhr = new window.XMLHttpRequest();

    xhr.open("GET", url);
    xhr.responseType = "arraybuffer";

    xhr.onload = function() {
      resolve(xhr.response);
    };

    xhr.onerror = function() {
      reject({/* TODO: error object */});
    };

    xhr.send();
  });
}

function decodeAudioData(context, audioData) {
  return new window.Promise(function(resolve, reject) {
    _.findAudioContext(context).decodeAudioData(audioData, function(decodedData) {
      resolve(decodedData);
    }, function() {
      reject({/* TODO: error object */});
    });
  });
}

NeuBuffer.prototype.concat = function() {
  var args = _.toArray(arguments).filter(function(elem) {
    return (elem instanceof NeuBuffer) && (this.numberOfChannels === elem.numberOfChannels);
  }, this);
  var channels = this.numberOfChannels;
  var length = args.reduce(function(a, b) {
    return a + b.length;
  }, this.length);
  var sampleRate = this.sampleRate;
  var buffer = this.$context.createBuffer(channels, length, sampleRate);

  args.unshift(this);

  var argslen = args.length;

  for (var i = 0; i < channels; i++) {
    var data = buffer.getChannelData(i);
    var pos  = 0;
    for (var j = 0; j < argslen; j++) {
      data.set(args[j][i], pos);
      pos += args[j].length;
    }
  }

  return new NeuBuffer(this.$context, buffer);
};

NeuBuffer.prototype.reverse = function() {
  var channels = this.numberOfChannels;
  var buffer = this.$context.createBuffer(channels, this.length, this.sampleRate);

  for (var i = 0; i < channels; i++) {
    buffer.getChannelData(i).set(_.toArray(this[i]).reverse());
  }

  return new NeuBuffer(this.$context, buffer);
};

NeuBuffer.prototype.slice = function(start, end) {
  start = _.int(_.defaults(start, 0));
  end   = _.int(_.defaults(end  , this.length));

  if (start < 0) {
    start += this.length;
  } else {
    start = Math.min(start, this.length);
  }
  if (end < 0) {
    end += this.length;
  } else {
    end = Math.min(end, this.length);
  }

  var channels = this.numberOfChannels;
  var length = end - start;
  var sampleRate = this.sampleRate;
  var buffer = null;

  if (length <= 0) {
    buffer = this.$context.createBuffer(channels, 1, sampleRate);
  } else {
    buffer = this.$context.createBuffer(channels, length, sampleRate);
    for (var i = 0; i < channels; i++) {
      buffer.getChannelData(i).set(this[i].subarray(start, end));
    }
  }

  return new NeuBuffer(this.$context, buffer);
};

NeuBuffer.prototype.split = function(n) {
  n = _.int(_.defaults(n, 2));

  if (n <= 0) {
    return [];
  }

  var result = new Array(n);
  var len = this.length / n;
  var start = 0;
  var end   = 0;

  for (var i = 0; i < n; i++) {
    end = Math.round(start + len);
    result[i] = this.slice(start, end);
    start = end;
  }

  return result;
};

module.exports = NeuBuffer;
