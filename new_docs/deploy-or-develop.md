---
layout: post
title: Deploy or develop dms-view
permalink: /deploy-or-develop/
---

`dms-view` is a single-page web application that can be run from any web server.
To deploy your own instance of the `dms-view` tool, clone [the dms-view repository](https://github.com/dms-view/dms-view.github.io) into a directory name of your choice within your existing web server's publicly available directory structure.

To develop `dms-view` locally, you can use a lightweight web server such as [http-server](https://www.npmjs.com/package/http-server).
You will need to [install npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) before you can download and install `http-server`.

For example, our local development for `dms-view` works like this.

1. Clone `dms-view` repository and change into its local directory.

```bash
git clone https://github.com/dms-view/dms-view.github.io.git
cd dms-view.github.io
```

2. Start your web server on an internal address and port.

```bash
http-server -a 127.0.0.1 -p 8000
```

3. Navigate to http://127.0.0.1:8000 in your browser.

4. Modify source code for `dms-view` as desired and refresh the local version in your browser to see your changes.

Note that `dms-view` loads data (CSVs, PDB files, the font for logo plots, etc.) by making HTTP requests to publicly available servers.
This means that you cannot load local data from your computer unless it is in a directory that is visible to your web server.
In the example above, all files from the top-level `dms-view` repository directory and below will be accessible to your web server.

We welcome contributions to the `dms-view` code and documentation.
[Consult our contributing guide for more details](https://github.com/dms-view/dms-view.github.io/blob/master/CONTRIBUTING.md).
