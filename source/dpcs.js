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

var DPCS = ((() => {
  var self;
  var max = Math.max;
  var min = Math.min;
  var dynamics = [];
  var framesPerSecond;
  var dyn;
  var DYN =  1;
  var spc;
  var SPC =  2;
  var vol;
  var VOL =  3;
  var sin;
  var SIN =  4;
  var cos;
  var COS =  5;
  var rnd;
  var RND =  6;
  var bdt;
  var BDT =  7;
  var mox;
  var MOX =  8;
  var bufMX;
  var moy;
  var MOY =  9;
  var bufMY;
  var sec;
  var SEC = 10;
  var frm;
  var FRM = 1000;
  var fps;
  var FPS = 1001;
  var lastBeatCount;
  var lastBctFrame;

  var dynaValue = what => (what === DYN) ? dyn :
  (what === SPC) ? spc :
  (what === VOL) ? vol :
  (what === SIN) ? sin :
  (what === COS) ? cos :
  (what === RND) ? rnd :
  (what === BDT) ? bdt :
  (what === MOX) ? mox :
  (what === MOY) ? moy :
  (what === SEC) ? sec :
    0.5;

  var build = () => {

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

  };

  var scale = (what, dMin, dMax, cMin, cMax) => () => {
    var x = ((cMax-cMin)*(dynaValue(what)-dMin)/(dMax-dMin)+cMin);
    // console.log(sec, dMin, dMax, cMin, cMax, x);
    return x ;};

  var clamp = (val, minVal, maxVal) => max(min(val, maxVal), minVal);

  var scale_0_255_LU = (what, outLow, outUpp) => () => {
    var x = (outUpp-outLow) * dynaValue(what) / 255 + outLow; 
    // if(what === 8){console.log(what, outLow, outUpp);}
    return x ;};

  var range256Lookup = (what, range) => () => range[~~dynaValue(what)];

  return {
    dynas: dynamics,
    boot() {
      self = this;
      build();
      return this;
    },
    init() {
      framesPerSecond = Projector.fps;
      bufMX = createRingBuffer(~~(framesPerSecond/2));
      bufMY = createRingBuffer(~~(framesPerSecond/2));
    },
    tick(fr, mx, my) {
      var ap  = AudioPlayer;
      var bd  = (ap.BeatDetector) ? ap.BeatDetector : {beat_counter: 0, win_bpm_int:0};
      bpm = bd.win_bpm_int/10;

      // whatever
      frm = fr;

      // 0-1
      bufMX.push((mx >= 0) ? mx*255 : 127);mox = bufMX.avg();
      bufMY.push((my >= 0) ? my*255 : 127);moy = bufMY.avg();

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
    fnFlt(p, p1, p2) {
      if (!p2){p2=p1; p1=0;}
      return scale_0_255_LU(p, p1, p2);
    },
    fnDim(p, p1, p2) {
      p1 = clamp(p1 || 0, 0, 1);
      p2 = clamp(p2 || 1, 0, 1);
      return scale_0_255_LU(p, p1, p2);
    },
    fnRot(p, p1, p2) {
      p1 = clamp(p1 ||   0, 0, 360);
      p2 = clamp(p2 || 360, 0, 360);
      return scale_0_255_LU(p, p1, p2);
    },
    fnCol(what, range) {
      return () => {
        var x = range[~~dynaValue(what)]; 
        // console.log(x, what);
        return x;
      };
    },
    fnSpe(p, p1, p2) {
      p1 = clamp(p1 || 1, 0, 1000);
      p2 = clamp(p2 || 1, 0, 1000);
      return scale(p, 0, p1, 0, p2);
    }

  }; // return
}))().boot();  



