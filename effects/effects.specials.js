/*jslint browser: true, evil:true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals EFX, Filter, Loader*/


EFX.Specials = {};


//--------------  R A I N  ----------------------------------------------------
//  
//  draws an image n times at random locations
//  author, noiv, 2012, Cologne

EFX.Specials.Rain = function(cfg){Filter.apply(this, [cfg]);};
EFX.Specials.Rain.prototype = new Filter();
EFX.Specials.Rain.constructor = EFX.Specials.Rain;
EFX.Specials.Rain.prototype.load = function(onloaded){

  var self = this;

  this.width  = this.width  || 1;
  this.height = this.height || 1;
  this.clear  = this.clear  || true;

  this.ops.a  = 1;
  this.ops.in = 1; // number of image
  this.ops.is = 0.05; // image scale

  this.image = new Image();
  this.image.onload  = function ()  {
    onloaded();
  };
  this.image.onerror = function (e) {
    onloaded({event:e, device: "filter: " + self.name, message:"Could not load file: " + self.src});
  };

  this.image.src = this.src;

};
EFX.Specials.Rain.prototype.beforeDraw = function(ops){

  var i, x, y,ctx = this.ctx, 
      n = Math.max(~~ops.in, 0),
      w = this.source.width,
      h = this.source.height,
      tw = w * ops.is,
      th = tw; // assuming quadratic image

  if (this.clear) {
    ctx.clearRect(0, 0, w, h);}

  for (i=0; i<n; i++) {
    // ?? over or underscan ??
    // x = Math.random() * (w + tw) - tw/2;
    // y = Math.random() * (h + th) - th/2;
    x = Math.random() * (w - tw) + tw/2;
    y = Math.random() * (h - th) + th/2;
    ctx.drawImage(this.image, x, y, tw, th);
  }

};


//--------------  C L O C K ---------------------------------------------------
//  
//  analog clock with secons
//  uses 'time' in load and tick
//  author, noiv, 2012, Cologne

// EFX.Specials.Clock = function(cfg){Filter.apply(this, [cfg]);};
// EFX.Specials.Clock.prototype = new Filter();
// EFX.Specials.Clock.constructor = EFX.Specials.Clock;
// EFX.Specials.Clock.prototype.load = function(onloaded){};
// EFX.Specials.Clock.prototype.resize = function(){};




// // http://folk.uib.no/nfylk/concordle_dev/clock_canvas.html
// var CLOCK = (function(){

//   return {

//     draw: function(ctx, time, scale, x, y){

//       ctx.save();
//       ctx.translate(x, y);
//       ctx.scale(scale, scale);
//       ctx.rotate(-Math.PI/2);
//       ctx.strokeStyle = "#666";
//       ctx.fillStyle = "yellow";
//       ctx.lineWidth = 8;
//       ctx.lineCap = "round";

//       // Hour marks
//       ctx.save();
//       for (i=0;i<12;i++){
//         ctx.beginPath();
//         ctx.rotate(Math.PI/6);
//         ctx.moveTo(100,0);
//         ctx.lineTo(120,0);
//         ctx.stroke();
//       }
//       ctx.restore();

//       // Minute marks
//       ctx.save();
//       ctx.lineWidth = 5;
//       for (i=0;i<60;i++){
//         if (i%5!=0) {
//           ctx.beginPath();
//           ctx.moveTo(117,0);
//           ctx.lineTo(120,0);
//           ctx.stroke();
//         }
//         ctx.rotate(Math.PI/30);
//       }
//       ctx.restore();
      
//       var sec = time.getSeconds();
//       var min = time.getMinutes();
//       var hr  = time.getHours();
//       hr = hr>=12 ? hr-12 : hr;

//       ctx.fillStyle = "black";

//       // write Hours
//       ctx.save();
//       ctx.rotate( hr*(Math.PI/6) + (Math.PI/360)*min + (Math.PI/21600)*sec )
//       ctx.lineWidth = 14;
//       ctx.beginPath();
//       ctx.moveTo(-20,0);
//       ctx.lineTo(80,0);
//       ctx.stroke();
//       ctx.restore();

//       // write Minutes
//       ctx.save();
//       ctx.rotate( (Math.PI/30)*min + (Math.PI/1800)*sec )
//       ctx.lineWidth = 10;
//       ctx.beginPath();
//       ctx.moveTo(-28,0);
//       ctx.lineTo(112,0);
//       ctx.stroke();
//       ctx.restore();
      
//       // Write seconds
//       ctx.save();
//       ctx.rotate(sec * Math.PI/30);
//       ctx.strokeStyle = "#D40000";
//       ctx.fillStyle = "#D40000";
//       ctx.lineWidth = 6;
//       ctx.beginPath();
//       ctx.moveTo(-30,0);
//       ctx.lineTo(83,0);
//       ctx.stroke();
//       ctx.restore();

//       ctx.restore();

//     },

//   };

// })();
