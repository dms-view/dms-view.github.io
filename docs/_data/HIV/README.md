# HIV data

This directory contains the data from [Dingens *et al.,* 2019](https://github.com/jbloomlab/EnvsAntigenicAtlas).
Specifically, the summary `.csv` files from [`https://github.com/jbloomlab/EnvsAntigenicAtlas/tree/master/results/diffsel/wtDNA_ctrl`](https://github.com/jbloomlab/EnvsAntigenicAtlas/tree/master/results/diffsel/wtDNA_ctrl).

The original files are separated by metric and antibody and follow the naming scheme `summary_<ANTIBODY>-<METRIC>.csv`.

The script [`process_HIV_abs.py`](process_HIV_abs.py) combines the different files, manages the numbering scheme, and outputs a file in the `dms-view` format called [`HIV_dms-view.csv`](HIV_dms-view.csv).

*note: I removed the pool data because the naming scheme was inconsistent.*

The final data frame has the following columns:  
* genome_label: what the line plot x-axis label should say
* condition: selective condition. In this case, different antibodies.  
* wildtype:  wildtype residue at this position.  
* mutation: mutation at this position.  
* mut_meanmutdiffsel: mutation level metric  
* mut_medianmutdiffsel: mutational level metric.  
* site_meansitediffsel: site level metric.
* site_mediansitediffsel: site level metric.  
* genome_site: The numbering in the deep mutational scan. *SKH note: I used this numbering to put the HXB2 numbers in order. this will probably not be a column in the normal dataframe, as `_isite` performs this role.*  
* _isite: internal bookkeeping
* protein_chain: which chain in the pdb the site belongs to
* protein_site: which site in chain in the pdb the site belongs to

*SKH note: The HIV numbering is special. The site is unique so the chain designation is not needed. This is not going to be case for influenza or many other proteins*
