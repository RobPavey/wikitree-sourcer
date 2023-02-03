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

import { updateDataCacheWithWikiTreeExtract } from "/base/browser/common/data_cache.mjs";
import {
  beginMainMenu,
  endMainMenu,
  addMenuItem,
  addMenuItemWithSubtitle,
  addItalicMessageMenuItem,
  addBackMenuItem,
  addMenuDivider,
  addBreak,
  displayMessage,
  displayMessageWithIcon,
  displayMessageWithIconThenClosePopup,
  closePopup,
} from "/base/browser/popup/popup_menu_building.mjs";

import { addStandardMenuEnd, buildMinimalMenuWithMessage } from "/base/browser/popup/popup_menu_blocks.mjs";

import { getLatestCitation } from "/base/browser/popup/popup_citation.mjs";

import { addSearchMenus } from "/base/browser/popup/popup_search.mjs";
import { initPopup } from "/base/browser/popup/popup_init.mjs";
import { getLatestPersonData } from "/base/browser/popup/popup_person_data.mjs";

import { generalizeData } from "../core/wikitree_generalize_data.mjs";

import { GeneralizedData, dateQualifiers } from "/base/core/generalize_data_utils.mjs";

import { options } from "/base/browser/options/options_loader.mjs";
import { CD } from "../../../base/core/country_data.mjs";
import { WTS_String } from "../../../base/core/wts_string.mjs";
import { WTS_Date } from "../../../base/core/wts_date.mjs";

function convertTimestampDiffToText(timeStamp) {
  if (!timeStamp) {
    return "";
  }

  let now = Date.now();
  let diffInMs = now - timeStamp;
  let diffInSecs = Math.floor(diffInMs / 1000);
  let timeText = "";
  if (diffInSecs < 60) {
    timeText += diffInSecs + " second";
    if (diffInSecs > 1) {
      timeText += "s";
    }
  } else {
    let diffInMins = Math.floor(diffInSecs / 60);
    if (diffInMins < 60) {
      timeText += diffInMins + " minute";
      if (diffInMins > 1) {
        timeText += "s";
      }
    } else {
      let diffInHours = Math.floor(diffInMins / 60);
      if (diffInHours < 24) {
        timeText += diffInHours + " hour";
        if (diffInHours > 1) {
          timeText += "s";
        }
      } else {
        return ""; // ignore saved data that is more than 24 hours old
      }
    }
  }

  return timeText;
}

