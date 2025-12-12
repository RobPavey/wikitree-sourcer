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

import { simpleBuildCitationWrapper } from "../../../base/core/citation_builder.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";

function buildEcppUrl(ed, builder) {
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle += "The Early California Population Project. Edition 1.1";
}

function buildSourceReference(ed, gd, builder) {
  builder.sourceReference =
    "General Editor, Steven W. Hackel, Lead Compiler, Anne M. Reid. (The University of California, Riverside, and the Henry E. Huntington Library, San Marino, California, 2022.)";
}

function buildRecordLink(ed, gd, builder) {
  var ecppUrl = buildEcppUrl(ed, builder);

  let linkText = "ECPP Record";
  if (gd.recordType == RT.Baptism) {
    linkText = "ECPP Baptism Record";
  } else if (gd.recordType == RT.Marriage) {
    linkText = "ECPP Marriage Record";
  } else if (gd.recordType == RT.Burial) {
    linkText = "ECPP Burial Record";
  }

  let recordLink = "[" + ecppUrl + " " + linkText + "]";
  builder.recordLinkOrTemplate = recordLink;
}

function removeUnwantedKeysForDataString(keys, recordData) {
  const exactMatchesToExclude = [
    "Type",
    "Link Basis",
    "Sac Memo",
    "Penitencia",
    "Eucaristia",
    "Ex Uncion",
    "Officiant",
    "Recorder",
  ];
  function isKeyWanted(key) {
    for (let match of exactMatchesToExclude) {
      if (match == key) {
        return false;
      }
    }

    return true;
  }

  let newKeys = [];

  for (let key of keys) {
    if (isKeyWanted(key)) {
      newKeys.push(key);
    }
  }

  return newKeys;
}

function buildFlatDataList(ed, gd, builder) {
  // convert section fields and section listItems into standard record data
  let recordData = {};

  for (let sectionKey of Object.keys(ed.sections)) {
    let section = ed.sections[sectionKey];
    if (section.fields) {
      for (let key of Object.keys(section.fields)) {
        let field = section.fields[key];
        let label = field.label;
        let value = field.value;
        if (label && value) {
          if (key.endsWith("date-alt")) {
            continue;
          }

          if (StringUtils.isAllLowercase(label)) {
            label = StringUtils.toInitialCapsEachWord(label);
          }
          if (label.startsWith("Ego's ")) {
            label = label.substring(6);
          }

          label = label.replace("Ethnicitiy", "Ethnicity");

          if (key.startsWith("f_") && !label.startsWith("Father")) {
            label = "Father's " + label;
          } else if (key.startsWith("m_") && !label.startsWith("Mother")) {
            label = "Mother's " + label;
          } else if (key.startsWith("groom_") && !label.startsWith("Groom")) {
            label = "Groom's " + label;
          } else if (key.startsWith("bride_") && !label.startsWith("Bride")) {
            label = "Bride's " + label;
          } else if (key.startsWith("gf_") && !label.startsWith("Groom")) {
            label = "Groom's Father's " + label;
          } else if (key.startsWith("gm_") && !label.startsWith("Groom")) {
            label = "Groom's Mother's " + label;
          } else if (key.startsWith("bf_") && !label.startsWith("Bride")) {
            label = "Bride's Father's " + label;
          } else if (key.startsWith("bm_") && !label.startsWith("Bride")) {
            label = "Bride's Mother's " + label;
          }

          if (key.includes("Checkbox")) {
            if (value == "on") {
              value = "Yes";
            } else if (value == "off") {
              value = "No";
            }
          }

          recordData[label] = value;
        }
      }
    }
  }

  // Add lists from sections
  if (ed.sections) {
    if (ed.sections.godparents) {
      let list = ed.sections.godparents.listItems;
      if (list) {
        let text = "";
        if (list[0]) {
          text = list[0];
        }
        if (list[1]) {
          text += " and " + list[1];
        }
        if (text) {
          recordData["Godparents"] = text;
        }
      }
    }
    if (ed.sections.relatives) {
      let list = ed.sections.relatives.listItems;
      if (list) {
        let text = "";
        for (let item of list) {
          if (item) {
            if (text) {
              text += ", ";
            }
            text += item;
          }
        }
        if (text) {
          recordData["Relatives"] = text;
        }
      }
    }
  }

  let dataString = builder.buildDataList(recordData, removeUnwantedKeysForDataString);
  builder.dataString = dataString;
}

