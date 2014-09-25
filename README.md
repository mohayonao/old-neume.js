# neume.js
[![Build Status](http://img.shields.io/travis/mohayonao/neume.js.svg?style=flat)](https://travis-ci.org/mohayonao/neume.js)
[![Coverage Status](http://img.shields.io/coveralls/mohayonao/neume.js.svg?style=flat)](https://coveralls.io/r/mohayonao/neume.js?branch=master)
[![Dependency Status](http://img.shields.io/david/mohayonao/neume.js.svg?style=flat)](https://david-dm.org/mohayonao/neume.js)
[![devDependency Status](http://img.shields.io/david/dev/mohayonao/neume.js.svg?style=flat)](https://david-dm.org/mohayonao/neume.js)

![](http://upload.wikimedia.org/wikipedia/commons/a/ab/Gregorian_chant.gif)

:zap: work in progress

## What is?

**neume.js** is a library for Web Audio API Programming.

## Examples

  - [8bit-sequencer](http://mohayonao.github.io/neume.js/examples/8bit-sequencer.html)
    - real time audio processing rhythm machine
  - [buffer-work](http://mohayonao.github.io/neume.js/examples/buffer-work.html)
    - load an audio file and edit it like tape music
  - [mml-piano](http://mohayonao.github.io/neume.js/examples/mml-piano.html)
    - toy piano with Music Macro Language
  - [rendering-reich](http://mohayonao.github.io/neume.js/examples/rendering-reich.html)
    - rendering audio and play it
  - [sine-storm](http://mohayonao.github.io/neume.js/examples/sine-storm.html)
    - parameters changing gradually
  - [snippets](http://mohayonao.github.io/neume.js/examples/snippets.html)
    - tiny samples and tests

## Installation

##### browser

  - [neume.js](http://mohayonao.github.io/neume.js/build/neume.js)
  - [neume.min.js](http://mohayonao.github.io/neume.js/build/neume.min.js)

```html
<script src="neume.js"></script>
```

neume.js is dependent on `Web Audio API` and `Promise`.

  - [es6-promise](https://github.com/jakearchibald/es6-promise)

## Usage

  - `new Neume(func)` builds a constructor of defined synth.
  - `$` is utility function for building a synth.
  - `$` syntax is `$(className, spec, ... inputs)`

```javascript
// initialize Neume function with your AudioContext
var Neume = neume(new AudioContext());

// define synth
var Synth = new Neume(function($, freq) {
  // exponential decay with 5sec
  return $("xline", { start: 0.25, end: 0.001, dur: 5.0 },
    // amp modulation
    $("sin", { freq: 8 }, [ 1, 2 ].map(function(x) {
      return $("tri", { freq: freq * x });
    }))
  ).on("end", function(e) {
    // stop this tone when xline done
    this.stop(e.playbakcTime);
  });
});

// and use it
var synth = new Synth(880); // this 880 is received as freq above.

synth.start();
```

`new Synth()` generates audio node graph like a below.

```
+-----------------------+  +-----------------------+
| OscillatorNode        |  | OscillatorNode        |
| - type     : triangle |  | - type     : triangle |
| - frequency: freq * 1 |  | - frequency: freq * 2 |
| - detune   : 0        |  | - detune   : 0        |
+-----------------------+  +-----------------------+
  |                          |
  |  +-----------------------+
  |  |
  |  |           +-------------------+
  |  |           | OscillatorNode    |
+-----------+    | - type     : sine |
| GainNode  |    | - frequency: 8    |
| - gain: 0 |----| - detunr   : 0    |
+-----------+    +-------------------+
  |
+-------------------------------------+
| GainNode                            |
| - gain: exponential decay with 5sec |
+-------------------------------------+
  |
when .start()
  |
+----------------------+
| AudioDestinationNode |
+----------------------+
```

## Documents

  - [日本語ドキュメント](https://github.com/mohayonao/neume.js/wiki)
  - :construction_worker: writer later in English (somebody help me)

## License

neume.js is available under the The MIT License.
