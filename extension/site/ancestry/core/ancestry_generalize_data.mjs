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

import {
  GeneralizedData,
  GD,
  dateQualifiers,
  WtsPlace,
  WtsName,
  WtsDate,
} from "../../../base/core/generalize_data_utils.mjs";
import { RC } from "../../../base/core/record_collections.mjs";
import { RT, Role } from "../../../base/core/record_type.mjs";

const eventTypeStringToDataType = {
  BirthRegistration: RT.BirthRegistration,
  Birth: RT.Birth,
  DeathRegistration: RT.DeathRegistration,
  Death: RT.Death,
  Marriage: RT.Marriage,
  "ægteskab(Marriage)": RT.Marriage,
  MarriageLicense: RT.Marriage,
  Census: RT.Census,
  ElectoralRegister: RT.ElectoralRegister,
  Baptism: RT.Baptism,
  Burial: RT.Burial,
  CriminalRegister: RT.CriminalRegister,
  FreemasonMembership: RT.FreemasonMembership,
  Probate: RT.Probate,
  Divorce: RT.Divorce,
  MilitaryService: RT.Military,
  TaxList: RT.Tax,
};

const recordTypeByFields = [
  { type: RT.Divorce, labels: ["Divorce Date"] },
  { type: RT.Marriage, labels: ["Marriage Date", "Marriage Place", "Spouse"] },
  {
    type: RT.Marriage,
    labels: ["Marriage License Date", "Marriage License Place", "Spouse"],
  },
  { type: RT.Marriage, labels: ["License Date", "License Place", "Spouse"] },
  { type: RT.Baptism, labels: ["Baptism Date", "Baptism Place"] },
  { type: RT.Burial, labels: ["Burial Date", "Burial Place"] },
  { type: RT.Burial, labels: ["Burial Year", "Burial Place"] },
  { type: RT.Burial, labels: ["Death Date", "Burial Place"] },
  { type: RT.Marriage, labels: ["Marriage Date", "Marriage Place"] },
  { type: RT.Marriage, labels: ["Marriage Date on Image", "Marriage Place"] },
  { type: RT.Marriage, labels: ["Marriage Year", "Marriage Place"] },
  { type: RT.Marriage, labels: ["Marriage Year", "Marriage State"] },
  { type: RT.Marriage, labels: ["Marriage Date"] },
  { type: RT.MarriageRegistration, labels: ["Marriage Registration Place"] },
  { type: RT.MarriageRegistration, labels: ["Marriage Registration Date"] },
  { type: RT.MarriageRegistration, labels: ["Marriage Registration Year"] },
  {
    type: RT.Death,
    labels: ["Death Date on Image", "Translated Death Date", "Death Place"],
  },
  { type: RT.Death, labels: ["Death Date", "Monthly Meeting"] },
  { type: RT.Military, labels: ["Enlistment Date", "Enlistment Place"] },
];

function determineRecordType(extractedData) {
  const titleMatches = [
    { type: RT.Baptism, matches: ["Christening Index"] },
    {
      type: RT.BirthRegistration,
      matches: ["Birth Index"],
      requiredData: ["Birth Registration Date"],
    },
    {
      type: RT.BirthRegistration,
      matches: ["Birth Index"],
      requiredData: ["Birth Registration Place"],
    },
    {
      type: RT.Birth,
      matches: ["Birth Certificate", "Birth Record", "Birth Index"],
    },
    {
      type: RT.Baptism,
      matches: [
        "Births and Christenings",
        "Births and Baptisms",
        "Church of England Baptisms",
        "Baptism Index",
      ],
      requiredData: ["Baptism Date"],
    },
    {
      type: RT.Birth,
      matches: [
        "Births and Christenings",
        "Births and Baptisms",
        "Canada Births",
        "Canada, Births",
        "Birth Registers",
      ],
      requiredData: ["Birth Date"],
    },
    {
      type: RT.Birth,
      matches: [
        "Millennium File",
        "Vital Extracts",
        "Membership of The Church of Jesus Christ of Latter-day Saints",
      ],
      requiredData: ["Birth Date"],
    },
    {
      type: RT.Birth,
      matches: ["Births"],
      requiredData: ["Birth Date", "Birth Place", "Gender"],
    },
    {
      type: RT.BirthOrBaptism,
      matches: [
        "Select Births and Christenings",
        "Select Births and Baptisms",
        "Church of England Births and Baptisms",
      ],
    },

    { type: RT.Divorce, matches: ["Divorce Records", "Divorce Index"] },
    {
      type: RT.Marriage,
      matches: [
        "Church of England Marriages and Banns",
        "Marriage Registers, Bonds and Allegations",
        "U.S. and International Marriage Records",
        "Index to Marriage Bonds",
        "Marriage Bonds and Allegations",
      ],
    },
    {
      type: RT.Burial,
      matches: [
        "Church of England Burials",
        "England Deaths and Burials",
        "Burial and Cremation Index",
        "Find a Grave",
        "Cemetery Burial Cards",
        "Veterans Burial Cards",
        "Gravesites",
        "Graves of Revolutionary Patriots",
      ],
    },
    {
      type: RT.Burial,
      matches: ["Deaths and Burials", "Cemetery", "Funeral Home", "Gravestone"],
      requiredData: ["Burial Date"],
    },
    {
      type: RT.Cremation,
      matches: ["Cemetery Records"],
      requiredData: ["Cremation Date"],
    },
    {
      type: RT.Burial,
      matches: [
        "Historical Cemetery Commission Index",
        "Headstone Transcriptions",
        "Cemetery",
        "Funeral",
      ],
      requiredData: ["Burial Place"],
    },
    {
      type: RT.DeathRegistration,
      matches: ["Deaths", "Death Records", "Death Index"],
      requiredData: ["Death Registration Place"],
    },
    {
      type: RT.Death,
      matches: ["Deaths", "Death Records", "Scotland, Local Heritage Index"],
      requiredData: ["Death Date"],
    },
    {
      type: RT.Death,
      matches: [
        "Death Index",
        "Death Certificate",
        "U.S., Death Record",
        "Index to Deceased Estate Files",
        "Death Notice",
        "Canada, Deaths",
      ],
    },
    {
      type: RT.NonpopulationCensus,
      matches: ["Census Non-Population Schedule"],
    },
    { type: RT.Census, matches: ["Census", "1939 England and Wales Register"] },
    {
      type: RT.ElectoralRegister,
      matches: ["Electoral Roll", "Voter Registers", "Electoral Registers"],
    },
    { type: RT.Probate, matches: ["Probate"] },
    {
      type: RT.Will,
      matches: ["Prerogative Court of Canterbury Wills", "Will Index"],
    },
    {
      type: RT.MarriageRegistration,
      matches: ["Civil Registration Marriage Index"],
    },
    {
      type: RT.CriminalRegister,
      matches: [
        "Criminal Register",
        "Police Gazettes",
        "Convict Register",
        "Prison Hulk Register",
      ],
    },
    {
      type: RT.FreemasonMembership,
      matches: ["Freemason Membership", "Mason Membership Cards"],
    },
    {
      type: RT.WorkhouseRecord,
      matches: ["Workhouse Admission and Discharge Records"],
    },
    {
      type: RT.PassengerList,
      matches: [
        "Passenger List",
        "Passenger and Crew List",
        "Passenger and Immigration Lists Index",
        "Index to Alien Arrivals",
      ],
    },
    { type: RT.CrewList, matches: ["Crew List"] },
    { type: RT.ConvictTransportation, matches: ["Convict Transportation"] },
    {
      type: RT.Military,
      matches: [
        "Medal and Award Rolls",
        "British Army World War I Service Records",
        "Army World War I Pension",
        "World War I Pension Ledgers and Index Cards",
        "Regimental Rolls and Recruitment Registers",
        "Chelsea Pensioner Soldier Service Records",
        "Soldiers Died in the Great War",
        "World War I",
        "War Graves",
        "U.S., Department of Veterans Affairs BIRLS Death File",
        "UK, Army Registers of Soldiers' Effects",
        "Soldier Grave Registrations",
        "Military Service",
        "Compiled Service Records",
        "Volunteer Militia",
        "Revolutionary War Residents",
        "Soldier Records",
        "War Soldiers",
        "Prisoner of War",
        "War Rolls",
        "War Pensioners",
        "War of 1812 Pension",
        "Draft Registration",
        "Civil, Military, and Naval Service",
        "Air Force Airmen Records",
        "Navy Registers of Seamen's Services",
        "Confederate Pensions",
        "War Pension",
      ],
    },
    { type: RT.Military, matches: ["War"], secondMatches: ["Pension"] },
    {
      type: RT.MedicalPatient,
      matches: ["Lunacy Patients Admission Registers"],
    },
    { type: RT.QuarterSession, matches: ["Quarter Sessions"] },
    {
      type: RT.Directory,
      matches: [
        "City and County Directories",
        "City Directories",
        "City and Area Directories",
        "Phone Book",
        "Trade Directories",
      ],
    },
    {
      type: RT.Employment,
      matches: [
        "Employment Records",
        "UK, Postal Service Appointment Books",
        "Nursing Registers",
        "Appointments of U. S. Postmasters",
        "Police Pension Registers",
      ],
    },
    { type: RT.SocialSecurity, matches: ["U.S., Social Security"] },
    { type: RT.LandTax, matches: ["Land Tax Redemption", "Land Tax Records"] },
    {
      type: RT.Tax,
      matches: [
        "Direct Tax Lists",
        "Tax and Exoneration",
        "Tax List Record",
        "Tax Record",
      ],
    },
    { type: RT.Apprenticeship, matches: ["Apprentices' Indentures"] },
    { type: RT.Obituary, matches: ["Obituary", "Obituaries"] },
    {
      type: RT.SchoolRecords,
      matches: ["School Yearbook", "School Admission", "School Registers"],
    },
    {
      type: RT.Naturalization,
      matches: ["Naturalization Record", "Naturalisation Certificate"],
    },
    {
      type: RT.LegalRecord,
      matches: ["Land Warrant", "Land Office Records", "Homestead Grant"],
    },
    { type: RT.Immigration, matches: ["Immigration Records"] },
    { type: RT.Emigration, matches: ["Emigration Records"] },
    {
      type: RT.Certificate,
      matches: ["Certificate"],
      requiredData: ["Issue Date"],
    },
    {
      type: RT.Residence,
      matches: ["Residents", "U.S., Public Records Index"],
      requiredData: ["Residence Place"],
    },
    {
      type: RT.Residence,
      matches: ["U.S., Public Records Index"],
      requiredData: ["Residence"],
    },
    {
      type: RT.Residence,
      matches: ["U.S., Public Records Index"],
      requiredData: ["Residence Date"],
    },
    {
      type: RT.FamHistOrPedigree,
      matches: [
        "of the American Revolution Membership",
        "Colonial Families of the USA",
      ],
    },
    {
      // This could possibly be confused with a child marriage. It is to handle a record like this:
      // https://www.ancestry.com/discoveryui-content/view/154307070:61039
      type: RT.Baptism,
      matches: ["Catholic Parish Registers"],
      requiredData: ["Name", "Child", "Gender"],
    },
    {
      type: RT.MarriageRegistration,
      matches: ["Marriage Index"],
      requiredData: ["Marriage Registration Place", "Spouse"],
    },
    {
      type: RT.Marriage,
      matches: ["Marriage Index"],
      requiredData: ["Spouse"],
    },
    {
      type: RT.Birth,
      matches: ["American Genealogical-Biographical Index"],
      requiredData: ["Birth Date"],
    },
    {
      type: RT.Military,
      matches: ["Veteran", "Soldier", "Military", "Armed"],
      requiredData: ["Rank"],
    },
    {
      type: RT.Military,
      matches: ["Veterans", "Soldier", "Military", "Armed"],
      requiredData: ["Muster In Date"],
    },
    { type: RT.PassportApplication, matches: ["Passport Application"] },
    { type: RT.Pension, matches: ["Pension Index"] },
  ];

  //console.log("in determineRecordType");
  //console.log(extractedData);

  let eventTypeString = undefined;
  if (extractedData.recordData) {
    eventTypeString = extractedData.recordData["Event Type"];
    if (!eventTypeString) {
      eventTypeString = extractedData.recordData["Record Type"];
    }
  }

  if (eventTypeString) {
    eventTypeString = eventTypeString.replace(/\s/g, "");
    let dataType = eventTypeStringToDataType[eventTypeString];
    if (!dataType) {
      console.log(
        "determineRecordType: Unrecognised event type: " + eventTypeString
      );
    } else {
      return dataType;
    }
  }

  if (extractedData.titleCollection) {
    // check for birth or death registration
    if (extractedData.titleCollection.includes("Registration")) {
      if (extractedData.titleCollection.includes("Birth")) {
        return RT.BirthRegistration;
      }
      if (extractedData.titleCollection.includes("Death")) {
        return RT.DeathRegistration;
      }
      if (extractedData.titleCollection.includes("Marriage")) {
        return RT.MarriageRegistration;
      }
    }

    // check for a marriage
    if (
      extractedData.titleCollection.includes("Marriage") &&
      extractedData.recordData &&
      extractedData.recordData["Marriage Date"]
    ) {
      return RT.Marriage;
    }

    if (extractedData.titleCollection.includes("Criminal Register")) {
      return RT.CriminalRegister;
    }

    if (extractedData.titleCollection.includes("Freemason Membership")) {
      return RT.FreemasonMembership;
    }

    for (let titleMatch of titleMatches) {
      let titleMatched = false;
      for (let match of titleMatch.matches) {
        if (extractedData.titleCollection.includes(match)) {
          titleMatched = true;
          break;
        }
      }
      if (!titleMatched) {
        continue;
      }

      if (titleMatch.secondMatches) {
        let secondTitleMatched = false;
        for (let match of titleMatch.secondMatches) {
          if (extractedData.titleCollection.includes(match)) {
            secondTitleMatched = true;
            break;
          }
        }
        if (!secondTitleMatched) {
          continue;
        }
      }

      if (!titleMatch.requiredData) {
        return titleMatch.type;
      } else if (extractedData.recordData) {
        let match = true;
        for (let fieldName of titleMatch.requiredData) {
          if (!extractedData.recordData[fieldName]) {
            match = false;
            break;
          }
        }
        if (match) {
          return titleMatch.type;
        }
      }
    }
  }

  // The title and record/event type have not identfied the record
  // Try to classify it using recordData field names
  if (extractedData.recordData) {
    for (let entry of recordTypeByFields) {
      let match = true;
      for (let fieldName of entry.labels) {
        if (!extractedData.recordData[fieldName]) {
          match = false;
          break;
        }
      }

      if (match) {
        return entry.type;
      }
    }
  }

  return RT.Unclassified;
}

