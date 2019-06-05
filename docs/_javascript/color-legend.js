d3.csv("_data/2009-age-65-sitediffsel-median_processed.csv").then(d => {

  var width = 500
  var countScale = d3.scaleLinear()
    .domain(d3.extent(d, d=>+d.abs_diffsel))
    .range([0, width]);

  console.log(d3.max(d, d=>+d.abs_diffsel));
  var colorScale = d3.scaleLinear()
    .domain([0, d3.extent(d, d=>+d.abs_diffsel)[1] / 2, d3.extent(d, d=>+d.abs_diffsel)[1]])
    .range(d3.schemeReds[3]);

  var xScale = d3.scaleLinear()
    .domain(d3.extent(d, d=>+d.abs_diffsel))
    .range([-width, width]);

  var svg = d3.select("#colorKey").append("svg")
    .attr("width", 500)
    .attr("height", 300);

  var defs = svg.append("defs");

  var gradient = defs.append("linearGradient")
    .attr("id", "svgGradient")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%");

  var numStops = 20;

  var countRange = countScale.domain();
  // index 2 is the substraction between max and min
  countRange[2] = countRange[1] - countRange[0];
  var countPoint = [];
  for (var i = 0; i < numStops; i++) {
    countPoint.push(i * countRange[2] / (numStops - 1) + countRange[0]);
  }
  // create a color key based on the bar and attach it to a list to use a reference
  const colorKey = {};
  for (var i = 0; i < numStops; i++) {
    //console.log(i);
    colorKey["" + Math.ceil(countPoint[i]) + ""] = colorScale(countPoint[i]);
    //console.log(colorKey[""+i+""]);
  }

  console.log(colorKey);
  // create gradient stops, at the same time also create a key for the amaino acid preferences

  gradient.selectAll("stop")
  .data(d3.range(numStops))
  .enter()
  .append("stop")
  .attr('class', 'start')
  .attr("offset", function(d, i) {
    return countScale(countPoint[i]) / width;
  })
  .attr("stop-color", function(d, i) {
    return colorScale(countPoint[i]);
  });

  svg.append("rect")
  .attr("class", "legendRect")
  .attr("x", 20)
  .attr("y", 35)
  .attr("width", 380)
  .attr("height", 25)
  .style("fill", "url(#svgGradient)");


  // Append title
  svg.append("text")
  .attr("class", "legendTitle")
  .attr("x", 200)
  .attr("y", 30)
  .style("text-anchor", "middle")
  .style("font-family", "'Open Sans', sans-serif")
  .text("Amino Acid Preference");

  // x axis scale
  var xScale = d3.scaleLinear()
    .range([20, 400])
    .domain([0, Math.ceil(d3.extent(d, d=>+d.abs_diffsel)[1])]);

  // Define x-axis
  var xAxis = d3.axisBottom()
    .ticks(20)
    .scale(xScale);

  svg.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0," + (60) + ")")
  .call(xAxis)
  .selectAll("text")
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", ".15em")
  .attr("transform", "rotate(-65)");
  });
