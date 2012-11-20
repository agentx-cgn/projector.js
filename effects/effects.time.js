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
EFX.Time.Delay.prototype.load = function(onloaded){

  var i, cvs, ctx;

  this.width = this.width  || 256;
  this.width = this.height || 256;

  this.interval = this.interval || 1;

  this.ops.off = 0;

  this.buffer = []; 
  this.pointer = 0;
  this.lastPointer = 0;

  for (i=0; i<this.size; i++) {
    cvs = document.createElement("canvas");
    cvs.style.background = "transparent";
    cvs.width = this.width;
    cvs.height = this.height;
    ctx = cvs.getContext('2d');
    ctx.fillStyle = "orange";
    ctx.fillText("frame: " + i, 3, 10);
    ctx.name = this.name + "-" + i;
    this.buffer[i] = cvs;
  }

  this.source = this.buffer[this.pointer];
  this.ctx = this.buffer[this.lastPointer].getContext("2d");
  onloaded();

};
// makes this work on beforeDraw respecting ops.off
EFX.Time.Delay.prototype.afterDraw = function(){
  this.lastPointer = this.pointer;
  this.pointer = (this.size + this.pointer +1) % this.size;
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
  this.width = this.width || 1;
  this.height = this.height || 1;
  this.ops = {
    a: 1, o: "sov", 
    p: "cnt", l: 0.5, t: 0.5, w: 1, h: 1,
    r: 0, 
    c: "rgba(0, 0, 0, 0.1)", 
    // custom
    dx: 0, dy: 0, sx: 1, sy: 1, bc: ""
  };
  onloaded();
};
EFX.Time.Blend.Color.prototype.resize = function(){

  if (typeof this.width === "string"){
    this.source.width  = this.width;
  } else {
    this.source.width  = this.parent.source.width  * this.width;
  }
  if (typeof this.height === "string"){
    this.source.height  = this.height;
  } else {
    this.source.height  = this.parent.source.height  * this.height;
  }

};
EFX.Time.Blend.Color.prototype.afterRender = function(){

  // DO NOT TOUCH THIS

  var ctx = this.ctx, 
      ops = this.lastOps,
      pw  = this.parent.source.width,
      ph  = this.parent.source.height,
      cx  = this.lastOps.l * pw,
      cy  = this.lastOps.t * ph,

      sw  = this.source.width,
      sh  = this.source.height,
      sl  = cx -sw/2,
      st  = cy -sh/2,

      tl  = -sw/2,
      tt  = -sh/2,
      tw  = sw,
      th  = sh;

  
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

  var hidden;

  this.ops = {
    a: 1, o: "sov", 
    p: "cnt", l: 0.5, t: 0.5, w: 1, h: 1,
    r: 0, 
    c: "", 
    // custom
    dx: 0, dy: 0, sx: 1, sy: 1, bc: ""
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
    hidden = document.getElementById("hidden");
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
EFX.Time.Blend.Alpha.prototype.beforeDraw = function(){

  // DO NOT TOUCH THIS

  var ctx,
      ops = this.lastOps,
      pw  = this.parent.source.width,
      ph  = this.parent.source.height,
      cx  = this.lastOps.l * pw,
      cy  = this.lastOps.t * ph,

      sw  = this.source.width,
      sh  = this.source.height,
      sl  = cx -sw/2,
      st  = cy -sh/2,

      tl  = -sw/2,
      tt  = -sh/2,
      tw  = sw,
      th  = sh;

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
  ctx.globalAlpha = 0.92;       // make this ops    
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
EFX.Time.Blend.Alpha.prototype.afterRender = function(){
  this.source = this.cvs0;
  this.ctx = this.source.getContext("2d");
  this.ctx.clearRect(0, 0, this.source.width, this.source.height);
};

