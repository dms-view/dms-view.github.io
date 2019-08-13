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
    o.setRotation([ 2, 0, 0 ])
    o.autoView()
    o.addRepresentation(polymerSelect.value, {
      sele: "polymer",
      name: "polymer",
      color: greyColor
    })
  })
}

function selectSite (siteString, color) {
    protein.addRepresentation("surface", {
      color: color,
      name: siteString
    }).setSelection(siteString)
  }

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
    })
  }
}, { top: "36px", left: "12px" })
addElement(polymerSelect)

// load structure to start
loadStructure("rcsb://4O5N.cif")
