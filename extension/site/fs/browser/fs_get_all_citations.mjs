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

/* 
  Note that this is a complex piece of code and is not currently tested by unit tests.

  Here are some test cases:

 		https://www.familysearch.org/tree/person/sources/L2Q9-YLC  (Has ancestry records)
		https://www.familysearch.org/tree/person/details/K2HC-86C  (Has records that can be merged)
		https://www.familysearch.org/tree/person/details/LJJH-F8B  (German record. Can’t merge marriage because last name different)
		https://www.familysearch.org/tree/person/sources/G7MJ-Y7W  (Has non FS source with notes)
		https://www.familysearch.org/tree/person/sources/L231-R8M  Has censuses that can be merged - also had date sorting issues
		https://www.familysearch.org/tree/person/sources/MQNQ-H1D  Had issue with birth place match on baptisms
		https://www.familysearch.org/tree/person/sources/KC6X-WRJ  Has 31 sources
		https://www.familysearch.org/tree/person/sources/L7LT-DG1  Caused empty ref - no FS sources
			  Because it has an FS link but it is to an image.
		https://www.familysearch.org/tree/person/sources/L2QN-6JJ  Merges marriages even though spouse surnames are different.
			  Perhaps it should not if the spouse name is being shown in narrative.
		https://www.familysearch.org/tree/person/sources/LHVG-L58  Has some Ancestry sources, one not formatted well

*/

import { extractDataFromFetch } from "../core/fs_extract_data.mjs";
import { generalizeData } from "../core/fs_generalize_data.mjs";
import { CD } from "../../../base/core/country_data.mjs";
import { RC } from "../../../base/core/record_collections.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { Role } from "../../../base/core/record_type.mjs";
import { buildCitation } from "../core/fs_build_citation.mjs";
import { buildHouseholdTable } from "../../../base/core/table_builder.mjs";
import { WTS_Date } from "../../../base/core/wts_date.mjs";
import { buildHouseholdTableString } from "/base/browser/popup/popup_citation.mjs";

import { WtsName } from "../../../base/core/generalize_data_utils.mjs";
import { buildNarrative, getFieldsUsedInNarrative } from "../../../base/core/narrative_builder.mjs";
import { displayMessage } from "/base/browser/popup/popup_menu_building.mjs";

import { doRequestsInParallel } from "/base/browser/popup/popup_parallel_requests.mjs";

import { fetchFsSourcesJson, fetchRecord } from "./fs_fetch.mjs";

function inferEventDate(source) {
  // there is no date, this can cause sort issues. Sometime we can infer one

  if (source.notes && source.notes == "Source created by RecordSeek.com") {
    if (source.citation) {
      let title = source.citation.replace(/^"([^"]+)".*$/, "$1");
      if (title && title != source.citation) {
        // get any years in title
        let years = title.match(/\d\d\d\d/);
        if (years && years.length == 1) {
          return years[0];
        }
      }
    }
  }

  if (source.title) {
    // get any years in title
    let years = source.title.match(/\d\d\d\d/g);
    if (years && years.length == 1) {
      return years[0];
    }
  }

  return "";
}

function getFsPlainCitations(result, ed, type, options) {
  if (result.sources.length == 0) {
    result.citationsString = "";
    result.citationsStringType = type;
    return;
  }

  sortSourcesUsingFsSortKeysAndFetchedRecords(result);

  let citationsString = "";

  for (let source of result.sources) {
    if (type == "inline") {
      if (citationsString) {
        citationsString += "\n";
      }
      citationsString += buildRefForPlainCitation(source, false, options);
      citationsString += "\n";
    } else {
      citationsString += "* ";
      citationsString += getTextForPlainCitation(source, "source", false, options);
      citationsString += "\n";
    }
  }

  result.citationsString = citationsString;
  result.citationsStringType = type;
  result.citationCount = result.sources.length;
}

function inferBestEventDateForCompare(gd) {
  let eventDate = "";
  if (gd) {
    eventDate = gd.inferEventDate();

    if (gd.recordType == RT.Census) {
      let collection = undefined;
      if (gd.collectionData && gd.collectionData.id) {
        collection = RC.findCollection(gd.sourceOfData, gd.collectionData.id);
      }

      if (collection && collection.dates && collection.dates.exactDate) {
        eventDate = collection.dates.exactDate;
      }
    }

    if (!eventDate) {
      if (gd.recordType == RT.Burial) {
        // The burial date will be after the death date, we are not currently considering
        // date qualifiers in sorting though
        if (!gd.role || gd.role == Role.Primary) {
          let deathDate = gd.inferDeathDate();
          if (deathDate) {
            eventDate = deathDate;
          }
        } else {
          if (gd.inferPrimaryPersonDeathDate()) {
            let deathDate = gd.inferPrimaryPersonDeathDate();
            if (deathDate) {
              eventDate = deathDate;
            }
          }
        }
      }
    }
  }

  return eventDate;
}

