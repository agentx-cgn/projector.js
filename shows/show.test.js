/*jslint browser: true, evil:true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals Shows, EFX */


Shows.test = {

  version: '0.9',

  config: {
    fps: 30,                  // target frames per secons
    pathMedia: "media/",      // for images and videos and playlists
    backColor: "black",       // for all compositions in this show
    showDebug: 3,             // how much debug info 0 - 3, 0 * default
    doClear: true,            // tells Projector to clean up after each frame
    AAQ: 2                    // Audio Analysis Quality 
                              // (0: disabled, 1: low, 2: good, 3: demanding / default=2 )
  },

  fonts : {
    //     ["style", "weight", size, "align", "font-family"]
    h1:    ["normal", "bold", 72, "left", "sans-serif" ],
    h2:    ["normal", "bold", 48, "left", "sans-serif" ],
    h3:    ["normal", "bold", 36, "left", "sans-serif" ],
    h4:    ["normal", "bold", 24, "left", "sans-serif" ],
    h5:    ["normal", "bold", 18, "left", "sans-serif" ],
    h6:    ["normal", "bold", 16, "left", "sans-serif" ],
    text:  ["normal", "bold", 14, "left", "sans-serif" ], // * default
    fix:   ["normal", "bold", 14, "left", "'Courier New'" ],
    debug: ["normal", "bold", 12, "left", "sans-serif" ],
    entryL: ["normal", "bold", 0.05, "left",  "sans-serif"],
    entryR: ["normal", "bold", 0.04, "right", "sans-serif"]
  },

  colors: {
    debug:    "yellow",
    white:    "white",
    ToBlack:  "00000006",
    ToRed:    "FF000006",
    Wave:     "FFFFFFEE",
    Spectrum: "white"
  },

  effects: function (F, C) { return { 

// ---------------- Edit Effects below ----------------------------------------

      // generic, round mouse pointer (red/white)
      mseR: new EFX.Basic.Mouse({
        src: 'mouse-target-red-dark.png'
      }),

      // generic, crossed mouse ponter (red/white)
      mseC: new EFX.Basic.Mouse({
        src: 'mouse-cross-red-dark.png'
      }),

      // 2 Layers
      lay0: new EFX.Basic.Null(), 
      lay1: new EFX.Basic.Null(), 
      layA: new EFX.Basic.Null(), 
      layB: new EFX.Basic.Null(), 

      // generic
      rec0: new EFX.Basic.Rectangle(),

      // generic
      rain: new EFX.Specials.Rain({
        src: "pattern/white-transparent-dot.png"
      }),

      // BG for al compos
      tbl0: new EFX.Time.Blend.Color(), 
      tblA: new EFX.Time.Blend.Alpha(), 
      tblB: new EFX.Time.Blend.Alpha(), 
      tblM: new EFX.Time.Blend.Color(), 

      // generic, no zoom
      tblN: new EFX.Time.Blend.Color({
        width: 1, height: 1,
        transform: {dx: 0, dy: 0, sx: 1, sy: 1, rot: 0}
      }), 

      // generic, zoom .04
      tbl1: new EFX.Time.Blend.Color({
        width: 1, height: 1,
        transform: {dx: 0, dy: 0, sx: 1.02, sy: 1.02, rot: 0}
      }), 

      // half height
      tblH2: new EFX.Time.Blend.Color({
        width: 1, height: 0.5,
        transform: {dx: 3, dy: 0, sx: 1, sy: 1, rot: 0}
      }), 

      // half width, zoom .04
      tblH: new EFX.Time.Blend.Color({
        width: 0.5, height: 1,
        transform: {dx: 0, dy: 0, sx: 1.04, sy: 1.04, rot: 0}
      }),

      // generic Waveform, fast and cyan?!
      wav0: new EFX.Audio.Waveform({
        dom: true,
        signalWidth: 3,
        styleSignal: "white"
      }),

      // generic Spectrum, fast and cyan
      spc0: new EFX.Audio.Spectrum({
        // dom: true,
        signalWidth: 3,
        // styleUnder:  "#888888",
        styleSignal: "red"
      }),


      // Menu
      txlM: new EFX.Text.List({
        list: [
          {id: 0, color: "white", font: F.entryL, line: "Intro", click: function(){this.curCompo = 1;}},
          {id: 1, color: "white", font: F.entryL, line: "Random Words", click: function(){this.curCompo = 2;}},
          {id: 2, color: "white", font: F.entryL, line: "Video", click: function(){this.curCompo = 3;}},
          {id: 3, color: "white", font: F.entryL, line: "Camera", click: function(){this.curCompo = 4;}},
          {id: 4, color: "white", font: F.entryL, line: "Wormhole", click: function(){this.curCompo = 5;}}
        ]
      }),

      // DPCS
      txlD: new EFX.Text.List({
        list: [
          {id: 0, color: "white", font: F.entryR, line: "Volume"},
          {id: 1, color: "white", font: F.entryR, line: "Dynamic"},
          {id: 2, color: "white", font: F.entryR, line: "Spectrum"},
          {id: 3, color: "white", font: F.entryR, line: "Sinus"},
          {id: 4, color: "white", font: F.entryR, line: "Cosinus"},
          {id: 5, color: "white", font: F.entryR, line: "Beat"},
          {id: 6, color: "white", font: F.entryR, line: "Waveform"},
          {id: 7, color: "white", font: F.entryR, line: "Spectrum"}
        ]
      })

// ---------------- Stop Editing Effects --------------------------------------

    };},

  compositions: function (E, F, C, D) { return { 

// ---------------- Edit Compositions below -----------------------------------

    // 'Wave' : {author: "noiv", date: "2012-11-01", comment: "", 
    //   graph: [

    //       E.wav0.connect({a: 1, p: "rel",  l: 0.5, t: 0.5, h: 1, w: 0.125}),

    // ]},

    'Rain' : {author: "noiv", date: "2012-11-01", comment: "", 
      graph: [

          E.tblM.connect({a: 0.84, sx: 0.96, sy: 0.96, w: 1.1, h: 1.1}),

          E.tblB.connect({sx: 1.04, sy: 1.04, dx: 10},
            E.rain.connect(
              {in: D.volf(14), is: D.dynf(0.02, 0.1), bc: D.spcc("FF000060", "FFFF00FF")})
          ),

          E.mseC.connect({o: 'lig'})

    ]},

    'Wave' : {author: "noiv", date: "2012-11-01", comment: "", 
      graph: [

          E.tblM.connect({a: 1, sx: 0.94, sy: 0.92, dx: 5, w: 1.1, h: 1.1}),
          E.wav0.connect({a: 1, p: "rel",  l: 0.5, t: 0.5, h: 1, w: 0.25}),
          E.mseC.connect({o: 'lig'})

    ]}

    // 'Test Single' : {author: "noiv", date: "2012-11-01", comment: "", 
    //   graph: [

    //       // E.tbl0.connect({sx: D.volf(1.0, 1.1), sy: 1.04, a: 0.97, c: C.ToBlack}),
    //       E.tbl0.connect({sx: 1.04, sy: 1.04, a: 0.97, c: C.ToBlack}),
    //       E.txlD.connect({id: 0, a: 0.9, o: 'sov', l: 0.5, t: 0.2}),
    //       E.mseC.connect({o: 'lig'})

    // ]},

    // 'Test Double' : {author: "noiv", date: "2012-11-01", comment: "", 
    //   graph: [

    //       E.tbl0.connect({sx: 0.96, sy: 0.96, a: 0.97, c: C.ToBlack}),
    //       E.txlD.connect({id: 1, a: 0.9, o: 'sov', l: 0.7, t: 0.2}),
    //       E.mseR.connect({o: 'lig'})

    // ]},

    // 'Test Dynamics' : {author: "noiv", date: "2012-11-01", comment: "", 
    //   graph: [

    //     E.tbl0.connect({a: 0.99, c: C.ToBlack, w: 1, h: 1}),
    //     // E.tblN.connect({a: 0.8, c: C.ToBlack}),

    //     E.rec0.connect(
    //       {a: .9, p: "rel", l: D.vold(0.72, 0.82), t: 0.2,  h: 0.03, w: D.vold(0, 0.2), c: "#AAAAAA"}),
    //     E.rec0.connect(
    //       {a: .9, p: "rel", l: D.dynd(0.72, 0.82), t: 0.25, h: 0.03, w: D.dynd(0, 0.2), c: "#d31725"}),
    //     E.rec0.connect(
    //       {a: .9, p: "rel", l: D.spcd(0.72, 0.82), t: 0.3,  h: 0.03, w: D.spcd(0, 0.2), c: "#987654"}),
    //     E.rec0.connect(
    //       {a: .9, p: "rel", l: D.sind(0.72, 0.82), t: 0.35, h: 0.03, w: D.sind(0, 0.2), c: "#a98765"}),
    //     E.rec0.connect(
    //       {a: .9, p: "rel", l: D.cosd(0.72, 0.82), t: 0.4,  h: 0.03, w: D.cosd(0, 0.2), c: "#ba9876"}),
    //     E.rec0.connect(
    //       {a: .9, p: "rel", l: D.bdtd(0.72, 0.82), t: 0.45, h: 0.03, w: D.bdtd(0, 0.2), c: "#cba987"}),

    //     E.tblH2.connect({a: 0.8,  p: "rel",  l: 0.5, t: 0.75, h: 0.5, w: 1},
    //       E.wav0.connect({a: 1, p: "rel",  l: 0.5, t: 0.5, h: 0.9, w: 0.125}),
    //       E.spc0.connect({a: 1, p: "rel",  l: 0.8, t: 0.5, h: 0.9, w: 0.125})
    //     ),

    //     E.txlD.connect({id: 0, a: 0.9, o: 'sov', l: 0.7, t: 0.2}),
    //     E.txlD.connect({id: 1, a: 0.9, o: 'sov', l: 0.7, t: 0.25}),
    //     E.txlD.connect({id: 2, a: 0.9, o: 'sov', l: 0.7, t: 0.3}),
    //     E.txlD.connect({id: 3, a: 0.9, o: 'sov', l: 0.7, t: 0.35}),
    //     E.txlD.connect({id: 4, a: 0.9, o: 'sov', l: 0.7, t: 0.4}),
    //     E.txlD.connect({id: 5, a: 0.9, o: 'sov', l: 0.7, t: 0.45}),

    //     E.mseR.connect({o: 'lig'})
    // ]},

    // 'MustWork' : {author: "noiv", date: "2012-11-01", comment: "", 
    //   graph: [
    //     E.tbl0.connect({a:0.98}),
    //     E.mseC.connect()
    // ]}



// ---------------- Stop Editing Compositions ---------------------------------

  };} 

};  
