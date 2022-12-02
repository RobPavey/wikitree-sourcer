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

import { WTS_String } from "../../../base/core/wts_string.mjs";
import { ScotpRecordType, SpField } from "./scotp_record_type.mjs";
import { getPlaceSearchTerms } from "./scotp_place_search_terms.mjs";

class ScotpFormDataBuilder {
  constructor(recordType) {
    this.recordType = recordType;

    this.formData = {};
    this.formData.urlPart = ScotpRecordType.getSearchUrlPart(recordType);
    this.formData.fields = [];
  }

  addTextField(parameter, value) {
    if (value == undefined || value == "") {
      return;
    }

    let field = { fieldKey: parameter, type: "text", value: value };
    this.formData.fields.push(field);
  }

  addSearchOption(parameter, searchOption) {
    if (searchOption) {
      let field = { fieldKey: parameter, type: "so", value: searchOption };
      this.formData.fields.push(field);
    }
  }

  addRadioButtonField(parameter, value) {
    let field = { fieldKey: parameter, type: "radio", value: value };
    this.formData.fields.push(field);
  }

  addCheckboxField(parameter, value) {
    let field = { fieldKey: parameter, type: "checkbox", value: value };
    this.formData.fields.push(field);
  }

  addSelectField(parameter, value) {
    let field = { fieldKey: parameter, type: "select", value: value };
    this.formData.fields.push(field);
  }

  addMultipleSelectField(parameter, values) {
    let field = { fieldKey: parameter, type: "multipleSelect", values: values };
    this.formData.fields.push(field);
  }

  addSurname(string, searchOption) {
    let fieldName = ScotpRecordType.getSearchField(this.recordType, "surname");
    if (fieldName) {
      if (searchOption == "soundex") {
        let surnameLengthLimit = ScotpRecordType.getNameSearchLimitForSoundex(this.recordType, "surname");
        if (string.length > surnameLengthLimit) {
          string = string.substring(0, surnameLengthLimit);
        }
      }

      this.addTextField(fieldName, string);
      this.addSearchOption(fieldName, searchOption);
    }
  }

  addForename(string, searchOption) {
    let forenameParam = ScotpRecordType.getSearchField(this.recordType, SpField.forename);

    if (searchOption == "soundex") {
      let forenameLengthLimit = ScotpRecordType.getNameSearchLimitForSoundex(this.recordType, "forename");
      if (string.length > forenameLengthLimit) {
        string = string.substring(0, forenameLengthLimit);
      }
    }

    this.addTextField(forenameParam, string);
    this.addSearchOption(forenameParam, searchOption);
  }

  addFullName(string, searchOption) {
    this.addTextField("edit-search-params-nrs-name", string);
    this.addSearchOption("edit-search-params-nrs-name", searchOption);
  }

  addSpouseSurname(string, searchOption) {
    let surnameParam = ScotpRecordType.getSearchField(this.recordType, SpField.spouseSurname);

    if (surnameParam) {
      this.addTextField(surnameParam, string);
      this.addSearchOption(surnameParam, searchOption);
    }
  }

  addSpouseForename(string, searchOption) {
    let forenameParam = ScotpRecordType.getSearchField(this.recordType, SpField.spouseForename);

    if (forenameParam) {
      this.addTextField(forenameParam, string);
      this.addSearchOption(forenameParam, searchOption);
    }
  }

  addSpouseFullName(string, searchOption) {
    let fullNameParam = ScotpRecordType.getSearchField(this.recordType, SpField.spouseFullName);

    if (fullNameParam) {
      this.addTextField(fullNameParam, string);
      this.addSearchOption(fullNameParam, searchOption);
    }
  }

  addStartYear(string) {
    let yearFromParam = ScotpRecordType.getSearchField(this.recordType, SpField.yearFrom);
    if (yearFromParam) {
      this.addTextField(yearFromParam, string);
    }
  }

  addEndYear(string) {
    let yearToParam = ScotpRecordType.getSearchField(this.recordType, SpField.yearTo);
    if (yearToParam) {
      this.addTextField(yearToParam, string);
    }
  }

