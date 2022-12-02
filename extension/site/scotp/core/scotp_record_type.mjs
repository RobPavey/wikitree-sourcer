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

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY eventClass, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { RT } from "../../../base/core/record_type.mjs";

// eventClass: birth, death, marriage, divorce, census or other

const SpEventClass = {
  birth: "birth",
  death: "death",
  marriage: "marriage",
  divorce: "divorce",
  census: "census",
  other: "other",
};

const SpField = {
  age: "age",
  county: "county",
  courtName: "courtName",
  description: "description",
  forename: "forename",
  fullName: "fullName",
  gender: "gender",
  occupation: "occupation",
  parents: "parents",
  parishName: "parishName",
  rdName: "rdName",
  ref: "ref",
  serviceNumber: "serviceNumber",
  spouseForename: "spouseForename",
  spouseFullName: "spouseFullName",
  spouseSurname: "spouseSurname",
  surname: "surname",
  yearFrom: "yearFrom",
  yearTo: "yearTo",
};

const SpFeature = {
  age: "age",
  ageRange: "ageRange",
  birthYear: "birthYear",
  county: "county",
  court: "court",
  gender: "gender",
  oprParish: "oprParish",
  otherParish: "otherParish",
  parents: "parents",
  rcParish: "rcParish",
  rd: "rd",
  spouse: "spouse",
  otherPerson: "otherPerson",
};

