/*
 * Initialize DMS view when the DOM content has loaded.
 * Initialization includes requesting data to populate plots and protein
 * viewer.
 */
var chart;
var perSiteData;
var punchCard;
var dataPath = "_data/IAV/flu_dms-view.csv";
var proteinPath = "_data/IAV/4O5N_trimer.pdb";
var site_metric = "site_absdiffsel";
var mut_metric = "mut_diffsel";
var protein;
var greyColor = "#999999";

// Bitstream Vera Fonts provided by Gnome:
// https://www.gnome.org/fonts/
var fontPath = "_data/fonts/VeraMono.ttf";
var fontObject;

window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    // Initialize line chart.
    chart = genomeLineChart();

    // Initialize protein view.
    addElement(polymerSelect);

    // Initialize the mutation/site chart.
    punchCard = punchCardChart("#punchcard_chart");

    // Request data for charts.
    var promise1 = d3.csv(dataPath).then(function(data){
      // Sort data by site
      data.forEach(function(d){
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

    // TODO: Refactor this redundant code with the code above.
    var promise2 = d3.csv(dataPath).then(function (data) {
      // Calculate the absolute differential selection for plotting.
      data.forEach(
        function (d) {
<<<<<<< HEAD
          d.absmutdiffsel = Math.abs(+d[mut_metric]);
=======
          d.absmutdiffsel = Math.abs(+d.mut_pref);
>>>>>>> 2a0d42b... fixed merge conflcits
          d.site = +d.site;
          return d;
        }
      )

      // Bind the data to the chart function.
      perSiteData = data;
      console.log(perSiteData);
      return perSiteData;
    });

    // TODO: rename promise variable
    var promise3 = loadStructure(proteinPath);

    var promiseFontLoaded = opentype.load(fontPath, function(err, font) {
      if (err) {
        console.log("Font could not be loaded: " + err);
      }
      else {
        console.log("Font loaded: " + fontPath);
        fontObject = font;
      }
    });

    // Wait for all data to load before initializing content across the entire
    // application.
    console.log("Waiting for promises...");
    Promise.all([promise1, promise2, promise3, promiseFontLoaded]).then(values => {
      console.log("Promises fulfilled!");
      console.log(values);

      // Select the site with the maximum y value by default.
      console.log("Select site with maximum y value");
<<<<<<< HEAD
      var max_y_value = d3.max(chart.data, d => +d[site_metric]);
      var max_y_record = chart.data.filter(d => +d[site_metric] == max_y_value);
=======
      var max_y_value = d3.max(chart.data, d => +d.site_entropy);
      var max_y_record = chart.data.filter(d => +d.site_entropy == max_y_value);
>>>>>>> 2a0d42b... fixed merge conflcits

      if (max_y_record.length > 0) {
        console.log("click site " + max_y_record[0].site);
        d3.select("#site_" + max_y_record[0].site).dispatch("click");
      }
    });
});
