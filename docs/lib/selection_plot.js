var margin = {
  top: 20,
  right: 0,
  bottom: 50,
  left: 85
},
    svg_dx = 200,
    svg_dy = 400,
    plot_dx = svg_dx - margin.right - margin.left,
    plot_dy = svg_dy - margin.top - margin.bottom;

var x = d3.scaleLinear().range([margin.left, plot_dx]);
var y = d3.scaleLinear().range([plot_dy, margin.top]);

var svg = d3.select("#selection_chart").selectAll('div').append("svg").attr("width", svg_dx).attr("height", svg_dy);

d3.csv("_data/line-data.csv", d => {

  // define the line
  var valueline = d3.line().x(function (d) {
    return x(d.site);
  }).y(function (d) {
    return y(d.abs_diffsel);
  });

  var n = d.length;

  var d_extent_x = d3.extent(d, d => +d.site);
  var d_extent_y = d3.extent(d, d => +d.abs_diffsel);

  x.domain(0, d_extent_x);
  y.domain(0, d_extent_y);

  var axis_x = d3.axisBottom(x);
  var axis_y = d3.axisLeft(y);

  svg.append("g").attr("id", "axis_x").attr("transform", "translate(0," + (plot_dy + margin.bottom / 2) + ")").call(axis_x);

  svg.append("g").attr("id", "axis_y").attr("transform", "translate(" + margin.left / 2 + ", 0)").call(axis_y);

  d3.select("#axis_x").append("text").attr("transform", "translate(" + svg_dx / 2 + ", 20)").text("Site");

  d3.select("#axis_y").append("text").attr("transform", "rotate(-90) translate(" + -140 + "," + -10 + ")").text("abs_diffsel Value");

  // Add the valueline path.
  svg.append("path").data([d]).attr("class", "line").attr("d", valueline);

  var circles = svg.append("g").selectAll("circle").data(d).enter().append("circle").attr("r", 5).attr("cx", d => x(+d.site)).attr("cy", d => y(+d.abs_diffsel)).attr("class", "non_brushed");

  function highlightBrushedCircles() {

    if (d3.event.selection != null) {

      // revert circles to initial style
      circles.attr("class", "non_brushed");

      var brush_coords = d3.brushSelection(this);

      // style brushed circles
      circles.filter(function () {

        var cx = d3.select(this).attr("cx"),
            cy = d3.select(this).attr("cy");

        return isBrushed(brush_coords, cx, cy);
      }).attr("class", "brushed");
    }
  }

  function displayTable() {
    // disregard brushes w/o selections
    // ref: http://bl.ocks.org/mbostock/6232537
    if (!d3.event.selection) return;
    // programmed clearing of brush after mouse-up
    // ref: https://github.com/d3/d3-brush/issues/10
    d3.select(this).call(brush.move, null);

    var d_brushed = d3.selectAll(".brushed").data();

    // populate table if one or more elements is brushed
    if (d_brushed.length > 0) {
      clearTableRows();
      d_brushed.forEach(d_row => populateTableRow(d_row));
    } else {
      clearTableRows();
    }
  }

  var brush = d3.brush().on("brush", highlightBrushedCircles).on("end", displayTable);

  svg.append("g").call(brush);
});

function clearTableRows() {
  hideTableColNames();
  d3.selectAll(".row_data").remove();
}

function isBrushed(brush_coords, cx, cy) {

  var x0 = brush_coords[0][0],
      x1 = brush_coords[1][0],
      y0 = brush_coords[0][1],
      y1 = brush_coords[1][1];

  return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
}

function hideTableColNames() {
  d3.select("#table").style("visibility", "hidden");
}

function showTableColNames() {
  d3.select("#table").style("visibility", "visible");
}

function populateTableRow(d_row) {

  showTableColNames();

  var d_row_filter = [d_row.site, d_row.abs_diffsel];

  d3.select("#table").append("tr").attr("class", "row_data").selectAll("td").data(d_row_filter).enter().append("td").attr("align", (d, i) => i == 0 ? "left" : "right").text(d => d);
}