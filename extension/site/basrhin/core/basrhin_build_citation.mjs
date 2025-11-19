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
  let citationUrl = "";
  const substringToFind = "dao/0/";
  const index = ed.url.indexOf(substringToFind);
  if (index !== -1 && ed.imageNumNow) {
    // Substring found in url and we have the current image num,
    // truncate the string after the substring and append current image num
    citationUrl = ed.url.slice(0, index + substringToFind.length) + ed.imageNumNow;
  } else {
    // otherwise, keep the original string
    citationUrl = ed.url;
  }

  return citationUrl;
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle = "Documents numérisés"; // default
  if (ed.ogTitle.includes("Recensement")) {
    builder.sourceTitle = "Recensements de population";
  }
  if (ed.ogTitle.includes("successions et absences")) {
    builder.sourceTitle = "Tables des successions et absences";
  }
  if (
    ed.ogTitle.includes("Baptêmes") ||
    ed.ogTitle.includes("Sépultures") ||
    ed.ogTitle.includes("Mariages") || // including Publications de Mariages
    ed.ogTitle.includes("Naissances") ||
    ed.ogTitle.includes("Décès")
  ) {
    builder.sourceTitle = "Registres paroissiaux et documents d'état civil";
  } else {
    // for parish/civil records, ed.ogTitle may not include acte type, check description
    if (
      ed.description.includes("baptêmes") ||
      ed.description.includes("sépultures") ||
      ed.description.includes("mariages") || // including publications de mariages
      ed.description.includes("naissances") ||
      ed.description.includes("décès")
    ) {
      builder.sourceTitle = "Registres paroissiaux et documents d'état civil";
    }
  }
}

function buildSourceReference(ed, gd, builder) {
  //console.log("buildSourceReference for "+ed.ogTitle);
  builder.sourceReference = ed.repository;
  if (builder.sourceTitle == "Registres paroissiaux et documents d'état civil") {
    if (
      ed.ogTitle.includes("Baptêmes") ||
      ed.ogTitle.includes("Sépultures") ||
      ed.ogTitle.includes("Mariages") || // including Publications de Mariages
      ed.ogTitle.includes("Naissances") ||
      ed.ogTitle.includes("Décès")
    ) {
      builder.addSourceReferenceText(ed.ogTitle);
    } else {
      // for parish/civil records, ed.ogTitle may not include acte type, check description
      let sourceReferencePart = "";
      if (ed.description.includes("baptêmes")) {
        sourceReferencePart += "Baptêmes ";
      }
      if (ed.description.includes("naissances")) {
        sourceReferencePart += "Naissances ";
      }
      if (ed.description.includes("publications de mariages")) {
        sourceReferencePart = "Publications de Mariages ";
      } else if (ed.description.includes("mariages")) {
        sourceReferencePart = "Mariages ";
      }
      if (ed.description.includes("sépultures")) {
        sourceReferencePart += "Sépultures ";
      }
      if (ed.description.includes("décès")) {
        sourceReferencePart += "Décès ";
      }
      if (sourceReferencePart !== "") {
        sourceReferencePart += "- ";
      }
      sourceReferencePart += ed.ogTitle;
      builder.addSourceReferenceText(sourceReferencePart);
      sourceReferencePart = "";
    }
  } else {
    builder.addSourceReferenceText(ed.ogTitle);
  }

  let imageNumPhrase = "";
  if (ed.imageNumPhrase) {
    imageNumPhrase = ed.imageNumPhrase;
  } else {
    // if no active image was selected, then there is no image phrase yet
    if (ed.imageNumNow && ed.imageNumMax) {
      // build image phrase
      imageNumPhrase = "Image " + ed.imageNumNow + " sur " + ed.imageNumMax;
    }
  }
  builder.addSourceReferenceText(imageNumPhrase);

  //console.log("keyValueData="+ed.keyValueData);
  if (ed.keyValueData) {
    //console.log("processing keyValueData");
    for (let key in ed.keyValueData) {
      if (key !== "Importance matérielle") {
        //console.log("key="+key);
        //console.log("ed.keyValueData["+key+"].value="+ed.keyValueData[key]);
        builder.addSourceReferenceField(key, ed.keyValueData[key]);
      }
    }
  }
}

function buildRecordLink(ed, gd, builder) {
  var thisUrl = buildBasrhinUrl(ed, builder);

  let recordLink = "[" + thisUrl + " Archives d'Alsace Site de Strasbourg Image]";
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
  if (ed.ogTitle.includes("Recensement")) {
    refTitle = "Recensement";
    return refTitle;
  }
  if (ed.ogTitle.includes("successions et absences")) {
    refTitle = "Succession ou absence";
    return refTitle;
  }
  let typeCount = 0;
  if (ed.ogTitle.includes("Baptêmes")) {
    refTitle = "Baptême";
    typeCount++;
  }
  if (ed.ogTitle.includes("Sépultures")) {
    refTitle = "Sépulture";
    typeCount++;
  }
  if (ed.ogTitle.includes("Publications de Mariages")) {
    refTitle = "Publication de mariage";
    typeCount++;
  } else if (ed.ogTitle.includes("Mariages")) {
    refTitle = "Mariage";
    typeCount++;
  }
  if (ed.ogTitle.includes("Naissances")) {
    refTitle = "Naissance";
    typeCount++;
  }
  if (ed.ogTitle.includes("Décès")) {
    refTitle = "Décès";
    typeCount++;
  }
  if (typeCount > 0) {
    if (typeCount > 1) {
      // if consolidated BMS volume (more than 1 acte type), use generic parish refTitle/label
      refTitle = "Registre paroissial";
    }
    return refTitle;
  }
  if (ed.description.includes("baptêmes")) {
    refTitle = "Baptême";
    typeCount++;
  }
  if (ed.description.includes("sépultures")) {
    refTitle = "Sépulture";
    typeCount++;
  }
  if (ed.description.includes("publications de mariages")) {
    refTitle = "Publication de mariage";
    typeCount++;
  } else if (ed.description.includes("mariages")) {
    refTitle = "Mariage";
    typeCount++;
  }
  if (ed.description.includes("naissances")) {
    refTitle = "Naissance";
    typeCount++;
  }
  if (ed.description.includes("décès")) {
    refTitle = "Décès";
    typeCount++;
  }
  if (typeCount > 1) {
    // if consolidated BMS volume (more than 1 acte type), use generic parish refTitle/label
    refTitle = "Registre paroissial";
  }
  return refTitle;
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation, getRefTitle);
}

export { buildCitation };