function getWikiTreeAddMergeData(data, personEd, personGd, citationObject) {
  function qualifierToStatus(qualifier) {
    switch (qualifier) {
      case dateQualifiers.NONE:
        return "";
      case dateQualifiers.EXACT:
        return "certain";
      case dateQualifiers.ABOUT:
        return "guess";
      case dateQualifiers.BEFORE:
        return "before";
      case dateQualifiers.AFTER:
        return "after";
    }
    return "";
  }

  function standardizeDate(dateString) {
    let parsedDate = WTS_Date.parseDateString(dateString);
    if (!parsedDate.isValid) {
      return dateString;
    }
    return WTS_Date.getStdShortFormDateString(parsedDate);
  }

  function standardizePlace(placeString, dateString) {
    let countryExtract = CD.extractCountryFromPlaceName(placeString);
    if (!countryExtract) {
      return placeString;
    }

    let country = countryExtract.country;
    let remainder = countryExtract.remainder;
    let countryString = countryExtract.originalCountryString;

    if (!country) {
      return placeString;
    }

    let newPlaceString = placeString;
    let newCountryString = countryString;

    // standardize newCountry if desired
    if (country.stdName == "United States") {
      let usaOption = options.addMerge_general_standardizeCountryNameForUsa;
      if (usaOption == "none") {
        return placeString;
      }
      newCountryString = usaOption;
    } else if (options.addMerge_general_standardizeCountryNameForOther) {
      newCountryString = country.stdName;
      // special case of UK, may generalize this via CD if popular
      if (country.stdName == "England" || country.stdName == "Wales" || country.stdName == "Scotland") {
        let parsedDate = WTS_Date.parseDateString(dateString);
        if (parsedDate.isValid && parsedDate.yearNum >= 1801) {
          // if the input date had UK or something like it on end then add "United Kingdom"

          if (
            countryString.includes("United Kingdom") ||
            countryString.includes("UK") ||
            countryString.includes("U.K.")
          ) {
            newCountryString += ", United Kingdom";
          }
        }
      }
    }

    if (newCountryString != countryString) {
      newPlaceString = newCountryString;
      if (remainder) {
        newPlaceString = remainder + ", " + newCountryString;
      }
    }

    return newPlaceString;
  }

  //console.log("getWikiTreeAddMergeData, personGd is: ");
  //console.log(personGd);

  let result = {};

  let splitForenames = false;
  const splitForenamesOpt = options.addMerge_general_splitForenames;
  if (splitForenamesOpt == "always") {
    splitForenames = true;
  } else if (splitForenamesOpt == "countrySpecific") {
    let countryList = personGd.inferCountries();
    let numUsing = 0;
    let numNotUsing = 0;
    for (let countryName of countryList) {
      if (CD.usesMiddleNames(countryName)) {
        numUsing++;
      } else {
        numNotUsing++;
      }
    }
    if (numUsing > 0 && numNotUsing == 0) {
      splitForenames = true;
    } else if (numUsing > 0) {
      let birthPlace = personGd.inferBirthPlace();
      if (birthPlace) {
        let country = CD.matchCountryFromPlaceName(birthPlace);
        if (country) {
          if (CD.usesMiddleNames(country.stdName)) {
            splitForenames = true;
          }
        }
      }
    }
  }

  if (splitForenames) {
    result.firstName = personGd.inferFirstName();
    result.middleName = personGd.inferMiddleNames();
  } else {
    result.firstName = personGd.inferForenames();
  }
  if (personGd.name && personGd.name.nicknames) {
    result.nicknames = personGd.name.nicknames;
  }

  result.prefix = personGd.inferPrefix();
  result.suffix = personGd.inferSuffix();

  result.lnab = personGd.inferLastNameAtBirth();

  let cln = personGd.inferLastNameAtDeath();
  if (cln != result.lnab) {
    result.cln = cln;
  }

  result.birthDate = standardizeDate(personGd.inferBirthDate());
  result.birthDateStatus = qualifierToStatus(personGd.inferBirthDateQualifier());
  result.deathDate = standardizeDate(personGd.inferDeathDate());
  result.deathDateStatus = qualifierToStatus(personGd.inferDeathDateQualifier());

  result.birthLocation = standardizePlace(personGd.inferBirthPlace(), result.birthDate);
  result.deathLocation = standardizePlace(personGd.inferDeathPlace(), result.deathDate);

  if (personGd.personGender == "male") {
    result.gender = "Male";
  } else if (personGd.personGender == "female") {
    result.gender = "Female";
  }

  let addMarriage = false;
  let marriageSpouse = undefined;
  const relationship = data.extractedData.relationshipToFamilyMember;
  if (relationship == "spouse") {
    addMarriage = true;
    marriageSpouse = data.extractedData.familyMemberName;
  } else if (relationship == "father" || relationship == "mother") {
    if (data.extractedData.familyMemberSpouseName) {
      addMarriage = true;
      marriageSpouse = data.extractedData.familyMemberSpouseName;
    }
  }

  if (addMarriage) {
    //console.log("getWikiTreeEditFamilyData spouses = ");
    //console.log(personGd.spouses);
    //console.log("getWikiTreeEditFamilyData familyMemberName = " + data.extractedData.familyMemberName);
    if (personGd.spouses && marriageSpouse) {
      // we want to compare spouse names with data.familyMemberName
      // Can be messy because WT name can have maiden name in parens
      // Can fail because the spouse name in personGd could be previously married
      let fmName = marriageSpouse;
      let openParenIndex = fmName.indexOf("(");
      if (openParenIndex != -1) {
        let closeParenIndex = fmName.indexOf(")", openParenIndex);
        if (closeParenIndex != -1) {
          let lnab = fmName.substring(openParenIndex + 1, closeParenIndex).trim();
          let forenames = fmName.substring(0, openParenIndex).trim();
          fmName = forenames + " " + lnab;
        }
      }

      if (citationObject && personGd.spouses.length == 1) {
        // is using a citation it is probably a marriage citation
        // the spouse name may not match exactly but we should still use it
        let spouse = personGd.spouses[0];
        if (spouse.marriageDate) {
          result.marriageDate = standardizeDate(spouse.marriageDate.dateString);
        }
        if (spouse.marriagePlace) {
          result.marriageLocation = standardizePlace(spouse.marriagePlace.placeString, result.marriageDate);
        }
      } else {
        // else it is from a profile and may have multiple marriages
        for (let spouse of personGd.spouses) {
          if (spouse.name && spouse.name.name && spouse.name.name == fmName) {
            if (spouse.marriageDate) {
              result.marriageDate = standardizeDate(spouse.marriageDate.dateString);
            }
            if (spouse.marriagePlace) {
              result.marriageLocation = standardizePlace(spouse.marriagePlace.placeString, result.marriageDate);
            }
            break;
          }
        }
      }
    }
  }

  return result;
}

function getProfileLinkForAddMerge(personEd, personGd) {
  const url = personEd.url;
  let linkString = "";
  if (url) {
    if (personGd.sourceOfData == "ancestry") {
      if (personEd.ancestryTemplate) {
        linkString = personEd.ancestryTemplate;
      } else {
        linkString = "[" + url + "Ancestry profile]";
      }
    } else if (personGd.sourceOfData == "fs") {
      // https://www.familysearch.org/tree/person/details/L5ZC-N31
      // {{FamilySearch|L5ZC-N31}}
      const treePrefix = "/tree/person/details/";
      let treePrefixIndex = url.indexOf(treePrefix);
      if (treePrefixIndex != -1) {
        let treeIndex = treePrefixIndex + treePrefix.length;
        let endIndex = url.indexOf("/", treeIndex);
        if (endIndex == -1) {
          endIndex = url.indexOf("?", treeIndex);
        }
        if (endIndex == -1) {
          endIndex = url.length;
        }
        let personId = url.substring(treeIndex, endIndex);
        linkString = "{{FamilySearch|" + personId + "}}";
      } else {
        linkString = "[" + url + "FamilySearch profile]";
      }
    } else if (personGd.sourceOfData == "fmp") {
      // Currently we only support pages like this:
      // https://tree.findmypast.co.uk/#/trees/918c5b61-df62-4dec-b840-31cad3d86bf9/1181964996/profile
      // Ideally the extract would work on pages like this too:
      // https://www.findmypast.co.uk/search-family-tree/transcript?id=1518223580&ref=30EB72DD-C6FD-4B08-90BF-94A6335344D2
      linkString = "[" + url + "FindMyPast profile]";
    }
  }
  return linkString;
}

