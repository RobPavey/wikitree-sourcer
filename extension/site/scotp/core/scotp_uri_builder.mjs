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

class ScotpUriBuilder {
  constructor(recordType) {
    this.uri =
      "https://www.scotlandspeople.gov.uk/record-results?search_type=people";
    this.searchTermAdded = true;

    this.uri += ScotpRecordType.getSearchStdText(recordType);
    this.recordType = recordType;

    this.yearCount = 0;
  }

  addSearchTerm(string) {
    if (string == undefined || string == "") {
      return;
    }
    if (!this.searchTermAdded) {
      this.uri = this.uri.concat("?", string);
      this.searchTermAdded = true;
    } else {
      this.uri = this.uri.concat("&", string);
    }
  }

  addSearchParameter(parameter, value) {
    if (value == undefined || value == "") {
      return;
    }

    const encodedValue = encodeURIComponent(value);

    if (!this.searchTermAdded) {
      this.uri = this.uri.concat("?", parameter, "=", encodedValue);
      this.searchTermAdded = true;
    } else {
      this.uri = this.uri.concat("&", parameter, "=", encodedValue);
    }
  }

  addSearchArrayParameter(parameter, value) {
    if (value == undefined || value == "") {
      return;
    }
    const count = (this.uri.match(new RegExp(parameter, "g")) || []).length;

    const newParameter = parameter + "%5B" + count + "%5D";
    this.addSearchParameter(newParameter, value);
  }

  addSearchOption(paramName, searchOption) {
    // Note "exact" is the default so we keep citation URLs shorter by omitting it
    if (searchOption && searchOption != "exact") {
      this.addSearchParameter(paramName + "_so", searchOption);
    }
  }

