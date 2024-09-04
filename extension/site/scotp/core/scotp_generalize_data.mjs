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

import { GD, GeneralizedData, PlaceObj, NameObj } from "../../../base/core/generalize_data_utils.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { RT, RecordSubtype } from "../../../base/core/record_type.mjs";
import { getRecordType } from "./scotp_utils.mjs";
import { getRegistrationDistrict, getCountyDisplayName } from "./scotp_registration_districts.mjs";
import { getParishData } from "./scotp_parishes.mjs";
import { getRcParishDataFromNameAndCongregation } from "./scotp_rc_parishes.mjs";
import { getOtherParishDataFromNameAndCongregation } from "./scotp_other_parishes.mjs";
import { ScotpRecordType, SpField, SpFeature } from "./scotp_record_type.mjs";

function getCleanValueForRecordDataList(ed, fieldNames) {
  for (let fieldName of fieldNames) {
    let value = ed.recordData[fieldName];
    if (value) {
      return value;
    }
  }
}

function standardizePlaceName(placeName) {
  let stdName = placeName;
  if (StringUtils.isAllUppercase(placeName)) {
    stdName = StringUtils.toInitialCapsEachWord(placeName);
  }
  return stdName;
}

function standardizeCountyName(countyName) {
  let stdName = countyName;
  if (StringUtils.isAllUppercase(countyName)) {
    stdName = StringUtils.toInitialCapsEachWord(countyName);
  }
  return stdName;
}

function standardizeName(string) {
  return NameUtils.convertNameFromAllCapsToMixedCase(string);
}

function getRdNumber(ed) {
  let rdNumber = undefined;

  let reference = ed.recordData["Ref"];
  if (reference) {
    // there can be three numbers in the ref (at least)
    // the format change in the 22 Nov 2022 update.
    // For example "685/1 462" changed to "685 / 1 / 462" which extract now changes to "685/1/462"
    if (reference.includes("/")) {
      let spaceSplit = reference.trim().split(" ");
      let slashSplit = reference.trim().split("/");
      if (spaceSplit.length > 1) {
        rdNumber = spaceSplit[0];
      } else if (slashSplit.length > 2) {
        rdNumber = slashSplit[0].trim() + "/" + slashSplit[1].trim();
      } else if (slashSplit.length == 2) {
        // this case may be ambiguous for example:
        // "302/5" - is the RD number 302 or 302/5
        // for now assume it is 302
        rdNumber = slashSplit[0].trim();
      } else {
        rdNumber = reference.trim();
      }
    } else {
      rdNumber = reference;
    }

    if (rdNumber && rdNumber.endsWith("/")) {
      rdNumber = rdNumber.slice(0, -1);
    }
  }

  if (!rdNumber) {
    reference = ed.recordData["Parish Number"];
    if (reference) {
      if (reference.includes("/")) {
        rdNumber = reference.trim();
        if (rdNumber.endsWith("/")) {
          rdNumber = rdNumber.slice(0, -1);
        }
      }
    }
  }

  return rdNumber;
}

function getCountyNameFromSearchCriteria(ed) {
  let countyName = "";

  if (ed.searchCriteria) {
    let searchCounty = ed.searchCriteria["County/city"];

    if (!searchCounty) {
      // stat_deaths uses this
      searchCounty = ed.searchCriteria["County/city/minor records"];
    }

    if (searchCounty && searchCounty.toLowerCase() != "all") {
      const county = getCountyDisplayName(searchCounty);
      if (county) {
        countyName = county.display_county;
      } else {
        countyName = standardizeCountyName(searchCounty);
      }
    }
  }
  return countyName;
}

function getCountyNameFromRegistrationDistrict(ed, rdName, eventYear) {
  let countyName = "";

  let rdNumber = getRdNumber(ed);

  if (rdNumber) {
    const district = getRegistrationDistrict(rdNumber, rdName, eventYear);
    if (district.length >= 1) {
      const county = getCountyDisplayName(district[0].county);
      if (county) {
        countyName = county.display_county;
      }
    }
  }

  if (!countyName) {
    countyName = getCountyNameFromSearchCriteria(ed);
  }

  if (!countyName) {
    const parishes = getParishData(rdName, eventYear);
    if (parishes.length >= 1) {
      for (let parish of parishes) {
        if (parish.rdNo == rdNumber) {
          const county = getCountyDisplayName(parish.county);
          if (county) {
            countyName = county.display_county;
            break;
          }
        }
      }
      if (!countyName && parishes.length == 1) {
        const county = getCountyDisplayName(parishes[0].county);
        if (county) {
          countyName = county.display_county;
        }
      }
    }
  }

  return countyName;
}

function getCountyNameFromSearch(ed) {
  let result = "";
  let scotpRecordType = getRecordType(ed);

  if (ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.county)) {
    let countySearchParam = ScotpRecordType.getSearchParam(scotpRecordType, SpField.county);
    if (countySearchParam) {
      let userCounty = ed.searchCriteria[countySearchParam];
      if (userCounty) {
        // County is unusual, a lot of record types support county in search but do not show it in the results
        // So, if the user specified a county and it found this result use it
        result = userCounty;
      } else {
        // some record types do have the County or County/City in the search results
        let countyKey = ScotpRecordType.getRecordKey(scotpRecordType, SpField.county);
        if (countyKey) {
          let county = ed.recordData[countyKey];
          if (county) {
            result = county;
          }
        }
      }
    }
  }

  return result;
}

function getCountyNameFromOprParish(ed, townName, eventYear) {
  let countyName = "";

  // if there is a county in the search that is most reliable since parts
  // of a paris can be in separate counties
  let searchCounty = getCountyNameFromSearch(ed);
  if (searchCounty) {
    const county = getCountyDisplayName(searchCounty);
    if (county) {
      countyName = county.display_county;
    } else {
      countyName = standardizeCountyName(searchCounty);
    }
  } else {
    const parishes = getParishData(townName, eventYear);
    if (parishes.length >= 1) {
      let parishNumber = ed.recordData["Parish Number"];
      if (parishNumber) {
        parishNumber = parishNumber.trim(); // often has space on end
      }
      for (let parish of parishes) {
        let match = parish.rdNo == parishNumber;
        if (!match) {
          // after Nov 22 changes the Parish Number in recordData can be say "600" while it is "600/" in parishes
          if (parish.rdNo.endsWith("/")) {
            const cleanRdNo = parish.rdNo.substring(0, parish.rdNo.length - 1);
            match = cleanRdNo == parishNumber;
          }
        }
        if (match) {
          const county = getCountyDisplayName(parish.county);
          if (county) {
            countyName = county.display_county;
            break;
          }
        }
      }
      if (!countyName && parishes.length == 1) {
        const county = getCountyDisplayName(parishes[0].county);
        if (county) {
          countyName = county.display_county;
        }
      }
    }
  }

  return countyName;
}

