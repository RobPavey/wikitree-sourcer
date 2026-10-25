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
import { StringUtils } from "../../../base/core/string_utils.mjs";

function buildPrdhUrl(ed, builder) {
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  const typeLabels = {
    baptism: "Baptism",
    burial: "Burial",
    marriage: "Marriage",
    individual: "Individual",
    family: "Family",
  };
  let typeLabel = typeLabels[ed.pageType] ? typeLabels[ed.pageType] : "Record";
  builder.sourceTitle = "PRDH-IGD: " + typeLabel;
}

function buildSourceReference(ed, gd, builder) {
  let reference =
    "Programme de recherche en démographie historique (PRDH-IGD), Université de Montréal, record # " + ed.recordId;
  if (ed.imageUrl) {
    reference += ". [" + new URL(ed.imageUrl, ed.url).href + " View original document]";
  }
  builder.sourceReference = reference;
}

function buildRecordLink(ed, gd, builder) {
  var prdhUrl = buildPrdhUrl(ed, builder);

  let recordLink = "[" + prdhUrl + " PRDH (Quebec) Record]";
  builder.recordLinkOrTemplate = recordLink;
}

function buildAdditionalCitationFields(ed) {
  let fields = [];
  let administrativeAreaRegex = /(?:^|\/)\s*(MRC|Région|Region|Arrondissement)\s*:\s*([^/]+)/gi;
  let match;
  while ((match = administrativeAreaRegex.exec(ed.mrc || ""))) {
    fields.push({ key: match[1], value: match[2].trim() });
  }
  let mentions = ed.mentions || [];
  let husband = mentions.find((mention) => mention.relations?.some((relation) => relation.type == "SPOUSE"));
  let wife = mentions.find(
    (mention) => mention.relations?.some((relation) => relation.type == "SPOUSE") && mention !== husband
  );
  for (let [personLabel, mention] of [
    ["Husband", husband],
    ["Wife", wife],
  ]) {
    if (mention?.residence) {
      fields.push({ key: personLabel + "'s residence", value: mention.residence });
    }
    if (mention?.origin) {
      fields.push({ key: personLabel + "'s origin", value: mention.origin });
    }
  }

  let otherIndividuals = [];
  for (let mention of mentions) {
    let relation = mention.relations?.[0];
    if (relation && ["SPOUSE", "FATHER", "MOTHER"].includes(relation.type)) {
      let spouseLabel = relation.rank == "01" ? "Husband" : relation.rank == "02" ? "Wife" : "";
      let parentType = relation.type == "FATHER" ? "father" : relation.type == "MOTHER" ? "mother" : "";
      if (spouseLabel && parentType && mention.occupation) {
        fields.push({ key: spouseLabel + "'s " + parentType + "'s occupation", value: mention.occupation });
      }
      if (spouseLabel && parentType && mention.residence) {
        fields.push({ key: spouseLabel + "'s " + parentType + "'s residence", value: mention.residence });
      }
      if (spouseLabel && parentType && mention.presence && mention.presence != "inconnue") {
        fields.push({ key: spouseLabel + "'s " + parentType + "'s status", value: mention.presence });
      }
      continue;
    }

    if (mention !== husband && mention !== wife) {
      otherIndividuals.push(mention.name);
      for (let key of ["occupation", "residence", "origin"]) {
        if (mention[key]) {
          fields.push({ key: mention.name + "'s " + key, value: mention[key] });
        }
      }
      if (mention.presence && mention.presence != "inconnue") {
        fields.push({ key: mention.name + "'s presence", value: mention.presence });
      }
    }
    if (mention.complementaryInformation) {
      fields.push({ key: mention.name + "'s complementary information", value: mention.complementaryInformation });
    }
  }
  if (otherIndividuals.length > 0) {
    fields.push({ key: "Other individuals listed", value: otherIndividuals.join(", ") });
  }
  if (ed.complementaryInformation) {
    fields.push({ key: "Complementary information", value: ed.complementaryInformation });
  }
  return fields;
}

function formatPersonName(fullName) {
  if (!fullName) {
    return "";
  }
  let name = fullName.trim().replace(/\s+/g, " ");
  let match = name.match(/^(.*?)\s+([A-ZÀ-Ý][A-ZÀ-Ý'’-]*(?:\s+[A-ZÀ-Ý][A-ZÀ-Ý'’-]*)*)$/);
  if (!match) {
    return name;
  }
  return match[1] + " " + StringUtils.toInitialCapsEachWord(match[2], true);
}

function getForenames(fullName) {
  let name = fullName.trim().replace(/\s+/g, " ");
  let match = name.match(/^(.*?)\s+[A-ZÀ-Ý][A-ZÀ-Ý'’-]*(?:\s+[A-ZÀ-Ý][A-ZÀ-Ý'’-]*)*$/);
  return match ? match[1] : formatPersonName(name);
}

