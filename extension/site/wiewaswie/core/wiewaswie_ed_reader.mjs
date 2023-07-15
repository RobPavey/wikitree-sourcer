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

import { RT } from "../../../base/core/record_type.mjs";
import { ExtractedDataReader } from "../../../base/core/extracted_data_reader.mjs";

// Document types
// BS Overlijden - BS Death (Death certificates)
// BS Geboorte - BS Birth (Birth certificates)
// BS Huwelijk - BS Marriage (Marriage certificates)
//
// DTB Dopen - DTB Baptism (Baptismal registers)
// DTB Trouwen - DTB Marriage (Marriage registers)
// DTB Begraven - DTB Buried (Burial registers)
// DTB Overig (Church membership register)
//
// Bevolkingsregister - Population register
// Militairen - Military (Military sources)
// Tweede Wereldoorlog (World War II)
// Misdaad en straf - Crime and punishment
// Vestiging en vertrek - Settlement and departure (Migration)

// Familieadvertenties - Family announcements
// Memories van Successie - Memories of Succession (Memories of succession)

// Fiscaal en financieel - Fiscal and financial (Tax and financial records)
// Beroep en bedrijf - Profession and business (Profession and company)
// Onroerend goed (Real estate)
// Notariële archieven - Notarial archives
// Rechterlijke archieven - Court records (Court registers)

// Bidprentjes - Prayer cards (Faire-parts)
// Sociale zorg (Social care)
// Slavernijbronnen - Slavery Resources (Slavery records)
// Instellingsregister - Settings register [Institutional register]
// VOC Opvarenden - VOC Passengers [United East India Company Passengers] or Dutch East India Company

// Collecties - Collections (Miscellaneous collections)

class WiewaswieEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    // determine document type, event type and hence record type
    this.documentType = this.extractSourceFieldByDataKey("DocumentType");
    this.eventType = this.extractEventFieldByDataKey("Event");

    if (this.documentType) {
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  extractSourceFieldByDataKey(lastPartOfDataKey) {
    const dataKey = "SourceDetail." + lastPartOfDataKey;
    for (let field of this.ed.sourceList) {
      if (field.dataKey == dataKey) {
        return field.value;
      }
    }
  }

  extractEventFieldByDataKey(lastPartOfDataKey) {
    const dataKey = "SourceDetail." + lastPartOfDataKey;
    for (let field of this.ed.eventList) {
      if (field.dataKey == dataKey) {
        return field.value;
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  hasValidData() {
    if (!this.ed.success) {
      return false; //the extract failed, GeneralizedData is not even normally called in this case
    }

    if (!this.documentType) {
      return false;
    }

    return true;
  }

  getSourceType() {
    return "record";
  }

  getNameObj() {
    return undefined;
  }

  getGender() {
    return "";
  }

  getEventDateObj() {
    return undefined;
  }

  getEventPlaceObj() {
    return undefined;
  }

  getLastNameAtBirth() {
    return "";
  }

  getLastNameAtDeath() {
    return "";
  }

  getMothersMaidenName() {
    return "";
  }

  getBirthDateObj() {
    return undefined;
  }

  getBirthPlaceObj() {
    return undefined;
  }

  getDeathDateObj() {
    return undefined;
  }

  getDeathPlaceObj() {
    return undefined;
  }

  getAgeAtEvent() {
    return "";
  }

  getAgeAtDeath() {
    return "";
  }

  getRegistrationDistrict() {
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

  getSpouseObj(eventDateObj, eventPlaceObj) {
    return undefined;
  }

  getParents() {
    return undefined;
  }

  getHousehold() {
    return undefined;
  }

  getCollectionData() {
    return undefined;
  }
}

export { WiewaswieEdReader };
