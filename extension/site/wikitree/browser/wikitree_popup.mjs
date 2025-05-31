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
  emptyMenu,
  beginMainMenu,
  endMainMenu,
  addMenuItem,
  addMenuItemWithSubtitle,
  addItalicMessageMenuItem,
  addBackMenuItem,
  addMenuDivider,
  addBreak,
  displayBusyMessage,
  displayMessageWithIcon,
  displayMessageWithIconThenClosePopup,
  closePopup,
} from "/base/browser/popup/popup_menu_building.mjs";

import { addSavePersonDataMenuItem } from "/base/browser/popup/popup_person_data.mjs";

import { addStandardMenuEnd, buildMinimalMenuWithMessage } from "/base/browser/popup/popup_menu_blocks.mjs";
import {
  convertTimestampDiffToText,
  getPersonDataSubtitleText,
  getCitationObjectSubtitleText,
} from "/base/browser/popup/popup_utils.mjs";

import { getLatestCitation } from "/base/browser/popup/popup_citation.mjs";

import { addSearchMenus } from "/base/browser/popup/popup_search.mjs";
import { initPopup } from "/base/browser/popup/popup_init.mjs";
import { getLatestPersonData } from "/base/browser/popup/popup_person_data.mjs";

import { generalizeData } from "../core/wikitree_generalize_data.mjs";
import { wtApiGetRelatives, wtApiGetPeople, wtApiGetBio } from "./wikitree_api.mjs";
import { compareCensusTables, updateBiography } from "../core/wikitree_bio_tools.mjs";

import { GeneralizedData, dateQualifiers, DateObj } from "/base/core/generalize_data_utils.mjs";

import { options } from "/base/browser/options/options_loader.mjs";
import { CD } from "../../../base/core/country_data.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";

import { checkPermissionForSite } from "/base/browser/popup/popup_permissions.mjs";

async function checkIfWeHavePermissionsToUseApi(checkOnly) {
  const checkPermissionsOptions = {
    reason:
      "To get extra information for the WikiTree profile permission is needed to access api.wikitree.com to use API calls.",
    checkOnly: checkOnly,
  };
  let allowed = await checkPermissionForSite("*://api.wikitree.com/*", checkPermissionsOptions);
  return allowed;
}

var haveValidApiResponse = false;
var apiResponse = undefined;
var timeApiRequestMade = undefined;

function standardizeDate(dateString) {
  let parsedDate = DateUtils.parseDateString(dateString);
  if (!parsedDate.isValid) {
    return dateString;
  }
  return DateUtils.getStdShortFormDateString(parsedDate);
}

async function makeApiRequests(extractedData) {
  if (haveValidApiResponse) {
    return;
  }

  let havePermission = await checkIfWeHavePermissionsToUseApi(true);
  if (!havePermission) {
    return;
  }

  if (extractedData.pageType == "editFamily") {
    if (extractedData.familyMemberWikiId) {
      let ids = extractedData.familyMemberWikiId;
      if (extractedData.familyMemberSpouseWikiId) {
        ids += "," + extractedData.familyMemberSpouseWikiId;
      }
      let possibleSpouses = extractedData.familyMemberSpouses;
      if (possibleSpouses && possibleSpouses.length > 0) {
        for (let spouse of possibleSpouses) {
          if (spouse.wikiId != extractedData.familyMemberSpouseWikiId) {
            ids += "," + spouse.wikiId;
          }
        }
      }

      timeApiRequestMade = Date.now();
      const fields = "Id,Gender,Name,FirstName,MiddleName,LastNameAtBirth";
      wtApiGetPeople(ids, fields).then(
        function handleResolve(jsonData) {
          if (jsonData && jsonData.length > 0) {
            haveValidApiResponse = true;
            apiResponse = jsonData;
          }
        },
        function handleReject(reason) {
          // nothing to do here
        }
      );
    }
  } else {
    timeApiRequestMade = Date.now();
    const fields =
      "Id,Gender,Name,FirstName,MiddleName,LastNameAtBirth,LastNameCurrent,RealName,Nicknames,BirthDate,DeathDate";
    wtApiGetRelatives(extractedData.wikiId, fields, true, false, false, true).then(
      function handleResolve(jsonData) {
        if (jsonData && jsonData.length > 0) {
          haveValidApiResponse = true;
          apiResponse = jsonData;
        }
      },
      function handleReject(reason) {
        // nothing to do here
      }
    );
  }
}

function waitForAPIResponse() {
  const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

  return new Promise(async (resolve, reject) => {
    if (haveValidApiResponse) {
      resolve(apiResponse);
      return;
    }

    if (!timeApiRequestMade) {
      resolve(undefined);
      return;
    }

    let timeWaited = Date.now() - timeApiRequestMade;

    while (timeWaited < 1000 && !haveValidApiResponse) {
      await sleep(10);
      timeWaited = Date.now() - timeApiRequestMade;
    }

    if (haveValidApiResponse) {
      resolve(apiResponse);
      return;
    }

    resolve(undefined);
  });
}

