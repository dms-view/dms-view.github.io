# IAV data

## data
This directory contains the data from [Lee *et al.,* 2019](https://doi.org/10.1101/670497). Specifically, the raw data can be found in [`https://github.com/jbloomlab/map_flu_serum_Perth2009_H3_HA/blob/master/results/avgdiffsel/avg_sel_tidy.csv`](https://github.com/jbloomlab/map_flu_serum_Perth2009_H3_HA/blob/master/results/avgdiffsel/avg_sel_tidy.csv)

## processing

To create the final dataframe, I ran [`process_H3N2_sera.py`](process_H3N2_sera.py). This script reads in [`avg_sel_tidy.csv`](avg_sel_tidy.csv), subsets the data, renames some columns, and outputs the data into [`flu_dms-view.csv`](flu_dms-view.csv).

## final input data files

In the end, `dms-view` needs two data files:  
1. [`flu_dms-view.csv`](flu_dms-view.csv)  
2. [`4O5N_trimer.pdb`](4O5N_trimer.pdb)

### [`flu_dms-view.csv`](flu_dms-view.csv)  
The final data frame has the following columns:  

* `site_label`: what the line plot x-axis label should say
* `condition`: selective condition. In this case, different sera.  
* `wildtype`:  wildtype residue at this position.  
* `mutation`: mutation at this position.  
* `mut_diffsel`: mutation-level metric  
* `site_absdiffsel`: site-level metric.
* `site_posdiffsel`: site-level metric.
* `site_negdiffsel`: site-level metric.
* `site_maxdiffsel`: site-level metric.  
* `site_mindiffsel`: site-level metric.  
* `site`: site for the line plot (ordinal). In this case, the DMS scan numbering.  
* `protein_chain`: which chain in the pdb the site belongs to
* `protein_site`: which site in chain in the pdb the site belongs to

*SKH note: the script subsets the raw data to only include one sera. However, in the future, `dms-view` should be able to handle multiple sera in condition.*

### [`4O5N_trimer.pdb`](4O5N_trimer.pdb)
