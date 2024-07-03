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
  PlaceObj,
  NameObj,
  DateObj,
} from "../../../base/core/generalize_data_utils.mjs";
import { RC } from "../../../base/core/record_collections.mjs";
import { RT, RecordSubtype, Role } from "../../../base/core/record_type.mjs";

function cleanName(name) {
  // currently all cleaning we need is done in generalize_data_utils
  // Ancestry names are pretty good
  return name;
}

const eventTypeStringToDataType = {
  BirthRegistration: RT.BirthRegistration,
  Birth: RT.Birth,
  DeathRegistration: RT.DeathRegistration,
  Death: RT.Death,
  Marriage: RT.Marriage,
  "ægteskab(Marriage)": RT.Marriage,
  "MarriageBanns(MarriageBann)": RT.Marriage,
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
  Will: RT.Will,
};

const recordTypeByFields = [
  { type: RT.Divorce, labels: ["Divorce Date"] },
  { type: RT.Marriage, labels: ["Marriage Date", "Marriage Place", "Spouse"] },
  { type: RT.Marriage, labels: ["Marriage Banns Date", "Marriage Banns Place", "Spouse"] },
  {
    type: RT.Marriage,
    labels: ["Marriage License Date", "Allegation Place", "Spouse"],
  },
  {
    type: RT.Marriage,
    labels: ["Affidavit or License Date", "License Place", "Spouse"],
  },
  {
    type: RT.Marriage,
    labels: ["Allegation Date", "Marriage License Place", "Spouse"],
  },
  { type: RT.Marriage, labels: ["License Date", "License Place", "Spouse"] },
  { type: RT.Baptism, labels: ["Baptism Date", "Baptism Place"] },
  { type: RT.Burial, labels: ["Burial Date", "Burial Place"] },
  { type: RT.Burial, labels: ["Burial Year", "Burial Place"] },
  { type: RT.Burial, labels: ["Death Date", "Burial Place"] },
  { type: RT.Burial, labels: ["Cemetery", "Cemetery Location", "Death Date"] },
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
  { type: RT.Military, labels: ["Enlistment Date", "Enlistment Location"] },
  { type: RT.Military, labels: ["Enlistment Year", "Enlistment Place"] },
  { type: RT.Military, labels: ["Enlistment Year", "Enlistment Location"] },
  { type: RT.Military, labels: ["Military Date", "Military Place"] },
  { type: RT.Military, labels: ["Regiment", "Rank"] },
  { type: RT.Military, labels: ["Muster Regiment"] },
  { type: RT.Will, labels: ["Will Date"] },
  { type: RT.Will, labels: ["Others Listed (Name)<br/>Relationship"] },
  { type: RT.Death, labels: ["Death Date", "Death Place"] },
  { type: RT.Death, labels: ["Death Date", "Cause of Death"] },
];

