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
  dateQualifiers,
  WtsName,
  WtsDate,
  WtsPlace,
} from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { WTS_String } from "../../../base/core/wts_string.mjs";

const typeData = {
  unknown: {
    recordType: RT.Unclassified,
  },
  banns: {
    recordType: RT.Marriage,
    placeType: "pcc",
  },
  baptisms: {
    recordType: RT.Baptism,
    placeType: "pcc",
    surnameIsLnab: true,
  },
  birth_certificate: {
    recordType: RT.Birth,
    placeType: "prd_cs_c",
    surnameIsLnab: true,
  },
  marriages: {
    recordType: RT.Marriage,
    placeType: "pcc",
  },
};

class OpccornEdd {
  constructor(ed) {
    this.ed = ed;
    this.urlRecordType = "unknown";

    // url is of the form:
    // "https://www.cornwall-opc-database.org/search-database/more-info/?t=baptisms&id=1797543",
    this.recordType = RT.Unclassified;
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
          }
        }
      }
    }
  }

  cleanLastName(nameString) {
    let cleanName = nameString;
    if (WTS_String.isWordAllUpperCase(cleanName)) {
      cleanName = WTS_String.toInitialCaps(cleanName);
    }
    return cleanName;
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

  getEventDateObj() {
    let dateObj = new WtsDate();
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
    }
    return dateObj;
  }

  getEventPlaceObj() {
    let placeObj = new WtsPlace();

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
    }

    if (placeString) {
      placeObj.placeString = placeString;
    }

    placeObj.county = county;
    placeObj.country = country;

    return placeObj;
  }

  getNameObj() {
    let nameObj = new WtsName();

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

    nameObj.setForenames(forename);
    nameObj.setLastName(surname);

    return nameObj;
  }

  getLastNameAtBirth() {
    if (this.typeData.surnameIsLnab) {
      let nameObj = this.getNameObj();
      if (nameObj.lastName) {
        return nameObj.lastNam;
      }
    }
    return "";
  }

  getMothersMaidenName() {
    let mmn = this.ed.recordData["Mother Maiden Surname"];
    mmn = this.cleanLastName(mmn);
    return mmn;
  }

  getSpouseObj(eventDateObj, eventPlaceObj) {
    let spouseObj = undefined;

    let forename = this.ed.recordData["Bride Fn"];
    let surname = this.ed.recordData["Bride Sn"];

    if (forename || surname) {
      spouseObj = {};
      let nameObj = new WtsName();
      surname = this.cleanLastName(surname);
      nameObj.setForenames(forename);
      nameObj.setLastName(surname);
      spouseObj.name = nameObj;
      if (eventDateObj) {
        spouseObj.marriageDate = eventDateObj;
      }
      if (eventPlaceObj) {
        spouseObj.marriagePlace = eventPlaceObj;
      }
    }
    return spouseObj;
  }
}

// This function generalizes the data (ed) extracted from the web page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeData(input) {
  function setField(key, value) {
    if (value) {
      result[key] = value;
    }
  }

  let ed = input.extractedData;

  let result = new GeneralizedData();
  result.sourceOfData = "opccorn";

  if (!ed.success) {
    return result; // the extract failed
  }

  result.sourceType = "record";

  let edd = new OpccornEdd(ed);
  result.recordType = edd.recordType;

  setField("name", edd.getNameObj());
  setField("eventDate", edd.getEventDateObj());
  setField("eventPlace", edd.getEventPlaceObj());
  setField("lastNameAtBirth", edd.getLastNameAtBirth());
  setField("mothersMaidenName", edd.getMothersMaidenName());

  if (result.recordType == RT.Birth) {
    result.birthDate = result.eventDate;
  } else if (result.recordType == RT.Marriage) {
    result.addSpouseObj(edd.getSpouseObj(result.eventDate, result.eventPlace));
  } else if (result.recordType == RT.Death) {
    result.lastNameAtDeath = ed.surname;
    result.deathDate = result.eventDate;

    if (ed.ageAtDeath) {
      result.ageAtDeath = ed.ageAtDeath;
    } else if (ed.birthDate) {
      result.setBirthDate(ed.birthDate);
    }
  }

  result.hasValidData = true;

  //console.log("opccorn; generalizeData: result is:");
  //console.log(result);

  return result;
}

export { generalizeData, GeneralizedData, dateQualifiers };
