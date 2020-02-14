# Comprehensive, residue-level mapping of polyclonal neutralizing antibody responses in BG505 SOSIP trimer vaccinated rabbits
Adam S. Dingens, Payal Pratap, Keara Malone, Thomas Ketas, Sarah Hilton, P.J Klasse, John Moore, Andrew Ward, Jesse D. Bloom (and likely others)

We performed mutational antigenic profiling of BG505 SOSIP trimer vaccinated rabbit serum, provided by John Moore and PJ Klasse. Our first mutational antigenic profiling analysis of escape from PGT151 using the BF520 env libraries was published [here](http://dx.doi.org/10.1016/j.chom.2017.05.003) in June 2017, and this original analysis is located [in this ipython notebook](https://github.com/adingens/BF520_MutationalAntigenicProfiling_PGT151).

Here, we used BG505.T332N mutant Env libraries, first described and characterized in [Haddox, Dingens et al 2018](https://elifesciences.org/articles/34420). Note that this is matched to the BG505 immunogens, enabling profiling of autologous responses.

## Data plotted here in [dms_view](github.com/jbloomlab/dms-view)

The _differential selection_ statistic used in this analysis is explained in detail [here](https://jbloomlab.github.io/dms_tools2/diffsel.html).

For each rabbit sera, you can view the mean or median (across biological replicates) site- and mutation-level differential selection metrics. These include:

- **positive diffesel**: The sum of all positive differential selection values at a site (site level). This gives a sense to the total amount of escape/selective pressure at each site.
- **negative diffesel**: The sum of all negative differential selection values at a site (site level). This gives a sense for mutations that are depleted, rather than enriched, during serum selection relative to a non-selected control library. It is intriguing that many of these potential serum sensitizing mutations cluster and are consistent across sera.
- **max diffesel**: The value of the largest effect mutation (largest mutation differential selection) at each site (site level).

The logoplots plot the mutation-level differential selection values (**median diffsel** or **median diffsel**).

Additionally, logoplots can show:

- The frequency at which each amino acid is found in nature (**Natural Frequencies**), accessed from [LANL's filtered web alignment](https://www.hiv.lanl.gov/content/sequence/NEWALIGN/align.html]) (2017 version).
- The BG505 amino-acid preferences (**DMS prefs**), determined using the same BG505.T332N mutant virus libraries in [Haddox, Dingens et al 2018](https://elifesciences.org/articles/34420). Here, the height of each amino acid is proportional to how well that virus replicates in cell culture. This statistic can crudely be used to examine what mutations are viable and in our mutant virus libraries before serum selection.

Data is currently plotted on a BG505 SOSIP.664 Env monomer structure ([5FYL](https://www.rcsb.org/structure/5FYL)).
