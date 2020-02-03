/*
 * Initialize DMS view when the DOM content has loaded.
 * Initialization includes requesting data to populate plots and protein
 * viewer.
 */
var chart;
var perSiteData;
var logoplot;

var dropdownChange;
var clearbuttonchange;

var protein;
var greyColor = "#999999";

// Bitstream Vera Fonts provided by Gnome:
// https://www.gnome.org/fonts/
var fontPath = "/_data/fonts/DejaVuSansMonoBold_SeqLogo.ttf";
var fontObject;

window.addEventListener('DOMContentLoaded', (event) => {
  console.log('DOM fully loaded and parsed');

  // Initialize line chart.
  chart = genomeLineChart();

  // Initialize protein view.
  addElement(polymerSelect);

  // Initialize the mutation/site chart.
  logoplot = logoplotChart("#logo_plot");

  // Request data for charts.
  var promise1 = d3.csv(dataPath).then(function(data) {
    // Sort data by site
    data.forEach(function(d) {
      d.site = +d.site;
      return d;
    })
    data = data.sort(function(a, b) {
      return a.site - b.site;
    });

    d3.select("#line_plot")
      .data([data])
      .call(chart)
  });

  // TODO: rename promise variable
  var promise3 = loadStructure(proteinPath);

  var promiseFontLoaded = opentype.load(fontPath, function(err, font) {
    if (err) {
      console.log("Font could not be loaded: " + err);
    } else {
      console.log("Font loaded: " + fontPath);
      fontObject = font;
    }
  });

  // Wait for all data to load before initializing content across the entire
  // application.
  console.log("Waiting for promises...");
  Promise.all([promise1, promise3, promiseFontLoaded]).then(
    values => {
      console.log("Promises fulfilled!");
      console.log(values);

      console.log(chart.data)
      conditions = Array.from(chart.data.keys());
      site_metrics = Array.from(chart.data.get(conditions[0]).keys());
      mut_metrics = Array.from(chart.mutData.get(conditions[0]).keys());

      var clearButton = d3.select("#line_plot")
        .insert("button", "svg")
        .text("clear selections")
        .attr("id", "clearButton")
        .classed("button", true)
        .on('click', clearbuttonchange);

      var conditiondropdown = d3.select("#line_plot")
        .insert("select", "svg")
        .attr("id", 'condition')
        .on("change", dropdownChange);

      var sitedropdown = d3.select("#line_plot")
        .insert("select", "svg")
        .attr("id", 'site')
        .on("change", dropdownChange);

      conditiondropdown.selectAll("option")
        .data(conditions)
        .enter().append("option")
        .attr("value", function(d) {
          return d;
        })
        .text(function(d) {
          return d;
        })

      sitedropdown.selectAll("option")
        .data(site_metrics)
        .enter().append("option")
        .attr("value", function(d) {
          return d;
        })
        .text(function(d) {
          return d.substring(5, );
        })

      var mutdropdown = d3.select("#logo_plot")
        .insert("select", "svg")
        .attr("id", 'mutation_metric')
        .on("change", dropdownChange);

      mutdropdown.selectAll("option")
        .data(mut_metrics)
        .enter().append("option")
        .attr("value", function(d) {
          return d;
        })
        .text(function(d) {
          return d.substring(4, );
        });

      // Select the site with the maximum y value by default.
      console.log("Select site with maximum y value");
      var max_y_value = d3.max(Array.from(chart.condition_data.values()), d => +d.metric);
      var max_y_record = Array.from(chart.condition_data.values()).filter(d => +d.metric == max_y_value);

      if (max_y_record.length > 0) {
        console.log("click site " + max_y_record[0].site);
        d3.select("#site_" + max_y_record[0].site).dispatch("click");
      }
    });
});
