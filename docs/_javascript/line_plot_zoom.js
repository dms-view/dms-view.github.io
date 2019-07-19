function genomeLineChart() {
  // Setup chart configuration.
  var divWidth = 760,
      divHeight = 350,
      margin = {
        top: divHeight * 0.04,
        right: 20,
        bottom: divHeight * (1 / 3),
        left: 40
      },
      margin2 = {
        top: divHeight * (4 / 5),
        right: 20,
        bottom: divHeight * 0.1,
        left: 40
      },
      svg_dx = divWidth,
      svg_dy = divHeight,
      plot_dx = svg_dx - margin.right - margin.left,
      plot_dy = svg_dy - margin.top - margin.bottom,
      plot_dy2 = svg_dy - margin2.top - margin2.bottom;

  function chart(selection) {
    selection.each(function (d) {
      var x = d3.scaleLinear().range([0, plot_dx]),
        x2 = d3.scaleLinear().range([0, plot_dx]),
        y = d3.scaleLinear().range([plot_dy, margin.top]),
        y2 = d3.scaleLinear().range([plot_dy2, margin.top]);

      // actually create the chart
      var svg = d3.select("#line_plot")
        .append("svg")
        .attr("width", svg_dx)
        .attr("height", svg_dy);

      // Add a clipping box to prevent focus plot from extending beyond the x-axis
      // domain.
      svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", plot_dx)
        .attr("height", plot_dy);

      // define the axis. There are two xAxes for the two plots but the context plot
      // does not have a y axis
      var xAxis = d3.axisBottom(x),
        xAxis2 = d3.axisBottom(x2),
        yAxis = d3.axisLeft(y);

      // This defines the brush. It should only be on the context plot
      var brush = d3.brushX()
        .extent([
          [0, 0],
          [plot_dx, plot_dy2]
        ])
        .on("brush end", brushed);

      // This defines the zoom. The zoom should on the min/max of the context plot?
      var zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([
          [0, 0],
          [plot_dx, plot_dy]
        ])
        .extent([
          [0, 0],
          [plot_dx, plot_dy2]
        ])
        .on("zoom", zoomed);

      // define context which is the smaller plot underneath
      var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

      // the context plot is an area plot right now
      var area2 = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function(d) {
          return x2(d.site);
        })
        .y0(plot_dy2)
        .y1(function(d) {
          return y2(d.abs_diffsel);
        });


      // this defines the focus (large) portion of the graph
      var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // define the line
      var valueline = d3.line()
        .x(function(d) {
          return x(d.site);
        })
        .y(function(d) {
          return y(d.abs_diffsel);
        });

      // define tooltip not working currently
      var tooltip = d3.select("#line_plot")
        .append("div")
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

      // Here is where we read in the data and create the plot
      var n = d.length;
      var lineData = d;

      // find the min and the max of x/y
      var d_extent_x = d3.extent(d, d => +d.site),
        d_extent_y = d3.extent(d, d => +d.abs_diffsel);


      // set the domains
      x.domain(d_extent_x);
      y.domain(d_extent_y);
      x2.domain(x.domain());
      y2.domain(y.domain());

      // make the context plot
      // Add the valueline path.
      focus.append("path")
        .datum(d)
        .attr("class", "line")
        .style("clip-path", "url(#clip)")
        .attr("d", valueline);

      var circlePoint = focus.append("g")
        .selectAll("circle")
        .data(d)
        .enter()
        .append("circle");

      function showTooltip(d) {
        mousePosition = d3.mouse(d3.event.target);
        d3.select(this).classed("hovered", true);

        return tooltip
          .style("visibility", "visible")
          .style("left", mousePosition[0] + "px")
          .style("top", mousePosition[1] + 50 + "px")
          .html("Site: (" + d.domain + ")" + d.chain_site + " <br/> " +
            "abs_diffsel: " + parseFloat(d.abs_diffsel).toFixed(2) + " <br/> " +
            "pos_diffsel: " + parseFloat(d.positive_diffsel).toFixed(2) + " <br/> " +
            "max_diffsel: " + parseFloat(d.max_diffsel).toFixed(2) + " <br/> " +
            "seq number: " + d.site)
      }

      function hideTooltip(d) {
        d3.select(this).classed("hovered", false);
        return tooltip.style("visibility", "hidden");
      }

      var circleAttributes = circlePoint
        .attr("r", 5)
        .attr("cx", (d) => x(+d.site))
        .attr("cy", (d) => y(+d.abs_diffsel))
        .attr("id", d => "site_" + d.site)
        .attr("class", "non_brushed")
        .style("clip-path", "url(#clip)")
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip)
        .on("click", function(d) {
          console.log("Select site: " + d.site);
          const selectedSite = parseInt(d.site);
          const selectedChain = d.chain;
          const selectedChainSite = d.chain_site;

          // if not already selected
          if (!d3.select(this).classed("selected")) {
            const selectedAbsDiffsel = Math.ceil(d.abs_diffsel)
            var colors = sessionStorage.getItem("colorTest")
            color_key = JSON.parse(colors);

            var rgbToHex = function(rgb) {
              var hex = Number(rgb).toString(16);
              if (hex.length < 2) {
                hex = "0" + hex;
              }
              return hex;
            };

            var fullColorHex = function(r, g, b) {
              var red = rgbToHex(r);
              var green = rgbToHex(g);
              var blue = rgbToHex(b);
              return red + green + blue;
            };

            d3.select(".focus").selectAll("circle").style("fill", "#999999");
            // Update circles in the line plot to reflect which sites have frequency data or not.
            d3.select(".focus").selectAll(".non_brushed").style("fill", function(d) {});
            d3.select(this).style("fill", color_key[selectedAbsDiffsel]).classed("selected", true);

            // Highlight the selected site on the protein structure.
            icn3dui.selectByCommand("." + selectedChain + ":" + selectedChainSite);
            icn3dui.setOption('color', fullColorHex(d3.rgb(color_key[selectedAbsDiffsel]).r, d3.rgb(color_key[selectedAbsDiffsel]).g, d3.rgb(color_key[selectedAbsDiffsel]).b));
          }
          // if already selected
          else {
            // return circle to baseline grey
            d3.select(this)
               .style('fill', 'grey')
               .classed("selected",false);
            // remove color on the protein structure.
            icn3dui.selectByCommand("." + selectedChain + ":" + selectedChainSite);
            icn3dui.setOption('color', 'grey');
              icn3dui.setStyle("proteins", "sphere");
              icn3dui.selectByCommand("." + selectedChain + ":" + selectedChainSite);
              icn3dui.setOption('color', fullColorHex(d3.rgb(color_key[selectedAbsDiffsel]).r, d3.rgb(color_key[selectedAbsDiffsel]).g, d3.rgb(color_key[selectedAbsDiffsel]).b));
          }
        });

      // xAxis.tickValues(d).tickFormat(d => d.H3_numbering)

      focus.append("g")
        .attr("class", "axis axis--x")
        .attr("id", "axis_x")
        .attr("transform", "translate(0," + plot_dy + ")")
        .call(xAxis);

      focus.append("g")
        .attr("class", "axis axis--y")
        .attr("id", "axis_y")
        .call(yAxis);

      svg.append("text")
        .attr("transform", "translate(" + (svg_dx / 2) + ", " + (15) + ")")
        .style("text-anchor", "middle")
        .text("Evolution in the lab")
        .style("font-weight", "bold");

      svg
        .append("text")
        .attr("transform", "translate(" + (svg_dx / 2) + ", " + (plot_dy + 50) + ")")
        .style("text-anchor", "middle")
        .text("Site");

      svg
        .append("text")
        .attr("transform", "translate(" + (12) + ", " + (plot_dy + 30) + ") rotate(-90)")
        .text("Absolute differential selection");

      // make the smaller plot (called context in the tutorial)
      context.append("path")
        .datum(d)
        .attr("class", "area")
        .attr("d", area2);

      context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + plot_dy2 + ")")
        .call(xAxis2);

      // add in the brush
      context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

      function brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        var s = d3.event.selection || x2.range();
        x.domain(s.map(x2.invert, x2));
        focus.select(".line").attr("d", valueline);
        focus.selectAll("circle")
          .attr("cx", (d) => x(+d.site))
          .attr("cy", (d) => y(+d.abs_diffsel))
        focus.select(".axis--x").call(xAxis);
        svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
          .scale(plot_dx / (s[1] - s[0]))
          .translate(-s[0], 0));
      }

      function zoomed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        var t = d3.event.transform;
        x.domain(t.rescaleX(x2).domain());
        focus.select(".line").attr("d", valueline);
        focus.selectAll("circle")
          .attr("cx", (d) => x(+d.site))
          .attr("cy", (d) => y(+d.abs_diffsel));
        focus.select(".axis--x").call(xAxis);
        context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
      }
    });
  }

  return chart;
}

var chart = genomeLineChart();
d3.csv("_data/2009-age-65-sitediffsel-median_processed.csv").then(data =>
  d3.select("#line_plot")
    .data([data])
    .call(chart)
);
