/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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

class CompdesEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
  }

  getNameObj() {
    return this.makeNameObjFromForenamesAndLastName(this.ed.Vorname, this.ed.Nachname);
  }

  getEventDateObj() {
    let dateString = this.ed.Datum;

    if (dateString) {
      let dateObj = this.makeDateObjFromDateString(dateString);
      if (dateObj) {
        return dateObj;
      }
    }

    return undefined;
  }

  getBirthPlaceObj() {
    let placeString = this.ed.Geburtsort;

    if (placeString || this.recordType == RT.Birth || this.recordType == RT.BirthRegistration) {
      let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
      if (placeObj) {
        return placeObj;
      }
    }
    return undefined;
  }

  getBirthDateObj() {
    let dateString = this.ed.Geburtsdatum;

    if (dateString) {
      let dateObj = this.makeDateObjFromDateString(dateString);
      if (dateObj) {
        return dateObj;
      }
    }

    return undefined;
  }

  getDeathPlaceObj() {
    let placeString = this.ed.Sterbeort;

    if (placeString || this.recordType == RT.Death || this.recordType == RT.DeathRegistration) {
      let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
      if (placeObj) {
        return placeObj;
      }
    }
    return undefined;
  }

  getDeathDateObj() {
    let dateString = this.ed.Sterbedatum;

    if (dateString) {
      let dateObj = this.makeDateObjFromDateString(dateString);
      if (dateObj) {
        return dateObj;
      }
    }

    return undefined;
  }

  getResidencePlaceObj() {
    let placeString = this.ed.Adresse || this.ed.Ort;

    if (placeString) {
      let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
      if (placeObj) {
        return placeObj;
      }
    }
    return undefined;
  }

  getOccupation() {
    return this.ed.Beruf;
  }

  getUnit() {
    return this.ed.Regiment;
  }

  getRank() {
    return this.ed.Dienstgrad;
  }
}

export { CompdesEdReader };
