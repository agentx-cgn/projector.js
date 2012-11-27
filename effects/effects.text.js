/*jslint browser: true, evil:true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals EFX, Filter, Pixastic, Loader*/



EFX.Text = {};


//--------------  L I S T -----------------------------------------------------
//  
//  creates a list of one liners
//  uses 'id' in beforeDraw
//  author, noiv, 2012, Cologne

EFX.Text.List = function(cfg){Filter.apply(this, [cfg]);};
EFX.Text.List.prototype = new Filter();
EFX.Text.List.constructor = EFX.Text.List;
EFX.Text.List.prototype.load = function(onloaded){

  var i, cvs;

  this.ops.id = 0;
  this.ops.a  = 1;

  this.sources = [];
  this.list = this.list || [
    {id: 0, color: "white", font: ["normal", "bold", 0.25, "left", "sans-serif"], line: "projector.js"}
  ];

  if(this.dom){document.getElementById("hidden").removeChild(this.source);}

  for (i=0; i<this.list.length; i++) {
    cvs = document.createElement("CANVAS");
    cvs._name = this.name + "_" + i;
    cvs.title = this.name + "_" + i;
    cvs.getContext("2d")._name = this.name;
    this.sources.push(cvs);
    if(this.dom){document.getElementById("hidden").appendChild(cvs);}
  }

  onloaded();

};
EFX.Text.List.prototype.resize = function(){

  var i, ctx, cvs, height, line, textWidth, list = this.list;

  for (i=0; i<list.length; i++) {

    line = list[i];
    cvs = this.sources[i];
    ctx = cvs.getContext("2d");
    this.source = cvs;
    this.ctx = this.source.getContext("2d");
    this.applyFont(line.font);
    textWidth = ctx.measureText(line.line).width * 1.1;
    height = (typeof line.font[2] === "string") ? Number(line.font[2]) : this.parent.source.height * line.font[2];
    cvs.width = (line.font[3] === "center") ? textWidth : textWidth *2;
    cvs.height = height;
    this.applyFont(line.font);
    ctx.textBaseline = "middle";
    this.applyFillStyle(line.color);
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.fillText(line.line, cvs.width/2, cvs.height/2);

    if (line.click){
      
    }
  }


};
EFX.Text.List.prototype.beforeDraw = function(ops){
  if (ops.id < this.sources.length){
    this.source = this.sources[ops.id];
    this.ctx = this.source.getContext("2d");
    // set to real pixels, because size is defined with font size !!!
    ops.w = String(this.source.width);
    ops.h = String(this.source.height);
  }
};





//--------------  M E N U -----------------------------------------------------  
//  
//  uses: this.projector.menu onload
//  interferes with MouseTrap
//  author, noiv, 2012, Cologne

EFX.Text.Menu = function(cfg){Filter.apply(this, [cfg]);};
EFX.Text.Menu.prototype = new Filter();
EFX.Text.Menu.constructor = EFX.Text.Menu;
// Menu.prototype.resize = function(){
//   this.load(function(){});  
//   this.rect = [this.left, this.top, this.width, this.height];
// };
EFX.Text.Menu.prototype.load = function(onloaded){

  var i = 0, lh = this.lineHeight, 
      lines = this.projector.menu.length,
      menu  = this.projector.menu,
      top   = 0,
      left  = 0,
      width = 0,
      height = 0,
      ctx = this.ctx,
      padding = 2;

  ctx.font = this.font;

  while (lines--){
    width = Math.max(width, ctx.measureText(i + ":  " + menu[i]).width);
    height += lh; i += 1;
  }

  this.width  = width  + 2*padding;
  this.height = height + 2*padding;
  this.source.width  = this.width;
  this.source.height = this.height;

  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "left";
  ctx.fillStyle = this.color;
  ctx.font = this.font;
  ctx.textBaseline = "top";

  i = 0; lines = this.projector.menu.length;
  top = padding;
  left = padding;
  
  while (lines--){
    ctx.fillText(i + ":  " + menu[i], left, top);
    top += lh; i += 1;
  }
  onloaded();
};


//--------------  D Y N A M I C   L I N E -------------------------------------
//  
//  a single line of centered text with trans BG
//  w/ dynamic parameter: text
//  author, noiv, 2012, Cologne

