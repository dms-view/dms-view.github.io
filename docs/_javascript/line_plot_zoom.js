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
      brushFocus = d3.brush().extent([[0, 0], [plotWidth, plotHeightFocus]]),
      zoomContext = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [plotWidth, plotHeightFocus]])
        .extent([[0, 0], [plotWidth, plotHeightContext]]);

  // Create a genome line chart for the given selection.
  function chart(selection) {
    selection.each(function (data) {
      data.forEach(d => { Object.keys(d).forEach(function (key) { if (key.startsWith("mut_") || key == "mutation") { delete d[key] } }) });
      data = d3.rollups(data, v => v[0], d => d.site).map(d => d[1]);
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
      brushFocus.on("brush end", brushedFocus);
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
      yScaleFocus.domain(d3.extent(data, d => +d.site_absdiffsel));
      xScaleContext.domain(xScaleFocus.domain());
      yScaleContext.domain(yScaleFocus.domain());

      // Create the context plot, drawing a line through all of the data points.
      focus.append("path")
        .datum(data)
        .attr("class", "line")
        // .style("clip-path", "url(#clip)")
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
          .html("Site: (" + d.protein_chain + ")" + d.protein_site + " <br/> " +
            "abs_diffsel: " + parseFloat(d.site_absdiffsel).toFixed(2) + " <br/> " +
            "pos_diffsel: " + parseFloat(d.positive_diffsel).toFixed(2) + " <br/> " +
            "max_diffsel: " + parseFloat(d.max_diffsel).toFixed(2) + " <br/> " +
            "seq number: " + d.site)
      }

      function hideTooltip(d) {
        d3.select(this).classed("hovered", false);
        return tooltip.style("visibility", "hidden");
      }

      // selection by clicking
      function selectPoint(d) {
        console.log("Select site: " + d.site);
        const selectedSite = parseInt(d.site);
        const selectedChain = d.protein_chain;
        const selectedChainSite = d.protein_site;
        const selectedAbsDiffsel = Math.ceil(d.site_absdiffsel);
        console.log("Select site: " + selectedSite + " (" + selectedChain + selectedChainSite + ")");

        // if not already selected
        if (!d3.select(this).classed("selected")) {
          var colors = sessionStorage.getItem("colorTest")
          color_key = JSON.parse(colors);

          // Update circles in the line plot to reflect which sites have frequency data or not.
          d3.select(this).style("fill", color_key[selectedAbsDiffsel]).classed("selected", true);
          d3.selectAll(".selected").data().forEach(function(element) {
            selectSite(":"+element.protein_chain+ " and "+ element.protein_site, color_key[Math.ceil(element.site_absdiffsel)])
          });
        }

        // if already selected
        else {
          // return circle to baseline grey
          d3.select(this)
             .style('fill', 'grey')
             .classed("selected",false);
          // remove color on the protein structure.
          deselectSite(":"+selectedChain+ " and "+ selectedChainSite)
        }

        chart.selectedSites = d3.selectAll(".selected").data().map(d => +d.site);
        console.log("Selected sites: " + chart.selectedSites);

        d3.select("#punchcard_chart")
          .data([perSiteData.filter(d => chart.selectedSites.includes(+d.site))])
          .call(punchCard);
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

    // Enable brushing in the focus plot.
        focus.append("g")
          .attr("class", "brush")
          .call(brushFocus)
          .selectAll('rect')
          .attr('height', marginFocus.top);

    // Zoom when you brush the contex plot
      function brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        var s = d3.event.selection || xScaleContext.range();
        xScaleFocus.domain(s.map(xScaleContext.invert, xScaleContext));
        focus.select(".line").attr("d", lineFocus);
        focus.selectAll("circle")
          .attr("cx", (d) => xScaleFocus(+d.site))
          .attr("cy", (d) => yScaleFocus(+d.site_absdiffsel))
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
          .attr("cy", (d) => yScaleFocus(+d.site_absdiffsel));
        focus.select(".axis--x").call(xAxisFocus);
        context.select(".brush").call(brushContext.move, x.range().map(t.invertX, t));
      }


      // this gathers info about the brushed sites in the focus plot
      function brushedFocus(){
        extent = d3.event.selection
        circlePoint.classed("brushed", function(d){return isBrushed(extent, d)});
        circlePoint.classed("non_brushed", function(d){return ! isBrushed(extent, d)});
        d3.selectAll(".brushed").classed("brush_selected", true);

        brushedFocusProtein();
      }

      var brushedFocusProtein = _.debounce(function() {
        // select the brushed sites
        d3.selectAll(".brushed").each(function(element) {
          selectSite(":"+element.protein_chain+ " and "+ element.protein_site, color_key[Math.ceil(element.site_absdiffsel)])
          d3.select(this).style("fill", color_key[Math.ceil(element.site_absdiffsel)]);
        });

        // deselct points sites which were brushed and are now not-brushed
        d3.selectAll(".non_brushed.brush_selected").each(function(element){
          deselectSite(":"+element.protein_chain+" and " +element.protein_site)
        })
        d3.selectAll(".non_brushed.brush_selected").style('fill', 'grey').classed("brush_selected", false)


      }, 15);

      // determines if a point is in the brush or not
      function isBrushed(brush_coords, d) {
        cx = xScaleFocus(d.site);
        cy = yScaleFocus(d.site_absdiffsel);
        if (brush_coords == null){
          return false
        }
        else{
           var x0 = brush_coords[0][0],
               x1 = brush_coords[1][0],
               y0 = brush_coords[0][1],
               y1 = brush_coords[1][1];
          return x0 <= cx && cx <= x1 && y0 <= cy &&  cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
        }
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
    return yScaleFocus(+d.site_absdiffsel);
  }

  function YContext(d) {
    return yScaleContext(+d.site_absdiffsel);
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