function determineRoleGivenRecordType(extractedData, result) {
  //console.log("determineRoleGivenRecordType, recordType is: " + result.recordType);
  //console.log("determineRoleGivenRecordType, extractedData is: ");
  //console.log(extractedData);

  if (!extractedData.recordData) {
    return; // can't assign a role
  }

  let recordType = result.recordType;

  if (
    recordType == RT.Baptism ||
    recordType == RT.Birth ||
    recordType == RT.BirthOrBaptism
  ) {
    // if there is a baptism date etc then this is likely a record for this person not a
    // child or spouse. There could be a birth date though - for the parent of the child
    // e.g.: https://www.ancestry.com/discoveryui-content/view/300065623:8703?ssrc=pt&tid=180320731&pid=412419830925
    let value = getCleanValueForRecordDataList(extractedData, [
      "Baptism Date",
      "Christening Date",
    ]);
    if (!value) {
      if (extractedData.recordData["Child"]) {
        // some family records have all parents and children of the primary person
        // ignore if Father or Mother fields
        if (
          !extractedData.recordData["Father"] &&
          !extractedData.recordData["Mother"]
        ) {
          result.role = Role.Parent;
          result.primaryPerson = extractedData.recordData["Child"];
        }
      }
    }
  } else if (
    recordType == RT.Death ||
    recordType == RT.DeathRegistration ||
    recordType == RT.Burial
  ) {
    // if there is a death or burial date etc then this is likely a record for this person not a
    // child or spouse
    let value = getCleanValueForRecordDataList(extractedData, [
      "Death Date",
      "Burial Date",
      "Cremation Date",
      "Burial Year",
    ]);
    if (!value) {
      if (extractedData.recordData["Child"]) {
        result.role = Role.Parent;
        result.primaryPerson = extractedData.recordData["Child"];
      } else if (extractedData.recordData["Spouse"]) {
        if (
          !extractedData.recordData["Death Date"] &&
          !extractedData.recordData["Death Place"] &&
          !extractedData.recordData["Burial Date"] &&
          !extractedData.recordData["Burial Year"] &&
          !extractedData.recordData["Burial Place"]
        ) {
          result.role = Role.Spouse;
          result.primaryPerson = extractedData.recordData["Spouse"];
        }
      }
    }
  } else if (
    recordType == RT.Marriage ||
    recordType == RT.MarriageRegistration
  ) {
    // if there is a date etc then this is likely a record for this person not a
    // child or spouse
    let value = getCleanValueForRecordDataList(extractedData, [
      "Marriage Date",
    ]);
    if (!value) {
      if (extractedData.recordData["Child"]) {
        if (
          !extractedData.recordData["Father"] &&
          !extractedData.recordData["Mother"]
        ) {
          result.role = Role.Parent;
          result.primaryPerson = extractedData.recordData["Child"];
        }
      }
    }
  }
  // possibly any other type should go through here?
  // We could possibly test if recordData num properties is <= 4 or something like that
  else if (recordType == RT.Unclassified || recordType == RT.Employment) {
    let value = getCleanValueForRecordDataList(extractedData, [
      "Birth Date",
      "Baptism Date",
      "Christening Date",
      "Death Date",
      "Burial Date",
      "Cremation Date",
      "Marriage Date",
    ]);
    if (!value) {
      if (extractedData.recordData["Child"]) {
        if (
          !extractedData.recordData["Father"] &&
          !extractedData.recordData["Mother"]
        ) {
          result.role = Role.Parent;
          result.primaryPerson = extractedData.recordData["Child"];
        }
      }
    }
  } else if (recordType == RT.Obituary) {
    // obituary can have lots of relations
    let value = getCleanValueForRecordDataList(extractedData, [
      "Death Date",
      "Burial Date",
      "Cremation Date",
      "Burial Year",
    ]);
    if (!value) {
      if (
        !extractedData.recordData["Death Date"] &&
        !extractedData.recordData["Death Place"] &&
        !extractedData.recordData["Death Age"]
      ) {
        if (extractedData.recordData["Child"]) {
          result.role = Role.Parent;
          result.primaryPerson = extractedData.recordData["Child"];
        } else if (extractedData.recordData["Spouse"]) {
          result.role = Role.Spouse;
          result.primaryPerson = extractedData.recordData["Spouse"];
        } else if (extractedData.recordData["Father"]) {
          result.role = Role.Child;
          result.primaryPerson = extractedData.recordData["Father"];
        } else if (extractedData.recordData["Mother"]) {
          result.role = Role.Child;
          result.primaryPerson = extractedData.recordData["Mother"];
        } else if (extractedData.recordData["Siblings"]) {
          result.role = Role.Sibling;
          result.primaryPerson = extractedData.recordData["Siblings"];
        }
      }
    }
  }

  //console.log("determineRoleGivenRecordType. role is: " + result.role);
}