EFX.Text.DynaLine = function (cfg){Filter.apply(this, [cfg]);};
EFX.Text.DynaLine.prototype = new Filter();
EFX.Text.DynaLine.constructor = EFX.Text.DynaLine;
EFX.Text.DynaLine.prototype.load = function(onready){
  var ctx = this.ctx;
  this.width = this.width || 256;
  this.height = this.height || 32;
  this.source.width = this.width;
  this.source.height = this.height;
  // ctx.fillStyle = this.color;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  onready();
};
EFX.Text.DynaLine.prototype.beforeDraw = function(){
  var ctx = this.ctx;
  ctx.clearRect(0, 0, this.width, this.height);
  ctx.fillStyle = this.color;
  ctx.font = this.font || "bold 18px sans-serif ";
  ctx.fillText(this.text, this.width/2, this.height/2);
};


//--------------  L I N E -----------------------------------------------------
//  
//  a single line of text with trans BG
// 
//  author, noiv, 2012, Cologne

EFX.Text.Line = function (cfg){Filter.apply(this, [cfg]);};
EFX.Text.Line.prototype = new Filter();
EFX.Text.Line.constructor = EFX.Text.Line;
EFX.Text.Line.prototype.load = function(onready){
  var ctx = this.ctx;
  ctx.font = this.font || "bold 12px 'Courier New' ";
  this.source.width = this.ctx.measureText(this.text).width;
  this.source.height = this.lineHeight;
  this.left = 0; this.top = 0;
  // this.cfg.height = this.source.height;
  // this.cfg.width = this.source.width;
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillRect(0, 0, this.width, this.height);
  ctx.fillStyle = this.color;
  ctx.font = this.font || "bold 12px 'Courier New' ";
  ctx.textBaseline = "top";
  ctx.fillText(this.text, 0, 0);
  onready();
};



//--------------  R A N D O M   W O R D S  ------------------------------------
//  
//  displays a random word at a time
//  appearance follows nearly their distribution in large corpora
//  author, noiv, 2012, Cologne

EFX.Text.RandomWords = function (cfg){Filter.apply(this, [cfg]);};
EFX.Text.RandomWords.prototype = new Filter();
EFX.Text.RandomWords.constructor = EFX.Text.RandomWords;
EFX.Text.RandomWords.prototype.load = function(onloaded){
  
  var self = this,
      req = new XMLHttpRequest();

  this.data = "data/words.js";
  this.lastWordFrame = 0;

  this.distance = this.distance || 10;
  this.lineHeight = this.lineHeight || 80;
  this.font = this.font || "64px sans-serif";
  this.color = this.color || "black";
  this.strokeStyle = this.strokeStyle || "white";

  this.width  = "756";
  this.height = "96";
  this.clear = this.clear || false;

  this.ops.color = "";

  // load sync
  this.words = this.loadWords();
  this.word = "...";
  this.renderWord();      
  onloaded();

  // load async
  // req.open('GET', this.data);

  // req.onreadystatechange = function (e) {
  //   if (req.readyState === 4) {
  //     try {
  //       // changes this prototype
  //       eval(req.responseText);
  //       self.words = self.loadWords();
  //       self.word = "...";
  //       self.renderWord();      
  //       onloaded(); 
  //     } catch(er) {
  //       onloaded({event:er, device:"Filter: " + self.name, message: "Could not load file: " + self.data});
  //     }
  //   }
  // };
  // req.onerror = function(e){
  //   onloaded({event:e, device:"Filter: " + self.name, message: "Could not load file: " + self.data});
  // };

  // req.send();

};

EFX.Text.RandomWords.prototype.renderWord = function(ops){

  var ctx = this.ctx;
  
  if (ops && ops.color) {
    ctx.fillStyle = ops.color;
  } else {
    ctx.fillStyle = "black";
  }
  // ctx.strokeStyle = "rgba(0, 0, 0, 0)";
  ctx.strokeStyle = "black";

  ctx.font = this.font;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.lineWidth = 2;
  ctx.fillText(this.word, this.source.width/2, this.source.height/2 -4);
  ctx.strokeText(this.word, this.source.width/2, this.source.height/2 -4);

};

EFX.Text.RandomWords.prototype.beforeDraw = function(ops){
  
  var idx;

  this.beat = AudioPlayer.BeatCount;
  this.frame = this.curFrame;

  // if (this.lastWordFrame + this.distance < this.curFrame){
  if ((!(this.beat % 1) && this.beat !== this.lastBeat) || (
         this.frame > this.lastFrame +1)) {

    if (this.clear){
      this.ctx.clearRect(0, 0, this.source.width, this.source.height);
    }

    idx = parseInt(Math.pow(10, Math.random() * 4), 10);
    idx = Math.min(this.words.length -1, idx);
    this.word = this.words[idx];
    this.renderWord(ops);
    this.lastBeat = this.beat;
    this.lastFrame = this.frame;
  }

};
