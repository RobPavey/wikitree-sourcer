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

function toSentenceCase(str) {
  if (typeof str !== "string" || str.length === 0) {
    return ""; // Handle non-string or empty input
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function findFirstNonNumericRegex(str) {
  const match = str.match(/\D/); // \D matches any character that is not a digit
  return match ? match.index : -1;
}

function findCurrentImageNumString(str) {
  // str should contain 'Image <currentImageNum> sur <imageMax>'
  // find ending position of currentImageNum
  let currentNumString = "";
  let imageNumEndIndex = findFirstNonNumericRegex(str.substring(6));
  if (imageNumEndIndex !== -1) {
    currentNumString = str.substring(6, imageNumEndIndex + 6);
  }
  return currentNumString;
}

function buildMorbihanUrl(ed, builder) {
  let citationUrl = "";
  const daoSubstring = "daogrp/0/";
  const index = ed.url.indexOf(daoSubstring);

  let currentNumString = "";
  if (ed.keyValueData) {
    // check for image num phrase key
    for (let key in ed.keyValueData) {
      if (key == "imageNumPhrase") {
        //console.log("key="+key);
        //console.log("ed.keyValueData["+key+"].value="+ed.keyValueData[key]);
        currentNumString = findCurrentImageNumString(ed.keyValueData[key]);
      }
    }
  }

  if (index !== -1 && currentNumString !== "") {
    // Substring found in url and we have the current image num,
    // truncate the string after the substring and append current image num
    citationUrl = ed.url.slice(0, index + daoSubstring.length) + currentNumString;
  } else {
    // otherwise, keep the original URL string
    citationUrl = ed.url;
  }

  return citationUrl;
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle = "Documents numérisés"; // default
  if (ed.ogTitle.includes("MiEC")) {
    builder.sourceTitle = "Registres paroissiaux et documents d'état civil";
  }
  if (ed.ogTitle.includes("3 ES ") || ed.ogTitle.includes("6 M ")) {
    builder.sourceTitle = "Recensements de population";
  }
}

function buildSourceReference(ed, gd, builder) {
  builder.sourceReference = ed.repository;
  builder.addSourceReferenceText(ed.ogTitle);

  //console.log("keyValueData="+ed.keyValueData);
  if (ed.keyValueData) {
    //console.log("processing keyValueData");
    for (let key in ed.keyValueData) {
      if (key !== "collectionDescription" && key !== "Commentaires") {
        // don't need these
        //console.log("key="+key);
        //console.log("ed.keyValueData["+key+"].value="+ed.keyValueData[key]);
        if (key == "imageNumPhrase" || key == "Sujet") {
          // don't include key, just value
          builder.addSourceReferenceText(ed.keyValueData[key]);
        } else {
          builder.addSourceReferenceField(key, ed.keyValueData[key]);
        }
      }
    }
  }
}

function buildRecordLink(ed, gd, builder) {
  var morbihanUrl = buildMorbihanUrl(ed, builder);

  let recordLink = "[" + morbihanUrl + " Archives Départementales du Morbihan Image]";
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
  if (ed.ogTitle.includes("3 ES ") || ed.ogTitle.includes("6 M ")) {
    refTitle = "Recensement";
    return refTitle;
  }

  if (ed.ogTitle.includes("MiEC")) {
    // parish/civil records
    refTitle = "Registre paroissial ou état civil";
    if (ed.keyValueData) {
      let volumeType = ""; // (P)arish or (C)ivil record
      let acteTypeCount = 0;
      let sujetString = "";
      // check for subject/sujet key
      for (let key in ed.keyValueData) {
        if (key == "Sujet") {
          //console.log("key="+key);
          //console.log("ed.keyValueData["+key+"].value="+ed.keyValueData[key]);
          sujetString = ed.keyValueData[key];
          if (sujetString.includes("naissance")) {
            refTitle = "Naissance";
            acteTypeCount++;
            volumeType = "C";
          }
          if (sujetString.includes("décès")) {
            refTitle = "Décès";
            acteTypeCount++;
            volumeType = "C";
          }
          if (sujetString.includes("baptême")) {
            refTitle = "Baptême";
            acteTypeCount++;
            volumeType = "P";
          }
          if (sujetString.includes("sépulture")) {
            refTitle = "Sépulture";
            acteTypeCount++;
            volumeType = "P";
          }
          if (sujetString.includes("mariage")) {
            refTitle = "Mariage";
            acteTypeCount++;
            // for mariage, volumeType could be either parish or civil record
          }
          if (acteTypeCount > 1) {
            if (volumeType == "P") {
              // parish record
              refTitle = "Registre paroissial";
            } else {
              // civil record
              refTitle = "État civil";
            }
          }
        }
      }
    }
  }
  return refTitle;
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation, getRefTitle);
}

export { buildCitation };
