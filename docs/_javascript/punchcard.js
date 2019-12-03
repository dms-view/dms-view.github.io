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
    .attr("transform", "translate(" + (12) + ", " + (height - 40) + ") rotate(-90)")
    .attr("id", "punchcard_y_label");

  // Create a genome line chart for the given selection.
  function chart(selection) {
    selection.each(function (data) {
      var sites = [...new Set(data.map(d => d.site))].sort();
      var mutations = [...new Set(data.map(d => d.mutation))].sort();
      if(data.length == 0){
        var metric_name = "";
      }
      else {
        var metric_name = data[0].metric_name;
      }

      xScale.domain(sites);
      zScale.domain(mutations);

      // Convert long data to wide format for stacking.
      var siteMap = new Map();
      data.forEach(function (d) {
        if (siteMap.get(d.site) === undefined) {
          siteMap.set(d.site, {"site": d.site, "label": d.label_site});
        }

        siteMap.get(d.site)[d.mutation] = d.metric;
      });

      // Convert wide data map to an array.
      chart.data = data;

      const residuesBySite = Array.from(
        d3.groups(
          chart.data.sort(
            (a, b) => (a["metric"] > b["metric"] ? 1 : (a["metric"] < b["metric"] ? -1 : 0))
          ),
          d => d["site"]
        ).values()
      );

      residuesBySite.forEach(([site, residues]) => {
        let base = 0.0;
        for (let record of residues) {
          record["yStart"] = base;
          record["yEnd"] = base + record["metric"];
          base = record["yEnd"];
        }
      });

      const dataToPlot = residuesBySite.map(d => d[1]).flat();
      chart.dataToPlot = dataToPlot;
      console.log("Residues by site:");
      console.log(dataToPlot);

      // Calculate the y domain from the maximum stack position.
      yScale.domain([0, d3.max(dataToPlot, d => d["yEnd"])]);

      // Calculate the color domain.
      zScale.range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), mutations.length).reverse())
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

      svg.select(".x-axis").call(xAxis.tickFormat(function(site) {
          return siteMap.get(site)["label"];
      }));

      svg.select("#punchcard_y_label").text(metric_name);
      svg.select(".y-axis").call(yAxis);

      svg.selectAll("path.logo")
      .data(dataToPlot)
      .join("path")
        .attr("class", "logo")
        .attr("d", d => {
          //console.log(d);
          var letter = fontObject.getPath(d["mutation"]);
          var height = letter.getBoundingBox().y2 - letter.getBoundingBox().y1;
          var width = letter.getBoundingBox().x2 - letter.getBoundingBox().x1;
          return fontObject.getPath(
            d["mutation"],
            xScale(d["site"]) + (xScale.bandwidth() / 2) - width / 2,
            yScale(d["yStart"]),
            fontSize
          ).toPathData();
        })
        .attr("transform", d => {
          var letter = fontObject.getPath(d["mutation"], 0, 0, fontSize);
          var height = letter.getBoundingBox().y2 - letter.getBoundingBox().y1;
          var rectangle_height = yScale(d["yStart"]) - yScale(d["yEnd"]);
          var scale = rectangle_height / height;
          var y = yScale(d["yStart"]);
          return `translate(0 +${y}) scale(1.0 ${scale}) translate(0 -${y})`;
        })
        .attr("fill", d => colorMap(d["mutation"]));
    });
  };

  return chart;
}
