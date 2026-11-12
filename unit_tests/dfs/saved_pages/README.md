# DFS fixtures

These compact fixtures retain the DOM identifiers, table headings, historical names,
dates, register titles, and source references observed in authenticated DFS pages on
10–11 November 2026. They are reduced/reconstructed excerpts, not complete saved pages.
Account identity, scripts, advertising, styles, session fields, and tracking data are
omitted. The sign-in marker is anonymized to `Signed in`.

- `census_1845_hans.html`: `/cid5500978`, all eleven displayed household members,
  including duplicate names and servants; DDA-7202/KIP B7106 provenance.
- `church_1840_hans.html`: `/kbid953766`, distinct child and parent fields and a
  death mentioned only in remarks.
- `church_image_1840.html`: index excerpt from
  `/churchbook/sogn701/churchlisting143098/opslag15978995`.
- `school_1811_hans.html`: four pupil entries at
  `/sogn804/skole66/source152527/opslag17728149`.
- `levy_1791_hans.html`: four index entries at
  `/kilder/laegdsruller/kreds2/bsid17267/opslag12157806`.
- `search.html`: synthetic form retaining the observed field/button IDs; remembered
  values and a fake VIEWSTATE marker test clearing and preservation respectively.
- `logged_out.html`: synthetic login-required response.

Tests derive image-only cases by leaving indexes unselected and mutate these excerpts
to check stale selection, missing fields, login expiry, host aliases, and navigation.
They never execute DFS scripts or save transcription/index edits.
