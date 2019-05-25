// Initial code based on https://bl.ocks.org/gordlea/27370d1eea8464b04538e6d8ced39e89

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

// Generate data to plot.
// TODO: load these data from a TSV or JSON
var frequencies = [
    {
        "timepoint": "2010-10-01",
        "frequency": 0.05,
        "site": 160,
        "mutation": "K"
    },
    {
        "timepoint": "2010-10-01",
        "frequency": 0.95,
        "site": 160,
        "mutation": "T"
    },
    {
        "timepoint": "2011-04-01",
        "frequency": 0.10,
        "site": 160,
        "mutation": "K"
    },
    {
        "timepoint": "2011-04-01",
        "frequency": 0.90,
        "site": 160,
        "mutation": "T"
    },
    {
        "timepoint": "2011-10-01",
        "frequency": 0.12,
        "site": 160,
        "mutation": "K"
    },
    {
        "timepoint": "2011-10-01",
        "frequency": 0.88,
        "site": 160,
        "mutation": "T"
    },
    {
        "timepoint": "2012-04-01",
        "frequency": 0.55,
        "site": 160,
        "mutation": "K"
    },
    {
        "timepoint": "2012-04-01",
        "frequency": 0.45,
        "site": 160,
        "mutation": "T"
    },
    {
        "timepoint": "2012-10-01",
        "frequency": 0.20,
        "site": 160,
        "mutation": "K"
    },
    {
        "timepoint": "2012-10-01",
        "frequency": 0.80,
        "site": 160,
        "mutation": "T"
    }
];

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

// Load frequencies JSON.
d3.json("/data/frequencies.json").then(function (data) {
    // Plot one line per amino acid at a specified site with different color per line.
    // Multi-line plot based on http://bl.ocks.org/d3noob/88d2a87b72ea894c285c
    console.log(data);

    var frequenciesByMutation = d3.group(data["frequencies"], d => d.mutation);

    frequenciesByMutation.forEach(function (dataset, key) {
        // Create a group to store the line and dots in.
        var g = svg.append("g");

        // Create the line plot itself by adding a path, binding data, and running the line generator.
        g.append("path")
           .datum(dataset)
           .attr("class", "line")
           .attr("stroke-width", 2)
           .attr("stroke", d => colorScale(key))
           .attr("fill", "None")
           .attr("d", line);

        // Add a circle for each observed data point.
        g.selectAll(".dot")
           .data(dataset)
           .enter()
           .append("circle")
           .attr("class", "dot")
           .attr("cx", function (d) { return xScale(parseTime(d.timepoint)); })
           .attr("cy", function (d) { return yScale(d.frequency); } )
           .attr("r", 5)
           .attr("fill", d => colorScale(key))
           .on("mouseover", function (a, b, c) {
               console.log(a);
           })
           .on("mouseout", function () {} );
    });

    svg.select(".legend")
       .call(legend);
});
