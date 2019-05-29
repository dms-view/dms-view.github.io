d3.csv("./line-data.csv", function(error, data) {
      var width = 500;
      //if (error) throw error;
      // Create color scale
      var colorScale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {
          return d.max;
        }) / 2, d3.max(data, function(d) {
          return d.max;
        })])
        .range(["#ffffff", "#f77b7b", "#fa0101"]);

      var gridSize = Math.floor(data, function(d) {
        return width/d.max.length;
      });

      var height = gridSize;
      // Create svg
      var svg = d3.select('#color-legend')
        .append('svg')
        .attr('width', width )
        .attr('height', height)
        .append('g');

      //////////////////////////////////////////
      /// Gradient for the legend
      //////////////////////////////////////////

      // Scale for workingtime
      var countScale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {
          return d.max;
        })])
        .range([0, width]);

      // Calculate variables for the temp gradient
      var numStops = 15;
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
          return countScale(countPoint[i]) / width;
        })
        .attr("stop-color", function(d, i) {
          return colorScale(countPoint[i]);
        });

      ///////////////////////////////////////////////////////////////////////////
      ////////////////////////// Draw the legend ////////////////////////////////
      ///////////////////////////////////////////////////////////////////////////

      var legendWidth = Math.min(1000);

      // Color Legend container
      var legendsvg = svg.append("g")
        .attr("class", "legendWrapper")
        .attr("transform", "translate(" + (width) + "," + (gridSize) + ")");

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
        .attr("x", -legendWidth / 2)
        .attr("y", 40)
        .attr("width", legendWidth)
        .attr("height", 20)
        .style("fill", "url(#legend-traffic)");

      // Set scale for x-axis
      var xScale = d3.scaleLinear()
        .range([-legendWidth / 15, legendWidth/2])
        .domain([0, d3.max(data, function(d) {
          return d.max;
        })]);

      // Define x-axis
      var xAxis = d3.axisBottom()
        .ticks(15)
        .scale(xScale);

      // Set up X axis
      legendsvg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (72) + ")")
        .call(xAxis);
    });