// this can be used both for sorthing sources and facts
function compareGdsAndSources(gdA, gdB, sourceA, sourceB) {
  let recordTypeSortPriority = {};
  recordTypeSortPriority[RT.Birth] = 1;
  recordTypeSortPriority[RT.Baptism] = 3;

  recordTypeSortPriority[RT.Census] = 50;

  recordTypeSortPriority[RT.Death] = 90;
  recordTypeSortPriority[RT.Burial] = 93;
  recordTypeSortPriority[RT.Will] = 94;
  recordTypeSortPriority[RT.Probate] = 95;

  function getEventPriority(source) {
    let priority = 50;
    if (source.generalizedData) {
      let rtPriority = recordTypeSortPriority[source.generalizedData.recordType];
      if (rtPriority) {
        priority = rtPriority;
      }
    }
    return priority;
  }

  let eventDateA = "";
  if (gdA) {
    eventDateA = inferBestEventDateForCompare(gdA);
  }
  let eventDateB = "";
  if (gdB) {
    eventDateB = inferBestEventDateForCompare(gdB);
  }

  if (!eventDateA) {
    eventDateA = sourceA.eventDate;
  }
  if (!eventDateB) {
    eventDateB = sourceB.eventDate;
  }

  if (!eventDateA) {
    eventDateA = sourceA.sortYear;
  }
  if (!eventDateB) {
    eventDateB = sourceB.sortYear;
  }

  if (eventDateA && eventDateB) {
    let result = WTS_Date.compareDateStrings(eventDateA, eventDateB);
    if (result == 0) {
      // dates are equal, sort by record type
      let priorityA = getEventPriority(sourceA);
      let priorityB = getEventPriority(sourceB);
      result = priorityA - priorityB;
    }
    return result;
  }

  // if one has a date and the other doesn't then the one with the date comes first
  if (eventDateA) {
    return -1;
  } else if (eventDateB) {
    return 1;
  }

  if (sourceA.sortKey && sourceB.sortKey) {
    if (sourceA.sortKey < sourceB.sortKey) {
      return -1;
    } else if (sourceA.sortKey > sourceB.sortKey) {
      return 1;
    }
    return 0;
  }

  if (sourceA.sortKey) {
    return -1;
  } else if (sourceB.sortKey) {
    return 1;
  }

  return 0;
}

function sortSourcesUsingFsSortKeysAndFetchedRecords(result) {
  function compareFunction(a, b) {
    return compareGdsAndSources(a.generalizedData, b.generalizedData, a, b);
  }

  // sort the sources
  result.sources.sort(compareFunction);
  //console.log("sortSourcesUsingFsSortKeysAndFetchedRecords: sorted sources:");
  //console.log(result.sources);
}

function sortFacts(result) {
  // It is very unlikely that sortFacts will change the order but it does seem
  // possible in rare merge cases
  //console.log("sortFacts");
  //console.log(result);

  /*
  let oldOrder = [];
  for (let fact of result.facts) {
    oldOrder.push(fact);
  }
  */

  function compareFunction(a, b) {
    return compareGdsAndSources(a.generalizedData, b.generalizedData, a.sources[0], b.sources[0]);
  }

  // sort the sources
  result.facts.sort(compareFunction);

  /*
  if (oldOrder.length != result.facts.length) {
    console.log("length changed");
  } else {
    for (let factIndex = 0; factIndex < result.facts.length; factIndex++) {
      if (oldOrder[factIndex] != result.facts[factIndex]) {
        console.log("fact order different at indes " + factIndex);
      }
    }
  }
  */
}

