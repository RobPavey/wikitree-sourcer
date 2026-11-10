# Gravminner fixtures

Observed on 9 November 2026, logged out, in the in-app browser:

- Signe Strande: https://slektogdata.no/gravminner/grav/259e0d76-270e-4a55-b46d-d36270407cae
- Anders Olsen Grov: https://slektogdata.no/gravminner/grav/b8ac84e7-ba92-4dcb-8982-522be1be5c5b
- Magdalene Arctander Johansen: https://slektogdata.no/gravminner/grav/ea281e18-402a-4724-b151-4733c7ec0bbd

These are reduced transcriptions of the rendered person fields, not full downloaded pages. Class names, field keys, direct p/a values and ID row follow the inspected DOM. Scripts, login controls and unrelated page furniture are omitted. The hidden calendar is representative synthetic noise, not the original widget. The same-grave list is reduced to one observed entry. No photographs or session data are included.

`partial_dates`, `no_dates` and `ceremony_only` are synthetic edge cases. Unknown components represented with zeros are defensive test inputs; those formats were not confirmed on a live incomplete-date post. Year-only dates were confirmed on Anders Olsen Grov.

The site's generated source reference for Magdalene conflates the birthplace with a birth surname. The structured Pikenavn field says Rasmusdatter. Extraction must use structured fields, never parse this generated prose.
