// Code for example: interactive/simple-viewer

// Create NGL Stage object
const stage = new NGL.Stage("protein");
stage.setParameters({
  backgroundColor: "white"
});

// Handle window resizing
window.addEventListener("resize", function(event) {
  stage.handleResize();
}, false);

// add button to the screen
function addElement(el) {
  Object.assign(el.style, {
    position: "absolute",
    zIndex: 10
  })
  stage.viewer.container.appendChild(el)
}

// make button
function createElement(name, properties, style) {
  var el = document.createElement(name)
  Object.assign(el, properties)
  Object.assign(el.style, style)
  return el
}

// button that selects certain parts of the protein
function createSelect(options, properties, style) {
  var select = createElement("select", properties, style)
  options.forEach(function(d) {
    select.add(createElement("option", {
      value: d[0],
      text: d[1]
    }))
  })
  return select
}

// color a site by a certain color
function selectSiteOnProtein(siteString, color) {
  // highlighted site representation should match main representation except
  // the highlighted site should be spacefill if main protein cartoon
  backbone = ["cartoon"]
  if (backbone.includes(polymerSelect.value)) {
    fill = "spacefill";
  } else {
    fill = polymerSelect.value
  }
  // color the site
  if(protein){
  protein.addRepresentation(fill, {
    color: color,
    name: siteString
  }).setSelection(siteString)
}
}

// remove color from a site
function deselectSiteOnProtein(siteString) {
  stage.getRepresentationsByName(siteString).dispose()
}

// select protein display type
var polymerSelect = createSelect([
  ["cartoon", "cartoon"],
  ["spacefill", "spacefill"],
  ["licorice", "sticks"],
  ["surface", "surface"]
], {
  onchange: function(e) {
    stage.getRepresentationsByName("polymer").dispose()
    stage.eachComponent(function(o) {
      o.addRepresentation(e.target.value, {
          sele: "polymer",
          name: "polymer",
          color: greyColor
        })
        // on change, reselect the points so they are "on top"
      d3.selectAll(".selected").data().forEach(function(element) {
        element.protein_chain.forEach(function(chain){
          deselectSiteOnProtein(":" + chain + " and " + element.protein_site)
          selectSiteOnProtein(
            ":" + chain + " and " + element.protein_site,
            color_key[element.site]
          )
        })

      });
    })
  }
}, {
  top: "36px",
  left: "12px"
})

// tooltip setup
const tooltip = createElement("div", {}, {
  display: "none",
  position: "absolute",
  zIndex: 10,
  pointerEvents: "none",
  backgroundColor: "rgba(255,255,255, 0.8)", // white and transparent
  color: "black",
  padding: "8px",
  fontFamily: "sans-serif"
})

stage.viewer.container.appendChild(tooltip);

// remove default hoverPick mouse action
// this appears to remve the default tooltip behavior
stage.mouseControls.remove("hoverPick")

// listen to `hovered` signal to move tooltip around and change its text
stage.signals.hovered.add(function(pickingProxy) {
  if (pickingProxy && (pickingProxy.atom || pickingProxy.bond)) {
    var atom = pickingProxy.atom || pickingProxy.closestBondAtom;
    var cp = pickingProxy.canvasPosition;
    // extract the protein chain and site
    var site_name = atom.qualifiedName().split(":")[0].split("]")[1]
    var chain_name = atom.qualifiedName().split(":")[1].split(".")[0]
      // extract the data corresponding to this site
    var residue_data = Array.from(chart.condition_data.values()).filter(d =>
      (+d.protein_site == site_name) && (d.protein_chain.includes(chain_name)))
      // there should not be more than one entry
    try {
      if (residue_data.length > 1) throw "data parse wrong";
    } catch (err) {
      console.log(err)
    }
    // if there are no entries, don't display tooltip
    if (residue_data.length == 0) {
      tooltip.style.display = "none";
    } else {
      residue_data = residue_data[0]
      // write to the tooltip
      tooltip.innerHTML =
        `Atom: ${chain_name} ${site_name}
         <hr/>
         Site: ${residue_data.label_site}<br/>
         ${residue_data.metric_name.substring(5,)}: ${parseFloat(residue_data.metric).toFixed(2)}
         Wildtype: ${residue_data.wildtype}<br/>
         `
      tooltip.style.bottom = cp.y + 3 + "px";
      tooltip.style.left = cp.x + 3 + "px";
      tooltip.style.display = "block";
    }
  } else {
    tooltip.style.display = "none";
  }
});