function attemptToMergeSourceIntoPriorFact(source, result, type) {
  //console.log("attemptToMergeSourceIntoPriorFact");

  function mergeDates(dateA, dateB) {
    //console.log("mergeDates:");
    //console.log(dateA);
    //console.log(dateB);

    if (!dateA) {
      if (!dateB) {
        return undefined; // for a birthDate it is fine if neither exist
      } else {
        return dateB;
      }
    } else if (!dateB) {
      return dateA;
    }

    if (dateA == dateB) {
      return dateA;
    }

    let parsedDateA = WTS_Date.parseDateString(dateA);
    let parsedDateB = WTS_Date.parseDateString(dateB);

    if (parsedDateA.isValid && parsedDateB.isValid) {
      if (parsedDateA.yearNum == parsedDateB.yearNum) {
        if (parsedDateA.hasMonth) {
          if (parsedDateB.hasMonth) {
            if (parsedDateA.monthNum == parsedDateB.monthNum) {
              if (parsedDateA.hasDay) {
                if (parsedDateB.hasDay) {
                  if (parsedDateA.dayNum == parsedDateB.dayNum) {
                    return dateA;
                  }
                } else {
                  return dateA;
                }
              } else {
                return dateB;
              }
            }
          } else {
            return dateA;
          }
        } else {
          return dateB;
        }
      }
    }

    return "nomatch";
  }

  function mergeDateObjs(dateObjA, dateObjB) {
    //console.log("mergeDateObjs:");
    //console.log(dateObjA);
    //console.log(dateObjB);

    if (!dateObjA) {
      if (!dateObjB) {
        return "";
      } else {
        return dateObjB.getDateString();
      }
    } else if (!dateObjB) {
      return dateObjA.getDateString();
    }

    if (dateObjA.qualifier != dateObjB.qualifier) {
      return "nomatch";
    }

    return mergeDates(dateObjB.getDateString(), dateObjB.getDateString());
  }

  function mergeNames(nameObjA, nameObjB) {
    //console.log("mergeNames:");
    //console.log(nameObjA);
    //console.log(nameObjB);

    if (!nameObjA || !nameObjB) {
      return undefined;
    }

    let fullNameA = nameObjA.inferFullName();
    let fullNameB = nameObjB.inferFullName();

    if (fullNameA == fullNameB) {
      return WtsName.createFromPlainObject(nameObjA);
    }

    // check for special case where one of the names is a single name
    function doesFullNameMatchSingleName(fullName, singleName) {
      if (
        fullName.startsWith(singleName) ||
        fullName.endsWith(singleName) ||
        fullName.includes('"' + singleName + '"') ||
        fullName.includes("(" + singleName + ")") ||
        fullName.includes(" " + singleName + " ")
      ) {
        return true;
      }
      return false;
    }
    const nameASpaceIndex = fullNameA.indexOf(" ");
    const nameBSpaceIndex = fullNameB.indexOf(" ");
    if (nameASpaceIndex == -1) {
      if (nameBSpaceIndex == -1) {
        // there are both single names and we have already tested if full names match
        return undefined;
      } else {
        // nameA is single name
        if (doesFullNameMatchSingleName(fullNameB, fullNameA)) {
          return WtsName.createFromPlainObject(nameObjB);
        } else {
          return undefined;
        }
      }
    } else if (nameBSpaceIndex == -1) {
      // nameB is single name
      if (doesFullNameMatchSingleName(fullNameA, fullNameB)) {
        return WtsName.createFromPlainObject(nameObjA);
      } else {
        return undefined;
      }
    }

    let firstNameA = nameObjA.inferFirstName();
    let firstNameB = nameObjB.inferFirstName();
    let firstNamesMatch = true; // if no first name it is a match
    let matchingFirstName = "";
    if (firstNameA) {
      matchingFirstName = firstNameA;
      if (firstNameB) {
        firstNamesMatch = firstNameA == firstNameB;
      }
    } else {
      matchingFirstName = firstNameB;
    }
    if (firstNamesMatch) {
      matchingFirstName = "";
    }

    let lastNameA = nameObjA.inferLastName();
    let lastNameB = nameObjB.inferLastName();
    let lastNamesMatch = true; // if no last name it is a match
    let matchingLastName = "";
    if (lastNameA) {
      matchingLastName = lastNameA;
      if (lastNameB) {
        lastNamesMatch = lastNameA == lastNameB;
      }
    } else {
      matchingLastName = lastNameB;
    }
    if (lastNamesMatch) {
      matchingLastName = "";
    }

    if (firstNamesMatch && lastNamesMatch) {
      let middleNamesA = nameObjA.inferMiddleNames();
      let middleNamesB = nameObjA.inferMiddleNames();
      if (middleNamesA) {
        if (middleNamesB) {
          if (middleNamesA == middleNamesB) {
            // must be something else different but allow it
            return WtsName.createFromPlainObject(nameObjA);
          }
        } else {
          return WtsName.createFromPlainObject(nameObjA);
        }
      } else {
        return WtsName.createFromPlainObject(nameObjB);
      }
    }

    // check if that are alternate last names
    let mergedLastName = "";
    let nameARemainder = fullNameA;
    let nameBRemainder = fullNameB;

    if (lastNamesMatch) {
      nameARemainder = nameARemainder.substring(0, nameARemainder.length - lastNameA.length);
      nameBRemainder = nameBRemainder.substring(0, nameBRemainder.length - lastNameB.ength);
    } else if (/^.+ \w+ or \w+$/.test(fullNameA)) {
      let lastNameA1 = fullNameA.replace(/^.+ (\w+) or \w+$/, "$1");
      let lastNameA2 = fullNameA.replace(/^.+ \w+ or (\w+)$/, "$1");
      if (lastNameA1 == fullNameA) {
        lastNameA1 = "";
      }
      if (lastNameA2 == fullNameA) {
        lastNameA2 = "";
      }
      if (lastNameA1 && lastNameA2) {
        if (/^.+ \w+ or \w+$/.test(fullNameB)) {
          let lastNameB1 = fullNameB.replace(/^.+ (\w+) or \w+$/, "$1");
          let lastNameB2 = fullNameB.replace(/^.+ \w+ or (\w+)$/, "$1");
          if (lastNameB1 == fullNameB) {
            lastNameB1 = "";
          }
          if (lastNameB2 == fullNameB) {
            lastNameB2 = "";
          }

          function checkPair(nameAltA, nameAltB, otherNameAltA, otherNameAltB) {
            if (nameAltA == nameAltB) {
              lastNamesMatch = true;
              if (otherNameAltA == otherNameAltB) {
                mergedLastName = nameAltA + " or " + otherNameAltA;
              } else {
                mergedLastName = nameAltA + " or " + otherNameAltA + " or " + otherNameAltB;
              }
              nameARemainder = fullNameA.replace(/^(.+) \w+ or \w+$/, "$1");
              nameBRemainder = fullNameB.replace(/^(.+) \w+ or \w+$/, "$1");
              return true;
            }
          }

          function checkPairs(lastNameA1, lastNameB1, lastNameA2, lastNameB2) {
            if (checkPair(lastNameA1, lastNameB1, lastNameA2, lastNameB2)) return;
            if (checkPair(lastNameA1, lastNameB2, lastNameA2, lastNameB1)) return;
            if (checkPair(lastNameA2, lastNameB1, lastNameA1, lastNameB2)) return;
            if (checkPair(lastNameA2, lastNameB2, lastNameA1, lastNameB1)) return;
          }

          if (lastNameB1 && lastNameB2) {
            checkPairs(lastNameA1, lastNameB1, lastNameA2, lastNameB2);
          }
        } else {
          // only A has alternate last names
          let lastNameB = nameObjB.inferLastName();

          if (lastNameA1 == lastNameB || lastNameA2 == lastNameB) {
            lastNamesMatch = true;
            mergedLastName = lastNameA1 + " or " + lastNameA2;
            nameARemainder = fullNameA.replace(/^(.+) \w+ or \w+$/, "$1");
            nameBRemainder = fullNameB.substring(0, fullNameB.length - lastNameB.length);
          }
        }
      }
    } else if (/^.+ \w+ or \w+$/.test(fullNameB)) {
      // only B has alternate last names
      let lastNameB1 = fullNameB.replace(/^.+ (\w+) or \w+$/, "$1");
      let lastNameB2 = fullNameB.replace(/^.+ \w+ or (\w+)$/, "$1");
      if (lastNameB1 == fullNameB) {
        lastNameB1 = "";
      }
      if (lastNameB2 == fullNameB) {
        lastNameB2 = "";
      }

      if (lastNameB1 && lastNameB2) {
        let lastNameA = nameObjA.inferLastName();

        if (lastNameA == lastNameB1 || lastNameA == lastNameB2) {
          lastNamesMatch = true;
          mergedLastName = lastNameB1 + " or " + lastNameB2;
          nameARemainder = fullNameA.substring(0, fullNameA.length - lastNameA.length);
          nameBRemainder = fullNameB.replace(/^(.+) \w+ or \w+$/, "$1");
        }
      }
    }

    let mergedFirstName = "";
    if (firstNamesMatch) {
      // this could be enhanced to handle alternate first names
      nameARemainder = nameARemainder.substring(firstNameA.length);
      nameBRemainder = nameBRemainder.substring(firstNameB.length);

      mergedFirstName = matchingFirstName;
    }

    if (firstNamesMatch && lastNamesMatch) {
      nameARemainder = nameARemainder.trim();
      nameBRemainder = nameBRemainder.trim();
      if (nameARemainder) {
        if (nameBRemainder) {
          if (nameARemainder == nameBRemainder) {
            let name = new WtsName();
            name.name = mergedFirstName + " " + nameARemainder + " " + mergedLastName;
            name.firstName = mergedFirstName;
            name.middleNames = nameARemainder;
            name.lastName = mergedLastName;
            return name;
          }
        } else {
          let name = new WtsName();
          name.name = mergedFirstName + " " + nameARemainder + " " + mergedLastName;
          name.firstName = mergedFirstName;
          name.middleNames = nameARemainder;
          name.lastName = mergedLastName;
          return name;
        }
      } else if (nameBRemainder) {
        let name = new WtsName();
        name.name = mergedFirstName + " " + nameBRemainder + " " + mergedLastName;
        name.firstName = mergedFirstName;
        name.middleNames = nameBRemainder;
        name.lastName = mergedLastName;
        return name;
      } else {
        let name = new WtsName();
        name.name = mergedFirstName + " " + mergedLastName;
        name.firstName = mergedFirstName;
        name.lastName = mergedLastName;
        return name;
      }
    }

    return undefined;
  }

  function mergePlaces(placeA, placeB) {
    //console.log("mergePlaces:");
    //console.log(placeA);
    //console.log(placeB);

    if (!placeA) {
      if (!placeB) {
        return "";
      } else {
        return placeB;
      }
    } else if (!placeB) {
      return placeA;
    }

    if (placeA == placeB) {
      return placeA;
    }

    // this will make these match:
    // Devon, England, United Kingdom
    // Devon, England
    placeA = CD.standardizePlaceName(placeA);
    placeB = CD.standardizePlaceName(placeB);

    if (placeA == placeB) {
      return placeA;
    }

    if (placeA.endsWith(placeB)) {
      return placeA;
    }

    if (placeB.endsWith(placeA)) {
      return placeB;
    }

    // we would like these to merge OK for example:
    //   St Pancras, Middlesex, England
    //   Kentish Town, St Pancras, London, Middlesex, England
    // So if every term in one name if also in the other name in the same order it is OK
    function areAllTermsInOtherTerms(termsA, termsB) {
      let termBStartIndex = 0;
      for (let termA of termsA) {
        let cleanTermA = termA.trim().toLowerCase();
        let foundTermA = false;
        for (let termBIndex = termBStartIndex; termBIndex < termsB.length; termBIndex++) {
          let cleanTermB = placeBTerms[termBIndex].trim().toLowerCase();
          if (cleanTermA == cleanTermB) {
            termBStartIndex = termBIndex + 1;
            foundTermA = true;
            break;
          }
        }
        if (!foundTermA) {
          return false;
        }
      }
      return true;
    }

    let placeATerms = placeA.split(",");
    let placeBTerms = placeB.split(",");
    if (placeATerms.length < placeBTerms.length) {
      if (areAllTermsInOtherTerms(placeATerms, placeBTerms)) {
        return placeB;
      }
    } else if (placeATerms.length > placeBTerms.length) {
      if (areAllTermsInOtherTerms(placeBTerms, placeATerms)) {
        return placeA;
      }
    }

    return undefined;
  }

  function mergeGenders(genderA, genderB) {
    //console.log("mergeGenders:");
    //console.log(genderA);
    //console.log(genderB);

    if (!genderA) {
      if (!genderB) {
        return "";
      } else {
        return genderB;
      }
    } else if (!genderB) {
      return genderA;
    }

    if (genderA == genderB) {
      return genderA;
    }

    return undefined;
  }

  function mergeAges(ageA, ageB) {
    //console.log("mergeAges:");
    //console.log(ageA);
    //console.log(ageB);

    let result = { rejected: false, value: "" };

    if (!ageA) {
      if (!ageB) {
        return result;
      } else {
        result.value = ageB;
        return result;
      }
    } else if (!ageB) {
      result.value = ageA;
      return result;
    }

    if (ageA == ageB) {
      result.value = ageA;
      return result;
    }

    // there are two ages and they are not identical
    // we could check for ages like "1 2/12" or "1 and 2 months" or "2 months" or "2 mo"
    // or "15" vs "15 years" vs "15 yrs"

    return { rejected: true, value: "" };
  }

  function mergeSimpleStrings(valueA, valueB) {
    //console.log("mergeSimpleStrings:");
    //console.log(valueA);
    //console.log(valueB);

    if (!valueA) {
      if (!valueB) {
        return "";
      } else {
        return valueB;
      }
    } else if (!valueB) {
      return valueA;
    }

    if (valueA == valueB) {
      return valueA;
    }

    return undefined;
  }

  function mergeParents(parentsA, parentsB) {
    //console.log("mergeParents:");
    //console.log(parentsA);
    //console.log(parentsB);

    let result = { rejected: false, value: undefined };

    if (!parentsA) {
      if (!parentsB) {
        return result;
      } else {
        result.value = parentsB;
        return result;
      }
    } else if (!parentsB) {
      result.value = parentsA;
      return result;
    }

    // this returns a merged name
    function checkParent(parentA, parentB) {
      if (!parentA) {
        if (!parentB) {
          return "";
        } else {
          return parentB;
        }
      } else if (!parentB) {
        return parentA;
      }

      return mergeNames(parentA.name, parentB.name);
    }

    // check father
    let fatherResult = checkParent(parentsA.father, parentsB.father);
    if (fatherResult === undefined) {
      result.rejected = true;
      return result;
    }

    // check mother
    let motherResult = checkParent(parentsA.mother, parentsB.mother);
    if (motherResult === undefined) {
      result.rejected = true;
      return result;
    }

    // there is no conflict, but one could have more info
    if (!fatherResult && !motherResult) {
      return result; // don't reject but no value
    }

    let newParents = {
      father: { name: fatherResult },
      mother: { name: motherResult },
    };

    result.value = newParents;

    return result;
  }

  function mergeSpouses(spousesA, spousesB, fact) {
    if (!spousesA || spousesA.length == 0) {
      return spousesB;
    } else if (!spousesB || spousesB.length == 0) {
      return spousesA;
    }

    if (spousesA.length != spousesB.length) {
      return "nomatch";
    }

    let mergedSpouses = [];

    for (let spouseIndex = 0; spouseIndex < spousesA.length; spouseIndex++) {
      let spouseA = spousesA[spouseIndex];
      let spouseB = spousesB[spouseIndex];

      let mergedName = mergeNames(spouseA.name, spouseB.name);
      if (!mergedName) {
        return "nomatch";
      }

      let mergedDate = mergeDateObjs(spouseA.marriageDate, spouseB.marriageDate);
      if (mergedDate == "nomatch") {
        return "nomatch";
      }

      let marriagePlaceA = spouseA.marriagePlace ? spouseA.marriagePlace.placeString : "";
      let marriagePlaceB = spouseB.marriagePlace ? spouseB.marriagePlace.placeString : "";
      let mergedPlace = mergePlaces(marriagePlaceA, marriagePlaceB);
      if (mergedPlace === undefined) {
        return "nomatch";
      }

      let mergedAge = mergeAges(spouseA.age, spouseB.age);
      if (mergedAge.rejected && fact.narrativeFieldsUsed.age) {
        return "nomatch";
      }

      let mergedSpouse = {};
      if (mergedName) {
        mergedSpouse.name = mergedName;
      }
      if (mergedDate) {
        mergedSpouse.marriageDate = mergedDate;
      }
      if (mergedPlace) {
        mergedSpouse.marriagePlace = mergedPlace;
      }
      if (mergedAge && mergedAge.value) {
        mergedSpouse.age = mergedAge.value;
      }

      mergedSpouses.push(mergedSpouse);
    }

    return mergedSpouses;
  }

  let merged = false;

  let gd = source.generalizedData;

  let recordType = gd.recordType;
  let role = gd.role;
  let eventDate = gd.inferEventDate();
  let eventPlace = gd.inferEventPlace();
  let nameObj = gd.name;
  let personGender = gd.personGender;
  let age = gd.age;
  let mothersMaidenName = gd.mothersMaidenName;
  let parents = gd.parents;
  let spouses = gd.spouses;
  let birthDateObj = gd.birthDate;
  let deathDateObj = gd.deathDate;
  let registrationDistrict = gd.registrationDistrict;
  let primaryPersonNameObj = gd.primaryPerson ? gd.primaryPerson.name : "";
  let primaryPersonGender = gd.inferPrimaryPersonGender();
  let primaryPersonBirthDate = gd.inferPrimaryPersonBirthDate();
  let primaryPersonDeathDate = gd.inferPrimaryPersonDeathDate();

  for (let priorFact of result.facts) {
    if (priorFact.generalizedData) {
      // attempt to merge

      let mergedGd = priorFact.generalizedData;

      if (recordType != mergedGd.recordType || role != mergedGd.role) {
        continue;
      }

      let mergedDate = mergeDates(mergedGd.inferEventDate(), eventDate);
      if (mergedDate == "nomatch") {
        continue;
      }

      let mergedName = mergeNames(mergedGd.name, nameObj);
      if (!mergedName) {
        continue;
      }

      let mergedPlace = mergePlaces(mergedGd.inferEventPlace(), eventPlace);
      if (mergedPlace === undefined) {
        continue;
      }

      let mergedGender = mergeGenders(mergedGd.personGender, personGender);
      if (mergedGender === undefined) {
        continue;
      }

      let mergedAge = mergeAges(mergedGd.age, age);
      if (mergedAge.rejected && priorFact.narrativeFieldsUsed.age) {
        continue;
      }

      let mergedParents = mergeParents(mergedGd.parents, parents);
      if (mergedAge.rejected && priorFact.narrativeFieldsUsed.parentage) {
        continue;
      }

      let mergedSpouses = mergeSpouses(mergedGd.spouses, spouses, priorFact);
      if (mergedSpouses == "nomatch") {
        continue;
      }

      let mergedPrimaryPersonName = "";
      let mergedPrimaryPersonGender = "";
      let mergedPrimaryPersonBirthDate = "";
      let mergedPrimaryPersonDeathDate = "";
      if (role && role != Role.Primary && mergedGd.primaryPerson) {
        // there should be another person - check they match
        mergedPrimaryPersonName = mergeNames(mergedGd.primaryPerson.name, primaryPersonNameObj);
        if (mergedPrimaryPersonName === undefined) {
          continue;
        }

        mergedPrimaryPersonGender = mergeGenders(mergedGd.inferPrimaryPersonGender(), primaryPersonGender);
        if (mergedPrimaryPersonGender === undefined) {
          continue;
        }

        mergedPrimaryPersonBirthDate = mergeDates(mergedGd.inferPrimaryPersonBirthDate(), primaryPersonBirthDate);
        if (mergedPrimaryPersonBirthDate == "nomatch") {
          continue;
        }

        mergedPrimaryPersonDeathDate = mergeDates(mergedGd.inferPrimaryPersonDeathDate(), primaryPersonDeathDate);
        if (mergedPrimaryPersonDeathDate == "nomatch") {
          continue;
        }
      }

      let mergedMmn = mergeSimpleStrings(mergedGd.mothersMaidenName, mothersMaidenName);
      if (mergedMmn === undefined && priorFact.narrativeFieldsUsed.mmn) {
        continue;
      }

      let mergedBirthDate = mergeDateObjs(mergedGd.birthDate, birthDateObj);
      if (mergedBirthDate == "nomatch") {
        continue;
      }

      let mergedDeathDate = mergeDateObjs(mergedGd.deathDate, deathDateObj);
      if (mergedDeathDate == "nomatch") {
        continue;
      }

      let mergedDistrict = mergeSimpleStrings(mergedGd.registrationDistrict, registrationDistrict);
      if (mergedDistrict === undefined) {
        continue;
      }

      //console.log("====== merge approved ======");

      // set merged properties
      mergedGd.setEventDate(mergedDate);
      mergedGd.name = mergedName;
      mergedGd.setEventPlace(mergedPlace);
      mergedGd.personGender = mergedGender;

      mergedGd.age = mergedAge.value;
      if (mergedParents.value) {
        mergedGd.parents = mergedParents.value;
      }
      if (mergedSpouses) {
        mergedGd.spouses = mergedSpouses;
      }
      mergedGd.mothersMaidenName = mergedMmn;
      mergedGd.setBirthDate(mergedBirthDate);
      mergedGd.setDeathDate(mergedDeathDate);
      mergedGd.registrationDistrict = mergedDistrict;

      mergedGd.createPrimaryPersonIfNeeded();
      mergedGd.primaryPerson.name = mergedPrimaryPersonName;
      mergedGd.setPrimaryPersonGender(mergedPrimaryPersonGender);
      mergedGd.setPrimaryPersonBirthDate(mergedPrimaryPersonBirthDate);
      mergedGd.setPrimaryPersonDeathDate(mergedPrimaryPersonDeathDate);

      priorFact.sources.push(source);
      merged = true;

      //console.log("merged sources: priorFact is: ");
      //console.log(priorFact);
      break;
    }
  }

  return merged;
}

