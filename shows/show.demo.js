/*jslint browser: true, evil:true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals Shows, EFX, Color */


Shows.demo = {

  version: '0.5.0',

  config: {
    fps: 30,                  // target frames per secons
    pathMedia: "media/",      // for images and videos and playlists
    backColor: "black",       // for all compositions in this show
    showDebug: 0,             // how much debug info 0 - 3, 0 * default
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
    menu: ["normal", "normal", 0.04, "left",  "sans-serif"],
    entryR: ["normal", "bold", 0.04, "right", "sans-serif"]
  },

  colors: {
    debug:    "yellow",
    white:    "white",
    ToBlack:  "00000006",
    ToRed:    "FF000006",
    Wave:     "FFFFFFEE",
    Spectrum: "white",
    Trans:    "0000"
  },

  ranges(C) {
    return {
      'v':  Color("4008", 8, "FEEF", 120, "A008", 56, "FEEF", 8,  "0000",  8, "A00F", 56, "FEEF"),
      'v1': Color("0000", 8, "FEEF", 120, "A008", 56, "FEEF", 8,  "0000",  8, "A00F", 56, "FEEF"),
      'v2': Color("A00F", 128, "FEEF", 64, "A00F", 64, "FEEF"),
      'v3': Color("334444FF", "FF7777FF"),

      'b': Color("0000DDAA", "FFFFFFAA"),
      'r1': Color("334444FF", "FF7777FF"), // Cor Rain
      'r': Color("00FF", 256, "FF0F"), // Cor Rain
      'd': Color("222288FF", "FFFF66FF"),

      't': Color("0000", 16, "A00F", 240, "FFEF")
    };
  },

  effects(F, R, C) { return { 

// ---------------- Edit Effects below ----------------------------------------

      // generic, round mouse pointer (red/white)
      mseR: new EFX.Basic.Mouse({
        src: 'mouse-target-red-dark.png'
      }),

      // generic, crossed mouse ponter (red/white) 
      mseC: new EFX.Basic.Mouse({
        src: 'mouse-cross-red-dark.png'
      }),

      MouseRoto: new EFX.Basic.Mouse({
        src: 'mouse-roto-gre-yel.png'
      }),

      MousePink: new EFX.Basic.Mouse({
        src: 'mouse-pacman.png'
      }),

      // 2 Layers
      LayerA: new EFX.Basic.Null(), 
      LayerB: new EFX.Basic.Null(), 

      // generic
      ColorA: new EFX.Basic.Color(),
      ColorB: new EFX.Basic.Color(),

      // generic
      Rain: new EFX.Specials.Rain({
        src: "pattern/white-transparent-dot.png"
      }),

      // Background
      BackA: new EFX.Time.Blend.Color(), 
      BackB: new EFX.Time.Blend.Color(), 
      BackC: new EFX.Time.Blend.Color(), 

      //Awave rain
      TimeAlphaA: new EFX.Time.Blend.Alpha(), 
      TimeAlphaB: new EFX.Time.Blend.Alpha(), 
      TimeAlphaC: new EFX.Time.Blend.Alpha(), 

      CircleA: new EFX.Basic.Circle(),
      CircleB: new EFX.Basic.Circle(),


      FlashyA: new EFX.Basic.Video({
        playbackRate: 1.5,
        src: 'videos/flashy'
      }),

      // generic Waveform, fast and cyan?!
      WaveA: new EFX.Audio.Waveform({
        clear: true,
        signalWidth: 3,
        styleSignal: "black"
      }),

      // with key
      WaveB: new EFX.Audio.Waveform({
        signalWidth: 0,
        styleUnder: C.Trans
      }),

      // generic Spectrum, fast and cyan
      SpectrumA: new EFX.Audio.Spectrum({
        clear: true,
        signalWidth: 3,
        styleSignal: "red"
      }),

      Words: new EFX.Text.RandomWords({
        clear: true
      }),

      Delay: new EFX.Time.Delay({
        delay: 3 // seconds
      }),

      Edges: new EFX.Pixastic.Edges({
      }),

      Camera: new EFX.Basic.Camera({
        mirror: true
      }),


      // Menu
      Menu: new EFX.Text.List({
        list: [
          {id: 0, color: "white", font: F.menu, line: "Menu", click() {this.curCompo = 1;}},
          {id: 1, color: "white", font: F.menu, line: "Color Spiral", click() {this.curCompo = 2;}},
          {id: 2, color: "white", font: F.menu, line: "Dot Symphony", click() {this.curCompo = 3;}},
          {id: 3, color: "white", font: F.menu, line: "Flow of Frequences", click() {this.curCompo = 4;}},
          {id: 4, color: "white", font: F.menu, line: "Flow of Frequences II", click() {this.curCompo = 5;}},
          {id: 5, color: "white", font: F.menu, line: "Deconstruction", click() {this.curCompo = 5;}},
          {id: 6, color: "white", font: F.menu, line: "Symbol Tower", click() {this.curCompo = 5;}},
          {id: 7, color: "white", font: F.menu, line: "Jupiter's Eye", click() {this.curCompo = 5;}},
          {id: 8, color: "white", font: F.menu, line: "Random Sense", click() {this.curCompo = 5;}},
          {id: 9, color: "white", font: F.menu, line: "Time Machine", click() {this.curCompo = 5;}}
        ]
      })

// ---------------- Stop Editing Effects --------------------------------------

    };},

  compositions(E, F, R, C, D) { return {

// ---------------- Edit Compositions below -----------------------------------



    'Menu' : {author: "noiv", date: "2012-11-01", comment: "MENU Candidate", 
      graph: [

        E.LayerA.connect(
          E.BackA.connect({a: 1, sx: 0.917, sy: 0.96, dx: 5, w: 1.1, h: 1.1}),
          E.MouseRoto.connect({o: 'sov', a: D.vola(0.3, 0.9), r: D.secs(1,360)})
        ),

        E.LayerB.connect(
          E.Menu.connect({id: 0, a: 0.9, o: 'sov', l: 0.7, t: 0.18}),
          E.Menu.connect({id: 1, a: 0.9, o: 'sov', l: 0.7, t: 0.24}),
          E.Menu.connect({id: 2, a: 0.9, o: 'sov', l: 0.7, t: 0.30}),
          E.Menu.connect({id: 3, a: 0.9, o: 'sov', l: 0.7, t: 0.36}),
          E.Menu.connect({id: 4, a: 0.9, o: 'sov', l: 0.7, t: 0.42}),
          E.Menu.connect({id: 5, a: 0.9, o: 'sov', l: 0.7, t: 0.48}),
          E.Menu.connect({id: 6, a: 0.9, o: 'sov', l: 0.7, t: 0.54}),
          E.Menu.connect({id: 7, a: 0.9, o: 'sov', l: 0.7, t: 0.60}),
          E.Menu.connect({id: 8, a: 0.9, o: 'sov', l: 0.7, t: 0.66}),
          E.Menu.connect({id: 9, a: 0.9, o: 'sov', l: 0.7, t: 0.72})
        )

    ]},


    'Color Spiral' : {author: "noiv", date: "2012-11-01", comment: "Group 1", 
      graph: [

        E.LayerA.connect(
          E.BackA.connect({a: 1, sx: 0.9, sy: 0.9, dx: D.moxf(80, -80), dy: D.moyf(40, -40), w: 1.15, h: 1.15}),
          E.MouseRoto.connect({o: 'sov', a: D.vola(1, 1), r: D.secs(1,360)})
        )

    ]},


    'Dot Symphony' : {author: "noiv", date: "2012-11-01", comment: "GROUP 1", 
      graph: [

        E.BackA.connect({a: 0.84, sx: 0.96, sy: 0.96, w: 1.1, h: 1.1}),

        E.TimeAlphaA.connect({ba: 0.92, sx: 1.01, sy: 1.01, dx: D.moxf(-10, 10), dy: D.moyf(-10, 10)},
          E.Rain.connect({amount: D.volf(12), size: D.dynf(0.01, 0.08)}),
          E.ColorB.connect({"o": "sat", color: D.spcc(R.r)})
        )

    ]},


    'Flow of Frequences' : {author: "noiv", date: "2012-11-01", comment: "Group 1", 
      graph: [

          E.BackA.connect({a: 1, sx: 0.917, sy: 0.910, dx: 5, w: 1.1, h: 1.1}),

          E.LayerA.connect({w: 0.99, h: 0.96},
            E.WaveA.connect({o: "sov", a: 1, p: "rel",  l: 0.1, t: 0.5, h: 1, w: 0.25}),
            E.ColorB.connect({o: "sat", a:1, color: D.spcc(R.d)})
          ),

          E.LayerB.connect({o: 'sov'},
            E.TimeAlphaA.connect({sx: 1.01, sy: 1.01, dx: 10},
              E.MousePink.connect({o: 'sov'})
            )
          )


    ]}, 



    'Flow of Frequences II' : {author: "noiv", date: "2012-11-01", comment: "Group 2", 
      graph: [

      E.TimeAlphaB.connect({ba: 1, dx: D.moxf(2, 24), sx: 1, sy: 1},

        E.WaveA.connect({o: "lig", a: 1, p: "rel",  l: 0.1, t: 0.5, h: 1, w: 0.25}),
        E.ColorB.connect({o: "sat", a:1, color: D.spcc(R.v)})

      )


    ]},


    'Deconstruction' : {author: "noiv", date: "2012-11-01", comment: "Group 2", 
      graph: [

      E.TimeAlphaB.connect({ba: 1, dx: D.moxf(-24, -2), sx: 1, sy: 1},

        E.WaveB.connect({o: "sov", a: 1, p: "rel",  l: 0.875, t: 0.5, h: 1, w: 0.25},
          E.FlashyA.connect({a:1, w: 1, h: 1, speed: D.moyf(0, 3)})
        )

      )


    ]},


    'Symbol Tower' : {author: "noiv", date: "2012-11-01", comment: "Group 2", 
      graph: [

        E.TimeAlphaB.connect({ba: 0.99, sx: D.volf(0.98, 1.2), sy: D.spcf(1, 1.12)},
          E.FlashyA.connect({a:1, w: D.vold(0.2, 0.4), h: D.moxf(0.03, 2)})
        )

    ]},


    "Jupiter's Eye" : {author: "noiv", date: "2012-11-01", comment: "Group 2", 
      graph: [

        E.TimeAlphaB.connect({ba: 0.99, sy: D.volf(0.99, 1.1), sx: D.spcf(1, 1.1)},

          E.CircleA.connect({a:1, h: D.vold(0.2, 0.4)}),
          E.ColorA.connect({o: "sat", a:1, color: D.spcc(R.v)})

        )

    ]},


    'Random Sense' : {author: "noiv", date: "2012-11-01", comment: "Group 2", 
      graph: [

      E.TimeAlphaB.connect({ba: 0.98, sx: D.moyf(1.06, .98), sy: D.moyf(1.04, .98)},
        E.Words.connect({w:1, o: "sov", h:0.4, r: D.moxf(-180, 180), color: D.spcc(R.v)})
      )

    ]},


    'Time Machine' : {author: "noiv", date: "2012-11-01", comment: "Group 3", 
      graph: [

        E.Delay.connect({a:1, p: "ash", h:1},
          E.Camera.connect({a:1, p: "ash", h:1})
        )
        
    ]}



// ---------------- Stop Editing Compositions ---------------------------------

  };} 

};  
