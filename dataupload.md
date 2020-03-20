---
layout: post
title: How to upload your own data
permalink: /dataupload/
---

[`dms-view`](https://jbloomlab.github.io/dms-view) takes three input files.
1. [data file for the site dot plot and mutation logoplot](#data-file)
2. [protein structure file ](#protein-structure)
3. [metadata file](#metatdata-file)

Below are instructions on [how to construct the input files](#input-files), [how to host the input files](#hosting-input-files), and [how to load the input files to the site](#how-to-load-your-data).

# Input files

## Data file

The data file is the main source of data for [`dms-view`](https://jbloomlab.github.io/dms-view).
This file contains the measurements for the site dot plot, the measurements for the mutation logoplot, and the map between the site plot numbering and the protein structure numbering.

The data file is a `csv` (comma-separated file) and it must have the following columns:
* **site**: The site dot plot will be ordered by this column. The values must be ordinal.  
* **label_site**: The site dot plot will be labeled by this column. The values can be numeric or a string.
* **wildtype**: The wildtype at a given site. The tooltips will display this information. The values can be numeric or a string.
* **mutation**: The mutation logoplot will display this mutation. The values must be a single uppercase letter.
* **condition**: The experimental condition used in the experiment to generate the data for the site dot plot and the mutation logoplot. The dropdown menu will display the conditions and the user can toggle between different conditions.
* **protein_chain**: The protein chain(s) in the pdb file for a given site. The values must be in a space-separated list.
* **protein_site**: The protein site in the pdb file for a given site.

The data file must contain at least one column from each of the following categories.

* **site_***: The value for a given site for a given metric (represented by `*`). The values must be numeric. For example, `site_mean`.
* **mut_***: The value for a given site for a given mutation for a given metric (represented by `*`). For example, `mut_mean`.  

## example: HIV antibody escape

Imagine an experiment to test the effect of alanine mutations on the ability of antibodies to bind to HIV.
In this small experiment, the effect of an alanine mutation was measured at position 1 or position 2 for antibody A and antibody B. 

Here is what the data file might look like for this experiment.  

site|site_label|wildtype|mutation|condition|protein_chain|protein_site|mut_max|mut_mean|site_median|
---|---|---|---|---|---|---|---|---|---|
1|pos1|G|A|Ab1|A|27|5|3.5|7
1|pos1|G|A|Ab2|A|27|0|0|7
2|pos2|D|A|Ab1|A|27|0|0|45
2|pos2|D|A|Ab2|A|27|100|50|45

Note how the the **site_*** values are repeated for each mutation at that site.
You can see the data file used in the default [`dms-view`](https://jbloomlab.github.io/dms-view) view [HERE](https://raw.githubusercontent.com/jbloomlab/dms-view/master/docs/_data/IAV/flu_dms-view.csv).

## protein structure

The protein structure file is a [pdb file](https://en.wikipedia.org/wiki/Protein_Data_Bank_(file_format)).
The data file columns **site**, **protein_chain**,  and **protein_site** map differences in numbering between the site/mutation plot and the protein structure.
Specifically, the **protein_site** column contains the correspondence between the site/mutation values and the protein structure.

You can see the protein file used in the default [`dms-view`](https://jbloomlab.github.io/dms-view) view [HERE](https://github.com/jbloomlab/dms-view/blob/master/docs/_data/IAV/4O5N_trimer.pdb).

## metadata file

The metadata file is a [markdown file](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet).
You can use the metadata file to explain your experiment, acknowledge contributors, or make analysis notes.

You can see the protein file used in the default [`dms-view`](https://jbloomlab.github.io/dms-view) view [HERE](https://github.com/jbloomlab/dms-view/blob/master/docs/_data/IAV/lee2019mapping.md).

# Hosting input files

Before you can load any of the three files to [`dms-view`](https://jbloomlab.github.io/dms-view), you must host the files somewhere else.  
This can be as easy as uploading them to [GitHub](https://github.com/), [Google Drive](https://www.google.com/drive/), or [Dropbox](https://www.dropbox.com/).

You can still use [`dms-view`](https://jbloomlab.github.io/dms-view) even if you data is a private repo or directory.
The only caveat is that the [`dms-view`](https://jbloomlab.github.io/dms-view) URL will expire at some point and you will have to reload your data.

# How to load your data

Once you have your input files hosted, you can load the data into [`dms-view`](https://jbloomlab.github.io/dms-view) by filling in the form fields on the front page.
The [data file](#data-file) form field is above the site dot plot, the [protein file](#protein-structure) form field is above the protein structure and the [metadata file](#metadata-file) form field is above the metadata section at the bottom of the site.

All of the data files are saved in the URL.
Once the data is loaded, you can share this new URL with others and _your_ data will load for them.  
