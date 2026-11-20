# Household fractional-age fixtures

`census_1835_ole_jonassen.html` was downloaded on 16 November 2026 from
https://www.digitalarkivet.no/en/census/person/pf01069455000001, the census record
reported in issue #479. Jonettha Olsdr* has age `20 1/2`; Ane Maria has `9 1/2`.

`census_1835_fractional_ages_synthetic.html` uses that page's household layout
with invented member names and ages. It is test data, not a historical record.
Members A–O exercise mixed, standalone, and Unicode half/quarter fractions,
including nonbreaking and repeated spaces. Members P–S control for an integer
age, a birth year, a full birth date, and an empty value. Members T–U contain
qualified text that must not be recognized as a fractional age.

Extraction normally collapses whitespace. The `fractional_age_whitespace`
table test also passes raw whitespace variants to generalization and checks
that the age string survives unchanged through table generation.
