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

import { GeneralizedData, GD } from "./generalize_data_utils.mjs";

function commonGeneralizeData(sourceOfData, edReader) {
  let result = new GeneralizedData();

  function setField(key, value) {
    if (value) {
      result[key] = value;
    }
  }

  function setStandardizedField(key, value, standarizeFunction) {
    if (value) {
      result[key] = standarizeFunction(value);
    }
  }

  if (!edReader.hasValidData()) {
    return result;
  }

  result.sourceOfData = sourceOfData;
  result.sourceType = edReader.getSourceType();

  setField("recordType", edReader.recordType);
  setField("recordSubtype", edReader.recordSubtype);

  setField("name", edReader.getNameObj());
  setStandardizedField("personGender", edReader.getGender(), GD.standardizeGender);

  setField("eventDate", edReader.getEventDateObj());
  setField("eventPlace", edReader.getEventPlaceObj());

  setField("lastNameAtBirth", edReader.getLastNameAtBirth());
  setField("lastNameAtDeath", edReader.getLastNameAtDeath());

  setField("mothersMaidenName", edReader.getMothersMaidenName());

  setField("birthDate", edReader.getBirthDateObj());
  setField("birthPlace", edReader.getBirthPlaceObj());

  setField("deathDate", edReader.getDeathDateObj());
  setField("deathPlace", edReader.getDeathPlaceObj());

  setField("ageAtEvent", edReader.getAgeAtEvent());
  setField("ageAtDeath", edReader.getAgeAtDeath());

  setField("registrationDistrict", edReader.getRegistrationDistrict());

  setStandardizedField("relationshipToHead", edReader.getRelationshipToHead(), GD.standardizeRelationshipToHead);
  setStandardizedField("maritalStatus", edReader.getMaritalStatus(), GD.standardizeMaritalStatus);
  setStandardizedField("occupation", edReader.getOccupation(), GD.standardizeOccupation);

  // military fields
  setField("unit", edReader.getUnit());
  setField("rank", edReader.getRank());
  setField("serviceNumber", edReader.getServiceNumber());
  setField("militaryBranch", edReader.getMilitaryBranch());
  setField("militaryRegiment", edReader.getMilitaryRegiment());

  setField("spouses", edReader.getSpouses());
  setField("parents", edReader.getParents());

  result.setHousehold(edReader.getHousehold());
  // We can also determine parents and spouse from household table in some cases
  result.addSpouseOrParentsForSelectedHouseholdMember();

  setField("collectionData", edReader.getCollectionData());

  edReader.setCustomFields(result);

  result.hasValidData = true;

  return result;
}

export { commonGeneralizeData };
