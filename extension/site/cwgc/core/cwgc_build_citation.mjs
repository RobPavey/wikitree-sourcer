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

function getFullName(ed, options) {
  const indexOfLastSpace = ed.fullName.lastIndexOf(" ");
  if (indexOfLastSpace > 0) {
    let forenames = ed.fullName.substring(0, indexOfLastSpace);
    let surname = ed.fullName.substring(indexOfLastSpace + 1);
    return getCorrectlyCasedNames(forenames, options) + " " + getCorrectlyCasedName(surname, options);
  }
  return getCorrectlyCasedName(ed.fullName, options);
}

function buildCoreCitation(ed, gd, builder) {
  let options = builder.getOptions();
  builder.sourceTitle = "Commonwealth War Graves Commission";
  if (ed.hasImage) {
    builder.databaseHasImages = true;
  }

  let recordLink = "[" + ed.url + " Commonwealth War Graves Commission Record]";
  builder.recordLinkOrTemplate = recordLink;

  if (ed.cemeteryName) {
    builder.sourceReference += getCorrectlyCasedNames(ed.cemeteryName, options);
    if (ed.cemeteryAddress) {
      builder.sourceReference += ", " + getCorrectlyCasedNames(ed.cemeteryAddress, options);
    }
    if (ed.plot) {
      builder.sourceReference += ". (Plot: " + ed.plot + ")";
    }
  }

  let dataString = "Memorial page for " + getFullName(ed, options) + ".";

  if (options.citation_cwgc_includeServiceNumber && ed.serviceNumber) {
    dataString += " Service number: " + ed.serviceNumber + "; ";
  }

  if (ed.rank) {
    dataString += " Rank: " + ed.rank + "; ";
  }

  if (ed.deathDate) {
    dataString += " Died: " + ed.deathDate + "; ";
  }

  if (ed.ageAtDeath) {
    dataString += " Age: " + ed.ageAtDeath + "; ";
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

  if (options.citation_cwgc_includeUnit && ed.unit) {
    dataString += "Regiment & Unit/Ship: " + ed.unit;
    if (ed.serviceCountry) {
      const country = getCountry(ed.serviceCountry);
      dataString += " (" + country + ");";
    }
  }

  if (options.citation_cwgc_includeAdditionalInfo && ed.info) {
    dataString += " Additional Info: " + ed.info;
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
