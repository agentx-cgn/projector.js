
var Playlists = ((() => {
  var self;
  var filesystem;
  var albums = [];

  var //{file: "", Interpret: "", Album: ""};
  playlist;

  var fileList;

  function error (e, device, msg ){
    return {event: e, device, msg};
  }

  // http://www.html5rocks.com/en/tutorials/file/filesystem/

  function readPlaylist(fileEntry, onready) {
    fileEntry.file(file => {
      var reader = new FileReader();
      reader.onloadend = e => {
        // playlist = JSON.parse(this.result);
        onready();
      };
      reader.onerror = e => {
        onready(error(e, "Master Playlist", "Couldn't read"));
      };
      reader.readAsText(file);
    },
    e => {
      onready(error(e, "Master Playlist", "Couldn't read"));
    });
  }

  return {
    boot() {
      self = this;
      return self;
    },
    init(filesystem, onready) {
      fs = filesystem;
      fs.root.getFile('playlist.json', {create: true, exclusive: true},
        fileEntry => {
          // first time
          fileList = fileEntry;
          TIM.step(" OK Playlist", "fresh");
          onready();
        },
        e => {
          fs.root.getFile('playlist.json', {create: false, exclusive: true},
            fileEntry => {
              // file exists
              fileList = fileEntry;
              TIM.step(" OK FS.Playlist", "exists");
              readPlaylist(fileEntry, onready);
            },
            e => {
              onready(error(e, "FileSystem", "Couldn't open Master Playlist"));
            }
          );
      });
    },
    loadList(list, onloading, onloaded) {
      var i;
      var item;
      var items = list.split(list);
      var len = items.length;

      for (i=0; i<len; i++) {

      }
    }

  };
}))().boot();


