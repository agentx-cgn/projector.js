/*jslint bitwise: true, browser: true, evil:true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals EFX, Filter, Colors */


EFX.Audio = {};

//--------------  W A V E F O R M  --------------------------------------------
//  
//  An ausio visualizer
//  updates on afterRender

// http://www.smartjava.org/content/record-audio-using-webrtc-chrome-and-speech-recognition-websockets
// http://www.smartjava.org/content/exploring-html5-web-audio-visualizing-sound
// http://code.google.com/p/chromium/issues/detail?id=112367

// Waveform has three render areas, below the signal, signal and and above, defined
// by styleUnder, styleSignal, signalWidth, styleOver

EFX.Audio.Waveform = function (cfg){Filter.apply(this, [cfg]);};
EFX.Audio.Waveform.prototype = new Filter();
EFX.Audio.Waveform.constructor = EFX.Audio.Waveform;
EFX.Audio.Waveform.prototype.load = function(onloaded){

  this.ops = { // overwrite to have out of the box working effects
    a: 1,    // alpha
    c: "",     // blendColor, "" => not active
    o: "sov",  // see gcos
    r: 0.0,    // rotation
    p: "rel",  // position: relative, center, dynamic, fil
    l: 0.5,    // left relative to target canvas
    t: 0.5,    // top
    w: 1,    // width
    h: 1     // height
  };


  // this.width  = this.width  || 256;
  // this.height = this.height || 256;

  // this.width  = String(this.projector.audioplayer.dataWaveform.length);
  this.width  = String(255);
  this.height = String(this.width);
  
  this.source.width  = Number(this.width);
  this.source.height = Number(this.height);

  this.styleUnder   = this.styleUnder   || "";      
  this.styleSignal  = this.styleSignal  || "white"; 
  this.styleOver    = this.styleOver    || ""; 
  this.signalWidth  = this.signalWidth  || 2;  
  this.clear        = this.clear        || true;    // do clearEact on canvas

  onloaded();

};
EFX.Audio.Waveform.prototype.beforeDraw = function(){

  // better: http://www.htmlfivewow.com/demos/audio-visualizer/index.html

  var i, y, ctx = this.ctx, array = this.projector.audioplayer.dataWaveform,
      sum = 0, avg = 0, len, hgt;

  len = array.length;
  hgt = this.height/len;

  if (this.clear){
    ctx.clearRect(0, 0, this.source.width, this.source.height);
  }

  ctx.fillStyle = this.fillStyle;

  if (this.styleUnder) {
    // first clear background from child render
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "black";
    for (i = 0; i < len; i++) {
      y = i*hgt;
      ctx.fillRect(0, y, array[i], hgt);
    }
    ctx.fillStyle = this.fillStyle;
    for (i = 0; i < len; i++) {
      y = i*hgt;
      ctx.fillRect(0, y, array[i], hgt);
    }
  }

  if (this.styleSignal && this.signalWidth) {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = Colors.read(this.styleSignal);
    for (i = 0; i < len; i++) {
      y = i*hgt;  
      ctx.fillRect(array[i]-1, y, this.signalWidth, hgt);
    }
  }


};

//--------------  S P E C T R U M  --------------------------------------------
//  
//  An ausio visualizer
//  updates on afterRender

EFX.Audio.Spectrum = function (cfg){Filter.apply(this, [cfg]);};
EFX.Audio.Spectrum.prototype = new Filter();
EFX.Audio.Spectrum.constructor = EFX.Audio.Spectrum;
EFX.Audio.Spectrum.prototype.load = function(onloaded){

  this.width  = this.width  || 256;
  this.height = this.height || 256;
  this.source.width  = this.width;
  this.source.height = this.height;

  this.styleUnder   = this.styleUnder   || "";      
  this.styleSignal  = this.styleSignal  || "white"; 
  this.styleOver    = this.styleOver    || ""; 
  this.signalWidth  = this.signalWidth  || 2;  
  this.clear        = this.clear        || true;    // do clearEact on canvas

  onloaded();

};
EFX.Audio.Spectrum.prototype.beforeDraw = function(){

  // better: http://www.htmlfivewow.com/demos/audio-visualizer/index.html

  var i, y, ctx = this.ctx, array = this.projector.audioplayer.dataFrequency,
      sum = 0, avg = 0, len, hgt;
      
  len = array.length;
  hgt = this.height/len;

  if (this.clear){
    ctx.clearRect(0, 0, this.source.width, this.source.height);
  }

  ctx.fillStyle = this.fillStyle;

  if (this.styleUnder) {
    // first clear background from child render
    // ctx.globalCompositeOperation = "destination-out";
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "black";
    for (i = 0; i < len; i++) {
      y = i*hgt;
      ctx.fillRect(0, y, array[i], hgt);
    }
    ctx.fillStyle = Colors.read(this.styleUnder);
    for (i = 0; i < len; i++) {
      y = i;
      ctx.fillRect(0, y, array[i], hgt);
    }
  }

  if (this.styleSignal && this.signalWidth) {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = Colors.read(this.styleSignal);
    for (i = 0; i < len; i++) {
      y = i*hgt;
      ctx.fillRect(array[i]-1, y, this.signalWidth, hgt);
    }
  }


};
