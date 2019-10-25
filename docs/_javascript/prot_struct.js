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

// create tooltip element and add to the viewer canvas
var tooltip = document.createElement("div");
Object.assign(tooltip.style, {
  display: "none",
  position: "absolute",
  zIndex: 10,
  pointerEvents: "none",
  backgroundColor: "rgba(255,255,255, 0.3)",  // white and transparent
  color: "black",
  padding: "8px",
  fontFamily: "sans-serif"
});
stage.viewer.container.appendChild(tooltip);

// remove default hoverPick mouse action
// this appears to remve the default tooltip behavior
stage.mouseControls.remove("hoverPick")
nan_data = {"site": NaN, "label_site": NaN, "wildtype": NaN}

// listen to `hovered` signal to move tooltip around and change its text
stage.signals.hovered.add(function (pickingProxy) {
  if (pickingProxy && (pickingProxy.atom || pickingProxy.bond)){
    var atom = pickingProxy.atom || pickingProxy.closestBondAtom;
    var cp = pickingProxy.canvasPosition;
    var site_name = atom.qualifiedName().split(":")[0].split("]")[1]
    var chain_name = atom.qualifiedName().split(":")[1].split(".")[0]
    var residue_data = chart.data.filter(d => (+d.protein_site == site_name)
                                         && (d.protein_chain === chain_name))
    try {
      if(residue_data.length > 1) throw "data parse wrong";
    }catch(err) {
      console.log(err)
    }
    if (residue_data.length == 0){
      residue_data = nan_data
    }else{
      residue_data = residue_data[0]
    }

    tooltip.innerHTML = `Atom: ${chain_name} ${site_name}<br/>
       <hr/>
       site: ${residue_data.site}<br/>
       site label: ${residue_data.label_site}<br/>
       wildtype: ${residue_data.wildtype}<br/>
       `
    tooltip.style.bottom = cp.y + 3 + "px";
    tooltip.style.left = cp.x + 3 + "px";
    tooltip.style.display = "block";
  }else{
    tooltip.style.display = "none";
  }
});

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
function selectSiteOnProtein (siteString, color) {
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
function deselectSiteOnProteinStructure (siteString) {
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
        selectSiteOnProtein(":"+element.chain+ " and "+ element.chain_site,
                   color_key[Math.ceil(element.abs_diffsel)])
      });
    })
  }
}, { top: "36px", left: "12px" })
