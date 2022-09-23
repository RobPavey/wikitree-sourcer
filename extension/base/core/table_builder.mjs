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

import { RC } from "./record_collections.mjs";
import { RT } from "./record_type.mjs";
import { WTS_String } from "./wts_string.mjs";
import { CD } from "./country_data.mjs";

class TableBuilder {
  constructor(gd, options) {
    this.gd = gd;
    this.options = options;
  }

  getOptions() {
    return this.options;
  }

  includeFieldColumn(fieldName) {
    if (fieldName == "birthYear") {
      return false;
    }
    return true;
  }

  getTitleForFieldName(fieldName) {
    const titles = {
      name: "Name",
      relationship: "Relation",
      maritalStatus: "Status",
      gender: "Sex",
      age: "Age",
      maritalStatus: "Status",
      birthDate: "Birth Date",
      birthYear: "Birth Year",
      occupation: "Occupation",
      employer: "Employer",
      birthPlace: "Birth Place",
    };

    return titles[fieldName];
  }

  getFormattedValueForPerson(person, fieldName) {
    const formatters = {
      gender: function (gd, value) {
        if (value.toLowerCase() == "male") {
          return "M";
        }
        else if (value.toLowerCase() == "female") {
          return "F";
        }
        return value;
      },
      relationship: function (gd, value) {
        value = WTS_String.toInitialCaps(value);
        return value;
      },
      maritalStatus: function (gd, value) {
        if (value == "single") {
          value = gd.getTermForUnmarried();
        }
  
        value = WTS_String.toInitialCaps(value);
        return value;
      },
    };

    let value = person[fieldName];
    if (!value) {
      return value;
    }

    let formatterFunction = formatters[fieldName];
    if (formatterFunction) {
      value = formatterFunction(this.gd, value);
    }

    return value;
  }

  addHeadingFields(fieldNames) {
    this.fieldNames = fieldNames;
  }

  addPersonArray(personArray) {
    this.personArray = personArray;
  }


  getTableString() {

    let tableString = "";

    if (!this.fieldNames || this.fieldNames.length < 1 || !this.personArray || this.personArray.length < 1) {
      return "";
    }

    let optHeading = this.options.table_table_heading;
    let optSelected = this.options.table_table_selectedPerson;
    let optHeadingColor = this.options.table_table_headingColor;
    let optSelectedColor = this.options.table_table_selectedColor;
    let optClosedColor = this.options.table_table_closedColor;

    tableString += `{|`;
    if (this.options.table_table_border) {
      tableString += ` border="1"`;
    }
    if (this.options.table_table_padding) {
      tableString += ` cellpadding="4"`;
    }
    tableString += `\n`;

    if (this.options.table_table_caption && this.caption) {
      tableString += `|+ ` + this.caption + `\n`;
    }

    let firstRow = true;
    if (optHeading != "none") {
      // heading row highlight
      if (optHeading == "bgGreen" || optHeading == "bgGreenBoldCentered") {
        tableString += `|- bgcolor=` + optHeadingColor + `\n`;
      }

      // create the heading row
      let firstCol = true;
      for (let fieldName of this.fieldNames) {
        if (this.includeFieldColumn(fieldName)) {
          if (firstCol) {
            if (optHeading == "boldCentered" || optHeading == "bgGreenBoldCentered") {
              tableString += `! `;
            }
            else {
              tableString += `| `;
            }
            firstCol = false;
          }
          else {
            tableString += ` || `;
          }
          let title = this.getTitleForFieldName(fieldName);
          if (title) {
            tableString += title;
          }
        }
      }
      tableString += `\n`;
      firstRow = false;
    }

    for (let person of this.personArray) {
      if (person.isClosed) {
        tableString += `|- bgcolor=` + optClosedColor + `\n`;
        let firstCol = true;
        for (let fieldName of this.fieldNames) {
          if (this.includeFieldColumn(fieldName)) {
            if (firstCol) {
              tableString += `| ''Closed Record''`;
              firstCol = false;
            }
            else {
              tableString += ` || `;
            }
          }
        }
      }
      else {
        if (person.isSelected &&
          (optSelected == "bgYellowRow" || optSelected == "bgYellowBoldRow"
           || optSelected == "bgYellowBoldName" || optSelected == "bgYellowBoldCenteredRow")) {
            tableString += `|- bgcolor=` + optSelectedColor + `\n`;
        }
        else if (!firstRow) {
          tableString += `|-\n`;
        }

        let firstCol = true;
        for (let fieldName of this.fieldNames) {
          if (this.includeFieldColumn(fieldName)) {
            if (firstCol) {
              if (person.isSelected && (optSelected == "boldCenteredRow" || optSelected == "bgYellowBoldCenteredRow")) {
                tableString += `! `;
              }
              else {
                tableString += `| `;
              }
            }
            else {
              tableString += ` || `;
            }
            let value = this.getFormattedValueForPerson(person, fieldName);
            if (value) {
              let useBoldQuotes = false;
              if (person.isSelected) {
                if (firstCol && (optSelected == "boldName" || optSelected == "bgYellowBoldName")) {
                  useBoldQuotes = true;
                }
                else if (optSelected == "boldRow" || optSelected == "bgYellowBoldRow") {
                  useBoldQuotes = true;
                }
              }

              if (useBoldQuotes) {
                tableString += "'''" + value + "'''";
              }
              else {
                tableString += value;
              }
            }
          }
          firstCol = false;
        }
      }
      tableString += `\n`;
      firstRow = false;
    }

    tableString += `|}`;

    return tableString;
  }

