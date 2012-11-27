/*jslint browser: true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals EFX, Filter, Pixastic, Colors */


EFX.Basic = {};


//--------------  E X A M P L E  ----------------------------------------------
//  
//  white circle, 
//  
//  author, noiv, 2012, Cologne

// this is effect boilerplate
EFX.Basic.Circle = function (cfg){Filter.apply(this, [cfg]);};
EFX.Basic.Circle.prototype = new Filter();
EFX.Basic.Circle.constructor = EFX.Basic.Circle;
EFX.Basic.Circle.prototype.load = function(onloaded){

/* 

Each effects has at least one canvas. drawImage() calls are cheap
but painting, path and text not. Make sure within load() everything is 
prepared for fast rendering, you have only a few millicesonds for a 
composition and each effects is called for one frame. 

Once the canvas is prepared call onloaded().

  this.source - that's the canvas
  this.ctx    - that's its context

*/ 

  var ctx = this.ctx;

// far now, this filer does not expect childs, end of graph

  this.clear = this.clear || false;

// sets the size of the canvas "123" = pixel, 0.5 = relative to parent
// this might be set with the effect definitions. Without this dimensions
// resizing the browser will fail.

  this.width  = String(this.width  || 512);
  this.height = String(this.height || 512);
  this.source.width  = Number(this.width);
  this.source.height = Number(this.height);

// the color of 
  // this.color = Colors.read(this.color || "rgba(255, 255, 255, 0.98)");

// you might add some more variable here. Do not overwrite standards 
// without purpose.

  // this.ops.w = 1;
  this.ops.p = "ash"; // this keeps ratio, h is master
  this.ops.h = 1;
  this.ops.w = 1; 
  this.ops.width = 7;

// no more aditional dynamic parameters above, if you want dynamic colors, 
// put a Basic.Color behind in the chain, with o: "sat, sov, etc." and a color

// https://developer.mozilla.org/samples/canvas-tutorial/2_4_canvas_arc.html

  ctx.strokeStyle = "white"; //this.color;
  ctx.lineWidth = this.ops.width;
  ctx.beginPath();
  ctx.arc(this.source.width/2, this.source.height/2, 192, 0, Math.PI *2, false);
  ctx.closePath();
  ctx.stroke();

// Done with loading
  onloaded();

};
EFX.Basic.Circle.prototype.beforeDraw = function(ops){
  var ctx = this.ctx;
  if (this.clear) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = ops.width;
    ctx.beginPath();
    ctx.arc(this.source.width/2, this.source.height/2, 96, 0, Math.PI *2, false);
    ctx.closePath();
    ctx.stroke();
  }
};
EFX.Basic.Circle.prototype.resize = new Function(); // not needed


//--------------  N U L L -----------------------------------------------------
//  
//  does nothing, except to offer grouping effects. Uses GPU, though.
//  
//  author, noiv, 2012, Cologne

EFX.Basic.Null = function (cfg){Filter.apply(this, [cfg]);};
EFX.Basic.Null.prototype = new Filter();
EFX.Basic.Null.constructor = EFX.Basic.Null;
EFX.Basic.Null.prototype.load = function(onloaded){
  this.clear = true; // made for childs
  this.width  = this.width  || 1;
  this.height = this.height || 1;
  this.ops.a = 1;
  this.ops.w = 1;
  this.ops.h = 1;
  onloaded();
};
EFX.Basic.Null.prototype.beforeRender = function(ops){
  if (this.clear) {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.source.width, this.source.height);
  }
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
// make this beforeXXXX
EFX.Basic.Mouse.prototype.tick = function(){
  // called to update position
  this.ops.l = this.projector.mouse.x / this.projector.width;
  this.ops.t = this.projector.mouse.y / this.projector.height;
};



//--------------  C O L O R  --------------------------------------------------
//  
//  all kind of color with composite operation
//  works also as rectangle

