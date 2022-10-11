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
  addMenuItemWithSubtitle,
  displayMessage,
  displayMessageWithIcon,
  displayMessageWithIconThenClosePopup,
} from "/base/browser/popup/popup_menu_building.mjs";

import {
  addStandardMenuEnd,
  buildMinimalMenuWithMessage,
} from "/base/browser/popup/popup_menu_blocks.mjs";

import { getLatestCitation } from "/base/browser/popup/popup_citation.mjs";

import { addSearchMenus } from "/base/browser/popup/popup_search.mjs";
import { initPopup } from "/base/browser/popup/popup_init.mjs";
import { getLatestPersonData } from "/base/browser/popup/popup_person_data.mjs";

import { generalizeData } from "../core/wikitree_generalize_data.mjs";

import {
  GeneralizedData,
  dateQualifiers,
} from "/base/core/generalize_data_utils.mjs";

import { options } from "/base/browser/options/options_loader.mjs";
import { CD } from "../../../base/core/country_data.mjs";
import { WTS_String } from "../../../base/core/wts_string.mjs";

function convertTimestampDiffToText(timeStamp) {
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

function getWikiTreeEditFamilyData(data, personEd, personGd, citationObject) {
  // this input is:
  // data: the extracted data from the current page
  // personData: the stored person data which is extractedData and generalizedData (not as objects)

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
        let birthName = pageParent1Name.replace(
          /^([^\(]+)\(([^\)]+)\)([^\(\)]+)$/,
          "$1$2"
        );
        if (birthName && birthName != pageParent1Name) {
          pageParent1Name = birthName;
          parent1HasParen = true;
        }
      }

      let parent2HasParen = false;
      if (pageParent2Name) {
        let birthName = pageParent2Name.replace(
          /^([^\(]+)\(([^\)]+)\)([^\(\)]+)$/,
          "$1$2"
        );
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
        let birthName = motherName.replace(
          /^([^\(]+)\(([^\)]+)\)([^\(\)]+)$/,
          "$1$2"
        );
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

  let result = {};

  let splitForenames = false;
  const splitForenamesOpt = options.addPerson_general_splitForenames;
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

  result.prefix = personGd.inferPrefix();
  result.suffix = personGd.inferSuffix();

  result.lnab = personGd.inferLastNameAtBirth();

  let cln = personGd.inferLastNameAtDeath();
  if (cln != result.lnab) {
    result.cln = cln;
  }

  result.birthDate = personGd.inferBirthDate();
  result.birthDateStatus = qualifierToStatus(
    personGd.inferBirthDateQualifier()
  );
  result.deathDate = personGd.inferDeathDate();
  result.deathDateStatus = qualifierToStatus(
    personGd.inferDeathDateQualifier()
  );

  result.birthLocation = personGd.inferBirthPlace();
  result.deathLocation = personGd.inferDeathPlace();

  if (personGd.personGender == "male") {
    result.gender = "Male";
  } else if (personGd.personGender == "female") {
    result.gender = "Female";
  }

  if (data.extractedData.relationshipToFamilyMember == "spouse") {
    //console.log("getWikiTreeEditFamilyData spouses = ");
    //console.log(personGd.spouses);
    //console.log("getWikiTreeEditFamilyData familyMemberName = " + data.extractedData.familyMemberName);
    if (personGd.spouses && data.extractedData.familyMemberName) {
      // we want to compare spouse names with data.familyMemberName
      // Can be messy because WT name can have maiden name in parens
      // Can fail because the spouse name in personGd could be previously married
      let fmName = data.extractedData.familyMemberName;
      let openParenIndex = fmName.indexOf("(");
      if (openParenIndex != -1) {
        let closeParenIndex = fmName.indexOf(")", openParenIndex);
        if (closeParenIndex != -1) {
          let lnab = fmName
            .substring(openParenIndex + 1, closeParenIndex)
            .trim();
          let forenames = fmName.substring(0, openParenIndex).trim();
          fmName = forenames + " " + lnab;
        }
      }

      for (let spouse of personGd.spouses) {
        if (spouse.name && spouse.name.name && spouse.name.name == fmName) {
          if (spouse.marriageDate) {
            result.marriageDate = spouse.marriageDate.dateString;
          }
          if (spouse.marriagePlace) {
            result.marriageLocation = spouse.marriagePlace.placeString;
          }
          break;
        }
      }
    }
  }

  // possibly add intro
  const addIntroOpt = options.addPerson_general_generateIntro;
  if (addIntroOpt != "none") {
    // Example intro:
    // Cornelius Seddon was born in 1864 in Ashton in Makerfield, Lancashire, England, the son of Joseph Seddon and Ellen Tootell.

    // Check whether to add {{Died Young}} sticker.
    let addDiedYoung = false;
    if (options.addPerson_general_addDiedYoung) {
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
      birthDateString = personGd.getNarrativeDateFormat(
        birthDateObj,
        format,
        highlight,
        true
      );
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
    if (
      fullName &&
      (birthDateString || birthPlace || fatherName || motherName)
    ) {
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

        if (options.addPerson_general_includeLinks) {
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

  if (citationObject && options.addPerson_general_includeCitation) {
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
  if (
    personGd.sourceType == "profile" &&
    options.addPerson_general_includeProfileLink
  ) {
    const url = personEd.url;
    let linkString = "";
    if (url) {
      if (personGd.sourceOfData == "ancestry") {
        // e.g. "https://www.ancestry.com/family-tree/person/tree/86808578/person/260133535006/facts"
        // becomes: {{Ancestry Tree|86808578|260133535006}}
        const treePrefix = "/family-tree/person/tree/";
        const personPrefix = "/person/";
        let treePrefixIndex = url.indexOf(treePrefix);
        if (treePrefixIndex != -1) {
          let treeIndex = treePrefixIndex + treePrefix.length;
          let personPrefixIndex = url.indexOf(personPrefix, treeIndex);
          if (personPrefixIndex != -1) {
            let tree = url.substring(treeIndex, personPrefixIndex);
            let personIndex = personPrefixIndex + personPrefix.length;
            let personEndIndex = url.indexOf("/", personIndex);
            if (personEndIndex != -1) {
              let person = url.substring(personIndex, personEndIndex);
              linkString = "{{Ancestry Tree|" + tree + "|" + person + "}}";
            }
          }
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

      if (linkString) {
        if (!result.sources) {
          result.sources = "";
        } else {
          result.sources += "\n";
        }
        result.sources += linkString;
      }
    }
  }

  //console.log("getWikiTreeEditFamilyData, result is: ");
  //console.log(result);

  return result;
}

async function setFieldsFromPersonData(
  data,
  personEd,
  personGd,
  tabId,
  citationObject
) {
  let wtPersonData = getWikiTreeEditFamilyData(
    data,
    personEd,
    personGd,
    citationObject
  );

  // send a message to content script
  try {
    //console.log("setFieldsFromPersonData");
    //console.log(tabId);
    //console.log(personData);

    chrome.tabs.sendMessage(
      tabId,
      { type: "setFields", personData: wtPersonData },
      function (response) {
        displayMessage("Setting fields ...");

        //console.log("setFieldsFromPersonData, chrome.runtime.lastError is:");
        //console.log(chrome.runtime.lastError);
        //console.log("setFieldsFromPersonData, response is:");
        //console.log(response);

        // NOTE: must check lastError first in the if below so it doesn't report an unchecked error
        if (chrome.runtime.lastError || !response) {
          // possibly there is no content script loaded, this could be an error that should be reported
          // By testing edge cases I have found the if you reload the page and immediately click the
          // extension button sometimes this will happen. Presumably because the content script
          // just got unloaded prior to the reload but we got here because the popup had not been reset.
          // In this case we are seeing the response being undefined.
          // What to do in this case? Don't want to leave the "Initializing menu..." up.
          displayMessageWithIcon("warning", "setFieldsFromPersonData failed");
        } else if (response.success) {
          displayMessageWithIconThenClosePopup("check", "Fields updated");
        } else {
          let message = response.errorMessage;
          console.log(message);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
}

async function addSetFieldsFromPersonDataMenuItem(menu, data, tabId) {
  let personData = await getLatestPersonData();
  if (!personData) {
    return; // no saved data, do not add menu item
  }

  let menuText = "Set Fields from Person Data";
  let subtitleText = "";
  if (personData.generalizedData) {
    let gd = GeneralizedData.createFromPlainObject(personData.generalizedData);
    let name = gd.inferFullName();
    if (!name) {
      name = "Unknown";
    }

    menuText += " for:";
    subtitleText += name;

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

    if (personData.timeStamp) {
      let timeText = convertTimestampDiffToText(personData.timeStamp);
      if (!timeText) {
        return;
      }
      subtitleText += "\nSaved " + timeText + " ago";
    }

    addMenuItemWithSubtitle(
      menu,
      menuText,
      function (element) {
        setFieldsFromPersonData(data, personData.extractedData, gd, tabId);
      },
      subtitleText
    );
  }
}

async function addSetFieldsFromCitationMenuItem(menu, data, tabId) {
  let storedObject = await getLatestCitation();
  if (!storedObject) {
    return; // no saved data, do not add menu item
  }

  let citationObject = storedObject.latestCitation;
  let menuText = "Set Fields from Citation Data";
  let subtitleText = "";
  if (citationObject && citationObject.generalizedData) {
    let gd = GeneralizedData.createFromPlainObject(
      citationObject.generalizedData
    );
    let name = gd.inferFullName();
    if (!name) {
      name = "Unknown";
    }

    menuText += " for:";
    subtitleText += name;

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

    if (citationObject.timeStamp) {
      let timeText = convertTimestampDiffToText(citationObject.timeStamp);
      if (!timeText) {
        return;
      }
      subtitleText += "\nSaved " + timeText + " ago";
    }
    addMenuItemWithSubtitle(
      menu,
      menuText,
      function (element) {
        setFieldsFromPersonData(
          data,
          citationObject.extractedData,
          gd,
          tabId,
          citationObject
        );
      },
      subtitleText
    );
  }
}

async function setupWikiTreePopupMenu(extractedData, tabId) {
  //console.log("setupWikiTreePopupMenu: tabId is: " + tabId);

  let backFunction = function () {
    setupWikiTreePopupMenu(extractedData);
  };

  if (!extractedData || !extractedData.hasValidData) {
    let data = { extractedData: extractedData };

    if (extractedData.currentTabText) {
      let message =
        "WikiTree Sourcer doesn't know how to extract data from this page.";
      message +=
        "\n\nIt looks like a WikiTree person profile or free space page but not the right tab.";
      (message +=
        "\n\nThis extension only works on Person Profile and the Profile, Edit or Profile (private view) tab should be selected."),
        buildMinimalMenuWithMessage(message, data, backFunction);
    } else {
      let message =
        "WikiTree Sourcer doesn't know how to extract data from this page.";
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
    message +=
      "\n\nIt looks like a supported WikiTree page but the data generalize failed.";
    buildMinimalMenuWithMessage(message, data, backFunction);
    return;
  }

  // This will result in cachedDataCache being set once it is ready (used for some (e.g. GRO) search menu items)
  updateDataCacheWithWikiTreeExtract(extractedData, generalizedData);

  let menu = beginMainMenu();

  await addSearchMenus(menu, data, backFunction, "wikitree");

  if (extractedData.pageType == "editFamily") {
    await addSetFieldsFromPersonDataMenuItem(menu, data, tabId);
    await addSetFieldsFromCitationMenuItem(menu, data, tabId);
  }

  addStandardMenuEnd(menu, data, backFunction);
}

initPopup("wikitree", setupWikiTreePopupMenu);