function getWikiTreeMergeEditData(data, personEd, personGd, citationObject) {
  let result = getWikiTreeAddMergeData(data, personEd, personGd, citationObject);

  if (citationObject && options.addMerge_mergeEdit_includeCitation) {
    let citationText = citationObject.citation;
    if (citationText) {
      result.bio = citationText;
    }
  }

  // optionally add a "See also:" link to the person profile
  if (personGd.sourceType == "profile" && options.addMerge_mergeEdit_includeProfileLink) {
    let linkString = getProfileLinkForAddMerge(personEd, personGd);

    if (linkString) {
      if (result.bio) {
        result.bio += "\n\n";
      } else {
        result.bio = "";
      }
      //result.sources += "== Sources ==\n";
      //result.sources += "<references />\n";
      result.bio += "See also:\n";
      result.bio += linkString;
    }
  }

  // change explanation
  let fromString = "";
  if (citationObject) {
    fromString = getCitationObjectExplanationText(personGd);
  } else if (personGd.sourceType == "profile") {
    fromString = getPersonDataExplanationText(personGd);
  }
  if (fromString) {
    result.changeExplanation = "Merge external data for " + fromString + " via WikiTree Sourcer";
  }

  return result;
}

function getWikiTreeEditFamilyData(data, personEd, personGd, citationObject) {
  // this input is:
  // data: the extracted data from the current page
  // personData: the stored person data which is extractedData and generalizedData (not as objects)

  function getPageParents(relationship) {
    let parents = {};
    parents.genderKnown = false;
    if (relationship == "child") {
      let pageParent1Name = data.extractedData.familyMemberName; // we don't actually know gender
      let pageParent2Name = data.extractedData.familyMemberSpouseName;
      let pageParent1WikiId = data.extractedData.familyMemberWikiId;
      let pageParent2WikiId = data.extractedData.familyMemberSpouseWikiId;

      let parent1HasParen = false;
      if (pageParent1Name) {
        let birthName = pageParent1Name.replace(/^([^\(]+)\(([^\)]+)\)([^\(\)]+)$/, "$1$2");
        if (birthName && birthName != pageParent1Name) {
          pageParent1Name = birthName;
          parent1HasParen = true;
        }
      }

      let parent2HasParen = false;
      if (pageParent2Name) {
        let birthName = pageParent2Name.replace(/^([^\(]+)\(([^\)]+)\)([^\(\)]+)$/, "$1$2");
        if (birthName && birthName != pageParent2Name) {
          pageParent2Name = birthName;
          parent2HasParen = true;
        }
      }

      if (pageParent1Name && pageParent2Name) {
        if (parent1HasParen && !parent2HasParen) {
          parents.fatherName = pageParent2Name;
          parents.fatherWikiId = pageParent2WikiId;
          parents.motherName = pageParent1Name;
          parents.motherWikiId = pageParent1WikiId;
          parents.genderKnown = true;
        } else {
          if (!parent1HasParen && parent2HasParen) {
            parents.genderKnown = true;
          }

          parents.fatherName = pageParent1Name;
          parents.fatherWikiId = pageParent1WikiId;
          parents.motherName = pageParent2Name;
          parents.motherWikiId = pageParent2WikiId;
        }
      } else if (pageParent1Name) {
        if (parent1HasParen) {
          parents.motherName = pageParent1Name;
          parents.motherWikiId = pageParent1WikiId;
          parents.genderKnown = true;
        } else {
          parents.fatherName = pageParent1Name;
          parents.fatherWikiId = pageParent1WikiId;
        }
      }
    } else if (relationship == "sibling") {
      let fatherName = data.extractedData.familyMemberFatherName;
      let motherName = data.extractedData.familyMemberMotherName;
      let fatherWikiId = data.extractedData.familyMemberFatherWikiId;
      let motherWikiId = data.extractedData.familyMemberMotherWikiId;

      // Remove married name from mother if present
      if (motherName) {
        let birthName = motherName.replace(/^([^\(]+)\(([^\)]+)\)([^\(\)]+)$/, "$1$2");
        if (birthName && birthName != motherName) {
          motherName = birthName;
        }
      }

      if (fatherName) {
        parents.fatherName = fatherName;
        parents.fatherWikiId = fatherWikiId;
        parents.genderKnown = true;
      }

      if (motherName) {
        parents.motherName = motherName;
        parents.motherWikiId = motherWikiId;
        parents.genderKnown = true;
      }
    }
    return parents;
  }

  //console.log("getWikiTreeEditFamilyData, personGd is: ");
  //console.log(personGd);

  let result = getWikiTreeAddMergeData(data, personEd, personGd, citationObject);

  // possibly add intro
  const addIntroOpt = options.addMerge_addPerson_generateIntro;
  if (addIntroOpt != "none") {
    // Example intro:
    // Cornelius Seddon was born in 1864 in Ashton in Makerfield, Lancashire, England, the son of Joseph Seddon and Ellen Tootell.

    // Check whether to add {{Died Young}} sticker.
    let addDiedYoung = false;
    if (options.addMerge_addPerson_addDiedYoung) {
      let ageAtDeath = personGd.inferAgeAtDeath();
      if (ageAtDeath !== undefined) {
        if (typeof ageAtDeath == "string") {
          let ageNum = parseInt(ageAtDeath);
          if (ageNum != NaN) {
            ageAtDeath = ageNum;
          } else {
            ageAtDeath = undefined;
          }
        }
        if (ageAtDeath !== undefined) {
          if (ageAtDeath <= 15) {
            if (!personGd.spouses) {
              addDiedYoung = true;
            }
          }
        }
      }
    }

    let fullName = personGd.inferFullName();

    let birthDateString = "";
    let birthDateObj = personGd.birthDate;
    if (birthDateObj) {
      let format = options.narrative_general_dateFormat;
      let highlight = options.narrative_general_dateHighlight;
      birthDateString = personGd.getNarrativeDateFormat(birthDateObj, format, highlight, true);
    }

    let birthPlace = personGd.inferBirthPlace();
    if (birthPlace) {
      let preposition = WTS_String.getPrepositionForPlaceString(birthPlace);
      birthPlace = preposition + " " + birthPlace;
    }

    let fatherName = "";
    let motherName = "";
    let fatherWikiId = "";
    let motherWikiId = "";
    if (addIntroOpt == "fromSavedData") {
      let parentNames = personGd.inferParentNamesForDataString();
      fatherName = parentNames.fatherName;
      motherName = parentNames.motherName;
    } else if (addIntroOpt == "fromPageData") {
      let relationship = data.extractedData.relationshipToFamilyMember;
      let pageParents = getPageParents(relationship);
      if (pageParents.fatherName) {
        fatherName = pageParents.fatherName;
        fatherWikiId = pageParents.fatherWikiId;
      }
      if (pageParents.motherName) {
        motherName = pageParents.motherName;
        motherWikiId = pageParents.motherWikiId;
      }
    } else if (addIntroOpt == "fromBoth") {
      let relationship = data.extractedData.relationshipToFamilyMember;
      let pageParents = getPageParents(relationship);
      let dataParents = personGd.inferParentNamesForDataString();
      fatherName = dataParents.fatherName;
      motherName = dataParents.motherName;
      // the page parents can have the father and mother the wrong way round
      if (!pageParents.genderKnown) {
        if (pageParents.fatherName != dataParents.fatherName) {
          if (pageParents.motherName == dataParents.fatherName) {
            let swapName = pageParents.motherName;
            let swapWikiId = pageParents.motherWikiId;
            pageParents.motherName = pageParents.fatherName;
            pageParents.motherWikiId = pageParents.fatherWikiId;
            pageParents.fatherName = swapName;
            pageParents.fatherWikiId = swapWikiId;
          }
        }
      }
      if (pageParents.fatherName) {
        fatherName = pageParents.fatherName;
        fatherWikiId = pageParents.fatherWikiId;
      }
      if (pageParents.motherName) {
        motherName = pageParents.motherName;
        motherWikiId = pageParents.motherWikiId;
      }
    }

    let intro = "";
    if (addDiedYoung) {
      intro += "{{Died Young}}\n";
    }
    if (fullName && (birthDateString || birthPlace || fatherName || motherName)) {
      intro += fullName;
      if (birthDateString || birthPlace) {
        intro += " was born";
        if (birthDateString) {
          intro += " " + birthDateString;
        }
        if (birthPlace) {
          intro += " " + birthPlace;
        }
      }

      if (fatherName || motherName) {
        intro += ", ";
        if (personGd.personGender == "male") {
          intro += "son";
        } else if (personGd.personGender == "female") {
          intro += "daughter";
        } else {
          intro += "child";
        }
        intro += " of ";

        if (options.addMerge_addPerson_includeLinks) {
          if (fatherName && fatherWikiId) {
            fatherName = "[[" + fatherWikiId + "|" + fatherName + "]]";
          }
          if (motherName && motherWikiId) {
            motherName = "[[" + motherWikiId + "|" + motherName + "]]";
          }
        }

        if (fatherName && motherName) {
          intro += fatherName + " and " + motherName;
        } else if (fatherName) {
          intro += fatherName;
        } else {
          intro += motherName;
        }
      }

      intro += ".";

      result.notes = intro;
    }
  }

  if (citationObject && options.addMerge_addPerson_includeCitation) {
    let type = citationObject.type;
    let citationText = citationObject.citation;
    if (citationText) {
      if (type == "source") {
        result.sources = citationText;
      } else {
        if (!result.notes) {
          result.notes = "";
        } else if (type == "narrative") {
          result.notes += "\n\n";
        }

        result.notes += citationText;
      }
    }
  }

  // optionally add a "See also:" link to the person profile
  if (personGd.sourceType == "profile" && options.addMerge_addPerson_includeProfileLink) {
    let linkString = getProfileLinkForAddMerge(personEd, personGd);

    if (linkString) {
      if (!result.sources) {
        result.sources = "";
      } else {
        result.sources += "\n";
      }

      if (data.extractedData.editFamilyType == "steps") {
        result.sources += "See also:\n* ";
      }

      result.sources += linkString;
    }
  }

  // change explanation
  let fromString = "";
  if (citationObject) {
    fromString = getCitationObjectExplanationText(personGd);
  } else if (personGd.sourceType == "profile") {
    fromString = getPersonDataExplanationText(personGd);
  }
  if (fromString) {
    result.changeExplanation = "Add using external data for " + fromString + " via WikiTree Sourcer";
  }

  //console.log("getWikiTreeEditFamilyData, result is: ");
  //console.log(result);

  return result;
}