function getCountyNameFromParishName(ed, townName, eventYear) {
  let countyName = "";

  const parish = getParishData(townName, eventYear);
  if (parish.length >= 1) {
    const county = getCountyDisplayName(parish[0].county);
    if (county) {
      countyName = county.display_county;
    }
  }

  if (!countyName) {
    countyName = getCountyNameFromSearchCriteria(ed);
  }

  return countyName;
}

function getCountyNameFromRcParishAndCongregationName(ed, parishName, congregationName) {
  let countyName = "";

  const parish = getRcParishDataFromNameAndCongregation(parishName, congregationName);
  if (parish.length >= 1) {
    const county = getCountyDisplayName(parish[0].county);
    if (county) {
      countyName = county.display_county;
    }
  }

  if (!countyName) {
    countyName = getCountyNameFromSearchCriteria(ed);
  }

  return countyName;
}

function getCountyNameFromOtherParishAndCongregationName(ed, parishName, congregationName) {
  let countyName = "";

  const parish = getOtherParishDataFromNameAndCongregation(parishName, congregationName);
  if (parish.length >= 1) {
    const county = getCountyDisplayName(parish[0].county);
    if (county) {
      countyName = county.display_county;
    }
  }

  if (!countyName) {
    countyName = getCountyNameFromSearchCriteria(ed);
  }

  return countyName;
}

function createScotlandPlace() {
  let place = new PlaceObj();
  place.country = "Scotland";
  return place;
}

function buildPlaceWithTownAndCountyName(townName, countyName) {
  let place = createScotlandPlace();

  if (countyName) {
    place.county = countyName;
  }

  let placeString = "";

  function addPlacePart(part) {
    if (part) {
      if (placeString) {
        placeString += ", ";
      }
      placeString += part;
    }
  }

  addPlacePart(standardizePlaceName(townName));
  addPlacePart(place.county);
  addPlacePart(place.country);

  if (placeString) {
    place.placeString = placeString;
  }

  return place;
}

function buildPlaceWith1891LdsPlaceAndAddress(placeName, address) {
  let place = createScotlandPlace();

  let censusPlace = placeName;
  if (censusPlace) {
    place.placeString = censusPlace;
  }
  let censusAddress = address;
  if (censusAddress) {
    const dwellingPrefix = "Dwelling: ";
    if (censusAddress.startsWith(dwellingPrefix)) {
      censusAddress = censusAddress.substring(dwellingPrefix.length);
    }
    place.streetAddress = censusAddress;
  }

  return place;
}

function buildPlaceWithStatutoryDistrictName(ed, rdName, year) {
  let county = getCountyNameFromRegistrationDistrict(ed, rdName, year);
  return buildPlaceWithTownAndCountyName(rdName, county);
}

function buildPlaceWithHieResidenceAndCountyName(residenceName, countyName) {
  if (countyName) {
    const countyEntry = getCountyDisplayName(countyName);
    if (countyEntry) {
      countyName = countyEntry.display_county;
    }
  }

  return buildPlaceWithTownAndCountyName(residenceName, countyName);
}

function buildPlaceWithCensusCountyAndDistrict(ed, rdName, countyName, year) {
  if (countyName && countyName.toLowerCase().startsWith("shipping")) {
    countyName = "";
  }

  if (countyName) {
    const countyEntry = getCountyDisplayName(countyName);
    if (countyEntry) {
      countyName = countyEntry.display_county;
    }
  }

  return buildPlaceWithTownAndCountyName(rdName, countyName);
}

function buildPlaceWithOprParishName(ed, parishName, year) {
  let county = getCountyNameFromOprParish(ed, ed.recordData["Parish"], year);
  return buildPlaceWithTownAndCountyName(parishName, county);
}

function buildPlaceWithRcParishCongregationName(placeName, ed) {
  // examples:
  //   "DUNFERMLINE - ST MARGARET'S UNITED SECESSION",
  //   "Airdrie, St Margaret's"

  if (StringUtils.isAllUppercase(placeName)) {
    placeName = StringUtils.toInitialCapsEachWord(placeName);
  }

  let congregationName = "";

  if (placeName) {
    const separator = ", ";
    let dashIndex = placeName.indexOf(separator);
    if (dashIndex != -1) {
      congregationName = placeName.substring(dashIndex + separator.length);
      placeName = placeName.substring(0, dashIndex).trim();
    } else {
      congregationName = placeName;
      placeName = ""; // we only want parish name, not congregation/church for search etc.
    }
  }

  let countyName = ed.recordData["County / City"];

  if (!countyName) {
    countyName = getCountyNameFromRcParishAndCongregationName(ed, placeName, congregationName);
  }

  let place = buildPlaceWithTownAndCountyName(placeName, countyName);

  if (congregationName) {
    place.streetAddress = congregationName;
  }

  return place;
}

function buildPlaceWithOtherParishCongregationName(parishAndCongregationName, ed) {
  // examples:
  //   "DUNFERMLINE - ST MARGARET'S UNITED SECESSION",
  //   "Airdrie, St Margaret's"

  if (StringUtils.isAllUppercase(parishAndCongregationName)) {
    parishAndCongregationName = StringUtils.toInitialCapsEachWord(parishAndCongregationName);
  }

  let parishName = "";
  let congregationName = "";

  if (parishAndCongregationName) {
    const separator = " - ";
    let dashIndex = parishAndCongregationName.indexOf(separator);
    if (dashIndex != -1) {
      congregationName = parishAndCongregationName.substring(dashIndex + separator.length);
      parishName = parishAndCongregationName.substring(0, dashIndex).trim();
    } else {
      congregationName = parishAndCongregationName;
      parishName = ""; // we only want parish name, not congregation/church for search etc.
    }
  }

  let countyName = ed.recordData["County / City"];

  if (!countyName) {
    countyName = getCountyNameFromOtherParishAndCongregationName(ed, parishAndCongregationName);

    if (!countyName) {
      // some parishes currently fail, try falling back to RC parishes
      countyName = getCountyNameFromRcParishAndCongregationName(ed, parishName, congregationName);
    }
  }

  let place = buildPlaceWithTownAndCountyName(parishName, countyName);

  if (congregationName) {
    place.streetAddress = congregationName;
  }

  return place;
}

