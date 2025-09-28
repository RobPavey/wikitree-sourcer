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

import { RT } from "../../../base/core/record_type.mjs";
import { ExtractedDataReader } from "../../../base/core/extracted_data_reader.mjs";
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";

////////////////////////////////////////////////////////////////////////////////////////////////////
// Helper functions
////////////////////////////////////////////////////////////////////////////////////////////////////

function getCountry(url) {
  // Check if path contains /world/
  if (url.includes("/world/")) {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split("/");

    // Find where "world" is and take the next part as country
    const worldIndex = pathParts.indexOf("world");
    const country = pathParts[worldIndex + 1];

    return country;
  } else {
    return "South Africa";
  }
}

function isNumeric(str) {
  return !isNaN(str) && str.trim() !== "";
}

function extractNames(ed) {
  // Construct an array of objects
  //   {
  //    originalName:
  //    fullName:
  //    firstNames:
  //    lastName:
  //    lnab:
  //    otherLastNames: []
  //    birth:
  //    death:
  //   }

  // eggsa graves name entries have the format <person1> <sep> <person2> <sep> <person3> ...
  // where <sep> can be either & or ::
  // <person1> is always of the form "LASTNAME First Names", or, for multi-word last names: "MERWE First Name, van der"
  // The format of the other (non-first) persons depends on what the preceding <sep> is:
  //   if &
  //         "First Names ALL CAPS LASTNAME" (with multi-word last names in the normal order)
  //   if ::
  //         "ALL CAPS LASTNAME First Names" (with multi-word last names in the normal order)
  // All surnames are alwasy in ALL CAPS, except for the first person if it has a multi-word surname, in which casae,
  // as we've indicated, the surname is split and only the main part is capitalised (and at the front). In other multi-word
  // surnames, the "prefixes" are sometimes not capitalised, but sometimes are.
  // Any name may have only either a surname or first name(s).
  // Any name could have "nee LNAB" or "geb. LNAB" at the end.

  const peopleParts = splitWithSeparators(ed.peopleStr);

  // split names and dates
  const people = [];
  for (const { str: nameStr, separator: separator } of peopleParts) {
    const person = getNameAndDates(nameStr.trim());
    if (!person) continue;

    let originalName = person.originalName;
    const match = originalName.replaceAll("é", "e").match(/ nee | geb.? /);
    if (match) {
      [, person.lnab] = extractLastNameAtFront(person.originalName.substring(match.index + match[0].length) + " ");
      originalName = originalName.slice(0, match.index);
    }

    // Extract last name
    let lastName;
    let firstNames;
    if (separator === null) {
      // First person
      // The first person's name is in the format "LASTNAME First Names",
      // or, for multi-word last names: "MERWE First Name, van der"
      // or LITH Martha Louisa, van der formerly OLIVIER
      if (hasSurname(originalName)) {
        let rest;
        [lastName, rest] = shiftWord(originalName);

        // check for formerly
        const indexOfFormerly = rest.indexOf("formerly ");
        if (indexOfFormerly >= 0) {
          person.otherLastNames = rest
            .substring(indexOfFormerly)
            .replaceAll(",", "")
            .trim()
            .split("formerly ")
            .splice(1)
            .map((s) => NameUtils.convertNameFromAllCapsToMixedCase(s));
          rest = rest.substring(0, indexOfFormerly);
        }

        // fix e.g. Merwe Johan, van der (this is only the case for the first person)
        const indexOfCommaSpace = rest.indexOf(", ");
        if (indexOfCommaSpace >= 0) {
          firstNames = rest.substring(0, indexOfCommaSpace);
          const newRest = rest.substring(indexOfCommaSpace + 2).replaceAll(".", "");
          const prefix = multiWordSurnamePrefix(newRest + " ");
          if (prefix && newRest.length > prefix.length) {
            // The prefix is actually another multi-word last name
            const [, correctedPrefix] = fixPrefixCapitalisation(` ${newRest} `, ` ${newRest.toLowerCase()} `);
            if (correctedPrefix)
              lastName = correctedPrefix + " " + NameUtils.convertNameFromAllCapsToMixedCase(lastName);
          } else {
            const lnPrefix = rest.substring(indexOfCommaSpace + 2).replaceAll(".", "");
            lastName = lnPrefix + " " + NameUtils.convertNameFromAllCapsToMixedCase(lastName);
          }
        } else {
          firstNames = rest;
          lastName = NameUtils.convertNameFromAllCapsToMixedCase(lastName);
        }
      } else {
        // No last name
        firstNames = originalName;
      }
    } else {
      // Subsequent people
      if (hasSurname(originalName)) {
        const lcName = originalName.toLowerCase();
        if (separator == "::") {
          // For :: separators, all but the first person's names are of the form "ALL CAPS LASTNAME First Names" (with
          // multi-word last names in the normal order)
          [firstNames, lastName] = extractLastNameAtFront(originalName);
        } else {
          // For & separators, all but the first person's names are of the form "First Names ALL CAPS LASTNAME" (with
          // multi-word last names in the normal order), but  could also be just "First Name".
          [firstNames, lastName] = fixPrefixCapitalisation(originalName, lcName);
          // for (const prefix of lastNamePrefixes) {
          //   // Make sure we know where the last name of multi-word last names start.
          //   const lnIdx = lcName.indexOf(" " + prefix);
          //   if (lnIdx >= 0) {
          //     lastName =
          //       (prefix.startsWith("janse") ? StringUtils.toInitialCaps(prefix) : prefix) +
          //       NameUtils.convertNameFromAllCapsToMixedCase(originalName.substring(lnIdx + prefix.length + 1)); // don't include the leading space
          //     firstNames = originalName.substring(0, lnIdx);
          //     break;
          //   }
          // }
          if (!lastName) {
            // We don't have a multi-word last name
            lastName = StringUtils.getLastWord(originalName);
            firstNames = originalName.substring(0, originalName.indexOf(lastName) - 1);
            lastName = NameUtils.convertNameFromAllCapsToMixedCase(lastName);
          }
        }
      } else {
        // No last name found, assume same last name as first person
        lastName = people[0]?.lastName;
        firstNames = originalName;
      }
    }

    // Fix first name capitalisation
    if (firstNames) {
      // We shouls really check for multi-word prefixes and not capitalise them, but for now we'll
      // leave that to be fixed in convertNameFromAllCapsToMixedCase
      firstNames = firstNames.replaceAll(".", " "); // remove dots
      firstNames = NameUtils.convertNameFromAllCapsToMixedCase(firstNames);
    }

    if (lastName || firstNames) {
      person.lastName = lastName;
      person.firstNames = firstNames;
      if (lastName) {
        if (firstNames) {
          person.fullName = person.firstNames + " " + person.lastName;
        } else {
          person.fullName = person.lastName;
        }
      } else {
        person.fullName = person.firstNames;
      }
      people.push(person);
    }
  }
  ed.people = people;
}

