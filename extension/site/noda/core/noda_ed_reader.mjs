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
import { NameObj, DateObj, PlaceObj, dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";

var eventTypes = [
  {
    recordType: RT.BirthOrBaptism,
    breadcrumbText: {
      en: "Births and baptisms",
      bo: "Fødte og døpte",
      nn: "Fødde og døypte",
    },
  },
  {
    recordType: RT.Burial,
    breadcrumbText: {
      en: "Burials",
      bo: "Begravde",
      nn: "Gravlagde",
    },
  },
  {
    recordType: RT.Census,
    breadcrumbText: {
      en: "Census districts summary",
      bo: "Tellingskretsoversikt",
      nn: "Teljingskretsoversikt",
    },
  },
  {
    recordType: RT.Confirmation,
    breadcrumbText: {
      en: "Confirmations",
      bo: "Konfirmerte",
      nn: "Konfirmerte",
    },
  },
  {
    recordType: RT.Emigration,
    breadcrumbText: {
      en: "Emigration",
      bo: "Emigrasjon",
      nn: "Emigrasjon",
    },
  },
  {
    recordType: RT.Marriage,
    breadcrumbText: {
      en: "Marriages",
      bo: "Viede",
      nn: "Viede",
    },
  },
  {
    recordType: RT.Probate,
    breadcrumbText: {
      en: "Probate",
      bo: "Skifteforretning",
      nn: "Skifteforretning",
    },
  },
];

const fieldLabels = {
  age: {
    en: ["Age"],
    bo: ["Alder"],
    nn: ["Alder"],
  },
  ageBorn: {
    en: ["Age/born"],
    bo: ["Alder/født"],
    nn: ["Alder/fødd"],
  },
  baptismDate: {
    en: ["Baptism date"],
    bo: ["Dåpsdato"],
    nn: ["Dåpsdato"],
  },
  baptismPlace: {
    en: ["Baptism place"],
    bo: ["Dåpssted"],
    nn: ["Dåpsstad"],
  },
  birthDate: {
    en: ["Date of birth", "Birth date"],
    bo: ["Fødselsdato"],
    nn: ["Fødselsdato"],
  },
  birthYear: {
    en: ["Birth year", "Year of birth"],
    bo: ["Fødselsår"],
    nn: ["Fødselsår"],
  },
  birthPlace: {
    en: ["Birth place", "Place of birth"],
    bo: ["Fødested"],
    nn: ["Fødestad"],
  },
  burialDate: {
    en: ["Burial date"],
    bo: ["Begravelsesdato"],
    nn: ["Gravferdsdato"],
  },
  confirmationDate: {
    en: ["Confirmation date"],
    bo: ["Konfirmasjonsdato"],
    nn: ["Konfirmasjonsdato"],
  },
  county: {
    en: ["County"],
    bo: ["Fylke"],
    nn: ["Fylke"],
  },
  deathDate: {
    en: ["Date of death", "Death date"],
    bo: ["Dødsdato"],
    nn: ["Dødsdato"],
  },
  deathYear: {
    en: ["Death year", "Year of death"],
    bo: ["Dødsår"],
    nn: ["Dødsår"],
  },
  emigrationDate: {
    en: ["Date of emigration"],
    bo: ["Utreisedato"],
    nn: ["Utreisedato"],
  },
  familyPosition: {
    en: ["Family position"],
    bo: ["Familiestilling"],
    nn: ["Familiestilling"],
  },
  farmNumber: {
    en: ["Gårdens nr."],
    bo: ["Gårdens nr."],
    nn: ["Gardens nr."],
  },
  floor: {
    en: ["Floor"],
    bo: ["Etasje"],
    nn: ["Etasje"],
  },
  gender: {
    en: ["Gender"],
    bo: ["Kjønn"],
    nn: ["Kjønn"],
  },
  givenName: {
    en: ["Given name"],
    bo: ["Fornavn"],
    nn: ["Førenamn"],
  },
  lastName: {
    en: ["Last name"],
    bo: ["Etternavn"],
    nn: ["Etternamn"],
  },
  location: {
    en: ["Location"],
    bo: ["Plassering"],
    nn: ["Plassering"],
  },
  maritalStatus: {
    en: ["Marital status"],
    bo: ["Sivilstand"],
    nn: ["Sivilstand"],
  },
  marriageDate: {
    en: ["Marriage date"],
    bo: ["Vielsesdato"],
    nn: ["Vigselsdato"],
  },
  marriagePlace: {
    en: ["Marriage place"],
    bo: ["Vielsessted"],
    nn: ["Vigselsstad"],
  },
  name: {
    en: ["Name"],
    bo: ["Navn"],
    nn: ["Namn"],
  },
  occupation: {
    en: ["Occupation"],
    bo: ["Yrke"],
    nn: ["Yrke"],
  },
  page: {
    en: ["Page"],
    bo: ["Side"],
    nn: ["Side"],
  },
  parish: {
    en: ["Parish"],
    bo: ["Prestegjeld"],
    nn: ["Prestegjeld"],
  },
  parishChurch: {
    en: ["Parish/Church"],
    bo: ["Sogn/kirke"],
    nn: ["Sokn/kyrkje"],
  },
  personNumber: {
    en: ["Person no."],
    bo: ["Personnr"],
    nn: ["Personnr"],
  },
  probateDate: {
    en: ["Date of probate"],
    bo: ["Skifteregistreringdato"],
    nn: ["Skifteregistreringdato"],
  },
  residentialStatus: {
    en: ["Residential status"],
    bo: ["Bostatus"],
    nn: ["Bustatus"],
  },
  residence: {
    en: ["Residence"],
    bo: ["Bosted"],
    nn: ["Bustad"],
  },
  role: {
    en: ["Role", "Roll"],
    bo: ["Rolle"],
    nn: ["Rolle"],
  },
  serialNumber: {
    en: ["Serial no."],
    bo: ["Løpenr"],
    nn: ["Løpenr"],
  },
  smallerJudicialArea: {
    en: ["Skipreide (smaller judicial area)"],
    bo: ["Skipreide"],
    nn: ["Skipreide"],
  },
  year: {
    en: ["Year"],
    bo: ["År"],
    nn: ["År"],
  },
};

const panelTitles = {
  "Births and baptisms": {
    en: "Births and baptisms",
    bo: "Fødte og døpte",
    nn: "Fødde og døypte",
  },
  Burials: {
    en: "Burials",
    bo: "Begravde",
    nn: "Gravlagde",
  },
  Confirmations: {
    en: "Confirmations",
    bo: "Konfirmerte",
    nn: "Konfirmerte",
  },
  Emigration: {
    en: "Emigration",
    bo: "Emigrasjon",
    nn: "Emigrasjon",
  },
  Marriages: {
    en: "Marriages",
    bo: "Viede",
    nn: "Vigde",
  },
  Probate: {
    en: "Probate",
    bo: "Skifteforretning",
    nn: "Skifteforretning",
  },
};

const collectionPartHeadings = {
  Apartment: {
    en: "Apartment",
    bo: "Husvære",
    nn: "Husvære",
  },
  "Census district": {
    en: "Census district",
    bo: "Teljingskrets",
    nn: "Teljingskrets",
  },
  "Rural residence": {
    en: "Rural residence",
    bo: "Bosted land",
    nn: "Bustad land",
  },
  "Urban residence": {
    en: "Urban residence",
    bo: "Bosted by",
    nn: "Bustad by",
  },
};

const genderValues = {
  m: "male", // mann = man
  k: "female", // kvinne = woman
};

const maritalStatusValues = {
  g: "married", // gift = married
  ug: "single", // ugift = single
  e: "widow", // enke/enkemann = widow/widower
  s: "separated", // separert = separated
  f: "divorced", // fraskilt = divorced
};

// converts the relationship to head
// See: https://homepages.rootsweb.com/~norway/census_abbreviations.html
const familyPositionValues = {
  hf: "head", // house father or husband
  hm: "wife", // house mother or wife
  hp: "head", // (selv) hovedperson = head of household
  hovedperson: "head", // (selv) hovedperson = head of household
  "familiens overhode": "head", // The head of the family
  selv: "head", // (selv) hovedperson = head of household
  hu: "wife", // hustru = wife
  hustru: "wife", // hustru = wife
  kone: "wife",
  s: "son",
  søn: "son",
  d: "daughter",
  datter: "daughter",
  børn: "child",
  tj: "servant", // tjenestetyende
  tjener: "servant",
  tjenestepige: "maid",
  "moder til husfaderen": "mother",
  logerende: "lodger",
  fl: "lodger", // losjerende, hørende til familien = lodger, related to the family
  el: "lodger", // enslig losjerende = single lodger, not related to the family
  b: "visitor", // besøkende = visitor
  "hans kone": "hisWife",
};

const residentialStatusValues = {
  b: "resides permanently",
  mt: "resides temporarily",
  f: "temporarily absent",
};

class NodaEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    this.parseUrl();

    // determine record type and role
    let recordType = RT.Unclassified;
    if (ed.pageType == "record") {
      for (let eventType of eventTypes) {
        for (let crumb of this.ed.breadcrumbs) {
          if (crumb == eventType.breadcrumbText[this.urlLang]) {
            recordType = eventType.recordType;
            break;
          }
        }
        if (recordType != RT.Unclassified) {
          break;
        }
      }

      if (recordType == RT.BirthOrBaptism) {
        let baptismDate = this.getPanelDataValue("Births and baptisms", "baptismDate");
        if (baptismDate) {
          recordType = RT.Baptism;
        }
      }
    } else if (ed.pageType == "image") {
      if (ed.fileTitle) {
        // Examples:
        // "RA, Folketelling 1891 for 1029 Sør-Audnedal herred, 1891, s. 5602"
        //    Census 1891
        // "Voss sokneprestembete, SAB/A-79001/H/Hab: Klokkerbok nr. C 1, 1886-1899, s. 29"
        //    sokneprestembete = parish priest
        // "Ministerialprotokoller, klokkerbøker og fødselsregistre - Møre og Romsdal, SAT/A-1454/511/L0137: Ministerialbok nr. 511A04, 1787-1816, s. 41Ministerialprotokoller, klokkerbøker og fødselsregistre - Møre og Romsdal, SAT/A-1454/511/L0137: Ministerialbok nr. 511A04, 1787-1816, s. 41"
        //    Clock book and birth registers
        // "Nannestad prestekontor Kirkebøker, SAO/A-10414a/F/Fa/L0010: Ministerialbok nr. I 10, 1840-1850, s. 227"
        //    A burial in Nannestad parish. Nothing in title says burial - just church book.
        let lcTitle = ed.fileTitle.toLowerCase();
        if (lcTitle.includes("folketelling")) {
          recordType = RT.Census;
        }
      }
    }

    this.recordType = recordType;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  makeDateObjFromYearAndMmDd(yearString, mmDdString) {
    if (yearString && mmDdString) {
      const separator = "-";
      let parts = mmDdString.split(separator);
      if (parts.length != 2) {
        if (parts.length == 1) {
          let dateObj = new DateObj();
          dateObj.yearString = yearString;
          return dateObj;
        }
        return;
      }

      let day = parts[1];
      let month = parts[0];
      let year = yearString;

      if (day.length != 2 || month.length != 2 || year.length != 4) {
        return;
      }

      let dayNum = parseInt(day);
      let monthNum = parseInt(month);
      let yearNum = parseInt(year);

      if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
        return;
      }

      let dateString = DateUtils.getDateStringFromYearMonthDay(yearNum, monthNum, dayNum);

      if (dateString) {
        let dateObj = new DateObj();
        dateObj.dateString = dateString;
        return dateObj;
      }
    }
  }

  makeDateObjFromExtendedDate(dateString) {
    // An extended date string can look like this:
    // 1st Søndag efter Paaske 1825 [1825-04-10]
    if (/.* \[\d\d\d\d\-\d\d\-\d\d\]$/.test(dateString)) {
      let yyyymmddDateString = dateString.replace(/.* \[(\d\d\d\d\-\d\d\-\d\d)\]$/, "$1");
      return this.makeDateObjFromYyyymmddDate(yyyymmddDateString, "-");
    }
  }

  makeDateObjFromPanelDataYearAndMmDd(panelTitleKey, panelDataKey) {
    let mmDdString = this.getPanelDataValue(panelTitleKey, panelDataKey);
    let yearString = this.getPanelDataValue(panelTitleKey, "year");
    if (mmDdString && yearString) {
      return this.makeDateObjFromYearAndMmDd(yearString, mmDdString);
    }
  }

  makeDateObjFromPanelDataExtendedDate(panelTitleKey, panelDataKey) {
    let dateString = this.getPanelDataValue(panelTitleKey, panelDataKey);
    let yearString = this.getPanelDataValue(panelTitleKey, "year");
    if (dateString) {
      return this.makeDateObjFromExtendedDate(dateString);
    }
  }

  makeDateObjFromPanelDataYearRangeAndDateString(panelTitleKey, panelDataKey) {
    let dateString = this.getPanelDataValue(panelTitleKey, panelDataKey);
    let yearString = this.getPanelDataValue(panelTitleKey, "year");

    let mmDdString = "";
    if (dateString) {
      if (/^\d\d\d\d\-\d\d\-\d\d$/.test(dateString)) {
        return this.makeDateObjFromYyyymmddDate(dateString, "-");
      }
      if (/^\d\d\-\d\d$/.test(dateString)) {
        mmDdString = dateString;
      }
    }
    if (mmDdString && yearString) {
      return this.makeDateObjFromYearAndMmDd(yearString, mmDdString);
    }

    if (yearString) {
      if (/^\d\d\d\d$/.test(yearString)) {
        return this.makeDateObjFromYear(yearString);
      }
      if (/^\d\d\d\d\-\d\d\d\d$/.test(yearString)) {
        return this.makeDateObjFromYear(yearString);
      }
    }
  }

  getPartsFromCensusSourceInfo() {
    let parts = {
      year: "",
      parish: "",
    };

    if (!this.ed.sourceInformation) {
      return parts;
    }

    let lang = this.urlLang;
    if (!lang) {
      return parts;
    }

    const dateCensusForRegexes = {
      en: /^(\d+) census for (.*)$/,
      bo: /^(\d+) folketelling for (.*)$/,
      nn: /^(\d+) folketeljing for (.*)$/,
    };
    const censusDateForRegexes = {
      en: /^Census (\d+) for (.*)$/,
      bo: /^Folketelling (\d+) for (.*)$/,
      nn: /^Folketeljing (\d+) for (.*)$/,
    };
    const parishWords = {
      en: "parish",
      bo: "prestegjeld",
      nn: "prestegjeld",
    };

    let dateCensusForRegex = dateCensusForRegexes[lang];
    let censusDateForRegex = censusDateForRegexes[lang];
    let parishWord = parishWords[lang];

    let sourceInfo = this.ed.sourceInformation;
    let regex = undefined;
    if (dateCensusForRegex.test(sourceInfo)) {
      regex = dateCensusForRegex;
    } else if (censusDateForRegex.test(sourceInfo)) {
      regex = censusDateForRegex;
    }

    if (!regex) {
      return parts;
    }

    let yearString = sourceInfo.replace(regex, "$1");
    let parishString = sourceInfo.replace(regex, "$2");

    if (!yearString || !parishString || yearString == sourceInfo || parishString == sourceInfo) {
      return parts;
    }

    parts.year = yearString;

    if (parishString.endsWith(parishWord)) {
      parishString = parishString.substring(0, parishString.length - parishWord.length);
      parishString = parishString.trim();
    }

    function removeLeadingNumber(string) {
      if (string) {
        string = string.replace(/^\d[^\s]*/, "");
        string = string.trim();
      }
      return string;
    }

    parishString = removeLeadingNumber(parishString);

    parts.parish = parishString;

    return parts;
  }

  getParishNameFromSourceInformationForCensus() {
    let parts = this.getPartsFromCensusSourceInfo();

    return parts.parish;
  }

  getParishNameFromSourceInformationForChurchBook() {
    let sourceInfoParishName = "";

    const sourceInfoPrefixes = {
      en: "Church book from ",
      bo: "Ministerialbok for ",
      nn: "Ministerialbok for ",
    };

    const parishWords = {
      en: "parish",
      bo: "prestegjeld",
      nn: "prestegjeld",
    };

    let sourceInfoPrefix = sourceInfoPrefixes[this.urlLang];
    let parishWord = parishWords[this.urlLang];
    let sourceInformation = this.ed.sourceInformation;

    if (sourceInformation) {
      if (sourceInfoPrefix) {
        if (sourceInformation.startsWith(sourceInfoPrefix)) {
          sourceInformation = sourceInformation.substring(sourceInfoPrefix.length);
        }
      }
      let parts = sourceInformation.split(" ");
      if (parts.length) {
        for (let partIndex = 0; partIndex < parts.length; partIndex++) {
          while (parts[partIndex].endsWith(",")) {
            parts[partIndex] = parts[partIndex].substring(0, parts[partIndex].length - 1);
          }
        }
        if (parts.length == 1) {
          sourceInfoParishName = parts[0];
        } else {
          if (parts[1] == parishWord) {
            sourceInfoParishName = parts[0];
          } else if (parts[2] == parishWord) {
            sourceInfoParishName = parts[0] + " " + parts[1];
          } else if (parts[3] == parishWord) {
            sourceInfoParishName = parts[0] + " " + parts[1] + " " + parts[2];
          }
        }
      }
    }

    return sourceInfoParishName;
  }

  getParishNameFromSourceInformationForEmigration() {
    let sourceInfoParishName = "";

    const sourceInfoPrefixes = {
      en: "Emigrants from ",
      bo: "Emigranter over ",
      nn: "Emigranter over ",
    };

    const parishWords = {
      en: "parish",
      bo: "prestegjeld",
      nn: "prestegjeld",
    };

    let sourceInfoPrefix = sourceInfoPrefixes[this.urlLang];
    let sourceInformation = this.ed.sourceInformation;

    if (sourceInformation) {
      if (sourceInfoPrefix) {
        if (sourceInformation.startsWith(sourceInfoPrefix)) {
          sourceInformation = sourceInformation.substring(sourceInfoPrefix.length);
        }
      }
      let parts = sourceInformation.split(" ");
      if (parts.length) {
        for (let partIndex = 0; partIndex < parts.length; partIndex++) {
          if (/^\d+/.test(parts[partIndex])) {
            break;
          }
          if (sourceInfoParishName) {
            sourceInfoParishName += " ";
          }
          sourceInfoParishName += parts[partIndex];
        }
      }
    }

    return sourceInfoParishName;
  }

  getParishNameFromSourceInformation() {
    if (this.recordType == RT.Census) {
      return this.getParishNameFromSourceInformationForCensus();
    } else if (this.recordType == RT.Emigration) {
      return this.getParishNameFromSourceInformationForEmigration();
    } else {
      return this.getParishNameFromSourceInformationForChurchBook();
    }
  }

  makePlaceObjFromLocalPlaceNameAndSourceData(localPlaceName) {
    let sourceInfoParishName = this.getParishNameFromSourceInformation();

    let countyName = this.getSourceDataValue("county");

    let fullPlaceName = "";
    if (localPlaceName) {
      fullPlaceName = localPlaceName;
    }

    if (sourceInfoParishName && !fullPlaceName.includes(sourceInfoParishName)) {
      if (fullPlaceName) {
        fullPlaceName += ", ";
      }
      fullPlaceName += sourceInfoParishName;
    }

    if (countyName && !fullPlaceName.includes(countyName + ",")) {
      if (fullPlaceName) {
        fullPlaceName += ", ";
      }
      fullPlaceName += countyName;
    }

    if (fullPlaceName) {
      fullPlaceName += ", ";
    }
    fullPlaceName += "Norway";

    let placeObj = this.makePlaceObjFromFullPlaceName(fullPlaceName);
    if (placeObj) {
      if (sourceInfoParishName) {
        placeObj.parish = sourceInfoParishName;
      }
      if (countyName) {
        placeObj.county = countyName;
      }
      placeObj.country = "Norway";
    }

    return placeObj;
  }

  makePlaceObjFromRecordPanelAndSourceData(recordDataKey, panelTitleKey, panelDataKey) {
    let recordDataPlace = this.getRecordDataValue(recordDataKey);
    let panelPlace = this.getPanelDataValue(panelTitleKey, panelDataKey);
    if (!panelPlace) {
      panelPlace = this.getPanelDataValue(panelTitleKey, "parishChurch");
    }

    let place = panelPlace;
    if (recordDataPlace && !panelPlace) {
      place = recordDataPlace;
    }

    return this.makePlaceObjFromLocalPlaceNameAndSourceData(place);
  }

  makePlaceObjForCensus() {
    let collectionParts = this.ed.collectionParts;
    function removeLeadingNumber(string) {
      if (string) {
        string = string.replace(/^\d[^\s]*/, "");
        string = string.trim();
      }
      return string;
    }

    function getCollectionPart(edReader, collectionPartHeadingKey) {
      let collectionPartHeading = edReader.getCollectionPartHeading(collectionPartHeadingKey);
      if (collectionPartHeading) {
        for (let collectionPart of collectionParts) {
          if (collectionPart.collectionNameParts && collectionPart.collectionNameParts.length == 2) {
            if (collectionPart.collectionNameParts[0] == collectionPartHeading) {
              return collectionPart.collectionNameParts[1];
            }
          }
        }
      }
    }
    let apartment = getCollectionPart(this, "Apartment");
    let urbanResidence = removeLeadingNumber(getCollectionPart(this, "Urban residence"));
    let ruralResidence = removeLeadingNumber(getCollectionPart(this, "Rural residence"));

    let placeName = "";

    if (urbanResidence) {
      if (apartment) {
        placeName += apartment + " ";
      }
      placeName += urbanResidence;
    } else if (ruralResidence) {
      placeName += ruralResidence;
    }

    return this.makePlaceObjFromLocalPlaceNameAndSourceData(placeName);
  }

  parseUrl() {
    let url = this.ed.url;

    // examples:
    // "https://www.digitalarkivet.no/en/view/255/pd00000017246548",
    // "https://www.digitalarkivet.no/en/view/267/pg00000000517413",
    // "https://www.digitalarkivet.no/en/census/person/pf01052377002789",
    // "https://www.digitalarkivet.no/census/person/pf01052377002789",
    // "https://www.digitalarkivet.no/nn/census/person/pf01052377002789",
    // "https://www.digitalarkivet.no/en/view/8/pe00000000917949",
    // "https://media.digitalarkivet.no/view/1953/30",
    // "https://media.digitalarkivet.no/view/15957/43",

    const recordPrefix = "https://www.digitalarkivet.no/";
    const imagePrefix = "https://www.digitalarkivet.no/";
    if (url.startsWith(recordPrefix)) {
      this.urlType = "record";
      let remainder = url.substring(recordPrefix.length);
      if (remainder.startsWith("en/")) {
        this.urlLang = "en";
        remainder = remainder.substring(3);
      } else if (remainder.startsWith("nn/")) {
        this.urlLang = "nn";
        remainder = remainder.substring(3);
      } else {
        this.urlLang = "bo";
      }
    } else if (url.startsWith(imagePrefix)) {
      this.urlType = "image";
    }
  }

  getPanelTitle(panelTitleKey) {
    let lang = this.urlLang;
    if (!lang) {
      return "";
    }

    let panelTitleRecord = panelTitles[panelTitleKey];
    if (panelTitleRecord) {
      return panelTitleRecord[lang];
    }
    return "";
  }

  getCollectionPartHeading(collectionPartHeadingKeyKey) {
    let lang = this.urlLang;
    if (!lang) {
      return "";
    }

    let collectionPartHeadingRecord = collectionPartHeadings[collectionPartHeadingKeyKey];
    if (collectionPartHeadingRecord) {
      return collectionPartHeadingRecord[lang];
    }
    return "";
  }

  getFieldLabels(fieldLabelCode) {
    if (!fieldLabelCode) {
      return undefined;
    }
    let lang = this.urlLang;
    if (!lang) {
      return undefined;
    }

    let fieldLabelRecord = fieldLabels[fieldLabelCode];
    if (fieldLabelRecord) {
      return fieldLabelRecord[lang];
    }
    return undefined;
  }

  getValueObjUsingFieldLabels(data, fieldLabels) {
    if (!fieldLabels) {
      return undefined;
    }
    for (let fieldLabel of fieldLabels) {
      let value = data[fieldLabel];
      if (value) {
        return value;
      }
    }
  }

  getPanel(panelTitleKey) {
    let panelName = this.getPanelTitle(panelTitleKey);
    if (!panelName) {
      return undefined;
    }
    let panelGroups = this.ed.panelGroups;
    if (panelGroups) {
      for (let group of panelGroups) {
        if (group.panelTitle == panelName) {
          return group;
        }
      }
    }
    return undefined;
  }

  getPanelDataValueObj(panelTitleKey, fieldLabelKey) {
    let panel = this.getPanel(panelTitleKey);
    if (!panel) {
      return undefined;
    }
    let fieldLabels = this.getFieldLabels(fieldLabelKey);
    if (!fieldLabels) {
      return undefined;
    }
    let valueObj = this.getValueObjUsingFieldLabels(panel, fieldLabels);
    if (valueObj) {
      return valueObj;
    }
    return undefined;
  }

  getPanelDataValue(panelTitleKey, fieldLabelKey) {
    let valueObj = this.getPanelDataValueObj(panelTitleKey, fieldLabelKey);
    if (valueObj && valueObj.textString) {
      return valueObj.textString;
    }
    return "";
  }

  getRecordDataValueObj(fieldLabelKey) {
    let fieldLabels = this.getFieldLabels(fieldLabelKey);
    if (fieldLabels) {
      if (this.ed.recordData) {
        let valueObj = this.getValueObjUsingFieldLabels(this.ed.recordData, fieldLabels);
        if (valueObj) {
          return valueObj;
        }
      }
    }
    return undefined;
  }

  getRecordDataValue(fieldLabelKey) {
    let valueObj = this.getRecordDataValueObj(fieldLabelKey);
    if (valueObj && valueObj.textString) {
      return valueObj.textString;
    }
    return "";
  }

  getSourceDataValueObj(fieldLabelKey) {
    let fieldLabels = this.getFieldLabels(fieldLabelKey);
    if (fieldLabels) {
      if (this.ed.sourceData) {
        let valueObj = this.getValueObjUsingFieldLabels(this.ed.sourceData, fieldLabels);
        if (valueObj) {
          return valueObj;
        }
      }
    }
    return undefined;
  }

  getSourceDataValue(fieldLabelKey) {
    let valueObj = this.getSourceDataValueObj(fieldLabelKey);
    if (valueObj && valueObj.textString) {
      return valueObj.textString;
    }
    return "";
  }

  getPersonDataValueObj(person, fieldLabelKey) {
    let fieldLabels = this.getFieldLabels(fieldLabelKey);
    if (fieldLabels) {
      if (person) {
        let valueObj = this.getValueObjUsingFieldLabels(person, fieldLabels);
        if (valueObj) {
          return valueObj;
        }
      }
    }
    return undefined;
  }

  getPersonDataValue(person, fieldLabelKey) {
    let valueObj = this.getPersonDataValueObj(person, fieldLabelKey);
    if (valueObj && valueObj.textString) {
      return valueObj.textString;
    }
    return "";
  }

  getPeopleArrayByPanelTitle(panelTitleKey) {
    let panel = this.getPanel(panelTitleKey);
    if (!panel) {
      return undefined;
    }

    return panel.people;
  }

  getFirstPeopleArray() {
    let panelGroups = this.ed.panelGroups;
    if (panelGroups) {
      for (let group of panelGroups) {
        if (group.people) {
          return group.people;
        }
      }
    }
    return undefined;
  }

  getPrimaryPerson() {
    let people = this.getFirstPeopleArray();
    if (!people || people.length == 0) {
      return undefined;
    }

    if (people.length == 1) {
      return people[0];
    }

    let serialNumber = this.getRecordDataValue("serialNumber");

    if (serialNumber) {
      for (let person of people) {
        if (person.personNameParts && person.personNameParts.length == 1) {
          if (person.personNameParts[0] == serialNumber) {
            return person;
          }
        }
      }
    }

    let personNumber = this.getRecordDataValue("personNumber");

    if (personNumber) {
      for (let person of people) {
        if (person.personLabel && person.personLabel == personNumber) {
          return person;
        }
      }
    }

    return undefined;
  }

  getRelationshipToHeadForPerson(person) {
    if (person) {
      let familyPosition = this.getPersonDataValue(person, "familyPosition");
      if (familyPosition) {
        familyPosition = familyPosition.toLowerCase();
        let parts = familyPosition.split(",");
        if (parts && parts.length > 1 && parts[0]) {
          familyPosition = parts[0].trim();
        }
        // sometimes it has percent signs,
        let percentParts = familyPosition.split("%");
        for (let percentPart of percentParts) {
          let familyPositionString = percentPart.trim();
          if (familyPositionString) {
            familyPosition = familyPositionString;
            break;
          }
        }

        let relationToHead = familyPositionValues[familyPosition];
        if (relationToHead) {
          if (relationToHead == "hisWife") {
            // this means the wife of the previous person
            // for now just set it to "wife"
            relationToHead = "wife";
          }
          return relationToHead;
        } else {
          return familyPosition;
        }
      } else {
        // sometimes the head has a blank family position
        // e.g.: https://www.digitalarkivet.no/en/census/person/pf01038310006925
        if (person.personLabel == "001") {
          return "head";
        }
      }
    }

    return "";
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  hasValidData() {
    if (!this.ed.success) {
      return false; //the extract failed, GeneralizedData is not even normally called in this case
    }

    return true;
  }

  getSourceType() {
    if (this.ed.pageType == "record") {
      return "record";
    } else if (this.ed.pageType == "image") {
      return "image";
    }
  }

  getNameObj() {
    if (this.ed.pageType == "record") {
      let givenName = this.getRecordDataValue("givenName");
      let lastName = this.getRecordDataValue("lastName");
      if (givenName || lastName) {
        return this.makeNameObjFromForenamesAndLastName(givenName, lastName);
      }

      if (this.recordType == RT.Census) {
        if (this.ed.headingTextParts && this.ed.headingTextParts.length == 1) {
          let fullName = this.ed.headingTextParts[0];
          if (fullName) {
            return this.makeNameObjFromFullName(fullName);
          }
        }
      }
    }
    return undefined;
  }

  getGender() {
    let genderValue = this.getRecordDataValue("gender");

    if (genderValue) {
      let gender = genderValues[genderValue];
      if (gender) {
        return gender;
      }
    }

    return "";
  }

  getEventDateObj() {
    if (this.recordType == RT.Baptism) {
      return this.makeDateObjFromPanelDataYearAndMmDd("Births and baptisms", "baptismDate");
    } else if (this.recordType == RT.Burial) {
      return this.makeDateObjFromPanelDataYearAndMmDd("Burials", "burialDate");
    } else if (this.recordType == RT.Marriage) {
      return this.makeDateObjFromPanelDataYearAndMmDd("Marriages", "marriageDate");
    } else if (this.recordType == RT.Confirmation) {
      return this.makeDateObjFromPanelDataExtendedDate("Confirmations", "confirmationDate");
    } else if (this.recordType == RT.Probate) {
      return this.makeDateObjFromPanelDataYearRangeAndDateString("Probate", "probateDate");
    } else if (this.recordType == RT.Emigration) {
      let dateString = this.getRecordDataValue("emigrationDate");
      if (dateString) {
        return this.makeDateObjFromYyyymmddDate(dateString, "-");
      }
    } else if (this.recordType == RT.Census) {
      let parts = this.getPartsFromCensusSourceInfo();
      if (parts.year) {
        return this.makeDateObjFromYear(parts.year);
      }
    }

    return undefined;
  }

  getEventPlaceObj() {
    if (this.recordType == RT.Baptism) {
      return this.makePlaceObjFromRecordPanelAndSourceData("", "Births and baptisms", "baptismPlace");
    } else if (this.recordType == RT.Marriage) {
      return this.makePlaceObjFromRecordPanelAndSourceData("", "Marriages", "marriagePlace");
    } else if (this.recordType == RT.Burial) {
      return this.makePlaceObjFromRecordPanelAndSourceData("", "Burials", "marriagePlace");
    } else if (this.recordType == RT.Confirmation) {
      return this.makePlaceObjFromRecordPanelAndSourceData("", "Confirmations", "parishChurch");
    } else if (this.recordType == RT.Probate) {
      return this.makePlaceObjFromRecordPanelAndSourceData("smallerJudicialArea", "", "");
    } else if (this.recordType == RT.Emigration) {
      return this.makePlaceObjFromRecordPanelAndSourceData("", "Emigration", "parish");
    } else if (this.recordType == RT.Census) {
      return this.makePlaceObjForCensus();
    }

    return undefined;
  }

  getLastNameAtBirth() {
    return "";
  }

  getLastNameAtDeath() {
    return "";
  }

  getMothersMaidenName() {
    return "";
  }

  getBirthDateObj() {
    let dateString = this.getRecordDataValue("birthDate");
    let yearString = this.getRecordDataValue("birthYear");

    const calculatedSuffixes = {
      en: " (calculated)",
      bo: " (beregnet)",
      nn: " (berekna)",
    };

    const calcString = calculatedSuffixes[this.urlLang];
    let isDateCalculated = false;
    if (yearString && yearString.endsWith(calcString)) {
      yearString = yearString.substring(0, yearString.length - calcString.length);
      isDateCalculated = true;
    }

    let dateObj = undefined;

    if (dateString && yearString) {
      dateObj = this.makeDateObjFromYearAndMmDd(yearString, dateString);
    } else if (dateString) {
      let parts = dateString.split("-");
      if (parts.length == 1 && dateString.length == 4) {
        dateObj = this.makeDateObjFromYear(dateString);
      } else if (parts.length == 3) {
        dateObj = this.makeDateObjFromYyyymmddDate(dateString, "-");
      } else if (parts.length == 2 && dateString.length == 5) {
        // it looks like we have just the month and day for the birth year and no year
        if (this.recordType == RT.Baptism || this.recordType == RT.BirthOrBaptism) {
          let eventDateObj = this.getEventDateObj();
          if (eventDateObj) {
            yearString = eventDateObj.getYearString();
            if (yearString) {
              dateObj = this.makeDateObjFromYearAndMmDd(yearString, dateString);
            }
          }
        }
      }
    } else if (yearString) {
      dateObj = this.makeDateObjFromYear(yearString);
    }

    if (dateObj && isDateCalculated) {
      dateObj.qualifier = dateQualifiers.ABOUT;
    }

    return dateObj;
  }

  getBirthPlaceObj() {
    let placeString = this.getRecordDataValue("birthPlace");

    if (placeString) {
      return this.makePlaceObjFromFullPlaceName(placeString);
    }

    return undefined;
  }

  getDeathDateObj() {
    let dateString = this.getRecordDataValue("deathDate");
    let yearString = this.getRecordDataValue("deathYear");

    const calculatedSuffixes = {
      en: " (calculated)",
      bo: " (beregnet)",
      nn: " (berekna)",
    };

    const calcString = calculatedSuffixes[this.urlLang];
    let isDateCalculated = false;
    if (yearString && yearString.endsWith(calcString)) {
      yearString = yearString.substring(0, yearString.length - calcString.length);
      isDateCalculated = true;
    }

    let dateObj = undefined;

    if (dateString && yearString) {
      dateObj = this.makeDateObjFromYearAndMmDd(yearString, dateString);
    } else if (dateString) {
      let parts = dateString.split("-");
      if (parts.length == 1 && dateString.length == 4) {
        dateObj = this.makeDateObjFromYear(dateString);
      } else if (parts.length == 3) {
        dateObj = this.makeDateObjFromYyyymmddDate(dateString, "-");
      } else if (parts.length == 2 && dateString.length == 5) {
        // it looks like we have just the month and day for the birth year and no year
        if (this.recordType == RT.Burial) {
          let eventDateObj = this.getEventDateObj();
          if (eventDateObj) {
            yearString = eventDateObj.getYearString();
            if (yearString) {
              dateObj = this.makeDateObjFromYearAndMmDd(yearString, dateString);
            }
          }
        }
      }
    } else if (yearString) {
      dateObj = this.makeDateObjFromYear(yearString);
    }

    if (dateObj && isDateCalculated) {
      dateObj.qualifier = dateQualifiers.ABOUT;
    }

    return dateObj;
  }

  getDeathPlaceObj() {
    return undefined;
  }

  getAgeAtEvent() {
    let ageString = this.getRecordDataValue("age");

    if (ageString) {
      if (!/^\d+$/.test(ageString)) {
        // it is not just digits
        if (ageString.endsWith(" a")) {
          ageString = ageString.substring(0, ageString.length - 2);
        }
      }
      return ageString;
    }

    return "";
  }

  getAgeAtDeath() {
    return "";
  }

  getRegistrationDistrict() {
    return "";
  }

  getRelationshipToHead() {
    if (this.recordType == RT.Census) {
      let person = this.getPrimaryPerson();
      return this.getRelationshipToHeadForPerson(person);
    }

    return "";
  }

  getMaritalStatus() {
    let statusString = this.getRecordDataValue("maritalStatus");

    if (statusString) {
      let status = maritalStatusValues[statusString];
      if (status) {
        return status;
      }
    }

    return "";
  }

  getOccupation() {
    let occupationString = this.getRecordDataValue("occupation");

    if (occupationString) {
      return occupationString;
    }

    return "";
  }

  getSpouses() {
    let people = this.getFirstPeopleArray();
    if (!people) {
      return;
    }

    if (this.recordType == RT.Marriage) {
      const brideRole = "brur";
      const groomRole = "brudgom";
      let primaryRole = this.getRecordDataValue("role");
      if (!primaryRole) {
        let primaryPerson = this.getPrimaryPerson();
        if (primaryPerson) {
          primaryRole = this.getPersonDataValue(primaryPerson, "role");
        }
      }

      if (primaryRole == brideRole || primaryRole == groomRole) {
        for (let person of people) {
          let role = this.getPersonDataValue(person, "role");
          if ((role == brideRole || role == groomRole) && role != primaryRole) {
            let name = this.getPersonDataValue(person, "name");
            if (name) {
              let nameObj = this.makeNameObjFromFullName(name);
              if (nameObj) {
                let spouseObj = this.makeSpouseObj(nameObj);
                if (spouseObj) {
                  return [spouseObj];
                }
              }
            }
          }
        }
      }
    }
  }

  getParents() {
    let people = this.getFirstPeopleArray();
    if (!people) {
      return;
    }

    let fatherNameString = "";
    let motherNameString = "";

    if (this.recordType == RT.Marriage) {
      const brideRole = "brur";
      const groomRole = "brudgom";
      let primaryRole = this.getRecordDataValue("role");
      if (!primaryRole) {
        let primaryPerson = this.getPrimaryPerson();
        if (primaryPerson) {
          primaryRole = this.getPersonDataValue(primaryPerson, "role");
        }
      }

      if (primaryRole == brideRole || primaryRole == groomRole) {
        for (let person of people) {
          let role = this.getPersonDataValue(person, "role");
          if (
            (role == "brudgommens far" && primaryRole == groomRole) ||
            (role == "bruras far" && primaryRole == brideRole)
          ) {
            let name = this.getPersonDataValue(person, "name");
            if (name) {
              fatherNameString = name;
            }
          } else if (
            (role == "brudgommens mor" && primaryRole == groomRole) ||
            (role == "bruras mor" && primaryRole == brideRole)
          ) {
            let name = this.getPersonDataValue(person, "name");
            if (name) {
              motherNameString = name;
            }
          }
        }
      }
    } else {
      for (let person of people) {
        let role = this.getPersonDataValue(person, "role");
        if (role == "far") {
          let name = this.getPersonDataValue(person, "name");
          if (name) {
            fatherNameString = name;
          }
        } else if (role == "mor") {
          let name = this.getPersonDataValue(person, "name");
          if (name) {
            motherNameString = name;
          }
        }
      }
    }

    return this.makeParentsFromFullNames(fatherNameString, motherNameString);
  }

  getHousehold() {
    if (this.recordType != RT.Census) {
      return;
    }

    let people = this.getFirstPeopleArray();
    if (!people) {
      return;
    }

    const possibleHeadings = [
      "name",
      "age",
      "birthDate",
      "birthPlace",
      "residentialStatus",
      "familyPosition",
      "maritalStatus",
      "occupation",
    ];

    let headingsUsed = [];

    function setMemberField(member, heading, value) {
      if (member && heading && value) {
        member[heading] = value;

        if (!headingsUsed.includes(heading)) {
          headingsUsed.push(heading);
        }
      }
    }

    let householdArray = [];
    for (let person of people) {
      let householdMember = {};

      if (person.personNameParts && person.personNameParts.length == 1) {
        let name = person.personNameParts[0];
        if (name) {
          setMemberField(householdMember, "name", name.trim());
        }
      }

      if (!householdMember.name) {
        continue;
      }

      // for 1875 census the order of columns is:
      // Household number, person number, name, Usual residence, dif structure, gender, familyPosition,
      //   marital status, occupation, birthYear, birthPlace, nationality, religion, insave/deaf/blind
      // Some of those do not seem to be transcribed, so our order should be:
      //   familyPosition, marital status, occupation, age/born, birthPlace
      // See: https://www.familysearch.org/en/wiki/Norway_Census,_1875_-_FamilySearch_Historical_Records

      let relationToHead = this.getRelationshipToHeadForPerson(person);
      if (relationToHead) {
        setMemberField(householdMember, "relationship", relationToHead);
      }

      let maritalStatusString = this.getPersonDataValue(person, "maritalStatus");
      if (maritalStatusString) {
        let maritalStatus = maritalStatusValues[maritalStatusString];
        if (maritalStatus) {
          setMemberField(householdMember, "maritalStatus", maritalStatus);
        } else {
          setMemberField(householdMember, "maritalStatus", maritalStatusString);
        }
      }

      let occupation = this.getPersonDataValue(person, "occupation");
      setMemberField(householdMember, "occupation", occupation);

      let ageBorn = this.getPersonDataValue(person, "ageBorn");
      if (ageBorn.length == 4) {
        // birthYear
        setMemberField(householdMember, "birthDate", ageBorn);
      } else if (ageBorn.length <= 2) {
        setMemberField(householdMember, "age", ageBorn);
      }

      let birthPlace = this.getPersonDataValue(person, "birthPlace");
      setMemberField(householdMember, "birthPlace", birthPlace);

      let residentialStatusString = this.getPersonDataValue(person, "residentialStatus");
      if (residentialStatusString) {
        let residentialStatus = residentialStatusValues[residentialStatusString];
        if (residentialStatus) {
          setMemberField(householdMember, "residentialStatus", residentialStatus);
        } else {
          setMemberField(householdMember, "residentialStatus", residentialStatusString);
        }
      }

      let isSelected = person.current;
      if (isSelected) {
        householdMember.isSelected = isSelected;
      }
      householdArray.push(householdMember);
    }

    let result = {};
    result.members = householdArray;

    result.fields = headingsUsed;

    return result;
  }

  getCollectionData() {
    return undefined;
  }

  setCustomFields(gd) {
    if (this.recordType == RT.Probate) {
      let residence = this.getRecordDataValue("residence");
      if (residence) {
        let placeObj = this.makePlaceObjFromFullPlaceName(residence);
        if (placeObj) {
          gd.residencePlace = placeObj;
        }
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Functions to support build citation
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  addSourceReferenceToCitationBuilder(builder) {
    // This part is available on scanned image:
    // Norderhov kirkebøker, SAKO/A-237/F/Fa/L0010: Ministerialbok nr. 10, 1837-1847, s. 113
    // For the same record the info on the transcription is:
    // Church book from Norderhov parish 1837-1847 (0613Q)  << This is the Source Title
    // Births and baptisms: 1843-12-10, Parish/Church: -, Page: 113, Serial no.: 244
    let ed = this.ed;

    if (ed.pageType == "image") {
      if (ed.fileTitle) {
        builder.sourceReference = ed.fileTitle;
      }
    } else if (ed.pageType == "record") {
      if (ed.collectionParts) {
        for (let collectionPart of ed.collectionParts) {
          builder.addSourceReferenceText(collectionPart.collectionHeading);
        }
      }
      builder.addSourceReferenceField("Page", this.getSourceDataValue("page"));
      builder.addSourceReferenceField("Serial no.", this.getSourceDataValue("serialNumber"));
      builder.addSourceReferenceField("Farm no.", this.getSourceDataValue("farmNumber"));
      builder.addSourceReferenceField("Location", this.getSourceDataValue("location"));
      builder.addSourceReferenceField("Floor", this.getSourceDataValue("floor"));
    }
  }
}

export { NodaEdReader };
