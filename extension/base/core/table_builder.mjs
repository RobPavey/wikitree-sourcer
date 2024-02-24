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
import { StringUtils } from "./string_utils.mjs";
import { CD } from "./country_data.mjs";

class TableBuilder {
  constructor(gd, options) {
    this.gd = gd;
    this.options = options;
    this.includeBirthYear = false;
  }

  getOptions() {
    return this.options;
  }

  includeFieldColumn(fieldName) {
    if (fieldName == "birthYear") {
      // Usually we ignore the birthYear because there is an age column that it was inferred from
      if (!this.includeBirthYear) {
        return false;
      }
    }

    if (fieldName == "race") {
      return this.options.table_general_includeRace;
    }

    return true;
  }

  checkForColumnsToExclude() {
    if (this.fieldNames.includes("birthYear")) {
      if (!this.fieldNames.includes("age")) {
        this.includeBirthYear = true;
      }
    }
  }

  getTitleForFieldName(fieldName) {
    const titles = {
      name: "Name",
      relationship: "Relation",
      maritalStatus: "Status",
      gender: "Sex",
      age: "Age",
      race: "Race",
      maritalStatus: "Status",
      birthDate: "Birth Date",
      birthYear: "Birth Year",
      occupation: "Occupation",
      profession: "Profession",
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
        } else if (value.toLowerCase() == "female") {
          return "F";
        }
        return value;
      },
      relationship: function (gd, value) {
        value = StringUtils.toInitialCaps(value);
        return value;
      },
      maritalStatus: function (gd, value) {
        if (value == "single") {
          value = gd.getTermForUnmarried();
        }

        value = StringUtils.toInitialCaps(value);
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

    function cleanColor(colorCode) {
      if (colorCode) {
        return colorCode.toUpperCase();
      }
      return colorCode;
    }

    let optHeading = this.options.table_table_heading;
    let optSelected = this.options.table_table_selectedPerson;
    let optHeadingColor = cleanColor(this.options.table_table_headingColor);
    let optSelectedColor = cleanColor(this.options.table_table_selectedColor);
    let optClosedColor = cleanColor(this.options.table_table_closedColor);

    tableString += `{|`;
    if (this.options.table_table_border) {
      tableString += ` border="1"`;
    }
    if (this.options.table_table_padding) {
      tableString += ` cellpadding="4"`;
    }
    if (this.options.table_table_fullWidth) {
      tableString += ` width="100%"`;
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
            } else {
              tableString += `| `;
            }
            firstCol = false;
          } else {
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

    let skipping = false;
    for (let person of this.personArray) {
      if (person.includeInTable) {
        skipping = false;
        if (person.isClosed) {
          tableString += `|- bgcolor=` + optClosedColor + `\n`;
          let firstCol = true;
          for (let fieldName of this.fieldNames) {
            if (this.includeFieldColumn(fieldName)) {
              if (firstCol) {
                tableString += `| ''Closed Record''`;
                firstCol = false;
              } else {
                tableString += ` || `;
              }
            }
          }
        } else {
          if (
            person.isSelected &&
            (optSelected == "bgYellowRow" ||
              optSelected == "bgYellowBoldRow" ||
              optSelected == "bgYellowBoldName" ||
              optSelected == "bgYellowBoldCenteredRow")
          ) {
            tableString += `|- bgcolor=` + optSelectedColor + `\n`;
          } else if (!firstRow) {
            tableString += `|-\n`;
          }

          let firstCol = true;
          for (let fieldName of this.fieldNames) {
            if (this.includeFieldColumn(fieldName)) {
              if (firstCol) {
                if (
                  person.isSelected &&
                  (optSelected == "boldCenteredRow" || optSelected == "bgYellowBoldCenteredRow")
                ) {
                  tableString += `! `;
                } else {
                  tableString += `| `;
                }
              } else {
                tableString += ` || `;
              }
              let value = this.getFormattedValueForPerson(person, fieldName);
              if (value) {
                let useBoldQuotes = false;
                if (person.isSelected) {
                  if (firstCol && (optSelected == "boldName" || optSelected == "bgYellowBoldName")) {
                    useBoldQuotes = true;
                  } else if (optSelected == "boldRow" || optSelected == "bgYellowBoldRow") {
                    useBoldQuotes = true;
                  }
                }

                if (useBoldQuotes) {
                  tableString += "'''" + value + "'''";
                } else {
                  tableString += value;
                }
              }
            }
            firstCol = false;
          }
        }
        tableString += `\n`;
        firstRow = false;
      } else {
        // not included in table
        if (!skipping) {
          skipping = true;

          tableString += `|-\n`;

          let firstCol = true;
          for (let fieldName of this.fieldNames) {
            if (this.includeFieldColumn(fieldName)) {
              if (firstCol) {
                tableString += `| `;
              } else {
                tableString += ` || `;
              }
              let value = "...";
              tableString += value;
            }
            firstCol = false;
          }
          tableString += `\n`;
          firstRow = false;
        }
      }
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

    function addLineStart() {
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
    }

    let skipping = false;
    for (let person of this.personArray) {
      if (person.includeInTable) {
        skipping = false;

        addLineStart();

        if (person.isClosed) {
          listString += "''Closed Record''";
        } else {
          let firstCol = true;
          for (let fieldName of this.fieldNames) {
            if (this.includeFieldColumn(fieldName)) {
              if (firstCol) {
                firstCol = false;
              } else {
                listString += `    `;
              }
              let value = this.getFormattedValueForPerson(person, fieldName);
              if (value) {
                listString += value;
              }
            }
          }
        }
      } else {
        if (!skipping) {
          addLineStart();
          listString += "...";
        }
        skipping = true;
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

    let preampleOpt = this.options.table_sentence_preamble;
    if (preampleOpt == "included") {
      sentenceString += "The household included";
    } else if (preampleOpt == "consisted") {
      sentenceString += "The household consisted of";
    } else if (preampleOpt == "enumerated") {
      sentenceString += "The household was enumerated as";
    }

    let lastPunctOpt = this.options.table_sentence_lastItemPunctuation;

    let skipping = false;
    for (let personIndex = 0; personIndex < this.personArray.length; personIndex++) {
      let person = this.personArray[personIndex];

      if (person.includeInTable) {
        skipping = false;

        if (person.isClosed) {
          sentenceString += "Closed Record";
        } else {
          if (this.options.table_sentence_includeRelationship) {
            let relationship = person.relationship;
            if (relationship && relationship != "head") {
              if (sentenceString) {
                sentenceString += " ";
              }
              sentenceString += relationship;
            }
          }

          let name = person.name;
          if (!name) {
            name = "Unknown Name";
          }
          if (sentenceString) {
            sentenceString += " ";
          }
          sentenceString += name;

          if (this.options.table_sentence_includeAge) {
            let age = person.age;
            if (age) {
              sentenceString += " " + age;
            }
          }
        }
      } else {
        if (!skipping) {
          sentenceString += " ...";
        }
        skipping = true;
      }

      if (!skipping) {
        if (personIndex == this.personArray.length - 2) {
          // this is the punctuation before the final person
          if (lastPunctOpt == "comma" || lastPunctOpt == "commaAnd") {
            sentenceString += `,`;
          }
          if (lastPunctOpt == "and" || lastPunctOpt == "commaAnd") {
            sentenceString += ` and`;
          }
        } else if (personIndex == this.personArray.length - 1) {
          // this is the final person, no punctuation needed
        } else {
          sentenceString += `,`;
        }
      }
    }

    sentenceString += ".";

    return sentenceString;
  }

  getString() {
    let tableString = "";

    this.checkForColumnsToExclude();

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

  const gd = input.generalizedData;
  const options = input.options;

  markHouseholdMembersToIncludeInTable(gd, options);

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
    } else if (captionOption == "titlePlaceNoCountry") {
      useCollectionTitle = true;
      includeCountryInPlace = false;
    } else if (captionOption == "datePlace") {
      useCollectionTitle = false;
      includeCountryInPlace = true;
    } else if (captionOption == "datePlaceNoCountry") {
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
        } else {
          captionPart1 += gd.inferEventYear();
        }
      }
    } else {
      if (collection && collection.dates && collection.dates.exactDate) {
        captionPart1 = collection.dates.exactDate;
      } else {
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
    } else if (captionPart1) {
      builder.caption = captionPart1;
    } else if (captionPart2) {
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
  };

  return tableObject;
}

function markHouseholdMembersToIncludeInTable(generalizedData, options) {
  // Given generalized data with a household table, return an array of indices into the table.
  // This will include an index of -1 for rows that should be included as blank rows.
  if (!generalizedData) {
    return;
  }
  let members = generalizedData.householdArray;
  if (!members) {
    return;
  }

  let maxLimit = options.table_general_maxLimit;
  if (members.length <= maxLimit) {
    // normal case - include everything
    for (let member of members) {
      member.includeInTable = true;
    }
    return;
  }

  const relatedRelationships = [
    "head",
    "husband",
    "wife",
    // children
    "son",
    "daughter",
    // step children
    "stepdaughter",
    "stepson",
    "stepchild",
    // in-law children
    "daughter-in-law",
    "son-in-law",
    // grandchildren
    "grandchild",
    "granddaughter",
    "step-granddaughter",
    "grandson",
    "step-grandson",
    // parents
    "father",
    "mother",
    // in-law parents
    "father-in-law",
    "mother-in-law",
    // step parents
    "stepfather",
    "stepmother",
    // grandparents
    "grandfather",
    "grandmother",
    // siblings
    "brother",
    "sister",
    "brother-in-law",
    "half brother",
    "half sister",
    "sister-in-law",
    "stepbrother",
    "stepsister",
    // other family
    "aunt",
    "cousin",
    "great aunt",
    "great uncle",
    "niece",
    "nephew",

    "wife's daughter",
    "wife's mother",
    "wife's son",
  ];

  let selectedPersonRelationship = generalizedData.relationshipToHead;

  let numIncluded = 0;

  if (relatedRelationships.includes(selectedPersonRelationship)) {
    const limitStyle = options.table_general_limitStyleRelated;

    // go through once looking for relations
    let selectedMemberReached = false;
    let lastMemberAdded = undefined;
    for (let member of members) {
      if (relatedRelationships.includes(member.relationship)) {
        if (limitStyle == "related" || limitStyle == "relatedPlus" || numIncluded < maxLimit) {
          member.includeInTable = true;
          numIncluded++;
          lastMemberAdded = member;
          if (member.isSelected) {
            selectedMemberReached = true;
          }
        }
      }
    }

    if (!selectedMemberReached) {
      // remove the last member added and add selected member
      lastMemberAdded.includeInTable = false;
      for (let member of members) {
        if (member.isSelected) {
          member.includeInTable = true;
        }
      }
    }

    if ((limitStyle == "relatedPlus" || limitStyle == "relatedPlusCapped") && numIncluded < maxLimit) {
      // if there is space add non-related
      for (let member of members) {
        if (!relatedRelationships.includes(member.relationship)) {
          if (numIncluded < maxLimit) {
            member.includeInTable = true;
            numIncluded++;
          } else {
            break;
          }
        }
      }
    }
  } else {
    // selected member is not related, always include head (if present) and selected person
    let selectedPersonIndex = -1;
    for (let memberIndex = 0; memberIndex < members.length; memberIndex++) {
      let member = members[memberIndex];
      if (member.isSelected || member.relationship == "head") {
        member.includeInTable = true;
        numIncluded++;

        if (member.isSelected) {
          selectedPersonIndex = memberIndex;
        }
      }
    }

    const limitStyle = options.table_general_limitStyleUnrelated;

    if (limitStyle != "headSelected") {
      let startIndex = -1;
      let endIndex = -1;
      if (limitStyle == "headSelectedPlusTwo") {
        startIndex = selectedPersonIndex - 1;
        endIndex = selectedPersonIndex + 1;
      } else {
        const numToAddBefore = Math.floor((maxLimit - numIncluded) / 2);
        const numToAddAfter = maxLimit - numIncluded - numToAddBefore;
        startIndex = selectedPersonIndex - numToAddBefore;
        endIndex = selectedPersonIndex + numToAddAfter;
      }

      while (startIndex < 0 || members[startIndex].relationship == "head") {
        startIndex++;
        endIndex++;
      }

      while (endIndex > members.length - 1) {
        endIndex--;
        if (startIndex > 0) {
          startIndex--;
        }
      }

      for (let memberIndex = startIndex; memberIndex <= endIndex; memberIndex++) {
        let member = members[memberIndex];
        if (!member.isSelected && member.relationship != "head") {
          if (numIncluded < maxLimit) {
            member.includeInTable = true;
            numIncluded++;
          } else {
            break;
          }
        }
      }
    }
  }

  // There is really not much point in using a blank row to just exclude one person
  // since it takes up just as much space (in a table at least)
  // So go through and reinclude anyone like that (even though it will exceed limit)
  for (let memberIndex = 0; memberIndex < members.length; memberIndex++) {
    let member = members[memberIndex];
    if (!member.includeInTable) {
      // this member is not being included
      if (
        (memberIndex == 0 || members[memberIndex - 1].includeInTable) &&
        (memberIndex == members.length - 1 || members[memberIndex + 1].includeInTable)
      ) {
        member.includeInTable = true;
      }
    }
  }

  return;
}

export { buildHouseholdTable, TableBuilder, markHouseholdMembersToIncludeInTable };
