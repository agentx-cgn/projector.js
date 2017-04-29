/*jslint bitwise: true, browser: true, evil:true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals   */

  // http://jplayer.org/HTML5.Media.Event.Inspector/
  // http://dev.opera.com/articles/view/html5-audio-radio-player/
  // http://my.opera.com/core/blog/2010/03/03/everything-you-need-to-know-about-html5-video-and-audio-2
  // http://stackoverflow.com/questions/7700273/play-mp3-file-after-uploading-it-with-html5-drag-and-drop-upload
  // https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/webrtc-integration.html
  // http://code.google.com/p/chromium/issues/detail?id=112367

var AudioPlayer = ((() => {
  var i;
  var self;
  var media = [];
  var idx = null;
  var hasLoaded = false;
  var isEnabled = false;
  var fps = 0;
  var status = {};

  var // "mute, error, playing"
  statusAudio = "mute";

  var timerMediaCheck;
  var timerMediaTimeout = 5 * 1000;
  var playerCounter = 0;
  var player = null;
  var playlist;
  var trackinfo = ["n/a"];
  var context;
  var streamMicro;
  var nodeSource;
  var nodeSine;
  var nodeGain;
  var nodeDPCS;
  var nodeAnalyser;

  var mapQuality = {
    '0':    0, // off, 0 bands
    '1':  128, // low
    '2':  256, // good
    '3':  512, // demanding
    '4': 1024  // insane
  };

  var bandsAnalyser = 256;
  var arrayFrequency = [];
  var arrayWaveform = [];

  var // seems to be the min value
  bandsDPCS = 16;

  var dpcsSpectrum = 0;
  var dpcsDynamic = 0;
  var dpcsDynaBand = 0;
  var dpcsVolume = 0;
  var arrayDPCS = [];
  var bufDPCS = [];
  var bufVolume = createRingBuffer(fps);
  var beatdetector = new BeatDetektor();
  var bpm;
  var bdtQuality;
  var bdtJitter;
  var bdtBeatCount;
  var numErrors = 0;
  var maxErrors = 20;

  for (i=0; i<bandsDPCS; i++) {
    bufDPCS[i] = createRingBuffer(fps);
  }


  function r (n, p){var e = 10 ** (p || 1); return ~~(n*e)/e;}

  function eat (e){
    e.stopPropagation();
    e.preventDefault();
    e.returnValue = false;
    return false;
  }

  function errorMsg(e) {
    switch (e.target.error.code || e.srcElement.error.code) {
      case 1:   return "MEDIA_ERR_ABORTED";
      case 2:   return "MEDIA_ERR_NETWORK";
      case 3:   return "MEDIA_ERR_DECODE";
      case 4:   return "MEDIA_ERR_SRC_NOT_SUPPORTED";
      case 5:   return "MEDIA_ERR_ENCRYPTED";
      default:  return "Unknown Error";
    }
  }

  function setVolume(volume){
    status.volume = volume;
    nodeGain.gain.value = volume/100;
    $("#ap_volume").val(status.volume);
    $("#txtVolume").val(status.volume + "%");
  }

  function updateContext(source){

    // Source > Gain > Analyser > DPCS > Destination

    resetArrays();
    beatdetector.reset();

    if (!context){context = new AudioContext();}
    if (context.activeSourceCount){
      if(nodeSource){nodeSource.disconnect();}
      if(nodeGain){nodeGain.disconnect();}
      if(nodeDPCS){nodeDPCS.disconnect();}
      if(nodeAnalyser){nodeAnalyser.disconnect();}
      nodeDPCS = null;
      nodeAnalyser = null;
      nodeGain = null;
      nodeSource = null;
      beatdetector.reset();
      resetArrays();
    }

    if (source && source === player) {
      nodeSource = context.createMediaElementSource(player);

    } else if (source === "sine"){
      nodeSource = context.createOscillator();
      nodeSource.type = 0; // 4 types of oscillators are available. They are Sine wave = 0, Square wave = 1, Sawtooth wave = 2, Triangle wave = 3, a fourth option exists as well called "custom".
      nodeSource.frequency.value = 440;
      nodeSource.noteOn(0.1);
    }

    if (nodeSource){
      buildNodes();
      nodeGain.gain.value = 0;
      nodeSource.connect(nodeGain);
      nodeGain.connect(nodeAnalyser);
      nodeAnalyser.connect(nodeDPCS);
      nodeDPCS.connect(context.destination);
      nodeGain.gain.value = status.volume/100;
      arrayFrequency =  new Uint8Array(nodeAnalyser.frequencyBinCount);
      arrayWaveform  =  new Uint8Array(nodeAnalyser.frequencyBinCount);
      arrayDPCS =       new Uint8Array(nodeDPCS.frequencyBinCount);
    }

    function resetArrays(){
      arrayFrequency =  new Uint8Array(bandsAnalyser);
      arrayWaveform  =  new Uint8Array(bandsAnalyser);
      arrayDPCS =       new Uint8Array(bandsDPCS);
      bufVolume = createRingBuffer(fps);
      for (i=0; i<bandsDPCS; i++) {
        bufDPCS[i] = createRingBuffer(fps);
      }
    }

    function buildNodes(){

      nodeGain = context.createGainNode();
      nodeAnalyser = context.createAnalyser();
      nodeAnalyser.smoothingTimeConstant = 1/fps/2;
      nodeAnalyser.fftSize = bandsAnalyser * 2;
      nodeDPCS = context.createAnalyser();
      nodeDPCS.smoothingTimeConstant = 0;
      nodeDPCS.fftSize = bandsDPCS * 2; 
  }}

  function updateTrackInfo(src){
    var data;
    var len;
    if (src){
      data = src.split("/");
      len = data.length;
      if (len >= 3 ) {
        trackinfo = [
          decodeURIComponent(data[len-3]),
          decodeURIComponent(data[len-2]),
          decodeURIComponent(data[len-1])
        ];
      } else {trackinfo = ["undetected"];}
    } else {trackinfo = ["unknown"];}
  }

  function fmtInfo(medium){
    var s;
    var m;
    if (!isEnabled){return "unsupported";}
    if(medium){
      s = parseInt(medium.audio.currentTime % 60, 10);
      m = parseInt((medium.audio.currentTime / 60) % 60, 10);
      return medium.name + "/" + m + '.' + s + "m/" + medium.audio.duration;
    } else {return "inactive";}
  }

  function traverseFileTree(collector, item, path) {
    var i;
    var dirReader;

    path = path || "";
    if (item.isFile) {
      item.file(file => {
        if (file.name.substr(-3) === "mp3"){
          collector.push(file);
          console.log("File:", path + file.name);
        }
      });
    } else if (item.isDirectory) {
      console.log("Folder:", item, path);
      dirReader = item.createReader();
      dirReader.readEntries(entries => {
        for (i=0; i<entries.length; i++) {
          traverseFileTree(collector, entries[i], path + item.name + "/");
        }
      });
    }
  }

  return {
    boot(fps) {
      self = this;
      this.__defineGetter__('enabled',       () => isEnabled);
      this.__defineGetter__('context',       () => context);
      this.__defineGetter__('statusAudio',   () => statusAudio);
      this.__defineGetter__('info',          () => fmtInfo(media[idx]));
      this.__defineGetter__('trackInfo',     () => trackinfo);
      this.__defineSetter__('volume',        v => {setVolume(v);});

      this.__defineGetter__('dataDPCS',      () => arrayDPCS);
      this.__defineGetter__('bandsDPCS',     () => bandsDPCS);
      this.__defineGetter__('volume',        () => dpcsVolume);
      this.__defineGetter__('avgvolume',     () => bufVolume.avg());
      this.__defineGetter__('spectrum',      () => dpcsSpectrum);
      this.__defineGetter__('dynaband',      () => dpcsDynaBand);
      this.__defineGetter__('dynamic',       () => dpcsDynamic);

      this.__defineGetter__('bandsAnalyser', () => bandsAnalyser);
      this.__defineGetter__('dataFrequency', () => arrayFrequency);
      this.__defineGetter__('dataWaveform',  () => arrayWaveform);
      this.__defineGetter__('BeatDetector',  () => beatdetector);
      this.__defineGetter__('BeatCount',     () => bdtBeatCount);
      
      return self;
    },
    init() {

      fps = Projector.fps;
      bandsAnalyser = mapQuality[Projector.audioquality] || 256;
      updateContext();
      isEnabled = true;
      
    },
    tick(frame) {
      var i;
      var vol = 0;
      var len = bandsDPCS;
      var dynMax = 0;

      var // band = 0, 
      dynMin = 0;

      var maxDif = 0;
      var minMin;
      var maxMax;

      if (nodeAnalyser){

        // for Spectrum effect
        nodeAnalyser.getByteFrequencyData(arrayFrequency);
        nodeAnalyser.getByteTimeDomainData(arrayWaveform);

        // for Dynamics and Debug / overall Volume
        dpcsVolume = 0;
        nodeDPCS.getByteFrequencyData(arrayDPCS);
        for (i = 0; i < len; i++) {
          vol += arrayDPCS[i];
          bufDPCS[i].push(arrayDPCS[i]);
        }
        dpcsVolume = vol/len;
        bufVolume.push(~~dpcsVolume);

        // max freq band + volume/16
        dpcsSpectrum = 0;
        for (i = len-1; i>-1; i--) {
          if(arrayDPCS[i] > 16){
            // dpcsSpectrum = i*16 + arrayDPCS[i]/16;
            dpcsSpectrum = i*16 + dpcsVolume/16;
            break;
          }
        }

        // vol of most dynamic band scaled to min max of this band
        dpcsDynamic = 0;
        for (i = 0; i < len; i++) {
          dynMax = bufDPCS[i].max();
          dynMin = bufDPCS[i].min();
          if (dynMax - dynMin > maxDif){
            dpcsDynaBand = i;
            maxMax = dynMax;
            minMin = dynMin;
            maxDif = dynMax - dynMin;
          }
        }
        if (arrayDPCS[dpcsDynaBand] === 0) {
          dpcsDynamic = 0;
        } else  {
          dpcsDynamic = H.scaleRange(arrayDPCS[dpcsDynaBand], minMin, maxMax, 0, 255);
        }
        if (isNaN(dpcsDynamic)){ // Why
          dpcsDynamic = 0; 
          // console.log(dynMin, dynMax, maxDif, dpcsDynaBand, arrayDPCS[dpcsDynaBand], arrayDPCS);
        }
      }
    },
    tickBeat() {
      // if (context.activeSourceCount){
        beatdetector.process(window.performance.now()/1000, arrayFrequency);
        bpm =           beatdetector.win_bpm_int/10;
        bdtJitter =   r(beatdetector.bpm_offset, 6);
        bdtQuality =  r(beatdetector.quality_total, 4);
        bdtBeatCount =  beatdetector.beat_counter;
      // }
    },

    switchQuality(index) {

      if (mapQuality[index] && isEnabled){
        bandsAnalyser = mapQuality[index];
        nodeAnalyser.fftSize = bandsAnalyser * 2;
        arrayFrequency = new Uint8Array(nodeAnalyser.frequencyBinCount);
        arrayWaveform  = new Uint8Array(nodeAnalyser.frequencyBinCount);
        beatdetector.reset();
        console.log("AP.switchQuality", index, bandsAnalyser);
      }

    },
    start(settings) {

      var src = settings.source;

      if      (src === "mute")     {self.switchAudio(src);}
      else if (src === "sine")     {self.switchAudio(src, settings.sine);}
      else if (src === "radio")    {self.switchAudio(src, ["http://38.104.130.91:8800/;"]);}
      else if (src === "files")    {self.switchAudio(src, settings.files);}
      else if (src === "stream")   {self.switchAudio(src, [DB.Data.audio.stream]);}
      else if (src === "playlist") {self.switchAudio(src, Loader.playlist);}
      else {console.log("AP.start: unknown source", src);}

    },  
    next() {
      if (playlist) {
        self.switchAudio("mute");
        self.switchAudio("files", playlist);
      }
    },
    switchAudio(source, data) {

      // console.log("AP.selectAudio.in:", source, data);

      var file;

      if(timerMediaCheck){
        clearTimeout(timerMediaCheck);
        timerMediaCheck = null;
      } 

      // console.log(source, (data) ? data[0] : "nodata");

      switch (source) {

        case "mute":
          statusAudio = "mute";
          updateTrackInfo("");
          if (player){
            player.pause();
            player.removeEventListener('error',      onError);
            player.removeEventListener('ended',      onEnded);
            player.removeEventListener('timeupdate', onTimeupdate);
            player.removeEventListener('canplay',    onCanplay);
            player.src = "";
            document.getElementById("hidden").removeChild(player);
            player = null;
          }
          updateContext(null);
          break;
          
        case "sine":
          statusAudio = "playing";
          self.switchAudio("mute");
          updateContext("sine");
          break;
          
        case "micro":
          self.switchAudio("mute");
          if (streamMicro){
            // nodeSource = context.createMediaStreamSource(streamMicro);
            updateContext(streamMicro);
          } else {
            navigator.getUserMedia({audio: true, toString() {return "audio";}},
              streamMicro => {

                nodeSource = context.createMediaStreamSource(streamMicro);
                updateContext(nodeSource);

                console.log("AP.micro", streamMicro, nodeSource);

                // medium.device = stream.audioTracks[0].label;
                // audio.controls = true;

                // waiting for : http://code.google.com/p/chromium/issues/detail?id=112367
                // medium.nodeSource = context.createMediaStreamSource(stream);

                // audio.src = window.webkitURL
                //   ? window.webkitURL.createObjectURL(stream)
                //   : stream;
                // medium.nodeSource = context.createMediaElementSource(audio);

                // onready();
              },
              e => {
                // onready({event:e, message:"Could not load medium: " + medium.stream});
              }
            );
          }



          break;
          
        case "stream":
          self.switchAudio("mute");
          self.switchAudio("files", data);
          break;
          
        case "radio":
          self.switchAudio("mute");
          self.switchAudio("files", data);
          playlist = undefined;
          break;
            
        case "playlist":
          self.switchAudio("mute");
          self.switchAudio("files", data);
          break;
          

        case "files":

          self.switchAudio("mute");
          file = data[parseInt(Math.random() * data.length, 10)];
          playlist = data;

          timerMediaCheck = setTimeout(() => {
            console.log("MediaTimeout");
          }, timerMediaTimeout);

          playerCounter += 1;
          player = document.createElement("AUDIO");
          player._index = playerCounter;

          player.addEventListener('error',      onError);
          player.addEventListener('ended',      onEnded);
          player.addEventListener('timeupdate', onTimeupdate);
          player.addEventListener('canplay',    onCanplay);

          player.controls = true;
          player.src = file;
          player.title = file;
          document.getElementById("hidden").appendChild(player);

          function onError(e){

            if (e.target._index === playerCounter){
              if(!timerMediaCheck){
                if(player) {
                // if(player && player.src && (e.target || e.srcElement)) {
                  statusAudio = "error";
                  numErrors += 1;
                  console.warn("AP.error." + numErrors, errorMsg(e), "\n", player.src);
                }
              }
            }
          }

          function onEnded(){
            self.switchAudio("mute");
            self.switchAudio("files", data);
          }
          function onTimeupdate(e){
            if(timerMediaCheck){
              clearTimeout(timerMediaCheck);
              timerMediaCheck = null;
            } 
            // else {console.log(e);}
          }

          function onCanplay (e) {
            updateTrackInfo(player.src);
            updateContext(player);
            player.play();
            statusAudio = "playing";
          }

          break;


        default:
          console.log("AP.selectAudio.error ", source, data);
          break;
      }

    },
    activate(framePerSeconds) {
      var source;
      var option = "";
      var files = [];
      var curSettings = H.clone(DB.get("audio"));

      status.volume = curSettings.volume;

      fps = Projector.fps;

      // console.log(Loader.features)

      if(Loader.features.readlocal.available){
        $("#localfiles").css({display: 'block'});
      }

      if(Loader.features.readlocal.available){
        $("#spnPlaylist").text(Loader.playlist.length + " files loaded");
        $("#localplaylists").css({display: 'block'});
      }

      if(!Loader.features.runslocal.available){
        $("#audioselector").css({display: 'block'});
      }

      if (curSettings.source){
        $('#ap_' + curSettings.source).attr('checked', 'checked');
      } else {
        $('#audioselector input[type="radio"]').removeAttr("checked");
      }

      if (curSettings.remember) {
        $("#ap_remember").attr('checked', 'checked');
      } else {
        $("#ap_remember").removeAttr("checked");
      }

      $("#ap_volume").val(curSettings.volume);
      $("#ap_streamurl").val(curSettings.stream);
      $("#txtVolume").text(curSettings.volume +"%");

      $('#audioselector').bind({
        
        dragover(e) {
            $(".background").addClass('hover');
            return eat(e);
        },
        dragend(e) {
            $(".background").removeClass('hover');
            return eat(e);
        },
        dragleave(e) {
            $(".background").removeClass('hover');
            return eat(e);
        },
        drop(e) {
          var files;
          var file = e.dataTransfer.files[0];
          var reader = new window.FileReader();

          $(".background").removeClass('hover');
          e.preventDefault();

          reader.onloadend = function(e) {
            files = this.result.split("\n");
            console.log("AP.playlist", files.length);
          };
          reader.onerror = e => {
            console.log("AP.reader", e, file.name);
          };
          reader.readAsText(file);


          // for (i=0; i<items.length; i++) {
          //   item = items[i].webkitGetAsEntry();
          //   if (item) {
          //     traverseFileTree(files, item);
          //   }
          // }
          // self.switchAudio("files", files);
        },
        paste(e) {

        }

      });

      function processSelection(files){
        var i;
        var file;
        var len = files.length;
        var data = [];

        for (i=0; i<len; i++) {
          file = files[i];
          if (file.type.substr(0, 5) === "audio") {
            // (function(){
            //   var url = file.name;
            //   ID3.loadTags(url, function(){
            //     tags = ID3.getAllTags(url) || {};
            //     console.log(tags.artist, tags.album, tags.title);
            //     // albumcoverimg.src = 'data:' + tags.picture.format + ';base64,' + Base64.encodeBytes(tags.picture.data);
            //     }, {dataReader: new FileAPIReader(file)}
            //   );
            // })();
            data.push(window.URL.createObjectURL(file));
          }
        }

        $('#audioselector input[type="radio"]').removeAttr("checked");
        $("#txtSelected").text(data.length + " files loaded");
        if(data.length){self.switchAudio("files", data);}
      }
      // select local mp3 files
      $('#ap_choosefiles').on('click', () => {
        document.getElementById("ap_selectFiles").click();
      });
      $('#ap_choosefolders').on('click', () => {
        document.getElementById("ap_selectFolders").click();
      });
      $('#ap_selectFiles').change(function() {
        processSelection(this.files);
      });
      $('#ap_selectFolders').change(function() {
        processSelection(this.files);
      });
      $('#ap_radiourl').change(function() {
        $('#ap_radio').attr('checked', 'checked');
        AudioPlayer.switchAudio('radio', [this.value]);
      });

      // manages the radios onclick
      $('#audioselector input[type="radio"]').on("click", function(e){
        var source = this.id.substr(3);
        curSettings.source = source;
        DB.Data.audio.source = source;
        DB.save();
        if      (source === "mute")       {self.switchAudio(source);}
        else if (source === "sine")       {self.switchAudio(source, curSettings.sine);}
        else if (source === "files")      {self.switchAudio(source, curSettings.files);}
        else if (source === "playlist")   {self.switchAudio(source, Loader.playlist);}
        else if (source === "radio")      {self.switchAudio(source, [$('#ap_radiourl').val()]);}
        else if (source === "stream")     {self.switchAudio(source, [$('#ap_streamurl').val()]);}
        else {console.log("AP.activate: don't know source:", source);}
      });

      $('#ap_streamurl').keypress(e => {
        if (e.which === 13) {
          curSettings.source = "stream";
          curSettings.stream = $('#ap_streamurl').val();
          $('#ap_stream').attr('checked', 'checked');
          self.switchAudio(curSettings.source, [$('#ap_streamurl').val()]);
        }
      });

      $('#ap_remember').on("change", e => {
        var val = $('#ap_remember').attr('checked') ? true : false;
        var audio = DB.get("audio");
        audio.remember = val;
        curSettings.remember = val;
        DB.set("audio", audio);
      });

      $('#ap_volume').on("change", e => {
        var volume = parseInt($("#ap_volume").val(), 10);
        $("#txtVolume").text(volume + "%");
        status.volume = volume;
        setVolume(volume);
      });

      $('#ap_hide').on("click", e => {
        if ($('#ap_remember').attr('checked')){DB.set("audio", curSettings);}
        Projector.toggleAudio();
      });
    }

  }; // end return
}))().boot();
