function punchCardChart(selection) {
  var divWidth = 760,
      divHeight = 250,
      margin = {top: 40, left: 40, bottom: 0, right: 0},
    	width = divWidth - margin.left - margin.right,
    	height = divHeight - margin.top - margin.bottom;

  // Create the base chart SVG object.
  var svg = d3.select(selection)
    .append("svg")
    .attr("width", divWidth)
    .attr("height", divHeight);

  var xScale = d3.scaleBand().range(
    [margin.left, width - margin.right]
  ).padding(0.1);
  var yScale = d3.scaleLinear()
    .rangeRound([height - margin.bottom, margin.top]);

  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .attr("class", "x-axis")
    .call(xAxis);

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .attr("class", "y-axis")
    .call(yAxis);

  var zScale = d3.scaleOrdinal();

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

  // Create a genome line chart for the given selection.
  function chart(selection) {
    selection.each(function (data) {
      var sites = [...new Set(data.map(d => d.site))].sort();
      var mutations = [...new Set(data.map(d => d.mutation))].sort();

      xScale.domain(sites);
      zScale.domain(mutations);

      // Convert long data to wide format for stacking.
      var siteMap = new Map();
      data.forEach(function (d) {
        if (siteMap.get(d.site) === undefined) {
          siteMap.set(d.site, {"site": d.site});
        }

        siteMap.get(d.site)[d.mutation] = d.absmutdiffsel;
      });

      // Convert wide data map to an array.
      var wideData = Array.from(siteMap.values());

      // Stack the wide data by mutations for plotting a stacked barchart.
      var series = d3.stack().keys(mutations)(wideData);
      chart.series = series;

      // Calculate the y domain from the maximum stack position.
      yScale.domain([0, d3.max(series, d => d3.max(d, d => d[1]))]);

      // Calculate the color domain.
      zScale.range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), series.length).reverse())
        .unknown("#cccccc");

      svg.select(".x-axis").call(xAxis);
      svg.select(".y-axis").call(yAxis);

      svg.selectAll("g.bar")
        .data(series)
        .join("g")
          .attr("class", "bar")
          .attr("fill", d => zScale(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
          .attr("x", (d, i) => xScale(d.data.site))
          .attr("y", d => yScale(d[1]))
          .attr("height", d => yScale(d[0]) - yScale(d[1]))
          .attr("width", xScale.bandwidth());

      svg.selectAll("g.bar_letter")
        .data(series)
        .join("g")
          .attr("class", "bar_letter")
        .selectAll("text")
        .data(d => d)
        .join("text")
          .attr("x", (d, i) => xScale(d.data.site) + (xScale.bandwidth() / 2))
          .attr("y", d => yScale(d[1]) + yScale(d[0]) - yScale(d[1]))
          .attr("font-family", "monospace")
          .attr("font-size", d => yScale(d[0]) - yScale(d[1]))
          .attr("text-anchor", "middle")
          .attr("fill", "#000000")
          .text(function (d) { return d3.select(this.parentNode).datum().key; });
    });
  };

  return chart;
}

var perSiteData;
var punchCard = punchCardChart("#punchcard_chart");
d3.csv("_data/2009-age-65-per-site-data.csv").then(function (data) {
  // Calculate the absolute differential selection for plotting.
  data.forEach(
    function (d) {
      d.absmutdiffsel = Math.abs(+d.mutdiffsel);
      d.isite = +d.isite;
      return d;
    }
  )

  // Bind the data to the chart function.
  perSiteData = data;
  console.log(perSiteData);
});
