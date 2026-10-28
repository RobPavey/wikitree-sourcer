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

import { RipieUriBuilder } from "./ripie_uri_builder.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";

// RIP.ie's search filters by the date a notice was PUBLISHED, not the date of death. Notices usually
// appear within days of the death, so search from just before the death to a few weeks after.
const daysBeforeDeath = 3;
const daysAfterDeath = 28;

// RIP.ie's notice archive starts around 2006/2007. Using the start of 2006 as the floor costs nothing if the
// real start is a little later, and means nothing is missed if it is a little earlier.
const archiveStartDate = "2006-01-01";

function toIsoDate(dateObject) {
  return dateObject.toISOString().substring(0, 10);
}

function addDays(isoDate, days) {
  let date = new Date(isoDate + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

function pad(number) {
  return (number < 10 ? "0" : "") + number;
}

function getPublicationWindow(gd, runDate) {
  let deathDateString = gd.inferDeathDate();
  if (!deathDateString) {
    return undefined;
  }

  let parsed = DateUtils.parseDateString(deathDateString);
  if (!parsed.isValid || !parsed.yearNum) {
    return undefined;
  }

  let start = "";
  let end = "";
  let year = parsed.yearNum;

  if (parsed.hasDay && parsed.hasMonth) {
    let deathDate = year + "-" + pad(parsed.monthNum) + "-" + pad(parsed.dayNum);
    start = addDays(deathDate, -daysBeforeDeath);
    end = addDays(deathDate, daysAfterDeath);
  } else if (parsed.hasMonth) {
    start = year + "-" + pad(parsed.monthNum) + "-01";
    end = addDays(start, 31 + daysAfterDeath);
  } else {
    start = year + "-01-01";
    end = year + "-12-31";
  }

  if (end < archiveStartDate) {
    // the whole window is before the archive starts so a date filter could never match
    return undefined;
  }
  if (start < archiveStartDate) {
    start = archiveStartDate;
  }

  // runDate is the date the search is being built (the current date when run in the browser)
  let today = toIsoDate(runDate ? runDate : new Date());
  if (end >= today) {
    end = "today";
  } else {
    end = end + " 00:00:00";
  }

  return { start: start + " 00:00:00", end: end };
}

function getFirstNameForSearch(gd) {
  // A WikiTree profile can have a "Preferred First Name" (stored as prefName, or prefNames if there are several
  // words). Notices are often written using the name a person was known by, so use it when it is present.
  let name = gd.name;
  if (name) {
    let preferredName = name.prefName ? name.prefName : name.prefNames;
    if (preferredName && preferredName.trim()) {
      return preferredName.trim();
    }
  }
  return gd.inferFirstName();
}

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;

  var builder = new RipieUriBuilder();

  builder.addPage("1");
  builder.addFirstName(getFirstNameForSearch(gd));

  let surname = gd.inferLastNameAtDeath();
  if (!surname) {
    surname = gd.inferLastName();
  }
  builder.addSurname(surname);

  let lastNameAtBirth = gd.inferLastNameAtBirth();
  if (lastNameAtBirth && lastNameAtBirth != surname) {
    builder.addNee(lastNameAtBirth);
  }

  // If no dates are sent RIP.ie only searches the last month. So when there is no usable death date search the
  // whole archive instead.
  let window = getPublicationWindow(gd, buildUrlInput.runDate);
  if (!window) {
    window = { start: archiveStartDate + " 00:00:00", end: "today" };
  }
  builder.addStartDate(window.start);
  builder.addEndDate(window.end);

  builder.addSortAndView();

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
