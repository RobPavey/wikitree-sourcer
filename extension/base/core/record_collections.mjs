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

import { CD } from "./country_data.mjs";

const houseTableColumnsUk1841 = ["name", "gender", "age", "occupation", "birthPlace"];
const houseTableColumnsUk1851to1911 = [
  "name",
  "relationship",
  "maritalStatus",
  "gender",
  "age",
  "birthYear",
  "occupation",
  "birthPlace",
];

const householdTableColumnsUsFederal1850 = ["name", "gender", "age", "occupation", "birthPlace"];
const householdTableColumnsUsFederalPre1880 = ["name", "gender", "age", "maritalStatus", "occupation", "birthPlace"];
const householdTableColumnsUsFederalPost1880 = [
  "name",
  "gender",
  "age",
  "maritalStatus",
  "relationship",
  "occupation",
  "birthPlace",
];

const RecordCollectionData = [
  // England & Wales BMD
  {
    wtsId: "EnglandAndWalesBirthReg",
    title: "England & Wales, Civil Registration Birth Index",
    country: "England and Wales",
    isBirth: true,
    sites: {
      fs: {
        id: "2285338",
        dates: { from: 1837, to: 2008 },
        searchTerms: { gender: false },
      },
      fmp: {
        id: "England & Wales Births 1837-2006",
        dates: { from: 1837, to: 2006 },
        searchQueryFields: { volume: "", page: "" },
      },
      gro: { id: "births", dates: { from: 1837, to: 2019 } },
      freebmd: { id: "births", dates: { from: 1837, to: 1992 } },
    },
  },
  {
    wtsId: "EnglandAndWalesBirthRegEarly",
    partOf: ["EnglandAndWalesBirthReg"],
    title: "England & Wales, Civil Registration Birth Index 1837-1915",
    country: "England and Wales",
    isDeath: true,
    sites: {
      ancestry: {
        id: "8912",
        altId: "freebmdbirth",
        dates: { from: 1837, to: 1915 },
      },
    },
  },
  {
    wtsId: "EnglandAndWalesBirthRegLate",
    partOf: ["EnglandAndWalesBirthReg"],
    title: "England & Wales, Civil Registration Birth Index 1916-2007",
    country: "England and Wales",
    isDeath: true,
    sites: {
      ancestry: { id: "8782", dates: { from: 1916, to: 2007 } },
    },
  },
  {
    wtsId: "EnglandAndWalesMarriageReg",
    title: "England & Wales, Civil Registration Marriage Index",
    country: "England and Wales",
    isMarriage: true,
    sites: {
      fs: { id: "2285732", dates: { from: 1837, to: 2008 } },
      fmp: {
        id: "England & Wales Marriages 1837-2005",
        dates: { from: 1837, to: 2005 },
      },
      freebmd: { id: "marriages", dates: { from: 1837, to: 1992 } },
    },
  },
  {
    wtsId: "EnglandAndWalesMarriageRegEarly",
    partOf: ["EnglandAndWalesMarriageReg"],
    title: "England & Wales, Civil Registration Marriage Index 1837-1915",
    country: "England and Wales",
    isDeath: true,
    sites: {
      ancestry: {
        id: "8913",
        altId: "FreeBMDMarriage",
        dates: { from: 1837, to: 1915 },
        searchQueryFields: { volume: "f-F00056EC", page: "f-F0005906" },
      },
    },
  },
  {
    wtsId: "EnglandAndWalesMarriageRegLate",
    partOf: ["EnglandAndWalesMarriageReg"],
    title: "England & Wales, Civil Registration Marriage Index 1916-2007",
    country: "England and Wales",
    isDeath: true,
    sites: {
      ancestry: {
        id: "8753",
        altId: "ONSmarriage1984",
        dates: { from: 1916, to: 2005 },
      },
    },
  },
  {
    wtsId: "EnglandAndWalesDeathReg",
    title: "England & Wales, Civil Registration Death Index",
    country: "England and Wales",
    isDeath: true,
    sites: {
      fs: { id: "2285341", dates: { from: 1837, to: 2008 } },
      fmp: {
        id: "England & Wales Deaths 1837-2007",
        dates: { from: 1837, to: 2007 },
        searchQueryFields: { volume: "", page: "" },
      },
      gro: { id: "deaths", dates: { from: 1837, to: 2019 } },
      freebmd: { id: "deaths", dates: { from: 1837, to: 1992 } },
    },
  },
  {
    wtsId: "EnglandAndWalesDeathRegEarly",
    partOf: ["EnglandAndWalesDeathReg"],
    title: "England & Wales, Civil Registration Death Index 1837-1915",
    country: "England and Wales",
    isDeath: true,
    sites: {
      ancestry: {
        id: "8914",
        dates: { from: 1837, to: 1915 },
        searchQueryFields: { volume: "", page: "" },
      },
    },
  },
  {
    wtsId: "EnglandAndWalesDeathRegLate",
    partOf: ["EnglandAndWalesDeathReg"],
    title: "England & Wales, Civil Registration Death Index 1916-2007",
    country: "England and Wales",
    isDeath: true,
    sites: {
      ancestry: { id: "7579", dates: { from: 1916, to: 2007 } },
    },
  },

  // England, Wales & Scotland Census
  {
    wtsId: "EnglandWalesAndScotlandCensus1841",
    title: "1841 Census of England, Wales & Scotland",
    country: "United Kingdom",
    dates: { year: 1841, exactDate: "6 Jun 1841" },
    householdTableColumns: houseTableColumnsUk1841,
    sites: {
      fmp: {
        id: "1841 England, Wales & Scotland Census",
        title: "1841 England, Wales & Scotland Census",
      },
      freecen: { id: "1841", title: "1841 England, Scotland and Wales census" },
    },
  },
  {
    wtsId: "EnglandWalesAndScotlandCensus1851",
    title: "1851 Census of England, Wales & Scotland",
    country: "United Kingdom",
    dates: { year: 1851, exactDate: "30 Mar 1851" },
    householdTableColumns: houseTableColumnsUk1851to1911,
    sites: {
      fmp: {
        id: "1851 England, Wales & Scotland Census",
        title: "1851 England, Wales & Scotland Census",
      },
      freecen: { id: "1851", title: "1851 England, Scotland and Wales census" },
    },
  },
  {
    wtsId: "EnglandWalesAndScotlandCensus1861",
    title: "1861 Census of England, Wales & Scotland",
    country: "United Kingdom",
    dates: { year: 1861, exactDate: "7 Apr 1861" },
    householdTableColumns: houseTableColumnsUk1851to1911,
    sites: {
      fmp: {
        id: "1861 England, Wales & Scotland Census",
        title: "1861 England, Wales & Scotland Census",
      },
      freecen: { id: "1861", title: "1861 England, Scotland and Wales census" },
    },
  },
  {
    wtsId: "EnglandWalesAndScotlandCensus1871",
    title: "1871 Census of England, Wales & Scotland",
    country: "United Kingdom",
    dates: { year: 1871, exactDate: "2 Apr 1871" },
    householdTableColumns: houseTableColumnsUk1851to1911,
    sites: {
      fmp: {
        id: "1871 England, Wales & Scotland Census",
        title: "1871 England, Wales & Scotland Census",
      },
      freecen: { id: "1871", title: "1871 England, Scotland and Wales census" },
    },
  },
  {
    wtsId: "EnglandWalesAndScotlandCensus1881",
    title: "1881 Census of England, Wales & Scotland",
    country: "United Kingdom",
    dates: { year: 1881, exactDate: "3 Apr 1881" },
    householdTableColumns: houseTableColumnsUk1851to1911,
    sites: {
      fmp: {
        id: "1881 England, Wales & Scotland Census",
        title: "1881 England, Wales & Scotland Census",
      },
      freecen: { id: "1881", title: "1881 England, Scotland and Wales census" },
    },
  },
  {
    wtsId: "EnglandWalesAndScotlandCensus1891",
    title: "1891 Census of England, Wales & Scotland",
    country: "United Kingdom",
    dates: { year: 1891, exactDate: "5 Apr 1891" },
    householdTableColumns: houseTableColumnsUk1851to1911,
    sites: {
      fmp: {
        id: "1891 England, Wales & Scotland Census",
        title: "1891 England, Wales & Scotland Census",
      },
      freecen: { id: "1891", title: "1891 England, Scotland and Wales census" },
    },
  },
  {
    wtsId: "EnglandWalesAndScotlandCensus1901",
    title: "1901 Census of England, Wales & Scotland",
    country: "United Kingdom",
    dates: { year: 1901, exactDate: "31 Mar 1901" },
    householdTableColumns: houseTableColumnsUk1851to1911,
    sites: {
      fmp: {
        id: "1901 England, Wales & Scotland Census",
        title: "1901 England, Wales & Scotland Census",
      },
      freecen: { id: "1901", title: "1901 England, Scotland and Wales census" },
    },
  },
  {
    wtsId: "EnglandWalesAndScotlandCensus1911",
    title: "1911 Census of England, Wales & Scotland",
    country: "United Kingdom",
    dates: { year: 1911, exactDate: "2 Apr 1911" },
    householdTableColumns: houseTableColumnsUk1851to1911,
  },
  // England & Wales Census
  {
    wtsId: "EnglandAndWalesCensus1841",
    partOf: ["EnglandWalesAndScotlandCensus1841"],
    title: "1841 Census of England and Wales",
    country: "England and Wales",
    dates: { year: 1841, exactDate: "6 Jun 1841" },
    sites: {
      fs: { id: "1493745", title: "England and Wales Census, 1841" },
      mh: { id: "10150", title: "1841 England & Wales Census" },
    },
  },
  {
    wtsId: "EnglandAndWalesCensus1851",
    partOf: ["EnglandWalesAndScotlandCensus1851"],
    title: "1851 Census of England and Wales",
    country: "England and Wales",
    dates: { year: 1851, exactDate: "30 Mar 1851" },
    sites: {
      fs: { id: "2563939", title: "England and Wales Census, 1851" },
      mh: { id: "10151", title: "1851 England & Wales Census" },
    },
  },
  {
    wtsId: "EnglandAndWalesCensus1861",
    partOf: ["EnglandWalesAndScotlandCensus1861"],
    title: "1861 Census of England and Wales",
    country: "England and Wales",
    dates: { year: 1861, exactDate: "7 Apr 1861" },
    sites: {
      fs: { id: "1493747", title: "England and Wales Census, 1861" },
    },
  },
  {
    wtsId: "EnglandAndWalesCensus1871",
    partOf: ["EnglandWalesAndScotlandCensus1871"],
    title: "1871 Census of England and Wales",
    country: "England and Wales",
    dates: { year: 1871, exactDate: "2 Apr 1871" },
    sites: {
      fs: { id: "1538354", title: "England and Wales Census, 1871" },
    },
  },
  {
    wtsId: "EnglandAndWalesCensus1881",
    partOf: ["EnglandWalesAndScotlandCensus1881"],
    title: "1881 Census of England and Wales",
    country: "England and Wales",
    dates: { year: 1881, exactDate: "3 Apr 1881" },
    sites: {
      fs: { id: "2562194", title: "England and Wales Census, 1881" },
    },
  },
  {
    wtsId: "EnglandAndWalesCensus1891",
    partOf: ["EnglandWalesAndScotlandCensus1891"],
    title: "1891 Census of England and Wales",
    country: "England and Wales",
    dates: { year: 1891, exactDate: "5 Apr 1891" },
    sites: {
      fs: { id: "1865747", title: "England and Wales Census, 1891" },
    },
  },
  {
    wtsId: "EnglandAndWalesCensus1901",
    partOf: ["EnglandWalesAndScotlandCensus1901"],
    title: "1901 Census of England and Wales",
    country: "England and Wales",
    dates: { year: 1901, exactDate: "31 Mar 1901" },
    sites: {
      fs: { id: "1888129", title: "England and Wales Census, 1901" },
    },
  },
  {
    wtsId: "EnglandAndWalesCensus1911",
    partOf: ["EnglandWalesAndScotlandCensus1911"],
    title: "1911 Census of England and Wales",
    country: "England and Wales",
    dates: { year: 1911, exactDate: "2 Apr 1911" },
    householdTableColumns: houseTableColumnsUk1851to1911,
    sites: {
      fs: { id: "1921547", title: "England and Wales Census, 1911" },
      fmp: {
        id: "1911 Census For England & Wales",
        title: "1911 Census For England & Wales",
        searchQueryFields: { maritalStatus: "condition" },
      },
      freecen: { id: "1911", title: "1911 England and Wales census" },
    },
  },
  {
    wtsId: "EnglandAndWalesCensus1921",
    title: "1921 Census of England and Wales",
    country: "England and Wales",
    dates: { year: 1921 },
    householdTableColumns: [
      "name",
      "relationship",
      "gender",
      "maritalStatus",
      "age",
      "birthYear",
      "birthPlace",
      "occupation",
      "employer",
    ],
    sites: {
      fmp: {
        id: "1921 Census Of England & Wales",
        title: "1921 Census Of England & Wales",
        searchQueryFields: {
          maritalStatus: "maritalstatus",
          occupation: "occupationtext",
          birthPlace: "whereborntext",
        },
      },
    },
  },
  // England Census
  {
    wtsId: "EnglandCensus1841",
    partOf: ["EnglandAndWalesCensus1841"],
    title: "1841 Census of England",
    country: "England",
    dates: { year: 1841, exactDate: "6 Jun 1841" },
    sites: {
      ancestry: {
        id: "8978",
        altId: "uki1841",
        title: "1841 England Census",
        searchQueryFields: {
          piece: "f-F0003039",
          folio: "f-F000303A",
          page: "f-F00032DB",
          book: "f-F0002996",
          district: "f-F000303D",
          subDistrict: "f-F000303E",
        },
      },
    },
  },
  {
    wtsId: "EnglandCensus1851",
    partOf: ["EnglandAndWalesCensus1851"],
    title: "1851 Census of England",
    country: "England",
    dates: { year: 1851, exactDate: "30 Mar 1851" },
    sites: {
      ancestry: {
        id: "8860",
        altId: "uki1851",
        title: "1851 England Census",
        searchQueryFields: {
          piece: "f-F0005C4F",
          folio: "f-F0005E11",
          page: "f-F0005906",
          schedule: "f-F0006867",
          district: "f-F0005DFD",
          subDistrict: "f-F0006301",
          eccPar: "f-F0005DFB",
          enumDistrict: "f-F0005DFC",
        },
      },
    },
  },
  {
    wtsId: "EnglandCensus1861",
    partOf: ["EnglandAndWalesCensus1861"],
    title: "1861 Census of England",
    country: "England",
    dates: { year: 1861, exactDate: "7 Apr 1861" },
    sites: {
      ancestry: {
        id: "8767",
        altId: "uki1861",
        title: "1861 England Census",
        searchQueryFields: {
          piece: "f-F0007B87",
          folio: "f-F0007B88",
          page: "f-F000597C",
        },
      },
    },
  },
  {
    wtsId: "EnglandCensus1871",
    partOf: ["EnglandAndWalesCensus1871"],
    title: "1871 Census of England",
    country: "England",
    dates: { year: 1871, exactDate: "2 Apr 1871" },
    sites: {
      // tested and default piece, folio and page work
      ancestry: { id: "7619", altId: "uki1871", title: "1871 England Census" },
    },
  },
  {
    wtsId: "EnglandCensus1881",
    partOf: ["EnglandAndWalesCensus1881"],
    title: "1881 Census of England",
    country: "England",
    dates: { year: 1881, exactDate: "3 Apr 1881" },
    sites: {
      ancestry: {
        id: "7572",
        altId: "uki1881",
        title: "1881 England Census",
        searchQueryFields: {
          piece: "f-F800686D",
          folio: "f-F0005E11",
          page: "f-F0005906",
          district: "f-F000925D",
          subDistrict: "f-F00079A7",
          enumDistrict: "f-F0005DFC",
        },
      },
    },
  },
  {
    wtsId: "EnglandCensus1891",
    partOf: ["EnglandAndWalesCensus1891"],
    title: "1891 Census of England",
    country: "England",
    dates: { year: 1891, exactDate: "5 Apr 1891" },
    sites: {
      ancestry: { id: "6598", altId: "uki1891", title: "1891 England Census" },
    },
  },
  {
    wtsId: "EnglandCensus1901",
    partOf: ["EnglandAndWalesCensus1901"],
    title: "1901 Census of England",
    country: "England",
    dates: { year: 1901, exactDate: "31 Mar 1901" },
    sites: {
      ancestry: {
        id: "7814",
        altId: "uki1901",
        title: "1901 England Census",
        searchQueryFields: {
          piece: "f-F0005C4F",
          folio: "f-F0005E11",
          page: "f-F0005906",
          schedule: "f-F0006867",
          district: "f-F0007AD6",
          subDistrict: "f-F00079A7",
          enumDistrict: "f-F0005DFC",
        },
      },
    },
  },
  {
    wtsId: "EnglandCensus1911",
    partOf: ["EnglandAndWalesCensus1911"],
    title: "1911 Census of England",
    country: "England",
    dates: { year: 1911, exactDate: "2 Apr 1911" },
    sites: {
      ancestry: {
        id: "2352",
        altId: "1911England",
        title: "1911 England Census",
      },
    },
  },
  // Wales Census
  {
    wtsId: "WalesCensus1841",
    partOf: ["EnglandAndWalesCensus1841"],
    title: "1841 Census of Wales",
    country: "Wales",
    dates: { year: 1841, exactDate: "6 Jun 1841" },
    sites: {
      ancestry: { id: "8979", altId: "uki1841wales" },
    },
  },
  {
    wtsId: "WalesCensus1851",
    partOf: ["EnglandAndWalesCensus1851"],
    title: "1851 Census of Wales",
    country: "Wales",
    dates: { year: 1851, exactDate: "30 Mar 1851" },
    sites: {
      ancestry: { id: "8861", altId: "uki1851wales" },
    },
  },
  {
    wtsId: "WalesCensus1861",
    partOf: ["EnglandAndWalesCensus1861"],
    title: "1861 Census of Wales",
    country: "Wales",
    dates: { year: 1861, exactDate: "7 Apr 1861" },
    sites: {
      ancestry: { id: "8768", altId: "uki1861wales" },
    },
  },
  {
    wtsId: "WalesCensus1871",
    partOf: ["EnglandAndWalesCensus1871"],
    title: "1871 Census of Wales",
    country: "Wales",
    dates: { year: 1871, exactDate: "2 Apr 1871" },
    sites: {
      ancestry: { id: "7618", altId: "uki1871wales" },
    },
  },
  {
    wtsId: "WalesCensus1881",
    partOf: ["EnglandAndWalesCensus1881"],
    title: "1881 Census of Wales",
    country: "Wales",
    dates: { year: 1881, exactDate: "3 Apr 1881" },
    sites: {
      ancestry: { id: "8059", altId: "uki1881wales" },
    },
  },
  {
    wtsId: "WalesCensus1891",
    partOf: ["EnglandAndWalesCensus1891"],
    title: "1891 Census of Wales",
    country: "Wales",
    dates: { year: 1891, exactDate: "5 Apr 1891" },
    sites: {
      ancestry: { id: "6897", altId: "uki1891wales" },
    },
  },
  {
    wtsId: "WalesCensus1901",
    partOf: ["EnglandAndWalesCensus1901"],
    title: "1901 Census of Wales",
    country: "Wales",
    dates: { year: 1901, exactDate: "31 Mar 1901" },
    sites: {
      ancestry: { id: "7815", altId: "uki1901wales" },
    },
  },
  {
    wtsId: "WalesCensus1911",
    partOf: ["EnglandAndWalesCensus1911"],
    title: "1911 Census of Wales",
    country: "Wales",
    dates: { year: 1911, exactDate: "2 Apr 1911" },
    sites: {
      ancestry: { id: "2353", altId: "1911Wales" },
    },
  },
  // Scotland Census
  {
    wtsId: "ScotlandCensus1841",
    partOf: ["EnglandWalesAndScotlandCensus1841"],
    title: "1841 Census of Scotland",
    country: "Scotland",
    dates: { year: 1841, exactDate: "6 Jun 1841" },
    sites: {
      ancestry: {
        id: "1004",
        searchQueryFields: { district: "", registrationNumber: "f-F0003968" }, // no Page or ED supported
      },
      fs: { id: "2016000", title: "Scotland Census, 1841" },
      scotp: { id: "census1841" },
    },
  },
  {
    wtsId: "ScotlandCensus1851",
    partOf: ["EnglandWalesAndScotlandCensus1851"],
    title: "1851 Census of Scotland",
    country: "Scotland",
    dates: { year: 1851, exactDate: "30 Mar 1851" },
    sites: {
      ancestry: {
        id: "1076",
        searchQueryFields: {
          district: "",
          enumDistrict: "f-F0005DFC",
          registrationNumber: "f-F0007E02",
          page: "f-F8007E01",
        },
      },
      fs: { id: "2028673", title: "Scotland Census, 1851" },
      scotp: { id: "census1851" },
    },
  },
  {
    wtsId: "ScotlandCensus1861",
    partOf: ["EnglandWalesAndScotlandCensus1861"],
    title: "1861 Census of Scotland",
    country: "Scotland",
    dates: { year: 1861, exactDate: "7 Apr 1861" },
    sites: {
      ancestry: {
        id: "1080",
        searchQueryFields: {
          district: "f-F0003B8A",
          enumDistrict: "f-F00032ED",
          registrationNumber: "f-F0003B89",
        },
      },
      fs: { id: "2028677", title: "Scotland Census, 1861" },
      scotp: { id: "census1861" },
    },
  },
  {
    wtsId: "ScotlandCensus1871",
    partOf: ["EnglandWalesAndScotlandCensus1871"],
    title: "1871 Census of Scotland",
    country: "Scotland",
    dates: { year: 1871, exactDate: "2 Apr 1871" },
    sites: {
      ancestry: {
        id: "1104",
        searchQueryFields: {
          district: "f-F0003B8A",
          enumDistrict: "f-F00032ED",
          registrationNumber: "f-F0003B89",
        },
      },
      fs: { id: "2028678", title: "Scotland Census, 1871" },
      scotp: { id: "census1871" },
    },
  },
  {
    wtsId: "ScotlandCensus1881",
    partOf: ["EnglandWalesAndScotlandCensus1881"],
    title: "1881 Census of Scotland",
    country: "Scotland",
    dates: { year: 1881, exactDate: "3 Apr 1881" },
    sites: {
      ancestry: {
        id: "1119",
        searchQueryFields: {
          district: "f-F0003B8A",
          enumDistrict: "f-F00032ED",
          registrationNumber: "f-F0003B89",
        },
      },
      fs: { id: "2046756", title: "Scotland Census, 1881" },
      scotp: { id: "census1881" },
    },
  },
  {
    wtsId: "ScotlandCensus1891",
    partOf: ["EnglandWalesAndScotlandCensus1891"],
    title: "1891 Census of Scotland",
    country: "Scotland",
    dates: { year: 1891, exactDate: "5 Apr 1891" },
    sites: {
      ancestry: {
        id: "1108",
        searchQueryFields: {
          district: "f-F0003B8A",
          enumDistrict: "f-F00032ED",
          registrationNumber: "f-F0003B89",
        },
      },
      fs: { id: "2046943", title: "Scotland Census, 1891" },
      scotp: { id: "census1891" },
    },
  },
  {
    wtsId: "ScotlandCensus1901",
    partOf: ["EnglandWalesAndScotlandCensus1901"],
    title: "1901 Census of Scotland",
    country: "Scotland",
    dates: { year: 1901, exactDate: "31 Mar 1901" },
    sites: {
      ancestry: {
        id: "1101",
        searchQueryFields: {
          district: "f-F0003B8A",
          enumDistrict: "f-F00032ED",
          registrationNumber: "f-F0003B89",
        },
      },
      fs: { id: "3212239", title: "Scotland Census, 1901" },
      scotp: { id: "census1901" },
    },
  },
  {
    wtsId: "ScotlandCensus1911",
    partOf: ["EnglandWalesAndScotlandCensus1911"],
    title: "1901 Census of Scotland",
    country: "Scotland",
    dates: { year: 1901, exactDate: "31 Mar 1901" },
    sites: {
      scotp: { id: "census1911" },
    },
  },

  // 1939 Register
  {
    wtsId: "EnglandAndWales1939Register",
    title: "1939 England and Wales Register",
    country: "England and Wales",
    dates: { year: 1939 },
    householdTableColumns: ["name", "maritalStatus", "gender", "birthDate", "occupation"],
    sites: {
      ancestry: { id: "61596" },
      fmp: {
        id: "1939 Register",
        searchQueryFields: { maritalStatus: "maritalstatus" },
      },
      fs: { id: "2836130", title: "England and Wales National Register, 1939" },
    },
  },
  // England & Wales Probate
  {
    wtsId: "EnglandAndWalesProbate",
    title: "England & Wales, National Probate Calendar, 1858-1995",
    country: "England and Wales",
    sites: {
      ancestry: { id: "1904", dates: { from: 1858, to: 1995 } },
    },
  },
  // British Phone Books
  {
    wtsId: "BritishPhoneBooks",
    title: "British Phone Books, 1880-1984",
    country: "United Kingdom",
    sites: {
      ancestry: { id: "1025", dates: { from: 1880, to: 1984 } },
    },
  },

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  // US
  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  // United States Federal Census
  {
    wtsId: "UsCensus1790",
    title: "1790 United States Federal Census",
    country: "United States",
    dates: { year: 1790, exactDate: "2 Aug 1790" },
    sites: {
      fs: { id: "1803959" },
      ancestry: { id: "5058" },
      fmp: { id: "US Census 1790" },
    },
  },
  {
    wtsId: "UsCensus1800",
    title: "1800 United States Federal Census",
    country: "United States",
    dates: { year: 1800, exactDate: "4 Aug 1800" },
    sites: {
      fs: { id: "1804228" },
      ancestry: { id: "7590" },
      fmp: { id: "US Census 1800" },
    },
  },
  {
    wtsId: "UsCensus1810",
    title: "1810 United States Federal Census",
    country: "United States",
    dates: { year: 1810, exactDate: "6 Aug 1810" },
    sites: {
      fs: { id: "1803765" },
      ancestry: { id: "7613" },
      fmp: { id: "US Census 1810" },
    },
  },
  {
    wtsId: "UsCensus1820",
    title: "1820 United States Federal Census",
    country: "United States",
    dates: { year: 1820, exactDate: "7 Aug 1820" },
    sites: {
      fs: { id: "1803955" },
      ancestry: { id: "7734" },
      fmp: { id: "US Census 1820" },
    },
  },
  {
    wtsId: "UsCensus1830",
    title: "1830 United States Federal Census",
    country: "United States",
    dates: { year: 1830, exactDate: "1 Jun 1830" },
    sites: {
      fs: { id: "1803958" },
      ancestry: { id: "8058" },
      fmp: { id: "US Census 1830" },
    },
  },
  {
    wtsId: "UsCensus1840",
    title: "1840 United States Federal Census",
    country: "United States",
    dates: { year: 1840, exactDate: "1 Jun 1840" },
    sites: {
      fs: { id: "1786457" },
      ancestry: { id: "8057" },
      fmp: { id: "US Census 1840" },
    },
  },
  {
    wtsId: "UsCensus1850",
    title: "1850 United States Federal Census",
    country: "United States",
    dates: { year: 1850, exactDate: "1 Jun 1850" },
    householdTableColumns: householdTableColumnsUsFederal1850,
    sites: {
      fs: { id: "1401638" },
      ancestry: { id: "8054" },
      fmp: { id: "US Census 1850" },
    },
  },
  {
    wtsId: "UsCensus1860",
    title: "1860 United States Federal Census",
    country: "United States",
    dates: { year: 1860, exactDate: "1 Jun 1860" },
    householdTableColumns: householdTableColumnsUsFederal1850,
    sites: {
      fs: { id: "1473181" },
      ancestry: { id: "7667" },
      fmp: { id: "US Census 1860" },
    },
  },
  {
    wtsId: "UsCensus1870",
    title: "1870 United States Federal Census",
    country: "United States",
    dates: { year: 1870, exactDate: "1 Jun 1870" },
    householdTableColumns: householdTableColumnsUsFederal1850,
    sites: {
      fs: { id: "1438024" },
      ancestry: { id: "7163" },
      fmp: { id: "US Census 1870" },
    },
  },
  {
    wtsId: "UsCensus1880",
    title: "1880 United States Federal Census",
    country: "United States",
    dates: { year: 1880, exactDate: "1 Jun 1880" },
    householdTableColumns: householdTableColumnsUsFederalPost1880,
    sites: {
      fs: { id: "1417683" },
      ancestry: { id: "6742" },
      fmp: { id: "US Census 1880" },
    },
  },
  {
    wtsId: "UsCensus1890",
    title: "1890 United States Federal Census",
    country: "United States",
    dates: { year: 1890, exactDate: "2 Jun 1890" },
    householdTableColumns: householdTableColumnsUsFederalPost1880,
    sites: {
      fs: { id: "1610551" },
      ancestry: {
        id: "5445",
        title: "1890 United States Federal Census Fragment",
      },
      fmp: { id: "US Census 1890" },
    },
  },
  {
    wtsId: "UsCensus1900",
    title: "1900 United States Federal Census",
    country: "United States",
    dates: { year: 1900, exactDate: "1 Jun 1900" },
    householdTableColumns: householdTableColumnsUsFederalPost1880,
    sites: {
      fs: { id: "1325221" },
      ancestry: { id: "7602" },
      fmp: { id: "US Census 1900" },
    },
  },
  {
    wtsId: "UsCensus1910",
    title: "1910 United States Federal Census",
    country: "United States",
    dates: { year: 1910, exactDate: "15 Apr 1910" },
    householdTableColumns: householdTableColumnsUsFederalPost1880,
    sites: {
      fs: { id: "1727033" },
      ancestry: { id: "7884" },
      fmp: { id: "US Census 1910" },
    },
  },
  {
    wtsId: "UsCensus1920",
    title: "1920 United States Federal Census",
    country: "United States",
    dates: { year: 1920, exactDate: "1 Jan 1920" },
    householdTableColumns: householdTableColumnsUsFederalPost1880,
    sites: {
      fs: { id: "1488411" },
      ancestry: { id: "6061" },
      fmp: { id: "US Census 1920" },
    },
  },
  {
    wtsId: "UsCensus1930",
    title: "1930 United States Federal Census",
    country: "United States",
    dates: { year: 1930, exactDate: "2 Apr 1930" },
    householdTableColumns: householdTableColumnsUsFederalPost1880,
    sites: {
      fs: { id: "1810731" },
      ancestry: { id: "6224" },
      fmp: { id: "US Census 1930" },
    },
  },
  {
    wtsId: "UsCensus1940",
    title: "1940 United States Federal Census",
    country: "United States",
    dates: { year: 1940, exactDate: "1 Apr 1940" },
    householdTableColumns: householdTableColumnsUsFederalPost1880,
    sites: {
      fs: { id: "2000219" },
      ancestry: { id: "2442" },
      fmp: { id: "US Census 1940" },
    },
  },
  {
    wtsId: "UsCensus1950",
    title: "1950 United States Federal Census",
    country: "United States",
    dates: { year: 1950, exactDate: "1 Apr 1950" },
    householdTableColumns: householdTableColumnsUsFederalPost1880,
    sites: {
      ancestry: { id: "62308" },
      fs: { id: "4464515" },
      // fmp: { id: "US Census 1950"}, // Not yet transcribed on FMP (as of 31 Aug 2022)
    },
  },

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  // Canada
  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  // Canada Census
  {
    wtsId: "CanadaCensus1825LowerEast",
    title: "1825 Census of Lower/East Canada",
    country: "Canada",
    dates: { year: 1825 },
    sites: {
      fs: { id: "1834346" },
      ancestry: { id: "9807", altId: "" },
      baclac: { id: "Census of Lower Canada, 1825", altId: "census1825" },
    },
  },
  {
    wtsId: "CanadaCensus1831LowerEast",
    title: "1831 Census of Lower/East Canada",
    country: "Canada",
    dates: { year: 1831 },
    sites: {
      fs: { id: "1834329" },
      baclac: { id: "Census of Lower Canada, 1831", altId: "census1831" },
    },
  },
  {
    wtsId: "CanadaCensus1842LowerEast",
    title: "1842 Census of East Canada",
    country: "Canada",
    dates: { year: 1842 },
    sites: {
      fs: { id: "1834340" },
      ancestry: { id: "9808" },
      fmp: { id: "Lower Canada Census 1842" },
      baclac: { id: "Census of Canada East, 1842", altId: "census1842-Canada-East" },
    },
  },
  {
    wtsId: "CanadaCensus1842UpperWest",
    title: "1842 Census of Canada West",
    country: "Canada",
    dates: { year: 1842 },
    sites: {
      fs: { id: "1834342" },
      baclac: { id: "Census of Canada West, 1842", altId: "census1842-Canada-West" },
    },
  },
  {
    wtsId: "CanadaCensus1851",
    title: "1851 Census of Canada",
    country: "Canada",
    dates: { year: 1851 },
    sites: {
      fs: { id: "1325192" },
      ancestry: { id: "1061", altId: "1851Canada" },
      fmp: { id: "Canada Census 1851" },
      baclac: { id: "Census of 1851 (Canada East, Canada West, New Brunswick and Nova Scotia)", altId: "census1851" },
    },
  },
  {
    wtsId: "CanadaCensus1861",
    title: "1861 Census of Canada",
    country: "Canada",
    dates: { year: 1861 },
    sites: {
      // fs: { id: "2143998"}, (seems to be per state)
      ancestry: { id: "1570" },
      fmp: { id: "Canada Census 1861" },
      baclac: {
        id: "Census of 1861 (Canada East, Canada West, Prince Edward Island, New Brunswick and Nova Scotia)",
        altId: "census1861",
      },
    },
  },
  {
    wtsId: "CanadaCensus1871",
    title: "1871 Census of Canada",
    country: "Canada",
    dates: { year: 1871 },
    sites: {
      fs: { id: "1551612" },
      ancestry: { id: "1578" },
      fmp: { id: "Canada Census 1871" },
      baclac: { id: "Census of Canada, 1871", altId: "census1871" },
    },
  },
  {
    wtsId: "CanadaCensus1871Ontario",
    title: "1871 Census of Canada (Ontario)",
    country: "Canada",
    dates: { year: 1871 },
    sites: {
      baclac: { id: "Federal Census of 1871 (Ontario Index)", altId: "census1871" },
    },
  },
  {
    wtsId: "CanadaCensus1881",
    title: "1881 Census of Canada",
    country: "Canada",
    dates: { year: 1881 },
    sites: {
      fs: { id: "1804541" },
      ancestry: { id: "1577", altId: "1881Canada" },
      fmp: { id: "Canada Census 1881" },
      baclac: { id: "Census of Canada, 1881", altId: "census1881" },
    },
  },
  {
    wtsId: "CanadaCensus1891",
    title: "1891 Census of Canada",
    country: "Canada",
    dates: { year: 1891 },
    sites: {
      fs: { id: "1583536" },
      ancestry: { id: "1274" },
      fmp: { id: "Canada Census 1891" },
      baclac: { id: "Census of Canada, 1891", altId: "census1891" },
    },
  },
  {
    wtsId: "CanadaCensus1901",
    title: "1901 Census of Canada",
    country: "Canada",
    dates: { year: 1901 },
    householdTableColumns: [
      "name",
      "gender",
      "age",
      "relationship",
      "maritalStatus",
      "birthDate",
      "birthPlace",
      "occupation",
    ],
    sites: {
      fs: { id: "1584557" },
      ancestry: { id: "8826" },
      fmp: {
        id: "Canada Census 1901",
        searchQueryFields: { maritalstatus: "maritalstatus" },
      },
      baclac: { id: "Census of Canada, 1901", altId: "census1901" },
    },
  },
  {
    wtsId: "CanadaCensus1911",
    title: "1911 Census of Canada",
    country: "Canada",
    dates: { year: 1911 },
    householdTableColumns: [
      "name",
      "gender",
      "age",
      "relationship",
      "maritalStatus",
      "birthDate",
      "birthPlace",
      "occupation",
    ],
    sites: {
      fs: { id: "2143998" },
      ancestry: { id: "8947" },
      fmp: { id: "Canada Census 1911" },
      baclac: { id: "Census of Canada, 1911", altId: "census1911" },
    },
  },
  {
    wtsId: "CanadaCensus1921",
    title: "1921 Census of Canada",
    country: "Canada",
    dates: { year: 1921 },
    householdTableColumns: ["name", "gender", "age", "relationship", "maritalStatus", "birthPlace", "occupation"],
    sites: {
      ancestry: { id: "8991" },
      baclac: { id: "Census of Canada, 1921", altId: "census1921" },
    },
  },
  {
    wtsId: "CanadaCensus1931",
    title: "1931 Census of Canada",
    country: "Canada",
    dates: { year: 1931 },
    householdTableColumns: ["name", "gender", "age", "relationship", "maritalStatus", "birthPlace", "occupation"],
    sites: {
      ancestry: { id: "62640" },
    },
  },
  {
    wtsId: "CanadaCensus1870Manitoba",
    title: "1870 Census of Manitoba",
    country: "Canada",
    dates: { year: 1870 },
    sites: {
      // not on fs or fmp
      ancestry: { id: "61494" },
      baclac: {
        id: "Census of Manitoba, 1870",
        altId: "census1870",
        useSearchFields: ["gender", "age", "maritalStatus"],
      },
    },
  },
  {
    wtsId: "CanadaCensus1906NorthwestProvinces",
    title: "1906 Census of Northwest Provinces",
    country: "Canada",
    dates: { year: 1906 },
    sites: {
      fs: { id: "1584925" },
      ancestry: { id: "8827" },
      baclac: { id: "Census of Northwest Provinces, 1906", altId: "" },
    },
  },
  {
    wtsId: "CanadaCensus1916Prairie",
    title: "1916 Census of Manitoba",
    country: "Canada",
    dates: { year: 1916 },
    sites: {
      fs: { id: "1529118" },
      ancestry: { id: "1556" },
      baclac: { id: "Census of the Prairie Provinces, 1916", altId: "" },
    },
  },
  {
    wtsId: "CanadaCensus1926Prairie",
    title: "1926 Census of Manitoba",
    country: "Canada",
    dates: { year: 1926 },
    sites: {
      fs: { id: "3005862" },
      baclac: { id: "Census of the Prairie Provinces, 1926", altId: "" },
    },
  },

  // Poland
  {
    wtsId: "PolandBirthReg",
    title: "Poland Registration Birth Index",
    country: "Poland",
    isBirth: true,
    sites: {
      geneteka: { id: "births" },
    },
  },
  {
    wtsId: "PolandDeathReg",
    title: "Poland Registration Death Index",
    country: "Poland",
    isDeath: true,
    sites: {
      geneteka: { id: "deaths" },
    },
  },
  {
    wtsId: "PolandMarriageReg",
    title: "Poland Registration Marriage Index",
    country: "Poland",
    isMarriage: true,
    sites: {
      geneteka: { id: "marriages" },
    },
  },

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  // Netherlands
  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  {
    wtsId: "NetherlandsBaptisms",
    title: "DTB Dopen",
    country: "Nederland",
    sites: {
      wiewaswie: { id: "DTB Dopen" },
      openarch: { id: "DTB Dopen" },
    },
  },
  {
    wtsId: "NetherlandsChurchMarriages",
    title: "DTB Trouwen",
    country: "Nederland",
    sites: {
      wiewaswie: { id: "DTB Trouwen" },
      openarch: { id: "DTB Trouwen" },
    },
  },
  {
    wtsId: "NetherlandsBurials",
    title: "DTB Begraven",
    country: "Nederland",
    sites: {
      wiewaswie: { id: "DTB Begraven" },
      openarch: { id: "DTB Begraven" },
    },
  },
  {
    wtsId: "NetherlandsChurchMembership",
    title: "DTB Lidmaten",
    country: "Nederland",
    sites: {
      wiewaswie: { id: "DTB Overig" },
      openarch: { id: "other:DTB Lidmaten" },
    },
  },
  {
    wtsId: "NetherlandsCivilBirths",
    title: "Netherlands Civil Births",
    country: "Nederland",
    sites: {
      wiewaswie: { id: "BS Geboorte" },
      openarch: { id: "BS Geboorte" },
    },
  },
  {
    wtsId: "NetherlandsCivilMarriages",
    title: "Netherlands Civil Marriages",
    country: "Nederland",
    sites: {
      wiewaswie: { id: "BS Huwelijk" },
      openarch: { id: "BS Huwelijk" },
    },
  },
  {
    wtsId: "NetherlandsCivilDeaths",
    title: "Netherlands Civil Deaths",
    country: "Nederland",
    sites: {
      wiewaswie: { id: "BS Overlijden" },
      openarch: { id: "BS Overlijden" },
      ancestry: { id: "61287" },
    },
  },
];

