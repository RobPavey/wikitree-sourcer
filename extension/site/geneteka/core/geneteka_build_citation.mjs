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

const RECORD_TYPE_DESCRIPTION = {
  B: "birth",
  S: "marriage",
  D: "death",
};

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildUrl(data) {
  const lastName = data.lastName || data.husbandLastName || "";
  const firstName = data.firstName || data.husbandFirstName || "";
  const lastName2 = data.wifeLastName || "";
  const firstName2 = data.wifeFirstName || "";
  const names2 = lastName2 || firstName2 ? `&search_lastname2=${lastName2}&search_name2=${firstName2}` : "";
  return (
    "https://geneteka.genealodzy.pl/index.php" +
    `?op=gt&bdm=${data.recordType}&w=${data.province}&rid=${data.recordType}` +
    `&search_lastname=${lastName}&search_name=${firstName}` +
    names2 +
    `&from_date=${data.year}&to_date=${data.year}&exac=1&parents=1`
  ).replaceAll(" ", "+");
}

/**
 * Build string like one of the following, depending on available information:
 * - X Y, child of A B and C D, born 10.02.1912 in Z
 * - X Y born in Z
 * - X Y born 10.02.1912
 */
function buildPersonDataString(generalizedData, recordType) {
  const name = generalizedData.inferFullName();

  const fatherName = generalizedData.parents?.father?.name?.inferFullName();
  const motherName = generalizedData.parents?.mother?.name?.inferFullName();
  const parentNames = [fatherName, motherName].filter((value) => !!value).join(" and ");
  const parentString = parentNames && `child of ${parentNames}`;

  const eventParts = [];
  let eventVerb = "";
  if (recordType === "B") {
    eventVerb = "born";
    if (generalizedData.birthDate?.dateString) {
      eventParts.push(generalizedData.birthDate.dateString);
    }
    if (generalizedData.birthPlace?.placeString) {
      eventParts.push(`in ${generalizedData.birthPlace.placeString}`);
    }
  } else if (recordType === "D") {
    eventVerb = "died";
    if (generalizedData.deathDate?.dateString) {
      eventParts.push(generalizedData.deathDate.dateString);
    }
    if (generalizedData.deathPlace?.placeString) {
      eventParts.push(`in ${generalizedData.deathPlace.placeString}`);
    }
  }
  const eventString = eventParts.length && `${eventVerb} ${eventParts.join(" ")}`;

  const finalParts = [name, parentString, eventString].filter((value) => !!value);
  const separator = parentNames ? ", " : " ";
  return finalParts.join(separator);
}

/**
 * Build string like one of the following, depending on available information:
 * - A B and C D married 10.02.1912 in Z
 * - A B and C D married
 */
function buildMarriageDataString(generalizedData) {
  const spouse = generalizedData.spouses[0];
  const husbandName = generalizedData.inferFullName();
  const wifeName = spouse.name.inferFullName();

  const eventParts = [""];
  if (spouse.marriageDate?.dateString) {
    eventParts.push(spouse.marriageDate.dateString);
  }
  if (spouse.marriagePlace?.placeString) {
    eventParts.push(`in ${spouse.marriagePlace.placeString}`);
  }
  return `${husbandName} and ${wifeName} married${eventParts.join(" ")}`;
}

function buildCoreCitation(ed, generalizedData, builder) {
  const data = ed.recordData;

  const recordTypeDescription = RECORD_TYPE_DESCRIPTION[data.recordType];

  builder.sourceTitle = `Parish ${recordTypeDescription} records`;

  if (data.record) {
    builder.sourceReference = `${data.parish} ${data.record}/${data.year}`;
  } else {
    builder.sourceReference = `${data.parish} ${data.year}`;
  }

  const url = buildUrl(data);
  builder.recordLinkOrTemplate = `[${url} Geneteka ${recordTypeDescription} record index]`;
  if (data.scanUrl) {
    builder.imageLink = `[${data.scanUrl} original document scan]`;
  }

  if (data.recordType === "S") {
    builder.dataString = buildMarriageDataString(generalizedData);
  } else {
    builder.dataString = buildPersonDataString(generalizedData, data.recordType);
  }
}

function getRefTitle(ed, gd) {
  const data = ed.recordData;
  const recordTypeDescription = RECORD_TYPE_DESCRIPTION[data.recordType];
  return `${capitalize(recordTypeDescription)} Registration`;
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation, getRefTitle);
}

export { buildCitation };
