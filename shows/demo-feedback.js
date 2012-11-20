

var Show = {
  name: 'demo',
  cfg: {
    fps: 30,
    pathMedia: "media/",
    // backgroundColor: "rgb(50, 36, 75)",
    backgroundColor: "black",
    // backgroundColor: "yellow",
    showDebug: true,
    showHelp: false,
    showOutline: false,
    doClear: true
  },
  fonts : {
    menu:  [18, 20, "white", "sans-serif", "left", "top"],
    debug: [12, 12, "white", "sans-serif", "left", "top"]
  },
  colors: {
    debug: "yellow"
  },
  efx: { 

    // generic, use to tets feedback
    mse0: new Mouse({
      src: 'mouse-target-red-dark.png',
      srcTrans: 'mouse-transparent.png'
    }),

    // generic, zooms into center, blends slightly to black
    fdb0: new Feedback({
      width: 1, height: 1,
      transform: {offX: 0, offY: 0, zoomX: 1.04, zoomY: 1.04, rot: 0}
    }),

    // fs, shift lefts
    fdbL: new Feedback({
      width: 1, height: 1,
      transform: {offX: -4, offY: 0, zoomX: 1.0, zoomY: 1.0, rot: 0}
    }),

    // generic Waveform, fast and white
    scm0: new Spectrum({
      pointWidth: 4,
      pointStyle: "rgba(250, 250, 250, 0.94)"
    }),

    // generic
    vid0: new Video({
      playbackRate: 1.5,
      src: 'videos/flashy'
    }),

    // generic
    rec0: new Rectangle({
    }),

    // bmp1: new Bitmap({
    //   src: 'germs.200.jpg',
    // }),

    // cam1: new Camera({
    //   alpha: 1.0,
    // }),

    // Example of using a Pixastic Filter
    pix1: new Pixa({
      width: 128, height:128,
      // options: {filter: "invert", invertAlpha: false }
      options: {filter: "edges3",
        tUpp: 188, tLow:68,
        cUpp: [255, 100, 100, 250], cLow: [0, 0, 0, 50]}
    }),
    pixW: new Pixa({
      width: 128, height:128,
      options: {filter: "edges3",
        tUpp: 188, tLow:68,
        cUpp: [255, 255, 255, 250], cLow: [0, 0, 0, 50]}
    }),
    fdb4: new Feedback({
      width: 1.0, height: 1.0,
      transform: {offX: -0, offY: 0, zoomX: 1, zoomY: 1, rot: 0}
    }),
    pat1: new Pattern({
      width: 80, height: 80,
      src: "pattern/black-transparent-stripes.png"
    })

  },

  // Δ http://www.fileformat.info/info/unicode/char/394/index.htm èÇ

  compositions: function (efx, D){return { 

    'histo' : [
      efx.fdbL.render({a: 128}),
      // efx.rec0.render(
      //   {a: 0.7, p: "rel", t: 0.5, l: 0.997, w: 0.003, h: D.ph(), c: "rgba(240,240,20,0.95)"}),
      efx.rec0.render(
        {a: 0.9, p: "rel", t: 0.5, l: 0.999, w: 0.003, h: D.vh(), c: D.vc("FF0000FF", "ffff00EE")}),
      efx.mse0.render()
    ],

    'roto' : [
      efx.fdb0.render({a: 1}),
      efx.fdb4.render({a: 0.5, p: "cnt", t: 0.5, l: 0.5, r: 20}),
      efx.pixW.render({a: 0.6, p: "rel", t: 0.5, l: 0.5, w: 0.1, h: D.ph(), c:"rgba(110,0,0,0.0)"},
        efx.vid0.render({a: D.pa(), p: "rel", t: 0.5, l: 0.5, w: 1, h: 1})
      ),
      efx.mse0.render()
    ],

    'test1' : [
      efx.fdb0.render({a: 1}),
      efx.fdb4.render({a: D.pa(), p: "cnt", t: 0.5, l: 0.5, r: 20}),
      efx.vid0.render({a: 0.6, p: "rel", t: 0.5, l: 0.5, w: 0.05, h: 1, c:"rgba(110,0,0,0.4)"}),
      efx.mse0.render()
    ],

    'stripesbox' : [
      efx.fdb0.render({a:0.985}),
      efx.vid0.render({a: 1,    p: "cnt", w: 0.4, h: 0.4}),
      efx.pat1.render({a: 1, p: "cnt", w: 0.4, h: 0.4}),
      efx.mse0.render({o: "lig"})
    ],

    'pixa' : [
      efx.fdb0.render({a:0.985}),
      efx.pix1.render({a: 0.8, p: "rel", t: 0.5, l: 0.5, w: 0.4, h: 0.4},
        efx.vid0.render({a: 1, w: 0.9, h: 1.2})
      ),
      efx.pat1.render({a:0.975})
    ],

    'ozzi' : [
      efx.fdb0.render({a:0.975}),
      efx.scm0.render({a:0.3, p: "cnt", w: 0.25, h: 1}),
      efx.mse0.render({o: "lig"})
    ],

    'flashy' : [
      efx.fdb0.render({a:0.975}),
      efx.vid0.render({a:0.2, o: "sov", p: "fil"})
    ],

    // 'faces' : [
    //   efx.fdb0.render({a:0.975}),
    //   efx.vidf.render({a:0.2, o: "sov", p: "fil"})
    // ],



      // 'rightO' : [
      //   efx.fdb4.render({alpha: 0.995, position: Pos("relative", {t: .5, l: .5, w: 1, h: 1})}),
      //   efx.scm4.render({alpha: .5,    position: Pos("relative", {t: .5, l: .75, w: .5, h: 1, rot:0})},
      //     efx.vid4.render({position: Pos("relative", {t: .5, l: .5, w: 1, h: 1})})
      //   ),
      //   efx.mse1.render(),
      // ],

      // 'ozzi' : [
      //   efx.fdb1.render(),
      //   efx.scm1.render(),
      //   efx.mse1.render(),
      // ],

      // 'video': [
      //   efx.fdb3.render(),
      //   efx.vid1.render(),
      //   efx.vid2.render(),
      //   efx.mse1.render(),
      // ],

      // 'words' : [
      //   efx.fdb2.render(),
      //   efx.wrd1.render(),
      //   efx.mse1.render(),
      // ],

      // 'test1' : [
      //   efx.bmp1.render(),
      //   efx.fdb1.render(),
      //   efx.bmp2.render(),
      //   efx.mse1.render(),
      //   // efx.cam1.render(),
      //   efx.scm1.render(),
      // ],

      // 'black': [
      //   efx.fdbBlack.render(),
      //   efx.mse1.render(),
      // ],


    }
  }

};


