/*
LINE plot to display site-level data.

This plot has two parts:
(1) FOCUS plot (line plot)
Each point is the value for the given site for the selected metric.
A line connects the points in residue order.
Points can be selected by **clicking** or by **brushing**.
Tooltip gives details-on-demand for each point.
The domain of the focus plot is determined by the CONTEXT plot.

(2) CONTEXT plot (area plot)
The selected metric is shown as an area plot across **all** sites.
Regions of the x-axis can be selected using the brush.
The FOCUS plot's x-axis is updated to reflect the CONTEXT plot's selection.

This plot is the main way in which the user interacts with the data.
Selections made on the LINE plot will be reflect on the PROTEIN structure
and in the LOGOPLOT.

*/
function genomeLineChart() {
  // Setup chart configuration.
  var svgId = "#line_plot",
    divWidth = 760,
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
    areaContext = d3.area().curve(d3.curveMonotoneX).x(XContext).y0(
      plotHeightContext).y1(YContext),
    brushContext = d3.brushX().extent([
      [0, 0],
      [plotWidth, plotHeightContext]
    ]),
    brushFocus = d3.brush().extent([
      [0, 0],
      [plotWidth, plotHeightFocus]
    ]),
    zoomContext = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([
      [0, 0],
      [plotWidth, plotHeightFocus]
    ])
    .extent([
      [0, 0],
      [plotWidth, plotHeightContext]
    ]),
    colors,
    color_key;

  // Create the base chart SVG object.
  var svg = d3.select(svgId)
    .append("svg")
    .attr("width", divWidth)
    .attr("height", divHeight);

  // Add clip box to prevent focus plot from extending beyond x-axis domain
  svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", plotWidth)
    .attr("height", plotHeightFocus);

  //Create context plot. Shows how genome view below the focus plot
  var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + marginContext.left + "," + marginContext.top +
      ")");

  // Create focus plot. Shows teh selected region from the context plot.
  var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + marginFocus.left + "," + marginFocus.top +
      ")");

  // Enable brushing in the FOCUS plot.
  focus.append("g")
    .attr("class", "brush")
    .call(brushFocus);

  // Create the base tooltip object.
  var tooltip = d3.select(svgId)
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
        "abs_diffsel: " + parseFloat(d.metric).toFixed(2) + " <br/> " +
        "pos_diffsel: " + parseFloat(d.positive_diffsel).toFixed(2) + " <br/> " +
        "max_diffsel: " + parseFloat(d.max_diffsel).toFixed(2) + " <br/> " +
        "seq number: " + d.site)
  }

  function hideTooltip(d) {
    d3.select(this).classed("hovered", false);
    return tooltip.style("visibility", "hidden");
  }

  var generateColorMap = function(data) {
    // create color key based on the data
    var colors = {};
    var min_y_value = d3.min(data, d => +d.metric);
    var max_y_value = d3.max(data, d => +d.metric);
    data.forEach(function(d) {
      var norm_value = (d.metric - min_y_value) / max_y_value
      colors[d.site] = d3.interpolateViridis(norm_value)
    })
    return colors;
  };


  // selection by mouse click
  function clickOnPoint(d) {
    /*
    Select or deselect a point using mouse click.
    Updates both the PROTEIN structure and the LOGOPLOTS.
    */

    // if not already selected
    if (!d3.select(this).classed("selected")) {
      // update the point on the LINE plot (color based on metric)
      d3.select(this)
        .style("fill", color_key[d.site])
        .classed("selected", true)
        .classed("clicked", true);
      // update the PROTEIN structure (color based on metric)
      selectSiteOnProtein(":" + d.protein_chain + " and " + d.protein_site,
        color_key[d.site])
    }

    // if the point is already selected
    else {
      // update the point on the LINE plot (baseline grey)
      d3.select(this)
        .style('fill', 'grey')
        .classed("selected", false)
        .classed("clicked", false);
      // update the PROTEIN structure (baseline grey)
      deselectSiteOnProteinStructure(":" + d.protein_chain + " and " + d.protein_site)
    }

    // print the selected sites to the screen
    chart.selectedSites = d3.selectAll(".selected").data().map(d => +d.site);
    console.log("Selected sites: " + chart.selectedSites);

    // update the LOGOPLOT
    d3.select("#punchcard_chart")
      .data([perSiteData.filter(d => chart.selectedSites.includes(+d.site))])
      .call(punchCard);
  }

  // Create the x-axis for the focus plot.
  focus.append("g")
    .attr("class", "axis axis--x")
    .attr("id", "axis_x_focus")
    .attr("transform", "translate(0," + plotHeightFocus + ")")
    .call(xAxisFocus);

  // Create the y-axis for the focus plot.
  focus.append("g")
    .attr("class", "axis axis--y")
    .attr("id", "axis_y_focus")
    .call(yAxis);

  // Set chart title.
  svg.append("text")
    .attr("transform", "translate(" + (divWidth / 2) + ", " + (15) + ")")
    .style("text-anchor", "middle")
    .text("")
    .style("font-weight", "bold");

  // Set x-axis label for the focus plot.
  svg
    .append("text")
    .attr("transform", "translate(" + (divWidth / 2) + ", " + (plotHeightFocus +
      50) + ")")
    .style("text-anchor", "middle")
    .text("Site");

    // Set y-axis label for the focus plot.
    svg
      .append("text")
      .attr("transform", "translate(" + (12) + ", " + (plotHeightFocus - 50) + ") rotate(-90)")
      .attr("id", "context_y_label");

  // Set title for the context plot.
  svg
    .append("text")
    .attr("transform", "translate(" + (divWidth / 10) + ", " + (plotHeightFocus +
      60) + ")")
    .style("text-anchor", "middle")
    .text("zoom bar");

  // Create the x-axis for the context plot.
  context.append("g")
    .attr("class", "axis axis--x")
    .attr("id", "axis_x_context")
    .attr("transform", "translate(0," + plotHeightContext + ")")
    .call(xAxisContext);

  // Enable brushing in the CONTEXT plot.
  context.append("g")
    .attr("class", "brush")
    .call(brushContext);


  // Zoom when you brush the CONTEXT plot
  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || xScaleContext.range();
    xScaleFocus.domain(s.map(xScaleContext.invert, xScaleContext));
    focus.select(".line").attr("d", lineFocus);
    focus.selectAll("circle")
      .attr("cx", (d) => xScaleFocus(+d.site))
      .attr("cy", (d) => yScaleFocus(+d.metric))
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
      .attr("cy", (d) => yScaleFocus(+d.metric));
    focus.select(".axis--x").call(xAxisFocus);
    context.select(".brush").call(brushContext.move, x.range().map(t.invertX, t));
  }

  var brushPointsFocusSelection = _.debounce(function() {
    /*
    updates PROTEIN structure and LINE plot based on brush selection.

    A point will be selected if it is
    1. in the FOCUS brush area _and_
    2. was not previously in the FOCUS brush area _and_
    3. is not *clicked*
    These points will also be colored by the value of the site-level metric
    and classed as `selected`.

    A point will be deselected if it is
    1. outside the FOCUS brush area _and_
    2. was previously in the FOCUS brush area _and_
    3. is *not clicked*
    These points will also be colored the baseline grey and will no longer
    be classed as `selected`.

    This protein is `debounced` to prevent laggy-ness. The wait period is
    defined after the `}`.
    */

    // which sites are clicked? brushed? brushed but brushed before?
    var clicked = d3.selectAll(".clicked").data().map(d => +d.site),
      current_brushed = d3.selectAll(".current_brushed").data().map(d => +d
        .site),
      already_brushed = d3.selectAll(".current_brushed.brushed").data().map(
        d => +d.site);

    // sites to select - `current_brushed` but not `clicked` or `brushed`.
    var sites_to_select = _.without.apply(_, [current_brushed].concat(
        already_brushed)),
      sites_to_select = _.without.apply(_, [sites_to_select].concat(clicked));

    // sites to deselect - `non_brushed` but previously `brushed` but not `clicked`
    var sites_to_deselect = d3.selectAll(".non_brushed.brushed").data().map(
        d => +d.site),
      sites_to_deselect = _.without.apply(_, [sites_to_deselect].concat(
        clicked));

    // for each site to select, update the PROTEIN and the FOCUS point
    sites_to_select.forEach(function(element) {
      var _circle = d3.select("#site_" + element), // select the point
        _circleData = _circle.data()[0]; // grab the data
      // select the site on the PROTEIN
      selectSiteOnProtein(":" + _circleData.protein_chain + " and " +
        _circleData.protein_site,
        color_key[_circleData.site]);
      // FOCUS styling and update the point to `selected` class
      _circle.style("fill", color_key[_circleData.site])
        .classed("selected", true);
    });

    // for each site to select, update the PROTEIN and the FOCUS point
    sites_to_deselect.forEach(function(element) {
      var _circle = d3.select("#site_" + element), // select the point
        _circleData = _circle.data()[0]; // grab the data
      // deselect the site on the PROTEIN
      deselectSiteOnProteinStructure(":" + _circleData.protein_chain +
        " and " + _circleData.protein_site);
      // FOCUS styling and revert classes
      _circle.style("fill", greyColor)
        .classed("current_brushed", false)
        .classed("brushed", false)
        .classed("selected", false);
    });

    // all points in the current FOCUS brush area have been processed
    d3.selectAll(".current_brushed").classed("brushed", true);
  }, 15);

  // determines if a point is in the brush or not
  function isBrushed(brush_coords, d) {
    cx = xScaleFocus(d.site);
    cy = yScaleFocus(d.metric);
    if (brush_coords == null) {
      return false
    } else {
      var x0 = brush_coords[0][0],
        x1 = brush_coords[1][0],
        y0 = brush_coords[0][1],
        y1 = brush_coords[1][1];
      return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1; // This return TRUE or FALSE depending on if the points is in the selected area
    }
  }

  // FOCUS plot brush functions
  function brushPointsFocus() {
    /*
    updates PROTEIN structure and LOGOPLOTS based on the brush selection
    from the CONTEXT plot.
    */
    var extent = d3.event.selection // FOCUS brush's coordinates

    // a point is either in the newly brushed area or it is not
    var circlePoint = d3.select(".focus").selectAll("circle");

    circlePoint.classed("current_brushed",
      function(d) {
        return isBrushed(extent, d)
      });
    circlePoint.classed("non_brushed",
      function(d) {
        return !isBrushed(extent, d)
      });

    /*
    call function to do the actual selection.
    This function is `debounced` to decrease laggy-ness of the PROTEIN
    structure update.
    */
    brushPointsFocusSelection();

    // LOGOPLOT includes all `.selected` (clicked or brushed) points
    chart.brushedSites = d3.selectAll(".selected").data().map(d => +d
      .site);
    d3.select("#punchcard_chart")
      .data([perSiteData.filter(d => chart.brushedSites.includes(+d.site))])
      .call(punchCard);

  };

  // Create a genome line chart for the given selection.
  function chart(selection) {
    selection.each(function(alldata) {
      var conditions = []
      alldata.forEach(function(key) {
        conditions.push(key["condition"]);
      });
      conditions = conditions.filter((x, i, a) => a.indexOf(x) == i);

      var site_metrics = []
      Object.keys(alldata[0]).forEach(function(col){
        if (col.startsWith("site_")){
          site_metrics.push(col)
        }
      })

      var long_data = []
      alldata.forEach( function(row) {
        Object.keys(row).forEach( function(colname){
          if(!colname.startsWith('site_')) {
            return
          }
          long_data.push({
            "site": row["site"],
            "label_site": row["site"],
            "wildtype": row["wildtype"],
            "protein_chain": row["protein_chain"],
            "protein_site": row["protein_site"],
            "condition": row["condition"],
            "metric": row[colname],
            "metric_name": colname});
        })
      })
      // This sorts by condition and by site and only takes the first of the sites
      nestmap = d3.rollup(long_data, v => v[0], d => d.condition, d => d.metric_name, d => d.site)
      chart.data = nestmap;

      // Handler for dropdown value change
      dropdownChange = function() {
        current_condition = d3.select("#condition").property('value')
        current_site = d3.select("#site").property('value')
        chart.condition_data = chart.data.get(current_condition).get(current_site)
        updateChart(chart.condition_data);

      };

      function updateChart(dataMap) {
        data = Array.from(dataMap.values())
        // get the new color map
        color_key = generateColorMap(data);

        // Update the context brush, focus brush and zoom brush.
        brushContext.on("brush end", brushed);
        brushFocus.on("brush end", brushPointsFocus);
        zoomContext.on("zoom", zoomed);

        // Update the x and y domains to match the extent of the incoming data.
        xScaleFocus.domain(d3.extent(data, d => +d.site));
        yScaleFocus.domain(d3.extent(data, d => +d.metric));
        xScaleContext.domain(xScaleFocus.domain());
        yScaleContext.domain(yScaleFocus.domain());

        // Create the context plot, drawing a line through all of the data points.
        // focus.selectAll("path.line")
        //   .data([data])
        //   .join("path")
        //   .attr("class", "line")
        //   .style("clip-path", "url(#clip)")
        //   .attr("d", lineFocus);

        // Plot a circle for each site in the given data.
        var circlePoint = focus.selectAll("circle").data(data);

        circlePoint.enter()
          .append("circle")
          .attr("r", 5)
          .attr("cx", XFocus)
          .attr("cy", YFocus)
          .attr("id", d => "site_" + d.site)
          .attr("class", "non_brushed")
          .classed("current_brushed", false)
          .classed("brushed", false)
          .classed("selected", false)
          .classed("class", "current_brushed", false)
          .style("clip-path", "url(#clip)")
          .on("mouseover", showTooltip)
          .on("mouseout", hideTooltip)
          .on("click", clickOnPoint);


        // Update old ones, already have x / width from before
        circlePoint
          .transition().duration(250)
          .attr("cy", YFocus);

        // Remove old ones
        circlePoint.exit().remove();

        // fix the axes (including labels)
        focus.select("#axis_y_focus")
          .transition()
          .call(yAxis);

        focus.select("#axis_x_focus")
          .call(xAxisFocus.tickFormat(function(site) {
            if (dataMap.get(site) === undefined){
              return ""
            }
            return dataMap.get(site).label_site
          }));

        context.select("#axis_x_context")
          .call(xAxisContext.tickFormat(function(site) {
            if (dataMap.get(site) === undefined){
              return ""
            }
            return dataMap.get(site).label_site
          }));

        svg.select("#context_y_label")
              .text(data[0]["metric_name"].substring(5, ));

        // Create the context plot.
        context.selectAll("path.area")
          .data([data])
          .join("path")
          .attr("class", "area")
          .attr("d", areaContext);

      }; // end of update chart
      chart.condition_data = chart.data.get(conditions[0]).get(site_metrics[0])
      updateChart(chart.condition_data);

    }); // end of for each for the selection
  } // end of selection

  // Define accessors for x-axis values in the focus and context panels.
  function XFocus(d) {
    return xScaleFocus(+d.site);
  }

  function XContext(d) {
    return xScaleContext(+d.site);
  }

  // Define accessors for y-axis values in the focus and context panels.
  function YFocus(d) {
    return yScaleFocus(+d.metric);
  }

  function YContext(d) {
    return yScaleContext(+d.metric);
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
} // end of genomeLineChart
