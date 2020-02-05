/*
 * Initialize DMS view when the DOM content has loaded.
 * Initialization includes requesting data to populate plots and protein
 * viewer.
 */
var chart;
var perSiteData;
var logoplot;
var dataPath = "_data/IAV/flu_dms-view.csv";
var proteinPath = "_data/IAV/4O5N_trimer.pdb";

var dropdownChange;
var clearbuttonchange;

var protein;
var greyColor = "#999999";

// Bitstream Vera Fonts provided by Gnome:
// https://www.gnome.org/fonts/
var fontPath = "_data/fonts/DejaVuSansMonoBold_SeqLogo.ttf";
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

      function renderMarkdown (data) {
        // Render Markdown text to HTML.
        const markdownOutput = marked(data);

        // If there is any rendered output, update the DOM.
        if (markdownOutput.length > 0) {
          d3.select("#markdown-output")
            .html(markdownOutput);
        }
      }

      // Check if the URL already provides a Markdown URL. If it does, use that
      // URL to load and render the Markdown.
      const url = new URL(window.location);
      const markdownUrl = url.searchParams.get("markdown-url");
      if (markdownUrl !== null) {
        renderMarkdownUrl(markdownUrl);

        // Update the Markdown URL text field to reflect the provided value.
        d3.select("#markdown-url").property('value', markdownUrl);
      }

      function renderMarkdownUrl (markdownUrl) {
        // Try to load the user's provided URL to a Markdown document.
        if (markdownUrl.length > 0) {
          d3.text(markdownUrl).then(data => {
            // Render the given markdown.
            renderMarkdown(data);

            // Remove any invalid input status for the URL text field.
            d3.select("#markdown-url").classed('is-invalid', false);

            // Update the document's query string to reflect the requested URL.
            // This should help maintain state if the user copies and pastes the
            // document's URL.
            const url = new URL(window.location);
            url.searchParams.set("markdown-url", markdownUrl);
            history.replaceState({}, "", url.toString());
          }).catch(reason => {
            // Let the user know their URL could not be loaded.
            d3.select("#markdown-url").classed('is-invalid', true);
          });
        }
      }

      var markdownField = d3.select("#markdown-url")
        .on("change", () => renderMarkdownUrl(
          d3.select("#markdown-url").property('value'))
        );

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
