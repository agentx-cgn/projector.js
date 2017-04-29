/*jslint browser: true, devel: true, debug: true, nomen: true, sloppy: true, vars: true, white: true, indent: 2 */
/*global $, UTILS, THREE, asyncStorage, eopDATA, tim,
*/

/*
   DB : Interface to async DB with Default Values for first time Users
   @author noiv, Cologne, http://infinite-entropy.appspot.com/

   http://www.3site.eu/db/test/
   http://webreflection.blogspot.de/2012/06/asynchronous-storage-for-all-browsers.html
   https://github.com/WebReflection/db

*/

var DB = ((() => {
  var self;
  var data = {};
  var db;
  var dbName = "projector";
  var dbEntry = "data";
  var loc = document.location.href.substr(0, 18);

  var playlist = (loc === "file:///home/noiv/") ? "T1667.music"  :
             (loc === "file:///D:/Dropbox") ? "T2200W.music" :
                                              "T2200.music";

  var defs = {
    stats: {uses: 0, time: 0},
    audio: {
      remember:  true,
      source:   "mute",
      volume:     80,
      sine:      440,
      AAQ:         2,
      stream:   "http://85.21.79.93:9045/;",
      radios:   {
        "http://38.104.130.91:8800/;" : "somaFM (128)",
        "http://85.21.79.93:8040/;"   : "deepmix.eu (128)",
        "http://91.121.13.103:8080/;" : "lounge.radio.com (128)",
        "http://88.190.234.231:80/;"  : "French Kiss FM (128)"
      },
    },
    effects: ["basic", "text", "time", "audio", "specials", "pixastic"],
    show:    "demo",
    shows:   ["demo"],
  };

  function save(msg) {
    db.setItem(dbEntry, JSON.stringify(data), (value, key, db) => {
      console.log("DB.saved", msg || "", db.type, db.name, db.length);
    });
  }

  function load(callback) {
    var val = db.getItem(dbEntry, value => {
      callback(value ? JSON.parse(value) : {fresh: true});
    });
  }

  function clearX() {
    db.clear((db, entries) => {
      console.log("DB.cleared", db, entries);
    });
  }

  return {
    clear: function clear() {
      db.clear((db, entries) => {
        console.log("DB.cleared", db, entries);
      });
    },
    save,
    get(what) {return data[what]; },
    set(what, value) {data[what] = value; save(); },
    init(onready) {

      self = this;
      this.__defineGetter__('Data', () => data);

      asyncStorage.create(dbName, mydb => {
        
        db = mydb;

        load(dbData => {
          $.extend(true, data, defs);
          $.extend(true, data, dbData);
          data.stats.uses += 1;
          data.stats.time  = Date.now();
          TIM.step(" OK Database", db.type + ": " + db.name + " - uses: " + JSON.stringify(data.stats.uses));
          onready();
        });

      }, function onError(what) {
        console.log("DB.Error: " + what);
      });


      return self;

    }

  };
}))();

