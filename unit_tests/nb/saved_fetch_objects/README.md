# NB fixture provenance

The newspaper and book item JSON responses were retrieved from the public NB API
on 10 November 2026. The manifest fixtures retain only IDs, sequence order and
canvas labels, which are the fields this integration consumes. No images, OCR,
login state or credentials were downloaded.

- Newspaper: https://api.nb.no/catalog/v1/items/0000004ee44611385504a9d4f0639552
- Book: https://api.nb.no/catalog/v1/items/000009d0157c2a3eb5fbcd86070ed1d5
- Manifests: https://api.nb.no/catalog/v1/iiif/<item ID>/manifest

The saved HTML files are synthetic reduced viewer shells based on visible controls
inspected on 9 November 2026. They are not complete page captures. The book fixture
intentionally includes a two-image spread whose manifest labels differ from its
viewer image positions. Printed pages are always supplied separately.

Notice categories, subjects, relationships and life events in the tests are
synthetic and do not assert that those people occur in these publications.

## URN regression examples

The `urn_newspaper` and `urn_book` fixtures were retrieved from the public API on
10 November 2026 for the two URN viewer addresses supplied during manual testing:

- https://www.nb.no/items/URN:NBN:no-nb_digavis_hedemarkensamtstidende_null_null_19100330_64_35_1?page=1
- https://www.nb.no/items/URN:NBN:no-nb_digibok_2012050924011?page=585

Their reduced manifests contain canvas labels and sequence length only. Viewer
shells are synthetic. Page indexes 1 and 585 must be preserved exactly, including
when metadata returns a different ID alias. Hash-addressed items must also emit
URN-based citation links whenever NB supplies a URN.
