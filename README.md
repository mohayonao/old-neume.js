# neume.js
[![Bower](https://img.shields.io/bower/v/neume.js.svg?style=flat)](https://github.com/mohayonao/neume.js)
[![Build Status](http://img.shields.io/travis/mohayonao/neume.js.svg?style=flat)](https://travis-ci.org/mohayonao/neume.js)
[![Coverage Status](http://img.shields.io/coveralls/mohayonao/neume.js.svg?style=flat)](https://coveralls.io/r/mohayonao/neume.js?branch=master)
[![Dependency Status](http://img.shields.io/david/mohayonao/neume.js.svg?style=flat)](https://david-dm.org/mohayonao/neume.js)
[![devDependency Status](http://img.shields.io/david/dev/mohayonao/neume.js.svg?style=flat)](https://david-dm.org/mohayonao/neume.js)

![](http://upload.wikimedia.org/wikipedia/commons/a/ab/Gregorian_chant.gif)

## What is?
**Neume.js** is a library for web music programming that is optimized for Web Audio API.

## Examples

  - [8bit-sequencer](http://mohayonao.github.io/neume.js/examples/8bit-sequencer.html)
    - real time audio processing rhythm machine
  - [buffer-work](http://mohayonao.github.io/neume.js/examples/buffer-work.html)
    - load an audio file and edit it like tape music
  - [mml-piano](http://mohayonao.github.io/neume.js/examples/mml-piano.html)
    - toy piano with Music Macro Language
  - [rendering-reich](http://mohayonao.github.io/neume.js/examples/rendering-reich.html)
    - rendering audio and play it

## Installation

##### Bower

```sh
$ bower install neume.js
```

##### Downloads

  - [neume.js](http://mohayonao.github.io/neume.js/build/neume.js)
  - [neume.min.js](http://mohayonao.github.io/neume.js/build/neume.min.js)

```html
<script src="neume.js"></script>
```

neume.js is dependent on `Web Audio API` and `Promise`.

  - [es6-promise](https://github.com/jakearchibald/es6-promise)

## How do work?

This code generates an audio graph like below.

```javascript
var synth = new Neume.Synth(function($) {
  return $("xline", { start: 0.25, end: 0.001, dur: 1},
    $("tri", { freq: $("sin", { freq: 2, mul: 20, add: 880 } )})
  ).on("end", function(e) {
    this.stop(e.playbackTime);
  });
});
```
```
                           +-------------------+
                           | OscillatorNode    |
                           | - type     : sine |
                           | - frequency: 2    |
                           | - detune   : 0    |
                           +-------------------+
+-----------------------+    |
| OscillatorNode        |  +------------+
| - type     : triangle |  | GainNode   |
| - frequency: 880      |--| - gain: 20 |
| - detune   : 0        |  +------------+
+-----------------------+
  |
+-----------------------+
| GainNode              |
| - gain: 0.25 -> 0.001 |
+-----------------------+
  |
```

## Documents

  - [Getting Started](https://github.com/mohayonao/neume.js/wiki/tutorial-Getting-Started) (:construction_worker: partially Japanese)

## License

neume.js is available under the The MIT License.
