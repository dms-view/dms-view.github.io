"""
Helper script to extract the chain from the pdb file.
"""

import pandas as pd


def main():
    df = []
    with open("5FYL_AbsRemoved.pdb", "r") as f:
        for line in f.readlines():
            if line.startswith("ATOM"):
                line = line.split()
                df.append(line[4:6])
    df = pd.DataFrame(df, columns=["protein_chain", "protein_site"])
    df["label_site"] = df["protein_site"]
    df.to_csv("protein_map.csv", index=False)


if __name__ == '__main__':
    main()