function groupSourcesIntoFacts(result, type, options) {
  // we have an array of sources sorted by date, some, but not all, have generalized data
  // we want to group the ones that appear to be for the same fact together.
  // Let's make some simplifying assumptions.
  // 1. For sources that could not be fetched (so do not have a full date) they will never be grouped
  // 2. If type is narrative then grouped facts will all use the same narrative, this may imply
  //    merging narratives, which could be done by first merging generalized data and then
  //    generating a new complete citation or could be done by using buildNarrative
  //    directly.
  // 3. If type is "inline" then all we care about is whether the date and record type are the same.
  //    Maybe some record types are close enough - like marriage and marriageRegistration
  //    But not really because they produce a different narrative.
  // 4. For merging narratives we can say that certain gd fields have to be IDENTICAL
  //    date, full name, place
  //    Or we could allow supersets for all three
  //    e.g. 12 Jun 1960 and June 1960 and 1960 all match
  //         Jane Wilson and Jane Anne Wilson match
  //         Burlington, Chittenden, Vermont, United States and Vermont, United States match
  //

  result.facts = [];

  for (let source of result.sources) {
    if (source.generalizedData) {
      let wasMerged = attemptToMergeSourceIntoPriorFact(source, result, type);
      if (!wasMerged) {
        let newFact = { sources: [source] };
        newFact.generalizedData = source.generalizedData;
        // store what optional narrative fields are used for this record type and options
        if (type == "narrative") {
          newFact.narrativeFieldsUsed = getFieldsUsedInNarrative(newFact.generalizedData, options);
        } else {
          newFact.narrativeFieldsUsed = {};
        }
        result.facts.push(newFact);
      }
    } else {
      let newFact = { sources: [source] };
      result.facts.push(newFact);
    }
  }

  //console.log("groupSourcesIntoFacts: facts:");
  //console.log(result.facts);
}