async function doSetFieldsFromPersonData(tabId, wtPersonData) {
  // send a message to content script
  try {
    //console.log("doSetFieldsFromPersonData");
    //console.log(tabId);
    //console.log(wtPersonData);

    chrome.tabs.sendMessage(tabId, { type: "setFields", personData: wtPersonData }, function (response) {
      displayMessage("Setting fields ...");

      //console.log("doSetFieldsFromPersonData, chrome.runtime.lastError is:");
      //console.log(chrome.runtime.lastError);
      //console.log("doSetFieldsFromPersonData, response is:");
      //console.log(response);

      // NOTE: must check lastError first in the if below so it doesn't report an unchecked error
      if (chrome.runtime.lastError || !response) {
        // possibly there is no content script loaded, this could be an error that should be reported
        // By testing edge cases I have found the if you reload the page and immediately click the
        // extension button sometimes this will happen. Presumably because the content script
        // just got unloaded prior to the reload but we got here because the popup had not been reset.
        // In this case we are seeing the response being undefined.
        // What to do in this case? Don't want to leave the "Initializing menu..." up.
        displayMessageWithIcon("warning", "doSetFieldsFromPersonData failed");
      } else if (response.success) {
        displayMessageWithIconThenClosePopup("check", "Fields updated");
      } else {
        let message = response.errorMessage;
        console.log(message);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function setFieldsFromPersonData(data, personEd, personGd, tabId, citationObject, backFunction) {
  let wtPersonData = getWikiTreeEditFamilyData(data, personEd, personGd, citationObject);

  function processFunction() {
    doSetFieldsFromPersonData(tabId, wtPersonData);
  }

  checkWtPersonData(wtPersonData, processFunction, backFunction);
}

async function doMergeEditFromPersonData(data, wtPersonData) {
  let mergeUrl = "https://www.wikitree.com/wiki/Special:MergeEdit";

  try {
    const wikitreeMergeEditData = {
      timeStamp: Date.now(),
      wtPersonData: wtPersonData,
      url: mergeUrl,
      wikiId: data.extractedData.wikiId,
    };

    chrome.storage.local.set({ wikitreeMergeEditData: wikitreeMergeEditData }, function () {
      //console.log("saved wikitreeMergeEditData, wikitreeMergeEditData is:");
      //console.log(wikitreeMergeEditData);
    });
  } catch (ex) {
    console.log("mergeEditFromPersonData: storeDataCache failed");
  }

  chrome.tabs.create({ url: mergeUrl });
  closePopup();
}

async function checkWtPersonData(wtPersonData, processFunction, backFunction) {
  function backFunctionForApprove() {
    if (wtPersonData.deathLocationApproved) {
      wtPersonData.deathLocationApproved = false;
      checkWtPersonData(wtPersonData, processFunction, backFunction);
    } else if (wtPersonData.birthLocationApproved) {
      wtPersonData.birthLocationApproved = false;
      checkWtPersonData(wtPersonData, processFunction, backFunction);
    } else if (wtPersonData.nameFieldsApproved) {
      wtPersonData.nameFieldsApproved = false;
      checkWtPersonData(wtPersonData, processFunction, backFunction);
    } else {
      backFunction();
    }
  }

  function nameNeedsUserCheck() {
    if (!wtPersonData.nameFieldsApproved) {
      let hasProblem = false;
      let problemMessages = [];

      // check for prefix in first name
      const problemFirstNamePrefixes = [
        "Mr",
        "Mr.",
        "Mrs",
        "Mrs.",
        "Miss",
        "Ms",
        "Ms.",
        "Sir",
        "Captain",
        "Capt",
        "Capt.",
      ];
      for (let prefix of problemFirstNamePrefixes) {
        if (wtPersonData.firstName.startsWith(" " + prefix) || wtPersonData.firstName == prefix) {
          hasProblem = true;
          problemMessages.push(
            "First name at birth starts with '" + prefix + "'. This should probably be moved to the prefix."
          );
          break;
        }
      }

      // check for quotes in first name
      if (wtPersonData.firstName.includes('"')) {
        hasProblem = true;
        problemMessages.push(
          `First name at birth includes '"'. This should probably be moved to the nicknames or preferred name.`
        );
      }

      // check for quotes in middle name
      if (wtPersonData.middleName && wtPersonData.middleName.includes('"')) {
        hasProblem = true;
        problemMessages.push(
          `Middle name includes '"'. This should probably be moved to the nicknames or preferred name.`
        );
      }

      // check for suffix in lnab
      const problemLastNameEndings = ["Sr", "Sr.", "Jr", "Jr.", "Senior", "Junior", "III"];
      for (let ending of problemLastNameEndings) {
        if (wtPersonData.lnab.endsWith(" " + ending) || wtPersonData.lnab == ending) {
          hasProblem = true;
          problemMessages.push(
            "Last name at birth ends with '" + ending + "'. This should probably be moved to the suffix."
          );
          break;
        }
      }

      if (hasProblem || wtPersonData.nameFieldsDialogShown) {
        let message1 = "";
        if (hasProblem) {
          message1 = "Possible errors in name fields. Please check and edit below if needed:";
        }

        function continueFunction() {
          wtPersonData.nameFieldsApproved = true;
          wtPersonData.nameFieldsDialogShown = true;
          checkWtPersonData(wtPersonData, processFunction, backFunctionForApprove);
        }

        setupImproveNameFieldsSubMenu(
          wtPersonData,
          message1,
          problemMessages,
          continueFunction,
          backFunctionForApprove
        );
        return true;
      }
    }
    return false;
  }

  function locationNeedsUserCheck(fieldName, fieldDescription) {
    let fieldValue = wtPersonData[fieldName];
    if (fieldValue && !wtPersonData[fieldName + "Approved"]) {
      let country = CD.matchCountryFromPlaceName(fieldValue);
      if (!country || wtPersonData[fieldName + "DialogShown"]) {
        // location has no recognized country
        let message1 = "";
        if (!country) {
          message1 = "Country name not recognized in " + fieldDescription;
          message1 += ". Please check it and edit below if needed.";
        }

        let message2 = "Edit " + fieldDescription + ":";

        function continueFunction(newValue) {
          wtPersonData[fieldName] = newValue;
          wtPersonData[fieldName + "Approved"] = true;
          wtPersonData[fieldName + "DialogShown"] = true;
          checkWtPersonData(wtPersonData, processFunction, backFunctionForApprove);
        }

        const existingValue = wtPersonData[fieldName];
        setupImproveTextFieldSubMenu(existingValue, message1, message2, continueFunction, backFunctionForApprove);
        return true;
      }
    }
    return false;
  }

  if (nameNeedsUserCheck()) {
    return;
  }

  if (locationNeedsUserCheck("birthLocation", "birth location")) {
    return;
  }

  if (locationNeedsUserCheck("deathLocation", "death location")) {
    return;
  }

  if (locationNeedsUserCheck("marriageLocation", "marriage location")) {
    return;
  }

  processFunction();
}

async function mergeEditFromPersonData(data, personEd, personGd, citationObject, tabId, backFunction) {
  let wtPersonData = getWikiTreeMergeEditData(data, personEd, personGd, citationObject);

  function processFunction() {
    doMergeEditFromPersonData(data, wtPersonData);
  }

  checkWtPersonData(wtPersonData, processFunction, backFunction);
}

function getPersonDataSubtitleText(gd, timeText) {
  let name = gd.inferFullName();
  if (!name) {
    name = "Unknown";
  }

  let subtitleText = name;

  let birthYear = gd.inferBirthYear();
  if (!birthYear) {
    birthYear = "";
  }
  let deathYear = gd.inferDeathYear();
  if (!deathYear) {
    deathYear = "";
  }
  if (birthYear || deathYear) {
    subtitleText += " (" + birthYear + "-" + deathYear + ")";
  }

  subtitleText += "\nSaved " + timeText + " ago";

  return subtitleText;
}

function getCitationObjectSubtitleText(gd, timeText) {
  let name = gd.inferFullName();
  if (!name) {
    name = "Unknown";
  }

  let subtitleText = name;

  let birthYear = gd.inferBirthYear();
  if (!birthYear) {
    birthYear = "";
  }
  let deathYear = gd.inferDeathYear();
  if (!deathYear) {
    deathYear = "";
  }
  if (birthYear || deathYear) {
    subtitleText += " (" + birthYear + "-" + deathYear + ")";
  }

  subtitleText += "\nRecord type: " + gd.recordType;
  subtitleText += "\nSaved " + timeText + " ago";

  return subtitleText;
}

function getPersonDataExplanationText(gd) {
  let name = gd.inferFullName();
  if (!name) {
    name = "Unknown";
  }

  let text = name;

  let birthYear = gd.inferBirthYear();
  if (!birthYear) {
    birthYear = "";
  }
  let deathYear = gd.inferDeathYear();
  if (!deathYear) {
    deathYear = "";
  }
  if (birthYear || deathYear) {
    text += " (" + birthYear + "-" + deathYear + ")";
  }

  text += " from " + gd.sourceOfData;

  return text;
}

function getCitationObjectExplanationText(gd) {
  let name = gd.inferFullName();
  if (!name) {
    name = "Unknown";
  }

  let text = name;

  let birthYear = gd.inferBirthYear();
  if (!birthYear) {
    birthYear = "";
  }
  let deathYear = gd.inferDeathYear();
  if (!deathYear) {
    deathYear = "";
  }
  if (birthYear || deathYear) {
    text += " (" + birthYear + "-" + deathYear + ")";
  }

  text += ". Record type: " + gd.recordType;
  text += " from " + gd.sourceOfData;

  return text;
}

////////////////////////////////////////////////////////////////////////////////
// Add menu item functions
////////////////////////////////////////////////////////////////////////////////

async function addSetFieldsFromPersonDataMenuItem(menu, data, tabId, backFunction) {
  let personData = await getLatestPersonData();
  if (!personData) {
    return; // no saved data, do not add menu item
  }

  let timeText = convertTimestampDiffToText(personData.timeStamp);
  if (!timeText) {
    return;
  }

  if (personData.generalizedData) {
    let gd = GeneralizedData.createFromPlainObject(personData.generalizedData);
    let menuText = "Set Fields from Person Data for:";
    let subtitleText = getPersonDataSubtitleText(gd, timeText);

    addMenuItemWithSubtitle(
      menu,
      menuText,
      function (element) {
        setFieldsFromPersonData(data, personData.extractedData, gd, tabId, null, backFunction);
      },
      subtitleText
    );
  }
}

async function addSetFieldsFromCitationMenuItem(menu, data, tabId, backFunction) {
  let storedObject = await getLatestCitation();
  if (!storedObject) {
    return; // no saved data, do not add menu item
  }

  let citationObject = storedObject.latestCitation;
  if (!citationObject) {
    return;
  }

  let timeText = convertTimestampDiffToText(citationObject.timeStamp);
  if (!timeText) {
    return;
  }

  if (citationObject && citationObject.generalizedData) {
    let gd = GeneralizedData.createFromPlainObject(citationObject.generalizedData);
    let menuText = "Set Fields from Citation Data for:";
    let subtitleText = getCitationObjectSubtitleText(gd, timeText);

    addMenuItemWithSubtitle(
      menu,
      menuText,
      function (element) {
        setFieldsFromPersonData(data, citationObject.extractedData, gd, tabId, citationObject, backFunction);
      },
      subtitleText
    );
  }
}

async function addMergeEditFromPersonDataMenuItem(menu, data, tabId, backFunction) {
  let personData = await getLatestPersonData();
  if (!personData) {
    console.log("addMergeEditFromPersonDataMenuItem, no person data");
    return false; // no saved data, do not add menu item
  }

  let timeText = convertTimestampDiffToText(personData.timeStamp);
  if (!timeText) {
    console.log("addMergeEditFromPersonDataMenuItem, no timeText");
    return false;
  }

  if (personData.generalizedData) {
    let gd = GeneralizedData.createFromPlainObject(personData.generalizedData);
    let menuText = "Merge Edit from Person Data for:";
    let subtitleText = getPersonDataSubtitleText(gd, timeText);

    addMenuItemWithSubtitle(
      menu,
      menuText,
      function (element) {
        mergeEditFromPersonData(data, personData.extractedData, gd, null, tabId, backFunction);
      },
      subtitleText
    );

    return true;
  }

  return false;
}

async function addMergeEditFromCitationObjectMenuItem(menu, data, tabId, backFunction) {
  let storedObject = await getLatestCitation();
  if (!storedObject) {
    return; // no saved data, do not add menu item
  }

  let citationObject = storedObject.latestCitation;
  if (!citationObject) {
    return;
  }

  let timeText = convertTimestampDiffToText(citationObject.timeStamp);
  if (!timeText) {
    return;
  }

  if (citationObject && citationObject.generalizedData) {
    let gd = GeneralizedData.createFromPlainObject(citationObject.generalizedData);
    let menuText = "Merge Edit from Citation Data for:";
    let subtitleText = getCitationObjectSubtitleText(gd, timeText);

    addMenuItemWithSubtitle(
      menu,
      menuText,
      function (element) {
        mergeEditFromPersonData(data, citationObject.extractedData, gd, citationObject, tabId, backFunction);
      },
      subtitleText
    );

    return true;
  }

  return false;
}

async function addMergeEditMenuItem(menu, data, tabId, backFunction) {
  addMenuItem(menu, "Merge/Edit from external data...", function (element) {
    setupMergeEditSubMenu(data, tabId, backFunction);
  });
}

////////////////////////////////////////////////////////////////////////////////
// Sub menus
////////////////////////////////////////////////////////////////////////////////

async function setupImproveTextFieldSubMenu(existingValue, message1, message2, continueFunction, backFunction) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  let commentElement = document.createElement("label");
  commentElement.innerText = message1;
  commentElement.className = "improveFieldComment";
  menu.list.appendChild(commentElement);

  let countriesLabelElement = document.createElement("label");
  {
    let inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.className = "improveFieldInput";
    inputElement.id = "improveFieldInput";

    inputElement.value = existingValue;

    let labelTextNode = document.createTextNode(message2);
    countriesLabelElement.appendChild(labelTextNode);
    countriesLabelElement.appendChild(inputElement);
    countriesLabelElement.className = "improveFieldLabel";
    menu.list.appendChild(countriesLabelElement);
  }

  // final button
  addBreak(menu.list);

  let button = document.createElement("button");
  button.className = "dialogButton";
  button.innerText = "Continue";
  button.onclick = function (element) {
    let inputElement = document.getElementById("improveFieldInput");
    let newValue = existingValue;
    if (inputElement) {
      newValue = inputElement.value;
    }
    continueFunction(newValue);
  };
  menu.list.appendChild(button);

  endMainMenu(menu);
}

async function setupImproveNameFieldsSubMenu(wtPersonData, message1, problemMessages, continueFunction, backFunction) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  let commentElement = document.createElement("label");
  commentElement.innerText = message1;
  commentElement.className = "improveFieldComment";
  menu.list.appendChild(commentElement);

  for (let problem of problemMessages) {
    let problemElement = document.createElement("label");
    problemElement.innerText = problem;
    problemElement.className = "improveFieldComment";
    menu.list.appendChild(problemElement);
  }

  function addField(label, fieldName) {
    let mainElement = document.createElement("label");
    {
      let inputElement = document.createElement("input");
      inputElement.type = "text";
      inputElement.className = "improveNameFieldInput";
      inputElement.id = fieldName + "Input";

      if (wtPersonData[fieldName]) {
        inputElement.value = wtPersonData[fieldName];
      }

      let labelTextNode = document.createTextNode(label + ":");
      mainElement.appendChild(labelTextNode);
      mainElement.appendChild(inputElement);
      mainElement.className = "improveNameFieldLabel";
      menu.list.appendChild(mainElement);
    }
  }

  addField("Prefix", "prefix");
  addField("First Name at Birth", "firstName");
  addField("Preferred First Name", "prefName");
  addField("Middle Name", "middleName");
  addField("Nicknames", "nicknames");
  addField("Last Name at Birth", "lnab");
  addField("Current Last Name", "cln");
  addField("Other Last Names", "otherLastNames");
  addField("Suffix", "suffix");

  // final button
  addBreak(menu.list);

  function setFieldFromDialog(fieldName) {
    let inputElement = document.getElementById(fieldName + "Input");
    if (inputElement) {
      wtPersonData[fieldName] = inputElement.value;
    }
  }

  let button = document.createElement("button");
  button.className = "dialogButton";
  button.innerText = "Continue";
  button.onclick = function (element) {
    setFieldFromDialog("prefix");
    setFieldFromDialog("firstName");
    setFieldFromDialog("prefName");
    setFieldFromDialog("middleName");
    setFieldFromDialog("nicknames");
    setFieldFromDialog("lnab");
    setFieldFromDialog("cln");
    setFieldFromDialog("otherLastNames");
    setFieldFromDialog("suffix");
    continueFunction();
  };
  menu.list.appendChild(button);

  endMainMenu(menu);
}

async function setupMergeEditSubMenu(data, tabId, backFunction) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  let toHereBackFunction = function () {
    setupMergeEditSubMenu(data, tabId, backFunction);
  };

  const item1Added = await addMergeEditFromPersonDataMenuItem(menu, data, tabId, toHereBackFunction);
  const item2Added = await addMergeEditFromCitationObjectMenuItem(menu, data, tabId, toHereBackFunction);

  if (!item1Added && !item2Added) {
    let message = "No external data available.";
    message += " To get data from a citation use 'Build citation...'.";
    message += " To get data from a profile use 'Save Person Data'.";
    addItalicMessageMenuItem(menu, message);
  }

  endMainMenu(menu);
}

////////////////////////////////////////////////////////////////////////////////
// Main menu setup function
////////////////////////////////////////////////////////////////////////////////
async function setupWikiTreePopupMenu(extractedData, tabId) {
  //console.log("setupWikiTreePopupMenu: tabId is: " + tabId);

  let backFunction = function () {
    setupWikiTreePopupMenu(extractedData, tabId);
  };

  if (!extractedData || !extractedData.hasValidData) {
    let data = { extractedData: extractedData };

    if (extractedData.currentTabText) {
      let message = "WikiTree Sourcer doesn't know how to extract data from this page.";
      message += "\n\nIt looks like a WikiTree person profile or free space page but not the right tab.";
      (message +=
        "\n\nThis extension only works on Person Profile and the Profile, Edit or Profile (private view) tab should be selected."),
        buildMinimalMenuWithMessage(message, data, backFunction);
    } else {
      let message = "WikiTree Sourcer doesn't know how to extract data from this page.";
      message += "\n\nIt looks like a WikiTree page but not a person profile.";
      buildMinimalMenuWithMessage(message, data, backFunction);
    }
    return;
  }

  // get generalized data
  let generalizedData = generalizeData({ extractedData: extractedData });
  let data = { extractedData: extractedData, generalizedData: generalizedData };

  //console.log("setupWikiTreePopupMenu: generalizedData is:");
  //console.log(generalizedData);

  if (!generalizedData || !generalizedData.hasValidData) {
    let message = "WikiTree Sourcer could not interpret the data on this page.";
    message += "\n\nIt looks like a supported WikiTree page but the data generalize failed.";
    buildMinimalMenuWithMessage(message, data, backFunction);
    return;
  }

  // This will result in cachedDataCache being set once it is ready (used for some (e.g. GRO) search menu items)
  updateDataCacheWithWikiTreeExtract(extractedData, generalizedData);

  let menu = beginMainMenu();

  await addSearchMenus(menu, data, backFunction, "wikitree");
  addMenuDivider(menu);

  if (extractedData.pageType == "editFamily") {
    if (extractedData.editFamilyType != "steps" || extractedData.editFamilyTypeStep == "basicDataSection") {
      addMenuDivider(menu);
      await addSetFieldsFromPersonDataMenuItem(menu, data, tabId, backFunction);
      await addSetFieldsFromCitationMenuItem(menu, data, tabId, backFunction);
    }
  } else if (extractedData.pageType == "read" || extractedData.pageType == "private") {
    addMenuDivider(menu);
    await addMergeEditMenuItem(menu, data, tabId, backFunction);
  }

  addStandardMenuEnd(menu, data, backFunction);
}

initPopup("wikitree", setupWikiTreePopupMenu);
