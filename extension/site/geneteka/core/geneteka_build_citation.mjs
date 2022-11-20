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

import { CitationBuilder } from "../../../base/core/citation_builder.mjs";

function buildUrl(data) {
  const lastName = data.lastName || "";
  const firstName = data.firstName || "";
  return (
    "https://geneteka.genealodzy.pl/index.php" +
    `?op=gt&bdm=${data.recordType}&w=${data.voivodeship}&rid=${data.recordType}` +
    `&search_lastname=${lastName}&search_name=${firstName}` +
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

function buildCoreCitation(data, generalizedData, builder) {
  if (data.recordType === "B") {
    builder.meaningfulTitle = "Birth Registration";
    builder.sourceTitle = "Parish birth records";
  } else if (data.recordType === "D") {
    builder.meaningfulTitle = "Death Registration";
    builder.sourceTitle = "Parish death records";
  } else if (data.recordType === "S") {
    builder.meaningfulTitle = "Marriage Registration";
    builder.sourceTitle = "Parish marriage records";
  }
  if (data.record) {
    builder.sourceReference = `${data.parish} ${data.record}/${data.year}`;
  } else {
    builder.sourceReference = `${data.parish} ${data.year}`;
  }

  const url = buildUrl(data);
  builder.recordLinkOrTemplate = `[${url} Geneteka birth record index]`;
  if (data.scanUrl) {
    builder.imageLink = `[${data.scanUrl} original document scan]`;
  }

  if (data.recordType === "S") {
    builder.dataString = buildMarriageDataString(generalizedData);
  } else {
    builder.dataString = buildPersonDataString(generalizedData, data.recordType);
  }
}

function buildCitation(input) {
  const data = input.extractedData.recordData;
  const gd = input.generalizedData;
  const runDate = input.runDate;
  const options = input.options;
  const type = input.type; // "inline", "narrative" or "source"

  const builder = new CitationBuilder(type, runDate, options);

  buildCoreCitation(data, gd, builder);

  if (type == "narrative") {
    builder.addNarrative(gd, input.dataCache, options);
  }

  // Now the builder is set up, use it to build the citation text.
  return {
    citation: builder.getCitationString(),
    type: type,
  };
}

export { buildCitation };
