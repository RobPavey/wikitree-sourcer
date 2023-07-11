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

import { GeneralizedData, dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";

import { OpccornEdReader } from "./opccorn_ed_reader.mjs";

function commonGeneralizeData(input, result) {
  function setField(key, value) {
    if (value) {
      result[key] = value;
    }
  }

  let edReader = input.edReader;

  result.recordType = edReader.recordType;
  setField("recordSubtype", edReader.recordSubtype);

  setField("name", edReader.getNameObj());
  setField("personGender", edReader.getGender());

  setField("eventDate", edReader.getEventDateObj());
  setField("eventPlace", edReader.getEventPlaceObj());

  setField("lastNameAtBirth", edReader.getLastNameAtBirth());
  setField("lastNameAtDeath", edReader.getLastNameAtDeath());

  setField("mothersMaidenName", edReader.getMothersMaidenName());

  setField("ageAtDeath", edReader.getAgeAtDeath());
  setField("ageAtEvent", edReader.getAgeAtEvent());
  setField("birthDate", edReader.getBirthDateObj());
  setField("deathDate", edReader.getDeathDateObj());

  result.addSpouseObj(edReader.getSpouseObj(result.eventDate, result.eventPlace));

  setField("parents", edReader.getParents());

  result.hasValidData = true;
}

// This function generalizes the data (ed) extracted from the web page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeData(input) {
  let ed = input.extractedData;

  let result = new GeneralizedData();
  result.sourceOfData = "opccorn";

  if (!ed.success) {
    return result; // the extract failed
  }

  result.sourceType = "record";

  let edReader = new OpccornEdReader(ed);

  input.edReader = edReader;

  commonGeneralizeData(input, result);

  //console.log("opccorn; generalizeData: result is:");
  //console.log(result);

  return result;
}

export { generalizeData, GeneralizedData, dateQualifiers };
