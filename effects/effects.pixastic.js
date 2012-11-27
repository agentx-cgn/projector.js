/*jslint browser: true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals EFX, Filter, Pixastic */


EFX.Pixastic = {};


//--------------  P I X A S T I C  --------------------------------------------
//
//  operates on byte level using Oixastic filters
//  modes:
//
//
//  options: {filter: "invert", invertAlpha: true|false }
//  options: {filter: "edges2", tUpp:0-255, tLow: 0-255, cUpp: [r, g, b, a], cLow: [r, g, b, a] }
//  author, noiv, 2012, Cologne

EFX.Pixastic.Edges = function (cfg){Filter.apply(this, [cfg]);};
EFX.Pixastic.Edges.prototype = new Filter();
EFX.Pixastic.Edges.constructor = EFX.Pixastic.Edges;
EFX.Pixastic.Edges.prototype.load = function(onready){

  this.width  = this.width  || "64";
  this.height = this.height || "64";

  this.crop = this.crop || 1;

  this.options = this.options || {
    tUpp: 188, 
    tLow:  68,
    cUpp: [255, 255, 255, 255], 
    cLow: [0, 0, 0, 0],
  };

  this.options.filter = "edges3";

  this.cvs1 = document.createElement("CANVAS");
  this.ctx1 = this.cvs1.getContext("2d");

  if(this.dom){
    document.getElementById("hidden").appendChild(this.cvs1);
  }

  onready();

};
EFX.Pixastic.Edges.prototype.resize = function(){
  this.resizeToParent([this.source, this.cvs1]);
};
EFX.Pixastic.Edges.prototype.beforeDraw = function(){

  var res, 
      ctx = this.ctx,
      crop = this.crop,
      w = this.source.width, 
      h = this.source.height,
      params = {
        image :   null,
        canvas :  this.source,
        width :   w,
        height :  h,
        useData : true,
        options : this.options,
        canvasData: null
      };

  params.options.rect = {left: 0, top:0, width: w, height: h};
  
  res = Pixastic.Actions[this.options.filter].process(params);

  this.ctx1.putImageData(params.canvasData, 0, 0);

  ctx.globalCompositeOperation = "copy";
  ctx.drawImage(this.cvs1, crop, crop, w -crop*2, h- crop*2, 0, 0, w, h);

};