function buildNarrativeForPlainCitation(source, options) {
  let narrative = "";

  if (source.prefName) {
    narrative += source.prefName;
  } else {
    narrative += "This person";
  }
  narrative += " was in a record";
  if (source.eventDate) {
    // could get correct preposition here (see formatDateObj in narrative_builder)
    narrative += " in " + source.eventDate;
  } else if (source.sortYear) {
    narrative += " in " + source.sortYear;
  }
  narrative += ".";
  return narrative;
}

function getTextForPlainCitation(source, type, isSourcerStyle, options) {
  function cleanText(text) {
    if (text) {
      text = text.replace(/\<\/?i\>/gi, "''");

      if (type == "source") {
        text = text.replace(/ *\n */g, "<br/>");
        text = text.replace(/\s+/g, " ");
      } else {
        text = text.replace(/ *\n */g, "<br/>\n");
      }

      text = text.trim();

      text = text.replace(/,$/g, "");

      text = text.trim();
    } else {
      text = "";
    }
    return text;
  }

  function cleanNotes(text) {
    if (text) {
      text = cleanText(text);

      // crap that sometimes gets pasted in
      text = text.replace(/[,\s\n]+save\s+cancel/gi, "");
      text = text.replace(/\s+View\sblank\sform,?/gi, "");
      text = text.replace(/\s+Add\salternate\sinformation,?/gi, "");
      text = text.replace(/\s+Report\s+issue,?/gi, "");
      text = text.replace(/SAVE\s+PRINT\s+SHARE[,.\s]/gi, "");
      text = text.replace(/[\s\n]+VIEW[ ,]/gi, "");

      text = text.replace(/ +/g, " ");
      text = text.trim();
    } else {
      text = "";
    }

    return text;
  }

  let citationText = cleanText(source.citation);

  if (!citationText) {
    citationText = cleanText(source.title);
  }
  if (!citationText) {
    citationText = cleanText(source.notes);
  }

  function addSeparationWithinBody(nonNewlineSeparator) {
    if (citationText) {
      let addedSeparation = false;
      if (isSourcerStyle) {
        if (options.citation_general_addBreaksWithinBody) {
          citationText += "<br/>";
          addedSeparation = true;
        }

        if (type != "source" && options.citation_general_addNewlinesWithinBody) {
          citationText += "\n";
          addedSeparation = true;
        }
      }

      if (!addedSeparation) {
        citationText += nonNewlineSeparator;
      }
    }
  }

  if (source.uri && !citationText.includes(source.uri)) {
    let tempUri = source.uri.replace(/^https?\:\/\/[^\/]+\//, "");
    if (!citationText.includes(tempUri)) {
      addSeparationWithinBody(" ");
      if (source.uriUpdatedDate) {
        citationText += "(" + source.uri + " : " + source.uriUpdatedDate + ")";
      } else {
        citationText += source.uri;
      }
    }
  }

  // Note, we currently put the source.citation before the source.title in this case
  // That works if the title is like a data string (which it sometimes is)
  // but it fails for https://www.familysearch.org/tree/person/sources/LHVG-L58
  // and the Ancestry source for: https://search.ancestry.com/collections/2243/records/1341552
  let fsRecordLinkIndex = citationText.search(/familysearch\.org\/ark\:\/\d+\/1\:1\:/);
  if (fsRecordLinkIndex == -1) {
    if (source.citation && source.title) {
      if (!citationText.includes(source.title)) {
        addSeparationWithinBody(", ");
        citationText += cleanText(source.title);
      }
    }
  }

  if (source.notes && options.addMerge_fsAllCitations_includeNotes) {
    // some notes are an automatic comment like "Source created by RecordSeek.com"
    // Not useful to include that.
    if (!source.notes.startsWith("Source created by ")) {
      addSeparationWithinBody(", ");
      citationText += " " + cleanNotes(source.notes);
    }
  }

  return citationText;
}

function buildRefForPlainCitation(source, isSourcerStyle, options) {
  let refString = "<ref>";
  if (options.citation_general_addNewlinesWithinRefs) {
    refString += "\n";
  }
  refString += getTextForPlainCitation(source, "inline", isSourcerStyle, options);
  if (options.citation_general_addNewlinesWithinRefs) {
    refString += "\n";
  }
  refString += "</ref>";
  return refString;
}

function generateSourcerCitationsStringForFacts(result, type, options) {
  // this is only ever used for narrative or inline
  let citationsString = "";
  let citationCount = 0;

  for (let fact of result.facts) {
    if (fact.generalizedData) {
      if (citationsString) {
        citationsString += "\n";
      }
      if (fact.sources.length > 1) {
        if (type == "narrative") {
          // need a combined narrative
          const narrativeInput = {
            eventGeneralizedData: fact.generalizedData,
            options: options,
          };
          let narrative = buildNarrative(narrativeInput);
          citationsString += narrative;
        }
        let longestTable = "";
        for (let source of fact.sources) {
          let citation = source.citationObject.citation;
          // strip off any existing narrative
          let refIndex = citation.indexOf("<ref>");
          if (refIndex != -1) {
            citation = citation.substring(refIndex);
          }
          // strip off any table after the narrative
          const endRef = "</ref>";
          let endRefIndex = citation.indexOf(endRef);
          if (endRefIndex != -1) {
            let startTableIndex = endRefIndex + endRef.length;
            if (startTableIndex < citation.length) {
              let table = citation.substring(startTableIndex);
              if (table.length > longestTable.length) {
                longestTable = table;
              }
              citation = citation.substring(0, startTableIndex);
            }
          }
          citationsString += citation;
        }
        if (longestTable) {
          citationsString += longestTable;
        }
      } else {
        for (let source of fact.sources) {
          citationsString += source.citationObject.citation;
        }
      }
      citationCount += fact.sources.length;
      citationsString += "\n";
    } else if (fact.sources.length == 1) {
      let source = fact.sources[0];

      if (citationsString) {
        citationsString += "\n";
      }

      if (type == "narrative") {
        citationsString += buildNarrativeForPlainCitation(source, options);
      }
      citationsString += buildRefForPlainCitation(source, true, options);

      citationsString += "\n";
      citationCount++;
    }
  }

  result.citationsString = citationsString;
  result.citationCount = citationCount;
}

async function getSourcerCitation(source, type, options, updateStatusFunction) {
  let uri = source.uri;

  let fetchResult = { success: false };

  if (uri) {
    fetchResult = await fetchRecord(uri);
    let retryCount = 0;
    while (!fetchResult.success && fetchResult.allowRetry && retryCount < 3) {
      retryCount++;
      updateStatusFunction("retry " + retryCount);
      fetchResult = await fetchRecord(uri);
    }
  }

  //console.log("getSourcerCitation, fetchResult is:");
  //console.log(fetchResult);

  if (fetchResult.success) {
    source.dataObjects = fetchResult.dataObjects;

    let extractedData = extractDataFromFetch(undefined, source.dataObjects, "record", options);
    if (extractedData && extractedData.pageType) {
      source.extractedData = extractedData;

      let generalizedData = generalizeData({ extractedData: extractedData });
      if (generalizedData && generalizedData.hasValidData) {
        source.generalizedData = generalizedData;

        let householdTableString = buildHouseholdTableString(extractedData, generalizedData, type, buildHouseholdTable);

        const input = {
          extractedData: extractedData,
          generalizedData: generalizedData,
          runDate: new Date(),
          type: type,
          dataCache: undefined,
          options: options,
          householdTableString: householdTableString,
        };
        const citationObject = buildCitation(input);
        citationObject.generalizedData = generalizedData;
        source.citationObject = citationObject;
      }
    }
  }

  if (!source.citationObject) {
    // we don't have an FS fetch object, or it wasn't a record object we could process,
    // see what we can do by parsing FS citation string

    //console.log("getSourcerCitation: could not fetch, source is:");
    //console.log(source);

    if (/^"[^"]+"\s+\d\d\d\d http/.test(source.citation)) {
      let year = source.citation.replace(/^"[^"]+"\s+(\d\d\d\d) http.*$/, "$1");
      if (year && year != source.citation) {
        source.sortYear = year;
      }
      let firstSentence = source.citation.replace(/^"([^"]+)"\s+\d\d\d\d http.*$/, "$1");
      if (firstSentence && firstSentence != source.citation) {
        source.firstSentence = firstSentence;
      }
      let link = source.citation.replace(/^"[^"]+"\s+\d\d\d\d (http.*)\. Accessed.*$/, "$1");
      if (link && link != source.citation) {
        source.link = link;
      }

      let title = source.title;
      if (!title) {
        title = source.firstSentence;
      }
      if (title) {
        let joinIndex = title.search(/\s+in\s+the\s+/);
        if (joinIndex != -1) {
          source.prefName = title.substring(0, joinIndex);
        }
      }
    }
  }
}