async function updateGeneralizedDataUsingApiResponse(data) {
  //console.log("updateGeneralizedDataUsingApiResponse, apiResponse is");
  //console.log(apiResponse);

  function getApiPersonFromGetRelatives(wikiId) {
    //console.log("getApiPersonFromGetRelatives, apiResponse is");
    //console.log(apiResponse);
    let items = apiResponse[0].items;
    if (items && items.length) {
      for (let item of items) {
        if (item.key == wikiId) {
          return item.person;
        }
      }
    }
  }

  function getSpouseInfoFromApiPerson(apiPerson, wikiId) {
    wikiId = wikiId.replace(/\s/g, "_");
    if (apiPerson.Spouses && typeof apiPerson.Spouses == "object") {
      for (let spouseKey of Object.keys(apiPerson.Spouses)) {
        let spouse = apiPerson.Spouses[spouseKey];
        if (spouse) {
          //console.log("WTAPI Spouse Info:");
          //console.log(spouse);
          let spouseWikiId = spouse.Name.replace(/\s/g, "_");
          if (spouseWikiId == wikiId) {
            let result = {
              lnab: spouse.LastNameAtBirth,
              cln: spouse.LastNameCurrent,
              firstName: spouse.FirstName,
              middleName: spouse.MiddleName,
              prefName: spouse.RealName,
              nicknames: spouse.NickNames,
            };
            if (spouse.BirthDate && !spouse.BirthDate.startsWith("0000")) {
              result.birthDate = spouse.BirthDate;
            }
            if (spouse.DeathDate && !spouse.DeathDate.startsWith("0000")) {
              result.deathDate = spouse.DeathDate;
            }
            return result;
          }
        }
      }
    }
  }

  function getFatherInfoFromApiPerson(apiPerson, wikiId) {
    wikiId = wikiId.replace(/\s/g, "_");
    if (apiPerson.Father && apiPerson.Parents) {
      let father = apiPerson.Parents[apiPerson.Father];
      if (father) {
        let fatherWikiId = father.Name.replace(/\s/g, "_");
        if (fatherWikiId == wikiId) {
          return {
            lnab: father.LastNameAtBirth,
            cln: father.LastNameCurrent,
            firstName: father.FirstName,
            middleName: father.MiddleName,
            prefName: father.RealName,
            nicknames: father.NickNames,
          };
        }
      }
    }
  }

  function getMotherInfoFromApiPerson(apiPerson, wikiId) {
    wikiId = wikiId.replace(/\s/g, "_");
    if (apiPerson.Mother && apiPerson.Parents) {
      let mother = apiPerson.Parents[apiPerson.Mother];
      if (mother) {
        let motherWikiId = mother.Name.replace(/\s/g, "_");
        if (motherWikiId == wikiId) {
          return {
            lnab: mother.LastNameAtBirth,
            cln: mother.LastNameCurrent,
            firstName: mother.FirstName,
            middleName: mother.MiddleName,
            prefName: mother.RealName,
            nicknames: mother.NickNames,
          };
        }
      }
    }
  }

  function updatePersonWithApiInfo(person, apiInfo) {
    //console.log("updatePersonWithApiInfo. apiInfo is:");
    //console.log(apiInfo);
    function updateValueIfNeeded(object, fieldName, apiValue) {
      if (apiValue && object[fieldName] != apiValue) {
        console.log("Due to WikiTree API, changing " + fieldName + " from " + object[fieldName] + " to " + apiValue);
        object[fieldName] = apiValue;
      }
    }

    updateValueIfNeeded(person, "lastNameAtBirth", apiInfo.lnab);
    updateValueIfNeeded(person, "lastNameAtDeath", apiInfo.cln);

    if (person.name) {
      updateValueIfNeeded(person.name, "lastName", apiInfo.lnab);
      let forenames = apiInfo.firstName;
      if (apiInfo.middleName) {
        if (forenames) {
          forenames += " ";
        }
        forenames += apiInfo.middleName;
      }
      updateValueIfNeeded(person.name, "forenames", forenames);
      if (apiInfo.prefName && apiInfo.prefName != forenames) {
        updateValueIfNeeded(person.name, "prefName", apiInfo.prefName);
      }
      updateValueIfNeeded(person.name, "nicknames", apiInfo.nicknames);
    }

    // possibly update dates
    if (apiInfo.birthDate) {
      if (!person.birthDate) {
        let dateString = DateUtils.getStdShortDateStringFromYearMonthDayString(apiInfo.birthDate);
        if (dateString) {
          person.birthDate = new DateObj();
          person.birthDate.dateString = dateString;
        }
      }
    }
    if (apiInfo.deathDate) {
      if (!person.deathDate) {
        let dateString = DateUtils.getStdShortDateStringFromYearMonthDayString(apiInfo.deathDate);
        if (dateString) {
          person.deathDate = new DateObj();
          person.deathDate.dateString = dateString;
        }
      }
    }
  }

  let havePermission = await checkIfWeHavePermissionsToUseApi(false);
  if (!havePermission) {
    return;
  }

  await waitForAPIResponse();
  if (!apiResponse) {
    return;
  }

  // Fix things that can be wrong in generalizedData in rare cases
  let ed = data.extractedData;
  if (!ed) {
    return;
  }
  let gd = data.generalizedData;
  if (!gd) {
    return;
  }

  let apiPerson = getApiPersonFromGetRelatives(ed.wikiId);
  if (!apiPerson) {
    return;
  }

  if (ed.spouses && gd.spouses && ed.spouses.length == gd.spouses.length) {
    for (let edSpouseIndex = 0; edSpouseIndex < ed.spouses.length; edSpouseIndex++) {
      let edSpouse = ed.spouses[edSpouseIndex];
      let gdSpouse = gd.spouses[edSpouseIndex];
      let apiInfo = getSpouseInfoFromApiPerson(apiPerson, edSpouse.wikiId);
      if (apiInfo) {
        updatePersonWithApiInfo(gdSpouse, apiInfo);
      }
    }
  }

  if (ed.parents && gd.parents) {
    if (ed.parents.father && gd.parents.father) {
      let edFather = ed.parents.father;
      let gdFather = gd.parents.father;
      let apiInfo = getFatherInfoFromApiPerson(apiPerson, edFather.wikiId);
      if (apiInfo) {
        updatePersonWithApiInfo(gdFather, apiInfo);
      }
    }
    if (ed.parents.mother && gd.parents.mother) {
      let edMother = ed.parents.mother;
      let gdMother = gd.parents.mother;
      let apiInfo = getMotherInfoFromApiPerson(apiPerson, edMother.wikiId);
      if (apiInfo) {
        updatePersonWithApiInfo(gdMother, apiInfo);
      }
    }
  }
}

