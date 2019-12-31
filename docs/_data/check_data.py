"""
QCs data for `dms-view`
"""
import pandas as pd
from pandas.api.types import is_numeric_dtype
import argparse


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
                         description='calculate pvalues from pps')
    parser.add_argument('datafile',
                        type=str,
                        help='path to datafile')
    return parser.parse_args()


def main():
    args = parse_args()
    cols = ['site',
            'label_site',
            'protein_site',
            'protein_chain',
            'condition',
            'wildtype']
    cols.sort()

    # read in the data
    df = pd.read_csv(args.datafile)

    # the correct columns?
    df_cols = df.columns.values
    for col in cols:
        assert col in df_cols, f'{col} is not a column in dataframe'

    site_metrics = [x for x in df_cols if x.startswith('site_')]
    assert len(site_metrics) >= 1, ('There needs to be at one site-metric '
                                    ' column starting with `site_`')

    mut_metrics = [x for x in df_cols if x.startswith('mut_')]
    assert len(mut_metrics) >= 1, ('There needs to be at one mut-metric column'
                                   ' starting with `mut_`')

    # the site, site_metrics and mut_metrics should be numeric
    for mut_metric in mut_metrics:
        assert is_numeric_dtype(df[mut_metric]), f'{mut_metric} not numeric'

    for site_metric in site_metrics:
        assert is_numeric_dtype(df[site_metric]), f'{site_metric} not numeric'

    assert is_numeric_dtype(df['site'])

    # mutations must be single character, ABC, and uppercase
    allowed_letters = ['A', 'R', 'N', 'D', 'C', 'Q', 'E', 'G', 'H', 'I', 'L',
                       'K', 'M', 'F', 'P', 'S', 'T', 'W', 'Y', 'V']
    mutations = df['mutation'].str.strip().unique()
    assert all(i in mutations for i in allowed_letters)

    # for every condition by site metric, is the data the same?
    # this is ignoring the mutation metric
    mut_metrics.extend(['mutation'])
    for name, group in (df.drop(columns=mut_metrics)
                          .groupby(['condition', 'site'])):
        rows = group.drop_duplicates()
        assert len(rows) == 1, (f'{name[0]} and {name[1]} have'
                                f' {len(group.drop_duplicates())} unique rows'
                                ' instead of one unique row.')


if __name__ == '__main__':
    main()
