# Data

`dms-view` needs two input datafiles: the data file and the protein structure file.

## data file
The data file contains the information which will be displayed in the line plot, the logoplots, and on the protein structure.
The data file is a `csv` (comma-separated file) and it must have the following columns:

* **site**: The line plot will be ordered by this column. The values must be ordinal.  
* **label_site**: The line plot will be labeled by this column. The values can be numeric or a string.
* **wildtype**: The wildtype at a given site. The tooltips will display this information. The values can be numeric or a string.
* **mutation**: The logoplot will display the mutation. The values must be a single uppercase letter character.
* **condition**: The experimental condition which generated the data for the lineplot and logoplot. The dropdown menu will display and all the user to toggle between different conditions.
* **protein_chain**: The protein chain in the pdb file for a given site.
* **protein_site**: The protein site in the pdb file for a given site.

The data file must contain at least one column from each of the following categories.

* **site_***: The value for a given site for a given metric represented by `*`. The values must be numeric. For example, **site_mean**.
* **mut_***: The value for a given site for a given mutation for a given metric represented by `*`. For example, **mut_mean**.  

## protein structure

The protein structure file is a [pdb file](https://en.wikipedia.org/wiki/Protein_Data_Bank_(file_format)) for the protein of interest.
The data file columns **site**, **protein_chain**,  and **protein_site** map differences in numbering.

## example: HIV antibody escape

Virologists are interested in which mutations allow an antibody to bind to a virus and which mutations allow the virus to "escape" the antibody.
Common experiments include making many mutations to different sites in a protein and testing whether or not the virus can "escape" different antibodies. Imagine this experiment tested the effect of an alanine mutation at either position 1 or position 2 of a protein for antibody A and for antibody B. Here is what the data file might look like for this experiment. 

site|site_label|wildtype|mutation|condition|protein_chain|protein_site|mut_max|mut_mean|site_median|
---|---|---|---|---|---|---|---|---|---|
1|"pos1"|G|A|antibody A|A|27|5|3.5|7
1|"pos1"|G|A|antibody B|A|27|0|0|0
2|"pos2"|G|A|antibody A|A|27|0|0|0
2|"pos2"|G|A|antibody B|A|27|100|50|45
