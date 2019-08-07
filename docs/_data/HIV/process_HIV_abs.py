"""
Format Adam's data for `dms-view`.

SKH 20190805
"""

import pandas as pd
import glob
import os


def main():
    map = "BG505_to_HXB2.csv"
    site = []
    mut = []
    for fname in glob.glob("summary_*.csv"):
        catch = os.path.splitext(fname)[0].split("_")[1].split("-")
        antibody = catch[0]
        metric = catch[1]
        df = pd.read_csv(fname)
        if "site" in metric:
            df = df[["site", "positive_diffsel"]]
            df["condition"] = antibody
            df["metric"] = f"site_{metric}"
            df = df.rename(columns={"positive_diffsel": "value",
                                    "site": "genome_label"})
            site.append(df)
        elif "mut" in metric:
            df["condition"] = antibody
            df["metric"] = f"mut_{metric}"
            df = df.rename(columns={"mutdiffsel": "value",
                                    "site": "genome_label"})
            mut.append(df)
        else:
            raise ValueError(f"{metric} is neither site nor mut")
    site = pd.concat(site)
    site = (site.pivot_table(index=['genome_label', 'condition'],
                             columns='metric',
                             values='value').reset_index())
    mut = pd.concat(mut)
    mut = (mut.pivot_table(index=['genome_label', 'condition',
                                  'wildtype', 'mutation'],
                           columns='metric', values='value').reset_index())
    df = pd.merge(mut, site, on=["genome_label", "condition"])
    conditions = len(df["condition"].unique())
    m = (pd.read_csv(map)
           .rename(columns={"original": "genome_site", "new": "genome_label"})
         [["genome_site", "genome_label"]])
    df = pd.merge(df, m, on=["genome_label"]).astype({'genome_site': 'int32'})
    df = df.sort_values("genome_site", ascending=True)

    temp = []
    i = 0
    for name, group in df.groupby(["genome_site"]):
        assert len(group) == 19 * conditions
        group = group.copy()
        group["_isite"] = i
        i += 1
        temp.append(group)
    df = pd.concat(temp)

    # add in the protein numbers
    m = pd.read_csv("protein_map.csv")
    df = pd.merge(df, m, on="genome_label")
    df.to_csv("HIV_dms-view.csv", index=False)


if __name__ == '__main__':
    main()