function determineRecordTypeAndRole(extractedData, result) {
  result.recordType = determineRecordType(extractedData);
  determineRoleGivenRecordType(extractedData, result);
}

function monthStrToNum(monthStr) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (let i = 0; i < months.length; ++i) {
    if (monthStr.startsWith(months[i])) {
      return i + 1;
    }
  }

  return 0;
}

function cleanDateString(dateString) {
  // sometimes records have dates like this:
  // 25. Jun 1840 (25 Jun 1840)

  let newString = dateString.trim();
  newString = newString.replace("s+", " ");

  if (/^\d\d? \w\w\w \d\d\d\d$/.test(newString)) {
    // this is the "normal" format for an Ancestry date string
    return newString;
  }

  let openParenIndex = newString.indexOf("(");
  if (openParenIndex != -1) {
    // there is an open parentheses
    let closeParenIndex = newString.indexOf(")");
    if (closeParenIndex != -1 && closeParenIndex > openParenIndex) {
      let firstDateString = newString.substring(0, openParenIndex).trim();
      let secondDateString = newString
        .substring(openParenIndex + 1, closeParenIndex)
        .trim();
      if (/^\d\d? \w\w\w \d\d\d\d$/.test(secondDateString)) {
        return secondDateString;
      }
      if (/^\d\d? \w\w\w \d\d\d\d$/.test(firstDateString)) {
        return firstDateString;
      }

      // neither date is expected format. Just use the one in parents and continue checks
      newString = secondDateString;
    } else {
      newString = newString.substring(0, openParenIndex).trim();
    }
  }

  return newString;
}

function getCleanRecordDataValue(data, fieldName, type = "") {
  if (!data.recordData) {
    return "";
  }

  let value = data.recordData[fieldName];
  if (value == undefined) {
    return value;
  }

  // sometimes there are values in square brackets after the first value
  // these make it hard to parse dates, placses names etc so remove them
  let bracketIndex = value.indexOf("[");
  if (bracketIndex != -1) {
    value = value.substring(0, bracketIndex).trim();
  }

  // sometimes places have commas with no space after them
  value = value.replace(/\,([^\s])/g, ", $1");

  if (type == "date") {
    value = cleanDateString(value);
  }

  return value;
}

function getCleanValueForRecordDataList(data, fieldNames, type = "") {
  for (let fieldName of fieldNames) {
    let value = getCleanRecordDataValue(data, fieldName, type);
    if (value) {
      return value;
    }
  }
}

function buildParents(data, result) {
  let fatherName = getCleanValueForRecordDataList(data, [
    "Father",
    "Father Name",
  ]);
  if (fatherName) {
    let father = result.addFather();
    father.name.name = fatherName;
  }
  let motherName = getCleanValueForRecordDataList(data, [
    "Mother",
    "Mother Name",
  ]);
  if (motherName) {
    let mother = result.addMother();
    mother.name.name = motherName;
  }

  let mmn = getCleanValueForRecordDataList(data, [
    "Mother Maiden Name",
    "Mother's Maiden Name",
  ]);
  if (mmn) {
    result.mothersMaidenName = mmn;
  }
}

function buildEventPlace(data, result, includeResidence) {
  let country = getCleanValueForRecordDataList(data, ["Country"]);
  let state = getCleanValueForRecordDataList(data, ["State", "Province"]);
  let county = getCleanValueForRecordDataList(data, [
    "County/Island",
    "County",
    "County or Borough",
  ]);
  let civilParish = getCleanValueForRecordDataList(data, [
    "Civil Parish",
    "Civil parish",
    "Parish",
  ]);
  let town = getCleanValueForRecordDataList(data, [
    "Town",
    "Ward or Division/Constituency",
    "Locality",
  ]);
  let streetAddress = getCleanValueForRecordDataList(data, [
    "Street Address",
    "Address",
  ]);
  let houseNumber = getCleanValueForRecordDataList(data, ["House Number"]);
  let residence = "";

  if (includeResidence) {
    if (!country) {
      country = getCleanValueForRecordDataList(data, ["Residence Country"]);
    }
    if (!state) {
      state = getCleanValueForRecordDataList(data, [
        "Residence State",
        "Residence Province or Territory",
      ]);
    }
    if (!county) {
      county = getCleanValueForRecordDataList(data, [
        "County/Island",
        "County",
        "County or Borough",
        "Residence County",
      ]);
    }
    if (!town) {
      town = getCleanValueForRecordDataList(data, [
        "Place of Habitation",
        "Residence District",
      ]);
    }
    if (!streetAddress) {
      streetAddress = getCleanValueForRecordDataList(data, [
        "Street Address",
        "Address",
        "Residence Street or Township",
      ]);
    }

    let yearString = result.inferEventYear();
    let homeString = "Home in " + yearString; // label used in US federal census
    let homeString2 = "Home in " + yearString + " (City, County, State)"; // label used in US 1800-1840 federal census
    residence = getCleanValueForRecordDataList(data, [
      "Residence",
      "Residence Place",
      homeString,
      homeString2,
    ]);
  }

  let placeString = "";
  if (residence && residence.includes(",")) {
    // for example in US state census Residence is the full address. It is in UK 1891 census too
    // It is not in Ontario, Canada, County Marriage Registers, 1858-1869 though
    placeString += residence;
  } else {
    if (streetAddress) {
      if (houseNumber && !streetAddress.startsWith(houseNumber)) {
        placeString += houseNumber + " ";
      }
      placeString += streetAddress;
    } else if (residence) {
      placeString += residence;
    }

    if (town) {
      if (placeString) {
        placeString += ", ";
      }
      placeString += town;
    }
    if (civilParish && civilParish != town) {
      if (placeString) {
        placeString += ", ";
      }
      placeString += civilParish;
    }
    if (county) {
      if (placeString) {
        placeString += ", ";
      }
      placeString += county;
    }
    if (state) {
      if (placeString) {
        placeString += ", ";
      }
      placeString += state;
    }
    if (country) {
      if (placeString) {
        placeString += ", ";
      }
      placeString += country;
    }
  }
  result.setEventPlace(placeString);

  if (streetAddress) {
    if (houseNumber && !streetAddress.startsWith(houseNumber)) {
      result.eventPlace.streetAddress = houseNumber + " " + streetAddress;
    } else {
      result.eventPlace.streetAddress = streetAddress;
    }
  }
}

const ancestryQuarterNames = [
  {
    name: "Jan-Feb-Mar",
    value: 1,
  },
  {
    name: "Apr-May-Jun",
    value: 2,
  },
  {
    name: "Jul-Aug-Sep",
    value: 3,
  },
  {
    name: "Oct-Nov-Dec",
    value: 4,
  },
];

const ancestryQuarterMonthNames = [
  {
    name: "Jan",
    value: 1,
  },
  {
    name: "Apr",
    value: 2,
  },
  {
    name: "Jul",
    value: 3,
  },
  {
    name: "Oct",
    value: 4,
  },
];

