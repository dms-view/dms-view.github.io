"""
Combine the mutation and site long form to dms-view form.
"""

import pandas as pd


def main():
    mut_fname = 'mut_HIV_longform.csv'
    site_fname = 'site_HIV_longform.csv'

    # process the mutation data
    mut = pd.read_csv(mut_fname)
    mut['metric'] = mut['metric'].apply(lambda x: f'mut_{x}')
    mut = pd.pivot_table(mut,
                         index=['site', 'label_site', 'condition',
                                'protein_site', 'protein_chain', 'wildtype',
                                'mutation'],
                         columns='metric', values='value').reset_index()

    # process the site data
    site = pd.read_csv(site_fname)
    site['metric'] = site['metric'].apply(lambda x: f'site_{x}')
    site = pd.pivot_table(site,
                          index=['site', 'label_site', 'condition',
                                 'protein_site', 'protein_chain'],
                          columns='metric', values='value').reset_index()

    # combine the two dataframes
    df = pd.merge(mut, site, on=['site', 'label_site', 'condition',
                                 'protein_site', 'protein_chain'])
    assert len(mut) == len(df)

    # output dataframe
    df.to_csv("HIV_dms-view.csv", index=False)


if __name__ == '__main__':
    main()
