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

const regions = [
  {
    name: "Østlandet",
    code: "1",
    counties: [
      {
        name: "Østfold",
        code: "01",
        places: [
          {
            name: "Aremark",
            code: "0118",
          },
          {
            name: "Askim",
            code: "0124",
          },
          {
            name: "Berg",
            code: "0116",
          },
          {
            name: "Borge",
            code: "0113",
          },
          {
            name: "Degernes",
            code: "0129",
          },
          {
            name: "Eidsberg",
            code: "0125",
          },
          {
            name: "Fredrikstad",
            code: "0103",
          },
          {
            name: "Glemmen",
            code: "0132",
          },
          {
            name: "Halden",
            code: "0101",
          },
          {
            name: "Hobøl",
            code: "0138",
          },
          {
            name: "Hvaler",
            code: "0111",
          },
          {
            name: "Idd",
            code: "0117",
          },
          {
            name: "Kråkerøy",
            code: "0133",
          },
          {
            name: "Moss",
            code: "0104",
          },
          {
            name: "Mysen",
            code: "0126",
          },
          {
            name: "Onsøy",
            code: "0134",
          },
          {
            name: "Rakkestad",
            code: "0128",
          },
          {
            name: "Rolvsøy",
            code: "0131",
          },
          {
            name: "Rygge",
            code: "0136",
          },
          {
            name: "Rødenes",
            code: "0120",
          },
          {
            name: "Rømskog",
            code: "0121",
          },
          {
            name: "Råde",
            code: "0135",
          },
          {
            name: "Sarpsborg",
            code: "0102",
          },
          {
            name: "Skiptvet",
            code: "0127",
          },
          {
            name: "Skjeberg",
            code: "0115",
          },
          {
            name: "Spydeberg",
            code: "0123",
          },
          {
            name: "Torsnes",
            code: "0112",
          },
          {
            name: "Trøgstad",
            code: "0122",
          },
          {
            name: "Tune",
            code: "0130",
          },
          {
            name: "Varteig",
            code: "0114",
          },
          {
            name: "Våler",
            code: "0137",
          },
          {
            name: "Øymark",
            code: "0119",
          },
        ],
      },
      {
        name: "Akershus",
        code: "02",
        places: [
          {
            name: "Aker",
            code: "0218",
          },
          {
            name: "Asker",
            code: "0220",
          },
          {
            name: "Aurskog",
            code: "0224",
          },
          {
            name: "Blaker",
            code: "0225",
          },
          {
            name: "Bærum",
            code: "0219",
          },
          {
            name: "Drøbak",
            code: "0203",
          },
          {
            name: "Eidsvoll",
            code: "0237",
          },
          {
            name: "Enebakk",
            code: "0229",
          },
          {
            name: "Feiring",
            code: "0240",
          },
          {
            name: "Fet",
            code: "0227",
          },
          {
            name: "Frogn",
            code: "0215",
          },
          {
            name: "Gjerdrum",
            code: "0234",
          },
          {
            name: "Hurdal",
            code: "0239",
          },
          {
            name: "Kråkstad",
            code: "0212",
          },
          {
            name: "Lillestrøm",
            code: "0232",
          },
          {
            name: "Lørenskog",
            code: "0230",
          },
          {
            name: "Nannestad",
            code: "0238",
          },
          {
            name: "Nes",
            code: "0236",
          },
          {
            name: "Nesodden",
            code: "0216",
          },
          {
            name: "Nittedal",
            code: "0233",
          },
          {
            name: "Nordre Høland",
            code: "0222",
          },
          {
            name: "Oppegård",
            code: "0217",
          },
          {
            name: "Rælingen",
            code: "0228",
          },
          {
            name: "Setskog",
            code: "0223",
          },
          {
            name: "Skedsmo",
            code: "0231",
          },
          {
            name: "Ski",
            code: "0213",
          },
          {
            name: "Son",
            code: "0201",
          },
          {
            name: "Søndre Høland",
            code: "0221",
          },
          {
            name: "Sørum",
            code: "0226",
          },
          {
            name: "Ullensaker",
            code: "0235",
          },
          {
            name: "Vestby",
            code: "0211",
          },
          {
            name: "Ås",
            code: "0214",
          },
        ],
      },
      ///////

      {
        name: "Oslo",
        code: "03",
        places: [
          {
            name: "Oslo",
            code: "0301",
          },
        ],
      },
      ////////////
      {
        name: "Hedmark",
        code: "04",
        places: [
          {
            name: "Alvdal",
            code: "0438",
          },
          {
            name: "Brandval",
            code: "0422",
          },
          {
            name: "Eidskog",
            code: "0420",
          },
          {
            name: "Elverum",
            code: "0427",
          },
          {
            name: "Engerdal",
            code: "0434",
          },
          {
            name: "Folldal",
            code: "0439",
          },
          {
            name: "Furnes",
            code: "0413",
          },
          {
            name: "Grue",
            code: "0423",
          },
          {
            name: "Hamar",
            code: "0401",
          },
          {
            name: "Hof",
            code: "0424",
          },
          {
            name: "Kongsvinger",
            code: "0402",
          },
          {
            name: "Kvikne",
            code: "0440",
          },
          {
            name: "Løten",
            code: "0415",
          },
          {
            name: "Nes",
            code: "0411",
          },
          {
            name: "Nord-Odal",
            code: "0418",
          },
          {
            name: "Os",
            code: "0435",
          },
          {
            name: "Ringsaker",
            code: "0412",
          },
          {
            name: "Romedal",
            code: "0416",
          },
          {
            name: "Sollia",
            code: "0431",
          },
          {
            name: "Stange",
            code: "0417",
          },
          {
            name: "Stor-Elvdal",
            code: "0430",
          },
          {
            name: "Sør-Odal",
            code: "0419",
          },
          {
            name: "Tolga",
            code: "0436",
          },
          {
            name: "Trysil",
            code: "0428",
          },
          {
            name: "Tynset",
            code: "0437",
          },
          {
            name: "Vang",
            code: "0414",
          },
          {
            name: "Vinger",
            code: "0421",
          },
          {
            name: "Våler",
            code: "0426",
          },
          {
            name: "Ytre Rendal",
            code: "0432",
          },
          {
            name: "Øvre Rendal",
            code: "0433",
          },
          {
            name: "Åmot",
            code: "0429",
          },
          {
            name: "Åsnes",
            code: "0425",
          },
        ],
      },
      /////
      {
        name: "Oppland",
        code: "05",
        places: [
          {
            name: "Biri",
            code: "0525",
          },
          {
            name: "Brandbu",
            code: "0535",
          },
          {
            name: "Dovre",
            code: "0511",
          },
          {
            name: "Eina",
            code: "0530",
          },
          {
            name: "Etnedal",
            code: "0541",
          },
          {
            name: "Fluberg",
            code: "0537",
          },
          {
            name: "Fåberg",
            code: "0524",
          },
          {
            name: "Gjøvik",
            code: "0502",
          },
          {
            name: "Gran",
            code: "0534",
          },
          {
            name: "Heidal",
            code: "0516",
          },
          {
            name: "Jevnaker",
            code: "0532",
          },
          {
            name: "Kolbu",
            code: "0531",
          },
          {
            name: "Lesja",
            code: "0512",
          },
          {
            name: "Lillehammer",
            code: "0501",
          },
          {
            name: "Lom",
            code: "0514",
          },
          {
            name: "Lunner",
            code: "0533",
          },
          {
            name: "Nord-Aurdal",
            code: "0542",
          },
          {
            name: "Nord-Fron",
            code: "0518",
          },
          {
            name: "Nordre Land",
            code: "0538",
          },
          {
            name: "Ringebu",
            code: "0520",
          },
          {
            name: "Sel",
            code: "0517",
          },
          {
            name: "Skjåk",
            code: "0513",
          },
          {
            name: "Snertingdal",
            code: "0526",
          },
          {
            name: "Søndre Land",
            code: "0536",
          },
          {
            name: "Sør-Aurdal",
            code: "0540",
          },
          {
            name: "Sør-Fron",
            code: "0519",
          },
          {
            name: "Torpa",
            code: "0539",
          },
          {
            name: "Vang",
            code: "0545",
          },
          {
            name: "Vardal",
            code: "0527",
          },
          {
            name: "Vestre Gausdal",
            code: "0523",
          },
          {
            name: "Vestre Slidre",
            code: "0543",
          },
          {
            name: "Vestre Toten",
            code: "0529",
          },
          {
            name: "Vågå",
            code: "0515",
          },
          {
            name: "Østre Gausdal",
            code: "0522",
          },
          {
            name: "Østre Toten",
            code: "0528",
          },
          {
            name: "Øyer",
            code: "0521",
          },
          {
            name: "Øystre Slidre",
            code: "0544",
          },
        ],
      },
      {
        name: "Buskerud",
        code: "06",
        places: [
          {
            name: "Drammen",
            code: "0602",
          },
          {
            name: "Flesberg",
            code: "0631",
          },
          {
            name: "Flå",
            code: "0615",
          },
          {
            name: "Gol",
            code: "0617",
          },
          {
            name: "Hemsedal",
            code: "0618",
          },
          {
            name: "Hol",
            code: "0620",
          },
          {
            name: "Hole",
            code: "0612",
          },
          {
            name: "Hurum",
            code: "0628",
          },
          {
            name: "Hønefoss",
            code: "0601",
          },
          {
            name: "Kongsberg",
            code: "0604",
          },
          {
            name: "Krødsherad",
            code: "0622",
          },
          {
            name: "Lier",
            code: "0626",
          },
          {
            name: "Modum",
            code: "0623",
          },
          {
            name: "Nedre Eiker",
            code: "0625",
          },
          {
            name: "Nes",
            code: "0616",
          },
          {
            name: "Norderhov",
            code: "0613",
          },
          {
            name: "Nore",
            code: "0633",
          },
          {
            name: "Rollag",
            code: "0632",
          },
          {
            name: "Røyken",
            code: "0627",
          },
          {
            name: "Sigdal",
            code: "0621",
          },
          {
            name: "Tyristrand",
            code: "0611",
          },
          {
            name: "Uvdal",
            code: "0634",
          },
          {
            name: "Ytre Sandsvær",
            code: "0629",
          },
          {
            name: "Øvre Eiker",
            code: "0624",
          },
          {
            name: "Øvre Sandsvær",
            code: "0630",
          },
          {
            name: "Ådal",
            code: "0614",
          },
          {
            name: "Ål",
            code: "0619",
          },
        ],
      },
      {
        name: "Vestfold",
        code: "07",
        places: [
          {
            name: "Andebu",
            code: "0719",
          },
          {
            name: "Borre",
            code: "0717",
          },
          {
            name: "Botne",
            code: "0715",
          },
          {
            name: "Brunlanes",
            code: "0726",
          },
          {
            name: "Hedrum",
            code: "0727",
          },
          {
            name: "Hof",
            code: "0714",
          },
          {
            name: "Holmestrand",
            code: "0702",
          },
          {
            name: "Horten",
            code: "0703",
          },
          {
            name: "Lardal",
            code: "0728",
          },
          {
            name: "Larvik",
            code: "0707",
          },
          {
            name: "Nøtterøy",
            code: "0722",
          },
          {
            name: "Ramnes",
            code: "0718",
          },
          {
            name: "Sandar",
            code: "0724",
          },
          {
            name: "Sande",
            code: "0713",
          },
          {
            name: "Sandefjord",
            code: "0706",
          },
          {
            name: "Sem",
            code: "0721",
          },
          {
            name: "Skoger",
            code: "0712",
          },
          {
            name: "Stavern",
            code: "0708",
          },
          {
            name: "Stokke",
            code: "0720",
          },
          {
            name: "Strømm",
            code: "0711",
          },
          {
            name: "Svelvik",
            code: "0701",
          },
          {
            name: "Tjølling",
            code: "0725",
          },
          {
            name: "Tjøme",
            code: "0723",
          },
          {
            name: "Tønsberg",
            code: "0705",
          },
          {
            name: "Våle",
            code: "0716",
          },
          {
            name: "Åsgårdstrand",
            code: "0704",
          },
        ],
      },
      ////
      {
        name: "Telemark",
        code: "08",
        places: [
          {
            name: "Bamble",
            code: "0814",
          },
          {
            name: "Brevik",
            code: "0804",
          },
          {
            name: "Bø",
            code: "0821",
          },
          {
            name: "Drangedal",
            code: "0817",
          },
          {
            name: "Eidanger",
            code: "0813",
          },
          {
            name: "Fyresdal",
            code: "0831",
          },
          {
            name: "Gjerpen",
            code: "0812",
          },
          {
            name: "Gransherad",
            code: "0824",
          },
          {
            name: "Heddal",
            code: "0823",
          },
          {
            name: "Hjartdal",
            code: "0827",
          },
          {
            name: "Holla",
            code: "0819",
          },
          {
            name: "Hovin",
            code: "0825",
          },
          {
            name: "Kragerø",
            code: "0801",
          },
          {
            name: "Kviteseid",
            code: "0829",
          },
          {
            name: "Langesund",
            code: "0802",
          },
          {
            name: "Lunde",
            code: "0820",
          },
          {
            name: "Lårdal",
            code: "0833",
          },
          {
            name: "Mo",
            code: "0832",
          },
          {
            name: "Nissedal",
            code: "0830",
          },
          {
            name: "Notodden",
            code: "0807",
          },
          {
            name: "Porsgrunn",
            code: "0805",
          },
          {
            name: "Rauland",
            code: "0835",
          },
          {
            name: "Sannidal",
            code: "0816",
          },
          {
            name: "Sauherad",
            code: "0822",
          },
          {
            name: "Seljord",
            code: "0828",
          },
          {
            name: "Siljan",
            code: "0811",
          },
          {
            name: "Skien",
            code: "0806",
          },
          {
            name: "Skåtøy",
            code: "0815",
          },
          {
            name: "Solum",
            code: "0818",
          },
          {
            name: "Stathelle",
            code: "0803",
          },
          {
            name: "Tinn",
            code: "0826",
          },
          {
            name: "Vinje",
            code: "0834",
          },
        ],
      },
    ],
  },
  {
    name: "Sørlandet",
    code: "2",
    counties: [
      {
        name: "Aust-Agder",
        code: "09",
        places: [
          {
            name: "Arendal",
            code: "0903",
          },
          {
            name: "Austre Moland",
            code: "0918",
          },
          {
            name: "Birkenes",
            code: "0928",
          },
          {
            name: "Bygland",
            code: "0938",
          },
          {
            name: "Bykle",
            code: "0941",
          },
          {
            name: "Dypvåg",
            code: "0915",
          },
          {
            name: "Eide",
            code: "0925",
          },
          {
            name: "Evje",
            code: "0937",
          },
          {
            name: "Fjære",
            code: "0923",
          },
          {
            name: "Flosta",
            code: "0916",
          },
          {
            name: "Froland",
            code: "0919",
          },
          {
            name: "Gjerstad",
            code: "0911",
          },
          {
            name: "Gjøvdal",
            code: "0930",
          },
          {
            name: "Grimstad",
            code: "0904",
          },
          {
            name: "Herefoss",
            code: "0933",
          },
          {
            name: "Hisøy",
            code: "0922",
          },
          {
            name: "Holt",
            code: "0914",
          },
          {
            name: "Hornnes",
            code: "0936",
          },
          {
            name: "Hylestad",
            code: "0939",
          },
          {
            name: "Høvåg",
            code: "0927",
          },
          {
            name: "Iveland",
            code: "0935",
          },
          {
            name: "Landvik",
            code: "0924",
          },
          {
            name: "Lillesand",
            code: "0905",
          },
          {
            name: "Mykland",
            code: "0932",
          },
          {
            name: "Risør",
            code: "0901",
          },
          {
            name: "Stokken",
            code: "0917",
          },
          {
            name: "Søndeled",
            code: "0913",
          },
          {
            name: "Tovdal",
            code: "0931",
          },
          {
            name: "Tromøy",
            code: "0921",
          },
          {
            name: "Tvedestrand",
            code: "0902",
          },
          {
            name: "Valle",
            code: "0940",
          },
          {
            name: "Vegusdal",
            code: "0934",
          },
          {
            name: "Vegårshei",
            code: "0912",
          },
          {
            name: "Vestre Moland",
            code: "0926",
          },
          {
            name: "Øyestad",
            code: "0920",
          },
          {
            name: "Åmli",
            code: "0929",
          },
        ],
      },
      {
        name: "Vest-Agder",
        code: "10",
        places: [
          {
            name: "Austad",
            code: "1031",
          },
          {
            name: "Bakke",
            code: "1045",
          },
          {
            name: "Bjelland",
            code: "1024",
          },
          {
            name: "Eiken",
            code: "1035",
          },
          {
            name: "Farsund",
            code: "1003",
          },
          {
            name: "Feda",
            code: "1038",
          },
          {
            name: "Finsland",
            code: "1023",
          },
          {
            name: "Fjotland",
            code: "1036",
          },
          {
            name: "Flekkefjord",
            code: "1004",
          },
          {
            name: "Greipstad",
            code: "1017",
          },
          {
            name: "Grindheim",
            code: "1025",
          },
          {
            name: "Gyland",
            code: "1044",
          },
          {
            name: "Halse og Harkmark",
            code: "1019",
          },
          {
            name: "Herad",
            code: "1039",
          },
          {
            name: "Hidra",
            code: "1042",
          },
          {
            name: "Holum",
            code: "1020",
          },
          {
            name: "Hægebostad",
            code: "1034",
          },
          {
            name: "Hægeland",
            code: "1015",
          },
          {
            name: "Konsmo",
            code: "1027",
          },
          {
            name: "Kristiansand",
            code: "1001",
          },
          {
            name: "Kvinesdal",
            code: "1037",
          },
          {
            name: "Kvås",
            code: "1033",
          },
          {
            name: "Laudal",
            code: "1022",
          },
          {
            name: "Lista",
            code: "1041",
          },
          {
            name: "Lyngdal",
            code: "1032",
          },
          {
            name: "Mandal",
            code: "1002",
          },
          {
            name: "Nes",
            code: "1043",
          },
          {
            name: "Oddernes",
            code: "1012",
          },
          {
            name: "Randesund",
            code: "1011",
          },
          {
            name: "Spangereid",
            code: "1030",
          },
          {
            name: "Spind",
            code: "1040",
          },
          {
            name: "Søgne",
            code: "1018",
          },
          {
            name: "Sør-Audnedal",
            code: "1029",
          },
          {
            name: "Tonstad",
            code: "1046",
          },
          {
            name: "Tveit",
            code: "1013",
          },
          {
            name: "Vennesla",
            code: "1014",
          },
          {
            name: "Vigmostad",
            code: "1028",
          },
          {
            name: "Øvre Sirdal",
            code: "1047",
          },
          {
            name: "Øvrebø",
            code: "1016",
          },
          {
            name: "Øyslebø",
            code: "1021",
          },
          {
            name: "Åseral",
            code: "1026",
          },
        ],
      },
    ],
  },
  {
    name: "Vestlandet",
    code: "3",
    counties: [
      {
        name: "Rogaland",
        code: "11",
        places: [
          {
            name: "Avaldsnes",
            code: "1147",
          },
          {
            name: "Bjerkreim",
            code: "1114",
          },
          {
            name: "Bokn",
            code: "1145",
          },
          {
            name: "Egersund",
            code: "1101",
          },
          {
            name: "Eigersund herred",
            code: "1116",
          },
          {
            name: "Erfjord",
            code: "1137",
          },
          {
            name: "Finnøy",
            code: "1141",
          },
          {
            name: "Fister",
            code: "1132",
          },
          {
            name: "Forsand",
            code: "1129",
          },
          {
            name: "Gjesdal",
            code: "1122",
          },
          {
            name: "Haugesund",
            code: "1106",
          },
          {
            name: "Helleland",
            code: "1115",
          },
          {
            name: "Heskestad",
            code: "1113",
          },
          {
            name: "Hetland",
            code: "1126",
          },
          {
            name: "Hjelmeland",
            code: "1133",
          },
          {
            name: "Høle",
            code: "1128",
          },
          {
            name: "Høyland",
            code: "1123",
          },
          {
            name: "Imsland",
            code: "1156",
          },
          {
            name: "Jelsa",
            code: "1138",
          },
          {
            name: "Klepp",
            code: "1120",
          },
          {
            name: "Kopervik",
            code: "1105",
          },
          {
            name: "Kvitsøy",
            code: "1144",
          },
          {
            name: "Lund",
            code: "1112",
          },
          {
            name: "Madla",
            code: "1125",
          },
          {
            name: "Mosterøy",
            code: "1143",
          },
          {
            name: "Nedstrand",
            code: "1139",
          },
          {
            name: "Nærbø",
            code: "1119",
          },
          {
            name: "Ogna",
            code: "1117",
          },
          {
            name: "Randaberg",
            code: "1127",
          },
          {
            name: "Rennesøy",
            code: "1142",
          },
          {
            name: "Sand",
            code: "1136",
          },
          {
            name: "Sandeid",
            code: "1158",
          },
          {
            name: "Sandnes",
            code: "1102",
          },
          {
            name: "Sauda",
            code: "1135",
          },
          {
            name: "Sjernarøy",
            code: "1140",
          },
          {
            name: "Skjold",
            code: "1154",
          },
          {
            name: "Skudenes",
            code: "1150",
          },
          {
            name: "Skudeneshavn",
            code: "1104",
          },
          {
            name: "Skåre",
            code: "1153",
          },
          {
            name: "Sokndal",
            code: "1111",
          },
          {
            name: "Sola",
            code: "1124",
          },
          {
            name: "Stangaland",
            code: "1148",
          },
          {
            name: "Stavanger",
            code: "1103",
          },
          {
            name: "Strand",
            code: "1130",
          },
          {
            name: "Suldal",
            code: "1134",
          },
          {
            name: "Time",
            code: "1121",
          },
          {
            name: "Torvastad",
            code: "1152",
          },
          {
            name: "Tysvær",
            code: "1146",
          },
          {
            name: "Utsira",
            code: "1151",
          },
          {
            name: "Varhaug",
            code: "1118",
          },
          {
            name: "Vats",
            code: "1155",
          },
          {
            name: "Vikedal",
            code: "1157",
          },
          {
            name: "Åkra",
            code: "1149",
          },
          {
            name: "Årdal",
            code: "1131",
          },
        ],
      },
      {
        name: "Hordaland",
        code: "12",
        places: [
          {
            name: "Alversund",
            code: "1257",
          },
          {
            name: "Askøy",
            code: "1247",
          },
          {
            name: "Austevoll",
            code: "1244",
          },
          {
            name: "Austrheim",
            code: "1264",
          },
          {
            name: "Bremnes",
            code: "1220",
          },
          {
            name: "Bruvik",
            code: "1251",
          },
          {
            name: "Bømlo",
            code: "1219",
          },
          {
            name: "Eidfjord",
            code: "1232",
          },
          {
            name: "Etne",
            code: "1211",
          },
          {
            name: "Evanger",
            code: "1237",
          },
          {
            name: "Fana",
            code: "1249",
          },
          {
            name: "Fedje",
            code: "1265",
          },
          {
            name: "Fitjar",
            code: "1222",
          },
          {
            name: "Fjelberg",
            code: "1213",
          },
          {
            name: "Fjell",
            code: "1246",
          },
          {
            name: "Fusa",
            code: "1241",
          },
          {
            name: "Granvin",
            code: "1234",
          },
          {
            name: "Hamre",
            code: "1254",
          },
          {
            name: "Haus",
            code: "1250",
          },
          {
            name: "Herdla",
            code: "1258",
          },
          {
            name: "Hjelme",
            code: "1259",
          },
          {
            name: "Hordabø",
            code: "1260",
          },
          {
            name: "Hosanger",
            code: "1253",
          },
          {
            name: "Hålandsdal",
            code: "1239",
          },
          {
            name: "Jondal",
            code: "1227",
          },
          {
            name: "Kinsarvik",
            code: "1231",
          },
          {
            name: "Kvam",
            code: "1238",
          },
          {
            name: "Kvinnherad",
            code: "1224",
          },
          {
            name: "Laksevåg",
            code: "1248",
          },
          {
            name: "Lindås",
            code: "1263",
          },
          {
            name: "Manger",
            code: "1261",
          },
          {
            name: "Masfjorden",
            code: "1266",
          },
          {
            name: "Modalen",
            code: "1252",
          },
          {
            name: "Moster",
            code: "1218",
          },
          {
            name: "Mæland",
            code: "1256",
          },
          {
            name: "Odda",
            code: "1228",
          },
          {
            name: "Os",
            code: "1243",
          },
          {
            name: "Røldal",
            code: "1229",
          },
          {
            name: "Samnanger",
            code: "1242",
          },
          {
            name: "Skånevik",
            code: "1212",
          },
          {
            name: "Stord",
            code: "1221",
          },
          {
            name: "Strandebarm",
            code: "1226",
          },
          {
            name: "Strandvik",
            code: "1240",
          },
          {
            name: "Sund",
            code: "1245",
          },
          {
            name: "Sveio",
            code: "1216",
          },
          {
            name: "Sæbø",
            code: "1262",
          },
          {
            name: "Tysnes",
            code: "1223",
          },
          {
            name: "Ullensvang",
            code: "1230",
          },
          {
            name: "Ulvik",
            code: "1233",
          },
          {
            name: "Valestrand",
            code: "1217",
          },
          {
            name: "Varaldsøy",
            code: "1225",
          },
          {
            name: "Vikebygd",
            code: "1215",
          },
          {
            name: "Voss",
            code: "1235",
          },
          {
            name: "Vossestrand",
            code: "1236",
          },
          {
            name: "Ølen",
            code: "1214",
          },
          {
            name: "Åsane",
            code: "1255",
          },
        ],
      },
      {
        name: "Bergen",
        code: "13",
        places: [
          {
            name: "Bergen",
            code: "1301",
          },
        ],
      },
      {
        name: "Sogn og Fjordane",
        code: "14",
        places: [
          {
            name: "Askvoll",
            code: "1428",
          },
          {
            name: "Aurland",
            code: "1421",
          },
          {
            name: "Balestrand",
            code: "1418",
          },
          {
            name: "Borgund",
            code: "1423",
          },
          {
            name: "Breim",
            code: "1446",
          },
          {
            name: "Brekke",
            code: "1414",
          },
          {
            name: "Bremanger",
            code: "1438",
          },
          {
            name: "Bru",
            code: "1436",
          },
          {
            name: "Davik",
            code: "1442",
          },
          {
            name: "Eid",
            code: "1443",
          },
          {
            name: "Eikefjord",
            code: "1435",
          },
          {
            name: "Fjaler",
            code: "1429",
          },
          {
            name: "Florø",
            code: "1401",
          },
          {
            name: "Førde",
            code: "1432",
          },
          {
            name: "Gaular",
            code: "1430",
          },
          {
            name: "Gloppen",
            code: "1445",
          },
          {
            name: "Gulen",
            code: "1411",
          },
          {
            name: "Hafslo",
            code: "1425",
          },
          {
            name: "Hornindal",
            code: "1444",
          },
          {
            name: "Hyllestad",
            code: "1413",
          },
          {
            name: "Innvik",
            code: "1447",
          },
          {
            name: "Jostedal",
            code: "1427",
          },
          {
            name: "Jølster",
            code: "1431",
          },
          {
            name: "Kinn",
            code: "1437",
          },
          {
            name: "Kyrkjebø",
            code: "1416",
          },
          {
            name: "Lavik",
            code: "1415",
          },
          {
            name: "Leikanger",
            code: "1419",
          },
          {
            name: "Luster",
            code: "1426",
          },
          {
            name: "Lærdal",
            code: "1422",
          },
          {
            name: "Naustdal",
            code: "1433",
          },
          {
            name: "Nord-Vågsøy",
            code: "1440",
          },
          {
            name: "Selje",
            code: "1441",
          },
          {
            name: "Sogndal",
            code: "1420",
          },
          {
            name: "Solund",
            code: "1412",
          },
          {
            name: "Stryn",
            code: "1448",
          },
          {
            name: "Sør-Vågsøy",
            code: "1439",
          },
          {
            name: "Vevring",
            code: "1434",
          },
          {
            name: "Vik",
            code: "1417",
          },
          {
            name: "Årdal",
            code: "1424",
          },
        ],
      },
      {
        name: "Møre og Romsdal",
        code: "15",
        places: [
          {
            name: "Aure",
            code: "1569",
          },
          {
            name: "Bolsøy",
            code: "1544",
          },
          {
            name: "Borgund",
            code: "1531",
          },
          {
            name: "Brattvær",
            code: "1574",
          },
          {
            name: "Bremsnes",
            code: "1554",
          },
          {
            name: "Bud",
            code: "1549",
          },
          {
            name: "Dalsfjord",
            code: "1518",
          },
          {
            name: "Edøy",
            code: "1573",
          },
          {
            name: "Eid",
            code: "1538",
          },
          {
            name: "Eide",
            code: "1551",
          },
          {
            name: "Eresfjord og Vistdal",
            code: "1542",
          },
          {
            name: "Frei",
            code: "1556",
          },
          {
            name: "Fræna",
            code: "1548",
          },
          {
            name: "Giske",
            code: "1532",
          },
          {
            name: "Gjemnes",
            code: "1557",
          },
          {
            name: "Grip",
            code: "1555",
          },
          {
            name: "Grytten",
            code: "1539",
          },
          {
            name: "Halsa",
            code: "1571",
          },
          {
            name: "Haram",
            code: "1534",
          },
          {
            name: "Hareid",
            code: "1517",
          },
          {
            name: "Hen",
            code: "1540",
          },
          {
            name: "Herøy",
            code: "1515",
          },
          {
            name: "Hjørundfjord",
            code: "1522",
          },
          {
            name: "Hopen",
            code: "1575",
          },
          {
            name: "Hustad",
            code: "1550",
          },
          {
            name: "Kornstad",
            code: "1552",
          },
          {
            name: "Kristiansund",
            code: "1503",
          },
          {
            name: "Kvernes",
            code: "1553",
          },
          {
            name: "Molde",
            code: "1502",
          },
          {
            name: "Nesset",
            code: "1543",
          },
          {
            name: "Nord-Aukra",
            code: "1547",
          },
          {
            name: "Norddal",
            code: "1524",
          },
          {
            name: "Rindal",
            code: "1567",
          },
          {
            name: "Rovde",
            code: "1513",
          },
          {
            name: "Sande",
            code: "1514",
          },
          {
            name: "Sandøy",
            code: "1546",
          },
          {
            name: "Skodje",
            code: "1529",
          },
          {
            name: "Stangvik",
            code: "1564",
          },
          {
            name: "Stemshaug",
            code: "1568",
          },
          {
            name: "Stordal",
            code: "1526",
          },
          {
            name: "Stranda",
            code: "1525",
          },
          {
            name: "Straumsnes",
            code: "1559",
          },
          {
            name: "Sunndal",
            code: "1563",
          },
          {
            name: "Sunnylven",
            code: "1523",
          },
          {
            name: "Surnadal",
            code: "1566",
          },
          {
            name: "Sykkylven",
            code: "1528",
          },
          {
            name: "Syvde",
            code: "1512",
          },
          {
            name: "Sør-Aukra",
            code: "1545",
          },
          {
            name: "Tingvoll",
            code: "1560",
          },
          {
            name: "Tresfjord",
            code: "1536",
          },
          {
            name: "Tustna",
            code: "1572",
          },
          {
            name: "Ulstein",
            code: "1516",
          },
          {
            name: "Valsøyfjord",
            code: "1570",
          },
          {
            name: "Vanylven",
            code: "1511",
          },
          {
            name: "Vartdal",
            code: "1521",
          },
          {
            name: "Vatne",
            code: "1530",
          },
          {
            name: "Vestnes",
            code: "1535",
          },
          {
            name: "Veøy",
            code: "1541",
          },
          {
            name: "Vigra",
            code: "1533",
          },
          {
            name: "Volda",
            code: "1519",
          },
          {
            name: "Voll",
            code: "1537",
          },
          {
            name: "Øksendal",
            code: "1561",
          },
          {
            name: "Øre",
            code: "1558",
          },
          {
            name: "Ørskog",
            code: "1527",
          },
          {
            name: "Ørsta",
            code: "1520",
          },
          {
            name: "Ålesund",
            code: "1501",
          },
          {
            name: "Ålvundeid",
            code: "1562",
          },
          {
            name: "Åsskard",
            code: "1565",
          },
        ],
      },
    ],
  },
  {
    name: "Trøndelag",
    code: "4",
    counties: [
      {
        name: "Sør-Trøndelag",
        code: "16",
        places: [
          {
            name: "Agdenes",
            code: "1622",
          },
          {
            name: "Bjugn",
            code: "1627",
          },
          {
            name: "Brekken",
            code: "1642",
          },
          {
            name: "Budal",
            code: "1647",
          },
          {
            name: "Buvik",
            code: "1656",
          },
          {
            name: "Byneset",
            code: "1655",
          },
          {
            name: "Børsa",
            code: "1658",
          },
          {
            name: "Fillan",
            code: "1616",
          },
          {
            name: "Flå",
            code: "1652",
          },
          {
            name: "Geitastrand",
            code: "1659",
          },
          {
            name: "Glåmos",
            code: "1643",
          },
          {
            name: "Haltdalen",
            code: "1645",
          },
          {
            name: "Heim",
            code: "1614",
          },
          {
            name: "Hemne",
            code: "1612",
          },
          {
            name: "Hitra",
            code: "1617",
          },
          {
            name: "Horg",
            code: "1650",
          },
          {
            name: "Hølonda",
            code: "1651",
          },
          {
            name: "Jøssund",
            code: "1629",
          },
          {
            name: "Klæbu",
            code: "1662",
          },
          {
            name: "Kvenvær",
            code: "1618",
          },
          {
            name: "Leinstrand",
            code: "1654",
          },
          {
            name: "Lensvik",
            code: "1623",
          },
          {
            name: "Malvik",
            code: "1663",
          },
          {
            name: "Meldal",
            code: "1636",
          },
          {
            name: "Melhus",
            code: "1653",
          },
          {
            name: "Nes",
            code: "1628",
          },
          {
            name: "Nord-Frøya",
            code: "1620",
          },
          {
            name: "Opdal",
            code: "1634",
          },
          {
            name: "Orkanger",
            code: "1639",
          },
          {
            name: "Orkdal",
            code: "1638",
          },
          {
            name: "Orkland",
            code: "1637",
          },
          {
            name: "Osen",
            code: "1633",
          },
          {
            name: "Rennebu",
            code: "1635",
          },
          {
            name: "Rissa",
            code: "1624",
          },
          {
            name: "Roan",
            code: "1632",
          },
          {
            name: "Røros",
            code: "1640",
          },
          {
            name: "Røros Landdistrikt",
            code: "1641",
          },
          {
            name: "Sandstad",
            code: "1615",
          },
          {
            name: "Selbu",
            code: "1664",
          },
          {
            name: "Singsås",
            code: "1646",
          },
          {
            name: "Skaun",
            code: "1657",
          },
          {
            name: "Snillfjord",
            code: "1613",
          },
          {
            name: "Soknedal",
            code: "1649",
          },
          {
            name: "Stadsbygd",
            code: "1625",
          },
          {
            name: "Stjørna",
            code: "1626",
          },
          {
            name: "Stoksund",
            code: "1631",
          },
          {
            name: "Strinda",
            code: "1660",
          },
          {
            name: "Støren",
            code: "1648",
          },
          {
            name: "Sør-Frøya",
            code: "1619",
          },
          {
            name: "Tiller",
            code: "1661",
          },
          {
            name: "Trondheim",
            code: "1601",
          },
          {
            name: "Tydal",
            code: "1665",
          },
          {
            name: "Vinje",
            code: "1611",
          },
          {
            name: "Ørland",
            code: "1621",
          },
          {
            name: "Aa",
            code: "1630",
          },
          {
            name: "Ålen",
            code: "1644",
          },
        ],
      },
      {
        name: "Nord-Trøndelag",
        code: "17",
        places: [
          {
            name: "Beitstad",
            code: "1727",
          },
          {
            name: "Egge",
            code: "1733",
          },
          {
            name: "Flatanger",
            code: "1749",
          },
          {
            name: "Foldereid",
            code: "1753",
          },
          {
            name: "Fosnes",
            code: "1748",
          },
          {
            name: "Frol",
            code: "1720",
          },
          {
            name: "Frosta",
            code: "1717",
          },
          {
            name: "Gravvik",
            code: "1754",
          },
          {
            name: "Grong",
            code: "1742",
          },
          {
            name: "Harran",
            code: "1741",
          },
          {
            name: "Hegra",
            code: "1712",
          },
          {
            name: "Høylandet",
            code: "1743",
          },
          {
            name: "Inderøy",
            code: "1729",
          },
          {
            name: "Klinga",
            code: "1746",
          },
          {
            name: "Kolvereid",
            code: "1752",
          },
          {
            name: "Kvam",
            code: "1735",
          },
          {
            name: "Leka",
            code: "1755",
          },
          {
            name: "Leksvik",
            code: "1718",
          },
          {
            name: "Levanger",
            code: "1701",
          },
          {
            name: "Lånke",
            code: "1713",
          },
          {
            name: "Malm",
            code: "1726",
          },
          {
            name: "Meråker",
            code: "1711",
          },
          {
            name: "Mosvik",
            code: "1723",
          },
          {
            name: "Namdalseid",
            code: "1725",
          },
          {
            name: "Namsos",
            code: "1703",
          },
          {
            name: "Namsskogan",
            code: "1740",
          },
          {
            name: "Nordli",
            code: "1738",
          },
          {
            name: "Nærøy",
            code: "1751",
          },
          {
            name: "Ogndal",
            code: "1732",
          },
          {
            name: "Otterøy",
            code: "1747",
          },
          {
            name: "Overhalla",
            code: "1744",
          },
          {
            name: "Røra",
            code: "1730",
          },
          {
            name: "Røyrvik",
            code: "1739",
          },
          {
            name: "Sandvollan",
            code: "1728",
          },
          {
            name: "Skatval",
            code: "1715",
          },
          {
            name: "Skogn",
            code: "1719",
          },
          {
            name: "Snåsa",
            code: "1736",
          },
          {
            name: "Sparbu",
            code: "1731",
          },
          {
            name: "Steinkjer",
            code: "1702",
          },
          {
            name: "Stjørdal",
            code: "1714",
          },
          {
            name: "Stod",
            code: "1734",
          },
          {
            name: "Sørli",
            code: "1737",
          },
          {
            name: "Vemundvik",
            code: "1745",
          },
          {
            name: "Verdal",
            code: "1721",
          },
          {
            name: "Verran",
            code: "1724",
          },
          {
            name: "Vikna",
            code: "1750",
          },
          {
            name: "Ytterøy",
            code: "1722",
          },
          {
            name: "Åsen",
            code: "1716",
          },
        ],
      },
    ],
  },
  {
    name: "Nord-Norge",
    code: "5",
    counties: [
      {
        name: "Nordland",
        code: "18",
        places: [
          {
            name: "Alstahaug",
            code: "1820",
          },
          {
            name: "Andenes",
            code: "1873",
          },
          {
            name: "Ankenes",
            code: "1855",
          },
          {
            name: "Ballangen",
            code: "1854",
          },
          {
            name: "Beiarn",
            code: "1839",
          },
          {
            name: "Bindal",
            code: "1811",
          },
          {
            name: "Bjørnskinn",
            code: "1871",
          },
          {
            name: "Bodin",
            code: "1843",
          },
          {
            name: "Bodø",
            code: "1804",
          },
          {
            name: "Borge",
            code: "1862",
          },
          {
            name: "Brønnøy",
            code: "1814",
          },
          {
            name: "Brønnøysund",
            code: "1801",
          },
          {
            name: "Buksnes",
            code: "1860",
          },
          {
            name: "Bø",
            code: "1867",
          },
          {
            name: "Drevja",
            code: "1823",
          },
          {
            name: "Dverberg",
            code: "1872",
          },
          {
            name: "Dønnes",
            code: "1827",
          },
          {
            name: "Elsfjord",
            code: "1829",
          },
          {
            name: "Evenes",
            code: "1853",
          },
          {
            name: "Fauske",
            code: "1841",
          },
          {
            name: "Flakstad",
            code: "1859",
          },
          {
            name: "Gildeskål",
            code: "1838",
          },
          {
            name: "Gimsøy",
            code: "1864",
          },
          {
            name: "Grane",
            code: "1825",
          },
          {
            name: "Hadsel",
            code: "1866",
          },
          {
            name: "Hamarøy",
            code: "1849",
          },
          {
            name: "Hattfjelldal",
            code: "1826",
          },
          {
            name: "Hemnes",
            code: "1832",
          },
          {
            name: "Herøy",
            code: "1818",
          },
          {
            name: "Hol",
            code: "1861",
          },
          {
            name: "Kjerringøy",
            code: "1844",
          },
          {
            name: "Korgen",
            code: "1830",
          },
          {
            name: "Langenes",
            code: "1869",
          },
          {
            name: "Leiranger",
            code: "1847",
          },
          {
            name: "Leirfjord",
            code: "1822",
          },
          {
            name: "Lurøy",
            code: "1834",
          },
          {
            name: "Lødingen",
            code: "1851",
          },
          {
            name: "Meløy",
            code: "1837",
          },
          {
            name: "Mo",
            code: "1803",
          },
          {
            name: "Mosjøen",
            code: "1802",
          },
          {
            name: "Moskenes",
            code: "1858",
          },
          {
            name: "Narvik",
            code: "1805",
          },
          {
            name: "Nesna",
            code: "1828",
          },
          {
            name: "Nord-Rana",
            code: "1833",
          },
          {
            name: "Nordfold",
            code: "1846",
          },
          {
            name: "Nordvik",
            code: "1819",
          },
          {
            name: "Rødøy",
            code: "1836",
          },
          {
            name: "Røst",
            code: "1856",
          },
          {
            name: "Saltdal",
            code: "1840",
          },
          {
            name: "Skjerstad",
            code: "1842",
          },
          {
            name: "Sortland",
            code: "1870",
          },
          {
            name: "Stamnes",
            code: "1821",
          },
          {
            name: "Steigen",
            code: "1848",
          },
          {
            name: "Svolvær",
            code: "1806",
          },
          {
            name: "Sømna",
            code: "1812",
          },
          {
            name: "Sør-Rana",
            code: "1831",
          },
          {
            name: "Sørfold",
            code: "1845",
          },
          {
            name: "Tjeldsund",
            code: "1852",
          },
          {
            name: "Tjøtta",
            code: "1817",
          },
          {
            name: "Træna",
            code: "1835",
          },
          {
            name: "Tysfjord",
            code: "1850",
          },
          {
            name: "Valberg",
            code: "1863",
          },
          {
            name: "Vefsn",
            code: "1824",
          },
          {
            name: "Vega",
            code: "1815",
          },
          {
            name: "Velfjord",
            code: "1813",
          },
          {
            name: "Vevelstad",
            code: "1816",
          },
          {
            name: "Værøy",
            code: "1857",
          },
          {
            name: "Vågan",
            code: "1865",
          },
          {
            name: "Øksnes",
            code: "1868",
          },
        ],
      },

      {
        name: "Troms",
        code: "19",
        places: [
          {
            name: "Andørja",
            code: "1916",
          },
          {
            name: "Astafjord",
            code: "1918",
          },
          {
            name: "Balsfjord",
            code: "1933",
          },
          {
            name: "Bardu",
            code: "1922",
          },
          {
            name: "Berg",
            code: "1929",
          },
          {
            name: "Bjarkøy",
            code: "1915",
          },
          {
            name: "Dyrøy",
            code: "1926",
          },
          {
            name: "Gratangen",
            code: "1919",
          },
          {
            name: "Harstad",
            code: "1901",
          },
          {
            name: "Helgøy",
            code: "1935",
          },
          {
            name: "Hillesøy",
            code: "1930",
          },
          {
            name: "Ibestad",
            code: "1917",
          },
          {
            name: "Karlsøy",
            code: "1936",
          },
          {
            name: "Kvæfjord",
            code: "1911",
          },
          {
            name: "Kvænangen",
            code: "1943",
          },
          {
            name: "Kåfjord",
            code: "1940",
          },
          {
            name: "Lavangen",
            code: "1920",
          },
          {
            name: "Lenvik",
            code: "1931",
          },
          {
            name: "Lyngen",
            code: "1938",
          },
          {
            name: "Malangen",
            code: "1932",
          },
          {
            name: "Målselv",
            code: "1924",
          },
          {
            name: "Nordreisa",
            code: "1942",
          },
          {
            name: "Salangen",
            code: "1921",
          },
          {
            name: "Sandtorg",
            code: "1912",
          },
          {
            name: "Skjervøy",
            code: "1941",
          },
          {
            name: "Skånland",
            code: "1913",
          },
          {
            name: "Storfjord",
            code: "1939",
          },
          {
            name: "Sørreisa",
            code: "1925",
          },
          {
            name: "Torsken",
            code: "1928",
          },
          {
            name: "Tranøy",
            code: "1927",
          },
          {
            name: "Tromsø",
            code: "1902",
          },
          {
            name: "Tromsøysund",
            code: "1934",
          },
          {
            name: "Trondenes",
            code: "1914",
          },
          {
            name: "Ullsfjord",
            code: "1937",
          },
          {
            name: "Øverbygd",
            code: "1923",
          },
        ],
      },

      {
        name: "Finnmark",
        code: "20",
        places: [
          {
            name: "Alta",
            code: "2012",
          },
          {
            name: "Berlevåg",
            code: "2024",
          },
          {
            name: "Gamvik",
            code: "2023",
          },
          {
            name: "Hammerfest",
            code: "2001",
          },
          {
            name: "Hasvik",
            code: "2015",
          },
          {
            name: "Karasjok",
            code: "2021",
          },
          {
            name: "Kautokeino",
            code: "2011",
          },
          {
            name: "Kistrand",
            code: "2020",
          },
          {
            name: "Kjelvik",
            code: "2019",
          },
          {
            name: "Kvalsund",
            code: "2017",
          },
          {
            name: "Lebesby",
            code: "2022",
          },
          {
            name: "Loppa",
            code: "2014",
          },
          {
            name: "Måsøy",
            code: "2018",
          },
          {
            name: "Nesseby",
            code: "2027",
          },
          {
            name: "Nord-Varanger",
            code: "2029",
          },
          {
            name: "Polmak",
            code: "2026",
          },
          {
            name: "Sør-Varanger",
            code: "2030",
          },
          {
            name: "Sørøysund",
            code: "2016",
          },
          {
            name: "Talvik",
            code: "2013",
          },
          {
            name: "Tana",
            code: "2025",
          },
          {
            name: "Vadsø",
            code: "2003",
          },
          {
            name: "Vardø",
            code: "2002",
          },
          {
            name: "Vardø landsogn",
            code: "2028",
          },
        ],
      },
    ],
  },
  {
    name: "Svalbard m.m.",
    code: "6",
    counties: [
      {
        name: "Svalbard",
        code: "21",
        places: [
          {
            name: "Bjørnøya",
            code: "2121",
          },
          {
            name: "Hopen",
            code: "2131",
          },
          {
            name: "Spitsbergen",
            code: "2111",
          },
        ],
      },
      {
        name: "Jan Mayen",
        code: "22",
        places: [
          {
            name: "Jan Mayen",
            code: "2211",
          },
        ],
      },
      {
        name: "Kontinentalsokkelen",
        code: "23",
        places: [
          {
            name: "Sokkelen nord for 62 gr. N",
            code: "2321",
          },
          {
            name: "Sokkelen sør for 62 gr. N",
            code: "2311",
          },
        ],
      },
      {
        name: "Antarktis",
        code: "24",
        places: [
          {
            name: "Bouvetøya",
            code: "2411",
          },
          {
            name: "Dronning Maud Land",
            code: "2431",
          },
          {
            name: "Peter I's øy",
            code: "2421",
          },
        ],
      },
    ],
  },
  {
    name: "Amerika",
    code: "7",
    counties: [
      {
        name: "U. S. A.",
        code: "55",
        places: [
          {
            name: "Adams",
            code: "5556",
          },
          {
            name: "Alpena",
            code: "5562",
          },
          {
            name: "Alpena",
            code: "5579",
          },
          {
            name: "Baltimore",
            code: "5503",
          },
          {
            name: "Blue Earth",
            code: "5580",
          },
          {
            name: "Chickasaw",
            code: "5553",
          },
          {
            name: "Colman",
            code: "5578",
          },
          {
            name: "Faribault",
            code: "5558",
          },
          {
            name: "Fillmore",
            code: "5559",
          },
          {
            name: "Flandreau",
            code: "5583",
          },
          {
            name: "Grand Forks",
            code: "5561",
          },
          {
            name: "Houston",
            code: "5508",
          },
          {
            name: "Illinois (IL)",
            code: "5511",
          },
          {
            name: "Iowa (IA)",
            code: "5512",
          },
          {
            name: "Kansas (KS)",
            code: "5513",
          },
          {
            name: "Lawler",
            code: "5584",
          },
          {
            name: "Lone Rock",
            code: "5577",
          },
          {
            name: "Miami",
            code: "5509",
          },
          {
            name: "Michigan (MI)",
            code: "5514",
          },
          {
            name: "Minnesota (MN)",
            code: "5515",
          },
          {
            name: "Moody",
            code: "5551",
          },
          {
            name: "Mount Morris",
            code: "5585",
          },
          {
            name: "Nebraska (NE)",
            code: "5516",
          },
          {
            name: "Nevada (NV)",
            code: "5517",
          },
          {
            name: "New Hampshire (NH)",
            code: "5518",
          },
          {
            name: "New Jersey (NJ)",
            code: "5519",
          },
          {
            name: "New Mexico (NM)",
            code: "5520",
          },
          {
            name: "New Orleans",
            code: "5504",
          },
          {
            name: "New York City, NY",
            code: "5501",
          },
          {
            name: "North Dakota (ND)",
            code: "5521",
          },
          {
            name: "Pensacola",
            code: "5507",
          },
          {
            name: "Philadelphia, PA",
            code: "5502",
          },
          {
            name: "Pope",
            code: "5557",
          },
          {
            name: "Reynolds",
            code: "5581",
          },
          {
            name: "San Francisco",
            code: "5505",
          },
          {
            name: "San Pedro",
            code: "5506",
          },
          {
            name: "South Dakota (SD)",
            code: "5522",
          },
          {
            name: "Stjordalen",
            code: "5576",
          },
          {
            name: "Texas (TX)",
            code: "5523",
          },
          {
            name: "Watonwan",
            code: "5555",
          },
          {
            name: "Waushara",
            code: "5554",
          },
          {
            name: "Winnebago",
            code: "5552",
          },
          {
            name: "Wisconsin (WI)",
            code: "5524",
          },
          {
            name: "Worth",
            code: "5560",
          },
        ],
      },
      {
        name: "Canada",
        code: "56",
        places: [
          {
            name: "Montreal",
            code: "5601",
          },
          {
            name: "Quebec",
            code: "5602",
          },
        ],
      },
      {
        name: "Brasil",
        code: "57",
        places: [
          {
            name: "Santos",
            code: "5702",
          },
        ],
      },
      {
        name: "Argentine",
        code: "58",
        places: [
          {
            name: "Buenos Aires",
            code: "5801",
          },
        ],
      },
      {
        name: "Trinidad og Tobago",
        code: "59",
        places: [
          {
            name: "San Fernando",
            code: "5902",
          },
        ],
      },
    ],
  },
  {
    name: "Norden",
    code: "8",
    counties: [
      {
        name: "Sverige",
        code: "61",
        places: [
          {
            name: "Gøteborg",
            code: "6102",
          },
          {
            name: "Stockholm",
            code: "6101",
          },
        ],
      },
      {
        name: "Danmark",
        code: "62",
        places: [
          {
            name: "Eysturoy",
            code: "6231",
          },
          {
            name: "Færøyene",
            code: "6211",
          },
          {
            name: "København",
            code: "6201",
          },
        ],
      },
      {
        name: "Finland",
        code: "",
        places: [],
      },
      {
        name: "Island",
        code: "",
        places: [],
      },
    ],
  },
  {
    name: "Resten av verden",
    code: "9",
    counties: [
      {
        name: "Australia",
        code: "65",
        places: [
          {
            name: "Sydney",
            code: "6501",
          },
        ],
      },
      {
        name: "Belgia",
        code: "66",
        places: [
          {
            name: "Antwerpen",
            code: "6602",
          },
          {
            name: "Brüssel",
            code: "6601",
          },
        ],
      },
      {
        name: "Italia",
        code: "67",
        places: [
          {
            name: "Genova",
            code: "6702",
          },
        ],
      },
      {
        name: "Frankrike",
        code: "68",
        places: [
          {
            name: "Le Havre",
            code: "6802",
          },
          {
            name: "Port de Bouc",
            code: "6803",
          },
        ],
      },
      {
        name: "Japan",
        code: "69",
        places: [
          {
            name: "Kobe",
            code: "6901",
          },
          {
            name: "Moji",
            code: "6902",
          },
        ],
      },
      {
        name: "Kina",
        code: "70",
        places: [
          {
            name: "Anhwa",
            code: "7033",
          },
          {
            name: "Changsha",
            code: "7021",
          },
          {
            name: "Hong Kong",
            code: "7001",
          },
          {
            name: "Ningsiang",
            code: "7025",
          },
          {
            name: "Shanghai",
            code: "7002",
          },
          {
            name: "Sinhwa",
            code: "7027",
          },
          {
            name: "Taohwalun",
            code: "7029",
          },
          {
            name: "Tungping",
            code: "7031",
          },
          {
            name: "Yiyang",
            code: "7023",
          },
          {
            name: "Yuankiang",
            code: "7035",
          },
        ],
      },
      {
        name: "Nederland",
        code: "72",
        places: [
          {
            name: "Amsterdam",
            code: "7201",
          },
          {
            name: "Aruba",
            code: "7211",
          },
          {
            name: "Curacao",
            code: "7212",
          },
          {
            name: "Europoort",
            code: "7203",
          },
          {
            name: "Rotterdam",
            code: "7202",
          },
        ],
      },
      {
        name: "Portugal",
        code: "73",
        places: [
          {
            name: "Lisnave",
            code: "7302",
          },
        ],
      },
      {
        name: "Spania",
        code: "75",
        places: [
          {
            name: "Albir Villajoyosa",
            code: "7506",
          },
          {
            name: "Alicante",
            code: "7505",
          },
          {
            name: "Fuengirola",
            code: "7507",
          },
          {
            name: "Gran Canaria",
            code: "7501",
          },
          {
            name: "Lanzarote",
            code: "7502",
          },
          {
            name: "Tenerife",
            code: "7503",
          },
          {
            name: "Torrevieja",
            code: "7504",
          },
        ],
      },
      {
        name: "Storbritannia",
        code: "76",
        places: [
          {
            name: "Cardiff",
            code: "7606",
          },
          {
            name: "Glasgow",
            code: "7608",
          },
          {
            name: "Leith",
            code: "7607",
          },
          {
            name: "Liverpool",
            code: "7602",
          },
          {
            name: "London",
            code: "7601",
          },
          {
            name: "Newcastle upon Tyne",
            code: "7603",
          },
          {
            name: "North Shields",
            code: "7604",
          },
          {
            name: "Southampton",
            code: "7605",
          },
          {
            name: "Swansea",
            code: "7609",
          },
        ],
      },
      {
        name: "Sør-Afrika",
        code: "78",
        places: [
          {
            name: "Durban",
            code: "7802",
          },
          {
            name: "Kwa-Zulu Natal",
            code: "7811",
          },
          {
            name: "Port Elizabeth",
            code: "7803",
          },
        ],
      },
      {
        name: "Sør-Korea",
        code: "79",
        places: [
          {
            name: "Pusan",
            code: "7902",
          },
        ],
      },
      {
        name: "Tyskland",
        code: "81",
        places: [
          {
            name: "Berlin",
            code: "8101",
          },
          {
            name: "Hamburg",
            code: "8102",
          },
        ],
      },
      {
        name: "Madagaskar",
        code: "82",
        places: [
          {
            name: "Northern Synod",
            code: "8211",
          },
        ],
      },
      {
        name: "India",
        code: "83",
        places: [],
      },
      {
        name: "Arabiske emirater (Traktatkysten)",
        code: "84",
        places: [
          {
            name: "Dubai",
            code: "8401",
          },
        ],
      },
      {
        name: "Indonesia",
        code: "85",
        places: [
          {
            name: "Singapore",
            code: "8501",
          },
        ],
      },
      {
        name: "Flere land",
        code: "99",
        places: [],
      },
    ],
  },
];

function lookupPlaceObj(placeObj) {
  if (!placeObj) {
    return;
  }

  let placeParts = placeObj.separatePlaceIntoParts();
  if (!placeParts.country || !placeParts.country == "Norway") {
    return;
  }

  let countyName = placeParts.county;

  // see if we can get the parish or town name
  let placeName = "";
  if (placeParts.localPlace) {
    // seperate by commas
    let localPlaceParts = placeParts.localPlace.split(",");
    placeName = localPlaceParts[localPlaceParts.length - 1].trim();
  }

  let result = {};

  if (countyName) {
    for (let region of regions) {
      for (let county of region.counties) {
        if (county.name == countyName) {
          result.county = county;
          for (let place of county.places) {
            if (place.name == placeName) {
              result.place = place;
              break;
            }
          }
          break;
        }
      }
    }
  }

  if (!result.county) {
    for (let region of regions) {
      for (let county of region.counties) {
        for (let place of county.places) {
          if (place.name == placeName) {
            result.place = place;
            break;
          }
        }
        if (result.place) {
          break;
        }
      }
    }
  }

  return result;
}

export { lookupPlaceObj };
