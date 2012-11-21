/*jslint browser: true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals EFX, Filter, Pixastic */


EFX.Basic = {};


//--------------  E X A M P L E  ----------------------------------------------
//  
//  does nothing, except to offer grouping effects. Uses GPU, though.
//  
//  author, noiv, 2012, Cologne

// this is JS boilerplate
EFX.Basic.Example = function (cfg){Filter.apply(this, [cfg]);};
EFX.Basic.Example.prototype = new Filter();
EFX.Basic.Example.constructor = EFX.Basic.Example;
EFX.Basic.Example.prototype.load = function(onloaded){

/* 

Each effects has at least one canvas. drawImage() calls are cheap
but painting, path and text not. Make sure within load() everything is 
prepared for fast rendering, you have only a few millicesonds for a 
composition and each effects is called for one frame. Once the canvas is
prepared call onloaded().

  this.source - that's the canvas
  this.ctx    - that's its context

*/ 

  // sets the size of the canvas "123" = pixel, 0.5 = relative to parent
  // this might be set with the effect definitions. Without this dimensions
  // resizing the browser will fail.

  this.width  = this.width  || 1;
  this.height = this.height || 1;

// you might add some more variable here. Do not overwrite standards 
// without purpose.

  this.color = "red";

// this.ops defines how dynamic your effect is.
// standards are :

  this.ops = {
    a: 1,       // how translucent is your effect (0 = invisible, 1 = opaque)
    c: "",      // rgba tint color, used over full canvas, "" = ignore 
    o: "sov",   // the byte operation used to combine with parent
    r: 0,       // rotation in degrees, clockwise (0 - 360)
    p: "rel",   // position, defines where you canvas will be combined
    l: 0.5,     // with parent
    t: 0.5, 
    w: 1, 
    h: 1 
  };
  
// Done wit loading
  onloaded();

};

// optional, 
EFX.Basic.Null.prototype.resize = function(){
  this.resizeToParent([this.source]);
};



//--------------  N U L L -----------------------------------------------------
//  
//  does nothing, except to offer grouping effects. Uses GPU, though.
//  
//  author, noiv, 2012, Cologne

EFX.Basic.Null = function (cfg){Filter.apply(this, [cfg]);};
EFX.Basic.Null.prototype = new Filter();
EFX.Basic.Null.constructor = EFX.Basic.Null;
EFX.Basic.Null.prototype.load = function(onloaded){
  this.width  = this.width  || 1;
  this.height = this.height || 1;
  this.ops.a = 1;
  onloaded();
};
// EFX.Basic.Null.prototype.resize = function(){
//   this.resizeToParent([this.source]);
// };



//--------------  M O U S E ---------------------------------------------------
//  
//  has default image
// 
//  author, noiv, 2012, Cologne
//
// does it makes sense to have mouse as a child filter?

EFX.Basic.Mouse = function (cfg){Filter.apply(this, [cfg]);};
EFX.Basic.Mouse.prototype = new Filter();
EFX.Basic.Mouse.constructor = EFX.Basic.Mouse;
EFX.Basic.Mouse.prototype.resize = function(){
  // keeps its own aspect ratio and size
  this.ops.w = this.image.width  / this.projector.width;
  this.ops.h = this.image.height / this.projector.height;
};
EFX.Basic.Mouse.prototype.load = function(onloaded){
  var self = this;
  this.ops = {a: 1, o: "sov", r: 0, c: "", p: "dyn", l: "-1000", t: "-1000"};
  this.image = new Image();
  this.image.onload  = function () {
    var sw = self.image.width, sh = self.image.height;
    self.ops.w  = sw / self.projector.width;
    self.ops.h  = sh / self.projector.height;
    this.width  = String(sw);
    this.height = String(sh);
    self.source.width = sw;
    self.source.height = sh;
    self.ctx.drawImage(self.image, 0, 0, sw, sh);
    onloaded();
  };
  this.image.onerror = function (e) {
    onloaded({event:e, filter: self.name, message:"Could not load file: " + self.src});
  };
  this.image.src = this.src;
};
EFX.Basic.Mouse.prototype.tick = function(){
  // called to update position
  this.ops.l = this.projector.mouse.x / this.projector.width;
  this.ops.t = this.projector.mouse.y / this.projector.height;
};



//--------------  R E C T A N G L E  ------------------------------------------
//  
//  easy shape, likes dynamics
//  prefers to be tiny

EFX.Basic.Rectangle = function (cfg){Filter.apply(this, [cfg]);};
EFX.Basic.Rectangle.prototype = new Filter();
EFX.Basic.Rectangle.constructor = EFX.Basic.Rectangle;
EFX.Basic.Rectangle.prototype.load = function(onready){
  this.width  = this.width  || "16";
  this.height = this.height || "16";
  onready();
};
EFX.Basic.Rectangle.prototype.beforeDraw = function(){
  var ctx = this.ctx;
  ctx.clearRect(0, 0, this.width, this.height);
};



//--------------  V I D E O ---------------------------------------------------
//
//  a single looping videostream, optional random behaviour
//
//  http://www.w3.org/2010/05/video/mediaevents.html
//  http://my.opera.com/core/blog/2010/03/03/everything-you-need-to-know-about-html5-video-and-audio-2
//  author, noiv, 2012, Cologne
//
//  still no childs

