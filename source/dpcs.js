/*jslint bitwise: true, browser: true, evil:true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals H, $, Colors, AudioPlayer, ColorNames, createRingBuffer */

/*
      alpha   gco   left    top     width   height  color   rot
dyn   255-01  ???   255-01  255-01  255-01  255-01  255-255 255-360
spc   
vol   
rnd
sin
cos
bct
mox   01-01   ???   01-01   01-01   01-01   01-01   01-255  01-360
moy   01-01   ???   01-01   01-01   01-01   01-01   01-255  01-360

fft   needed?
bpm   ???     
mos   ???     +1/-1                                         ???
frm   ???
sec   ???

*/

var DPCS = (function(){

  var self,

      max = Math.max, min = Math.min,

      dynamics = [],

      framesPerSecond, 

      dyn, DYN =  1,
      spc, SPC =  2,
      vol, VOL =  3,
      sin, SIN =  4,
      cos, COS =  5,
      rnd, RND =  6,
      bdt, BDT =  7,
      mox, MOX =  8, bufMX, 
      moy, MOY =  9, bufMY,  
      sec, SEC = 10,
      
      frm, FRM = 1000,
      fps, FPS = 1001,

      lastBeatCount,
      lastBctFrame,

      dynaValue = function (what){
        return  (
          (what === DYN) ? dyn :
          (what === SPC) ? spc :
          (what === VOL) ? vol :
          (what === SIN) ? sin :
          (what === COS) ? cos :
          (what === RND) ? rnd :
          (what === BDT) ? bdt :
          (what === MOX) ? mox :
          (what === MOY) ? moy :
          (what === SEC) ? sec :
            0.5);
      },
      build = function(){

        var p, para, params, t, targets;
        params  = ["dyn", "spc", "vol", "sin", "cos", "rnd", "bdt", "mox", "moy", "sec"];
        targets = {
          "a": "fnDim", 
          "d": "fnDim", 
          "f": "fnFlt", 
          "r": "fnRot", 
          "c": "fnCol", // maps on color range
          "s": "fnSpe"  // maps seconds on range
        };

        for (p in params){
          para = params[p];
          for (t in targets){
            dynamics.push(para+t);
            self[para+t] = new Function("p1", "p2", 
              "return DPCS." + targets[t] + "(" + (~~p+1) + ", p1, p2);");
          }
        }

      },
      scale = function (what, dMin, dMax, cMin, cMax){
        return function(){
          var x = ((cMax-cMin)*(dynaValue(what)-dMin)/(dMax-dMin)+cMin);
          // console.log(sec, dMin, dMax, cMin, cMax, x);
          return x ;};},

      clamp = function (val, minVal, maxVal){
        return max(min(val, maxVal), minVal);},

      scale_0_255_LU = function(what, outLow, outUpp){
        return function(){
          var x = (outUpp-outLow) * dynaValue(what) / 255 + outLow; 
          // if(what === 8){console.log(what, outLow, outUpp);}
          return x ;};},

      range256Lookup = function(what, range){
        return function(){
          return range[~~dynaValue(what)];};}

      ;

  return {
    dynas: dynamics,
    boot: function(){
      self = this;
      build();
      return this;
    },
    init: function(){
      framesPerSecond = Projector.fps;
      bufMX = createRingBuffer(~~(framesPerSecond/2));
      bufMY = createRingBuffer(~~(framesPerSecond/2));
    },
    tick: function(fr, mx, my){

      var ap  = AudioPlayer,
          bd  = (ap.BeatDetector) ? ap.BeatDetector : {beat_counter: 0, win_bpm_int:0}
          bpm = bd.win_bpm_int/10;    

      // whatever
      frm = fr;

      // 0-1
      bufMX.push((mx >= 0) ? mx*255 : 127); mox = bufMX.avg(); 
      bufMY.push((my >= 0) ? my*255 : 127); moy = bufMY.avg(); 

      sec = window.performance.now()/1000 - ~~(window.performance.now()/1000);

      // scaled to 0-255
      dyn = ap.dynamic;
      spc = Math.min(ap.spectrum /18 *24, 255); //perception vs. samplerate
      vol = ap.volume;
      rnd = Math.random() * 256;
      sin = Math.sin(frm/fps*Math.PI*2) *128 +128;
      cos = Math.cos(frm/fps*Math.PI*2) *128 +128;

      if (lastBeatCount !== bd.beat_counter) {
        bdt = 255;
        lastBeatCount = bd.beat_counter;
      } else {
        bdt = bdt-255/(fps*60/bpm*0.8); // roughly good
        bdt = (bdt < 0) ? 0 : bdt;
      }


    },
    fnFlt: function (p, p1, p2){
      if (!p2){p2=p1; p1=0;}
      return scale_0_255_LU(p, p1, p2);
    },
    fnDim: function (p, p1, p2){
      p1 = clamp(p1 || 0, 0, 1);
      p2 = clamp(p2 || 1, 0, 1);
      return scale_0_255_LU(p, p1, p2);
    },
    fnRot: function (p, p1, p2){
      p1 = clamp(p1 ||   0, 0, 360);
      p2 = clamp(p2 || 360, 0, 360);
      return scale_0_255_LU(p, p1, p2);
    },
    fnCol: function (what, range){
      return function(){
        var x = range[~~dynaValue(what)]; 
        // console.log(x, what);
        return x;
      };
    },
    fnSpe: function (p, p1, p2){
      p1 = clamp(p1 || 1, 0, 1000);
      p2 = clamp(p2 || 1, 0, 1000);
      return scale(p, 0, p1, 0, p2);
    }

  }; // return

})().boot();  



