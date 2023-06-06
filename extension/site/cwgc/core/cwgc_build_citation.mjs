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
import { WTS_String } from "../../../base/core/wts_string.mjs";
import { getCountry } from "./cwgc_nationalities.mjs";

function getCorrectlyCasedName(name, options) {
  if (options.citation_cwgc_changeNamesToInitialCaps) {
    name = WTS_String.toInitialCaps(name);
  }
  return name;
}

function getCorrectlyCasedNames(name, options) {
  if (options.citation_cwgc_changeNamesToInitialCaps) {
    name = WTS_String.toInitialCapsEachWord(name, true);
  }
  return name;
}

function getFullName(data, options) {
  const indexOfLastSpace = data.fullName.lastIndexOf(" ");
  if (indexOfLastSpace > 0) {
    let forenames = data.fullName.substring(0, indexOfLastSpace);
    let surname = data.fullName.substring(indexOfLastSpace + 1);
    return getCorrectlyCasedNames(forenames, options) + " " + getCorrectlyCasedName(surname, options);
  }
  return getCorrectlyCasedName(data.fullName, options);
}

function buildCoreCitation(data, gd, builder) {
  let options = builder.getOptions();
  builder.sourceTitle = "Commonwealth War Graves Commission";
  if (data.hasImage) {
    builder.databaseHasImages = true;
  }

  let recordLink = "[" + data.url + " Commonwealth War Graves Commission Record]";
  builder.recordLinkOrTemplate = recordLink;

  if (data.cemeteryName) {
    builder.sourceReference += getCorrectlyCasedNames(data.cemeteryName, options);
    if (data.cemeteryAddress) {
      builder.sourceReference += ", " + getCorrectlyCasedNames(data.cemeteryAddress, options);
    }
    if (data.plot) {
      builder.sourceReference += ". (Plot: " + data.plot + ")";
    }
  }

  let dataString = "Memorial page for " + getFullName(data, options) + ".";

  if (options.citation_cwgc_includeServiceNumber && data.serviceNumber) {
    dataString += " Service number: " + data.serviceNumber + "; ";
  }

  if (data.rank) {
    dataString += " Rank: " + data.rank + "; ";
  }

  if (data.deathDate) {
    dataString += " Died: " + data.deathDate + "; ";
  }

  if (data.ageAtDeath) {
    dataString += " Age: " + data.ageAtDeath + "; ";
  }

  dataString = dataString.replace(/; $/, ".");

  if (options.citation_general_addBreaksWithinBody) {
    dataString += "<br/>";
  } else {
    dataString += " ";
  }
  if (options.citation_general_addNewlinesWithinBody) {
    dataString += "\n";
  }

  if (options.citation_cwgc_includeUnit && data.unit) {
    dataString += "Regiment & Unit/Ship: " + data.unit;
    if (data.serviceCountry) {
      const country = getCountry(data.serviceCountry);
      dataString += " (" + country + ");";
    }
  }

  if (options.citation_cwgc_includeAdditionalInfo && data.info) {
    dataString += " Additional Info: " + data.info;
  }

  if (!dataString.endsWith(".")) {
    dataString += ".";
  }

  builder.dataString = dataString;
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
