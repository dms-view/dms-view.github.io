function rgbToHex(rgb) {
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;
}

function fullColorHex(r, g, b) {
  var red = rgbToHex(r);
  var green = rgbToHex(g);
  var blue = rgbToHex(b);
  return red + green + blue;
}

function genomeLineChart() {
  // Setup chart configuration.
  var divWidth = 760,
      divHeight = 350,
      marginFocus = {
        top: divHeight * 0.04,
        right: 20,
        bottom: divHeight * (1 / 3),
        left: 40
      },
      marginContext = {
        top: divHeight * (4 / 5),
        right: 20,
        bottom: divHeight * 0.1,
        left: 40
      },
      plotWidth = divWidth - marginFocus.right - marginFocus.left,
      plotHeightFocus = divHeight - marginFocus.top - marginFocus.bottom,
      plotHeightContext = divHeight - marginContext.top - marginContext.bottom,
      xScaleFocus = d3.scaleLinear().range([0, plotWidth]),
      xScaleContext = d3.scaleLinear().range([0, plotWidth]),
      yScaleFocus = d3.scaleLinear().range([plotHeightFocus, marginFocus.top]),
      yScaleContext = d3.scaleLinear().range([plotHeightContext, marginFocus.top]),
      xAxisFocus = d3.axisBottom(xScaleFocus),
      xAxisContext = d3.axisBottom(xScaleContext),
      yAxis = d3.axisLeft(yScaleFocus),
      lineFocus = d3.line().x(XFocus).y(YFocus),
      areaContext = d3.area().curve(d3.curveMonotoneX).x(XContext).y0(plotHeightContext).y1(YContext),
      brushContext = d3.brushX().extent([[0, 0], [plotWidth, plotHeightContext]]),
      zoomContext = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [plotWidth, plotHeightFocus]])
        .extent([[0, 0], [plotWidth, plotHeightContext]]);

  // Create a genome line chart for the given selection.
  function chart(selection) {
    selection.each(function (data) {
      // Bind the data to the chart function.
      chart.data = data;

      // Create the base chart SVG object.
      var svg = d3.select(this)
        .append("svg")
        .attr("width", divWidth)
        .attr("height", divHeight);

      // Add a clipping box to prevent focus plot from extending beyond the x-axis
      // domain.
      svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", plotWidth)
        .attr("height", plotHeightFocus);

      // Update the context brush and zoom.
      brushContext.on("brush end", brushed);
      zoomContext.on("zoom", zoomed);

      // Create the context plot which shows the whole genome view below the
      // focus plot.
      var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + marginContext.left + "," + marginContext.top + ")");

      // Create the focus plot which shows the selected region of the whole
      // genome from the context plot.
      var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + marginFocus.left + "," + marginFocus.top + ")");

      // Update the x and y domains to match the extent of the incoming data.
      xScaleFocus.domain(d3.extent(data, d => +d.site));
      yScaleFocus.domain(d3.extent(data, d => +d.abs_diffsel));
      xScaleContext.domain(xScaleFocus.domain());
      yScaleContext.domain(yScaleFocus.domain());

      // Create the context plot, drawing a line through all of the data points.
      focus.append("path")
        .datum(data)
        .attr("class", "line")
        .style("clip-path", "url(#clip)")
        .attr("d", lineFocus);

      // Plot a circle for each site in the given data.
      var circlePoint = focus.append("g")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle");

      // Create the base tooltip object.
      var tooltip = d3.select(this)
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

      function selectPoint(d) {
        console.log("Select site: " + d.site);
        const selectedSite = parseInt(d.site);
        const selectedChain = d.chain;
        const selectedChainSite = d.chain_site;

        // if not already selected
        if (!d3.select(this).classed("selected")) {
          const selectedAbsDiffsel = Math.ceil(d.abs_diffsel)
          var colors = sessionStorage.getItem("colorTest")
          color_key = JSON.parse(colors);
          loadStructure("rcsb://4O5N.cif", ":"+selectedChain+ " and "+ selectedSite, color_key[selectedAbsDiffsel])


          d3.select(".focus").selectAll("circle").style("fill", "#999999");
          // Update circles in the line plot to reflect which sites have frequency data or not.
          d3.select(".focus").selectAll(".non_brushed").style("fill", function(d) {});
          d3.select(this).style("fill", color_key[selectedAbsDiffsel]).classed("selected", true);
        }
        // if already selected
        else {
          // return circle to baseline grey
          d3.select(this)
             .style('fill', 'grey')
             .classed("selected",false);
          // remove color on the protein structure.
          loadStructure("rcsb://4O5N.cif", ":"+selectedChain+ " and "+ selectedSite, greyColor)
        }
      }

      var circleAttributes = circlePoint
        .attr("r", 5)
        .attr("cx", XFocus)
        .attr("cy", YFocus)
        .attr("id", d => "site_" + d.site)
        .attr("class", "non_brushed")
        .style("clip-path", "url(#clip)")
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip)
        .on("click", selectPoint);

      // xAxis.tickValues(d).tickFormat(d => d.H3_numbering)

      // Create the x-axis for the focus plot.
      focus.append("g")
        .attr("class", "axis axis--x")
        .attr("id", "axis_x")
        .attr("transform", "translate(0," + plotHeightFocus + ")")
        .call(xAxisFocus);

      // Create the y-axis for the focus plot.
      focus.append("g")
        .attr("class", "axis axis--y")
        .attr("id", "axis_y")
        .call(yAxis);

      // Set chart title.
      svg.append("text")
        .attr("transform", "translate(" + (divWidth / 2) + ", " + (15) + ")")
        .style("text-anchor", "middle")
        .text("Evolution in the lab")
        .style("font-weight", "bold");

      // Set x-axis label for the focus plot.
      svg
        .append("text")
        .attr("transform", "translate(" + (divWidth / 2) + ", " + (plotHeightFocus + 50) + ")")
        .style("text-anchor", "middle")
        .text("Site");

      // Set y-axis label for the focus plot.
      svg
        .append("text")
        .attr("transform", "translate(" + (12) + ", " + (plotHeightFocus + 30) + ") rotate(-90)")
        .text("Absolute differential selection");

      // Create the context plot.
      context.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", areaContext);

      // Create the x-axis for the context plot.
      context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + plotHeightContext + ")")
        .call(xAxisContext);

      // Enable brushing in the context plot.
      context.append("g")
        .attr("class", "brush")
        .call(brushContext)
        .call(brushContext.move, xScaleFocus.range());

      function brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        var s = d3.event.selection || xScaleContext.range();
        xScaleFocus.domain(s.map(xScaleContext.invert, xScaleContext));
        focus.select(".line").attr("d", lineFocus);
        focus.selectAll("circle")
          .attr("cx", (d) => xScaleFocus(+d.site))
          .attr("cy", (d) => yScaleFocus(+d.abs_diffsel))
        focus.select(".axis--x").call(xAxisFocus);
        svg.select(".zoom").call(zoomContext.transform, d3.zoomIdentity
          .scale(plotWidth / (s[1] - s[0]))
          .translate(-s[0], 0));
      }

      function zoomed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        var t = d3.event.transform;
        x.domain(t.rescaleX(xScaleContext).domain());
        focus.select(".line").attr("d", lineFocus);
        focus.selectAll("circle")
          .attr("cx", (d) => xScaleFocus(+d.site))
          .attr("cy", (d) => yScaleFocus(+d.abs_diffsel));
        focus.select(".axis--x").call(xAxisFocus);
        context.select(".brush").call(brushContext.move, x.range().map(t.invertX, t));
      }
    });
  }

  // Define accessors for x-axis values in the focus and context panels.
  function XFocus(d) {
    return xScaleFocus(+d.site);
  }

  function XContext(d) {
    return xScaleContext(+d.site);
  }

  // Define accessors for y-axis values in the focus and context panels.
  function YFocus(d) {
    return yScaleFocus(+d.abs_diffsel);
  }

  function YContext(d) {
    return yScaleContext(+d.abs_diffsel);
  }

  // Define getters and setters for chart dimensions using Mike Bostock's idiom.
  chart.width = function(_) {
    if (!arguments.length) return divWidth;
    divWidth = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return divHeight;
    divHeight = _;
    return chart;
  };

  return chart;
}

var chart = genomeLineChart();
d3.csv("https://raw.githubusercontent.com/jbloomlab/dms-view/master/docs/_data/2009-age-65-sitediffsel-median_processed.csv?token=ADDHJTRXCEDDBHI7BM2GQH25JH6CU").then(data =>
  d3.select("#line_plot")
    .data([data])
    .call(chart)
);