function generateSourcerCitationsStringForTypeSource(result, options) {
  let citationsString = "";

  for (let source of result.sources) {
    if (source.citationObject) {
      citationsString += source.citationObject.citation;
      citationsString += "\n";
    } else {
      citationsString += "* " + getTextForPlainCitation(source, "source", true, options);
      citationsString += "\n";
    }
  }

  result.citationsString = citationsString;
  result.citationCount = result.sources.length;
}

function generateSourcerCitationsStringForTypeInline(result, options) {
  let citationsString = "";

  for (let source of result.sources) {
    if (source.citationObject) {
      if (citationsString) {
        citationsString += "\n";
      }
      citationsString += source.citationObject.citation;
      citationsString += "\n";
    } else {
      if (citationsString) {
        citationsString += "\n";
      }

      citationsString += buildRefForPlainCitation(source, true, options);
      citationsString += "\n";
    }
  }

  result.citationsString = citationsString;
  result.citationCount = result.sources.length;
}

function generateSourcerCitationsStringForTypeNarrative(result, options) {
  let citationsString = "";

  for (let source of result.sources) {
    if (source.citationObject) {
      if (citationsString) {
        citationsString += "\n";
      }
      citationsString += source.citationObject.citation;
      citationsString += "\n";
    } else {
      if (citationsString) {
        citationsString += "\n";
      }

      citationsString += buildNarrativeForPlainCitation(source, options);
      citationsString += buildRefForPlainCitation(source, true, options);
      citationsString += "\n";
    }
  }

  result.citationsString = citationsString;
  result.citationCount = result.sources.length;
}

