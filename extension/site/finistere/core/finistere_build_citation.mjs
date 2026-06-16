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

function buildFinistereUrl(ed, builder) {
  let citationUrl = "";
  let substringToFind = "daoloc/0/";
  let index = ed.url.indexOf(substringToFind);
  if (index == -1) {
    substringToFind = "daogrp/0/";
    index = ed.url.indexOf(substringToFind);
  }
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
  if (ed.keyValueData["Sujet"] && ed.keyValueData["Sujet"].includes("recensement")) {
    builder.sourceTitle = "Recensements de population";
  }
  if (
    ed.keyValueData["Type de document"] &&
    (ed.keyValueData["Type de document"].includes("baptême") ||
      ed.keyValueData["Type de document"].includes("sépulture") ||
      ed.keyValueData["Type de document"].includes("mariage") || // including publication de mariage
      ed.keyValueData["Type de document"].includes("naissance") ||
      ed.keyValueData["Type de document"].includes("décès"))
  ) {
    builder.sourceTitle = "Registres paroissiaux et documents d'état civil";
  }
}

function buildSourceReference(ed, gd, builder) {
  //console.log("buildSourceReference for "+ed.ogTitle);
  builder.sourceReference = ed.repository;
  builder.addSourceReferenceText(ed.ogTitle);

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
      if (key == "Lieu" || key == "Type de document") {
        //console.log("key="+key);
        //console.log("ed.keyValueData["+key+"].value="+ed.keyValueData[key]);
        builder.addSourceReferenceField(key, ed.keyValueData[key]);
      }
    }
  }
}

function buildRecordLink(ed, gd, builder) {
  var finistereUrl = buildFinistereUrl(ed, builder);

  let recordLink = "[" + finistereUrl + " Archives Départementales du Finistère Record]";
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
  if (ed.keyValueData["Sujet"] && ed.keyValueData["Sujet"].includes("recensement")) {
    refTitle = "Recensement";
    return refTitle;
  }
  let typeCount = 0;
  if (ed.keyValueData["Type de document"]) {
    if (ed.keyValueData["Type de document"].includes("baptême")) {
      refTitle = "Baptême";
      typeCount++;
    }
    if (ed.keyValueData["Type de document"].includes("sépulture")) {
      refTitle = "Sépulture";
      typeCount++;
    }
    if (ed.keyValueData["Type de document"].includes("mariage")) {
      refTitle = "Mariage";
      typeCount++;
    }
    if (ed.keyValueData["Type de document"].includes("naissance")) {
      refTitle = "Naissance";
      typeCount++;
    }
    if (ed.keyValueData["Type de document"].includes("décès")) {
      refTitle = "Décès";
      typeCount++;
    }
    if (typeCount > 0) {
      if (typeCount > 1) {
        // if consolidated BMS volume (more than 1 acte type), use generic parish refTitle/label
        refTitle = "Registre paroissial";
      }
    }
  }
  return refTitle;
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation, getRefTitle);
}

export { buildCitation };
