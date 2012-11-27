
// https://gist.github.com/1579671
// (function () {
//   for (var a = 0, b = ["ms", "moz", "webkit", "o"], c = 0; c < b.length && !window.requestAnimationFrame; ++c) {
//     window.requestAnimationFrame = window[b[c] + "RequestAnimationFrame"];
//     window.cancelAnimationFrame = window[b[c] + "CancelAnimationFrame"] || window[b[c] + "CancelRequestAnimationFrame"]
//   }
//   if (!window.requestAnimationFrame) window.requestAnimationFrame = function (b) {
//     var c = Date.now(),
//       g = Math.max(0, 16 - (c - a)),
//       h = window.setTimeout(function () {
//         b(c + g)
//       }, g);
//     a = c + g;
//     return h
//   };
//   if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (a) {
//     clearTimeout(a)
//   }
// })();

// http://www.html5rocks.com/en/tutorials/getusermedia/intro/

/*
    --allow-file-access-from-files
    
    navigator.webkitGetUserMedia(
      {'video': true}, 
      function(s){console.log(s)}, 
      function(e){console.log(e)}
    )

*/
// navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
// window.URL = window.URL || window.webkitURL;


// http://stackoverflow.com/questions/5916900/detect-version-of-browser

navigator.sayswho = (function(){
  var N= navigator.appName, ua= navigator.userAgent, tem;
  var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
  if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
  return  M ? [M[1], M[2]]: [N, navigator.appVersion, '-?'];
})();

// http://stackoverflow.com/questions/11219731/trim-function-doesnt-work-in-ie8
if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  }
}


// other stuff
// function pad(s, l){l = l || 2; var out = "0000" + s; return out.substr(out.length -l);}

var createRingBuffer = function(length){

  var pointer = 0, buffer = []; 

  return {
    push : function(item){
      buffer[pointer] = item;
      pointer = (length + pointer +1) % length;
    },
    buf  : buffer,
    get  : function(key){return buffer[key];},
    max  : function(){return Math.max.apply(Math, buffer);},
    min  : function(){return Math.min.apply(Math, buffer);},
    sum  : function(){return buffer.reduce(function(a, b){ return a + b; }, 0);},
    avg  : function(){return buffer.reduce(function(a, b){ return a + b; }, 0) / length;},    
  };
};

// function fmtTime(time){

//   return pad(time.getHours()) + ":" + 
//          pad(time.getMinutes()) + ":" + 
//          pad(time.getSeconds()) ;

// }

var H = {
  pad:    function (str, len){len = len || 2; var out = "0000" + str; return out.substr(out.length -len);},
  roundA: function (arr, places){return arr.map(function(num){return H.round(num, places);});},
  round:  function (num, places) {
    var r;
     if (places > 0) {
        if ((num.toString().length - num.toString().lastIndexOf('.')) > (places + 1)) {
           r = Math.pow(10, places);
           return Math.round(num * r) / r;
        } else {return num};
     } else {return Math.round(num)};
  },
  fmtTime: function (time){ 
    return pad(time.getHours()) + ":" + 
      pad(time.getMinutes()) + ":" + 
      pad(time.getSeconds()) ;
  },
  clone: function(obj){
    var m, out = {};
    for (m in obj){out[m] = obj[m];}
    return out;
  },
  scaleRange: function (x, dMin, dMax, cMin, cMax, rev){
    //http://stackoverflow.com/questions/5294955/how-to-scale-down-a-range-of-numbers-with-a-known-min-and-max-value
    if (false || rev) {
      return cMax - ((cMax-cMin)*(x-dMin)/(dMax-dMin)+cMin); // with reversed (Temp)
    } else {
      return ((cMax-cMin)*(x-dMin)/(dMax-dMin)+cMin);}
  },
  clamp: function(val, min, max){
    return Math.max(Math.min(val, max), min);
  },  
  getURLParameter: function (name, def) {
      // http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
      return decodeURIComponent(
        (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20')
      ) || def || null;
  }



};



// function traverseFileTree(item, path) {
//   path = path || "";
//   if (item.isFile) {
//     // Get file
//     item.file(function(file) {
//       console.log("File:", path + file.name);
//     });
//   } else if (item.isDirectory) {
//     // Get folder contents
//     var dirReader = item.createReader();
//     dirReader.readEntries(function(entries) {
//       for (var i=0; i<entries.length; i++) {
//         traverseFileTree(entries[i], path + item.name + "/");
//       }
//     });
//   }
// }

