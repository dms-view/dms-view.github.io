// Code for example: interactive/simple-viewer

// Create NGL Stage object
const stage = new NGL.Stage("protein");
stage.setParameters({
  backgroundColor: "white"
});

// color scheme
function createProteinColorScheme(targetChains){
  targetChains = ":" + targetChains.join(" or :");
  var targetColor, altColor;
  if (dataColor.value.length == 0){
    targetColor = greyColor
  }
  else if (_.isEmpty(new THREE.Color(dataColor.value.toLowerCase()))){
    targetColor = greyColor;
    document.getElementById("proteinColorAlertForm").hidden = false
  }else{
    targetColor = dataColor.value.toLowerCase()
    document.getElementById("proteinColorAlertForm").hidden = true
  }
  if (otherColor.value.length == 0){
    altColor = greyColor
  }
  else if (_.isEmpty(new THREE.Color(otherColor.value.toLowerCase()))){
    altColor = greyColor;
  }else{
    altColor = otherColor.value.toLowerCase()
  }
  return scheme = NGL.ColormakerRegistry.addSelectionScheme([
    [targetColor, targetChains],
    [altColor, "*"]
  ]);
}

// Handle window resizing
window.addEventListener("resize", function(event) {
  stage.handleResize();
}, false);

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

function selectChainOnProtein(chainString, representation){
  if(protein){
    protein.addRepresentation(representation, {
      name: "target polymer",
      color: '#000000'
    }).setSelection(chainString)
  }
}

// remove color from a site
function deselectSiteOnProtein(siteString) {
  stage.getRepresentationsByName(siteString).dispose()
}

var polymerSelect = document.querySelector('select[name="polymerSelect"]');
var colorToggle = document.querySelector('input[name="colorCheckbox"]');
var dataColor = document.querySelector('input[name="data-color"]');
var otherColor = document.querySelector('input[name="other-color"]');


function colorWholeProtein(_protein, representation, colorChains){
  if(colorChains){
    var colorScheme = createProteinColorScheme(chart.protein_chains)
    _protein.addRepresentation(representation, {
        sele: "polymer",
        name: "polymer",
        color: colorScheme
      })
  }else{
    _protein.addRepresentation(representation, {
        sele: "polymer",
        name: "polymer",
        color: greyColor
      })
  }
}

polymerSelect.addEventListener('change', function(e) {
  stage.getRepresentationsByName("polymer").dispose()
  stage.eachComponent(function(o) {
    colorWholeProtein(o, e.target.value)
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
});

dataColor.addEventListener('change', function(e) {
  if(chart && protein){
        colorWholeProtein(protein, polymerSelect.value, true)
    }
});

otherColor.addEventListener('change', function(e) {
  console.log(e.target.value)
  if(chart && protein){
        colorWholeProtein(protein, polymerSelect.value, true)
    }
});

colorToggle.addEventListener('change', function(e) {
  if(dataColor.style.display == 'none'){
    dataColor.style.display = 'block'
  }else{
    dataColor.style.display = 'none'
  }

  if(otherColor.style.display == 'none'){
    otherColor.style.display = 'block'
  }else{
    otherColor.style.display = 'none'
  }
});

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
