"""
Subset HIV data to a single antibody.

SKH 20190819
"""

import pandas as pd


def main():
    # inputs
    fname = "HIV_dms-view.csv"
    target_ab = "PGT151"

    # read in data
    df = pd.read_csv(fname)

    # subset
    df = df[df["condition"] == target_ab]

    # output data
    df.to_csv("HIVsmall_dms-view.csv", index=False)


if __name__ == '__main__':
    main()
