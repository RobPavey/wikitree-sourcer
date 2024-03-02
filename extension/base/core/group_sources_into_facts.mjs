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

import { CD } from "./country_data.mjs";
import { RT, RecordSubtype, Role } from "./record_type.mjs";
import { DateUtils } from "./date_utils.mjs";

import { NameObj, DateObj, PlaceObj } from "./generalize_data_utils.mjs";
import { getFieldsUsedInNarrative } from "./narrative_builder.mjs";

function canMergeDifferentTypes(recordTypeA, recordTypeB, subTypeA, subTypeB, options) {
  if (recordTypeA == RT.Marriage || recordTypeA == RT.MarriageRegistration) {
    if (!(recordTypeB == RT.Marriage || recordTypeB == RT.MarriageRegistration)) {
      return false;
    }

    // they are both Marriage or MarriageRegistration
    // Don't worry about dates at this point - just say if options allow these types to be merged
    return options.buildAll_general_mergeMarriages;
  }

  return false;
}

function attemptToMergeSourceIntoPriorFact(source, result, type, options) {
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

    let parsedDateA = DateUtils.parseDateString(dateA);
    let parsedDateB = DateUtils.parseDateString(dateB);

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

  function mergeDateObjs(dateObjA, dateObjB, recordTypeA, recordTypeB, recordSubtypeA, recordSubtypeB) {
    //console.log("mergeDateObjs:");
    //console.log(dateObjA);
    //console.log(dateObjB);

    if (!dateObjA) {
      if (!dateObjB) {
        return "";
      } else {
        return dateObjB;
      }
    } else if (!dateObjB) {
      return dateObjA;
    }

    if (dateObjA.qualifier != dateObjB.qualifier) {
      // might be able to merge these
      return "nomatch";
    }

    // If either of the date are for a particular quarter then it require a different comparison
    // which can also take into accoun the record types.
    if (dateObjA.quarter || dateObjB.quarter) {
      // one of them is a quarter date - could be a registration
      if (dateObjA.quarter && dateObjB.quarter) {
        // they are both quarter dates check if thay match
        if (dateObjA.quarter == dateObjB.quarter && dateObjA.getYearString() == dateObjB.getYearString()) {
          return dateObjA;
        }
      } else {
        // only one is a quarter date
        // A birth had to be registered with the register office within 42 days.
        // The law required all marriages to be recorded in a civil register immediately after the ceremony.
        // Because a death certificate was required for burial beginning in 1837,
        // almost all deaths were registered.
        // https://www.familysearch.org/en/wiki/England_Marriage_Records#:~:text=Civil%20Registration%20%2D%20After%201837,-Coverage%20and%20Compliance&text=By%201875%2C%20registration%20was%20mandatory,register%20immediately%20after%20the%20ceremony.

        function checkQuarterData(quarterDateObj, otherDateObj, quarterRecordType, otherRecordType) {
          let quarter = quarterDateObj.quarter;
          const endDays = ["31 Mar", "30 Jun", "30 Sep", "31 Dec"];
          let dayMonth = endDays[quarter - 1];
          let year = quarterDateObj.getYearString();
          let dateString = dayMonth + " " + year;
          let parsedQuarterDate = DateUtils.parseDateString(dateString);
          let parsedOtherDate = DateUtils.parseDateString(otherDateObj.getDateString());

          let daysBetween = DateUtils.getDaysBetweenParsedDates(parsedOtherDate, parsedQuarterDate);

          if (quarterRecordType == RT.MarriageRegistration || !quarterRecordType) {
            if (otherRecordType == RT.Marriage || !otherRecordType) {
              const longestQuarterInDays = 92;
              const oneWeekLeeway = 7;
              const maxDays = longestQuarterInDays + oneWeekLeeway;
              if (daysBetween >= 0 && daysBetween <= maxDays) {
                return otherDateObj;
              }
            }
          }
          return "nomatch";
        }

        if (dateObjA.quarter) {
          return checkQuarterData(dateObjA, dateObjB, recordTypeA, recordTypeB);
        } else {
          return checkQuarterData(dateObjB, dateObjA, recordTypeB, recordTypeA);
        }
      }
    }

    let mergedDateString = mergeDates(dateObjA.getDateString(), dateObjB.getDateString());

    if (mergedDateString != "nomatch") {
      // we were able to merge them just based on the strings
      let mergedDateObj = new DateObj();
      mergedDateObj.dateString = mergedDateString;
      return mergedDateObj;
    }

    // they don't match exactly for some record types (like marriage and marriage banns)
    // that is OK.
    let parsedDateA = DateUtils.parseDateString(dateObjA.getDateString());
    let parsedDateB = DateUtils.parseDateString(dateObjB.getDateString());

    let daysBetween = DateUtils.getDaysBetweenParsedDates(parsedDateA, parsedDateB);

    if (recordTypeA && recordTypeB) {
      if (recordTypeA == RT.Marriage && recordTypeB == RT.Marriage) {
        if (recordSubtypeA == RecordSubtype.Banns || recordSubtypeA == RecordSubtype.MarriageOrBanns) {
          if (recordSubtypeB == RecordSubtype.Banns || recordSubtypeB == RecordSubtype.MarriageOrBanns) {
            // if they are within a month in either direction allow them and return later date
            if (Math.abs(daysBetween) <= 31) {
              if (daysBetween < 0) {
                // b is earlier
                return dateObjA;
              } else {
                return dateObjB;
              }
            }
          } else {
            // if A is a month or less before B allow it
            if (daysBetween > 0 && daysBetween <= 31) {
              return dateObjB;
            }
          }
        } else if (recordSubtypeB == RecordSubtype.Banns || recordSubtypeB == RecordSubtype.MarriageOrBanns) {
          // if B is a month or less before A allow it
          if (daysBetween < 0 && daysBetween >= -31) {
            return dateObjA;
          }
        } else {
          // neither has a subtype
          // However, sometimes a banns record is recorded as a marriage, should we allow for that?
          // For now we do not.
        }
      }
    }

    return "nomatch";
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

    if (!fullNameA || !fullNameB) {
      if (!fullNameA && !fullNameB) {
        return NameObj.createFromPlainObject(nameObjA);
      }
      return undefined;
    }

    if (fullNameA == fullNameB) {
      return NameObj.createFromPlainObject(nameObjA);
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
          return NameObj.createFromPlainObject(nameObjB);
        } else {
          return undefined;
        }
      }
    } else if (nameBSpaceIndex == -1) {
      // nameB is single name
      if (doesFullNameMatchSingleName(fullNameA, fullNameB)) {
        return NameObj.createFromPlainObject(nameObjA);
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
            return NameObj.createFromPlainObject(nameObjA);
          }
        } else {
          return NameObj.createFromPlainObject(nameObjA);
        }
      } else {
        return NameObj.createFromPlainObject(nameObjB);
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
            let name = new NameObj();
            name.name = mergedFirstName + " " + nameARemainder + " " + mergedLastName;
            name.firstName = mergedFirstName;
            name.middleNames = nameARemainder;
            name.lastName = mergedLastName;
            return name;
          }
        } else {
          let name = new NameObj();
          name.name = mergedFirstName + " " + nameARemainder + " " + mergedLastName;
          name.firstName = mergedFirstName;
          name.middleNames = nameARemainder;
          name.lastName = mergedLastName;
          return name;
        }
      } else if (nameBRemainder) {
        let name = new NameObj();
        name.name = mergedFirstName + " " + nameBRemainder + " " + mergedLastName;
        name.firstName = mergedFirstName;
        name.middleNames = nameBRemainder;
        name.lastName = mergedLastName;
        return name;
      } else {
        let name = new NameObj();
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
          let cleanTermB = termsB[termBIndex].trim().toLowerCase();
          if (cleanTermA == cleanTermB) {
            termBStartIndex = termBIndex + 1;
            foundTermA = true;
            break;
          }
          // We would also like these to match:
          // Wimbledon, Surrey, England.
          // Holy Trinity and St Peter, South Wimbledon, Holy Trinity and St Peter, Surrey, England.
          if (cleanTermB.startsWith(cleanTermA) || cleanTermB.endsWith(cleanTermA)) {
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

  function specialCaseMergeEventPlaces(gdA, gdB) {
    // certain record types can have a registration district
    // it can be hard to match a district with a place name so we are forgiving
    if (gdA.registrationDistrict) {
      if (gdB.registrationDistrict) {
        if (gdA.registrationDistrict == gdB.registrationDistrict) {
          return gdA.inferEventPlace();
        } else {
          return undefined;
        }
      } else {
        return gdB.inferEventPlace();
      }
    } else if (gdB.registrationDistrict) {
      return gdA.inferEventPlace();
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

  function mergeRecordSubTypes(mergedGd, recordType, recordSubtype) {
    //console.log("mergeRecordSubTypes:");
    //console.log(mergedGd);
    //console.log(recordType);
    //console.log(recordSubtype);

    if (!mergedGd.recordSubtype && !recordSubtype) {
      // neither has a subtype - nothing to do
      return undefined;
    }

    if (mergedGd.recordSubtype == recordSubtype) {
      return recordSubtype;
    }

    // There are certain cases, like marriages, where there are special cases
    if (mergedGd.recordType == RT.Marriage && recordType == RT.Marriage) {
      // If one has no subtype, then get rid of subtype
      if (!mergedGd.recordSubtype || !recordSubtype) {
        return undefined;
      }

      // so, they both have subtypes and they are different, currently that must mean that
      // they are Banns and MarriageOrBanns so, in that case we would return MarriageOrBanns
      return RecordSubtype.MarriageOrBanns;
    }

    // if both have a record subtype at this point they must be different.
    // Safest thing is not to merge them
    if (mergedGd.recordSubtype && recordSubtype) {
      return "nomatch";
    }

    // so only one has a subtype, return the subtype
    if (mergedGd.recordSubtype) {
      return mergedGd.recordSubtype;
    }
    if (recordSubtype) {
      return recordSubtype;
    }
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
          return parentB.name;
        }
      } else if (!parentB) {
        return parentA.name;
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
        // if one record has an unnamed spouse then still match
        // this is common for UK marriage registrations for example
        if (!spouseA.name || !spouseA.name.name) {
          mergedName = spouseB.name;
        } else if (!spouseB.name || !spouseB.name.name) {
          mergedName = spouseA.name;
        } else {
          return "nomatch";
        }
      }

      let mergedDateObj = mergeDateObjs(spouseA.marriageDate, spouseB.marriageDate);
      if (mergedDateObj == "nomatch") {
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
      if (mergedDateObj) {
        mergedSpouse.marriageDate = mergedDateObj;
      }
      if (mergedPlace) {
        let mergedPlaceObj = new PlaceObj();
        mergedPlaceObj.placeString = mergedPlace;
        mergedSpouse.marriagePlace = mergedPlaceObj;
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
  let recordSubtype = gd.recordSubtype;
  let role = gd.role;
  let eventDateObj = gd.inferEventDateObj();
  let eventPlace = gd.inferEventPlace();
  let nameObj = gd.name;
  let personGender = gd.inferPersonGender();
  let age = gd.age;
  let mothersMaidenName = gd.mothersMaidenName;
  let parents = gd.parents;
  let spouses = gd.spouses;
  let birthDateObj = gd.birthDate;
  let deathDateObj = gd.deathDate;
  let registrationDistrict = gd.registrationDistrict;
  let primaryPersonNameObj = gd.primaryPerson ? gd.primaryPerson.name : "";
  let primaryPersonGender = gd.inferPrimaryPersonGender();
  let primaryPersonBirthDateObj = gd.inferPrimaryPersonBirthDateObj();
  let primaryPersonDeathDateObj = gd.inferPrimaryPersonDeathDateObj();

  for (let priorFact of result.facts) {
    if (priorFact.generalizedData) {
      // attempt to merge

      let mergedGd = priorFact.generalizedData;

      if (role != mergedGd.role) {
        continue;
      }

      if (recordType != mergedGd.recordType) {
        // add tests here to merge records of different types
        if (!canMergeDifferentTypes(mergedGd.recordType, recordType, mergedGd.recordSubtype, recordSubtype, options)) {
          continue;
        }
      }

      let mergedDateObj = mergeDateObjs(
        mergedGd.inferEventDateObj(),
        eventDateObj,
        mergedGd.recordType,
        recordType,
        mergedGd.recordSubtype,
        recordSubtype
      );
      if (mergedDateObj == "nomatch") {
        continue;
      }

      let mergedName = mergeNames(mergedGd.name, nameObj);
      if (!mergedName) {
        continue;
      }

      let mergedPlace = mergePlaces(mergedGd.inferEventPlace(), eventPlace);
      if (mergedPlace === undefined) {
        mergedPlace = specialCaseMergeEventPlaces(mergedGd, gd);
        if (mergedPlace === undefined) {
          continue;
        }
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
      let mergedPrimaryPersonBirthDateObj = undefined;
      let mergedPrimaryPersonDeathDateObj = undefined;
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

        mergedPrimaryPersonBirthDateObj = mergeDateObjs(
          mergedGd.inferPrimaryPersonBirthDateObj(),
          primaryPersonBirthDateObj
        );
        if (mergedPrimaryPersonBirthDateObj == "nomatch") {
          continue;
        }

        mergedPrimaryPersonDeathDateObj = mergeDateObjs(
          mergedGd.inferPrimaryPersonDeathDateObj(),
          primaryPersonDeathDateObj
        );
        if (mergedPrimaryPersonDeathDateObj == "nomatch") {
          continue;
        }
      }

      let mergedMmn = mergeSimpleStrings(mergedGd.mothersMaidenName, mothersMaidenName);
      if (mergedMmn === undefined && priorFact.narrativeFieldsUsed.mmn) {
        continue;
      }

      let mergedBirthDateObj = mergeDateObjs(mergedGd.birthDate, birthDateObj);
      if (mergedBirthDateObj == "nomatch") {
        continue;
      }

      let mergedDeathDateObj = mergeDateObjs(mergedGd.deathDate, deathDateObj);
      if (mergedDeathDateObj == "nomatch") {
        continue;
      }

      let mergedDistrict = mergeSimpleStrings(mergedGd.registrationDistrict, registrationDistrict);
      if (mergedDistrict === undefined) {
        continue;
      }

      let mergedRecordSubtype = mergeRecordSubTypes(mergedGd, recordType, recordSubtype);
      if (mergedRecordSubtype == "nomatch") {
        continue;
      }

      //console.log("====== merge approved ======");

      // set merged properties
      mergedGd.eventDate = mergedDateObj;
      mergedGd.name = mergedName;
      mergedGd.setEventPlace(mergedPlace);
      mergedGd.personGender = mergedGender;
      mergedGd.recordSubtype = mergedRecordSubtype;

      mergedGd.age = mergedAge.value;
      if (mergedParents.value) {
        mergedGd.parents = mergedParents.value;
      }
      if (mergedSpouses) {
        mergedGd.spouses = mergedSpouses;
      }
      mergedGd.mothersMaidenName = mergedMmn;
      mergedGd.birthDate = mergedBirthDateObj;
      mergedGd.deathDate = mergedDeathDateObj;
      mergedGd.registrationDistrict = mergedDistrict;

      mergedGd.createPrimaryPersonIfNeeded();
      mergedGd.primaryPerson.name = mergedPrimaryPersonName;
      mergedGd.setPrimaryPersonGender(mergedPrimaryPersonGender);
      mergedGd.primaryPerson.birthDate = mergedPrimaryPersonBirthDateObj;
      mergedGd.primaryPerson.deathDate = mergedPrimaryPersonDeathDateObj;

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
      let wasMerged = attemptToMergeSourceIntoPriorFact(source, result, type, options);
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

export { groupSourcesIntoFacts };
