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

import { extractDataFromFetch } from "../core/fs_extract_data.mjs";
import { generalizeData } from "../core/fs_generalize_data.mjs";
import { CD } from "../../../base/core/country_data.mjs";
import { buildCitation } from "../core/fs_build_citation.mjs";
import { buildHouseholdTable } from "../../../base/core/table_builder.mjs";
import { WTS_Date } from "../../../base/core/wts_date.mjs";
import { buildHouseholdTableString } from "/base/browser/popup/popup_citation.mjs";

import { WtsName } from "../../../base/core/generalize_data_utils.mjs";
import { buildNarrative, getFieldsUsedInNarrative } from "../../../base/core/narrative_builder.mjs";

import { doRequestsInParallel } from "/base/browser/popup/popup_parallel_requests.mjs";

import { fetchFsSourcesJson, fetchRecord } from "./fs_fetch.mjs";

function getFsPlainCitations(result, ed, type, options) {
  sortSourcesUsingFsSortKeysAndFetchedRecords(result);

  let citationsString = "";

  for (let source of result.sources) {
    if (type == "inline") {
      if (source.citation) {
        if (citationsString) {
          citationsString += "\n";
        }
        citationsString += buildRefForPlainCitation(source, options);
        citationsString += "\n";
      }
    } else {
      if (source.citation) {
        citationsString += "* ";
        citationsString += getTextForPlainCitation(source, "source", options);
        citationsString += "\n";
      }
    }
  }

  result.citationsString = citationsString;
  result.citationsStringType = type;
}

function sortSourcesUsingFsSortKeysAndFetchedRecords(result) {
  function compareFunction(a, b) {
    let eventDateA = "";
    if (a.generalizedData) {
      eventDateA = a.generalizedData.inferEventDate();
    }
    let eventDateB = "";
    if (b.generalizedData) {
      eventDateB = b.generalizedData.inferEventDate();
    }

    if (!eventDateA) {
      eventDateA = a.eventDate;
    }
    if (!eventDateB) {
      eventDateB = b.eventDate;
    }

    if (!eventDateA) {
      eventDateA = a.sortYear;
    }
    if (!eventDateB) {
      eventDateB = b.sortYear;
    }

    if (eventDateA && eventDateB) {
      return WTS_Date.compareDateStrings(eventDateA, eventDateB);
    }

    // if one has a date and the other doesn't then the one with the date comes first
    if (eventDateA) {
      return -1;
    } else if (eventDateB) {
      return 1;
    }

    if (a.sortKey && b.sortKey) {
      if (a.sortKey < b.sortKey) {
        return -1;
      } else if (a.sortKey > b.sortKey) {
        return 1;
      }
      return 0;
    }

    if (a.sortKey) {
      return -1;
    } else if (b.sortKey) {
      return 1;
    }

    return 0;
  }

  // sort the sources
  result.sources.sort(compareFunction);
  //console.log("sortSourcesUsingFsSortKeysAndFetchedRecords: sorted sources:");
  //console.log(result.sources);
}

