/*
MIT License

Copyright (c) 2022 Robert M Pavey

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

import { GeneralizedData, dateQualifiers, NameObj } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";

function issueToDate(issue) {
  // issue can be of form:
  // "Tue 6 Aug 1940"
  // This seems fairly standard across different titles (publications)
  // However sometimes it is like:
  // "Thu 28 Mar 1918\n                [Issue No.38]"

  let dateString = issue;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (let day of days) {
    if (dateString.startsWith(day)) {
      dateString = dateString.substring(day.length).trim();
      break;
    }
  }

  // if string contains \n then remove it and everything after it
  const newlineIndex = dateString.indexOf("\n");
  if (newlineIndex != -1) {
    dateString = dateString.substring(0, newlineIndex);
  }

  return dateString;
}

function titleToPlaceAndPaperName(title) {
  // title can be of form:
  // "Camberwell and Hawthorn Advertiser (Vic. : 1914 - 1918)"
  // "Cairns Post (Qld. : 1909 - 1954)"
  // "Camp Chronicle (Midland Junction, WA : 1915 - 1918)"
  // "Chinese Republic News (Sydney, NSW : 1914 - 1937)"

  let placeString = "";
  let paperNameString = "";

  let parenIndex = title.indexOf("(");
  if (parenIndex != -1) {
    const colonIndex = title.indexOf(":", parenIndex);
    if (colonIndex != -1) {
      placeString = title.substring(parenIndex + 1, colonIndex).trim();
    }
    paperNameString = title.substring(0, parenIndex).trim();
  }

  const stateAbbrevs = {
    ACT: "Australian Capital Territory",
    NSW: "New South Wales",
    NT: "Northern Territory",
    "Qld.": "Queensland",
    SA: "South Australia",
    "Tas.": "Tasmania",
    "Vic.": "Victoria",
    WA: "Western Australia",
  };

  for (let abbrev in stateAbbrevs) {
    if (placeString.endsWith(abbrev)) {
      placeString = placeString.substring(0, placeString.length - abbrev.length);
      placeString += stateAbbrevs[abbrev];
      break;
    }
  }

  placeString += ", Australia";

  return { place: placeString, paperName: paperNameString };
}

// This function generalizes the data (ed) extracted from the web page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeData(input) {
  let ed = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "trove";

  if (!ed.success == undefined) {
    return result; //the extract failed
  }

  result.sourceType = "record";

  result.recordType = RT.Newspaper;

  const issue = ed.issue;
  if (issue) {
    result.setEventDate(issueToDate(issue));
  }

  const title = ed.title;
  if (title) {
    const placeAndName = titleToPlaceAndPaperName(title);
    result.setEventPlace(placeAndName.place);

    if (placeAndName.paperName) {
      result.newspaperName = placeAndName.paperName;
    }
  }

  result.hasValidData = true;

  //console.log("trove; generalizeData: result is:");
  //console.log(result);

  return result;
}

export { generalizeData, GeneralizedData, dateQualifiers };
