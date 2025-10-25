/*
MIT License

Copyright (c) 2020 Robert M Pavey

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

function buildBasrhinUrl(ed, builder) {
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle = "Documents numérisés"; // default
  if (ed.url.includes("ETAT-CIVIL")) {
    builder.sourceTitle = "Registres paroissiaux et documents d'état civil";
  }
  if (ed.url.includes("REC-POP")) {
    builder.sourceTitle = "Recensements de population";
  }
  if (ed.url.includes("LIGEO")) {
    builder.sourceTitle = "Tables des successions et absences";
  }
}

function buildSourceReference(ed, gd, builder) {
  builder.sourceReference = ed.repository;
  if (ed.bureauPlace) {
    builder.addSourceReferenceText(ed.bureauPlace);
  }
  builder.addSourceReferenceText(ed.sourceReference);
  builder.addSourceReferenceField("image", ed.imageNo + "/" + ed.imageMax);
}

function buildRecordLink(ed, gd, builder) {
  var basrhinUrl = buildBasrhinUrl(ed, builder);

  let recordLink = "[" + basrhinUrl + " Bas-Rhin Image]";
  builder.recordLinkOrTemplate = recordLink;
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  // builder.addStandardDataString(gd);
}

function getRefTitle(ed, gd) {
  let refTitle = "Document d'archive"; // default
  if (ed.url.includes("ETAT-CIVIL")) {
    refTitle = "Registre paroissial ou état civil";
    let parishTypeCount = 0;
    let civilTypeCount = 0;
    if (ed.sourceReference.includes("baptêmes")) {
      refTitle = "Baptême";
      parishTypeCount++;
    }
    if (ed.sourceReference.includes("mariages") && !ed.sourceReference.includes("publication de mariages")) {
      refTitle = "Mariage"; // mariage could be parish or civil, so we increment both counts
      parishTypeCount++;
      civilTypeCount++;
    }
    if (ed.sourceReference.includes("sépultures")) {
      refTitle = "Sépulture";
      parishTypeCount++;
    }
    if (parishTypeCount > 1) {
      refTitle = "Registre paroissial"; // if consolidated BMS volume (more than 1 acte type), use generic parish refTitle/label
    }
    if (ed.sourceReference.includes("naissances")) {
      refTitle = "Naissance";
      civilTypeCount++;
    }
    if (ed.sourceReference.includes("publication de mariages")) {
      refTitle = "Publication de mariage";
      civilTypeCount++;
    }
    if (ed.sourceReference.includes("décès")) {
      refTitle = "Décès";
      civilTypeCount++;
    }
    if (civilTypeCount > 1) {
      refTitle = "État civil"; // if consolidated NMD volume (more than 1 acte type), use generic civil refTitle/label
    }
  }
  if (ed.url.includes("REC-POP")) {
    refTitle = "Recensement";
  }
  if (ed.url.includes("LIGEO")) {
    refTitle = "Succession ou absence";
  }
  return refTitle;
}

function endCitationWithPeriod(inputCitation) {
  // ensure that the actual citation text (not including a close ref tag with/without preceding newline char) ends with a period (.)
  let newCitation = inputCitation;
  if (inputCitation.endsWith("\n</ref>")) {
    if (!inputCitation.endsWith(".\n</ref>")) {
      newCitation = inputCitation.replace("\n</ref>", ".\n</ref>");
    }
  } else if (inputCitation.endsWith("</ref>")) {
    if (!inputCitation.endsWith(".</ref>")) {
      newCitation = inputCitation.replace("</ref>", ".</ref>");
    }
  } else {
    if (!inputCitation.endsWith(".")) {
      newCitation = inputCitation + ".";
    }
  }
  return newCitation;
}

function buildCitation(input) {
  let citationObject = simpleBuildCitationWrapper(input, buildCoreCitation, getRefTitle);
  citationObject.citation = endCitationWithPeriod(citationObject.citation);
  return citationObject;
}

export { buildCitation };