function buildPlaceWithCourtName(ed, result, court, eventYear) {
  if (!court) {
    return;
  }

  if (court.toLowerCase().startsWith("non-")) {
    // e.g. "non-Scottish Court"
    result.courtName = court.trim();
    let place = new PlaceObj();
    place.placeString = "a non-Scottish court";
    return place;
  }

  // The court name is not that useful for a place name. e.g.
  // Glasgow Sheriff Court Inventories

  let townName = court;
  let courtName = court;

  let index = townName.indexOf("Sheriff");
  if (index != -1) {
    townName = townName.substring(0, index);
  }
  index = townName.indexOf("Commissary");
  if (index != -1) {
    townName = townName.substring(0, index);
  }
  index = townName.indexOf("Court");
  if (index != -1) {
    townName = townName.substring(0, index);
  }

  index = courtName.indexOf("Wills");
  if (index != -1) {
    courtName = courtName.substring(0, index);
  } else {
    index = courtName.indexOf("Inventories");
    if (index != -1) {
      courtName = courtName.substring(0, index);
    }
  }

  if (courtName) {
    result.courtName = courtName.trim();
  }

  townName = townName.trim();

  let countyName = "";
  if (townName) {
    // first check if the court name is a county name
    let countyEntry = getCountyDisplayName(townName);
    if (countyEntry) {
      countyName = townName;
      townName = "";
    } else {
      countyName = getCountyNameFromParishName(ed, townName, eventYear);
    }
  }

  return buildPlaceWithTownAndCountyName(townName, countyName);
}

function buildPlaceWithPrisonName(ed, prisonName, eventYear) {
  if (!prisonName) {
    return;
  }

  let townName = prisonName.trim();

  let countyName = "";
  if (townName) {
    // first check if the prison name is a county name
    let countyEntry = getCountyDisplayName(townName);
    if (countyEntry) {
      countyName = townName;
      townName = "";
    } else {
      countyName = getCountyNameFromParishName(ed, townName, eventYear);
    }
  }

  return buildPlaceWithTownAndCountyName(townName, countyName);
}

function setResultFieldFromRecordDataField(ed, dataKey, result, resultKey, toInitialCaps) {
  let value = ed.recordData[dataKey];
  if (value) {
    if (!/^\-+$/.test(value)) {
      if (toInitialCaps) {
        value = StringUtils.toInitialCapsEachWord(value);
      }
      result[resultKey] = value;
    }
  }
}

function setMothersMaidenName(ed, result, keys) {
  let mmn = "";

  for (let key of keys) {
    if (ed.recordData[key]) {
      mmn = ed.recordData[key];
      break;
    }
  }

  if (mmn) {
    if (!/^\-+$/.test(mmn)) {
      mmn = standardizeName(mmn);
      result.mothersMaidenName = mmn;
    }
  }
}

function cleanDdMonthYyyyDate(dateString) {
  if (!dateString) {
    return "";
  }

  if (/^\-+$/.test(dateString)) {
    return "";
  }

  // After 22 Nov 2022, sometimes, rather than 23 FEBRUARY 1854 we have 23/FEBRUARY/1854
  dateString = dateString.replace(/\s*\/\s*/g, " ");

  return StringUtils.toInitialCapsEachWord(dateString);
}

function cleanDdMmYyyyDate(dateString) {
  if (!dateString) {
    return "";
  }

  // ignore "-----"
  if (/^\-+$/.test(dateString)) {
    return "";
  }

  // sometimes (military_tribunals) there are dashes instead of slashes
  // e.g. 1917-03-09
  dateString = dateString.replace(/(\d)\s*\-\s*(\d)/g, "$1/$2");

  // After 22 Nov 2022, sometimes, rather than 25/6/1867 we have 25 / 6 / 1867
  dateString = dateString.replace(/\s*\/\s*/g, "/");

  if (dateString == "0/0/0") {
    return "";
  }

  let slashIndex = dateString.indexOf("/");
  if (slashIndex == -1) {
    return dateString; // assume year only
  }

  let day = dateString.substring(0, slashIndex).trim();

  let remainder = dateString.substring(slashIndex + 1);

  slashIndex = remainder.indexOf("/");
  if (slashIndex == -1) {
    return dateString; // not an expected format
  }

  let month = remainder.substring(0, slashIndex).trim();
  let year = remainder.substring(slashIndex + 1);

  // sometimes it is in the order year-month-day
  if (year.length < 3 || day.length > 2) {
    let swap = year;
    year = day;
    day = swap;
  }

  // interpret the day/month/year parts

  let dayNum = parseInt(day);
  if (dayNum == NaN) {
    return dateString;
  }
  if (dayNum < 1 || dayNum > 31) {
    return dateString;
  }

  while (day[0] == "0") {
    day = day.substring(1);
  }

  let monthNum = parseInt(month);
  if (monthNum != NaN) {
    if (month < 1 || month > 12) {
      return dateString;
    }
    const monthStrings = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    month = monthStrings[monthNum - 1];
  } else {
    return dateString;
  }

  if (year < 100 || year > 2500) {
    return dateString;
  }

  return day + " " + month + " " + year;
}

function getYearFromStandardizedDate(dateString) {
  if (dateString) {
    return GD.extractYearStringFromDateString(dateString);
  }

  return "";
}

function isFieldBlank(fieldString) {
  if (!fieldString || /^\-+$/.test(fieldString)) {
    return true;
  }
  return false;
}

function setSourcerRecordType(scotpRecordType, ed, result) {
  let recordType = ScotpRecordType.getSourcerRecordType(scotpRecordType);
  if (!recordType) {
    return;
  }

  // cr_burials is a special case where it can be a death or a burial
  if (scotpRecordType == "cr_burials") {
    let eventType = ed.recordData["Event"];
    if (eventType == "Death") {
      recordType = RT.Death;
    }
  } else if (scotpRecordType == "ch3_baptisms") {
    let birthDate = ed.recordData["Birth Date"];
    let baptismDate = ed.recordData["Baptism Date"];
    if (!baptismDate && birthDate) {
      recordType = RT.Birth;
    }
  }

  result.recordType = recordType;
}

function setSurnameAndForename(ed, result) {
  let lastName = standardizeName(ed.recordData["Surname"]);
  let forenames = standardizeName(getCleanValueForRecordDataList(ed, ["Forename", "Forenames"]));

  if (isFieldBlank(forenames)) {
    forenames = "";
  }

  result.setLastNameAndForenames(lastName, forenames);
}

