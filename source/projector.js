/*jslint bitwise: true, browser: true, evil:true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals  Loader, H, async, createRingBuffer, requestAnimationFrame, TWEEN, AudioPlayer, Element, Mousetrap, Hotspots, DPCS, DB, EFX, TIM */

var Projector = (function(){

  var i, self, width, height, cvs, ctx, help, 

      overlay  = {ctx: null, cvs: null},

      doMaxFrames = 0,
      doRender = true, doAnimate = true, doClear = true, 
      showDebug = false, showHelp = false, showSpots = false,
      showAudio = false, showOutline = false,
      hasFocus = true, isFullScreen = false,

      showDPCS = true,

      shows = {},
      curShow,
      hasShowLoaded = false,
      compos = [], curCompo = 1, filters = [], menu = [],

      tickActions = [],

      videoextension, // ogg/mp4

      message = {
        command: null,
        parent: null,
        filters: [],
        ctx: null, 
        frame: null, 
        sector: null
      },

      test = {}, 

      // optionsRender  = {};
      // optionsCollect = {filters: []};
      // optionsLink    = {width: null, height: null};

      tim = {
        rate: 30, rends: 0, anims: 0,
        tsAnim: 0, tsRend: 0, msAnim: 0, msRend: 0,
        bfAnim: createRingBuffer(30),
        bfRend: createRingBuffer(30),
        bfFram: createRingBuffer(30)
      },

      mouse = {
        x: -1000, y: -1000,
        last: {x: -1000, y: -1000},
        down: false,
        maybeClick: false,
        button: null,
        transpic: "url(media/mouse-transparent.png), pointer",
        event: null,
        keys: {shift:false, ctrl: false, alt:false, extra: false}
      },

      padding = 16,
      colorTrans = "rgba(0, 0, 0, 0)";

      function eat(e){
        e.stopPropagation();
        e.preventDefault();
        e.returnValue = false;
        return false;
      }

      function r (n, p){var e = Math.pow(10, p || 1); return ~~(n*e)/e;}
      function error (e, device, msg ){return {event: e, device: device, message: msg};}

      function toggleHiden(){
        var ps = document.getElementById("projector").style,
            hs = document.getElementById("hidden").style;

        if (ps.display !== "none"){
          ps.display = "none";
          hs.display = "block";
        } else {
          ps.display = "block";
          hs.display = "none";
        }
      }

  return {
    init: function(){

      self = this;

      this.__defineGetter__('source',  function(){return cvs;});
      this.__defineGetter__('mouse',   function(){return mouse;});
      this.__defineGetter__('frame',   function(){return tim.rends;});
      this.__defineGetter__('fps',     function(){return tim.rate;});
      this.__defineGetter__('shows',   function(){return shows;});
      this.__defineGetter__('show',    function(){return curShow;});
      this.__defineGetter__('filters', function(){return filters;});
      this.__defineGetter__('compos',  function(){return compos;});
      this.__defineGetter__('compo',   function(){return compos[curCompo];});
      this.__defineGetter__('menu',    function(){return menu;});
      this.__defineGetter__('width',   function(){return width;});
      this.__defineGetter__('height',  function(){return height;});
      this.__defineGetter__('ctx',     function(){return ctx;});
      // this.__defineGetter__('cvs',     function(){return cvs;});
      this.__defineGetter__('videoextension', function(){return videoextension;});
      this.__defineGetter__('audioplayer',    function(){return AudioPlayer;});

      return this;

    },
    onresize: function(){

      width  = window.innerWidth;
      height = window.innerHeight;

      cvs.width        = width;
      cvs.height       = height;
      cvs.style.left   = 0;
      cvs.style.top    = 0;
      cvs.style.width  = width  + "px";
      cvs.style.height = height + "px";

      overlay.cvs.width  = width;
      overlay.cvs.height = height;
      overlay.cvs.style.backgroundColor = "black"; // colorTrans;

      if (hasShowLoaded){
        compos[curCompo].link(self);}

    },
    info: function (what) {

      var f, filt, c, comp, sum = 0;

      if (what === "filters") {
        for (f in filters){
          filt = filters[f];
          if (filt.lastRect.length) {
            console.log(filt.name, filt.type(), 
              H.roundA(filt.lastRect, 2) + "\n",
              H.roundA(filt.lastTrans, 2) + "\n",
              JSON.stringify(filt.lastOps) + "\n",
              H.roundA(filt.lastInfo, 2) + "\n"
            );
          }
        }
      } else if (what === "compos") {
        for (c in compos){
          comp = compos[c];
          sum += comp.lastDuration;
          console.log(comp.key, ~~(comp.lastDuration*10)/10 + " ms", comp.name);
        }
        console.log(~~(sum*100)/100 + " ms total");
      }

    },
    renderSpots: function (ctx) {

    },
    renderText: function (ctx, s, l, t, a, c) {

      var i = 0, lh = 12, lines = s.length;
      ctx.textAlign = a;
      ctx.fillStyle = c;
      // ctx.fillStyle = "rgba(255, 255, 0, 1)";
      // ctx.font = 'bold 12px "Courier New"';
      ctx.font = 'bold 12px monospace';
      ctx.font = 'bold 1.1em monospace';
      while (lines--){
        if (s[i]) {
          ctx.fillText(s[i], l, t); t += lh; i += 1;
        } else {i += 1;}

      }
      return t;

    },
    renderDPCS: function(ctx){
      var i,
          t = padding,
          h = 16,
          ap = AudioPlayer,
          db = ap.dynaband,
          fft = AudioPlayer.dataDPCS,
          len = fft.length,
          spec = (len*2-1)*AudioPlayer.spectrum/255,
          dyna = (h)*AudioPlayer.dynamic/255,
          volu = (h)*AudioPlayer.volume/255,
          l = width - padding - (len *2);

      // Volume vertical
      ctx.fillStyle = "rgba(0, 255, 0, 1)";
      ctx.fillRect(l-2, t+h, 3, -volu);

      // Dyna vertical
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.fillRect(l+2, t+h, 1, -dyna);

      // Spectrum, dyna marked
      for (i=0; i<len; i++){
        if (i === db){
          ctx.fillStyle = "rgba(255, 0, 0, 1)";
        } else {
          ctx.fillStyle = "rgba(255, 255, 0, 1)";
        }
        ctx.fillRect(l+5 + i*2, t+h, 1, -h*fft[i]/255);
      }

      // Spectrum horizontal
      ctx.fillStyle = "rgba(255, 255, 0, 1)";
      ctx.fillRect(l+5, t + h + 2, spec, 1);

    },
    renderDebug: function(ctx){

      var i, len, top, deb = [], track = AudioPlayer.trackInfo, fft,
          bd = AudioPlayer.BeatDetector,
          cFps, cFPSQuality, cFPSJitter;

      if (showDebug === 0){
        // do nothing at all
      } else if (showDebug === 1) {
        // do nothing ehere
      } else if (showDebug === 2) {

        cFps = 1000/tim.bfFram.avg();
        cFPSQuality = cFps/tim.rate*100;
        cFPSJitter = (tim.bfFram.max() - tim.bfFram.min())/2;

        deb.push(" ",
          "show:   " + curShow.name + "/" + menu[curCompo] + " (" + (curCompo) + "/" + compos.length + ")",
          "state:  " + (hasFocus    ?"*":"") +
                       (document.IsFullScreen() ?"f":"") +
                       (doAnimate    ?"a":"") +
                       (doRender     ?"r":"") +
                       (doClear      ?"c":"") +
                       (showDebug    ?"d":"") +
                       (showHelp     ?"h":"") +
                       "t" + tickActions.length,
          "rate:   " + tim.rate + " Q:" + r(cFPSQuality, 1) + " J:" + r(cFPSJitter, 1),
          "",
          "beat:   " + bd.win_bpm_int/10 + "/" + bd.beat_counter + 
                       " Q:" + ~~bd.quality_total + 
                       " J:" + r(bd.bpm_offset, 4)
        );

      } else if (showDebug === 3) {

        deb.push(" ",
          "show:   " + curShow.name + "/" + menu[curCompo] + " (" + (curCompo) + "/" + compos.length + ")",
          "s|m:    " + width + "/" + height + " | " + mouse.x + "/" + mouse.y + ((mouse.down)?"*":""),
          "state:  " + (hasFocus    ?"*":"") +
                       (document.IsFullScreen() ?"f":"") +
                       (doAnimate    ?"a":"") +
                       (doRender     ?"r":"") +
                       (doClear      ?"c":"") +
                       "d" + showDebug +
                       (showHelp     ?"h":"") +
                       "t" + tickActions.length,
          " ",
          "rate:   " + tim.rate,
          "frames: " + tim.anims + "/" + tim.rends,
          "fps:    " + ~~(1000/tim.bfAnim.avg()) + "/" + r(1000/tim.bfFram.avg(), 1),
          "anim:   " + H.pad(~~(tim.msAnim), 3)  + "/" + H.pad(~~(tim.bfAnim.avg()), 3),
          "rend:   " + H.pad(~~(tim.msRend), 3)  + "/" + H.pad(~~(tim.bfRend.avg()), 3),
          " ",
          "audio:  " + AudioPlayer.info,
          "beat:   " + bd.win_bpm_int/10 + "/" + bd.beat_counter + 
                       " Q:" + ~~bd.quality_total + 
                       " J:" + r(bd.bpm_offset, 4)

          // bpm = beatdetector.win_bpm_int/10;
          // bpmQuality = parseInt(beatdetector.quality_total*1000.0)/1000.0);
          // bpmJitter = parseInt(beatdetector.bpm_offset*1000000.0)/1000000.0);
          // bpmBeatCount = beatdetector.beat_counter;


        );

        if (track.length === 1) {
          deb.push(
          "track:  " + track[0]);
        } else if (track.length === 3) {
          deb.push(
          "file:   " + track[2],
          "album:  " + track[1],
          "artist: " + track[0]);
        }

      }
      top = self.renderText(ctx, deb, padding, padding, "left", curShow.colors.debug || "yellow");

      // if (showDPCS) {
      //   self.renderDPCS(ctx);
      // }
      //   deb.push("volume:", "spect:", "dyna:", "fft:");
      //   top = self.renderText(ctx, deb, padding, padding, "left", curShow.colors.debug || "yellow");
      //   ctx.fillRect(padding + 57, top-54, AudioPlayer.volume/2.55,  padding/2 -2);
      //   ctx.fillRect(padding + 57, top-42, AudioPlayer.spectrum/2.55,   padding/2 -2);
      //   ctx.fillRect(padding + 57, top-30, AudioPlayer.dynamic/2.55, padding/2 -2);
      //   fft = AudioPlayer.dataDPCS;
      //   len = fft.length;
      //   for (i=0; i<len; i++){
      //     ctx.fillRect(padding + 57, top-18 + i*2, fft[i]/2.55 + 1, 1);
      //   }
      // } else {
      // }


    },
    toggleMouse: function (what){
      // cursor: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjbQg61aAAAADUlEQVQYV2P4//8/IwAI/QL/+TZZdwAAAABJRU5ErkJggg=='),
      // url(images/blank.cur),
      // none !important;
      console.log("P.toggleMouse", what);
    },
    toggleAudio: function (){
      showAudio = !showAudio;
      if (showAudio){
        document.getElementById("audioselector").style.display = "block";
      } else {
        document.getElementById("audioselector").style.display = "none";
      }
    },



//--------------  T I C K S  --------------------------------------------------
//  
//  
// 
    addTick:  function(frame, action){
      if(frame < 1){
        action.frame = tim.rends - frame +1;
      } else {
        action.frame = frame;
      }
      tickActions.push(action);
      // console.log(frame, tim.rends, action.frame, action);
    },
    tick:  function(){

      var i, action, del = [], len = tickActions.length;

      // execute on frame
      for (i=0; i<len; i++) {
        action = tickActions[i];
        if(action.frame < tim.rends){
          action();
          del.push(i);
        }
      }

      // remove done
      len = del.length;
      for (i=0; i<len; i++) {
        tickActions.splice(del[i], 1);
      }

    },


//--------------  A C T I V A T E  --------------------------------------------
//  
//  
// 
    activate: function (){

      window.addEventListener("focus",  function(e){hasFocus = true;},  false);
      window.addEventListener("blur",   function(e){hasFocus = false;}, false);
      window.addEventListener("resize", self.onresize, false);
      self.onresize();

      // hot keys
      [[  'pageup',   function(e){tim.rate  = (tim.rate < 60) ? tim.rate +1 : 60; return eat(e); }
      ],[ 'pagedown', function(e){tim.rate  = (tim.rate >  1) ? tim.rate -1 :  1; return eat(e); }

      ],[ 'r r',      function(e){doAnimate   = !doAnimate; if (doAnimate) {self.animate();} return eat(e); }
      ],[ 'r a',      function(e){doRender    = !doRender;     return eat(e); }
      ],[ 'r c',      function(e){doClear     = !doClear;      return eat(e); }
      ],[ 'r k',      function(e){showHelp    = !showHelp;     return eat(e); }
      ],[ 'r d',      function(e){showDebug   = (showDebug < 3) ? showDebug +1 : 0;        return eat(e); }
      ],[ 'r f',      function(e){cvs.RequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);     return eat(e); }
      ],[ 'r s s',    function(e){window.open( cvs.toDataURL('image/png'), 'screenshot' ); return eat(e); }

      ],[ 'a a',      function(e){self.toggleAudio();          return eat(e); }
      ],[ 'a right',  function(e){AudioPlayer.next();          return eat(e); }
      ],[ 'a n',      function(e){AudioPlayer.next();          return eat(e); }
      ],[ 'a s',      function(e){AudioPlayer.switchAudio("mute"); return eat(e); }
      ],[ 'a 0',      function(e){AudioPlayer.switchQuality(0); return eat(e); }
      ],[ 'a 1',      function(e){AudioPlayer.switchQuality(1); return eat(e); }
      ],[ 'a 2',      function(e){AudioPlayer.switchQuality(2); return eat(e); }
      ],[ 'a 3',      function(e){AudioPlayer.switchQuality(3); return eat(e); }
      ],[ 'a 4',      function(e){AudioPlayer.switchQuality(4); return eat(e); }

      ],[ 'm d',      function(e){Projector.toggleMouse("d");  return eat(e); }
      ],[ 'm a',      function(e){Projector.toggleMouse("a");  return eat(e); }
      ],[ 'm h',      function(e){Projector.toggleMouse("h");  return eat(e); }
      ],[ 'm p',      function(e){Projector.toggleMouse("p");  return eat(e); }

      ],[ 'x f',      function(e){Projector.info("filters");   return eat(e); }
      ],[ 'x c',      function(e){Projector.info("compos");    return eat(e); }
      ],[ 'x h',      function(e){toggleHiden();               return eat(e); }
      ]
      ].forEach(function(trap){Mousetrap.bind(trap[0], trap[1]);});

      help = [
        "a: animate",
        "r: render",
        "c: clear",
        "f: fullscreen",
        "h: help",
        "d: debug",
        "o: outline"
      ];

      var mouseScroll = function(e){
        if (e.wheelDelta > 0) {
          curCompo = (curCompo === compos.length -1) ? 1 : curCompo +1;
        } else {
          curCompo = (curCompo === 1) ? compos.length -1 : curCompo -1;
        }
        return eat(e);
      };

      cvs.addEventListener('DOMMouseScroll', mouseScroll, false);
      cvs.addEventListener('mousewheel',     mouseScroll, false);
      cvs.addEventListener('dblclick',       eat, false);
      cvs.addEventListener('mousedown',     function(e){
        
        mouse.event = event;

        mouse.keys.alt   = event.altKey;
        mouse.keys.ctrl  = event.ctrlKey;
        mouse.keys.shift = event.shiftKey;
        mouse.keys.extra = event.altKey && event.ctrlKey;

        mouse.down = true;
        mouse.button = event.button;

        if(mouse.button === 0){
          mouse.maybeClick = true;
          setTimeout(function(){
            mouse.maybeClick = false;
            // console.log("onMouseDown: isNotClick");
          }, 200);
        }

      }, false);

      cvs.addEventListener('mouseup',       function(e){

        mouse.keys = {shift:false, ctrl: false, alt:false, extra: false};
        mouse.event = event;
        mouse.down = false;
        mouse.button = null;

      }, false);

      cvs.addEventListener('mousemove',     function(e){

         mouse.x = e.clientX;
         mouse.y = e.clientY;
         if (mouse.maybeClick){
           if (mouse.last.x - mouse.x > 5 || mouse.last.y - mouse.y > 5){
             mouse.maybeClick = false;
           }
         }
         mouse.last.x = mouse.x;
         mouse.last.y = mouse.y;

      }, false);

      cvs.addEventListener('mouseout',     function(e){
         mouse.x = -1000;
         mouse.y = -1000;
         Hotspots.leaveAll(e);
      }, false);

    },



//--------------  L O A D E R  ------------------------------------------------
//  
//  
// 
    load: function(){

      videoextension =
        (navigator.sayswho[0].toLowerCase() === "chrome")  ? ".mp4" :
        (navigator.sayswho[0].toLowerCase() === "firefox") ? ".ogg" : ".mp4";

      cvs = document.getElementById("projector");
      ctx = cvs.getContext("2d");
      ctx._name = "projector";
      cvs._name = "projector";

      overlay.cvs = document.createElement("CANVAS");
      overlay.ctx = overlay.cvs.getContext("2d");
      overlay.cvs._name = "overlay";
      overlay.ctx._name = "overlay";

      test.source = document.getElementById("test");
      test.source._name = "test";
      test.source.title = "test";
      test.ctx = test.source.getContext("2d");
      test.ctx._name = "test";

      // document.getElementById("hidden").appendChild(overlay.cvs);
      // overlay.cvs.style.width = "256px";
      // overlay.cvs.style.height = "256px";

      cvs.RequestFullScreen =
        cvs.RequestFullScreen ||
        cvs.webkitRequestFullScreen ||
        cvs.mozRequestFullScreen ||
        cvs.oRequestFullScreen;
      
    },

    initShows: function(onloaded){

      var ns, nc, nf, org, tgt, akku = [];

      // param ?????????

      shows = {};

      for (ns in window.Shows){
        
        org = window.Shows[ns];
        
        tgt = {
          name:     ns,
          version:  org.version,
          config:   org.config,
          colors:   org.colors, 
          fonts:    org.fonts
        };

        for (nf in tgt.fonts){
          tgt.fonts[nf].name = nf;}
        
        for (nc in tgt.colors){
          tgt.colors[nc].name = nc;}

        try {

          tgt.effects = org.effects(tgt.fonts, tgt.colors); } 

        catch(er1){onloaded({event: er1, device: "show: " + ns, message: "Can't load effects<br />" + er1});}
  
        try {

          tgt.compositions = org.compositions(tgt.effects, tgt.fonts, tgt.colors, DPCS);} 

        catch(er2){onloaded({event: er2, device: "show: " + ns, message: "Can't load compositions<br />" + er2});}


        shows[ns] = tgt;
        akku.push(ns);

      }

      TIM.step(" OK Shows", akku.join(", "));
      onloaded();

    },
    loadShow: function(show, onloaded){

      var i=0, j, name, compo, filter, tasks, key;

      show = shows[show] || show;

      if (!show) {
        console.error("PR.loadShow: Can't find", show , "i", shows);}

      //clear old stuff
      menu    = ["menu"]; 
      filters = []; 
      compos  = []; 

      curShow = show;

      // show config
      cvs.style.background = show.config.backColor || "black";
      tim.rate    = show.config.fps          || tim.rate || 30;
      showDebug   = show.config.showDebug    || true;
      showHelp    = show.config.showHelp     || false;

      AudioPlayer.quality = show.config.AAQ || DB.get("audio").AAQ;

      // clear mouse binding from last show
      for (i=0; i<10; i++) {
        key = String(i);
        Mousetrap.unbind(key);
        Mousetrap.unbind("ctrl" + key);
      }

      // menu
      // Mousetrap.bind("0", (function(){
      //   return function(e){curCompo = 0; return eat(e);};
      // })());

      // TODO: Blend to background color
      // Mousetrap.bind("backspace", (function(){
      //   return function(e){curCompo = 10; return eat(e);};
      // })());

      i = 1;

      // register compos
      for (name in show.compositions){

        key = String(i);

        menu.push(name);
        compo = show.compositions[name];
        compo.name = name;
        compo.key = key;
        compos[i] = compo;
        
        Mousetrap.bind(key, (function(){
          var cmp = i, n = name;
          return function(e){
            curCompo = cmp; 
            // console.log(cmp, n);
            return eat(e);
          };
        })());
        
        Mousetrap.bind("ctrl+" + key, (function(){
          var next = 1;
          return function(e){
            var last = curCompo;
            self.addTick(  0, function(){curCompo = next;});
            self.addTick( -5, function(){curCompo = last;});
            return eat(e);
          };
        })());

        i += 1;

      }

      // name filters for errors reports and adjust media path for filter with src''
      for (name in show.effects){
        filter = show.effects[name];
        filter.name = name;
        if(filter.src){
          filter.src = show.config.pathMedia + filter.src;}
        filters.push(filter);
      }

      // prepare async loading of media and filters
      tasks = filters.map(function(filter){
        return function(onready){
          filter.init(self, function(err){
            filter.source._name = filter.name;
            filter.ctx._name = filter.name;
            onready(err);
          });
        };
      });

      async.series(tasks, function(err, res){ 
        if(err){self.onerror(err);} else {
          self.initGraph();
          hasShowLoaded = true;
          TIM.step(" OK Show." + show.name, 
            filters.length + " filters, " + 
            compos.length  + " compos"
          );
          onloaded();
        }
      });

      document.getElementsByTagName("TITLE")[0].innerHTML = "pjs:" + curShow.name;

    },
    initGraph: function (){

      var i, compo;
      
      for (i in compos) {

        compo = compos[i];
        
        compo.filters = (function(){
          message.command = "collect";
          message.filters = [];
          compo.graph.forEach(function(child){
            child(message);
          });
          return message.filters.slice(0);
        })();    

        compo.tick = (function(){
          var tickers = [];
          compo.filters.forEach(function(filter){
            if (typeof filter.tick === "function"){
              tickers.push(filter);
            }
          });
          return function(){
            tickers.forEach(function(filter){
              filter.tick();
            });
          };
        })();


        compo.link = (function(){
          var cmp = compo;
          return function(parent){
            message.command = "link";
            cmp.graph.forEach(function(item){
              message.parent = parent;
              item(message);
            });
          };
        })(); 

        compo.render = (function(){
          var cmp = compo;
          return function(ctx){
            var item, t0 = window.performance.now();
            message.command = "render";
            message.frame = tim.rends;
            for (item in cmp.graph){
              message.ctx = ctx;
              cmp.graph[item](message);
            }
            cmp.lastDuration = window.performance.now() - t0;
          };
        })();

        compo.link(test);
        compo.render(test.ctx);
        compo.render(test.ctx);
        compo.link(self);

        console.log(compo.name, Math.round(compo.lastDuration), "ms");

      }
    },

//--------------  A N I M A T E -----------------------------------------------
//  
//  
// 
    animate: function(stamp){

      var ts0 = window.performance.now();

      tim.msAnim = ts0 - tim.tsAnim;
      tim.tsAnim = ts0;
      tim.bfAnim.push(tim.msAnim);
      tim.anims += 1;

      if(doMaxFrames && tim.rends === doMaxFrames){
        TIM.step("Stopped", tim.rends);
        return;}

      if (doAnimate) {
        window.requestAnimationFrame(self.animate);}

      // IFC
      Hotspots.execute(mouse);
      if(!mouse.down && mouse.maybeClick){
        mouse.maybeClick = false;}


      if (ts0 >= (tim.tsRend + 1000 / tim.rate) - tim.msRend) {

        tim.bfFram.push(ts0 - tim.tsRend);
        tim.tsRend = ts0;

        self.tick();
        DPCS.tick(tim.rends, tim.rate, mouse.x/width, mouse.x/height);
        AudioPlayer.tick();
        AudioPlayer.tickBeat();
        compos.forEach(function(cmp){cmp.tick();});
        TWEEN.update();

        if (doClear) {
          ctx.clearRect(0, 0, width, height);}

        if (doRender) {
          compos[curCompo].render(ctx);
          compos[curCompo].filters.forEach(function(f){
            f.afterRender();});} 

        if (showDebug || showHelp || showSpots || showDPCS) {

          overlay.ctx.clearRect(0, 0, width, height);

          if (showDPCS) {
            self.renderDPCS(overlay.ctx);}
            
          if (showDebug) {
            self.renderDebug(overlay.ctx);}
            
          if (showSpots) {
            self.renderSpots(overlay.ctx);}
            
          if (showHelp) {
            self.renderText(overlay.ctx, help, padding, height-padding-help.length*12, "left", "yellow");}

          // TODO: Tween me
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = "source-over";
          ctx.drawImage(overlay.cvs, 0, 0, width, height);

        }

        tim.msRend = window.performance.now() - ts0;
        tim.bfRend.push(tim.msRend);
        tim.rends += 1;

      }

    }

  }; // end return

})().init();

