/*jslint bitwise: true, browser: true, evil:true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals H, $, Colors, AudioPlayer, ColorNames */

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

      dyn, DYN =  1,
      spc, SPC =  2,
      vol, VOL =  3,
      sin, SIN =  4,
      cos, COS =  5,
      rnd, RND =  6,
      bdt, BDT =  7,
      mox, MOX =  8,
      moy, MOY =  9,
      
      frm, FRM = 1000,
      fps, FPS = 1001,
      sec, SEC = 1002,

      lastBeatCount,
      lastBctFrame,

      dynaValue = function (what){
        return  (what === DYN) ? dyn :
                (what === SPC) ? spc :
                (what === VOL) ? vol :
                (what === SIN) ? sin :
                (what === COS) ? cos :
                (what === RND) ? rnd :
                (what === BDT) ? bdt :
                (what === MOX) ? mox :
                (what === MOY) ? moy :
                  0.5;
      },
      build = function(){

        // var addition = Function("a", "b", "return a + b;");

        var p, para, params, t, targets;

        params  = ["dyn", "spc", "vol", "sin", "cos", "rnd", "bdt", "mox", "moy"];
        targets = {"a": "fnDim", "d": "fnDim", "f": "fnFlt", "r": "fnRot", "c": "fnCol"};

        for (p in params){
          para = params[p];
          for (t in targets){
            self[para+t] = new Function("p1", "p2", 
              "return DPCS." + targets[t] + "(" + (~~p+1) + ", p1, p2);");
          }
        }

      },
      scale = function (x, dMin, dMax, cMin, cMax){
        return ((cMax-cMin)*(x-dMin)/(dMax-dMin)+cMin);},

      clamp = function (val, minVal, maxVal){
        return max(min(val, maxVal), minVal);},

      scale_0_255_LU = function(what, outLow, outUpp){
        return function(){
          return (outUpp-outLow) * dynaValue(what) / 255 + outLow;
        };
      },
      range256Lookup = function(what, range){
        return function(){
          return range[~~dynaValue(what)];
        };
      };

  return {
    boot: function(){
      self = this;
      build();
      return this;
    },
    tick: function(fr, fs, mx, my){

      var ap  = AudioPlayer,
          bd  = ap.BeatDetector,
          bpm = ap.BeatDetector.win_bpm_int/10;    

      // whatever
      frm = fr;
      fps = fs;

      // 0-1
      mox = mx;
      moy = my;

      // scaled to 0-255
      dyn = ap.dynamic;
      spc = ap.spectrum;
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
    fnCol: function (p, p1, p2){
      var range;
      if(!p2){p2 = p1; p1 = "000000FF";}
      p1 = Colors.sani(p1);
      p2 = Colors.sani(p2);
      range = Colors.rangeHusl(256, p1, p2);
      return range256Lookup(p, range);
    }

    // this is ridiculous
    // dyna: function(p1, p2){return fnDim(DYN, p1, p2);},
    // dynd: function(p1, p2){return fnDim(DYN, p1, p2);},
    // dynr: function(p1, p2){return fnRot(DYN, p1, p2);},
    // dync: function(p1, p2){return fnCol(DYN, p1, p2);},
    // dynf: function(p1, p2){return fnFlt(DYN, p1, p2);}, // must have p1

    // vola: function(p1, p2){return fnDim(VOL, p1, p2);},
    // vold: function(p1, p2){return fnDim(VOL, p1, p2);},
    // volr: function(p1, p2){return fnRot(VOL, p1, p2);},
    // volc: function(p1, p2){return fnCol(VOL, p1, p2);},
    // volf: function(p1, p2){return fnFlt(VOL, p1, p2);}, // must have p1

    // spca: function(p1, p2){return fnDim(SPC, p1, p2);},
    // spcd: function(p1, p2){return fnDim(SPC, p1, p2);},
    // spcr: function(p1, p2){return fnRot(SPC, p1, p2);},
    // spcc: function(p1, p2){return fnCol(SPC, p1, p2);},
    // spcf: function(p1, p2){return fnFlt(SPC, p1, p2);}, // must have p1

    // sina: function(p1, p2){return fnDim(SIN, p1, p2);},
    // sind: function(p1, p2){return fnDim(SIN, p1, p2);},
    // sinr: function(p1, p2){return fnRot(SIN, p1, p2);},
    // sinc: function(p1, p2){return fnCol(SIN, p1, p2);},

    // cosa: function(p1, p2){return fnDim(COS, p1, p2);},
    // cosd: function(p1, p2){return fnDim(COS, p1, p2);},
    // cosr: function(p1, p2){return fnRot(COS, p1, p2);},
    // cosc: function(p1, p2){return fnCol(COS, p1, p2);},

    // bdta: function(p1, p2){return fnDim(BDT, p1, p2);},
    // bdtd: function(p1, p2){return fnDim(BDT, p1, p2);},
    // bdtr: function(p1, p2){return fnRot(BDT, p1, p2);},
    // bdtc: function(p1, p2){return fnCol(BDT, p1, p2);},

    // // runs linear in p1 seconds from p2 to p3
    // lina: function(p1, p2, p3){return fnDim(SEC, p1, p2);},
    // lind: function(p1, p2, p3){return fnDim(SEC, p1, p2);},
    // linr: function(p1, p2, p3){return fnRot(SEC, p1, p2);},
    // linc: function(p1, p2, p3){return fnCol(SEC, p1, p2);}

  };

})().boot();  



