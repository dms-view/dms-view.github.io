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


  // color key
  var colors = sessionStorage.getItem("colorTest")
  color_key = JSON.parse(colors);

  // Create a genome line chart for the given selection.
  function chart(selection) {
    selection.each(function (data) {
      // line plot does not use the mutation-level data
      data.forEach(d => { Object.keys(d).forEach(function (key) { if (key.startsWith("mut_") || key == "mutation") { delete d[key] } }) });
      data = d3.rollups(data, v => v[0], d => d.site).map(d => d[1]);
      // Bind the data to the chart function.
      chart.data = data;

      // Create the base chart SVG object.
      var svg = d3.select(this)
        .append("svg")
        .attr("width", divWidth)
        .attr("height", divHeight);

      // Add clip box to prevent focus plot from extending beyond x-axis domain
      svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", plotWidth)
        .attr("height", plotHeightFocus);

      // Update the context brush, focus brush and zoom brush.
      brushContext.on("brush end", brushed);
      brushFocus.on("brush end", brushPointsFocus);
      zoomContext.on("zoom", zoomed);

      //Create context plot. Shows how genome view below the focus plot
      var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + marginContext.left + "," + marginContext.top + ")");

      // Create focus plot. Shows teh selected region from the context plot.
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
        .style("clip-path", "url(#clip)")
        .attr("d", lineFocus);

    // Enable brushing in the FOCUS plot.
        focus.append("g")
          .attr("class", "brush")
          .call(brushFocus);

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
          .style("fill", color_key[Math.ceil(d.site_absdiffsel)])
          .classed("selected", true)
          .classed("clicked", true);
          // update the PROTEIN structure (color based on metric)
          selectSiteOnProtein(":"+d.protein_chain+ " and "+ d.protein_site,
                              color_key[Math.ceil(d.site_absdiffsel)])
        }

        // if the point is already selected
        else {
          // update the point on the LINE plot (baseline grey)
          d3.select(this)
             .style('fill', 'grey')
             .classed("selected",false)
             .classed("clicked", false);
          // update the PROTEIN structure (baseline grey)
          deselectSiteOnProteinStructure(":"+d.protein_chain+ " and "+ d.protein_site)
        }

        // print the selected sites to the screen
        chart.selectedSites = d3.selectAll(".selected").data().map(d => +d.site);
        console.log("Selected sites: " + chart.selectedSites);

        // update the LOGOPLOT
        d3.select("#punchcard_chart")
          .data([perSiteData.filter(d => chart.selectedSites.includes(+d.site))])
          .call(punchCard);
      }

      // add style and selection events to the circles
      var circleAttributes = circlePoint
        .attr("r", 5)
        .attr("cx", XFocus)
        .attr("cy", YFocus)
        .attr("id", d => "site_" + d.site)
        .attr("class", "non_brushed")
        .style("clip-path", "url(#clip)")
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip)
        .on("click", clickOnPoint);

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
        .text("")
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

      // Enable brushing in the CONTEXT plot.
      context.append("g")
        .attr("class", "brush")
        .call(brushContext)
        .call(brushContext.move, xScaleFocus.range());

    // Zoom when you brush the CONTEXT plot
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


      // FOCUS plot brush functions
      function brushPointsFocus(){
        /*
        updates PROTEIN structure and LOGOPLOTS based on the brush selection
        from the CONTEXT plot.
        */
        extent = d3.event.selection  // FOCUS brush's coordinates

        // a point is either in the newly brushed area or it is not
        circlePoint.classed("current_brushed",
                            function(d){return isBrushed(extent, d)});
        circlePoint.classed("non_brushed",
                            function(d){return ! isBrushed(extent, d)});

        /*
        call function to do the actual selection.
        This function is `debounced` to decrease laggy-ness of the PROTEIN
        structure update.
        */
        brushPointsFocusSelection();

        // LOGOPLOT includes all `.selected` (clicked or brushed) points
        chart.brushedSites = d3.selectAll(".selected").data().map(d => +d.site);
          d3.select("#punchcard_chart")
            .data([perSiteData.filter(d => chart.brushedSites.includes(+d.site))])
            .call(punchCard);
      }


    var brushPointsFocusSelection = _.debounce(function(){
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
          current_brushed = d3.selectAll(".current_brushed").data().map(d => +d.site),
          already_brushed = d3.selectAll(".current_brushed.brushed").data().map(d =>  +d.site);

      // sites to select - `current_brushed` but not `clicked` or `brushed`.
      var sites_to_select = _.without.apply(_, [current_brushed].concat(already_brushed)),
          sites_to_select = _.without.apply(_, [sites_to_select].concat(clicked));

      // sites to deselect - `non_brushed` but previously `brushed` but not `clicked`
      var sites_to_deselect = d3.selectAll(".non_brushed.brushed").data().map(d => +d.site),
          sites_to_deselect = _.without.apply(_, [sites_to_deselect].concat(clicked));

      // for each site to select, update the PROTEIN and the FOCUS point
      sites_to_select.forEach(function(element) {
        var _circle = d3.select("#site_" + element),  // select the point
            _circleData = _circle.data()[0];  // grab the data
        // select the site on the PROTEIN
        selectSiteOnProtein(":"+_circleData.protein_chain+ " and "+ _circleData.protein_site,
                            color_key[Math.ceil(_circleData.site_absdiffsel)]);
        // FOCUS styling and update the point to `selected` class
        _circle.style("fill", color_key[Math.ceil(_circleData.site_absdiffsel)])
               .classed("selected", true);
      });

      // for each site to select, update the PROTEIN and the FOCUS point
      sites_to_deselect.forEach(function(element) {
        var _circle = d3.select("#site_" + element),  // select the point
            _circleData = _circle.data()[0];  // grab the data
        // deselect the site on the PROTEIN
        deselectSiteOnProteinStructure(":"+_circleData.protein_chain+ " and "+ _circleData.protein_site);
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