const scotpRecordTypes = {
  defaults: {
    record: { county: false },
    recordKeys: {},
    search: { gender: true, county: true, rd: true },
    searchNameLimits: { forename: 15, surname: 15 }, // if limit not known set to 99
    searchParams: { ref: "ref", county: "county", forename: "forename" },
    searchFields: {
      forename: "edit-search-params-nrs-forename",
      surname: "edit-search-params-nrs-surname",
      county: "edit-search-params-str-county",
      yearFrom: "edit-search-params-nrs-search-year-year-from",
      yearTo: "edit-search-params-nrs-search-year-year-to",
      rdName: "edit-search-params-nrs-rd-name",
    },
  },

  // These are in the order that they appear on the Advanced People Search here:
  // https://www.scotlandspeople.gov.uk/advanced-search
  // Except that the records for each church type are grouped together

  ///////////////////// Statutory Registers ///////////////////////
  stat_births: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/statutory-registers/births",
    collectionNrsTitle: "Statutory Register of Births",
    dates: { from: 1855, to: 0 },
    eventClass: "birth",
    recordKeys: { ref: "Ref", gender: "Gender", rdName: "RD Name" },
    searchFields: {
      rdName: "edit-search-params-str-district",
    },
    searchStdText: "&dl_cat=statutory&dl_rec=statutory-births&record_type=stat_births",
    searchUrl: "statutory-records/stat-births",
    sourcerRecordType: RT.BirthRegistration,
  },
  stat_marriages: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/statutory-registers/marriages",
    collectionNrsTitle: "Statutory Register of Marriages",
    dates: { from: 1855, to: 0 },
    eventClass: "marriage",
    recordKeys: {
      ref: "Ref",
      rdName: "RD Name",
      spouseSurname: "Spouse Surname",
      spouseForename: "Spouse Forename",
    },
    search: { spouse: true },
    searchParams: { spouseSurname: "spsurname", spouseForename: "spforename" },
    searchFields: {
      spouseSurname: "edit-search-params-nrs-spsurname",
      spouseForename: "edit-search-params-nrs-spforename",
      rdName: "edit-search-params-str-district",
    },
    searchStdText: "&dl_cat=statutory&dl_rec=statutory-marriages&record_type=stat_marriages",
    searchUrl: "statutory-records/stat-marriages",
    sourcerRecordType: RT.MarriageRegistration,
  },
  stat_divorces: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/statutory-register-of-divorce",
    collectionNrsTitle: "Statutory Register of Divorces",
    dates: { from: 1984, to: 0 },
    eventClass: "divorce",
    recordKeys: { ref: "Serial Number", spouseSurname: "Spouse Surname" },
    search: { spouse: true, county: false },
    searchParams: { spouseSurname: "spsurname" },
    searchFields: {
      spouseSurname: "edit-search-params-nrs-spsurname",
      rdName: "edit-search-params-str-district",
      yearFrom: "edit-search-params-nrs-divorce-year-year-from",
      yearTo: "edit-search-params-nrs-divorce-year-year-to",
    },
    searchStdText: "&dl_cat=statutory&dl_rec=statutory-divorces&record_type=stat_divorces",
    searchUrl: "statutory-records/stat-divorces",
    sourcerRecordType: RT.Divorce,
  },
  stat_deaths: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/statutory-registers/deaths",
    collectionNrsTitle: "Statutory Register of Deaths",
    dates: { from: 1855, to: 0 },
    eventClass: "death",
    recordKeys: { ref: "Ref", age: "Age at death", rdName: "RD Name" },
    search: { ageRange: true, birthYear: true },
    searchFields: {
      rdName: "edit-search-params-str-district",
    },
    searchStdText: "&dl_cat=statutory&dl_rec=statutory-deaths&record_type=stat_deaths",
    searchUrl: "statutory-records/stat-deaths",
    sourcerRecordType: RT.DeathRegistration,
  },
  stat_civilpartnerships: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/statutory-register-of-civil-partnerships",
    collectionNrsTitle: "Statutory Register of Civil Partnerships",
    dates: { from: 2005, to: 0 },
    eventClass: "marriage",
    recordKeys: {
      ref: "RD/EntryNumber",
      rdName: "RD Name",
      spouseSurname: "Partner Surname",
    },
    search: { spouse: true },
    searchParams: { spouseSurname: "psurname", spouseForename: "" },
    searchFields: {
      spouseSurname: "edit-search-params-nrs-spsurname",
      spouseForename: "",
      rdName: "edit-search-params-str-district",
    },
    searchStdText: "&dl_cat=statutory&dl_rec=statutory-civilpartnerships&record_type=civilpartnership",
    searchUrl: "statutory-records/stat-civilpartnerships",
    sourcerRecordType: RT.MarriageRegistration,
  },
  stat_dissolutions: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/statutory-register-of-dissolutions",
    collectionNrsTitle: "Statutory Register of Dissolutions",
    dates: { from: 2007, to: 0 },
    eventClass: "divorce",
    recordKeys: { ref: "Serial Number", spouseSurname: "Partner Surname" },
    search: { spouse: true, county: false },
    searchParams: { spouseSurname: "psurname", spouseForename: "" },
    searchFields: {
      spouseSurname: "edit-search-params-nrs-ptsurname",
      spouseForename: "",
      rdName: "edit-search-params-str-district",
      yearFrom: "edit-search-params-nrs-dissolution-year-year-from",
      yearTo: "edit-search-params-nrs-dissolution-year-year-to",
    },
    searchNameLimits: { forename: 99, surname: 99 }, // if limit not known set to 99
    searchStdText: "&dl_cat=statutory&dl_rec=statutory-dissolutions&record_type=dissolutions",
    searchUrl: "statutory-records/stat-dissolutions",
    sourcerRecordType: RT.Divorce,
  },

  ///////////////////// Church Registers ///////////////////////

  opr_births: {
    collectionNrsLink:
      "https://www.nrscotland.gov.uk/research/guides/birth-death-and-marriage-records/old-parish-registers/births-and-baptisms",
    collectionNrsTitle: "Old Parish Registers - Births and Baptisms",
    dates: { from: 1553, to: 1885 },
    eventClass: "birth",
    recordKeys: {
      ref: "Ref",
      gender: "Gender",
      parents: "Parents/ Other Details",
      parishName: "Parish",
    },
    search: { parents: true, oprParish: true, rd: false },
    searchFields: {
      yearFrom: "edit-search-params-nrs-year-field-year-from",
      yearTo: "edit-search-params-nrs-year-field-year-to",
    },
    searchStdText:
      "&event=%28B%20OR%20C%20OR%20S%29&record_type%5B0%5D=opr_births&church_type=Old%20Parish%20Registers&dl_cat=church&dl_rec=church-births-baptisms",
    searchUrl: "church-registers/church-births-baptisms/opr-births",
    sourcerRecordType: RT.BirthOrBaptism,
  },
  opr_marriages: {
    collectionNrsLink:
      "https://www.nrscotland.gov.uk/research/guides/birth-death-and-marriage-records/old-parish-registers/marriages-and-proclamation-of-banns",
    collectionNrsTitle: "Old Parish Registers - Marriages and Proclamation of Banns",
    dates: { from: 1553, to: 1885 },
    eventClass: "marriage",
    recordKeys: {
      ref: "Ref",
      spouseFullName: "Spouse Name",
      parishName: "Parish",
    },
    search: { spouse: true, oprParish: true, rd: false },
    searchParams: { spouseFullName: "spouse_name" },
    searchFields: {
      spouseFullName: "edit-search-params-nrs-motherspousename",
      yearFrom: "edit-search-params-nrs-year-field-year-from",
      yearTo: "edit-search-params-nrs-year-field-year-to",
    },
    searchStdText:
      "&event=M&record_type%5B0%5D=opr_marriages&church_type=Old%20Parish%20Registers&dl_cat=church&dl_rec=church-banns-marriages",
    searchUrl: "church-registers/church-banns-marriages/opr-marriages",
    sourcerRecordType: RT.Marriage,
  },
  opr_deaths: {
    collectionNrsLink:
      "https://www.nrscotland.gov.uk/research/guides/birth-death-and-marriage-records/old-parish-registers/deaths-and-burials",
    collectionNrsTitle: "Old Parish Registers - Deaths and Burials",
    dates: { from: 1553, to: 1885 },
    eventClass: "death",
    recordKeys: { ref: "Ref", gender: "Gender", parishName: "Parish" },
    search: { oprParish: true, rd: false },
    searchFields: {
      yearFrom: "edit-search-params-nrs-year-field-year-from",
      yearTo: "edit-search-params-nrs-year-field-year-to",
    },
    searchStdText:
      "&event=D&record_type%5B0%5D=opr_deaths&church_type=Old%20Parish%20Registers&dl_cat=church&dl_rec=church-deaths-burials",
    searchUrl: "church-registers/church-deaths-burials/opr-deaths",
    sourcerRecordType: RT.DeathOrBurial,
  },

  cr_baptisms: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/catholic-parish-registers/births-and-baptisms",
    collectionNrsTitle: "Catholic Parish Registers - Births and Baptisms",
    dates: { from: 1703, to: 1921 },
    eventClass: "birth",
    recordKeys: {
      parishName: "Parish",
      gender: "Gender",
      parents: "Parents/ Other details",
    },
    search: { parents: true, rd: false, rcParish: true },
    searchNameLimits: { forename: 99, surname: 99 }, // if limit not known set to 99
    searchFields: {
      yearFrom: "edit-search-params-nrs-year-field-year-from",
      yearTo: "edit-search-params-nrs-year-field-year-to",
    },
    searchStdText:
      "&event=%28B%20OR%20C%20OR%20S%29&record_type%5B0%5D=crbirths_baptism&church_type=Catholic%20Registers&dl_cat=church&dl_rec=church-births-baptisms",
    searchUrl: "church-registers/church-births-baptisms/cr-baptisms",
    sourcerRecordType: RT.Baptism,
  },
  cr_banns: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/catholic-parish-registers/marriages",
    collectionNrsTitle: "Catholic Parish Registers - Marriages",
    dates: { from: 1736, to: 1946 },
    eventClass: "marriage",
    recordKeys: {
      parishName: "Parish",
      spouseSurname: "Spouse Surname",
      spouseForename: "Spouse forename",
    },
    search: { rd: false, spouse: true, rcParish: true },
    searchNameLimits: { forename: 99, surname: 99 }, // if limit not known set to 99
    searchParams: {
      spouseSurname: "spouse_surname",
      spouseForename: "spouse_forename",
    },
    searchFields: {
      yearFrom: "edit-search-params-nrs-year-field-year-from",
      yearTo: "edit-search-params-nrs-year-field-year-to",
      spouseSurname: "edit-search-params-nrs-spouse-surname",
      spouseForename: "edit-search-params-nrs-spouse-forename",
    },
    searchStdText:
      "&event=M&record_type%5B0%5D=crbanns_marriages&church_type=Catholic%20Registers&dl_cat=church&dl_rec=church-banns-marriages",
    searchUrl: "church-registers/church-banns-marriages/cr-banns",
    sourcerRecordType: RT.Marriage,
  },
  cr_burials: {
    collectionNrsLink:
      "https://www.nrscotland.gov.uk/research/guides/catholic-parish-registers/deaths-burials-and-funerals",
    collectionNrsTitle: "Catholic Parish Registers - Deaths, Burials and Funerals",
    dates: { from: 1742, to: 1971 },
    eventClass: "death",
    recordKeys: { parishName: "Parish", gender: "Gender", age: "Age" },
    search: { rd: false, rcParish: true, ageRange: true },
    searchNameLimits: { forename: 99, surname: 99 }, // if limit not known set to 99
    searchFields: {
      yearFrom: "edit-search-params-nrs-year-field-year-from",
      yearTo: "edit-search-params-nrs-year-field-year-to",
    },
    searchStdText:
      "&event=D&record_type%5B0%5D=crdeath_burial&church_type=Catholic%20Registers&dl_cat=church&dl_rec=church-deaths-burials",
    searchUrl: "church-registers/church-deaths-burials/cr-burials",
    sourcerRecordType: RT.Burial, // NOTE: can be overidden to RT.Death
  },
  cr_other: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/catholic-parish-registers",
    collectionNrsTitle: "Catholic Parish Registers - Other Events",
    dates: { from: 1742, to: 1971 },
    eventClass: "other",
    recordKeys: { parishName: "Parish", gender: "Gender" },
    search: { rd: false, rcParish: true },
    searchNameLimits: { forename: 99, surname: 99 }, // if limit not known set to 99
    searchFields: {
      yearFrom: "edit-search-params-nrs-year-field-year-from",
      yearTo: "edit-search-params-nrs-year-field-year-to",
    },
    searchStdText: "&record_type%5B0%5D=cr_other&church_type=Catholic%20Registers",
    searchUrl: "church-registers/church-other/cr-other",
    sourcerRecordType: RT.OtherChurchEvent,
  },

  ch3_baptism: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/church-records",
    collectionNrsTitle: "Other Church Registers - Births and Baptisms",
    dates: { from: 1733, to: 1855 },
    eventClass: "birth",
    recordKeys: {
      parishName: "Parish/Congregation Name",
      parents: "Parents/ Other Details",
    },
    search: { parents: true, rd: false, otherParish: true },
    searchNameLimits: { forename: 99, surname: 99 }, // if limit not known set to 99
    searchParams: { parishName: "congregation" },
    searchFields: {
      yearFrom: "edit-search-params-nrs-year-field-year-from",
      yearTo: "edit-search-params-nrs-year-field-year-to",
    },
    searchStdText:
      "&event=%28B%20OR%20C%20OR%20S%29&record_type%5B0%5D=ch3_baptism&church_type=Presbyterian%20registers&dl_cat=church&dl_rec=church-births-baptisms",
    searchUrl: "church-registers/church-births-baptisms/ch3-baptisms",
    sourcerRecordType: RT.Baptism,
  },
  ch3_banns: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/church-records",
    collectionNrsTitle: "Other Church Registers - Marriages",
    dates: { from: 1740, to: 1855 },
    eventClass: "marriage",
    recordKeys: {
      parishName: "Parish/ Congregation Name",
      spouseSurname: "Spouse Surname",
      spouseForename: "Spouse Forename",
    },
    search: { rd: false, otherParish: true, spouse: true },
    searchNameLimits: { forename: 99, surname: 99 }, // if limit not known set to 99
    searchParams: { parishName: "congregation", spouseFullName: "spouse_name" },
    searchFields: {
      spouseFullName: "edit-search-params-nrs-spouse-name",
      yearFrom: "edit-search-params-nrs-year-field-year-from",
      yearTo: "edit-search-params-nrs-year-field-year-to",
    },
    searchStdText:
      "&event=M&record_type%5B0%5D=ch3_marriages&church_type=Presbyterian%20registers&dl_cat=church&dl_rec=church-banns-marriages",
    searchUrl: "church-registers/church-banns-marriages/ch3-banns",
    sourcerRecordType: RT.Marriage,
  },
  ch3_burials: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/church-records",
    collectionNrsTitle: "Other Church Registers - Deaths and Burials",
    dates: { from: 1783, to: 1855 },
    eventClass: "death",
    recordKeys: { parishName: "Parish/Congregation Name" },
    search: { rd: false, otherParish: true },
    searchNameLimits: { forename: 99, surname: 99 }, // if limit not known set to 99
    searchParams: { parishName: "congregation" },
    searchFields: {
      yearFrom: "edit-search-params-nrs-year-field-year-from",
      yearTo: "edit-search-params-nrs-year-field-year-to",
    },
    searchStdText:
      "&event=D&record_type%5B0%5D=ch3_burials&church_type=Presbyterian%20registers&dl_cat=church&dl_rec=church-deaths-burials",
    searchUrl: "church-registers/church-deaths-burials/ch3-burials",
    sourcerRecordType: RT.DeathOrBurial,
  },
  ch3_other: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/church-records",
    collectionNrsTitle: "Other Church Registers - Other Events",
    dates: { from: 1742, to: 1855 },
    eventClass: "other",
    recordKeys: { parishName: "Parish/Congregation Name" },
    search: { rd: false, otherParish: true },
    searchNameLimits: { forename: 99, surname: 99 }, // if limit not known set to 99
    searchParams: { parishName: "congregation" },
    searchFields: {
      yearFrom: "edit-search-params-nrs-year-field-year-from",
      yearTo: "edit-search-params-nrs-year-field-year-to",
    },
    searchStdText: "&record_type%5B0%5D=ch3_other&church_type=Presbyterian%20registers",
    searchUrl: "church-registers/church-other/ch3-other",
    sourcerRecordType: RT.OtherChurchEvent,
  },

  census: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/census-records",
    collectionNrsTitle: "Census Returns",
    dates: { from: 1841, to: 1911 },
    eventClass: "census",
    record: { county: true },
    recordKeys: {
      ref: "Ref",
      gender: "Gender",
      age: "Age at Census",
      rdName: "RD Name",
      county: "County/ City",
    },
    search: { ageRange: true, otherPerson: true },
    searchFields: {
      rdName: "edit-search-params-str-district",
    },
    searchStdText: "&dl_cat=census&record_type=census",
    searchUrl: "census-returns/census",
    sourcerRecordType: RT.Census,
  },
  census_lds: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/census-records",
    collectionNrsTitle: "Census Returns",
    dates: { from: 1881, to: 1881 },
    eventClass: "census",
    recordKeys: { ref: "Ref", gender: "Gender", age: "Age" },
    search: { ageRange: true, rd: false, county: false },
    searchNameLimits: { forename: 99, surname: 99 }, // if limit not known set to 99
    searchFields: { forename: "edit-search-params-nrs-given-name" },
    searchFields: {
      rdName: "edit-search-params-str-district",
    },
    searchStdText: "&dl_cat=census&record_type=census_lds&year%5B0%5D=1881_LDS",
    searchUrl: "census-returns/census",
    sourcerRecordType: RT.Census,
  },

  vr: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/valuation-rolls",
    collectionNrsTitle: "Valuation Rolls",
    dates: { from: 1855, to: 1940 },
    eventClass: "other",
    recordKeys: { ref: "Reference Number" },
    search: { gender: false, rd: false },
    searchNameLimits: { forename: 99, surname: 99 }, // if limit not known set to 99
    searchParams: { county: "county_burgh" },
    searchFields: { county: "edit-search-params-ajax-dropdowns-str-county" },
    searchStdText: "&dl_cat=valuation&record_type=valuation_rolls",
    searchUrl: "valuation-rolls/vr",
    sourcerRecordType: RT.ValuationRoll,
  },

  wills: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/wills-and-testaments",
    collectionNrsTitle: "Wills and Testaments",
    dates: { from: 1513, to: 1925 },
    eventClass: "death",
    recordKeys: {
      ref: "Reference Number",
      description: "Description",
      courtName: "Court",
    },
    search: { gender: false, rd: false, county: false, court: true },
    searchNameLimits: { forename: 99, surname: 99 }, // if limit not known set to 99
    searchParams: { description: "description", courtName: "court" },
    searchFields: {
      yearFrom: "edit-search-params-nrs-year-year-from",
      yearTo: "edit-search-params-nrs-year-year-to",
    },
    searchStdText: "&dl_cat=legal&dl_rec=legal-wills-testaments&record_type=wills_testaments",
    searchUrl: "legal-records/wills",
    sourcerRecordType: RT.Will,
  },
  coa: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/coats-of-arms/public-register-of-arms",
    collectionNrsTitle: "Public Register of All Arms and Bearings",
    dates: { from: 1672, to: 1921 },
    eventClass: "other",
    recordKeys: { ref: "Record Number" }, // has Volume and Record Number
    search: { gender: false, rd: false, county: false },
    searchNameLimits: { forename: 99, surname: 99 }, // if limit not known set to 99
    searchFields: {
      yearFrom: "edit-search-params-nrs-grantyear-year-from",
      yearTo: "edit-search-params-nrs-grantyear-year-to",
    },
    searchStdText: "&dl_cat=legal&dl_rec=legal-coats-arms&record_type=coa",
    searchUrl: "legal-records/coa",
    sourcerRecordType: RT.Heraldry,
  },
  soldiers_wills: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/soldiers-and-airmens-wills",
    collectionNrsTitle: "Soldiers' and Airmen's Wills",
    dates: { from: 1857, to: 1965 },
    eventClass: "death",
    recordKeys: { serviceNumber: "Service Number" },
    search: { gender: false, rd: false, county: false },
    searchNameLimits: { forename: 99, surname: 99 }, // if limit not known set to 99
    searchParams: { serviceNumber: "service_number" },
    searchStdText: "&dl_cat=legal&dl_rec=legal-soldiers-wills&record_type=soldiers_wills",
    searchUrl: "legal-records/soldiers-wills",
    sourcerRecordType: RT.Military,
  },
  military_tribunals: {
    collectionNrsLink:
      "https://www.nrscotland.gov.uk/research/research-guides/research-guides-a-z/military-records/military-service-appeal-tribunals",
    collectionNrsTitle: "Military Service Appeal Tribunals",
    dates: { from: 1916, to: 1918 },
    eventClass: "other",
    recordKeys: { courtName: "Court", occupation: "Occupation" },
    search: { gender: false, rd: false, age: true, county: false, court: true },
    searchNameLimits: { forename: 99, surname: 99 }, // if limit not known set to 99
    searchParams: {
      forename: "forenames",
      courtName: "tribunal",
      occupation: "occupation",
    },
    searchFields: {
      forename: "edit-search-params-nrs-forenames",
    },
    searchStdText: "&dl_cat=legal&dl_rec=legal-military-service&record_type=military_tribunals",
    searchUrl: "legal-records/military-tribunals",
    sourcerRecordType: RT.Military,
  },

  hie: {
    collectionNrsLink: "https://www.nrscotland.gov.uk/research/guides/emigration-records",
    collectionNrsTitle: "Highland and Island Emigration Society records",
    dates: { from: 1852, to: 1857 },
    record: { county: true },
    recordKeys: { county: "County" },
    search: { gender: false, rd: false },
    searchNameLimits: { forename: 99, surname: 99 }, // if limit not known set to 99
    searchStdText: "&dl_cat=poor-relief&dl_rec=poor-relief-hie&record_type=hie",
    searchUrl: "poor-relief/hie",
    sourcerRecordType: RT.Immigration,
  },

  prison_records: {
    collectionNrsLink: "https://www.scotlandspeople.gov.uk/guides/prison-registers",
    collectionNrsTitle: "Prison Registers",
    dates: { from: 1867, to: 1921 },
    search: { rd: false, county: false },
    searchNameLimits: { forename: 99, surname: 99 }, // if limit not known set to 99
    searchFields: {
      yearFrom: "edit-search-params-hss-yearadmitted-year-from",
      yearTo: "edit-search-params-hss-yearadmitted-year-to",
    },
    searchStdText: "&dl_cat=prison&record_type=prison_records",
    searchUrl: "prison-registers/prison-records",
    sourcerRecordType: RT.CriminalRegister,
  },
};

