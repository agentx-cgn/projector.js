/*jslint browser: true, evil:true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals $, H, DPCS, Editor, FileError, TIM, Projector, AudioContext, AudioPlayer, Playlists, async, DB, JSLINT, requestAnimationFrame */


var Loader = ((() => {
  var self;
  var errorCounter = 0;
  var doParse = false;
  var filesystem;

  var // 10MB
  filesystemSize = 1e7;

  var playlist;
  var show;
  var compo;
  var missing = [];

  var features = {
    "projector":  {available: false, needed: true,  test(ondone) {ondone();}},
    "webcam":     {available: false, needed: false, test() {}},
    "saveshows":  {available: false, needed: false, test() {}},
    "analyser":   {available: false, needed: true,  test() {}},
    "readlocal":  {available: false, needed: false, test: false},
    // "runslocal":  {available: (window.location.host) ? false : true, needed: false, test: false},
    "runslocal":  {available: true, needed: false, test: false}
  };

  var jslintOptions = {
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

  function error (e, device, msg){return {event: e, device, message: msg};}

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
    var m;
    var count = 0;
    for (m in obj){count += 1;}
    return count;
  }

  function getMembersList(obj){
    var m;
    var akku = [];
    for (m in obj){akku.push(m);}
    return akku.join(", ");
  }


  return {
    init() {
      self = this;
      window.onerror = this.onerror;
      window.onload  = this.onload;
      this.__defineGetter__('fs',         () => filesystem);
      this.__defineGetter__('features',   () => features);
      this.__defineGetter__('playlist',   () => playlist);

      return this;
    },
    showError(msg, detail, help) {

      var url = "https://www.google.com/intl/en/chrome/browser/";
      var link = "<a href='" + url + "'>Google Chrome</a>";
      var helper = {
        'install': "You need " + link + " to run projector.js",
        'update':  "You need to update " + link + " to run projector.js",
        'debug':   "[Either you press F5 to reload <br />or you start debugging now.]"
      };
      document.getElementById("errorMessage").innerHTML = msg;
      document.getElementById("errorDetail").innerHTML = detail;
      document.getElementById("errorHelp").innerHTML = helper[help] || helper['debug'];
      document.getElementById("error").style.display = "block";
      document.getElementById("projector").style.display = "none";
      document.getElementById("audioselector").style.display = "none";
    },    
    onerror(error) {
      var msg;
      var detail;
      var help;

      errorCounter += 1;

      // shows only first error, and ignores all follwoing async problems
      if (errorCounter === 1){
        if (typeof error === "string" && error.substr(0, 8) === "Uncaught"){
          // seems to be a throw
          error = error.split("|");
          error = {device: error[1], message: error[2]};
        }
        msg = (error.device) ? "Failed to access: " + error.device : "Unexpected Exception";
        detail = error.message || error;
        Projector.doAnimate = false;
        self.showError(msg, detail);
        try {
          // console.error(error.toString());
          throw (error.toString());
        } catch(er1){ /* fail silently */ }

      } else {

        try {
          // console.error(error.toString());
          throw (error.toString());
        } catch(er2){ /* fail silently */ }
      }
    },    
    onload() {

      var tasks = [];

      tasks.push(onready => {
        self.check(err => {
          TIM.step(" OK Check");
          onready(err);
        });
      });

      tasks.push(onready => {

        var EFXS = DB.get("effects");
        EFXS = []; // TODO: remove loading from html
        window.EFX = window.EFX || {}; 
        self.loadEffects(EFXS, err => {
          TIM.step(" OK EFX", getMembersList(window.EFX));
          onready(err);          
        });

      });

      tasks.push(onready => {
        show  = H.getURLParameter("show", DB.get("show")),
        compo = H.getURLParameter("compo", "");
        window.Shows = {};
        self.loadShows([show], err => {
          TIM.step(" OK Shows", show + " / " + getMembersList(window.Shows));
          onready(err);
        });
      });


      tasks.push(onready => {
        Projector.load();
        DPCS.init();
        Projector.activate();
        Editor.activate();
        Projector.initShows(err => {
          TIM.step(" OK Activated", "DPCS, Editor, Projector");
          onready(err);
        });
      });

      tasks.push(onready => {
        Projector.loadShow(show, compo, () => {
          TIM.step(" OK Show." + show, 
            Projector.compos.length  + " compos, " + 
            Projector.filters.length + " filters" 
          );
          onready();
        });
      });

      tasks.push(onready => {
        if (AudioContext) {
          AudioPlayer.init();
          AudioPlayer.activate();
          AudioPlayer.start(DB.Data.audio);
          TIM.step(" OK AudioPlayer", DB.Data.audio.source);
        } else {
          TIM.step("NAV AudioPlayer");
        }
        if(DB.Data.audio.source === "mute"){Projector.toggleAudio(true);}
        Projector.onresize();
        requestAnimationFrame(Projector.animate);
        onready();
      });

      async.series(tasks, (err, res) => {
        if(err){
          self.onerror(error(err, "Loading '" + err.device + "' failed", err.message));
        } else {
          TIM.step(" OK Projector", Projector.version + " / " + Projector.compo.name);
        }
      });


      // self.check(function(){

      //   window.EFX = window.EFX || {}; 

      //   var EFXS = DB.get("effects");
      //   EFXS = ["basic", "text", "time", "audio"];
      //   EFXS = ["basic", "time"];
      //   EFXS = ["basic"];
      //   EFXS = [];

      //   self.loadEffects(EFXS, function(){
        
      //     TIM.step(" OK EFX", getMembersList(window.EFX));

      //     window.Shows = {};

      //     // self.loadShows(DB.get("shows"), function(){

      //     self.loadShows(["test"], function(err){

      //       // TIM.step(" OK Shows", getMembersList(window.Shows));

      //       if(err){self.onerror(err); return;}

      //       Projector.load();
      //       DPCS.init(Projector.fps);
      //       Projector.activate();
      //       Editor.activate();
      //       Projector.initShows(function(err){

      //         if(err){self.onerror(err); return;}

      //         Projector.loadShow("test", function(err){

      //           if(err){self.onerror(err); return;}

      //           if (AudioContext) {
      //             AudioPlayer.init();
      //             AudioPlayer.activate();
      //             AudioPlayer.start(DB.Data.audio);
      //             TIM.step(" OK AudioPlayer", DB.Data.audio.source);
      //           } else {
      //             TIM.step("NAV AudioPlayer");
      //           }
                
      //           Projector.onresize();
      //           requestAnimationFrame(Projector.animate);
      //           TIM.step(" OK Projector");

      //         });        
      //       });
      //     });        
      //   });
      // });

    },
    check(onchecked) {

      var tasks = [];

      var required = {
        'canvas':       {'device': "canvas", 'info': "You need Chrome"},
        'getUserMedia': {'device': "getUserMedia", 'info': "You need Chrome"},
        'test': {'device': "getUserMedia", 'info': "You need Chrome"}
      };

      // Do we like this browser?
      if (!document.createElement("canvas").getContext("2d")){missing.push("canvas");}
      // if (!navigator.getUserMedia){missing.push("getUserMedia");}
      // if ((navigator.sayswho[0] === "Firefox" &&  navigator.sayswho[1] < "18" )) {missing.push("Firefox 18"); }
      if ((navigator.sayswho[0] === "Chrome"  &&  navigator.sayswho[1] < "23" )) {missing.push("Chrome 23"); }
      if (false){missing.push("test");}
      if (missing.length){
        self.showError(
          "Launch of projector.js aborted!",
          "missing device(s): " + missing.join(", "),
          "install"
        );
        return;
      } else {
        TIM.step(" OK Browser", navigator.sayswho[0] + ": " + navigator.sayswho[1]);
      }

      tasks.push(onready => {
        DB.init(onready);
      });

      tasks.push(onready => {

        TIM.step("NOT FileSystem");
        onready();
        return;
        
        // if (window.requestFileSystem){

        //   window.webkitStorageInfo.requestQuota(window.PERSISTENT, filesystemSize,
        //     function(grantedBytes){
        //       window.requestFileSystem(
        //         window.PERSISTENT, grantedBytes,
        //         function(fs){
        //           filesystem = fs;
        //           TIM.step(" OK FileSystem", fs.name + " with " + grantedBytes + " bytes");
        //           onready();
        //         },
        //         function(err){
        //           TIM.step("NOK - Filesystem", fsErrorMsg(err));
        //           // onready(error(err, "filesystem", fsErrorMsg(err)));
        //           onready();
        //         }
        //       );
        //     },
        //     function(err){
        //       onready(error(err, "filesystem", fsErrorMsg(err)));
        //     }
        //   );

        // } else {
        //   TIM.step("NAV FileSystem");
        //   onready();
        // }

      });

      tasks.push(onready => {
        var catched;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "playlist.txt", true);
        xhr.onerror = e => {
          if (!catched) {
            TIM.step("NOK Playlist", "--allow-file-access-from-files, missing");
            catched = true;
            onready();
          }
        };
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.responseText) {
            playlist = xhr.responseText.split("\n");
            features.readlocal.available = true;
            if (!catched) {
              catched = true;
              TIM.step(" OK Playlist", playlist.length + " entries");
              onready();
            }
          }
        };
        try {
          xhr.send(null);
        } catch(err){
          if (!catched) {
            console.log("--", err); 
            catched = true;
              onready();
          }
        }
      });

      tasks.push(onready => {
        var url;
        var radios = DB.get("audio").radios;
        for (url in radios) {
          $("#ap_radiourl").append($("<option>").attr("value", url).text(radios[url]));
        }
        onready();
      });

      // tasks.push(function(onready){
      //   if (filesystem){
      //     Playlists.init(filesystem, onready);
      //   } else {onready();}
      // });

      async.series(tasks, (err, res) => {
        if(err){
          self.onerror(error(err, "Loading '" + err.device + "' failed", err.message));
        } else {
          onchecked();
        }
      });

    },
    loadEffects(effects, onloaded) {

      var tasks = effects.map(name => onready => {
        var js;
        var errors;
        var results;
        var xhr = new XMLHttpRequest();
        var lib = "effects/effects." + name + ".js?" + Date.now();

        if (doParse) {
          xhr.onerror = e => {
            onready(error(e, lib, "XXXX"));
          };
          xhr.onload = () => {
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
                  () => {onready();},
                  e => {onready(error(e, lib, "XXXX"));}
                );
              }

            }
          };
          xhr.open("GET", + lib, true);
          xhr.send(null);

        } else {
          loadScript(lib,
            () => {onready();},
            e => {onready(error(e, lib, "XXXX"));}
          );
        }
      });

      async.series(tasks, (err, res) => {
        if(err){
          self.onerror(err);
        } else {
          onloaded();
        }
      });

    },
    loadShows(shows, onloaded) {

      var tasks = shows.map(name => onready => {
        var lib = "shows/show." + name + ".js?" + Date.now();

        loadScript(lib,
          () => {onready();},
          e => {onready(error(e, lib, "XXXX"));}
        );
      });

      async.series(tasks, (err, res) => {
        if(err){
          self.onerror(err);
        } else {
          onloaded();
        }
      });

    },
    XXXX() {}
  };
})()).init();