function determineRecordType(extractedData) {
  const titleMatches = [
    { type: RT.Death, matches: ["Federal Census Mortality Schedules"] },
    { type: RT.Baptism, matches: ["Christening Index"] },
    {
      type: RT.BirthRegistration,
      matches: ["Birth Index", "Births Index"],
      requiredData: [
        ["Birth Registration Place"],
        ["Birth Registration Date"],
        ["Registration Date"],
        ["Registration Year"],
        ["Registration Place"],
      ],
    },
    {
      type: RT.Birth,
      matches: ["Birth Index", "Births Index"],
      requiredData: [["Birth Date"], ["Birth Place"]],
    },
    {
      type: RT.Birth,
      matches: ["Birth Certificate", "Birth Record", "Birth Index"],
    },
    {
      type: RT.Baptism,
      matches: ["Births and Christenings", "Births and Baptisms", "Church of England Baptisms", "Baptism Index"],
      requiredData: [["Baptism Date"]],
    },
    {
      type: RT.Birth,
      matches: ["Births and Christenings", "Births and Baptisms", "Canada Births", "Canada, Births", "Birth Registers"],
      requiredData: [["Birth Date"]],
    },
    {
      type: RT.Birth,
      matches: ["Millennium File", "Vital Extracts", "Membership of The Church of Jesus Christ of Latter-day Saints"],
      requiredData: [["Birth Date"]],
    },
    {
      type: RT.Birth,
      matches: ["Births"],
      requiredData: [["Birth Date", "Birth Place", "Gender"]],
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
        "Allegations for Marriage Licences",
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
        "Cemetery Records",
        "Veterans Burial Cards",
        "Gravesites",
        "Graves of Revolutionary Patriots",
      ],
    },
    {
      type: RT.Burial,
      matches: ["Deaths and Burials", "Cemetery", "Funeral Home", "Gravestone"],
      requiredData: [["Burial Date"]],
    },
    {
      type: RT.Cremation,
      matches: ["Cemetery Records"],
      requiredData: [["Cremation Date"]],
    },
    {
      type: RT.Burial,
      matches: ["Historical Cemetery Commission Index", "Headstone Transcriptions", "Cemetery", "Funeral"],
      requiredData: [["Burial Place"], ["Burial Location"]],
    },
    {
      type: RT.Death,
      matches: ["Deaths", "Death Records", "Death Index", "Deaths Index"],
      requiredData: [["Death Date", "Death Place"]],
    },
    {
      type: RT.DeathRegistration,
      matches: ["Deaths", "Death Records", "Death Index", "Deaths Index"],
      requiredData: [
        ["Death Registration Place"],
        ["Registration Place"],
        ["Death Registration Date"],
        ["Registration Date"],
        ["Death Registration Year"],
        ["Registration Year"],
      ],
    },
    {
      type: RT.DeathRegistration,
      matches: ["Deaths", "Death Records", "Scotland, Local Heritage Index"],
      requiredData: [["Date of Registration"], ["Registration district"]],
    },
    {
      type: RT.Death,
      matches: ["Deaths", "Death Records", "Scotland, Local Heritage Index"],
      requiredData: [["Death Date"]],
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
    {
      type: RT.SlaveSchedule,
      matches: ["Slave Schedules"],
    },
    { type: RT.Census, matches: ["Census", "1939 England and Wales Register"] },
    {
      type: RT.ElectoralRegister,
      matches: ["Electoral Roll", "Voter Registers", "Electoral Registers"],
    },
    {
      type: RT.Will,
      matches: ["Prerogative Court of Canterbury Wills", "Will Index"],
    },
    {
      type: RT.Will,
      matches: ["Wills and Probate"],
      requiredData: [["Others Listed (Name)<br/>Relationship"], ["Will Date"]],
    },
    { type: RT.Probate, matches: ["Probate"] },
    {
      type: RT.MarriageRegistration,
      matches: ["Civil Registration Marriage Index"],
    },
    {
      type: RT.CriminalRegister,
      matches: ["Criminal Register", "Police Gazettes", "Convict Register", "Prison Hulk Register"],
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
      type: RT.FreedomOfCity,
      matches: ["Freedom of the City"],
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
      type: RT.Memorial,
      matches: ["Commonwealth War Graves"],
    },
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
        "Veteran Compensation",
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
        "Royal Naval Reserve Service Records",
        "Marine Corps Muster",
        "Army Roll of Honour",
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
      matches: ["Direct Tax Lists", "Tax and Exoneration", "Tax List Record", "Tax Record"],
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
      requiredData: [["Issue Date"]],
    },
    {
      type: RT.Residence,
      matches: ["Residents", "U.S., Public Records Index"],
      requiredData: [["Residence Place"]],
    },
    {
      type: RT.Residence,
      matches: ["U.S., Public Records Index"],
      requiredData: [["Residence"]],
    },
    {
      type: RT.Residence,
      matches: ["U.S., Public Records Index"],
      requiredData: [["Residence Date"]],
    },
    {
      type: RT.FamHistOrPedigree,
      matches: [
        "of the American Revolution Membership",
        "Colonial Families of the USA",
        "Geneanet Community Trees Index",
      ],
    },
    {
      // This could possibly be confused with a child marriage. It is to handle a record like this:
      // https://www.ancestry.com/discoveryui-content/view/154307070:61039
      type: RT.Baptism,
      matches: ["Catholic Parish Registers"],
      requiredData: [["Name", "Child", "Gender"]],
    },
    {
      type: RT.MarriageRegistration,
      matches: ["Marriage Index"],
      requiredData: [["Marriage Registration Place", "Spouse"]],
    },
    {
      type: RT.Marriage,
      matches: ["Marriage Index"],
      requiredData: [["Spouse"]],
    },
    {
      type: RT.Birth,
      matches: ["American Genealogical-Biographical Index"],
      requiredData: [["Birth Date"]],
    },
    {
      type: RT.Military,
      matches: ["Veteran", "Soldier", "Military", "Armed"],
      requiredData: [["Rank"]],
    },
    {
      type: RT.Military,
      matches: ["Veterans", "Soldier", "Military", "Armed"],
      requiredData: [["Muster In Date"]],
    },
    { type: RT.PassportApplication, matches: ["Passport Application"] },
    { type: RT.Pension, matches: [["Pension Index"]] },
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
    let noSpaceEventTypeString = eventTypeString.replace(/\s/g, "");
    let recordType = eventTypeStringToDataType[noSpaceEventTypeString];
    if (!recordType) {
      // for French records there are two languages. E.g.: "Mariage (Marriage)"
      let openParenIndex = noSpaceEventTypeString.indexOf("(");
      let closeParenIndex = noSpaceEventTypeString.indexOf(")");
      if (openParenIndex != -1 && closeParenIndex != -1 && openParenIndex < closeParenIndex) {
        let firstTypeString = noSpaceEventTypeString.substring(0, openParenIndex);
        let secondTypeString = noSpaceEventTypeString.substring(openParenIndex + 1, closeParenIndex);

        recordType = eventTypeStringToDataType[firstTypeString];
        if (recordType) {
          return recordType;
        }

        recordType = eventTypeStringToDataType[secondTypeString];
        if (recordType) {
          return recordType;
        }
      }
      console.log("determineRecordType: Unrecognised event or record type: " + eventTypeString);
    } else {
      return recordType;
    }
  }

  if (extractedData.titleCollection) {
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
        for (let requiredDataSet of titleMatch.requiredData) {
          let match = true;
          for (let fieldName of requiredDataSet) {
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

  function relationshipToRole(relationship) {
    if (relationship == "Child") {
      return Role.Child;
    } else if (relationship == "Son" || relationship == "Daughter") {
      return Role.Child;
    } else if (relationship == "Spouse" || relationship == "Wife") {
      return Role.Spouse;
    } else if (relationship == "Father") {
      return Role.Parent;
    } else if (relationship == "Mother") {
      return Role.Parent;
    } else if (relationship == "Sibling" || relationship == "Siblings") {
      return Role.Sibling;
    }
  }

  let recordType = result.recordType;

  if (recordType == RT.Baptism || recordType == RT.Birth || recordType == RT.BirthOrBaptism) {
    // if there is a baptism date etc then this is likely a record for this person not a
    // child or spouse. There could be a birth date though - for the parent of the child
    // e.g.: https://www.ancestry.com/discoveryui-content/view/300065623:8703?ssrc=pt&tid=180320731&pid=412419830925
    let value = getCleanValueForRecordDataList(extractedData, [
      "Baptism Date",
      "Christening Date",
      "Birth Date",
      "Baptism Year",
      "Christening Year",
      "Birth Year",
    ]);
    if (!value) {
      if (extractedData.recordData["Child"]) {
        // some family records have all parents and children of the primary person
        // ignore if Father or Mother fields
        if (!extractedData.recordData["Father"] && !extractedData.recordData["Mother"]) {
          result.role = Role.Parent;
          result.setPrimaryPersonFullName(cleanName(extractedData.recordData["Child"]));
        }
      }
    }
  } else if (recordType == RT.Death || recordType == RT.DeathRegistration || recordType == RT.Burial) {
    // if there is a death or burial date etc then this is likely a record for this person not a
    // child or spouse
    let value = getCleanValueForRecordDataList(extractedData, [
      "Death Date",
      "Burial Date",
      "Death Registration Date",
      "Registration Date",
      "Cremation Date",
      "Death Year",
      "Burial Year",
      "Cremation Year",
      "Death Registration Year",
      "Registration Year",
    ]);
    if (!value) {
      if (extractedData.recordData["Child"]) {
        result.role = Role.Parent;
        result.setPrimaryPersonFullName(cleanName(extractedData.recordData["Child"]));
      } else if (extractedData.recordData["Spouse"]) {
        if (
          !extractedData.recordData["Death Date"] &&
          !extractedData.recordData["Death Place"] &&
          !extractedData.recordData["Burial Date"] &&
          !extractedData.recordData["Burial Year"] &&
          !extractedData.recordData["Burial Place"]
        ) {
          result.role = Role.Spouse;
          result.setPrimaryPersonFullName(cleanName(extractedData.recordData["Spouse"]));
        }
      }
    }
  } else if (recordType == RT.Marriage || recordType == RT.MarriageRegistration) {
    // if there is a date etc then this is likely a record for this person not a
    // child or spouse
    let value = getCleanValueForRecordDataList(extractedData, [
      "Marriage Date",
      "Marriage Banns Date",
      "Allegation Date",
      "Affidavit or License Date",
      "Marriage Year",
      "Marriage Banns Year",
      "Allegation Year",
    ]);
    if (!value) {
      if (extractedData.recordData["Child"]) {
        if (!extractedData.recordData["Father"] && !extractedData.recordData["Mother"]) {
          result.role = Role.Parent;
          result.setPrimaryPersonFullName(cleanName(extractedData.recordData["Child"]));
        }
      }
    }
  }
  // possibly any other type should go through here?
  // We could possibly test if recordData num properties is <= 4 or something like that
  else if (recordType == RT.Unclassified || recordType == RT.Employment || recordType == RT.FreedomOfCity) {
    let hasDateKey = testForWordsInRecordDataKeys(extractedData, ["Date", "Place"]);
    if (!hasDateKey) {
      if (extractedData.recordData["Child"]) {
        if (!extractedData.recordData["Father"] && !extractedData.recordData["Mother"]) {
          result.role = Role.Parent;
          result.setPrimaryPersonFullName(cleanName(extractedData.recordData["Child"]));
        }
      } else if (extractedData.recordData["Spouse"]) {
        result.role = Role.Spouse;
        result.setPrimaryPersonFullName(cleanName(extractedData.recordData["Spouse"]));
      }
    } else {
      let hasBaptismOrBurialKey = testForWordsInRecordDataKeys(extractedData, [
        "Baptism",
        "Christening",
        "Burial",
        "Cremation",
      ]);
      if (!hasBaptismOrBurialKey) {
        // sometimes the parent's record for a child's birth gives that parents birth date
        // (Usually inferred from the parent's age)
        // Example: https://www.ancestry.com/discoveryui-content/view/602090064:61441
        // For now
        if (extractedData.recordData["Child"]) {
          if (!extractedData.recordData["Father"] && !extractedData.recordData["Mother"]) {
            result.role = Role.Parent;
            result.setPrimaryPersonFullName(cleanName(extractedData.recordData["Child"]));
          }
        }
      }
    }
  } else if (recordType == RT.Obituary) {
    // obituary can have lots of relations
    let hasDeathOrBurialKey = testForWordsInRecordDataKeys(extractedData, ["Death", "Burial", "Cremation"]);
    if (!hasDeathOrBurialKey) {
      if (extractedData.recordData["Child"]) {
        result.role = Role.Parent;
        result.setPrimaryPersonFullName(cleanName(extractedData.recordData["Child"]));
      } else if (extractedData.recordData["Spouse"]) {
        result.role = Role.Spouse;
        result.setPrimaryPersonFullName(cleanName(extractedData.recordData["Spouse"]));
      } else if (extractedData.recordData["Father"]) {
        result.role = Role.Child;
        result.setPrimaryPersonFullName(cleanName(extractedData.recordData["Father"]));
      } else if (extractedData.recordData["Mother"]) {
        result.role = Role.Child;
        result.setPrimaryPersonFullName(cleanName(extractedData.recordData["Mother"]));
      } else if (extractedData.recordData["Siblings"]) {
        result.role = Role.Sibling;
        result.setPrimaryPersonFullName(cleanName(extractedData.recordData["Siblings"]));
      }
    }
  } else if (recordType == RT.Will) {
    // will can have lots of relations, sometimes they get put in household table
    if (extractedData.household && extractedData.household.members.length > 1) {
      const members = extractedData.household.members;
      if (members[0].link) {
        // the first person has a link, this implies the record person is not the primary
        for (let member of members) {
          if (!member.link) {
            // this is the primary
            let relationship = member.Relationship;
            result.role = relationshipToRole(relationship);

            let otherName = members[0]["Others Listed (Name)"];
            result.setPrimaryPersonFullName(cleanName(otherName));
          }
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
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
      let secondDateString = newString.substring(openParenIndex + 1, closeParenIndex).trim();
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

function getCleanRecordDataValue(ed, fieldName, type = "") {
  if (!ed.recordData) {
    return "";
  }

  let value = ed.recordData[fieldName];
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

function getCleanValueForRecordDataList(ed, fieldNames, type = "") {
  for (let fieldName of fieldNames) {
    let value = getCleanRecordDataValue(ed, fieldName, type);
    if (value) {
      return value;
    }
  }
}

function testForWordsInRecordDataKeys(ed, words) {
  if (ed.recordData) {
    for (let key of Object.keys(ed.recordData)) {
      let keyWords = key.split(" ");
      for (let keyWord of keyWords) {
        let lcKeyWord = keyWord.toLowerCase();
        for (let word of words) {
          let lcWord = word.toLowerCase();
          if (lcWord == lcKeyWord) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

function testForRecordDataKey(ed, testKeys) {
  if (ed.recordData) {
    for (let key of Object.keys(ed.recordData)) {
      let lcKey = key.toLowerCase();
      for (let testKey of testKeys) {
        let lcTestKey = testKey.toLowerCase();
        if (lcTestKey == lcKey) {
          return true;
        }
      }
    }
  }

  return false;
}

function buildParents(ed, result) {
  let fatherName = getCleanValueForRecordDataList(ed, ["Father", "Father Name"]);
  if (fatherName) {
    let father = result.addFather();
    father.name.name = fatherName;
  }
  let motherName = getCleanValueForRecordDataList(ed, ["Mother", "Mother Name"]);
  if (motherName) {
    let mother = result.addMother();
    mother.name.name = motherName;
  }

  let mmn = getCleanValueForRecordDataList(ed, ["Mother Maiden Name", "Mother's Maiden Name"]);
  if (mmn) {
    result.mothersMaidenName = mmn;
  }
}

function buildEventPlace(ed, result, includeResidence) {
  let country = getCleanValueForRecordDataList(ed, ["Country"]);
  let state = getCleanValueForRecordDataList(ed, ["State", "Province"]);
  let county = getCleanValueForRecordDataList(ed, ["County/Island", "County", "County or Borough"]);
  let civilParish = getCleanValueForRecordDataList(ed, ["Civil Parish", "Civil parish", "Parish"]);
  let town = getCleanValueForRecordDataList(ed, ["Town", "Ward or Division/Constituency", "Locality"]);
  let streetAddress = getCleanValueForRecordDataList(ed, ["Street Address", "Address"]);
  let houseNumber = getCleanValueForRecordDataList(ed, ["House Number"]);
  let residence = "";

  if (includeResidence) {
    if (!country) {
      country = getCleanValueForRecordDataList(ed, ["Residence Country"]);
    }
    if (!state) {
      state = getCleanValueForRecordDataList(ed, ["Residence State", "Residence Province or Territory"]);
    }
    if (!county) {
      county = getCleanValueForRecordDataList(ed, ["County/Island", "County", "County or Borough", "Residence County"]);
    }
    if (!town) {
      town = getCleanValueForRecordDataList(ed, ["Place of Habitation", "Residence District"]);
    }
    if (!streetAddress) {
      streetAddress = getCleanValueForRecordDataList(ed, ["Street Address", "Address", "Residence Street or Township"]);
    }

    let yearString = result.inferEventYear();
    let homeString = "Home in " + yearString; // label used in US federal census
    let homeString2 = "Home in " + yearString + " (City, County, State)"; // label used in US 1800-1840 federal census
    residence = getCleanValueForRecordDataList(ed, ["Residence", "Residence Place", homeString, homeString2]);
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

  if (!placeString) {
    placeString = getCleanValueForRecordDataList(ed, ["Place"]);
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

function addWtSearchTemplates(ed, result) {
  let wtTemplates = [];
  let wtTemplatesRelated = [];

  function addLinkOrTemplate(templates, linkOrTemplate) {
    if (linkOrTemplate && linkOrTemplate.startsWith("{{")) {
      if (!templates.includes(linkOrTemplate)) {
        templates.push(linkOrTemplate);
      }
    }
  }

  addLinkOrTemplate(wtTemplates, ed.ancestryTemplate);

  if (ed.titleCollection && ed.titleCollection.includes("Find a Grave")) {
    if (ed.imageRecordId & ed.imageRecordId.includes("/memorial/")) {
      let memorialId = ed.imageRecordId.replace(/^.*\/memorial\/([^\/]+)\/.*$/, "$1");
      if (memorialId && memorialId != ed.imageRecordId) {
        addLinkOrTemplate(wtTemplatesRelated, "{{FindAGrave|" + memorialId + "}}");
      }
    }
  }

  if (ed.household && ed.household.members) {
    for (let member of ed.household.members) {
      if (member.dbId && member.recordId) {
        const template = "{{Ancestry Record|" + member.dbId + "|" + member.recordId + "}}";
        addLinkOrTemplate(wtTemplatesRelated, template);
      }
    }
  }

  if (ed.linkData) {
    for (let linkKey in ed.linkData) {
      const link = ed.linkData[linkKey];
      if (link) {
        // e.g.
        // https://search.ancestry.com/cgi-bin/sse.dll?dbid=1938&h=9150077&indiv=try&viewrecord=1&r=an
        // https://www.ancestry.com/discoveryui-content/view/19069234:1938
        // https://www.ancestry.com/discoveryui-content/view/9150077:1938?ssrc=pt&tid=8793438&pid=282564262344
        let dbId = "";
        let recordId = "";
        if (link.includes("discoveryui-content")) {
          let dbIdMatch = link.replace(/^.*\/discoveryui-content\/view\/(\d+)\:(\d+).*$/, "$2");
          let recordIdMatch = link.replace(/^.*\/discoveryui-content\/view\/(\d+)\:(\d+).*$/, "$1");

          if (dbIdMatch && dbIdMatch != link && recordIdMatch && recordIdMatch != link) {
            dbId = dbIdMatch;
            recordId = recordIdMatch;
          }
        } else if (link.includes("cgi-bin/sse.dll")) {
          if (/^.*[?&]dbid\=([\w\d]+)\&h\=(\d+).*$/.test(link)) {
            let dbIdMatch = link.replace(/^.*[?&]dbid\=([\w\d]+)\&h\=(\d+).*$/, "$1");
            let recordIdMatch = link.replace(/^.*[?&]dbid\=([\w\d]+)\&h\=(\d+).*$/, "$2");

            if (dbIdMatch && dbIdMatch != link && recordIdMatch && recordIdMatch != link) {
              dbId = dbIdMatch;
              recordId = recordIdMatch;
            }
          } else if (/.*[?&]db\=[\w\d]+\&/.test(link)) {
            // https://search.ancestry.com/cgi-bin/sse.dll?viewrecord=1&r=an&db=VictoriaBirthRecords&indiv=try&h=15250322
            let dbIdMatch = link.replace(/^.*[?&]db\=([\w\d]+).*\&h\=(\d+).*$/, "$1");
            let recordIdMatch = link.replace(/^.*[?&]db\=([\w\d]+).*\&h\=(\d+).*$/, "$2");

            if (dbIdMatch && dbIdMatch != link && recordIdMatch && recordIdMatch != link) {
              dbId = dbIdMatch;
              recordId = recordIdMatch;
            }
          }
        }

        if (dbId && recordId) {
          const template = "{{Ancestry Record|" + dbId + "|" + recordId + "}}";
          addLinkOrTemplate(wtTemplatesRelated, template);
        }
      }
    }
  }

  // if there are templates add them to result
  if (wtTemplates.length) {
    result.wtSearchTemplates = wtTemplates;
  }
  if (wtTemplatesRelated.length) {
    result.wtSearchTemplatesRelated = wtTemplatesRelated;
  }
}

function generalizeDataGivenRecordType(ed, result) {
  determineRoleGivenRecordType(ed, result);

  if (result.recordType == RT.BirthRegistration) {
    let birthDate = getCleanValueForRecordDataList(ed, ["Birth Date", "Birth Registration Date"], "date");
    if (birthDate) {
      result.setEventDate(birthDate);
      result.setBirthDate(birthDate);
    } else if (result.eventDate) {
      // result.eventDate may be set from "Registration Year"
      result.birthDate = result.eventDate;
    }

    let birthPlace = getCleanValueForRecordDataList(ed, ["Birth Place"]);
    if (birthPlace) {
      let county = getCleanRecordDataValue(ed, "Inferred County");
      if (county && !birthPlace.includes(county)) {
        birthPlace += ", " + county;
      }
      result.setBirthPlace(birthPlace);
    }

    let eventPlace = getCleanValueForRecordDataList(ed, [
      "Birth Registration Place",
      "Registration Place",
      "Birth Place",
    ]);
    if (eventPlace) {
      let county = getCleanRecordDataValue(ed, "Inferred County");
      if (county && !eventPlace.includes(county)) {
        eventPlace += ", " + county;
      }
      result.setEventPlace(eventPlace);
    } else if (result.registrationDistrict && ed.recordData["Inferred County"]) {
      let eventPlace = result.registrationDistrict;
      let county = getCleanRecordDataValue(ed, "Inferred County");
      if (!eventPlace.includes(county)) {
        eventPlace += ", " + county;
      }
      result.setEventPlace(eventPlace);
    }

    result.lastNameAtBirth = result.inferLastName();

    buildParents(ed, result);
  } else if (result.recordType == RT.Birth) {
    let birthDate = getCleanRecordDataValue(ed, "Birth Date", "date");
    if (birthDate) {
      result.setEventDate(birthDate);
      result.setBirthDate(birthDate);
    }

    let eventPlace = getCleanValueForRecordDataList(ed, ["Birth Place", "Birthplace", "Registration Place"]);
    if (eventPlace) {
      result.setBirthPlace(eventPlace);
      result.setEventPlace(eventPlace);
    }
    result.lastNameAtBirth = result.inferLastName();
    buildParents(ed, result);

    if (result.role && result.role == Role.Parent) {
      let spouseName = getCleanValueForRecordDataList(ed, ["Spouse"]);
      if (spouseName) {
        let name = new NameObj();

        if (spouseName) {
          name.name = spouseName;
        }

        let spouse = {
          name: name,
        };

        result.spouses = [spouse];
      }
    }

    let mmn = getCleanValueForRecordDataList(ed, ["Mother Maiden Name"]);
    if (mmn) {
      result.mothersMaidenName = mmn;
    }
  } else if (result.recordType == RT.DeathRegistration) {
    let deathDate = getCleanValueForRecordDataList(
      ed,
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

    let eventPlace = getCleanValueForRecordDataList(ed, ["Death Registration Place", "Registration Place"]);
    if (eventPlace) {
      if (!result.registrationDistrict) {
        let place = eventPlace;
        let commaIndex = place.indexOf(`,`);
        if (commaIndex != -1) {
          place = place.substring(0, commaIndex);
        }
        result.registrationDistrict = place;
      }

      let county = getCleanRecordDataValue(ed, "Inferred County");
      if (county && !eventPlace.includes(county)) {
        eventPlace += ", " + county;
      }
      result.setEventPlace(eventPlace);
    } else {
      let eventPlace = getCleanValueForRecordDataList(ed, ["Death Place", "Death County", "Residence Place"]);
      result.setEventPlace(eventPlace);
    }

    result.lastNameAtDeath = result.inferLastName();
    result.ageAtDeath = getCleanValueForRecordDataList(ed, ["Age at Death", "Death Age", "Age"]);

    // later England Death Registration include exact birth date
    let birthDate = getCleanValueForRecordDataList(ed, ["Birth Date"], "date");
    if (birthDate) {
      result.setBirthDate(birthDate);
    }
  } else if (result.recordType == RT.Death) {
    let deathDate = getCleanValueForRecordDataList(
      ed,
      ["Death Date", "Translated Death Date", "Death Date on Image", "Death Year"],
      "date"
    );
    if (deathDate) {
      result.setEventDate(deathDate);
      result.setDeathDate(deathDate);
    } else if (result.eventDate) {
      // result.eventDate may be set from "Registration Year"
      result.deathDate = result.eventDate;
    }

    let eventPlace = getCleanValueForRecordDataList(ed, ["Death Place", "Death County", "Death Country", "State"]);
    result.setEventPlace(eventPlace);

    let residencePlace = getCleanValueForRecordDataList(ed, [
      "Residence Place",
      "Last Residence Place",
      "Last Residence",
      "Residence",
    ]);
    result.setResidencePlace(residencePlace);

    result.lastNameAtDeath = result.inferLastName();

    let maidenName = getCleanValueForRecordDataList(ed, ["Maiden Name"]);
    if (maidenName) {
      result.lastNameAtBirth = maidenName;
    }

    let ageAtDeath = getCleanValueForRecordDataList(ed, ["Age at Death", "Death Age", "Age"]);
    if (ageAtDeath) {
      result.ageAtDeath = ageAtDeath;
    }

    let causeOfDeath = getCleanValueForRecordDataList(ed, ["Cause of Death"]);
    if (causeOfDeath) {
      result.causeOfDeath = causeOfDeath;
    }

    // later England Death Registration include exact birth date
    let birthDate = getCleanValueForRecordDataList(ed, ["Birth Date", "Birth Year"], "date");
    if (birthDate) {
      result.setBirthDate(birthDate);
    }

    buildParents(ed, result);
  } else if (result.recordType == RT.Census) {
    function buildHouseholdArray() {
      const stdFieldNames = [
        {
          stdName: "name",
          siteHeadings: ["Name", "Household Members", "Household Member(s)", "Household Members (Name)"],
        },
        { stdName: "age", siteHeadings: ["Age"] },
        { stdName: "relationship", siteHeadings: ["Relationship"] },
        { stdName: "race", siteHeadings: ["Race"] },
      ];
      function headingToStdName(heading) {
        for (let entry of stdFieldNames) {
          if (entry.siteHeadings.includes(heading)) {
            return entry.stdName;
          }
        }
      }
      if (ed.household && ed.household.members && ed.household.members.length > 0) {
        let headings = ed.household.headings;
        let members = ed.household.members;
        if (headings && members) {
          result.householdArrayFields = [];

          // check that we have a heading that maps to name, if not we do some extra work later
          let haveANameHeading = false;
          for (let heading of headings) {
            let fieldName = headingToStdName(heading);
            if (fieldName && fieldName == "name") {
              haveANameHeading = true;
              break;
            }
          }

          let householdArray = [];
          for (let member of members) {
            let householdMember = {};
            if (member.isClosed) {
              householdMember.isClosed = true;
            } else {
              for (let headingIndex = 0; headingIndex < headings.length; headingIndex++) {
                let heading = headings[headingIndex];
                let fieldName = headingToStdName(heading);

                // This could be the name column as Ancestry keeps changing its name
                if (!fieldName && !haveANameHeading && headingIndex == 0) {
                  fieldName = "name";
                }
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
              if (!member.recordId || member.recordId == ed.recordId) {
                isSelected = true;
              }
              if (isSelected) {
                householdMember.isSelected = isSelected;

                setExtraGdHouseholdFields(ed, householdMember, result.householdArrayFields);
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
          for (let headingIndex = 0; headingIndex < headings.length; headingIndex++) {
            let heading = headings[headingIndex];
            let fieldName = headingToStdName(heading);

            // This could be the name column as Ancestry keeps changing its name
            if (!fieldName && !haveANameHeading && headingIndex == 0) {
              fieldName = "name";
            }

            if (fieldName) {
              householdArrayFields.push(fieldName);
            }
          }
          result.householdArrayFields = householdArrayFields;
        }
      }
    }

    if (ed.titleCollection && ed.titleCollection.includes("1939")) {
      result.setEventYear("1939");

      let birthDate = getCleanValueForRecordDataList(ed, ["Birth Date"], "date");
      result.setBirthDate(birthDate);

      let maritalStatus = getCleanValueForRecordDataList(ed, ["Marital Status", "Marital status"]);
      result.setMaritalStatus(maritalStatus);

      let streetAddress = getCleanRecordDataValue(ed, "Address");
      let place = getCleanRecordDataValue(ed, "Residence Place");
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

      let occupation = getCleanRecordDataValue(ed, "Occupation");
      if (occupation && occupation != "None") {
        result.occupation = occupation;
      }

      let positionInHousehold = getCleanRecordDataValue(ed, "Sub Schedule Number");
      if (positionInHousehold) {
        if (positionInHousehold == 1) {
          result.relationshipToHead = "head";
        }
      }

      buildHouseholdArray();
    } else {
      let birthYear = getCleanValueForRecordDataList(ed, ["Estimated Birth Year", "Birth Year"]);

      if (birthYear) {
        let estYear = birthYear;
        if (estYear.startsWith("abt ")) {
          estYear = estYear.substring(4);
        }
        result.setBirthYear(estYear);
        result.birthDate.qualifier = dateQualifiers.ABOUT;
      }

      let birthPlace = getCleanValueForRecordDataList(ed, [
        "Where born",
        "Where Born",
        "Birth Place",
        "Birth place",
        "Birthplace",
      ]);
      if (birthPlace) {
        result.setBirthPlace(birthPlace);
      }

      if (!result.eventDate || (!result.eventDate.dateString && !result.eventDate.yearString)) {
        // see if we can get the census year from a field
        let yearString = getCleanValueForRecordDataList(ed, [
          "Enumeration Year",
          "Residence Year",
          "Census Year",
          "Census year",
          "Year",
        ]);
        if (yearString) {
          result.setEventYear(yearString);
        } else {
          let dateString = getCleanValueForRecordDataList(ed, ["Enumeration Date", "Residence Date", "Census Date"]);
          if (dateString) {
            result.setEventDate(dateString);
          } else if (ed.titleCollection) {
            // extract the year from the collection title, if it is a range treat that specially
            let yearRangeString = ed.titleCollection.replace(/^.*(\d\d\d\d\-\d\d\d\d).*$/, "$1");
            if (yearRangeString && yearRangeString != ed.titleCollection) {
              result.setEventYear(yearRangeString);
            } else {
              yearString = ed.titleCollection.replace(/^.*(\d\d\d\d).*$/, "$1");
              if (yearString && yearString != ed.titleCollection) {
                result.setEventYear(yearString);
              }
            }
          }
        }
      }

      buildEventPlace(ed, result, true);

      let occupation = getCleanRecordDataValue(ed, "Occupation");
      if (occupation && occupation != "None") {
        result.occupation = occupation;
      }

      let age = getCleanValueForRecordDataList(ed, ["Age"]);
      if (!age) {
        if (result.eventDate && result.eventDate.yearString) {
          let label = "Age in " + result.eventDate.yearString;
          age = getCleanRecordDataValue(ed, label);
        }
      }
      if (age) {
        result.ageAtEvent = age;
      }
      let maritalStatus = getCleanValueForRecordDataList(ed, ["Marital Status", "Marital status"]);
      result.setMaritalStatus(maritalStatus);
      let relationshipToHead = getCleanValueForRecordDataList(ed, [
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
    result.setEventDate(getCleanValueForRecordDataList(ed, ["Enumeration Date"], "date"));
    result.setEventPlace(getCleanValueForRecordDataList(ed, ["Place"]));
  } else if (result.recordType == RT.SlaveSchedule) {
    result.setEventDate(getCleanValueForRecordDataList(ed, ["Residence Date"], "date"));
    result.setEventPlace(getCleanValueForRecordDataList(ed, ["Residence Place"]));
    result.setFieldIfValueExists("ageAtEvent", getCleanValueForRecordDataList(ed, ["Age"]));

    let role = getCleanValueForRecordDataList(ed, ["Role"]);
    let numEnslavedPeople = getCleanValueForRecordDataList(ed, ["Number of Enslaved People"]);
    let race = getCleanValueForRecordDataList(ed, ["Race"]);
    let slaveOwner = getCleanValueForRecordDataList(ed, ["Slave Owner"]);
    let wasFugitive = getCleanValueForRecordDataList(ed, ["Fugitive"]);
    if (role || numEnslavedPeople || race || slaveOwner || wasFugitive) {
      result.setTypeSpecficDataValue("role", role);
      result.setTypeSpecficDataValue("numEnslavedPeople", numEnslavedPeople);
      result.setTypeSpecficDataValue("race", race);
      result.setTypeSpecficDataValue("slaveOwner", slaveOwner);
      result.setTypeSpecficDataValue("wasFugitive", wasFugitive && wasFugitive == "X");
    }
  } else if (result.recordType == RT.Marriage) {
    result.setEventDate(
      getCleanValueForRecordDataList(
        ed,
        [
          "Marriage Date",
          "Marriage or Bann Date",
          "Marriage Banns Date",
          "Marriage License Date",
          "Bond Date",
          "Recording Date",
          "License Date",
          "Event Date",
          "Allegation Date",
          "Affidavit or License Date",
          "Translated Marriage Date",
          "Marriage Year",
          "Marriage Date on Image",
        ],
        "date"
      )
    );

    let marriagePlace = getCleanValueForRecordDataList(ed, [
      "Marriage Place",
      "Marriage or Bann Place",
      "Marriage Banns Place",
      "Marriage License Place",
      "Recording Place",
      "License Place",
      "Allegation Place",
      "Marriage State",
      "Marriage City",
    ]);
    if (marriagePlace) {
      result.setEventPlace(marriagePlace);
    } else {
      buildEventPlace(ed, result);
    }
    result.setFieldIfValueExists("ageAtEvent", getCleanValueForRecordDataList(ed, ["Marriage Age", "Age"]));
    buildParents(ed, result);

    let spouseName = getCleanValueForRecordDataList(ed, ["Spouse", "Spouse Name", "Spouse's Name"]);

    // occasionally there is no field for the spouse name but there is a Household Members sections
    // that lists the bride and groom. us_pa_marriage_1761_patience_brown is an example.
    if (!spouseName) {
      if (ed.household && ed.household.headings && ed.household.members) {
        if (ed.household.headings[0] == "Name" && ed.household.headings[1] == "Role") {
          if (ed.household.members.length >= 2) {
            let thisPersonRole = ed.recordData["Role"];
            if (thisPersonRole) {
              for (let member of ed.household.members) {
                let role = member.Role;
                if (role != thisPersonRole && (role == "Bride" || role == "Groom")) {
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

    if ((spouseName || result.eventDate) && (!result.role || result.role == Role.Primary)) {
      let name = new NameObj();

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

      let spouseAge = getCleanValueForRecordDataList(ed, ["Spouse's Age"]);
      if (spouseAge) {
        spouse.age = spouseAge;
      }

      result.spouses = [spouse];

      if (result.personGender == "female") {
        result.lastNameAtDeath = name.inferLastName();
      }
    }

    // check if the record subtype should be banns
    if (ed.recordData && ed.recordData["Record Type"]) {
      let ancestryRecordType = ed.recordData["Record Type"];
      if (ancestryRecordType.includes("Marriage Banns") || ancestryRecordType.includes("Marriage Bann")) {
        result.recordSubtype = RecordSubtype.Banns;
      }
    }
    if (!result.recordSubtype) {
      let marriageBannsDate = getCleanValueForRecordDataList(ed, ["Marriage Banns Date"], "date");
      let marriageBannsPlace = getCleanValueForRecordDataList(ed, ["Marriage Banns Place"]);

      if (marriageBannsDate || marriageBannsPlace) {
        result.recordSubtype = RecordSubtype.Banns;
      }
    }

    // some marriage records have a birth date and or place
    // e.g.: https://www.ancestry.com/discoveryui-content/view/5534132:62011
    result.setBirthDate(getCleanRecordDataValue(ed, "Birth Date", "date"));
    result.setBirthPlace(getCleanValueForRecordDataList(ed, ["Birth Place"]));
  } else if (result.recordType == RT.MarriageRegistration) {
    result.setEventDate(
      getCleanValueForRecordDataList(
        ed,
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

    let marriageRegistrationPlace = getCleanValueForRecordDataList(ed, [
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

    let marriagePlace = getCleanValueForRecordDataList(ed, [
      "Marriage Registration Place",
      "Marriage Place",
      "Registration Place",
    ]);
    if (marriagePlace) {
      result.setEventPlace(marriagePlace);
    } else {
      buildEventPlace(ed, result);
    }
    result.setFieldIfValueExists("ageAtEvent", getCleanValueForRecordDataList(ed, ["Marriage Age", "Age"]));

    let spouseName = getCleanValueForRecordDataList(ed, ["Spouse", "Spouse Name"]);

    if (!spouseName) {
      // For a UK marriage registration, if there are only two records on page, we can infer spouse
      if (ed.recordData) {
        let records = ed.recordData["Records on Page"];
        let name = ed.recordData["Name"];
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
      let name = new NameObj();

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
    let birthDate = getCleanRecordDataValue(ed, "Birth Date", "date");
    let baptismDate = getCleanValueForRecordDataList(ed, ["Baptism Date", "Christening Date"], "date");
    if (birthDate) {
      result.setBirthDate(birthDate);
    }
    if (baptismDate) {
      result.setEventDate(baptismDate);
    }

    // occasionally a baptism record also has a death date (usually for an infant death)
    result.setDeathDate(getCleanRecordDataValue(ed, "Death Date", "date"));

    let eventPlace = getCleanValueForRecordDataList(ed, ["Baptism Place", "Christening Place", "Parish"]);
    if (eventPlace) {
      result.setEventPlace(eventPlace);
      result.setBirthPlace(eventPlace);
    }
    result.lastNameAtBirth = result.inferLastName();

    let age = getCleanValueForRecordDataList(ed, ["Age", "Baptism Age", "Christening Age"]);
    if (age) {
      result.ageAtEvent = age;
    }

    let fatherName = getCleanRecordDataValue(ed, "Father");
    if (fatherName && fatherName.toLowerCase() != "n/a" && fatherName.toLowerCase() != "unknown") {
      let father = result.addFather();
      father.name.name = fatherName;
    }
    let motherName = getCleanRecordDataValue(ed, "Mother");
    if (motherName && motherName.toLowerCase() != "n/a" && motherName.toLowerCase() != "unknown") {
      let mother = result.addMother();
      mother.name.name = motherName;
    }
  } else if (result.recordType == RT.Burial) {
    let birthDate = getCleanRecordDataValue(ed, "Birth Date", "date");
    let deathDate = getCleanRecordDataValue(ed, "Death Date", "date");
    let eventDate = getCleanValueForRecordDataList(
      ed,
      ["Burial Date", "Burial or Cremation Date", "Interment Date", "Burial Year"],
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

    let eventPlace = getCleanValueForRecordDataList(ed, [
      "Burial Place",
      "Burial or Cremation Place",
      "Interment Place",
      "Cemetery Location",
      "Cemetery Name",
      "Cemetery",
    ]);
    let largerPlace = getCleanValueForRecordDataList(ed, ["Location"]);
    if (largerPlace) {
      if (!eventPlace) {
        eventPlace = largerPlace;
      } else if (eventPlace != largerPlace) {
        eventPlace = eventPlace + ", " + largerPlace;
      }
    }

    let deathPlace = eventPlace;
    let cemeteryName = getCleanValueForRecordDataList(ed, ["Cemetery"]);
    if (cemeteryName) {
      if (!eventPlace) {
        eventPlace = cemeteryName;
      } else if (!eventPlace.startsWith(cemeteryName)) {
        eventPlace = cemeteryName + ", " + eventPlace;
      }
    }

    if (eventPlace) {
      result.setEventPlace(eventPlace);
      result.setDeathPlace(deathPlace);
    }
    result.lastNameAtDeath = result.inferLastName();

    let age = getCleanRecordDataValue(ed, "Age");
    if (age) {
      result.ageAtDeath = age;
    }
  } else if (result.recordType == RT.Cremation) {
    let birthDate = getCleanRecordDataValue(ed, "Birth Date", "date");
    let deathDate = getCleanRecordDataValue(ed, "Death Date", "date");
    let eventDate = getCleanValueForRecordDataList(ed, ["Cremation Date", "Burial or Cremation Date"], "date");

    if (birthDate) {
      result.setBirthDate(birthDate);
    }
    if (deathDate) {
      result.setDeathDate(deathDate);
    }
    if (eventDate) {
      result.setEventDate(eventDate);
    }

    let eventPlace = getCleanValueForRecordDataList(ed, [
      "Cremation Place",
      "Burial or Cremation Place",
      "Burial Place",
    ]);
    if (eventPlace) {
      result.setEventPlace(eventPlace);
      result.setDeathPlace(eventPlace);
    }
    result.lastNameAtDeath = result.inferLastName();

    let age = getCleanRecordDataValue(ed, "Age");
    if (age) {
      result.ageAtDeath = age;
    }
  } else if (result.recordType == RT.Obituary) {
    // if there is a death or burial date etc then this is likely a record for this person not a
    // child or spouse
    let birthDate = getCleanValueForRecordDataList(ed, ["Birth Date"], "date");
    let deathDate = getCleanValueForRecordDataList(ed, ["Death Date"], "date");
    let deathPlace = getCleanValueForRecordDataList(ed, ["Death Place", "Death County"]);
    let eventDate = getCleanValueForRecordDataList(ed, ["Obituary Date", "Date", "Newspaper Date"], "date");
    let eventPlace = getCleanValueForRecordDataList(ed, ["Obituary Place", "Newspaper Place", "Place"]);

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

    let age = getCleanValueForRecordDataList(ed, ["Age", "Death Age"]);
    if (age) {
      result.ageAtDeath = age;
    }
  } else if (result.recordType == RT.Will || result.recordType == RT.Probate) {
    let deathDate = getCleanRecordDataValue(ed, "Death Date", "date");
    result.setDeathDate(deathDate);
    result.setDeathYear(getCleanRecordDataValue(ed, "Death Year"));
    result.setResidencePlace(getCleanRecordDataValue(ed, "Residence Place"));

    let probateGrantDate = getCleanValueForRecordDataList(
      ed,
      ["Probate Date", "Will Proved Date", "Grant Date"],
      "date"
    );
    let willDate = getCleanValueForRecordDataList(ed, ["Will Date"], "date");

    if (probateGrantDate) {
      result.setEventDate(probateGrantDate);
      result.setTypeSpecficDataValue("willDate", willDate);
    } else {
      result.setTypeSpecficDataValue("dateIsNotGrantDate", true);
      result.setEventDate(willDate);
    }
    result.setEventYear(getCleanRecordDataValue(ed, "Probate Year"));

    // special case see: https://www.ancestry.com/discoveryui-content/view/10725078:8800
    if (result.eventDate === undefined) {
      const desc = getCleanValueForRecordDataList(ed, ["Item Description"]);
      if (desc) {
        if (/^.*\d\d\d\d\-\d\d\d\d$/.test(desc)) {
          let range = desc.replace(/^.*(\d\d\d\d\-\d\d\d\d)$/, "$1");
          let start = range.substring(0, 4);
          let end = range.substring(5);
          if (start == end) {
            result.setEventYear(start);
          } else {
            result.setEventYear(range);
          }
        } else if (/^.*\d\d\d\d$/.test(desc)) {
          let date = desc.replace(/^.*(\d\d\d\d)$/, "$1");
          result.setEventYear(date);
        }
      }
    }

    if (result.recordType == RT.Will && probateGrantDate) {
      result.recordSubtype = "Probate"; // for now assume Ancestry Will records have probate date
    }

    let eventPlace = getCleanValueForRecordDataList(ed, ["Probate Registry", "Probate Place"]);
    if (eventPlace) {
      result.setEventPlace(eventPlace);
    }
    let deathPlace = getCleanValueForRecordDataList(ed, [
      "Residence",
      "Death Place",
      "Death County",
      "Inferred Death Place",
    ]);
    if (deathPlace) {
      result.setDeathPlace(deathPlace);
    }

    let role = getCleanRecordDataValue(ed, "Role");
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
    let occupation = getCleanRecordDataValue(ed, "Occupation");
    if (occupation && occupation != "None") {
      result.occupation = occupation;
    }

    result.lastNameAtDeath = result.inferLastName();
  } else if (result.recordType == RT.Divorce) {
    result.setEventDate(getCleanValueForRecordDataList(ed, ["Divorce Date", "Petition Date", "Date"], "date"));
    result.setEventPlace(getCleanValueForRecordDataList(ed, ["Divorce Place", "Location"]));

    let spouseName = getCleanValueForRecordDataList(ed, ["Spouse", "Spouse Name"]);

    if (spouseName) {
      let spouse = result.addSpouse();
      spouse.name.name = spouseName;

      let marriageDate = getCleanValueForRecordDataList(ed, ["Marriage Date", "Marriage Year"], "date");
      if (marriageDate) {
        spouse.marriageDate.setDateAndQualifierFromString(marriageDate);
      }
    }
  } else if (result.recordType == RT.BirthOrBaptism) {
    let birthDate = getCleanRecordDataValue(ed, "Birth Date", "date");
    let baptismDate = getCleanValueForRecordDataList(ed, ["Baptism Date", "Christening Date"], "date");
    if (birthDate) {
      result.setBirthDate(birthDate);
    }
    if (baptismDate) {
      result.setEventDate(baptismDate);
    } else if (birthDate) {
      result.setEventDate(birthDate);
    }

    // occasionally a baptism record also has a death date (usually for an infant death)
    result.setDeathDate(getCleanRecordDataValue(ed, "Death Date", "date"));

    let eventPlace = getCleanValueForRecordDataList(ed, ["Baptism Place", "Christening Place", "Birth Place"]);
    if (eventPlace) {
      result.setEventPlace(eventPlace);
      result.setBirthPlace(eventPlace);
    }
    result.lastNameAtBirth = result.inferLastName();

    let age = getCleanValueForRecordDataList(ed, ["Age", "Baptism Age", "Christening Age"]);
    if (age) {
      result.ageAtEvent = age;
    }

    if (result.role != Role.Parent) {
      let fatherName = getCleanRecordDataValue(ed, "Father");
      if (fatherName) {
        let father = result.addFather();
        father.name.name = fatherName;
      }
      let motherName = getCleanRecordDataValue(ed, "Mother");
      if (motherName) {
        let mother = result.addMother();
        mother.name.name = motherName;
      }
    }
  } else if (result.recordType == RT.Military) {
    result.setEventDate(
      getCleanValueForRecordDataList(
        ed,
        [
          "Event Date",
          "Date",
          "Death Date",
          "Casualty Date",
          "Enlistment Date",
          "Service Start Date",
          "First Service Date",
          "Service Date",
          "Last Service Date",
          "Muster Date",
          "Military Date",
          "Residence Date",
          "Embarkation",
        ],
        "date"
      )
    );
    result.setBirthDate(getCleanValueForRecordDataList(ed, ["Birth Date"], "date"));
    result.setDeathDate(getCleanValueForRecordDataList(ed, ["Death Date"], "date"));
    if (!result.eventDate) {
      result.setEventYear(
        getCleanValueForRecordDataList(ed, [
          "Event Year",
          "Year",
          "Enlistment Year",
          "Service Year",
          "Year Range",
          "Year range",
        ])
      );
    }
    result.setEventPlace(
      getCleanValueForRecordDataList(ed, [
        "Event Place",
        "Death Place",
        "Place",
        "Location",
        "Theatre of War",
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

    let enlistmentDate = getCleanValueForRecordDataList(ed, ["Enlistment Date"], "date");
    if (enlistmentDate) {
      result.enlistmentDate = enlistmentDate;
    }
    let dischargeDate = getCleanValueForRecordDataList(ed, ["Discharge Date"], "date");
    if (dischargeDate) {
      result.dischargeDate = dischargeDate;
    }

    let serviceNumber = getCleanValueForRecordDataList(ed, ["Service Number", "Regimental Number"]);
    if (serviceNumber) {
      result.serviceNumber = serviceNumber;
    }
    let rank = getCleanValueForRecordDataList(ed, ["Rank"]);
    if (rank) {
      result.rank = rank;
    }
    let unit = getCleanValueForRecordDataList(ed, [
      "Corps, Regiment or Unit",
      "Regiment",
      "Casualty Regiment",
      "Enlistment Regiment",
      "Military Unit",
      "Unit",
      "Casualty Unit",
      "Enlistment Unit",
    ]);
    if (unit) {
      result.unit = unit;
    }
    let militaryBranch = getCleanValueForRecordDataList(ed, ["Enlistment Branch", "Branch of Service"]);
    if (militaryBranch) {
      result.militaryBranch = militaryBranch;
    }
    let nextOfKin = getCleanValueForRecordDataList(ed, ["Next of Kin"]);
    if (nextOfKin) {
      result.nextOfKin = nextOfKin;
    }

    // sometimes a military record can contain a spouse name and possibly a marriage date
    let spouseName = getCleanValueForRecordDataList(ed, ["Spouse", "Spouse Name", "Spouse's Name"]);
    if (spouseName) {
      let spouse = result.addSpouse();
      spouse.name.name = spouseName;

      let marriageDate = getCleanValueForRecordDataList(ed, ["Marriage Date"]);
      let marriagePlace = getCleanValueForRecordDataList(ed, ["Marriage Place"]);

      if (marriageDate) {
        spouse.marriageDate.setDateAndQualifierFromString(marriageDate);
      }

      if (marriagePlace) {
        spouse.marriagePlace.placeString = marriagePlace;
      }
    }

    // sometimes there is a burial place or cemetery and no death place.
    if (result.deathDate && !result.deathPlace && !result.eventPlace) {
      let cemeteryName = getCleanValueForRecordDataList(ed, ["Cemetery"]);
      let burialCountry = getCleanValueForRecordDataList(ed, ["Burial Country"]);
      if (cemeteryName && burialCountry) {
        result.burialPlace = cemeteryName + ", " + burialCountry;
      }
    }
  } else if (result.recordType == RT.SchoolRecords) {
    result.setEventDate(getCleanValueForRecordDataList(ed, ["Yearbook Date", "Admission Date"], "date"));

    result.setBirthDate(getCleanValueForRecordDataList(ed, ["Birth Date"], "date"));
    result.setBirthYear(getCleanValueForRecordDataList(ed, ["Birth Year"]));

    let schoolLocation = getCleanValueForRecordDataList(ed, ["School Location"]);
    let schoolName = getCleanValueForRecordDataList(ed, ["School"]);

    result.setEventPlace(schoolLocation);

    if (schoolName) {
      result.schoolName = schoolName;
    }

    let age = getCleanValueForRecordDataList(ed, ["Age", "Estimated Age"]);
    if (age) {
      result.ageAtEvent = age;
    }

    let fatherName = getCleanRecordDataValue(ed, "Father");
    if (fatherName) {
      let father = result.addFather();
      father.name.name = fatherName;
    }
    let motherName = getCleanRecordDataValue(ed, "Mother");
    if (motherName) {
      let mother = result.addMother();
      mother.name.name = motherName;
    }
  } else if (result.recordType == RT.PassengerList) {
    let departureDate = getCleanValueForRecordDataList(ed, ["Departure Date", "Departure Year"], "date");
    let arrivalDate = getCleanValueForRecordDataList(ed, ["Arrival Date", "Arrival Year", "Arrival year"], "date");
    let departurePlace = getCleanValueForRecordDataList(ed, ["Departure Place", "Departure Port"]);
    let arrivalPlace = getCleanValueForRecordDataList(ed, ["Arrival Place", "Arrival Port", "Arrival Country"]);

    result.setFieldIfValueExists("departureDate", departureDate);
    result.setFieldIfValueExists("departurePlace", departurePlace);
    result.setFieldIfValueExists("arrivalDate", arrivalDate);
    result.setFieldIfValueExists("arrivalPlace", arrivalPlace);

    if (ed.titleCollection.toLowerCase().includes("arriv")) {
      result.setEventDate(arrivalDate);
      result.setEventPlace(arrivalPlace);
    } else if (ed.titleCollection.toLowerCase().includes("depart")) {
      result.setEventDate(departureDate);
      result.setEventPlace(departurePlace);
    } else if (arrivalDate || arrivalPlace) {
      result.setEventDate(arrivalDate);
      result.setEventPlace(arrivalPlace);
    } else if (departureDate || departurePlace) {
      result.setEventDate(departureDate);
      result.setEventPlace(departurePlace);
    }

    result.setFieldIfValueExists("shipName", getCleanValueForRecordDataList(ed, ["Ship", "Vessel"]));

    result.setFieldIfValueExists(
      "ageAtEvent",
      getCleanValueForRecordDataList(ed, ["Age", "Departure Age", "Arrival Age"])
    );
  } else if (result.recordType == RT.Naturalization) {
    result.setEventDate(
      getCleanValueForRecordDataList(
        ed,
        ["Event Date", "Date", "Petition Date", "Declaration Date", "Certificate Date"],
        "date"
      )
    );
    result.setEventPlace(
      getCleanValueForRecordDataList(ed, [
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
    let ageAtEvent = getCleanValueForRecordDataList(ed, ["Age", "Petition Age", "Declaration Age"]);
    if (ageAtEvent) {
      result.ageAtEvent = ageAtEvent;
    }
    result.setBirthDate(getCleanValueForRecordDataList(ed, ["Birth Date"], "date"));
    result.setBirthPlace(getCleanValueForRecordDataList(ed, ["Birth Place"]));
    let arrivalDate = getCleanValueForRecordDataList(ed, ["Arrival Date"]);
    if (arrivalDate) {
      result.arrivalDate = arrivalDate;
    }
    let arrivalPlace = getCleanValueForRecordDataList(ed, ["Arrival Place"]);
    if (arrivalPlace) {
      result.arrivalPlace = arrivalPlace;
    }
    let nativePlace = getCleanValueForRecordDataList(ed, ["Native Place"]);
    if (nativePlace) {
      result.nativePlace = nativePlace;
    }
  } else if (result.recordType == RT.FreedomOfCity) {
    result.setEventDate(getCleanValueForRecordDataList(ed, ["Admission Date", "Event Date", "Date"], "date"));
    result.setEventPlace(getCleanValueForRecordDataList(ed, ["Residence Place"]));
    result.setBirthDate(getCleanValueForRecordDataList(ed, ["Birth Date"], "date"));
    result.setBirthPlace(getCleanValueForRecordDataList(ed, ["Birth Place"]));

    result.setFieldIfValueExists("admissionDate", getCleanValueForRecordDataList(ed, ["Admission Date"], "date"));

    let fatherName = getCleanRecordDataValue(ed, "Father");
    if (fatherName) {
      let father = result.addFather();
      father.name.name = fatherName;
    }
  } else {
    // generic record type support
    result.setEventDate(
      getCleanValueForRecordDataList(
        ed,
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
          "Examination Date",
        ],
        "date"
      )
    );
    result.setEventYear(
      getCleanValueForRecordDataList(ed, [
        "Event Year",
        "Year",
        "Publication Year",
        "Enlistment Year",
        "Residence Year",
        "Electoral Year",
      ])
    );
    let eventPlace = getCleanValueForRecordDataList(ed, [
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
      "Parliamentary Division",
      "Death County",
      "Cemetery",
    ]);

    if (!eventPlace) {
      if (true) {
        // trying this out instead (2 Apr 2022)
        buildEventPlace(ed, result, true);
      }
    }

    result.setEventPlace(eventPlace);

    // lots of record have a birth date. The narrative may not use it but search can.
    result.setBirthDate(getCleanValueForRecordDataList(ed, ["Birth Date"], "date"));
    result.setBirthPlace(getCleanValueForRecordDataList(ed, ["Birth Place"]));

    result.setDeathDate(getCleanValueForRecordDataList(ed, ["Death Date"], "date"));
    result.setDeathPlace(getCleanValueForRecordDataList(ed, ["Death Place"]));

    let ageAtEvent = getCleanValueForRecordDataList(ed, ["Age", "Departure Age", "Arrival Age", "Examination Age"]);
    if (ageAtEvent) {
      result.ageAtEvent = ageAtEvent;
    }
  }
}

// This function generalizes the data (ed) extracted from an Ancestry page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeRecordData(input, result) {
  let ed = input.extractedData;

  result.sourceType = "record";
  determineRecordTypeAndRole(ed, result);

  result.sourceOfData = "ancestry";

  // from an Ancestry record we often do not have the name broken down into parts.
  let fullName = ed.titleName;
  if (!fullName && ed.recordData) {
    fullName = getCleanRecordDataValue(ed, "Name");
  }

  result.setFullName(cleanName(fullName));

  if (!fullName && ed.recordData) {
    const firstName = getCleanRecordDataValue(ed, "First Name");
    const lastName = getCleanRecordDataValue(ed, "Last Name");
    result.setLastNameAndForenames(lastName, firstName);
  }

  if (ed.recordData != undefined) {
    result.setPersonGender(getCleanRecordDataValue(ed, "Gender"));

    result.setEventCountry(getCleanRecordDataValue(ed, "Country"));
    result.setEventCounty(getCleanValueForRecordDataList(ed, ["County", "Inferred County"]));

    let registrationDate = getCleanValueForRecordDataList(ed, ["Registration Date", "Date of Registration"], "date");
    if (registrationDate) {
      // special case, date could be of form "1933 Jan-Feb-Mar"
      // e.g. https://www.ancestry.com/discoveryui-content/view/6407416:2534
      if (/^\d\d\d\d +\w\w\w\-\w\w\w\-\w\w\w$/.test(registrationDate)) {
        let yearString = registrationDate.replace(/^(\d\d\d\d) +\w\w\w\-\w\w\w\-\w\w\w$/, "$1");
        let ancestryQuarter = registrationDate.replace(/^\d\d\d\d +(\w\w\w\-\w\w\w\-\w\w\w)$/, "$1");
        if (yearString && yearString != registrationDate && ancestryQuarter && ancestryQuarter != registrationDate) {
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
      let registrationYear = getCleanRecordDataValue(ed, "Registration Year");
      if (registrationYear) {
        result.setEventYear(registrationYear);
      }
    }

    let registrationDistrict = getCleanValueForRecordDataList(ed, ["Registration District", "Registration district"]);
    if (registrationDistrict) {
      result.registrationDistrict = registrationDistrict;
    }

    let ancestryQuarter = getCleanValueForRecordDataList(ed, ["Registration Quarter", "Quarter of the Year"]);
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
        let ancestryQuarter = registrationDate.replace(/^(\w\w\w) \d\d\d\d$/, "$1");

        if (yearString && yearString != registrationDate && ancestryQuarter && ancestryQuarter != registrationDate) {
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

    generalizeDataGivenRecordType(ed, result);
  }

  // Template search data
  addWtSearchTemplates(ed, result);

  // Collection
  if (ed.dbId) {
    // sometime the dbId is the text version and not the number.
    // e.g. 1911England instead of 2352
    let collectionId = ed.dbId;
    let altIdCollection = RC.findCollectionByAltId("ancestry", ed.dbId);
    if (altIdCollection) {
      collectionId = altIdCollection.sites["ancestry"].id;
    }
    result.collectionData = {
      id: collectionId,
    };

    if (ed.recordData) {
      function addRef(key, value) {
        if (key && value) {
          result.collectionData[key] = value;
        }
      }
      // could be an image page
      addRef("volume", getCleanValueForRecordDataList(ed, ["Volume", "Volume Number", "Volume number"]));
      addRef("page", getCleanValueForRecordDataList(ed, ["Page", "Page number", "Page Number"]));
      addRef("folio", getCleanRecordDataValue(ed, "Folio"));
      addRef("piece", getCleanRecordDataValue(ed, "Piece"));
      addRef("schedule", getCleanValueForRecordDataList(ed, ["Schedule Number", "Household Schedule Number"]));
      addRef("parish", getCleanValueForRecordDataList(ed, ["Civil Parish", "Parish"]));
      addRef("county", getCleanValueForRecordDataList(ed, ["County/Island", "County"]));
      addRef("borough", getCleanValueForRecordDataList(ed, ["Borough"]));

      addRef("enumerationDistrict", getCleanRecordDataValue(ed, "Enumeration District"));
      addRef("district", getCleanValueForRecordDataList(ed, ["District", "County/District"]));
      addRef("districtNumber", getCleanRecordDataValue(ed, "District Number"));
      addRef("subDistrict", getCleanRecordDataValue(ed, "Sub-District"));
      addRef("subDistrictNumber", getCleanRecordDataValue(ed, "Sub-District Number"));
      addRef("divisionNumber", getCleanRecordDataValue(ed, "Division Number"));
      addRef("familyNumber", getCleanRecordDataValue(ed, "Family Number"));
      addRef("referenceNumber", getCleanRecordDataValue(ed, "Reference Number"));
      addRef("registrationNumber", getCleanRecordDataValue(ed, "Registration Number"));
    }
  }
}

function generalizeProfileData(input, result) {
  let ed = input.extractedData;

  result.sourceType = "profile";
  result.sourceOfData = "ancestry";

  result.setFullName(cleanName(ed.titleName));

  result.setBirthDate(ed.birthDate);
  result.setBirthPlace(ed.birthPlace);
  result.setDeathDate(ed.deathDate);
  result.setDeathPlace(ed.deathPlace);

  result.setPersonGender(ed.gender);

  if (ed.marriages) {
    for (let marriage of ed.marriages) {
      let spouse = result.addSpouse();
      if (marriage.spouseName) {
        spouse.name.setFullName(cleanName(marriage.spouseName));
      }
      if (marriage.date) {
        spouse.marriageDate.setDateAndQualifierFromString(marriage.date);
      }
      if (marriage.place) {
        spouse.marriagePlace.placeString = marriage.place;
      }
    }
  }

  if (ed.fatherName) {
    let father = result.addFather();
    father.name.setFullName(cleanName(ed.fatherName));
  }
  if (ed.motherName) {
    let mother = result.addMother();
    mother.name.setFullName(cleanName(ed.motherName));
  }

  // analyze the surname - sometimes Ancestry users put the LNAB in parens
  let surname = ed.surname;
  if (surname) {
    const openParenIndex = surname.indexOf("(");
    if (result.name && openParenIndex == 0) {
      const closeParenIndex = surname.indexOf(")", openParenIndex);
      if (closeParenIndex != -1) {
        let lnab = surname.substring(openParenIndex + 1, closeParenIndex).trim();
        let remainder = surname.substring(closeParenIndex + 1).trim();
        if (lnab && remainder) {
          result.lastNameAtBirth = lnab;
          surname = lnab;
          const spaceIndex = remainder.indexOf(" ");
          if (spaceIndex == -1) {
            result.lastNameAtDeath = remainder;
          } else {
            // there are multiple names after close paren
            // These could be last name at death folloed by other married names
            // Could check names of spouses to get more info
            const cln = remainder.substring(0, spaceIndex);
            if (cln) {
              result.lastNameAtDeath = remainder;
            }
          }
        }
      }
    }
  }
  result.setLastNameAndForenames(cleanName(surname), cleanName(ed.givenName));
}

// This function generalizes the data (ed) extracted from an Ancestry page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeData(input) {
  let ed = input.extractedData;

  let result = new GeneralizedData();

  if (ed.pageType == "personFacts") {
    generalizeProfileData(input, result);
  } else {
    generalizeRecordData(input, result);

    if (ed.personExtractedData) {
      let personInput = input;
      personInput.extractedData = ed.personExtractedData;
      let personGd = new GeneralizedData();
      generalizeProfileData(personInput, personGd);
      personGd.hasValidData = true;
      result.personGeneralizedData = personGd;
    }
  }

  result.hasValidData = true;

  //console.log("End of Ancestry generalizeData, result is:");
  //console.log(result);

  return result;
}

function setExtraGdHouseholdFields(extractedData, generalizedMember, fieldNames) {
  function setMemberData(propertyName, recordDataNames, standardizeFunction) {
    if (!generalizedMember[propertyName]) {
      let value = getCleanValueForRecordDataList(extractedData, recordDataNames);
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

  // Workaround for bug where Ancestry record shows age instead of name in the link
  // This bug occurred on 8-May-2023 on several censuses
  if (/^\d.*/.test(generalizedMember.name)) {
    generalizedMember.name = "";
    if (fieldNames.includes("name")) {
      let index = fieldNames.indexOf("name");
      if (index != -1) {
        fieldNames.splice(index, 1);
      }
    }
    setMemberData("name", ["Name"]);
  }

  setMemberData("age", ["Age"]);
  setMemberData("race", ["Race"]);
  setMemberData(
    "relationship",
    ["Relationship to Head", "Relation to Head", "Relation to Head of House", "Relationship", "Relation"],
    GD.standardizeRelationshipToHead
  );
  setMemberData("maritalStatus", ["Marital Status", "Marital status"], GD.standardizeMaritalStatus);
  setMemberData("gender", ["Gender"], GD.standardizeGender);
  setMemberData("occupation", ["Occupation"]);
  setMemberData("birthDate", ["Birth Date", "DOB"]);
  setMemberData("birthPlace", ["Where born", "Where Born", "Birth Place", "Birthplace", "Birth place"]);
  setMemberData("birthYear", ["Estimated Birth Year", "Birth Year"]);
  setMemberData("employer", ["Employer"]);
}

function regeneralizeDataWithLinkedRecords(input) {
  let ed = input.extractedData;
  let result = input.generalizedData;
  let linkedRecords = input.linkedRecords;

  //console.log("regeneralizeDataWithLinkedRecords, ed is:");
  //console.log(ed);
  //console.log("regeneralizeDataWithLinkedRecords, result is:");
  //console.log(result);
  //console.log("regeneralizeDataWithLinkedRecords, linkedRecords is:");
  //console.log(linkedRecords);

  if (ed.household && result.householdArray) {
    for (let extractedMember of ed.household.members) {
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
            memberData = ed;
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
            setExtraGdHouseholdFields(memberData, generalizedMember, result.householdArrayFields);
          }
        }
      }
    }
  } else if (ed.linkData && result.role) {
    // if there are linkData and this person is not the primary person on the record
    // we should be able to get more detail from the linkData of the primary person

    // Note the code below may be redundant because the code that adds the linked records
    // only adds the one that is needed so we are duplicating things here
    let primaryLink = undefined;
    if (result.role == "Parent") {
      let link = ed.linkData["Child"];
      if (link) {
        primaryLink = link;
      }
    } else if (result.role == "Child") {
      let link = ed.linkData["Parent"];
      if (link) {
        primaryLink = link;
      } else {
        let link = ed.linkData["Father"];
        if (link) {
          primaryLink = link;
        } else {
          let link = ed.linkData["Mother"];
          if (link) {
            primaryLink = link;
          }
        }
      }
    } else if (result.role == "Sibling") {
      let link = ed.linkData["Siblings"];
      if (link) {
        primaryLink = link;
      }
    } else if (result.role == "Spouse") {
      let link = ed.linkData["Spouse"];
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

      if (primaryLinkedRecord && primaryLinkedRecord.extractedData) {
        //console.log("regeneralizeDataWithLinkedRecords, primaryLinkedRecord.extractedData is:");
        //console.log(primaryLinkedRecord.extractedData);

        // Now we can look for extra data
        let gdInput = {};
        gdInput.extractedData = primaryLinkedRecord.extractedData;
        let generalizedData = generalizeData(gdInput);

        //console.log("regeneralizeDataWithLinkedRecords, primaryLinkedRecord generalizedData is:");
        //console.log(generalizedData);

        // even if we have an event date and place the one from the linked record should be better.
        // For example the parent in a child birth record can have a birth place which has been
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
        if (generalizedData.recordType && generalizedData.recordType != RT.Unclassified) {
          result.recordType = generalizedData.recordType;

          if (result.overrideRefTitle) {
            // this means that we asked the user to specify the recordType because it was unclassified
            // But now we have a recordType from the linkedRecord.
            // So we didn't need to ask. If we leave the overrideRefTitle we can end up with
            // contradictory data in the citation if they picked the wrong type.
            delete result.overrideRefTitle;
          }
        }

        let currentPrimaryPersonGender = result.inferPrimaryPersonGender();
        if (generalizedData.personGender && !currentPrimaryPersonGender) {
          result.setPrimaryPersonGender(generalizedData.personGender);
        }

        // For a child marriage we want to get the spouse,
        // This is a bit confusing - we store this in result.spouses even though it is
        // the spouse of the child not this person
        if (generalizedData.spouses) {
          result.spouses = generalizedData.spouses;

          if (generalizedData.ageAtEvent) {
            result.setPrimaryPersonAge(generalizedData.ageAtEvent);
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
              if (generalizedData.parents.father && generalizedData.parents.father.name) {
                fatherName = generalizedData.parents.father.name.name;
              }
              if (generalizedData.parents.mother && generalizedData.parents.mother.name) {
                motherName = generalizedData.parents.mother.name.name;
              }
              if (result.name.name == fatherName && generalizedData.parents.mother) {
                otherParent = generalizedData.parents.mother;
              } else if (result.name.name == motherName && generalizedData.parents.father) {
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
  } else if (ed.household) {
    // could be a non-census household. For example a will with other people listed
    if (ed.household.members && ed.household.members.length > 0) {
      let primaryMember = ed.household.members[0];
      if (linkedRecords.length == 1 && linkedRecords[0].link == primaryMember.link) {
        let primaryLinkedRecord = linkedRecords[0];
        let gdInput = {};
        gdInput.extractedData = primaryLinkedRecord.extractedData;
        let generalizedData = generalizeData(gdInput);
        if (generalizedData.eventPlace) {
          result.eventPlace = generalizedData.eventPlace;
        }
        if (generalizedData.eventDate) {
          result.eventDate = generalizedData.eventDate;
        }

        let primaryPersonName = generalizedData.inferFullName();
        result.setPrimaryPersonFullName(primaryPersonName);

        result.setPrimaryPersonGender(generalizedData.personGender);
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