function getParents(parentString) {
  let match = parentString.match(/Father\s*:\s*(.*?)\s*Mother\s*:\s*(.*?)(?:\s*Family)?$/);
  if (!match) {
    return {};
  }
  return {
    father: formatPersonName(match[1]),
    mother: formatPersonName(match[2]),
  };
}

function formatFamilyDate(dateString) {
  let match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    let monthNumbers = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };
    let prdhDateMatch = dateString.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
    if (prdhDateMatch && monthNumbers[prdhDateMatch[2]]) {
      match = [dateString, prdhDateMatch[3], monthNumbers[prdhDateMatch[2]], prdhDateMatch[1]];
    }
  }
  if (!match) {
    return dateString;
  }
  let monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return Number(match[3]) + " " + monthNames[Number(match[2]) - 1] + " " + match[1];
}

function formatFamilyPlace(place) {
  return place ? place.replace(/\s*\([^)]*\)\s*$/, "") : "";
}

function buildFamilyChildDescription(child) {
  let description = child.forenames || "";
  if (child.birthDate) {
    description += (description ? ", born " : "Born ") + formatFamilyDate(child.birthDate);
  }
  if (child.birthPlace) {
    description += ", " + formatFamilyPlace(child.birthPlace);
  }
  if (child.deathDate) {
    description += ", died " + formatFamilyDate(child.deathDate);
  }
  if (child.deathPlace) {
    description += ", " + formatFamilyPlace(child.deathPlace);
  }
  if (child.spouse) {
    description += ", married to " + formatPersonName(child.spouse);
    if (child.marriageDate) {
      description += " on " + formatFamilyDate(child.marriageDate);
    }
    if (child.marriagePlace) {
      description += ", " + formatFamilyPlace(child.marriagePlace);
    }
  }
  return description;
}

function buildFamilyNarrative(ed) {
  let husbandParents = getParents(ed.husbandParents);
  let wifeParents = getParents(ed.wifeParents);
  let husband = formatPersonName(ed.husband);
  let wife = formatPersonName(ed.wife);
  let childCount = ed.children ? ed.children.length : 0;
  let countWords = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  let count = countWords[childCount] || childCount;
  let dataString =
    "The family of " +
    husband +
    (husbandParents.father && husbandParents.mother
      ? ", son of " + husbandParents.father + " and " + husbandParents.mother
      : "") +
    ", and " +
    wife +
    (wifeParents.father && wifeParents.mother
      ? ", daughter of " + wifeParents.father + " and " + wifeParents.mother
      : "") +
    ", includes at least " +
    count +
    (childCount == 1 ? " child. " : " children. ");

  if (ed.marriageDate || ed.marriagePlace) {
    dataString +=
      getForenames(ed.husband) +
      " and " +
      getForenames(ed.wife) +
      " were married" +
      (ed.marriageDate ? " on " + formatFamilyDate(ed.marriageDate) : "") +
      (ed.marriagePlace ? " in " + ed.marriagePlace : "") +
      ".";
  }

  if (childCount > 0) {
    dataString += "\nTheir children are:";
    for (let child of ed.children) {
      dataString += "\n* " + buildFamilyChildDescription(child);
    }
  }
  return dataString;
}

function buildFamilyCitationDataString(ed) {
  let husbandParents = getParents(ed.husbandParents);
  let wifeParents = getParents(ed.wifeParents);
  let lines = [
    "Husband: " +
      formatPersonName(ed.husband) +
      (husbandParents.father && husbandParents.mother
        ? ", son of " + husbandParents.father + " and " + husbandParents.mother
        : ""),
    "Wife: " +
      formatPersonName(ed.wife) +
      (wifeParents.father && wifeParents.mother
        ? ", daughter of " + wifeParents.father + " and " + wifeParents.mother
        : ""),
  ];
  if (ed.marriageDate || ed.marriagePlace) {
    lines.push(
      "Marriage: " +
        (ed.marriageDate ? formatFamilyDate(ed.marriageDate) : "") +
        (ed.marriagePlace ? (ed.marriageDate ? " in " : "") + ed.marriagePlace : "")
    );
  }
  if (ed.children && ed.children.length > 0) {
    lines.push("Children:");
    for (let child of ed.children) {
      lines.push("- " + buildFamilyChildDescription(child));
    }
  }
  return lines.join("\n");
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  if (ed.pageType == "family") {
    builder.dataString = buildFamilyCitationDataString(ed);
  } else {
    builder.addStandardDataString(gd);
    builder.addListDataString(buildAdditionalCitationFields(ed));
  }
}

function buildCitation(input) {
  const generalizedData = input.generalizedData;
  const originalNarrative = generalizedData.userOverrideForNarrative;
  if (input.extractedData.pageType == "family") {
    generalizedData.userOverrideForNarrative = buildFamilyNarrative(input.extractedData);
  }
  try {
    return simpleBuildCitationWrapper(input, buildCoreCitation, (ed, gd) =>
      ed.pageType == "family" ? "Family" : gd.getRefTitle()
    );
  } finally {
    generalizedData.userOverrideForNarrative = originalNarrative;
  }
}

export { buildCitation };