function generalizeDataGivenRecordType(data, result) {
  determineRoleGivenRecordType(data, result);

  if (result.recordType == RT.BirthRegistration) {
    let birthDate = getCleanValueForRecordDataList(
      data,
      ["Birth Date"],
      "date"
    );
    if (birthDate) {
      result.setEventDate(birthDate);
      result.setBirthDate(birthDate);
    } else if (result.eventDate) {
      // result.eventDate may be set from "Registration Year"
      result.birthDate = result.eventDate;
    }

    let eventPlace = getCleanValueForRecordDataList(data, [
      "Birth Registration Place",
      "Registration Place",
    ]);
    if (eventPlace) {
      if (!result.registrationDistrict) {
        let place = eventPlace;
        let commaIndex = place.indexOf(`,`);
        if (commaIndex != -1) {
          place = place.substring(0, commaIndex);
        }
        result.registrationDistrict = place;
      }

      let county = getCleanRecordDataValue(data, "Inferred County");
      if (county && !eventPlace.includes(county)) {
        eventPlace += ", " + county;
      }
      result.setEventPlace(eventPlace);
    } else if (
      result.registrationDistrict &&
      data.recordData["Inferred County"]
    ) {
      let eventPlace = result.registrationDistrict;
      let county = getCleanRecordDataValue(data, "Inferred County");
      if (!eventPlace.includes(county)) {
        eventPlace += ", " + county;
      }
      result.setEventPlace(eventPlace);
    }
    result.lastNameAtBirth = result.inferLastName();

    buildParents(data, result);
  } else if (result.recordType == RT.Birth) {
    let birthDate = getCleanRecordDataValue(data, "Birth Date", "date");
    if (birthDate) {
      result.setEventDate(birthDate);
      result.setBirthDate(birthDate);
    }

    let eventPlace = getCleanValueForRecordDataList(data, [
      "Birth Place",
      "Birthplace",
      "Registration Place",
    ]);
    if (eventPlace) {
      result.setBirthPlace(eventPlace);
      result.setEventPlace(eventPlace);
    }
    result.lastNameAtBirth = result.inferLastName();
    buildParents(data, result);

    if (result.role && result.role == Role.Parent) {
      let spouseName = getCleanValueForRecordDataList(data, ["Spouse"]);
      if (spouseName) {
        let name = new WtsName();

        if (spouseName) {
          name.name = spouseName;
        }

        let spouse = {
          name: name,
        };

        result.spouses = [spouse];
      }
    }

    let mmn = getCleanValueForRecordDataList(data, ["Mother Maiden Name"]);
    if (mmn) {
      result.mothersMaidenName = mmn;
    }
  } else if (result.recordType == RT.DeathRegistration) {
    let deathDate = getCleanValueForRecordDataList(
      data,
      ["Death Date", "Death Registration Date", "Death Registration Year"],
      "date"
    );
    if (deathDate) {
      result.setEventDate(deathDate);
      result.setDeathDate(deathDate);
    } else if (result.eventDate) {
      // result.eventDate may be set from "Registration Year"
      result.deathDate = result.eventDate;
    }

    let eventPlace = getCleanValueForRecordDataList(data, [
      "Death Registration Place",
      "Registration Place",
    ]);
    if (eventPlace) {
      if (!result.registrationDistrict) {
        let place = eventPlace;
        let commaIndex = place.indexOf(`,`);
        if (commaIndex != -1) {
          place = place.substring(0, commaIndex);
        }
        result.registrationDistrict = place;
      }

      let county = getCleanRecordDataValue(data, "Inferred County");
      if (county && !eventPlace.includes(county)) {
        eventPlace += ", " + county;
      }
      result.setEventPlace(eventPlace);
    } else {
      let eventPlace = getCleanValueForRecordDataList(data, [
        "Death Place",
        "Death County",
        "Residence Place",
      ]);
      result.setEventPlace(eventPlace);
    }

    result.lastNameAtDeath = result.inferLastName();
    result.ageAtDeath = getCleanValueForRecordDataList(data, [
      "Age at Death",
      "Death Age",
      "Age",
    ]);

    // later England Death Registration include exact birth date
    let birthDate = getCleanValueForRecordDataList(
      data,
      ["Birth Date"],
      "date"
    );
    if (birthDate) {
      result.setBirthDate(birthDate);
    }
  } else if (result.recordType == RT.Death) {
    let deathDate = getCleanValueForRecordDataList(
      data,
      [
        "Death Date",
        "Translated Death Date",
        "Death Date on Image",
        "Death Year",
      ],
      "date"
    );
    if (deathDate) {
      result.setEventDate(deathDate);
      result.setDeathDate(deathDate);
    } else if (result.eventDate) {
      // result.eventDate may be set from "Registration Year"
      result.deathDate = result.eventDate;
    }

    let eventPlace = getCleanValueForRecordDataList(data, [
      "Death Place",
      "Death County",
      "Death Country",
      "State",
    ]);
    result.setEventPlace(eventPlace);

    let residencePlace = getCleanValueForRecordDataList(data, [
      "Residence Place",
      "Last Residence Place",
      "Last Residence",
      "Residence",
    ]);
    result.setResidencePlace(residencePlace);

    result.lastNameAtDeath = result.inferLastName();

    let maidenName = getCleanValueForRecordDataList(data, ["Maiden Name"]);
    if (maidenName) {
      result.lastNameAtBirth = maidenName;
    }

    let ageAtDeath = getCleanValueForRecordDataList(data, [
      "Age at Death",
      "Death Age",
      "Age",
    ]);
    if (ageAtDeath) {
      result.ageAtDeath = ageAtDeath;
    }

    // later England Death Registration include exact birth date
    let birthDate = getCleanValueForRecordDataList(
      data,
      ["Birth Date", "Birth Year"],
      "date"
    );
    if (birthDate) {
      result.setBirthDate(birthDate);
    }

    buildParents(data, result);
  } else if (result.recordType == RT.Census) {
    function buildHouseholdArray() {
      const stdFieldNames = [
        {
          stdName: "name",
          ancestryHeadings: [
            "Name",
            "Household Members",
            "Household Member(s)",
          ],
        },
        { stdName: "age", ancestryHeadings: ["Age"] },
        { stdName: "relationship", ancestryHeadings: ["Relationship"] },
      ];
      function headingToStdName(heading) {
        for (let entry of stdFieldNames) {
          if (entry.ancestryHeadings.includes(heading)) {
            return entry.stdName;
          }
        }
      }
      if (
        data.household &&
        data.household.members &&
        data.household.members.length > 0
      ) {
        let headings = data.household.headings;
        let members = data.household.members;
        if (headings && members) {
          result.householdArrayFields = [];

          let householdArray = [];
          for (let member of members) {
            let householdMember = {};
            if (member.isClosed) {
              householdMember.isClosed = true;
            } else {
              for (let heading of headings) {
                let fieldName = headingToStdName(heading);
                if (fieldName) {
                  let fieldValue = member[heading];
                  if (fieldValue) {
                    if (fieldName == "relationship") {
                      fieldValue = GD.standardizeRelationshipToHead(fieldValue);
                    }
                    householdMember[fieldName] = fieldValue;
                  }
                }
              }
              let isSelected = false;
              if (!member.recordId || member.recordId == data.recordId) {
                isSelected = true;
              }
              if (isSelected) {
                householdMember.isSelected = isSelected;

                setExtraGdHouseholdFields(
                  data,
                  householdMember,
                  result.householdArrayFields
                );
              }
              if (member.link) {
                // we need a way of comparing back to extractedData when we
                // fetch additional records
                householdMember.uid = member.link;
              }
            }
            householdArray.push(householdMember);
          }
          result.householdArray = householdArray;

          let householdArrayFields = [];
          for (let heading of headings) {
            let fieldName = headingToStdName(heading);
            if (fieldName) {
              householdArrayFields.push(fieldName);
            }
          }
          result.householdArrayFields = householdArrayFields;
        }
      }
    }

    if (data.titleCollection && data.titleCollection.includes("1939")) {
      result.setEventYear("1939");

      let birthDate = getCleanValueForRecordDataList(
        data,
        ["Birth Date"],
        "date"
      );
      result.setBirthDate(birthDate);

      let maritalStatus = getCleanValueForRecordDataList(data, [
        "Marital Status",
        "Marital status",
      ]);
      result.setMaritalStatus(maritalStatus);

      let streetAddress = getCleanRecordDataValue(data, "Address");
      let place = getCleanRecordDataValue(data, "Residence Place");
      let placeString = "";
      if (streetAddress) {
        placeString += streetAddress;
      }
      if (place) {
        if (placeString) {
          placeString += ", ";
        }
        placeString += place;
      }
      result.setEventPlace(placeString);

      let occupation = getCleanRecordDataValue(data, "Occupation");
      if (occupation && occupation != "None") {
        result.occupation = occupation;
      }

      let positionInHousehold = getCleanRecordDataValue(
        data,
        "Sub Schedule Number"
      );
      if (positionInHousehold) {
        if (positionInHousehold == 1) {
          result.relationshipToHead = "head";
        }
      }

      buildHouseholdArray();
    } else {
      let birthYear = getCleanValueForRecordDataList(data, [
        "Estimated Birth Year",
        "Birth Year",
      ]);

      if (birthYear) {
        let estYear = birthYear;
        if (estYear.startsWith("abt ")) {
          estYear = estYear.substring(4);
        }
        result.setBirthYear(estYear);
        result.birthDate.qualifier = dateQualifiers.ABOUT;
      }

      let birthPlace = getCleanValueForRecordDataList(data, [
        "Where born",
        "Where Born",
        "Birth Place",
        "Birth place",
        "Birthplace",
      ]);
      if (birthPlace) {
        result.setBirthPlace(birthPlace);
      }

      if (
        !result.eventDate ||
        (!result.eventDate.dateString && !result.eventDate.yearString)
      ) {
        // see if we can get the census year from a field
        let yearString = getCleanValueForRecordDataList(data, [
          "Enumeration Year",
          "Residence Year",
          "Census Year",
        ]);
        if (yearString) {
          result.setEventYear(yearString);
        } else {
          let dateString = getCleanValueForRecordDataList(data, [
            "Enumeration Date",
            "Residence Date",
            "Census Date",
          ]);
          if (dateString) {
            result.setEventDate(dateString);
          } else if (data.titleCollection) {
            // extract the year from the collection title, if it is a range treat that specially
            let yearRangeString = data.titleCollection.replace(
              /^.*(\d\d\d\d\-\d\d\d\d).*$/,
              "$1"
            );
            if (yearRangeString && yearRangeString != data.titleCollection) {
              result.setEventYear(yearRangeString);
            } else {
              yearString = data.titleCollection.replace(
                /^.*(\d\d\d\d).*$/,
                "$1"
              );
              if (yearString && yearString != data.titleCollection) {
                result.setEventYear(yearString);
              }
            }
          }
        }
      }

      buildEventPlace(data, result, true);

      let occupation = getCleanRecordDataValue(data, "Occupation");
      if (occupation && occupation != "None") {
        result.occupation = occupation;
      }

      let age = getCleanValueForRecordDataList(data, ["Age"]);
      if (!age) {
        if (result.eventDate && result.eventDate.yearString) {
          let label = "Age in " + result.eventDate.yearString;
          age = getCleanRecordDataValue(data, label);
        }
      }
      if (age) {
        result.ageAtEvent = age;
      }
      let maritalStatus = getCleanValueForRecordDataList(data, [
        "Marital Status",
        "Marital status",
      ]);
      result.setMaritalStatus(maritalStatus);
      let relationshipToHead = getCleanValueForRecordDataList(data, [
        "Relationship to Head",
        "Relation to Head",
        "Relation to Head of House",
        "Relationship",
        "Relation",
      ]);

      result.setRelationshipToHead(relationshipToHead);

      buildHouseholdArray();

      // We can also determine parents and spouse in some cases
      // Note: This is a bit limited for Ancestry because we do not do the deep dive of fetching other
      // records unless we are building a household table.
      result.addSpouseOrParentsForSelectedHouseholdMember();
    }
  } else if (result.recordType == RT.NonpopulationCensus) {
    result.setEventDate(
      getCleanValueForRecordDataList(data, ["Enumeration Date"], "date")
    );
    result.setEventPlace(getCleanValueForRecordDataList(data, ["Place"]));
  } else if (result.recordType == RT.Marriage) {
    result.setEventDate(
      getCleanValueForRecordDataList(
        data,
        [
          "Marriage Date",
          "Marriage or Bann Date",
          "Marriage Banns Date",
          "Marriage License Date",
          "Bond Date",
          "Recording Date",
          "License Date",
          "Event Date",
          "Translated Marriage Date",
          "Marriage Year",
          "Marriage Date on Image",
        ],
        "date"
      )
    );

    let marriagePlace = getCleanValueForRecordDataList(data, [
      "Marriage Place",
      "Marriage or Bann Place",
      "Marriage Banns Place",
      "Marriage License Place",
      "Recording Place",
      "License Place",
      "Marriage State",
      "Marriage City",
    ]);
    if (marriagePlace) {
      result.setEventPlace(marriagePlace);
    } else {
      buildEventPlace(data, result);
    }
    result.setFieldIfValueExists(
      "ageAtEvent",
      getCleanValueForRecordDataList(data, ["Marriage Age", "Age"])
    );
    buildParents(data, result);

    let spouseName = getCleanValueForRecordDataList(data, [
      "Spouse",
      "Spouse Name",
      "Spouse's Name",
    ]);

    // occasionally there is no field for the spouse name but there is a Household Members sections
    // that lists the bride and groom. us_pa_marriage_1761_patience_brown is an example.
    if (!spouseName) {
      if (data.household && data.household.headings && data.household.members) {
        if (
          data.household.headings[0] == "Name" &&
          data.household.headings[1] == "Role"
        ) {
          if (data.household.members.length >= 2) {
            let thisPersonRole = data.recordData["Role"];
            if (thisPersonRole) {
              for (let member of data.household.members) {
                let role = member.Role;
                if (
                  role != thisPersonRole &&
                  (role == "Bride" || role == "Groom")
                ) {
                  if (member.Name) {
                    spouseName = member.Name;
                  }
                }
              }
            }
          }
        }
      }
    }

    if (
      (spouseName || result.eventDate) &&
      (!result.role || result.role == Role.Primary)
    ) {
      let name = new WtsName();

      if (spouseName) {
        name.name = spouseName;
      }

      let spouse = {
        name: name,
      };

      if (result.eventDate) {
        spouse.marriageDate = result.eventDate;
      }

      if (result.eventPlace) {
        spouse.marriagePlace = result.eventPlace;
      }

      let spouseAge = getCleanValueForRecordDataList(data, ["Spouse's Age"]);
      if (spouseAge) {
        spouse.age = spouseAge;
      }

      result.spouses = [spouse];

      if (result.personGender == "female") {
        result.lastNameAtDeath = name.inferLastName();
      }
    }
  } else if (result.recordType == RT.MarriageRegistration) {
    result.setEventDate(
      getCleanValueForRecordDataList(
        data,
        [
          "Marriage Registration Date",
          "Marriage Registration Year",
          "Marriage Date",
          "Marriage License Date",
          "Marriage Year",
        ],
        "date"
      )
    );

    let marriageRegistrationPlace = getCleanValueForRecordDataList(data, [
      "Marriage Registration Place",
      "Registration Place",
    ]);
    if (marriageRegistrationPlace && !result.registrationDistrict) {
      let place = marriageRegistrationPlace;
      let commaIndex = place.indexOf(`,`);
      if (commaIndex != -1) {
        place = place.substring(0, commaIndex);
      }
      result.registrationDistrict = place;
    }

    let marriagePlace = getCleanValueForRecordDataList(data, [
      "Marriage Registration Place",
      "Marriage Place",
      "Registration Place",
    ]);
    if (marriagePlace) {
      result.setEventPlace(marriagePlace);
    } else {
      buildEventPlace(data, result);
    }
    result.setFieldIfValueExists(
      "ageAtEvent",
      getCleanValueForRecordDataList(data, ["Marriage Age", "Age"])
    );

    let spouseName = getCleanValueForRecordDataList(data, [
      "Spouse",
      "Spouse Name",
    ]);

    if (!spouseName) {
      // For a UK marriage registration, if there are only two records on page, we can infer spouse
      if (data.recordData) {
        let records = data.recordData["Records on Page"];
        let name = data.recordData["Name"];
        if (records && name) {
          if (records.includes("<br/>")) {
            let names = records.split("<br/>");
            if (names.length == 2) {
              if (names[0] == name) {
                spouseName = names[1];
              } else if (names[1] == name) {
                spouseName = names[0];
              }
            }
          }
        }
      }
    }
    if (spouseName || result.eventDate) {
      let name = new WtsName();

      if (spouseName) {
        name.name = spouseName;
      }

      let spouse = {
        name: name,
      };

      if (result.eventDate) {
        spouse.marriageDate = result.eventDate;
      }

      if (result.eventPlace) {
        spouse.marriagePlace = result.eventPlace;
      }

      result.spouses = [spouse];

      if (result.personGender == "female") {
        result.lastNameAtDeath = name.inferLastName();
      }
    }
  } else if (result.recordType == RT.Baptism) {
    let birthDate = getCleanRecordDataValue(data, "Birth Date", "date");
    let baptismDate = getCleanValueForRecordDataList(
      data,
      ["Baptism Date", "Christening Date"],
      "date"
    );
    if (birthDate) {
      result.setBirthDate(birthDate);
    }
    if (baptismDate) {
      result.setEventDate(baptismDate);
    }

    // occasionally a baptism record also has a death date (usually for an infant death)
    result.setDeathDate(getCleanRecordDataValue(data, "Death Date", "date"));

    let eventPlace = getCleanValueForRecordDataList(data, [
      "Baptism Place",
      "Christening Place",
      "Parish",
    ]);
    if (eventPlace) {
      result.setEventPlace(eventPlace);
      result.setBirthPlace(eventPlace);
    }
    result.lastNameAtBirth = result.inferLastName();

    let age = getCleanValueForRecordDataList(data, [
      "Age",
      "Baptism Age",
      "Christening Age",
    ]);
    if (age) {
      result.ageAtEvent = age;
    }

    let fatherName = getCleanRecordDataValue(data, "Father");
    if (fatherName) {
      let father = result.addFather();
      father.name.name = fatherName;
    }
    let motherName = getCleanRecordDataValue(data, "Mother");
    if (motherName) {
      let mother = result.addMother();
      mother.name.name = motherName;
    }
  } else if (result.recordType == RT.Burial) {
    let birthDate = getCleanRecordDataValue(data, "Birth Date", "date");
    let deathDate = getCleanRecordDataValue(data, "Death Date", "date");
    let eventDate = getCleanValueForRecordDataList(
      data,
      [
        "Burial Date",
        "Burial or Cremation Date",
        "Interment Date",
        "Burial Year",
      ],
      "date"
    );

    if (birthDate) {
      result.setBirthDate(birthDate);
    }
    if (deathDate) {
      result.setDeathDate(deathDate);
    }
    if (eventDate) {
      result.setEventDate(eventDate);
    }

    let eventPlace = getCleanValueForRecordDataList(data, [
      "Burial Place",
      "Burial or Cremation Place",
      "Interment Place",
      "Cemetery Location",
      "Cemetery Name",
      "Cemetery",
    ]);
    let largerPlace = getCleanValueForRecordDataList(data, ["Location"]);
    if (largerPlace) {
      if (!eventPlace) {
        eventPlace = largerPlace;
      } else if (eventPlace != largerPlace) {
        eventPlace = eventPlace + ", " + largerPlace;
      }
    }
    if (eventPlace) {
      result.setEventPlace(eventPlace);
      result.setDeathPlace(eventPlace);
    }
    result.lastNameAtDeath = result.inferLastName();

    let age = getCleanRecordDataValue(data, "Age");
    if (age) {
      result.ageAtDeath = age;
    }
  } else if (result.recordType == RT.Cremation) {
    let birthDate = getCleanRecordDataValue(data, "Birth Date", "date");
    let deathDate = getCleanRecordDataValue(data, "Death Date", "date");
    let eventDate = getCleanValueForRecordDataList(
      data,
      ["Cremation Date", "Burial or Cremation Date"],
      "date"
    );

    if (birthDate) {
      result.setBirthDate(birthDate);
    }
    if (deathDate) {
      result.setDeathDate(deathDate);
    }
    if (eventDate) {
      result.setEventDate(eventDate);
    }

    let eventPlace = getCleanValueForRecordDataList(data, [
      "Cremation Place",
      "Burial or Cremation Place",
      "Burial Place",
    ]);
    if (eventPlace) {
      result.setEventPlace(eventPlace);
      result.setDeathPlace(eventPlace);
    }
    result.lastNameAtDeath = result.inferLastName();

    let age = getCleanRecordDataValue(data, "Age");
    if (age) {
      result.ageAtDeath = age;
    }
  } else if (result.recordType == RT.Obituary) {
    // if there is a death or burial date etc then this is likely a record for this person not a
    // child or spouse
    let birthDate = getCleanValueForRecordDataList(
      data,
      ["Birth Date"],
      "date"
    );
    let deathDate = getCleanValueForRecordDataList(
      data,
      ["Death Date"],
      "date"
    );
    let deathPlace = getCleanValueForRecordDataList(data, [
      "Death Place",
      "Death County",
    ]);
    let eventDate = getCleanValueForRecordDataList(
      data,
      ["Obituary Date", "Date", "Newspaper Date"],
      "date"
    );
    let eventPlace = getCleanValueForRecordDataList(data, [
      "Obituary Place",
      "Newspaper Place",
      "Place",
    ]);

    if (birthDate) {
      result.setBirthDate(birthDate);
    }
    if (deathDate) {
      result.setDeathDate(deathDate);
    }
    if (deathPlace) {
      result.setDeathPlace(deathPlace);
    }
    if (eventDate) {
      result.setEventDate(eventDate);
    }
    if (eventPlace) {
      result.setEventPlace(eventPlace);
    }
    result.lastNameAtDeath = result.inferLastName();

    let age = getCleanValueForRecordDataList(data, ["Age", "Death Age"]);
    if (age) {
      result.ageAtDeath = age;
    }
  } else if (result.recordType == RT.Will || result.recordType == RT.Probate) {
    result.setDeathDate(getCleanRecordDataValue(data, "Death Date", "date"));
    result.setDeathYear(getCleanRecordDataValue(data, "Death Year"));
    result.setEventDate(
      getCleanValueForRecordDataList(
        data,
        ["Probate Date", "Will Proved Date", "Grant Date"],
        "date"
      )
    );
    result.setEventYear(getCleanRecordDataValue(data, "Probate Year"));

    if (result.recordType == RT.Will) {
      result.recordSubtype = "Probate"; // for now assume Ancestry Will records have probate date
    }

    let eventPlace = getCleanValueForRecordDataList(data, ["Probate Registry"]);
    if (eventPlace) {
      result.setEventPlace(eventPlace);
    }
    let deathPlace = getCleanValueForRecordDataList(data, [
      "Residence",
      "Death Place",
      "Death County",
    ]);
    if (deathPlace) {
      result.setDeathPlace(deathPlace);
    }

    let role = getCleanRecordDataValue(data, "Role");
    if (role) {
      // Primary person's role field may be "Decedent"
      if (role == "Child" || role == "Daughter" || role == "Son") {
        result.role = Role.Child;
      } else if (role == "Parent" || role == "Father" || role == "Mother") {
        result.role = Role.Parent;
      } else if (role == "Spouse" || role == "Husband" || role == "Wife") {
        result.role = Role.Spouse;
      } else if (role == "Witness") {
        result.role = Role.Witness;
      }
    }

    // Some probate records have occupation (e.g. Victoria, Australia, Wills and Probate Records, 1841-2009)
    let occupation = getCleanRecordDataValue(data, "Occupation");
    if (occupation && occupation != "None") {
      result.occupation = occupation;
    }

    result.lastNameAtDeath = result.inferLastName();
  } else if (result.recordType == RT.Divorce) {
    result.setEventDate(
      getCleanValueForRecordDataList(
        data,
        ["Divorce Date", "Petition Date", "Date"],
        "date"
      )
    );
    result.setEventPlace(
      getCleanValueForRecordDataList(data, ["Divorce Place", "Location"])
    );

    let spouseName = getCleanValueForRecordDataList(data, [
      "Spouse",
      "Spouse Name",
    ]);

    if (spouseName) {
      let name = new WtsName();
      name.name = spouseName;
      let spouse = {
        name: name,
      };

      let marriageDate = getCleanValueForRecordDataList(
        data,
        ["Marriage Date", "Marriage Year"],
        "date"
      );
      if (marriageDate) {
        spouse.marriageDate = new WtsDate();
        spouse.marriageDate.dateString = marriageDate;
      }

      result.spouses = [spouse];
    }
  } else if (result.recordType == RT.BirthOrBaptism) {
    let birthDate = getCleanRecordDataValue(data, "Birth Date", "date");
    let baptismDate = getCleanValueForRecordDataList(
      data,
      ["Baptism Date", "Christening Date"],
      "date"
    );
    if (birthDate) {
      result.setBirthDate(birthDate);
    }
    if (baptismDate) {
      result.setEventDate(baptismDate);
    } else if (birthDate) {
      result.setEventDate(birthDate);
    }

    // occasionally a baptism record also has a death date (usually for an infant death)
    result.setDeathDate(getCleanRecordDataValue(data, "Death Date", "date"));

    let eventPlace = getCleanValueForRecordDataList(data, [
      "Baptism Place",
      "Christening Place",
      "Birth Place",
    ]);
    if (eventPlace) {
      result.setEventPlace(eventPlace);
      result.setBirthPlace(eventPlace);
    }
    result.lastNameAtBirth = result.inferLastName();

    let age = getCleanValueForRecordDataList(data, [
      "Age",
      "Baptism Age",
      "Christening Age",
    ]);
    if (age) {
      result.ageAtEvent = age;
    }

    if (result.role != Role.Parent) {
      let fatherName = getCleanRecordDataValue(data, "Father");
      if (fatherName) {
        let father = result.addFather();
        father.name.name = fatherName;
      }
      let motherName = getCleanRecordDataValue(data, "Mother");
      if (motherName) {
        let mother = result.addMother();
        mother.name.name = motherName;
      }
    }
  } else if (result.recordType == RT.Military) {
    result.setEventDate(
      getCleanValueForRecordDataList(
        data,
        [
          "Event Date",
          "Date",
          "Enlistment Date",
          "Service Start Date",
          "First Service Date",
          "Service Date",
          "Last Service Date",
          "Muster Date",
          "Military Date",
          "Residence Date",
        ],
        "date"
      )
    );
    result.setBirthDate(
      getCleanValueForRecordDataList(data, ["Birth Date"], "date")
    );
    result.setDeathDate(
      getCleanValueForRecordDataList(data, ["Death Date"], "date")
    );
    result.setEventYear(
      getCleanValueForRecordDataList(data, [
        "Event Year",
        "Year",
        "Enlistment Year",
        "Service Year",
        "Year Range",
        "Year range",
      ])
    );
    result.setEventPlace(
      getCleanValueForRecordDataList(data, [
        "Event Place",
        "Death Place",
        "Place",
        "Location",
        "Enlistment Place",
        "Residence",
        "Residence Place",
        "Residence Location",
        "Military Enlistment Place",
        "Service Start Place",
        "Military Service Location",
        "Pension Office Place",
        "Military Place",
        "Station or Residence Place",
        "State or Territory",
      ])
    );

    let dischargeDate = getCleanValueForRecordDataList(
      data,
      ["Discharge Date"],
      "date"
    );
    if (dischargeDate) {
      result.dischargeDate = dischargeDate;
    }

    let serviceNumber = getCleanValueForRecordDataList(data, [
      "Service Number",
      "Regimental Number",
    ]);
    if (serviceNumber) {
      result.serviceNumber = serviceNumber;
    }
    let rank = getCleanValueForRecordDataList(data, ["Rank"]);
    if (rank) {
      result.rank = rank;
    }
    let unit = getCleanValueForRecordDataList(data, [
      "Corps, Regiment or Unit",
      "Regiment",
      "Military Unit",
      "Unit",
    ]);
    if (unit) {
      result.unit = unit;
    }
    let militaryBranch = getCleanValueForRecordDataList(data, [
      "Enlistment Branch",
      "Branch of Service",
    ]);
    if (militaryBranch) {
      result.militaryBranch = militaryBranch;
    }
    let nextOfKin = getCleanValueForRecordDataList(data, ["Next of Kin"]);
    if (nextOfKin) {
      result.nextOfKin = nextOfKin;
    }

    // sometimes a military record can contain a spouse name and possibly a marriage date
    let spouseName = getCleanValueForRecordDataList(data, [
      "Spouse",
      "Spouse Name",
      "Spouse's Name",
    ]);
    if (spouseName) {
      let name = new WtsName();
      name.name = spouseName;

      let spouse = {
        name: name,
      };

      let marriageDate = getCleanValueForRecordDataList(data, [
        "Marriage Date",
      ]);
      let marriagePlace = getCleanValueForRecordDataList(data, [
        "Marriage Place",
      ]);

      if (marriageDate) {
        spouse.marriageDate = new WtsDate();
        spouse.marriageDate.dateString = marriageDate;
      }

      if (marriagePlace) {
        spouse.marriagePlace = new WtsPlace();
        spouse.marriagePlace.placeString = marriagePlace;
      }

      result.spouses = [spouse];
    }
  } else if (result.recordType == RT.SchoolRecords) {
    result.setEventDate(
      getCleanValueForRecordDataList(
        data,
        ["Yearbook Date", "Admission Date"],
        "date"
      )
    );

    result.setBirthDate(
      getCleanValueForRecordDataList(data, ["Birth Date"], "date")
    );
    result.setBirthYear(getCleanValueForRecordDataList(data, ["Birth Year"]));

    let schoolLocation = getCleanValueForRecordDataList(data, [
      "School Location",
    ]);
    let schoolName = getCleanValueForRecordDataList(data, ["School"]);

    result.setEventPlace(schoolLocation);

    if (schoolName) {
      result.schoolName = schoolName;
    }

    let age = getCleanValueForRecordDataList(data, ["Age", "Estimated Age"]);
    if (age) {
      result.ageAtEvent = age;
    }

    let fatherName = getCleanRecordDataValue(data, "Father");
    if (fatherName) {
      let father = result.addFather();
      father.name.name = fatherName;
    }
    let motherName = getCleanRecordDataValue(data, "Mother");
    if (motherName) {
      let mother = result.addMother();
      mother.name.name = motherName;
    }
  } else if (result.recordType == RT.PassengerList) {
    let departureDate = getCleanValueForRecordDataList(
      data,
      ["Departure Date", "Departure Year"],
      "date"
    );
    let arrivalDate = getCleanValueForRecordDataList(
      data,
      ["Arrival Date", "Arrival Year", "Arrival year"],
      "date"
    );
    let departurePlace = getCleanValueForRecordDataList(data, [
      "Departure Place",
    ]);
    let arrivalPlace = getCleanValueForRecordDataList(data, [
      "Arrival Place",
      "Arrival Country",
    ]);

    result.setFieldIfValueExists("departureDate", departureDate);
    result.setFieldIfValueExists("departurePlace", departurePlace);
    result.setFieldIfValueExists("arrivalDate", arrivalDate);
    result.setFieldIfValueExists("arrivalPlace", arrivalPlace);

    if (data.titleCollection.toLowerCase().includes("arriv")) {
      result.setEventDate(arrivalDate);
      result.setEventPlace(arrivalPlace);
    } else if (data.titleCollection.toLowerCase().includes("depart")) {
      result.setEventDate(departureDate);
      result.setEventPlace(departurePlace);
    } else if (arrivalDate || arrivalPlace) {
      result.setEventDate(arrivalDate);
      result.setEventPlace(arrivalPlace);
    } else if (departureDate || departurePlace) {
      result.setEventDate(departureDate);
      result.setEventPlace(departurePlace);
    }

    result.setFieldIfValueExists(
      "shipName",
      getCleanValueForRecordDataList(data, ["Ship"])
    );

    result.setFieldIfValueExists(
      "ageAtEvent",
      getCleanValueForRecordDataList(data, [
        "Age",
        "Departure Age",
        "Arrival Age",
      ])
    );
  } else if (result.recordType == RT.Naturalization) {
    result.setEventDate(
      getCleanValueForRecordDataList(
        data,
        [
          "Event Date",
          "Date",
          "Petition Date",
          "Declaration Date",
          "Certificate Date",
        ],
        "date"
      )
    );
    result.setEventPlace(
      getCleanValueForRecordDataList(data, [
        "Petition Place",
        "Declaration Place",
        "Event Place",
        "Place",
        "Location",
        "Residence",
        "Residence Place",
        "Residence Location",
        "Naturalisation Place",
        "Arrival Place",
      ])
    );
    let ageAtEvent = getCleanValueForRecordDataList(data, [
      "Age",
      "Petition Age",
      "Declaration Age",
    ]);
    if (ageAtEvent) {
      result.ageAtEvent = ageAtEvent;
    }
    result.setBirthDate(
      getCleanValueForRecordDataList(data, ["Birth Date"], "date")
    );
    result.setBirthPlace(getCleanValueForRecordDataList(data, ["Birth Place"]));
    let arrivalDate = getCleanValueForRecordDataList(data, ["Arrival Date"]);
    if (arrivalDate) {
      result.arrivalDate = arrivalDate;
    }
    let arrivalPlace = getCleanValueForRecordDataList(data, ["Arrival Place"]);
    if (arrivalPlace) {
      result.arrivalPlace = arrivalPlace;
    }
    let nativePlace = getCleanValueForRecordDataList(data, ["Native Place"]);
    if (nativePlace) {
      result.nativePlace = nativePlace;
    }
  } else {
    // generic record type support
    result.setEventDate(
      getCleanValueForRecordDataList(
        data,
        [
          "Event Date",
          "Date",
          "Residence Date",
          "Payment Date",
          "Obituary Date",
          "Departure Date",
          "Arrival Date",
          "Electoral Date",
          "Appointed Date",
          "Application Date",
          "Warrant Date",
          "Issue Date",
          "Appointment Date",
          "Discharge Date",
          "Death Date",
          "Hire Date",
          "Record Date",
          "Arrival Year",
          "Date Received",
          "Passport Issue Date",
        ],
        "date"
      )
    );
    result.setEventYear(
      getCleanValueForRecordDataList(data, [
        "Event Year",
        "Year",
        "Publication Year",
        "Enlistment Year",
        "Residence Year",
      ])
    );
    let eventPlace = getCleanValueForRecordDataList(data, [
      "Obituary Place",
      "Event Place",
      "Place",
      "Location",
      "Residence",
      "Residence Place",
      "Residence Location",
      "Military Enlistment Place",
      "Departure Place",
      "Arrival Place",
      "Appointed Place",
      "Death Place",
      "Warrant Location",
      "Last Residence Place",
      "Issue Port",
      "Post Office Location",
      "Record Place",
      "Place Moored",
      "Electoral Place",
      "Death County",
    ]);

    if (!eventPlace) {
      if (true) {
        // trying this out instead (2 Apr 2022)
        buildEventPlace(data, result, true);
      }
    }

    result.setEventPlace(eventPlace);

    // lots of record have a birth date. The narrative may not use it but search can.
    result.setBirthDate(
      getCleanValueForRecordDataList(data, ["Birth Date"], "date")
    );
    result.setBirthPlace(getCleanValueForRecordDataList(data, ["Birth Place"]));

    let ageAtEvent = getCleanValueForRecordDataList(data, [
      "Age",
      "Departure Age",
      "Arrival Age",
    ]);
    if (ageAtEvent) {
      result.ageAtEvent = ageAtEvent;
    }
  }
}

