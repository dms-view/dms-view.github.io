document.addEventListener("DOMContentLoaded", function () {
  var stage = new NGL.Stage("viewport");
  stage.setParameters({
  backgroundColor: "white"
})

// Handle window resizing
window.addEventListener( "resize", function( event ){
    stage.handleResize();
}, false );

  stage.loadFile("rcsb://4O5N").then(function (o) {
    o.setPosition([20, 0, 0])
    o.setRotation([ 2, 0, 0 ])
  o.addRepresentation("spacefill", {color: "#999999"}, true)
  var selectedAtom = o.addRepresentation("spacefill", {color: "#9900FF"}, false)

  o.autoView()

  selectedAtom.setSelection(":A and 100")
})
});
