---
layout: app
title: HIV Env Antigenic Atlas
summary: Dingens et al. 2019 mapped how all amino-acid mutations to a Influenza Virus surface protein affected the virus's ability to escape serum from different humans.
data_url: /_data/HIV/HIV_dms-view.csv
pdb_url: /_data/HIV/5FYL_AbsRemoved.pdb
---

This directory contains the data from [Dingens et al. 2019](https://github.com/jbloomlab/EnvsAntigenicAtlas).
Specifically, the summary `.csv` files from [`https://github.com/jbloomlab/EnvsAntigenicAtlas/tree/master/results/diffsel/wtDNA_ctrl`](https://github.com/jbloomlab/EnvsAntigenicAtlas/tree/master/results/diffsel/wtDNA_ctrl).

The original files are separated by metric and antibody and follow the naming scheme `summary_<ANTIBODY>-<METRIC>.csv`.
These files use *HXB2* numbering, which is a mixture of integers and strings and therefore does not an easily sortable order.
