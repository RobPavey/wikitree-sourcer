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

import { NameObj, DateObj, PlaceObj } from "../../../base/core/generalize_data_utils.mjs";
import { RT, RecordSubtype } from "../../../base/core/record_type.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { ExtractedDataReader } from "../../../base/core/extracted_data_reader.mjs";

// this is keyed off the type in the record URL
// e.g. in the URL : https://www.cornwall-opc-database.org/search-database/more-info/?t=banns&id=90065
// the t=banns means the type is banns
const typeData = {
  unknown: {
    recordType: RT.Unclassified,
  },
  banns: {
    recordType: RT.Marriage,
    recordSubtype: RecordSubtype.Banns,
    placeType: "pcc",
    searchUrl: "search-database/banns/",
  },
  baptisms: {
    recordType: RT.Baptism,
    placeType: "pcc",
    surnameIsLnab: true,
    searchUrl: "search-database/baptisms/",
  },
  birth_certificate: {
    recordType: RT.Birth,
    placeType: "prd_cs_c",
    surnameIsLnab: true,
    eventDateIsBirthDate: true,
    searchUrl: "search-database/birth-certificates/",
  },
  burials: {
    recordType: RT.Burial,
    placeType: "pcc",
    surnameIsCln: true,
    searchUrl: "search-database/burials/",
  },
  death_certificate: {
    recordType: RT.Death,
    placeType: "prd_cs_c",
    surnameIsCln: true,
    eventDateIsDeathDate: true,
    searchUrl: "search-database/deaths/",
  },
  marriages: {
    recordType: RT.Marriage,
    placeType: "pcc",
    searchUrl: "search-database/marriages/",
  },
  marriage_allegations: {
    recordType: RT.Marriage,
    placeType: "prd",
    searchUrl: "search-database/allegations/",
  },
  marriage_certificate: {
    recordType: RT.Marriage,
    placeType: "prd",
    searchUrl: "search-database/marriage-certificates/",
  },
  // extras
  // Bastardy
  bastardy: {
    recordType: RT.Bastardy,
    searchUrl: "extra-searches/bastardy/",
  },
  // Civil Courts
  civil_courts: {
    recordType: RT.LegalRecord,
    searchUrl: "extra-searches/civil-courts/",
  },
  // Criminal Courts
  criminal_courts: {
    recordType: RT.QuarterSession,
    searchUrl: "extra-searches/criminal-courts/",
  },
  // Emigrants
  emigrants: {
    recordType: RT.Emigration,
    searchUrl: "extra-searches/emigrants/",
  },
  // Hearth Tax
  hearth: {
    recordType: RT.Tax,
    searchUrl: "extra-searches/hearth-tax/",
  },
  // Institution Inmates
  institution_inmates: {
    recordType: RT.CriminalRegister,
    searchUrl: "extra-searches/institution-inmates/",
  },
  // Land Records
  land_tax: {
    recordType: RT.LandTax,
    searchUrl: "extra-searches/land-tax/",
  },
  // Memorial Inscriptions
  mis: {
    recordType: RT.Memorial,
    searchUrl: "extra-searches/memorial-inscriptions/",
  },
  // Miscellaneous Records Index
  miscellaneous_records_index: {
    recordType: RT.Unclassified,
    searchUrl: "extra-searches/miscellaneous-records-index/",
  },
  // Muster Rolls
  muster: {
    recordType: RT.Military,
    searchUrl: "extra-searches/muster-rolls/",
  },
  // Newspaper Reports
  newspaper_reports: {
    recordType: RT.Newspaper,
    searchUrl: "extra-searches/newspaper-reports/",
  },
  // Parish Apprentice Indentures
  parish_apprentice: {
    recordType: RT.Apprenticeship,
    searchUrl: "extra-searches/parish-apprentice-indentures/",
  },
  // Parish Settlements
  parish_settlement: {
    recordType: RT.LegalRecord,
    searchUrl: "extra-searches/parish-settlements/",
  },
  // Protestation Returns
  protestation: {
    recordType: RT.OtherChurchEvent,
    searchUrl: "extra-searches/protestation-returns/",
  },
  // School Admissions
  school_admissions: {
    recordType: RT.SchoolRecords,
    searchUrl: "extra-searches/school-admissions/",
  },
  // Voters Lists
  voters: {
    recordType: RT.ElectoralRegister,
    searchUrl: "extra-searches/voters-lists/",
  },
  // Wills Transcriptions
  wills_transcriptions: {
    recordType: RT.Will,
    searchUrl: "extra-searches/wills/",
    typeSpecificData: { dateIsWrittenDate: true },
  },
  // Wills Index
  wills_index: {
    recordType: RT.Will,
    searchUrl: "extra-searches/wills-index/",
  },
  // Malc McCarthy Index
  malc_mccarthy_index: {
    recordType: RT.Unclassified,
    searchUrl: "extra-searches/malc-mccarthy-index/",
  },
};

class OpccornEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
    this.urlRecordType = "unknown";
    this.typeData = typeData[this.urlRecordType];

    // url is of the form:
    // "https://www.cornwall-opc-database.org/search-database/more-info/?t=baptisms&id=1797543",
    let urlQueryIndex = ed.url.indexOf("?");
    if (urlQueryIndex != -1) {
      let urlQuery = ed.url.substring(urlQueryIndex + 1);
      let terms = urlQuery.split("&");
      if (terms.length == 2) {
        let typeTerm = terms[0];
        if (typeTerm.startsWith("t=")) {
          let typeString = typeTerm.substring(2);
          this.urlRecordType = typeString;
          let thisTypeData = typeData[this.urlRecordType];
          if (thisTypeData) {
            this.typeData = thisTypeData;
            let recordType = thisTypeData.recordType;
            if (recordType) {
              this.recordType = recordType;
            }
            let recordSubtype = thisTypeData.recordSubtype;
            if (recordSubtype) {
              this.recordSubtype = recordSubtype;
            }
          }
        }
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  cleanLastName(nameString) {
    let cleanName = nameString;

    if (StringUtils.isWordAllUpperCase(cleanName)) {
      cleanName = StringUtils.toInitialCaps(cleanName);
    }

    return cleanName;
  }

  cleanAge(string) {
    if (!string) {
      return "";
    }

    let cleanString = string;

    if (/^\d+$/.test(cleanString)) {
      return cleanString;
    }

    if (cleanString.endsWith("?")) {
      cleanString = cleanString.substring(0, cleanString.length - 1).trim();
    }

    return cleanString;
  }

  cleanParishCircuitOrChapel(string) {
    let cleanString = string;
    const stSuffix = ", St.";
    if (cleanString.endsWith(stSuffix)) {
      let stIndex = cleanString.indexOf(stSuffix);
      if (stIndex != -1) {
        cleanString = cleanString.substring(0, stIndex).trim();
        cleanString = "St. " + cleanString;
      }
    }
    return cleanString;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getNameObj() {
    let forename = "";
    let surname = "";

    if (this.recordType == RT.Marriage) {
      forename = this.ed.recordData["Groom Fn"];
      surname = this.ed.recordData["Groom Sn"];
    } else {
      forename = this.ed.recordData["Forename"];
      surname = this.ed.recordData["Surname"];
    }

    surname = this.cleanLastName(surname);

    let nameObj = this.makeNameObjFromForenamesAndLastName(forename, surname);

    return nameObj;
  }

  getGender() {
    let gender = "";

    switch (this.urlRecordType) {
      case "baptisms":
        {
          let sex = this.ed.recordData["Sex"];
          if (sex) {
            let lcSex = sex.toLowerCase();
            if (lcSex == "son") {
              gender = "male";
            } else if (lcSex == "dau") {
              gender == "female";
            }
          }
        }
        break;
    }
    return gender;
  }

  getEventDateObj() {
    let dateObj = new DateObj();
    let year = this.ed.recordData["Year"];
    if (year) {
      // Banns can have two years for the three dates
      const slashIndex = year.indexOf("/");
      if (slashIndex != -1) {
        year = year.substring(0, slashIndex);
      }

      dateObj.yearString = year;

      let dayMonth = this.ed.recordData["Day Month"];
      if (!dayMonth) {
        dayMonth = this.ed.recordData["Day Month 1"];
      }

      if (dayMonth) {
        let parts = dayMonth.split("-");
        if (parts.length == 2) {
          let day = parts[0];
          // remove leading 0
          if (day && day.length == 2 && day[0] == "0") {
            day = day.substring(1);
          }
          let month = parts[1];

          let dateString = day + " " + month + " " + year;
          dateObj.dateString = dateString;
        }
      }
    } else {
      let year = this.ed.recordData["Year Written"];
      if (year) {
        // Banns can have two years for the three dates
        const slashIndex = year.indexOf("/");
        if (slashIndex != -1) {
          year = year.substring(0, slashIndex);
        }

        dateObj.yearString = year;

        let dayMonth = this.ed.recordData["Date Written"];
        if (dayMonth) {
          let parts = dayMonth.split("-");
          if (parts.length == 2) {
            let day = parts[0];
            // remove leading 0
            if (day && day.length == 2 && day[0] == "0") {
              day = day.substring(1);
            }
            let month = parts[1];

            let dateString = day + " " + month + " " + year;
            dateObj.dateString = dateString;
          }
        }
      }
    }
    return dateObj;
  }

  getEventPlaceObj() {
    let placeObj = new PlaceObj();

    let county = "Cornwall";
    let country = "England";
    let placeString = "";

    let placeType = this.typeData.placeType;
    switch (placeType) {
      case "pcc":
        {
          // e.g.     "Parish Circuit Or Chapel": "Neot, St.",
          let pcc = this.ed.recordData["Parish Circuit Or Chapel"];
          if (pcc) {
            pcc = this.cleanParishCircuitOrChapel(pcc);
            placeString = pcc + ", " + county + ", " + country;
          }
        }
        break;
      case "prd_cs_c":
        {
          // e.g.
          // "Parish Or Reg District": "Falmouth Union",
          // "Sub District": "Falmouth",
          // "County": "Cornwall",
          let prd = this.ed.recordData["Parish Or Reg District"];
          let sd = this.ed.recordData["Sub District"];
          let c = this.ed.recordData["County"];

          if (c) {
            county = c;
          }

          if (prd && sd) {
            if (prd == sd) {
              placeString = prd + ", " + county + ", " + country;
            } else {
              placeString = prd + ", " + sd + ", " + county + ", " + country;
            }
          }
        }
        break;
      case "prd":
        {
          // e.g.
          // "Parish Or Reg District": "Falmouth Union",
          let prd = this.ed.recordData["Parish Or Reg District"];
          if (prd) {
            placeString = prd + ", " + county + ", " + country;
          }
        }
        break;
    }

    if (placeString) {
      placeObj.placeString = placeString;
    } else {
      placeObj.placeString = county + ", " + country;
    }

    placeObj.county = county;
    placeObj.country = country;

    return placeObj;
  }

  getLastNameAtBirth() {
    if (this.typeData.surnameIsLnab) {
      let nameObj = this.getNameObj();
      if (nameObj.lastName) {
        return nameObj.lastName;
      }
    }
    return "";
  }

  getLastNameAtDeath() {
    if (this.typeData.surnameIsCln) {
      let nameObj = this.getNameObj();
      if (nameObj.lastName) {
        return nameObj.lastName;
      }
    }
    return "";
  }

  getMothersMaidenName() {
    let mmn = this.ed.recordData["Mother Maiden Surname"];
    mmn = this.cleanLastName(mmn);
    return mmn;
  }

  getBirthDateObj() {
    if (this.typeData.eventDateIsBirthDate) {
      return this.getEventDateObj();
    }
  }

  getDeathDateObj() {
    if (this.typeData.eventDateIsDeathDate) {
      return this.getEventDateObj();
    }
  }

  getAgeAtEvent() {
    let age = "";

    if (this.recordType == RT.Marriage) {
      age = this.ed.recordData["Groom Age"];
    } else {
      age = this.ed.recordData["Age"];
    }

    age = this.cleanAge(age);

    return age;
  }

  getAgeAtDeath() {
    let age = "";

    if (this.recordType == RT.Death) {
      age = this.ed.recordData["Age"];
    }

    age = this.cleanAge(age);

    return age;
  }

  getSpouses() {
    let spouses = undefined;

    let forename = this.ed.recordData["Bride Fn"];
    let surname = this.ed.recordData["Bride Sn"];

    if (forename || surname) {
      let eventDateObj = this.getEventDateObj();
      let eventPlaceObj = this.getEventPlaceObj();

      let nameObj = this.makeNameObjFromForenamesAndLastName(forename, this.cleanLastName(surname));
      let spouseObj = this.makeSpouseObj(nameObj, eventDateObj, eventPlaceObj, this.ed.recordData["Bride Age"]);
      if (spouseObj) {
        spouses = [spouseObj];
      }
    }
    return spouses;
  }

  getParents() {
    let parents = undefined;

    if (this.urlRecordType == "marriages") {
      let fatherName = this.ed.recordData["Groom Father Name"];
      parents = this.makeParentsFromFatherFullName(fatherName);
    } else {
      let fatherForename = this.ed.recordData["Father Forename"];
      let fatherSurname = this.ed.recordData["Father Surname"];
      let motherForename = this.ed.recordData["Mother Forename"];
      let motherSurname = this.ed.recordData["Mother Surname"];
      parents = this.makeParentsFromForenamesAndLastNames(fatherForename, fatherSurname, motherForename, motherSurname);
    }
    return parents;
  }

  setCustomFields(gd) {
    if (this.typeData) {
      if (this.typeData.typeSpecificData) {
        gd.typeSpecificData = this.typeData.typeSpecificData;
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Reader functions specific to this site
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getSearchDatabaseUrl() {
    const typeData = this.typeData;

    let url = "https://www.cornwall-opc-database.org/";

    if (typeData && typeData.searchUrl) {
      url += typeData.searchUrl;
    }

    return url;
  }
}

export { OpccornEdReader };
