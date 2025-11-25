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

import { buildCustomTable } from "/base/core/table_builder.mjs";

function buildTableObject(data, dataObj, fieldNames, objectArray, options) {
  console.log("buildTableObject");

  console.log("objectArray is");
  console.log(objectArray);

  const input = {
    extractedData: data.extractedData,
    generalizedData: data.generalizedData,
    fieldNames: fieldNames,
    objectArray: objectArray,
    options: options,
  };

  // attempt to add the sharing link for the image as a caption
  if (dataObj) {
    // V1 versions
    // https://www.ancestry.com/sharing/24274440?h=95cf5c
    let num1 = dataObj.id;
    let num2 = dataObj.hmac_id;

    // V2 versions
    if (dataObj.v2 && dataObj.v2.share_id && dataObj.v2.share_token) {
      num1 = dataObj.v2.share_id;
      num2 = dataObj.v2.share_token;
    }

    if (num1 && num2) {
      input.captionString = "{{Ancestry Sharing|" + num1 + "|" + num2 + "}}";
    }
  }

  const tableObject = buildCustomTable(input);

  return tableObject;
}

function buildCensusPageTable(data, dataObj, options) {
  //console.log("ancestryBuildCensusPageTable");

  let ed = data.extractedData;

  let isVessel = false;
  if (ed.imageBrowsePath && ed.imageBrowsePath.includes("> Vessels >")) {
    isVessel = true;
  }
  let houseLabel = isVessel ? "Vessel" : "House";

  const headingMappings = {
    8767: {
      // England 1861 census
      "No.": {
        heading: "Household schedule number",
      },
      House: {},
      Name: {
        heading: "Name",
      },
      Relation: {
        heading: "Relationship",
      },
      MS: {
        heading: "Marital Status",
      },
      Age: {
        heading: "Age",
      },
      Sex: {
        heading: "Gender",
      },
      Occupation: {
        heading: "Occupation",
      },
      "Where Born": {
        heading: "Where born",
        excludeEnding: ", England",
        reverseElements: true,
        separator: ", ",
      },
    },
    7619: {
      // England 1871 census
      "No.": {
        heading: "Household schedule number",
      },
      House: {},
      Name: {
        headings: ["Given Name", "Surname"],
        separator: " ",
      },
      Relation: {
        heading: "Relationship",
      },
      MS: {
        heading: "Marital Status",
      },
      Age: {
        heading: "Age",
      },
      Sex: {
        heading: "Gender",
      },
      Occupation: {
        heading: "Occupation",
      },
      "Where Born": {
        heading: "Birth Place",
        excludeEnding: ", England",
        reverseElements: true,
        separator: ", ",
        replacements: {
          Nk: "N.K.",
        },
      },
    },
    7572: {
      // England 1881 census
      "No.": {},
      House: {
        heading: "Address",
        skipIfAllBlank: true,
      },
      Name: {
        headings: ["Given Name", "Surname"],
        separator: " ",
      },
      Relation: {
        heading: "Relationship to Head",
      },
      MS: {
        heading: "Marital Status",
      },
      Age: {
        heading: "Age",
      },
      Sex: {
        heading: "Gender",
      },
      Occupation: {
        heading: "Occupation",
      },
      "Where Born": {
        headings: ["Birth Country", "Birth County", "Birth City"],
        separator: ", ",
        exclude: "England",
      },
    },
  };

  function getMappedValue(headingMapping, row, fieldName) {
    let value = "";
    let mappingObj = headingMapping[fieldName];
    if (mappingObj) {
      if (mappingObj.heading) {
        let rowValue = row[mappingObj.heading];
        if (rowValue) {
          if (mappingObj.excludeEnding && rowValue.endsWith(mappingObj.excludeEnding)) {
            rowValue = rowValue.substring(0, rowValue.length - mappingObj.excludeEnding.length).trim();
          }
          value = rowValue;
        }
      } else if (mappingObj.headings) {
        for (let heading of mappingObj.headings) {
          let rowValue = row[heading];
          if (rowValue && rowValue != mappingObj.exclude) {
            if (value) {
              value += mappingObj.separator;
            }
            value += rowValue;
          }
        }
      }

      if (mappingObj.reverseElements && mappingObj.separator) {
        let elements = value.split(mappingObj.separator);
        elements.reverse();
        value = elements.join(mappingObj.separator);
      }

      if (mappingObj.replacements) {
        for (let key of Object.keys(mappingObj.replacements)) {
          value = value.replace(key, mappingObj.replacements[key]);
        }
      }
    }
    return value;
  }

  let fieldNames = ["No.", houseLabel, "Name", "Relation", "MS", "Age", "Sex", "Occupation", "Where Born"];
  let headingMapping = headingMappings[ed.dbId];
  if (!headingMapping) {
    return false;
  }

  let objectArray = [];

  let lastHouse = "";
  let lastRelation = "";
  let lastScheduleNumber = "";

  let isFirstRow = true;
  for (let row of ed.indexRows) {
    let rowObject = {};

    let scheduleNumber = getMappedValue(headingMapping, row, "No.");
    if (scheduleNumber != lastScheduleNumber) {
      rowObject["No."] = scheduleNumber;
    }

    let house = getMappedValue(headingMapping, row, "House");
    rowObject[houseLabel] = house;

    rowObject["Name"] = getMappedValue(headingMapping, row, "Name");

    let relation = getMappedValue(headingMapping, row, "Relation");

    let ageString = getMappedValue(headingMapping, row, "Age");
    let ageNum = Number(ageString);
    if (!ageString && rowObject["Name"] && house != "Uninhabited") {
      // age is blank in transcription is months, weeks etc
      ageString = "age?";
    }
    rowObject["Age"] = ageString;

    let maritalStatus = getMappedValue(headingMapping, row, "MS");
    if (maritalStatus == "Married") {
      maritalStatus = "M";
    } else if (maritalStatus == "Unmarried") {
      maritalStatus = "U";
    } else if (maritalStatus == "Widow" || maritalStatus == "Widower") {
      maritalStatus = "W";
    } else if (maritalStatus == "") {
      if (!isNaN(ageNum) && ageNum >= 16) {
        maritalStatus = "U";
      }
    }
    rowObject["MS"] = maritalStatus;

    let sex = getMappedValue(headingMapping, row, "Sex");
    if (sex == "Male") {
      sex = "M";
    } else if (sex == "Female") {
      sex = "F";
    }
    rowObject["Sex"] = sex;

    rowObject["Occupation"] = getMappedValue(headingMapping, row, "Occupation");
    rowObject["Where Born"] = getMappedValue(headingMapping, row, "Where Born");

    rowObject.includeInTable = true;

    // decide if this is a new household
    let isNewHouse = false;
    if (scheduleNumber) {
      if (scheduleNumber != lastScheduleNumber) {
        isNewHouse = true;
      }
    } else {
      if (house != lastHouse) {
        isNewHouse = true;
      } else if (relation == "Head") {
        isNewHouse = true;
      } else if (relation.includes("(Head)")) {
        isNewHouse = true;
      } else if (relation == "Wife" && lastRelation != "Head") {
        isNewHouse = true;
      }
    }

    if (!isFirstRow && isNewHouse) {
      rowObject.addDividerBefore = true;
    }

    if (!isNewHouse) {
      rowObject[houseLabel] = "";
    }

    // For census indexes that do not have the schedule number guess where it would
    // be and add a "#" for the user to replace with the one from the image
    if (!isVessel && !scheduleNumber) {
      if (isNewHouse || relation == "Lodger") {
        rowObject["No."] = "#";
      }
    }

    const headHeadString = " (Head) (Head)";
    if (relation.includes(headHeadString)) {
      relation = relation.replace(headHeadString, "");
    }
    if (relation) {
      rowObject["Relation"] = relation;
    }

    lastScheduleNumber = scheduleNumber;
    lastHouse = house;
    lastRelation = relation;

    objectArray.push(rowObject);

    isFirstRow = false;
  }

  let usedFieldsNames = [];
  for (let fieldName of fieldNames) {
    let useField = true;
    let mappingObj = headingMapping[fieldName];
    if (mappingObj && mappingObj.skipIfAllBlank) {
      let used = false;
      for (let row of objectArray) {
        if (row[fieldName]) {
          used = true;
          break;
        }
      }
      if (!used) {
        useField = false;
      }
    }
    if (useField) {
      usedFieldsNames.push(fieldName);
    }
  }

  return buildTableObject(data, dataObj, usedFieldsNames, objectArray, options);
}

function buildImageIndexTable(data, dataObj, options) {
  let ed = data.extractedData;

  if (!(ed.indexHeadings && ed.indexRows)) {
    return;
  }

  if (ed.titleCollection.includes("Census")) {
    let tableObject = buildCensusPageTable(data, dataObj, options);
    if (tableObject) {
      return tableObject;
    }
  }

  let fieldNames = ed.indexHeadings;
  let objectArray = [];

  for (let row of ed.indexRows) {
    let rowObject = {};

    for (let fieldName of fieldNames) {
      rowObject[fieldName] = row[fieldName];
    }

    rowObject.includeInTable = true;
    objectArray.push(rowObject);
  }

  let usedFieldsNames = [];
  for (let fieldName of fieldNames) {
    let used = false;
    for (let row of objectArray) {
      if (row[fieldName]) {
        used = true;
        break;
      }
    }
    if (used) {
      usedFieldsNames.push(fieldName);
    }
  }

  return buildTableObject(data, dataObj, usedFieldsNames, objectArray, options);
}

export { buildImageIndexTable };