  getListString() {

    let listString = "";

    if (!this.fieldNames || this.fieldNames.length < 1 || !this.personArray || this.personArray.length < 1) {
      return "";
    }

    let type = this.options.table_list_type;

    for (let person of this.personArray) {
      if (listString) {
        listString += `\n`;
      }

      // line start characters
      if (type == "bullet") {
        listString += "* ";
      }
      if (type == "bullet2") {
        listString += "** ";
      }
      if (type == "number") {
        listString += "# ";
      }
      if (type == "bulletNumber") {
        listString += "*# ";
      }
      if (type == "indented1") {
        listString += ": ";
      }
      if (type == "indented2") {
        listString += ":: ";
      }

      if (person.isClosed) {
        listString += "''Closed Record''";
      }
      else {
        let firstCol = true;
        for (let fieldName of this.fieldNames) {
          if (this.includeFieldColumn(fieldName)) {
            if (firstCol) {
              firstCol = false;
            }
            else {
              listString += `    `;
            }
            let value = this.getFormattedValueForPerson(person, fieldName);
            if (value) {
              listString += value;
            }
          }
        }
      }
    }

    return listString;
  }

  getSentenceString() {

    let sentenceString = "";

    // " John Smith 32, wife Jane Smith 30, son Leslie Smith 8, daughter Frances Smith 6, hired hand James Jones 20."

    if (!this.personArray || this.personArray.length < 1) {
      return "";
    }



    for (let person of this.personArray) {


      if (person.isClosed) {
        sentenceString += "Closed Record";
      }
      else {
        let relationship = person.relationship;
        if (relationship && relationship != "head") {
          if (sentenceString) {
            sentenceString += " ";
          }
          sentenceString += relationship;
        }

        let name = person.name;
        if (!name) {
          name = "Unknown Name";
        }
        if (sentenceString) {
          sentenceString += " ";
        }
        sentenceString += name;

        let age = person.age;
        if (age) {
          sentenceString += " " + age;
        }
      }

      sentenceString += `,`;
    }

    // remove traling comma
    sentenceString = sentenceString.replace(/\,$/g, "");

    sentenceString += ".";

    return sentenceString;
  }

  getString() {

    let tableString = "";

    if (this.options.table_general_format == "table") {
      return this.getTableString();
    }
    if (this.options.table_general_format == "list") {
      return this.getListString();
    }

    return this.getSentenceString();
  }
}

function buildHouseholdTable(input) {

  //console.log("buildHouseholdTable: input is")
  //console.log(input)

  const data = input.extractedData;
  const gd = input.generalizedData;
  const options = input.options;

  let fieldNames = gd.householdArrayFields;
  let objectArray = gd.householdArray;

  if (!fieldNames || !objectArray) {
    return { tableString: "" };
  }

  // see if collection overrides field names
  if (gd.collectionData) {
    let collection = RC.findCollection(gd.sourceOfData, gd.collectionData.id);

    if (collection) {
      let collectionFieldNames = RC.getFieldFromCollectionOrOwningCollections(collection, "householdTableColumns");
      if (collectionFieldNames && collectionFieldNames.length > 0) {
        fieldNames = collectionFieldNames;
      }
    }
  }

  let builder = new TableBuilder(gd, options);

  builder.addHeadingFields(fieldNames);
  builder.addPersonArray(objectArray);

  if (options.table_table_caption != "none") {
    let captionOption = options.table_table_caption;

    let useCollectionTitle = true;
    let includeCountryInPlace = true;
    if (captionOption == "titlePlace") {
      useCollectionTitle = true;
      includeCountryInPlace = true;
    }
    else if (captionOption == "titlePlaceNoCountry") {
      useCollectionTitle = true;
      includeCountryInPlace = false;
    }
    else if (captionOption == "datePlace") {
      useCollectionTitle = false;
      includeCountryInPlace = true;
    }
    else if (captionOption == "datePlaceNoCountry") {
      useCollectionTitle = false;
      includeCountryInPlace = false;
    }

    let captionPart1 = "";
    let captionPart2 = "";
    let collection = undefined;
    if (gd.collectionData) {
      collection = RC.findCollection(gd.sourceOfData, gd.collectionData.id);
    }

    if (useCollectionTitle) {
      if (options.table_table_caption != "none")
      if (collection) {
        captionPart1 = collection.title;
      }

      if (!captionPart1) {
        if (gd.recordType == RT.Census) {
          captionPart1 += gd.inferEventYear() + " Census";
        }
        else {
          captionPart1 += gd.inferEventYear();
        }
      }
    }
    else {
      if (collection && collection.dates && collection.dates.exactDate) {
        captionPart1 = collection.dates.exactDate;
      }
      else {
        captionPart1 = gd.inferEventDate();
      }
    }

    captionPart2 = gd.inferEventPlace();
    if (!includeCountryInPlace) {
      let countryExtract = CD.extractCountryFromPlaceName(captionPart2);
      if (countryExtract) {
        captionPart2 = countryExtract.remainder;
      }
    }

    if (captionPart1 && captionPart2) {
      builder.caption = captionPart1 + ": " + captionPart2;
    }
    else if (captionPart1) {
      builder.caption = captionPart1;
    }
    else if (captionPart2) {
      builder.caption = captionPart2;
    }

    // Optionally insert an inline citation at the end of the caption
    if (options.table_general_autoGenerate == "citationInTableCaption" && input.citationObject) {
      if (input.citationObject.citation) {
        builder.caption += input.citationObject.citation;
      }
    }
  }

  // now the builder is setup use it to build the table or list text
  let tableString = builder.getString();

  var tableObject = {
    tableString: tableString,
  }

  return tableObject;
}

export { buildHouseholdTable, TableBuilder };