const RC = {
  findCollection: function (siteName, collectionId) {
    for (let collection of RecordCollectionData) {
      if (collection.sites && collection.sites[siteName] && collection.sites[siteName].id == collectionId) {
        return collection;
      }
    }
  },
  findCollectionByAltId: function (siteName, altCollectionId) {
    for (let collection of RecordCollectionData) {
      if (collection.sites && collection.sites[siteName] && collection.sites[siteName].altId == altCollectionId) {
        return collection;
      }
    }
  },
  findCollectionByWtsId: function (collectionId) {
    for (let collection of RecordCollectionData) {
      if (collection.wtsId == collectionId) {
        return collection;
      }
    }
  },
  getCollectionsThatThisCollectionIsPartOf: function (collection) {
    let result = [];
    if (collection.partOf) {
      for (let owningCollectionWtsId of collection.partOf) {
        let owningCollection = RC.findCollectionByWtsId(owningCollectionWtsId);
        if (owningCollection) {
          result.push(owningCollection);

          let parentCollections = RC.getCollectionsThatThisCollectionIsPartOf(owningCollection);
          for (let parentCollection of parentCollections) {
            result.push(parentCollection);
          }
        } else {
          console.log("Error: owningCollectionWtsId of '" + owningCollectionWtsId + "' was not found");
        }
      }
    }
    return result;
  },
  getCollectionsThatArePartOfThisCollection: function (collection) {
    let result = [];

    function doesCollectionOwnCollection(parentCollection, childCollection) {
      let parentWtsId = parentCollection.wtsId;
      if (childCollection.partOf) {
        for (let owningCollectionWtsId of childCollection.partOf) {
          if (owningCollectionWtsId == parentWtsId) {
            return true;
          }
          let owningCollection = RC.findCollectionByWtsId(owningCollectionWtsId);
          if (doesCollectionOwnCollection(parentCollection, owningCollection)) {
            return true;
          }
        }
      }
      return false;
    }

    for (let otherCollection of RecordCollectionData) {
      if (doesCollectionOwnCollection(collection, otherCollection)) {
        result.push(otherCollection);
      }
    }
    return result;
  },
  mapCollectionId: function (sourceSiteName, sourceCollectionId, targetSiteName, sourceCountry, eventYearString) {
    let eventYear = parseInt(eventYearString);
    if (isNaN(eventYear)) {
      eventYear = undefined;
    }

    let sourceCollection = RC.findCollection(sourceSiteName, sourceCollectionId);
    let targetCollectionId = RC.getSiteIdFromCollection(sourceCollection, targetSiteName);
    if (!targetCollectionId && sourceCollection) {
      // sometimes collections don't map exactly, the source collection could be part of a collection
      let owningCollections = RC.getCollectionsThatThisCollectionIsPartOf(sourceCollection);
      for (let owningCollection of owningCollections) {
        let owningTargetCollectionId = RC.getSiteIdFromCollection(owningCollection, targetSiteName);
        if (owningTargetCollectionId) {
          return owningTargetCollectionId;
        }
      }
      // or other collections could be part of the source collection
      let bestMatchCollection = undefined;
      let ownedCollections = RC.getCollectionsThatArePartOfThisCollection(sourceCollection);
      for (let ownedCollection of ownedCollections) {
        // Note there could be several collections that are part of this collection
        // we should use country as a guide
        let ownedTargetCollectionId = RC.getSiteIdFromCollection(ownedCollection, targetSiteName);
        if (ownedTargetCollectionId) {
          if (eventYear && ownedCollection.sites) {
            let siteCollection = ownedCollection.sites[targetSiteName];
            let collDates = RC.getCollectionDates(ownedCollection, siteCollection);

            let isYearInRange = false;
            if (collDates.from && collDates.to) {
              if (eventYear >= collDates.from && eventYear <= collDates.to) {
                isYearInRange = true;
              }
            } else if (collDates.year && collDates.year == eventYear) {
              isYearInRange = true;
            }

            let isCountryOK = false;
            if (sourceCountry) {
              if (ownedCollection.country == sourceCountry) {
                isCountryOK = true;
              } else if (CD.isPartOf(sourceCountry, ownedCollection.country)) {
                isCountryOK = true;
              } else if (CD.isPartOf(ownedCollection.country, sourceCountry)) {
                isCountryOK = true;
              }
            } else {
              isCountryOK = true;
            }

            if (isYearInRange && isCountryOK) {
              return ownedTargetCollectionId;
            }
          } else if (ownedCollection.country == sourceCountry) {
            return ownedTargetCollectionId;
          }

          if (!bestMatchCollection) {
            bestMatchCollection = ownedCollection;
          }
        }
      }
      if (bestMatchCollection) {
        let bestMatchCollectionId = RC.getSiteIdFromCollection(bestMatchCollection, targetSiteName);
        targetCollectionId = bestMatchCollectionId;
      }
    }
    return targetCollectionId;
  },
  getSiteIdFromCollection: function (collection, site) {
    if (collection && collection.sites && collection.sites[site]) {
      return collection.sites[site].id;
    }
  },
  getCountryFromCollection: function (collection) {
    if (collection) {
      return collection.country;
    }
  },
  getCollectionDates: function (collection, siteCollection) {
    let collDates = siteCollection.dates;
    if (!collDates) {
      collDates = collection.dates;
      if (!collDates) {
        //console.log("return false, no dates");
        return false;
      }
    } else if (collection.dates) {
      // there is a dates field in both this sites collection data and in the whole collection
      // we should combine them using the site one as priority
      for (const [key, value] of Object.entries(collection.dates)) {
        if (!collDates[key]) {
          collDates[key] = value;
        }
      }
    }

    return collDates;
  },
  areSourceDatesInCollectionRange: function (sourceDates, collection, siteCollection) {
    let lifeSpan = 120;
    if (sourceDates.maxLifespan) {
      lifeSpan = sourceDates.maxLifespan;
    }

    //console.log("areSourceDatesInCollectionRange, sourceDates and collection:")
    //console.log(sourceDates);
    //console.log(collection);

    let collDates = RC.getCollectionDates(collection, siteCollection);

    let isBirthCollection = collection.isBirth;
    let isDeathCollection = collection.isDeath;

    let birthYear = parseInt(sourceDates.birthYear);
    let deathYear = parseInt(sourceDates.deathYear);
    let eventYear = parseInt(sourceDates.eventYear);

    let minSourceYear = birthYear;
    if (!minSourceYear) {
      if (deathYear) {
        minSourceYear = deathYear - lifeSpan;
      } else {
        minSourceYear = eventYear - lifeSpan;
      }
    }

    let maxSourceYear = deathYear;
    if (!maxSourceYear) {
      if (birthYear) {
        maxSourceYear = birthYear + lifeSpan;
      } else {
        maxSourceYear = eventYear + lifeSpan;
      }
    }

    if (isBirthCollection && birthYear) {
      // must have from and to years
      let fromYear = collDates.from;
      let toYear = collDates.to;
      let isInRange = birthYear + 1 >= fromYear && birthYear <= toYear;
      //console.log("return (a) : " + isInRange);
      return isInRange;
    }

    if (isDeathCollection && deathYear) {
      // must have from and to years
      let fromYear = collDates.from;
      let toYear = collDates.to;
      let isInRange = deathYear + 1 >= fromYear && deathYear <= toYear;
      //console.log("return (b) : " + isInRange);
      return isInRange;
    }

    if (collDates.year) {
      let collYear = collDates.year;
      let isInRange = collYear + 2 >= minSourceYear && collYear - 2 <= maxSourceYear;
      //console.log("return (c) : " + isInRange);
      return isInRange;
    } else {
      // must have from and to years
      let fromYear = collDates.from;
      let toYear = collDates.to;
      let isInRange = maxSourceYear >= fromYear && minSourceYear <= toYear;
      //console.log("return (d) : " + isInRange);
      return isInRange;
    }

    return false;
  },
  areAnyCountriesInCollectionRange: function (countryArray, collection) {
    if (!countryArray) {
      //console.log("areAnyCountriesInCollectionRange, no countries")
      return false;
    }

    //console.log("areAnyCountriesInCollectionRange, countryArray and collection:")
    //console.log(countryArray);
    //console.log(collection);

    let collCountry = collection.country;

    for (let country of countryArray) {
      if (country == collCountry || CD.isPartOf(country, collCountry) || CD.isPartOf(collCountry, country)) {
        //console.log("return true, country = " + country);
        return true;
      }
      //console.log("country: " + country + " is not equivalent to: " + collCountry);
    }
    //console.log("return false");
    return false;
  },
  findCollectionsForSiteWithinDateRangeAndCountries: function (siteName, dates, countryArray) {
    let collectionArray = [];
    for (let collection of RecordCollectionData) {
      if (collection.sites) {
        let siteCollection = collection.sites[siteName];
        if (siteCollection) {
          if (RC.areSourceDatesInCollectionRange(dates, collection, siteCollection)) {
            if (
              !countryArray ||
              countryArray.length == 0 ||
              RC.areAnyCountriesInCollectionRange(countryArray, collection)
            ) {
              collectionArray.push(collection);
            }
          }
        }
      }
    }
    return collectionArray;
  },
  getFieldFromCollectionOrOwningCollections: function (collection, fieldName) {
    if (collection[fieldName] != undefined) {
      return collection[fieldName];
    }

    if (collection.partOf && collection.partOf.length > 0) {
      for (let owningCollectionWtsId of collection.partOf) {
        let owningCollection = RC.findCollectionByWtsId(owningCollectionWtsId);
        let fieldValue = RC.getFieldFromCollectionOrOwningCollections(owningCollection, fieldName);
        if (fieldValue != undefined) {
          return fieldValue;
        }
      }
    }

    return undefined;
  },
  doesCollectionSupportSearchField: function (collection, siteName, fieldName) {
    if (!collection) {
      return false;
    }

    let siteData = collection.sites[siteName];
    if (!siteData) {
      return false;
    }

    let useFields = siteData.useSearchFields;
    if (!useFields) {
      // if no fields specified then assume use all
      return true;
    }

    if (useFields.includes(fieldName)) {
      return true;
    }

    return false;
  },
};

export { RC };
