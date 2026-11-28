# World Music Scales Atlas

**An independent interactive research and educational platform for musical scales, modal systems, microtonal tunings and musical traditions worldwide.**

Created and developed by [Dr. Pouya Hosseini](https://drpouyahosseini.github.io/).

[Explore the Atlas](https://worldmusicscalesatlas.github.io/) · [Reference library](https://worldmusicscalesatlas.github.io/reference.html) · [User guide](https://worldmusicscalesatlas.github.io/guide.html) · [About](https://worldmusicscalesatlas.github.io/about.html)

## Overview

The Atlas brings together ethnomusicological documentation, computational pitch analysis and interactive geographic visualization. Explore source-linked pitch systems across cultures, examine their intervals and compare their tuning structures.

The public catalog contains 393 documented tuning models across 65 geographical entries, supported by 99 references. Seven Western diatonic modes are also available.

## Features

- Interactive globe for exploring musical traditions by geographical location.
- Scale and tuning visualizations with intervals expressed in cents.
- Transposition in 50-cent steps and synthesized pitch playback.
- Concentric comparison of octave-based models and shared-axis comparison of open pitch spans.
- Source-linked reference pages with model-specific evidence and interpretation notes.
- Responsive desktop and mobile interface, with home-screen installation and offline support for core application assets.

## Research methodology

The Atlas distinguishes theoretical modal structures, nominal instrument tunings, measured pitch inventories and secondary-source representations. Measured spans are preserved without imposing artificial octave closure. The first pitch is treated as a playback reference where a musical tonic is not established by the evidence.

Numerical similarities do not establish cultural equivalence. The models are analytical representations, not definitive accounts of performance practice or complete musical systems. Source citations and verification limitations accompany each model in the reference library and application. Research workbooks and private notes are not included in this repository.

Geographical anchors indicate approximate cultural provenance and navigation locations, not territorial claims. The Atlas acknowledges the [CARE Principles](https://doi.org/10.5334/dsj-2020-043) and [Local Contexts Traditional Knowledge Labels](https://localcontexts.org/labels/traditional-knowledge-labels/). It does not claim community authorization or assign community-defined labels on behalf of others.

## Run locally

From the repository directory, start a local server:

```sh
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in a browser.

With Node.js 22 or later, run the automated checks:

```sh
npm test
npm run seo:check
```

After changes to the public catalog or built-in modes, regenerate the reference pages and search index using `npm run seo:generate`.

## Authorship and licensing

Copyright © 2026 Dr. Pouya Hosseini. All rights reserved in original Atlas materials.

The original software, visual identity and protected content are proprietary under the [licence and third-party rights notice](LICENSE). Public access does not constitute a general open-source licence. Applicable statutory exceptions, GitHub platform rights and third-party licences remain unaffected.

The geographical basemap uses [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) public-domain data.

DaMuSc database compilation © 2022–2026 John M. McBride and contributors, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See the [database licensing scope](https://github.com/jomimc/DaMuSc/blob/main/LICENSE.md) and [McBride, Passmore & Tlusty (2023)](https://doi.org/10.1371/journal.pone.0284851). Selected raw interval records are adapted with Atlas labels, geographic anchors, evidence annotations and display geometry. No additional restrictions apply to the CC BY licensed contributions; underlying third-party publications and cultural materials retain their own rights.

See the complete [Copyright & Terms of Use](https://worldmusicscalesatlas.github.io/terms.html).

## Feedback and collaboration

Scientific corrections, methodological feedback and cultural concerns are welcome through the [issue tracker](https://github.com/worldmusicscalesatlas/worldmusicscalesatlas.github.io/issues). For research collaboration and licensing enquiries, visit the [creator's official website](https://drpouyahosseini.github.io/).
