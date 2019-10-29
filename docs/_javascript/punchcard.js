function punchCardChart(selection) {
  var colorScheme = 'functional';
  var divWidth = 760,
      divHeight = 250,
      margin = {top: 40, left: 40, bottom: 0, right: 0},
      width = divWidth - margin.left - margin.right,
      height = divHeight - margin.top - margin.bottom,
      fontSize = 100;

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
          siteMap.set(d.site, {"site": d.site, "label": d.label_site});
        }

        siteMap.get(d.site)[d.mutation] = d.absmutdiffsel;
      });

      // Convert wide data map to an array.
      var wideData = Array.from(siteMap.values());

      // Stack the wide data by mutations for plotting a stacked barchart.
      var series = d3.stack().keys(mutations)(wideData);

      // Annotate each stacked element with its parent key.
      series.forEach(s => s.forEach(d => { d["key"] = s.key }))
      chart.series = series;

      // Calculate the y domain from the maximum stack position.
      yScale.domain([0, d3.max(series, d => d3.max(d, d => d[1]))]);

      // Calculate the color domain.
      zScale.range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), series.length).reverse())
        .unknown("#cccccc");
      var functionalColors = {
       'G': '#f76ab4',
       'A': '#f76ab4',
       'S': '#ff7f00',
       'T': '#ff7f00',
       'C': '#ff7f00',
       'V': '#12ab0d',
       'L': '#12ab0d',
       'I': '#12ab0d',
       'M': '#12ab0d',
       'P': '#12ab0d',
       'F': '#84380b',
       'Y': '#84380b',
       'W': '#84380b',
       'D': '#e41a1c',
       'E': '#e41a1c',
       'H': '#3c58e5',
       'K': '#3c58e5',
       'R': '#3c58e5',
       'N': '#972aa8',
       'Q': '#972aa8',
       'unknown': "#cccccc"
      };
      if(colorScheme == "functional"){
        var colorMap = function(key){return functionalColors[key]};
      }
      else{
        var colorMap = zScale;
      };


        svg.select(".x-axis").call(xAxis.tickFormat(function(site){
          return siteMap.get(site)["label"];
      }));
      svg.select(".y-axis").call(yAxis);

      svg.selectAll("g.bar_letter")
        .data(series)
        .join("g")
          .attr("class", "bar_letter")
        .selectAll("path.logo")
        .data(d => d)
        .join("path")
          .attr("class", "logo")
          .attr("d", d => {
            var letter = fontObject.getPath(d.key);
            var height = letter.getBoundingBox().y2 - letter.getBoundingBox().y1;
            var width = letter.getBoundingBox().x2 - letter.getBoundingBox().x1;
            return fontObject.getPath(
              d.key,
              xScale(d.data.site) + (xScale.bandwidth() / 2) - width / 2,
              yScale(d[0]),
              fontSize
            ).toPathData();
          })
          .attr("transform", d => {
            var letter = fontObject.getPath(d.key, 0, 0, fontSize);
            var height = letter.getBoundingBox().y2 - letter.getBoundingBox().y1;
            var rectangle_height = yScale(d[0]) - yScale(d[1]);
            var scale = rectangle_height / height;
            var y = yScale(d[0]);
            return `translate(0 +${y}) scale(1.0 ${scale}) translate(0 -${y})`;
          })
          .attr("fill", d => colorMap(d.key));
    });
  };

  return chart;
}
