# Interactive visualization of mutational antigenic profiling data

[`./docs/`](docs/): code and data for the tool
[`./notebooks/`](notebooks/): scratch `jupyter notebooks` for prototyping

## Build the site locally

[Install Ruby, bundler, and Jekyll](https://jekyllrb.com/docs/installation/).

Build the site with automatic regeneration when input files change.

```bash
bundle exec jekyll serve --source docs
```

View the site at [http://localhost:4000](http://localhost:4000).

Add a new dataset page by creating a new Markdown file in `_datasets` where the [front matter](https://jekyllrb.com/docs/front-matter/) specifies a `title`, `data_url`, `pdb_url`, a `layout` of "app", and an optional text `summary` that will appear above the DMS data.
Include a complete description of the dataset in the body of the Markdown.
