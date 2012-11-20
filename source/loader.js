/*jslint browser: true, evil:true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals FileError, TIM, Projector, AudioContext, AudioPlayer, Playlists, async, DB, JSLINT, requestAnimationFrame */
var Loader = (function(){
  
  var self, errorCounter = 0, 

  doParse = false,

  filesystem, filesystemSize = 1e7, // 10MB

  missing = [],

  jslintOptions = {
    browser: true, 
    devel: true, 
    debug: true, 
    nomen: true, 
    plusplus: true, 
    sloppy: true, 
    vars: true, 
    white: true, 
    indent: 2,
    predef: ["EFX", "Filter", "Pixastic"]
  };

  function error (e, device, msg){return {event: e, device: device, message: msg};}

  function loadScript(pathfile, onload, onerror){
    var scr = document.createElement("SCRIPT");
    document.getElementById("scripts").appendChild(scr);
    scr.onerror = onerror;
    scr.onload  = onload;
    scr.src = pathfile;
  }

  function fsErrorMsg(e) {
    switch (e.code) {
      case FileError.QUOTA_EXCEEDED_ERR: return "Quota exceeded";
      case FileError.NOT_FOUND_ERR:      return "Filesystem not found";
      case FileError.SECURITY_ERR:       return "Security Error";
      case FileError.INVALID_MODIFICATION_ERR: return "Invalid Modification";
      case FileError.INVALID_STATE_ERR:  return "Invalid State";
      default:                           return "Unknoen Error";
    }
  }

  function countMembers(obj){
    var m, count = 0; for (m in obj){count += 1;} 
    return count;
  }

  function getMembersList(obj){
    var m, akku = []; for (m in obj){akku.push(m);} 
    return akku.join(", ");
  }


  return {
    init: function(){
      self = this;
      window.onerror = this.onerror;
      window.onload  = this.onload;
      // this.__defineSetter__('volume',       function(v){setVolume(v);});
      this.__defineGetter__('fs',       function( ){return filesystem;});

      return this;
    },
    onerror: function (error){

      errorCounter += 1;

      // shows only first error, and ignores all follwoing async problems
      if (errorCounter === 1){

        if (typeof error === "string" && error.substr(0, 8) === "Uncaught"){
          // seems to a throw
          error = error.split("|");
          error = {device: error[1], message: error[2]};
        }

        document.getElementById("errorMessage").innerHTML = (error.device) ? "Failed to access: " + error.device : "Unexpected Exception";
        document.getElementById("errorDetail").innerHTML = error.message || error;
        document.getElementById("error").style.display = "block";
        document.getElementById("projector").style.display = "none";
        document.getElementById("audioselector").style.display = "none";
        Projector.doAnimate = false;
        try {
          // console.error(error.toString());
          throw (error.toString());
        } catch(e){ /* fail silently */ }

    } else {
      try {
        // console.error(error.toString());
        throw (error.toString());
      } catch(e){ /* fail silently */ }
    }

    },    
    onload: function(){

      var urlShow  = H.getURLParameter("show", "s");
      var urlCompo = H.getURLParameter("composition", "c");

      console.log(" OK URL Params", urlShow + "." + urlCompo);

      self.check(function(){

        window.EFX = window.EFX || {}; 

        var EFXS = DB.get("effects");
        EFXS = ["basic", "text", "time", "audio"];
        EFXS = ["basic", "time"];
        EFXS = ["basic"];
        EFXS = [];

        self.loadEffects(EFXS, function(){
        
          TIM.step(" OK EFX", getMembersList(window.EFX));

          window.Shows = {};

          // self.loadShows(DB.get("shows"), function(){

          self.loadShows(["test"], function(err){

            // TIM.step(" OK Shows", getMembersList(window.Shows));

            if(err){self.onerror(err); return;}

            Projector.load();
            Projector.activate();
            Projector.initShows(function(err){

              if(err){self.onerror(err); return;}

              Projector.loadShow("test", function(err){

                if(err){self.onerror(err); return;}

                if (AudioContext) {
                  AudioPlayer.init();
                  AudioPlayer.activate();
                  AudioPlayer.start(DB.Data.audio);
                  TIM.step(" OK AudioPlayer", DB.Data.audio.source);
                } else {
                  TIM.step("NAV AudioPlayer");
                }
                
                Projector.onresize();
                requestAnimationFrame(Projector.animate);
                TIM.step(" OK Projector");

              });        
            });
          });        
        });
      });

    },
    check: function(onchecked){

      var tasks = [];

      // Do we like this browser?
      if (!document.createElement("canvas").getContext("2d")){missing.push("canvas");}
      if (!navigator.getUserMedia){missing.push("getUserMedia");}
      if ((navigator.sayswho[0] === "Firefox" &&  navigator.sayswho[0] <18 )) {missing.push("Firefox Version 18"); }
      if ((navigator.sayswho[0] === "Chrome"  &&  navigator.sayswho[0] <23 )) {missing.push("Chrome Version 23"); }
      if (false){missing.push("test");}
      if (missing.length){
        self.onerror(error(
          null,
          "launch of projector aborted!",
          "missing device(s): " + missing.join(", ")
        ));
        return;
      } else {
        TIM.step(" OK Browser", navigator.sayswho[0] + ": " + navigator.sayswho[1]);
      }

      tasks.push(function(onready){
        DB.init(onready);
      });

      tasks.push(function(onready){
        
        if (window.requestFileSystem){

          window.webkitStorageInfo.requestQuota(window.PERSISTENT, filesystemSize,
            function(grantedBytes){
              window.requestFileSystem(
                window.PERSISTENT, grantedBytes,
                function(fs){
                  filesystem = fs;
                  TIM.step(" OK FileSystem", fs.name + " with " + grantedBytes + " bytes");
                  onready();
                },
                function(err){
                  onready(error(err, "filesystem", fsErrorMsg(err)));
                }
              );
            },
            function(err){
              onready(error(err, "filesystem", fsErrorMsg(err)));
            }
          );

        } else {
          TIM.step("NAV FileSystem");
          onready();
        }

      });




      tasks.push(function(onready){
        if (filesystem){
          Playlists.init(filesystem, onready);
        } else {onready();}
      });

      async.series(tasks, function(err, res){
        if(err){
          self.onerror(error(err, "Loading '" + err.device + "' failed", err.message));
        } else {
          onchecked();
        }
      });

    },
    loadEffects: function(effects, onloaded){

      var tasks = effects.map(function(name){
        return function(onready){

          var js, errors, results, 
              xhr = new XMLHttpRequest(),
              lib = "effects/effects." + name + ".js?" + Date.now();

          if (doParse) {
            xhr.onerror = function(e) {
              onready(error(e, lib, "XXXX"));
            };
            xhr.onload = function() {
              if (xhr.readyState === 4) {                
                js = xhr.responseText;
                results = JSLINT(js, jslintOptions);
                errors  = JSLINT.errors;
                if (errors) {
                  self.onerror(error(null, lib, 
                    errors.length + " parsing errors<br />line " + errors[0].line + " : " + errors[0].reason
                  ));
                  console.log(errors);
                } else {
                  loadScript(lib,
                    function( ){onready();},
                    function(e){onready(error(e, lib, "XXXX"));}
                  );
                }

              }
            };
            xhr.open("GET", + lib, true);
            xhr.send(null);

          } else {
            loadScript(lib,
              function( ){onready();},
              function(e){onready(error(e, lib, "XXXX"));}
            );
          }


        };
      });

      async.series(tasks, function(err, res){
        if(err){
          self.onerror(err);
        } else {
          onloaded();
        }
      });

    },
    loadShows: function(shows, onloaded){

      var tasks = shows.map(function(name){
        return function(onready){
          var lib = "shows/show." + name + ".js?" + Date.now();

          loadScript(lib,
            function( ){onready();},
            function(e){onready(error(e, lib, "XXXX"));}
          );
        };
      });

      async.series(tasks, function(err, res){
        if(err){
          self.onerror(err);
        } else {
          onloaded();
        }
      });

    },
    XXXX: function(){}
  };


})().init();

