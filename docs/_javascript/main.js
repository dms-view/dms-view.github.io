/*
 * Initialize DMS view when the DOM content has loaded.
 * Initialization includes requesting data to populate plots and protein
 * viewer.
 */
var chart;
var perSiteData;
var logoplot;

let conditiondropdown;
let sitedropdown;
let mutdropdown;

var dropdownChange;
var clearbuttonchange;

let protein;
const greyColor = "#999999";

// Bitstream Vera Fonts provided by Gnome:
// https://www.gnome.org/fonts/
var fontPath = "_data/fonts/DejaVuSansMonoBold_SeqLogo.ttf";
var fontObject;

// Define functions to load and render data URLs including Markdown, CSV, and
// PDB files.

function renderMarkdown (data) {
  // Render Markdown text to HTML.
  const markdownOutput = marked(data);

  // If there is any rendered output, update the DOM.
  if (markdownOutput.length > 0) {
    d3.select("#markdown-output")
      .html(markdownOutput);
  }
}

function renderCsv(data) {
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
    .call(chart);

  console.log(chart.data)
  let conditions = Array.from(chart.data.keys());
  console.log("conditions:");
  console.log(conditions);
  let site_metrics = Array.from(chart.data.get(conditions[0]).keys());
  let mut_metrics = Array.from(chart.mutData.get(conditions[0]).keys());

  var clearButton = d3.select("#clearButton")
    .on('click', clearbuttonchange);

  if (conditiondropdown === undefined) {
    console.log("No condition dropdown exists yet.");
    conditiondropdown = d3.select("#line_plot")
      .insert("select", "svg")
      .attr("id", 'condition')
      .on("change", dropdownChange);
  }
  else {
    console.log("Use existing condition dropdown.");
  }

  if (sitedropdown === undefined) {
    sitedropdown = d3.select("#line_plot")
      .insert("select", "svg")
      .attr("id", 'site')
      .on("change", dropdownChange);
  }

  conditiondropdown.selectAll("option")
    .data(conditions)
    .join("option")
    .attr("value", function(d) {
      return d;
    })
    .text(function(d) {
      return d;
    })

  sitedropdown.selectAll("option")
    .data(site_metrics)
    .join("option")
    .attr("value", function(d) {
      return d;
    })
    .text(function(d) {
      return d.substring(5, );
    })

  if (mutdropdown === undefined) {
    mutdropdown = d3.select("#logo_plot")
      .insert("select", "svg")
      .attr("id", 'mutation_metric')
      .on("change", dropdownChange);
  }

  mutdropdown.selectAll("option")
    .data(mut_metrics)
    .join("option")
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
}

function renderPdb(data) {
  protein = data;
  protein.setRotation([2, 0, 0])
  protein.autoView()
  protein.addRepresentation(polymerSelect.value, {
    sele: "polymer",
    name: "polymer",
    color: greyColor
  });

  return protein;
}

function renderDataUrl (dataUrl, dataFieldId, dataType) {
  // Try to load data from the user's provided URL and render it based on the
  // provided data type. If the URL is null, then it wasn't defined in the app
  // URL, so we don't attempt to render it.
  if (dataUrl === null || dataUrl.length === 0) {
    return;
  }

  let dataFunction;
  let renderFunction;

  if (dataType === "markdown") {
    dataFunction = d3.text;
    renderFunction = renderMarkdown;
  }
  else if (dataType === "csv") {
    dataFunction = d3.csv;
    renderFunction = renderCsv;
  }
  else if (dataType === "pdb") {
    dataFunction = (d) => {
      stage.removeAllComponents();
      return stage.loadFile(d)
    };
    renderFunction = renderPdb;
  }
  else {
    console.log("Unsupported data type: " + dataType);
    return;
  }

  dataFunction(dataUrl).then(data => {
    // Render the given markdown.
    renderFunction(data);

    // Remove any invalid input status for the URL text field.
    d3.select("#" + dataFieldId).classed('is-invalid', false);

    // Update the document's query string to reflect the requested URL.
    // This should help maintain state if the user copies and pastes the
    // document's URL.
    const url = new URL(window.location);
    url.searchParams.set(dataFieldId, dataUrl);
    history.replaceState({}, "", url.toString());
    console.log("Changed URL to: " + url.toString());

    // Update the URL text field to reflect the provided value.
    d3.select("#" + dataFieldId).property('value', dataUrl);
  }).catch(reason => {
    // Let the user know their URL could not be loaded.
    console.log("Failed to load data: " + reason);
    d3.select("#" + dataFieldId).classed('is-invalid', true);
  });
}

function initializeDataUrl(dataFieldId, dataType) {
  // Check if the URL already provides a Markdown URL. If it does, use that
  // URL to load and render the Markdown.
  const url = new URL(window.location);
  renderDataUrl(url.searchParams.get(dataFieldId), dataFieldId, dataType);

  // Listen for changes to the URL from this field id.
  const dataField = d3.select("#" + dataFieldId)
    .on("change", () => renderDataUrl(
      d3.select("#" + dataFieldId).property('value'),
      dataFieldId,
      dataType
    ));
}

window.addEventListener('DOMContentLoaded', (event) => {
  console.log('DOM fully loaded and parsed');

  // Initialize line chart.
  chart = genomeLineChart();

  // Initialize protein view.
  addElement(polymerSelect);

  // Initialize the mutation/site chart.
  logoplot = logoplotChart("#logo_plot");

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
  Promise.all([promiseFontLoaded]).then(
    values => {
      console.log("Promises fulfilled!");

      // Initialize URLs for user-provided data. Tries to find URLs in the
      // current app URL and listens for changes to the given text field ids.
      initializeDataUrl("data-url", "csv");
      initializeDataUrl("pdb-url", "pdb");
      initializeDataUrl("markdown-url", "markdown");
    });
});
