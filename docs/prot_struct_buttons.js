var protein;
// Create NGL Stage object
var stage = new NGL.Stage( "protein" );
stage.setParameters({
  backgroundColor: "white"
});

// Handle window resizing
window.addEventListener( "resize", function( event ){
    stage.handleResize();
}, false );


// Code for example: interactive/simple-viewer

function addElement (el) {
  Object.assign(el.style, {
    position: "absolute",
    zIndex: 10
  })
  stage.viewer.container.appendChild(el)
}

function createElement (name, properties, style) {
  var el = document.createElement(name)
  Object.assign(el, properties)
  Object.assign(el.style, style)
  return el
}

function createSelect (options, properties, style) {
  var select = createElement("select", properties, style)
  options.forEach(function (d) {
    select.add(createElement("option", {
      value: d[ 0 ], text: d[ 1 ]
    }))
  })
  return select
}

function loadStructure (input) {
  stage.removeAllComponents()
  return stage.loadFile(input).then(function (o) {
    o.setRotation([ 2, 0, 0 ])
    o.autoView()
    o.addRepresentation(polymerSelect.value, {
      sele: "polymer",
      name: "polymer",
      color: "#999999"
    })
    o.addRepresentation("spacefill", {
      color: "#9900FF",
      name: "site100",
      visible: site100button.checked
    }, false).setSelection(":A and 100")
    o.addRepresentation("spacefill", {
      color: "#9900FF",
      name: "site75",
      visible: site75button.checked
    }, false).setSelection(":B and 75")
  })
}

var polymerSelect = createSelect([
  [ "cartoon", "cartoon" ],
  [ "spacefill", "spacefill" ],
  [ "licorice", "licorice" ],
  [ "surface", "surface" ]
], {
  onchange: function (e) {
    stage.getRepresentationsByName("polymer").dispose()
    stage.eachComponent(function (o) {
      o.addRepresentation(e.target.value, {
        sele: "polymer",
        name: "polymer",
      })
    })
  }
}, { top: "36px", left: "12px" })
addElement(polymerSelect)

var site75button = createElement("input", {
  type: "checkbox",
  checked: false,
  onchange: function (e) {
    stage.getRepresentationsByName("site75")
      .setVisibility(e.target.checked)
  }
}, { top: "60px", left: "12px" })
addElement(site75button)
addElement(createElement("span", {
  innerText: "site 75"
}, { top: "60px", left: "32px" }))


var site100button = createElement("input", {
  type: "checkbox",
  checked: false,
  onchange: function (e) {
    stage.getRepresentationsByName("site100")
      .setVisibility(e.target.checked)
  }
}, { top: "84px", left: "12px" })
addElement(site100button)
addElement(createElement("span", {
  innerText: "site 100"
}, { top: "84px", left: "32px" }))

var centerButton = createElement("input", {
  type: "button",
  value: "center",
  onclick: function () {
    stage.autoView(1000)
  }
}, { top: "108px", left: "12px" })
addElement(centerButton)

loadStructure("rcsb://4O5N.cif")
