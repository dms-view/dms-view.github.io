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

      svg.select("#punchcard_y_label").text(metric_name.substring(4, ));
      svg.select(".y-axis").call(yAxis);

      svg.selectAll("path.logo")
      .data(dataToPlot)
      .join("path")
        .attr("class", "logo")
        .attr("d", d => {
          //console.log(d);
          var letter = fontObject.getPath(d["mutation"]);
          var height = letter.getBoundingBox().y2 - letter.getBoundingBox().y1;
          var letterWidth = letter.getBoundingBox().x2 - letter.getBoundingBox().x1;

          // TODO: letter widths are hardcoded here to some reasonable maximum
          // but we should dynamically identify the maximum width from all the
          // letters.
          letterWidth = 60;
          return fontObject.getPath(
            d["mutation"],
            xScale(d["site"]) + (xScale.bandwidth() / 2) - letterWidth / 2,
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
          var scale = (rectangle_height / height) * 0.9;
          var y = yScale(d["yStart"]);

          var letterWidth = letter.getBoundingBox().x2 - letter.getBoundingBox().x1;

          // TODO: calculate max letter width dynamically
          letterWidth = 60;
          var x = xScale(d["site"]); // + (xScale.bandwidth() / 2);
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
        .attr("fill", d => colorMap(d["mutation"]));
    });
  };

  return chart;
}
