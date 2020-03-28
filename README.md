# [`dms-view`](https://dms-view.github.io)

Sarah Hilton\*, John Huddleston\*, Allison Black, Khrystyna North, Adam Dingens, Trevor Bedford, and Jesse Bloom.   
(* equal contribution)  

[`dms-view`](https://dms-view.github.io) is an interactive visualization tool for deep mutational scanning experiments.
You can find the tool at [`dms-view.github.io`](https://dms-view.github.io).

This repo contains the JavaScript and D3 code to run the tool itself.
For information on how to use the tool, please see the [documentation](https://dms-view.github.io/docs).

Please raise issues with the tool at [`github.com/dms-view/dms-view.github.io/issues`](https://github.com/dms-view/dms-view.github.io/issues).

## Organization

There are two categories of files in this repo: code to run the website and default data.

### (1) code to run the website

#### website skeleton and styles
- [`index.html`](index.html): The HTML skeleton of the tool.
- [`styles.css`](styles.css): CSS styles for the website.

#### JavaScript / D3 for the plots
- [`main.js`](main.js): Control script for data processing and JavaScript code for the three panels.
- [`line_plot_zoom.js`](line_plot_zoom.js): JavaScript and D3 code for the site dot plot panel.
- [`logoplot.js`](logoplot.js): JavaScript and D3 code for the mutation logoplot panel.
- [`prot_struct.js`](prot_struct.js): JavaScript and [NGL](http://nglviewer.org/ngl/api/manual/) code for the protein structure panel.

#### external packages and files
- [`DejaVuSansMonoBold_SeqLogo.ttf`](DejaVuSansMonoBold_SeqLogo.ttf): font for the mutation logoplot panel. More info on the font [HERE](https://github.com/jbloomlab/dmslogo/tree/master/dmslogo/ttf_fonts).
- [`node_modules/`](node_modules/): External JavaScript modules.
- [`ngl.js`](ngl.js): [NGL](http://nglviewer.org/ngl/api/manual/) module code.


### (2) default data

If [`dms-view.github.io`](https://dms-view.github.io) is loaded without datafiles specified in the URL, influenza serum mapping data from [Lee _et al.,_ 2019](https://elifesciences.org/articles/49324) is loaded by default.
For more information on how to create the data files, see [`dms-view.github.io/docs/dataupload`](https://dms-view.github.io/docs/dataupload).

- [`flu_dms-view.csv`](flu_dms-view.csv): [data file](https://dms-view.github.io/docs/dataupload/#data-file)
- [`4O5N_trimer.pdb`](4O5N_trimer.pdb): [protein structure file](https://dms-view.github.io/docs/dataupload/#protein-structure)
- [`lee2019mapping.md`](lee2019mapping.md): [metadata file](https://dms-view.github.io/docs/dataupload/#metatdata-file)
