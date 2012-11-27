/*jslint browser: true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals EFX, Filter, Pixastic, Colors */


EFX.Gestures = {};


//--------------  G E S T U R E S   -------------------------------------------
//  
//  depends on cam, still no functions
// 
//  author, noiv, 2012, Cologne
//  

EFX.Gestures.Basic = function (cfg){Filter.apply(this, [cfg]);};
EFX.Gestures.Basic.prototype = new Filter();
EFX.Gestures.Basic.constructor = EFX.Gestures.Basic;
EFX.Gestures.Basic.prototype.resize = new Function();
EFX.Gestures.Basic.prototype.load = function(onloaded){

  var self = this, hidden = document.getElementById("hidden");
  
  this.width = "128";
  this.height = "128";
  this.source.width = 128;
  this.source.height = 128;
  this.hasCam = true;

  function fallBack(e){
    var ctx = self.ctx;
    self.hasCam = false;
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "darkorange";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("No Gest.", self.source.width/2, self.source.height/2);
    if(self.dom){hidden.appendChild(self.source);}
    TIM.step("NOK Camera", e.toString());
    onloaded();
  }


  navigator.getUserMedia({video: true, toString : function() {return "video";}}, 

    function(stream) { 
      self.video = document.createElement("video");
      if(self.dom){hidden.appendChild(self.video);}
      self.device = stream.videoTracks[0].label;
      self.video.autoplay = true;
      self.video.addEventListener('playing', function(){
        self.video.width  = Number(self.width);
        self.video.height = Number(self.height);
        TIM.step(" OK Gestures", self.device + "@" + self.video.width + "x" + self.video.height);
        onloaded();
      }, false);
      self.video.src = window.webkitURL 
        ? window.webkitURL.createObjectURL(stream) 
        : stream;
      self.video.play();
      if(self.dom){hidden.appendChild(self.source);}

    },

    function(e){
      fallBack(e);
    }

  );

};
EFX.Gestures.Basic.prototype.beforeDraw = function(ops){

  if (this.hasCam) {
    this.ctx.drawImage(this.video, 0, 0, 128, 128);
  }

};

