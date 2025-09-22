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

function cleanText(text) {
  text = text.replace(/\s+/g, " "); // eliminate nbsp and multiple white space etc
  text = text.trim();
  return text;
}

function extractNameFromFirstRowText(text, result) {
  text = text.trim(); // there can be a newline on start for example
  const commaIndex = text.indexOf(",");
  if (commaIndex != -1) {
    let lastName = text.substring(0, commaIndex);
    result.lastName = cleanText(lastName);
    let forenames = text.substring(commaIndex + 1).trim();
    let cleanedForenames = cleanText(forenames);
    if (cleanedForenames != "-") {
      result.forenames = cleanedForenames;
      // we can't rely on a space to separate the first and second fornames
      // There is a rare case where the first forname can contain a space (e.g. "St GEORGE")
      // But there happens to be a newline before the middle names (even though it is not visible on page)
      var nlIndex = forenames.indexOf("\n");
      if (nlIndex != -1) {
        result.firstName = cleanText(forenames.substring(0, nlIndex).trim());
        var middleNames = forenames.substring(nlIndex + 1).trim();
        if (middleNames != "") {
          result.middleNames = cleanText(middleNames);
        }
      } else {
        result.firstName = cleanedForenames;
      }
    } else {
      result.forenames = "";
      result.firstName = "";
    }
  }
}

