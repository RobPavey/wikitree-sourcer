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

import { GeneralizedData } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";

function addWtSearchTemplates(ed, result) {
  let wtTemplates = [];
  let wtTemplatesRelated = [];

  function addLinkOrTemplate(templates, linkOrTemplate) {
    if (linkOrTemplate && linkOrTemplate.startsWith("{{")) {
      if (!templates.includes(linkOrTemplate)) {
        templates.push(linkOrTemplate);
      }
    }
  }

  if (ed.memorialId) {
    const template = "{{FindAGrave|" + ed.memorialId + "}}";
    addLinkOrTemplate(wtTemplates, template);
  }

  // if there are templates add them to result
  if (wtTemplates.length) {
    result.wtSearchTemplates = wtTemplates;
  }
  if (wtTemplatesRelated.length) {
    result.wtSearchTemplatesRelated = wtTemplatesRelated;
  }
}

function extractNicknames(name, nameObj) {
  // change non-standard "smart" quotes to quotes
  name = name.replace(/[“”]/g, '"');

  if (!name.includes('"')) {
    return name;
  }

  let didExtract = false;
  let startQuoteIndex = name.indexOf('"');
  if (startQuoteIndex != -1) {
    let endQuoteIndex = name.indexOf('"', startQuoteIndex + 1);
    if (endQuoteIndex != -1) {
      let nickNames = name.substring(startQuoteIndex + 1, endQuoteIndex);
      if (nickNames) {
        if (nameObj.nickNames) {
          nameObj.nickNames += " ";
          nameObj.nickNames += nickNames;
        } else {
          nameObj.nickNames = nickNames;
        }
      }
      name = name.substring(0, startQuoteIndex) + name.substring(endQuoteIndex + 1);
      didExtract = true;
    }
  }

  if (didExtract) {
    // call recursively in case there are multiple nicknames (not sure that this can ever happen)
    return extractNicknames(name, nameObj);
  }

  return name;
}

function extractNameParts(ed, name, nameObj) {
  if (!name) {
    return;
  }

  name = name.replace(/[.]/g, ""); // eliminate periods
  name = name.replace(/\s+/g, " "); // change multple spaces to single space

  let url = ed.url;
  let urlName = url.replace(/^.*\/([^/]+)\/?$/, "$1"); // extract the last component

  // decode the URL name so that escapes like
  // ale%C5%A1-hrdli%C4%8Dka are decoded to aleš-hrdlička
  urlName = decodeURIComponent(urlName);

  // lcName is lower case but otherwise always the same length as name
  let lcName = name.toLowerCase();

  let urlNameParts = urlName.split("-");

  // if the name contains a hyphenated name, e.g.:
  // https://www.findagrave.com/memorial/140044048/frederick-hew_george-dalrymple-hamilton
  // Then some of the hyphens in the url name are not actually separating name parts.
  // In this case we stick those parts back together in urlNameParts
  if (name.indexOf("-") != -1) {
    // we need to join some url name parts back together
    let newUrlNameParts = [];
    let numNameParts = urlNameParts.length;
    let startIndex = 0;
    for (let index = 0; index < numNameParts - 1; index++) {
      let candidatePart = urlNameParts[index] + "-" + urlNameParts[index + 1];
      candidatePart = candidatePart.replace(/_/g, " ");
      let candidatePartIndex = lcName.indexOf(candidatePart, startIndex);

      let matchedCandidatePartIndex = candidatePartIndex;
      let matchedCandidatePart = candidatePart;

      while (candidatePartIndex != -1 && index < numNameParts - 1) {
        index++;
        candidatePart = candidatePart + "-" + urlNameParts[index + 1];
        candidatePart = candidatePart.replace(/_/g, " ");
        candidatePartIndex = lcName.indexOf(candidatePart, startIndex);

        if (candidatePartIndex != -1) {
          matchedCandidatePartIndex = candidatePartIndex;
          matchedCandidatePart = candidatePart;
        }
      }

      if (matchedCandidatePartIndex != -1) {
        newUrlNameParts.push(matchedCandidatePart);
        startIndex = matchedCandidatePartIndex + matchedCandidatePart.length;
      } else {
        newUrlNameParts.push(urlNameParts[index]);
        startIndex += urlNameParts[index].length;
      }
    }
    urlNameParts = newUrlNameParts;
  }

  // use these to find prefix and suffix, they could be the same
  let firstNames = urlNameParts[0].replace("_", " ");
  let lastNames = urlNameParts[urlNameParts.length - 1].replace("_", " ");

  // There are some cases where the URL doesn't contain all the name parts.
  // For example: https://www.findagrave.com/memorial/91226577/l-rich
  // The name on the page is: Louise R Richards
  // In those cases just set full name.
  // How to identify them though?
  let basicPageNameParts = lcName.split(" ");
  let matchedNameParts = 0;
  for (let basicPageNamePart of basicPageNameParts) {
    if (firstNames.includes(basicPageNamePart)) {
      matchedNameParts++;
    } else if (lastNames.includes(basicPageNamePart)) {
      matchedNameParts++;
    }
  }
  if (matchedNameParts < 2) {
    nameObj.setFullName(name);
    return;
  }

  if (!lcName.startsWith(firstNames)) {
    // there must be a prefix
    let firstNamesIndex = lcName.indexOf(firstNames);
    if (firstNamesIndex == -1) {
      // this should not happen, if it does then just use the full name
      nameObj.setFullName(name);
      return;
    }
    nameObj.prefix = name.substring(0, firstNamesIndex).trim();
    name = name.substring(firstNamesIndex).trim();
    lcName = name.toLowerCase();
  }

  if (!lcName.endsWith(lastNames)) {
    // there must be a suffix
    let lastNamesIndex = lcName.lastIndexOf(lastNames);
    if (lastNamesIndex == -1) {
      // this should not happen, if it does then just use the full name
      nameObj.setFullName(name);
      return;
    }
    let suffixIndex = lastNamesIndex + lastNames.length;
    nameObj.suffix = name.substring(suffixIndex).trim();
    name = name.substring(0, suffixIndex).trim();
    lcName = name.toLowerCase();
  }

  // now we want to find the first middle and last names
  if (urlNameParts.length >= 2) {
    // there is a middle name
    if (lcName.startsWith(firstNames) && lcName.endsWith(lastNames)) {
      let actualFirstNames = name.substring(0, firstNames.length).trim();
      let actualLastNames = name.substring(name.length - lastNames.length).trim();
      nameObj.setFirstNames(actualFirstNames);
      nameObj.setLastName(actualLastNames);

      if (urlNameParts.length > 2 && firstNames.length + lastNames.length < name.length) {
        let actualMiddleNames = name.substring(firstNames.length, name.length - lastNames.length).trim();
        nameObj.setMiddleNames(actualMiddleNames);
      }

      // success!
      return;
    }
  }

  // could not separate first, middle and last set set full name
  nameObj.setFullName(name);
}