function fixPrefixCapitalisation(name, lcName) {
  // If name is "First Names ALL CAPS LASTNAME" (with multi-word last names in the normal order), lcName just
  // the lower case version of name,
  // return: { firstNames: First Names, lastName: all caps LastName } if "all caps" is a valid prefix,
  // otherwise return undefined. We cater for "First Names" possibly being empty.
  let firstNames, lastName;
  for (const prefix of lastNamePrefixes) {
    // Make sure we know where the last name of multi-word last names start.
    const indexOfLastnameAfterPrefix = lcName.indexOf(" " + prefix);
    if (indexOfLastnameAfterPrefix >= 0) {
      lastName =
        (prefix.startsWith("janse") ? StringUtils.toInitialCaps(prefix) : prefix) +
        NameUtils.convertNameFromAllCapsToMixedCase(name.substring(indexOfLastnameAfterPrefix + prefix.length + 1)); // don't include the leading space
      firstNames = name.substring(0, indexOfLastnameAfterPrefix).trim();
      return [firstNames, lastName];
    }
  }
  return [];
}

function extractLastNameAtFront(originalName) {
  // Extract last name and first names from "ALL CAPS LASTNAME First Names" (with multi-word last names in the normal order).
  // It is assumed there is a space after LASTNAME, even if there is no first name.
  let lastName;
  let firstNames;
  // Make sure we know where the last name of multi-word last names end.
  const prefix = multiWordSurnamePrefix(originalName);
  if (prefix) {
    const eofLastName = originalName.indexOf(" ", prefix.length);
    lastName =
      (prefix.startsWith("janse") ? StringUtils.toInitialCaps(prefix) : prefix) +
      NameUtils.convertNameFromAllCapsToMixedCase(originalName.substring(prefix.length, eofLastName));
    firstNames = originalName.substring(eofLastName + 1);
  } else {
    // We don't have a multi-word last name at the start
    [lastName, firstNames] = shiftWord(originalName);
    lastName = NameUtils.convertNameFromAllCapsToMixedCase(lastName);
  }
  return [firstNames, lastName];
}

function splitWithSeparators(str) {
  const parts = [];
  const regex = /(::|&)/g;
  let lastIndex = 0;
  let match;
  let separator = null;

  while ((match = regex.exec(str)) !== null) {
    const chunk = str.slice(lastIndex, match.index);
    if (chunk.length > 0 || separator === null) {
      parts.push({ str: chunk, separator });
    }
    separator = match[0]; // "::" or "&"
    lastIndex = match.index + match[0].length;
  }

  // Add the last part after the final separator
  if (lastIndex <= str.length) {
    const chunk = str.slice(lastIndex);
    parts.push({ str: chunk, separator });
  }

  return parts;
}

