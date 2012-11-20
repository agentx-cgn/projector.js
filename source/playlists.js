
var Playlists = (function(){

  var self, filesystem,
      albums = [],
      playlist, //{file: "", Interpret: "", Album: ""};
      fileList;

  function error (e, device, msg ){
    return {event: e, device: device, msg: msg};
  }

// http://www.html5rocks.com/en/tutorials/file/filesystem/

  function readPlaylist(fileEntry, onready) {
    fileEntry.file(function(file) {
      var reader = new FileReader();
      reader.onloadend = function(e) {
        // playlist = JSON.parse(this.result);
        onready();
      };
      reader.onerror = function(e) {
        onready(error(e, "Master Playlist", "Couldn't read"));
      };
      reader.readAsText(file);
    },
    function(e){
      onready(error(e, "Master Playlist", "Couldn't read"));
    });
  }

  return {
    boot: function(){
      self = this;
      return self;
    },
    init: function (filesystem, onready){
      fs = filesystem;
      fs.root.getFile('playlist.json', {create: true, exclusive: true},
        function(fileEntry) {
          // first time
          fileList = fileEntry;
          TIM.step(" OK Playlist", "fresh");
          onready();
        },
        function(e){
          fs.root.getFile('playlist.json', {create: false, exclusive: true},
            function(fileEntry) {
              // file exists
              fileList = fileEntry;
              TIM.step(" OK FS.Playlist", "exists");
              readPlaylist(fileEntry, onready);
            },
            function(e){
              onready(error(e, "FileSystem", "Couldn't open Master Playlist"));
            }
          );
      });
    },
    loadList: function (list, onloading, onloaded) {

      var i, item, items = list.split(list), len = items.length;

      for (i=0; i<len; i++) {

      }

    }

  };

  
})().boot();


