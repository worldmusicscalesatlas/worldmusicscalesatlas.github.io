# World Music Scales Atlas

Start with D Dorian, or choose Shur to explore the Persian scale on any tonic. On a phone, add the Atlas to the home screen for standalone display. Select a geographic region to explore 315 documented tuning models across 46 populated geographical entries. Choose a regional scale, then drag the inner diatonic ring to transpose in 50-cent steps. The outer circle preserves the ordered intervals. Compare Scales aligns octave models on concentric rings and measured open spans on a shared cent axis. Source interpretations remain under review.

The public catalog contains app-facing model metadata, tuning intervals, references and geographic navigation. The research workbooks and notes are private.

[Open the Atlas](https://worldmusicscalesatlas.github.io/) · [Read the guide](https://worldmusicscalesatlas.github.io/guide.html) · [Report a problem](https://github.com/worldmusicscalesatlas/worldmusicscalesatlas.github.io/issues)

## Run locally

Run `python3 -m http.server 8000` from the project directory and visit http://localhost:8000. The application runs in the browser. Run `node --test atlas.test.mjs` with Node 22 or later to check the examples and diagrams.

## Credits and reuse

Created by Dr. Pouya Hosseini. The [license](LICENSE) covers original project material. The basemap uses [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) public-domain relief and country outlines. Citations accompany the research models. Seven named Western diatonic modes are available alongside the regional collection. See the [Copyright & Terms of Use](https://worldmusicscalesatlas.github.io/about.html#terms) for the rights reservation covering original materials. Third-party references retain their respective rights.

## Research expansion (Batch 02)

Ten historical Javanese models from Ellis (1885, pp. 510 and 512) distinguish instrument measurements, an adopted mean, a pitch inventory and five-note modal selections. Three measured spans are preserved without octave normalization. Navigation indicates cultural provenance; playback starts from a chosen reference pitch rather than an asserted historical tonic. The remaining research candidates are not published.

## Research expansion (Batch 03 — Japan and Ryukyu)

Four theoretical octave representations derived from the Koizumi tetrachord framework and two historical koto tuning observations from Ellis (1885, pp. 522–523). Theoretical models use semitone-based numerical encoding, not measured intonation; historical models preserve strings II–VII of the source table. Separate Japanese and Ryukyuan navigation entries reflect cultural provenance. Mathematical pitch-pattern overlap with other traditions does not establish modal equivalence.

## Research expansion (Batch 04 — Azerbaijan and Thailand)

Four full-range theoretical Azerbaijani models derived from Hajibeyov’s tetrachord construction and four Thai tuning references (one ideal comparator and three documented pitch sequences from Wisuttipat 2015, CC BY 4.0). The theoretical encodings are not acoustic measurements, and the long measured spans are preserved without normalization. First pitches serve as playback references; functional modal centers and actual intonation are not inferred from them. Other candidates remain under review.

## Research expansion (Batches 05–08)

29 source-specific representations: five Korean pansori pitch collections; 12 Ethiopian Amhara recording-derived bati profiles; Hungarian and Andalusian theoretical examples; nine Colombian marimba interval inventories; and an ’Are’are equiheptatonic ideal. No octave closure is invented. Ethiopian rows with any sum discrepancy and candidates with unresolved attribution or insufficient evidence remain excluded. Numerical sequences cite the original investigators and are cross-checked against McBride, Passmore & Tlusty’s DaMuSc compilation. The associated PLOS ONE article is CC BY 4.0; the database-specific license has not been independently confirmed. Original figures, audio and prose are not reproduced. Mathematical overlap is not cultural equivalence. Primary numerical text was checked, but page images were unavailable for some sources.

## Research expansion (Batches 09–10) and evidence audit

Eleven new source-specific pitch representations: three Burmese lower-register instrument profiles, five observations of one southeastern Angolan likembe, two synoptic melodic pitch profiles from the Erkomaishvili Georgian chant corpus, and one historical Highland bagpipe octave segment. The Burmese upper register with inconsistent labels is not included; original separate near-unison Angolan lamellae are retained; Georgian corpus estimates are not fixed national scales. No undocumented octave closure is imposed.

All 269 pre-existing records passed structural and numerical integrity checks. In this audit 94 formula/ideal representations and four historical sléndro observations were rechecked against their named evidence. For 91 secondary computational models, source context was examined but primary-source verification remains pending; 80 further records received structural checks only in this round. Earlier source reviews are not repeated claims of independent validation. No pre-existing numerical sequences were changed. Evidence-review labels in the Info panel distinguish these scopes. The audit identified 111 existing records with at least one matching ordered interval sequence (0.01-cent tolerance), eight contextual references not linked to specific models, and three navigation anchors without models. Cross-tradition interval matches are not cultural equivalence. Pending entries are not newly certified. Remaining expansion candidates await source access and cultural/numerical review.

## Research expansion (Batches 11–14) — Americas and Indigenous heritage

Three measured Brazilian pífano profiles from Mendes (2012), frequency Tables 1, 3 and 5. The intervals are recalculated from the original integer-Hz measurements, rounded at cumulative positions, and checked against DaMuSc M0338–M0340 (each step agrees within 1 cent); no database sequence is copied or normalized. The source studies Cariri banda cabaçal practice; these are not attributed to an Indigenous nation or claimed to represent all Brazilian music. All 280 earlier records are unchanged.

Only traditions with playable numerical models appear in public navigation. Deferred research records are preserved separately from the public application. The numerical and cultural reuse review standards remain unchanged. No private research notes, song transcriptions, recordings or restricted cultural data are included.

The Atlas acknowledges the [CARE Principles](https://doi.org/10.5334/dsj-2020-043), [Local Contexts community-defined TK Labels](https://localcontexts.org/labels/traditional-knowledge-labels/), and relevant community-specific governance; it does not self-assign labels or claim compliance or approval without collaboration. Anchors are approximate navigation aids, not territorial claims.

## Research expansion (Batches 15–18)

Six source-specific additions: three Esmeraldas marimba profiles (Pontón Yépez 2022, Partitura 61; row counts and first intervals checked against p. 165), two contemporary equal-tempered Mandé kora teaching examples (not measured historical tunings), and one sixteen-reed Isan khene inventory (Musib et al. 2025). Conflicting khene fundamentals were resolved against the stated harmonic series and FFT peaks; the two near-unison G4 reeds are retained. The fourth Esmeraldas profile is withheld because the extracted row has an inconsistent count. Primary text was accessible, but rendered PDF pages could not be retrieved; no visual verification claimed. No new Inuit or other Indigenous song-derived models, ambiguous museum provenance, or empty markers are published. All 283 previous model records are unchanged. Only instrument facts and independently calculated theoretical pitch geometry are used; no source figures, recordings or songs reproduced, no community endorsement asserted. Further cultural and source review remains open.

## Research expansion (Batches 19–22)

Seven documented pitch representations in five populated geographic entries: a nominal modern professional Bolivian quena compass; a Gambian Mandinka balo equiheptatonic mathematical comparator (not measured bars); a particular Malagasy 15-string tourist-market valiha; two Huế đàn tranh pitch-name examples from the Vietnamese Institute of Musicology; and two Khmer structural pitch patterns from Sam-Ang Sam (2002, p. 9). The latter explicitly disputes universal equidistance in actual Khmer music. The Vietnamese English and Vietnamese indexed texts agree but direct page fetch failed; the Cambodian PDF text was available but screenshots failed. All additions are theoretical or nominal instrument representations, not new measured microtonal profiles. Public educational collection information and source-reported pitch facts only; no source prose, photos, recordings, songs or ceremonial material reproduced. Community endorsement or wider cultural authorization is not asserted. Kallawaya, Hawaiian, Inuit and other Indigenous community-specific material, the full Hmong khaen frequency sequence, and Andean archaeological and Central African museum candidates remain deferred due to provenance, cultural reuse or numerical evidence limitations. All 289 prior model records unchanged; no empty markers.

## Research expansion (Batches 23–26)

Nine scoped additions: a nominal 22-key Nicaraguan marimba de arco inventory (Grinnell College item 3446); twelve measured outer-register fundamentals of a soprano steelpan (Maloney 2010, Table 4.1; 1–3 Hz accelerometer mass-loading caveat); Gerald Eze’s publicly described one-octave Igbo ubọ-aka teaching tuning (Carter-Ényì 2024, §5.1); and six absolute, non-normalized I–V cluster-mean interval profiles from Lithuanian monophonic singing (Budrys & Višnevska 2014, Table 4). The latter are aggregate pitch profiles, not individual songs or complete octave scales. Source text and methodology inspected; PDF page images were unavailable. The Igbo extended-range example was withheld due to ambiguous octave marks. The two more limited Lithuanian I/II/IV/V subsets were not added. No Arctic, Oceanian or other restricted community materials published; Indigenous candidate permissions remain unresolved. No instrument photographs, recordings, song transcriptions or source figures reproduced; community endorsement is not asserted. All 296 existing model records are unchanged. No empty markers.

## Follow-up verification (Batches 23–26)

- López's Jujuy fieldwork supports a 13-pitch nominal Malta inventory starting on D within the G-major collection.
- Würzburg's museum data supports three measured bala excerpts. These retain their measured spans and are scoped to individual specimens of unspecified national provenance.
- Utsugi and Moriyama report the basic shakuhachi note names. Ando documents the octave repetitions and sounding-pitch variability. The model uses the nominal octave reference.
- Zemp's original Malaita fieldwork confirms the approximate equiheptatonic practice behind the existing ’au tahana model. The theoretical seven-equal-step reference already covers this candidate.
- Conlon's chapter identifies the Iglulik drum-dance song “I'm So Happy” and lists five note names in a speculative reconstruction based on the song. The underlying score and cultural reuse review remain unresolved, so this inventory stays deferred. [Primary chapter](https://www.perlego.com/book/2382494/music-of-the-first-nations-tradition-and-innovation-in-native-north-america-pdf?partner_id=100014)

All 305 previous models are preserved. All 45 geographical entries contain playable models.


## Search and reference library

The public reference pages, XML sitemap, robots.txt and llms.txt are generated from the existing public catalog and built-in modes. Run `npm run seo:generate` after changing those data, then `npm run seo:check` to verify freshness. The interactive atlas remains independent of the static pages. Submit `https://worldmusicscalesatlas.github.io/sitemap.xml` in Google Search Console and Bing Webmaster Tools after deployment. Search and training crawler controls are separate; crawler directives are voluntary, and all existing copyright and cultural rights remain in effect.

## Research expansion (Batch 27 — Mongolia)

Five source-linked theoretical pentatonic octave species from Luvsangenden (2023, pp. 21–22), discussing Jantsannorov (1983), with contextual confirmation from the UNESCO traditional Mongolian music album booklet. The numbering is editorial and the 12-TET geometry is not measured intonation. Long-song modal shifts and microtonal ornamentation are not reproduced. The original 1983 article and PDF page images were unavailable; the extracted dissertation and booklet text were inspected. No traditional mode names, recordings, song transcriptions or community endorsement are asserted. All 310 prior records are preserved.
