"use strict";

// Setup plot and window margins.
var containerWidth = 700;
var containerHeight = 300;

//this is the space within the svg surrounding the plot
var margin = {
    top: 50,
    right: 100,
    bottom: 50,
    left: 100
};

var plotWidth = containerWidth - margin.left - margin.right;
var plotHeight = containerHeight - margin.top - margin.bottom;

//todo: parse or read these in from an actual JSON file (in data dir)
var sitePreferenceData = [{
    "gene": "HA1",
    "site": 1,
    "aminoAcid": "G",
    "value": 0.2
}, {
    "gene": "HA1",
    "site": 2,
    "aminoAcid": "R",
    "value": 0.4
}, {
    "gene": "HA1",
    "site": 3,
    "aminoAcid": "A",
    "value": 0.3
}, {
    "gene": "HA1",
    "site": 4,
    "aminoAcid": "L",
    "value": 1.0
}, {
    "gene": "HA1",
    "site": 5,
    "aminoAcid": "S",
    "value": 0.8
}];

var xScale = d3.scaleBand().domain(sitePreferenceData.map(function (d) {
    return d.site;
})).rangeRound([0, plotWidth]).padding(0.05);

var yScale = d3.scaleLinear().domain([0, d3.max(sitePreferenceData, function (d) {
    return d.value;
})]).nice().range([plotHeight, 0]); //this is backwards because SVG 0,0 is at top left

//build up the tool tip for looking at the histogram interactively
// Define the div for the tooltip, and set it to be hidden to start.
var tooltip = d3.select("#preferences").append("div").style("font-family", "'Open Sans', sans-serif").style("position", "relative").style("font-size", "20px").style("z-index", "10").style("visibility", "hidden");

/*
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);*/

//set up the svg container
var svg = d3.select("#preferences").append("svg").attr("width", containerWidth).attr("height", containerHeight).append("g").attr("transform", "translate(" + margin.left + ", " + margin.top + ")"); //this looks heinous because you're writing a string that should be printed into the HTML file.

//add an x axis to the plotting space
svg.append("g") //remember g is the keyword for group in the html file
.attr("class", "x_axis").attr("transform", "translate(0," + plotHeight + ")") // necessary to go from 0,0 being at the top to 0,0 being in the normal place, aka SVG coordinate space to Cartesian.
.call(d3.axisBottom(xScale));

// Add an x-axis title
svg.append("text").attr("transform", "translate(" + plotWidth / 2 + ", " + (plotHeight + 40) + ")").style("text-anchor", "middle").text("Site in HA1");

//add a y axis to the plotting space
svg.append("g").attr("class", "y_axis").call(d3.axisLeft(yScale));

// Add an y-axis title.
svg.append("text").attr("transform", "translate(" + margin.left / -2 + ", " + plotHeight / 2 + ") rotate(-90)").style("text-anchor", "middle").text("Mutational tolerance");

//Plot some bars in the chart from the JSON data above
//add another group to hold all the data plotting.
var dataGroup = svg.append("g");

dataGroup.selectAll(".bar").data(sitePreferenceData).enter().append("rect").attr("x", function (d) {
    return xScale(d.site);
}).attr("y", function (d) {
    return yScale(d.value);
}).attr("width", xScale.bandwidth()).attr("height", function (d) {
    return plotHeight - yScale(d.value);
}).attr("fill", "steelblue").on("mouseover", function (d) {
    return tooltip.style("visibility", "visible").text(d.aminoAcid + d.value);
}).on("mousemove", function (d) {
    return tooltip.style("top", event.pageY - 250 + "px").style("left", event.pageX - 600 + "px").text(" Mutational tolerance of " + d.aminoAcid + ": " + d.value);
}).on("mouseout", function (d) {
    return tooltip.style("visibility", "hidden");
});

/*
.on("mouseover", function(d) {
            div.transition()
            .duration(200)
            .style("opacity", .9);
            div.html(d.value).style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");})
.on("mouseout", function(d) {
            div.transition()
            .duration(500)
            .style("opacity", 0);});*/