function setFullName(ed, result) {
  let fullName = standardizeName(ed.recordData["Full Name"]);

  if (/^\-+$/.test(fullName)) {
    fullName = "";
  }

  result.setFullName(fullName);
}

function setName(scotpRecordType, ed, result) {
  if (scotpRecordType == "coa") {
    setFullName(ed, result);
  } else {
    setSurnameAndForename(ed, result);
  }
}

function setGender(scotpRecordType, ed, result) {
  let genderKey = ScotpRecordType.getRecordKey(scotpRecordType, SpField.gender);
  if (genderKey) {
    let gender = ed.recordData[genderKey];
    // somtimes gender is "U" for unknown, it that case do not add a gender to result
    result.setPersonGender(gender);
  }
}

function setCollectionReferenceData(scotpRecordType, ed, result) {
  // currently only census records use this
  let key = ScotpRecordType.getRecordKey(scotpRecordType, SpField.ref);
  if (key) {
    let value = ed.recordData[key];
    if (value) {
      // we use this to set the registrationNumber using the part before the space
      // The ref usually also contains the ED number but not using this yet
      let registrationNumber = "";
      let enumerationDistrict = "";
      let pageNumber = "";
      let spaceIndex = value.indexOf(" ");
      if (spaceIndex == -1) {
        registrationNumber = value;
      } else {
        let regNumber = value.substring(0, spaceIndex);
        let remainder = value.substring(spaceIndex + 1).trim();
        registrationNumber = regNumber;

        spaceIndex = remainder.indexOf(" ");
        if (spaceIndex == -1) {
          enumerationDistrict = remainder;
        } else {
          let enumDistrict = remainder.substring(0, spaceIndex);
          enumerationDistrict = enumDistrict;

          pageNumber = remainder.substring(spaceIndex + 1).trim();
        }
      }
      if (registrationNumber) {
        registrationNumber = registrationNumber.replace(/\/$/, ""); // remove trailing slash
        result.collectionData.registrationNumber = registrationNumber;
      }
      if (enumerationDistrict) {
        enumerationDistrict = enumerationDistrict.replace(/\/$/, ""); // remove trailing slash
        result.collectionData.enumerationDistrict = enumerationDistrict;
      }
      if (pageNumber) {
        result.collectionData.page = pageNumber;
      }
    }
  }
}

function setStatutoryCommonFields(ed, result) {
  result.setEventYear(ed.recordData["Year"]);
  result.setFieldIfValueExists("registrationDistrict", standardizePlaceName(ed.recordData["RD Name"]));

  result.eventPlace = buildPlaceWithStatutoryDistrictName(ed, ed.recordData["RD Name"], ed.recordData["Year"]);
}

function setOprCommonFields(ed, result, date) {
  let eventDate = cleanDdMmYyyyDate(date);
  result.setEventDate(eventDate);
  let eventYear = getYearFromStandardizedDate(eventDate);
  result.eventPlace = buildPlaceWithOprParishName(ed, ed.recordData["Parish"], eventYear);
}

function setMarriageData(ed, result, spouseSurname, spouseForenames, isFullName) {
  spouseSurname = standardizeName(spouseSurname);
  spouseForenames = standardizeName(spouseForenames);
  let spouseName = new NameObj();
  if (isFullName) {
    spouseName.name = spouseSurname;
  } else {
    if (spouseForenames) {
      spouseName.forenames = spouseForenames;
    }
    if (spouseSurname) {
      spouseName.lastName = spouseSurname;
    }
  }

  let spouse = {
    name: spouseName,
  };
  if (result.eventDate) {
    spouse.marriageDate = result.eventDate;
  }
  if (result.eventPlace) {
    spouse.marriagePlace = result.eventPlace;
  }
  result.spouses = [spouse];
}

function setDivorceData(ed, result, spouseSurname, spouseForenames, marriageDate) {
  spouseSurname = standardizeName(spouseSurname);
  spouseForenames = standardizeName(spouseForenames);
  let spouseName = new NameObj();
  if (spouseForenames) {
    spouseName.forenames = spouseForenames;
  }
  if (spouseSurname) {
    spouseName.lastName = spouseSurname;
  }

  let spouse = {
    name: spouseName,
  };
  if (marriageDate) {
    spouse.marriageDate = marriageDate;
  }
  result.spouses = [spouse];
}

