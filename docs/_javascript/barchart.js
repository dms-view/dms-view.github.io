function stackedBarChart() {
  var divWidth = 760,
      divHeight = 250,
      margin = {top: 40, left: 40, bottom: 0, right: 0},
    	width = divWidth - margin.left - margin.right,
    	height = divHeight - margin.top - margin.bottom;

  // Create a genome line chart for the given selection.
  function chart(selection) {
    selection.each(function (data) {
      // Calculate the absolute differential selection for plotting.
      data.forEach(
        function (d) {
          d.absmutdiffsel = Math.abs(+d.mutdiffsel);
          return d;
        }
      )

      // Bind the data to the chart function.
      chart.data = data;

      // Create the base chart SVG object.
      var svg = d3.select(this)
        .append("svg")
        .attr("width", divWidth)
        .attr("height", divHeight);

    	var sites = [...new Set(data.map(d => d.site))];
      var mutations = [...new Set(data.map(d => d.mutation))];
      console.log(sites);
      console.log(mutations);

    	var x = d3.scaleBand(
        data.map(d => d.site),
    		[margin.left, width - margin.right]
      ).padding(0.1);
    	var y = d3.scaleLinear()
    		.rangeRound([height - margin.bottom, margin.top]);

    	var xAxis = svg.append("g")
    		.attr("transform", `translate(0,${height - margin.bottom})`)
    		.attr("class", "x-axis");

    	var yAxis = svg.append("g")
    		.attr("transform", `translate(${margin.left},0)`)
    		.attr("class", "y-axis");

    	var z = d3.scaleOrdinal()
    		.domain(mutations)
        .range(d3.schemeCategory10);

      // Set x-axis label.
      svg
        .append("text")
        .attr("transform", "translate(" + (divWidth / 2) + ", " + (height + 30) + ")")
        .style("text-anchor", "middle")
        .text("Site");

      // Set y-axis label.
      svg
        .append("text")
        .attr("transform", "translate(" + (12) + ", " + (height + 10) + ") rotate(-90)")
        .text("Absolute differential selection");

      //x.domain();

      diffselBySite = d3.rollups(
        data,
        v => d3.sum(v, d => d.absmutdiffsel),
        d => d.site
      );
      maxDiffselBySite = d3.max(diffselBySite, d => d[1]);
  		y.domain([0, maxDiffselBySite]).nice();
      console.log(diffselBySite);

  		svg.selectAll(".y-axis")
  			.call(d3.axisLeft(y).ticks(null, "s"));

  		svg.selectAll(".x-axis")
  			.call(d3.axisBottom(x).tickSizeOuter(0));

      // svg.selectAll("bars")
      //   .data(diffselBySite)
      //   .enter()
      //   .append("rect")
      //     .attr("x", d => x(d[0]))
      //     .attr("y", d => y(+d[1]))
      //     .attr("width", x.bandwidth())
      //     .attr("height", d => height - y(+d[1]))
      //     .attr("fill", "#cccccc");

      var dataBySite = d3.groups(data, d => d.site);
  		var group = svg.selectAll("g.layer")
  			.data(dataBySite);

  		group.exit().remove();

  		group.enter().append("g")
  			.classed("layer", true)
  			.attr("fill", "#999999");

  		var bars = svg.selectAll("g.layer").selectAll("rect")
  			.data(d => d, e => e[0]);

  		bars.exit().remove();

  		bars.enter().append("rect")
  			.attr("width", x.bandwidth())
  			.merge(bars)
  			.attr("x", d => x(d[0]))
  			.attr("y", d => y(d[1]))
  			.attr("height", d => y(d[0]) - y(d[1]));
    });
  };

  return chart;
}

var barChart = stackedBarChart();
d3.csv("_data/2009-age-65-per-site-data.csv").then(data =>
  d3.select("#bar_chart")
    .data([data])
    .call(barChart)
);