function getPersonNameOrPronoun(gd, options) {
  let nameOption = options["narrative_general_nameOrPronoun"];

  let nameOrPronoun = "";

  function tryFirstName() {
    let name = gd.inferFirstName();
    if (name) {
      nameOrPronoun = name;
      return true;
    }
    return false;
  }

  function tryForenames() {
    let name = gd.inferForenames();
    if (name) {
      nameOrPronoun = name;
      return true;
    }
    return false;
  }

  function tryFullName() {
    let name = gd.inferFullName();
    if (name) {
      nameOrPronoun = name;
      return true;
    }
    return false;
  }

  function tryPronoun() {
    let gender = gd.inferPersonGender();
    if (gender == "male") {
      nameOrPronoun = "He";
      return true;
    } else if (gender == "female") {
      nameOrPronoun = "She";
      return true;
    }
    return false;
  }

  if (nameOption == "firstName") {
    if (!tryFirstName()) {
      if (!tryFullName()) {
        tryPronoun();
      }
    }
  } else if (nameOption == "forenames") {
    if (!tryForenames()) {
      if (!tryFullName()) {
        tryPronoun();
      }
    }
  } else if (nameOption == "fullName") {
    if (!tryFullName()) {
      tryPronoun();
    }
  } else if (nameOption == "pronoun") {
    if (!tryPronoun()) {
      if (!tryFirstName()) {
        tryFullName();
      }
    }
  }

  return nameOrPronoun;
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
        let parsedDate = DateUtils.parseDateString(dateString);
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

  //console.log("getWikiTreeAddMergeData, data is: ");
  //console.log(data);

  let result = {};

  let splitForenames = false;
  // If it is AddPerson then pageType will be "editFamily"
  if (data.extractedData.hasMiddleNameField || data.extractedData.pageType != "editFamily") {
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
  }

  if (splitForenames) {
    result.wereForenamesSplit = true;
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

  let cln = personGd.inferLastNameAtDeath(options);
  if (cln != result.lnab) {
    result.cln = cln;
  }

  let otherLastNamesArray = personGd.inferOtherLastNames([result.lnab, result.cln], options);
  if (otherLastNamesArray.length) {
    let otherLastNames = "";
    for (let oln of otherLastNamesArray) {
      if (oln) {
        if (otherLastNames) {
          otherLastNames += ", ";
        }
        otherLastNames += oln;
      }
    }
    if (otherLastNames) {
      result.otherLastNames = otherLastNames;
    }
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

  //console.log("getWikiTreeAddMergeData, result is: ");
  //console.log(result);

  return result;
}

function updateAfterCheckWtPersonData(data, wtPersonData) {
  // this is called after checkWtPersonData is done.
  // If the user added a country we need to recheck whether to splt middle names

  // if forenames were already split that implies either the split option was set to always
  // or one of the places had a country that meant they should be split
  if (wtPersonData.wereForenamesSplit) {
    return;
  }

  if (!data.extractedData.hasMiddleNameField) {
    return;
  }

  const splitForenamesOpt = options.addMerge_general_splitForenames;
  if (splitForenamesOpt != "countrySpecific") {
    return;
  }

  if (
    !wtPersonData.birthLocationModified &&
    !wtPersonData.deathLocationModified &&
    !wtPersonData.marriageLocationModified
  ) {
    return;
  }

  if (wtPersonData.middleName) {
    return; // there is data in the middle name field already
  }

  // at least one location was changed, implies one was missing country before
  let numUsing = 0;
  let numNotUsing = 0;
  let birthUsing = false;
  function checkCountry(fieldName) {
    const placeName = wtPersonData[fieldName];
    if (placeName) {
      let country = CD.matchCountryFromPlaceName(placeName);
      if (country) {
        if (country.usesMiddleNames) {
          numUsing++;
          if (fieldName == "birthLocation") {
            birthUsing = true;
          }
        } else {
          numNotUsing++;
        }
      }
    }
  }

  checkCountry("birthLocation");
  checkCountry("deathLocation");
  checkCountry("marriageLocation");

  let splitForenames = false;
  if (numUsing > 0 && numNotUsing == 0) {
    splitForenames = true;
  } else if (birthUsing) {
    splitForenames = true;
  }

  if (splitForenames) {
    let forenames = wtPersonData.firstName;
    wtPersonData.firstName = StringUtils.getFirstWord(forenames);
    wtPersonData.middleName = StringUtils.getWordsAfterFirstWord(forenames);
  }
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
      let treePrefix = "/tree/person/details/";
      let treePrefixIndex = url.indexOf(treePrefix);
      if (treePrefixIndex == -1) {
        treePrefix = "/tree/person/sources/";
        treePrefixIndex = url.indexOf(treePrefix);
      }
      if (treePrefixIndex == -1) {
        treePrefix = "/tree/person/vitals/";
        treePrefixIndex = url.indexOf(treePrefix);
      }
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
        linkString = "[" + url + " FamilySearch profile]";
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

async function getWikiTreeMergeEditData(data, personData, citationObject) {
  const checkPermissionsOptions = {
    reason: "To initiate a merge/edit the extension needs access to wikitree.com.",
  };
  let allowed = await checkPermissionForSite("*://*.wikitree.com/*", checkPermissionsOptions);
  if (!allowed) {
    closePopup();
    return;
  }

  let personEd = personData.extractedData;
  let personGd = personData.generalizedData;
  let result = getWikiTreeAddMergeData(data, personEd, personGd, citationObject);
  result.bio = "";
  result.sources = "";

  let canIncludeBmdBioLines = true;
  let needsBioText = false;
  if (citationObject && options.addMerge_mergeEdit_includeCitation) {
    let citationText = citationObject.citation;
    if (citationText) {
      needsBioText = true;
      // Note, if this is not an inline citation it should go after Sources
      // however I haven't yet found a way to make that happen
      if (citationObject.type == "source") {
        result.sources = citationText;
      } else {
        result.bio = citationText;
        canIncludeBmdBioLines = false;
      }
    }
  }

  if (!citationObject && options.addMerge_mergeEdit_includeAllCitations) {
    let allCitationsText = personData.allCitationsString;
    if (allCitationsText) {
      needsBioText = true;
      if (personData.allCitationsType == "source") {
        result.sources = allCitationsText;
      } else {
        result.bio = allCitationsText;
        canIncludeBmdBioLines = false;
      }
    }
  }

  if (canIncludeBmdBioLines) {
    if (options.addMerge_mergeEdit_includeBirthLine) {
      let birthLine = getBirthLine(personGd);
      if (birthLine) {
        if (!result.bio) {
          result.bio = "";
        } else {
          result.bio += "\n\n";
        }
        result.bio += birthLine;
        needsBioText = true;
      }
    }

    let nameOrPronoun = getPersonNameOrPronoun(personGd, options);

    if (nameOrPronoun) {
      // we want to follow some of the narrative options here but can't use NarrativeBuilder because
      // we don't (necessarily) have an eventGd.
      if (options.addMerge_mergeEdit_includeMarriageLines && personGd.spouses) {
        let marriageLines = getMarriageLines(personGd, nameOrPronoun);
        if (marriageLines) {
          if (!result.bio) {
            result.bio = "";
          } else {
            result.bio += "\n\n";
          }
          result.bio += marriageLines;
          needsBioText = true;
        }
      }

      if (options.addMerge_mergeEdit_includeDeathLine) {
        let deathLine = getDeathLine(personGd, nameOrPronoun);
        if (deathLine) {
          if (!result.bio) {
            result.bio = "";
          } else {
            result.bio += "\n\n";
          }
          result.bio += deathLine;
          needsBioText = true;
        }
      }
    }
  }

  // optionally add a "See also:" link to the person profile
  if (personGd.sourceType == "profile" && options.addMerge_mergeEdit_includeProfileLink) {
    let linkString = getProfileLinkForAddMerge(personEd, personGd);

    if (linkString) {
      needsBioText = true;
      result.seeAlso = "See also:\n";
      result.seeAlso += "* " + linkString;
    }
  }

  if (needsBioText && data.extractedData.wikiId) {
    try {
      let responses = await wtApiGetBio(data.extractedData.wikiId);
      if (responses.length == 1) {
        let response = responses[0];
        if (response.bio) {
          result.existingBioText = response.bio;
        }
      }
    } catch (error) {
      // api access failed, continue without existing bio
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

function getBirthLine(personGd) {
  let parentsLine = "";

  let fullName = personGd.inferFullName();

  let birthDateString = "";
  let birthDateObj = personGd.birthDate;
  if (birthDateObj) {
    let format = options.narrative_general_dateFormat;
    let highlight = options.narrative_general_dateHighlight;
    birthDateString = personGd.getNarrativeDateFormat(birthDateObj, format, highlight, true);
  }

  let birthPlace = "";
  let birthPlaceObj = personGd.inferBirthPlaceObj();
  if (birthPlaceObj) {
    birthPlace = personGd.inferBirthPlace();
    if (birthPlace) {
      let preposition = birthPlaceObj.getPreposition();
      birthPlace = preposition + " " + birthPlace;
    }
  }

  let parentNames = personGd.inferParentNamesForDataString();
  let fatherName = parentNames.fatherName;
  let motherName = parentNames.motherName;

  if (fullName && (birthDateString || birthPlace || fatherName || motherName)) {
    parentsLine += fullName;
    if (birthDateString || birthPlace) {
      parentsLine += " was born";
      if (birthDateString) {
        parentsLine += " " + birthDateString;
      }
      if (birthPlace) {
        parentsLine += " " + birthPlace;
      }
    }

    if (fatherName || motherName) {
      parentsLine += ", ";
      if (personGd.personGender == "male") {
        parentsLine += "son";
      } else if (personGd.personGender == "female") {
        parentsLine += "daughter";
      } else {
        parentsLine += "child";
      }
      parentsLine += " of ";

      if (fatherName && motherName) {
        parentsLine += fatherName + " and " + motherName;
      } else if (fatherName) {
        parentsLine += fatherName;
      } else {
        parentsLine += motherName;
      }
    }

    parentsLine += ".";
  }
  return parentsLine;
}

function getMarriageLines(personGd, nameOrPronoun) {
  let resultText = "";

  for (let spouse of personGd.spouses) {
    let spouseName = spouse.name.inferFullName();
    let marriageDateString = "";
    let marriageDateObj = spouse.marriageDate;
    if (marriageDateObj) {
      let format = options.narrative_general_dateFormat;
      let highlight = options.narrative_general_dateHighlight;
      marriageDateString = personGd.getNarrativeDateFormat(marriageDateObj, format, highlight, true);
    }
    let marriagePlaceString = "";
    let marriagePlaceObj = spouse.marriagePlace;
    if (marriagePlaceObj && marriagePlaceObj.placeString) {
      let preposition = marriagePlaceObj.getPreposition();
      marriagePlaceString = preposition + " " + marriagePlaceObj.placeString;
    }

    if (spouseName && marriageDateString) {
      let marriageString = nameOrPronoun + " married " + spouseName + " " + marriageDateString;
      if (marriagePlaceString) {
        marriageString += " " + marriagePlaceString;
      }
      if (!resultText) {
        resultText = "";
      } else {
        resultText += "\n\n";
      }
      resultText += marriageString + ".";
    }
  }
  return resultText;
}

function getDeathLine(personGd, nameOrPronoun) {
  let resultText = "";

  let deathDateString = "";
  let deathDateObj = personGd.inferDeathDateObj();
  if (deathDateObj) {
    let format = options.narrative_general_dateFormat;
    let highlight = options.narrative_general_dateHighlight;
    deathDateString = personGd.getNarrativeDateFormat(deathDateObj, format, highlight, true);
  }

  let deathPlaceObj = personGd.inferDeathPlaceObj();
  let deathPlace = personGd.inferDeathPlace();
  if (deathPlaceObj && deathPlace) {
    let preposition = deathPlaceObj.getPreposition();
    deathPlace = preposition + " " + deathPlace;
  }

  if (deathDateString) {
    let deathString = nameOrPronoun + " died " + deathDateString;
    if (deathPlace) {
      deathString += " " + deathPlace;
    }
    if (!resultText) {
      resultText = "";
    } else {
      resultText += "\n\n";
    }
    resultText += deathString + ".";
  }
  return resultText;
}

async function getWikiTreeEditFamilyData(data, personData, citationObject) {
  // this input is:
  // data: the extracted data from the current page
  // personData: the stored person data which is extractedData and generalizedData (not as objects)
  let personEd = personData.extractedData;
  let personGd = personData.generalizedData;

  function getGenderAndBirthNameFromApiResponse(wikiId) {
    let apiIdObj = apiResponse[0].resultByKey[wikiId];
    if (apiIdObj) {
      let apiPerson = apiResponse[0].people[apiIdObj.Id];
      if (apiPerson) {
        if (apiPerson.Gender && apiPerson.LastNameAtBirth && apiPerson.FirstName) {
          return {
            gender: apiPerson.Gender,
            lnab: apiPerson.LastNameAtBirth,
            firstName: apiPerson.FirstName,
            middleName: apiPerson.MiddleName,
          };
        }
      }
    }

    return "";
  }

  function makeBirthNameFromApiInfo(apiInfo) {
    let birthName = "";
    if (apiInfo.firstName) {
      birthName = apiInfo.firstName;
    }
    if (apiInfo.middleName) {
      if (birthName) {
        birthName += " ";
      }
      birthName += apiInfo.middleName;
    }
    if (apiInfo.lnab) {
      if (birthName) {
        birthName += " ";
      }
      birthName += apiInfo.lnab;
    }
    return birthName;
  }

  async function getPageParentsForAddingChild(otherParentName, otherParentWikiId) {
    let parents = {};
    parents.genderKnown = false;

    let pageParent1Name = data.extractedData.familyMemberName; // we don't actually know gender
    let pageParent2Name = otherParentName;
    let pageParent1WikiId = data.extractedData.familyMemberWikiId;
    let pageParent2WikiId = otherParentWikiId;
    let pageParent1Gender = "";
    let pageParent2Gender = "";
    let pageParent1BirthName = pageParent1Name;
    let pageParent2BirthName = pageParent2Name;

    await waitForAPIResponse();

    //console.log("getPageParentsForAddingChild ");

    if (apiResponse) {
      //console.log("getWikiTreeEditFamilyData, apiResponse is:");
      //console.log(apiResponse);

      let pageParent1Info = getGenderAndBirthNameFromApiResponse(pageParent1WikiId);
      if (pageParent1Info) {
        pageParent1Gender = pageParent1Info.gender;
        pageParent1BirthName = makeBirthNameFromApiInfo(pageParent1Info);
        parents.genderKnown = true;
      }

      if (pageParent2WikiId) {
        let pageParent2Info = getGenderAndBirthNameFromApiResponse(pageParent2WikiId);

        if (pageParent2Info) {
          pageParent2Gender = pageParent2Info.gender;
          pageParent2BirthName = makeBirthNameFromApiInfo(pageParent2Info);
          parents.genderKnown = true;
        }
      }
    }

    //console.log("getWikiTreeEditFamilyData, parents is:");
    //console.log(parents);

    if (!parents.genderKnown) {
      let parent1HasParen = false;
      if (pageParent1Name) {
        let birthName = pageParent1Name.replace(/^([^\(]+)\(([^\)]+)\)([^\(\)]+)$/, "$1$2");
        if (birthName && birthName != pageParent1Name) {
          pageParent1BirthName = birthName;
          parent1HasParen = true;
        }
      }

      let parent2HasParen = false;
      if (pageParent2Name) {
        let birthName = pageParent2Name.replace(/^([^\(]+)\(([^\)]+)\)([^\(\)]+)$/, "$1$2");
        if (birthName && birthName != pageParent2Name) {
          pageParent2BirthName = birthName;
          parent2HasParen = true;
        }
      }

      // first try to determine father by LNAB
      let childLnab = data.extractedData.lnab;

      let p1MatchesLnab = pageParent1Name && pageParent1BirthName.endsWith(" " + childLnab);
      let p2MatchesLnab = pageParent2Name && pageParent2BirthName.endsWith(" " + childLnab);

      //console.log("getPageParentsForAddingChild, p1MatchesLnab: " + p1MatchesLnab);
      //console.log("getPageParentsForAddingChild, p2MatchesLnab: " + p2MatchesLnab);

      if (p1MatchesLnab && !p2MatchesLnab) {
        pageParent1Gender = "Male";
        pageParent2Gender = "Female";
        parents.genderKnown = true;
      } else if (p2MatchesLnab && !p1MatchesLnab) {
        pageParent2Gender = "Male";
        pageParent1Gender = "Female";
        parents.genderKnown = true;
      } else if (p2MatchesLnab && p1MatchesLnab) {
        // both match, check for a Scotland case like:
        //  "John (Campbell) Campbell IInd of Wester Loudoun"
        let p1HasExtendedLnabAsCLN = false;
        let p2HasExtendedLnabAsCLN = false;

        if (parent1HasParen) {
          let lnab = pageParent1Name.replace(/^([^\(]+)\(([^\)]+)\)([^\(\)]+)$/, "$2").trim();
          let cln = pageParent1Name.replace(/^([^\(]+)\(([^\)]+)\)([^\(\)]+)$/, "$3").trim();
          if (cln.startsWith(lnab + " ")) {
            p1HasExtendedLnabAsCLN = true;
          }
        }

        if (parent2HasParen) {
          let lnab = pageParent2Name.replace(/^([^\(]+)\(([^\)]+)\)([^\(\)]+)$/, "$2").trim();
          let cln = pageParent2Name.replace(/^([^\(]+)\(([^\)]+)\)([^\(\)]+)$/, "$3").trim();
          if (cln.startsWith(lnab + " ")) {
            p2HasExtendedLnabAsCLN = true;
          }
        }

        if (p1HasExtendedLnabAsCLN && !p2HasExtendedLnabAsCLN) {
          pageParent1Gender = "Male";
          pageParent2Gender = "Female";
          parents.genderKnown = true;
        } else if (p2HasExtendedLnabAsCLN && !p1HasExtendedLnabAsCLN) {
          pageParent2Gender = "Male";
          pageParent1Gender = "Female";
          parents.genderKnown = true;
        }
      }

      if (!parents.genderKnown) {
        // still not known, try using presence of former name - but not a valid way for some countries
        if (pageParent1Name && pageParent2Name) {
          if (parent1HasParen && !parent2HasParen) {
            pageParent2Gender = "Male";
            pageParent1Gender = "Female";
            parents.genderKnown = true;
          } else {
            if (!parent1HasParen && parent2HasParen) {
              parents.genderKnown = true;
            }
            pageParent1Gender = "Male";
            pageParent2Gender = "Female";
          }
        } else if (pageParent1Name) {
          if (parent1HasParen) {
            pageParent1Gender = "Female";
            parents.genderKnown = true;
          } else {
            pageParent1Gender = "Male";
          }
        }
      }
    }

    if (pageParent1Name && pageParent2Name) {
      if (pageParent1Gender == "Male") {
        parents.fatherName = pageParent1BirthName;
        parents.fatherWikiId = pageParent1WikiId;
        parents.motherName = pageParent2BirthName;
        parents.motherWikiId = pageParent2WikiId;
      } else {
        parents.fatherName = pageParent2BirthName;
        parents.fatherWikiId = pageParent2WikiId;
        parents.motherName = pageParent1BirthName;
        parents.motherWikiId = pageParent1WikiId;
      }
    } else if (pageParent1Name) {
      if (pageParent1Gender == "Male") {
        parents.fatherName = pageParent1BirthName;
        parents.fatherWikiId = pageParent1WikiId;
      } else {
        parents.motherName = pageParent1BirthName;
        parents.motherWikiId = pageParent1WikiId;
      }
    }

    //console.log("getWikiTreeEditFamilyData, returning parents:");
    //console.log(parents);

    return parents;
  }

  function getPageParentsForAddingSibling(father, mother) {
    let parents = {};
    parents.genderKnown = false;

    if (father && father.name) {
      parents.fatherName = father.name;
      parents.fatherWikiId = father.wikiId;
      parents.genderKnown = true;
    }

    if (mother && mother.name) {
      // Remove married name from mother if present
      let birthName = mother.name.replace(/^([^\(]+)\(([^\)]+)\)([^\(\)]+)$/, "$1$2");
      if (birthName && birthName != mother.name) {
        mother.name = birthName;
      }

      parents.motherName = mother.name;
      parents.motherWikiId = mother.wikiId;
      parents.genderKnown = true;
    }

    return parents;
  }

  function generateParentsLineGivenPageParents(fullName, birthDateString, birthPlace, pageParents) {
    let parentsLine = "";

    let fatherName = "";
    let motherName = "";
    let fatherWikiId = "";
    let motherWikiId = "";
    if (addIntroOpt == "fromSavedData" || !pageParents) {
      let parentNames = personGd.inferParentNamesForDataString();
      fatherName = parentNames.fatherName;
      motherName = parentNames.motherName;
    } else if (addIntroOpt == "fromPageData") {
      if (pageParents.fatherName) {
        fatherName = pageParents.fatherName;
        fatherWikiId = pageParents.fatherWikiId;
      }
      if (pageParents.motherName) {
        motherName = pageParents.motherName;
        motherWikiId = pageParents.motherWikiId;
      }
    } else if (addIntroOpt == "fromBoth") {
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

    if (fullName && (birthDateString || birthPlace || fatherName || motherName)) {
      parentsLine += fullName;
      if (birthDateString || birthPlace) {
        parentsLine += " was born";
        if (birthDateString) {
          parentsLine += " " + birthDateString;
        }
        if (birthPlace) {
          parentsLine += " " + birthPlace;
        }
      }

      if (fatherName || motherName) {
        parentsLine += ", ";
        if (personGd.personGender == "male") {
          parentsLine += "son";
        } else if (personGd.personGender == "female") {
          parentsLine += "daughter";
        } else {
          parentsLine += "child";
        }
        parentsLine += " of ";

        if (options.addMerge_addPerson_includeLinks) {
          if (fatherName && fatherWikiId) {
            fatherName = "[[" + fatherWikiId + "|" + fatherName + "]]";
          }
          if (motherName && motherWikiId) {
            motherName = "[[" + motherWikiId + "|" + motherName + "]]";
          }
        }

        if (fatherName && motherName) {
          parentsLine += fatherName + " and " + motherName;
        } else if (fatherName) {
          parentsLine += fatherName;
        } else {
          parentsLine += motherName;
        }
      }

      parentsLine += ".";
    }
    return parentsLine;
  }

  async function generateParentsLine(fullName, birthDateString, birthPlace) {
    let relationship = data.extractedData.relationshipToFamilyMember;

    let parentsLine = "";

    let pageParents = {};
    if (relationship == "child") {
      let otherParentName = data.extractedData.familyMemberSpouseName;
      let otherParentWikiId = data.extractedData.familyMemberSpouseWikiId;

      pageParents = await getPageParentsForAddingChild(otherParentName, otherParentWikiId);
      parentsLine = generateParentsLineGivenPageParents(fullName, birthDateString, birthPlace, pageParents);

      result.childParentLines = {};
      let noneParents = await getPageParentsForAddingChild("", "");
      let noneLine = generateParentsLineGivenPageParents(fullName, birthDateString, birthPlace, noneParents);
      result.childParentLines["none"] = noneLine;

      let possibleSpouses = data.extractedData.familyMemberSpouses;
      if (possibleSpouses && possibleSpouses.length > 0) {
        for (let spouse of possibleSpouses) {
          let parents = await getPageParentsForAddingChild(spouse.name, spouse.wikiId);
          let line = generateParentsLineGivenPageParents(fullName, birthDateString, birthPlace, parents);

          result.childParentLines[spouse.wikiId] = line;
        }
      }
    } else if (relationship == "sibling") {
      let father = data.extractedData.familyMemberFather;
      let mother = data.extractedData.familyMemberMother;

      result.siblingParentLines = [];

      function addCase(fatherChecked, motherChecked) {
        let caseFather = fatherChecked ? father : undefined;
        let caseMother = motherChecked ? mother : undefined;
        let caseParents = getPageParentsForAddingSibling(caseFather, caseMother);
        let caseParentsLine = generateParentsLineGivenPageParents(fullName, birthDateString, birthPlace, caseParents);
        result.siblingParentLines.push({ father: fatherChecked, mother: motherChecked, parentLine: caseParentsLine });
      }

      addCase(true, true);
      addCase(true, false);
      addCase(false, true);
      addCase(false, false);

      if (father && !father.checked) {
        father = undefined;
      }
      if (mother && !mother.checked) {
        mother = undefined;
      }
      pageParents = getPageParentsForAddingSibling(father, mother);
      parentsLine = generateParentsLineGivenPageParents(fullName, birthDateString, birthPlace, pageParents);
    } else {
      parentsLine = generateParentsLineGivenPageParents(fullName, birthDateString, birthPlace, undefined);
    }

    //console.log("generateParentsLine, returning parentsLine:");
    //console.log(parentsLine);

    return parentsLine;
  }

  //console.log("getWikiTreeEditFamilyData, personGd is: ");
  //console.log(personGd);

  let result = getWikiTreeAddMergeData(data, personEd, personGd, citationObject);

  // Check whether to add {{Died Young}} sticker.
  let addDiedYoung = false;
  if (options.addMerge_addPerson_addDiedYoung) {
    let ageAtDeath = personGd.inferAgeAtDeath();
    if (ageAtDeath !== undefined) {
      if (ageAtDeath <= 15) {
        if (!personGd.spouses) {
          addDiedYoung = true;
        }
      }
    }
  }

  let intro = "";
  if (addDiedYoung) {
    let parameter = options.addMerge_addPerson_diedYoungParameter;
    let image = options.addMerge_addPerson_diedYoungImage;
    if (parameter && parameter != "default") {
      intro += "{{Died Young|" + parameter + "}}\n";
    } else if (image) {
      intro += "{{Died Young|image=" + image + "}}\n";
    } else {
      intro += "{{Died Young}}\n";
    }
  }

  // possibly add intro
  const addIntroOpt = options.addMerge_addPerson_generateIntro;
  if (addIntroOpt != "none") {
    // Example intro:
    // Cornelius Seddon was born in 1864 in Ashton in Makerfield, Lancashire, England, the son of Joseph Seddon and Ellen Tootell.

    let fullName = personGd.inferFullName();

    let birthDateString = "";
    let birthDateObj = personGd.birthDate;
    if (birthDateObj) {
      let format = options.narrative_general_dateFormat;
      let highlight = options.narrative_general_dateHighlight;
      birthDateString = personGd.getNarrativeDateFormat(birthDateObj, format, highlight, true);
    }

    let birthPlaceObj = personGd.inferBirthPlaceObj();
    let birthPlace = personGd.inferBirthPlace();
    if (birthPlaceObj && birthPlace) {
      let preposition = birthPlaceObj.getPreposition();
      birthPlace = preposition + " " + birthPlace;
    }

    result.parentLine = await generateParentsLine(fullName, birthDateString, birthPlace);
    intro += result.parentLine;
  }

  if (intro) {
    result.notes = intro;
  }

  let canIncludeMarriageAndDeathLines = true;

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
        canIncludeMarriageAndDeathLines = false;
      }
    }
  }

  if (!citationObject) {
    let allCitationsText = personData.allCitationsString;
    if (allCitationsText) {
      if (options.addMerge_addPerson_includeAllCitations) {
        let type = personData.allCitationsType;
        if (type == "source") {
          result.sources = allCitationsText;
        } else {
          if (!result.notes) {
            result.notes = "";
          } else if (type == "narrative") {
            result.notes += "\n\n";
          }

          result.notes += allCitationsText;
          canIncludeMarriageAndDeathLines = false;
        }
      }
    }
  }

  if (canIncludeMarriageAndDeathLines) {
    let nameOrPronoun = getPersonNameOrPronoun(personGd, options);

    if (nameOrPronoun) {
      // we want to follow some of the narrative options here but can't use NarrativeBuilder because
      // we don't (necessarily) have an eventGd.
      if (options.addMerge_addPerson_includeMarriageLines && personGd.spouses) {
        let marriageLines = getMarriageLines(personGd, nameOrPronoun);
        if (marriageLines) {
          if (!result.notes) {
            result.notes = "";
          } else {
            result.notes += "\n\n";
          }
          result.notes += marriageLines;
        }
      }

      if (options.addMerge_addPerson_includeDeathLine) {
        let deathLine = getDeathLine(personGd, nameOrPronoun);
        if (deathLine) {
          if (!result.notes) {
            result.notes = "";
          } else {
            result.notes += "\n\n";
          }
          result.notes += deathLine;
        }
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
        result.sources += "\nSee also:\n* ";
      }

      result.sources += linkString;
    }
  }

  // I used to only force advanced mode to on if I had something to put in the box.
  // but there were a lot of reports of people using the default option settings where
  // Set fields will have nothing there. But then the user pastes in the result of build all
  // citations with narratives into the Sources box which causes errors.
  // So now the new option forceAdvancedSourcing defaults to true, but the user can turn it off.
  if (options.addMerge_addPerson_forceAdvancedSourcing) {
    result.useAdvancedSourcingMode = true;
  } else if (result.notes || result.sources) {
    result.useAdvancedSourcingMode = true;
  } else {
    result.useAdvancedSourcingMode = false;
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
      displayBusyMessage("Setting fields ...");

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
        let message = "doSetFieldsFromPersonData failed";
        if (chrome.runtime.lastError && chrome.runtime.lastError.message) {
          message += ": " + chrome.runtime.lastError.message;
        }
        displayMessageWithIcon("warning", message);
      } else if (response.success) {
        // Used to display a message on success but that meant an extra click to close popup
        //displayMessageWithIconThenClosePopup("check", "Fields updated");
        closePopup();
      } else {
        let message = response.errorMessage;
        console.log(message);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function setFieldsFromPersonData(data, personData, tabId, citationObject, backFunction) {
  displayBusyMessage("Setting fields ...");

  let wtPersonData = await getWikiTreeEditFamilyData(data, personData, citationObject);

  function processFunction() {
    updateAfterCheckWtPersonData(data, wtPersonData);
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
        "Dr",
        "Dr.",
      ];
      for (let prefix of problemFirstNamePrefixes) {
        if (wtPersonData.firstName) {
          if (wtPersonData.firstName.startsWith(prefix + " ") || wtPersonData.firstName == prefix) {
            hasProblem = true;
            problemMessages.push(
              "First name at birth starts with '" + prefix + "'. This should probably be moved to the prefix."
            );
            break;
          }
        }
      }

      // check for quotes in first name
      if (wtPersonData.firstName && wtPersonData.firstName.includes('"')) {
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
          if (newValue != wtPersonData[fieldName]) {
            wtPersonData[fieldName + "Modified"] = true;
          }
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

  if (!wtPersonData) {
    return;
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

async function mergeEditFromPersonData(data, personData, citationObject, tabId, backFunction) {
  let wtPersonData = await getWikiTreeMergeEditData(data, personData, citationObject);

  function processFunction() {
    updateAfterCheckWtPersonData(data, wtPersonData);
    doMergeEditFromPersonData(data, wtPersonData);
  }

  checkWtPersonData(wtPersonData, processFunction, backFunction);
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

async function doShowAdditionalFields(tabId) {
  // send a message to content script
  try {
    chrome.tabs.sendMessage(tabId, { type: "showAdditionalFields" }, function (response) {
      // NOTE: must check lastError first in the if below so it doesn't report an unchecked error
      if (chrome.runtime.lastError || !response) {
        // possibly there is no content script loaded, this could be an error that should be reported
        // By testing edge cases I have found the if you reload the page and immediately click the
        // extension button sometimes this will happen. Presumably because the content script
        // just got unloaded prior to the reload but we got here because the popup had not been reset.
        // In this case we are seeing the response being undefined.
        // What to do in this case? Don't want to leave the "Initializing menu..." up.
        displayMessageWithIcon("warning", "doShowAdditionalFields failed");
      } else if (response.success) {
        // Used to display a message on success but that meant an extra click to close popup
        //displayMessageWithIconThenClosePopup("check", "Fields shown");
        closePopup();
      } else {
        let message = response.errorMessage;
        console.log(message);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function doCensusTablesImprovements(data, tabId, compareResult, biography) {
  let newBio = updateBiography(compareResult, biography);
  if (!newBio) {
    displayMessageWithIcon("warning", "Failed build a new biography.");
    return;
  }

  try {
    let response = await chrome.tabs.sendMessage(tabId, { type: "setBiography", biography: newBio });

    if (chrome.runtime.lastError) {
      displayMessageWithIcon("warning", "Failed to set biography in profile.");
    } else if (!response) {
      displayMessageWithIcon("warning", "Failed to set biography in profile.");
    } else if (!response.success) {
      displayMessageWithIcon("warning", "Failed to set biography in profile.");
    } else if (response.success) {
      displayMessageWithIconThenClosePopup("check", "Biography updated", "");
    }
  } catch (error) {
    console.log("caught error from sendMessage:");
    console.log(error);
    displayMessageWithIcon("warning", "Failed to set biography in profile.");
  }
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
    personData.generalizedData = gd;
    let menuText = "Set Fields from Person Data for:";
    let subtitleText = getPersonDataSubtitleText(gd, timeText);

    addMenuItemWithSubtitle(
      menu,
      menuText,
      function (element) {
        setFieldsFromPersonData(data, personData, tabId, null, backFunction);
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
    let personData = { extractedData: citationObject.extractedData, generalizedData: gd };

    let menuText = "Set Fields from Citation Data for:";
    let subtitleText = getCitationObjectSubtitleText(gd, timeText);

    addMenuItemWithSubtitle(
      menu,
      menuText,
      function (element) {
        setFieldsFromPersonData(data, personData, tabId, citationObject, backFunction);
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
    personData.generalizedData = gd;
    let menuText = "Merge Edit from Person Data for:";
    let subtitleText = getPersonDataSubtitleText(gd, timeText);

    addMenuItemWithSubtitle(
      menu,
      menuText,
      function (element) {
        mergeEditFromPersonData(data, personData, null, tabId, backFunction);
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
        let personData = { extractedData: citationObject.extractedData, generalizedData: gd };
        mergeEditFromPersonData(data, personData, citationObject, tabId, backFunction);
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

async function addShowAdditionalFieldsMenuItem(menu, tabId) {
  let menuText = "Show additional data fields";

  addMenuItem(menu, menuText, function (element) {
    doShowAdditionalFields(tabId);
  });
}

async function addImproveCensusTablesMenuItem(menu, data, tabId, backFunction) {
  addMenuItem(menu, "Improve census tables...", function (element) {
    setupImproveCensusTablesSubMenu(data, tabId, backFunction);
  });
}

async function addImproveAutoOnlyMenuItem(menu, data, tabId, compareResult, biography) {
  addMenuItem(menu, "Do auto improvements only...", function (element) {
    doCensusTablesImprovements(data, tabId, compareResult, biography);
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

async function setupImproveCensusTablesSubMenu2(data, tabId, backFunction, biography, jsonData) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  let toHereBackFunction = function () {
    setupMergeEditSubMenu(data, tabId, backFunction);
  };

  let compareResult = compareCensusTables(data, biography, jsonData);
  console.log("compareCensusTables returned:");
  console.log(compareResult);

  let message = "Improve census tables.";

  let diffs = undefined;
  if (compareResult) {
    if (compareResult.diffs) {
      diffs = compareResult.diffs;
      if (diffs.length) {
        message += "\nNumber of diffs : " + diffs.length;
      }
    }
  }

  addItalicMessageMenuItem(menu, message);

  if (diffs) {
    addImproveAutoOnlyMenuItem(menu, data, tabId, compareResult, biography);
  }

  endMainMenu(menu);
}

async function setupImproveCensusTablesSubMenu(data, tabId, backFunction) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  let toHereBackFunction = function () {
    setupMergeEditSubMenu(data, tabId, backFunction);
  };

  let biography = "";
  // send a message to content script to get the biography
  try {
    let response = await chrome.tabs.sendMessage(tabId, { type: "getBiography" });

    if (chrome.runtime.lastError) {
      displayMessageWithIcon("warning", "Failed to get biography from profile.");
    } else if (!response) {
      displayMessageWithIcon("warning", "Failed to get biography from profile.");
    } else if (!response.success) {
      displayMessageWithIcon("warning", "Failed to get biography from profile.");
    } else if (response.success) {
      biography = response.biography;
    }
  } catch (error) {
    console.log("caught error from sendMessage:");
    console.log(error);
    displayMessageWithIcon("warning", "Failed to get biography from profile.");
  }

  let improvePossible = true;
  if (!biography) {
    let message = "No biography found for this profile.";
    addItalicMessageMenuItem(menu, message);
    improvePossible = false;
  } else if (!biography.includes("{|")) {
    let message = "No tables in biography for this profile.";
    addItalicMessageMenuItem(menu, message);
    improvePossible = false;
  }

  if (improvePossible) {
    let message = "Requesting data for related profiles...";
    addItalicMessageMenuItem(menu, message);
    const fields =
      "Id,Gender,Name,FirstName,MiddleName,LastNameAtBirth,LastNameCurrent,RealName,Nicknames,BirthDate,DeathDate,Bio";
    wtApiGetRelatives(data.extractedData.wikiId, fields, true, true, true, true).then(
      function handleResolve(jsonData) {
        if (jsonData && jsonData.length > 0) {
          setupImproveCensusTablesSubMenu2(data, tabId, backFunction, biography, jsonData);
        }
      },
      function handleReject(reason) {
        // nothing to do here
      }
    );
  }

  endMainMenu(menu);
}

async function reportLoggedOut() {
  let fragment = document.createDocumentFragment();

  let messageDiv = document.createElement("div");

  let label = document.createElement("label");
  label.className = "messageLabel";
  label.innerText = "You are not logged into WikiTree. This may mean less data is extracted from the page";
  messageDiv.appendChild(label);

  fragment.appendChild(messageDiv);

  // add fragment to menu
  let menu = document.getElementById("menu");
  menu.appendChild(fragment);
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

  if (extractedData.pageType == "editFamily") {
    if (extractedData.editFamilyType == "steps" && extractedData.editFamilyTypeStep == "action") {
      let message = "WikiTree Sourcer can't extract useful data from this page.";
      message += "\n\nPlease continue to the next page if adding a person.";
      let data = { extractedData: extractedData };
      buildMinimalMenuWithMessage(message, data, backFunction);
      return;
    }
  }

  if (extractedData.pageType != "loggedOut") {
    makeApiRequests(extractedData);
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

  // This will rebuild the generalizedData if and when the WikiTree API call responds
  // It is only needed for rare cases like https://www.wikitree.com/wiki/Gilmour-1415 where the husband's
  // name has a space in it.
  // It also can get extra info like the birth and death dates of the parents - this can be used in
  // GRO search menu for GRO smart search for example.
  if (extractedData.pageType != "loggedOut") {
    updateGeneralizedDataUsingApiResponse(data);
  }

  // This will result in cachedDataCache being set once it is ready (used for some (e.g. GRO) search menu items)
  updateDataCacheWithWikiTreeExtract(extractedData, generalizedData);

  let menu = beginMainMenu();

  if (extractedData.pageType == "loggedOut") {
    reportLoggedOut();
  }

  await addSearchMenus(menu, data, backFunction, "wikitree");
  addMenuDivider(menu);

  if (extractedData.pageType == "editFamily") {
    if (extractedData.editFamilyType != "steps" || extractedData.editFamilyTypeStep == "basicData") {
      addMenuDivider(menu);
      await addSetFieldsFromPersonDataMenuItem(menu, data, tabId, backFunction);
      await addSetFieldsFromCitationMenuItem(menu, data, tabId, backFunction);
      addShowAdditionalFieldsMenuItem(menu, tabId);
    }
  } else if (
    extractedData.pageType == "read" ||
    extractedData.pageType == "private" ||
    extractedData.pageType == "searchPerson"
  ) {
    addMenuDivider(menu);
    await addMergeEditMenuItem(menu, data, tabId, backFunction);
    addSavePersonDataMenuItem(menu, data);
  } else if (extractedData.pageType == "edit") {
    addMenuDivider(menu);
    await addImproveCensusTablesMenuItem(menu, data, tabId, backFunction);
  }

  addStandardMenuEnd(menu, data, backFunction);
}

initPopup("wikitree", setupWikiTreePopupMenu);
