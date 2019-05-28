// Initial code based on https://bl.ocks.org/gordlea/27370d1eea8464b04538e6d8ced39e89

// Set function for joins.
function name (d) {
    return d.mutation;
}

// Define functions for plotting.
function plotSiteMutations (dataset) {
    // Create the line plot itself by adding a path, binding data, and running the line generator.
    console.log(dataset);

    // Group site data by mutation in arrays to enable plotting one line per mutation.
    dataset_by_mutation = d3.groups(dataset, d => d.mutation);

    var line = d3.line()
                 .x(function (d) { return xScale(parseTime(d.timepoint)); })
                 .y(function (d) { return yScale(d.frequency); });

    var mutations = d3.select(".frequencies")
                      .selectAll(".line")
                      .data(dataset_by_mutation, function (key, values) { console.log("key: " + key[1][0].site); return key[1][0].site; });
    mutations.enter().append("path")
             .attr("class", "line")
             .attr("stroke-width", 2)
             .attr("stroke", function (d) { return colorScale(d[1][0].mutation); })
             .attr("fill", "None")
             .attr("d", function (d) { return line(d[1]); });
    mutations.exit().remove();

    // Add a circle for each observed data point.
    var dots = d3.select(".frequencies").selectAll(".dot")
                 .data(dataset, function (d) { return d.site; });
    dots.enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", function (d) { return xScale(parseTime(d.timepoint)); })
        .attr("cy", function (d) { return yScale(d.frequency); } )
        .attr("r", 5)
        .attr("fill", d => colorScale(d.mutation))
        .on("mouseover", function (a, b, c) {
            console.log(a);
        })
        .on("mouseout", function () {} );
    dots.exit().remove();
}

// Selection site from dropdown.
function selectSite (data) {
    var selectedSite = parseInt(d3.select(this).property("value"));
    console.log("Select site: " + selectedSite);

    var siteFrequencies = frequenciesBySite.get(selectedSite);
    plotSiteMutations(siteFrequencies);

    // Update the legend to reflect the mutations at the selected site.
    d3.select("svg")
      .select(".legend")
      .call(legend);
}

// Setup plot and window margins.
var plotWidth = 1024;
var plotHeight = 400;

var margin = ({
    top: 50,
    right: 100,
    bottom: 50,
    left: 100
});
var width = plotWidth - margin.left - margin.right;
var height = plotHeight - margin.top - margin.bottom;

// Parse dates by year, month, and day.
var parseTime = d3.timeParse("%Y-%m-%d");

// Setup plot scales, axes, legend, and line generators.
var xScale = d3.scaleTime()
               .domain([parseTime("2010-10-01"), parseTime("2012-10-01")])
               .range([0, width]);

var yScale = d3.scaleLinear()
               .domain([0, 1])
               .range([height, 0]);

var colorScale = d3.scaleOrdinal(d3.schemeAccent);

var line = d3.line()
             .x(function (d) { return xScale(parseTime(d.timepoint)); })
             .y(function (d) { return yScale(d.frequency); })
             .curve(d3.curveMonotoneX);

// Setup the plot container.
var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// Add the x-axis.
svg.append("g")
   .attr("class", "x_axis")
   .attr("transform", "translate(0, " + height + ")")
   .call(d3.axisBottom(xScale));

// Add an x-axis title. Why is this so complicated?
svg.append("text")
   .attr("transform", "translate(" + (width / 2) + ", " + (height + 40)  + ")")
   .style("text-anchor", "middle")
   .text("Date");

// Add the y-axis.
svg.append("g")
   .attr("class", "y_axis")
   .call(d3.axisLeft(yScale));

// Add an y-axis title. Again: why is this so complicated?
svg.append("text")
   .attr("transform", "translate(" + (margin.left / -2) + ", " + (height / 2)  + ") rotate(-90)")
   .style("text-anchor", "middle")
   .text("Frequency");

// Add a legend using Susie Lu's d3-legend:
// https://d3-legend.susielu.com/#color
svg.append("g")
   .attr("class", "legend")
   .attr("transform", "translate(" + (width - 100) + ", " + "20)");

var legend = d3.legendColor()
               .title("Mutation")
               .scale(colorScale);

// Create a group to store the line and dots in.
var g = svg.append("g")
           .attr("class", "frequencies");

// Setup variables to store data.
var frequencies;
var frequenciesBySite;
var sites;
var dropdown;

// Load frequencies JSON.
d3.json("/data/frequencies.json").then(function (data) {
    // Plot one line per amino acid at a specified site with different color per line.
    // Multi-line plot based on http://bl.ocks.org/d3noob/88d2a87b72ea894c285c
    frequencies = data["frequencies"];
    frequenciesBySite = d3.group(data["frequencies"], d => d.site);
    sites = Array.from(frequenciesBySite.keys());

    // Create a dropdown menu to populate with data.
    dropdown = d3.select("body").append("select");
    dropdown.selectAll("option")
            .data(sites)
            .enter()
            .append("option")
            .text(function (d) { return d; })
            .attr("value", function (d) { return d; });
    dropdown.on("change", selectSite);

    // Plot frequencies for the first site by default.
    var siteFrequencies = frequenciesBySite.get(sites[0]);
    plotSiteMutations(siteFrequencies);

    svg.select(".legend")
       .call(legend);
});