var Colors = (function(){

  var self, cache = {};

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function sanitize(c){

    // tries to make sure color can be processed, "00FF0080" if fails

    var r, g, b;

    if (ColorNames[c]) {
      return ColorNames[c];}

    if (c.length === 8 && c.substr(0,1) !== "#") {
      return c;}

    if (c.length === 7 && c.substr(0,1) === "#") {
      return c;}

    if (c.length === 4 && c.substr(0,1) === "#") {
      r = c.substr(1,1).toUpperCase();
      g = c.substr(2,1).toUpperCase();
      b = c.substr(3,1).toUpperCase();
      return r + r + g + g + b + b + "FF";}

    if (c.substr(0, 5) === "rgba("){
      return c;}

    if (c.substr(0, 4) === "rgb("){
      return c;}

    return "00FF0080"; //half green

  }

  function hexColor  (c){

  }

  function readColor (c){

    // returns css color string

    var color, hex, r, g, b, a;

    c = sanitize(c);

    if (c.length === 8 && c.substr(0,1) !== "#") {
      hex = Number("0x" + c.substr(0, 6));
      r = (hex & 0xff0000) >> 16; 
      g = (hex & 0x00ff00) >> 8 ; 
      b = (hex & 0x0000ff); 
      a = Number("0x" + c.substr(6,2))/255;
      color = "rgba(" + r + "," + g + "," + b + "," + a + ")";}

    else if (c.length === 7) {
      hex = Number("0x" + c.substr(1));
      r = (hex & 0xff0000) >> 16; 
      g = (hex & 0x00ff00) >>  8; 
      b = (hex & 0x0000ff); 
      color = "rgba(" + r + "," + g + "," + b + ",1)";}

    else if (c.substr(0, 5) === "rgba("){
      color = c;}

    else if (c.substr(0, 4) === "rgb("){
      color = c;}

    cache[c] = color;

    return color;

  }

  return {
    cache: cache,
    boot: function(){
      self = this;
      return this;
    },
    sani: function(color){
      return sanitize(color);
    },
    read: function(color){
      return cache[color] || readColor(color);
    },
    rangeHusl: function(count, cLow, cUpp){

      var i, alphLow, alphUpp, huslLow, huslUpp, 
          rgb, r, g, b, h, s, l, a, 
          range = [];

      // basic sanitation
      count = H.clamp(count || 256, 0, 256);
      if (cLow.length !== 8){throw "Colors.rangeHusl: cLow illegal value - " + cLow;}
      if (cUpp.length !== 8){throw "Colors.rangeHusl: cUpp illegal value - " + cUpp;}

      // range in husl [360, 100, 100]
      huslLow = $.husl.fromHex(cLow.substr(0, 6));
      huslUpp = $.husl.fromHex(cUpp.substr(0, 6));

      alphLow = Number("0x" + cLow.substr(6, 2));
      alphUpp = Number("0x" + cUpp.substr(6, 2));

      for (i=0; i<count; i++){

        h = huslLow[0] + (huslUpp[0] - huslLow[0]) / count * i;
        s = huslLow[1] + (huslUpp[1] - huslLow[1]) / count * i;
        l = huslLow[2] + (huslUpp[2] - huslLow[2]) / count * i;
        a = alphLow    + (alphUpp    - alphLow)    / count * i;

        rgb = $.husl.toRGB(h, s, l);
        r = parseInt(rgb[0] * 256, 10);
        g = parseInt(rgb[1] * 256, 10);
        b = parseInt(rgb[2] * 256, 10);
        a = a / 256;

        range.push("rgba(" + r + "," + g + "," + b + "," + a + ")");

      }

      return range;
    }


  };

})().boot();  
