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

function markdownButtonChange () {
  // Try to load the user's provided URL to a Markdown document.
  const markdownUrl = d3.select("#state-url").property('value');
  if (markdownUrl.length > 0) {
    d3.json(markdownUrl).then(updateState);
  }
}

var markdownButton = d3.select("#state-url-submit")
  .on("click", markdownButtonChange);

function updateState(state){
  // select sites
  state["site"].forEach(function(site){
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
}

function updateDropDownMenu(dropdownid, target){
  d3.select(dropdownid)
     .selectAll("option")
     .property('selected', function(d){return d === target;})
 d3.select(dropdownid).dispatch("change")
}