async function getSourcerCitations(result, ed, gd, type, options) {
  if (result.sources.length == 0) {
    result.citationsString = "";
    result.citationsStringType = type;
    return;
  }

  let requests = [];
  for (let source of result.sources) {
    let request = {
      name: source.id,
      input: source,
    };
    requests.push(request);
  }

  async function requestFunction(input, updateStatusFunction) {
    updateStatusFunction("fetching...");
    let newResponse = { success: true };
    await getSourcerCitation(input, type, options, updateStatusFunction);
    return newResponse;
  }

  let requestsResult = await doRequestsInParallel(requests, requestFunction);

  result.failureCount = requestsResult.failureCount;

  if (options.addMerge_fsAllCitations_excludeOtherRoleSources) {
    let newSources = [];
    for (let source of result.sources) {
      if (source.citationObject) {
        const gd = source.generalizedData;
        if (gd && gd.role && gd.role != Role.Primary) {
          // exclude this one
        } else {
          newSources.push(source);
        }
      } else {
        newSources.push(source);
      }
    }
    result.sources = newSources;
  }

  sortSourcesUsingFsSortKeysAndFetchedRecords(result);

  if (type == "source") {
    generateSourcerCitationsStringForTypeSource(result, options);
  } else {
    let groupCitations = options.addMerge_fsAllCitations_groupCitations;

    if (groupCitations) {
      groupSourcesIntoFacts(result, type, options); // only needed for inlne and narrative
      sortFacts(result);
      generateSourcerCitationsStringForFacts(result, type, options);
    } else {
      if (type == "inline") {
        generateSourcerCitationsStringForTypeInline(result, options);
      } else {
        // must be narrative
        generateSourcerCitationsStringForTypeNarrative(result, options);
      }
    }
  }

  result.citationsStringType = type;
}

