function logoplotChart(selection) {
  var colorScheme = "functional";
  var divWidth = 760,
      divHeight = 250,
      margin = {top: 40, left: 40, bottom: 0, right: 0},
      width = divWidth - margin.left - margin.right,
      height = divHeight - margin.top - margin.bottom,
      fontSize = 100,
      maxSitesToLabel = 20,
      siteLabelInterval = 5;

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
    .attr("transform", "translate(" + (12) + ", " + (height - 80) + ") rotate(-90)")
    .style("text-anchor", "middle")
    .attr("id", "logoplot_y_label");

  // Create a genome line chart for the given selection.
  function chart(selection) {
    // Get the width of each letter for the requested font size. For fixed width
    // font, the advance width should always be the same size for all
    // letters. We calculate this width once here and reuse it during logoploto
    // transforms later. See also, the opentype.js docs for more details:
    // https://github.com/opentypejs/opentype.js/blob/master/README.md#fontgetadvancewidthtext-fontsize-options
    var letterWidth = fontObject.getAdvanceWidth("X", fontSize);

    selection.each(function (data) {
      var sites = [...new Set(data.map(d => +d.site))].sort((a, b) => a - b);
      var mutations = [...new Set(data.map(d => d.mutation))].sort();
      if(data.length == 0){
        var metric_name = "";
      }
      else {
        var metric_name = data[0].metric_name;
      }
      xScale.domain(sites);
      zScale.domain(mutations);

      // When the width of the logo letters is less than the width of the
      // scale's bandwidth, each letter needs to be repositioned to the right
      // such that it centers above the corresponding axis tick. This
      // repositioning is calculated by an x-axis offset based on half the
      // bandwidth minus half the letter width. This offset is not needed when
      // the bandwidth is less than the letter width, since the letters will be
      // scaled down to the bandwidth by a transform.
      let logoXOffset = 0;
      if (letterWidth < xScale.bandwidth()) {
        logoXOffset = (xScale.bandwidth() / 2) - letterWidth / 2;
      }

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

      const sortMetricAscending = (a, b) => (a["metric"] > b["metric"] ? 1 : (a["metric"] < b["metric"] ? -1 : 0));
      const sortMetricDescending = (a, b) => (-1 * sortMetricAscending(a, b));

      const residuesBySite = Array.from(
        d3.groups(
          chart.data.sort(sortMetricAscending),
          d => d["site"]
        ).values()
      );

      residuesBySite.forEach(([site, residues]) => {
         // Plot residues with positive values starting from zero and increasing
         // up the y axis.
        let base = 0.0;
        for (let record of residues) {
          if (record["metric"] >= 0) {
            record["yStart"] = base;
            record["yEnd"] = base + record["metric"];
            base = record["yEnd"];
          }
        }

        // Plot residues with negative values in descending order from zero
        // down the y axis.
        descendingResidues = residues.sort(sortMetricDescending);
        base = 0.0;
        for (let record of descendingResidues) {
          if (record["metric"] < 0) {
            // Calculate start and end positions on the y axis such that letters
            // grow "down" the axis. This means the base line from which each
            // letter is plotted corresponds to the "end" (or maximum) value.
            record["yEnd"] = base;
            record["yStart"] = base + record["metric"];
            base = record["yStart"];
          }
        }
      });

      const dataToPlot = residuesBySite.map(d => d[1]).flat();
      chart.dataToPlot = dataToPlot;

      // Calculate the y domain from the maximum stack position.
      yScale.domain([
        d3.min(dataToPlot, d => d["yStart"]),
        d3.max(dataToPlot, d => d["yEnd"])
      ]).nice();

      // Calculate the color domain.
      if(dataToPlot[0]){
        colorScheme =  dataToPlot[0].color_scheme
      }
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
        dataToPlot.forEach(function(d){
          d["color_for_mutation"] = functionalColors[d["mutation"]]
        })
      }
      else if(colorScheme == 'custom'){
        dataToPlot.forEach(function(d){
          if(d["color_for_mutation"] == 'functional'){
            d["color_for_mutation"] = functionalColors[d["mutation"]]
          }
        })
      }
      else{
        dataToPlot.forEach(function(d){
          d["color_for_mutation"] = zScale[d["mutation"]]
        })
      };
      svg.select(".x-axis").call(xAxis.tickFormat(function(site, i) {
        // Display a tick label for each site up to the maximum number of
        // allowed sites and then switch to displaying tick labels at a fixed
        // interval defined above (e.g., every 5 sites). This prevents crowding
        // of tick labels that make them unreadable.
        if (sites.length < maxSitesToLabel || i % siteLabelInterval == 0) {
          return siteMap.get(site)["label"];
        }
        else {
          return "";
        }
      }));

      svg.select("#logoplot_y_label").text(metric_name.substring(4, ));
      svg.select(".y-axis").call(yAxis);

      // Create the base tooltip object.
      const logoTooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip-for-logo-plot")
        .style("font-family", "'Open Sans', sans-serif")
        .style("text-align", "left")
        .style("position", "absolute")
        .style("font-size", "20px")
        .style("z-index", "20")
        .style("background", "white")
        .style("padding", "5px")
        .style("border", "1px solid #cccccc")
        .style("border-radius", "10px")
        .style("visibility", "hidden");

      function round(value, decimals) {
        // From: https://www.jacklmoore.com/notes/rounding-in-javascript/
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
      }

      function showTooltip(d) {
        d3.select(this).classed("hovered", true);

        return logoTooltip
          .style("visibility", "visible")
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY + 10) + "px")
          .html("Site: " + d.label_site + "<br/>"  +
                d.mutation + ": " + round(d.metric, 2))
      }

      function hideTooltip(d) {
        d3.select(this).classed("hovered", false);
        return logoTooltip.style("visibility", "hidden");
      }

      svg.selectAll("path.logo")
      .data(dataToPlot)
      .join("path")
        .attr("class", "logo")
        .attr("d", d => {
          var letter = fontObject.getPath(d["mutation"]);
          var height = letter.getBoundingBox().y2 - letter.getBoundingBox().y1;

          return fontObject.getPath(
            d["mutation"],
            xScale(d["site"]) + logoXOffset,
            yScale(d["yStart"]),
            fontSize
          ).toPathData();
        })
        .attr("transform", d => {
          var letter = fontObject.getPath(d["mutation"], 0, 0, fontSize);

          // Calculate the amount to vertically scale each letter based on the
          // actual letter height and the expected height from the y-axis scale.
          // We further shrink this scale value by a fixed amount to add whitespace
          // above and below letters in the stack.
          var height = letter.getBoundingBox().y2 - letter.getBoundingBox().y1;
          var rectangle_height = yScale(d["yStart"]) - yScale(d["yEnd"]);
          var scale = (rectangle_height / height);
          var y = yScale(d["yStart"]);
          var x = xScale(d["site"]) + logoXOffset;
          var desiredWidth = xScale.bandwidth();

          // Scale the width of letters to match the bandwidth of the x-axis
          // scale when the letter is wider than the scale. When the letter is
          // smaller than the bandwidth, do not scale up the letter as it becomes
          // illegible.
          var widthScale = desiredWidth / letterWidth;
          if (widthScale > 1.0) {
            widthScale = 1.0
          }

          // Scaling requires the object to be first moved (translated) to its
          // desired x, y position, scaled, and then moved back by the same amount.
          return `translate(+${x} +${y}) scale(${widthScale} ${scale}) translate(-${x} -${y})`;
        })
        .attr("fill", d => d["color_for_mutation"])
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);
    });
  };

  return chart;
}
