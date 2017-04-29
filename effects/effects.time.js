/*jslint forin: true, bitwise: true, browser: true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals  EFX, Filter */


EFX.Time = {};


//--------------  D E L A Y  --------------------------------------------------
//  
//  Visual delay, via a ringbuffer of canvas
//  depends on framerate, adjusts source/index after render
//  author, noiv, 2012, Cologne

EFX.Time.Delay = function (cfg){Filter.apply(this, [cfg]);};
EFX.Time.Delay.prototype = new Filter();
EFX.Time.Delay.constructor = EFX.Time.Delay;
EFX.Time.Delay.prototype.resize = new Function(); 
EFX.Time.Delay.prototype.load = function(onloaded){
  var i;
  var cvs;
  var ctx;
  var hidden = document.getElementById("hidden");

  this.width  = this.width  || "320";
  this.height = this.height || "240";

  this.interval = this.interval || 1;
  this.delay    = this.delay * this.projector.fps || this.projector.fps;
  this.ops.off  = this.off      || 0;

  this.buffer = [];
  this.pointer = 0;
  this.lastPointer = 0;

  if(this.dom){hidden.removeChild(this.source);}

  for (i=0; i<this.delay; i++) {
    cvs = document.createElement("canvas");
    cvs.style.background = "transparent";
    cvs.width = Number(this.width);
    cvs.height = Number(this.height);
    cvs.title = this.name + ":" + i;
    ctx = cvs.getContext('2d');
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Overriding Arrow of Time ...", cvs.width/2, cvs.height/2 -16);
    ctx.fillText(~~(i/this.delay*100) + "%", cvs.width/2, cvs.height/2 +16);
    ctx.name = this.name + "-" + i;
    this.buffer[i] = cvs;
    if(this.dom){hidden.appendChild(cvs);}
  }

  this.source = this.buffer[this.pointer];
  this.ctx = this.buffer[this.lastPointer].getContext("2d");
  TIM.step(" OK Delay", this.delay * ~~this.width * ~~this.height * 32 / 1024 / 1024 + " MB");
  onloaded();
};

// makes this work on beforeDraw respecting ops.off
EFX.Time.Delay.prototype.afterDraw = function(){
  this.lastPointer = this.pointer;
  this.pointer = (this.delay + this.pointer +1) % this.delay;
  this.source = this.buffer[this.pointer];
  this.ctx = this.buffer[this.lastPointer].getContext("2d");
};



//--------------  T I M E B L E N D  C O L O R --------------------------------
//  
//  uses fill color (ops.c) to blend out past
//  
//  author, noiv, 2012, Cologne

EFX.Time.Blend = {};
EFX.Time.Blend.Color = function (cfg){Filter.apply(this, [cfg]);};
EFX.Time.Blend.Color.prototype = new Filter();
EFX.Time.Blend.Color.constructor = EFX.Time.Blend.Color;
EFX.Time.Blend.Color.prototype.load = function(onloaded){

  this.width  = this.width  || 1;
  this.height = this.height || 1;
  
  this.ops = {
    a: 1, o: "sov", 
    p: "cnt", l: 0.5, t: 0.5, w: 1, h: 1,
    r: 0, 
    // custom
    dx: 0, dy: 0, sx: 1, sy: 1
  };
  this.lastOps = "huhu";
  onloaded();

};
// make this before Render
EFX.Time.Blend.Color.prototype.afterRender = function(ops){
  // DO NOT TOUCH THIS

  var ctx = this.ctx;

  var ops = this.lastOps;
  var pw  = this.parent.source.width;
  var ph  = this.parent.source.height;
  var cx  = ops.l * pw;
  var cy  = ops.t * ph;
  var sw  = this.source.width;
  var sh  = this.source.height;
  var sl  = cx -sw/2;
  var st  = cy -sh/2;
  var tl  = -sw/2;
  var tt  = -sh/2;
  var tw  = sw;
  var th  = sh;


  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "copy";
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(sw/2, sh/2);

  if (ops.dx || ops.dy) {
    ctx.translate(ops.dx, ops.dy);}

  if (ops.sx !== 1 || ops.sy !== 1) {
    ctx.scale(ops.sx, ops.sy);}

  ctx.drawImage(this.parent.source, sl, st, sw, sh, tl, tt, tw, th);

  this.lastInfo = [sl, st, sw, sh, tl, tt, tw, th];
};



