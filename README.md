# [`dms-view`](https://dms-view.github.io)

Sarah Hilton\*, John Huddleston\*, Allison Black, Khrystyna North, Adam Dingens, Trevor Bedford, and Jesse Bloom.
(* equal contribution)

[![DOI](https://joss.theoj.org/papers/10.21105/joss.02353/status.svg)](https://doi.org/10.21105/joss.02353)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3986155.svg)](https://doi.org/10.5281/zenodo.3986155)

[`dms-view`](https://dms-view.github.io) is an interactive visualization tool for deep mutational scanning experiments.
You can find the tool at [`dms-view.github.io`](https://dms-view.github.io).

This repo contains the JavaScript and D3 code to run the tool itself.
For information on how to use the tool, please see the [documentation](https://dms-view.github.io/docs).

Please raise issues with the tool at [`github.com/dms-view/dms-view.github.io/issues`](https://github.com/dms-view/dms-view.github.io/issues).

## Organization

The code and data for the docs, the tool, and the paper are found in the following directories:

### [`./assets/`](./assets/)

This directory contains the code for the [`dms-view.github.io`](https://dms-view.github.io) tool.
- [`./assets/css/`](./assets/css) contains the CSS stylesheet.
- [`./assets/fonts/`](./assets/fonts) contains the font file for the logoplots
- [`./assets/images/`](./assets/images) contains static images used in the docs and the tool.
- [`./assets/js/`](./assets/js) contains the `JavaScript` code to run the tool.

### [`./data/`](./data/)

This directory contains the default data for the tool from [Lee _et al.,_ 2019](https://elifesciences.org/articles/49324).

### [`./docs/`](./docs/)

This directory contains the code for the [`dms-view` docs](https://dms-view.github.io/docs).

### [`./_layouts/`](./_layouts/)

This directory contains the templates for the docs.

### [`./paper/`](./paper/)
This directory contains the code for the [`dms-view` paper](https://www.biorxiv.org/content/10.1101/2020.05.14.096842v1).

## Testing

As described above, [`dms-view`](https://dms-view.github.io) uses a default dataset from [Lee _et al.,_ 2019](https://elifesciences.org/articles/49324).
Below are two descriptions of different combinations of dropdown menus and selected sites, as well as pictures of what the tool should look like.

### View 1 (default view)
When [`dms-view.github.io`](https://dms-view.github.io) is loaded, the default view of the data section should look as follows:

![](/assets/images/view1.png)

[Load view 1](https://dms-view.github.io/?markdown-url=https%3A%2F%2Fdms-view.github.io%2Fdata%2FIAV%2Flee2019mapping.md&data-url=https%3A%2F%2Fdms-view.github.io%2Fdata%2FIAV%2Fflu_dms-view.csv&condition=2010-age-21&site_metric=site_Positive+Differential+Selection&mutation_metric=mut_Positive+Differential+Selection&selected_sites=222&pdb-url=https%3A%2F%2Fdms-view.github.io%2Fdata%2FIAV%2F4O5N_trimer.pdb) to explore this example.

### View 2
The data section should look as follows when you change
- condition to "2009-age-65"
- mutation metric to "Natural Frequencies"
- selected sites 144, 159, 192, 193, 222, 224

![](/assets/images/view2.png)

[Load view 2](https://dms-view.github.io/?markdown-url=https%3A%2F%2Fdms-view.github.io%2Fdata%2FIAV%2Flee2019mapping.md&data-url=https%3A%2F%2Fdms-view.github.io%2Fdata%2FIAV%2Fflu_dms-view.csv&pdb-url=https%3A%2F%2Fdms-view.github.io%2Fdata%2FIAV%2F4O5N_trimer.pdb&selected_sites=144%2C159%2C192%2C193%2C222%2C244&condition=2009-age-65&site_metric=site_Positive+Differential+Selection&mutation_metric=mut_Natural+Frequencies) to explore this example.

### Other views

In the documentation, we use [`dms-view`](https://dms-view.github.io) to recreate paper figures for two different studies.
Please see [dms-view.github.io/docs/casestudies](https://dms-view.github.io/docs/casestudies) to see these examples

## Contribute to dms-view

We welcome contributions to the `dms-view` code and documentation.
[Consult our contributing guide for more details](CONTRIBUTING.md).

Have you used `dms-view` for your own analyses and think these would make a great case study for our documentation?
[Open a new issue on GitHub](https://github.com/dms-view/dms-view.github.io/issues/new) to let us know more.

## Building the complete website locally

Build the complete `dms-view` website locally with [Jekyll and Bundler](https://jekyllrb.com/docs/).

```bash
# Install dependencies for Jekyll.
bundle install

# Build the site.
bundle exec jekyll serve
```

View the local website in your browser at [http://localhost:4000/](http://localhost:4000/).

[See the documentation for more details on deploying or developing `dms-view` locally](https://dms-view.github.io/docs/deploy-or-develop/).
