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

import { StringUtils } from "../../../base/core/string_utils.mjs";

class BaclacUriBuilder {
  constructor() {
    // A census search looks like this:
    // https://recherche-collection-search.bac-lac.gc.ca/eng/Home/Search?DataSource=Genealogy%7CCensus&FirstName=Malcom&LastName=Cameron&Age=33&Age-median=33&Age-slider=0&YearOfBirth=1867&YearOfBirth-median=1867&YearOfBirth-slider=0&ProvinceCode=AB~BC~MB~NB~NT~NS~ON~PE~QC~SK~YT~LC~UC~CE~CW~TT&
    // A specific census year search can look like this
    // https://recherche-collection-search.bac-lac.gc.ca/eng/Home/Search?DataSource=Genealogy%7CCensus&ApplicationCode=28&FirstName=John&LastName=Smith&ProvinceCode=BC~MB~NB~NS~ON~PE~QC~TT&
    // A collections search looks like:
    // https://recherche-collection-search.bac-lac.gc.ca/eng/Home/Search?q=Robert%20Pavey&DataSource=Genealogy&
    // Or with a date range:
    // https://recherche-collection-search.bac-lac.gc.ca/eng/Home/Search?q=John%20Smith&DateBucket=%7C1900-1930&
    // Or an exact phrase and exact year
    // https://recherche-collection-search.bac-lac.gc.ca/eng/Home/Search?q_exact=John%20William%20Smith&DateBucket=1910-1919%7C1911&
    this.uri = "https://recherche-collection-search.bac-lac.gc.ca/eng/Home/Search";
    this.searchTermAdded = false;
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

  addDate(yearString) {
    // Exact date: DateBucket=1910-1919%7C1911 or DateBucket=1860-1869%7C1863&
    // It always shows the decade
    if (yearString && yearString.length == 4) {
      let decadeStart = yearString.substring(0, 3) + "0";
      let decadeEnd = yearString.substring(0, 3) + "9";
      let string = decadeStart + "-" + decadeEnd + "|" + yearString;
      this.addSearchParameter("DateBucket", string);
    }
  }

  addDateRange(startYear, endYear) {
    // Range: DateBucket=%7C1900-1930 or %7C1842-1876&
    if (startYear && startYear.length == 4 && endYear && endYear.length == 4) {
      let string = "|" + startYear + "-" + endYear;
      this.addSearchParameter("DateBucket", string);
    }
  }

  addDataSource(level1, level2) {
    if (level1) {
      let string = level1;
      if (level2) {
        string += "|" + level2;
      }
      this.addSearchParameter("DataSource", string);
    }
  }

  addDataSourceAsString(string) {
    this.addSearchParameter("DataSource", string);
  }

  addSearchString(string) {
    this.addSearchParameter("q", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addSearchStringExact(string) {
    this.addSearchParameter("q_exact", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addCensusApplicationCode(censusName) {
    const codes = {
      "Census of Lower Canada, 1825": "121",
      "Census of Lower Canada, 1831": "122",
      "Census of Canada East, 1842": "123",
      "Census of Canada West, 1842": "124",

      "Census of 1851 (Canada East, Canada West, New Brunswick and Nova Scotia)": "26",
      "Census of 1861 (Canada East, Canada West, Prince Edward Island, New Brunswick and Nova Scotia)": "120",
      "Census of Canada, 1871": "29",
      "Federal Census of 1871 (Ontario Index)": "2",
      "Census of Canada, 1881": "16",
      "Census of Canada, 1891": "27",
      "Census of Canada, 1901": "28",
      "Census of Canada, 1911": "4",
      "Census of Canada, 1921": "137",

      "Census of Manitoba, 1870": "125",
      "Census of Northwest Provinces, 1906": "3",
      "Census of the Prairie Provinces, 1916": "30",
      "Census of the Prairie Provinces, 1926": "146",
    };

    let code = codes[censusName];

    this.addSearchParameter("ApplicationCode", code);
  }

  addLastName(string) {
    this.addSearchParameter("LastName", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addFirstName(string) {
    this.addSearchParameter("FirstName", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addSliderStrings(paramRoot, numberString, plusMinus) {
    if (!numberString) {
      return;
    }

    let numString = numberString;
    let numMedianString = numberString;
    let numSliderString = "0";
    if (plusMinus) {
      let num = parseInt(numString);
      if (!isNaN(num)) {
        let lowNum = num - plusMinus;
        let highNum = num + plusMinus;
        if (lowNum < 0) {
          lowNum = 0;
        }
        numString = lowNum.toString() + "-" + highNum.toString();
        numSliderString = plusMinus.toString();
        if (plusMinus == 3) {
          numSliderString = "5";
        } else if (plusMinus == 4) {
          numSliderString = "10";
        }
      }
    }
    this.addSearchParameter(paramRoot, numString);
    this.addSearchParameter(paramRoot + "-median", numMedianString);
    this.addSearchParameter(paramRoot + "slider", numSliderString);
  }

  addAge(ageString, plusMinus) {
    // &Age=45&Age-median=45&Age-slider=0
    // &Age=43-47&Age-median=45&Age-slider=2
    // slider value is 0=0, 1=1, 2=2, 3=5, 4=10
    this.addSliderStrings("Age", ageString, plusMinus);
  }

  addBirthYear(yearString, plusMinus) {
    this.addSliderStrings("YearOfBirth", yearString, plusMinus);
  }

  addImmigrationYear(yearString, plusMinus) {
    this.addSliderStrings("YearOfImmigration", yearString, plusMinus);
  }

  addGender(string) {
    if (string == "male") {
      this.addSearchParameter("GenderCode", "1");
    } else if (string == "female") {
      this.addSearchParameter("GenderCode", "2");
    }
  }

  addMaritalStatus(string) {
    if (string == "single") {
      this.addSearchParameter("MaritalStatusCode", "1");
    } else if (string == "married") {
      this.addSearchParameter("MaritalStatusCode", "2");
    } else if (string == "widowed") {
      this.addSearchParameter("MaritalStatusCode", "5");
    } else if (string == "separated") {
      this.addSearchParameter("MaritalStatusCode", "13");
    } else if (string == "divorced") {
      this.addSearchParameter("MaritalStatusCode", "9");
    }
  }

  addRelationship(string) {
    this.addSearchParameter("Relationship", string);
  }

  addBirthPlace(string) {
    this.addSearchParameter("PlaceOfBirth", string);
  }

  addOccupation(string) {
    this.addSearchParameter("Occupation", string);
  }

  addReligion(string) {
    this.addSearchParameter("Religion", string);
  }

  addProvince(string) {
    // &ProvinceCode=AB~BC~MB~NB~NT~NS~ON~PE~QC~SK~YT~LC~UC~CE~CW~TT
    if (string) {
      let provinceCode = "";
      if (string.length > 2) {
        let provinceName = string.toLowerCase();
        const codes = {
          alberta: "AB",
          "british columbia": "BC",
          manitoba: "MB",
          "new brunswick": "NB",
          "northwest territories": "NT",
          "nova scotia": "NS",
          ontario: "ON",
          "prince edward island": "PE",
          quebec: "QC",
          saskatchewan: "SK",
          yukon: "YT",
          "lower canada": "LC",
          "lower canada (quebec)": "LC",
          "upper canada": "UC",
          "upper canada (ontario)": "UC",
          "canada east": "CE",
          "canada east (quebec)": "CE",
          "canada west": "CW",
          "canada west (ontario)": "CW",
          "the territories": "TT",
        };
        provinceCode = codes[provinceName];
      } else {
        provinceCode = string;
      }

      this.addSearchParameter("ProvinceCode", provinceCode);
    }
  }

  addPlace(string) {
    this.addSearchParameter("Plave", string);
  }

  addDistrict(string) {
    this.addSearchParameter("District", string);
  }

  addDistrictNumber(string) {
    this.addSearchParameter("DistrictNumber", string);
  }

  addSubDistrict(string) {
    this.addSearchParameter("SubDistrict", string);
  }

  addSubDistrictNumber(string) {
    this.addSearchParameter("SubDistrictNumber", string);
  }

  addMicrofilm(string) {
    this.addSearchParameter("Microfilm", string);
  }

  addDivision(string) {
    this.addSearchParameter("Division", string);
  }

  addPageNumber(string) {
    this.addSearchParameter("PageNumber", string);
  }

  addLineNumber(string) {
    this.addSearchParameter("LineNumber", string);
  }

  addFamilyNumber(string) {
    this.addSearchParameter("FamilyNumber", string);
  }

  addIdNumber(string) {
    this.addSearchParameter("IdNumber", string);
  }

  getUri() {
    return this.uri;
  }
}

export { BaclacUriBuilder };