function buildStructuredDataList(ed, gd, builder) {
  // convert section fields and section listItems into a structured list
  let dataString = "";
  let startedSectionName = "";

  function startDataStringSection(sectionName) {
    if (dataString) {
      dataString += "<br/>\n";
    }
    dataString += "'''" + sectionName + "''':";
  }

  function addDataStringFieldTerm(label, value, id, sectionName) {
    const idsToExclude = [];

    const labelsToExclude = [
      "MM/DD/YYYY",
      "Link MMIS",
      "Link MBAP",
      "MBASIS",
      "Type",
      "Death Link Basis",
      "Link Basis",
      "Penitencia",
      "Eucaristia",
      "Ex Uncion",
    ];

    const labelMap = {
      Ethnicitiy: "Ethnicity",
    };

    if (label && value) {
      // check for ones we want to exclude
      if (labelsToExclude.includes(label)) {
        return;
      }

      if (StringUtils.isAllLowercase(label)) {
        label = StringUtils.toInitialCapsEachWord(label);
      }

      if (label.startsWith("Ego's ")) {
        label = label.substring(6);
      }

      if (id.includes("Checkbox")) {
        if (value == "on") {
          value = "Yes";
        } else if (value == "off") {
          value = "No";
        }
      }

      let newLabel = labelMap[label];
      if (newLabel) {
        label = newLabel;
      }

      if (sectionName != startedSectionName) {
        startDataStringSection(sectionName);
        startedSectionName = sectionName;
      }

      dataString += " " + label + ": " + value + ";";
    }
  }

  function addDataStringListTerm(value) {
    let lastChar = dataString[dataString.length - 1];
    if (lastChar != ":") {
      dataString += ",";
    }
    dataString += " " + value;
  }

  function getSectionName(gd, sectionKey, fieldId = "") {
    if (gd.recordType == RT.Baptism) {
      const idMap = {
        baptismalData: "Baptism Data",
        parents: "Parents",
        godparents: "Godparents",
        relatives: "Relatives",
        miscellaneous: "Miscellaneous",
      };
      if (sectionKey == "parents") {
        if (fieldId) {
          if (fieldId.startsWith("f_")) {
            return "Father's Data";
          } else if (fieldId.startsWith("m_")) {
            return "Mother's Data";
          }
        }
      }
      return idMap[sectionKey];
    } else if (gd.recordType == RT.Burial) {
      const idMap = {
        burialData: "Burial Data",
        parents: "Spouse Data",
        godparents: "Parents",
        relatives: "Relatives",
        miscellaneous: "Miscellaneous",
      };
      if (sectionKey == "godparents") {
        if (fieldId) {
          if (fieldId.startsWith("f_")) {
            return "Father's Data";
          } else if (fieldId.startsWith("m_")) {
            return "Mother's Data";
          }
        }
      }
      return idMap[sectionKey];
    } else if (gd.recordType == RT.Marriage) {
      const idMap = {
        main: "Marriage Data",
        baptismalData: "Groom's Data",
        parents: "Groom's Parents Data",
        godparents: "Bride's Data",
        relatives: "Bride's Parents Data",
        witnesses: "Witnesses",
        miscellaneous: "Miscellaneous",
      };
      if (sectionKey == "parents") {
        if (fieldId) {
          if (fieldId.startsWith("gf_")) {
            return "Groom's Father's Data";
          } else if (fieldId.startsWith("gm_")) {
            return "Groom's Mother's Data";
          }
        }
      } else if (sectionKey == "relatives") {
        if (fieldId) {
          if (fieldId.startsWith("bf_")) {
            return "Bride's Father's Data";
          } else if (fieldId.startsWith("bm_")) {
            return "Bride's Mother's Data";
          }
        }
      } else {
        if (sectionKey == "baptismalData") {
          if (fieldId) {
            if (fieldId.startsWith("prev-wife_")) {
              return "Previous Wife's Data";
            }
          }
        } else if (sectionKey == "godparents") {
          if (fieldId) {
            if (fieldId.startsWith("prev-husband-")) {
              return "Previous Husbands's Data";
            }
          }
        }
      }
      return idMap[sectionKey];
    }
  }

  for (let sectionKey of Object.keys(ed.sections)) {
    let section = ed.sections[sectionKey];
    let sectionName = sectionKey;
    if (section.fields) {
      let keys = Object.keys(section.fields);
      if (keys.length > 0) {
        for (let key of keys) {
          let newSectionName = getSectionName(gd, sectionKey, key);
          if (newSectionName) {
            sectionName = newSectionName;
          }

          let field = section.fields[key];
          let label = field.label;
          let value = field.value;

          addDataStringFieldTerm(label, value, key, sectionName);
        }
      }
    }
    if (section.listItems) {
      let list = section.listItems;
      if (list && list.length > 0) {
        let newSectionName = getSectionName(gd, sectionKey);
        if (newSectionName) {
          sectionName = newSectionName;
        }

        if (sectionName != startedSectionName) {
          startDataStringSection(sectionName);
          startedSectionName = sectionName;
        }

        for (let listItem of list) {
          addDataStringListTerm(listItem);
        }
      }
    }
  }

  builder.dataString = dataString;
}

function addAdditionalData(ed, gd, builder) {
  let dataStyle = builder.options.citation_ecpp_dataStyle;

  if (dataStyle == "stdSentence") {
    builder.addStandardDataString(gd);
  } else if (dataStyle == "flatList") {
    buildFlatDataList(ed, gd, builder);
  } else if (dataStyle == "structuredList") {
    buildStructuredDataList(ed, gd, builder);
  }
}

function addSourceAndRepositoryData(ed, gd, builder) {
  let sections = ed.sections;

  function getFieldValue(id) {
    if (sections) {
      for (let sectionKey of Object.keys(sections)) {
        let section = sections[sectionKey];
        let fields = section.fields;
        if (fields) {
          let field = fields[id];
          if (field) {
            return field.value;
          }
        }
      }
    }
  }

  let mission = getFieldValue("mission");
  let number = getFieldValue("number");
  let referenceString = mission + " " + number;
  builder.referenceWithinRepository = referenceString;

  if (builder.sourceReference) {
  }

  // Note that this sourceNameWithinRepository when added to the repositoryName
  // in site data with " at " in between has to be less than 55 chars of the match will fail
  // Because of truncation/ e.g.:
  // Baptisms (Mission SFD) at Early California Po...Project

  if (gd.recordType == RT.Baptism) {
    builder.sourceNameWithinRepository = "Baptisms";
  } else if (gd.recordType == RT.Marriage) {
    builder.sourceNameWithinRepository = "Marriages";
  } else if (gd.recordType == RT.Burial) {
    builder.sourceNameWithinRepository = "Burials";
  }
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  addAdditionalData(ed, gd, builder);

  addSourceAndRepositoryData(ed, gd, builder);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
