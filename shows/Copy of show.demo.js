/*jslint browser: true, evil:true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals Shows, EFX */


Shows.Demo = {

  version: '0.9',

  config: {
    fps: 30,                  // target frames per secons
    pathMedia: "media/",      // for images and videos and playlists
    backgroundColor: "black", // for all compositions
    showDebug: 2,             // how much debug info 0 - 3, 0 * default
    doClear: true             //
  },

  fonts : {

    // http://www.wpdfd.com/issues/87/knowing_about_web_safe_fonts/
    // http://tutorials.jenkov.com/html5-canvas/text.html

    //     ["style", "weight", size, font-family, "align", "vertical"]

    h1:    ["normal", "bold", 72, "sans-serif",  "left", "top"],
    h2:    ["normal", "bold", 48, "sans-serif",  "left", "top"],
    h3:    ["normal", "bold", 36, "sans-serif",  "left", "top"],
    h4:    ["normal", "bold", 24, "sans-serif",  "left", "top"],
    h5:    ["normal", "bold", 18, "sans-serif",  "left", "top"],
    h6:    ["normal", "bold", 16, "sans-serif",  "left", "top"],
    text:  ["normal", "bold", 14, "sans-serif",  "left", "top"], // * default
    fix:   ["normal", "bold", 14, "'Courier New'", "left", "top"],
    debug: ["normal", "bold", 12, "sans-serif",  "left", "top"]
  },

  colors: {
    debug: "yellow",
    white: "white", // * default
  },

  effects: function(F, C){ return { 

    // remember: any Video or Camera defined here is constantly  
    // playing or recording during a show - whether visible or not. 
    // Mind the consumed CPU and GPU resources.

    // generic, use to tets feedback
    mse0: new EFX.Basic.Mouse({
      src: 'mouse-target-red-dark.png',
      srcTrans: 'mouse-transparent.png'
    }),

    // generic, zooms into center, blends slightly to black
    fdb0: new EFX.Time.Blend({
      width: 1, height: 1,
      transform: {offX: 0, offY: 0, zoomX: 1.04, zoomY: 1.04, rot: 0}
    }),

    // fs, shifts left
    fdbL: new EFX.Time.Blend({
      width: 1, height: 1,
      transform: {offX: -4, offY: 0, zoomX: 1.0, zoomY: 1.0, rot: 0}
    }),

    // generic Waveform, fast and white
    scm0: new EFX.Audio.Waveform({
      pointWidth: 4,
      pointStyle: "rgba(250, 250, 250, 0.94)"
    }),

    // generic
    vid0: new EFX.Basic.Video({
      playbackRate: 1.5,
      src: 'videos/flashy'
    }),

    // generic
    rec0: new EFX.Basic.Rectangle({
    }),

    bmpC: new EFX.Basic.Bitmap({
      width: 64, height: 64,
      src: 'pattern/black-transparent-circle.png'
    }),

    // cam1: new EFX.Basic.Camera({
    //   alpha: 1.0,
    // }),

    // Example of using a Pixastic Filter
    pix1: new EFX.Basic.Pixa({
      width: 128, height:128,
      // options: {filter: "invert", invertAlpha: false }
      options: {filter: "edges3",
        tUpp: 188, tLow:68,
        cUpp: [255, 100, 100, 250], cLow: [0, 0, 0, 50]}
    }),
    pixW: new EFX.Basic.Pixa({
      width: 128, height:128,
      options: {filter: "edges3",
        tUpp: 188, tLow:68,
        cUpp: [255, 255, 255, 250], cLow: [0, 0, 0, 50]}
    }),
    fdb4: new EFX.Time.Blend({
      width: 0.5, height: 0.5,
      transform: {offX: 0, offY: 0, zoomX: 1, zoomY: 1, rot: 20}
    }),
    pat1: new EFX.Basic.Pattern({
      width: 80, height: 80,
      src: "pattern/black-transparent-stripes.png"
    }),
    dyl0: new EFX.Text.DynaLine({
      color: "rgba(250, 250, 250, 1)",
      text: "HUHU"
    })

  };},

/*------------------------ C O M P O S I T I O N S ----------------------------

compositions: this returns and defines the filter graphs of the listed compositions.
  Only the first 9 compos are available as show. E, F, C links to the above declared 
  Effects, Fonts and Colors. D is the DPCS module.

Each render function may have one parameter object (PO) and any amount of child renderers.

A PO contains two sets of attribute, each of them overwrites a default value, 
so they are not strictly needed: 

  a, o, l, t, w, h, r, c : are render attributes (RA) and define how and where 
    the effects get rendered. The one letter code makes them compact.
  All other are treated as filter attribute (FA), check the filters to find out 
    what is accepted
  Any unknown attribute leads to an error!

  The RA defaults:
    a: 0.9,    
    o: "sov",  
    p: "rel",  
    l: 0.5,    
    t: 0.5,    
    w: 0.8,    
    h: 0.8     
    r: 0.0,    
    c: "",    
  
  a: alpha channel (0, transparent -> 1, opaque) 0.9 = default

  o: composite operation, decribes how the effect is combined at byte level
      with his parent effect, see HTML5 Canvas documentation
    "cop" = "copy",
    "xor" = "xor",
    "lig" = "lighter",
    "sov" = "source-over", * default
    "sin" = "source-in",
    "sou" = "source-out",
    "sat" = "source-atop",
    "dov" = "destination-over",
    "din" = "destination-in",
    "dou" = "destination-out",
    "dat" = "destination-atop"

  p: position, 
     works together with l, t, w, t as a shortcut to common settings
    'rel' relative, * default
    'cnt' center (sets w and h to .5)
    'fil' fill   (sets w, h to 1.0, t, l to 0.0)
    some filter overwrite this, e.g. Mouse
    more to come ... (overscan, underscan, etc)

  l: left,   (0 -> 1, "number"), defines the *center* of a effect,
  t: top ,   (0 -> 1, "number"), defines the *center* of a effect,
  w: width,  (0 -> 1, "number")
  h: height, (0 -> 1, "number")
    can be defined in absolute pixels as string e.g. "170" or 
    relative to window dimensions as float e.g. 0.5 = half
    relative arguments play nice on different screens and and can be dynamic
    absolute pixels give you full placement control without any dynamic and
    may get hidden if used unchanged as child of a smaller parent.

  r: rotate (0.0 -> 360.0) clockwise, 0, default

  c: colorize, string, as PJS color format:
        "red", names defined in XXXXX
        "rgba( red, green, blue, alpha)", 
            with r, g, b as integer with range (0-255) and 
            alpha as float 0.0 - 1.0
        "FFDDBB99", hex for r, g, b, a
        "#3377bb", web hex for r, g, b, alpha = 1.0
        "": no colorize, * default 

*/
  compositions: function (E, F, C, D){return { 

    'DPCS Test' : {author: "noiv", date: "2012-11-01", comment: "", tree: [
      // E.fdb0.render({a: 1}),
      E.dyl0.render({text: "volume",   p: "rel", l:0.1, t:0.55, w: "256", h: "32"}),
      E.dyl0.render({text: "richness", p: "rel", l:0.2, t:0.55, w: "256", h: "32"}),
      E.dyl0.render({text: "dynamic",  p: "rel", l:0.3, t:0.55, w: "256", h: "32"}),
      E.dyl0.render({text: "beat",     p: "rel", l:0.4, t:0.55, w: "256", h: "32"}),
      E.dyl0.render({text: "sin 1hz",  p: "rel", l:0.5, t:0.55, w: "256", h: "32"}),
      E.dyl0.render({text: "cos 1hz",  p: "rel", l:0.6, t:0.55, w: "256", h: "32"}),
      E.rec0.render(
        {a: 1,   p: "rel", t: D.sh(0.5, 0.3), l: 0.6, w: 0.05, h: D.sh(0, 0.4), c: "#AAA"}),
      E.rec0.render(
        {a: 1,   p: "rel", t: D.bh(0.5, 0.3), l: 0.5, w: 0.05, h: D.bh(0, 0.4), c: D.bc("d3172588", "f3cf4eFF")}),
      E.mse0.render()
    ]},

    'roto blue yellow'  : {author: "tbc", date: "2012-11-01", comment: "", tree: [
      E.fdb0.render({a: 1}),
      E.fdb4.render(
        {a: 0.6, p: "rel", t: 0.5, l: 0.5, w: 0.5, h: 0.5, r: 0}),
      E.rec0.render(
        {a: 1,   p: "rel", t: 0.5, l: 0.5, w: D.vw(0.0001, 0.1), h: D.dh(), c: D.pc("00004444", "FFFF00FF")}),
      E.bmpC.render(
        {a: 0.9, p: "cnt", t: 0.5, l: 0.5, w: D.vw(0.001,  0.16), h: D.pw(0.6, 0.1) }),
      E.mse0.render()
    ]},

    'histo'             : {author: "tbc", date: "2012-11-01", comment: "", tree: [
      E.fdbL.render({a: 0.8}),
      // E.rec0.render(
      //   {a: 0.7, p: "rel", t: 0.5, l: 0.997, w: 0.003, h: D.ph(), c: "rgba(240,240,20,0.95)"}),
      E.rec0.render(
        {a: 0.9, p: "rel", t: 0.5, l: 0.999, w: 0.003, h: D.vh(), c: D.vc("FF0000FF", "ffff00EE")}),
      E.mse0.render()
    ]},

    'roto1'             : {author: "tbc", date: "2012-11-01", comment: "", tree: [
      E.fdb0.render({a: 1}),
      E.fdb4.render({a: 0.5, p: "cnt", t: 0.5, l: 0.5, r: 20}),
      E.pixW.render({a: 0.6, p: "rel", t: 0.5, l: 0.5, w: 0.1, h: D.ph(), c:"rgba(110,0,0,0.0)"},
        E.vid0.render({a: D.pa(), p: "rel", t: 0.5, l: 0.5, w: 1, h: 1})
      ),
      E.mse0.render()
    ]},

    'test1'             : {author: "tbc", date: "2012-11-01", comment: "", tree: [
      E.fdb0.render({a: 1}),
      E.fdb4.render({a: D.pa(), p: "cnt", t: 0.5, l: 0.5, r: 20}),
      E.vid0.render({a: 0.6, p: "rel", t: 0.5, l: 0.5, w: 0.05, h: 1, c:"rgba(110,0,0,0.4)"}),
      E.mse0.render()
    ]},

    'stripesbox'        : {author: "tbc", date: "2012-11-01", comment: "", tree: [
      E.fdb0.render({a:0.985}),
      E.vid0.render({a: 1,    p: "cnt", w: 0.4, h: 0.4}),
      E.pat1.render({a: 1, p: "cnt", w: 0.4, h: 0.4}),
      E.mse0.render({o: "lig"})
    ]},

    'pixa'              : {author: "tbc", date: "2012-11-01", comment: "", tree: [
      E.fdb0.render({a:0.985}),
      E.pix1.render({a: 0.8, p: "rel", t: 0.5, l: 0.5, w: 0.4, h: 0.4},
        E.vid0.render({a: 1, w: 0.9, h: 1.2})
      ),
      E.pat1.render({a:0.975})
    ]},

    'ozzi'              : {author: "tbc", date: "2012-11-01", comment: "", tree: [
      E.fdb0.render({a:0.975}),
      E.scm0.render({a:0.3, p: "cnt", w: 0.25, h: 1}),
      E.mse0.render({o: "lig"})
    ]},

    'flashy'            : {author: "tbc", date: "2012-11-01", comment: "", tree: [
      E.fdb0.render({a:0.975}),
      E.vid0.render({a:0.2, o: "sov", p: "fil"})
    ]}

    // 'faces'          : {author: "tbc", date: "2012-11-01", comment: "", tree: [
    //   E.fdb0.render({a:0.975}),
    //   E.vidf.render({a:0.2, o: "sov", p: "fil"})
    // ]},



      // 'rightO'       : {author: "tbc", date: "2012-11-01", comment: "", tree: [
      //   E.fdb4.render({alpha: 0.995, position: Pos("relative", {t: .5, l: .5, w: 1, h: 1})}),
      //   E.scm4.render({alpha: .5,    position: Pos("relative", {t: .5, l: .75, w: .5, h: 1, rot:0})},
      //     E.vid4.render({position: Pos("relative", {t: .5, l: .5, w: 1, h: 1})})
      //   ),
      //   E.mse1.render(),
      // ]},

      // 'ozzi'         : {author: "tbc", date: "2012-11-01", comment: "", tree: [
      //   E.fdb1.render(),
      //   E.scm1.render(),
      //   E.mse1.render(),
      // ]},

      // 'video'        : {author: "tbc", date: "2012-11-01", comment: "", tree: [
      //   E.fdb3.render(),
      //   E.vid1.render(),
      //   E.vid2.render(),
      //   E.mse1.render(),
      // ]},

      // 'words'        : {author: "tbc", date: "2012-11-01", comment: "", tree: [
      //   E.fdb2.render(),
      //   E.wrd1.render(),
      //   E.mse1.render(),
      // ]},

      // 'test1'        : {author: "tbc", date: "2012-11-01", comment: "", tree: [
      //   E.bmp1.render(),
      //   E.fdb1.render(),
      //   E.bmp2.render(),
      //   E.mse1.render(),
      //   // E.cam1.render(),
      //   E.scm1.render(),
      // ]},

      // 'black'        : {author: "tbc", date: "2012-11-01", comment: "", tree: [
      //   E.fdbBlack.render(),
      //   E.mse1.render(),
      // ]},


    };
  }

};


