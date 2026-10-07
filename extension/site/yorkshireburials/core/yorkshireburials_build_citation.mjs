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

function buildYorkshireburialsUrl(ed, builder) {
  if (ed.recordUrl) {
    return ed.recordUrl;
  }
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle = "Yorkshire Burials";
}

function buildSourceReference(ed, gd, builder) {
  const options = builder.getOptions();

  let locationParts = [];
  for (let part of [ed.cemetery, ed.parish, ed.county]) {
    if (part) {
      locationParts.push(part);
    }
  }
  builder.addSourceReferenceText(locationParts.join(", "));

  if (options.citation_yorkshireburials_includeGraveReference) {
    builder.addSourceReferenceField("Grave", ed.graveReference);
  }
  if (options.citation_yorkshireburials_includeRegisterReference) {
    builder.addSourceReferenceField("Register", ed.registerReference);
  }
}

function buildRecordLink(ed, gd, builder) {
  const yorkshireburialsUrl = buildYorkshireburialsUrl(ed, builder);

  let linkText = "Yorkshire Burials Record";
  if (!ed.recordUrl) {
    linkText = "Yorkshire Burials Search";
  }
  builder.recordLinkOrTemplate = "[" + yorkshireburialsUrl + " " + linkText + "]";
}

function buildDataList(ed, gd, builder) {
  const fields = [
    { key: "Name", value: ed.name },
    { key: "Sex", value: ed.sex },
    { key: "Age", value: ed.age },
    { key: "Death Date", value: ed.deathDate },
    { key: "Burial Date", value: ed.burialDate },
    { key: "Abode", value: ed.abode },
    { key: "Trade", value: ed.trade },
  ];
  builder.addListDataString(fields.filter((field) => field.value));
}

function buildDataString(ed, gd, builder) {
  const dataStyle = builder.getOptions().citation_yorkshireburials_dataStyle;

  if (dataStyle == "string") {
    builder.addStandardDataString(gd);
  } else if (dataStyle == "list") {
    buildDataList(ed, gd, builder);
  }
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  buildDataString(ed, gd, builder);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