  addYear(string) {
    if (this.recordType == "census") {
      let fieldId = "edit-search-params-nrs-census-year-" + string;
      this.addCheckboxField(fieldId, true);
    } else if (this.recordType == "census_lds") {
      let fieldId = "edit-search-params-nrs-census-year-" + string + "-lds";
      this.addCheckboxField(fieldId, true);
    } else {
      let fieldId = "edit-search-params-nrs-year-" + string;
      this.addRadioButtonField(fieldId, true);
    }
  }

  addBirthYear(year, range) {
    this.addTextField("edit-search-params-nrs-dob", year);
    this.addSelectField("edit-search-params-nrs-birth-year-range", range);
  }

  addAgeRange(from, to) {
    this.addTextField("edit-search-params-hss-age-age-from", from);
    this.addTextField("edit-search-params-hss-age-age-to", to);
  }

  addAge(age) {
    // Not used in search
    //this.addSearchParameter("age", age);
  }

  addGender(gender) {
    const recordTypesUsingNumber = ["stat_marriages", "cr_baptisms", "cr_burials", "cr_other"];
    const useNumber = recordTypesUsingNumber.includes(this.recordType);
    let sex = "";
    if (gender == "male") {
      sex = useNumber ? "1" : "m";
    } else if (gender == "female") {
      sex = useNumber ? "2" : "f";
    }

    let fieldId = "edit-search-params-nrs-sex-" + sex;
    this.addRadioButtonField(fieldId, true);
  }

  addParentName(string, searchOption) {
    // not used in search
  }

  addOtherPersonForename(string, searchOption) {
    if (string) {
      this.addTextField("edit-search-params-nrs-otherforename", string);
      this.addSearchOption("edit-search-params-nrs-otherforename", searchOption);
    }
  }

  addRdName(string, stringIsFromResults) {
    let values = [];
    if (string) {
      const searchTerms = getPlaceSearchTerms(string, "statutory", stringIsFromResults);
      if (searchTerms && Array.isArray(searchTerms)) {
        for (let i = 0; i < searchTerms.length; i += 1) {
          values.push(searchTerms[i].display_name);
        }
      }
    }

    this.addMultipleSelectField("edit-search-params-str-district", values);

    return values.length > 0;
  }

  addOprParishName(string, stringIsFromResults) {
    let values = [];
    const searchTerms = getPlaceSearchTerms(string, "opr", stringIsFromResults);
    if (searchTerms && Array.isArray(searchTerms)) {
      for (let i = 0; i < searchTerms.length; i += 1) {
        values.push(searchTerms[i].display_name);
      }
    }
    this.addMultipleSelectField("edit-search-params-nrs-rd-name", values);

    return values.length > 0;
  }

  addCatholicParishName(string, stringIsFromResults) {
    let values = [];
    if (string) {
      const searchTerms = getPlaceSearchTerms(string, "rc", stringIsFromResults);
      if (searchTerms && Array.isArray(searchTerms)) {
        for (let i = 0; i < searchTerms.length; i += 1) {
          const value = searchTerms[i].mp_code + "|" + searchTerms[i].mp_no + "|" + searchTerms[i].parish_title;
          values.push(value);
        }
      }
    }
    this.addMultipleSelectField("edit-search-params-str-parish-congregation", values);

    return values.length > 0;
  }

  addOtherParishName(string) {
    // &congregation%5B0%5D=DALKEITH%20-%20EAST%20UNITED%20PRESBYTERIAN
    let values = [];
    if (string) {
      const searchTerms = getPlaceSearchTerms(string, "other");
      if (searchTerms && Array.isArray(searchTerms)) {
        for (let i = 0; i < searchTerms.length; i += 1) {
          values.push(searchTerms[i].congregation);
        }
      }
    }
    this.addMultipleSelectField("edit-search-params-nrs-congregation", values);
  }

  addRef(refValue) {
    // not used
  }

  getFormData() {
    return this.formData;
  }
}

export { ScotpFormDataBuilder };
