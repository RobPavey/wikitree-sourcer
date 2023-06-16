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
import { WTS_Date } from "../../../base/core/wts_date.mjs";
import { WTS_String } from "../../../base/core/wts_string.mjs";
import { RT } from "../../../base/core/record_type.mjs";

// This function generalizes the data (ed) extracted from the web page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeData(input) {
  let ed = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "psuk";

  if (!ed.success) {
    return result; // the extract failed
  }

  result.sourceType = "record";
  result.recordType = RT.Probate;

  result.siteData = {};

  if (ed.digitalRecordData) {
    // This is a digital result
    let lastName = WTS_String.toInitialCapsEachWord(ed.digitalRecordData["Last name"]);
    let forenames = WTS_String.toInitialCapsEachWord(ed.digitalRecordData["First name"]);
    result.setLastNameAndForeNames(lastName, forenames);

    result.setDeathDate(ed.digitalRecordData["Date of death"]);
    result.setEventDate(ed.digitalRecordData["Date of probate"]);
    result.setEventPlace(ed.digitalRecordData["Registry office"]);

    function addSiteField(recordDataField, siteField) {
      if (ed.digitalRecordData[recordDataField]) {
        result.siteData[siteField] = ed.digitalRecordData[recordDataField];
      }
    }

    addSiteField("Probate number", "probateNumber");
    addSiteField("Document type", "entryType");
    addSiteField("Regiment number", "regimentNumber");
  } else {
    let lastName = ed.searchData["Last name"];
    let forenames = ed.searchData["First name (Optional)"];
    result.setLastNameAndForeNames(lastName, forenames);

    function buildDate(year, month, day) {
      return WTS_Date.getDateStringFromYearMonthDay(year, month, day);
    }

    let deathYear = ed.searchData["Year of death"];
    let deathMonth = ed.searchData["Month of death (Optional)"];
    let deathDay = ed.searchData["Day of death (Optional)"];
    result.setDeathDate(buildDate(deathYear, deathMonth, deathDay));

    let probateYear = ed.searchData["Year of probate (Optional)"];
    let probateMonth = ed.searchData["Month of probate (Optional)"];
    let probateDay = ed.searchData["Day of probate (Optional)"];
    result.setEventDate(buildDate(probateYear, probateMonth, probateDay));
  }

  result.hasValidData = true;

  //console.log("psuk; generalizeData: result is:");
  //console.log(result);

  return result;
}

function regeneralizeData(input) {
  // This is only used when viewing an image
  let ed = input.extractedData;
  let result = input.generalizedData;
  let newData = input.newData;

  result.recordType = RT.Probate;

  result.setLastNameAndForeNames(newData.lastName, newData.forenames);

  result.setDeathDate(newData.deathDate);
  result.setDeathPlace(newData.deathPlace);

  result.setResidencePlace(newData.residence);

  result.setEventDate(newData.probateDate);
  result.setEventPlace(newData.probateRegistry);

  result.setPersonGender(newData.gender);

  function addSiteField(newDataField, siteField) {
    if (newData[newDataField]) {
      result.siteData[siteField] = newData[newDataField];
    }
  }

  addSiteField("status", "status");
  addSiteField("entryType", "entryType");
  addSiteField("grantedTo", "grantedTo");
  addSiteField("effects", "effects");
  addSiteField("page", "page");
}

function getRequestedUserInput(input) {
  let ed = input.extractedData;
  let citationType = input.type;
  let options = input.options;
  let result = input.generalizedData;
  let newData = input.newData;

  let isNarrative = citationType == "narrative";
  let dataStyle = options.citation_psuk_dataStyle;

  let isSimpleData = dataStyle == "string" || dataStyle == "none";
  let noNarrativeOrData = !isNarrative && dataStyle == "none";

  if (!newData || !newData.recordType) {
    newData = {};
    newData.entryType = "probate";
    newData.forenames = result.inferForenames();
    newData.lastName = result.inferLastName();
    newData.deathDate = result.inferDeathDate();
    newData.probateDate = result.inferEventDate();
  }

  let requestedUserInput = {
    resultData: newData,
    fields: [
      {
        id: "topLabel",
        type: "label",
        label: "Add transcribed data (* indicates required field)",
      },
      {
        id: "lastName",
        type: "textInput",
        label: "Last name * : ",
        property: "lastName",
        hidden: noNarrativeOrData,
      },
      {
        id: "forenames",
        type: "textInput",
        label: "Forenames * : ",
        property: "forenames",
        hidden: noNarrativeOrData,
      },
      {
        id: "gender",
        type: "select",
        label: "Gender: ",
        property: "gender",
        options: [
          { value: "", text: "Unknown" },
          { value: "male", text: "Male" },
          { value: "female", text: "Female" },
        ],
        defaultValue: "",
        hidden: !isNarrative,
      },
      {
        id: "residence",
        type: "textInput",
        label: "Residence: ",
        comment: "(add comma's between parts)",
        property: "residence",
        hidden: isSimpleData,
      },
      {
        id: "status",
        type: "textInput",
        label: "Status: ",
        comment: "(e.g. widow or wife of ...)",
        property: "status",
        hidden: isSimpleData,
      },
      {
        id: "deathDate",
        type: "textInput",
        label: "Death date * : ",
        property: "deathDate",
        hidden: noNarrativeOrData,
      },
      {
        id: "deathPlace",
        type: "textInput",
        label: "Death place: ",
        comment: "(add comma's between parts)",
        property: "deathPlace",
        hidden: noNarrativeOrData,
      },
      {
        id: "entryType",
        type: "select",
        label: "Choose entry type",
        property: "entryType",
        options: [
          { value: "Probate", text: "Probate" },
          { value: "Administration", text: "Administration" },
          { value: "Administration (with Will)", text: "Administration (with Will)" },
          { value: "Confirmation", text: "AdministConfirmationation" },
        ],
        defaultValue: "probate",
        hidden: isSimpleData,
      },
      {
        id: "probateRegistry",
        type: "textInput",
        label: "Probate registry: ",
        property: "probateRegistry",
        hidden: noNarrativeOrData,
      },
      {
        id: "probateDate",
        type: "textInput",
        label: "Probate date * : ",
        property: "probateDate",
      },
      {
        id: "grantedTo",
        type: "textInput",
        label: "Granted to: ",
        comment: "(include all and their relationship)",
        property: "grantedTo",
        hidden: isSimpleData,
      },
      {
        id: "effects",
        type: "textInput",
        label: "Effects (£): ",
        property: "effects",
        hidden: isSimpleData,
      },
      {
        id: "page",
        type: "textInput",
        label: "Page number: ",
        comment: "(at bottom of image)",
        property: "page",
      },
    ],
  };

  return requestedUserInput;
}

export { generalizeData, regeneralizeData, getRequestedUserInput, GeneralizedData, dateQualifiers };
