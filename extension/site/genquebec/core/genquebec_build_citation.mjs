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

function buildGenquebecUrl(ed, builder) {
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  // e.g. "Death, LaFrance", the collection that the record came from
  let title = "Généalogie Québec";
  if (ed.indexHeader) {
    title += ": " + ed.indexHeader;
  }
  builder.sourceTitle = title;
}

function buildSourceReference(ed, gd, builder) {
  let reference = "GenealogyQuebec.com, Drouin Genealogical Institute";
  if (ed.originalSource) {
    reference += ". Original source: " + ed.originalSource;
  }
  if (ed.imageUrl) {
    reference += ". [" + new URL(ed.imageUrl, ed.url).href + " View original document]";
  }
  builder.sourceReference = reference;
}

function buildRecordLink(ed, gd, builder) {
  var genquebecUrl = buildGenquebecUrl(ed, builder);

  let recordLink = "[" + genquebecUrl + " Généalogie Québec Record]";
  builder.recordLinkOrTemplate = recordLink;
}

function getSupplementalCitationFields(ed) {
  const usedFields = new Set([
    "name",
    "gender",
    "age",
    "father",
    "mother",
    "spouse",
    "husband",
    "wife",
    "man's name",
    "woman's name",
    "birth date",
    "baptism date",
    "baptism location",
    "death date",
    "burial date",
    "burial location",
    "marriage date",
    "marriage location",
    "civil status",
    "husband's age",
    "wife's age",
    "man's age",
    "woman's age",
    "husband's civil status",
    "wife's civil status",
    "man's civil status",
    "woman's civil status",
  ]);

  return Object.entries(ed.fields || {})
    .filter(([key, value]) => {
      if (!key || !value) {
        return false;
      }
      let normalizedKey = key.toLowerCase();
      if (usedFields.has(normalizedKey)) {
        return false;
      }
      if (
        /^marriage/i.test(ed.indexHeader || "") &&
        ["occupation", "husband's occupation", "man's occupation"].includes(normalizedKey)
      ) {
        return false;
      }
      return true;
    })
    .map(([key, value]) => ({ key, value }));
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  builder.addStandardDataString(gd);
  builder.addListDataString(getSupplementalCitationFields(ed));
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