// This function generalizes the data extracted from an Ancestry page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeRecordData(input, result) {
  let data = input.extractedData;

  result.sourceType = "record";
  determineRecordTypeAndRole(data, result);

  result.sourceOfData = "ancestry";

  // from an Ancestry record we often do not have the name broken down into parts.
  let fullName = data.titleName;
  if (!fullName && data.recordData) {
    fullName = getCleanRecordDataValue(data, "Name");
  }
  result.setFullName(fullName);

  if (data.recordData != undefined) {
    result.setPersonGender(getCleanRecordDataValue(data, "Gender"));

    result.setEventCountry(getCleanRecordDataValue(data, "Country"));
    result.setEventCounty(
      getCleanValueForRecordDataList(data, ["County", "Inferred County"])
    );

    let registrationDate = getCleanValueForRecordDataList(
      data,
      ["Registration Date", "Date of Registration"],
      "date"
    );
    if (registrationDate) {
      // special case, date could be of form "1933 Jan-Feb-Mar"
      // e.g. https://www.ancestry.com/discoveryui-content/view/6407416:2534
      if (/^\d\d\d\d +\w\w\w\-\w\w\w\-\w\w\w$/.test(registrationDate)) {
        let yearString = registrationDate.replace(
          /^(\d\d\d\d) +\w\w\w\-\w\w\w\-\w\w\w$/,
          "$1"
        );
        let ancestryQuarter = registrationDate.replace(
          /^\d\d\d\d +(\w\w\w\-\w\w\w\-\w\w\w)$/,
          "$1"
        );
        if (
          yearString &&
          yearString != registrationDate &&
          ancestryQuarter &&
          ancestryQuarter != registrationDate
        ) {
          let quarter = -1;
          for (let quarterName of ancestryQuarterNames) {
            if (ancestryQuarter == quarterName.name) {
              quarter = quarterName.value;
              break;
            }
          }
          if (quarter != -1) {
            result.setEventYear(yearString);
            result.setEventQuarter(quarter);
          }
        }
      } else {
        result.setEventDate(registrationDate);
      }
    } else {
      let registrationYear = getCleanRecordDataValue(data, "Registration Year");
      if (registrationYear) {
        result.setEventYear(registrationYear);
      }
    }

    let registrationDistrict = getCleanValueForRecordDataList(data, [
      "Registration District",
      "Registration district",
    ]);
    if (registrationDistrict) {
      result.registrationDistrict = registrationDistrict;
    }

    let ancestryQuarter = getCleanValueForRecordDataList(data, [
      "Registration Quarter",
      "Quarter of the Year",
    ]);
    if (ancestryQuarter) {
      let quarter = -1;
      for (let quarterName of ancestryQuarterNames) {
        if (ancestryQuarter == quarterName.name) {
          quarter = quarterName.value;
          break;
        }
      }
      if (quarter != -1) {
        result.setEventQuarter(quarter);
      }
    } else if (registrationDate) {
      if (/^\w\w\w \d\d\d\d$/.test(registrationDate)) {
        let yearString = registrationDate.replace(/^\w\w\w (\d\d\d\d)$/, "$1");
        let ancestryQuarter = registrationDate.replace(
          /^(\w\w\w) \d\d\d\d$/,
          "$1"
        );

        if (
          yearString &&
          yearString != registrationDate &&
          ancestryQuarter &&
          ancestryQuarter != registrationDate
        ) {
          let quarter = -1;
          for (let quarterName of ancestryQuarterMonthNames) {
            if (ancestryQuarter == quarterName.name) {
              quarter = quarterName.value;
              break;
            }
          }
          if (quarter != -1) {
            result.setEventQuarter(quarter);
          }
        }
      }
    }

    generalizeDataGivenRecordType(data, result);
  }

  // Collection
  if (data.dbId) {
    // sometime the dbId is the text version and not the number.
    // e.g. 1911England instead of 2352
    let collectionId = data.dbId;
    let altIdCollection = RC.findCollectionByAltId("ancestry", data.dbId);
    if (altIdCollection) {
      collectionId = altIdCollection.sites["ancestry"].id;
    }
    result.collectionData = {
      id: collectionId,
    };

    if (data.recordData) {
      // could be an image page
      let volume = getCleanValueForRecordDataList(data, [
        "Volume",
        "Volume Number",
        "Volume number",
      ]);
      if (volume) {
        result.collectionData.volume = volume;
      }
      let page = getCleanValueForRecordDataList(data, [
        "Page",
        "Page number",
        "Page Number",
      ]);
      if (page) {
        result.collectionData.page = page;
      }
      let folio = getCleanRecordDataValue(data, "Folio");
      if (folio) {
        result.collectionData.folio = folio;
      }
      let piece = getCleanRecordDataValue(data, "Piece");
      if (piece) {
        result.collectionData.piece = piece;
      }
      let schedule = getCleanValueForRecordDataList(data, [
        "Schedule Number",
        "Household Schedule Number",
      ]);
      if (schedule) {
        result.collectionData.schedule = schedule;
      }
      let parish = getCleanValueForRecordDataList(data, [
        "Civil Parish",
        "Parish",
      ]);
      if (parish) {
        result.collectionData.parish = parish;
      }
      let county = getCleanValueForRecordDataList(data, [
        "County/Island",
        "County",
      ]);
      if (county) {
        result.collectionData.county = county;
      }
      let borough = getCleanValueForRecordDataList(data, ["Borough"]);
      if (borough) {
        result.collectionData.borough = borough;
      }
    }
  }
}

