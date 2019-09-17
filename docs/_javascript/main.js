/*
 * Initialize DMS view when the DOM content has loaded.
 * Initialization includes requesting data to populate plots and protein
 * viewer.
 */
var chart;
var perSiteData;
var punchCard;
var dataPath = "_data/IAV/flu_dms-view.csv";
var proteinPath = "_data/IAV/4O5N_trimer.pdb"

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

    var promise2 = d3.csv(dataPath).then(function (data) {
      // Calculate the absolute differential selection for plotting.
      data.forEach(
        function (d) {
          d.absmutdiffsel = Math.abs(+d.mut_diffsel);
          d.site = +d.site;
          return d;
        }
      )

      // Bind the data to the chart function.
      perSiteData = data;
      console.log(perSiteData);
      return perSiteData;
    });

    var promise3 = loadStructure(proteinPath);

    // Wait for all data to load before initializing content across the entire
    // application.
    console.log("Waiting for promises...");
    Promise.all([promise1, promise2, promise3]).then(values => {
      console.log("Promises fulfilled!");
      console.log(values);

      // Select the site with the maximum y value by default.
      console.log("Select site with maximum y value");
      var max_y_value = d3.max(chart.data, d => +d.site_absdiffsel);
      var max_y_record = chart.data.filter(d => +d.site_absdiffsel == max_y_value);

      if (max_y_record.length > 0) {
        console.log("click site " + max_y_record[0].site);
        d3.select("#site_" + max_y_record[0].site).dispatch("click");
      }
    });
});