function setWillsAndTestamentsRecordSubtype(ed, result) {
  // We want to decide on one of these subtypes:
  // "Probate"
  // "LettersOfAdministration" (intestate)
  // "Testament", Testament testamentar (testate)
  // "Testament",  Testament dative (intestate - equivalent of the English Letters of Administration)
  // "Testament", Trust disposition and settlement (applies to land)
  // "Inventory" (usually part of a testament process)
  // "AdditionalInventory", Additional Inventory or Eik after a will
  // "AdditionalInventory", Additional Inventory or Eik after a Testament dative
  // "Other", some other legal document in Wills and Testaments (unknown type)

  let courtName = ed.recordData["Court"];
  let willTestamentType = ed.recordData["Type"];
  let description = ed.recordData["Description"];

  let isNonScottishCourt = false;
  let actualCourtName = courtName;
  let textAfterCourtName = "";
  if (actualCourtName == "non-Scottish Court") {
    actualCourtName = "";
    isNonScottishCourt = true;
  } else {
    const courtText = "Court";
    let courtIndex = actualCourtName.indexOf("Court");
    if (courtIndex != -1) {
      let endIndex = courtIndex + courtText.length;
      let remainder = actualCourtName.substring(endIndex).trim();
      actualCourtName = actualCourtName.substring(0, endIndex);
      if (remainder) {
        textAfterCourtName = remainder;
      }
    }
  }

  // standardize for compares
  willTestamentType = willTestamentType.toLowerCase();
  willTestamentType = willTestamentType.replace(/\&/g, " and ");
  willTestamentType = willTestamentType.replace(/[;.,]$/, "");
  willTestamentType = willTestamentType.replace(/\s+/g, " ");

  let descriptionType = "";
  if (description) {
    let lcDesc = description.toLowerCase();
    lcDesc = lcDesc.replace(/[.,;\s]$/g, "");
    if (lcDesc.endsWith(" intestate")) {
      descriptionType = "intestate";
    } else if (lcDesc.endsWith(" testate")) {
      descriptionType = "testate";
    } else {
      // the term intestate or testate may be elsewhere withing the description
      lcDesc = description.toLowerCase();
      if (lcDesc.includes(", intestate,")) {
        descriptionType = "intestate";
      } else if (lcDesc.includes(", testate,")) {
        descriptionType = "testate";
      }
    }
  }
  result.testateOrIntestate = descriptionType;

  // these lists are checked in order and the first match is taken
  let exactMatches = [
    {
      subtype: "Probate",
      types: ["probate of will", "probate of the will", "note of probate"],
    },
    {
      subtype: "Testament",
      types: [
        "will",
        "will or deed",
        "last will and testament",
        "tt",
        "tt and i",
        "inventory; testament",
        "testament testamentar and inventory",
      ],
    },
    {
      subtype: "Testament",
      types: ["testament dative", "testament dative and inventory", "td", "td and i"],
    },
    {
      subtype: "Inventory",
      types: ["inventory", "inventory only", "extract inventory"],
    },
    {
      subtype: "AdditionalInventory",
      types: ["eik", "additional inventory", "2nd additional inventory"],
    },
    {
      subtype: "TrustDisposition",
      types: [
        "last deed and settlement",
        "deed of settlement",
        "trust disposition and deed of settlement",
        "disposition and settlement",
      ],
    },

    { subtype: "Other", types: ["will mislaid", "Testamentary writings"] },
  ];

  let startMatches = [
    { subtype: "Probate", typeStarts: ["probate"] },
    {
      subtype: "Testament",
      typeStarts: ["will", "last will", "testament testamentar", "tt", "t.", "t "],
    },
    { subtype: "Testament", typeStarts: ["testament dative", "td"] },
    { subtype: "Inventory", typeStarts: ["inventory", "i ", "i;", "i,"] },
    {
      subtype: "AdditionalInventory",
      typeStarts: ["eik", "additional inventory", "original confirmation granted", "confirmation ad omissa"],
    },
    {
      subtype: "Testament",
      typeStarts: ["last deed", "deed", "trust disposition", "disposition", "extract deed"],
    },
  ];

  // Examples encountered in the records:
  //
  // Will
  // Will or deed
  // Will mislaid
  // Probate of Will
  // Probate of the will (seen with "non-Scottish Court" only)
  // Note of Probate (seen with court "Edinburgh Sheriff Court Inventories" and an English address in Desc)
  // Certificate of Probate only (seen with court "Edinburgh Sheriff Court Wills" and an Englash address in Desc)
  // Last Will and Testament
  // Last Will and Testament and Codicils
  // Testament Dative
  // Testament Dative and Inventory  [or]  testament dative & inventory
  // TD&I
  // TT&I.
  // Testament Testamentar
  // Testament Testamentar and Inventory  [or]  testament testamentar & inventory
  // Testament Testamentar; Latter Will and Inventory
  // TT
  // TD
  // TD & Deed of S
  // Testamentary writings
  // Extract Extract Testament
  // T. 01/06/1874 SC1/37/73/p1003 See Also SC1/36/74/   [or]  T. 01/06/1874 SC1/37/73/p1003
  // T. 12/03/1869 SC1/37/63/p539 See Also SC1/36/64/7
  // T. Misc. Papers 20/10/1832 SC1/37/9/p827 See Als

  // I
  // Inventory
  // Inventory;
  // Inventory only
  // Inventory only. Eik granted 23/09/1908
  // Inventory; Settlement; Confirmed Testament Testamentar
  // Inventory; Settlement
  // Inventory, Settlement
  // Inventory ; Disposition ; Settlement
  // Inventory; Mutual Settlement
  // Inventory; Testament
  // Additional Inventory
  // 2nd Additional Inventory
  // Extract Inventory
  // Eik
  // Eik granted, 28/02/, to the above Executrices.
  // Eik granted, 07/03/, to above Executor.
  // Eik. See also Milne, Margaret.

  // Last Deed and Settlement
  // Deed of Settlement
  // Trust Disposition and Deed of Settlement; Codicil
  // Trust Disposition and Settlement with 2 Codicils
  // Trust Disposition and Settlement; Ratification
  // Disposition and Settlement
  // dispsoition and settlement and inventory
  // Extract Deed of Settlement

  // Confirmation of Executor
  // Confirmation of Executors only
  // Confirmation Dative only.

  // Holograph Testamentary Writing
  // Holograph Testament
  // Letters of administration
  // Letters of Administration Certificate only
  // Confirmation ad non executa granted 08/11/1923.
  // Confirmation ad omissa granted 23/10/1928.
  // Original Confirmation granted 22/01/1896.
  // Will or deed. Confirmation ad omissa granted 23/10/1928.
  // Inventory. Additional Inventory given up 02/07/1892
  // MD with sister, Janet Fairgrieve
  // Mutual Trust Disposition and Settlement with brother

  if (!willTestamentType) {
    // no type
    if (isNonScottishCourt) {
      if (willTestamentType.includes("probate")) {
        result.recordSubtype = "Probate";
      } else if (willTestamentType.startsWith("letters of")) {
        result.recordSubtype = "LettersOfAdministration";
      } else if (descriptionType == "testate") {
        result.recordSubtype = "Probate";
      } else if (descriptionType == "intestate") {
        result.recordSubtype = "LettersOfAdministration";
      } else {
        result.recordSubtype = "Probate"; // default for non-Scottish court
      }
    } else if (textAfterCourtName == "Inventories") {
      result.recordSubtype = "Inventory";
    } else {
      result.recordSubtype = "Testament";
    }
  } else {
    // we do have a type
    let isClassified = false;

    for (let entry of exactMatches) {
      let descType = entry.descType;
      if (!descType || descType == descriptionType) {
        if (entry.types && entry.types.length > 0) {
          if (entry.types.includes(willTestamentType)) {
            result.recordSubtype = entry.subtype;
            isClassified = true;
            break;
          }
        }
      }
    }

    if (!isClassified) {
      for (let entry of startMatches) {
        let descType = entry.descType;
        if (!descType || descType == descriptionType) {
          if (entry.typeStarts && entry.typeStarts.length > 0) {
            for (let start of entry.typeStarts) {
              if (willTestamentType.startsWith(start)) {
                result.recordSubtype = entry.subtype;
                isClassified = true;
                break;
              }
            }
          }
        }
        if (isClassified) {
          break;
        }
      }
    }

    if (!isClassified) {
      if (textAfterCourtName == "Inventories") {
        result.recordSubtype = "Inventory";
      } else if (textAfterCourtName == "Wills") {
        result.recordSubtype = "Testament";
      } else {
        result.recordSubtype = "Other";
      }
    }
  }

  // check the description for a death date
  if (description) {
    let deathDateIndex = description.search(/ d\. \d\d\/\d\d\/\d\d\d\d/);
    if (deathDateIndex != -1) {
      let deathDate = description.substring(deathDateIndex + 4, deathDateIndex + 14);
      let cleanDeathDate = cleanDdMmYyyyDate(deathDate);
      result.setDeathDate(cleanDeathDate);
    }
  }

  // check the type string for an additional "granted" date or "given up date"
  //   // Will or deed. Confirmation ad omissa granted 23/10/1928.
  // Inventory. Additional Inventory given up 02/07/1892
  if (willTestamentType) {
    function extractFullOrPartialDate(prefix) {
      let prefixIndex = willTestamentType.indexOf(prefix);
      if (prefixIndex != -1) {
        let remainder = willTestamentType.substring(prefixIndex + prefix.length);
        if (/^\d\d\/\d\d\/\d\d\d\d/.test(remainder)) {
          let date = remainder.substring(0, 10);
          let cleanDate = cleanDdMmYyyyDate(date);
          if (cleanDate) {
            return cleanDate;
          }
        } else if (/^\d\d\/\d\d\//.test(remainder)) {
          let date = remainder.substring(0, 6);
          let eventYear = result.inferEventYear();
          if (eventYear) {
            date += eventYear;
            let cleanDate = cleanDdMmYyyyDate(date);
            if (cleanDate) {
              return cleanDate;
            }
          }
        }
      }
    }

    let grantedDate = extractFullOrPartialDate(" granted ");
    if (grantedDate) {
      if (willTestamentType && willTestamentType.startsWith("original confirmation granted")) {
        result.originalConfirmationGrantedDate = grantedDate;
      } else {
        result.grantedDate = grantedDate;
      }
    } else {
      let givenDate = extractFullOrPartialDate(" given up ");
      if (givenDate) {
        result.givenDate = givenDate;
      }
    }
  }
}