function generalizeProfileData(input, result) {
  let data = input.extractedData;

  result.sourceType = "profile";
  result.sourceOfData = "ancestry";

  result.setFullName(data.titleName);

  result.setBirthDate(data.birthDate);
  result.setBirthPlace(data.birthPlace);
  result.setDeathDate(data.deathDate);
  result.setDeathPlace(data.deathPlace);

  result.setPersonGender(data.gender);

  if (data.marriages) {
    for (let marriage of data.marriages) {
      let spouse = result.addSpouse();
      spouse.name.setFullName(marriage.spouseName);
      spouse.marriageDate.dateString = marriage.date;
      spouse.marriagePlace.placeString = marriage.place;
    }
  }

  if (data.fatherName) {
    let father = result.addFather();
    father.name.setFullName(data.fatherName);
  }
  if (data.motherName) {
    let mother = result.addMother();
    mother.name.setFullName(data.motherName);
  }
}

// This function generalizes the data extracted from an Ancestry page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeData(input) {
  let data = input.extractedData;

  let result = new GeneralizedData();

  if (data.pageType == "personFacts") {
    generalizeProfileData(input, result);
  } else {
    generalizeRecordData(input, result);
  }

  result.hasValidData = true;

  //console.log("End of Ancestry generalizeData, result is:");
  //console.log(result);

  return result;
}

