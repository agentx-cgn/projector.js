/*jslint bitwise: true, browser: true, evil:true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals $, H  */

function Color(color){

  var standard = "00FF0080",
      cache = [],
      col  = {};

  if (color === "test") {_testColor(); return; }
  if (color === "range"){_testRange(); return; }

  if (arguments.length > 1){
    return range.apply(null, Array.prototype.slice.call(arguments));
  }

  col.org  = color;
  col.rgba = sanitize(color).toUpperCase();
  col.css  = (function(){
    var a = col.arr = [
      parseInt(col.rgba.substr(0,2), 16), 
      parseInt(col.rgba.substr(2,2), 16),
      parseInt(col.rgba.substr(4,2), 16),
      (col.rgba.substr(6,2) === "FF") ? 1 : parseInt(col.rgba.substr(6,2), 16)/255];
    return "rgba(" + a[0] + "," + a[1] + "," + a[2] + ","  + a[3] + ")";
  }());


  function range(/* arguments */){

    var r, r1, r2, newargs, clone, args = Array.prototype.slice.call(arguments),
        max = 256;

    if (args.length === 0){
      return range("000000FF", "FFFFFFFF");} 

    else if (args.length === 1){ 
      return range("000000FF", args[1]);} 

    else if (args.length === 2){ 
      return range(args[0], max, args[1]);} 

    else if (args.length === 3){ 
      // here is the work
      return rangeHusl(Math.max(args[1], 1), Color(args[0]).rgba, Color(args[2]).rgba);} 

    else if (args.length === 4){ 
      return args[3].concat(range(args[0], Number(args[1]) +1, args[2]).slice(1));} 

    else {

      if (typeof args[args.length-1] === "object") {
        r = range(args[2], args[3], args[4], args[args.length-1]);
        clone = args.slice(2, -1);
        newargs = clone.concat([r]);
        return range.apply(null, newargs);}

      else {
        clone = args.slice(2);
        r = range(args[0], args[1], args[2]);
        newargs = clone.concat([r]);
        return range.apply(null, newargs);}}

  }

  function rangeHusl (length, cLow, cUpp){

    var i, alphLow, alphUpp, huslLow, huslUpp, 
        rgb, r, g, b, h, s, l, a, 
        range = [], count = Number(length);

    // range in husl [360, 100, 100]
    huslLow = $.husl.fromHex(cLow.substr(0, 6));
    huslUpp = $.husl.fromHex(cUpp.substr(0, 6));

    alphLow = Number("0x" + cLow.substr(6, 2));
    alphUpp = Number("0x" + cUpp.substr(6, 2));

    range.push(Color(cLow).css);

    for (i=1; i<count-1; i++){

      h = huslLow[0] + (huslUpp[0] - huslLow[0]) / (count -1) * i;
      s = huslLow[1] + (huslUpp[1] - huslLow[1]) / (count -1) * i;
      l = huslLow[2] + (huslUpp[2] - huslLow[2]) / (count -1) * i;
      a = alphLow    + (alphUpp    - alphLow)    / (count -1) * i;

      rgb = $.husl.toRGB(h, s, l);
      r = parseInt(rgb[0] * 256, 10);
      g = parseInt(rgb[1] * 256, 10);
      b = parseInt(rgb[2] * 256, 10);
      a = a / 255;

      range.push("rgba(" + r + "," + g + "," + b + "," + a + ")");

    }

    range.push(Color(cUpp).css);

    return range;
  }


  function hex(d) {return  ("0"+(Number(d).toString(16))).slice(-2).toUpperCase();}

  function css2rgba(c){
    var a, b;
    b = c.substr(0, 4);
    c = c.toLowerCase();
    c = c.replace("(", ",");
    c = c.replace(")", ",");
    a = c.split(",");
    if(b === "rgba" && a.length === 6){
      return hex(a[1]) + hex(a[2]) + hex(a[3]) + hex(~~(a[4]*255));
    }
    if(b === "rgb(" && a.length === 5){
      return hex(a[1]) + hex(a[2]) + hex(a[3]) + "FF";
    }
    return standard;
  }

  function sanitize(c){
    var r, g, b, a;
    if (ColorNames[c]) {return sanitize(ColorNames[c]);}
    if (c.substr(0, 5) === "rgba("){return css2rgba(c);}
    if (c.substr(0, 4) === "rgb(") {return css2rgba(c);}
    if (c.length === 3) {return sanitize("#"+c);}
    if (c.length === 4 && c.substr(0,1) === "#") {
      r = c.substr(1,1).toUpperCase();
      g = c.substr(2,1).toUpperCase();
      b = c.substr(3,1).toUpperCase();
      return r + r + g + g + b + b + "FF";}
    if (c.length === 4) {
      r = c.substr(0,1).toUpperCase();
      g = c.substr(1,1).toUpperCase();
      b = c.substr(2,1).toUpperCase();
      a = c.substr(3,1).toUpperCase();
      return sanitize(r + r + g + g + b + b + a + a);}
    if (c.length === 7 && c.substr(0,1) === "#") {return c.substr(1, 6) + "FF";}
    if (c.length === 8 && c.substr(0,1) !== "#") {return c;}
    return standard; //half green
  }

  function _testColor(){
    var c;
    c = "";         console.log(c, Color(c).rgba, Color(c).css);
    c = "abc";      console.log(c, Color(c).rgba, Color(c).css);
    c = "ABC";      console.log(c, Color(c).rgba, Color(c).css);
    c = "#ABC";     console.log(c, Color(c).rgba, Color(c).css);
    c = "#AABBCC";  console.log(c, Color(c).rgba, Color(c).css);
    c = "AABBCCEE"; console.log(c, Color(c).rgba, Color(c).css);
    c = "rgb(255,128,64)"; console.log(c, Color(c).rgba, Color(c).css);
    c = "rgba(255,128,64,0.5)"; console.log(c, Color(c).rgba, Color(c).css);
    c = "rgba(1,2,3,0.01)"; console.log(c, Color(c).rgba, Color(c).css);
    c = "rgba(255,3,2,1)"; console.log(c, Color(c).rgba, Color(c).css);
    c = "white";    console.log(c, Color(c).rgba, Color(c).css);
  }

  function _testRange(){
    console.log(Color("abc"), "abc");
    console.log(Color("abc", "def"), "abc", "def");
    console.log(Color("abc", 2, "def"), "abc", 2, "def");
    console.log(Color("abc", 2, "def", 2, "adf"), "abc", 2, "def", 2, "adf");
  }

  cache[color] = H.clone(col);
  return col;

}

