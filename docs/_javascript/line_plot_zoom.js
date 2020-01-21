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
selected_opacity = 1.0
unselected_opacity = 0.5
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
    ]).on("brush end", brushed),
    brushFocus = d3.brush().extent([
      [0, 0],
      [plotWidth, plotHeightFocus]
    ]).on("end", brushPoints),
    zoomContext = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([
      [0, 0],
      [plotWidth, plotHeightFocus]
    ])
    .extent([
      [0, 0],
      [plotWidth, plotHeightContext]
    ]).on("zoom", zoomed);

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
      .html("Site: (" + d.protein_chain.join(" ") + ")" + d.protein_site + " <br/> " +
        d.metric_name + ": " + parseFloat(d.metric).toFixed(2) + " <br/> " +
        "seq number: " + d.site)
  }

  function hideTooltip(d) {
    d3.select(this).classed("hovered", false);
    return tooltip.style("visibility", "hidden");
  }

  var generateColorMap = function(data) {
    // create color key based on the data
    var colors = {},
        min_y_value = d3.min(data, d => +d.metric),
        range = d3.max(data, d => +d.metric) - min_y_value;
    data.forEach(function(d) {
      colors[d.site] = d3.interpolateViridis((d.metric - min_y_value) / range)
    })
    return colors;
  };

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
      .attr("transform", "translate(" + (12) + ", " + (plotHeightFocus - -10) + ") rotate(-90)")
      .attr("id", "context_y_label");

  // Set title for the context plot.
  svg
    .append("text")
    .attr("transform", "translate(" + (divWidth / 4) + ", " + (plotHeightFocus +
      60) + ")")
    .style("text-anchor", "middle")
    .text("zoom bar (brush to zoom in on a region)");

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
    focus.select(".brush").call(brushFocus.move, null);
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

  // selection by mouse click
  function clickOnPoint(d) {
    // update FOCUS and PROTEIN
    if (!d3.select(this).classed("selected")) {
      selectSite(d3.select(this))
    }else {
      deselectSite(d3.select(this))
    }
    // update the LOGOPLOT
    updateLogoPlot();
  }

  var selectSite = function(circlePoint){
      var circleData = circlePoint.data()[0];
      // update the FOCUS plot
       circlePoint.style("fill", color_key[circleData.site])
        .style("stroke-width", "1px")
        .style("opacity", selected_opacity)
        .classed("selected", true);

    // update the PROTEIN structure
    circleData.protein_chain.forEach(function(chain){
      selectSiteOnProtein(":" + chain + " and " +
        circleData.protein_site,
        color_key[circleData.site]);
    });
  };

  var deselectSite = function(circlePoint){
    var circleData = circlePoint.data()[0];
    // update FOCUS plot
    circlePoint.style("fill", greyColor)
      .style("stroke-width", "0px")
      .style("opacity", unselected_opacity)
      .classed("brushed", false)
      .classed("selected", false);

      // update PROTEIN structure
      circleData.protein_chain.forEach(function(chain){
        deselectSiteOnProtein(":" + chain + " and " +
          circleData.protein_site);
      });
  };

  var updateLogoPlot = function(){
    // LOGOPLOT includes all `.selected`points
    chart.selectedSites = d3.selectAll(".selected").data().map(d => +d.site);
    d3.select("#punchcard_chart")
      .data([chart.condition_mut_data.filter(d => chart.selectedSites.includes(d.site))])
      .call(punchCard);
    console.log("Selected sites: ", chart.selectedSites)
  };

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
  function brushPoints() {
    /*
    updates PROTEIN structure and LOGOPLOTS based on the brush selection
    from the CONTEXT plot.
    */
    var extent = d3.event.selection // FOCUS brush's coordinates

    if(extent){
      var brushType = d3.select("#brushmenu").property('value');
      // a point is either in the newly brushed area or it is not
      var circlePoint = d3.select(".focus").selectAll("circle");

      circlePoint.classed("brushed",
        function(d) {
          return isBrushed(extent, d)
        });

      var selected = d3.selectAll(".selected").data().map(d => +d.site),
          brushed = d3.selectAll(".brushed").data().map(d => +d.site),
          targets;

      // selection or deselection?
      if(brushType == 'select'){
        targets = _.without.apply(_, [brushed].concat(selected));
        targets.forEach(function(target) {
          selectSite(d3.select("#site_" + target))
        });

      }else if(brushType == 'deselect'){
        targets = brushed.filter(value => selected.includes(value))
        targets.forEach(function(target) {
          deselectSite(d3.select("#site_" + target))
        });

      }else{
        console.log('Unknown brush type of ' + brushType)
      }

      updateLogoPlot();
      focus.select(".brush").call(brushFocus.move, null);
    }
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
      });

      var mut_metrics = []
      Object.keys(alldata[0]).forEach(function(col){
        if (col.startsWith("mut_")){
          mut_metrics.push(col)
        }
      });

      var long_data = []
      var mut_long_data = [];
      alldata.forEach( function(row) {
        Object.keys(row).forEach( function(colname){
          if(colname.startsWith('site_')) {
            long_data.push({
              "site": +row["site"],
              "label_site": row["label_site"],
              "wildtype": row["wildtype"],
              "protein_chain": row["protein_chain"].split(" "),
              "protein_site": row["protein_site"],
              "condition": row["condition"],
              "metric": +row[colname],
              "metric_name": colname});
          }
          else if (colname.startsWith('mut_')) {
            mut_long_data.push({
              "site": +row["site"],
              "label_site": row["label_site"],
              "mutation": row["mutation"],
              "condition": row["condition"],
              "metric": +row[colname],
              "metric_name": colname
            });
          }
        })
      });

      // Group data by condition and site and only takes the first of the sites,
      // to get site-level data.
      chart.data = d3.rollup(long_data, v => v[0], d => d.condition, d => d.metric_name, d => d.site);

      // Group data by condition and mutation metric, keeping all records to get
      // site- and mutation-level data.
      chart.mutData = d3.group(mut_long_data, d => d.condition, d => d.metric_name);

      // Handler for the brush button
      brushdropdownchange = function(){
        focus.select(".brush").call(brushFocus.move, null);
      }

      // Handler for clear button change
      clearbuttonchange = function() {
        d3.selectAll(".selected").each(function(element){
          d3.select(this).style("fill", greyColor)
          .style("stroke-width", "0px")
          .style("opacity", unselected_opacity)
          .attr("class", "non_brushed")
          .classed("brushed", false)
          .classed("selected", false)

          // deselect the site on the PROTEIN
          var _d = d3.select(this).data()[0]
          _d.protein_chain.forEach(function(chain){
            deselectSiteOnProtein(":" + chain + " and " + _d.protein_site);
          })
        })

        updateLogoPlot();
        // clear the physical brush (classification as 'brushed' remains)
        focus.select(".brush").call(brushFocus.move, null);
      };

    // brush select/deselect choices

    var brushdropdown = d3.select("#line_plot")
      .insert("select", "svg")
      .attr("id", 'brushmenu')
      .on('click', brushdropdownchange);

      brushdropdown.selectAll("option")
        .data(['select', 'deselect'])
        .enter().append("option")
        .attr("value", function(d) {
          return d;
        })
        .text(function(d) {
          return d;
        })

      // Handler for dropdown value change
      dropdownChange = function() {
        current_condition = d3.select("#condition").property('value');
        current_site = d3.select("#site").property('value');
        current_mut_metric = d3.select("#mutation_metric").property('value');

        chart.condition_data = chart.data.get(current_condition).get(current_site);
        chart.condition_mut_data = chart.mutData.get(current_condition).get(current_mut_metric);
        updateChart(chart.condition_data);
        updateLogoPlot();
      };

      function updateChart(dataMap) {
        data = Array.from(dataMap.values())
        // get the new color map
        color_key = generateColorMap(data);

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
          .classed("brushed", false)
          .classed("selected", false)
          .style("clip-path", "url(#clip)")
          .style("fill", greyColor)
          .style("opacity", unselected_opacity)
          .style("stroke", "grey")
          .style("stroke-width", "0px")
          .on("mouseover", showTooltip)
          .on("mouseout", hideTooltip)
          .on("click", clickOnPoint);

        // Update old ones, already have x / width from before
        circlePoint
          .transition().duration(250)
          .attr("cy", YFocus);

        // Remove old ones
        circlePoint.exit().remove();

       // update the colors
       d3.selectAll(".selected").data().map(d => +d.site).forEach(function(site) {
         var _circle = d3.select("#site_" + site), // select the point
             _circleData = _circle.data()[0]; // grab the data

         // select the site on the PROTEIN
         _circleData.protein_chain.forEach(function(chain){
           selectSiteOnProtein(":" + chain + " and " +
             _circleData.protein_site,
             color_key[_circleData.site]);
         })


        // color the point in the FOCUS plot
         _circle.style("fill", color_key[_circleData.site])
       });

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

        // clear the physical brush (classification as 'brushed' remains)
        focus.select(".brush").call(brushFocus.move, null);
      }; // end of update chart
      chart.condition_data = chart.data.get(conditions[0]).get(site_metrics[0]);
      chart.condition_mut_data = chart.mutData.get(conditions[0]).get(mut_metrics[0]);

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
