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

import { GeneralizedData, dateQualifiers, WtsName, WtsDate } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";

const typeToRecordType = {
  banns: RT.Marriage,
  baptisms: RT.Baptism,
  birth_certificate: RT.Birth,
};

class OpccornEdd {
  constructor(ed) {
    this.ed = ed;

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
          let recordType = typeToRecordType[typeString];
          if (recordType) {
            this.recordType = recordType;
          }
        }
      }
    }
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
}

// This function generalizes the data (ed) extracted from the web page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeData(input) {
  let ed = input.extractedData;

  let result = new GeneralizedData();
  result.sourceOfData = "opccorn";

  if (!ed.success) {
    return result; // the extract failed
  }

  result.sourceType = "record";

  let edd = new OpccornEdd(ed);
  result.recordType = edd.recordType;

  let eventDateObj = edd.getEventDateObj();
  if (eventDateObj) {
    result.eventDate = eventDateObj;
  }

  // Names, there should always be a firstName and lastName. MiddleNames may be undefined.
  result.setLastNameAndForeNames(ed.surname, ed.givenNames);

  if (ed.eventType == "birth") {
    result.lastNameAtBirth = ed.surname;
    result.birthDate = result.eventDate;
    if (ed.mother) {
      result.mothersMaidenName = ed.mothersMaidenName;
    }
  } else if (ed.eventType == "marriage") {
    if (ed.spouse) {
      let name = new WtsName();
      name.name = ed.spouse;
      let spouse = {
        name: name,
        marriageDate: result.eventDate,
        marriagePlace: ed.district,
      };

      result.spouses = [spouse];
    }
  } else if (ed.eventType == "death") {
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