function attemptToMergeSourceIntoPriorFact(source, result, type) {
  console.log("attemptToMergeSourceIntoPriorFact");

  function mergeDates(dateA, dateB) {
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

    return undefined;
  }

  function mergeNames(nameObjA, nameObjB) {
    if (!nameObjA || !nameObjB) {
      return undefined;
    }

    let fullNameA = nameObjA.inferFullName();
    let fullNameB = nameObjB.inferFullName();

    if (fullNameA == fullNameB) {
      return WtsName.createFromPlainObject(nameObjA);
    }

    let firstNamesMatch = nameObjA.inferFirstName() == nameObjB.inferFirstName();
    let lastNamesMatch = nameObjA.inferLastName() == nameObjB.inferLastName;

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
      let lastNameLength = nameObjA.inferLastName().length;
      nameARemainder = nameARemainder.substring(0, nameARemainder.length - lastNameLength);
      nameBRemainder = nameBRemainder.substring(0, nameBRemainder.length - lastNameLength);
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
      // this could be enhanced to handle altername first names
      let firstName = nameObjA.inferFirstName();

      nameARemainder = nameARemainder.substring(firstName.length);
      nameBRemainder = nameBRemainder.substring(firstName.length);

      mergedFirstName = firstName;
    }

    if (firstNamesMatch && lastNamesMatch) {
      nameARemainder = nameARemainder.trim();
      nameBRemainder = nameBRemainder.trim();
      if (nameARemainder) {
        if (nameBRemainder) {
          if (nameARemainder == nameBRemainder) {
            let name = new WtsName();
            name.name = mergedFirstName + " " + nameARemainder + " " + mergedLastName;
            return name;
          }
        } else {
          let name = new WtsName();
          name.name = mergedFirstName + " " + nameARemainder + " " + mergedLastName;
          return name;
        }
      } else if (nameBRemainder) {
        let name = new WtsName();
        name.name = mergedFirstName + " " + nameBRemainder + " " + mergedLastName;
        return name;
      } else {
        let name = new WtsName();
        name.name = mergedFirstName + " " + mergedLastName;
        return name;
      }
    }

    return undefined;
  }

  function mergePlaces(placeA, placeB) {
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
    let motherResult = checkParent(parentsA.father, parentsB.father);
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
  let birthDate = gd.inferBirthDate();
  let registrationDistrict = gd.registrationDistrict;

  for (let priorFact of result.facts) {
    if (priorFact.generalizedData) {
      // attempt to merge

      let mergedGd = priorFact.generalizedData;

      if (recordType != mergedGd.recordType || role != mergedGd.role) {
        continue;
      }

      let mergedDate = mergeDates(mergedGd.inferEventDate(), eventDate);
      if (!mergedDate) {
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
      if (mergedAge.rejected && fact.narrativeFieldsUsed.age) {
        continue;
      }

      let mergedParents = mergeParents(mergedGd.parents, parents);
      if (mergedAge.rejected && fact.narrativeFieldsUsed.parentage) {
        continue;
      }

      let mergedMmn = mergeSimpleStrings(mergedGd.mothersMaidenName, mothersMaidenName);
      if (mergedMmn === undefined && fact.narrativeFieldsUsed.mmn) {
        continue;
      }

      let mergedBirthDate = mergeDates(mergedGd.inferBirthDate(), birthDate);
      if (!mergedBirthDate) {
        continue;
      }

      let mergedDistrict = mergeSimpleStrings(mergedGd.registrationDistrict, registrationDistrict);
      if (mergedDistrict === undefined) {
        continue;
      }

      // set merged properties
      mergedGd.setEventDate(mergedDate);
      mergedGd.name = mergedName;
      mergedGd.setEventPlace(mergedPlace);
      mergedGd.personGender = mergedGender;

      mergedGd.age = mergedAge.value;
      if (mergedParents.value) {
        mergedGd.parents = mergedParents.value;
      }
      mergedGd.mothersMaidenName = mergedMmn;
      mergedGd.setBirthDate(mergedBirthDate);
      mergedGd.registrationDistrict = mergedDistrict;

      priorFact.sources.push(source);
      merged = true;

      console.log("merged sources: priorFact is: ");
      console.log(priorFact);
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

function getTextForPlainCitation(source, type, options) {
  let citationText = source.citation.trim();

  if (source.uri && !citationText.includes(source.uri)) {
    citationText += " " + source.uri;
  }

  if (!citationText.includes("familysearch.org")) {
    if (source.title) {
      if (!citationText.includes(source.title)) {
        citationText += " " + source.title;
      }
    }
    if (source.notes) {
      // some notes are an automatis comment like "Source created by RecordSeek.com"
      // Not useful to include that.
      if (!source.notes.startsWith("Source created by ")) {
        citationText += " " + source.notes;
      }
    }
  }

  return citationText;
}

function buildRefForPlainCitation(source, options) {
  let refString = "<ref>";
  if (options.citation_general_addNewlinesWithinRefs) {
    refString += "\n";
  }
  refString += getTextForPlainCitation(source, "inline", options);
  if (options.citation_general_addNewlinesWithinRefs) {
    refString += "\n";
  }
  refString += "</ref>";
  return refString;
}

function generateSourcerCitationsStringForFacts(result, type, options) {
  // this is only ever used for narrative or inline
  let citationsString = "";

  for (let fact of result.facts) {
    if (fact.generalizedData) {
      if (citationsString) {
        citationsString += "\n";
      }
      if (type == "narrative" && fact.sources.length > 1) {
        // need a combined narrative
        const narrativeInput = {
          eventGeneralizedData: fact.generalizedData,
          options: options,
        };
        let narrative = buildNarrative(narrativeInput);
        citationsString += narrative;
        let longestTable = "";
        for (let source of fact.sources) {
          let citation = source.citationObject.citation;
          // strip off existing narrative
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
      citationsString += "\n";
    } else if (fact.sources.length == 1) {
      let source = fact.sources[0];
      if (source.citation) {
        if (citationsString) {
          citationsString += "\n";
        }

        if (type == "narrative") {
          citationsString += buildNarrativeForPlainCitation(source, options);
        }
        citationsString += buildRefForPlainCitation(source, options);

        citationsString += "\n";
      }
    }
  }

  result.citationsString = citationsString;
}

async function getSourcerCitation(source, type, options, updateStatusFunction) {
  let uri = source.uri;

  let fetchResult = await fetchRecord(uri);
  let retryCount = 0;
  while (!fetchResult.success && fetchResult.allowRetry && retryCount < 3) {
    retryCount++;
    updateStatusFunction("retry " + retryCount);
    fetchResult = await fetchRecord(uri);
  }

  if (fetchResult.success) {
    source.dataObjects = fetchResult.dataObjects;

    let extractedData = extractDataFromFetch(undefined, source.dataObjects, "record", options);
    if (extractedData) {
      source.extractedData = extractedData;

      let generalizedData = generalizeData({ extractedData: extractedData });
      if (generalizedData) {
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
  } else {
    // we don't have an FS fetch object, see what we can do by parsing FS citation string

    console.log("getSourcerCitation: could not fetch, source is:");
    console.log(source);

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
    } else if (source.citation) {
      citationsString += "* " + source.citation.trim();
      citationsString += "\n";
    }
  }

  result.citationsString = citationsString;
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
    } else if (source.citation) {
      if (citationsString) {
        citationsString += "\n";
      }

      citationsString += buildRefForPlainCitation(source, options);
      citationsString += "\n";
    }
  }

  result.citationsString = citationsString;
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
    } else if (source.citation) {
      if (citationsString) {
        citationsString += "\n";
      }

      citationsString += buildNarrativeForPlainCitation(source, options);
      citationsString += buildRefForPlainCitation(source, options);
      citationsString += "\n";
    }
  }

  result.citationsString = citationsString;
}

async function getSourcerCitations(result, ed, gd, type, options) {
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

  sortSourcesUsingFsSortKeysAndFetchedRecords(result);

  if (type == "source") {
    generateSourcerCitationsStringForTypeSource(result, options);
  } else {
    let groupCitations = options.addMerge_fsAllCitations_groupCitations;

    if (groupCitations) {
      groupSourcesIntoFacts(result, type, options); // only needed for inlne and narrative
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

  let result = { success: false };

  if (sourcesObj.success) {
    let sources = sourcesObj.dataObj.sources;

    result.sources = [];

    for (let source of sources) {
      console.log("FS source is:");
      console.log(source);

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
