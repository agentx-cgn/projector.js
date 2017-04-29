

var Hotspots = ((() => {
  var spots = [];
  return {
    deb() {
      var spot;
      var i = spots.length;
      var msgs = "\n  Hotspots (" + spots.length + ") :";
      while (i--){
         // msgs += "\n    " + JSON.stringify(spots[i]); cyclic
      }
      return msgs;
    },
    add(spot) { spots.push(spot);},
    resize(mouse) {
      var spot;
      var lefttop;
      var w;
      var h;
      for (spot in spots){
        lefttop = spot.resize();
        w = spot.x2 - spot.x1;
        h = spot.y2 - spot.y1;
        spot.x1 = lefttop[0];
        spot.x1 = lefttop[1];
        spot.x2 = spot.x1 + width;
        spot.y2 = spot.y1 + height;
        spot.hover = false;
      }
    },
    execute(mouse) {
      var spot;
      var hit = false;
      var i = spots.length;
      while (i--){
        spot = spots[i];
        if (spot.enabled){
          hit = (mouse.x > spot.x1) 
             && (mouse.x < spot.x2) 
             && (mouse.y > spot.y1) 
             && (mouse.y < spot.y2); 
          if( hit && !mouse.down && mouse.maybeClick){spot.click(mouse.event);}
          if( hit && !mouse.down && !spot.hover){spot.hover = true;  spot.enter(mouse.event);}
          if(!hit &&  spot.hover){spot.hover = false; spot.leave(mouse.event);}
        }
      }
    },
    leaveAll(event) {
      var spot;
      var i = spots.length;
      while (i--){
        spot = spots[i];
        spot.hover = false; 
        spot.leave(event);
      }
    }
  };

}))();

function Button(cfg){
  this.padding = 2;
  this.margin = 2;
  this.hotspot = {};
  this.text = "unnamed button";
  this.title = "unknown title";
  this.color = "white";
  this.font = "11px sans-serif";
  this.visible = false;
  $.extend(this, cfg);
}
Button.prototype.render