async function fsGetAllCitations(input, callbackFunction) {
  let ed = input.extractedData;
  let gd = input.generalizedData;
  let options = input.options;

  let sourcesObj = await fetchFsSourcesJson(ed.sourceIds);
  let retryCount = 0;
  while (retryCount < 3 && !sourcesObj.success && sourcesObj.allowRetry) {
    retryCount++;
    displayMessage("Getting sources, retry " + retryCount + " ...");
    sourcesObj = await fetchFsSourcesJson(ed.sourceIds);
  }

  let result = { success: false };

  if (sourcesObj.success) {
    let sources = sourcesObj.dataObj.sources;

    result.sources = [];

    for (let source of sources) {
      //console.log("FS source is:");
      //console.log(source);

      let sourceObj = {};

      function addField(fieldName) {
        if (source[fieldName]) {
          sourceObj[fieldName] = source[fieldName];
        }
      }
      addField("citation");
      addField("title");
      addField("id");
      addField("notes");

      if (source.uri && source.uri.uri) {
        sourceObj.uri = source.uri.uri;

        if (source.uriUpdatedOn) {
          let date = new Date(source.uriUpdatedOn);
          const options = { day: "numeric", month: "long", year: "numeric" };
          sourceObj.uriUpdatedDate = date.toLocaleDateString("en-GB", options);
        }
      }

      if (options.addMerge_fsAllCitations_excludeNonFsSources) {
        // could check whether uri is of right form instead
        if (source.sourceType != "FSREADONLY") {
          continue;
        }
        if (!sourceObj.uri) {
          continue;
        }
        let validLinkIndex = sourceObj.uri.search(/familysearch\.org\/ark\:\/\d+\/1\:1\:/);
        if (validLinkIndex == -1) {
          continue;
        }
      }

      // ignore some useless sources
      if (source.citation == "Ancestry Family Tree" && source.title == "Ancestry Family Trees" && !source.notes) {
        continue;
      }

      if (source.event) {
        if (source.event.sortKey) {
          sourceObj.sortKey = source.event.sortKey;
        }
        if (source.event.sortYear) {
          sourceObj.sortYear = source.event.sortYear;
        }
        if (source.event.displayDate) {
          sourceObj.eventDate = source.event.displayDate;
        }
      }

      if (!sourceObj.eventDate && !sourceObj.sortYear) {
        const inferredEventDate = inferEventDate(source);
        if (inferredEventDate) {
          sourceObj.eventDate = inferredEventDate;
        }
      }

      result.sources.push(sourceObj);
    }

    let citationType = options.addMerge_fsAllCitations_citationType;

    switch (citationType) {
      case "fsPlainInline":
        getFsPlainCitations(result, ed, "inline", options);
        break;
      case "fsPlainSource":
        getFsPlainCitations(result, ed, "source", options);
        break;
      case "narrative":
      case "inline":
      case "source":
        await getSourcerCitations(result, ed, gd, citationType, options);
        break;
    }

    result.success = true;
  }

  return result;
}

export { fsGetAllCitations };