function setRefPartsOfOtherDetails(result, otherDetailsSuffix, prefix, refKey) {
  let remainder = otherDetailsSuffix;

  // e.g. "FR 186" or "FR186"
  const regex1String = "^\\s*" + prefix + "\\s?(\\d+)\\s*$";
  const regex1 = new RegExp(regex1String);
  // e.g. "FR 186 (FR186)" or "FR186 (FR186)"
  const regex2String = "^\\s*" + prefix + "\\s?(\\d+)\\s+\\(" + prefix + "(\\d+)\\)\\s*$";
  const regex2 = new RegExp(regex2String);

  if (regex2.test(remainder)) {
    let number1 = remainder.replace(regex2, "$1");
    let number2 = remainder.replace(regex2, "$2");
    result.tempCollectionData[refKey] = number1;
    if (number2 != number1) {
      result.tempCollectionData[refKey + "2"] = number2;
    }
  } else if (regex1.test(remainder)) {
    let number1 = remainder.replace(regex1, "$1");
    result.tempCollectionData[refKey] = number1;
  }
}

function setParents(scotpRecordType, ed, result, dataKey) {
  let parentsDetails = ed.recordData[dataKey];

  if (!parentsDetails) {
    // It seems like the case changed over time do a closer check
    let lcDataKey = dataKey.toLowerCase();
    lcDataKey = lcDataKey.replace("/ ", "/").trim();

    for (let field in ed.recordData) {
      let lcKey = field.toLowerCase();
      lcKey = lcKey.replace("/ ", "/").trim();
      if (lcKey == lcDataKey) {
        parentsDetails = ed.recordData[field];
        break;
      }
    }
  }

  if (!parentsDetails) {
    return;
  }

  // Normally looks like: ARCHIBALD FRASER/MARY MCARTHUR
  // Can sometimes look like: THOMAS FRASER/----- NICOL
  // Or: JAMES FRASER/----- -----
  // Or: ----- FRASER/----- -----
  // Or: ----- -----/MARY FRASER
  // Or: ANDREW FRASER/ISABELLA EDWARDS MACWILLIAM
  // Or: ANDREW ROSS FRASER/ISABELLA ANN FRASER
  // Or: JAMES FRASER/M J FRASER
  // But it can also have a film reel number on the end like:
  // WILLIAM FAICHNEY/MARY FAICHNEY FR400 (FR400)

  if (/^\-+$/.test(parentsDetails)) {
    parentsDetails = "";
  }

  if (!parentsDetails) {
    return;
  }

  // filter the reference ed off the end of the string
  let frameNumberIndex = parentsDetails.search(/\s+FR\s?\d/);
  if (frameNumberIndex != -1) {
    let remainder = parentsDetails.substring(frameNumberIndex).trim();
    parentsDetails = parentsDetails.substring(0, frameNumberIndex);
    setRefPartsOfOtherDetails(result, remainder, "FR", "frameNumber");
  }

  // result.tempCollectionData.page
  let pageIndex = parentsDetails.search(/\s+PG\d/);
  if (pageIndex != -1) {
    let remainder = parentsDetails.substring(pageIndex).trim();
    parentsDetails = parentsDetails.substring(0, pageIndex);
    setRefPartsOfOtherDetails(result, remainder, "PG", "pageNumber");
  }

  const separator = "/";
  let separatorIndex = parentsDetails.indexOf(separator);

  let fatherName = "";
  let motherName = "";
  if (separatorIndex == -1) {
    // this never seems to happen for RCC records but can happen for an OPR death
    fatherName = parentsDetails;
  } else {
    fatherName = parentsDetails.substring(0, separatorIndex);
    motherName = parentsDetails.substring(separatorIndex + separator.length);
  }

  if (scotpRecordType == "opr_deaths") {
    // opr_deaths has a parents column but it can also contain spouse and maiden name, even spouse
    // and father. There is no obvious way to be sure it is parents unless the age of the deceased
    // is less than marriage age.
    let ageString = result.ageAtDeath;
    if (ageString === undefined || ageString === "") {
      return;
    }
    let ageNum = parseInt(ageString);
    if (ageNum == NaN) {
      return;
    }
    const minPossibleMarriageAge = 14;
    if (ageNum >= minPossibleMarriageAge) {
      return;
    }
    // otherwise we can go ahead and add parents
  }

  if (fatherName) {
    if (!/^[\-\s]*$/.test(fatherName)) {
      let father = result.addFather();
      father.name.name = standardizeName(fatherName);
    }
  }

  if (motherName) {
    if (!/^[\-\s]*$/.test(motherName)) {
      let mother = result.addMother();
      mother.name.name = standardizeName(motherName);
    }
  }
}

