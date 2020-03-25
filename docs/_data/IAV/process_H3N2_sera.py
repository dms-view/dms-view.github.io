"""
Format Juhye's data for `dms-view`.

SKH 20190805
"""

import pandas as pd


def main():
    # inputs
    fname = "avg_sel_tidy.csv"
    prefs = "_processing/rescaled_prefs.csv"
    freqs = "_processing/H3_human_freqs.csv"
    sera = ["VIDD1",
            "VIDD2",
            "VIDD4",
            "VIDD5"]

    # read in data and subset
    df = pd.read_csv(fname, low_memory=False)
    df = df[df["serum"].isin(sera)]

    # drop unnecessary columns
    df = df.drop(["serum", "serum_group",
                  "serum_vaccination", "zoom_site"], axis=1)

    # rename columns
    df = df.rename(columns={"serum_name_formatted": "condition",
                            "pdb_chain": "protein_chain",
                            "pdb_site": "protein_site",
                            "site": "label_site",
                            "isite": "site"})
    df = df.rename(columns={"mutdiffsel": "mut_Differential Selection",
                            "abs_diffsel": "site_Absolute Differential Selection",
                            "positive_diffsel": "site_Positive Differential Selection",
                            "negative_diffsel": "site_Negative Differential Selection",
                            "max_diffsel": "site_Max Differential Selection",
                            "min_diffsel": "site_Min Differential Selection"})

    # convert datatypes
    df = df.astype({'site': 'int32'})

    # process the preferences
    prefs = pd.read_csv(prefs).rename(columns={'site': 'label_site'})
    prefs = pd.melt(prefs, id_vars='label_site',
                    value_name="mut_DMS prefs", var_name="mutation")
    df = pd.merge(df, prefs, on=['label_site', 'mutation'])

    # process the frequences
    freqs = pd.read_csv(freqs)
    freqs = pd.melt(freqs, id_vars='site',
                    value_name="mut_Natural Frequencies", var_name="mutation")
    df = pd.merge(df, freqs, on=['site', 'mutation'])

    # positive mutation differential selection
    df['mut_Positive Differential Selection'] = (df['mut_Differential Selection']
                                                 .clip(lower=0))

    # check the data
    # per site, there should be 20 AA and identical site-level metrics
    for name, group in df.groupby(["site", "condition"]):
        assert len(group) == 20
        assert len(group["wildtype"].unique()) == 1
        assert len(group["site_Absolute Differential Selection"].unique()) == 1
        assert len(group["site_Positive Differential Selection"].unique()) == 1
        assert len(group["site_Negative Differential Selection"].unique()) == 1
        assert len(group["site_Max Differential Selection"].unique()) == 1
        assert len(group["site_Min Differential Selection"].unique()) == 1

    # output the data
    df.to_csv("flu_dms-view.csv", index=False)


if __name__ == '__main__':
    main()
