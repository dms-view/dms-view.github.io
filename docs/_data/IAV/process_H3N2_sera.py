"""
Format Juhye's data for `dms-view`.

SKH 20190805
"""

import pandas as pd


def main():
    # inputs
    fname = "avg_sel_tidy.csv"
    sera = ["VIDD5"]

    # read in data and subset
    df = pd.read_csv(fname, low_memory=False)
    df = df[df["serum"].isin(sera)]

    # drop unnecessary columns
    df = df.drop(["serum_name_formatted", "serum_group",
                  "serum_vaccination", "zoom_site"], axis=1)

    # rename columns
    df = df.rename(columns={"serum": "condition",
                            "pdb_chain": "protein_chain",
                            "pdb_site": "protein_site",
                            "site": "label_site",
                            "isite": "site"})
    df = df.rename(columns={"mutdiffsel": "mut_diffsel",
                            "abs_diffsel": "site_absdiffsel",
                            "positive_diffsel": "site_posdiffsel",
                            "negative_diffsel": "site_negdiffsel",
                            "max_diffsel": "site_maxdiffsel",
                            "min_diffsel": "site_mindiffsel"})

    # convert datatypes
    df = df.astype({'site': 'int32'})

    # check the data
    # per site, there should be 20 AA and identical site-level metrics
    for name, group in df.groupby("site"):
        assert len(group) == 20
        assert len(group["wildtype"].unique()) == 1
        assert len(group["site_absdiffsel"].unique()) == 1
        assert len(group["site_posdiffsel"].unique()) == 1
        assert len(group["site_negdiffsel"].unique()) == 1
        assert len(group["site_maxdiffsel"].unique()) == 1
        assert len(group["site_mindiffsel"].unique()) == 1

    # output the data
    df.to_csv("flu_dms-view.csv", index=False)


if __name__ == '__main__':
    main()
