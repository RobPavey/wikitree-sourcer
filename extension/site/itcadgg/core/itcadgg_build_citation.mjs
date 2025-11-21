/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { simpleBuildCitationWrapper } from "../../../base/core/citation_builder.mjs";

// URL builder
function buildItcadggUrl(ed) {
  return ed.image_link ? ed.image_link : ed.url;
}

// Build source title
function buildSourceTitle(ed, gd, builder) {
  const sourceparts = ["Albo dei Caduti Italiani della Grande Guerra"];
  if (ed.data?.["Albo d'Oro"]) sourceparts.push(ed.data?.["Albo d'Oro"]);
  if (ed.data?.["Province"]) sourceparts.push(ed.data?.["Province"]);
  if (ed.imageLink) {
    const fullUrl = `https://www.cadutigrandeguerra.it/${ed.imageLink}`;
    sourceparts.push(`[${fullUrl} img]`);
  }
  builder.sourceTitle = sourceparts.join(", ");
}

// Build source reference
function buildSourceReference(ed, gd, builder) {
  const parts = [];

  if (ed.data?.["Pagina"]) parts.push(`Pagina ${ed.data?.["Pagina"]}`);
  if (ed.data?.["Sub in Pagina"]) parts.push(`Sub in Pagina ${ed.data?.["Sub in Pagina"]}`);

  builder.sourceReference = parts.join(", ");
}

// Build record link
function buildRecordLink(ed, builder) {
  const url = buildItcadggUrl(ed);
  builder.recordLinkOrTemplate = `[${url} Caduti Della Grande Guerra (Italian Fallen of the Great War) Record]`;
}

// Curated list data string
function buildCuratedListDataString(ed, gd, builder) {
  const options = builder.getOptions();
  const preferUniform = options.citation_itcadgg_Uniform;
  const preferCurrent = options.citation_itcadgg_Current;

  const fields = [
    { key: "Name", value: gd.name ? `${gd.name.forenames} ${gd.name.lastName}` : undefined },
    { key: "Father", value: gd.parents.father.name.forenames || undefined },
    { key: "Death Date", value: gd.deathDate?.dateString },
    { key: "Death Place", value: gd.deathPlace.placeString },
    { key: "Birth Date", value: gd.birthDate?.dateString },
  ];
  if (preferCurrent) {
    const birthFullPlace = [
      ed.extracted_data.birth_place_current,
      ed.extracted_data.birth_province_current,
      ed.extracted_data.birth_region_current,
    ]
      .filter(Boolean)
      .join(", ");
    fields.push({ key: "Birth Place", value: birthFullPlace });
  } else {
    fields.push({ key: "Birth Place", value: gd.birthPlace.placeString });
  }

  if (preferUniform) {
    fields.push({ key: "Rank", value: ed.extracted_data?.rank });
    fields.push({ key: "Unit", value: ed.extracted_data?.unit });
    fields.push({ key: "Cause of Death", value: ed.extracted_data?.cause_of_death });
  } else {
    fields.push({ key: "Rank", value: ed.extracted_data?.rank_albo });
    fields.push({ key: "Unit", value: ed.extracted_data?.unit_albo });
    fields.push({ key: "Cause of Death", value: ed.extracted_data?.cause_of_death_albo });
  }

  builder.addListDataString(fields);
}

// Original list data string into sentence
function buildOriginalListDataString(ed, gd, builder) {
  const parts = [];
  const options = builder.getOptions();
  const preferUniform = options.citation_itcadgg_Uniform;
  const preferCurrent = options.citation_itcadgg_Current;
  //console.log("DEBUG: gd =", gd);

  if (gd.name) parts.push(`${gd.name.forenames} ${gd.name.lastName}`);
  if (gd.parents.father.name.forenames) parts.push(`figlio di ${gd.parents.father.name.forenames}`);
  if (gd.birthDate?.dateString) parts.push(`nato il ${gd.birthDate.dateString}`);
  if (preferCurrent) {
    const birthFullPlace = [
      ed.extracted_data.birth_place_current,
      ed.extracted_data.birth_province_current,
      ed.extracted_data.birth_region_current,
    ]
      .filter(Boolean)
      .join(", ");
    if (birthFullPlace) parts.push(`a ${birthFullPlace}`);
  } else {
    if (gd.birthPlace?.placeString) parts.push(`a ${gd.birthPlace.placeString}`);
  }
  if (ed.extracted_data?.casualita) parts.push(ed.extracted_data?.casualita);

  if (gd.deathDate?.dateString) parts.push(`il ${gd.deathDate.dateString}`);
  if (gd.deathPlace.placeString) parts.push(`a ${gd.deathPlace.placeString}`);

  if (preferUniform) {
    if (ed.extracted_data?.rank) parts.push(ed.extracted_data?.rank);
    if (ed.extracted_data?.unit) parts.push(ed.extracted_data?.unit);
    if (ed.extracted_data?.cause_of_death) parts.push(`(${ed.extracted_data.cause_of_death})`);
  } else {
    if (ed.extracted_data?.rank_albo) parts.push(ed.extracted_data?.rank_albo);
    if (ed.extracted_data?.unit_albo) parts.push(ed.extracted_data?.unit_albo);
    if (ed.extracted_data?.cause_of_death_albo) parts.push(`(${ed.extracted_data.cause_of_death_albo})`);
  }

  const sentence = parts.join(", ");
  builder.addListDataString([{ key: "Record", value: sentence }]);
}

// Build data string depending on user option
function buildDataString(ed, gd, builder) {
  const options = builder.getOptions();
  const dataStyleOption = options.citation_itcadgg_dataStyle; // your custom option

  if (dataStyleOption === "listCurated") {
    buildCuratedListDataString(ed, gd, builder);
  } else if (dataStyleOption === "sentence") {
    builder.addStandardDataString(gd);
  } else if (dataStyleOption === "datastring") {
    buildOriginalListDataString(ed, gd, builder);
  } else if (dataStyleOption === "none") {
    // Do not add any data strings
  }
}

// Core citation builder
function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, builder);
  buildDataString(ed, gd, builder);
}

// Public buildCitation function
function buildCitation(input) {
  //debug to check gd variable
  //console.log("DEBUG: generalizedData =", JSON.stringify(input.generalizedData, null, 2));
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