function extractSecondRowText(secondRowText, result) {
  // There are two different formats. Up to 1954 is like:
  // Example: 'GRO Reference: 1872  D Quarter in ST PANCRAS  Volume 01B  Page 90'
  // Newer records are like this for births:
  // GRO Reference:  DOR  Q4/1992 in BRISTOL  (3011E)  Volume 22  Page 1099
  // or this for deaths:
  // GRO Reference:  DOR  Q4/1991 in BRISTOL  (3011C)  Volume 22  Page 608  Entry Number 226
  // or this in some cases:
  // GRO Reference:  DOR  Q3/1995 in EASTBOURNE (4541A) Reg A63E Entry Number 122 Order this entry as a:...
  // Ocassionally there is no page number:
  // GRO Reference: 1845  D Quarter in SETTLE UNION  Volume 23
  // Ocassionally there is no district:
  // GRO Reference: 1908  D Quarter in  Volume 05C  Page 284

  if (secondRowText.search(/GRO Reference\:\s+DOR/) == -1) {
    // older format
    result.recordType = "older";

    var eventYear = secondRowText.replace(
      /^GRO Reference\:\s+(\d\d\d\d)\s+\w\s+Quarter\s+in.+Volume\s+[^\s]+.*$/,
      "$1"
    );
    if (eventYear != secondRowText && eventYear.length == 4) {
      var year = parseInt(eventYear);
      if (year != NaN) {
        result.eventYear = year;
      }
    }

    var quarter = secondRowText.replace(/^GRO Reference\:\s+\d\d\d\d\s+(\w)\s+Quarter\s+in.+Volume\s+[^\s]+.*$/, "$1");
    if (quarter != secondRowText && quarter.length == 1) {
      var eventQuarter = undefined;
      if (quarter == "M") {
        eventQuarter = 1;
      } else if (quarter == "J") {
        eventQuarter = 2;
      } else if (quarter == "S") {
        eventQuarter = 3;
      } else if (quarter == "D") {
        eventQuarter = 4;
      }
      result.eventQuarterLetter = quarter;
      if (eventQuarter != undefined) {
        result.eventQuarter = eventQuarter;
      }
    }

    var district = secondRowText
      .replace(/^GRO Reference\:\s+\d\d\d\d\s+\w\s+Quarter\s+in\s+(.*)\s+Volume\s+[^\s]+.*$/, "$1")
      .trim();
    if (district != secondRowText && district) {
      result.registrationDistrict = district;
    }

    var volume = secondRowText.replace(/^GRO Reference\:\s+\d\d\d\d\s+\w\s+Quarter\s+in.+Volume\s+([^\s]+).*$/, "$1");
    if (volume != secondRowText && volume.length > 0) {
      result.referenceVolume = volume;
    }

    var page = secondRowText.replace(
      /^GRO Reference\:\s+\d\d\d\d\s+\w\s+Quarter\s+in.+Volume\s+[^\s]+\s+Page\s+(\d+).*$/,
      "$1"
    );
    if (page != secondRowText && page.length > 0) {
      result.referencePage = page;
    }
  } else {
    result.recordType = "newer";

    // GRO Reference:  DOR  Q4/1991 in BRISTOL  (3011C)  Volume 22  Page 608  Entry Number 226
    // or
    // GRO Reference:  DOR  Q3/1995 in EASTBOURNE (4541A) Reg A63E Entry Number 122 Order this entry as a:...
    // or
    // GRO Reference:  DOR  Q2/2016 in PLYMOUTH  (416-1C)  Entry Number 513852158 Order this entry as a:...
    var eventYear = secondRowText.replace(
      /^GRO Reference\:\s+DOR\s+Q\d\/(\d\d\d\d)\s+in\s+.*\s+\([\w\-]+\)\s+.*$/,
      "$1"
    );
    if (eventYear != secondRowText && eventYear.length == 4) {
      var year = parseInt(eventYear);
      if (year != NaN) {
        result.eventYear = year;
      }
    }

    var quarter = secondRowText.replace(/^GRO Reference\:\s+DOR\s+Q(\d)\/\d\d\d\d\s+in\s+.*\s+\([\w\-]+\)\s+.*$/, "$1");
    if (quarter != secondRowText && quarter.length == 1) {
      const number = parseInt(quarter);
      if (number != NaN && number >= 1 && number <= 4) {
        result.eventQuarter = number;
        const letters = ["M", "J", "S", "D"];
        result.eventQuarterLetter = letters[number - 1];
      }
    }

    var district = secondRowText.replace(
      /^GRO Reference\:\s+DOR\s+Q\d\/\d\d\d\d\s+in\s+(.*)\s+\([\w\-]+\)\s+.*$/,
      "$1"
    );
    if (district != secondRowText && district != "") {
      result.registrationDistrict = district.trim();
    }

    var districtCode = secondRowText.replace(
      /^GRO Reference\:\s+DOR\s+Q\d\/\d\d\d\d\s+in\s+.*\s+\(([\w\-]+)\)\s+.*$/,
      "$1"
    );
    if (districtCode != secondRowText && districtCode != "") {
      result.registrationDistrictCode = districtCode.trim();
    }

    const volumeString = " Volume ";
    const regString = " Reg ";
    const entryNumString = " Entry Number ";

    const volIndex = secondRowText.indexOf(volumeString);
    if (volIndex != -1) {
      let restOfText = secondRowText.substring(volIndex + volumeString.length);

      var volume = restOfText.replace(/^\s*([^\s]+)\s+Page\s+\d+\s*(?:Entry Number\s\d+)?.*$/, "$1");
      if (volume != restOfText && volume.length > 0) {
        result.referenceVolume = volume;
      }

      var page = restOfText.replace(/^\s*[^\s]+\s+Page\s+(\d+)\s*(?:Entry Number\s\d+)?.*$/, "$1");
      if (page != restOfText && page.length > 0) {
        result.referencePage = page;
      }

      var entryNumber = restOfText.replace(/^\s*[^\s]+\s+Page\s+\d+\s+Entry\s+Number\s+(\d+).*$/, "$1");
      if (entryNumber != restOfText && entryNumber.length > 0) {
        result.entryNumber = entryNumber;
      }
    } else {
      const regIndex = secondRowText.indexOf(regString);
      if (regIndex != -1) {
        let restOfText = secondRowText.substring(regIndex + regString.length);

        var register = restOfText.replace(/^\s*([^\s]+)\s*(?:Entry Number\s\d+)?.*$/, "$1");
        if (register != restOfText && register.length > 0) {
          result.referenceRegister = register;
        }

        var entryNumber = restOfText.replace(/^\s*[^\s]+\s+Entry\s+Number\s+(\d+).*$/, "$1");
        if (entryNumber != restOfText && entryNumber.length > 0) {
          result.entryNumber = entryNumber;
        }
      } else {
        // no Volume or Reg
        const entryNumIndex = secondRowText.indexOf(entryNumString);
        if (entryNumIndex != -1) {
          let restOfText = secondRowText.substring(entryNumIndex + entryNumString.length);

          var entryNumber = restOfText.replace(/^\s*(\d+).*$/, "$1");

          if (entryNumber != restOfText && entryNumber.length > 0) {
            result.entryNumber = entryNumber;
          }
        }
      }
    }
  }
}

