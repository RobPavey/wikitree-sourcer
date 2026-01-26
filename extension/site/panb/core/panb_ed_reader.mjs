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

import { RT } from "../../../base/core/record_type.mjs";
import { ExtractedDataReader } from "../../../base/core/extracted_data_reader.mjs";
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";

class PanbEdReader extends ExtractedDataReader {
  constructor(ed, primaryPersonIndex) {
    super(ed);

    this.primaryPersonIndex = primaryPersonIndex;
    this.recordData = this.ed.recordData;
    this.codeString = this.recordData["Code"];
    this.regNumberString = this.recordData["Number"];
    this.volumeString = this.recordData["Volume"];
    this.referenceString = this.recordData["Reference"];
    this.tableTitle = ed.tableTitle;		
    this.eventType = ed.eventType;
    this.databaseID = ed.databaseID;
    this.hasImage = ed.hasImage;
    this.imageURL = ed.imageURL;
  
    switch (this.eventType) {
      case "Birth":
        this.recordType = RT.BirthRegistration;
        break;
      case "Marriage":
        this.recordType = RT.MarriageRegistration;
        this.isMarriage = true;
        break;
      case "Death":
        this.recordType = RT.DeathRegistration;
        break;
      default:
        this.recordType = RT.Unclassified;
    }
 
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  isPrimaryTheSecond() {
    let result = false;
    if (this.primaryPersonIndex == 1) {
      result = true;
    }
    return result;
  }

  toLeadingCase(inputName) {
    const words = (inputName.toLowerCase())
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1));
    const reCasedWord = words.join(" ");
    return reCasedWord;
	}

  // PANB index names are stored as "Last, First" so we need to reformat them to "First Last" as well as removing any "-----" place holders
 	reformatName(inputName) {
	  const [last, first] = inputName.split(",");
	  if (!last || !first) {
      return inputName;
    }
	  const words = (first.trim() + " " + last.trim())
      .replaceAll("-----", "")
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1));
    const reformatedName = words.join(" ");
	  return reformatedName;
	};
 
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  hasValidData() {
    if (!this.ed.success) {
      return false; //the extract failed, GeneralizedData is not even normally called in this case
    }
    return true;
  }

  getUrl() {
    return this.ed.url;
  } 

  getSourceType() {
    return "record";
  }

   getRecordType() {
	  return this.recordType;
  }
  
  getTableTitle() {
	  return this.tableTitle;
  }
  
  getDatabaseID() {
	  return this.databaseID;
  }

  getHasImage() {
    return this.hasImage;
  }

  // PANB marriage index records can have bride or groom fullName in the "Name" field. The index name is always the alphabetically first of the two surnames.
  getRecordedIndexedName() {
  // This routine is only called from getGroomsName and getBridesName
    let tempString = this.recordData["Name"];  
    if ( !tempString ) {
      return undefined;
    }
    let indexNameString = this.reformatName(tempString);
    let indexNameFullString = this.toLeadingCase(indexNameString);

    // we need gender to determine bothbride and groom names
    // if gender was not recorded then we must infer it
    let recordedGender = this.recordData["Sex"];
    let primaryGender = "";
    if (recordedGender == "") {
      let firstName = indexNameFullString.trim().split(" ")[0];
      primaryGender = NameUtils.predictGenderFromGivenNames(firstName);
      if (primaryGender == "male") {
        this.recordData["Sex"] = "M";
      }
      else if (primaryGender == "female") {
        this.recordData["Sex"] = "F";
      }

      // we must always test the secondary name in case of gender duplication
      tempString = this.recordData["Married"];  
      if (tempString) { 
        let spouseNameString = this.reformatName(tempString);
        let spouseFullNameString = this.toLeadingCase(spouseNameString);
        firstName = spouseFullNameString.trim().split(" ")[0];
        let secondaryGender = NameUtils.predictGenderFromGivenNames(firstName);
        if (primaryGender == "") {
          if (secondaryGender == "male") {
            this.recordData["Sex"] = "F";
          }
          else if (secondaryGender == "female") {
            this.recordData["Sex"] = "M";
          }
        } 
        // if both names predicted the same gender then we must treat it as gender unknown
        if (secondaryGender == primaryGender) {
          this.recordData["Sex"] = "";
        }
      }
    }   
    // if we still can't determine gender we leave it blank as unknown
    return indexNameFullString;
  }
   
  getRecordedSpouseName() {
  // This routine is only called from getGroomsName and getBridesName
  // Only PANB marriage index records have a spouse name field
    let tempString = this.recordData["Married"];  
    if ( !tempString ) {
      return undefined;
    }
    let spouseFullString = this.reformatName(tempString);
    let spouseNameString = this.toLeadingCase(spouseFullString);
    return spouseNameString;
  }

  getGroomsName() {
    if ( this.recordType != RT.MarriageRegistration ) {
      return "";
    }
    // It is important to get the primary name first
    let namePrimary = this.getRecordedIndexedName();
    let nameSecondary = this.getRecordedSpouseName();
   
    // we use recorded gender to determine bride and groom names
    let recordedGender = this.recordData["Sex"];
    if (recordedGender == "F") {
      return nameSecondary;
    }
    else {
      // if we dont know gender we assume the marriage record had the groom's name first
      return namePrimary;
    }
    return
  }
  
  getBridesName() {
    if ( this.recordType != RT.MarriageRegistration ) {
      return "";
    }
    // It is important to get the primary name first
    let namePrimary = this.getRecordedIndexedName();
    let nameSecondary = this.getRecordedSpouseName();

    // if gender was recorded then we use that to determine both bride and groom names
    let recordedGender = this.recordData["Sex"];
    if (recordedGender == "F") {
      return namePrimary;
    }
    else {
      // if we decided the indexedd name was male or if we dont know gender we assume the marriage record had the groom's name first and we will be right about half the time
      return nameSecondary;
    }
  return;
 }
	  
  getNameObj() {
    if ( this.recordType == RT.MarriageRegistration ) {
    // Marriage case handles drop-down control for picking the spouse to be the principle personshown on the citation
      let groomName = this.getGroomsName();
      let brideName = this.getBridesName();      
      if (this.isPrimaryTheSecond()) {
        if (brideName != "") {
          return this.makeNameObjFromFullName(brideName);
        }
        else {
           return undefined;          
        }  
      }
      else {
        if (groomName != "") {
          return this.makeNameObjFromFullName(groomName);
        }
        else {
           return undefined;          
        }
      } 
    }
    else {
    // PANB Birth and Death index records have only one name shown
      let tempNameString = this.recordData["Name"];
      if (!tempNameString) {
        return undefined;
      }
      let tempString = this.reformatName(tempNameString);
      tempNameString = this.toLeadingCase(tempString);
      return this.makeNameObjFromFullName(tempNameString);
    }
  }

  getGender() {
    if (this.recordType == RT.MarriageRegistration ) {
      if (this.isPrimaryTheSecond()) {
        return "female";
      }
      else {
        return "male";
      }
    }
    else {
      let recordedGender = this.recordData["Sex"];
      if (recordedGender == "M") {
        return "male";
      }
      else if ( recordedGender == "F") {
        return "female";
      }

      // if gender is not defined we will use prediction routine
      let firstName = this.getNameObj().name.split(" ")[0];
      return NameUtils.predictGenderFromGivenNames(firstName);
    }
  }

  getEventDateObj() {
    if ( this.ed.databaseID == "RS141C6") {
      let tempString = this.recordData["Date of Death"];
      return this.makeDateObjFromDateString(tempString);
    }

    let dateString = this.recordData["Date"];
	  if (!dateString) {
		  return undefined;
	  }
	  else {
		  return this.makeDateObjFromDateString(dateString);
	  }
  }

  getParish() {
  	let parishString = this.recordData["Parish"];
    if (!parishString) {
      return "";
    }
    else {
      return this.toLeadingCase(parishString);
    }
  }

  getCounty() {
  	let countyString = this.recordData["County"];
    if (!countyString) {
      return "";
    }
    else {
      return this.toLeadingCase(countyString);
    }
  }

  getEventPlaceObj() {
    let placeString = "";
    if (this.ed.eventType == "Birth" || this.ed.databaseID == "RS141C1") {
      let tempString = this.recordData["Place"];
      placeString = this.toLeadingCase(tempString) + ", ";
    }
    else if (this.ed.eventType == "Marriage" ) {
      let tempString = this.recordData["Parish"];
      if (tempString && tempString.slice(0,1) != "-") {
        placeString = this.toLeadingCase(tempString) + ", ";
      }
    }
    else if ( this.ed.databaseID == "RS141C6") {
      let tempString = this.recordData["Killed"];
      placeString = "service in " + this.toLeadingCase(tempString);
      return this.makePlaceObjFromFullPlaceName(placeString);
    }
    let countyString = "";
    if (this.ed.databaseID == "RS141C1") {
      countyString = this.recordData["County of Death"];
    }
    else {
      countyString = this.recordData["County"];
    }
    if (!countyString) {
        return undefined;
    }
    else {
      let countryString = ", New Brunswick, Canada";
      if ( DateUtils.compareDateStrings( "1867-07-01", this.recordData["Date"] ) > 0 ) {
        countryString = ", New Brunswick Colony";
      }
      placeString += this.toLeadingCase(countyString) + countryString;
      let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
      return placeObj;
    }
  }

  getLastNameAtBirth() {
    return "";
  }

  getLastNameAtDeath() {
    return ""; 
  }

  getBirthDateObj() {
    return undefined;
  }

  getBirthPlaceObj() {
    if ( this.ed.databaseID != "RS141C1" ) {
      return undefined;
    }
    let tempString = this.recordData["Place of Birth"];
    if (!tempString) {
      return undefined;
    }
    else if (tempString != "" && tempString != "-----" ) {
      let placeString = this.toLeadingCase(tempString) + ", ";
      let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
      return placeObj;
    }
    else {
      return undefined;
    }
  }

  getDeathDateObj() {
    return undefined;
  }

  getDeathPlaceObj() {
    if (  this.ed.databaseID == "RS141C6" ) {
      return undefined;
    }
    let deathPlaceObj = this.getEventPlaceObj();
    return this.deathPlaceObj;
  }

  getAgeAtEvent() {
    let age = this.recordData["Age"];
    if (age && !isNaN(age)) {
      return age;
    }
    else {
      return "";
    }
 }

  getAgeAtDeath() {
    if (this.ed.databaseID == "RS141C4" || this.ed.databaseID == "RS141C1" || this.ed.databaseID == "RS141C6") {
      return this.getAgeAtEvent();
    }
    else {
      return "";
    }

  }

  getRegistrationDistrict() {
    return this.getCounty();
  }

  getRegistration() {
  	let tempString = this.recordData["Registration"];
    if (tempString) {
      return tempString;
    }
    else return "";
  }

  getReference() {
  	let tempString = this.recordData["Reference"];
    if (tempString) {
      return tempString;
    }
    else return "";
  }

  getVolume() {
  	let tempString = this.recordData["Volume"];
    if (tempString) {
      return tempString;
    }
    else return "";
  }

  getCode() {
  	let codeString = this.recordData["Code"];
    if (codeString) {
      return this.codeString;
    }
    else return "";
  }

  getNumber() {
  	const numberString = this.recordData["Number"];
    if (numberString) {
      return this.numberString;
    }
    else return "";
  }

  getMicrofilm() {
  	let tempString = this.recordData["Microfilm"];
    if (tempString) {
	    //Check for empty field as some records are not on microfilm
      if (tempString != "-----") {
        return tempString;	
      }
    }
    return "";
  }

  getRelationshipToHead() {
    return "";
  }

  getMaritalStatus() {
    return "";
  }

  getOccupation() {
    return "";
  }

 
  getSpouses() {    
    if (this.recordType == RT.MarriageRegistration) {
      let spouseFullName = this.getBridesName();
      if (this.isPrimaryTheSecond()) {
        spouseFullName = this.getGroomsName();
      } 
      let spouseNameObj = this.makeNameObjFromFullName(spouseFullName);
      if (spouseNameObj) {
        let spouse = { name: spouseNameObj };
        spouse.personGender = "female";
        if (this.isPrimaryTheSecond()) {
          spouse.personGender = "male";
        }
        let marriageDateObj = this.getEventDateObj();
        if (marriageDateObj) {
          spouse.marriageDate = marriageDateObj;
        }
        let marriagePlaceObj = this.getEventPlaceObj();
        if (marriagePlaceObj) {   
          spouse.marriagePlace = marriagePlaceObj;
        }
        return [spouse];
      }
    }
    return undefined;
  }
 
  getMothersName() {
    let tempString = this.recordData["Mother"];
    if ( !tempString ) {
      return "";
    }
    // Some PANB birth index records have a comma in the mother field to indicate no name given
    if ( tempString == ",") {
      return "";
    }
    let mothersName = this.reformatName(tempString);
    return this.toLeadingCase(mothersName);
  }

  getFathersName() {
    let tempString = this.recordData["Father"];
    if ( !tempString ) {
      return "";
    }
    // Some PANB birth index records have a comma in the mother field to indicate no name given
    if ( tempString == ",") {
      return "";
    }
    let fathersName = this.reformatName(tempString);
    return this.toLeadingCase(fathersName);
  }

  getParents() {
    // We assume at least one parent is present
	  let fatherName = this.getFathersName();
		let motherName = this.getMothersName();
    return this.makeParentsFromFullNames(fatherName, motherName);
  }
  
  getPrimaryPersonOptions() {
    if (this.recordType == RT.MarriageRegistration ) {
      let groomName = this.getGroomsName();
      let brideName = this.getBridesName();
      if (groomName && brideName) {
        let options = [groomName + " (groom)", brideName + " (bride)"];
        if (this.recordData["Sex"] == "") {
          options = [groomName, brideName];
        }
        return options;
      }
    }
    return undefined;
  }

  getHousehold() {
    return undefined;
  }

  getCollectionData() {
    return undefined;
  }
}

export { PanbEdReader };
