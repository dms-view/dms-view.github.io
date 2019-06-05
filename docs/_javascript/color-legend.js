// Variable declaration
d3.csv("_data/2009-age-65-sitediffsel-median_processed.csv").then(data => {
  var n = data.length;
  var d_extent_x = d3.extent(data, data => +data.abs_diffsel);
  // Create color scale

  var colorScale = d3.scaleLinear()
    .domain([0, d_extent_x[1] / 2, d_extent_x[1]])
    .range(['#fff5f0','#fee0d2','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#a50f15','#67000d']);

  var width = 500;
  var height = 100;

  // Create svg
  var svg = d3.select('#color-legend')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g');

  //////////////////////////////////////////
  /// Gradient for the legend
  //////////////////////////////////////////

  // Scale for absolute diffsel
  var countScale = d3.scaleLinear()
    .domain(d_extent_x)
    .range([0, width]);

  // Calculate variables for the temp gradient
  var numStops = 10;

  var countRange = countScale.domain();
  // index 2 is the substraction between max and min
  countRange[2] = countRange[1] - countRange[0];
  var countPoint = [];
  for (var i = 0; i < numStops; i++) {
    countPoint.push(i * countRange[2] / (numStops - 1) + countRange[0]);
  }

  // Create the gradient
  svg.append("defs")
    .append("linearGradient")
    .attr("id", "legend-traffic")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "0%")
    .selectAll("stop")
    .data(d3.range(numStops))
    .enter().append("stop")
    .attr("offset", function(d, i) {
      return countScale(countPoint[i])/width;
    })
    .attr("stop-color", function(d, i) {
      return colorScale(countPoint[i]);
    });


  ///////////////////////////////////////////////////////////////////////////
  ////////////////////////// Draw the legend ////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  var legendWidth = width;

  // Color Legend container
  var legendsvg = svg.append("g")
    .attr("class", "legendWrapper")
    .attr("transform", "translate(" + width + "," + height/20 + ")");

  // Append title
  legendsvg.append("text")
    .attr("class", "legendTitle")
    .attr("x", 250)
    .attr("y", 30)
    .style("text-anchor", "middle")
    .text("Amino Acid Preference");

  // Draw the Rectangle
  legendsvg.append("rect")
    .attr("class", "legendRect")
    .attr("x", -legendWidth)
    .attr("y", 35)
    .attr("width", legendWidth)
    .attr("height", 25)
    .style("fill", "url(#legend-traffic)");

  // Set scale for x-axis
  var xScale = d3.scaleLinear()
    .domain(d_extent_x)
    .range([-width,width]);

  // Define x-axis
  var xAxis = d3.axisBottom()
    .ticks(20)
    .scale(xScale);

  // Set up X axis
  legendsvg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + (60) + ")")
    .call(xAxis);
});
