/*jslint browser: true, evil:true, devel: true, debug: true, nomen: true, plusplus: true, sloppy: true, vars: true, white: true, indent: 2 */
/*globals Shows, EFX, $, Colors */


var Editor = (function(){

  var self,

      $txtRange,
      cvsRange,
      imgRange;

  return {
    boot: function(){
      var self = this;
      return this;
    },
    activate: function(){

      $txtRange  = $("#txtRange");
      cvsRange  = $("#cvsRange")[0];
      imgRange  = $("#imgRange")[0];

      $txtRange.val('"00000000", 16, "FFFFFFFF", 16, "00000000"' )

      $txtRange.keypress(function (e) {

        var i, r, args, range, c1, c2, w, ctx;

        function sani(params){
          var out =[];
          params = params.replace(/ /g, "");
          params = params.replace(/"/g, "");
          params = params.replace(/'/g, "");
          params = params.split(",");
          return params;
        }
        
        if (e.which === 13) {
          args  = sani($txtRange.val());
          range = Color.apply(null, args);
          cvsRange.width = range.length;
          cvsRange.style.width = range.length + "px";
          imgRange.width = range.length;
          imgRange.style.width = range.length + "px";
          ctx = cvsRange.getContext("2d");
          for (i=0; i<cvsRange.width; i++) {
            ctx.fillStyle = range[i];
            ctx.fillRect(i, 0, 1, cvsRange.height);
          }
          imgRange.src = cvsRange.toDataURL();
        }
      });



    }
  }; // return

})().boot();
