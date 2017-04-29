/*jslint forin: true, bitwise: true, browser: true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals  namedColors, H, Colors */


function Filter(cfg){
  var p;
  var self = this;

  this.gcos = {
    "cop": "copy",
    "xor": "xor",
    "lig": "lighter",
    "sov": "source-over",
    "sin": "source-in",
    "sou": "source-out",
    "sat": "source-atop",
    "dov": "destination-over",
    "din": "destination-in",
    "dou": "destination-out",
    "dat": "destination-atop"
  };

  this.dom = false;

  this.parent = null;
  this.width  = null;
  this.height = null;

  this.cfg = cfg || {};
  this.projector = null;
  this.lastFrame = null;
  this.curFrame  = null;

  this.source = document.createElement("canvas");
  this.source.style.background = "transparent";
  this.ctx = this.source.getContext("2d");

  this.lastRect   = [];
  this.lastTrans  = [];
  this.lastInfo   = [];
  this.lastOps    = {};

  this.ops = { // overwrite to have out of the box working effects
    a: 0.9,    // alpha
    o: "sov",  // see gcos
    r: 0.0,    // rotation
    p: "rel",  // position: relative, center, dynamic, fil
    l: 0.5,    // left relative to target canvas
    t: 0.5,    // top
    w: 0.8,    // width
    h: 0.8,    // height
    m: false
  };

  for (p in cfg) {
    this[p] = cfg[p];}
}