function setNames(ed, result) {
  let fgName = ed.name;
  let fullName = fgName;
  let maidenName = "";

  result.createNameIfNeeded();
  let nameObj = result.name;

  // The name string can contain italics which indicates the maiden name
  if (ed.nameHtml && fgName != ed.nameHtml && ed.nameHtml.includes("<i>")) {
    // we may have a part in italics
    let html = ed.nameHtml;
    let italicStartIndex = html.indexOf("<i>");
    let italicEndIndex = html.indexOf("</i>", italicStartIndex);
    if (italicStartIndex != -1 && italicEndIndex != -1) {
      let partBefore = html.substring(0, italicStartIndex).trim();
      let partItalic = html.substring(italicStartIndex + 3, italicEndIndex).trim();
      let partAfter = html.substring(italicEndIndex + 4).trim();

      // check there are no more italics
      let secondItalicStartIndex = html.indexOf("<i>", italicEndIndex);
      if (secondItalicStartIndex == -1) {
        fullName = partBefore + " " + partAfter;
        maidenName = partItalic;
      }
    }
  }

  // Handle nicknames
  fullName = extractNicknames(fullName, nameObj);

  // Now use the URL to identify what the remaining parts of the name are
  extractNameParts(ed, fullName, nameObj);

  if (ed.namePrefix) {
    if (nameObj.prefix) {
      if (!nameObj.prefix.includes(ed.namePrefix)) {
        nameObj.prefix = ed.namePrefix + " " + nameObj.prefix;
      }
    } else {
      nameObj.prefix = ed.namePrefix;
    }
  }

  if (!maidenName) {
    let lastName = result.inferLastName();
    if (lastName) {
      result.lastNameAtDeath = lastName;
    }
  } else {
    result.lastNameAtBirth = maidenName;
    if (result.name.lastName) {
      result.lastNameAtDeath = result.name.lastName;
    }
  }
}

function generalizeData(input) {
  let ed = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "fg";

  if (!ed.success) {
    return result; //the extract failed
  }

  result.sourceType = "record";

  // If no burial location perhaps it should be a death?
  result.recordType = RT.Memorial;

  result.setEventDate(ed.deathDate);
  result.setEventPlace(ed.cemeteryFullAddress);

  if (result.eventPlace) {
    result.eventPlace.streetAddress = ed.cemeteryName;
  }

  setNames(ed, result);

  result.setDeathDate(ed.deathDate);
  result.setDeathPlace(ed.deathPlace);

  if (ed.ageAtDeath) {
    result.ageAtDeath = ed.ageAtDeath;
  }

  result.setBirthDate(ed.birthDate);
  result.setBirthPlace(ed.birthPlace);

  // Template search data
  addWtSearchTemplates(ed, result);

  // should we use a collection to allow search for same record on Ancestry?

  result.hasValidData = true;

  return result;
}

export { generalizeData };
