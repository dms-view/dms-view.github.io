# Compile paper with pandoc

Use pandoc to compile the paper.

```bash
pandoc --filter pandoc-citeproc --bibliography=paper.bib --template template.tex -s paper.md -o paper.pdf
```