//--------------  T I M E B L E N D   A L P H A -------------------------------
//  
//  uses alpha channel (ops.??) to blend out past
//  
//  author, noiv, 2012, Cologne

EFX.Time.Blend.Alpha = function (cfg){Filter.apply(this, [cfg]);};
EFX.Time.Blend.Alpha.prototype = new Filter();
EFX.Time.Blend.Alpha.constructor = EFX.Time.Blend.Alpha;
EFX.Time.Blend.Alpha.prototype.load = function(onloaded){

  var hidden = document.getElementById("hidden");

  this.width  = this.width  || 1;
  this.height = this.height || 1;

  this.ops = {
    a: 1, o: "sov", 
    p: "cnt", l: 0.5, t: 0.5, w: 1, h: 1,
    r: 0, 
    c: "", 
    // custom
    dx: 0, dy: 0, sx: 1, sy: 1, ba: 1
  };
  this.cvs0 = document.createElement("canvas");
  this.ctx0 = this.cvs0.getContext('2d');
  this.cvs0.title = this.name + "." + "0";
  this.cvs0._name = this.name + "." + "0";
  this.ctx0._name = this.name + "." + "0";

  this.cvs1 = document.createElement("canvas");
  this.ctx1 = this.cvs1.getContext('2d');
  this.cvs1.title = this.name + "." + "1";
  this.cvs1._name = this.name + "." + "1";
  this.ctx1._name = this.name + "." + "1";

  this.cvs2 = document.createElement("canvas");
  this.ctx2 = this.cvs2.getContext('2d');
  this.cvs2.title = this.name + "." + "2";
  this.cvs2._name = this.name + "." + "2";
  this.ctx2._name = this.name + "." + "2";

  if(this.dom){
    hidden.removeChild(this.source);
    hidden.appendChild(this.cvs0);
    hidden.appendChild(this.cvs1);
    hidden.appendChild(this.cvs2);
  }

  this.last = this.cvs1;
  this.next = this.cvs2;

  onloaded();

};
EFX.Time.Blend.Alpha.prototype.resize = function(){
  this.resizeToParent([this.source, this.cvs0, this.cvs1, this.cvs2]);
};
EFX.Time.Blend.Alpha.prototype.beforeDraw = function(ops){
  // DO NOT TOUCH THIS

  var ctx;

  var // ops = this.lastOps,
  pw  = this.parent.source.width;

  var ph  = this.parent.source.height;

  var // cx  = this.lastOps.l * pw,
  // cy  = this.lastOps.t * ph,
  cx  = ops.l * pw;

  var cy  = ops.t * ph;
  var sw  = this.source.width;
  var sh  = this.source.height;
  var sl  = cx -sw/2;
  var st  = cy -sh/2;
  var tl  = -sw/2;
  var tt  = -sh/2;
  var tw  = sw;
  var th  = sh;

  if (this.last === this.cvs1){
    ctx = this.ctx2;
    this.last = this.cvs2;
    this.next = this.cvs1;
  } else {
    ctx = this.ctx1;
    this.last = this.cvs1;
    this.next = this.cvs2;
  }

  // stuff from past
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, sw, sh);
  // ctx.globalAlpha = 0.92;       // make this ops    
  ctx.globalAlpha = ops.ba;       // make this ops    
  ctx.globalCompositeOperation = "copy";  //  "source-over";  
  ctx.translate(sw/2, sh/2);

  if (ops.dx || ops.dy) {
    ctx.translate(ops.dx, ops.dy);}

  if (ops.sx !== 1 || ops.sy !== 1) {
    ctx.scale(ops.sx, ops.sy);}

  ctx.drawImage(this.next, sl, st, sw, sh, tl, tt, tw, th);

  //stuff from child unchanged 
  ctx.globalAlpha = 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "source-over";  // no copy here
  ctx.drawImage(this.source, 0, 0, sw, sh);

  this.ctx = ctx;
  this.source = ctx.canvas;
  this.lastInfo = [sl, st, sw, sh, tl, tt, tw, th];
};
EFX.Time.Blend.Alpha.prototype.beforeRender = function(){
  this.source = this.cvs0;
  var ctx = this.source.getContext("2d");
  this.ctx = ctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, this.source.width, this.source.height);
};