function extractFirstRowForBirth(inputElement, result) {
  var firstRowFirstCell = inputElement.closest("td");
  if (firstRowFirstCell) {
    let secondCell = firstRowFirstCell.nextElementSibling;
    if (secondCell) {
      extractNameFromFirstRowText(secondCell.textContent, result);

      let thirdCell = secondCell.nextElementSibling;
      if (thirdCell) {
        // there are two different formats, up to 1934 has Mother's Maiden Name, after 1984 does not
        const mmnString = cleanText(thirdCell.textContent);
        if (mmnString != "") {
          result.mothersMaidenName = mmnString;
        }
      }
    }
  }
}

function extractFirstRowForDeath(inputElement, result) {
  var firstRowFirstCell = inputElement.closest("td");
  if (firstRowFirstCell) {
    let secondCell = firstRowFirstCell.nextElementSibling;
    if (secondCell) {
      extractNameFromFirstRowText(secondCell.textContent, result);

      let thirdCell = secondCell.nextElementSibling;
      if (thirdCell) {
        const string = cleanText(thirdCell.textContent);
        // there are two different formats, up to 1957 has Age, after 1984 has Year of Birth
        const number = parseInt(string);
        if (number != NaN) {
          if (number > 500) {
            result.birthYear = number;
          } else {
            result.ageAtDeath = number;
          }
        }
      }
    }
  }
}

function extractSecondRow(inputElement, result) {
  // get the second row text
  let parentRow = inputElement.closest("tr");
  if (parentRow) {
    let nextRow = parentRow.nextElementSibling;
    if (nextRow) {
      var secondRowTextNode = nextRow.querySelector("td.main_text");
      if (secondRowTextNode) {
        var secondRowText = cleanText(secondRowTextNode.textContent);
        extractSecondRowText(secondRowText, result);
      }
    }
  }
}

function extractFirstOrSelectedData(document, firstRowFunction, secondRowFunction, result) {
  let resultsNode = document.querySelector("[name='Results']");
  if (!resultsNode) {
    return;
  }

  let resultsTable = resultsNode.closest("table");
  if (!resultsTable) {
    return;
  }

  // look for the selected result
  let inputElement = resultsTable.querySelector("input[type=radio]:checked");
  if (!inputElement) {
    // no selected result, find the first result
    inputElement = resultsTable.querySelector("input[type=radio]");
  }

  // if no results bail out
  if (!inputElement) {
    return;
  }

  firstRowFunction(inputElement, result);
  secondRowFunction(inputElement, result);

  // the row data doesn't contain the gender so get that from the search fields
  let genderNode = document.querySelector("[name='Gender']");
  if (!genderNode) {
    return;
  }

  let gender = genderNode.value;
  result.personGender = "male";
  if (gender == "F") {
    result.personGender = "female";
  }

  result.success = true;
}

function extractData(document, url) {
  var result = {
    success: false,
  };

  if (url) {
    result.url = url;
  }

  // first check whether these are births or deaths
  const isBirth = document.querySelector("#EW_Birth:checked");
  const isDeath = document.querySelector("#EW_Death:checked");

  if (isBirth) {
    extractFirstOrSelectedData(document, extractFirstRowForBirth, extractSecondRow, result);
    result.birthYear = result.eventYear;
    result.birthQuarter = result.eventQuarter;
    result.eventType = "birth";
  } else if (isDeath) {
    extractFirstOrSelectedData(document, extractFirstRowForDeath, extractSecondRow, result);
    result.deathYear = result.eventYear;
    result.deathQuarter = result.eventQuarter;
    result.eventType = "death";
  }

  //console.log(result);

  return result;
}

export { extractData, extractFirstRowForBirth, extractFirstRowForDeath, extractSecondRow };