Filter.prototype = {
  tick:         null,  /* gets show wide called, if defined, see mouse */
  load(onloaded) {onloaded();  /* probable overwrite, remember the callback */ },
  beforeRender: new Function(), // called before local render (before childs)
  beforeDraw:   new Function(), // called after local draw (after childs)
  afterDraw:    new Function(), // called after local draw
  afterRender:  new Function(), // called after global render
  resize(ctxs) {this.resizeToParent([this.source]);},
  init(projector, onloaded) {
    this.projector = projector;
    if(this.dom){
      document.getElementById("hidden").appendChild(this.source);
      this.source.title = this.name;
    }
    this.load(onloaded);
  },
  type() { 
     var funcNameRegex = /function (.{1,})\(/;
     var results = (funcNameRegex).exec((this).constructor.toString());
     return (results && results.length > 1) ? results[1] : "";
  },
  resizeToParent(cvss) {
    var self = this;
    cvss.forEach(cvs => {
      if (typeof self.width === "string"){
        cvs.width  = self.width;
      } else {
        cvs.width  = self.parent.source.width  * self.width;
      }
      if (typeof self.height === "string"){
        cvs.height  = self.height;
      } else {
        cvs.height  = self.parent.source.height  * self.height;
      }

    });
  },
  applyFillStyle(color) {
    this.ctx.fillStyle = Color(color).css;
  },
  applyStrokeStyle(color) {
    this.ctx.strokeStyle = Color(color).css;
  },
  applyFont(font) {
    // in:  [style,    weight, size,   align, font-family]
    // ex:  ["normal", "bold", 72/0.5,  "left", "sans-serif"],

    var f = font;

    var size;

    // very basic check
    if (f.length !== 5){
      throw (this.name + ": can't handle font: " + f.join(", ")); }

    size = ~~( (typeof f[2] === "string") ? Number(f[2]) : this.parent.source.height * f[2]);

    this.ctx.font = [f[0], f[1], size+"px", f[4]].join(" ");
    this.ctx.textAlign = f[3];
    this.ctx.textBaseline = "middle"; // always !!!!                                    
  },
  calcParams(target, ops) {
    var dX=0;
    var dY=0;
    var sX=1;
    var sY=1;
    var n=this.name;
    var tw  = target.canvas.width;
    var th  = target.canvas.height;
    var sw  = (typeof ops.w === "string") ? ~~ops.w : tw * ops.w;
    var sh  = (typeof ops.h === "string") ? ~~ops.h : th * ops.h;
    var tl  = (typeof ops.l === "string") ? ~~ops.l : tw * ops.l;
    var tt  = (typeof ops.t === "string") ? ~~ops.t : th * ops.t;
    var r1  = -sw/2;
    var r2 = -sh/2;
    var r3 = sw;
    var r4 = sh;
    var rot =  ops.r / (180/Math.PI);
    var as  = this.source.width / this.source.height;
    var at  = tw / th;

    switch (ops.p) {

      case "fix" :
        dX = (tw + ops.l) % tw;
        dY = (th + ops.t) % th;
        break;

      case "ash": // height is master, calc width, reproduce aspect
        // sw = sh ;//* tw/th;
        sw = sh * as ;
        r1 = -sw/2;
        r3 = sw;
        dX =  tw/2; dY =  th/2;
        break;

      case "cnt" :
        dX =  tw/2; dY =  th/2;
        break;

      case "dyn" :
      case "rel" :
        dX =  tl; dY = tt;
        break;

      case "fil": // for videos
        r1 = 0; r2 = 0; r3 = tw; r4 = th;
        break;

    }

    if (ops.m) {sX = -sX;}

    return [[r1, r2, r3, r4], [dX, dY, sX, sY, rot]];
  },
  connect() /* arguments */ {
    var self = this;
    var childs = [];
    var drawOps;
    var a;
    var arg;
    var args = Array.prototype.slice.call(arguments);

    for (a in args){
      arg = args[a];
      if (typeof        arg === "function"){
        childs.push(arg);
      } else if (typeof arg === "object"){
        drawOps = arg;
      } else {
        console.log("WTF");
      }
    }

    return function filterConnect(message){
      var o;
      var c;
      var params;
      var n = self.name;
      var ops = H.clone(self.ops);
      var ctx;
      var frame;
      var sector;

      if (message.command === "collect") {
        self.parent = message.parent;
        message.filters.push(H.clone(self));
        for (c in childs){
          message.parent = self;
          childs[c](message);}
        return;}

      if (message.command === "link") {
        self.parent = message.parent;
        self.resize();
        for (c in childs){
          message.parent = self;
          childs[c](message);}
        return;}



      // only command = 'render' left
      message.filters.push(self);
      ctx    = message.ctx;
      frame  = message.frame;
      sector = message.sector;
      self.parent = message.parent;

      self.curFrame = frame;

      for (o in drawOps) {
        if (o in self.ops){
          if (typeof drawOps[o] === "function") {
            ops[o] = drawOps[o]();
          } else {
            ops[o] = drawOps[o];
          }
        } else if (typeof self[o] !== "undefined") {
          if (typeof drawOps[o] === "function") {
            self[o] = drawOps[o]();
          } else {
            self[o] = drawOps[o];
          }
        } else {
          throw("|Filter: " + self.name + "|EFX operand: '" + o + "' not implemented");
        }
      }

      self.beforeRender(ops, ctx);

      for (c in childs){
        message.ctx = self.ctx;
        message.parent = self;
        childs[c](message);}

      self.beforeDraw(ops, ctx);

      // turns ops into real pixel
      params = self.calcParams(ctx, ops, frame, sector);

      // for debugging
      self.lastRect  = params[0].slice(0);
      self.lastTrans = params[1];
      self.lastOps   = H.clone(ops); //Special for Time.Blend.Color
      self.lastOps1   = H.clone(ops); //Special for Time.Blend.Color

      // prepend myself
      params[0].unshift(self.source);

      ctx.save(); // not needed !!!

      ctx.globalAlpha = ops.a;
      ctx.globalCompositeOperation = self.gcos[ops.o];

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.translate(self.lastTrans[0], self.lastTrans[1]);
      ctx.scale(self.lastTrans[2], self.lastTrans[3]);
      ctx.rotate(self.lastTrans[4]);

      ctx.drawImage(...params[0]);

      ctx.restore();

      self.afterDraw();

      self.lastFrame = frame;
    };
  }


};



// function createEffect(prototype){

//   var p, Effect = function(cfg){
//     Filter.apply(Effect, [cfg]);
//     for (p in prototype){
//       Effect.prototype[p] = prototype[p];
//     }
//   };

//   Effect.prototype = new Filter();
//   Effect.constructor = Effect;

//   return Effect;

//   // return function(cfg){
//   //   Filter.apply(obj, [cfg]);
//   //   for (p in prototype){
//   //     obj.prototype[p] =  prototype[p];
//   //   }
//   // };

// }