function shiftWord(str) {
  const [first, ...rest] = str.trim().split(/\s+/);
  return [first, rest.join(" ")];
}

function getNameAndDates(str) {
  // Match "<name>" optionally followed by " XXXX-YYYY"
  const match = str.match(/^(.*?)(?:\s+([\d?]{0,4})[- ]([\d?]{0,4}))?$/);
  if (!match) return null;
  return {
    originalName: match[1].trim(),
    birth: match[2],
    death: match[3],
  };
}

function hasSurname(name) {
  // All surnames (or at least their main parts) are given in all caps on graves.eggsa
  let words = name.split(" ");
  for (const word of words) {
    if (word.replaceAll(".", "").length > 1 && StringUtils.isAllUppercase(word)) {
      return true;
    }
  }
  if (name.startsWith("?")) {
    return true;
  }
  return false;
}

// See https://en.wikipedia.org/wiki/List_of_family_name_affixes
// To be better this could take country names into account
const lastNamePrefixes = [
  "ab ",
  "ap ",
  "da ",
  "de ",
  "di ",
  "du ",
  "ibn ",
  "janse van ",
  "la ",
  "le ",
  "lu ",
  "te ",
  "ter ",
  "ten ",
  "van den ",
  "van der ",
  "van de ",
  "van ",
  "von ",
  "zu ",
];

/**
 * If str starts with a multi-word surname prefix, (e.g. "van der " of "van der Merwe"), return the prefix,
 * else return false
 * @param {*} str
 */
function multiWordSurnamePrefix(str) {
  const lcName = str.toLowerCase();
  for (const prefix of lastNamePrefixes) {
    if (lcName.startsWith(prefix)) {
      return prefix;
    }
  }
  return false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// The class
////////////////////////////////////////////////////////////////////////////////////////////////////
class EggsagrvsEdReader extends ExtractedDataReader {
  constructor(ed, primaryPersonIndex = 0) {
    super(ed);
    this.primaryPersonIndex = primaryPersonIndex;
    this.ed.country = getCountry(ed.url);
    this.recordType = RT.Death;

    // console.log("EggsagrvsEdReader before", this.ed);
    extractNames(this.ed);
    // console.log("EggsagrvsEdReader after", this.ed);
  }

  getPerson() {
    return this.ed.people[this.primaryPersonIndex];
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  hasValidData() {
    if (!this.ed.success) {
      return false; //the extract failed, GeneralizedData is not even normally called in this case
    }
    if (!this.ed.peopleStr) {
      return false;
    }

    return true;
  }

  getPrimaryPersonOptions() {
    if (this.ed.people.length > 1) {
      return this.ed.people.map((p) => p.fullName);
    }
    return undefined;
  }

  getSourceType() {
    return "record";
  }

  getNameObj() {
    const person = this.getPerson();
    if (!person) return undefined;
    const nameObj = this.makeNameObjFromForenamesAndLastName(person.firstNames, person.lastName);
    nameObj.otherLastNames = person.otherLastNames;
    return nameObj;
  }

  getGender() {
    return "";
  }

  getEventDateObj() {
    const yearString = this.getPerson()?.death;
    if (yearString) return this.makeDateObjFromYear(yearString);
    return undefined;
  }

  getEventPlaceObj() {
    const text = this.ed.breadcrumb;
    const parts = text.split(",");
    let place;
    if (this.ed.country != "South Africa") {
      return this.makePlaceObjFromCountryName(this.ed.country);
    } else {
      if (parts.length >= 2) {
        place = [parts[1].trim(), parts[0].trim(), this.ed.country].join(", ");
      } else {
        place = [parts[0].trim(), this.ed.country].join(", ");
      }
    }
    return this.makePlaceObjFromFullPlaceName(StringUtils.toInitialCapsEachWord(place));
  }

  getLastNameAtBirth() {
    return this.getPerson()?.lnab || "";
  }

  getLastNameAtDeath() {
    return this.getPerson()?.lastName || "";
  }

  getMothersMaidenName() {
    return "";
  }

  getBirthDateObj() {
    const yearString = this.getPerson()?.birth;
    if (yearString) return this.makeDateObjFromYear(yearString);
    return undefined;
  }

  getBirthPlaceObj() {
    return undefined;
  }

  getDeathDateObj() {
    const yearString = this.getPerson()?.death;
    if (yearString) return this.makeDateObjFromYear(yearString);
    return undefined;
  }

  getDeathPlaceObj() {
    return undefined;
  }

  getAgeAtEvent() {
    const person = this.getPerson();
    if (person?.birth && person?.death && isNumeric(person.birth) && isNumeric(person.death)) {
      return parseInt(person.death, 10) - parseInt(person.birth, 10);
    }
    return "";
  }

  getAgeAtDeath() {
    return this.getAgeAtEvent();
  }
}

export { EggsagrvsEdReader, multiWordSurnamePrefix };