function setExtraGdHouseholdFields(
  extractedData,
  generalizedMember,
  fieldNames
) {
  function setMemberData(propertyName, recordDataNames, standardizeFunction) {
    if (!generalizedMember[propertyName]) {
      let value = getCleanValueForRecordDataList(
        extractedData,
        recordDataNames
      );
      if (value) {
        if (standardizeFunction) {
          value = standardizeFunction(value);
        }
        generalizedMember[propertyName] = value;

        if (!fieldNames.includes(propertyName)) {
          fieldNames.push(propertyName);
        }
      }
    }
  }

  setMemberData(
    "relationship",
    [
      "Relationship to Head",
      "Relation to Head",
      "Relation to Head of House",
      "Relationship",
      "Relation",
    ],
    GD.standardizeRelationshipToHead
  );
  setMemberData(
    "maritalStatus",
    ["Marital Status", "Marital status"],
    GD.standardizeMaritalStatus
  );
  setMemberData("gender", ["Gender"], GD.standardizeGender);
  setMemberData("occupation", ["Occupation"]);
  setMemberData("birthDate", ["Birth Date", "DOB"]);
  setMemberData("birthPlace", [
    "Where born",
    "Where Born",
    "Birth Place",
    "Birthplace",
    "Birth place",
  ]);
  setMemberData("birthYear", ["Estimated Birth Year", "Birth Year"]);
  setMemberData("employer", ["Employer"]);
}

