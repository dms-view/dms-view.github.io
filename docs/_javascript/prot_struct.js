// Code for example: interactive/simple-viewer
var protein;
var greyColor = "#999999";

// Create NGL Stage object
var stage = new NGL.Stage("protein");
stage.setParameters({
  backgroundColor: "white"
});

// Handle window resizing
window.addEventListener( "resize", function( event ){
    stage.handleResize();
}, false );

// add button to the screen
function addElement (el) {
  Object.assign(el.style, {
    position: "absolute",
    zIndex: 10
  })
  stage.viewer.container.appendChild(el)
}

// make button
function createElement (name, properties, style) {
  var el = document.createElement(name)
  Object.assign(el, properties)
  Object.assign(el.style, style)
  return el
}

// button that selects certain parts of the protein
function createSelect (options, properties, style) {
  var select = createElement("select", properties, style)
  options.forEach(function (d) {
    select.add(createElement("option", {
      value: d[ 0 ], text: d[ 1 ]
    }))
  })
  return select
}

// main function
function loadStructure (input) {
  stage.removeAllComponents()
  return stage.loadFile(input).then(function (o) {
    protein = o;
    protein.setRotation([ 2, 0, 0 ])
    protein.autoView()
    protein.addRepresentation(polymerSelect.value, {
      sele: "polymer",
      name: "polymer",
      color: greyColor
    });
    return protein;
  })
}

// color a site by a certain color
function selectSite (siteString, color) {
  // highlighted site representation should match main representation except
  // the highlighted site should be spacefill if main protein cartoon
  if (polymerSelect.value == "cartoon") {
   fill = "spacefill";
 }else{
   fill = polymerSelect.value
 }
 // color the site
  protein.addRepresentation(fill, {
    color: color,
    name: siteString
  }).setSelection(siteString)
  }

// remove color from a site
function deselectSite (siteString) {
  stage.getRepresentationsByName(siteString).dispose()
  }

// select protein display type
var polymerSelect = createSelect([
  [ "cartoon", "cartoon" ],
  [ "spacefill", "spacefill" ],
  [ "surface", "surface" ]
], {
  onchange: function (e) {
    stage.getRepresentationsByName("polymer").dispose()
    stage.eachComponent(function (o) {
      o.addRepresentation(e.target.value, {
        sele: "polymer",
        name: "polymer",
        color: greyColor
      })
      // on change, reselect the points so they are "on top"
      d3.selectAll(".selected").data().forEach(function(element) {
        selectSite(":"+element.chain+ " and "+ element.chain_site,
                   color_key[Math.ceil(element.abs_diffsel)])
      });
    })
  }
}, { top: "36px", left: "12px" })
