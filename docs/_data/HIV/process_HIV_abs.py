"""
Format Adam's data for `dms-view`.

SKH 20190805
"""

import pandas as pd
import glob
import os


def main():
    # inputs
    HXB2_map = "BG505_to_HXB2.csv"
    pdb_map = "protein_map.csv"
    site = []
    mut = []

    # read in data
    for fname in glob.glob("summary_*.csv"):
        # parse name
        catch = os.path.splitext(fname)[0].split("_")[1].split("-")
        antibody = catch[0]
        metric = catch[1]
        df = pd.read_csv(fname)
        # treat differently if site metric or mut metric
        if "site" in metric:
            df = df[["site", "positive_diffsel"]]
            df["condition"] = antibody
            df["metric"] = f"site_{metric}"
            df = df.rename(columns={"positive_diffsel": "value",
                                    "site": "label_site"})
            site.append(df)
        elif "mut" in metric:
            df["condition"] = antibody
            df["metric"] = f"mut_{metric}"
            df = df.rename(columns={"mutdiffsel": "value",
                                    "site": "label_site"})
            mut.append(df)
        else:
            raise ValueError(f"{metric} is neither site nor mut")

    # concatenate the site metrics
    site = pd.concat(site)
    site = (site.pivot_table(index=['label_site', 'condition'],
                             columns='metric',
                             values='value').reset_index())

    # concatenate the mutation metrics (repeat code)
    mut = pd.concat(mut)
    mut = (mut.pivot_table(index=['label_site', 'condition',
                                  'wildtype', 'mutation'],
                           columns='metric', values='value').reset_index())

    # process the full dataframe
    df = pd.merge(mut, site, on=["label_site", "condition"])
    conditions = len(df["condition"].unique())
    # add in the DMS numbering
    m = (pd.read_csv(HXB2_map)
           .rename(columns={"original": "site", "new": "label_site"})
         [["site", "label_site"]])
    df = pd.merge(df, m, on=["label_site"]).astype({'site': 'int32'})
    df = df.sort_values("site", ascending=True)

    # check data
    for name, group in df.groupby(["site"]):
        assert len(group) == 19 * conditions

    # add in the protein numbers
    m = pd.read_csv(pdb_map)
    df = pd.merge(df, m, on="label_site")

    # output the data
    df = df.drop_duplicates()
    df.to_csv("HIV_dms-view.csv", index=False)


if __name__ == '__main__':
    main()
