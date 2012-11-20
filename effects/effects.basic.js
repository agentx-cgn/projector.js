/*jslint browser: true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals EFX, Filter, Pixastic */


EFX.Basic = {};


//--------------  N U L L -----------------------------------------------------
//  
//  does nothing, except to offer grouping effects. Uses GPU, though.
//  
//  author, noiv, 2012, Cologne

EFX.Basic.Null = function (cfg){Filter.apply(this, [cfg]);};
EFX.Basic.Null.prototype = new Filter();
EFX.Basic.Null.constructor = EFX.Basic.Null;
EFX.Basic.Null.prototype.load = function(onloaded){
  // this.width  = this.width  || 1;
  // this.height = this.height || 1;
  this.ops = {a: 1, c: "", o: "sov", r: 0, p: "rel", l: 0.5, t: 0.5, w: 1, h: 1 };
  onloaded();
};
EFX.Basic.Null.prototype.resize = function(){
  this.resizeToParent([this.source]);
};



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
  this.ops.w = this.image.width  / this.projector.width;
  this.ops.h = this.image.height / this.projector.height;
};
EFX.Basic.Mouse.prototype.load = function(onloaded){
  var self = this;
  this.ops = {a: 1, o: "sov", r: 0, c: "", p: "dyn", l: -1000, t: -1000};
  this.image = new Image();
  this.image.onload  = function () {
    var sw = self.image.width, sh = self.image.height;
    self.ops.w = sw / self.projector.width;
    self.ops.h = sh / self.projector.height;
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
  this.ops.l = this.projector.mouse.x / this.projector.width;
  this.ops.t = this.projector.mouse.y / this.projector.height;
};


//--------------  R E C T A N G L E  ------------------------------------------
//  
//  easy shape, likes dynamic colors
// 

EFX.Basic.Rectangle = function (cfg){Filter.apply(this, [cfg]);};
EFX.Basic.Rectangle.prototype = new Filter();
EFX.Basic.Rectangle.constructor = EFX.Basic.Rectangle;
EFX.Basic.Rectangle.prototype.load = function(onready){
  var self = this;
  this.source.width  = this.width  || 16;
  this.source.height = this.height || 16;
  this.clearColor = "rgba(0,0,0,0)";
  onready();
};
EFX.Basic.Rectangle.prototype.beforeDraw = function(){
  var ctx = this.ctx;
  ctx.clearRect(0, 0, this.width, this.height);
};


//--------------  P I X A S T I C  --------------------------------------------
//
//  operates on byte level using Oixastic filters
//  modes:
//
//
//  options: {filter: "invert", invertAlpha: true|false }
//  options: {filter: "edges2", tUpp:0-255, tLow: 0-255, cUpp: [r, g, b, a], cLow: [r, g, b, a] }
//  author, noiv, 2012, Cologne

EFX.Basic.Pixa = function (cfg){Filter.apply(this, [cfg]);};
EFX.Basic.Pixa.prototype = new Filter();
EFX.Basic.Pixa.constructor = EFX.Basic.Pixa;
EFX.Basic.Pixa.prototype.load = function(onready){
  this.width  = this.width  || 256;
  this.height = this.height || 256;
  this.cvsBuffer1 = document.createElement("CANVAS");
  this.cvsBuffer1.width  = this.width;
  this.cvsBuffer1.height = this.height;
  this.ctxBuffer1 = this.cvsBuffer1.getContext("2d");
  this.cvsBuffer2 = document.createElement("CANVAS");
  this.cvsBuffer2.width  = this.width;
  this.cvsBuffer2.height = this.height;
  this.ctxBuffer2 = this.cvsBuffer2.getContext("2d");
  if(this.dom){
    document.getElementById("hidden").appendChild(this.cvsBuffer1);
    document.getElementById("hidden").appendChild(this.cvsBuffer2);
  }
  onready();
};
EFX.Basic.Pixa.prototype.beforeDraw = function(){

  var res, params = {
    image :   null,
    canvas :  this.cvsBuffer1,
    width :   this.width,
    height :  this.height,
    useData : true,
    options : this.options
  };

  params.options.rect = {left: 0, top:0, width: this.width, height: this.height};
  
  res = Pixastic.Actions[this.options.filter].process(params);

  this.ctxBuffer2.putImageData(params.canvasData, 0, 0);
  this.source = this.cvsBuffer2;
  this.ctx = this.ctxBuffer2;

};
EFX.Basic.Pixa.prototype.afterDraw = function(){
  this.source = this.cvsBuffer1;
  this.ctx = this.ctxBuffer1;
  this.ctx.clearRect(0, 0, this.width, this.height);
};



//--------------  V I D E O ---------------------------------------------------
//
//  a single looping videostream, optional random behaviour
//
//  http://www.w3.org/2010/05/video/mediaevents.html
//  http://my.opera.com/core/blog/2010/03/03/everything-you-need-to-know-about-html5-video-and-audio-2
//  author, noiv, 2012, Cologne
//
//  still ignores childs

EFX.Basic.Video = function (cfg){Filter.apply(this, [cfg]);};
EFX.Basic.Video.prototype = new Filter();
EFX.Basic.Video.constructor = EFX.Basic.Video;
EFX.Basic.Video.prototype.load = function(onready){

  var self = this;
  this.source = document.createElement("VIDEO");
  this.source.autoplay = true;
  this.source.controls = false;
  this.source.loop = this.loop || true;
  this.source.volume = 0;
  this.source.addEventListener("playing",  function ()  {
    var s = self.source;
    s.width  = s.videoWidth;
    s.height = s.videoHeight;
    s.playbackRate = self.playbackRate || 1;
    // console.log("V: " + self.src, "D: " + s.duration, "T: " + s.currentTime, "R: " + s.readyState );
    onready();
  },  false);
  this.source.addEventListener("error", function (e) {
    onready({event:e, device: "Starting filter: " + self.name + " failed", message:"Could not load file: " + self.src});
  }, false);
  this.source.src = this.src + this.projector.videoextension;
  this.source.play();
};
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
  this.image = new Image();
  this.image.onload  = function ()  {
    self.source.width  = self.width  || self.image.width;
    self.source.height = self.height || self.image.height;
    self.ctx.drawImage(self.image, 0, 0, self.source.width, self.source.height);
    onready();
  };
  this.image.onerror = function (e) {
    onready({event:e, device: "filter: " + self.name, message:"Could not load file: " + self.src});
  };
  this.image.src = this.src;
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
  this.width  = this.width  || 256;
  this.height = this.height || 256;
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



//--------------  C A M E R A  ------------------------------------------------
//  
//  webrtc Camera, must be enabled, limited support
// 
//  author, noiv, 2012, Cologne
// ignores childs

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

