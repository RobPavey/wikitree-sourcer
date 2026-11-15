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

const monthNames = [
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

// "Friday, 2 October 1925" -> "2 October 1925", or from the page ID's "19251002" if that is all there is
function getIssueDateString(ed) {
  if (ed.issueDate) {
    return ed.issueDate.replace(/^\w+day,\s*/, "");
  }
  if (ed.issueDateYmd && /^\d{8}$/.test(ed.issueDateYmd)) {
    let year = ed.issueDateYmd.substring(0, 4);
    let month = Number(ed.issueDateYmd.substring(4, 6));
    let day = Number(ed.issueDateYmd.substring(6, 8));
    if (month >= 1 && month <= 12 && day >= 1) {
      return day + " " + monthNames[month - 1] + " " + year;
    }
  }
  return "";
}

class InaEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    this.recordType = RT.Newspaper;
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
    return "record";
  }

  getNameObj() {
    return undefined;
  }

  getGender() {
    return "";
  }

  getEventDateObj() {
    let dateString = getIssueDateString(this.ed);
    if (dateString) {
      return this.makeDateObjFromDateString(dateString);
    }
    return undefined;
  }

  // Many papers circulated in more than one county, so no place is given for the event
  getEventPlaceObj() {
    return undefined;
  }

  getSpouses() {
    return undefined;
  }

  getParents() {
    return undefined;
  }

  setCustomFields(gd) {
    if (this.ed.newspaperTitle) {
      gd.newspaperName = this.ed.newspaperTitle;
    }
  }
}

export { InaEdReader, getIssueDateString };