function generalizeData(input) {
  let ed = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "scotp";

  if (!ed || !ed.success) {
    return result; //the extract failed
  }

  let scotpRecordType = getRecordType(ed);

  if (!scotpRecordType) {
    return result; // unknown record or page type
  }

  result.sourceType = "record";

  result.tempCollectionData = {};

  setSourcerRecordType(scotpRecordType, ed, result);
  if (!result.recordType) {
    return result;
  }

  setName(scotpRecordType, ed, result);
  setGender(scotpRecordType, ed, result);

  switch (scotpRecordType) {
    case "stat_births":
      setStatutoryCommonFields(ed, result);
      result.lastNameAtBirth = result.name.lastName;
      setMothersMaidenName(ed, result, ["Mother's Maiden Name", "Mothers Maiden Name"]);
      result.birthPlace = result.eventPlace;
      result.birthDate = result.eventDate;
      break;

    case "stat_marriages":
      setStatutoryCommonFields(ed, result);
      setMarriageData(ed, result, ed.recordData["Spouse Surname"], ed.recordData["Spouse Forename"]);
      break;

    case "stat_deaths":
      setStatutoryCommonFields(ed, result);
      result.lastNameAtDeath = result.name.lastName;
      setMothersMaidenName(ed, result, ["Mother's Maiden Name", "Mothers Maiden Name"]);
      result.setFieldIfValueExists("ageAtDeath", ed.recordData["Age at death"]);
      result.deathPlace = result.eventPlace;
      result.deathDate = result.eventDate;
      break;

    case "stat_divorces":
      {
        result.setEventYear(ed.recordData["Divorce Year"]);

        let marriageDate = cleanDdMmYyyyDate(ed.recordData["Marriage Date"]);
        setDivorceData(ed, result, ed.recordData["Spouse Surname"], "", marriageDate);

        result.eventPlace = buildPlaceWithCourtName(ed, result, ed.recordData["Court"], ed.recordData["Divorce Year"]);
      }
      break;

    case "stat_civilpartnerships":
      setStatutoryCommonFields(ed, result);
      setMarriageData(ed, result, ed.recordData["Partner Surname"], "");
      break;

    case "stat_dissolutions":
      {
        result.setEventYear(ed.recordData["Dissolution Year"]);

        let partnerDate = cleanDdMmYyyyDate(
          getCleanValueForRecordDataList(ed, ["Civil Partnership Date", "Partnership Date"])
        );
        setDivorceData(ed, result, ed.recordData["Partner Surname"], "", partnerDate);

        result.eventPlace = buildPlaceWithCourtName(
          ed,
          result,
          ed.recordData["Court"],
          ed.recordData["Dissolution Year"]
        );
      }
      break;

    case "census":
      {
        result.setEventYear(ed.recordData["Year"]);
        result.setFieldIfValueExists(
          "ageAtEvent",
          getCleanValueForRecordDataList(ed, ["Age at census", "Age at Census"])
        );
        result.setFieldIfValueExists("registrationDistrict", ed.recordData["RD Name"]);
        result.eventPlace = buildPlaceWithCensusCountyAndDistrict(
          ed,
          ed.recordData["RD Name"],
          ed.recordData["County / City"],
          ed.recordData["Year"]
        );
      }
      break;

    case "census_lds":
      {
        result.setEventYear(ed.recordData["Year"]);
        result.setFieldIfValueExists(
          "ageAtEvent",
          getCleanValueForRecordDataList(ed, ["Age at census", "Age at Census"])
        );
        // can we extract registrationDistrict from censusPlace?
        result.eventPlace = buildPlaceWith1891LdsPlaceAndAddress(
          ed.recordData["Census Place"],
          ed.recordData["Address"]
        );
        result.setBirthPlace(ed.recordData["Birth Place"]);
      }
      break;

    case "opr_births":
      let date = getCleanValueForRecordDataList(ed, ["Birth/Baptism Date", "Birth Date"]);
      setOprCommonFields(ed, result, date);
      setParents(scotpRecordType, ed, result, "Parents/Other details");
      break;

    case "opr_deaths":
      setOprCommonFields(ed, result, ed.recordData["Date"]);
      result.setFieldIfValueExists("ageAtDeath", ed.recordData["Age"]);
      setParents(scotpRecordType, ed, result, "Parents/Other details");
      break;

    case "opr_marriages":
      {
        setOprCommonFields(ed, result, ed.recordData["Date"]);
        result.recordSubtype = RecordSubtype.MarriageOrBanns; // no way to know which

        let spouseName = ed.recordData["Spouse Name"];
        let remainder = "";
        let slashIndex = spouseName.indexOf("/");
        if (slashIndex != -1) {
          remainder = spouseName.substring(slashIndex);
          spouseName = spouseName.substring(0, slashIndex);

          // sometimes (rarely) there is a second name after the /
          // e.g. MARGERY ROBERTSON/POLLOCK FR2833 (FR2833)
          // See Pollock-1150
          // We want to keep that name as we don't know which is actually the last name
          // Possibly Robertson is her maiden name?
          let frameNumberIndex = remainder.search(/FR\s?\d/);
          if (frameNumberIndex != -1 && frameNumberIndex > 1) {
            let extraName = remainder.substring(1, frameNumberIndex).trim();
            if (extraName) {
              spouseName += "/" + extraName;
              remainder = "/" + remainder.substring(frameNumberIndex);
            }
          }
        }
        if (spouseName != "-----" && !spouseName.startsWith("NAME NOT GIVEN")) {
          setMarriageData(ed, result, spouseName, "", true);
        }

        // look for a film reel number on end of Spouse Name field
        if (remainder) {
          let frameNumberIndex = remainder.search(/FR\s?\d/);
          if (frameNumberIndex != -1) {
            remainder = remainder.substring(frameNumberIndex).trim();
            setRefPartsOfOtherDetails(result, remainder, "FR", "frameNumber");
          }
        }
      }
      break;

    case "cr_banns":
      result.recordSubtype = RecordSubtype.MarriageOrBanns; // no way to know which
      result.setEventDate(cleanDdMmYyyyDate(ed.recordData["Date"]));
      result.eventPlace = buildPlaceWithRcParishCongregationName(ed.recordData["Parish"], ed);
      setMarriageData(ed, result, ed.recordData["Spouse Surname"], ed.recordData["Spouse Forename"]);
      break;

    case "cr_baptisms":
      {
        let birthDate = cleanDdMmYyyyDate(ed.recordData["Birth Date"]);
        let baptismDate = cleanDdMmYyyyDate(ed.recordData["Baptism Date"]);
        if (baptismDate) {
          result.setEventDate(baptismDate);
        } else {
          result.setEventDate(birthDate);
        }
        result.setBirthDate(birthDate);

        result.eventPlace = buildPlaceWithRcParishCongregationName(ed.recordData["Parish"], ed);

        setParents(scotpRecordType, ed, result, "Parents/Other details");
      }
      break;

    case "cr_burials":
      // has separate death and burial date columns
      {
        let deathDate = cleanDdMmYyyyDate(ed.recordData["Death Date"]);
        let burialDate = cleanDdMmYyyyDate(ed.recordData["Burial Date"]);
        if (burialDate) {
          result.setEventDate(burialDate);
        } else {
          result.setEventDate(deathDate);
        }
        result.setDeathDate(deathDate);

        result.setFieldIfValueExists("ageAtDeath", ed.recordData["Age"]);

        result.eventPlace = buildPlaceWithRcParishCongregationName(ed.recordData["Parish"], ed);
      }
      break;

    case "cr_other":
      {
        // can be confirmation etc (there is a column that specifies)
        let eventDate = cleanDdMmYyyyDate(ed.recordData["Event Date"]);
        result.setEventDate(eventDate);

        result.eventPlace = buildPlaceWithRcParishCongregationName(ed.recordData["Parish"], ed);
      }
      break;

    case "ch3_baptisms": // Other church type
      {
        let birthDate = cleanDdMonthYyyyDate(ed.recordData["Birth Date"]);
        let baptismDate = cleanDdMonthYyyyDate(ed.recordData["Baptism Date"]);
        if (baptismDate) {
          result.setEventDate(baptismDate);
        } else {
          result.setEventDate(birthDate);
        }
        result.setBirthDate(birthDate);

        result.eventPlace = buildPlaceWithOtherParishCongregationName(ed.recordData["Parish/Congregation Name"], ed);
        result.birthPlace = result.eventPlace;

        setParents(scotpRecordType, ed, result, "Parents/Other details");
      }
      break;

    case "ch3_burials": // Other church type
      result.setEventDate(cleanDdMonthYyyyDate(ed.recordData["Date"]));
      setResultFieldFromRecordDataField(ed, "Cause of Death", result, "causeOfDeath", true);
      result.eventPlace = buildPlaceWithOtherParishCongregationName(ed.recordData["Parish/Congregation Name"], ed);
      result.deathPlace = result.eventPlace;
      break;

    case "ch3_banns": // Other church type
      result.setEventDate(cleanDdMonthYyyyDate(ed.recordData["Marriage Date"]));
      result.eventPlace = buildPlaceWithOtherParishCongregationName(ed.recordData["Parish/Congregation Name"], ed);
      setMarriageData(ed, result, ed.recordData["Spouse Surname"], ed.recordData["Spouse Forename"]);
      break;

    case "ch3_other": // Other church type
      result.setEventDate(cleanDdMonthYyyyDate(ed.recordData["Date of Event"]));
      result.eventPlace = buildPlaceWithOtherParishCongregationName(ed.recordData["Parish/Congregation Name"], ed);
      break;

    case "coa": // Coat of Arms
      result.setEventDate(cleanDdMmYyyyDate(ed.recordData["Grant year"]));
      break;

    case "hie": // Poor relief and migration records - Highlands and Island Emigration
      result.setEventDate(cleanDdMmYyyyDate(ed.recordData["Departure Date"]));
      setResultFieldFromRecordDataField(ed, "Shipname", result, "shipName", true);
      result.eventPlace = buildPlaceWithHieResidenceAndCountyName(ed.recordData["Residence"], ed.recordData["County"]);
      break;

    case "military_tribunals":
      result.setEventDate(cleanDdMmYyyyDate(ed.recordData["Date of Appeal"]));
      result.eventPlace = buildPlaceWithCourtName(ed, result, ed.recordData["Court"], result.inferEventYear());
      break;

    case "prison_records":
      result.setEventYear(ed.recordData["Year admitted"]);
      result.setFieldIfValueExists("ageAtEvent", ed.recordData["Age"]);

      result.eventPlace = buildPlaceWithPrisonName(ed, ed.recordData["Prison"], ed.recordData["Year admitted"]);

      result.setBirthPlace(standardizePlaceName(ed.recordData["Where born"]));
      break;

    case "soldiers_wills":
      result.setEventDate(cleanDdMmYyyyDate(ed.recordData["Date"]));
      result.deathDate = result.eventDate;
      result.setDeathPlace(ed.recordData["Place of Death"]);
      result.setFieldIfValueExists("serviceNumber", ed.recordData["Service Number"]);
      result.setFieldIfValueExists("militaryRegiment", ed.recordData["Regiment"]);
      break;

    case "wills":
      result.setEventDate(cleanDdMmYyyyDate(ed.recordData["Date"]));
      result.eventPlace = buildPlaceWithCourtName(ed, result, ed.recordData["Court"], result.inferEventYear());
      setWillsAndTestamentsRecordSubtype(ed, result);
      break;

    case "vr":
      result.setEventYear(ed.recordData["Year"]);
      result.eventPlace = buildPlaceWithOprParishName(ed, ed.recordData["Parish"], ed.recordData["Year"]);
      break;

    default:
      return result;
  }

  if (scotpRecordType == "census" || scotpRecordType == "census_lds") {
    let collectionId = "";
    if (scotpRecordType == "census_lds") {
      collectionId = "census1881";
    } else {
      let censusYear = result.inferEventYear();
      if (censusYear) {
        collectionId = "census" + censusYear;
      }
    }
    if (collectionId) {
      result.collectionData = {
        id: collectionId,
      };
      if (scotpRecordType == "census") {
        // ref number in LDS census doesn't seem to match anything on other sites
        setCollectionReferenceData(scotpRecordType, ed, result);
      }
    }
  }

  if (Object.keys(result.tempCollectionData).length > 0) {
    if (!result.hasOwnProperty("collectionData")) {
      result.collectionData = {};
    }
    for (let key in result.tempCollectionData) {
      result.collectionData[key] = result.tempCollectionData[key];
    }
  }
  delete result.tempCollectionData;

  result.hasValidData = true;

  //console.log("scotp; generaliseData: result is:");
  //console.log(result);

  return result;
}

export { generalizeData };