function getDefaultValue(groupName, name) {
  let result = "";

  let defaults = scotpRecordTypes.defaults;
  if (groupName) {
    if (defaults.hasOwnProperty(groupName)) {
      let group = defaults[groupName];
      if (group.hasOwnProperty(name)) {
        result = group[name];
      }
    }
  } else {
    if (defaults.hasOwnProperty(name)) {
      result = defaults[name];
    }
  }
  return result;
}

function getValueWithDefault(recordType, groupName, name, defaultValue) {
  let result = defaultValue;
  if (!scotpRecordTypes.hasOwnProperty(recordType)) {
    return result; // should never happen
  }

  let type = scotpRecordTypes[recordType];

  if (groupName) {
    if (type && type.hasOwnProperty(groupName)) {
      let group = type[groupName];
      if (group.hasOwnProperty(name)) {
        result = group[name];
      }
    }
  } else {
    if (type.hasOwnProperty(name)) {
      result = type[name];
    }
  }
  return result;
}

const ScotpRecordType = {
  getEventClass: function (recordType) {
    return getValueWithDefault(recordType, "", "eventClass", "other");
  },

  getNrsTitle: function (recordType) {
    return getValueWithDefault(recordType, "", "collectionNrsTitle", "");
  },

  getSourcerRecordType: function (recordType) {
    return getValueWithDefault(recordType, "", "sourcerRecordType", "");
  },

  getDatesCovered: function (recordType) {
    let type = scotpRecordTypes[recordType];
    return type.dates;
  },

  getSearchStdText: function (recordType) {
    return getValueWithDefault(recordType, "", "searchStdText", "");
  },

  getSearchUrlPart: function (recordType) {
    return getValueWithDefault(recordType, "", "searchUrl", "");
  },

  hasSearchFeature: function (recordType, feature) {
    let defaultValue = getDefaultValue("search", feature);
    return getValueWithDefault(recordType, "search", feature, defaultValue);
  },

  getSearchParam: function (recordType, paramName) {
    let defaultValue = getDefaultValue("searchParams", paramName);
    return getValueWithDefault(recordType, "searchParams", paramName, defaultValue);
  },

  getSearchField: function (recordType, fieldName) {
    let defaultValue = getDefaultValue("searchFields", fieldName);
    return getValueWithDefault(recordType, "searchFields", fieldName, defaultValue);
  },

  getRecordKey: function (recordType, fieldName) {
    let defaultValue = getDefaultValue("recordKeys", fieldName);
    return getValueWithDefault(recordType, "recordKeys", fieldName, defaultValue);
  },

  getNameSearchLimitForSoundex: function (recordType, nameType) {
    let defaultValue = getDefaultValue("searchNameLimits", nameType);
    return getValueWithDefault(recordType, "searchNameLimits", nameType, defaultValue);
  },
};

export { ScotpRecordType, SpField, SpFeature, SpEventClass };
