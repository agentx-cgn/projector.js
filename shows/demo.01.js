
// "media/audio/BB015-edwin_morris-the_heart_bowed_down-01-a_death_of_no_consequence.mp3",
// "media/audio/BB015-edwin_morris-the_heart_bowed_down-03-as_the_sun_sets_on_us_all.mp3",



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

    // bmp1: new Bitmap({
    //   position: Pos("center", {w: .5, h: .5, rot:0}),
    //   blendColor: "rgba(200, 0, 0, 0.5)",
    //   alpha: 0.8,
    //   src: 'germs.200.jpg',
    // }),
    // bmp2: new Bitmap({
    //   position: Pos("relative", {t:.5, l:.25, w: .125, h: 1}),
    //   blendColor: "rgba(200, 200, 0, 0.5)",
    //   alpha: 0.6,
    //   src: 'germs.200.jpg',
    // }),
    // fdb2: new Feedback({
    //   position: Pos("relative", {t: .5, l: .5, w: 1, h: 1}),
    //   blendColor: "rgba(120, 20, 0, 0.01)",
    //   transform: {offX: 0, offY: 0, zoomX: 1.02, zoomY: 1.025, rot: .5},
    // }),
    // fdb3: new Feedback({
    //   position: Pos("relative", {t: .5, l: .5, w: 1, h: 1}),
    //   blendColor: "rgba(120, 20, 0, 0.01)",
    //   transform: {offX: 0, offY: 0, zoomX: 0.94, zoomY: 1.02, rot: 0},
    // }),
    // fdbBlack: new Feedback({
    //   position: Pos("relative", {t: .5, l: .5, w: 1, h: 1}),
    //   alpha: 0.83,
    //   // blendColor: "rgba(0, 0, 0, 0.1)", // to black
    //   blendColor: "rgba(50, 36, 75, 0.1)", // to bg
    // }),
    // vid1: new Video({
    //   position: Pos("relative", {t: .5, l: .125, w: .25, h: 1}),
    //   alpha: 0.4,
    //   playbackRate: 0.2,
    //   src: 'videos/flashy',
    // }),
    // vid2: new Video({
    //   position: Pos("relative", {t: .5, l: .875, w: .25, h: 1}),
    //   alpha: 0.4,
    //   playbackRate: 0.3,
    //   src: 'videos/flashy',
    // }),

    // // cam1: new Camera({
    // //   position: Pos("relative", {t:.5, l:.5, w: .2, h: .2}),
    // //   alpha: 0.8,
    // // }),
    // scm1: new Spectrum({
    //   fillStyle:  "rgba(120, 20, 0, 0.05)",
    //   pointStyle: "rgba(220, 220, 220, 0.94)",
    //   mode: "wave", channels: "both", smoothing: 0,
    // }),
    // wrd1: new RandomWords({
    //   position: Pos("center", {w: .5, h: .5, rot: 0}),
    // }),
    // scm4: new Spectrum({
    //   dom: true,
    //   fillStyle:  "rgba(0, 0, 0, 0)",
    //   // pointStyle: "rgba(255, 255, 255, 1)",
    //   mode: "wave", channels: "both",
    // }),
    // vid4: new Video({
    //   dom: true,
    //   playbackRate: 0.1,
    //   src: 'videos/flashy'
    // }),
    // vid5: new Video({
    //   playbackRate: 1,
    //   src: 'videos/flashy'
    // }),
    // vidf: new Video({
    //   playbackRate: 0.5,
    //   src: 'videos/faces'
    // }),
    pix1: new Pixa({
      width: 128, height:128,
      // options: {filter: "invert", invertAlpha: false }
      options: {filter: "edges3",
        tUpp: 188, tLow:68,
        cUpp: [255, 100, 100, 250], cLow: [0, 0, 0, 50]}
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
  compositions: function (efx, D){return {

    'test' : [
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

    // 'pixa' : [
    //   efx.fdb0.render({a:0.985}),
    //   efx.pix1.render({a: 0.8, p: "rel", t: 0.5, l: 0.5, w: 0.4, h: 0.4},
    //     efx.vid5.render({a: 1, w: 0.9, h: 1.2})
    //   ),
    //   efx.pat1.render({a:0.975})
    // ],

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