// var Colors = (function(){

//   var self, cache = {}, ranges;

//   function rgbToHex(r, g, b) {
//     return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
//   }

//   function sanitize(c){

//     // tries to make sure color can be processed, "00FF0080" if fails

//     var r, g, b;

//     if (ColorNames[c]) {
//       return ColorNames[c];}

//     if (c.length === 8 && c.substr(0,1) !== "#") {
//       return c;}

//     if (c.length === 7 && c.substr(0,1) === "#") {
//       return c;}

//     if (c.length === 4 && c.substr(0,1) === "#") {
//       r = c.substr(1,1).toUpperCase();
//       g = c.substr(2,1).toUpperCase();
//       b = c.substr(3,1).toUpperCase();
//       return r + r + g + g + b + b + "FF";}

//     if (c.substr(0, 5) === "rgba("){
//       return c;}

//     if (c.substr(0, 4) === "rgb("){
//       return c;}

//     return "00FF0080"; //half green

//   }

//   function hexColor  (c){

//   }

//   function readColor (c){

//     // returns css color string

//     var color, hex, r, g, b, a;

//     c = sanitize(c);

//     if (c.length === 8 && c.substr(0,1) !== "#") {
//       hex = Number("0x" + c.substr(0, 6));
//       r = (hex & 0xff0000) >> 16; 
//       g = (hex & 0x00ff00) >> 8 ; 
//       b = (hex & 0x0000ff); 
//       a = Number("0x" + c.substr(6,2))/255;
//       color = "rgba(" + r + "," + g + "," + b + "," + a + ")";}

//     else if (c.length === 7) {
//       hex = Number("0x" + c.substr(1));
//       r = (hex & 0xff0000) >> 16; 
//       g = (hex & 0x00ff00) >>  8; 
//       b = (hex & 0x0000ff); 
//       color = "rgba(" + r + "," + g + "," + b + ",1)";}

//     else if (c.substr(0, 5) === "rgba("){
//       color = c;}

//     else if (c.substr(0, 4) === "rgb("){
//       color = c;}

//     cache[c] = color;

//     return color;

//   }

//   return {
//     cache: cache,
//     boot: function(){
//       self = this;
//       return this;
//     },
//     sani: function(color){
//       return sanitize(color);
//     },
//     read: function(color){
//       return cache[color] || readColor(color);
//     },
//     ranges: {
//       add: function(entries, repeat, c1, c2){
//         console.log(entries, repeat, c1, c2);
//       }
//     },
//     rangeHusl: function(count, cLow, cUpp){

//       var i, alphLow, alphUpp, huslLow, huslUpp, 
//           rgb, r, g, b, h, s, l, a, 
//           range = [];

//       // basic sanitation
//       count = H.clamp(count || 256, 0, 256);
//       if (cLow.length !== 8){throw "Colors.rangeHusl: cLow illegal value - " + cLow;}
//       if (cUpp.length !== 8){throw "Colors.rangeHusl: cUpp illegal value - " + cUpp;}

//       // range in husl [360, 100, 100]
//       huslLow = $.husl.fromHex(cLow.substr(0, 6));
//       huslUpp = $.husl.fromHex(cUpp.substr(0, 6));

//       alphLow = Number("0x" + cLow.substr(6, 2));
//       alphUpp = Number("0x" + cUpp.substr(6, 2));

//       for (i=0; i<count; i++){

//         h = huslLow[0] + (huslUpp[0] - huslLow[0]) / count * i;
//         s = huslLow[1] + (huslUpp[1] - huslLow[1]) / count * i;
//         l = huslLow[2] + (huslUpp[2] - huslLow[2]) / count * i;
//         a = alphLow    + (alphUpp    - alphLow)    / count * i;

//         rgb = $.husl.toRGB(h, s, l);
//         r = parseInt(rgb[0] * 256, 10);
//         g = parseInt(rgb[1] * 256, 10);
//         b = parseInt(rgb[2] * 256, 10);
//         a = a / 256;

//         range.push("rgba(" + r + "," + g + "," + b + "," + a + ")");

//       }

//       return range;
//     }


//   };

// })().boot();  