EFX.Basic.Color = function (cfg){Filter.apply(this, [cfg]);};
EFX.Basic.Color.prototype = new Filter();
EFX.Basic.Color.constructor = EFX.Basic.Color;
EFX.Basic.Color.prototype.load = function(onready){
  this.clear = this.clear || true;
  this.ops.color = this.color || "rgba(255, 0, 0, 0.5)"; // fill color
  this.ops.w = 1;
  this.ops.h = 1;
  this.width  = this.width  || "16";
  this.height = this.height || "16";
  this.source.width  = this.width;
  this.source.height = this.height;
  this.ctx.globalCompositeOperation = "source-over";
  this.applyFillStyle(this.ops.color);
  // this.ctx.fillStyle = Color(this.ops.color);
  this.ctx.fillRect(0, 0, this.source.width, this.source.height);
  onready();
};
EFX.Basic.Color.prototype.beforeDraw = function(ops){
  if (this.clear) {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.source.width, this.source.height);
    this.ctx.fillStyle = ops.color;
    this.ctx.fillRect(0, 0, this.source.width, this.source.height);
  }
};
EFX.Basic.Color.prototype.resize = new Function(); // not needed



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

  this.ops.speed = 1;

  this.source.addEventListener("playing",  function ()  {
    var s = self.source;
    s.width  = s.videoWidth;
    s.height = s.videoHeight;
    s.playbackRate = self.playbackRate || 1;
    onloaded();
  },  false);

  this.source.addEventListener("error", function (e) {
    onloaded({event:e, device: "Starting filter: " + self.name + " failed", message:"Could not load file: " + self.src});
  }, false);

  this.source.src = this.src + this.projector.videoextension;
  this.source.play();

};
EFX.Basic.Video.prototype.resize = new Function();
EFX.Basic.Video.prototype.beforeDraw = function(ops){
  this.source.playbackRate = H.clamp(ops.speed, 0, 3);
};
EFX.Basic.Video.prototype.afterRender = function(){
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

  // this.clear = false;
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
// EFX.Basic.Bitmap.prototype.afterDraw = function(){
//   if (this.clear) {
//     this.ctx.drawImage(this.image, 0, 0, this.source.width, this.source.height);
//   }
// };



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

  // this.clear = false;
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
// EFX.Basic.Pattern.prototype.afterDraw = function(){
//   if (this.clear) {
//     this.ctx.drawImage(this.image, 0, 0, this.source.width, this.source.height);
//   }
// };



//--------------  C A M E R A  ------------------------------------------------
//  
//  webrtc Camera, must be enabled, limited support
// 
//  author, noiv, 2012, Cologne
//  ignores childs, and doesn't stops !!!

EFX.Basic.Camera = function (cfg){Filter.apply(this, [cfg]);};
EFX.Basic.Camera.prototype = new Filter();
EFX.Basic.Camera.constructor = EFX.Basic.Camera;
EFX.Basic.Camera.prototype.resize = new Function();
EFX.Basic.Camera.prototype.load = function(onloaded){

  var self = this, hidden = document.getElementById("hidden");
  
  // fallBack("fallback");
  // return;

  this.mirror = this.mirror || false;
  this.ops.m = this.mirror;

  function fallBack(e){
    ctx = self.ctx;
    self.width = "128";
    self.height = "96";
    self.source.width = 128;
    self.source.height = 96;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, self.source.width, self.source.height);
    
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("No Cam", self.source.width/2, self.source.height/2);

    if(self.dom){hidden.appendChild(self.source);}
    TIM.step("NOK Camera", e.toString());
    onloaded();

  }


  navigator.getUserMedia({video: true, toString : function() {return "video";}}, 

    function(stream) { 
      self.source = document.createElement("video");
      self.device = stream.videoTracks[0].label;
      self.source.autoplay = true;
      self.source.addEventListener('playing', function(){
        self.width  = String(self.source.videoWidth/2);
        self.height = String(self.source.videoHeight/2);
        self.source.width  = Number(self.width);
        self.source.height = Number(self.height);
        TIM.step(" OK Camera", 
          self.device + "@" + 
          self.source.videoWidth + "x" + self.source.videoHeight + " > " + 
          self.source.width + "x" + self.source.height
          );
        onloaded();
      }, false);
      self.source.src = window.webkitURL 
        ? window.webkitURL.createObjectURL(stream) 
        : stream;
      self.source.play();
      if(self.dom){hidden.appendChild(self.source);}

    },

    function(e){
      fallBack(e);
    }

  );

};

