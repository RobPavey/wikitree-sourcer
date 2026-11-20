# New parish viewer fixtures

Public responses captured on 16 November 2026 from the endpoints used by the
Digitalarkivet viewer. Each JSON contains the source manifest, selected image's
file information, and its pagination entry. Other canvases and pagination
entries were removed; no image pixels are included. The HTML files are focused
shells, since extraction uses the URL and the popup loads metadata separately.

- `voss_1794`: the image linked in #453, printed page 131, no transcription list.
- `voss_1899`: the image linked by #453's Kristi Størkssd record, page 55.
- `voss_1888`: Knut's baptism page 29, also covered by legacy tests.
- `mixed_1792`: chronological page 41, containing multiple event types.

The JSON's `url` records the exact viewer address. Source IDs, image UUIDs,
permanent image IDs, and printed pages are distinct identifiers.