var Playlist = {
  // 'micro': {
  //   stream:  "micro", 
  //   link:    "",
  //   comment: "local webrtc stream, needs browser support"
  // },
  // 'deepmix': {
  //   stream:  "http://85.21.79.93:9045/;", 
  //   link:    "",
  //   comment: "24k stream"
  // },
  // 'somafm': {
  //   stream:  "http://38.104.130.91:8802/;", 
  //   link:    "",
  //   comment: "32k stream"
  // },
  'drw': {
    stream:  "http://dradio.ic.llnwd.net/stream/dradio_dwissen_s_b.ogg", 
    link:    "http://www.dradio.de/live_stream/",
    comment: "DRadio Wissen, LQ"
  },
  // 'campus': {
  //   stream:  "http://zaik-vs2.ad.uni-koeln.de:7998/;", 
  //   link:    "http://koelncampus.com/kc/page/753/livestream.html",
  //   comment: "KölnCampus, LQ 48k mono"
  // },
  // 'left': {
  //   stream:  "media/audio/left.mp3", 
  //   link:    "",
  //   comment: "test file"
  // },
  // 'right': {
  //   stream:  "media/audio/right.mp3", 
  //   link:    "",
  //   comment: "ttest file"
  // },
  // 'sweep': {
  //   stream:  "media/audio/sweep.mp3", 
  //   link:    "",
  //   comment: "test 20hz 20khz"
  // },
};
