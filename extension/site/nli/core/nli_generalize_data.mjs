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

import { GeneralizedData, dateQualifiers, WtsName } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { WTS_Date } from "../../../base/core/wts_date.mjs";

function processDates(ed, result) {
  if (!ed.pageInfo) {
    return;
  }

  // parse the pageInfo
  let semiIndex = ed.pageInfo.indexOf(";");
  if (semiIndex == -1) {
    return;
  }

  let dateString = ed.pageInfo.substring(semiIndex + 1).trim();

  // could one of two forms:
  // Aug. 1733 to Nov. 1733
  // Apr. 1733
  let eventDate = "";
  let fromDate = "";
  let toDate = "";
  let toIndex = dateString.indexOf("to");
  if (toIndex == -1) {
    eventDate = dateString.replace(/\./g, "");
    fromDate = eventDate;
    toDate = eventDate;
  } else {
    fromDate = dateString.substring(0, toIndex).trim();
    toDate = dateString.substring(toIndex + 2).trim();
    fromDate = fromDate.replace(/\./g, "");
    toDate = toDate.replace(/\./g, "");
    eventDate = fromDate + " - " + toDate;
  }
  result.setEventDate(eventDate);

  let parsedFromDate = WTS_Date.parseDateString(fromDate);
  let fromDateInDays = WTS_Date.getParsedDateInDays(parsedFromDate);
  let parsedToDate = WTS_Date.parseDateString(toDate);
  let toDateInDays = WTS_Date.getParsedDateInDays(parsedToDate);

  let eventInRange = undefined;
  for (let event of ed.registerEvents) {
    let range = event.range;

    let rangeFrom = "";
    let rangeTo = "";
    let toIndex = range.indexOf("to");
    if (toIndex == -1) {
      rangeFrom = range.replace(/\./g, "");
      rangeTo = rangeFrom;
    } else {
      rangeFrom = range.substring(0, toIndex).trim();
      rangeTo = range.substring(toIndex + 2).trim();
      rangeFrom = rangeFrom.replace(/\./g, "");
      rangeTo = rangeTo.replace(/\./g, "");
    }

    let parsedRangeFrom = WTS_Date.parseDateString(rangeFrom);
    let rangeFromInDays = WTS_Date.getParsedDateInDays(parsedRangeFrom);
    let parsedRangeTo = WTS_Date.parseDateString(rangeTo);
    let rangeToInDays = WTS_Date.getParsedDateInDays(parsedRangeTo);

    if (fromDateInDays > rangeToInDays || toDateInDays < rangeFromInDays) {
      // no overlap ignore
    } else {
      if (eventInRange) {
        // multiple events on range
        eventInRange = undefined;
        break;
      } else {
        eventInRange = event;
      }
    }
  }

  let guessedRecordType = RT.Unclassified;
  if (eventInRange) {
    if (eventInRange.title == "Baptisms") {
      guessedRecordType = RT.Baptism;
    } else if (eventInRange.title == "Marriages") {
      guessedRecordType = RT.Marriage;
    } else if (eventInRange.title == "Burials") {
      guessedRecordType = RT.Burial;
    }
  }

  return guessedRecordType;
}

// This function generalizes the data (ed) extracted from the web page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeData(input) {
  let ed = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "nli";

  if (!ed.success) {
    return result; // the extract failed
  }

  result.sourceType = "record";
  result.recordType = RT.Unclassified; // causes manual classification

  let guessedRecordType = processDates(ed, result);

  result.classificationHints = {
    possibleRecordTypes: [
      { type: RT.Unclassified, string: "Unclassified", needsName: true, needsEventDate: true },
      { type: RT.Baptism, string: "Baptism", needsName: true, needsParentNames: true, needsEventDate: true },
      { type: RT.Marriage, string: "Marriage", needsName: true, needsSpouseName: true, needsEventDate: true },
      { type: RT.Burial, string: "Burial", needsName: true, needsEventDate: true },
    ],
    eventDateComment: "(Edit to give single exact date)",
    guessedRecordType: guessedRecordType,
  };

  if (guessedRecordType != RT.Unclassified) {
    result.classificationHints.topLabel = "Confirm record type and add transcribed data";
  } else {
    result.classificationHints.topLabel = "Select record type and add transcribed data";
  }

  let eventPlace = "";
  let parish = ed.parishTitle;
  if (parish) {
    eventPlace = parish;
  }
  let county = ed.county;
  if (county) {
    const prefix = "County of ";
    if (county.startsWith(prefix)) {
      county = county.substring(prefix.length);
    }
    if (county) {
      if (eventPlace) {
        eventPlace += ", ";
      }
      eventPlace += county;
    }
  }
  if (eventPlace) {
    eventPlace += ", ";
  }
  eventPlace += "Ireland";
  result.setEventPlace(eventPlace);

  result.hasValidData = true;

  //console.log("nli; generalizeData: result is:");
  //console.log(result);

  return result;
}

function regeneralizeData(input) {
  let ed = input.extractedData;
  let result = input.generalizedData;
  let newData = input.newData;

  result.recordType = newData.recordType;

  result.setLastNameAndForeNames(newData.lastName, newData.forenames);

  if (newData.eventDate) {
    result.setEventDate(newData.eventDate);
  }

  result.addFatherName(newData.fatherName);
  result.addMotherName(newData.motherName);

  if (newData.spouseForenames || newData.spouseLastName) {
    const spouse = result.addSpouse();
    spouse.name.setLastName(newData.spouseLastName);
    spouse.name.setForeNames(newData.spouseForenames);
  }
}

export { generalizeData, regeneralizeData, GeneralizedData, dateQualifiers };
