  var stage = new NGL.Stage("viewport");
  stage.setParameters({
  backgroundColor: "white"
})

// Handle window resizing
window.addEventListener( "resize", function( event ){
    stage.handleResize();
}, false );
 //try adding global variable and then assigning it to o here
  stage.loadFile("rcsb://4O5N").then(function (o) {
    o.setPosition([20, 0, 0])
    o.setRotation([ 2, 0, 0 ])
  o.addRepresentation("spacefill", {color: "#999999"}, true)
  var selectedAtom = o.addRepresentation("spacefill", {color: "#9900FF"}, false)

  o.autoView()

  // Select the site with the maximum y value by default.
  var max_y_value = d3.max(lineData, d => +d.abs_diffsel);
  var max_y_record = lineData.filter(d => +d.abs_diffsel == max_y_value);

  if (max_y_record.length > 0) {
    console.log("click site " + max_y_record[0].site);
    d3.select("#site_" + max_y_record[0].site).dispatch("click");
  }

  selectedAtom.setSelection(":A and 100")
});