function regeneralizeDataWithLinkedRecords(input) {
  let data = input.extractedData;
  let result = input.generalizedData;
  let linkedRecords = input.linkedRecords;

  //console.log("regeneralizeDataWithLinkedRecords, data is:");
  //console.log(data);
  //console.log("regeneralizeDataWithLinkedRecords, result is:");
  //console.log(result);
  //console.log("regeneralizeDataWithLinkedRecords, linkedRecords is:");
  //console.log(linkedRecords);

  if (data.household) {
    for (let extractedMember of data.household.members) {
      if (extractedMember.link) {
        // find the same member in the generalized data
        let generalizedMember = undefined;
        for (let member of result.householdArray) {
          //console.log("regeneralizeDataWithLinkedRecords extractedMember.link is:" + extractedMember.link);
          if (member.uid == extractedMember.link) {
            generalizedMember = member;
            break;
          }
        }

        if (generalizedMember) {
          let memberData = undefined;
          if (generalizedMember.isSelected) {
            // we don't have a linked record for the primary member
            // But we want to do some similar filling out of fields
            //console.log("regeneralizeDataWithLinkedRecords member is selected");
            memberData = data;
          } else {
            let memberLinkedRecord = undefined;
            for (let linkedRecord of linkedRecords) {
              if (linkedRecord.link == extractedMember.link) {
                memberLinkedRecord = linkedRecord;
                break;
              }
            }
            if (memberLinkedRecord) {
              memberData = memberLinkedRecord.extractedData;
            }
          }

          if (memberData) {
            //console.log("regeneralizeDataWithLinkedRecords found matching member. Name is:" + generalizedMember.name);
            //console.log("regeneralizeDataWithLinkedRecords. Extracted data is :");
            //console.log(memberData);
            setExtraGdHouseholdFields(
              memberData,
              generalizedMember,
              result.householdArrayFields
            );
          }
        }
      }
    }
  } else if (data.linkData && result.role) {
    // if there are linkData and this person is not the primary person on the record
    // we should be able to get more detail from the linData of the primary person

    // Note the code below may be redundant because the code that adds the linked records
    // only adds the one that is needed so we are duplicating things here
    let primaryLink = undefined;
    if (result.role == "Parent") {
      let link = data.linkData["Child"];
      if (link) {
        primaryLink = link;
      }
    } else if (result.role == "Child") {
      let link = data.linkData["Parent"];
      if (link) {
        primaryLink = link;
      } else {
        let link = data.linkData["Father"];
        if (link) {
          primaryLink = link;
        } else {
          let link = data.linkData["Mother"];
          if (link) {
            primaryLink = link;
          }
        }
      }
    } else if (result.role == "Sibling") {
      let link = data.linkData["Siblings"];
      if (link) {
        primaryLink = link;
      }
    }

    //console.log("regeneralizeDataWithLinkedRecords, primaryLink is:");
    //console.log(primaryLink);

    if (primaryLink) {
      let primaryLinkedRecord = undefined;
      for (let linkedRecord of linkedRecords) {
        if (linkedRecord.link == primaryLink) {
          primaryLinkedRecord = linkedRecord;
          break;
        }
      }

      if (primaryLinkedRecord) {
        //console.log("regeneralizeDataWithLinkedRecords, primaryLinkedRecord.extractedData is:");
        //console.log(primaryLinkedRecord.extractedData);

        // Now we can look for extra data
        let gdInput = {};
        gdInput.extractedData = primaryLinkedRecord.extractedData;
        let generalizedData = generalizeData(gdInput);

        //console.log("regeneralizeDataWithLinkedRecords, primaryLinkedRecord generalizedData is:");
        //console.log(generalizedData);

        // even if we have an event date and place the one from the linked record should be better.
        // For example the parent in a child birt record can have a birth place which has been
        // interpreted as the event place incorrectly e.g.:
        // https://www.ancestry.com/discoveryui-content/view/300065623:8703
        if (generalizedData.eventPlace) {
          result.eventPlace = generalizedData.eventPlace;
        }
        if (generalizedData.eventDate) {
          result.eventDate = generalizedData.eventDate;
        }

        // because the linked record has more data it will have a more accurate recordType
        // For example the existing one might be BirthOrBaptism but the linked one may have
        // Baptism because it has a BaptismDate.
        // But we have to be careful in case it is an unclassified event
        if (
          generalizedData.recordType &&
          generalizedData.recordType != RT.Unclassified
        ) {
          result.recordType = generalizedData.recordType;

          if (result.overrideRefTitle) {
            // this means that we asked the user to specify the recordType because it was unclassified
            // But now we have a recordType from the linkedRecord.
            // So we didn't need to ask. If we leave the overrideRefTitle we can end up with
            // contradictory data in the citation if they picked the wrong type.
            delete result.overrideRefTitle;
          }
        }

        if (generalizedData.personGender && !result.primaryPersonGender) {
          result.primaryPersonGender = generalizedData.personGender;
        }

        // For a child marriage we want to get the spouse,
        // This is a bit confusing - we store this in result.spouses even though it is
        // the spouse of the child not this person
        if (generalizedData.spouses) {
          result.spouses = generalizedData.spouses;

          if (generalizedData.ageAtEvent) {
            result.primaryPersonAge = generalizedData.ageAtEvent;
          }
        } else {
          // for a child birth/baptism we want to get the other parent and put that in spouses
          let otherParent = undefined;
          if (generalizedData.parents) {
            if (result.personGender == "male") {
              if (generalizedData.parents.mother) {
                otherParent = generalizedData.parents.mother;
              }
            } else if (result.personGender == "female") {
              if (generalizedData.parents.father) {
                otherParent = generalizedData.parents.father;
              }
            } else if (result.name && result.name.name) {
              // don't know gender so have to compare our name with parent names
              let fatherName = "";
              let motherName = "";
              if (
                generalizedData.parents.father &&
                generalizedData.parents.father.name
              ) {
                fatherName = generalizedData.parents.father.name.name;
              }
              if (
                generalizedData.parents.mother &&
                generalizedData.parents.mother.name
              ) {
                motherName = generalizedData.parents.mother.name.name;
              }
              if (
                result.name.name == fatherName &&
                generalizedData.parents.mother
              ) {
                otherParent = generalizedData.parents.mother;
              } else if (
                result.name.name == motherName &&
                generalizedData.parents.father
              ) {
                otherParent = generalizedData.parents.father;
              }
            }
          }

          if (otherParent && otherParent.name) {
            result.spouses = [];
            result.spouses.push(otherParent);
          }
        }
      }
    }
  }

  //console.log("regeneralizeDataWithLinkedRecords, result is:");
  //console.log(result);
}

export {
  generalizeData,
  generalizeDataGivenRecordType,
  regeneralizeDataWithLinkedRecords,
  GeneralizedData,
  dateQualifiers,
};
