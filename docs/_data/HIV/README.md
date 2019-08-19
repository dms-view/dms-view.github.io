# HIV data

## data
This directory contains the data from [Dingens *et al.,* 2019](https://github.com/jbloomlab/EnvsAntigenicAtlas).
Specifically, the summary `.csv` files from [`https://github.com/jbloomlab/EnvsAntigenicAtlas/tree/master/results/diffsel/wtDNA_ctrl`](https://github.com/jbloomlab/EnvsAntigenicAtlas/tree/master/results/diffsel/wtDNA_ctrl).

The original files are separated by metric and antibody and follow the naming scheme `summary_<ANTIBODY>-<METRIC>.csv`.
These files use *HXB2* numbering, which is a mixture of integers and strings and therefore does not an easily sortable order.  

*SKH note: I removed the pool data because the naming scheme was inconsistent.*

## processing

### helper files

There are two helper files to keep the numbering straight.  
1. [`BG505_to_HXB2.csv`](BG505_to_HXB2.csv): This map converts the HXB2 numbers (strings) to the numbering used in the scan (integers). The BG505 numbering will end up being the `_isite` column and the HXB2 numbering will end up being the `site_label` column. I will sort the HXB2 numbering using corresponding BG505 numbering. I got this file from [`https://github.com/jbloomlab/EnvsAntigenicAtlas/blob/master/results/HXB2_numbering/BG505_to_HXB2.csv`](https://github.com/jbloomlab/EnvsAntigenicAtlas/blob/master/results/HXB2_numbering/BG505_to_HXB2.csv)  
2.[`protein_map.csv`](protein_map.csv): This map converts the HXB2 number to the protein chain and protein site. The pdb structure [`5FYL_AbsRemoved.pdb`](5FYL_AbsRemoved.pdb) is already in HXB2 numbering. That is the "site" in the pdb is the HXB2 site number. This map is made using the script [process_pdb.py](process_pdb.py).

### scripts

To create the final dataframe, I ran the following scripts (in this order):

1. [`process_pdb.py`](process_pdb.py): This script parses the pdb file [`5FYL_AbsRemoved.pdb`](5FYL_AbsRemoved.pdb) and creates the map [`protein_map.csv`](protein_map.csv).
2. [`process_HIV_abs.py`](process_HIV_abs.py): This script combines the different files, manages the numbering scheme, and outputs a file in the `dms-view` format called [`HIV_dms-view.csv`](HIV_dms-view.csv). It takes as input [`protein_map.csv`](protein_map.csv), [`BG505_to_HXB2.csv`](BG505_to_HXB2.csv), and all of the summary files in the format `summary_<ANTIBODY>-<METRIC>.csv`

## final input data files

In the end, `dms-view` needs two data files:  
1. [`HIV_dms-view.csv`](HIV_dms-view.csv)  
2. [`5FYL_AbsRemoved.pdb`](5FYL_AbsRemoved.pdb)

### [`HIV_dms-view.csv`](HIV_dms-view.csv)  
The final data frame has the following columns:  

* `site_label`: what the line plot x-axis label should say
* `condition`: selective condition. In this case, different antibodies.  
* `wildtype`:  wildtype residue at this position.  
* `mutation`: mutation at this position.  
* `mut_meanmutdiffsel`: mutation-level metric  
* `mut_medianmutdiffsel`: mutational-level metric.  
* `site_meansitediffsel`: site-level metric.
* `site_mediansitediffsel`: site-level metric.   
* `_isite`: internal bookkeeping. In this case, the DMS scan numbering.
* `protein_chain`: which chain in the pdb the site belongs to
* `protein_site`: which site in chain in the pdb the site belongs to

### [`5FYL_AbsRemoved.pdb`](5FYL_AbsRemoved.pdb)
Adam sent me this file but says that you can find it under pdb code [5FYL](https://www.rcsb.org/structure/5fyl).
