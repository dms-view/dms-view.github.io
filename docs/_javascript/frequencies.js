// Initial code based on https://bl.ocks.org/gordlea/27370d1eea8464b04538e6d8ced39e89

// Define functions for plotting.
function plotSiteMutations(dataset) {
  // Create the line plot itself by adding a path, binding data, and running the line generator.
  // Group site data by mutation in arrays to enable plotting one line per mutation.
  if (dataset != undefined) {
    dataset_by_mutation = d3.groups(dataset, d => d.mutation);
  }
  else {
    dataset_by_mutation = [];
    dataset = [];
  }

  if (dataset.length == 0) {
    d3.select("#missing_data_warning").style("display", "inline");
  }
  else {
    d3.select("#missing_data_warning").style("display", "none");
  }

  var colorScale = d3.scaleOrdinal(d3.schemeAccent);

  var line = d3.line()
    .x(function(d) {
      return xScale(parseTime(d.timepoint));
    })
    .y(function(d) {
      return yScale(d.frequency * 100);
    });

  var mutations = d3.select(".frequencies")
    .selectAll(".frequency_line")
    .data(dataset_by_mutation, function(key, values) {
      return key[1][0].site;
    });

  mutations.enter().append("path")
    .attr("class", "frequency_line")
    .attr("stroke-width", 2)
    .attr("stroke", function(d) {
      return colorScale(d[1][0].mutation);
    })
    .attr("fill", "None")
    .attr("d", function(d) {
      return line(d[1]);
    });
  mutations.exit().remove();

  // Add a circle for each observed data point.
    var dots = d3.select(".frequencies").selectAll(".label")
                 .data(dataset, function(d) {
                     return d.site;
                 });

    var labels = dots
        .enter().append("g")
        .attr("class", "label")
        .attr("transform", function (d) { return "translate(" + xScale(parseTime(d.timepoint)) + "," + yScale(d.frequency * 100) + ")"; });

    labels
        .append("text")
        .attr("dx", "-0.5em")
        .attr("dy", "0.35em")
        .text(function (d) { return parseFloat(d.frequency * 100).toFixed(0); })
        .filter(function (d) { return (d.timepoint == dataset[dataset.length - 1].timepoint) | (d.timepoint == dataset[0].timepoint); })
        .append("tspan")
        .attr("class", "label-key")
        .attr("dy", "0.05em")
        .style("fill", function (d) { return colorScale(d.mutation); } )
        .text(function (d) { return d.mutation; });

    var labelPadding = 3;
    labels.insert("rect", "text")
        .datum(function () { return this.nextSibling.getBBox(); } )
        .attr("dy", "0.35em")
        .attr("x", function (d) { return d.x - labelPadding; })
        .attr("y", function (d) { return d.y / 2 - labelPadding; })
        .attr("width", function (d) { return d.width + 2 * labelPadding; })
        .attr("height", function (d) { return d.height - 2 * labelPadding; });

    dots.exit().remove();

  if (dataset.length > 0) {
    legendTitle = "Mutations at " + dataset[0].gene + ":" + dataset[0].gene_site;
  }
  else {
    legendTitle = "";
  }

  var legend = d3.legendColor()
    .shapeWidth(30)
    .orient("horizontal")
    .title(legendTitle)
    .scale(colorScale);

  // Update the legend to reflect the mutations at the selected site.
  //d3.select(".legend")
  //  .call(legend);

  if (dataset.length > 0) {
    d3.select(".legendTitle")
      .style("visibility", "visible")
      .attr("transform", "translate(-100,-7)");

    d3.select(".legendCells")
      .attr("transform", "translate(65,-20)");
  }
  else {
    d3.select(".legendTitle").style("visibility", "hidden");
  }
}

// Selection site from dropdown.
function selectSite(data) {
  var selectedSite = parseInt(d3.select(this).property("value"));

  console.log("Select site: " + selectedSite);
  var siteFrequencies = frequenciesBySite.get(selectedSite);
  plotSiteMutations(siteFrequencies);
}

// Setup plot and window margins.
var plotWidth = 760;
var plotHeight = 250;

var margin = ({
  top: 10,
  right: 40,
  bottom: 40,
  left: 45
});
var width = plotWidth - margin.left - margin.right;
var height = plotHeight - margin.top - margin.bottom;

// Parse dates by year, month, and day.
var parseTime = d3.timeParse("%Y-%m-%d");

// Setup plot scales, axes, legend, and line generators.
var xScale = d3.scaleTime()
  .range([0, width]);

var yScale = d3.scaleLinear()
  .domain([0, 100])
  .range([height, 0]);

var line = d3.line()
  .x(function(d) {
    return xScale(parseTime(d.timepoint));
  })
  .y(function(d) {
    return yScale(d.frequency * 100);
  })
  .curve(d3.curveMonotoneX);

// Setup the plot container.
var frequencies_svg = d3.select("#frequencies").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("id", "frequencies_panel")
  .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// Add a warning message for missing data.
var warning_rect = d3.select("#frequencies_panel")
  .append("text")
  .attr("id", "missing_data_warning")
  .attr("transform", "translate(" + ((width / 2)) + ", " + (height / 2) + ")")
  .style("text-anchor", "middle")
  .text("No frequency data available")
  .style("font-size", "20px")
  .style("display", "none");

// Add the x-axis.
frequencies_svg.append("g")
  .attr("class", "x_axis")
  .attr("transform", "translate(0, " + height + ")");

// Add an x-axis title. Why is this so complicated?
frequencies_svg.append("text")
  .attr("transform", "translate(" + (width / 2) + ", " + (height + 40) + ")")
  .style("text-anchor", "middle")
  .text("Date");

// Add the y-axis.
frequencies_svg.append("g")
  .attr("class", "y_axis")
  .call(d3.axisLeft(yScale));

// Add an y-axis title. Again: why is this so complicated?
frequencies_svg.append("text")
  .attr("transform", "translate(" + -(margin.left - 12) + ", " + (height / 2) + ") rotate(-90)")
  .style("text-anchor", "middle")
  .text("Frequency (%)");

// Add a legend using Susie Lu's d3-legend:
// https://d3-legend.susielu.com/#color
frequencies_svg.append("g")
  .attr("class", "legend")
  .attr("transform", "translate(" + (margin.left + 55) + ", " + (height + 50) + ")");

// Create a group to store the line and dots in.
var g = frequencies_svg.append("g")
  .attr("class", "frequencies");

// Setup variables to store data.
var frequencies;
var frequenciesBySite;
var sites;
var dropdown;

// Load frequencies JSON.
d3.json("_data/frequencies.json").then(function(data) {
  // Plot one line per amino acid at a specified site with different color per line.
  // Multi-line plot based on http://bl.ocks.org/d3noob/88d2a87b72ea894c285c
  frequencies = data;
  frequenciesBySite = d3.group(frequencies, d => d.site);
  sites = Array.from(frequenciesBySite.keys());

  // Update x-axis scale to the domain of the given data.
  xScale.domain(d3.extent(frequencies, d => parseTime(d.timepoint))).nice(d3.timeMonth.every(3));
  d3.select(".x_axis")
    .call(d3.axisBottom(xScale));

  // Plot frequencies for the first site by default.
  var siteFrequencies = frequenciesBySite.get(sites[0]);
  plotSiteMutations(siteFrequencies);

  // Update circles in the line plot to reflect which sites have frequency data or not.
  d3.select(".focus")
    .selectAll(".non_brushed")
    .classed(
      "has_data",
      function (d) { return frequenciesBySite.has(+d.site); }
    );
});
