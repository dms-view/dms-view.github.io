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
const dropdownsToTrack = ["condition", "site_metric", "mutation_metric", "selected_sites"];

var dropdownChange;
var clearbuttonchange;

let protein;
const greyColor = "#999999";

// Bitstream Vera Fonts provided by Gnome:
// https://www.gnome.org/fonts/
var fontPath = "DejaVuSansMonoBold_SeqLogo.ttf";
var fontObject;

function updateStateFromUrl(fieldIds) {
  // Update the current value of the given field ids based on the corresponding
  // fields in the URL.
  return new Promise(resolve => {
    const url = new URL(window.location);
    let validOptions;

    fieldIds.forEach(field => {
      const fieldValue = url.searchParams.get(field);

      if (fieldValue !== null && fieldValue.length > 0) {
        console.log("Found field '" + field + "' in the URL with value: " + fieldValue);

        // Find the list of valid options for the current field.
        validOptions = d3.select("#" + field).selectAll("option").nodes().map(d => d["value"]);

        // Check whether the requested field value is valid.
        // If it is, update the field.
        // Otherwise, replace the URL field with the first valid option.
        if (d3.select("#" + field).property("type") === "text" || validOptions.includes(fieldValue)) {
          console.log("Updated field", field);
          d3.select("#" + field).property('value', fieldValue);
        }
        else {
          console.log("WARNING:", fieldValue, "is not a valid option for the field", field);
        }
      }
      else {
        console.log("Did not find field '" + field + "' in the URL.");
      }
    });

    resolve(fieldIds);
  });
}

function updateUrlFromFieldIds(fieldIds) {
  // Update the document's query string to reflect the requested URL.
  // This should help maintain state if the user copies and pastes the
  // document's URL.
  const url = new URL(window.location);

  fieldIds.forEach(field => {
    url.searchParams.set(field, d3.select("#" + field).property('value'));
  });

  history.pushState({}, "", url.toString());
  console.log("Changed URL to: " + url.toString());
}

// Define functions to load and render data URLs including Markdown, CSV, and
// PDB files.

function renderMarkdown (data, dataUrl) {
  // Render Markdown text to HTML.
  const markdownOutput = marked(data);

  // If there is any rendered output, update the DOM.
  if (markdownOutput.length > 0) {
    d3.select("#markdown-output")
      .html(markdownOutput);
  }
}

function renderCsv(data, dataUrl) {
  // Sort data by site
  data.forEach(function(d) {
    d.site = +d.site;
    d.data_url = dataUrl;
    return d;
  })
  data = data.sort(function(a, b) {
    return a.site - b.site;
  });

  d3.select("#line_plot")
    .data([data])
    .call(chart);

  let conditions = Array.from(chart.data.keys());
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
      .attr("id", 'site_metric')
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

  function selectedSitesChanged() {
    const labelSites = d3.select("#selected_sites").property("value").split(",");
    console.log("Changed sites input");
    console.log(labelSites);

    clearbuttonchange();
    const selectedSiteData = Array.from(chart.condition_data.values()).filter(d => labelSites.includes(d.label_site));
    console.log(selectedSiteData.map(d => d3.select("#site_" + d.site)));
    chart.updateSites(selectedSiteData.map(d => d3.select("#site_" + d.site)));
  }

  d3.select("#selected_sites")
    .on("change", selectedSitesChanged);

  // Initialize the state of each dropdown based on values in the URL.
  console.log("Initialize dropdowns from URL");
  updateStateFromUrl(dropdownsToTrack).then(values => {
    // Check whether the URL provides a non-empty list of selected sites. If
    // not, we will select the maximum site by default.
    const url = new URL(window.location);
    let selectMaximumSite = true;
    if (url.searchParams.get("selected_sites") !== null) {
      selectMaximumSite = false;
    }

    // Update the chart from the current state of the dropdowns, after
    // initializing their state from the URL. This updates the URL to reflect
    // the state of all tracked form fields.
    console.log(values);
    dropdownChange();

    // If the user does not provide any selected sites from the URL, select the
    // site with the maximum y value by default.
    if (selectMaximumSite) {
      console.log("Select site with maximum y value");
      const circles = d3.selectAll("circle");
      const maxMetricIndex = d3.maxIndex(circles.data(), d => +d.metric);
      const maxMetricRecord = d3.select(circles.nodes()[maxMetricIndex]);
      chart.updateSites([maxMetricRecord]);
    }
    else {
      // If we are not selecting the maximum site in the data, select the
      // user-provided sites. This can be an empty list.
      selectedSitesChanged();
    }
  });
}

function renderPdb(data, dataUrl) {
  protein = data;
  protein.setRotation([2, 0, 0])
  protein.autoView()
  protein.addRepresentation(polymerSelect.value, {
    sele: "polymer",
    name: "polymer",
    color: greyColor
  });

  // If data have been loaded into the site plot, select any sites from that
  // panel in the protein view, too.
  if (chart !== undefined) {
    chart.updateSites(d3.selectAll(".selected").nodes().map(d => d3.select(d)));
  }

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
      stage.animationControls.clear()
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
    renderFunction(data, dataUrl);

    // Remove any invalid input status for the URL text field.
    d3.select("#" + dataFieldId).classed('is-invalid', false);

    // Update the URL text field to reflect the provided value.
    d3.select("#" + dataFieldId).property('value', dataUrl);

    // Update the URL.
    updateUrlFromFieldIds([dataFieldId]);
  }).catch(reason => {
    // Let the user know their URL could not be loaded.
    console.log("Failed to load data: " + reason);
    d3.select("#" + dataFieldId).classed('is-invalid', true);
  });
}

function initializeDataUrl(dataFieldId, dataType, defaultDataUrl) {
  // Check if the URL already provides a data URL. If it does, use that URL to
  // load and render the data by type. Otherwise, use the provided default URL.
  const url = new URL(window.location);

  let dataUrl = url.searchParams.get(dataFieldId);
  if (dataUrl === null) {
    dataUrl = defaultDataUrl;
  }

  renderDataUrl(dataUrl, dataFieldId, dataType);

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
      initializeDataUrl("data-url", "csv", "https://dms-view.github.io/flu_dms-view.csv");
      initializeDataUrl("pdb-url", "pdb", "https://dms-view.github.io/4O5N_trimer.pdb");
      initializeDataUrl("markdown-url", "markdown", "https://dms-view.github.io/lee2019mapping.md");
    });
});