  addRecordDataValue(data, scotpRecordType, spFieldName) {
    let searchParam = ScotpRecordType.getSearchParam(
      scotpRecordType,
      spFieldName
    );
    if (searchParam) {
      let recordKey = ScotpRecordType.getRecordKey(
        scotpRecordType,
        spFieldName
      );
      if (recordKey) {
        let recordValue = data.recordData[recordKey];
        if (recordValue) {
          // if the string contains quotes the search doesn't match
          recordValue = recordValue.replace(/["']/g, "");

          // This error occurs if some fields are too long:
          // Description (title/occupation/place): cannot be longer than 128 characters but is currently 157 characters long.
          if (recordValue.length > 128) {
            recordValue = recordValue.substring(0, 128).trim();
          }
          this.addSearchParameter(searchParam, recordValue);
        }
      }
    }
  }

  addSurname(string, searchOption) {
    if (searchOption == "soundex") {
      let surnameLengthLimit = ScotpRecordType.getNameSearchLimitForSoundex(
        this.recordType,
        "surname"
      );
      if (string.length > surnameLengthLimit) {
        string = string.substring(0, surnameLengthLimit);
      }
    }

    this.addSearchParameter(
      "surname",
      WTS_String.removeExtendedAsciiCharacters(string)
    );
    this.addSearchOption("surname", searchOption);
  }

  addForename(string, searchOption) {
    let forenameParam = ScotpRecordType.getSearchParam(
      this.recordType,
      SpField.forename
    );

    if (searchOption == "soundex") {
      let surnameLengthLimit = ScotpRecordType.getNameSearchLimitForSoundex(
        this.recordType,
        "forename"
      );
      if (string.length > surnameLengthLimit) {
        string = string.substring(0, surnameLengthLimit);
      }
    }

    this.addSearchParameter(
      forenameParam,
      WTS_String.removeExtendedAsciiCharacters(string)
    );
    this.addSearchOption(forenameParam, searchOption);
  }

  addFullName(string, searchOption) {
    this.addSearchParameter(
      "name",
      WTS_String.removeExtendedAsciiCharacters(string)
    );
    this.addSearchOption("name", searchOption);
  }

  addSpouseSurname(string, searchOption) {
    let surnameParam = ScotpRecordType.getSearchParam(
      this.recordType,
      SpField.spouseSurname
    );

    if (surnameParam) {
      this.addSearchParameter(
        surnameParam,
        WTS_String.removeExtendedAsciiCharacters(string)
      );
      this.addSearchOption(surnameParam, searchOption);
    }
  }

  addSpouseForename(string, searchOption) {
    let forenameParam = ScotpRecordType.getSearchParam(
      this.recordType,
      SpField.spouseForename
    );

    if (forenameParam) {
      this.addSearchParameter(
        forenameParam,
        WTS_String.removeExtendedAsciiCharacters(string)
      );
      this.addSearchOption(forenameParam, searchOption);
    }
  }

  addSpouseFullName(string, searchOption) {
    let fullNameParam = ScotpRecordType.getSearchParam(
      this.recordType,
      SpField.spouseFullName
    );

    if (fullNameParam) {
      this.addSearchParameter(
        fullNameParam,
        WTS_String.removeExtendedAsciiCharacters(string)
      );
      this.addSearchOption(fullNameParam, searchOption);
    }
  }

  addStartYear(string) {
    this.addSearchParameter("from_year", string);
  }

  addEndYear(string) {
    this.addSearchParameter("to_year", string);
  }

  addYear(string) {
    // used for census where we have years like:
    // &year%5B0%5D=1861&year%5B1%5D=1871&year%5B2%5D=1881&year%5B3%5D=1891
    this.addSearchParameter("year%5B" + this.yearCount + "%5D", string);
    this.yearCount++;
  }

  addBirthYear(year, range) {
    this.addSearchParameter("birth_year", year);
    this.addSearchParameter("birth_year_range", range);
  }

  addAgeRange(from, to) {
    this.addSearchParameter("age_from", from);
    this.addSearchParameter("age_to", to);
  }

  addAge(age) {
    this.addSearchParameter("age", age);
  }

  addGender(gender) {
    let sex = gender;
    if (gender == "male") {
      sex = "M";
    } else if (gender == "female") {
      sex = "F";
    }
    this.addSearchParameter("sex", sex);
  }

  addParentName(string, searchOption) {
    if (string) {
      if (this.addedParentName) {
        this.addSearchParameter("parent_name_two", string);
        this.addSearchOption("parent_name_two", searchOption);
      } else {
        this.addSearchParameter("parent_names", string);
        this.addSearchOption("parent_names", searchOption);
        this.addedParentName = true;
      }
    }
  }

  addOtherPersonForename(string, searchOption) {
    if (string) {
      this.addSearchParameter("second_person_forename", string);
      this.addSearchOption("second_person_forename", searchOption);
    }
  }

  addRdName(string, stringIsFromResults) {
    let addedParam = false;
    if (string) {
      const searchTerms = getPlaceSearchTerms(
        string,
        "statutory",
        stringIsFromResults
      );
      if (searchTerms && Array.isArray(searchTerms)) {
        for (let i = 0; i < searchTerms.length; i += 1) {
          this.addSearchArrayParameter(
            "rd_real_name",
            searchTerms[i].real_name
          );
          this.addSearchArrayParameter(
            "rd_display_name",
            searchTerms[i].display_name
          );
          this.addSearchArrayParameter("rdno", searchTerms[i].rdno);
          addedParam = true;
        }
      }
    }
    return addedParam;
  }

  addOprParishName(string, stringIsFromResults) {
    let addedParam = false;
    const searchTerms = getPlaceSearchTerms(string, "opr", stringIsFromResults);
    if (searchTerms && Array.isArray(searchTerms)) {
      for (let i = 0; i < searchTerms.length; i += 1) {
        // from experiments with OPR births it looks like it works if only the
        // rd_name is used. However the rd_display_name is needed so that subsequent searches
        // from the same page work correctly (otherwise the "Parish/Congregation" is lost)
        // This may change with more research:
        //this.addSearchArrayParameter("rd_real_name", searchTerms[i].real_name);
        this.addSearchArrayParameter(
          "rd_display_name",
          searchTerms[i].display_name
        );
        //this.addSearchArrayParameter("rd_label", searchTerms[i].label);
        this.addSearchArrayParameter("rd_name", searchTerms[i].real_name);
        addedParam = true;
      }
    }
    return addedParam;
  }

  addCatholicParishName(string, stringIsFromResults) {
    let addedParam = false;
    if (string) {
      const searchTerms = getPlaceSearchTerms(
        string,
        "rc",
        stringIsFromResults
      );
      if (searchTerms && Array.isArray(searchTerms)) {
        for (let i = 0; i < searchTerms.length; i += 1) {
          this.addSearchArrayParameter("mp_code", searchTerms[i].mp_code);
          this.addSearchArrayParameter("mp_no", searchTerms[i].mp_no);
          this.addSearchArrayParameter(
            "parish_title",
            searchTerms[i].parish_title
          );
          addedParam = true;
        }
      }
    }

    return addedParam;
  }

  addOtherParishName(string) {
    // &congregation%5B0%5D=DALKEITH%20-%20EAST%20UNITED%20PRESBYTERIAN
    if (string) {
      const searchTerms = getPlaceSearchTerms(string, "other");
      if (searchTerms && Array.isArray(searchTerms)) {
        for (let i = 0; i < searchTerms.length; i += 1) {
          this.addSearchArrayParameter(
            "congregation",
            searchTerms[i].congregation
          );
        }
      }
    }
  }

  addRef(refValue) {
    this.addSearchParameter("ref", refValue);
  }

  getUri() {
    return this.uri;
  }
}

export { ScotpUriBuilder };
