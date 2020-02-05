exportbuttonchange = function(){
  var state = {
    "site": d3.selectAll('.selected').data().map(d => +d.site),
    "condition": d3.select("#condition").property('value'),
    "site-metric": d3.select("#site").property('value'),
    "mut-metric": d3.select("#mutation_metric").property('value'),
    "protein-representation": polymerSelect.value
  }
  var fname = prompt("File name: ")
  if(fname === null){
    fname = "dms-view.json"
  }
  state = JSON.stringify(state);
  download(fname, state);
};

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function JSONButtonChange () {
  // Try to load the user's provided URL to a Markdown document.
  const JSONUrl = d3.select("#state-url").property('value');
  if (JSONUrl.length > 0) {
    d3.json(JSONUrl)
    .then(updateState)
    .catch(err =>alert("Couldn't parse " + JSONUrl + ".\nIs it a proper JSON?"))
  }else{
    alert("No state URL entered.")
  }
}

var markdownButton = d3.select("#state-url-submit")
  .on("click", JSONButtonChange);

function updateState(state){
  // check state form
  checkState(state)
  // figure out what sites to select/deselect
  var current_selection = d3.selectAll(".selected").data().map(d => +d.site),
      sites_to_deselect = _.without.apply(_, [current_selection].concat(state["site"])),
      sites_to_select = _.without.apply(_, [state["site"]].concat(current_selection))
  // deselect sites.
  sites_to_deselect.forEach(function(site){
    deselectSite(d3.select("#site_" + site))
  })
  // select sites.
  sites_to_select.forEach(function(site){
    selectSite(d3.select("#site_" + site))
  })

 // update condition
 updateDropDownMenu("#condition", state["condition"])

 // update site metric
 updateDropDownMenu("#site", state["site-metric"])

 // update mut metric
 updateDropDownMenu("#mutation_metric", state["mut-metric"])

// update protein representation
polymerSelect.value = state["protein-representation"]
changeProteinRepresentation(state["protein-representation"])

// call change on dropdowns to re-up chart
d3.select("#site").dispatch("change")
}

function updateDropDownMenu(dropdownid, target){
  d3.select(dropdownid)
     .selectAll("option")
     .property('selected', function(d){return d === target;})
}

function checkState(state){
  var alertMsg;
  ["condition", "site-metric", "mut-metric", "protein-representation"]
  .forEach(function(target){
    if(!(target in state)){
      alertMsg = alertMsg + "\nCouldn't find " + target + " in JSON. Reverting to current value."
    }
  })
  if(alertMsg){
    alert(alertMsg)
  }
}
