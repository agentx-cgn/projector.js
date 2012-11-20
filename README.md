

# projector.js
projector.js or PJS is an inter- and audioactive VJ software running in a browser. It supports shows in HD resolution with 30/60 fps. Timeblend and timedelay effects let you manipulate live the 4th dimension. A built-in dynamic parameter control system synchronizes video efects to audio in real time. PJS exploits latest web technologies and opens door to collaborative vjay-ing over the Internet. Open Source and JavaScript.

## Features
> Compatible with Linux, Mac and Windows
  Arbitrary resolutions up to screen size (max: 2048x2048)
  GPU support for 2D Matrix operations (scale, rotate and transform) and alpha channel
  Filter graph to combine and/or cascade effects
  Dynamic Parameter Control System (volume, beat, dynamic, fft, sine, time, random, mouse)
  Smooth effect switching via time blend effect
  Mp3 playlist support (local files + Internet radio)
  Multi core support (compositing + video decoding)
  Open Source & JavaScript (develop and share your effects)

## Effects
> Time Blend
  Webcam
  Waveform and FFT (256 bands)
  Video (mp4, ogg)
  Graphics (jpg, png, gif)
  Pattern (jpg, png, gif)
  Pixastic filters (invert, edge detection, colors, glow, etc.)
  Text
  Delay
  Mouse
  Clock
  Write your own...

## Manual Installation
> download & install Chrome for your system: https://www.google.com/intl/en/chrome/browser/
  download & unzip projector.js: https://github.com/noiv/projector.js/archive/master.zip
  duplicate chrome icon, new target: "chrome(.exe) --allow-file-access-from-files /pathTo/projector.html"

## Running with a local web server

#### Python
>	$ cd pathTo/projector.js
	$ python -m SimpleHTTPServer
	http://localhost:8000/projector.html

### Other
Apache, nginx, App Engine, Flask, Bottle, etc.

## Performance & Tuning
Make sure to get audio input and GPU support for compositing and video decoding. Check out chrome://gpu and enable these features:
> GPU compositing on all pages
  Threaded compositing
  Media Source API on <video> elements
  Hardware-accelerated video decode
  Web Audio Input
  (Override software rendering list - only for older graphics cards)

Keep an eye on Chrome's task manager and its internals: chrome://chrome-urls 

## Keyboard Shortcuts
Sequences group keyboard actions and helps to remember them. Just press given keys shortly one after the other.

### rendering
>   r r: Master switch, toggles basically everything
    r a: toggles the animations loop, essentially a freeze
    r d: toggles the debug/performace overlay
    r k: toggles main shortkeys info
    r c: toggles clear-screen before rendering (visual result depends on compo)
    r f: switches to fullscreen mode (F11 as alternative / ESC to leave)
    r m: toggles mousepointer
    r s s: creates a screenshot

### compositions
>	 backspace: quick blend to background color of current show      
         0: overview of compositions in active show
       1-9: switches immediately to a composition
	ctrl+1-9: switches temporarily to a composition (a short blend in)

### shows
>   s s: overview of available shows (planned)

### mouse input
>   m d: mouse disconnect (parameter freeze)
    m a: mouse connect
    m h: toggles system mouse pointer
    m p: toggles effect mouse pointer

### audio
>		a a: toggles the audio source dialog
		a right arrow: steps to next random track, if in playlist mode.
    a m: toggles mute / play
    a 0:   0% Volume (no dynamic audio controls)
    a 1:  11% Volume
  a 2-8:  22-88% Volume
    a 9: 100% Volume (full dynamic audio controls) 

## editing
>   e e: toggles editor window
    e c: load editor with current composition
    e s: saves current show in repository

### debug
>		d i: outputs filter info to console
		d h: shows sources, if loaded with dom:true

## Tips & Tricks

### Mp3 Playlists
Due to security reasons the browser will not tell any web application anything about your file system. To circumvent this restriction you can create a simple list of mp3 files you like to import and drop this list onto the AudioSelector.

## Encoding Videos
It depends on your footage which quality will run on the wall. As a rule of thumb the faster the video content changes the lower the resolution might be. Think twice before encoding hectic flicker techno style Video at full HD. Generally base profiles are less demanding. It is a good idea to just drop the video file into your browser and watch CPU consumption. Also the distance between I-frames impacts seeking, which gives you all freedom if a video runs as loop only.

## In Development
> better playlists
  more dynamics
  inline text editor

## Roadmap (no particular order)
> Remote VJaying 
  Remote Webcams
  3D Objects with WebGL
  Visual graph editor
  MIDI input controller
  Live Lyrics

## PJS is based on these Open Source Technologies

> Mousetrap http://craig.is/killing/mice
    handles key events and sequences

> jQuery
    to handle the audio selector

> Async https://github.com/caolan/async
    makes asynchronous code readable

> Pixastic http://www.pixastic.com/lib/
    processing at byte level

> asyncStorage https://github.com/WebReflection/db 
    saves user data locally with all browsers

> Tween.js https://github.com/sole/tween.js/
    smooth tweening engine

> jsLint
    parses and validates shows and effects

> husl https://github.com/boronine/husl
    human color ranges

## Further information
> WebRTC API: http://www.webrtc.org/reference/api-description
  Web Audio API: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
  Mozilla Audio Data Api: https://wiki.mozilla.org/Audio_Data_API
  Web MIDI Api: http://www.w3.org/TR/webmidi/
  Canvas Sheet Cheat: http://www.nihilogic.dk/labs/canvas_sheet/HTML5_Canvas_Cheat_Sheet.pdf