EFX.Basic.Video = function (cfg){Filter.apply(this, [cfg]);};
EFX.Basic.Video.prototype = new Filter();
EFX.Basic.Video.constructor = EFX.Basic.Video;
EFX.Basic.Video.prototype.load = function(onloaded){

  var self = this;

  this.random = this.random || false;

  this.source = document.createElement("VIDEO");
  this.source.autoplay = true;
  this.source.controls = false;
  this.source.loop = true;
  this.source.volume = 0;

  this.source.addEventListener("playing",  function ()  {
    var s = self.source;
    s.width  = s.videoWidth;
    s.height = s.videoHeight;
    s.playbackRate = self.playbackRate || 1;
    // console.log("V: " + self.src, "D: " + s.duration, "T: " + s.currentTime, "R: " + s.readyState );
    onloaded();
  },  false);

  this.source.addEventListener("error", function (e) {
    onloaded({event:e, device: "Starting filter: " + self.name + " failed", message:"Could not load file: " + self.src});
  }, false);

  this.source.src = this.src + this.projector.videoextension;
  this.source.play();

};
EFX.Basic.Video.prototype.resize = new Function();
EFX.Basic.Video.prototype.afterDraw = function(){
  if (this.random && !this.source.seeking){
    this.source.currentTime = Math.random() * this.source.duration;
  }
};



//--------------  B I T M A P  ------------------------------------------------
//  
//  a simple image
// 
//  author, noiv, 2012, Cologne

EFX.Basic.Bitmap = function (cfg){Filter.apply(this, [cfg]);};
EFX.Basic.Bitmap.prototype = new Filter();
EFX.Basic.Bitmap.constructor = EFX.Basic.Bitmap;
EFX.Basic.Bitmap.prototype.load = function(onready){

  var self = this;

  this.clear = false;
  this.image = new Image();
  
  this.image.onload  = function ()  {
    self.width  = String(self.image.width);
    self.height = String(self.image.height);
    self.source.width  = self.image.width;
    self.source.height = self.image.height;
    self.ctx.drawImage(self.image, 0, 0, self.source.width, self.source.height);
    onready();
  };
  
  this.image.onerror = function (e) {
    onready({event:e, device: "filter: " + self.name, message:"Could not load file: " + self.src});
  };
  
  this.image.src = this.src;

};
EFX.Basic.Bitmap.prototype.afterDraw = function(){
  if (this.clear) {
    this.ctx.drawImage(self.image, 0, 0, self.source.width, self.source.height);
  }
};



//--------------  P A T T E R N  ----------------------------------------------
//  
//  load an image and fills the canvas with.
// 
//  author, noiv, 2012, Cologne

EFX.Basic.Pattern = function (cfg){Filter.apply(this, [cfg]);};
EFX.Basic.Pattern.prototype = new Filter();
EFX.Basic.Pattern.constructor = EFX.Basic.Pattern;
EFX.Basic.Pattern.prototype.load = function(onready){

  var self = this;

  this.clear = false;
  this.width  = this.width  || "512";
  this.height = this.height || "512";
  this.image = new Image();
  this.image.onload  = function ()  {
    var x, y,
        iw = self.image.width, ih = self.image.width, 
        cw = self.width, ch = self.height,
        xp = parseInt(cw/iw, 10) +1,
        yp = parseInt(cw/iw, 10) +1;

    self.source.width  = self.width;
    self.source.height = self.height;

    for (x=0; x<xp; x++) {
      for (y=0; y<xp; y++) {
        self.ctx.drawImage(self.image, x*iw, y*ih);
      }
    }
    onready();
  };
  
  this.image.onerror = function (e) {
    onready({event:e, device: "Starting filter: " + self.name + " failed", message:"Could not load file: " + self.src});
  };
  
  this.image.src = this.src;

};
EFX.Basic.Pattern.prototype.afterDraw = function(){
  if (this.clear) {
    this.ctx.drawImage(self.image, 0, 0, self.source.width, self.source.height);
  }
};



//--------------  C A M E R A  ------------------------------------------------
//  
//  webrtc Camera, must be enabled, limited support
// 
//  author, noiv, 2012, Cologne
//  ignores childs, and doesn't stops !!!

EFX.Basic.Camera = function (cfg){Filter.apply(this, [cfg]);};
EFX.Basic.Camera.prototype = new Filter();
EFX.Basic.Camera.constructor = EFX.Basic.Camera;
EFX.Basic.Camera.prototype.load = function(onloaded){

  var self = this;
  
  this.source = document.createElement("video");
  
  navigator.getUserMedia({video: true, toString : function() {return "video";}}, 
    function(stream) { 
      self.device = stream.videoTracks[0].label;
      self.source.autoplay = true;
      self.source.addEventListener('playing', function(){
        self.width  = String(self.source.videoWidth);
        self.height = String(self.source.videoHeight);
        self.source.width  = self.source.videoWidth;
        self.source.height = self.source.videoHeight;
        console.log(self.device, "@", self.source.width + "x" + self.source.height);
        onloaded();
      }, false);
      self.source.src = window.webkitURL 
        ? window.webkitURL.createObjectURL(stream) 
        : stream;
      self.source.play();

    },
    function(e){
      console.log("Cam.getUserMedia: ", e);
      onloaded({event:e, filter: self.name, message:"Could not access camera"});
    }
  );

};

