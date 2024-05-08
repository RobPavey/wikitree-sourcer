/*
MIT License

Copyright (c) 2024 Robert M Pavey

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

//import { vicbdmPlaceAbbreviationTable } from "./vicbdm_place_abbreviations.mjs";
//import { vicbdmPlaceAbbreviationTable2 } from "./vicbdm_place_abbreviations2.mjs";
//import { vicbdmPlaceVariations } from "./vicbdm_place_variations.mjs";

const placeNameData = [
  {
    name: "Albert Park",
    variations: [
      {
        name: "A P",
      },
      {
        name: "A PARK",
      },
      {
        name: "A PK",
      },
      {
        name: "ALB PARK",
      },
      {
        name: "A BK",
      },
      {
        name: "AB PARK",
      },
      {
        name: "ALB",
      },
      {
        name: "ALBE",
      },
      {
        name: "AL BE",
      },
      {
        name: "ALBER",
      },
      {
        name: "ALBPARK",
      },
      {
        name: "ALBT PARK",
      },
      {
        name: "AP",
      },
      {
        name: "APARK",
      },
      {
        name: "AT PARK",
      },
    ],
  },
  {
    name: "Ascot Vale",
    variations: [
      {
        name: "A V",
      },
      {
        name: "A VALE",
      },
      {
        name: "AS VALE",
      },
      {
        name: "ASCO",
      },
      {
        name: "AB",
      },
      {
        name: "AS CO",
      },
      {
        name: "ASCOT V",
      },
      {
        name: "AV",
      },
      {
        name: "AVALE",
      },
    ],
  },
  {
    name: "Ararat",
    variations: [
      {
        name: "AARA",
      },
      {
        name: "AR RA",
      },
      {
        name: "ARAR",
      },
      {
        name: "ARAT",
      },
      {
        name: "ARRA",
      },
      {
        name: "AR AR",
      },
    ],
  },
  {
    name: "Abbotsford",
    variations: [
      {
        name: "AB",
      },
      {
        name: "ABB",
      },
      {
        name: "ABBFORD",
      },
      {
        name: "ABBO",
      },
      {
        name: "ABT'FORD",
      },
      {
        name: "ABTFORD",
      },
      {
        name: "AFORD",
      },
    ],
  },
  {
    name: "Abbyard",
    variations: [
      {
        name: "ABBY",
      },
    ],
  },
  {
    name: "Aberfeldy (Sale District)",
    variations: [
      {
        name: "ABER",
      },
    ],
  },
  {
    name: "Aberdeen Scotland",
    variations: [
      {
        name: "ABERDEEN NB",
      },
    ],
  },
  {
    name: "Aberdeenshire Scotland",
    variations: [
      {
        name: "ABERDEENSH",
      },
    ],
  },
  {
    name: "Abingdon",
    variations: [
      {
        name: "ABIN",
      },
    ],
  },
  {
    name: "Ashburton",
    variations: [
      {
        name: "ABTON",
      },
      {
        name: "ASHB",
      },
    ],
  },
  {
    name: "Acheron River",
    variations: [
      {
        name: "ACHE",
      },
    ],
  },
  {
    name: "Adelaide Lead",
    variations: [
      {
        name: "AD LD",
      },
      {
        name: "ADELA LEAD",
      },
      {
        name: "ADELAD LD",
      },
      {
        name: "ADEL",
      },
      {
        name: "AD EL",
      },
      {
        name: "ADELAIDE L",
      },
      {
        name: "ADELLEAD",
      },
    ],
  },
  {
    name: "Armadale",
    variations: [
      {
        name: "ADALE",
      },
      {
        name: "AR DALE",
      },
      {
        name: "ARDALE",
      },
      {
        name: "ARMA",
      },
      {
        name: "ARM",
      },
    ],
  },
  {
    name: "Addington",
    variations: [
      {
        name: "ADDGTON",
      },
      {
        name: "ADDI",
      },
      {
        name: "ASSINGTON",
      },
    ],
  },
  {
    name: "Adelaide South Australia",
    variations: [
      {
        name: "ADE",
      },
      {
        name: "ADEL",
      },
      {
        name: "ADEL SA",
      },
      {
        name: "ADEL S A",
      },
    ],
  },
  {
    name: "Alexandra",
    variations: [
      {
        name: "ADRA",
      },
      {
        name: "ALEX",
      },
      {
        name: "AL EX",
      },
      {
        name: "ALEXNADER",
      },
    ],
  },
  {
    name: "Allansford",
    variations: [
      {
        name: "A'FORD",
      },
      {
        name: "AFORD",
      },
      {
        name: "ALLA",
      },
      {
        name: "AL LA",
      },
    ],
  },
  {
    name: "Africa",
    variations: [
      {
        name: "AFR",
      },
      {
        name: "AFRI",
      },
      {
        name: "AFRIC",
      },
    ],
  },
  {
    name: "Amherst",
    variations: [
      {
        name: "AHEARST",
      },
      {
        name: "AHME",
      },
      {
        name: "AHURST",
      },
      {
        name: "AMHE",
      },
      {
        name: "AHERST",
      },
      {
        name: "AM HE",
      },
      {
        name: "AR NH",
      },
    ],
  },
  {
    name: "Ailsa",
    variations: [
      {
        name: "AILS",
      },
    ],
  },
  {
    name: "Mt Aitken",
    variations: [
      {
        name: "AIT",
      },
      {
        name: "AITK",
      },
    ],
  },
  {
    name: "Allans Flat",
    variations: [
      {
        name: "AL LA",
      },
      {
        name: "ALLA",
      },
      {
        name: "ALLANS F",
      },
      {
        name: "ALLANS FL",
      },
      {
        name: "ALLANS FLA",
      },
      {
        name: "ALLANS FLT",
      },
      {
        name: "ALLANS FT",
      },
    ],
  },
  {
    name: "Alberton",
    variations: [
      {
        name: "ALB",
      },
      {
        name: "ALBE",
      },
      {
        name: "ALBER",
      },
      {
        name: "ALBERT",
      },
      {
        name: "AL BE",
      },
      {
        name: "ARNH",
      },
      {
        name: "ALBURTON",
      },
    ],
  },
  {
    name: "Albion",
    variations: [
      {
        name: "ALBI",
      },
      {
        name: "ALBIN",
      },
    ],
  },
  {
    name: "Albury",
    variations: [
      {
        name: "ALBU",
      },
    ],
  },
  {
    name: "Alfredton",
    variations: [
      {
        name: "ALFR",
      },
    ],
  },
  {
    name: "Allendale",
    variations: [
      {
        name: "ALLE",
      },
      {
        name: "ALLEN",
      },
      {
        name: "ALDALE",
      },
      {
        name: "ALL",
      },
      {
        name: "AL LE",
      },
    ],
  },
  {
    name: "Alma Diggings",
    variations: [
      {
        name: "ALMA DGS",
      },
    ],
  },
  {
    name: "Alphington",
    variations: [
      {
        name: "ALPH",
      },
      {
        name: "ALPHTON",
      },
      {
        name: "ALPTON",
      },
      {
        name: "ATON",
      },
    ],
  },
  {
    name: "Amphitheatre",
    variations: [
      {
        name: "AM PH",
      },
      {
        name: "AMPHITHRE",
      },
      {
        name: "APHI",
      },
      {
        name: "AMPH",
      },
      {
        name: "ATRE",
      },
      {
        name: "ATHEATRE",
      },
    ],
  },
  {
    name: "America",
    variations: [
      {
        name: "AMER",
      },
    ],
  },
  {
    name: "Amsterdam Holland",
    variations: [
      {
        name: "AMS",
      },
      {
        name: "AMST",
      },
    ],
  },
  {
    name: "Andersons Creek",
    variations: [
      {
        name: "AN DE",
      },
      {
        name: "ANDE",
      },
      {
        name: "ANDSON C",
      },
    ],
  },
  {
    name: "Anakies",
    variations: [
      {
        name: "ANAK",
      },
    ],
  },
  {
    name: "Anglesey Wales",
    variations: [
      {
        name: "ANGL",
      },
    ],
  },
  {
    name: "County Antrim Ireland",
    variations: [
      {
        name: "ANTR",
      },
    ],
  },
  {
    name: "Antwerp Belgium",
    variations: [
      {
        name: "ANTW",
      },
    ],
  },
  {
    name: "Apollo Bay",
    variations: [
      {
        name: "APOL",
      },
      {
        name: "APOLLO B",
      },
      {
        name: "APPO",
      },
      {
        name: "A BAY",
      },
      {
        name: "AP OL",
      },
      {
        name: "APOLLO BY",
      },
      {
        name: "APOLLO H",
      },
      {
        name: "APPOLLO",
      },
      {
        name: "APPOLLO BY",
      },
    ],
  },
  {
    name: "Apsley",
    variations: [
      {
        name: "APSE",
      },
      {
        name: "APSL",
      },
      {
        name: "AP SL",
      },
    ],
  },
  {
    name: "Ararat Asylum",
    variations: [
      {
        name: "ARARAT ASY",
      },
    ],
  },
  {
    name: "Arcadia",
    variations: [
      {
        name: "ARCA",
      },
      {
        name: "AR CA",
      },
    ],
  },
  {
    name: "Ardochy",
    variations: [
      {
        name: "ARDO",
      },
    ],
  },
  {
    name: "Ardgarton",
    variations: [
      {
        name: "ARDTON",
      },
    ],
  },
  {
    name: "Argyll Scotland",
    variations: [
      {
        name: "ARGY",
      },
    ],
  },
  {
    name: "Aringa",
    variations: [
      {
        name: "ARIN",
      },
    ],
  },
  {
    name: "Armstrongs Diggings",
    variations: [
      {
        name: "ARMS",
      },
      {
        name: "ARMSTG DG",
      },
    ],
  },
  {
    name: "Arthurs Seat",
    variations: [
      {
        name: "ARTHURS SE",
      },
      {
        name: "ARTHURS ST",
      },
      {
        name: "ARTH",
      },
    ],
  },
  {
    name: "Arundel",
    variations: [
      {
        name: "ARUN",
      },
    ],
  },
  {
    name: "Ashby",
    variations: [
      {
        name: "ASH",
      },
      {
        name: "ASHB",
      },
      {
        name: "AS HB",
      },
    ],
  },
  {
    name: "Auburn",
    variations: [
      {
        name: "AUBU",
      },
    ],
  },
  {
    name: "Audley",
    variations: [
      {
        name: "AUDL",
      },
    ],
  },
  {
    name: "Avenel",
    variations: [
      {
        name: "AV EN",
      },
      {
        name: "AVE",
      },
      {
        name: "AVEN",
      },
    ],
  },
  {
    name: "Avoca",
    variations: [
      {
        name: "AVO",
      },
      {
        name: "AVOC",
      },
      {
        name: "AV OC",
      },
    ],
  },
  {
    name: "Avoca Diggings",
    variations: [
      {
        name: "AVOCA DGS",
      },
      {
        name: "AVOCA DIGG",
      },
    ],
  },
  {
    name: "Axedale",
    variations: [
      {
        name: "AX ED",
      },
      {
        name: "AXED",
      },
    ],
  },
  {
    name: "Ballarat",
    variations: [
      {
        name: "B ARAT",
      },
      {
        name: "BALL",
      },
      {
        name: "BALLT",
      },
      {
        name: "BRAT",
      },
      {
        name: "BA LL",
      },
      {
        name: "BALLR",
      },
      {
        name: "BALT",
      },
      {
        name: "BRATT",
      },
      {
        name: "CALLT",
      },
      {
        name: "DA LL",
      },
      {
        name: "HALLT",
      },
    ],
  },
  {
    name: "Belfast",
    variations: [
      {
        name: "B FAST",
      },
      {
        name: "BE LF",
      },
      {
        name: "BELF",
      },
    ],
  },
  {
    name: "Box Hill",
    variations: [
      {
        name: "B HILL",
      },
      {
        name: "BOXH",
      },
      {
        name: "BHILL",
      },
      {
        name: "BOX H",
      },
      {
        name: "ROXH",
      },
      {
        name: "ROX HILL",
      },
    ],
  },
  {
    name: "Bacchus Marsh",
    variations: [
      {
        name: "B MARSH",
      },
      {
        name: "B MSH",
      },
      {
        name: "BAC",
      },
      {
        name: "BACC",
      },
      {
        name: "BAACC",
      },
      {
        name: "BA CC",
      },
      {
        name: "BMARSH",
      },
    ],
  },
  {
    name: "Broadmeadows",
    variations: [
      {
        name: "B MEADOWS",
      },
      {
        name: "BMDOWS",
      },
      {
        name: "BD MEADOWS",
      },
      {
        name: "BDOWS",
      },
      {
        name: "BMDWS",
      },
      {
        name: "BMEADOWS",
      },
      {
        name: "BONDWS",
      },
      {
        name: "BRDMDWS",
      },
      {
        name: "BROA",
      },
      {
        name: "BR OA",
      },
    ],
  },
  {
    name: "Barnawartha",
    variations: [
      {
        name: "B WARTHA",
      },
      {
        name: "BA RN",
      },
      {
        name: "BARN",
      },
      {
        name: "BARNATHA",
      },
      {
        name: "BARNTHA",
      },
      {
        name: "BWATHA",
      },
      {
        name: "BARNARWART",
      },
      {
        name: "BARNAWARTH",
      },
      {
        name: "BTHA",
      },
      {
        name: "BWARTHA",
      },
    ],
  },
  {
    name: "Brunswick",
    variations: [
      {
        name: "B WICK",
      },
      {
        name: "BRSWCK",
      },
      {
        name: "BRUN",
      },
      {
        name: "BRUNS",
      },
      {
        name: "BWK",
      },
      {
        name: "BRICK",
      },
      {
        name: "BRSK",
      },
      {
        name: "BR UN",
      },
      {
        name: "BRUS",
      },
      {
        name: "BU RN",
      },
      {
        name: "BWICK",
      },
    ],
  },
  {
    name: "Burwood",
    variations: [
      {
        name: "B WOOD",
      },
      {
        name: "BURW",
      },
      {
        name: "BWOOD",
      },
      {
        name: "BU RW",
      },
    ],
  },
  {
    name: "Beechworth",
    variations: [
      {
        name: "B WORTH",
      },
      {
        name: "BE EC",
      },
      {
        name: "BEACH",
      },
      {
        name: "BEEC",
      },
      {
        name: "BWORTH",
      },
    ],
  },
  {
    name: "Buninyong",
    variations: [
      {
        name: "B YONG",
      },
      {
        name: "BU NI",
      },
      {
        name: "BUNI",
      },
      {
        name: "BYONG",
      },
      {
        name: "B RNONG",
      },
      {
        name: "BUN",
      },
    ],
  },
  {
    name: "Bairnsdale",
    variations: [
      {
        name: "BA IR",
      },
      {
        name: "BAIR",
      },
      {
        name: "BDALE",
      },
      {
        name: "B DALE",
      },
      {
        name: "S DALE",
      },
    ],
  },
  {
    name: "Balmoral",
    variations: [
      {
        name: "BA LM",
      },
      {
        name: "BALM",
      },
      {
        name: "BMORAL",
      },
    ],
  },
  {
    name: "Barkstead",
    variations: [
      {
        name: "BA RK",
      },
      {
        name: "BARK",
      },
      {
        name: "BSTEAD",
      },
      {
        name: "BANK",
      },
      {
        name: "BONK",
      },
    ],
  },
  {
    name: "Back Creek (6)",
    variations: [
      {
        name: "BACK",
      },
    ],
  },
  {
    name: "Badaginnie",
    variations: [
      {
        name: "BADA",
      },
    ],
  },
  {
    name: "Bagshot",
    variations: [
      {
        name: "BAG",
      },
      {
        name: "BAGS",
      },
    ],
  },
  {
    name: "Baillieston",
    variations: [
      {
        name: "BAIL",
      },
      {
        name: "BAILLIESTO",
      },
    ],
  },
  {
    name: "Balaclava",
    variations: [
      {
        name: "BALA",
      },
      {
        name: "BALAC",
      },
      {
        name: "BLACK",
      },
    ],
  },
  {
    name: "Bald Hill (4)",
    variations: [
      {
        name: "BALD",
      },
    ],
  },
  {
    name: "Ballarat East",
    variations: [
      {
        name: "BALL E",
      },
      {
        name: "BALLT E",
      },
      {
        name: "BALLT EAST",
      },
      {
        name: "BRAT E",
      },
      {
        name: "BRAT EAST",
      },
      {
        name: "BRAT EL",
      },
    ],
  },
  {
    name: "Ballyshanassy",
    variations: [
      {
        name: "BALLYASSY",
      },
      {
        name: "BALLYSHANA",
      },
      {
        name: "BALLYSHANN",
      },
    ],
  },
  {
    name: "Balnarring",
    variations: [
      {
        name: "BALN",
      },
      {
        name: "BALNAING",
      },
      {
        name: "BA LN",
      },
    ],
  },
  {
    name: "Balwyn",
    variations: [
      {
        name: "BALW",
      },
      {
        name: "BA LW",
      },
    ],
  },
  {
    name: "Banyenong",
    variations: [
      {
        name: "BANY",
      },
    ],
  },
  {
    name: "Barkly",
    variations: [
      {
        name: "BAR",
      },
      {
        name: "BARK",
      },
    ],
  },
  {
    name: "Barber's Creek",
    variations: [
      {
        name: "BARB",
      },
    ],
  },
  {
    name: "Barfold",
    variations: [
      {
        name: "BARF",
      },
    ],
  },
  {
    name: "Baringhup",
    variations: [
      {
        name: "BARI",
      },
    ],
  },
  {
    name: "Barrapoort",
    variations: [
      {
        name: "BARR",
      },
    ],
  },
  {
    name: "Barry's Reef",
    variations: [
      {
        name: "BARRYS R",
      },
      {
        name: "BARRYS REE",
      },
      {
        name: "BARRYS RF",
      },
    ],
  },
  {
    name: "Barwon River",
    variations: [
      {
        name: "BARWO",
      },
      {
        name: "BARW",
      },
    ],
  },
  {
    name: "Bass River",
    variations: [
      {
        name: "BASS",
      },
    ],
  },
  {
    name: "Batesford",
    variations: [
      {
        name: "BATE",
      },
      {
        name: "BA TE",
      },
    ],
  },
  {
    name: "Batman's Swamp",
    variations: [
      {
        name: "BATM",
      },
      {
        name: "BATMAN SWP",
      },
      {
        name: "SWAMP",
      },
    ],
  },
  {
    name: "Bayles",
    variations: [
      {
        name: "BAYL",
      },
    ],
  },
  {
    name: "Baynton",
    variations: [
      {
        name: "BAYN",
      },
      {
        name: "BA YN",
      },
    ],
  },
  {
    name: "Burrumbeet",
    variations: [
      {
        name: "BBEET",
      },
      {
        name: "BURR",
      },
      {
        name: "BU RR",
      },
    ],
  },
  {
    name: "Blackburn",
    variations: [
      {
        name: "BBURN",
      },
      {
        name: "BLAC",
      },
      {
        name: "BLKBURN",
      },
    ],
  },
  {
    name: "Boroondara",
    variations: [
      {
        name: "BDARA",
      },
      {
        name: "BOONDARA",
      },
      {
        name: "BOONDARRA",
      },
      {
        name: "BOOR",
      },
      {
        name: "BORO",
      },
      {
        name: "BAURANBARA",
      },
      {
        name: "BDARRA",
      },
    ],
  },
  {
    name: "Bellarine",
    variations: [
      {
        name: "BE LL",
      },
      {
        name: "BELL",
      },
      {
        name: "BELLA",
      },
      {
        name: "BINE",
      },
      {
        name: "B'INE",
      },
      {
        name: "BRINE",
      },
    ],
  },
  {
    name: "Benalla",
    variations: [
      {
        name: "BE NA",
      },
      {
        name: "BEN",
      },
      {
        name: "BENA",
      },
      {
        name: "BANA",
      },
    ],
  },
  {
    name: "Berwick (2)",
    variations: [
      {
        name: "BE RW",
      },
      {
        name: "BERW",
      },
    ],
  },
  {
    name: "Bealiba",
    variations: [
      {
        name: "BEAL",
      },
      {
        name: "BE AL",
      },
      {
        name: "ZEALIBA",
      },
    ],
  },
  {
    name: "Beaufort",
    variations: [
      {
        name: "BEAU",
      },
      {
        name: "BFORT",
      },
      {
        name: "BE AU",
      },
    ],
  },
  {
    name: "Mount Beckworth",
    variations: [
      {
        name: "BECK",
      },
      {
        name: "MT BECKWIT",
      },
      {
        name: "MT BECKWTN",
      },
      {
        name: "MT BECKWOR",
      },
      {
        name: "MT BECKWTH",
      },
      {
        name: "MT BWITH",
      },
    ],
  },
  {
    name: "Beeac",
    variations: [
      {
        name: "BEEA",
      },
    ],
  },
  {
    name: "Belmont",
    variations: [
      {
        name: "BELM",
      },
    ],
  },
  {
    name: "Belvoir",
    variations: [
      {
        name: "BELV",
      },
    ],
  },
  {
    name: "Bendoc",
    variations: [
      {
        name: "BEND",
      },
      {
        name: "BE ND",
      },
    ],
  },
  {
    name: "Bentleigh",
    variations: [
      {
        name: "BENT",
      },
      {
        name: "BLEIGH",
      },
    ],
  },
  {
    name: "Berembroke",
    variations: [
      {
        name: "BERE",
      },
    ],
  },
  {
    name: "Bermuda",
    variations: [
      {
        name: "BERM",
      },
    ],
  },
  {
    name: "Bet-Bet",
    variations: [
      {
        name: "BET",
      },
      {
        name: "BETB",
      },
    ],
  },
  {
    name: "Bethanga",
    variations: [
      {
        name: "BETH",
      },
      {
        name: "BE TH",
      },
      {
        name: "BEYH",
      },
    ],
  },
  {
    name: "Beveridge",
    variations: [
      {
        name: "BEVE",
      },
    ],
  },
  {
    name: "Broadford",
    variations: [
      {
        name: "BFORD",
      },
      {
        name: "BROA",
      },
      {
        name: "BR AD",
      },
      {
        name: "BR OA",
      },
      {
        name: "BROAD",
      },
      {
        name: "BROADF",
      },
      {
        name: "BROADFD",
      },
      {
        name: "BROADFOW",
      },
    ],
  },
  {
    name: "Ballangeich",
    variations: [
      {
        name: "BGEICH",
      },
      {
        name: "BALL",
      },
    ],
  },
  {
    name: "Bendigo",
    variations: [
      {
        name: "BGO",
      },
      {
        name: "BDG",
      },
      {
        name: "BDGO",
      },
      {
        name: "BEND",
      },
      {
        name: "BE ND",
      },
      {
        name: "BIGO",
      },
      {
        name: "BNGO",
      },
    ],
  },
  {
    name: "Barwon Heads",
    variations: [
      {
        name: "BHEAD",
      },
      {
        name: "BARH",
      },
      {
        name: "BARW",
      },
      {
        name: "BA RW",
      },
      {
        name: "BARWON HDS",
      },
      {
        name: "BARWON HEA",
      },
    ],
  },
  {
    name: "Branxholme",
    variations: [
      {
        name: "BHOLME",
      },
      {
        name: "BRANXH",
      },
      {
        name: "BANGHOLME",
      },
      {
        name: "BRAN",
      },
      {
        name: "BR AN",
      },
    ],
  },
  {
    name: "Big Hill",
    variations: [
      {
        name: "BIGH",
      },
    ],
  },
  {
    name: "Big River",
    variations: [
      {
        name: "BIGR",
      },
    ],
  },
  {
    name: "Bindi Cr or Mount",
    variations: [
      {
        name: "BIND",
      },
      {
        name: "BINDI",
      },
    ],
  },
  {
    name: "Birch's Hill or Creek",
    variations: [
      {
        name: "BIRC",
      },
    ],
  },
  {
    name: "Birmingham",
    variations: [
      {
        name: "BIRM",
      },
    ],
  },
  {
    name: "Birregurra",
    variations: [
      {
        name: "BIRR",
      },
      {
        name: "BE RR",
      },
      {
        name: "BGURRA",
      },
      {
        name: "B GURRA",
      },
      {
        name: "BI RR",
      },
    ],
  },
  {
    name: "Black Swamp",
    variations: [
      {
        name: "BK SWAMP",
      },
      {
        name: "BLACK SWMP",
      },
    ],
  },
  {
    name: "Blackwood",
    variations: [
      {
        name: "BL AC",
      },
      {
        name: "BLAC",
      },
      {
        name: "BLKWOOD",
      },
      {
        name: "BLWOOD",
      },
      {
        name: "BL'WOOD",
      },
      {
        name: "BL WOOD",
      },
      {
        name: "BWOOD",
      },
    ],
  },
  {
    name: "Black Lead",
    variations: [
      {
        name: "BLACK L",
      },
      {
        name: "BLACK LD",
      },
      {
        name: "BK LEAD",
      },
      {
        name: "BLACK",
      },
      {
        name: "BLK LEAD",
      },
    ],
  },
  {
    name: "Black Dog Creek",
    variations: [
      {
        name: "BLACK DG C",
      },
      {
        name: "BLK DOG CK",
      },
      {
        name: "BLK DOG CR",
      },
    ],
  },
  {
    name: "Black Forest",
    variations: [
      {
        name: "BLACK F",
      },
      {
        name: "BLACK FOR",
      },
      {
        name: "BLACK FRST",
      },
      {
        name: "BLACK FT",
      },
      {
        name: "BK FOREST",
      },
      {
        name: "BLAC",
      },
      {
        name: "BLACK FORE",
      },
      {
        name: "BLK FORES",
      },
      {
        name: "BLKFOREST",
      },
      {
        name: "BLK FOREST",
      },
    ],
  },
  {
    name: "Black Gully Creek",
    variations: [
      {
        name: "BLACK GY",
      },
    ],
  },
  {
    name: "Black Hill (3)",
    variations: [
      {
        name: "BLACK H",
      },
    ],
  },
  {
    name: "Black Springs",
    variations: [
      {
        name: "BLACK SPRG",
      },
      {
        name: "BK SPRING",
      },
      {
        name: "BLACK SPG",
      },
      {
        name: "BLACK SPNG",
      },
      {
        name: "BLACK SPR",
      },
      {
        name: "BLACK SPRI",
      },
    ],
  },
  {
    name: "Blackfellow Creek",
    variations: [
      {
        name: "BLACKFELLO",
      },
    ],
  },
  {
    name: "Blakeville",
    variations: [
      {
        name: "BLAK",
      },
    ],
  },
  {
    name: "Blanket Flat",
    variations: [
      {
        name: "BLAN",
      },
      {
        name: "BLANKET FL",
      },
      {
        name: "BLANKET FT",
      },
    ],
  },
  {
    name: "Buckland",
    variations: [
      {
        name: "BLAND",
      },
      {
        name: "BUCK",
      },
      {
        name: "BKLAND",
      },
      {
        name: "BK LAND",
      },
      {
        name: "BU CK",
      },
      {
        name: "DU CK",
      },
    ],
  },
  {
    name: "Bleak House",
    variations: [
      {
        name: "BLEAK",
      },
    ],
  },
  {
    name: "Blue Mountains",
    variations: [
      {
        name: "BLUE",
      },
      {
        name: "BLUE MTS",
      },
    ],
  },
  {
    name: "Blue Mountain",
    variations: [
      {
        name: "BLUE MT",
      },
      {
        name: "BLUE MTN",
      },
      {
        name: "BLUE",
      },
      {
        name: "BL UE",
      },
      {
        name: "BLUE MOUNT",
      },
      {
        name: "BLUE MTS",
      },
    ],
  },
  {
    name: "Boggy Creek (4)",
    variations: [
      {
        name: "BO GG",
      },
      {
        name: "BOGG",
      },
    ],
  },
  {
    name: "Bolinda",
    variations: [
      {
        name: "BO LI",
      },
      {
        name: "BOLI",
      },
    ],
  },
  {
    name: "Bochara",
    variations: [
      {
        name: "BOCH",
      },
    ],
  },
  {
    name: "Bogong",
    variations: [
      {
        name: "BOGO",
      },
    ],
  },
  {
    name: "Bolac",
    variations: [
      {
        name: "BOLA",
      },
    ],
  },
  {
    name: "Bolwarra",
    variations: [
      {
        name: "BOLW",
      },
    ],
  },
  {
    name: "Boston USA or England",
    variations: [
      {
        name: "BOST",
      },
    ],
  },
  {
    name: "Boulogne France",
    variations: [
      {
        name: "BOUL",
      },
    ],
  },
  {
    name: "Bowman's Forest",
    variations: [
      {
        name: "BOWM",
      },
    ],
  },
  {
    name: "Box Forest",
    variations: [
      {
        name: "BOXF",
      },
      {
        name: "BOX FORES",
      },
      {
        name: "BOX FORRES",
      },
      {
        name: "BOX FRT",
      },
    ],
  },
  {
    name: "Broomfield",
    variations: [
      {
        name: "BR OO",
      },
      {
        name: "BROO",
      },
      {
        name: "BROOM",
      },
      {
        name: "BFIELD",
      },
    ],
  },
  {
    name: "Brandy Creek",
    variations: [
      {
        name: "BRAN",
      },
    ],
  },
  {
    name: "Braybrook",
    variations: [
      {
        name: "BRAY",
      },
      {
        name: "BBROOK",
      },
    ],
  },
  {
    name: "Breakwater",
    variations: [
      {
        name: "BREA",
      },
    ],
  },
  {
    name: "Break O' Day",
    variations: [
      {
        name: "BREAK O DA",
      },
      {
        name: "BREK ODA",
      },
    ],
  },
  {
    name: "Briagalong",
    variations: [
      {
        name: "BRIA",
      },
    ],
  },
  {
    name: "Bridgewater",
    variations: [
      {
        name: "BRID",
      },
    ],
  },
  {
    name: "Brighton",
    variations: [
      {
        name: "BRIG",
      },
      {
        name: "BTON",
      },
      {
        name: "BGNT",
      },
      {
        name: "BRI",
      },
      {
        name: "BR IG",
      },
      {
        name: "BRIT",
      },
      {
        name: "BRT",
      },
      {
        name: "BRTON",
      },
      {
        name: "BTN",
      },
    ],
  },
  {
    name: "Brisbane Queensland",
    variations: [
      {
        name: "BRIS",
      },
    ],
  },
  {
    name: "Broken River",
    variations: [
      {
        name: "BROK",
      },
      {
        name: "BR OK",
      },
      {
        name: "BROKEN R",
      },
      {
        name: "BROKEN RI",
      },
      {
        name: "BROKEN RIV",
      },
      {
        name: "BROKEN RR",
      },
      {
        name: "BROKEN RV",
      },
      {
        name: "BROKEN RVR",
      },
    ],
  },
  {
    name: "Brownsdale",
    variations: [
      {
        name: "BROW",
      },
    ],
  },
  {
    name: "Brown's Diggings",
    variations: [
      {
        name: "BROWN D",
      },
      {
        name: "BROWNS",
      },
    ],
  },
  {
    name: "Bolworrah",
    variations: [
      {
        name: "BRRAH",
      },
    ],
  },
  {
    name: "Britain",
    variations: [
      {
        name: "BRTN",
      },
    ],
  },
  {
    name: "Bruce's Creek",
    variations: [
      {
        name: "BRUC",
      },
    ],
  },
  {
    name: "Brussels Belgium",
    variations: [
      {
        name: "BRUS",
      },
    ],
  },
  {
    name: "Bruthen",
    variations: [
      {
        name: "BRUT",
      },
    ],
  },
  {
    name: "Bungaree",
    variations: [
      {
        name: "BU NG",
      },
      {
        name: "BING",
      },
      {
        name: "BUNG",
      },
      {
        name: "BUNGAR",
      },
      {
        name: "BURG",
      },
    ],
  },
  {
    name: "Buangor",
    variations: [
      {
        name: "BUAN",
      },
      {
        name: "BU AN",
      },
    ],
  },
  {
    name: "Buchan",
    variations: [
      {
        name: "BUCH",
      },
      {
        name: "BU CH",
      },
    ],
  },
  {
    name: "Bullock Creek",
    variations: [
      {
        name: "BULL",
      },
      {
        name: "BULLOCK CK",
      },
    ],
  },
  {
    name: "Bulla and Tullarmarine",
    variations: [
      {
        name: "BULLA and TU",
      },
      {
        name: "BULLA TULL",
      },
    ],
  },
  {
    name: "Bulla Bulla",
    variations: [
      {
        name: "BULLA BUL",
      },
      {
        name: "BULLA BULL",
      },
    ],
  },
  {
    name: "Bullarook",
    variations: [
      {
        name: "BULLAR",
      },
      {
        name: "BULLARO",
      },
      {
        name: "BULLAROO",
      },
      {
        name: "BROOK",
      },
      {
        name: "BULL",
      },
    ],
  },
  {
    name: "Bullengarook",
    variations: [
      {
        name: "BULLENGARO",
      },
      {
        name: "BULL",
      },
    ],
  },
  {
    name: "Buln-Buln",
    variations: [
      {
        name: "BULN",
      },
    ],
  },
  {
    name: "Bundoora",
    variations: [
      {
        name: "BUND",
      },
      {
        name: "BDOORA",
      },
      {
        name: "BUN",
      },
    ],
  },
  {
    name: "Bundalong",
    variations: [
      {
        name: "BUNDA",
      },
      {
        name: "BUND",
      },
      {
        name: "BU ND",
      },
    ],
  },
  {
    name: "Bunguluke",
    variations: [
      {
        name: "BUNG",
      },
      {
        name: "BING",
      },
    ],
  },
  {
    name: "Buntingdale Creek",
    variations: [
      {
        name: "BUNTINGDAL",
      },
    ],
  },
  {
    name: "Burke's Flat",
    variations: [
      {
        name: "BURK",
      },
    ],
  },
  {
    name: "Burnt Creek (4)",
    variations: [
      {
        name: "BURN",
      },
      {
        name: "BURNT CREE",
      },
    ],
  },
  {
    name: "Burnt Bridge",
    variations: [
      {
        name: "BURNT BDGE",
      },
    ],
  },
  {
    name: "Bushy Creek",
    variations: [
      {
        name: "BUSH",
      },
    ],
  },
  {
    name: "Byaduc",
    variations: [
      {
        name: "BYAD",
      },
    ],
  },
  {
    name: "Byawatha",
    variations: [
      {
        name: "BYAW",
      },
    ],
  },
  {
    name: "Bylands",
    variations: [
      {
        name: "BYLA",
      },
      {
        name: "BY LA",
      },
    ],
  },
  {
    name: "Campbellfield",
    variations: [
      {
        name: "C BELL FLD",
      },
      {
        name: "CAMBELLFIE",
      },
      {
        name: "CAMBFLD",
      },
      {
        name: "CAMPBFD",
      },
      {
        name: "CB FIELD",
      },
      {
        name: "CAMFD",
      },
      {
        name: "CAMP",
      },
      {
        name: "CA MP",
      },
      {
        name: "CAMPBELFIE",
      },
      {
        name: "CAMPBELLFD",
      },
      {
        name: "CAMPBELLFI",
      },
      {
        name: "CAMPFD",
      },
      {
        name: "CBFIELD",
      },
      {
        name: "C B FIELD",
      },
      {
        name: "CBFLD",
      },
      {
        name: "CCFIELD",
      },
      {
        name: "CFIELD",
      },
      {
        name: "CPFIELD",
      },
    ],
  },
  {
    name: "County Caven Ireland",
    variations: [
      {
        name: "C CA",
      },
      {
        name: "CAVA",
      },
      {
        name: "CAVAN",
      },
    ],
  },
  {
    name: "County Clare Ireland",
    variations: [
      {
        name: "C CL",
      },
      {
        name: "CLA",
      },
      {
        name: "CLAR",
      },
      {
        name: "CLARE",
      },
    ],
  },
  {
    name: "County Galway Ireland",
    variations: [
      {
        name: "C GA",
      },
      {
        name: "GAL",
      },
      {
        name: "GALW",
      },
    ],
  },
  {
    name: "Clifton Hill",
    variations: [
      {
        name: "C HILL",
      },
      {
        name: "CLIF",
      },
      {
        name: "CLIF H",
      },
      {
        name: "CLIF HILL",
      },
      {
        name: "CHILL",
      },
    ],
  },
  {
    name: "County Limerick or Limerick City",
    variations: [
      {
        name: "C LI",
      },
      {
        name: "LIM",
      },
      {
        name: "LIME",
      },
    ],
  },
  {
    name: "Cape Otway",
    variations: [
      {
        name: "C OTWAY",
      },
      {
        name: "CP OTWAY",
      },
      {
        name: "CAPE",
      },
    ],
  },
  {
    name: "Cape Schanck",
    variations: [
      {
        name: "C SCHANCK",
      },
      {
        name: "CP SCHANCK",
      },
      {
        name: "CAPE",
      },
      {
        name: "CA PE",
      },
    ],
  },
  {
    name: "Clifton Springs",
    variations: [
      {
        name: "C SPR",
      },
      {
        name: "CLIFTN",
      },
      {
        name: "CSPRGS",
      },
      {
        name: "CLIF",
      },
    ],
  },
  {
    name: "Connewarre",
    variations: [
      {
        name: "C WARRE",
      },
      {
        name: "CONN",
      },
      {
        name: "CONNE",
      },
      {
        name: "CWARRE",
      },
    ],
  },
  {
    name: "County Wicklow Ireland",
    variations: [
      {
        name: "C WICK",
      },
    ],
  },
  {
    name: "Caramut",
    variations: [
      {
        name: "CA RA",
      },
      {
        name: "CARA",
      },
      {
        name: "CARM",
      },
    ],
  },
  {
    name: "Corop",
    variations: [
      {
        name: "CA RO",
      },
      {
        name: "CO RO",
      },
      {
        name: "CORO",
      },
    ],
  },
  {
    name: "Caledonia Cr/Gu/Reef",
    variations: [
      {
        name: "CALE",
      },
    ],
  },
  {
    name: "Caledonia Diggings",
    variations: [
      {
        name: "CALEDDIG",
      },
      {
        name: "CALEDN DG",
      },
      {
        name: "CALEDON DG",
      },
    ],
  },
  {
    name: "California Gully",
    variations: [
      {
        name: "CALF",
      },
      {
        name: "CALFN GY",
      },
      {
        name: "CALFNIA GY",
      },
      {
        name: "CALFORN G",
      },
      {
        name: "CALFN GL",
      },
      {
        name: "CALFN GLY",
      },
      {
        name: "CALFRN GLY",
      },
      {
        name: "CAL GLY",
      },
      {
        name: "CAL GULLY",
      },
      {
        name: "CAL GY",
      },
      {
        name: "CALI",
      },
      {
        name: "CALIF GLY",
      },
      {
        name: "CALIF GUL",
      },
      {
        name: "CALIF GULL",
      },
      {
        name: "CALIF GULLY",
      },
      {
        name: "CALIF GULY",
      },
      {
        name: "CALIF GY",
      },
      {
        name: "CALIFN GL",
      },
      {
        name: "CALIFN GLY",
      },
      {
        name: "CALIFN GUL",
      },
      {
        name: "CALIFN GY",
      },
      {
        name: "CALIFRN G",
      },
      {
        name: "CALIFRN GY",
      },
    ],
  },
  {
    name: "Callen Ireland",
    variations: [
      {
        name: "CALL",
      },
    ],
  },
  {
    name: "Cambrian Hill",
    variations: [
      {
        name: "CAMB",
      },
      {
        name: "CAMBN HIL",
      },
      {
        name: "CAMBR HILL",
      },
      {
        name: "CAMBRIAN H",
      },
    ],
  },
  {
    name: "Camperdown",
    variations: [
      {
        name: "CAMP",
      },
      {
        name: "CAMPDOWN",
      },
      {
        name: "CDOWN",
      },
      {
        name: "CAMDOWN",
      },
      {
        name: "CA MP",
      },
      {
        name: "CTOWN",
      },
    ],
  },
  {
    name: "Campaspe",
    variations: [
      {
        name: "CAMPASP",
      },
    ],
  },
  {
    name: "Campbells Creek (2)",
    variations: [
      {
        name: "CAMPB",
      },
      {
        name: "CAMPB CK",
      },
      {
        name: "CAMPBELLS",
      },
      {
        name: "CAMPBLLS C",
      },
      {
        name: "CBELLS C",
      },
      {
        name: "CPBELLS C",
      },
    ],
  },
  {
    name: "Campbell Town",
    variations: [
      {
        name: "CAMPBELLT",
      },
      {
        name: "CAMPBELLTN",
      },
      {
        name: "CAMPBELLTP",
      },
    ],
  },
  {
    name: "Canada",
    variations: [
      {
        name: "CANA",
      },
    ],
  },
  {
    name: "Cannum",
    variations: [
      {
        name: "CANN",
      },
      {
        name: "CA NN",
      },
    ],
  },
  {
    name: "Canton China",
    variations: [
      {
        name: "CANT",
      },
    ],
  },
  {
    name: "Cape Clear",
    variations: [
      {
        name: "CAPE CLEA",
      },
      {
        name: "CAPE",
      },
    ],
  },
  {
    name: "Cape Patterson",
    variations: [
      {
        name: "CAPE PATTE",
      },
    ],
  },
  {
    name: "Cardigan",
    variations: [
      {
        name: "CARD",
      },
      {
        name: "CA RD",
      },
    ],
  },
  {
    name: "Cardiganshire Wales",
    variations: [
      {
        name: "CARDIGANSH",
      },
      {
        name: "CARDIGSH",
      },
    ],
  },
  {
    name: "Cargarie",
    variations: [
      {
        name: "CARG",
      },
    ],
  },
  {
    name: "Carisbrook",
    variations: [
      {
        name: "CARI",
      },
      {
        name: "CA RI",
      },
      {
        name: "CA RR",
      },
    ],
  },
  {
    name: "Carlsruhe",
    variations: [
      {
        name: "CARL",
      },
      {
        name: "CARLHE",
      },
      {
        name: "CARLRUH",
      },
      {
        name: "CARLSRUE",
      },
    ],
  },
  {
    name: "County Carlow Ireland",
    variations: [
      {
        name: "CARLO",
      },
    ],
  },
  {
    name: "Carlton",
    variations: [
      {
        name: "CARLT",
      },
      {
        name: "CTON",
      },
      {
        name: "CARL",
      },
      {
        name: "CA RL",
      },
      {
        name: "CAROL",
      },
    ],
  },
  {
    name: "Carlyle",
    variations: [
      {
        name: "CARLY",
      },
    ],
  },
  {
    name: "Carmarthenshire Wales",
    variations: [
      {
        name: "CARM",
      },
    ],
  },
  {
    name: "Carngham",
    variations: [
      {
        name: "CARN",
      },
      {
        name: "CARNG",
      },
      {
        name: "CARNGH",
      },
      {
        name: "CARM",
      },
      {
        name: "CA RN",
      },
      {
        name: "CHAM",
      },
    ],
  },
  {
    name: "Carrapooce",
    variations: [
      {
        name: "CARR",
      },
    ],
  },
  {
    name: "Carralulup",
    variations: [
      {
        name: "CARRALUP",
      },
    ],
  },
  {
    name: "Castlemaine",
    variations: [
      {
        name: "CAS",
      },
      {
        name: "CASTLEMNE",
      },
      {
        name: "CASTLMA",
      },
      {
        name: "CASTMA",
      },
      {
        name: "CASTMAINE",
      },
      {
        name: "CMAINE",
      },
      {
        name: "CAST",
      },
      {
        name: "CA ST",
      },
    ],
  },
  {
    name: "Cashel Co Tipperary Ireland",
    variations: [
      {
        name: "CASH",
      },
    ],
  },
  {
    name: "Castlemaine Co Kerry Ireland",
    variations: [
      {
        name: "CAST",
      },
    ],
  },
  {
    name: "Casterton",
    variations: [
      {
        name: "CASTER",
      },
      {
        name: "CASTON",
      },
      {
        name: "CASTTON",
      },
      {
        name: "CASH",
      },
      {
        name: "CAST",
      },
      {
        name: "CA ST",
      },
      {
        name: "CASTN",
      },
      {
        name: "CATN",
      },
      {
        name: "CTON",
      },
    ],
  },
  {
    name: "Cathcart",
    variations: [
      {
        name: "CATH",
      },
    ],
  },
  {
    name: "Cattle Station",
    variations: [
      {
        name: "CATT",
      },
    ],
  },
  {
    name: "Caulfield",
    variations: [
      {
        name: "CAUL",
      },
      {
        name: "CAULD",
      },
      {
        name: "C'FIELD",
      },
      {
        name: "CAUD",
      },
      {
        name: "CA UL",
      },
      {
        name: "CFIELD",
      },
      {
        name: "COLD",
      },
      {
        name: "CRUL",
      },
    ],
  },
  {
    name: "Cavendish",
    variations: [
      {
        name: "CAVE",
      },
      {
        name: "CA VE",
      },
    ],
  },
  {
    name: "Cranbourne",
    variations: [
      {
        name: "CBOURNE",
      },
      {
        name: "CRAN",
      },
      {
        name: "CBURN",
      },
      {
        name: "CR AN",
      },
      {
        name: "GRAN",
      },
    ],
  },
  {
    name: "Colebrook",
    variations: [
      {
        name: "CBROOK",
      },
    ],
  },
  {
    name: "Ceres",
    variations: [
      {
        name: "CERE",
      },
      {
        name: "CE RE",
      },
    ],
  },
  {
    name: "Charlton (2)",
    variations: [
      {
        name: "CH AR",
      },
      {
        name: "CHAR",
      },
    ],
  },
  {
    name: "Cheltenham",
    variations: [
      {
        name: "CHAM",
      },
      {
        name: "CHEL",
      },
      {
        name: "CHELTAM",
      },
      {
        name: "CHELTNM",
      },
      {
        name: "CHA",
      },
      {
        name: "CHAN",
      },
      {
        name: "CHE",
      },
      {
        name: "CHELTM",
      },
      {
        name: "CHTHAM",
      },
      {
        name: "EHAM",
      },
    ],
  },
  {
    name: "Chapel Hill",
    variations: [
      {
        name: "CHAP",
      },
    ],
  },
  {
    name: "Chatsworth",
    variations: [
      {
        name: "CHAT",
      },
      {
        name: "CHATSWTH",
      },
      {
        name: "CH AT",
      },
    ],
  },
  {
    name: "Chepstow",
    variations: [
      {
        name: "CHEP",
      },
    ],
  },
  {
    name: "Cherry Tree",
    variations: [
      {
        name: "CHER",
      },
      {
        name: "CHERRY TRE",
      },
    ],
  },
  {
    name: "Chetwynd",
    variations: [
      {
        name: "CHET",
      },
      {
        name: "CH ET",
      },
    ],
  },
  {
    name: "Chewton",
    variations: [
      {
        name: "CHEW",
      },
      {
        name: "CH EW",
      },
      {
        name: "CTON",
      },
    ],
  },
  {
    name: "Chilwell (Geelong)",
    variations: [
      {
        name: "CHIL",
      },
    ],
  },
  {
    name: "Chiltern",
    variations: [
      {
        name: "CHILTE",
      },
      {
        name: "CHILTEN",
      },
      {
        name: "CHILTER",
      },
      {
        name: "CHIL",
      },
      {
        name: "CH IL",
      },
    ],
  },
  {
    name: "Chintin",
    variations: [
      {
        name: "CHIN",
      },
    ],
  },
  {
    name: "Chinaman's Flat",
    variations: [
      {
        name: "CHINAS FL,",
      },
      {
        name: "CHINEMANS",
      },
      {
        name: "CHINMN FL",
      },
    ],
  },
  {
    name: "Clunes",
    variations: [
      {
        name: "CL UN",
      },
      {
        name: "CLUN",
      },
    ],
  },
  {
    name: "Crowlands",
    variations: [
      {
        name: "CLANDS",
      },
      {
        name: "CROW",
      },
      {
        name: "CR OW",
      },
    ],
  },
  {
    name: "Clayton",
    variations: [
      {
        name: "CLAY",
      },
      {
        name: "CL AY",
      },
    ],
  },
  {
    name: "Clear Lake",
    variations: [
      {
        name: "CLEA",
      },
      {
        name: "C LAKE",
      },
      {
        name: "CLBA",
      },
      {
        name: "CLEAR L",
      },
      {
        name: "LA KE",
      },
    ],
  },
  {
    name: "Clonmel County Tipperary",
    variations: [
      {
        name: "CLON",
      },
      {
        name: "CLONMEL",
      },
    ],
  },
  {
    name: "Clowe's Forest",
    variations: [
      {
        name: "CLOW",
      },
      {
        name: "CLOWES FT",
      },
    ],
  },
  {
    name: "Clydesdale",
    variations: [
      {
        name: "CLYD",
      },
    ],
  },
  {
    name: "Coghills Creek",
    variations: [
      {
        name: "CO GH",
      },
      {
        name: "COGH",
      },
      {
        name: "COGHILLSCK",
      },
      {
        name: "COGHILLS",
      },
      {
        name: "COGHILLS C",
      },
      {
        name: "COHGHILLSCK",
      },
      {
        name: "COGHILLS CK",
      },
      {
        name: "COGHILLSCR",
      },
      {
        name: "COGHILLS CRK",
      },
    ],
  },
  {
    name: "Colac",
    variations: [
      {
        name: "CO LA",
      },
      {
        name: "COLA",
      },
    ],
  },
  {
    name: "Collingwood",
    variations: [
      {
        name: "CO LL",
      },
      {
        name: "COLL",
      },
      {
        name: "COLLINGWD",
      },
      {
        name: "COLLWOOD",
      },
      {
        name: "CWOOD",
      },
      {
        name: "COLLINGWO",
      },
      {
        name: "COLLINGWOO",
      },
      {
        name: "COLWOOD",
      },
      {
        name: "C WOOD",
      },
      {
        name: "GWOOD",
      },
      {
        name: "WWOOD",
      },
    ],
  },
  {
    name: "Cobbler's Gully",
    variations: [
      {
        name: "COBB",
      },
    ],
  },
  {
    name: "Cobden",
    variations: [
      {
        name: "COBD",
      },
      {
        name: "CO BD",
      },
    ],
  },
  {
    name: "Cobram",
    variations: [
      {
        name: "COBR",
      },
      {
        name: "CO BR",
      },
    ],
  },
  {
    name: "Coburg",
    variations: [
      {
        name: "COBU",
      },
    ],
  },
  {
    name: "Cochrane's Diggings",
    variations: [
      {
        name: "COCH",
      },
      {
        name: "COCHRAN",
      },
      {
        name: "COCHRANE",
      },
      {
        name: "COCHRNS DG",
      },
    ],
  },
  {
    name: "Cockpen",
    variations: [
      {
        name: "COCK",
      },
    ],
  },
  {
    name: "Codrington",
    variations: [
      {
        name: "CODGTON",
      },
      {
        name: "CODR",
      },
      {
        name: "COOR",
      },
    ],
  },
  {
    name: "Cohuna",
    variations: [
      {
        name: "COHU",
      },
      {
        name: "CO HU",
      },
    ],
  },
  {
    name: "Coimadai",
    variations: [
      {
        name: "COIM",
      },
    ],
  },
  {
    name: "Colbinabbin",
    variations: [
      {
        name: "COLB",
      },
    ],
  },
  {
    name: "Coleraine",
    variations: [
      {
        name: "COLE",
      },
      {
        name: "COLER",
      },
      {
        name: "CO LE",
      },
    ],
  },
  {
    name: "Coliban Diggings",
    variations: [
      {
        name: "COLI",
      },
    ],
  },
  {
    name: "Cologne Germany",
    variations: [
      {
        name: "COLO",
      },
    ],
  },
  {
    name: "Commissioners' Gully",
    variations: [
      {
        name: "COMM",
      },
      {
        name: "COMMGLY",
      },
      {
        name: "COMMRS GLY",
      },
      {
        name: "COMMS GLY",
      },
    ],
  },
  {
    name: "Coomoora",
    variations: [
      {
        name: "COMO",
      },
      {
        name: "COOM",
      },
    ],
  },
  {
    name: "Concongela Creek",
    variations: [
      {
        name: "CONCLLA C",
      },
      {
        name: "CONCONGE",
      },
      {
        name: "CONCONGELL",
      },
    ],
  },
  {
    name: "Condah",
    variations: [
      {
        name: "COND",
      },
      {
        name: "CO ND",
      },
    ],
  },
  {
    name: "Conover",
    variations: [
      {
        name: "CONO",
      },
      {
        name: "CO NO",
      },
    ],
  },
  {
    name: "Coongulmerang",
    variations: [
      {
        name: "COON",
      },
      {
        name: "CO ON",
      },
    ],
  },
  {
    name: "Lake Coorong",
    variations: [
      {
        name: "COOR",
      },
    ],
  },
  {
    name: "Copenhagen Denmark",
    variations: [
      {
        name: "COPE",
      },
    ],
  },
  {
    name: "County Cork Ire or Cork City",
    variations: [
      {
        name: "COR",
      },
      {
        name: "CORK",
      },
    ],
  },
  {
    name: "Corack",
    variations: [
      {
        name: "CORA",
      },
      {
        name: "CO RA",
      },
    ],
  },
  {
    name: "Corduroy",
    variations: [
      {
        name: "CORD",
      },
    ],
  },
  {
    name: "Corio",
    variations: [
      {
        name: "CORI",
      },
      {
        name: "CO RI",
      },
    ],
  },
  {
    name: "Cornwall England",
    variations: [
      {
        name: "CORN",
      },
    ],
  },
  {
    name: "Cororooke",
    variations: [
      {
        name: "CORO",
      },
      {
        name: "CROOKE",
      },
    ],
  },
  {
    name: "Corryong",
    variations: [
      {
        name: "CORR",
      },
      {
        name: "CO RR",
      },
      {
        name: "CWONG",
      },
      {
        name: "CYONG",
      },
    ],
  },
  {
    name: "Costerfield",
    variations: [
      {
        name: "COST",
      },
      {
        name: "COSTERFIEL",
      },
      {
        name: "COSTFIELD",
      },
      {
        name: "CO ST",
      },
    ],
  },
  {
    name: "County Derry Ireland",
    variations: [
      {
        name: "COUNTY DER",
      },
    ],
  },
  {
    name: "Cowana",
    variations: [
      {
        name: "COWA",
      },
      {
        name: "COWAN",
      },
    ],
  },
  {
    name: "Cowes",
    variations: [
      {
        name: "COWE",
      },
      {
        name: "CO WE",
      },
    ],
  },
  {
    name: "Cowie's Creek",
    variations: [
      {
        name: "COWI",
      },
    ],
  },
  {
    name: "Cowley's Creek",
    variations: [
      {
        name: "COWL",
      },
    ],
  },
  {
    name: "Cowwarr",
    variations: [
      {
        name: "COWW",
      },
      {
        name: "COWA",
      },
      {
        name: "CO WA",
      },
      {
        name: "CO WW",
      },
    ],
  },
  {
    name: "Coxtown",
    variations: [
      {
        name: "COXT",
      },
    ],
  },
  {
    name: "Coys Diggings",
    variations: [
      {
        name: "COYS",
      },
      {
        name: "COYS DGS",
      },
      {
        name: "COYS DIGGI",
      },
    ],
  },
  {
    name: "Craigieburn",
    variations: [
      {
        name: "CRAI",
      },
      {
        name: "CRAIGGIE",
      },
      {
        name: "CRAIGIE BU",
      },
      {
        name: "CRAIGIEBRN",
      },
      {
        name: "CBURN",
      },
    ],
  },
  {
    name: "Crawford River",
    variations: [
      {
        name: "CRAW",
      },
    ],
  },
  {
    name: "Creswick",
    variations: [
      {
        name: "CRES",
      },
      {
        name: "CRSWK",
      },
      {
        name: "CWICK",
      },
      {
        name: "CR ES",
      },
      {
        name: "CRESW",
      },
      {
        name: "CREWK",
      },
      {
        name: "CRIS",
      },
      {
        name: "CRWK",
      },
      {
        name: "C WICK",
      },
    ],
  },
  {
    name: "Crooked River",
    variations: [
      {
        name: "CROO",
      },
    ],
  },
  {
    name: "Crossley",
    variations: [
      {
        name: "CROS",
      },
    ],
  },
  {
    name: "Croxton",
    variations: [
      {
        name: "CROX",
      },
    ],
  },
  {
    name: "Cudgee Creek",
    variations: [
      {
        name: "CUDG",
      },
      {
        name: "KUDGEE CK",
      },
      {
        name: "KUDGEE CRK",
      },
    ],
  },
  {
    name: "Cumberland England",
    variations: [
      {
        name: "CUMB",
      },
    ],
  },
  {
    name: "Cundare",
    variations: [
      {
        name: "CUND",
      },
    ],
  },
  {
    name: "Camberwell",
    variations: [
      {
        name: "CWELL",
      },
      {
        name: "CAMB",
      },
      {
        name: "CA MB",
      },
      {
        name: "CARM",
      },
      {
        name: "SWELL",
      },
      {
        name: "WELL",
      },
    ],
  },
  {
    name: "Collingwood Flat",
    variations: [
      {
        name: "CWOOD FLT",
      },
      {
        name: "CWOOD FL",
      },
      {
        name: "CWOOD FLA",
      },
      {
        name: "CWOOD FLAT",
      },
    ],
  },
  {
    name: "Dabyminga",
    variations: [
      {
        name: "DABY",
      },
    ],
  },
  {
    name: "Daisy Hill",
    variations: [
      {
        name: "DAIS",
      },
      {
        name: "DAISY H",
      },
      {
        name: "DAISY HIL",
      },
      {
        name: "DAISY HL",
      },
    ],
  },
  {
    name: "Dalhousie County",
    variations: [
      {
        name: "DALH",
      },
    ],
  },
  {
    name: "Damper Creek",
    variations: [
      {
        name: "DAMP",
      },
    ],
  },
  {
    name: "Dandenong",
    variations: [
      {
        name: "DAND",
      },
      {
        name: "DNONG",
      },
      {
        name: "DNOND",
      },
      {
        name: "DONG",
      },
    ],
  },
  {
    name: "Darebin",
    variations: [
      {
        name: "DARE",
      },
      {
        name: "DAREBIN",
      },
    ],
  },
  {
    name: "Dargo",
    variations: [
      {
        name: "DARG",
      },
    ],
  },
  {
    name: "Darriwell",
    variations: [
      {
        name: "DARI",
      },
      {
        name: "DARR",
      },
      {
        name: "DARRI",
      },
    ],
  },
  {
    name: "Darlimurla",
    variations: [
      {
        name: "DARL",
      },
      {
        name: "DA RL",
      },
    ],
  },
  {
    name: "Darlingford",
    variations: [
      {
        name: "DARLINGFD",
      },
      {
        name: "DARL",
      },
      {
        name: "DA RL",
      },
    ],
  },
  {
    name: "Darlington (2)",
    variations: [
      {
        name: "DARLTON",
      },
      {
        name: "DGTON",
      },
      {
        name: "DLINGTON",
      },
      {
        name: "DTON",
      },
    ],
  },
  {
    name: "Dartmoor",
    variations: [
      {
        name: "DART",
      },
      {
        name: "DA RT",
      },
    ],
  },
  {
    name: "Daylesford",
    variations: [
      {
        name: "DAYL",
      },
      {
        name: "DFORD",
      },
      {
        name: "BA YL",
      },
      {
        name: "DA YL",
      },
      {
        name: "D FORD",
      },
    ],
  },
  {
    name: "Deadhorse Gully",
    variations: [
      {
        name: "DEAD",
      },
      {
        name: "DEAD H GY",
      },
    ],
  },
  {
    name: "Deans Marsh",
    variations: [
      {
        name: "DEAN MARS",
      },
      {
        name: "DEANS M",
      },
      {
        name: "DEANS MSH",
      },
      {
        name: "DEAN",
      },
      {
        name: "DE AN",
      },
      {
        name: "DEANS MARS",
      },
    ],
  },
  {
    name: "Dederang",
    variations: [
      {
        name: "DEDE",
      },
      {
        name: "DE DE",
      },
    ],
  },
  {
    name: "Deep Creek (6)",
    variations: [
      {
        name: "DEEP",
      },
      {
        name: "DEEP CRK",
      },
    ],
  },
  {
    name: "Deep Lead",
    variations: [
      {
        name: "DEEP LD",
      },
      {
        name: "DEEP",
      },
    ],
  },
  {
    name: "Delatite",
    variations: [
      {
        name: "DELA",
      },
      {
        name: "DE LA",
      },
    ],
  },
  {
    name: "Deniliquin",
    variations: [
      {
        name: "DENI",
      },
    ],
  },
  {
    name: "Dennington",
    variations: [
      {
        name: "DENN",
      },
      {
        name: "DE NN",
      },
    ],
  },
  {
    name: "Deptford",
    variations: [
      {
        name: "DEPT",
      },
    ],
  },
  {
    name: "Derbyshire England",
    variations: [
      {
        name: "DERB",
      },
    ],
  },
  {
    name: "Dereel",
    variations: [
      {
        name: "DERE",
      },
      {
        name: "DE RE",
      },
    ],
  },
  {
    name: "Dergholm",
    variations: [
      {
        name: "DERG",
      },
    ],
  },
  {
    name: "Derrimut",
    variations: [
      {
        name: "DERR",
      },
    ],
  },
  {
    name: "Devenish",
    variations: [
      {
        name: "DEVE",
      },
    ],
  },
  {
    name: "Devils River",
    variations: [
      {
        name: "DEVI",
      },
      {
        name: "DEVI RIV",
      },
      {
        name: "DEVILS RIV",
      },
    ],
  },
  {
    name: "Devon England",
    variations: [
      {
        name: "DEVO",
      },
    ],
  },
  {
    name: "Digby",
    variations: [
      {
        name: "DIGB",
      },
      {
        name: "DI GB",
      },
    ],
  },
  {
    name: "Diggorra",
    variations: [
      {
        name: "DIGG",
      },
    ],
  },
  {
    name: "Digger's Rest",
    variations: [
      {
        name: "DIGGERS R",
      },
      {
        name: "DIGGERS RE",
      },
      {
        name: "DIGGERS RS",
      },
      {
        name: "DIGGERS RT",
      },
    ],
  },
  {
    name: "Dimboola",
    variations: [
      {
        name: "DIMB",
      },
      {
        name: "DBOOLA",
      },
      {
        name: "DI MB",
      },
    ],
  },
  {
    name: "Dunkeld",
    variations: [
      {
        name: "DKELD",
      },
      {
        name: "DUNK",
      },
      {
        name: "DUNKEL",
      },
      {
        name: "DU NK",
      },
    ],
  },
  {
    name: "Dunolly",
    variations: [
      {
        name: "DLLY",
      },
      {
        name: "DOLLY",
      },
      {
        name: "DUNO",
      },
      {
        name: "DO NN",
      },
      {
        name: "DUND",
      },
      {
        name: "DU NN",
      },
      {
        name: "DU NO",
      },
    ],
  },
  {
    name: "Diamond Creek",
    variations: [
      {
        name: "DMOND",
      },
      {
        name: "DIAM",
      },
      {
        name: "DI AM",
      },
      {
        name: "DIAMOND",
      },
      {
        name: "DIAMOND C",
      },
      {
        name: "DIAMOND CK",
      },
      {
        name: "DIAMOND CR",
      },
      {
        name: "DIAMOND CRK",
      },
    ],
  },
  {
    name: "Donald",
    variations: [
      {
        name: "DO NA",
      },
      {
        name: "DON",
      },
      {
        name: "DONA",
      },
    ],
  },
  {
    name: "Doncaster",
    variations: [
      {
        name: "DO NC",
      },
      {
        name: "DONC",
      },
      {
        name: "DCASTER",
      },
      {
        name: "DON",
      },
    ],
  },
  {
    name: "Dobie's Bridge",
    variations: [
      {
        name: "DOBI",
      },
    ],
  },
  {
    name: "Docker's Plains",
    variations: [
      {
        name: "DOCK",
      },
    ],
  },
  {
    name: "Doctor's Creek or Gully",
    variations: [
      {
        name: "DOCT",
      },
    ],
  },
  {
    name: "Dogtrap Creek",
    variations: [
      {
        name: "DOGT",
      },
    ],
  },
  {
    name: "Dolly's Creek",
    variations: [
      {
        name: "DOLL",
      },
    ],
  },
  {
    name: "Donkey Hill",
    variations: [
      {
        name: "DONK",
      },
    ],
  },
  {
    name: "Donnybrook",
    variations: [
      {
        name: "DONN",
      },
      {
        name: "DONNYBK",
      },
    ],
  },
  {
    name: "Donnelly's Creek (2)",
    variations: [
      {
        name: "DONNY CR",
      },
    ],
  },
  {
    name: "Dooen",
    variations: [
      {
        name: "DOOE",
      },
    ],
  },
  {
    name: "Dookie",
    variations: [
      {
        name: "DOOK",
      },
      {
        name: "BOOK",
      },
      {
        name: "DOOR",
      },
    ],
  },
  {
    name: "Dowling Forest",
    variations: [
      {
        name: "DOWL",
      },
      {
        name: "DOWLING",
      },
      {
        name: "DOWLING F",
      },
      {
        name: "DOWLING FL",
      },
      {
        name: "DOWLING FO",
      },
      {
        name: "DOWLING FR",
      },
      {
        name: "DOWLING FS",
      },
      {
        name: "DOWLING FT",
      },
    ],
  },
  {
    name: "County Down Ireland",
    variations: [
      {
        name: "DOWN",
      },
    ],
  },
  {
    name: "Dromana Ireland",
    variations: [
      {
        name: "DROM",
      },
    ],
  },
  {
    name: "Drouin",
    variations: [
      {
        name: "DROU",
      },
      {
        name: "DR OU",
      },
    ],
  },
  {
    name: "Drummond",
    variations: [
      {
        name: "DRUM",
      },
    ],
  },
  {
    name: "Drung-Drung",
    variations: [
      {
        name: "DRUN",
      },
    ],
  },
  {
    name: "Dry Diggings",
    variations: [
      {
        name: "DRY DIGGIN",
      },
      {
        name: "DRY DIGGS",
      },
      {
        name: "DRYD",
      },
      {
        name: "DR YD",
      },
    ],
  },
  {
    name: "Dry Creek (2)",
    variations: [
      {
        name: "DRYC",
      },
    ],
  },
  {
    name: "Drysdale Creek",
    variations: [
      {
        name: "DRYD",
      },
    ],
  },
  {
    name: "Dublin Ireland",
    variations: [
      {
        name: "DUBL",
      },
    ],
  },
  {
    name: "Duchembeg",
    variations: [
      {
        name: "DUCH",
      },
    ],
  },
  {
    name: "Duck Ponds",
    variations: [
      {
        name: "DUCK",
      },
      {
        name: "DUCK PDS",
      },
      {
        name: "DUCK PNDS",
      },
    ],
  },
  {
    name: "Dunbulbalane",
    variations: [
      {
        name: "DUNB",
      },
      {
        name: "DUNBUBALAN",
      },
      {
        name: "DUNBULBA-L",
      },
    ],
  },
  {
    name: "Dundee Scotland",
    variations: [
      {
        name: "DUND",
      },
    ],
  },
  {
    name: "Duneed",
    variations: [
      {
        name: "DUNE",
      },
    ],
  },
  {
    name: "Dunmore",
    variations: [
      {
        name: "DUNM",
      },
    ],
  },
  {
    name: "Durdidwarrah",
    variations: [
      {
        name: "DURDIDWAH",
      },
      {
        name: "DURDIDWARR",
      },
    ],
  },
  {
    name: "Durhamox",
    variations: [
      {
        name: "DURH",
      },
    ],
  },
  {
    name: "East Bellarine",
    variations: [
      {
        name: "E BELLA",
      },
    ],
  },
  {
    name: "Eldorado",
    variations: [
      {
        name: "E DORADO",
      },
      {
        name: "ELDO",
      },
      {
        name: "EL DO",
      },
    ],
  },
  {
    name: "Emerald Hill",
    variations: [
      {
        name: "E HILL",
      },
      {
        name: "EH IL",
      },
      {
        name: "EHIL",
      },
      {
        name: "EM ER",
      },
      {
        name: "EMD HILL",
      },
      {
        name: "EMER H",
      },
      {
        name: "EMLD HILL",
      },
      {
        name: "AMER",
      },
      {
        name: "EMDHILL",
      },
      {
        name: "EMER",
      },
      {
        name: "EMERALD H",
      },
      {
        name: "EMERALD HI",
      },
      {
        name: "EMERALD HL",
      },
      {
        name: "EM H",
      },
    ],
  },
  {
    name: "Eaglehawk",
    variations: [
      {
        name: "EAG'HAWK",
      },
      {
        name: "EAGL",
      },
      {
        name: "EAGLE",
      },
      {
        name: "EAGLHK GY",
      },
      {
        name: "EHAWK",
      },
      {
        name: "EA GL",
      },
      {
        name: "EHAW",
      },
      {
        name: "E HAWK",
      },
      {
        name: "HAWK",
      },
    ],
  },
  {
    name: "East Brighton",
    variations: [
      {
        name: "EAST BTON",
      },
      {
        name: "EAST",
      },
      {
        name: "EBRI",
      },
      {
        name: "E BRIGHT",
      },
      {
        name: "E BRIGHTON",
      },
      {
        name: "E BTN",
      },
      {
        name: "E BTON",
      },
    ],
  },
  {
    name: "East Charlton",
    variations: [
      {
        name: "EAST CHARL",
      },
    ],
  },
  {
    name: "Echuca",
    variations: [
      {
        name: "ECHU",
      },
      {
        name: "ECA",
      },
      {
        name: "EC HU",
      },
    ],
  },
  {
    name: "Ecklin Creek",
    variations: [
      {
        name: "ECKL",
      },
    ],
  },
  {
    name: "Eclipse",
    variations: [
      {
        name: "ECLI",
      },
    ],
  },
  {
    name: "Eddington",
    variations: [
      {
        name: "EDDI",
      },
      {
        name: "ED DI",
      },
    ],
  },
  {
    name: "Edenhope",
    variations: [
      {
        name: "EDEN",
      },
      {
        name: "EDHOPE",
      },
      {
        name: "EHOPE",
      },
      {
        name: "ED EN",
      },
    ],
  },
  {
    name: "Edgecombe",
    variations: [
      {
        name: "EDGE",
      },
    ],
  },
  {
    name: "Essendon",
    variations: [
      {
        name: "EDON",
      },
      {
        name: "ESS",
      },
      {
        name: "ESSDON",
      },
      {
        name: "ESSE",
      },
      {
        name: "ESDON",
      },
      {
        name: "ES SE",
      },
    ],
  },
  {
    name: "Edwards River",
    variations: [
      {
        name: "EDWA",
      },
    ],
  },
  {
    name: "Eganstown",
    variations: [
      {
        name: "EGAN",
      },
      {
        name: "EG AN",
      },
    ],
  },
  {
    name: "Egerton",
    variations: [
      {
        name: "EGER",
      },
    ],
  },
  {
    name: "Elaine",
    variations: [
      {
        name: "ELAI",
      },
    ],
  },
  {
    name: "Elgar's Survey",
    variations: [
      {
        name: "ELGA",
      },
      {
        name: "ELGARS SUR",
      },
      {
        name: "ELGARS SVY",
      },
    ],
  },
  {
    name: "Ellerslie",
    variations: [
      {
        name: "ELLE",
      },
      {
        name: "EL LE",
      },
    ],
  },
  {
    name: "Elliminyt",
    variations: [
      {
        name: "ELLI",
      },
    ],
  },
  {
    name: "Elmshurst",
    variations: [
      {
        name: "ELMH",
      },
    ],
  },
  {
    name: "Elmore",
    variations: [
      {
        name: "ELMO",
      },
      {
        name: "EL MO",
      },
    ],
  },
  {
    name: "Elphinstone",
    variations: [
      {
        name: "ELPHIN",
      },
      {
        name: "ELPHINST",
      },
      {
        name: "ELPH",
      },
    ],
  },
  {
    name: "Elsternwick",
    variations: [
      {
        name: "ELST",
      },
      {
        name: "ELSTWICK",
      },
      {
        name: "ELWICK",
      },
      {
        name: "EWIK",
      },
      {
        name: "EL ST",
      },
      {
        name: "EWICK",
      },
    ],
  },
  {
    name: "Eltham",
    variations: [
      {
        name: "ELTH",
      },
      {
        name: "EL TH",
      },
      {
        name: "ETHAM",
      },
    ],
  },
  {
    name: "Elwood",
    variations: [
      {
        name: "ELWO",
      },
    ],
  },
  {
    name: "Elysian Flat",
    variations: [
      {
        name: "ELYS",
      },
      {
        name: "ELYSIAN",
      },
      {
        name: "ELYSIAN FL",
      },
      {
        name: "ELYSIAN FT",
      },
    ],
  },
  {
    name: "Emberton",
    variations: [
      {
        name: "EMBE",
      },
    ],
  },
  {
    name: "Enfield",
    variations: [
      {
        name: "ENFI",
      },
    ],
  },
  {
    name: "England",
    variations: [
      {
        name: "ENG",
      },
    ],
  },
  {
    name: "Enoch's Point",
    variations: [
      {
        name: "ENOC",
      },
    ],
  },
  {
    name: "Epping",
    variations: [
      {
        name: "EPPI",
      },
      {
        name: "EP PI",
      },
    ],
  },
  {
    name: "Epsom",
    variations: [
      {
        name: "EPSO",
      },
    ],
  },
  {
    name: "Estcourt",
    variations: [
      {
        name: "ESTC",
      },
    ],
  },
  {
    name: "Eumerella River",
    variations: [
      {
        name: "EUME",
      },
    ],
  },
  {
    name: "Europa Gully",
    variations: [
      {
        name: "EUR",
      },
      {
        name: "EURO",
      },
    ],
  },
  {
    name: "Eurambeen",
    variations: [
      {
        name: "EURA",
      },
    ],
  },
  {
    name: "Eureka Reef",
    variations: [
      {
        name: "EURE",
      },
      {
        name: "EUREKA RF",
      },
    ],
  },
  {
    name: "Evansford",
    variations: [
      {
        name: "EVAN",
      },
    ],
  },
  {
    name: "Evelyn",
    variations: [
      {
        name: "EVEL",
      },
    ],
  },
  {
    name: "Everton",
    variations: [
      {
        name: "EVER",
      },
      {
        name: "EV ER",
      },
    ],
  },
  {
    name: "Fitzroy",
    variations: [
      {
        name: "F",
      },
      {
        name: "FITZ",
      },
      {
        name: "FROY",
      },
      {
        name: "CROY",
      },
      {
        name: "FIRI",
      },
      {
        name: "FI TZ",
      },
      {
        name: "FTIZ",
      },
    ],
  },
  {
    name: "Faithfull's Creek",
    variations: [
      {
        name: "FAIT",
      },
    ],
  },
  {
    name: "Faraday",
    variations: [
      {
        name: "FARA",
      },
      {
        name: "FA RA",
      },
    ],
  },
  {
    name: "Farnham",
    variations: [
      {
        name: "FARN",
      },
    ],
  },
  {
    name: "Farnham's Special Survey",
    variations: [
      {
        name: "FARNHAM S",
      },
      {
        name: "FARNHAM SU",
      },
    ],
  },
  {
    name: "Freeburgh",
    variations: [
      {
        name: "FBURGH",
      },
      {
        name: "FREE",
      },
      {
        name: "FR EE",
      },
    ],
  },
  {
    name: "Footscray",
    variations: [
      {
        name: "FCRAY",
      },
      {
        name: "FCY",
      },
      {
        name: "FOO",
      },
      {
        name: "FOOT",
      },
      {
        name: "FSCRAY",
      },
      {
        name: "FO OT",
      },
      {
        name: "FOOTS",
      },
    ],
  },
  {
    name: "Fenton's Creek",
    variations: [
      {
        name: "FENT",
      },
    ],
  },
  {
    name: "County Fermanagh Ireland",
    variations: [
      {
        name: "FERM",
      },
      {
        name: "FERMANAGH",
      },
    ],
  },
  {
    name: "Fernhurst",
    variations: [
      {
        name: "FERN",
      },
    ],
  },
  {
    name: "Fern Tree Gully",
    variations: [
      {
        name: "FERN TG",
      },
    ],
  },
  {
    name: "Fiery Creek",
    variations: [
      {
        name: "FIER",
      },
    ],
  },
  {
    name: "First White Hill",
    variations: [
      {
        name: "FIRST WHITE",
      },
      {
        name: "FIRST WT H",
      },
    ],
  },
  {
    name: "North Fitzroy",
    variations: [
      {
        name: "FITZ N",
      },
      {
        name: "NFIT",
      },
      {
        name: "NFITZ",
      },
      {
        name: "N FITZ",
      },
      {
        name: "N FITZRO",
      },
      {
        name: "N FITZROY",
      },
      {
        name: "NFROY",
      },
      {
        name: "N FROY",
      },
      {
        name: "NTH FIFZ",
      },
      {
        name: "NTH FITZ",
      },
      {
        name: "NTH FITZRO",
      },
      {
        name: "NTH FROY",
      },
      {
        name: "NTH FRY",
      },
    ],
  },
  {
    name: "Five Mile Creek (4)",
    variations: [
      {
        name: "FIVE MILE",
      },
    ],
  },
  {
    name: "Flagstaff Gully",
    variations: [
      {
        name: "FLAGSF GL",
      },
    ],
  },
  {
    name: "Flemington",
    variations: [
      {
        name: "FLEM",
      },
      {
        name: "FLTON",
      },
      {
        name: "FL EM",
      },
      {
        name: "FLEMING",
      },
      {
        name: "FLRON",
      },
      {
        name: "FTON",
      },
      {
        name: "F TON",
      },
      {
        name: "FTPM",
      },
    ],
  },
  {
    name: "Fletcher's Creek",
    variations: [
      {
        name: "FLET",
      },
    ],
  },
  {
    name: "Flinders",
    variations: [
      {
        name: "FLIN",
      },
      {
        name: "FL IN",
      },
    ],
  },
  {
    name: "Flooding Creek",
    variations: [
      {
        name: "FLOO",
      },
    ],
  },
  {
    name: "Flynn's Creek (2)",
    variations: [
      {
        name: "FLYN",
      },
    ],
  },
  {
    name: "Forbes",
    variations: [
      {
        name: "FORB",
      },
    ],
  },
  {
    name: "Forest Creek Diggings",
    variations: [
      {
        name: "FORE",
      },
    ],
  },
  {
    name: "Forty Foot",
    variations: [
      {
        name: "FORT",
      },
    ],
  },
  {
    name: "Fort William Scotland",
    variations: [
      {
        name: "FORT WILLI",
      },
      {
        name: "FORT WM",
      },
    ],
  },
  {
    name: "Foster",
    variations: [
      {
        name: "FOST",
      },
      {
        name: "FO ST",
      },
    ],
  },
  {
    name: "Four Mile Creek (2) or Flat",
    variations: [
      {
        name: "FOUR",
      },
      {
        name: "FOUR MLE F",
      },
    ],
  },
  {
    name: "Framlingham",
    variations: [
      {
        name: "FRAM",
      },
      {
        name: "FRAMLINGHA",
      },
    ],
  },
  {
    name: "Frankston",
    variations: [
      {
        name: "FRAN",
      },
      {
        name: "FSTON",
      },
      {
        name: "FTON",
      },
      {
        name: "FR AN",
      },
      {
        name: "FRNN",
      },
    ],
  },
  {
    name: "Frenchman's Swamp",
    variations: [
      {
        name: "FREN",
      },
    ],
  },
  {
    name: "Freshwater Creek",
    variations: [
      {
        name: "FRES",
      },
    ],
  },
  {
    name: "Fryerstown",
    variations: [
      {
        name: "FREY (sp)",
      },
      {
        name: "FRYE",
      },
      {
        name: "FR YE",
      },
      {
        name: "FRYERS TWN",
      },
    ],
  },
  {
    name: "Fourth or Fifth White Hill",
    variations: [
      {
        name: "FTH WHT HL",
      },
    ],
  },
  {
    name: "Flemington and Kensington",
    variations: [
      {
        name: "FTON AND KTN",
      },
    ],
  },
  {
    name: "Fyansford",
    variations: [
      {
        name: "FYAN",
      },
      {
        name: "FY AN",
      },
      {
        name: "FYANS FD",
      },
      {
        name: "FYANS FOR",
      },
      {
        name: "FYANS FORD",
      },
    ],
  },
  {
    name: "Gabo Island",
    variations: [
      {
        name: "GABO",
      },
      {
        name: "GABO ISLAN",
      },
      {
        name: "GABO ISLE",
      },
      {
        name: "GABO ISLND",
      },
    ],
  },
  {
    name: "Gaffney's Creek (2)",
    variations: [
      {
        name: "GAFF",
      },
    ],
  },
  {
    name: "Gardiner's Creek (2)",
    variations: [
      {
        name: "GARD",
      },
      {
        name: "GARDNSCK",
      },
      {
        name: "GARDR CR",
      },
    ],
  },
  {
    name: "Garvoc",
    variations: [
      {
        name: "GARV",
      },
      {
        name: "GA RV",
      },
    ],
  },
  {
    name: "Geelong",
    variations: [
      {
        name: "GEE",
      },
      {
        name: "GEEL",
      },
      {
        name: "GLONG",
      },
      {
        name: "G LONG",
      },
      {
        name: "GONG",
      },
    ],
  },
  {
    name: "Mount Gellibrand",
    variations: [
      {
        name: "GELL",
      },
      {
        name: "MT GELL",
      },
      {
        name: "MT GELLD",
      },
      {
        name: "MT GELLIBR",
      },
    ],
  },
  {
    name: "Gembrook",
    variations: [
      {
        name: "GEMB",
      },
      {
        name: "GBROOK",
      },
      {
        name: "GE MB",
      },
    ],
  },
  {
    name: "Genoa",
    variations: [
      {
        name: "GENO",
      },
      {
        name: "GE NO",
      },
    ],
  },
  {
    name: "Geringhap",
    variations: [
      {
        name: "GERHAP",
      },
      {
        name: "GHER",
      },
    ],
  },
  {
    name: "Germantown",
    variations: [
      {
        name: "GERM",
      },
      {
        name: "GERMAN T",
      },
      {
        name: "GERMAN TOW",
      },
      {
        name: "GERNAN T",
      },
      {
        name: "GUMANTON",
      },
    ],
  },
  {
    name: "Guildford",
    variations: [
      {
        name: "GFORD",
      },
      {
        name: "GUIL",
      },
      {
        name: "GU IL",
      },
    ],
  },
  {
    name: "Gibraltar",
    variations: [
      {
        name: "GIBR",
      },
    ],
  },
  {
    name: "Gippsland",
    variations: [
      {
        name: "GIPP",
      },
      {
        name: "GIPPSLD",
      },
      {
        name: "GIPPS",
      },
      {
        name: "GLAND",
      },
    ],
  },
  {
    name: "Gisborne",
    variations: [
      {
        name: "GISB",
      },
      {
        name: "GI SB",
      },
    ],
  },
  {
    name: "Glangile",
    variations: [
      {
        name: "GLAN",
      },
    ],
  },
  {
    name: "Glasgow Scotland",
    variations: [
      {
        name: "GLAS",
      },
    ],
  },
  {
    name: "Gledefield",
    variations: [
      {
        name: "GLED",
      },
    ],
  },
  {
    name: "Glenroy",
    variations: [
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Glenthompson",
    variations: [
      {
        name: "GLEN TSON",
      },
      {
        name: "GLENTHOMS",
      },
      {
        name: "GTHOMPSON",
      },
      {
        name: "GLEN",
      },
      {
        name: "GL EN",
      },
      {
        name: "GLEN THOM",
      },
    ],
  },
  {
    name: "Gnarwarre",
    variations: [
      {
        name: "GNAR",
      },
    ],
  },
  {
    name: "Gordons Dig",
    variations: [
      {
        name: "GO RD",
      },
      {
        name: "GORD",
      },
    ],
  },
  {
    name: "Gobur",
    variations: [
      {
        name: "GOBU",
      },
      {
        name: "GO BU",
      },
    ],
  },
  {
    name: "Goldie",
    variations: [
      {
        name: "GOLD",
      },
      {
        name: "GO LD",
      },
    ],
  },
  {
    name: "Golden Square",
    variations: [
      {
        name: "GOLDEN SQ",
      },
      {
        name: "GOLD",
      },
      {
        name: "GOLDEN S",
      },
      {
        name: "GOLD SQ",
      },
      {
        name: "GOLD SQU",
      },
      {
        name: "GOLD SQUARE",
      },
    ],
  },
  {
    name: "Gooley's Creek",
    variations: [
      {
        name: "GOOL",
      },
    ],
  },
  {
    name: "Gooroc",
    variations: [
      {
        name: "GOOR",
      },
      {
        name: "GO OR",
      },
    ],
  },
  {
    name: "Goroke",
    variations: [
      {
        name: "GORO",
      },
      {
        name: "GO RO",
      },
    ],
  },
  {
    name: "Gosling's Creek",
    variations: [
      {
        name: "GOSL",
      },
    ],
  },
  {
    name: "Goulburn River",
    variations: [
      {
        name: "GOUL",
      },
      {
        name: "GOULBN RIV",
      },
      {
        name: "GO UL",
      },
    ],
  },
  {
    name: "Gowar",
    variations: [
      {
        name: "GOWA",
      },
    ],
  },
  {
    name: "Gowangarrie",
    variations: [
      {
        name: "GOWAN",
      },
    ],
  },
  {
    name: "Golden Point",
    variations: [
      {
        name: "GPLD",
      },
      {
        name: "GOLD",
      },
    ],
  },
  {
    name: "Grampian Ranges",
    variations: [
      {
        name: "GRAM",
      },
    ],
  },
  {
    name: "The Grange",
    variations: [
      {
        name: "GRAN",
      },
      {
        name: "THEG",
      },
    ],
  },
  {
    name: "Grassy Flat",
    variations: [
      {
        name: "GRAS",
      },
    ],
  },
  {
    name: "Graytown",
    variations: [
      {
        name: "GRAY",
      },
      {
        name: "GR AY",
      },
      {
        name: "G TOWN",
      },
    ],
  },
  {
    name: "Great Western",
    variations: [
      {
        name: "GREA",
      },
      {
        name: "GREAT W",
      },
      {
        name: "GREAT WEST",
      },
      {
        name: "GR EA",
      },
      {
        name: "GT WE",
      },
      {
        name: "GT WEST",
      },
      {
        name: "GT WESTE",
      },
      {
        name: "GT WESTER",
      },
      {
        name: "GT WESTERN",
      },
      {
        name: "GT WESTN",
      },
      {
        name: "GT WSTN",
      },
    ],
  },
  {
    name: "Grenville",
    variations: [
      {
        name: "GREE",
      },
      {
        name: "GREN",
      },
      {
        name: "GR EN",
      },
    ],
  },
  {
    name: "Green Swamp",
    variations: [
      {
        name: "GREEN SWAM",
      },
    ],
  },
  {
    name: "Greensborough",
    variations: [
      {
        name: "GREENSBGH",
      },
      {
        name: "GBORO",
      },
      {
        name: "G BORO",
      },
      {
        name: "GBOROUGH",
      },
      {
        name: "G BOROUGH",
      },
      {
        name: "GREE",
      },
      {
        name: "GR EE",
      },
      {
        name: "GR EN",
      },
    ],
  },
  {
    name: "Greta",
    variations: [
      {
        name: "GRET",
      },
      {
        name: "GR ET",
      },
      {
        name: "GR IT",
      },
    ],
  },
  {
    name: "Griffith's Point",
    variations: [
      {
        name: "GRIF",
      },
    ],
  },
  {
    name: "Gritjurk",
    variations: [
      {
        name: "GRIT",
      },
    ],
  },
  {
    name: "Growlers Creek",
    variations: [
      {
        name: "GROW",
      },
      {
        name: "GLOWLRS C",
      },
      {
        name: "GR OW",
      },
      {
        name: "GROWL",
      },
      {
        name: "GROWLERS",
      },
      {
        name: "GROWLERS C",
      },
    ],
  },
  {
    name: "Gum Tree Flat",
    variations: [
      {
        name: "GUMT",
      },
    ],
  },
  {
    name: "Gunbower",
    variations: [
      {
        name: "GUNB",
      },
      {
        name: "GU NB",
      },
    ],
  },
  {
    name: "Glenvale",
    variations: [
      {
        name: "GVALE",
      },
    ],
  },
  {
    name: "Hawksedale",
    variations: [
      {
        name: "HA WK",
      },
      {
        name: "HAWK",
      },
      {
        name: "HDALE",
      },
    ],
  },
  {
    name: "Haddon",
    variations: [
      {
        name: "HADD",
      },
      {
        name: "HA DD",
      },
    ],
  },
  {
    name: "Hampton",
    variations: [
      {
        name: "HAM",
      },
      {
        name: "HAMP",
      },
      {
        name: "HTON",
      },
    ],
  },
  {
    name: "Hamburg Germany",
    variations: [
      {
        name: "HAMB",
      },
    ],
  },
  {
    name: "Hamilton",
    variations: [
      {
        name: "HAMI",
      },
      {
        name: "HLTON",
      },
      {
        name: "HA MI",
      },
      {
        name: "HA MP",
      },
      {
        name: "HTON",
      },
    ],
  },
  {
    name: "Happy Valley",
    variations: [
      {
        name: "HAPP",
      },
      {
        name: "HAPPY VY",
      },
      {
        name: "HA PP",
      },
      {
        name: "HAPPY",
      },
      {
        name: "HAPPY V",
      },
      {
        name: "HAPPY VALL",
      },
      {
        name: "HAPPYVALLE",
      },
      {
        name: "HAPPY VLY",
      },
      {
        name: "HARP",
      },
    ],
  },
  {
    name: "Harcourt",
    variations: [
      {
        name: "HARC",
      },
      {
        name: "HCOURT",
      },
      {
        name: "HA RC",
      },
      {
        name: "MARC",
      },
    ],
  },
  {
    name: "Hardie's Hill",
    variations: [
      {
        name: "HARD",
      },
    ],
  },
  {
    name: "Harkaway (2)",
    variations: [
      {
        name: "HARK",
      },
    ],
  },
  {
    name: "Harrow",
    variations: [
      {
        name: "HARR",
      },
      {
        name: "HA RR",
      },
      {
        name: "MARR",
      },
    ],
  },
  {
    name: "Hartwell",
    variations: [
      {
        name: "HART",
      },
      {
        name: "HA RT",
      },
    ],
  },
  {
    name: "Hastings",
    variations: [
      {
        name: "HAST",
      },
    ],
  },
  {
    name: "Haunted Hill or Gully",
    variations: [
      {
        name: "HAUN",
      },
    ],
  },
  {
    name: "Havelock",
    variations: [
      {
        name: "HAVE",
      },
    ],
  },
  {
    name: "Hawstead",
    variations: [
      {
        name: "HAWS",
      },
    ],
  },
  {
    name: "Hawthorn",
    variations: [
      {
        name: "HAWT",
      },
      {
        name: "HAWTH",
      },
      {
        name: "HTHORN",
      },
      {
        name: "HAWK",
      },
      {
        name: "HA WK",
      },
      {
        name: "HA WT",
      },
      {
        name: "OLDOWN",
      },
    ],
  },
  {
    name: "Hayanmi",
    variations: [
      {
        name: "HAYA",
      },
    ],
  },
  {
    name: "Hayfield",
    variations: [
      {
        name: "HAYF",
      },
    ],
  },
  {
    name: "Hazlewood",
    variations: [
      {
        name: "HAZE",
      },
      {
        name: "HAZL",
      },
    ],
  },
  {
    name: "Heidelberg",
    variations: [
      {
        name: "HBERG",
      },
      {
        name: "HEID",
      },
      {
        name: "H BERG",
      },
      {
        name: "HE ID",
      },
      {
        name: "HEIDEL",
      },
    ],
  },
  {
    name: "Heathcote",
    variations: [
      {
        name: "HCOTE",
      },
      {
        name: "HEAT",
      },
      {
        name: "HE AT",
      },
    ],
  },
  {
    name: "Hepburn Springs",
    variations: [
      {
        name: "HE SPRINGS",
      },
      {
        name: "HEPB",
      },
    ],
  },
  {
    name: "Healsville",
    variations: [
      {
        name: "HEAL",
      },
      {
        name: "HE AL",
      },
    ],
  },
  {
    name: "Hepburn",
    variations: [
      {
        name: "HEPB",
      },
      {
        name: "HE PB",
      },
    ],
  },
  {
    name: "Hern Hill",
    variations: [
      {
        name: "HERN",
      },
    ],
  },
  {
    name: "Hesket",
    variations: [
      {
        name: "HESK",
      },
      {
        name: "HE SK",
      },
    ],
  },
  {
    name: "Hexham",
    variations: [
      {
        name: "HEXH",
      },
      {
        name: "HE XH",
      },
      {
        name: "HEXN",
      },
      {
        name: "WERH",
      },
    ],
  },
  {
    name: "Heyfield",
    variations: [
      {
        name: "HEYF",
      },
      {
        name: "HFIELD",
      },
    ],
  },
  {
    name: "Heytesbury",
    variations: [
      {
        name: "HEYT",
      },
    ],
  },
  {
    name: "Heywood",
    variations: [
      {
        name: "HEYW",
      },
      {
        name: "HYWOOD",
      },
      {
        name: "AWOOD",
      },
      {
        name: "HE YW",
      },
      {
        name: "HWOOD",
      },
      {
        name: "H WOOD",
      },
    ],
  },
  {
    name: "Hillarney",
    variations: [
      {
        name: "HILL",
      },
    ],
  },
  {
    name: "Hillsborough",
    variations: [
      {
        name: "HILLSBGH",
      },
      {
        name: "HILLSBORH",
      },
      {
        name: "HBOROUGH",
      },
      {
        name: "HILL",
      },
      {
        name: "HI LL",
      },
      {
        name: "HILLSBORO",
      },
      {
        name: "HILLSBOROU",
      },
    ],
  },
  {
    name: "Hiscock's Reef or Gully",
    variations: [
      {
        name: "HISC",
      },
    ],
  },
  {
    name: "Huntly",
    variations: [
      {
        name: "HLEY",
      },
      {
        name: "HUNT",
      },
      {
        name: "HU NT",
      },
    ],
  },
  {
    name: "Hotham",
    variations: [
      {
        name: "HO TH",
      },
      {
        name: "HOTH",
      },
    ],
  },
  {
    name: "Hobart Tasmania",
    variations: [
      {
        name: "HOBA",
      },
    ],
  },
  {
    name: "Hochkirch",
    variations: [
      {
        name: "HOCH",
      },
    ],
  },
  {
    name: "Hoddle's Range or Creek",
    variations: [
      {
        name: "HODD",
      },
    ],
  },
  {
    name: "Holden",
    variations: [
      {
        name: "HOLD",
      },
    ],
  },
  {
    name: "Holland Europe",
    variations: [
      {
        name: "HOLL",
      },
    ],
  },
  {
    name: "Homebush",
    variations: [
      {
        name: "HOMB",
      },
      {
        name: "HOME",
      },
      {
        name: "HO ME",
      },
    ],
  },
  {
    name: "Honeysuckle",
    variations: [
      {
        name: "HONE",
      },
    ],
  },
  {
    name: "Hopkins River or Hill",
    variations: [
      {
        name: "HOPK",
      },
    ],
  },
  {
    name: "Hore's Hill",
    variations: [
      {
        name: "HOREH",
      },
    ],
  },
  {
    name: "Horsham",
    variations: [
      {
        name: "HORS",
      },
      {
        name: "HORSH",
      },
      {
        name: "HO RS",
      },
      {
        name: "HSHAM",
      },
    ],
  },
  {
    name: "Hotham East",
    variations: [
      {
        name: "HOTH E",
      },
      {
        name: "HOTHAM E",
      },
    ],
  },
  {
    name: "Hotspur",
    variations: [
      {
        name: "HOTS",
      },
      {
        name: "HO TS",
      },
    ],
  },
  {
    name: "Hovell's Creek",
    variations: [
      {
        name: "HOVE",
      },
    ],
  },
  {
    name: "Howqua Bridge or River",
    variations: [
      {
        name: "HOWQ",
      },
    ],
  },
  {
    name: "Highton",
    variations: [
      {
        name: "HTON",
      },
    ],
  },
  {
    name: "Hughes Creek",
    variations: [
      {
        name: "HUGH",
      },
    ],
  },
  {
    name: "Hurdle Flat",
    variations: [
      {
        name: "HURD",
      },
      {
        name: "HURDLE FL",
      },
      {
        name: "HURDLE FLA",
      },
      {
        name: "HURDLE FLT",
      },
      {
        name: "HURDLE FT",
      },
    ],
  },
  {
    name: "Harrietville",
    variations: [
      {
        name: "HVILLE",
      },
      {
        name: "HARR",
      },
      {
        name: "HA RR",
      },
    ],
  },
  {
    name: "Iguana Creek",
    variations: [
      {
        name: "IGUA",
      },
    ],
  },
  {
    name: "Ivanhoe",
    variations: [
      {
        name: "IHOE",
      },
      {
        name: "IVAN",
      },
    ],
  },
  {
    name: "Illabarook",
    variations: [
      {
        name: "ILLA",
      },
      {
        name: "IBAROOK",
      },
      {
        name: "IROOK",
      },
    ],
  },
  {
    name: "Inglewood",
    variations: [
      {
        name: "IN GL",
      },
      {
        name: "INGL",
      },
      {
        name: "IWOOD",
      },
      {
        name: "I WOOD",
      },
    ],
  },
  {
    name: "Inverleigh",
    variations: [
      {
        name: "IN VE",
      },
      {
        name: "INVE",
      },
      {
        name: "ILEIGH",
      },
      {
        name: "INLEIGH",
      },
      {
        name: "INNERLEIGH",
      },
    ],
  },
  {
    name: "Indented Head",
    variations: [
      {
        name: "INDE",
      },
      {
        name: "INDE HD",
      },
      {
        name: "IN DE",
      },
      {
        name: "INDENT",
      },
      {
        name: "INDENTED H",
      },
      {
        name: "INDENT HD",
      },
      {
        name: "INDHEAD",
      },
      {
        name: "IND HEAD",
      },
    ],
  },
  {
    name: "Indigo",
    variations: [
      {
        name: "INDI",
      },
      {
        name: "IN DI",
      },
    ],
  },
  {
    name: "Inkerman",
    variations: [
      {
        name: "INKE",
      },
    ],
  },
  {
    name: "Ireland",
    variations: [
      {
        name: "IRE",
      },
      {
        name: "IRED",
      },
      {
        name: "IREL",
      },
      {
        name: "IRLD",
      },
    ],
  },
  {
    name: "Irish Town (3)",
    variations: [
      {
        name: "IRIS",
      },
      {
        name: "IRISH TN",
      },
      {
        name: "IRISHT",
      },
      {
        name: "IRIST",
      },
    ],
  },
  {
    name: "Ironbark Gully",
    variations: [
      {
        name: "IRON",
      },
      {
        name: "IRON BARK",
      },
      {
        name: "IRONBARK G",
      },
      {
        name: "IRON BK GY",
      },
    ],
  },
  {
    name: "Irrewarra",
    variations: [
      {
        name: "IRRE",
      },
    ],
  },
  {
    name: "Ironstone Hill",
    variations: [
      {
        name: "ISTONE HILL",
      },
      {
        name: "IRON ST HL",
      },
      {
        name: "IRONSTN HL",
      },
      {
        name: "IRONSTONE",
      },
      {
        name: "IRON STONE",
      },
    ],
  },
  {
    name: "Italian Gully",
    variations: [
      {
        name: "ITAL",
      },
      {
        name: "ITALIAN G",
      },
      {
        name: "ITALIAN GL",
      },
      {
        name: "ITALIAN GU",
      },
      {
        name: "ITALIAN GY",
      },
    ],
  },
  {
    name: "Jacana",
    variations: [
      {
        name: "JACA",
      },
    ],
  },
  {
    name: "Jackson's Gully",
    variations: [
      {
        name: "JACK",
      },
    ],
  },
  {
    name: "Jamieson",
    variations: [
      {
        name: "JAMI",
      },
      {
        name: "JA MI",
      },
    ],
  },
  {
    name: "Jamieson's survey",
    variations: [
      {
        name: "JAMIESON S",
      },
    ],
  },
  {
    name: "Janefield",
    variations: [
      {
        name: "JANE",
      },
      {
        name: "JA NE",
      },
    ],
  },
  {
    name: "Jan Juc (2)",
    variations: [
      {
        name: "JANJ",
      },
    ],
  },
  {
    name: "Mount Jeffcott",
    variations: [
      {
        name: "JEFF",
      },
      {
        name: "MT JE",
      },
      {
        name: "MT JEFF",
      },
      {
        name: "MTJE",
      },
      {
        name: "MT JEFFCOA",
      },
    ],
  },
  {
    name: "Jericho Creek",
    variations: [
      {
        name: "JERI",
      },
    ],
  },
  {
    name: "Jerusalem Creek",
    variations: [
      {
        name: "JERU",
      },
    ],
  },
  {
    name: "Jim Crow Creek",
    variations: [
      {
        name: "JIM",
      },
      {
        name: "JIMC",
      },
      {
        name: "JIM CROW",
      },
      {
        name: "JIM CROW C",
      },
      {
        name: "JIM CROWN",
      },
      {
        name: "JIM CROW R",
      },
    ],
  },
  {
    name: "Jobs Gully",
    variations: [
      {
        name: "JOBS",
      },
      {
        name: "JOBS G",
      },
      {
        name: "JOBS GLY",
      },
      {
        name: "JOBS GULL",
      },
    ],
  },
  {
    name: "Jolimont",
    variations: [
      {
        name: "JOLI",
      },
    ],
  },
  {
    name: "Jones Creek (2)",
    variations: [
      {
        name: "JONE",
      },
    ],
  },
  {
    name: "Jordan",
    variations: [
      {
        name: "JORD",
      },
    ],
  },
  {
    name: "Joyce's Creek",
    variations: [
      {
        name: "JOYC",
      },
    ],
  },
  {
    name: "Jumbunna",
    variations: [
      {
        name: "JUMB",
      },
      {
        name: "JBUNNA",
      },
    ],
  },
  {
    name: "Junction (2)",
    variations: [
      {
        name: "JUNC",
      },
    ],
  },
  {
    name: "Jung Jung",
    variations: [
      {
        name: "JUNG",
      },
    ],
  },
  {
    name: "Kangaroo",
    variations: [
      {
        name: "KA NG",
      },
    ],
  },
  {
    name: "Kaarimba",
    variations: [
      {
        name: "KAAR",
      },
      {
        name: "KA AR",
      },
    ],
  },
  {
    name: "Kalkallo",
    variations: [
      {
        name: "KALK",
      },
      {
        name: "KA LK",
      },
    ],
  },
  {
    name: "Kalymna",
    variations: [
      {
        name: "KALY",
      },
    ],
  },
  {
    name: "Kamarooka",
    variations: [
      {
        name: "KAMA",
      },
      {
        name: "KA MA",
      },
      {
        name: "RA MA",
      },
    ],
  },
  {
    name: "Kangaroo Flat",
    variations: [
      {
        name: "KANG",
      },
      {
        name: "KANGO FLA",
      },
      {
        name: "KFLAT",
      },
      {
        name: "KROO FL",
      },
      {
        name: "KA NG",
      },
      {
        name: "KANGAROOF",
      },
      {
        name: "KANGAROO F",
      },
      {
        name: "KANGAROO FL",
      },
      {
        name: "KANGAROO FT",
      },
      {
        name: "KANG F",
      },
      {
        name: "KANG FL",
      },
      {
        name: "KANG FLAT",
      },
      {
        name: "KANG FT",
      },
      {
        name: "K FLAT",
      },
      {
        name: "KROO",
      },
      {
        name: "KROO F",
      },
      {
        name: "KROO FLAT",
      },
      {
        name: "KROO FLT",
      },
      {
        name: "KROO FT",
      },
    ],
  },
  {
    name: "Kaniva",
    variations: [
      {
        name: "KANI",
      },
      {
        name: "KA NI",
      },
    ],
  },
  {
    name: "Karabeal",
    variations: [
      {
        name: "KARA",
      },
    ],
  },
  {
    name: "Kardinia",
    variations: [
      {
        name: "KARD",
      },
    ],
  },
  {
    name: "Karkarooc County",
    variations: [
      {
        name: "KARK",
      },
    ],
  },
  {
    name: "Lake Karnack",
    variations: [
      {
        name: "KARN",
      },
    ],
  },
  {
    name: "Karramomus",
    variations: [
      {
        name: "KARR",
      },
      {
        name: "KA RR",
      },
    ],
  },
  {
    name: "Katandra",
    variations: [
      {
        name: "KATA",
      },
      {
        name: "KA TA",
      },
    ],
  },
  {
    name: "Kyabram",
    variations: [
      {
        name: "KBRAM",
      },
      {
        name: "KY AB",
      },
      {
        name: "KYAB",
      },
    ],
  },
  {
    name: "Korumburra",
    variations: [
      {
        name: "KBURRA",
      },
      {
        name: "KBRA",
      },
      {
        name: "K BURRA",
      },
      {
        name: "KORR",
      },
      {
        name: "KORU",
      },
      {
        name: "KO RU",
      },
      {
        name: "XORU",
      },
    ],
  },
  {
    name: "Keilor",
    variations: [
      {
        name: "KEI",
      },
      {
        name: "KEIL",
      },
      {
        name: "KEELOR",
      },
      {
        name: "KE IL",
      },
    ],
  },
  {
    name: "Keilor Plains",
    variations: [
      {
        name: "KEIL PLN",
      },
      {
        name: "KEIL",
      },
      {
        name: "KEILOR PLA",
      },
      {
        name: "KEILOR PLN",
      },
    ],
  },
  {
    name: "Kellalac",
    variations: [
      {
        name: "KELL",
      },
    ],
  },
  {
    name: "Kensington (2)",
    variations: [
      {
        name: "KENGTON",
      },
      {
        name: "KENS",
      },
      {
        name: "KENTON",
      },
    ],
  },
  {
    name: "Kennedy's Creek",
    variations: [
      {
        name: "KENN",
      },
    ],
  },
  {
    name: "County Kerry Ireland",
    variations: [
      {
        name: "KER",
      },
      {
        name: "KERR",
      },
      {
        name: "KERRY",
      },
    ],
  },
  {
    name: "Kerang",
    variations: [
      {
        name: "KERA",
      },
      {
        name: "KE RA",
      },
      {
        name: "XERA",
      },
    ],
  },
  {
    name: "Kerington",
    variations: [
      {
        name: "KERI",
      },
    ],
  },
  {
    name: "Kew Lunatic Asylum",
    variations: [
      {
        name: "KEW L ASY",
      },
      {
        name: "KEA L A",
      },
      {
        name: "KEW L A",
      },
    ],
  },
  {
    name: "Keyanga Marsh",
    variations: [
      {
        name: "KEYA",
      },
    ],
  },
  {
    name: "Khull's Range",
    variations: [
      {
        name: "KHUL",
      },
    ],
  },
  {
    name: "Kialla",
    variations: [
      {
        name: "KIAL",
      },
      {
        name: "KEAL",
      },
      {
        name: "KI AL",
      },
    ],
  },
  {
    name: "Kiata",
    variations: [
      {
        name: "KIAT",
      },
      {
        name: "KEAL",
      },
      {
        name: "KI AT",
      },
    ],
  },
  {
    name: "Kiewa",
    variations: [
      {
        name: "KIEW",
      },
      {
        name: "KI EW",
      },
    ],
  },
  {
    name: "Kilmore",
    variations: [
      {
        name: "KIL",
      },
      {
        name: "KILM",
      },
      {
        name: "KMORE",
      },
      {
        name: "KI LM",
      },
      {
        name: "KILN",
      },
    ],
  },
  {
    name: "Kildare",
    variations: [
      {
        name: "KILD",
      },
      {
        name: "KI LD",
      },
    ],
  },
  {
    name: "County Kilkenny Ireland",
    variations: [
      {
        name: "KILK",
      },
    ],
  },
  {
    name: "Killarney",
    variations: [
      {
        name: "KILL",
      },
      {
        name: "KI LL",
      },
    ],
  },
  {
    name: "Kingston",
    variations: [
      {
        name: "KING",
      },
      {
        name: "KI NG",
      },
    ],
  },
  {
    name: "Kingower",
    variations: [
      {
        name: "KINGOW",
      },
      {
        name: "KING",
      },
      {
        name: "KI NG",
      },
    ],
  },
  {
    name: "Kinloch",
    variations: [
      {
        name: "KINL",
      },
    ],
  },
  {
    name: "Kiora",
    variations: [
      {
        name: "KIOR",
      },
    ],
  },
  {
    name: "Kirkstall",
    variations: [
      {
        name: "KIRK",
      },
      {
        name: "KSTALL",
      },
      {
        name: "KI RK",
      },
      {
        name: "K STALL",
      },
    ],
  },
  {
    name: "Kolora",
    variations: [
      {
        name: "KOLO",
      },
    ],
  },
  {
    name: "Konongwootong",
    variations: [
      {
        name: "KONO",
      },
    ],
  },
  {
    name: "Koondrook",
    variations: [
      {
        name: "KOON",
      },
      {
        name: "KDROOK",
      },
      {
        name: "KO ON",
      },
    ],
  },
  {
    name: "Korwienguboora",
    variations: [
      {
        name: "KORN",
      },
      {
        name: "KORWEINGUB",
      },
    ],
  },
  {
    name: "Mount Korong",
    variations: [
      {
        name: "KORO",
      },
      {
        name: "MT KO",
      },
      {
        name: "MT KORO",
      },
      {
        name: "MT KORON",
      },
      {
        name: "MTKO",
      },
      {
        name: "MT KONG",
      },
      {
        name: "MT KORING",
      },
      {
        name: "MT KORNG",
      },
      {
        name: "MT KOT",
      },
    ],
  },
  {
    name: "Krambruk",
    variations: [
      {
        name: "KRAM",
      },
      {
        name: "FRAM",
      },
      {
        name: "KRAMBROOK",
      },
      {
        name: "KRAMBRUCK",
      },
    ],
  },
  {
    name: "Kyneton",
    variations: [
      {
        name: "KTON",
      },
      {
        name: "KYN",
      },
      {
        name: "KYNE",
      },
      {
        name: "KYTON",
      },
      {
        name: "KTN",
      },
      {
        name: "K TON",
      },
      {
        name: "KTOWN",
      },
      {
        name: "KY NE",
      },
      {
        name: "WTON",
      },
      {
        name: "XYNE",
      },
    ],
  },
  {
    name: "Limeburner's Bay",
    variations: [
      {
        name: "L BURNER",
      },
      {
        name: "LIME BURNER",
      },
    ],
  },
  {
    name: "Laanecoorie",
    variations: [
      {
        name: "LAAN",
      },
      {
        name: "LANI",
      },
    ],
  },
  {
    name: "Lake Marmal",
    variations: [
      {
        name: "LAKE",
      },
      {
        name: "LA KE",
      },
    ],
  },
  {
    name: "Lake Killear",
    variations: [
      {
        name: "LAKE KILLE",
      },
    ],
  },
  {
    name: "Lake Terang",
    variations: [
      {
        name: "LAKE TERAN",
      },
    ],
  },
  {
    name: "Lal-Lal",
    variations: [
      {
        name: "LAL",
      },
      {
        name: "LALL",
      },
    ],
  },
  {
    name: "Lambeth UK",
    variations: [
      {
        name: "LAMB",
      },
    ],
  },
  {
    name: "Lamplough",
    variations: [
      {
        name: "LAMP",
      },
      {
        name: "LA MP",
      },
    ],
  },
  {
    name: "Lancefield",
    variations: [
      {
        name: "LANC",
      },
      {
        name: "LFIELD",
      },
      {
        name: "NTH LFIEL",
      },
      {
        name: "LA NC",
      },
      {
        name: "LA NG",
      },
      {
        name: "LYST",
      },
    ],
  },
  {
    name: "Landsborough",
    variations: [
      {
        name: "LAND",
      },
      {
        name: "LANDBGH",
      },
      {
        name: "LANDSBOR",
      },
      {
        name: "LBORO",
      },
      {
        name: "LBOROUGH",
      },
      {
        name: "LDSBOROUGH",
      },
      {
        name: "G BORO",
      },
      {
        name: "LA ND",
      },
      {
        name: "LANDSB",
      },
      {
        name: "LANDSBGH",
      },
      {
        name: "LANDSBORH",
      },
      {
        name: "LANDSBORO",
      },
      {
        name: "LANDSBOROU",
      },
      {
        name: "LANDSBRO",
      },
      {
        name: "LANDSGH",
      },
      {
        name: "LAUDSBORO",
      },
      {
        name: "L BORO",
      },
      {
        name: "L BOROUGH",
      },
    ],
  },
  {
    name: "Langley",
    variations: [
      {
        name: "LANG",
      },
    ],
  },
  {
    name: "Langi Kal Kal",
    variations: [
      {
        name: "LANGI KAL",
      },
    ],
  },
  {
    name: "Langi Logan",
    variations: [
      {
        name: "LANGI LOGA",
      },
      {
        name: "LANG",
      },
    ],
  },
  {
    name: "Lardner",
    variations: [
      {
        name: "LARD",
      },
      {
        name: "LA RD",
      },
    ],
  },
  {
    name: "Larpent",
    variations: [
      {
        name: "LARP",
      },
    ],
  },
  {
    name: "Latrobe River",
    variations: [
      {
        name: "LATR",
      },
    ],
  },
  {
    name: "Launceston Tasmania",
    variations: [
      {
        name: "LAUN",
      },
    ],
  },
  {
    name: "Lauriston",
    variations: [
      {
        name: "LAUR",
      },
      {
        name: "LTON",
      },
    ],
  },
  {
    name: "Lawloit",
    variations: [
      {
        name: "LAWL",
      },
    ],
  },
  {
    name: "Layard",
    variations: [
      {
        name: "LAYA",
      },
    ],
  },
  {
    name: "Learmonth",
    variations: [
      {
        name: "LEAR",
      },
      {
        name: "LE AR",
      },
      {
        name: "LEAU",
      },
      {
        name: "LMONTH",
      },
    ],
  },
  {
    name: "Ledcourt",
    variations: [
      {
        name: "LEDC",
      },
    ],
  },
  {
    name: "Leichardt",
    variations: [
      {
        name: "LEIC",
      },
      {
        name: "LE IC",
      },
    ],
  },
  {
    name: "The Leigh",
    variations: [
      {
        name: "LEIG",
      },
      {
        name: "LEIGH",
      },
      {
        name: "TH EL",
      },
      {
        name: "THEL",
      },
      {
        name: "THE LEIGH",
      },
    ],
  },
  {
    name: "Leith Scotland",
    variations: [
      {
        name: "LEIT",
      },
    ],
  },
  {
    name: "Lemon Springs",
    variations: [
      {
        name: "LEMO",
      },
    ],
  },
  {
    name: "Leongatha",
    variations: [
      {
        name: "LEON",
      },
      {
        name: "LE ON",
      },
      {
        name: "LGATHA",
      },
      {
        name: "L GATHA",
      },
    ],
  },
  {
    name: "Lethbridge",
    variations: [
      {
        name: "LETH",
      },
      {
        name: "LETHB",
      },
      {
        name: "LE TH",
      },
    ],
  },
  {
    name: "Leura",
    variations: [
      {
        name: "LEUR",
      },
    ],
  },
  {
    name: "Lexton",
    variations: [
      {
        name: "LEXT",
      },
      {
        name: "LEXTO",
      },
      {
        name: "LE XT",
      },
      {
        name: "SEXT",
      },
    ],
  },
  {
    name: "Long Gully (2)",
    variations: [
      {
        name: "LGULLY",
      },
      {
        name: "LONG GLY",
      },
    ],
  },
  {
    name: "Lillicur",
    variations: [
      {
        name: "LILI",
      },
      {
        name: "LILL",
      },
    ],
  },
  {
    name: "Lilydale",
    variations: [
      {
        name: "LILY",
      },
      {
        name: "LDALE",
      },
      {
        name: "LILL",
      },
      {
        name: "LI LY",
      },
    ],
  },
  {
    name: "Lindenow Flat",
    variations: [
      {
        name: "LIND",
      },
    ],
  },
  {
    name: "Linlithgowshire Scotland",
    variations: [
      {
        name: "LINL",
      },
    ],
  },
  {
    name: "Linton's",
    variations: [
      {
        name: "LINT",
      },
      {
        name: "LINTON",
      },
    ],
  },
  {
    name: "Lismore",
    variations: [
      {
        name: "LISM",
      },
      {
        name: "LI SM",
      },
    ],
  },
  {
    name: "Little River (4)",
    variations: [
      {
        name: "LITT",
      },
      {
        name: "LITTLE R",
      },
    ],
  },
  {
    name: "Little Bendigo",
    variations: [
      {
        name: "LITTLE BEN",
      },
      {
        name: "LT BENGO",
      },
      {
        name: "L BGO",
      },
      {
        name: "LITTLE BGO",
      },
    ],
  },
  {
    name: "Little Eltham",
    variations: [
      {
        name: "LITTLE ELT",
      },
      {
        name: "LT ELTHAM",
      },
    ],
  },
  {
    name: "Little Forest",
    variations: [
      {
        name: "LITTLE FOR",
      },
    ],
  },
  {
    name: "Little Hard Hills",
    variations: [
      {
        name: "LITTLE HD H",
      },
    ],
  },
  {
    name: "Liverpool England",
    variations: [
      {
        name: "LIV",
      },
      {
        name: "LIVE",
      },
    ],
  },
  {
    name: "Lake Wellington",
    variations: [
      {
        name: "LK WELLING",
      },
    ],
  },
  {
    name: "Llanelly",
    variations: [
      {
        name: "LLAN",
      },
    ],
  },
  {
    name: "Lockington",
    variations: [
      {
        name: "LOCK",
      },
    ],
  },
  {
    name: "Loddon",
    variations: [
      {
        name: "LODD",
      },
      {
        name: "LO DD",
      },
    ],
  },
  {
    name: "Longwood",
    variations: [
      {
        name: "LONG",
      },
      {
        name: "LO NG",
      },
      {
        name: "LWOOD",
      },
    ],
  },
  {
    name: "Longerenong",
    variations: [
      {
        name: "LONGERENON",
      },
    ],
  },
  {
    name: "Longford",
    variations: [
      {
        name: "LONGFOR",
      },
    ],
  },
  {
    name: "Lorne",
    variations: [
      {
        name: "LORN",
      },
      {
        name: "LO RN",
      },
    ],
  },
  {
    name: "Loutitt Bay",
    variations: [
      {
        name: "LOUT",
      },
    ],
  },
  {
    name: "Lowan County",
    variations: [
      {
        name: "LOWA",
      },
    ],
  },
  {
    name: "Lower Cape",
    variations: [
      {
        name: "LOWE",
      },
    ],
  },
  {
    name: "Lowry",
    variations: [
      {
        name: "LOWR",
      },
    ],
  },
  {
    name: "Loyola",
    variations: [
      {
        name: "LOYO",
      },
      {
        name: "LO YO",
      },
    ],
  },
  {
    name: "Little Brighton",
    variations: [
      {
        name: "LT BRIGHTN",
      },
      {
        name: "LT BRTON",
      },
    ],
  },
  {
    name: "Little Scotland",
    variations: [
      {
        name: "LT SCOT",
      },
      {
        name: "LT SCOTL",
      },
    ],
  },
  {
    name: "Lucknow",
    variations: [
      {
        name: "LUCK",
      },
      {
        name: "LUCK NOW",
      },
      {
        name: "LUCK -NOW",
      },
    ],
  },
  {
    name: "Lucky Woman's",
    variations: [
      {
        name: "LUCKY WM",
      },
      {
        name: "LUCKY WMN",
      },
      {
        name: "LUCKY WOMA",
      },
      {
        name: "LUCKY WOMN",
      },
    ],
  },
  {
    name: "Lockwood",
    variations: [
      {
        name: "LWOOD",
      },
      {
        name: "LKWOOD",
      },
      {
        name: "LOCK",
      },
      {
        name: "LO CK",
      },
    ],
  },
  {
    name: "Lyndhurst",
    variations: [
      {
        name: "LYND",
      },
    ],
  },
  {
    name: "Lysterfield",
    variations: [
      {
        name: "LYST",
      },
    ],
  },
  {
    name: "Mount Doran",
    variations: [
      {
        name: "M DORAN",
      },
      {
        name: "MOUNT DORA",
      },
      {
        name: "MT DO",
      },
      {
        name: "MT D",
      },
      {
        name: "MTDO",
      },
    ],
  },
  {
    name: "Moonee Ponds",
    variations: [
      {
        name: "M PONDS",
      },
      {
        name: "MOONEE PDS",
      },
      {
        name: "MOON",
      },
      {
        name: "MO ON",
      },
      {
        name: "M POND",
      },
      {
        name: "MPONDS",
      },
    ],
  },
  {
    name: "Mount Raglan",
    variations: [
      {
        name: "M RAGLAN",
      },
    ],
  },
  {
    name: "Mount Rouse",
    variations: [
      {
        name: "M ROUSE",
      },
      {
        name: "MOUNT ROUS",
      },
      {
        name: "MT RO",
      },
      {
        name: "MTRO",
      },
      {
        name: "MT ROSE",
      },
      {
        name: "MT ROUS",
      },
    ],
  },
  {
    name: "Macarthur",
    variations: [
      {
        name: "MA CA",
      },
      {
        name: "MACA",
      },
      {
        name: "MCAR",
      },
    ],
  },
  {
    name: "Maidstone",
    variations: [
      {
        name: "MA ID",
      },
      {
        name: "MAID",
      },
      {
        name: "MSTONE",
      },
    ],
  },
  {
    name: "Macedon",
    variations: [
      {
        name: "MACE",
      },
      {
        name: "MA CE",
      },
    ],
  },
  {
    name: "Macklin Creek",
    variations: [
      {
        name: "MACK",
      },
    ],
  },
  {
    name: "Maddingley",
    variations: [
      {
        name: "MADD",
      },
    ],
  },
  {
    name: "Maffra",
    variations: [
      {
        name: "MAFF",
      },
      {
        name: "MA FF",
      },
    ],
  },
  {
    name: "Magpie Gully",
    variations: [
      {
        name: "MAGP",
      },
    ],
  },
  {
    name: "Mailors Flat",
    variations: [
      {
        name: "MAIL",
      },
      {
        name: "MA IL",
      },
    ],
  },
  {
    name: "Maindample",
    variations: [
      {
        name: "MAIN",
      },
      {
        name: "MA IN",
      },
    ],
  },
  {
    name: "Majorca",
    variations: [
      {
        name: "MAJO",
      },
      {
        name: "MA JO",
      },
    ],
  },
  {
    name: "Malakoff",
    variations: [
      {
        name: "MALA",
      },
    ],
  },
  {
    name: "Malmsbury",
    variations: [
      {
        name: "MAL'BURY",
      },
      {
        name: "MALM",
      },
      {
        name: "MALMS",
      },
      {
        name: "MBURY",
      },
      {
        name: "MSBURY",
      },
      {
        name: "HBURY",
      },
      {
        name: "MAL BURY",
      },
      {
        name: "MA LM",
      },
      {
        name: "MBURTY",
      },
    ],
  },
  {
    name: "Maldon",
    variations: [
      {
        name: "MALD",
      },
      {
        name: "MDON",
      },
      {
        name: "MA LD",
      },
      {
        name: "WALDON",
      },
    ],
  },
  {
    name: "Mordialloc",
    variations: [
      {
        name: "MALLOC",
      },
      {
        name: "MORD",
      },
      {
        name: "MORDLLOC",
      },
      {
        name: "MORDOC",
      },
      {
        name: "MALLAC",
      },
      {
        name: "MO RD",
      },
    ],
  },
  {
    name: "Malvern",
    variations: [
      {
        name: "MALV",
      },
      {
        name: "MVERN",
      },
      {
        name: "MELV",
      },
      {
        name: "M VERN",
      },
    ],
  },
  {
    name: "Mandurang",
    variations: [
      {
        name: "MAND",
      },
    ],
  },
  {
    name: "Mangalore",
    variations: [
      {
        name: "MANG",
      },
    ],
  },
  {
    name: "Manilla Phillipines",
    variations: [
      {
        name: "MANI",
      },
    ],
  },
  {
    name: "Mansfield",
    variations: [
      {
        name: "MANS",
      },
      {
        name: "MFIELD",
      },
      {
        name: "MA NS",
      },
    ],
  },
  {
    name: "Maribyrnong River",
    variations: [
      {
        name: "MARI",
      },
    ],
  },
  {
    name: "Marong",
    variations: [
      {
        name: "MARO",
      },
      {
        name: "MA RO",
      },
      {
        name: "NARO",
      },
    ],
  },
  {
    name: "Marshalltown",
    variations: [
      {
        name: "MARS",
      },
      {
        name: "MARSHLTWN",
      },
    ],
  },
  {
    name: "Maryborough",
    variations: [
      {
        name: "MARY",
      },
      {
        name: "MARYBGH",
      },
      {
        name: "MARYBORGH",
      },
      {
        name: "MARYBORH",
      },
      {
        name: "MBORO",
      },
      {
        name: "MBRO",
      },
      {
        name: "MA RY",
      },
      {
        name: "MARYBORO",
      },
      {
        name: "MBOO",
      },
      {
        name: "M BORO",
      },
      {
        name: "MBOROUGH",
      },
      {
        name: "MBROUGH",
      },
      {
        name: "MFORD HOSP",
      },
    ],
  },
  {
    name: "Matlock",
    variations: [
      {
        name: "MATL",
      },
      {
        name: "MA TL",
      },
    ],
  },
  {
    name: "Maude",
    variations: [
      {
        name: "MAUD",
      },
    ],
  },
  {
    name: "Murrumbeena",
    variations: [
      {
        name: "MBEENA",
      },
      {
        name: "MURR",
      },
      {
        name: "MBEEN",
      },
      {
        name: "MUR",
      },
    ],
  },
  {
    name: "Moorabool",
    variations: [
      {
        name: "MBOOL",
      },
      {
        name: "MOOR",
      },
      {
        name: "MO OR",
      },
    ],
  },
  {
    name: "McCullums Creek",
    variations: [
      {
        name: "MCCU",
      },
    ],
  },
  {
    name: "McIntyre Diggings",
    variations: [
      {
        name: "McIN",
      },
      {
        name: "MCIN",
      },
      {
        name: "MCINTYRE D",
      },
      {
        name: "MCINTYRES",
      },
    ],
  },
  {
    name: "McIvor Diggings",
    variations: [
      {
        name: "MCIV",
      },
    ],
  },
  {
    name: "Murdaduke",
    variations: [
      {
        name: "MDUKE",
      },
    ],
  },
  {
    name: "Mildura",
    variations: [
      {
        name: "MDURA",
      },
      {
        name: "MILD",
      },
    ],
  },
  {
    name: "Melbourne",
    variations: [
      {
        name: "MEL",
      },
      {
        name: "MELB",
      },
      {
        name: "HELB",
      },
      {
        name: "MBNE",
      },
      {
        name: "ME LB",
      },
      {
        name: "MERLB",
      },
    ],
  },
  {
    name: "East Melbourne",
    variations: [
      {
        name: "MELB E",
      },
      {
        name: "EAST",
      },
      {
        name: "EMEI",
      },
      {
        name: "EMEL",
      },
    ],
  },
  {
    name: "West Melbourne",
    variations: [
      {
        name: "MELB W",
      },
      {
        name: "WEST M",
      },
      {
        name: "WEST MELB",
      },
      {
        name: "WMEL",
      },
      {
        name: "W MELB",
      },
      {
        name: "WST MELB",
      },
    ],
  },
  {
    name: "Melton",
    variations: [
      {
        name: "MELT",
      },
      {
        name: "ME LT",
      },
      {
        name: "NELS",
      },
    ],
  },
  {
    name: "Mepunga",
    variations: [
      {
        name: "MEPU",
      },
      {
        name: "MEPI",
      },
    ],
  },
  {
    name: "Mercer's Vale",
    variations: [
      {
        name: "MERC",
      },
    ],
  },
  {
    name: "Meredith",
    variations: [
      {
        name: "MERE",
      },
      {
        name: "ME RE",
      },
    ],
  },
  {
    name: "Merino",
    variations: [
      {
        name: "MERI",
      },
      {
        name: "ME RI",
      },
    ],
  },
  {
    name: "Merri Creek",
    variations: [
      {
        name: "MERR",
      },
      {
        name: "MERRI",
      },
      {
        name: "MERRI CRK",
      },
      {
        name: "MERRI CK",
      },
    ],
  },
  {
    name: "Merriman's Creek",
    variations: [
      {
        name: "MERRIMAN",
      },
    ],
  },
  {
    name: "Merton",
    variations: [
      {
        name: "MERT",
      },
      {
        name: "ME RT",
      },
    ],
  },
  {
    name: "Metcalfe",
    variations: [
      {
        name: "METC",
      },
      {
        name: "ME TC",
      },
    ],
  },
  {
    name: "Muckleford",
    variations: [
      {
        name: "MFORD",
      },
      {
        name: "MKFORD",
      },
      {
        name: "MUCK",
      },
      {
        name: "MUCKLEFRD",
      },
      {
        name: "MU CK",
      },
    ],
  },
  {
    name: "Monegatta (Monegeetta)",
    variations: [
      {
        name: "MGETTA",
      },
      {
        name: "MONE",
      },
      {
        name: "MONEGEETT",
      },
    ],
  },
  {
    name: "Mulgrave",
    variations: [
      {
        name: "MGRAVE",
      },
      {
        name: "MULG",
      },
      {
        name: "MU LG",
      },
    ],
  },
  {
    name: "Minyip",
    variations: [
      {
        name: "MI NY",
      },
      {
        name: "MINY",
      },
    ],
  },
  {
    name: "Mia Mia",
    variations: [
      {
        name: "MIAM",
      },
      {
        name: "MI AM",
      },
    ],
  },
  {
    name: "Mickleham",
    variations: [
      {
        name: "MICKHAM",
      },
      {
        name: "MICKLAM",
      },
      {
        name: "MICK",
      },
    ],
  },
  {
    name: "Middlesex England",
    variations: [
      {
        name: "MIDD",
      },
    ],
  },
  {
    name: "Milkman's Flat",
    variations: [
      {
        name: "MILK",
      },
    ],
  },
  {
    name: "Millbrook",
    variations: [
      {
        name: "MILL",
      },
      {
        name: "MI LL",
      },
      {
        name: "MILLBROKE",
      },
    ],
  },
  {
    name: "Miners Rest",
    variations: [
      {
        name: "MINE",
      },
      {
        name: "MINERS R",
      },
      {
        name: "MI NE",
      },
    ],
  },
  {
    name: "Mirboo",
    variations: [
      {
        name: "MIRB",
      },
      {
        name: "MI RB",
      },
    ],
  },
  {
    name: "Mirboo North",
    variations: [
      {
        name: "MIRB N",
      },
      {
        name: "MBOO N",
      },
      {
        name: "MBOO NTH",
      },
      {
        name: "MIRB",
      },
      {
        name: "MI RB",
      },
      {
        name: "MIRBOO N",
      },
    ],
  },
  {
    name: "Mirradong",
    variations: [
      {
        name: "MIRR",
      },
    ],
  },
  {
    name: "Mitcham",
    variations: [
      {
        name: "MITC",
      },
      {
        name: "MHAM",
      },
      {
        name: "MI TC",
      },
    ],
  },
  {
    name: "Mitiamo",
    variations: [
      {
        name: "MITI",
      },
      {
        name: "MI TI",
      },
    ],
  },
  {
    name: "Mitta Mitta",
    variations: [
      {
        name: "MITT",
      },
      {
        name: "MI TT",
      },
    ],
  },
  {
    name: "Mortlake",
    variations: [
      {
        name: "MLAKE",
      },
      {
        name: "MORT",
      },
      {
        name: "M LAKE",
      },
      {
        name: "MO RT",
      },
      {
        name: "N LAKE",
      },
    ],
  },
  {
    name: "Modewarre",
    variations: [
      {
        name: "MODE",
      },
      {
        name: "MO DE",
      },
    ],
  },
  {
    name: "Moliagul",
    variations: [
      {
        name: "MOLI",
      },
      {
        name: "MO LI",
      },
    ],
  },
  {
    name: "Monmouthshire England",
    variations: [
      {
        name: "MON MOUTHSH",
      },
      {
        name: "MONM",
      },
    ],
  },
  {
    name: "County Monaghan Ireland",
    variations: [
      {
        name: "MONAGHAN",
      },
    ],
  },
  {
    name: "Monkey Gully",
    variations: [
      {
        name: "MONK",
      },
    ],
  },
  {
    name: "Mont Park",
    variations: [
      {
        name: "MONT PK",
      },
      {
        name: "MONT P",
      },
      {
        name: "MT PARK",
      },
      {
        name: "MT PK",
      },
    ],
  },
  {
    name: "Moolap",
    variations: [
      {
        name: "MOOL",
      },
      {
        name: "MO OL",
      },
    ],
  },
  {
    name: "Moonlight Flat",
    variations: [
      {
        name: "MOON",
      },
      {
        name: "MOON FL",
      },
      {
        name: "MLIGHT F",
      },
      {
        name: "MLIGHT FL",
      },
      {
        name: "M LIGHT FL",
      },
      {
        name: "MLIGHT FT",
      },
    ],
  },
  {
    name: "Moonambel",
    variations: [
      {
        name: "MOONA",
      },
      {
        name: "MOONBEL",
      },
      {
        name: "MAMBEL",
      },
      {
        name: "MBEL",
      },
      {
        name: "MOON",
      },
      {
        name: "MO ON",
      },
    ],
  },
  {
    name: "Mooroopna",
    variations: [
      {
        name: "MOOR",
      },
      {
        name: "MPNA",
      },
      {
        name: "MO OR",
      },
      {
        name: "M PNA",
      },
    ],
  },
  {
    name: "Morang",
    variations: [
      {
        name: "MORA",
      },
      {
        name: "MO RA",
      },
      {
        name: "MORANG",
      },
    ],
  },
  {
    name: "Moranding",
    variations: [
      {
        name: "MORDING",
      },
    ],
  },
  {
    name: "Mornington",
    variations: [
      {
        name: "MORNTON",
      },
      {
        name: "M'TON",
      },
      {
        name: "MORN",
      },
      {
        name: "MO RN",
      },
      {
        name: "MTON",
      },
    ],
  },
  {
    name: "Morrison's",
    variations: [
      {
        name: "MORR",
      },
    ],
  },
  {
    name: "Morse's Creek",
    variations: [
      {
        name: "MORS",
      },
    ],
  },
  {
    name: "Mosquito",
    variations: [
      {
        name: "MOSQ",
      },
    ],
  },
  {
    name: "Mountain Hut",
    variations: [
      {
        name: "MOUN",
      },
      {
        name: "MOUNTAIN H",
      },
    ],
  },
  {
    name: "Mount William",
    variations: [
      {
        name: "MOUNT WILL",
      },
      {
        name: "MT WILLM",
      },
      {
        name: "MT WM",
      },
    ],
  },
  {
    name: "Mountain Creek (2)",
    variations: [
      {
        name: "MOUNTAIN C",
      },
      {
        name: "MTAIN CK",
      },
    ],
  },
  {
    name: "Moutajup",
    variations: [
      {
        name: "MOUT",
      },
    ],
  },
  {
    name: "Moyhu",
    variations: [
      {
        name: "MOYH",
      },
      {
        name: "MO YH",
      },
    ],
  },
  {
    name: "Moyston",
    variations: [
      {
        name: "MOYS",
      },
    ],
  },
  {
    name: "Mount Alexander (2)",
    variations: [
      {
        name: "MT AL",
      },
      {
        name: "MT ALEXR",
      },
      {
        name: "MTAL",
      },
    ],
  },
  {
    name: "Mount Ararat (2)",
    variations: [
      {
        name: "MT AR",
      },
      {
        name: "MTAR",
      },
    ],
  },
  {
    name: "Mount Atkinson",
    variations: [
      {
        name: "MT ATKINSO",
      },
    ],
  },
  {
    name: "Mount Blackwood",
    variations: [
      {
        name: "MT B",
      },
      {
        name: "MT BLACKD",
      },
      {
        name: "MT BLACKW",
      },
      {
        name: "MT BLWOOD",
      },
      {
        name: "MTBLACKWD",
      },
      {
        name: "MTBLKWOOD",
      },
      {
        name: "MTBL",
      },
      {
        name: "MT BL",
      },
      {
        name: "MT BLACKWD",
      },
      {
        name: "MT BLACKWO",
      },
      {
        name: "MT BLCKWD",
      },
      {
        name: "MT BLKWOO",
      },
      {
        name: "MT BLKWOOD",
      },
      {
        name: "MT BWOOD",
      },
      {
        name: "MT B WOOD",
      },
    ],
  },
  {
    name: "Mount Battery",
    variations: [
      {
        name: "MT BA",
      },
    ],
  },
  {
    name: "Mount Ballarat",
    variations: [
      {
        name: "MT BALLT",
      },
      {
        name: "MT BALLRT",
      },
      {
        name: "MT BRAT",
      },
    ],
  },
  {
    name: "Mount Beauford",
    variations: [
      {
        name: "MT BEAUFOR",
      },
    ],
  },
  {
    name: "Black Mount",
    variations: [
      {
        name: "MT BL",
      },
    ],
  },
  {
    name: "Mount Blowhard",
    variations: [
      {
        name: "MT BLOWHD",
      },
      {
        name: "MTBL",
      },
    ],
  },
  {
    name: "Mount Bolton",
    variations: [
      {
        name: "MT BO",
      },
      {
        name: "MTBO",
      },
    ],
  },
  {
    name: "Mount Buninyong",
    variations: [
      {
        name: "MT BU",
      },
      {
        name: "MT BNONG",
      },
      {
        name: "MTBU",
      },
      {
        name: "MT BYONG",
      },
    ],
  },
  {
    name: "Mount Clare",
    variations: [
      {
        name: "MT CL",
      },
    ],
  },
  {
    name: "Mount Cotterell",
    variations: [
      {
        name: "MT CO",
      },
      {
        name: "MT COTT",
      },
      {
        name: "MT COTTEL",
      },
      {
        name: "MT COTTER",
      },
      {
        name: "MT COTTERE",
      },
    ],
  },
  {
    name: "Mount Eckersley",
    variations: [
      {
        name: "MT ECKSLY",
      },
    ],
  },
  {
    name: "Mount Egerton",
    variations: [
      {
        name: "MT EDGERTO",
      },
      {
        name: "MT EG",
      },
      {
        name: "MT EGERT",
      },
      {
        name: "MT EGTON",
      },
      {
        name: "MTEG",
      },
      {
        name: "MT EGERTN",
      },
      {
        name: "MT EGERTO",
      },
      {
        name: "MT ETON",
      },
    ],
  },
  {
    name: "Mount Elephant",
    variations: [
      {
        name: "MT EL",
      },
      {
        name: "MT ELPHT",
      },
      {
        name: "MTEL",
      },
      {
        name: "MT ELEPHAN",
      },
      {
        name: "MT ELEPHNT",
      },
      {
        name: "MT ELEPHT",
      },
    ],
  },
  {
    name: "Mount Emu Creek",
    variations: [
      {
        name: "MT EM",
      },
      {
        name: "MT EMU",
      },
      {
        name: "MT EMU CRK",
      },
    ],
  },
  {
    name: "Mount Evelyn",
    variations: [
      {
        name: "MT EV",
      },
      {
        name: "EVEL",
      },
      {
        name: "MOUN",
      },
    ],
  },
  {
    name: "Mount Franklin Shire",
    variations: [
      {
        name: "MT FR",
      },
    ],
  },
  {
    name: "Mount Fyans",
    variations: [
      {
        name: "MT FY",
      },
    ],
  },
  {
    name: "Mount Gambier",
    variations: [
      {
        name: "MT GA",
      },
    ],
  },
  {
    name: "Mount Gisborne",
    variations: [
      {
        name: "MT GI",
      },
    ],
  },
  {
    name: "Mount Greenock",
    variations: [
      {
        name: "MT GR",
      },
      {
        name: "MT GREENK",
      },
      {
        name: "MT GREENOC",
      },
      {
        name: "MTGR",
      },
    ],
  },
  {
    name: "Mount Look-Out",
    variations: [
      {
        name: "MT LO",
      },
    ],
  },
  {
    name: "Mt Macedon",
    variations: [
      {
        name: "MT MA",
      },
    ],
  },
  {
    name: "Mount Mercer",
    variations: [
      {
        name: "MT ME",
      },
      {
        name: "MTME",
      },
    ],
  },
  {
    name: "Mount Misery",
    variations: [
      {
        name: "MT MI",
      },
    ],
  },
  {
    name: "Mt Moliagul",
    variations: [
      {
        name: "MT MO",
      },
    ],
  },
  {
    name: "Mount Moriac",
    variations: [
      {
        name: "MT MORIA",
      },
      {
        name: "MTMO",
      },
      {
        name: "MT MO",
      },
      {
        name: "MT MORIAO",
      },
      {
        name: "MT MORISC",
      },
    ],
  },
  {
    name: "Mount Napier",
    variations: [
      {
        name: "MT NA",
      },
    ],
  },
  {
    name: "Mount Pleasant (6)",
    variations: [
      {
        name: "MT PL",
      },
      {
        name: "MT PLEASAN",
      },
      {
        name: "MT PLEAST",
      },
    ],
  },
  {
    name: "Mount Prospect (3)",
    variations: [
      {
        name: "MT PR",
      },
      {
        name: "MT PROS",
      },
      {
        name: "MT PROSP",
      },
      {
        name: "MT PROSPEC",
      },
      {
        name: "MTPR",
      },
    ],
  },
  {
    name: "Mount Shadwell",
    variations: [
      {
        name: "MT SH",
      },
      {
        name: "SHAD",
      },
      {
        name: "MTSH",
      },
    ],
  },
  {
    name: "Mount Sturgeon",
    variations: [
      {
        name: "MT ST",
      },
      {
        name: "MT STURGEO",
      },
      {
        name: "MT STURGN",
      },
    ],
  },
  {
    name: "Mount Washington",
    variations: [
      {
        name: "MT WA",
      },
    ],
  },
  {
    name: "Mount Duneed",
    variations: [
      {
        name: "MTDU",
      },
      {
        name: "DUNE",
      },
      {
        name: "DU NE",
      },
      {
        name: "DUNEED",
      },
      {
        name: "MTBU",
      },
      {
        name: "MTDR",
      },
      {
        name: "MT DU",
      },
      {
        name: "MT DUNE",
      },
      {
        name: "MT DUNELD",
      },
      {
        name: "MT DUNLED",
      },
    ],
  },
  {
    name: "Mount Macedon",
    variations: [
      {
        name: "MTMA",
      },
      {
        name: "MT MA",
      },
    ],
  },
  {
    name: "Murtoa",
    variations: [
      {
        name: "MTOA",
      },
      {
        name: "MURT",
      },
      {
        name: "MU RT",
      },
      {
        name: "MU ST",
      },
    ],
  },
  {
    name: "Mount Warrenheip",
    variations: [
      {
        name: "MTWA",
      },
    ],
  },
  {
    name: "Muddy Creek (3)",
    variations: [
      {
        name: "MUDD",
      },
      {
        name: "MUDD CRK",
      },
    ],
  },
  {
    name: "Mudgegonga",
    variations: [
      {
        name: "MUDG",
      },
    ],
  },
  {
    name: "Mundoona",
    variations: [
      {
        name: "MUND",
      },
      {
        name: "MU ND",
      },
    ],
  },
  {
    name: "Munster Ireland",
    variations: [
      {
        name: "MUNSTER",
      },
    ],
  },
  {
    name: "Muntham",
    variations: [
      {
        name: "MUNT",
      },
    ],
  },
  {
    name: "Murchison",
    variations: [
      {
        name: "MURC",
      },
      {
        name: "MURCHSN",
      },
      {
        name: "MU RC",
      },
    ],
  },
  {
    name: "Lake Murdeduke",
    variations: [
      {
        name: "MURD",
      },
    ],
  },
  {
    name: "Murgheboluc",
    variations: [
      {
        name: "MURG",
      },
      {
        name: "MURGHBOLUC",
      },
      {
        name: "MURGHEBOLA",
      },
      {
        name: "MAYHEBOLUK",
      },
      {
        name: "MBOLUC",
      },
      {
        name: "MING",
      },
      {
        name: "MU RG",
      },
      {
        name: "MURGEBULOE",
      },
      {
        name: "MURGHOBULU",
      },
    ],
  },
  {
    name: "Murmungee",
    variations: [
      {
        name: "MURM",
      },
    ],
  },
  {
    name: "Murndal",
    variations: [
      {
        name: "MURN",
      },
    ],
  },
  {
    name: "Murray District",
    variations: [
      {
        name: "MURRAY DIS",
      },
      {
        name: "MURR",
      },
    ],
  },
  {
    name: "Musk Vale",
    variations: [
      {
        name: "MUSK",
      },
      {
        name: "MU SK",
      },
      {
        name: "MUSK V",
      },
    ],
  },
  {
    name: "Marysville",
    variations: [
      {
        name: "MVILLE",
      },
      {
        name: "MARY",
      },
    ],
  },
  {
    name: "Morwell",
    variations: [
      {
        name: "MWEL",
      },
      {
        name: "MORW",
      },
      {
        name: "MO RW",
      },
      {
        name: "MORWE",
      },
    ],
  },
  {
    name: "Myer's Flat",
    variations: [
      {
        name: "MYER",
      },
    ],
  },
  {
    name: "Myrtleford",
    variations: [
      {
        name: "MYFORD",
      },
      {
        name: "MYRT",
      },
      {
        name: "MYRTLEF",
      },
      {
        name: "MFORD",
      },
      {
        name: "MY RT",
      },
      {
        name: "MYRTLED",
      },
    ],
  },
  {
    name: "Myrniong",
    variations: [
      {
        name: "MYRN",
      },
      {
        name: "MY RN",
      },
    ],
  },
  {
    name: "Mysia",
    variations: [
      {
        name: "MYSI",
      },
      {
        name: "MY SI",
      },
      {
        name: "NYSIA",
      },
    ],
  },
  {
    name: "Newbridge",
    variations: [
      {
        name: "N BRIDGE",
      },
      {
        name: "N BRIDG",
      },
      {
        name: "NBRIDGE",
      },
      {
        name: "NEWB",
      },
      {
        name: "NE WB",
      },
    ],
  },
  {
    name: "North Essendon",
    variations: [
      {
        name: "N EDON",
      },
      {
        name: "NESS",
      },
      {
        name: "NTH EDON",
      },
      {
        name: "NTH ESS",
      },
      {
        name: "NTH ESSDON",
      },
      {
        name: "NTH ESSN",
      },
    ],
  },
  {
    name: "Northcote",
    variations: [
      {
        name: "N,COTE",
      },
      {
        name: "NOR",
      },
      {
        name: "NORT",
      },
      {
        name: "N COTE",
      },
      {
        name: "N CTE",
      },
      {
        name: "NO RT",
      },
      {
        name: "NORTHC",
      },
      {
        name: "NOTE",
      },
    ],
  },
  {
    name: "Napoleon's",
    variations: [
      {
        name: "NA PO",
      },
      {
        name: "NAPO",
      },
    ],
  },
  {
    name: "Nagambie",
    variations: [
      {
        name: "NAGA",
      },
      {
        name: "NA GA",
      },
      {
        name: "NAMBIE",
      },
      {
        name: "NBIE",
      },
      {
        name: "NGBIE",
      },
      {
        name: "N GBIE",
      },
      {
        name: "N G BIE",
      },
    ],
  },
  {
    name: "Nar Nar Goon",
    variations: [
      {
        name: "NAR NAR GO",
      },
      {
        name: "NAR",
      },
      {
        name: "NARN",
      },
      {
        name: "NA RN",
      },
      {
        name: "NAR NAR",
      },
    ],
  },
  {
    name: "Narraport",
    variations: [
      {
        name: "NARR",
      },
      {
        name: "NA RR",
      },
      {
        name: "NBOORT",
      },
      {
        name: "NPORT",
      },
    ],
  },
  {
    name: "Narree Warren",
    variations: [
      {
        name: "NARRE",
      },
      {
        name: "NARRE W",
      },
      {
        name: "NARRE WN",
      },
    ],
  },
  {
    name: "Nathalia",
    variations: [
      {
        name: "NATH",
      },
    ],
  },
  {
    name: "Natimuk Lake",
    variations: [
      {
        name: "NATI",
      },
    ],
  },
  {
    name: "Natte Yallock",
    variations: [
      {
        name: "NATT",
      },
      {
        name: "NATTE Y",
      },
      {
        name: "NATTE YAL",
      },
      {
        name: "NATTE YALLO",
      },
      {
        name: "NA TT",
      },
      {
        name: "N YALL",
      },
    ],
  },
  {
    name: "Navarre",
    variations: [
      {
        name: "NAVA",
      },
      {
        name: "NA VA",
      },
    ],
  },
  {
    name: "Neerim",
    variations: [
      {
        name: "NEER",
      },
      {
        name: "NE ER",
      },
    ],
  },
  {
    name: "Neilborough",
    variations: [
      {
        name: "NEILBORO",
      },
      {
        name: "NEIL",
      },
    ],
  },
  {
    name: "Point Napean",
    variations: [
      {
        name: "NEPE",
      },
      {
        name: "PT NAPEAN",
      },
    ],
  },
  {
    name: "Nerring",
    variations: [
      {
        name: "NERR",
      },
      {
        name: "KE RR",
      },
      {
        name: "MERN",
      },
      {
        name: "ME RR",
      },
      {
        name: "NE RR",
      },
      {
        name: "NE WR",
      },
      {
        name: "WE RR",
      },
    ],
  },
  {
    name: "Newtown",
    variations: [
      {
        name: "NEW",
      },
      {
        name: "NEWT",
      },
      {
        name: "NTOWN",
      },
      {
        name: "NE WT",
      },
      {
        name: "NEWTOWN",
      },
      {
        name: "N TOWN",
      },
    ],
  },
  {
    name: "New Gisborne",
    variations: [
      {
        name: "NEW GBORN",
      },
      {
        name: "NEW GISBN",
      },
      {
        name: "NEW GISBOR",
      },
      {
        name: "NEWG",
      },
    ],
  },
  {
    name: "New South Wales",
    variations: [
      {
        name: "NEW SOUTH",
      },
      {
        name: "N S W",
      },
    ],
  },
  {
    name: "New Year Flat",
    variations: [
      {
        name: "NEW YERS",
      },
      {
        name: "NEW YR FLT",
      },
    ],
  },
  {
    name: "Newbury",
    variations: [
      {
        name: "NEWB",
      },
    ],
  },
  {
    name: "Newcastle England",
    variations: [
      {
        name: "NEWC",
      },
    ],
  },
  {
    name: "Newfoundland Canada",
    variations: [
      {
        name: "NEWF",
      },
    ],
  },
  {
    name: "Newham",
    variations: [
      {
        name: "NEWH",
      },
      {
        name: "NE WH",
      },
    ],
  },
  {
    name: "Newington",
    variations: [
      {
        name: "NEWI",
      },
    ],
  },
  {
    name: "Newlands",
    variations: [
      {
        name: "NEWL",
      },
      {
        name: "NEWLAN",
      },
      {
        name: "NLANDS",
      },
    ],
  },
  {
    name: "Newmarket",
    variations: [
      {
        name: "NEWM",
      },
    ],
  },
  {
    name: "Newport Wales",
    variations: [
      {
        name: "NEWP",
      },
    ],
  },
  {
    name: "Newry",
    variations: [
      {
        name: "NEWR",
      },
    ],
  },
  {
    name: "Newstead",
    variations: [
      {
        name: "NEWS",
      },
      {
        name: "NSTEAD",
      },
      {
        name: "NE WS",
      },
      {
        name: "N STEAD",
      },
    ],
  },
  {
    name: "New York",
    variations: [
      {
        name: "NEWY",
      },
    ],
  },
  {
    name: "New Zealand",
    variations: [
      {
        name: "NEWZ",
      },
    ],
  },
  {
    name: "Nhill",
    variations: [
      {
        name: "NHIL",
      },
      {
        name: "N HILL",
      },
      {
        name: "NH IL",
      },
    ],
  },
  {
    name: "Nillumbik",
    variations: [
      {
        name: "NILL",
      },
    ],
  },
  {
    name: "Nine Creeks",
    variations: [
      {
        name: "NINE",
      },
    ],
  },
  {
    name: "Nine-Mile Creek",
    variations: [
      {
        name: "NINE ML CK",
      },
      {
        name: "NINEMILECR",
      },
    ],
  },
  {
    name: "Ninyeunook",
    variations: [
      {
        name: "NINY",
      },
      {
        name: "NI NY",
      },
    ],
  },
  {
    name: "Nirranda",
    variations: [
      {
        name: "NIRR",
      },
      {
        name: "N ANDA",
      },
      {
        name: "NI RR",
      },
    ],
  },
  {
    name: "Numurkah",
    variations: [
      {
        name: "NKAH",
      },
      {
        name: "NUMU",
      },
      {
        name: "N KAH",
      },
      {
        name: "N KAK",
      },
      {
        name: "NU MU",
      },
    ],
  },
  {
    name: "Noorat",
    variations: [
      {
        name: "NOOR",
      },
      {
        name: "NO OR",
      },
    ],
  },
  {
    name: "Noradjuha",
    variations: [
      {
        name: "NORA",
      },
      {
        name: "NJUHA",
      },
      {
        name: "N JUHA",
      },
    ],
  },
  {
    name: "Normanby County",
    variations: [
      {
        name: "NORM",
      },
    ],
  },
  {
    name: "Norwood (2)",
    variations: [
      {
        name: "NORW",
      },
    ],
  },
  {
    name: "Nottinghamshire England",
    variations: [
      {
        name: "NOTT",
      },
      {
        name: "NOTTS",
      },
    ],
  },
  {
    name: "Nuggetty Creek/Flat/Gully",
    variations: [
      {
        name: "NUGG",
      },
    ],
  },
  {
    name: "Nunawading",
    variations: [
      {
        name: "NUN",
      },
      {
        name: "NUNA",
      },
      {
        name: "NWADING",
      },
      {
        name: "BWADING",
      },
      {
        name: "NU NA",
      },
      {
        name: "NUNN",
      },
      {
        name: "NWADDING",
      },
    ],
  },
  {
    name: "Nuntin Creek",
    variations: [
      {
        name: "NUNT",
      },
    ],
  },
  {
    name: "Oakleigh",
    variations: [
      {
        name: "OAK",
      },
      {
        name: "OAKL",
      },
      {
        name: "OLEIGH",
      },
      {
        name: "LEIG",
      },
      {
        name: "OA KL",
      },
      {
        name: "O LEIGH",
      },
    ],
  },
  {
    name: "Ocean Grove",
    variations: [
      {
        name: "OGRVE",
      },
      {
        name: "OCEA",
      },
    ],
  },
  {
    name: "Old Inglewood",
    variations: [
      {
        name: "OLD INGWD",
      },
      {
        name: "OLD INGWO",
      },
      {
        name: "OLD IWOOD",
      },
      {
        name: "OLDI",
      },
      {
        name: "OLD INGLEWOOD",
      },
    ],
  },
  {
    name: "Ondit",
    variations: [
      {
        name: "ONDI",
      },
      {
        name: "ON DI",
      },
    ],
  },
  {
    name: "One Mile Creek",
    variations: [
      {
        name: "ONE ML CRK",
      },
      {
        name: "ONEM",
      },
      {
        name: "1 MILE CRK",
      },
      {
        name: "1 ML CK",
      },
      {
        name: "ONE MILE",
      },
      {
        name: "ONE MILE C",
      },
      {
        name: "ONE ML CK",
      },
    ],
  },
  {
    name: "Opossum Gully (2)",
    variations: [
      {
        name: "OPOS",
      },
    ],
  },
  {
    name: "Orford",
    variations: [
      {
        name: "ORFO",
      },
    ],
  },
  {
    name: "Orkney Isles Scotland",
    variations: [
      {
        name: "ORK",
      },
      {
        name: "ORKN",
      },
    ],
  },
  {
    name: "Ormond",
    variations: [
      {
        name: "ORMO",
      },
    ],
  },
  {
    name: "Osborne",
    variations: [
      {
        name: "OSBO",
      },
    ],
  },
  {
    name: "Ouranna",
    variations: [
      {
        name: "OURA",
      },
    ],
  },
  {
    name: "Ovens River",
    variations: [
      {
        name: "OVEN",
      },
      {
        name: "OVENS",
      },
      {
        name: "OVENS R",
      },
      {
        name: "OVENS RI",
      },
      {
        name: "OVENS RIV",
      },
      {
        name: "OVENS RIVE",
      },
      {
        name: "OVENS RIVR",
      },
      {
        name: "OVENS RVR",
      },
    ],
  },
  {
    name: "Oxley",
    variations: [
      {
        name: "OXLE",
      },
      {
        name: "AXLE",
      },
      {
        name: "OX LE",
      },
    ],
  },
  {
    name: "Pyramid Hill",
    variations: [
      {
        name: "P HILL",
      },
      {
        name: "PY HILL",
      },
      {
        name: "PYRA",
      },
      {
        name: "PY H",
      },
      {
        name: "PYHILL",
      },
      {
        name: "PY RA",
      },
    ],
  },
  {
    name: "Port Melbourne",
    variations: [
      {
        name: "P MELB",
      },
      {
        name: "MELB PT",
      },
      {
        name: "PORT",
      },
      {
        name: "PO RT",
      },
      {
        name: "PORT MELB",
      },
      {
        name: "PTMELB",
      },
    ],
  },
  {
    name: "Pakenham",
    variations: [
      {
        name: "PACK",
      },
      {
        name: "PAKE",
      },
      {
        name: "EHAM",
      },
      {
        name: "PA KE",
      },
      {
        name: "PHAM",
      },
    ],
  },
  {
    name: "Paddy's Gully",
    variations: [
      {
        name: "PADD",
      },
    ],
  },
  {
    name: "Pall Mall",
    variations: [
      {
        name: "PALL",
      },
    ],
  },
  {
    name: "Palmerston",
    variations: [
      {
        name: "PALM",
      },
      {
        name: "PA LM",
      },
      {
        name: "PALMERSTON",
      },
      {
        name: "PALMSTON",
      },
    ],
  },
  {
    name: "Panmure",
    variations: [
      {
        name: "PANM",
      },
      {
        name: "PA NM",
      },
    ],
  },
  {
    name: "Panoo Milloo",
    variations: [
      {
        name: "PANNOOMILL",
      },
    ],
  },
  {
    name: "Paraparap",
    variations: [
      {
        name: "PARA",
      },
      {
        name: "PARRAP",
      },
      {
        name: "PARCPARAP",
      },
    ],
  },
  {
    name: "Parkville",
    variations: [
      {
        name: "PARK",
      },
      {
        name: "PVILLE",
      },
      {
        name: "FVILLE",
      },
      {
        name: "PARKV",
      },
    ],
  },
  {
    name: "Portarlington",
    variations: [
      {
        name: "PARL",
      },
      {
        name: "PORT ARLING",
      },
      {
        name: "PORT",
      },
    ],
  },
  {
    name: "Parwan Creek",
    variations: [
      {
        name: "PARW",
      },
    ],
  },
  {
    name: "Pascoe Vale",
    variations: [
      {
        name: "PASC",
      },
      {
        name: "PASCOE VAL",
      },
      {
        name: "PASCOE V",
      },
      {
        name: "PASCOE VL",
      },
    ],
  },
  {
    name: "Paynesville",
    variations: [
      {
        name: "PAYN",
      },
      {
        name: "PA YN",
      },
      {
        name: "P VILLE",
      },
    ],
  },
  {
    name: "Peechelba",
    variations: [
      {
        name: "PEEC",
      },
    ],
  },
  {
    name: "Peg Leg Gully",
    variations: [
      {
        name: "PEGL",
      },
      {
        name: "PE GL",
      },
      {
        name: "PEGLEG",
      },
      {
        name: "PEG LEG",
      },
    ],
  },
  {
    name: "Pennyweight Flat",
    variations: [
      {
        name: "PENN",
      },
      {
        name: "PENNYWGHT",
      },
      {
        name: "PENNYWT F",
      },
    ],
  },
  {
    name: "Penshurst",
    variations: [
      {
        name: "PENS",
      },
      {
        name: "PHURST",
      },
      {
        name: "PE NS",
      },
    ],
  },
  {
    name: "Pentridge",
    variations: [
      {
        name: "PENT",
      },
      {
        name: "PATR",
      },
      {
        name: "PRIDGE",
      },
    ],
  },
  {
    name: "Pentland Hills",
    variations: [
      {
        name: "PENTLAND H",
      },
      {
        name: "PENTLANDSH",
      },
      {
        name: "PENTLD HL",
      },
      {
        name: "PENT",
      },
      {
        name: "PE NT",
      },
    ],
  },
  {
    name: "Percydale",
    variations: [
      {
        name: "PERC",
      },
      {
        name: "PE RC",
      },
    ],
  },
  {
    name: "Perth Scotland",
    variations: [
      {
        name: "PERT",
      },
    ],
  },
  {
    name: "Peter's Diggings",
    variations: [
      {
        name: "PETER DIGG",
      },
    ],
  },
  {
    name: "Pettavel",
    variations: [
      {
        name: "PETT",
      },
    ],
  },
  {
    name: "Pheasant Creek",
    variations: [
      {
        name: "PHEA",
      },
    ],
  },
  {
    name: "Phillipstown",
    variations: [
      {
        name: "PHIL",
      },
      {
        name: "PHILIP TN",
      },
      {
        name: "PHILIPTWN",
      },
      {
        name: "PHILLIPSN",
      },
      {
        name: "PHILLIPSTO",
      },
      {
        name: "PHILLIPSTW",
      },
      {
        name: "PHILLIPTOW",
      },
    ],
  },
  {
    name: "Phillip Island",
    variations: [
      {
        name: "PHILLIPIS",
      },
      {
        name: "PISLAND",
      },
      {
        name: "PHIL",
      },
      {
        name: "PHILLIP IS",
      },
    ],
  },
  {
    name: "Pitfield",
    variations: [
      {
        name: "PI TF",
      },
      {
        name: "PITF",
      },
    ],
  },
  {
    name: "Pic-Nic Point",
    variations: [
      {
        name: "PICN",
      },
    ],
  },
  {
    name: "Picola",
    variations: [
      {
        name: "PICO",
      },
      {
        name: "PI CO",
      },
    ],
  },
  {
    name: "Mount Pierrepoint",
    variations: [
      {
        name: "PIERREPOIN",
      },
    ],
  },
  {
    name: "Piggoreet",
    variations: [
      {
        name: "PIGG",
      },
      {
        name: "PEGGORSET",
      },
      {
        name: "PI GG",
      },
    ],
  },
  {
    name: "Pimpinio",
    variations: [
      {
        name: "PIMP",
      },
    ],
  },
  {
    name: "Pine Grove",
    variations: [
      {
        name: "PINE",
      },
      {
        name: "PI NE",
      },
    ],
  },
  {
    name: "Piper's Creek (2)",
    variations: [
      {
        name: "PIPE",
      },
    ],
  },
  {
    name: "Pirron Yalloak",
    variations: [
      {
        name: "PIRR",
      },
      {
        name: "PIRRON YAL",
      },
    ],
  },
  {
    name: "Pleasant Creek (2)",
    variations: [
      {
        name: "PL CK",
      },
      {
        name: "PL CR",
      },
      {
        name: "PLEA",
      },
      {
        name: "PLEAS",
      },
      {
        name: "PLEASTCR",
      },
    ],
  },
  {
    name: "Portland",
    variations: [
      {
        name: "PLAND",
      },
      {
        name: "PORT",
      },
      {
        name: "PORTD",
      },
      {
        name: "PORTO",
      },
      {
        name: "PLANE",
      },
      {
        name: "PO RT",
      },
    ],
  },
  {
    name: "Plenty",
    variations: [
      {
        name: "PLEN",
      },
      {
        name: "PLENTY",
      },
    ],
  },
  {
    name: "Polkemet Lakes",
    variations: [
      {
        name: "POLK",
      },
    ],
  },
  {
    name: "Polwarth County",
    variations: [
      {
        name: "POLW",
      },
    ],
  },
  {
    name: "Pomborneit",
    variations: [
      {
        name: "POMB",
      },
      {
        name: "PO MB",
      },
    ],
  },
  {
    name: "Pompapiel",
    variations: [
      {
        name: "POMP",
      },
    ],
  },
  {
    name: "Poowong",
    variations: [
      {
        name: "POOW",
      },
      {
        name: "PO OW",
      },
    ],
  },
  {
    name: "Porcupine Flat",
    variations: [
      {
        name: "POR",
      },
      {
        name: "PORC",
      },
    ],
  },
  {
    name: "Porepunkah",
    variations: [
      {
        name: "PORE",
      },
    ],
  },
  {
    name: "Point Albert",
    variations: [
      {
        name: "PORT ALBER",
      },
      {
        name: "PT ALBT",
      },
      {
        name: "PTAL",
      },
    ],
  },
  {
    name: "Port Campbell",
    variations: [
      {
        name: "PORT CAMPB",
      },
      {
        name: "PT CAMPBEL",
      },
      {
        name: "P CAMPBELL",
      },
      {
        name: "PORT",
      },
      {
        name: "PO RT",
      },
      {
        name: "PT CBELL",
      },
    ],
  },
  {
    name: "Prince Alfred Hospital",
    variations: [
      {
        name: "PR ALF HOSP",
      },
      {
        name: "P ALF HOS",
      },
      {
        name: "P ALF HOSP",
      },
      {
        name: "PR ALF HO",
      },
      {
        name: "PR ALF HOS",
      },
      {
        name: "PRALFHOSP",
      },
      {
        name: "PRIN ALF H",
      },
      {
        name: "PRIN ALF HOSP",
      },
    ],
  },
  {
    name: "Prahran",
    variations: [
      {
        name: "PRAH",
      },
      {
        name: "PRN",
      },
      {
        name: "PAHRAN",
      },
      {
        name: "PHAH",
      },
      {
        name: "PN",
      },
      {
        name: "PR",
      },
      {
        name: "PR AH",
      },
      {
        name: "PRAHN",
      },
      {
        name: "PR AN",
      },
      {
        name: "P RAN",
      },
      {
        name: "PRHN",
      },
    ],
  },
  {
    name: "Preston",
    variations: [
      {
        name: "PRES",
      },
      {
        name: "PTON",
      },
      {
        name: "PREST",
      },
      {
        name: "PRESTN",
      },
    ],
  },
  {
    name: "Providence Ponds",
    variations: [
      {
        name: "PROV",
      },
      {
        name: "PROVDCE P",
      },
    ],
  },
  {
    name: "Purnim",
    variations: [
      {
        name: "PURN",
      },
      {
        name: "PERN",
      },
      {
        name: "PU RN",
      },
    ],
  },
  {
    name: "Lake Purrumbete",
    variations: [
      {
        name: "PURR",
      },
      {
        name: "PURRUMBET",
      },
      {
        name: "PURRUMNEE",
      },
    ],
  },
  {
    name: "Pyalong",
    variations: [
      {
        name: "PYAL",
      },
      {
        name: "PY AL",
      },
    ],
  },
  {
    name: "Mount Pyke,Creek",
    variations: [
      {
        name: "PYKE",
      },
    ],
  },
  {
    name: "Pyrenees Range",
    variations: [
      {
        name: "PYRE",
      },
    ],
  },
  {
    name: "Queenscliff",
    variations: [
      {
        name: "QCLIFFE",
      },
      {
        name: "QUEE",
      },
      {
        name: "QUEENS CLF",
      },
      {
        name: "QUEENSCF",
      },
      {
        name: "QCLIFF",
      },
      {
        name: "QSCLIFF",
      },
      {
        name: "QUCLIFF",
      },
      {
        name: "QUCLIFFE",
      },
      {
        name: "QU EE",
      },
      {
        name: "QUEF",
      },
    ],
  },
  {
    name: "Queensland",
    variations: [
      {
        name: "QLAND",
      },
    ],
  },
  {
    name: "Quambatook",
    variations: [
      {
        name: "QUAM",
      },
      {
        name: "OUAM",
      },
      {
        name: "QTOOK",
      },
      {
        name: "QU AM",
      },
    ],
  },
  {
    name: "Quarry Hill",
    variations: [
      {
        name: "QUAR",
      },
      {
        name: "QUARRY H",
      },
      {
        name: "QUARRY HL",
      },
    ],
  },
  {
    name: "Queensferry",
    variations: [
      {
        name: "QUEENSFERR",
      },
    ],
  },
  {
    name: "Raglan",
    variations: [
      {
        name: "RAGL",
      },
      {
        name: "RA GL",
      },
    ],
  },
  {
    name: "Ramsgate",
    variations: [
      {
        name: "RAMS",
      },
    ],
  },
  {
    name: "Raspberry Creek",
    variations: [
      {
        name: "RASP",
      },
    ],
  },
  {
    name: "Rathscar",
    variations: [
      {
        name: "RATH",
      },
    ],
  },
  {
    name: "Ravenswood",
    variations: [
      {
        name: "RAVE",
      },
      {
        name: "RA VE",
      },
      {
        name: "RWOOD",
      },
    ],
  },
  {
    name: "Raywood",
    variations: [
      {
        name: "RAYW",
      },
      {
        name: "RAWY",
      },
      {
        name: "RA YW",
      },
      {
        name: "RWOOD",
      },
    ],
  },
  {
    name: "Richmond",
    variations: [
      {
        name: "RD",
      },
      {
        name: "RICH",
      },
      {
        name: "RICHD",
      },
      {
        name: "RMOND",
      },
      {
        name: "MOND",
      },
      {
        name: "RI CH",
      },
      {
        name: "R MOND",
      },
    ],
  },
  {
    name: "Rosedale",
    variations: [
      {
        name: "RDALE",
      },
      {
        name: "ROSE",
      },
      {
        name: "R DALE",
      },
      {
        name: "RO SA",
      },
      {
        name: "RO SE",
      },
    ],
  },
  {
    name: "Redan Hill",
    variations: [
      {
        name: "REDA",
      },
      {
        name: "REDAN H",
      },
      {
        name: "REDAN HIL",
      },
    ],
  },
  {
    name: "Redbank",
    variations: [
      {
        name: "REDB",
      },
      {
        name: "RE DB",
      },
      {
        name: "REDD",
      },
    ],
  },
  {
    name: "Redcastle",
    variations: [
      {
        name: "REDC",
      },
      {
        name: "RE DC",
      },
    ],
  },
  {
    name: "Redesdale",
    variations: [
      {
        name: "REDE",
      },
      {
        name: "RE DC",
      },
      {
        name: "RE DE",
      },
    ],
  },
  {
    name: "Red Jacket",
    variations: [
      {
        name: "REDJ",
      },
    ],
  },
  {
    name: "Redruth",
    variations: [
      {
        name: "REDR",
      },
    ],
  },
  {
    name: "Reedy Creek (5)",
    variations: [
      {
        name: "REED",
      },
    ],
  },
  {
    name: "Reeve's Survey",
    variations: [
      {
        name: "REEVES SUR",
      },
    ],
  },
  {
    name: "Reid's Creek (2)",
    variations: [
      {
        name: "REID",
      },
    ],
  },
  {
    name: "Reservoir",
    variations: [
      {
        name: "RESE",
      },
      {
        name: "RVOIR",
      },
    ],
  },
  {
    name: "Rutherglen",
    variations: [
      {
        name: "RGLEN",
      },
      {
        name: "RUTH",
      },
      {
        name: "AUTH",
      },
      {
        name: "RU TH",
      },
    ],
  },
  {
    name: "Rheola",
    variations: [
      {
        name: "RHEO",
      },
      {
        name: "RH EO",
      },
    ],
  },
  {
    name: "Red Hill (4)",
    variations: [
      {
        name: "RHILL",
      },
    ],
  },
  {
    name: "Richmond Flat",
    variations: [
      {
        name: "RICHMOND F",
      },
    ],
  },
  {
    name: "Riddell's Creek",
    variations: [
      {
        name: "RIDD",
      },
    ],
  },
  {
    name: "Rifle Downs",
    variations: [
      {
        name: "RIFL",
      },
    ],
  },
  {
    name: "Ringwood",
    variations: [
      {
        name: "RING",
      },
      {
        name: "RI NG",
      },
      {
        name: "RWOOD",
      },
    ],
  },
  {
    name: "Ripon County",
    variations: [
      {
        name: "RIPO",
      },
    ],
  },
  {
    name: "Rochester",
    variations: [
      {
        name: "ROCH",
      },
      {
        name: "ROCHTER",
      },
      {
        name: "RCHESTER",
      },
      {
        name: "RO CH",
      },
      {
        name: "ROCHSTR",
      },
    ],
  },
  {
    name: "Rocky Lead (2)",
    variations: [
      {
        name: "ROCK",
      },
      {
        name: "ROCKY L",
      },
    ],
  },
  {
    name: "Rodney County",
    variations: [
      {
        name: "RODN",
      },
    ],
  },
  {
    name: "Rochford",
    variations: [
      {
        name: "ROFORD",
      },
      {
        name: "ROCH",
      },
      {
        name: "RO CH",
      },
    ],
  },
  {
    name: "Rokewood",
    variations: [
      {
        name: "ROKE",
      },
      {
        name: "RWOOD",
      },
      {
        name: "RO KE",
      },
    ],
  },
  {
    name: "Romsey",
    variations: [
      {
        name: "ROMS",
      },
      {
        name: "RO MS",
      },
    ],
  },
  {
    name: "Rosebrook (2)",
    variations: [
      {
        name: "ROSEBK",
      },
    ],
  },
  {
    name: "Ross's Creek",
    variations: [
      {
        name: "ROSS",
      },
    ],
  },
  {
    name: "Ross Shire Scotland",
    variations: [
      {
        name: "ROSSHIRE",
      },
    ],
  },
  {
    name: "Lake Rowan",
    variations: [
      {
        name: "ROWA",
      },
      {
        name: "LAKE",
      },
      {
        name: "LA KE",
      },
    ],
  },
  {
    name: "Rowsley",
    variations: [
      {
        name: "ROWS",
      },
    ],
  },
  {
    name: "Runnymede",
    variations: [
      {
        name: "RUNN",
      },
      {
        name: "RU NN",
      },
    ],
  },
  {
    name: "Rupanyup",
    variations: [
      {
        name: "RUPA",
      },
      {
        name: "RYUP",
      },
    ],
  },
  {
    name: "Russell's Creek",
    variations: [
      {
        name: "RUSS",
      },
    ],
  },
  {
    name: "Rutland Eng",
    variations: [
      {
        name: "RUTL",
      },
    ],
  },
  {
    name: "Rushworth",
    variations: [
      {
        name: "RWORTH",
      },
      {
        name: "RUSH",
      },
      {
        name: "RU SH",
      },
    ],
  },
  {
    name: "South Yarra",
    variations: [
      {
        name: "S Y",
      },
      {
        name: "S YARR",
      },
      {
        name: "S YARRA",
      },
      {
        name: "SO YARRA",
      },
      {
        name: "SOUTH YARR",
      },
      {
        name: "S ARRA",
      },
      {
        name: "SOUT",
      },
      {
        name: "STH Y",
      },
      {
        name: "STH YARA",
      },
      {
        name: "STH YARR",
      },
      {
        name: "STH YRA",
      },
      {
        name: "STH YRRA",
      },
      {
        name: "S U",
      },
      {
        name: "S W",
      },
      {
        name: "SY",
      },
      {
        name: "S YARA",
      },
    ],
  },
  {
    name: "Sago Hill",
    variations: [
      {
        name: "SAGO",
      },
      {
        name: "SA GO",
      },
      {
        name: "SAGO H",
      },
      {
        name: "SAGO HL",
      },
    ],
  },
  {
    name: "Sailor's Creek",
    variations: [
      {
        name: "SAIL",
      },
    ],
  },
  {
    name: "Salisbury West",
    variations: [
      {
        name: "SALI",
      },
    ],
  },
  {
    name: "Salt Water River",
    variations: [
      {
        name: "SALT",
      },
      {
        name: "SALT WR RI",
      },
      {
        name: "SALT WTR R",
      },
    ],
  },
  {
    name: "Salt Creek (5)",
    variations: [
      {
        name: "SALT CR",
      },
    ],
  },
  {
    name: "Salt Water Creek",
    variations: [
      {
        name: "SALT WTR C",
      },
    ],
  },
  {
    name: "Sandridge",
    variations: [
      {
        name: "SAND",
      },
      {
        name: "SRIDGE",
      },
      {
        name: "BRIDGE",
      },
      {
        name: "SA ND",
      },
      {
        name: "SANDHURST",
      },
      {
        name: "SDRIDGE",
      },
      {
        name: "S RI",
      },
      {
        name: "S RIDE",
      },
      {
        name: "S RIDGE",
      },
    ],
  },
  {
    name: "Sandy Creek (5)",
    variations: [
      {
        name: "SANDY",
      },
      {
        name: "SANDY C",
      },
      {
        name: "SANDY CREE",
      },
      {
        name: "SANDY CRK",
      },
    ],
  },
  {
    name: "Sarsfield",
    variations: [
      {
        name: "SARS",
      },
    ],
  },
  {
    name: "South Australia",
    variations: [
      {
        name: "SAUS",
      },
      {
        name: "S AUST",
      },
      {
        name: "STH AUST",
      },
      {
        name: "STH AUSTR",
      },
      {
        name: "STH AUSTRL",
      },
    ],
  },
  {
    name: "Sunbury",
    variations: [
      {
        name: "SBURY",
      },
      {
        name: "SUNB",
      },
      {
        name: "S BURY",
      },
      {
        name: "SU NB",
      },
    ],
  },
  {
    name: "Scarsdale",
    variations: [
      {
        name: "SCAR",
      },
      {
        name: "SCDALE",
      },
      {
        name: "SC AR",
      },
      {
        name: "SDALE",
      },
    ],
  },
  {
    name: "Schnapper Point (2)",
    variations: [
      {
        name: "SCH POINT",
      },
      {
        name: "SCHN",
      },
      {
        name: "SCHNER PT",
      },
      {
        name: "SNAP",
      },
    ],
  },
  {
    name: "Scoresby",
    variations: [
      {
        name: "SCOR",
      },
      {
        name: "SC OR",
      },
    ],
  },
  {
    name: "Scotland",
    variations: [
      {
        name: "SCOT",
      },
      {
        name: "SCOTD",
      },
    ],
  },
  {
    name: "Scotchman's Lead",
    variations: [
      {
        name: "SCOTCHMLD",
      },
      {
        name: "SCOTMNS L",
      },
    ],
  },
  {
    name: "Smythesdale",
    variations: [
      {
        name: "SDALE",
      },
      {
        name: "SMDALE",
      },
      {
        name: "SMY",
      },
      {
        name: "SMYDALE",
      },
      {
        name: "SMYT",
      },
      {
        name: "S MDALE",
      },
      {
        name: "SM YT",
      },
    ],
  },
  {
    name: "Springdallah",
    variations: [
      {
        name: "SDALLAH",
      },
      {
        name: "SPRDALLAH",
      },
      {
        name: "SPRING DAL",
      },
      {
        name: "SPRINGAH",
      },
      {
        name: "SPRINGALLA",
      },
      {
        name: "SPRINGD",
      },
      {
        name: "S DALLAH",
      },
      {
        name: "SPDALLA",
      },
      {
        name: "SPDALLAH",
      },
      {
        name: "SPGDALLA",
      },
      {
        name: "SPGDALLAH",
      },
      {
        name: "SPRGDALLA",
      },
      {
        name: "SPRI",
      },
      {
        name: "SP RI",
      },
      {
        name: "SPRII",
      },
      {
        name: "SPRING",
      },
      {
        name: "SPRING-DAL",
      },
      {
        name: "SPRINGDAL",
      },
      {
        name: "SPRINGDALL",
      },
      {
        name: "SPRINGDOLL",
      },
    ],
  },
  {
    name: "Sealake",
    variations: [
      {
        name: "SEA",
      },
    ],
  },
  {
    name: "Seacombe",
    variations: [
      {
        name: "SEAC",
      },
    ],
  },
  {
    name: "Seaford",
    variations: [
      {
        name: "SEAF",
      },
    ],
  },
  {
    name: "Searsdale",
    variations: [
      {
        name: "SEAR",
      },
    ],
  },
  {
    name: "Seaton",
    variations: [
      {
        name: "SEAT",
      },
      {
        name: "SE AT",
      },
    ],
  },
  {
    name: "Sebastopol (2)",
    variations: [
      {
        name: "SEB",
      },
      {
        name: "SEBA",
      },
      {
        name: "SEPA",
      },
      {
        name: "SPOL",
      },
    ],
  },
  {
    name: "Second White Hill",
    variations: [
      {
        name: "SECO",
      },
      {
        name: "SECOND WHI",
      },
    ],
  },
  {
    name: "Serpentine",
    variations: [
      {
        name: "SERP",
      },
      {
        name: "STINE",
      },
      {
        name: "SE RP",
      },
    ],
  },
  {
    name: "Seven Creeks",
    variations: [
      {
        name: "SEVE",
      },
      {
        name: "SEVEN CK",
      },
    ],
  },
  {
    name: "Seventh White Hill",
    variations: [
      {
        name: "SEVEN W HI",
      },
    ],
  },
  {
    name: "Sexton",
    variations: [
      {
        name: "SEXT",
      },
    ],
  },
  {
    name: "Seymour",
    variations: [
      {
        name: "SEYM",
      },
      {
        name: "SE YM",
      },
      {
        name: "S MORN",
      },
      {
        name: "SMOUR",
      },
      {
        name: "S MOUR",
      },
    ],
  },
  {
    name: "Sandringham",
    variations: [
      {
        name: "SHAM",
      },
      {
        name: "SAND-HAM",
      },
      {
        name: "SANHAM",
      },
      {
        name: "SGHAM",
      },
      {
        name: "S G HAM",
      },
      {
        name: "S HAM",
      },
      {
        name: "S HAN",
      },
    ],
  },
  {
    name: "Shanghai China",
    variations: [
      {
        name: "SHAN",
      },
    ],
  },
  {
    name: "Sheepwash Creek",
    variations: [
      {
        name: "SHEE",
      },
      {
        name: "SHEEP WAS",
      },
    ],
  },
  {
    name: "Sheep Hill",
    variations: [
      {
        name: "SHEEP H",
      },
    ],
  },
  {
    name: "Sheepshead Gully",
    variations: [
      {
        name: "SHEEPHD GY",
      },
      {
        name: "SHEEPSH G",
      },
      {
        name: "SHEEP HEAD",
      },
      {
        name: "SHEEPSHD G",
      },
      {
        name: "SHEEPSHEAD",
      },
      {
        name: "SHP HD GLY",
      },
    ],
  },
  {
    name: "Sheffield England",
    variations: [
      {
        name: "SHEF",
      },
    ],
  },
  {
    name: "Shelford",
    variations: [
      {
        name: "SHEL",
      },
    ],
  },
  {
    name: "Shelbourne",
    variations: [
      {
        name: "SHELBNE",
      },
      {
        name: "SHEL",
      },
    ],
  },
  {
    name: "She-Oak Plains",
    variations: [
      {
        name: "SHEO",
      },
    ],
  },
  {
    name: "Shepparton",
    variations: [
      {
        name: "SHEP",
      },
      {
        name: "SHEPP",
      },
      {
        name: "SHEPPTON",
      },
      {
        name: "SHEPTON",
      },
      {
        name: "SHTON",
      },
      {
        name: "SH EP",
      },
      {
        name: "SHER",
      },
      {
        name: "S HTON",
      },
      {
        name: "SHTTON",
      },
      {
        name: "STON",
      },
    ],
  },
  {
    name: "Shepherd's Flat",
    variations: [
      {
        name: "SHEPH FLAT",
      },
      {
        name: "SHEPHERS F",
      },
      {
        name: "SHEPHS FL",
      },
    ],
  },
  {
    name: "Shetland Islands England",
    variations: [
      {
        name: "SHET",
      },
    ],
  },
  {
    name: "Shirley",
    variations: [
      {
        name: "SHIR",
      },
      {
        name: "SH IR",
      },
    ],
  },
  {
    name: "Sandhurst",
    variations: [
      {
        name: "SHURST",
      },
      {
        name: "SAND",
      },
      {
        name: "SA ND",
      },
      {
        name: "SANDHURST",
      },
      {
        name: "S HURSH",
      },
      {
        name: "S HURST",
      },
    ],
  },
  {
    name: "Six-Mile Creek",
    variations: [
      {
        name: "SIXM",
      },
    ],
  },
  {
    name: "Sixth White Hill",
    variations: [
      {
        name: "SIXTH WHITE",
      },
    ],
  },
  {
    name: "Skeleton Creek",
    variations: [
      {
        name: "SKEL",
      },
      {
        name: "SKELETON C",
      },
    ],
  },
  {
    name: "Skipton",
    variations: [
      {
        name: "SKIP",
      },
      {
        name: "SK IP",
      },
    ],
  },
  {
    name: "Slaty Creek",
    variations: [
      {
        name: "SLAT",
      },
      {
        name: "SL AT",
      },
    ],
  },
  {
    name: "Smeaton",
    variations: [
      {
        name: "SMEA",
      },
      {
        name: "SM EA",
      },
      {
        name: "SMER",
      },
      {
        name: "SMERTON",
      },
    ],
  },
  {
    name: "Smith's Creek",
    variations: [
      {
        name: "SMIT",
      },
    ],
  },
  {
    name: "Snake Valley",
    variations: [
      {
        name: "SNAK",
      },
    ],
  },
  {
    name: "Snowy Creek",
    variations: [
      {
        name: "SNOW",
      },
      {
        name: "SNOWY CR",
      },
      {
        name: "SNOWY CREE",
      },
      {
        name: "SN OW",
      },
      {
        name: "SNOWY C",
      },
      {
        name: "SNOWY CK",
      },
      {
        name: "SNOWY CRK",
      },
    ],
  },
  {
    name: "Snowy Mountains",
    variations: [
      {
        name: "SNOWY MTN",
      },
    ],
  },
  {
    name: "Soldier's Hill",
    variations: [
      {
        name: "SOLD",
      },
    ],
  },
  {
    name: "Somerset England",
    variations: [
      {
        name: "SOME",
      },
    ],
  },
  {
    name: "Sorrento",
    variations: [
      {
        name: "SORRE",
      },
      {
        name: "SORR",
      },
    ],
  },
  {
    name: "Specimen Gully",
    variations: [
      {
        name: "SPEC",
      },
      {
        name: "SPECN GLY",
      },
      {
        name: "SPECIEMEN",
      },
      {
        name: "SPECIMAN G",
      },
      {
        name: "SPECIMEN",
      },
      {
        name: "SPECIMEN G",
      },
      {
        name: "SPECIUM GY",
      },
    ],
  },
  {
    name: "Spotswood",
    variations: [
      {
        name: "SPOT",
      },
    ],
  },
  {
    name: "The Spring",
    variations: [
      {
        name: "SPRI",
      },
    ],
  },
  {
    name: "Springbank",
    variations: [
      {
        name: "SPRIB BAN",
      },
      {
        name: "SPRIB BK",
      },
      {
        name: "SPRIB BNK",
      },
    ],
  },
  {
    name: "Spring Vale",
    variations: [
      {
        name: "SPRING",
      },
      {
        name: "SPRING VAL",
      },
    ],
  },
  {
    name: "Spring Gully (2)",
    variations: [
      {
        name: "SPRING G",
      },
    ],
  },
  {
    name: "Spring Hill (7)",
    variations: [
      {
        name: "SPRING H",
      },
    ],
  },
  {
    name: "Spring Creek (7)",
    variations: [
      {
        name: "SPRINGCREE",
      },
    ],
  },
  {
    name: "Springfield",
    variations: [
      {
        name: "SPRINGFIEL",
      },
      {
        name: "SPRINGFLD",
      },
      {
        name: "SPRI",
      },
      {
        name: "SPRING",
      },
    ],
  },
  {
    name: "St Arnaud",
    variations: [
      {
        name: "ST A",
      },
      {
        name: "ST AR",
      },
      {
        name: "ST ARND",
      },
      {
        name: "STAR",
      },
      {
        name: "S ARNAUD",
      },
      {
        name: "S ARND",
      },
      {
        name: "TAR",
      },
    ],
  },
  {
    name: "St Andrews",
    variations: [
      {
        name: "ST AN",
      },
      {
        name: "S ANDREW",
      },
      {
        name: "STAN",
      },
    ],
  },
  {
    name: "Stawell",
    variations: [
      {
        name: "ST AW",
      },
      {
        name: "STAW",
      },
      {
        name: "S WELL",
      },
    ],
  },
  {
    name: "St James",
    variations: [
      {
        name: "ST JA",
      },
      {
        name: "STJA",
      },
    ],
  },
  {
    name: "St Kilda",
    variations: [
      {
        name: "ST K",
      },
      {
        name: "ST KI",
      },
      {
        name: "S K",
      },
      {
        name: "SKIL",
      },
      {
        name: "STK",
      },
      {
        name: "S TK",
      },
      {
        name: "STKI",
      },
      {
        name: "STXL",
      },
    ],
  },
  {
    name: "St Leonards On The Bay",
    variations: [
      {
        name: "ST LEON",
      },
      {
        name: "ST LEONARD",
      },
      {
        name: "ST LEONS",
      },
      {
        name: "STLE",
      },
    ],
  },
  {
    name: "Stuart Mill",
    variations: [
      {
        name: "ST UA",
      },
      {
        name: "STUA",
      },
      {
        name: "S MILL",
      },
      {
        name: "STUART H",
      },
      {
        name: "STUART M",
      },
      {
        name: "STUART MIL",
      },
      {
        name: "STUARTMILL",
      },
    ],
  },
  {
    name: "Staffordshire Reef",
    variations: [
      {
        name: "STAF",
      },
      {
        name: "STAFF REEF",
      },
      {
        name: "STAFFORD SH",
      },
      {
        name: "ST AF",
      },
      {
        name: "STAFDREEF",
      },
      {
        name: "STAFDSHIR",
      },
      {
        name: "STAFFFORDSHIRE RE",
      },
      {
        name: "STAFFORD",
      },
      {
        name: "STAFFORDHURLEY",
      },
      {
        name: "STAFFORDIN",
      },
      {
        name: "STAFFORD R",
      },
      {
        name: "STAFFORDRE",
      },
      {
        name: "STAFFORDS",
      },
      {
        name: "STAFFORD S",
      },
      {
        name: "STAFFORDSH",
      },
      {
        name: "STAFFORDSHIRE REE",
      },
      {
        name: "STAFFORDSHIRE RF",
      },
      {
        name: "STAFFORDSHIRE RY",
      },
      {
        name: "STAFF-REEF",
      },
      {
        name: "STAFFS",
      },
      {
        name: "STAFFSHIR",
      },
      {
        name: "STAFFSHR",
      },
      {
        name: "STAFFSH RF",
      },
      {
        name: "STAFFS RF",
      },
      {
        name: "STAF REEF",
      },
      {
        name: "STAFSHIRE",
      },
      {
        name: "STAFS R-F",
      },
      {
        name: "STF REEF",
      },
    ],
  },
  {
    name: "Staffordshire Vic",
    variations: [
      {
        name: "STAFF",
      },
    ],
  },
  {
    name: "Staghorn Flat",
    variations: [
      {
        name: "STAG",
      },
    ],
  },
  {
    name: "Stanley",
    variations: [
      {
        name: "STAN",
      },
      {
        name: "ST AN",
      },
    ],
  },
  {
    name: "Station Peak",
    variations: [
      {
        name: "STAT",
      },
      {
        name: "STATION PK",
      },
      {
        name: "STATION P",
      },
      {
        name: "STATION PE",
      },
    ],
  },
  {
    name: "Steep Bank",
    variations: [
      {
        name: "STEE",
      },
    ],
  },
  {
    name: "Steiglitz",
    variations: [
      {
        name: "STEI",
      },
      {
        name: "STEIG",
      },
      {
        name: "S LITZ",
      },
      {
        name: "ST EI",
      },
    ],
  },
  {
    name: "Stockyard Creek (3)",
    variations: [
      {
        name: "STOC",
      },
      {
        name: "STOCKY",
      },
    ],
  },
  {
    name: "Stockyard Hill",
    variations: [
      {
        name: "STOCK Y HI",
      },
      {
        name: "STOCKYAR H",
      },
      {
        name: "STOCKYD H",
      },
      {
        name: "STOC",
      },
      {
        name: "ST OC",
      },
      {
        name: "STOCKY",
      },
      {
        name: "STOCKYARD",
      },
      {
        name: "STOCKYARD CK",
      },
    ],
  },
  {
    name: "Stoke-Upon-Trent UK",
    variations: [
      {
        name: "STOK",
      },
    ],
  },
  {
    name: "Stony Creek (4)",
    variations: [
      {
        name: "STON",
      },
      {
        name: "STONY CK",
      },
    ],
  },
  {
    name: "Strathfieldsaye",
    variations: [
      {
        name: "STRA",
      },
      {
        name: "STRAFDSAY",
      },
      {
        name: "STRAFDYE",
      },
      {
        name: "STRATH",
      },
      {
        name: "STRATHSSAY",
      },
      {
        name: "SFEAY",
      },
      {
        name: "SFIELD",
      },
      {
        name: "S FIELD",
      },
      {
        name: "S FIELDSAYE",
      },
      {
        name: "SFSAYE",
      },
      {
        name: "S F SAYE",
      },
      {
        name: "SSAYE",
      },
      {
        name: "S SAYE",
      },
      {
        name: "STFDSAYE",
      },
      {
        name: "STFIELDSAYE",
      },
      {
        name: "ST RA",
      },
      {
        name: "STRATHF",
      },
      {
        name: "STRATHFIEL",
      },
      {
        name: "STRATHFIELD",
      },
      {
        name: "SY FAYE",
      },
    ],
  },
  {
    name: "Strathloddon",
    variations: [
      {
        name: "STRATHLODD",
      },
    ],
  },
  {
    name: "Streatham",
    variations: [
      {
        name: "STRE",
      },
      {
        name: "ST RE",
      },
      {
        name: "STRF",
      },
    ],
  },
  {
    name: "Stringybark Creek",
    variations: [
      {
        name: "STRI",
      },
      {
        name: "STRINGY BA",
      },
      {
        name: "STRINGYBK",
      },
    ],
  },
  {
    name: "Stringybark Flat",
    variations: [
      {
        name: "STRINGBK F",
      },
    ],
  },
  {
    name: "Strathbogie",
    variations: [
      {
        name: "STRTHBGIE",
      },
      {
        name: "S BOGIE",
      },
      {
        name: "STHBOGIE",
      },
      {
        name: "STH BOGIE",
      },
      {
        name: "STRA",
      },
      {
        name: "ST RA",
      },
    ],
  },
  {
    name: "Studley Park",
    variations: [
      {
        name: "STUD",
      },
    ],
  },
  {
    name: "Suffolk England",
    variations: [
      {
        name: "SUFF",
      },
    ],
  },
  {
    name: "Suffolk Lead",
    variations: [
      {
        name: "SUFFOLK L",
      },
      {
        name: "SUFFOLK LD",
      },
    ],
  },
  {
    name: "Sugarloaf Creek (3)",
    variations: [
      {
        name: "SUGA",
      },
    ],
  },
  {
    name: "Sulky Gully",
    variations: [
      {
        name: "SULK",
      },
    ],
  },
  {
    name: "Sunshine",
    variations: [
      {
        name: "SUNS",
      },
      {
        name: "SSHINE",
      },
    ],
  },
  {
    name: "Surrey River",
    variations: [
      {
        name: "SURR",
      },
    ],
  },
  {
    name: "Sutherland",
    variations: [
      {
        name: "SUTH",
      },
      {
        name: "SU TH",
      },
    ],
  },
  {
    name: "Sutton Grange",
    variations: [
      {
        name: "SUTT",
      },
      {
        name: "SUTTON GR",
      },
      {
        name: "SU TT",
      },
    ],
  },
  {
    name: "Swan Water",
    variations: [
      {
        name: "SWAN",
      },
    ],
  },
  {
    name: "Swift's Creek",
    variations: [
      {
        name: "SWIF",
      },
    ],
  },
  {
    name: "Sydney NSW",
    variations: [
      {
        name: "SYDN",
      },
    ],
  },
  {
    name: "Tallarook",
    variations: [
      {
        name: "TA LL",
      },
      {
        name: "TALLAROO",
      },
      {
        name: "TALL",
      },
      {
        name: "TROOK",
      },
      {
        name: "TU LL",
      },
    ],
  },
  {
    name: "Tabilk",
    variations: [
      {
        name: "TABI",
      },
      {
        name: "TA BI",
      },
    ],
  },
  {
    name: "Table Hill",
    variations: [
      {
        name: "TABL",
      },
    ],
  },
  {
    name: "Tahara",
    variations: [
      {
        name: "TAHA",
      },
    ],
  },
  {
    name: "Talangatta",
    variations: [
      {
        name: "TALA",
      },
      {
        name: "TALGATTA",
      },
      {
        name: "TALLANGATT",
      },
      {
        name: "TGATTA",
      },
    ],
  },
  {
    name: "Talbot",
    variations: [
      {
        name: "TALB",
      },
      {
        name: "TA LB",
      },
    ],
  },
  {
    name: "Talbotville",
    variations: [
      {
        name: "TALBOTVILL",
      },
    ],
  },
  {
    name: "Tallygaroopna (Tallagaroopna)",
    variations: [
      {
        name: "TALL",
      },
      {
        name: "TALLYGAROO",
      },
      {
        name: "TALLYGOROO",
      },
    ],
  },
  {
    name: "Tambo River",
    variations: [
      {
        name: "TAMBO",
      },
    ],
  },
  {
    name: "Taminick",
    variations: [
      {
        name: "TAMI",
      },
    ],
  },
  {
    name: "Tanjil",
    variations: [
      {
        name: "TANG",
      },
      {
        name: "TANJ",
      },
      {
        name: "TA NJ",
      },
      {
        name: "TO MJ",
      },
    ],
  },
  {
    name: "Taradale",
    variations: [
      {
        name: "TARA",
      },
      {
        name: "TDALE",
      },
      {
        name: "MT TARADAL",
      },
      {
        name: "MT TDALE",
      },
      {
        name: "S DALE",
      },
      {
        name: "TA RA",
      },
      {
        name: "T DALE",
      },
      {
        name: "YA RR",
      },
    ],
  },
  {
    name: "Tarrawingee",
    variations: [
      {
        name: "TARAWIN",
      },
      {
        name: "TARRAWGEE",
      },
      {
        name: "TARRGEE",
      },
      {
        name: "TARR",
      },
      {
        name: "TA RR",
      },
      {
        name: "TARRAWINGE",
      },
      {
        name: "TWINGA",
      },
      {
        name: "TWINGE",
      },
      {
        name: "TWINGEE",
      },
      {
        name: "TWINGEL",
      },
      {
        name: "TWINGIE",
      },
    ],
  },
  {
    name: "Tarilta",
    variations: [
      {
        name: "TARI",
      },
    ],
  },
  {
    name: "Tarnagulla",
    variations: [
      {
        name: "TARN",
      },
      {
        name: "TGULLA",
      },
      {
        name: "TAMA",
      },
      {
        name: "TAR",
      },
      {
        name: "TA RN",
      },
    ],
  },
  {
    name: "Tarrayoukyan",
    variations: [
      {
        name: "TARR",
      },
      {
        name: "TARRAYOUKY",
      },
      {
        name: "TA RR",
      },
      {
        name: "TARRAYONHY",
      },
    ],
  },
  {
    name: "Tarra Survey",
    variations: [
      {
        name: "TARRA SUR",
      },
    ],
  },
  {
    name: "Tarrangower",
    variations: [
      {
        name: "TARRANGOR",
      },
    ],
  },
  {
    name: "Tarraville",
    variations: [
      {
        name: "TARRAV",
      },
      {
        name: "TARVILLE",
      },
      {
        name: "TVILLE",
      },
      {
        name: "TARR",
      },
      {
        name: "TA RR",
      },
      {
        name: "TARV",
      },
      {
        name: "YARRAVILLE",
      },
    ],
  },
  {
    name: "Tasmania",
    variations: [
      {
        name: "TAS",
      },
      {
        name: "TASM",
      },
    ],
  },
  {
    name: "Tatura",
    variations: [
      {
        name: "TATU",
      },
    ],
  },
  {
    name: "Tatyoon",
    variations: [
      {
        name: "TATY",
      },
    ],
  },
  {
    name: "Taylor's Flat",
    variations: [
      {
        name: "TAYL",
      },
    ],
  },
  {
    name: "Tea-Tree Creek (3)",
    variations: [
      {
        name: "TEA TR CK",
      },
      {
        name: "TEAT",
      },
    ],
  },
  {
    name: "Teesdale",
    variations: [
      {
        name: "TEASD",
      },
      {
        name: "TEES",
      },
      {
        name: "TDALE",
      },
    ],
  },
  {
    name: "Templestowe",
    variations: [
      {
        name: "TEMP",
      },
      {
        name: "TSTOWE",
      },
      {
        name: "TE MP",
      },
      {
        name: "TEMPLESTOW",
      },
      {
        name: "TMPSTWE",
      },
    ],
  },
  {
    name: "Templemore",
    variations: [
      {
        name: "TEMPLEMORE",
      },
    ],
  },
  {
    name: "Terang",
    variations: [
      {
        name: "TERA",
      },
      {
        name: "TE RA",
      },
      {
        name: "TRANG",
      },
    ],
  },
  {
    name: "Terrick-Terrick",
    variations: [
      {
        name: "TERR",
      },
      {
        name: "TERRICK",
      },
      {
        name: "TERRICK TE",
      },
    ],
  },
  {
    name: "Traralgon",
    variations: [
      {
        name: "TGON",
      },
      {
        name: "TRAR",
      },
      {
        name: "TR AR",
      },
      {
        name: "TRAV",
      },
    ],
  },
  {
    name: "Whim Holes",
    variations: [
      {
        name: "THE WHIM H",
      },
      {
        name: "WHIM",
      },
      {
        name: "WH IM",
      },
      {
        name: "WHIM HALES",
      },
      {
        name: "WHIMHOLES",
      },
      {
        name: "WHIM HOLE",
      },
      {
        name: "WHIN",
      },
    ],
  },
  {
    name: "Third White Hill",
    variations: [
      {
        name: "THIRD WHITE",
      },
    ],
  },
  {
    name: "Thomastown",
    variations: [
      {
        name: "THOM",
      },
      {
        name: "TH OM",
      },
      {
        name: "THOSTOWN",
      },
      {
        name: "THTOWN",
      },
      {
        name: "TTOWN",
      },
    ],
  },
  {
    name: "Thoona",
    variations: [
      {
        name: "THOO",
      },
      {
        name: "TH OO",
      },
    ],
  },
  {
    name: "Thorpdale",
    variations: [
      {
        name: "THOR",
      },
      {
        name: "TH OR",
      },
    ],
  },
  {
    name: "Three Mile Creek",
    variations: [
      {
        name: "THR ML CK",
      },
      {
        name: "THRE",
      },
      {
        name: "THREE M CK",
      },
      {
        name: "THREE MILE",
      },
      {
        name: "THREE ML C",
      },
    ],
  },
  {
    name: "Thurles Co Tipperary Ireland",
    variations: [
      {
        name: "THUR",
      },
    ],
  },
  {
    name: "Timboon Creek",
    variations: [
      {
        name: "TIMB",
      },
    ],
  },
  {
    name: "Timor",
    variations: [
      {
        name: "TIMO",
      },
      {
        name: "TI MO",
      },
    ],
  },
  {
    name: "Tinambra",
    variations: [
      {
        name: "TINA",
      },
    ],
  },
  {
    name: "Tintaldra",
    variations: [
      {
        name: "TINT",
      },
      {
        name: "TI NT",
      },
    ],
  },
  {
    name: "County Tipperary Ireland",
    variations: [
      {
        name: "TIP",
      },
    ],
  },
  {
    name: "Tipperary Gully(4)",
    variations: [
      {
        name: "TIPP",
      },
      {
        name: "TIPPERARY G",
      },
      {
        name: "TIPPRY GY",
      },
    ],
  },
  {
    name: "Tipperary Point (2)",
    variations: [
      {
        name: "TIPPERARY P",
      },
    ],
  },
  {
    name: "Toolleen (Tooleen)",
    variations: [
      {
        name: "TO LL",
      },
      {
        name: "TOOL",
      },
    ],
  },
  {
    name: "Todd's Creek",
    variations: [
      {
        name: "TODD",
      },
    ],
  },
  {
    name: "Tongala",
    variations: [
      {
        name: "TONG",
      },
      {
        name: "TO NG",
      },
    ],
  },
  {
    name: "Toorak (2)",
    variations: [
      {
        name: "TOO",
      },
    ],
  },
  {
    name: "Tooboorac",
    variations: [
      {
        name: "TOOB",
      },
    ],
  },
  {
    name: "Tootgarook",
    variations: [
      {
        name: "TOOGRK",
      },
      {
        name: "TOOT",
      },
      {
        name: "TOOTGAROO",
      },
      {
        name: "TO OT",
      },
    ],
  },
  {
    name: "Toombon",
    variations: [
      {
        name: "TOOM",
      },
      {
        name: "TO OM",
      },
    ],
  },
  {
    name: "Toongabbie",
    variations: [
      {
        name: "TOON",
      },
      {
        name: "TOONG",
      },
      {
        name: "TOONGAB",
      },
      {
        name: "TBBIE",
      },
      {
        name: "TGABBIE",
      },
      {
        name: "TO ON",
      },
    ],
  },
  {
    name: "Torrumbarry",
    variations: [
      {
        name: "TOOR",
      },
      {
        name: "TORR",
      },
      {
        name: "TORRUMBAR",
      },
      {
        name: "TO RR",
      },
    ],
  },
  {
    name: "Tourello",
    variations: [
      {
        name: "TOUR",
      },
    ],
  },
  {
    name: "Tower Hill (2)",
    variations: [
      {
        name: "TOWE",
      },
      {
        name: "TR H",
      },
    ],
  },
  {
    name: "Towong Shire",
    variations: [
      {
        name: "TOWO",
      },
    ],
  },
  {
    name: "Trafalgar",
    variations: [
      {
        name: "TRAF",
      },
      {
        name: "STAFALGAR",
      },
      {
        name: "TGAR",
      },
      {
        name: "TR AF",
      },
    ],
  },
  {
    name: "Trawalla",
    variations: [
      {
        name: "TRAW",
      },
    ],
  },
  {
    name: "Trentham East",
    variations: [
      {
        name: "TREN",
      },
      {
        name: "TRENTHAM E",
      },
    ],
  },
  {
    name: "Trewalla",
    variations: [
      {
        name: "TREW",
      },
    ],
  },
  {
    name: "Truganina Swamps",
    variations: [
      {
        name: "TRUG",
      },
    ],
  },
  {
    name: "Tullarmarine",
    variations: [
      {
        name: "TULL",
      },
      {
        name: "TULLAMA",
      },
      {
        name: "TULLAMARIN",
      },
      {
        name: "TULLRINE",
      },
    ],
  },
  {
    name: "Tungamah",
    variations: [
      {
        name: "TUNG",
      },
      {
        name: "TMAH",
      },
    ],
  },
  {
    name: "Two Mile Creek",
    variations: [
      {
        name: "TWOM",
      },
      {
        name: "2 MILE CK",
      },
      {
        name: "2 MILE CRK",
      },
      {
        name: "TWO MIL",
      },
      {
        name: "TWO MILE",
      },
      {
        name: "TWO MILE C",
      },
    ],
  },
  {
    name: "Tyabb",
    variations: [
      {
        name: "TYAB",
      },
      {
        name: "TY AB",
      },
    ],
  },
  {
    name: "Lake Tyers",
    variations: [
      {
        name: "TYER",
      },
      {
        name: "LAKE",
      },
      {
        name: "LA KE",
      },
      {
        name: "L TYERS",
      },
    ],
  },
  {
    name: "Tylden",
    variations: [
      {
        name: "TYLD",
      },
      {
        name: "TY LD",
      },
    ],
  },
  {
    name: "Tyrendarra",
    variations: [
      {
        name: "TYRE",
      },
      {
        name: "TYRR",
      },
    ],
  },
  {
    name: "County Tyrone Ireland",
    variations: [
      {
        name: "TYRO",
      },
    ],
  },
  {
    name: "Ullina",
    variations: [
      {
        name: "ULLI",
      },
    ],
  },
  {
    name: "Ulupna West",
    variations: [
      {
        name: "ULUP",
      },
    ],
  },
  {
    name: "Undera",
    variations: [
      {
        name: "UNDE",
      },
      {
        name: "UN DE",
      },
    ],
  },
  {
    name: "Unwin's Special Survey",
    variations: [
      {
        name: "UNWINS S",
      },
      {
        name: "UNWINS SUR",
      },
    ],
  },
  {
    name: "Upper Plenty",
    variations: [
      {
        name: "UP PLENTY",
      },
      {
        name: "UPPE",
      },
      {
        name: "UPPER PL",
      },
      {
        name: "UPPER PLEN",
      },
      {
        name: "UPPER PLY",
      },
      {
        name: "U PLENTY",
      },
      {
        name: "UP PE",
      },
      {
        name: "UP PL",
      },
      {
        name: "UPR PLENTY",
      },
    ],
  },
  {
    name: "Upper Buckland",
    variations: [
      {
        name: "UPPER BUCK",
      },
    ],
  },
  {
    name: "Upper Dargo",
    variations: [
      {
        name: "UPPER DARG",
      },
      {
        name: "UP DARGO",
      },
    ],
  },
  {
    name: "Upper Macedon",
    variations: [
      {
        name: "UPPER MACE",
      },
    ],
  },
  {
    name: "Upper Maffra",
    variations: [
      {
        name: "UPPER MAFF",
      },
      {
        name: "UPPE",
      },
      {
        name: "UP PE",
      },
    ],
  },
  {
    name: "Upper Yarra",
    variations: [
      {
        name: "UPPER YARR",
      },
    ],
  },
  {
    name: "Vaughan",
    variations: [
      {
        name: "VAUG",
      },
      {
        name: "NAUGHAN",
      },
      {
        name: "VA UG",
      },
      {
        name: "VAUGH",
      },
    ],
  },
  {
    name: "Van Dieman's Land (Tasmania)",
    variations: [
      {
        name: "VDL",
      },
    ],
  },
  {
    name: "Violet Town",
    variations: [
      {
        name: "VI TOWN",
      },
      {
        name: "VIOL",
      },
      {
        name: "VIOLET T",
      },
      {
        name: "VIOLET TOW",
      },
      {
        name: "VIOLET TWN",
      },
      {
        name: "VI OL",
      },
      {
        name: "VIOLET TN",
      },
      {
        name: "VIO TOWN",
      },
      {
        name: "VI TN",
      },
      {
        name: "VLET TOWN",
      },
      {
        name: "V T",
      },
      {
        name: "V TOWN",
      },
    ],
  },
  {
    name: "Viaduct Township",
    variations: [
      {
        name: "VIAD",
      },
    ],
  },
  {
    name: "Victoria Gully",
    variations: [
      {
        name: "VICT",
      },
      {
        name: "VICTORIA G",
      },
    ],
  },
  {
    name: "Violet Creek",
    variations: [
      {
        name: "VIOLET CR",
      },
    ],
  },
  {
    name: "Violet Ponds",
    variations: [
      {
        name: "VIOLET PND",
      },
    ],
  },
  {
    name: "Mount Vite-Vite",
    variations: [
      {
        name: "VITE-VITE",
      },
    ],
  },
  {
    name: "Wallan-Wallan",
    variations: [
      {
        name: "W WALLAN",
      },
      {
        name: "WALL",
      },
      {
        name: "WALLAN",
      },
      {
        name: "WALLAN W",
      },
      {
        name: "WALLAN WAL",
      },
      {
        name: "WALLAN WN",
      },
      {
        name: "WM WALLAN",
      },
    ],
  },
  {
    name: "Wandin Yalloak",
    variations: [
      {
        name: "W YALLOCK",
      },
      {
        name: "WANDIN YALL",
      },
      {
        name: "WANDY YALL",
      },
      {
        name: "WARD(sp)",
      },
    ],
  },
  {
    name: "Waanyarra",
    variations: [
      {
        name: "WAAN",
      },
    ],
  },
  {
    name: "Wabdallah",
    variations: [
      {
        name: "WABD",
      },
      {
        name: "WA BD",
      },
    ],
  },
  {
    name: "Walhalla",
    variations: [
      {
        name: "WAHA (sp)",
      },
      {
        name: "WALH",
      },
      {
        name: "WHALLA",
      },
      {
        name: "WA LH",
      },
      {
        name: "WA LK",
      },
      {
        name: "W HALLA",
      },
    ],
  },
  {
    name: "Wahgunyah",
    variations: [
      {
        name: "WAHG",
      },
      {
        name: "WAHYAH",
      },
      {
        name: "WA HG",
      },
      {
        name: "WAHYA",
      },
      {
        name: "WGUNYAH",
      },
      {
        name: "W GUNYAH",
      },
      {
        name: "WGYAH",
      },
      {
        name: "WYAH",
      },
    ],
  },
  {
    name: "Wahring",
    variations: [
      {
        name: "WAHR",
      },
    ],
  },
  {
    name: "Walmer",
    variations: [
      {
        name: "WALM",
      },
    ],
  },
  {
    name: "Wales UK",
    variations: [
      {
        name: "WALS",
      },
    ],
  },
  {
    name: "Wandong",
    variations: [
      {
        name: "WAND",
      },
      {
        name: "WA ND",
      },
    ],
  },
  {
    name: "Wandilgong",
    variations: [
      {
        name: "WANDGONG",
      },
      {
        name: "WANDIGONG",
      },
    ],
  },
  {
    name: "Wangoom",
    variations: [
      {
        name: "WANG",
      },
      {
        name: "WANGOO",
      },
      {
        name: "WGOOM",
      },
    ],
  },
  {
    name: "Wangaratta",
    variations: [
      {
        name: "WANGATTA",
      },
      {
        name: "WANGT",
      },
      {
        name: "WANGTTA",
      },
      {
        name: "WATTA",
      },
      {
        name: "WANG",
      },
      {
        name: "WA NG",
      },
      {
        name: "W ATTA",
      },
      {
        name: "WING",
      },
    ],
  },
  {
    name: "Wannon Shire",
    variations: [
      {
        name: "WANN",
      },
    ],
  },
  {
    name: "Waranga",
    variations: [
      {
        name: "WARA",
      },
      {
        name: "WORA (sp)",
      },
      {
        name: "WA RA",
      },
    ],
  },
  {
    name: "Warrnambool",
    variations: [
      {
        name: "WARB",
      },
      {
        name: "WARBOOL",
      },
      {
        name: "WARNABOOL",
      },
      {
        name: "WARR",
      },
      {
        name: "WARRNAMBOO",
      },
      {
        name: "WBOOL",
      },
      {
        name: "MARR",
      },
      {
        name: "WA RN",
      },
      {
        name: "WA RR",
      },
      {
        name: "WARRN",
      },
      {
        name: "WBOO",
      },
      {
        name: "WBOOD",
      },
      {
        name: "W'BOOD",
      },
      {
        name: "W'BOOL",
      },
      {
        name: "W BOOL",
      },
      {
        name: "WBOOLE",
      },
      {
        name: "WORR",
      },
    ],
  },
  {
    name: "Wareek",
    variations: [
      {
        name: "WARE",
      },
      {
        name: "WA RE",
      },
    ],
  },
  {
    name: "Warracknabeal",
    variations: [
      {
        name: "WARRACK",
      },
      {
        name: "WARRACK BE",
      },
      {
        name: "WARRACKNA",
      },
      {
        name: "WARACKNABE",
      },
      {
        name: "WARBEAL",
      },
      {
        name: "WARKNBEAL",
      },
      {
        name: "WARR",
      },
      {
        name: "WA RR",
      },
      {
        name: "WARRACKNAB",
      },
      {
        name: "WBEAL",
      },
      {
        name: "W BEAL",
      },
      {
        name: "WBELL",
      },
      {
        name: "WEIRACKNAB",
      },
      {
        name: "WERR",
      },
      {
        name: "WE RR",
      },
      {
        name: "WERRACKNAB",
      },
      {
        name: "WORR",
      },
      {
        name: "ZBEAL",
      },
    ],
  },
  {
    name: "Watch Hill",
    variations: [
      {
        name: "WATC",
      },
    ],
  },
  {
    name: "Waterloo(3)",
    variations: [
      {
        name: "WATE",
      },
    ],
  },
  {
    name: "Watgania",
    variations: [
      {
        name: "WATG",
      },
    ],
  },
  {
    name: "Watson's Creek (2)",
    variations: [
      {
        name: "WATS",
      },
    ],
  },
  {
    name: "Wattle Flat",
    variations: [
      {
        name: "WATT",
      },
    ],
  },
  {
    name: "Waurn Ponds (2)",
    variations: [
      {
        name: "WAUR",
      },
    ],
  },
  {
    name: "Werracknabeal",
    variations: [
      {
        name: "WBEAL",
      },
      {
        name: "WERRAC",
      },
      {
        name: "WERRACKNAB",
      },
      {
        name: "WNABEAL",
      },
    ],
  },
  {
    name: "Werribee",
    variations: [
      {
        name: "WBEE",
      },
      {
        name: "WERR",
      },
      {
        name: "W BEE",
      },
      {
        name: "WE RR",
      },
    ],
  },
  {
    name: "Wirrumbirchip",
    variations: [
      {
        name: "WBIRCHIP",
      },
      {
        name: "WIRR",
      },
    ],
  },
  {
    name: "Wedderburn",
    variations: [
      {
        name: "WBURN",
      },
      {
        name: "WEDD",
      },
      {
        name: "WE DD",
      },
    ],
  },
  {
    name: "Warrandyte",
    variations: [
      {
        name: "WDYTE",
      },
      {
        name: "WARR",
      },
    ],
  },
  {
    name: "Weatherboard Hill",
    variations: [
      {
        name: "WEAT",
      },
    ],
  },
  {
    name: "Wehla",
    variations: [
      {
        name: "WEHL",
      },
      {
        name: "WE HL",
      },
    ],
  },
  {
    name: "Wellington",
    variations: [
      {
        name: "WELL",
      },
    ],
  },
  {
    name: "Wellington Gully",
    variations: [
      {
        name: "WELLTN GY",
      },
      {
        name: "WELTON G",
      },
    ],
  },
  {
    name: "Welshman's Reef",
    variations: [
      {
        name: "WELS",
      },
      {
        name: "WELSH",
      },
      {
        name: "WELSHMS",
      },
    ],
  },
  {
    name: "Wendouree",
    variations: [
      {
        name: "WEND",
      },
    ],
  },
  {
    name: "Wensleydale",
    variations: [
      {
        name: "WENS",
      },
    ],
  },
  {
    name: "Western Port",
    variations: [
      {
        name: "WEST",
      },
      {
        name: "WESTERN P",
      },
      {
        name: "WESTN PORT",
      },
      {
        name: "WST PORT",
      },
      {
        name: "WESTERN PO",
      },
    ],
  },
  {
    name: "County Wexford Ireland",
    variations: [
      {
        name: "WEXF",
      },
    ],
  },
  {
    name: "Warragul",
    variations: [
      {
        name: "WGUL",
      },
      {
        name: "WARR",
      },
      {
        name: "WA RR",
      },
      {
        name: "WGAL",
      },
      {
        name: "W GUL",
      },
      {
        name: "WGULL",
      },
    ],
  },
  {
    name: "White Hills (Bendigo)",
    variations: [
      {
        name: "WH H",
      },
      {
        name: "WH IT",
      },
      {
        name: "WHILLS",
      },
      {
        name: "WHITE",
      },
      {
        name: "WHITE H",
      },
    ],
  },
  {
    name: "Wharparilla",
    variations: [
      {
        name: "WHAR",
      },
      {
        name: "WH AR",
      },
    ],
  },
  {
    name: "Wheat Land",
    variations: [
      {
        name: "WHEA",
      },
    ],
  },
  {
    name: "Warrenheip",
    variations: [
      {
        name: "WHEIP",
      },
      {
        name: "MARR",
      },
      {
        name: "WARR",
      },
      {
        name: "WA RR",
      },
      {
        name: "WARREN",
      },
      {
        name: "WHEI",
      },
      {
        name: "W HEIP",
      },
      {
        name: "WHELP",
      },
      {
        name: "WORR",
      },
    ],
  },
  {
    name: "Whipstick Diggings",
    variations: [
      {
        name: "WHIP",
      },
      {
        name: "WSTICK DG",
      },
    ],
  },
  {
    name: "Whittlesea",
    variations: [
      {
        name: "WHIT",
      },
      {
        name: "WHITSEA",
      },
      {
        name: "WHSEA",
      },
      {
        name: "WSEA",
      },
    ],
  },
  {
    name: "Whorouly",
    variations: [
      {
        name: "WHOR",
      },
      {
        name: "WH OR",
      },
    ],
  },
  {
    name: "Whroo",
    variations: [
      {
        name: "WHRO",
      },
      {
        name: "WHOO",
      },
      {
        name: "WH RO",
      },
    ],
  },
  {
    name: "Wickliffe Road",
    variations: [
      {
        name: "WICK",
      },
      {
        name: "WLIFFE RD",
      },
      {
        name: "WLIFFE ROAD",
      },
    ],
  },
  {
    name: "Wilderness",
    variations: [
      {
        name: "WILD",
      },
      {
        name: "WILDERNESS",
      },
    ],
  },
  {
    name: "Williamstown",
    variations: [
      {
        name: "WILL",
      },
      {
        name: "WILLMTOWN",
      },
      {
        name: "WILLSTOWN",
      },
      {
        name: "WILLTN",
      },
      {
        name: "WILS",
      },
      {
        name: "WM TOWN",
      },
      {
        name: "WMS TOWN",
      },
      {
        name: "WTOWN",
      },
      {
        name: "CTOWN",
      },
      {
        name: "MILL",
      },
      {
        name: "WIL",
      },
      {
        name: "WILI",
      },
      {
        name: "WI LL",
      },
      {
        name: "WILLIAMSTO",
      },
      {
        name: "WILLMSTOWN",
      },
      {
        name: "WILLTOWN",
      },
      {
        name: "WIL-M TOWN",
      },
      {
        name: "WINSTOWN",
      },
      {
        name: "WMNSTOWN",
      },
      {
        name: "WMSMTOWN",
      },
      {
        name: "WMS TN",
      },
      {
        name: "WM STOWN",
      },
      {
        name: "WSTOWN",
      },
      {
        name: "W TOWN",
      },
      {
        name: "WTTOWN",
      },
      {
        name: "WM TN",
      },
      {
        name: "WMTOWN",
      },
      {
        name: "WTON",
      },
    ],
  },
  {
    name: "Willowmavin",
    variations: [
      {
        name: "WILLO MAVI",
      },
      {
        name: "WILLOWHAVI",
      },
      {
        name: "WILLOW-M",
      },
      {
        name: "WILLOWMAVN",
      },
      {
        name: "WILL",
      },
    ],
  },
  {
    name: "Wimmera",
    variations: [
      {
        name: "WIMM",
      },
      {
        name: "WI MM",
      },
    ],
  },
  {
    name: "Winchelsea",
    variations: [
      {
        name: "WINC",
      },
      {
        name: "WINSEA",
      },
      {
        name: "W'SEA",
      },
      {
        name: "WI NC",
      },
      {
        name: "WSEA",
      },
    ],
  },
  {
    name: "Windsor Engl",
    variations: [
      {
        name: "WIND",
      },
    ],
  },
  {
    name: "Winslow",
    variations: [
      {
        name: "WINS",
      },
      {
        name: "WI NS",
      },
    ],
  },
  {
    name: "Winter's Flat",
    variations: [
      {
        name: "WINT",
      },
    ],
  },
  {
    name: "Witchipool",
    variations: [
      {
        name: "WITCHIPOO",
      },
    ],
  },
  {
    name: "Woady Yalloak Creek",
    variations: [
      {
        name: "WOAD",
      },
      {
        name: "WOADY YALL",
      },
    ],
  },
  {
    name: "Wodonga",
    variations: [
      {
        name: "WODO",
      },
      {
        name: "WO DO",
      },
      {
        name: "WO OD",
      },
      {
        name: "WONGA",
      },
    ],
  },
  {
    name: "Wombat Creek (4)",
    variations: [
      {
        name: "WOMB",
      },
      {
        name: "WOMBAT",
      },
    ],
  },
  {
    name: "Wonwanda",
    variations: [
      {
        name: "WONW",
      },
    ],
  },
  {
    name: "Woodlands",
    variations: [
      {
        name: "WOOD",
      },
    ],
  },
  {
    name: "Woolsthorpe",
    variations: [
      {
        name: "WOOL",
      },
      {
        name: "WOOLSTHOR",
      },
      {
        name: "WO OL",
      },
    ],
  },
  {
    name: "Wooragee",
    variations: [
      {
        name: "WOOR",
      },
    ],
  },
  {
    name: "Woori Yalloak",
    variations: [
      {
        name: "WOORAK",
      },
    ],
  },
  {
    name: "Woranga",
    variations: [
      {
        name: "WORA",
      },
    ],
  },
  {
    name: "Wurdiboluc",
    variations: [
      {
        name: "WORD",
      },
      {
        name: "WURD",
      },
      {
        name: "WURDEE BOL",
      },
      {
        name: "WBOLNE",
      },
    ],
  },
  {
    name: "Wormbete Creek",
    variations: [
      {
        name: "WORM",
      },
    ],
  },
  {
    name: "Wycheproof",
    variations: [
      {
        name: "WPROOF",
      },
      {
        name: "UYCH",
      },
      {
        name: "WYCH",
      },
      {
        name: "WY CH",
      },
      {
        name: "WYCHEPRF",
      },
    ],
  },
  {
    name: "Windsor",
    variations: [
      {
        name: "WSOR",
      },
      {
        name: "WDSOR",
      },
      {
        name: "WIND",
      },
    ],
  },
  {
    name: "Wychetella",
    variations: [
      {
        name: "WYCH",
      },
      {
        name: "WYCHETILLA",
      },
    ],
  },
  {
    name: "Wyndham",
    variations: [
      {
        name: "WYND",
      },
    ],
  },
  {
    name: "Wyuna",
    variations: [
      {
        name: "WYUN",
      },
      {
        name: "WY UN",
      },
    ],
  },
  {
    name: "Yarra Glen",
    variations: [
      {
        name: "Y GLEN",
      },
      {
        name: "YARR",
      },
      {
        name: "YA RR",
      },
      {
        name: "YGLEN",
      },
    ],
  },
  {
    name: "Yackandandah",
    variations: [
      {
        name: "YACK",
      },
      {
        name: "YACKANDAH",
      },
      {
        name: "YACKANDAND",
      },
      {
        name: "YDAH",
      },
      {
        name: "YDANDAH",
      },
      {
        name: "GACK",
      },
      {
        name: "YA CK",
      },
      {
        name: "Y DANDAH",
      },
    ],
  },
  {
    name: "Yalloak",
    variations: [
      {
        name: "YALL",
      },
      {
        name: "YALLO",
      },
    ],
  },
  {
    name: "Yambuk",
    variations: [
      {
        name: "YAM",
      },
      {
        name: "YAMB",
      },
      {
        name: "YA MB",
      },
    ],
  },
  {
    name: "Yandoit",
    variations: [
      {
        name: "YAND",
      },
      {
        name: "YA ND",
      },
    ],
  },
  {
    name: "Yangery Creek",
    variations: [
      {
        name: "YANG",
      },
    ],
  },
  {
    name: "Yan Yean",
    variations: [
      {
        name: "YANY",
      },
      {
        name: "YAN",
      },
      {
        name: "YA NY",
      },
    ],
  },
  {
    name: "Yapeen",
    variations: [
      {
        name: "YAPE",
      },
      {
        name: "YA PE",
      },
    ],
  },
  {
    name: "Yarpturk",
    variations: [
      {
        name: "YARP",
      },
      {
        name: "YA RP",
      },
    ],
  },
  {
    name: "Yarrum-Yarrum",
    variations: [
      {
        name: "YARR",
      },
      {
        name: "YARRA YARR",
      },
      {
        name: "YARRAM Y",
      },
      {
        name: "YARRAM YAR",
      },
      {
        name: "YARRUM YM",
      },
    ],
  },
  {
    name: "Yarra Bend",
    variations: [
      {
        name: "YARRA B",
      },
    ],
  },
  {
    name: "Yarra Flats",
    variations: [
      {
        name: "YARRA FL",
      },
      {
        name: "YARR",
      },
      {
        name: "YA RR",
      },
      {
        name: "YARRA F",
      },
      {
        name: "YARRA FLT",
      },
      {
        name: "YARRA FT",
      },
      {
        name: "YARRA FTS",
      },
    ],
  },
  {
    name: "Yarra Survey",
    variations: [
      {
        name: "YARRA SURV",
      },
    ],
  },
  {
    name: "Yawong",
    variations: [
      {
        name: "YAWO",
      },
    ],
  },
  {
    name: "Yelima Creek",
    variations: [
      {
        name: "YELI",
      },
    ],
  },
  {
    name: "Yendon",
    variations: [
      {
        name: "YEND",
      },
    ],
  },
  {
    name: "Yering",
    variations: [
      {
        name: "YERI",
      },
    ],
  },
  {
    name: "Yielima",
    variations: [
      {
        name: "YIELI",
      },
      {
        name: "YIEL",
      },
      {
        name: "YI EL",
      },
      {
        name: "ZIEL",
      },
      {
        name: "ZIELIMA",
      },
    ],
  },
  {
    name: "Yarrawonga",
    variations: [
      {
        name: "YONGA",
      },
      {
        name: "YWONGA",
      },
      {
        name: "YARR",
      },
      {
        name: "YA RR",
      },
      {
        name: "YARRAGA",
      },
      {
        name: "YAWONGA",
      },
      {
        name: "YWNGA",
      },
      {
        name: "ZARR",
      },
    ],
  },
  {
    name: "Youarang",
    variations: [
      {
        name: "YOUA",
      },
      {
        name: "TOVARANG",
      },
      {
        name: "YO UA",
      },
      {
        name: "YUNG",
      },
    ],
  },
  {
    name: "You-Yangs",
    variations: [
      {
        name: "YOUANGS",
      },
    ],
  },
  {
    name: "Yowen Hill",
    variations: [
      {
        name: "YOWE",
      },
    ],
  },
  {
    name: "Yuppeckiar Creek",
    variations: [
      {
        name: "YUPP",
      },
    ],
  },
  {
    name: "Yarraville",
    variations: [
      {
        name: "YVILLE",
      },
      {
        name: "YARR",
      },
    ],
  },
  {
    name: "1st White Hill (Encampment)",
    variations: [
      {
        name: "1ST WHITE",
      },
      {
        name: "1ST WHITEH",
      },
      {
        name: "1ST W HILL",
      },
      {
        name: "1ST WHIT H",
      },
      {
        name: "1ST WHT HL",
      },
      {
        name: "1 WHITE H",
      },
      {
        name: "1 WHITE HI",
      },
      {
        name: "FIRST WHITE HILL",
      },
      {
        name: "FIRST WT HILL",
      },
    ],
  },
  {
    name: "One Tree Hill",
    variations: [
      {
        name: "1 TREE HIL",
      },
    ],
  },
  {
    name: "12 North Wharf",
    variations: [
      {
        name: "12 N WHARF",
      },
    ],
  },
  {
    name: "Twofold Bay",
    variations: [
      {
        name: "2 FOLD BAY",
      },
    ],
  },
  {
    name: "2nd White Hill (Encampment)",
    variations: [
      {
        name: "2ND WHITE",
      },
      {
        name: "SECOND WHITE HILL",
      },
    ],
  },
  {
    name: "3rd White Hill (Encampment)",
    variations: [
      {
        name: "3RD W HILL",
      },
      {
        name: "3RD WHITE",
      },
      {
        name: "3RD WHTE H",
      },
      {
        name: "3RD WHT HL",
      },
      {
        name: "THIRD WHITE HILL",
      },
    ],
  },
  {
    name: "4th White Hill (Encampment)",
    variations: [
      {
        name: "4TH W HILL",
      },
      {
        name: "4TH WHITE",
      },
      {
        name: "4TH WHT HL",
      },
      {
        name: "FOURTH WHITE HILL",
      },
    ],
  },
  {
    name: "Five Mile Creek",
    variations: [
      {
        name: "5 ML CK",
      },
      {
        name: "FIVE MILE",
      },
    ],
  },
  {
    name: "5th White Hill (Encampment)",
    variations: [
      {
        name: "5TH W HILL",
      },
      {
        name: "5TH WHITE",
      },
      {
        name: "FIFTH WHITE HILL",
      },
      {
        name: "STH WHT HL",
      },
    ],
  },
  {
    name: "7th White Hill (Encampment)",
    variations: [
      {
        name: "7TH WHITE",
      },
      {
        name: "7TH WHTE H",
      },
      {
        name: "7TH WHT HL",
      },
      {
        name: "7 WHITE H",
      },
      {
        name: "7 WHITE HL",
      },
      {
        name: "SEVENTH WHITE HILL",
      },
      {
        name: "SEVEN W HI",
      },
    ],
  },
  {
    name: "Asylum? Ballarat",
    variations: [
      {
        name: "A BALLT",
      },
    ],
  },
  {
    name: "Abbeyard",
    variations: [
      {
        name: "ABBE",
      },
    ],
  },
  {
    name: "Aberfeldie",
    variations: [
      {
        name: "ABER",
      },
    ],
  },
  {
    name: "Aberfeldy",
    variations: [
      {
        name: "ABER",
      },
      {
        name: "AB ER",
      },
    ],
  },
  {
    name: "Aberfeldy River",
    variations: [
      {
        name: "ABER",
      },
    ],
  },
  {
    name: "Acheron",
    variations: [
      {
        name: "ACHE",
      },
      {
        name: "AC HE",
      },
    ],
  },
  {
    name: "Adams Flat",
    variations: [
      {
        name: "ADAMS FLT",
      },
    ],
  },
  {
    name: "???",
    variations: [
      {
        name: "ADEL",
      },
      {
        name: "BO RA",
      },
      {
        name: "BOURNE FST",
      },
      {
        name: "CDON",
      },
      {
        name: "FIER",
      },
      {
        name: "NAR",
      },
      {
        name: "OCEA",
      },
      {
        name: "PRIN",
      },
      {
        name: "PURA",
      },
      {
        name: "SPRE",
      },
      {
        name: "STAL",
      },
      {
        name: "YA NA",
      },
    ],
  },
  {
    name: "HMC Adelaide (Customs)",
    variations: [
      {
        name: "ADEL",
      },
    ],
  },
  {
    name: "Agnes",
    variations: [
      {
        name: "AGNE",
      },
    ],
  },
  {
    name: "Aireys Inlet",
    variations: [
      {
        name: "AIRE",
      },
    ],
  },
  {
    name: "Airport West",
    variations: [
      {
        name: "AIRP",
      },
    ],
  },
  {
    name: "Aitkens Gap",
    variations: [
      {
        name: "AITK",
      },
    ],
  },
  {
    name: "Alamein",
    variations: [
      {
        name: "ALAM",
      },
    ],
  },
  {
    name: "Albacutya",
    variations: [
      {
        name: "ALBA",
      },
    ],
  },
  {
    name: "Alfred Hospital",
    variations: [
      {
        name: "ALF H",
      },
      {
        name: "ALF HOSP",
      },
      {
        name: "ALFD HOSP",
      },
    ],
  },
  {
    name: "Allambee",
    variations: [
      {
        name: "ALLA",
      },
    ],
  },
  {
    name: "Allandale",
    variations: [
      {
        name: "ALLA",
      },
      {
        name: "AL LA",
      },
    ],
  },
  {
    name: "Allans Forest",
    variations: [
      {
        name: "ALLANS FOR",
      },
    ],
  },
  {
    name: "Allestree",
    variations: [
      {
        name: "ALLE",
      },
    ],
  },
  {
    name: "Alma",
    variations: [
      {
        name: "ALMA",
      },
    ],
  },
  {
    name: "Almonds",
    variations: [
      {
        name: "ALMO",
      },
      {
        name: "AL MO",
      },
    ],
  },
  {
    name: "Almurta",
    variations: [
      {
        name: "ALMU",
      },
    ],
  },
  {
    name: "Altona",
    variations: [
      {
        name: "ALTO",
      },
    ],
  },
  {
    name: "Altona Meadows",
    variations: [
      {
        name: "ALTO",
      },
    ],
  },
  {
    name: "Altona North",
    variations: [
      {
        name: "ALTO",
      },
    ],
  },
  {
    name: "Alvie",
    variations: [
      {
        name: "ALVI",
      },
    ],
  },
  {
    name: "American Gully",
    variations: [
      {
        name: "AMER",
      },
      {
        name: "AMERICA GU",
      },
      {
        name: "AMERICAN G",
      },
      {
        name: "AMERN GLY",
      },
    ],
  },
  {
    name: "American Gully Bendigo",
    variations: [
      {
        name: "AMERICAN GY BGO",
      },
    ],
  },
  {
    name: "Amherst Hospital",
    variations: [
      {
        name: "AMHERST HO",
      },
      {
        name: "AMHERST HOSP",
      },
    ],
  },
  {
    name: "Ancona",
    variations: [
      {
        name: "ANCO",
      },
    ],
  },
  {
    name: "Anderson",
    variations: [
      {
        name: "ANDE",
      },
    ],
  },
  {
    name: "Anderson's Creek",
    variations: [
      {
        name: "ANDE",
      },
      {
        name: "AN DE",
      },
      {
        name: "ANDERSON C",
      },
      {
        name: "ANDERSON CK",
      },
      {
        name: "ANDERSON CRK",
      },
      {
        name: "ANDERSONS CK",
      },
      {
        name: "ANDERSONS CRK",
      },
    ],
  },
  {
    name: "Andersons Inlet",
    variations: [
      {
        name: "ANDE",
      },
    ],
  },
  {
    name: "Anglesea",
    variations: [
      {
        name: "ANGL",
      },
    ],
  },
  {
    name: "Annuello",
    variations: [
      {
        name: "ANNU",
      },
    ],
  },
  {
    name: "Antwerp",
    variations: [
      {
        name: "ANTW",
      },
    ],
  },
  {
    name: "Albert Park Convent",
    variations: [
      {
        name: "A P CONVENT",
      },
    ],
  },
  {
    name: "Appin",
    variations: [
      {
        name: "APPI",
      },
    ],
  },
  {
    name: "Appin South",
    variations: [
      {
        name: "APPI",
      },
    ],
  },
  {
    name: "??? Melbourne",
    variations: [
      {
        name: "AP PI",
      },
    ],
  },
  {
    name: "Arapiles",
    variations: [
      {
        name: "ARAP",
      },
    ],
  },
  {
    name: "Ardpatrick Run",
    variations: [
      {
        name: "ARAP",
      },
    ],
  },
  {
    name: "Ararat Hospital",
    variations: [
      {
        name: "ARARATHOSP",
      },
      {
        name: "ARAT H",
      },
      {
        name: "ARAT HOS",
      },
      {
        name: "ARAT HOSP",
      },
      {
        name: "A RAT HOSP",
      },
      {
        name: "ARAT HOSPTL",
      },
    ],
  },
  {
    name: "Ararat Lunatic Asylum",
    variations: [
      {
        name: "ARARAT L A",
      },
      {
        name: "ARAT L A",
      },
      {
        name: "A RAT L A",
      },
      {
        name: "AR AT L A",
      },
    ],
  },
  {
    name: "Arawata",
    variations: [
      {
        name: "ARAW",
      },
    ],
  },
  {
    name: "Archdale",
    variations: [
      {
        name: "ARCH",
      },
    ],
  },
  {
    name: "Archerton",
    variations: [
      {
        name: "ARCH",
      },
    ],
  },
  {
    name: "Archies Creek",
    variations: [
      {
        name: "ARCH",
      },
    ],
  },
  {
    name: "Ardeer",
    variations: [
      {
        name: "ARDE",
      },
    ],
  },
  {
    name: "Ardmona",
    variations: [
      {
        name: "ARDM",
      },
    ],
  },
  {
    name: "Ardno Station",
    variations: [
      {
        name: "ARDN",
      },
    ],
  },
  {
    name: "Areegra",
    variations: [
      {
        name: "AREE",
      },
    ],
  },
  {
    name: "Argyle",
    variations: [
      {
        name: "ARGY",
      },
    ],
  },
  {
    name: "Armstrong",
    variations: [
      {
        name: "ARMS",
      },
      {
        name: "AR MS",
      },
    ],
  },
  {
    name: "Armstrong's Diggings",
    variations: [
      {
        name: "ARMSTG DG",
      },
      {
        name: "ARMSTRG DG",
      },
      {
        name: "ARMSTRONG",
      },
      {
        name: "ARMSTRONGS",
      },
      {
        name: "ASTRONG S",
      },
    ],
  },
  {
    name: "Arnold",
    variations: [
      {
        name: "ARNO",
      },
    ],
  },
  {
    name: "Arnolds Bridge",
    variations: [
      {
        name: "ARNOLDS BRIDGE",
      },
    ],
  },
  {
    name: "Arnolds Gully",
    variations: [
      {
        name: "ARNOLDS GY",
      },
    ],
  },
  {
    name: "Arrandoovong Creek",
    variations: [
      {
        name: "ARANDOOVON",
      },
      {
        name: "ARRA",
      },
    ],
  },
  {
    name: "Arthurs Creek",
    variations: [
      {
        name: "ARTH",
      },
    ],
  },
  {
    name: "Ascot",
    variations: [
      {
        name: "ASCO",
      },
    ],
  },
  {
    name: "Ashbourne",
    variations: [
      {
        name: "ASHB",
      },
    ],
  },
  {
    name: "Ashwood",
    variations: [
      {
        name: "ASHW",
      },
    ],
  },
  {
    name: "Aspendale",
    variations: [
      {
        name: "ASPE",
      },
      {
        name: "AS PE",
      },
    ],
  },
  {
    name: "Aspley",
    variations: [
      {
        name: "ASPL",
      },
    ],
  },
  {
    name: "Ashens Station",
    variations: [
      {
        name: "ASTRENS ST",
      },
    ],
  },
  {
    name: "Asylum Ballarat",
    variations: [
      {
        name: "ASY BALLT",
      },
      {
        name: "ASYL BALLT",
      },
    ],
  },
  {
    name: "Asylum Bendigo",
    variations: [
      {
        name: "ASY BEN",
      },
    ],
  },
  {
    name: "Asylum Beechworth",
    variations: [
      {
        name: "ASY BWORTH",
      },
    ],
  },
  {
    name: "Athlone",
    variations: [
      {
        name: "ATHL",
      },
    ],
  },
  {
    name: "Atkins Creek???",
    variations: [
      {
        name: "ATKI",
      },
    ],
  },
  {
    name: "At Sea",
    variations: [
      {
        name: "ATSEA",
      },
      {
        name: "AT SEA",
      },
      {
        name: "SEA",
      },
    ],
  },
  {
    name: "Aubrey",
    variations: [
      {
        name: "AUBR",
      },
    ],
  },
  {
    name: "Avalon",
    variations: [
      {
        name: "AVAL",
      },
    ],
  },
  {
    name: "Avoca Forest Station or Run",
    variations: [
      {
        name: "AVOCA FORE",
      },
      {
        name: "AVOCA FORS",
      },
    ],
  },
  {
    name: "Avoca River",
    variations: [
      {
        name: "AVOCA R",
      },
      {
        name: "AVOCA RIV",
      },
      {
        name: "AVOCA RIVR",
      },
      {
        name: "AVOCA RVR",
      },
    ],
  },
  {
    name: "Avondale Heights",
    variations: [
      {
        name: "AVON",
      },
    ],
  },
  {
    name: "Avon Plains",
    variations: [
      {
        name: "AVON",
      },
      {
        name: "AV ON",
      },
    ],
  },
  {
    name: "Avonsleigh",
    variations: [
      {
        name: "AVON",
      },
    ],
  },
  {
    name: "Axe Creek",
    variations: [
      {
        name: "AXE",
      },
      {
        name: "AXEC (1)",
      },
      {
        name: "AXEC (2)",
      },
    ],
  },
  {
    name: "Ayrford",
    variations: [
      {
        name: "AYRF",
      },
    ],
  },
  {
    name: "Back Creek",
    variations: [
      {
        name: "BACK",
      },
      {
        name: "BA CK",
      },
    ],
  },
  {
    name: "Back Creek Station",
    variations: [
      {
        name: "BACK CK ST",
      },
    ],
  },
  {
    name: "Baddaginnie",
    variations: [
      {
        name: "BADD",
      },
      {
        name: "BA DD",
      },
    ],
  },
  {
    name: "Badger Creek",
    variations: [
      {
        name: "BADG",
      },
    ],
  },
  {
    name: "Bael Bael",
    variations: [
      {
        name: "BAEL",
      },
      {
        name: "BEACH BEAL",
      },
    ],
  },
  {
    name: "Bahgallah",
    variations: [
      {
        name: "BAHG",
      },
    ],
  },
  {
    name: "Bailieston",
    variations: [
      {
        name: "BAIL",
      },
      {
        name: "BA IL",
      },
    ],
  },
  {
    name: "Bairnsdale Hospital",
    variations: [
      {
        name: "BAIRNSDALE HOSP",
      },
      {
        name: "BDALE HOSP",
      },
    ],
  },
  {
    name: "Bald Hills",
    variations: [
      {
        name: "BALD",
      },
      {
        name: "BA LD",
      },
    ],
  },
  {
    name: "Balintore",
    variations: [
      {
        name: "BALI",
      },
    ],
  },
  {
    name: "Ballarat Benevolent Asylum",
    variations: [
      {
        name: "BALLARAT B A",
      },
      {
        name: "BALL B A",
      },
      {
        name: "BALLT B A",
      },
      {
        name: "BALLT B AS",
      },
      {
        name: "BALLT B ASY",
      },
      {
        name: "BALL T B ASY",
      },
      {
        name: "BALLT BEN",
      },
      {
        name: "BALLT BENASY",
      },
      {
        name: "BALLT BEN ASY",
      },
      {
        name: "BALLT BEN ASYL",
      },
      {
        name: "BALLT BEN ASYLM",
      },
      {
        name: "BALLT BEN ASYLUM",
      },
      {
        name: "BALLT BEN AYLM",
      },
      {
        name: "BALLT BENE",
      },
      {
        name: "BALLT BENT",
      },
      {
        name: "BALLT BENT ASY",
      },
      {
        name: "BRAT B A",
      },
    ],
  },
  {
    name: "Ballarat Lunatic Asylum",
    variations: [
      {
        name: "BALLARAT L A",
      },
      {
        name: "BALLT L A",
      },
    ],
  },
  {
    name: "Ballarat Hospital",
    variations: [
      {
        name: "BALLHOSP",
      },
      {
        name: "BALL HOSP",
      },
      {
        name: "BALLT HOSP",
      },
      {
        name: "BALT HOSP",
      },
      {
        name: "B HOSP",
      },
      {
        name: "BRAT HOSP",
      },
    ],
  },
  {
    name: "Ballarat West",
    variations: [
      {
        name: "BALLT W",
      },
      {
        name: "BRAT W",
      },
      {
        name: "BRAT WEST",
      },
    ],
  },
  {
    name: "Ballyrogan",
    variations: [
      {
        name: "BALLY",
      },
    ],
  },
  {
    name: "Ballyshannassy",
    variations: [
      {
        name: "BALLY",
      },
      {
        name: "BALLYSHAN",
      },
      {
        name: "BALLYSHANA",
      },
      {
        name: "BSHANNASSY",
      },
    ],
  },
  {
    name: "Balmattum",
    variations: [
      {
        name: "BALM",
      },
    ],
  },
  {
    name: "Balnarring Beach",
    variations: [
      {
        name: "BALN",
      },
    ],
  },
  {
    name: "Balook",
    variations: [
      {
        name: "BALO",
      },
    ],
  },
  {
    name: "Bunalong",
    variations: [
      {
        name: "BALONG",
      },
    ],
  },
  {
    name: "Balrootan North",
    variations: [
      {
        name: "BALR",
      },
    ],
  },
  {
    name: "Balwyn North",
    variations: [
      {
        name: "BALWYN N",
      },
    ],
  },
  {
    name: "Bamawm",
    variations: [
      {
        name: "BAMA",
      },
      {
        name: "BA MA",
      },
    ],
  },
  {
    name: "Bambra",
    variations: [
      {
        name: "BAMB",
      },
    ],
  },
  {
    name: "Bandiana",
    variations: [
      {
        name: "BAND",
      },
    ],
  },
  {
    name: "Bangerang",
    variations: [
      {
        name: "BANG",
      },
    ],
  },
  {
    name: "Bangholme",
    variations: [
      {
        name: "BANG",
      },
    ],
  },
  {
    name: "Banksia Street",
    variations: [
      {
        name: "BANK",
      },
    ],
  },
  {
    name: "Bank Of Yarra",
    variations: [
      {
        name: "BANK OF YA",
      },
    ],
  },
  {
    name: "Bannerton",
    variations: [
      {
        name: "BANN",
      },
    ],
  },
  {
    name: "Bannockburn",
    variations: [
      {
        name: "BANN",
      },
    ],
  },
  {
    name: "Banyena",
    variations: [
      {
        name: "BANY",
      },
      {
        name: "BA NY",
      },
    ],
  },
  {
    name: "Baranduda",
    variations: [
      {
        name: "BARA",
      },
    ],
  },
  {
    name: "Barjarg",
    variations: [
      {
        name: "BARJ",
      },
    ],
  },
  {
    name: "Barkers Creek",
    variations: [
      {
        name: "BARK",
      },
    ],
  },
  {
    name: "Barmah",
    variations: [
      {
        name: "BARM",
      },
    ],
  },
  {
    name: "Barnawartha North",
    variations: [
      {
        name: "BARN",
      },
    ],
  },
  {
    name: "Barnawartha South",
    variations: [
      {
        name: "BARN",
      },
    ],
  },
  {
    name: "Barongarook",
    variations: [
      {
        name: "BARO",
      },
    ],
  },
  {
    name: "Barongarook West",
    variations: [
      {
        name: "BARO",
      },
    ],
  },
  {
    name: "Barrabool",
    variations: [
      {
        name: "BARR",
      },
      {
        name: "BA RR",
      },
    ],
  },
  {
    name: "Barrakee",
    variations: [
      {
        name: "BARR",
      },
    ],
  },
  {
    name: "Barramunga",
    variations: [
      {
        name: "BARR",
      },
      {
        name: "BMUJNGA",
      },
      {
        name: "BMUNGA",
      },
    ],
  },
  {
    name: "Barraport",
    variations: [
      {
        name: "BARR",
      },
      {
        name: "BA RR",
      },
    ],
  },
  {
    name: "Barrys Reef",
    variations: [
      {
        name: "BARR",
      },
      {
        name: "BA RR",
      },
      {
        name: "BARRYS REE",
      },
    ],
  },
  {
    name: "Barwidgee",
    variations: [
      {
        name: "BARW",
      },
    ],
  },
  {
    name: "Barwite",
    variations: [
      {
        name: "BARW",
      },
    ],
  },
  {
    name: "Barwo",
    variations: [
      {
        name: "BARW",
      },
      {
        name: "BA RW",
      },
      {
        name: "BARWO",
      },
    ],
  },
  {
    name: "Barwon Downs",
    variations: [
      {
        name: "BARW",
      },
    ],
  },
  {
    name: "Benevolent Asylum Ballarat",
    variations: [
      {
        name: "B AS BALLT",
      },
    ],
  },
  {
    name: "Bass",
    variations: [
      {
        name: "BASS",
      },
      {
        name: "BA SS",
      },
    ],
  },
  {
    name: "Batman",
    variations: [
      {
        name: "BATM",
      },
    ],
  },
  {
    name: "Baxter",
    variations: [
      {
        name: "BAXT",
      },
    ],
  },
  {
    name: "Bayindeen",
    variations: [
      {
        name: "BAYI",
      },
    ],
  },
  {
    name: "Bayswater",
    variations: [
      {
        name: "BAYS",
      },
    ],
  },
  {
    name: "Bayswater North",
    variations: [
      {
        name: "BAYS",
      },
    ],
  },
  {
    name: "??? Mystery Place",
    variations: [
      {
        name: "BAYS",
      },
      {
        name: "BA YS",
      },
    ],
  },
  {
    name: "Bridgewater on Loddon",
    variations: [
      {
        name: "BDGEWATER",
      },
      {
        name: "BRID",
      },
      {
        name: "BR ID",
      },
      {
        name: "BRIDGEWATE",
      },
      {
        name: "BRIDGEWTR",
      },
    ],
  },
  {
    name: "Bendigo Benevolent Asylum",
    variations: [
      {
        name: "BDGO BEN ASYL",
      },
      {
        name: "BENDIGO B A",
      },
      {
        name: "BGO B A",
      },
      {
        name: "B GO B A",
      },
    ],
  },
  {
    name: "Bendigo Hospital",
    variations: [
      {
        name: "BDGO HOSP",
      },
      {
        name: "BDO HOSP",
      },
      {
        name: "BENDIGO HOSP",
      },
      {
        name: "BGO HOS",
      },
      {
        name: "BGO HOSP",
      },
    ],
  },
  {
    name: "Beaconsfield",
    variations: [
      {
        name: "BEAC",
      },
      {
        name: "BEACC",
      },
      {
        name: "BFIELD",
      },
    ],
  },
  {
    name: "Beaconsfield South",
    variations: [
      {
        name: "BEAC",
      },
    ],
  },
  {
    name: "Beaconsfield Upper",
    variations: [
      {
        name: "BEAC",
      },
    ],
  },
  {
    name: "Beaconsfield North",
    variations: [
      {
        name: "BE AC",
      },
    ],
  },
  {
    name: "Bearii",
    variations: [
      {
        name: "BEAR",
      },
    ],
  },
  {
    name: "Bears Lagoon",
    variations: [
      {
        name: "BEAR",
      },
    ],
  },
  {
    name: "Beaumaris",
    variations: [
      {
        name: "BEAU",
      },
      {
        name: "BMAURIS",
      },
    ],
  },
  {
    name: "Beazleys Bridge",
    variations: [
      {
        name: "BEAZ",
      },
    ],
  },
  {
    name: "Mount Beckwith",
    variations: [
      {
        name: "BECKWITH",
      },
    ],
  },
  {
    name: "Beech Forest",
    variations: [
      {
        name: "BEEC",
      },
      {
        name: "BFOREST",
      },
      {
        name: "B FOREST",
      },
    ],
  },
  {
    name: "Beechworth Benevolent Asylum",
    variations: [
      {
        name: "BEECHWORTH B A",
      },
      {
        name: "BWORTH B A",
      },
    ],
  },
  {
    name: "Beechworth Lunatic Asylum",
    variations: [
      {
        name: "BEECHWORTH L A",
      },
      {
        name: "BWORH L A",
      },
      {
        name: "BWORTH L A",
      },
      {
        name: "B WORTH L A",
      },
    ],
  },
  {
    name: "Beenak",
    variations: [
      {
        name: "BEEN",
      },
    ],
  },
  {
    name: "Belgrave",
    variations: [
      {
        name: "BELG",
      },
    ],
  },
  {
    name: "Belgrave Heights",
    variations: [
      {
        name: "BELG",
      },
    ],
  },
  {
    name: "Belgrave South",
    variations: [
      {
        name: "BELG",
      },
    ],
  },
  {
    name: "Bellbrae",
    variations: [
      {
        name: "BELL",
      },
    ],
  },
  {
    name: "Bell Park",
    variations: [
      {
        name: "BELL",
      },
    ],
  },
  {
    name: "Bell Post Hill",
    variations: [
      {
        name: "BELL",
      },
    ],
  },
  {
    name: "Bemm River",
    variations: [
      {
        name: "BEMM",
      },
    ],
  },
  {
    name: "Benambra",
    variations: [
      {
        name: "BENA",
      },
    ],
  },
  {
    name: "Bendigo Flat",
    variations: [
      {
        name: "BENDIGO FT",
      },
    ],
  },
  {
    name: "Bengworden",
    variations: [
      {
        name: "BENG",
      },
    ],
  },
  {
    name: "Benjeroop",
    variations: [
      {
        name: "BENJ",
      },
    ],
  },
  {
    name: "Benloch",
    variations: [
      {
        name: "BENL",
      },
    ],
  },
  {
    name: "Bennettswood",
    variations: [
      {
        name: "BENN",
      },
    ],
  },
  {
    name: "Bentleigh East",
    variations: [
      {
        name: "BENT",
      },
    ],
  },
  {
    name: "Benwerrin",
    variations: [
      {
        name: "BENW",
      },
    ],
  },
  {
    name: "Beremboke",
    variations: [
      {
        name: "BERE",
      },
    ],
  },
  {
    name: "Berlin",
    variations: [
      {
        name: "BERL",
      },
      {
        name: "BE RL",
      },
    ],
  },
  {
    name: "Berrimal",
    variations: [
      {
        name: "BERR",
      },
    ],
  },
  {
    name: "Berringa",
    variations: [
      {
        name: "BERR",
      },
    ],
  },
  {
    name: "Berringama",
    variations: [
      {
        name: "BERR",
      },
    ],
  },
  {
    name: "Berriwillock",
    variations: [
      {
        name: "BERR",
      },
    ],
  },
  {
    name: "Berrybank",
    variations: [
      {
        name: "BERR",
      },
    ],
  },
  {
    name: "Berrys Creek",
    variations: [
      {
        name: "BERR",
      },
    ],
  },
  {
    name: "Berwick",
    variations: [
      {
        name: "BERW",
      },
      {
        name: "BE RW",
      },
    ],
  },
  {
    name: "Bessiebelle",
    variations: [
      {
        name: "BESS",
      },
    ],
  },
  {
    name: "Between Alphington and Fairfield",
    variations: [
      {
        name: "BET ALPGTH & FFIELD",
      },
    ],
  },
  {
    name: "Between Altona and Carton",
    variations: [
      {
        name: "BET ALTONA & CARL",
      },
    ],
  },
  {
    name: "Between Albert Park and Heidelberg",
    variations: [
      {
        name: "BET A PK & HBERG",
      },
    ],
  },
  {
    name: "Between Ascot Vale and Fitzroy",
    variations: [
      {
        name: "BET A VALE & FROY",
      },
    ],
  },
  {
    name: "Between Ascot Vale and Melbourne",
    variations: [
      {
        name: "BET A VALE & MELB",
      },
    ],
  },
  {
    name: "Between Broadford and Melbourne",
    variations: [
      {
        name: "BET BRFORD & MELB",
      },
    ],
  },
  {
    name: "Between Carlton and Fitzroy",
    variations: [
      {
        name: "BET CARL & FROY",
      },
      {
        name: "BTWN CARL & FROY",
      },
    ],
  },
  {
    name: "Between Campbellfield and Melbourne",
    variations: [
      {
        name: "BET CFIELD & MELB",
      },
    ],
  },
  {
    name: "Between Caulfield and Melbourne",
    variations: [
      {
        name: "BET CFLD & MELB",
      },
    ],
  },
  {
    name: "Between Cheltenham and Melbourne",
    variations: [
      {
        name: "BET CHELT & MELB",
      },
    ],
  },
  {
    name: "Between Clifton Hill and Fitzroy",
    variations: [
      {
        name: "BET CLIFTON HILL & FITZ",
      },
    ],
  },
  {
    name: "Between Diggers Rest and Parkville",
    variations: [
      {
        name: "BETDIGGERSREST&PVILLE",
      },
    ],
  },
  {
    name: "Between Dandenong and Melbounre",
    variations: [
      {
        name: "BET DNONG & MELB",
      },
    ],
  },
  {
    name: "Between Donald and Melbourne",
    variations: [
      {
        name: "BET DONALD & MELB",
      },
    ],
  },
  {
    name: "Between East Brunswick and Parkville",
    variations: [
      {
        name: "BET E BWICK & PVILLE",
      },
    ],
  },
  {
    name: "Between Elsternwick and Melbourne",
    variations: [
      {
        name: "BET ELST & MELB",
      },
    ],
  },
  {
    name: "Between Elsternwick and Ripponlea",
    variations: [
      {
        name: "BET ELST & RIPPLEA",
      },
    ],
  },
  {
    name: "Between East Malvern and Carlton",
    variations: [
      {
        name: "BET E MALV & CARLTON",
      },
    ],
  },
  {
    name: "Between East Melbourne and Melbounre",
    variations: [
      {
        name: "BET E MELB & MELB",
      },
    ],
  },
  {
    name: "Between Footscray and Carlton",
    variations: [
      {
        name: "BET FCRAY & CARL",
      },
    ],
  },
  {
    name: "Between Ferntree Gully and Melbourne",
    variations: [
      {
        name: "BET F T G & MELB",
      },
    ],
  },
  {
    name: "Between Heidelberg and Fitzroy",
    variations: [
      {
        name: "BET HBERG & FITZROY",
      },
      {
        name: "BET HEID & FITZ",
      },
    ],
  },
  {
    name: "Between Heidelberg and Melbourne",
    variations: [
      {
        name: "BET HBERG & MELB",
      },
    ],
  },
  {
    name: "(Between?) Highett Street Richmond",
    variations: [
      {
        name: "BET HIGHETT ST RMOND",
      },
    ],
  },
  {
    name: "Between Hawthorn and Fitzroy",
    variations: [
      {
        name: "BET HTHORN & FROY",
      },
    ],
  },
  {
    name: "Between Lilydale and Carlton",
    variations: [
      {
        name: "BET LDALE & CARL",
      },
    ],
  },
  {
    name: "Between Melbourne and Parkville",
    variations: [
      {
        name: "BET MELB & PVILLE",
      },
    ],
  },
  {
    name: "Between Melbourne and Richmond",
    variations: [
      {
        name: "BET MELB & RMOND",
      },
    ],
  },
  {
    name: "Between Melbourne and South Melbourne",
    variations: [
      {
        name: "BET MELB & SM",
      },
    ],
  },
  {
    name: "Between Malvern and Prahran",
    variations: [
      {
        name: "BET MLVN & PRAHRAN",
      },
    ],
  },
  {
    name: "Between Moe and Darling",
    variations: [
      {
        name: "BET MOE & DARLING",
      },
    ],
  },
  {
    name: "Between Mornington and Melbourne",
    variations: [
      {
        name: "BET MORNTON & MELB",
      },
    ],
  },
  {
    name: "Between Middle Park and Melbourne",
    variations: [
      {
        name: "BET M PARK & MELB",
      },
    ],
  },
  {
    name: "Between Northcote and Fitzroy",
    variations: [
      {
        name: "BET NCOTE & FITZROY",
      },
    ],
  },
  {
    name: "Between North Fitzroy and Parkville",
    variations: [
      {
        name: "BET N FITZ & PVILLE",
      },
    ],
  },
  {
    name: "Between Port Melbourne and Fitzroy",
    variations: [
      {
        name: "BET PT MELB & FROY",
      },
    ],
  },
  {
    name: "Between Reservoir and Fitzroy",
    variations: [
      {
        name: "BET RESERVOIR & FROY",
      },
    ],
  },
  {
    name: "Between Russell Street and Royal -",
    variations: [
      {
        name: "BETRUSSELLST&RMHPVLLE",
      },
    ],
  },
  {
    name: "Between Sandringham and Melbourne",
    variations: [
      {
        name: "BET SAND & MELB",
      },
    ],
  },
  {
    name: "Between Seymour and Melbourne",
    variations: [
      {
        name: "BET SEYMOUR & MELB",
      },
    ],
  },
  {
    name: "Between St Kilda and Melbourne",
    variations: [
      {
        name: "BET ST K & MELB",
      },
    ],
  },
  {
    name: "Between Thornbury and Melbourne",
    variations: [
      {
        name: "BET THBURY & MELB",
      },
    ],
  },
  {
    name: "Between Toorak and Melbourne",
    variations: [
      {
        name: "BET TOORAK & MELB",
      },
    ],
  },
  {
    name: "Between Upwey and Melbourne",
    variations: [
      {
        name: "BET UPWEY & MELB",
      },
    ],
  },
  {
    name: "Between Windsor and Melbourne",
    variations: [
      {
        name: "BET WINDSOR & MELB",
      },
    ],
  },
  {
    name: "Bet Bet",
    variations: [
      {
        name: "BETB",
      },
      {
        name: "BE TB",
      },
    ],
  },
  {
    name: "Bete Bolong",
    variations: [
      {
        name: "BETE",
      },
    ],
  },
  {
    name: "Between Bonbeach and Melbourne",
    variations: [
      {
        name: "BETN BONBCH & MELB",
      },
    ],
  },
  {
    name: "Between Dandenong and Melbourne",
    variations: [
      {
        name: "BETNDANDENONG&MELB",
      },
    ],
  },
  {
    name: "Between East Camberwell Prahran",
    variations: [
      {
        name: "BETN E CWELL PRN",
      },
    ],
  },
  {
    name: "Between East Malvern and Melbourne",
    variations: [
      {
        name: "BETNEMALVANDMELB",
      },
    ],
  },
  {
    name: "Between East Melbourne and Fitzroy",
    variations: [
      {
        name: "BETN E MELB & FROY",
      },
    ],
  },
  {
    name: "Between Hawthorne and Melbourne",
    variations: [
      {
        name: "BETN HAWTH AND MELB",
      },
    ],
  },
  {
    name: "Between Kensington and Parkville",
    variations: [
      {
        name: "BETN KENS & PVILLE",
      },
    ],
  },
  {
    name: "Between Winsor and Melbourne",
    variations: [
      {
        name: "BETN WINDSOR & MELB",
      },
    ],
  },
  {
    name: "Between Yarraville and Melbourne -",
    variations: [
      {
        name: "BETNYVILLE&MELBHOSP",
      },
    ],
  },
  {
    name: "Between Mornington and Frankston",
    variations: [
      {
        name: "BETW MORNGTON & FRANKS",
      },
    ],
  },
  {
    name: "Between South Yarra and Melbourne",
    variations: [
      {
        name: "BETW STH & MELB",
      },
    ],
  },
  {
    name: "Beulah",
    variations: [
      {
        name: "BEUL",
      },
      {
        name: "BE UL",
      },
    ],
  },
  {
    name: "Biggara",
    variations: [
      {
        name: "BIGG",
      },
    ],
  },
  {
    name: "Big Pats Creek",
    variations: [
      {
        name: "BIGP",
      },
    ],
  },
  {
    name: "Billabong",
    variations: [
      {
        name: "BILL",
      },
    ],
  },
  {
    name: "Dinah Flat",
    variations: [
      {
        name: "BINA",
      },
      {
        name: "DINA",
      },
    ],
  },
  {
    name: "Binginwarri",
    variations: [
      {
        name: "BING",
      },
    ],
  },
  {
    name: "Birch Hill",
    variations: [
      {
        name: "BIRC",
      },
    ],
  },
  {
    name: "Birchip",
    variations: [
      {
        name: "BIRC",
      },
    ],
  },
  {
    name: "Bittern",
    variations: [
      {
        name: "BITT",
      },
    ],
  },
  {
    name: "Black Mans Lead",
    variations: [
      {
        name: "BKMANS LD",
      },
      {
        name: "BK MANS LD",
      },
      {
        name: "BLAC",
      },
      {
        name: "BMANS LD",
      },
    ],
  },
  {
    name: "Black Rock",
    variations: [
      {
        name: "BK RK",
      },
      {
        name: "BK ROCK",
      },
      {
        name: "BLK PK",
      },
      {
        name: "BLK R",
      },
      {
        name: "BLK RCK",
      },
      {
        name: "BLK RK",
      },
      {
        name: "BLK ROCK",
      },
    ],
  },
  {
    name: "Black Swan (Ship)",
    variations: [
      {
        name: "BLAC",
      },
    ],
  },
  {
    name: "Black's Station",
    variations: [
      {
        name: "BLACK STN",
      },
      {
        name: "BLACKS STN",
      },
    ],
  },
  {
    name: "Blairgowrie",
    variations: [
      {
        name: "BLAI",
      },
    ],
  },
  {
    name: "Blampied",
    variations: [
      {
        name: "BLAM",
      },
    ],
  },
  {
    name: "Pleasant Creek",
    variations: [
      {
        name: "BLEA",
      },
      {
        name: "PL CK",
      },
      {
        name: "PLEA",
      },
      {
        name: "PL EA",
      },
      {
        name: "PLEAS",
      },
      {
        name: "PLEASANT C",
      },
      {
        name: "PLEAST CR",
      },
      {
        name: "PLSNT C",
      },
      {
        name: "PLSNT CK",
      },
      {
        name: "PLSNT CRK",
      },
      {
        name: "PLSNTCREEK",
      },
      {
        name: "PLST CK",
      },
    ],
  },
  {
    name: "Blackburn and Mitcham",
    variations: [
      {
        name: "BLK & MITCH",
      },
    ],
  },
  {
    name: "Blowhard",
    variations: [
      {
        name: "BLOW",
      },
    ],
  },
  {
    name: "Buninyong Station",
    variations: [
      {
        name: "BNONG STN",
      },
    ],
  },
  {
    name: "Bobinawarrah",
    variations: [
      {
        name: "BOBI",
      },
    ],
  },
  {
    name: "Break O'day",
    variations: [
      {
        name: "B O DAY",
      },
      {
        name: "BREA",
      },
      {
        name: "BR EA",
      },
      {
        name: "BREAK DAY",
      },
      {
        name: "BREAK ODA",
      },
      {
        name: "BREAK O DA",
      },
      {
        name: "BREAKODAY",
      },
      {
        name: "BREAK ODAY",
      },
      {
        name: "BREAK O DAY",
      },
      {
        name: "BREAK OF D",
      },
    ],
  },
  {
    name: "Boggy Creek",
    variations: [
      {
        name: "BOGG",
      },
      {
        name: "BO GG",
      },
      {
        name: "BOGGYCK",
      },
      {
        name: "BOGGY CK",
      },
      {
        name: "BOGGY CRK",
      },
    ],
  },
  {
    name: "Boggy Creek Road",
    variations: [
      {
        name: "BOGGY CRK",
      },
    ],
  },
  {
    name: "Boho",
    variations: [
      {
        name: "BOHO",
      },
    ],
  },
  {
    name: "Boho South",
    variations: [
      {
        name: "BOHO",
      },
    ],
  },
  {
    name: "Boigbeat",
    variations: [
      {
        name: "BOIG",
      },
    ],
  },
  {
    name: "Boinka",
    variations: [
      {
        name: "BOIN",
      },
    ],
  },
  {
    name: "Boisdale",
    variations: [
      {
        name: "BOIS",
      },
    ],
  },
  {
    name: "Lake Bolac",
    variations: [
      {
        name: "BOLA",
      },
      {
        name: "LAKE",
      },
      {
        name: "LA KE",
      },
      {
        name: "LK BOLAC",
      },
    ],
  },
  {
    name: "Bolinda Vale",
    variations: [
      {
        name: "BOLI",
      },
    ],
  },
  {
    name: "Bolton",
    variations: [
      {
        name: "BOLT",
      },
    ],
  },
  {
    name: "Bolwarrah",
    variations: [
      {
        name: "BOLW",
      },
      {
        name: "BO LW",
      },
    ],
  },
  {
    name: "Bona Vista",
    variations: [
      {
        name: "BONA",
      },
    ],
  },
  {
    name: "Bonbeach",
    variations: [
      {
        name: "BONB",
      },
    ],
  },
  {
    name: "Bonegilla",
    variations: [
      {
        name: "BONE",
      },
    ],
  },
  {
    name: "Bung Bong",
    variations: [
      {
        name: "BONG",
      },
      {
        name: "BUNG",
      },
      {
        name: "BU NG",
      },
    ],
  },
  {
    name: "Bungall Run",
    variations: [
      {
        name: "BONJ",
      },
    ],
  },
  {
    name: "Bonnie Doon",
    variations: [
      {
        name: "BONN",
      },
      {
        name: "BO NN",
      },
      {
        name: "DOON",
      },
    ],
  },
  {
    name: "Bookaar",
    variations: [
      {
        name: "BOOK",
      },
    ],
  },
  {
    name: "Boolarong",
    variations: [
      {
        name: "BOOL",
      },
    ],
  },
  {
    name: "Boolarra",
    variations: [
      {
        name: "BOOL",
      },
      {
        name: "BO OL",
      },
      {
        name: "GOOL",
      },
    ],
  },
  {
    name: "Boomahnoomoonah",
    variations: [
      {
        name: "BOOM",
      },
    ],
  },
  {
    name: "Boonah?",
    variations: [
      {
        name: "BOON",
      },
    ],
  },
  {
    name: "Boorcan",
    variations: [
      {
        name: "BOOR",
      },
    ],
  },
  {
    name: "Boorhaman",
    variations: [
      {
        name: "BOOR",
      },
      {
        name: "BO OR",
      },
    ],
  },
  {
    name: "Boorhaman North",
    variations: [
      {
        name: "BOOR",
      },
    ],
  },
  {
    name: "Booroolite",
    variations: [
      {
        name: "BOOR",
      },
    ],
  },
  {
    name: "Boort",
    variations: [
      {
        name: "BOOR",
      },
      {
        name: "BO OR",
      },
    ],
  },
  {
    name: "Boosey",
    variations: [
      {
        name: "BOOS",
      },
    ],
  },
  {
    name: "Boots Gully",
    variations: [
      {
        name: "BOOTS G",
      },
      {
        name: "BOOTS GLY",
      },
      {
        name: "BOOTS GUL",
      },
      {
        name: "BOOTS GY",
      },
    ],
  },
  {
    name: "Boralma",
    variations: [
      {
        name: "BORA",
      },
    ],
  },
  {
    name: "Boronia",
    variations: [
      {
        name: "BORO",
      },
    ],
  },
  {
    name: "Boroondarah",
    variations: [
      {
        name: "BORO",
      },
      {
        name: "BO RO",
      },
    ],
  },
  {
    name: "Borung",
    variations: [
      {
        name: "BORU",
      },
    ],
  },
  {
    name: "Bostocks Creek",
    variations: [
      {
        name: "BOST",
      },
    ],
  },
  {
    name: "Boundary Bend",
    variations: [
      {
        name: "BOUN",
      },
    ],
  },
  {
    name: "Boundary Creek",
    variations: [
      {
        name: "BOUN",
      },
      {
        name: "BOUNDARY C",
      },
    ],
  },
  {
    name: "Bourke",
    variations: [
      {
        name: "BOUR",
      },
      {
        name: "BOURKE",
      },
    ],
  },
  {
    name: "Bowenvale",
    variations: [
      {
        name: "BOWE",
      },
    ],
  },
  {
    name: "Boweya",
    variations: [
      {
        name: "BOWE",
      },
      {
        name: "BO WE",
      },
    ],
  },
  {
    name: "Bowmans Forest",
    variations: [
      {
        name: "BOWM",
      },
    ],
  },
  {
    name: "Box Hill North",
    variations: [
      {
        name: "BOX H N",
      },
    ],
  },
  {
    name: "Box Hill South",
    variations: [
      {
        name: "BOX H S",
      },
    ],
  },
  {
    name: "Boxwood",
    variations: [
      {
        name: "BOXW",
      },
    ],
  },
  {
    name: "Bradvale",
    variations: [
      {
        name: "BRAD",
      },
    ],
  },
  {
    name: "Braeside",
    variations: [
      {
        name: "BRAE",
      },
    ],
  },
  {
    name: "Ballarat Hill",
    variations: [
      {
        name: "BRAT HILL",
      },
    ],
  },
  {
    name: "Barrabool Hills",
    variations: [
      {
        name: "BRBOOL HLS",
      },
    ],
  },
  {
    name: "Breamlea",
    variations: [
      {
        name: "BREA",
      },
    ],
  },
  {
    name: "Bream Creek",
    variations: [
      {
        name: "BREAM CK",
      },
    ],
  },
  {
    name: "Brenanah",
    variations: [
      {
        name: "BREN",
      },
    ],
  },
  {
    name: "Briagolong",
    variations: [
      {
        name: "BRIA",
      },
      {
        name: "BR IA",
      },
    ],
  },
  {
    name: "Briar Hill",
    variations: [
      {
        name: "BRIA",
      },
    ],
  },
  {
    name: "Brickfields",
    variations: [
      {
        name: "BRIC",
      },
      {
        name: "BRICKFIELD",
      },
      {
        name: "BRICKFLDS",
      },
    ],
  },
  {
    name: "Bright",
    variations: [
      {
        name: "BRIG",
      },
      {
        name: "BR IG",
      },
    ],
  },
  {
    name: "Brim",
    variations: [
      {
        name: "BRIM",
      },
      {
        name: "BR IM",
      },
    ],
  },
  {
    name: "Brimin",
    variations: [
      {
        name: "BRIM",
      },
    ],
  },
  {
    name: "Brimpaen",
    variations: [
      {
        name: "BRIM",
      },
    ],
  },
  {
    name: "Brit Brit",
    variations: [
      {
        name: "BRIT",
      },
    ],
  },
  {
    name: "Brunswick Immigrants Home",
    variations: [
      {
        name: "BRNSWK IMM HOME",
      },
      {
        name: "BRSWE IMM HOUSE",
      },
      {
        name: "BRSWK IMM H",
      },
      {
        name: "BRS WK IMM H",
      },
      {
        name: "BRSWK IMM HO",
      },
      {
        name: "BRSWK IMM HOME",
      },
      {
        name: "BRSWK IMM HOUSE",
      },
      {
        name: "BRSWK IMMS HOME",
      },
      {
        name: "BRUNSWICK IMM HOM",
      },
      {
        name: "BSWK IMM H",
      },
    ],
  },
  {
    name: "Broadwater",
    variations: [
      {
        name: "BROA",
      },
      {
        name: "BR OA",
      },
    ],
  },
  {
    name: "Broken Creek",
    variations: [
      {
        name: "BROK",
      },
    ],
  },
  {
    name: "Bromley",
    variations: [
      {
        name: "BROM",
      },
    ],
  },
  {
    name: "Brooklyn",
    variations: [
      {
        name: "BROO",
      },
    ],
  },
  {
    name: "Broombank",
    variations: [
      {
        name: "BROO",
      },
    ],
  },
  {
    name: "Brown Hill",
    variations: [
      {
        name: "BROW",
      },
      {
        name: "BR OW",
      },
    ],
  },
  {
    name: "Brownsvale (at Scarsdale)",
    variations: [
      {
        name: "BROWNSVALE",
      },
    ],
  },
  {
    name: "Brunswick East",
    variations: [
      {
        name: "BRSWK E",
      },
      {
        name: "BRUN E",
      },
      {
        name: "BWICK E",
      },
      {
        name: "BWK E",
      },
    ],
  },
  {
    name: "Brunswick Immigrants Hospital",
    variations: [
      {
        name: "BRSWK IMM HOSP",
      },
      {
        name: "BWKIMHOSP",
      },
    ],
  },
  {
    name: "Brunswick North",
    variations: [
      {
        name: "BRSWK N",
      },
      {
        name: "BWK N",
      },
    ],
  },
  {
    name: "Brunswick Street",
    variations: [
      {
        name: "BRSWK ST",
      },
    ],
  },
  {
    name: "Brighton East",
    variations: [
      {
        name: "BRTN E",
      },
      {
        name: "BTN E",
      },
    ],
  },
  {
    name: "Brighton North",
    variations: [
      {
        name: "BRTON N",
      },
    ],
  },
  {
    name: "Bruarong",
    variations: [
      {
        name: "BRUA",
      },
    ],
  },
  {
    name: "Brucknell",
    variations: [
      {
        name: "BRUC",
      },
    ],
  },
  {
    name: "Bruce Creek",
    variations: [
      {
        name: "BRUC",
      },
    ],
  },
  {
    name: "Brunswick Benevolent Asylum",
    variations: [
      {
        name: "BRUN B A",
      },
    ],
  },
  {
    name: "Brunswick West",
    variations: [
      {
        name: "BRUN W",
      },
    ],
  },
  {
    name: "Brushy Creek",
    variations: [
      {
        name: "BRUS",
      },
    ],
  },
  {
    name: "Brighton Beach",
    variations: [
      {
        name: "BTN B",
      },
      {
        name: "BTN BEACH",
      },
      {
        name: "BTN BCH",
      },
    ],
  },
  {
    name: "Between Richmond and -",
    variations: [
      {
        name: "BTN RMOND & FROY",
      },
    ],
  },
  {
    name: "Between South Melbourne -",
    variations: [
      {
        name: "BTN S MELB CARLTON",
      },
    ],
  },
  {
    name: "Between Essendon and -",
    variations: [
      {
        name: "BTWNESSDN&PARKVILLE",
      },
    ],
  },
  {
    name: "Between Glen Iris and Fairfield",
    variations: [
      {
        name: "BTWN GLN IRS & FFIELD",
      },
    ],
  },
  {
    name: "Buckley",
    variations: [
      {
        name: "BUCK",
      },
    ],
  },
  {
    name: "Buckrabanyule",
    variations: [
      {
        name: "BUCK",
      },
    ],
  },
  {
    name: "Budgens Flat",
    variations: [
      {
        name: "BUDG",
      },
    ],
  },
  {
    name: "Buffalo River",
    variations: [
      {
        name: "BUFF",
      },
    ],
  },
  {
    name: "Buffalo Station",
    variations: [
      {
        name: "BUFFALO ST",
      },
    ],
  },
  {
    name: "Bulart",
    variations: [
      {
        name: "BULA",
      },
    ],
  },
  {
    name: "Buldah",
    variations: [
      {
        name: "BULD",
      },
    ],
  },
  {
    name: "Bulleen",
    variations: [
      {
        name: "BULE",
      },
      {
        name: "BULL",
      },
    ],
  },
  {
    name: "Bulgana",
    variations: [
      {
        name: "BULG",
      },
    ],
  },
  {
    name: "Bulla",
    variations: [
      {
        name: "BULL",
      },
      {
        name: "BU LL",
      },
    ],
  },
  {
    name: "Bullaharre",
    variations: [
      {
        name: "BULL",
      },
    ],
  },
  {
    name: "Bullarto",
    variations: [
      {
        name: "BULL",
      },
      {
        name: "BU LL",
      },
    ],
  },
  {
    name: "Bullarto South",
    variations: [
      {
        name: "BULL",
      },
    ],
  },
  {
    name: "Bulla and Tullamarine",
    variations: [
      {
        name: "BULLA ANDT",
      },
      {
        name: "BULLA AND T",
      },
      {
        name: "BULLA AND TU",
      },
      {
        name: "BULLA AND TULLAMA",
      },
    ],
  },
  {
    name: "Buln Buln",
    variations: [
      {
        name: "BULN",
      },
      {
        name: "BU LN",
      },
      {
        name: "BULU",
      },
    ],
  },
  {
    name: "Bullumwaal",
    variations: [
      {
        name: "BULU",
      },
    ],
  },
  {
    name: "Bumberrah",
    variations: [
      {
        name: "BUMB",
      },
    ],
  },
  {
    name: "Bungeet",
    variations: [
      {
        name: "BUN",
      },
      {
        name: "BUNG",
      },
    ],
  },
  {
    name: "Bunyip",
    variations: [
      {
        name: "BUN",
      },
    ],
  },
  {
    name: "Bunbartha",
    variations: [
      {
        name: "BUNB",
      },
    ],
  },
  {
    name: "Bundalaguah",
    variations: [
      {
        name: "BUND",
      },
    ],
  },
  {
    name: "Bundalong South",
    variations: [
      {
        name: "BUND",
      },
    ],
  },
  {
    name: "Bungeet West",
    variations: [
      {
        name: "BUNG",
      },
    ],
  },
  {
    name: "Bungil",
    variations: [
      {
        name: "BUNG",
      },
    ],
  },
  {
    name: "Bunguluke North",
    variations: [
      {
        name: "BU NG",
      },
      {
        name: "BUNGERIVER N",
      },
    ],
  },
  {
    name: "Bungaree and Dunnstown",
    variations: [
      {
        name: "BUNGAREEANDD",
      },
      {
        name: "BUNGAREE D",
      },
    ],
  },
  {
    name: "Burkes Flat",
    variations: [
      {
        name: "BURK",
      },
      {
        name: "BU RK",
      },
      {
        name: "BURKES F",
      },
      {
        name: "BURKES FL",
      },
      {
        name: "BURKES FLA",
      },
      {
        name: "BURKES FLO",
      },
      {
        name: "BURKES FLT",
      },
      {
        name: "BURKES PL",
      },
    ],
  },
  {
    name: "Burnley",
    variations: [
      {
        name: "BURN",
      },
    ],
  },
  {
    name: "Burnt Creek",
    variations: [
      {
        name: "BURN",
      },
      {
        name: "BURNT CK",
      },
    ],
  },
  {
    name: "Burramine",
    variations: [
      {
        name: "BURR",
      },
    ],
  },
  {
    name: "Burrowye",
    variations: [
      {
        name: "BURR",
      },
    ],
  },
  {
    name: "Burwood East",
    variations: [
      {
        name: "BURW",
      },
      {
        name: "BURWOOD E",
      },
    ],
  },
  {
    name: "Bushfield",
    variations: [
      {
        name: "BUSH",
      },
    ],
  },
  {
    name: "Bushy Park",
    variations: [
      {
        name: "BUSH",
      },
    ],
  },
  {
    name: "Butchers Ridge",
    variations: [
      {
        name: "BUTC",
      },
    ],
  },
  {
    name: "Bridgewater (on Loddon)",
    variations: [
      {
        name: "BWATER",
      },
      {
        name: "B WATER",
      },
    ],
  },
  {
    name: "Ballarat W? Hospital",
    variations: [
      {
        name: "B W HOSP",
      },
    ],
  },
  {
    name: "Beechworth Hospital",
    variations: [
      {
        name: "BWORTH HOS",
      },
      {
        name: "BWORTH HOSP",
      },
      {
        name: "B WORTH HOSP",
      },
    ],
  },
  {
    name: "Byaduk",
    variations: [
      {
        name: "BYAD",
      },
      {
        name: "BY AD",
      },
    ],
  },
  {
    name: "Byaduk North",
    variations: [
      {
        name: "BYAD",
      },
    ],
  },
  {
    name: "Cabarita",
    variations: [
      {
        name: "CABA",
      },
    ],
  },
  {
    name: "Cabbage Tree Creek",
    variations: [
      {
        name: "CABB",
      },
    ],
  },
  {
    name: "Cairnlea??",
    variations: [
      {
        name: "CAIR",
      },
    ],
  },
  {
    name: "Caldermeade",
    variations: [
      {
        name: "CALD",
      },
    ],
  },
  {
    name: "Calivil",
    variations: [
      {
        name: "CALI",
      },
    ],
  },
  {
    name: "Callawadda",
    variations: [
      {
        name: "CALL",
      },
      {
        name: "CA LL",
      },
    ],
  },
  {
    name: "Callignee",
    variations: [
      {
        name: "CALL",
      },
    ],
  },
  {
    name: "Callignee North",
    variations: [
      {
        name: "CALL",
      },
    ],
  },
  {
    name: "Calulu",
    variations: [
      {
        name: "CALU",
      },
    ],
  },
  {
    name: "Campbells Bridge",
    variations: [
      {
        name: "CAMP",
      },
    ],
  },
  {
    name: "Campbells Creek",
    variations: [
      {
        name: "CAMP",
      },
      {
        name: "CA MP",
      },
      {
        name: "CAMPBELLS",
      },
      {
        name: "CAMPBELLS CK",
      },
      {
        name: "CAMPBELLS CR",
      },
      {
        name: "CAMPBELLS CRK",
      },
      {
        name: "CBELLS C",
      },
      {
        name: "CBELLS CK",
      },
      {
        name: "CBELLS CR",
      },
      {
        name: "CBELLS CREEK",
      },
      {
        name: "CBELLS CRK",
      },
      {
        name: "CPBELLS C",
      },
      {
        name: "CPBELLS CK",
      },
    ],
  },
  {
    name: "Campbells Forest",
    variations: [
      {
        name: "CAMP",
      },
    ],
  },
  {
    name: "Campbells Creek Lunatic Asylum",
    variations: [
      {
        name: "CAMPBELL L A",
      },
    ],
  },
  {
    name: "Caniambo",
    variations: [
      {
        name: "CANI",
      },
      {
        name: "CA NI",
      },
    ],
  },
  {
    name: "Cann River",
    variations: [
      {
        name: "CANN",
      },
    ],
  },
  {
    name: "Cannons Creek",
    variations: [
      {
        name: "CANN",
      },
    ],
  },
  {
    name: "Canterbury",
    variations: [
      {
        name: "CANT",
      },
      {
        name: "CBURY",
      },
    ],
  },
  {
    name: "Canvas Town",
    variations: [
      {
        name: "CANV",
      },
      {
        name: "CANVAS TOW",
      },
      {
        name: "CANVAS TWN",
      },
    ],
  },
  {
    name: "Cape Bridgewater",
    variations: [
      {
        name: "CAPE",
      },
    ],
  },
  {
    name: "Carapook",
    variations: [
      {
        name: "CARA",
      },
      {
        name: "CA RA",
      },
    ],
  },
  {
    name: "Carboor",
    variations: [
      {
        name: "CARB",
      },
    ],
  },
  {
    name: "Cardinia",
    variations: [
      {
        name: "CARD",
      },
    ],
  },
  {
    name: "Cardross",
    variations: [
      {
        name: "CARD",
      },
    ],
  },
  {
    name: "Cargerie",
    variations: [
      {
        name: "CARG",
      },
    ],
  },
  {
    name: "Carina",
    variations: [
      {
        name: "CARI",
      },
    ],
  },
  {
    name: "Carlisle River",
    variations: [
      {
        name: "CARL",
      },
    ],
  },
  {
    name: "Carlton Childrens",
    variations: [
      {
        name: "CARL C",
      },
      {
        name: "CARL CH",
      },
    ],
  },
  {
    name: "Carlton Childrens Hospital",
    variations: [
      {
        name: "CARL C H",
      },
      {
        name: "CARL CH H",
      },
      {
        name: "CARL CH HO",
      },
      {
        name: "CARL CH HOS",
      },
      {
        name: "CARL CH HOSP",
      },
      {
        name: "CARL CHIL HOSP",
      },
      {
        name: "CARL CHILD HOSP",
      },
      {
        name: "CARL CHILDRENS",
      },
      {
        name: "CARL CHILDS HOSP",
      },
      {
        name: "CARL C HOS",
      },
      {
        name: "CARL C HOSP",
      },
    ],
  },
  {
    name: "Carlton Hospital",
    variations: [
      {
        name: "CARL H",
      },
      {
        name: "CARL HOS",
      },
      {
        name: "CARL HOSP",
      },
      {
        name: "CARLT HOS",
      },
      {
        name: "CARLT HOSP",
      },
    ],
  },
  {
    name: "Carlton North",
    variations: [
      {
        name: "CARL N",
      },
      {
        name: "CAUL N",
      },
      {
        name: "CTON N",
      },
      {
        name: "CTON NTH",
      },
    ],
  },
  {
    name: "Carlton Womens Hospital",
    variations: [
      {
        name: "CARLTON W HOSP",
      },
      {
        name: "CARLTON WOM HOSP",
      },
      {
        name: "CARL WOMS HOSP",
      },
      {
        name: "CARL WOMENS HOSP",
      },
    ],
  },
  {
    name: "Carlton W?",
    variations: [
      {
        name: "CARL W",
      },
    ],
  },
  {
    name: "Carlton Womens",
    variations: [
      {
        name: "CARL W",
      },
    ],
  },
  {
    name: "Carnegie",
    variations: [
      {
        name: "CARN",
      },
    ],
  },
  {
    name: "Carpendeit",
    variations: [
      {
        name: "CARP",
      },
      {
        name: "CA RP",
      },
    ],
  },
  {
    name: "Carranballac",
    variations: [
      {
        name: "CARR",
      },
    ],
  },
  {
    name: "Carrajung",
    variations: [
      {
        name: "CARR",
      },
    ],
  },
  {
    name: "Carrum",
    variations: [
      {
        name: "CARR",
      },
    ],
  },
  {
    name: "Carrup Carrup",
    variations: [
      {
        name: "CARR",
      },
    ],
  },
  {
    name: "Currum Downs",
    variations: [
      {
        name: "CARR",
      },
    ],
  },
  {
    name: "Carwarp",
    variations: [
      {
        name: "CARW",
      },
    ],
  },
  {
    name: "Cashel",
    variations: [
      {
        name: "CASH",
      },
      {
        name: "CA SH",
      },
    ],
  },
  {
    name: "Cashmore",
    variations: [
      {
        name: "CASH",
      },
    ],
  },
  {
    name: "Cassilis",
    variations: [
      {
        name: "CASS",
      },
      {
        name: "CA SS",
      },
    ],
  },
  {
    name: "Castlemaine Benevolent Asylum",
    variations: [
      {
        name: "CASTLEMAINE B A",
      },
      {
        name: "CMAINE B A",
      },
      {
        name: "C MAINE B A",
      },
      {
        name: "C MAINE B ASY",
      },
      {
        name: "C MAINE BEN ASY",
      },
      {
        name: "C MAINE BEN ASYL",
      },
      {
        name: "C MAINE BENT ASY",
      },
    ],
  },
  {
    name: "Castlemain Hospital",
    variations: [
      {
        name: "CASTLEMAINE HOSP",
      },
    ],
  },
  {
    name: "Catani",
    variations: [
      {
        name: "CATA",
      },
    ],
  },
  {
    name: "Cattle Station Hill",
    variations: [
      {
        name: "CATTLE STN",
      },
    ],
  },
  {
    name: "Caul Childrens Hospital",
    variations: [
      {
        name: "CAUL CHILDRENS HO",
      },
    ],
  },
  {
    name: "Caulfield (D?)",
    variations: [
      {
        name: "CAUL D",
      },
    ],
  },
  {
    name: "Caulfield East",
    variations: [
      {
        name: "CAUL E",
      },
    ],
  },
  {
    name: "Caul? Hospital",
    variations: [
      {
        name: "CAUL H",
      },
    ],
  },
  {
    name: "Caulfield North",
    variations: [
      {
        name: "CAUL N",
      },
    ],
  },
  {
    name: "Caulfield South",
    variations: [
      {
        name: "CAUL S",
      },
    ],
  },
  {
    name: "Caul? Womens Hospital",
    variations: [
      {
        name: "CAUL W H",
      },
      {
        name: "CAUL WOMENS HOSP",
      },
    ],
  },
  {
    name: "Caveat",
    variations: [
      {
        name: "CAVE",
      },
    ],
  },
  {
    name: "Cays Diggings",
    variations: [
      {
        name: "CAYS",
      },
    ],
  },
  {
    name: "Cairnbrook",
    variations: [
      {
        name: "CBROOK",
      },
    ],
  },
  {
    name: "Clarendon",
    variations: [
      {
        name: "CDON",
      },
      {
        name: "CLAR",
      },
      {
        name: "CL AR",
      },
    ],
  },
  {
    name: "Croydon",
    variations: [
      {
        name: "CDON",
      },
      {
        name: "CROY",
      },
    ],
  },
  {
    name: "Chillingollah",
    variations: [
      {
        name: "CGOLLAH",
      },
      {
        name: "CHIL",
      },
      {
        name: "CHILL",
      },
    ],
  },
  {
    name: "Charlton",
    variations: [
      {
        name: "CHA",
      },
      {
        name: "CHAR",
      },
      {
        name: "CH AR",
      },
      {
        name: "CHARL",
      },
    ],
  },
  {
    name: "Chadstone",
    variations: [
      {
        name: "CHAD",
      },
    ],
  },
  {
    name: "Challicum",
    variations: [
      {
        name: "CHAL",
      },
    ],
  },
  {
    name: "Cunninghame",
    variations: [
      {
        name: "CHAME",
      },
      {
        name: "CUNN",
      },
    ],
  },
  {
    name: "Chapple Vale",
    variations: [
      {
        name: "CHAP",
      },
    ],
  },
  {
    name: "Corindhap",
    variations: [
      {
        name: "CHAP",
      },
      {
        name: "CORI",
      },
    ],
  },
  {
    name: "Charam",
    variations: [
      {
        name: "CHAR",
      },
    ],
  },
  {
    name: "Charcoal Gully",
    variations: [
      {
        name: "CHARCOAL",
      },
      {
        name: "CHARCOAL G",
      },
    ],
  },
  {
    name: "Charlton Hospital",
    variations: [
      {
        name: "CHARL HOSP",
      },
    ],
  },
  {
    name: "Chatham",
    variations: [
      {
        name: "CHAT",
      },
    ],
  },
  {
    name: "Chepstowe",
    variations: [
      {
        name: "CHEP",
      },
    ],
  },
  {
    name: "Cherokee",
    variations: [
      {
        name: "CHER",
      },
    ],
  },
  {
    name: "Cherry Tree Flat (Station)",
    variations: [
      {
        name: "CHERRY TR",
      },
      {
        name: "CHERRY TRE",
      },
    ],
  },
  {
    name: "Cherry Tree Flat",
    variations: [
      {
        name: "CHERRY TRE",
      },
    ],
  },
  {
    name: "Cheshunt",
    variations: [
      {
        name: "CHES",
      },
    ],
  },
  {
    name: "Chesney Vale",
    variations: [
      {
        name: "CHES",
      },
    ],
  },
  {
    name: "Chiltern South",
    variations: [
      {
        name: "CHIL",
      },
    ],
  },
  {
    name: "Chiltern Valley",
    variations: [
      {
        name: "CHIL",
      },
    ],
  },
  {
    name: "Chilwell",
    variations: [
      {
        name: "CHIL",
      },
      {
        name: "CHWELL",
      },
    ],
  },
  {
    name: "Childrens Hospital",
    variations: [
      {
        name: "CHIL HOSP",
      },
    ],
  },
  {
    name: "Clifton Hill Benevolent Hospital",
    variations: [
      {
        name: "C HILL B HOS",
      },
    ],
  },
  {
    name: "Clifton Hill Lunatic Asylum",
    variations: [
      {
        name: "CHILL LA",
      },
      {
        name: "C HILL LA",
      },
      {
        name: "CHILL L A",
      },
      {
        name: "C HILL L A",
      },
      {
        name: "CHILL L ASY",
      },
      {
        name: "C HILL L ASY",
      },
      {
        name: "CHILL LUN ASY",
      },
      {
        name: "C HILL LUN ASY",
      },
      {
        name: "CLFHILL L A",
      },
      {
        name: "CLF HILL L A",
      },
      {
        name: "CLIFFTON HILL L A",
      },
      {
        name: "CLIFTON HILL L A",
      },
      {
        name: "E HILL L A",
      },
    ],
  },
  {
    name: "Clifton Hill Lunatic (Asylum)",
    variations: [
      {
        name: "C HILL LUN",
      },
    ],
  },
  {
    name: "Clifton Hill Yarra Bend Asylum",
    variations: [
      {
        name: "C HILL U B ASY",
      },
      {
        name: "C HILL Y B ASY",
      },
      {
        name: "C HILL Y B ASYLUM",
      },
    ],
  },
  {
    name: "Clifton Hill Yarra Bend Lunatic Asylum",
    variations: [
      {
        name: "C HILL Y B LUN AS",
      },
    ],
  },
  {
    name: "Chinkapook",
    variations: [
      {
        name: "CHIN",
      },
    ],
  },
  {
    name: "Chippindale (NSW)",
    variations: [
      {
        name: "CHIPPINDAL",
      },
    ],
  },
  {
    name: "Chirnside Park",
    variations: [
      {
        name: "CHIR",
      },
    ],
  },
  {
    name: "Chocolyn",
    variations: [
      {
        name: "CHOC",
      },
    ],
  },
  {
    name: "Christmas Hills",
    variations: [
      {
        name: "CHRI",
      },
      {
        name: "XMAS HILLS",
      },
    ],
  },
  {
    name: "Churchill",
    variations: [
      {
        name: "CHUR",
      },
    ],
  },
  {
    name: "Claretown",
    variations: [
      {
        name: "CLAR",
      },
    ],
  },
  {
    name: "Clarinda",
    variations: [
      {
        name: "CLAR",
      },
    ],
  },
  {
    name: "Clarkefield",
    variations: [
      {
        name: "CLAR",
      },
    ],
  },
  {
    name: "Clayton South",
    variations: [
      {
        name: "CLAY",
      },
    ],
  },
  {
    name: "Clematis",
    variations: [
      {
        name: "CLEM",
      },
    ],
  },
  {
    name: "Cleveland",
    variations: [
      {
        name: "CLEV",
      },
    ],
  },
  {
    name: "Clonbinane",
    variations: [
      {
        name: "CLON",
      },
    ],
  },
  {
    name: "Clover Flat",
    variations: [
      {
        name: "CLOV",
      },
    ],
  },
  {
    name: "Cloverlea",
    variations: [
      {
        name: "CLOV",
      },
    ],
  },
  {
    name: "Clowes Forest",
    variations: [
      {
        name: "CLOW",
      },
      {
        name: "CLOWES F",
      },
      {
        name: "CLOWES FOR",
      },
      {
        name: "CLOWES FRT",
      },
      {
        name: "CLOWES FST",
      },
      {
        name: "CLOWES FT",
      },
    ],
  },
  {
    name: "Club Terrace",
    variations: [
      {
        name: "CLUB",
      },
    ],
  },
  {
    name: "Clunes Hospital",
    variations: [
      {
        name: "CLUNES H",
      },
      {
        name: "CLUNES HOS",
      },
      {
        name: "CLUNES HOSP",
      },
    ],
  },
  {
    name: "Clyde",
    variations: [
      {
        name: "CLYD",
      },
    ],
  },
  {
    name: "Castlemaine Lunatic Asylum",
    variations: [
      {
        name: "CMAINE L A",
      },
    ],
  },
  {
    name: "Castlemaine Hospital",
    variations: [
      {
        name: "CMAINE H",
      },
      {
        name: "CMAINE HL",
      },
      {
        name: "CMAINE HO",
      },
      {
        name: "C MAINE HO",
      },
      {
        name: "C MAINE HOPTL",
      },
      {
        name: "CMAINE HOS",
      },
      {
        name: "CMAINE HOSP",
      },
      {
        name: "C MAINE HOSP",
      },
      {
        name: "CMAINE HSP",
      },
      {
        name: "CMAIN HOS",
      },
      {
        name: "CMAINHOSP",
      },
    ],
  },
  {
    name: "Coalville",
    variations: [
      {
        name: "COAL",
      },
      {
        name: "CO AL",
      },
    ],
  },
  {
    name: "Cobains",
    variations: [
      {
        name: "COBA",
      },
    ],
  },
  {
    name: "Cobaw",
    variations: [
      {
        name: "COBA",
      },
    ],
  },
  {
    name: "Cobbannah",
    variations: [
      {
        name: "COBB",
      },
    ],
  },
  {
    name: "Cobrico",
    variations: [
      {
        name: "COBR",
      },
    ],
  },
  {
    name: "Cocamba",
    variations: [
      {
        name: "COCA",
      },
    ],
  },
  {
    name: "Cochranes Creek",
    variations: [
      {
        name: "COCH",
      },
    ],
  },
  {
    name: "Cockatoo",
    variations: [
      {
        name: "COCK",
      },
    ],
  },
  {
    name: "Colac Colac",
    variations: [
      {
        name: "COLA",
      },
    ],
  },
  {
    name: "Colac East",
    variations: [
      {
        name: "COLA",
      },
    ],
  },
  {
    name: "Colac West",
    variations: [
      {
        name: "COLA",
      },
    ],
  },
  {
    name: "Colac Hospital",
    variations: [
      {
        name: "COLAC H",
      },
      {
        name: "COLAC HOS",
      },
      {
        name: "COLAC HOSP",
      },
    ],
  },
  {
    name: "Coldstream",
    variations: [
      {
        name: "COLD",
      },
    ],
  },
  {
    name: "Colignan",
    variations: [
      {
        name: "COLI",
      },
    ],
  },
  {
    name: "Combienbar",
    variations: [
      {
        name: "COMB",
      },
    ],
  },
  {
    name: "Commissioners Gully",
    variations: [
      {
        name: "COM GLY",
      },
      {
        name: "COMM",
      },
      {
        name: "COMMERS GL",
      },
      {
        name: "COMMERS GY",
      },
      {
        name: "COMM GLY",
      },
      {
        name: "COMM GULL",
      },
      {
        name: "COMMIS GY",
      },
      {
        name: "COMMISS GL",
      },
      {
        name: "COMMISSION",
      },
      {
        name: "COMMRE GL",
      },
      {
        name: "COMMRS G",
      },
      {
        name: "COMMRS GL",
      },
      {
        name: "COMMRS GLY",
      },
      {
        name: "COMMRS GU",
      },
      {
        name: "COMMRS GUL",
      },
      {
        name: "COMMS GLY",
      },
      {
        name: "COMRS G",
      },
      {
        name: "COMRS GLY",
      },
      {
        name: "COMRS GUL",
      },
      {
        name: "COMRS GY",
      },
    ],
  },
  {
    name: "Commeralghip",
    variations: [
      {
        name: "COMMERALLG",
      },
    ],
  },
  {
    name: "Commissioners Hill",
    variations: [
      {
        name: "COMMERS HL",
      },
      {
        name: "COMMISSION",
      },
      {
        name: "COMM R HIL",
      },
      {
        name: "COMMRS HI",
      },
      {
        name: "COMMRS HIL",
      },
    ],
  },
  {
    name: "Commissioners Gully Creek",
    variations: [
      {
        name: "COMMISSION",
      },
    ],
  },
  {
    name: "Concongella",
    variations: [
      {
        name: "CONC",
      },
    ],
  },
  {
    name: "Condah Swamp",
    variations: [
      {
        name: "COND",
      },
    ],
  },
  {
    name: "Condah and Green Hills",
    variations: [
      {
        name: "CONDAH AND G",
      },
      {
        name: "CONDAH G H",
      },
      {
        name: "CONDAH GRE",
      },
    ],
  },
  {
    name: "Conneware",
    variations: [
      {
        name: "CONE",
      },
      {
        name: "CO NE",
      },
      {
        name: "CO NN",
      },
    ],
  },
  {
    name: "Congupna",
    variations: [
      {
        name: "CONG",
      },
    ],
  },
  {
    name: "Connewirricoo",
    variations: [
      {
        name: "CONN",
      },
    ],
  },
  {
    name: "Conners Creek",
    variations: [
      {
        name: "CONNERS CK",
      },
    ],
  },
  {
    name: "Conover West",
    variations: [
      {
        name: "CONO",
      },
      {
        name: "CO NO",
      },
    ],
  },
  {
    name: "Coojar",
    variations: [
      {
        name: "COOJ",
      },
    ],
  },
  {
    name: "Coolaroo",
    variations: [
      {
        name: "COOL",
      },
    ],
  },
  {
    name: "Coolart",
    variations: [
      {
        name: "COOL",
      },
    ],
  },
  {
    name: "Coomboona",
    variations: [
      {
        name: "COOM",
      },
    ],
  },
  {
    name: "Coonooer Bridge",
    variations: [
      {
        name: "COON",
      },
    ],
  },
  {
    name: "Cooriemungle",
    variations: [
      {
        name: "COOR",
      },
    ],
  },
  {
    name: "Cope Cope",
    variations: [
      {
        name: "COPE",
      },
    ],
  },
  {
    name: "Cora Lynn",
    variations: [
      {
        name: "CORA",
      },
    ],
  },
  {
    name: "Corack East",
    variations: [
      {
        name: "CORA",
      },
    ],
  },
  {
    name: "Coragulac",
    variations: [
      {
        name: "CORA",
      },
    ],
  },
  {
    name: "Corban Station",
    variations: [
      {
        name: "CORBAN STN",
      },
    ],
  },
  {
    name: "Corinella",
    variations: [
      {
        name: "CORI",
      },
      {
        name: "CORN",
      },
    ],
  },
  {
    name: "Corndale",
    variations: [
      {
        name: "CORN",
      },
    ],
  },
  {
    name: "Cornelia Creek",
    variations: [
      {
        name: "CORN",
      },
    ],
  },
  {
    name: "Cornella",
    variations: [
      {
        name: "CORN",
      },
      {
        name: "CO RN",
      },
    ],
  },
  {
    name: "Corner Inlet",
    variations: [
      {
        name: "CORN",
      },
    ],
  },
  {
    name: "Coronet Bay",
    variations: [
      {
        name: "CORO",
      },
    ],
  },
  {
    name: "Corunnun",
    variations: [
      {
        name: "CORU",
      },
    ],
  },
  {
    name: "Cosgrove",
    variations: [
      {
        name: "COSG",
      },
    ],
  },
  {
    name: "Cottles Bridge",
    variations: [
      {
        name: "COTT",
      },
    ],
  },
  {
    name: "Cowana Bend",
    variations: [
      {
        name: "COWA",
      },
      {
        name: "CO WA",
      },
    ],
  },
  {
    name: "Cowangie",
    variations: [
      {
        name: "COWA",
      },
    ],
  },
  {
    name: "Cowes and Phillip Island",
    variations: [
      {
        name: "COWES ANDP I",
      },
    ],
  },
  {
    name: "Cowies Creek",
    variations: [
      {
        name: "COWI",
      },
      {
        name: "COWIES C",
      },
      {
        name: "COWIES CK",
      },
      {
        name: "COWIES CRK",
      },
    ],
  },
  {
    name: "Cowleys Creek",
    variations: [
      {
        name: "COWLEYS C",
      },
      {
        name: "COWLEYS CK",
      },
    ],
  },
  {
    name: "Campbells Flat",
    variations: [
      {
        name: "CPBELLS FT",
      },
    ],
  },
  {
    name: "Craigie",
    variations: [
      {
        name: "CRAI",
      },
      {
        name: "CR AI",
      },
    ],
  },
  {
    name: "Creek Junction",
    variations: [
      {
        name: "CREE",
      },
    ],
  },
  {
    name: "Creightons Creek",
    variations: [
      {
        name: "CREI",
      },
    ],
  },
  {
    name: "Cressy",
    variations: [
      {
        name: "CRES",
      },
      {
        name: "CR ES",
      },
    ],
  },
  {
    name: "Creswick Hospital",
    variations: [
      {
        name: "CRESW HOSP",
      },
      {
        name: "CRESWICK H",
      },
      {
        name: "CRESWICK HOSP",
      },
      {
        name: "CRSWK H",
      },
      {
        name: "CRSWK HOS",
      },
      {
        name: "CRSWK HOSP",
      },
      {
        name: "CRSWK HSP",
      },
      {
        name: "CRWK H",
      },
      {
        name: "CWICK H",
      },
      {
        name: "CWICK HOS",
      },
      {
        name: "CWICK HOSP",
      },
      {
        name: "CWICK HSP",
      },
      {
        name: "CWK HOSP",
      },
    ],
  },
  {
    name: "Crib Point",
    variations: [
      {
        name: "CRIB",
      },
    ],
  },
  {
    name: "Croxton East",
    variations: [
      {
        name: "CROX",
      },
    ],
  },
  {
    name: "Croxton Station",
    variations: [
      {
        name: "CROXTON ST",
      },
    ],
  },
  {
    name: "Croydon South",
    variations: [
      {
        name: "CROY",
      },
    ],
  },
  {
    name: "Chelsea",
    variations: [
      {
        name: "CSEA",
      },
    ],
  },
  {
    name: "Cudgee",
    variations: [
      {
        name: "CUDG",
      },
    ],
  },
  {
    name: "Cudgewa",
    variations: [
      {
        name: "CUDG",
      },
      {
        name: "CU DG",
      },
    ],
  },
  {
    name: "Culgoa",
    variations: [
      {
        name: "CULG",
      },
    ],
  },
  {
    name: "Culla",
    variations: [
      {
        name: "CULL",
      },
    ],
  },
  {
    name: "Cullulleraine",
    variations: [
      {
        name: "CULL",
      },
    ],
  },
  {
    name: "Cup Cup Station",
    variations: [
      {
        name: "CUP CUP ST",
      },
    ],
  },
  {
    name: "Curdies River",
    variations: [
      {
        name: "CURD",
      },
    ],
  },
  {
    name: "Curdievale",
    variations: [
      {
        name: "CURD",
      },
    ],
  },
  {
    name: "Curlewis",
    variations: [
      {
        name: "CURL",
      },
    ],
  },
  {
    name: "Curyo",
    variations: [
      {
        name: "CURY",
      },
    ],
  },
  {
    name: "Cushion Bay",
    variations: [
      {
        name: "CUSHION BY",
      },
    ],
  },
  {
    name: "Cut Paw Paw",
    variations: [
      {
        name: "CUT PA PA",
      },
      {
        name: "CUT PAW PA",
      },
    ],
  },
  {
    name: "Creswick Creek",
    variations: [
      {
        name: "CWICK CK",
      },
      {
        name: "CWICK CRK",
      },
    ],
  },
  {
    name: "Creswick North",
    variations: [
      {
        name: "CWICK N",
      },
    ],
  },
  {
    name: "Creswick Road",
    variations: [
      {
        name: "CWICK ROAD",
      },
    ],
  },
  {
    name: "Creswick Victoria",
    variations: [
      {
        name: "CWICK VIC",
      },
    ],
  },
  {
    name: "Collingwood Convent",
    variations: [
      {
        name: "CWOOD CONVENT",
      },
    ],
  },
  {
    name: "Collingwood Quarry",
    variations: [
      {
        name: "CWOOD QUA",
      },
    ],
  },
  {
    name: "Collingwood (Flat?)",
    variations: [
      {
        name: "CWWOOD",
      },
    ],
  },
  {
    name: "Dallas",
    variations: [
      {
        name: "DALL",
      },
    ],
  },
  {
    name: "Darlington",
    variations: [
      {
        name: "DALL",
      },
      {
        name: "DARL",
      },
      {
        name: "DA RL",
      },
      {
        name: "DTON",
      },
    ],
  },
  {
    name: "Dalmore",
    variations: [
      {
        name: "DALM",
      },
    ],
  },
  {
    name: "Daltons Bridge",
    variations: [
      {
        name: "DALT",
      },
    ],
  },
  {
    name: "Dalyston",
    variations: [
      {
        name: "DALY",
      },
    ],
  },
  {
    name: "Darebin Creek",
    variations: [
      {
        name: "DARE",
      },
      {
        name: "DA RE",
      },
      {
        name: "DAREBIN",
      },
      {
        name: "DAREBIN C",
      },
      {
        name: "DAREBIN CK",
      },
      {
        name: "DAREBIN CR",
      },
      {
        name: "DAREBIN PT",
      },
      {
        name: "DBIN CK",
      },
      {
        name: "DBIN CR",
      },
    ],
  },
  {
    name: "Dargalong",
    variations: [
      {
        name: "DARG",
      },
      {
        name: "DA RG",
      },
      {
        name: "DAYA",
      },
      {
        name: "DA YA",
      },
    ],
  },
  {
    name: "Dargo Flat",
    variations: [
      {
        name: "DARG",
      },
      {
        name: "DA RG",
      },
    ],
  },
  {
    name: "Darley",
    variations: [
      {
        name: "DARL",
      },
    ],
  },
  {
    name: "Darling",
    variations: [
      {
        name: "DARL",
      },
    ],
  },
  {
    name: "Darnum",
    variations: [
      {
        name: "DARN",
      },
      {
        name: "DA RN",
      },
    ],
  },
  {
    name: "Darraweit Guim",
    variations: [
      {
        name: "DARR",
      },
      {
        name: "DA RR",
      },
      {
        name: "DARRANEITG",
      },
      {
        name: "DARRAWEIT",
      },
      {
        name: "DARRAWET G",
      },
    ],
  },
  {
    name: "Darriman",
    variations: [
      {
        name: "DARR",
      },
    ],
  },
  {
    name: "Dartmouth",
    variations: [
      {
        name: "DART",
      },
    ],
  },
  {
    name: "Daylesford Hospital",
    variations: [
      {
        name: "DAYLESFORD HOS",
      },
      {
        name: "DAYLESFORD HOSP",
      },
      {
        name: "DFORD H",
      },
      {
        name: "DFORD HOS",
      },
      {
        name: "D FORD HOS",
      },
      {
        name: "DFORD HOSP",
      },
      {
        name: "D FORD HOSP",
      },
      {
        name: "DFORD HOSPL",
      },
      {
        name: "DFORD HSP",
      },
    ],
  },
  {
    name: "Dead Horse Gully",
    variations: [
      {
        name: "DEAD",
      },
      {
        name: "DEAD H GY",
      },
      {
        name: "DEADHORSE",
      },
      {
        name: "DEAD HORSE",
      },
      {
        name: "DEAD HRS G",
      },
      {
        name: "DEAD HS GY",
      },
    ],
  },
  {
    name: "Dead Dog Gully",
    variations: [
      {
        name: "DEAD DOG",
      },
      {
        name: "DEAD DOG G",
      },
    ],
  },
  {
    name: "Dean",
    variations: [
      {
        name: "DEAN",
      },
      {
        name: "DE AN",
      },
    ],
  },
  {
    name: "Deepdene",
    variations: [
      {
        name: "DDENE",
      },
      {
        name: "DEEP",
      },
    ],
  },
  {
    name: "Deep Creek",
    variations: [
      {
        name: "DEEP",
      },
      {
        name: "DE EP",
      },
      {
        name: "DEEP CK",
      },
      {
        name: "DUCK",
      },
      {
        name: "FLEE",
      },
    ],
  },
  {
    name: "Deer Park",
    variations: [
      {
        name: "DEER",
      },
    ],
  },
  {
    name: "Delacombe",
    variations: [
      {
        name: "DELA",
      },
    ],
  },
  {
    name: "Delburn",
    variations: [
      {
        name: "DELB",
      },
    ],
  },
  {
    name: "Delegate River",
    variations: [
      {
        name: "DELE",
      },
      {
        name: "DELEGATE R",
      },
    ],
  },
  {
    name: "Delvine (Station)",
    variations: [
      {
        name: "DELV",
      },
    ],
  },
  {
    name: "Durham Lead",
    variations: [
      {
        name: "DENHAMLEAD",
      },
      {
        name: "DURH",
      },
      {
        name: "DU RH",
      },
      {
        name: "DURHAM L",
      },
    ],
  },
  {
    name: "Denicull Creek",
    variations: [
      {
        name: "DENI",
      },
    ],
  },
  {
    name: "Dennis",
    variations: [
      {
        name: "DENN",
      },
    ],
  },
  {
    name: "Deutgam",
    variations: [
      {
        name: "DENTGAM",
      },
      {
        name: "DENTGUM",
      },
      {
        name: "DEUTGAM",
      },
    ],
  },
  {
    name: "Denver",
    variations: [
      {
        name: "DENV",
      },
    ],
  },
  {
    name: "Derrinal",
    variations: [
      {
        name: "DERR",
      },
    ],
  },
  {
    name: "Derrinallum",
    variations: [
      {
        name: "DERR",
      },
    ],
  },
  {
    name: "Derwent Jacks",
    variations: [
      {
        name: "DERWENT J",
      },
      {
        name: "DERWENT JA",
      },
      {
        name: "DERWENTS J",
      },
    ],
  },
  {
    name: "Derwent Gully",
    variations: [
      {
        name: "DERWNT GLY",
      },
    ],
  },
  {
    name: "Devils Kitchen",
    variations: [
      {
        name: "DEVI",
      },
    ],
  },
  {
    name: "Devils Creek",
    variations: [
      {
        name: "DEVILSS C",
      },
    ],
  },
  {
    name: "Dewhurst",
    variations: [
      {
        name: "DEWH",
      },
    ],
  },
  {
    name: "Driffield",
    variations: [
      {
        name: "DFIELD",
      },
      {
        name: "DRIF",
      },
    ],
  },
  {
    name: "Dhurringile",
    variations: [
      {
        name: "DHUR",
      },
    ],
  },
  {
    name: "Diamond Gully",
    variations: [
      {
        name: "DIAMOND G",
      },
      {
        name: "DIAMOND GY",
      },
    ],
  },
  {
    name: "Diggers Rest",
    variations: [
      {
        name: "DIGG",
      },
      {
        name: "DIGGERS R",
      },
      {
        name: "DIGGERS RE",
      },
      {
        name: "DIGGERS RS",
      },
      {
        name: "DIGGERS RT",
      },
    ],
  },
  {
    name: "Diggora",
    variations: [
      {
        name: "DIGG",
      },
    ],
  },
  {
    name: "Dingee",
    variations: [
      {
        name: "DING",
      },
    ],
  },
  {
    name: "Dingley",
    variations: [
      {
        name: "DING",
      },
    ],
  },
  {
    name: "Dixie",
    variations: [
      {
        name: "DIXI",
      },
    ],
  },
  {
    name: "Docker",
    variations: [
      {
        name: "DOCK",
      },
    ],
  },
  {
    name: "Dockers Plains",
    variations: [
      {
        name: "DOCK",
      },
    ],
  },
  {
    name: "Doctors Flat",
    variations: [
      {
        name: "DOCT",
      },
    ],
  },
  {
    name: "Doctors Hill or Gully",
    variations: [
      {
        name: "DOCT",
      },
    ],
  },
  {
    name: "Doctors Gully",
    variations: [
      {
        name: "DOCTORS GL",
      },
      {
        name: "DOCTORS GU",
      },
      {
        name: "DOCTORS GY",
      },
    ],
  },
  {
    name: "Dollar",
    variations: [
      {
        name: "DOLL",
      },
    ],
  },
  {
    name: "Dollys Creek",
    variations: [
      {
        name: "DOLL",
      },
      {
        name: "DO LL",
      },
      {
        name: "DOLLYS CK",
      },
      {
        name: "DOLLYS CRK",
      },
    ],
  },
  {
    name: "Doncaster East",
    variations: [
      {
        name: "DONC",
      },
      {
        name: "DONCASTER E",
      },
    ],
  },
  {
    name: "Donnelly's Creek",
    variations: [
      {
        name: "DONE",
      },
    ],
  },
  {
    name: "Donnelly(s) Creek",
    variations: [
      {
        name: "DO NN",
      },
    ],
  },
  {
    name: "Donvale",
    variations: [
      {
        name: "DONV",
      },
    ],
  },
  {
    name: "Dooboobetic",
    variations: [
      {
        name: "DOOB",
      },
    ],
  },
  {
    name: "Doreen",
    variations: [
      {
        name: "DORE",
      },
    ],
  },
  {
    name: "Forest Creek",
    variations: [
      {
        name: "DORE",
      },
      {
        name: "FORE",
      },
      {
        name: "FO RE",
      },
      {
        name: "FOREST CK",
      },
      {
        name: "FOREST CRK",
      },
      {
        name: "FORSET CK",
      },
    ],
  },
  {
    name: "Dorodong",
    variations: [
      {
        name: "DORO",
      },
    ],
  },
  {
    name: "Doutta Galla",
    variations: [
      {
        name: "DOUTTA GAL",
      },
    ],
  },
  {
    name: "Doveton",
    variations: [
      {
        name: "DOVE",
      },
    ],
  },
  {
    name: "Dreeite",
    variations: [
      {
        name: "DREE",
      },
    ],
  },
  {
    name: "Drik Drik",
    variations: [
      {
        name: "DRIK",
      },
    ],
  },
  {
    name: "Dromana",
    variations: [
      {
        name: "DROM",
      },
      {
        name: "DR OM",
      },
    ],
  },
  {
    name: "Drouin East",
    variations: [
      {
        name: "DROU",
      },
    ],
  },
  {
    name: "Drouin South",
    variations: [
      {
        name: "DROU",
      },
    ],
  },
  {
    name: "Drouin West",
    variations: [
      {
        name: "DROU",
      },
    ],
  },
  {
    name: "Drumanure",
    variations: [
      {
        name: "DRUM",
      },
    ],
  },
  {
    name: "Drumborg",
    variations: [
      {
        name: "DRUM",
      },
    ],
  },
  {
    name: "Drumcondra",
    variations: [
      {
        name: "DRUM",
      },
    ],
  },
  {
    name: "Drummartin",
    variations: [
      {
        name: "DRUM",
      },
    ],
  },
  {
    name: "Drummond North",
    variations: [
      {
        name: "DRUM",
      },
    ],
  },
  {
    name: "Dry Creek",
    variations: [
      {
        name: "DRYC",
      },
    ],
  },
  {
    name: "Drysdale",
    variations: [
      {
        name: "DRYS",
      },
    ],
  },
  {
    name: "Dumbalk",
    variations: [
      {
        name: "DUMB",
      },
    ],
  },
  {
    name: "Dumbalk North",
    variations: [
      {
        name: "DUMB",
      },
    ],
  },
  {
    name: "Dumosa",
    variations: [
      {
        name: "DUMO",
      },
    ],
  },
  {
    name: "Dunach",
    variations: [
      {
        name: "DUNA",
      },
    ],
  },
  {
    name: "Dundas",
    variations: [
      {
        name: "DUND",
      },
    ],
  },
  {
    name: "Dundonnell",
    variations: [
      {
        name: "DUND",
      },
    ],
  },
  {
    name: "Dundas Station",
    variations: [
      {
        name: "DUNDAS STN",
      },
    ],
  },
  {
    name: "Duneed Creek",
    variations: [
      {
        name: "DUNEED",
      },
    ],
  },
  {
    name: "Dunnstown",
    variations: [
      {
        name: "DUNN",
      },
    ],
  },
  {
    name: "Dunolly Hospital",
    variations: [
      {
        name: "DUNOLLY H",
      },
      {
        name: "DUNOLLY HO",
      },
      {
        name: "DUNOLLY HOS",
      },
      {
        name: "DUNOLLY HOSP",
      },
      {
        name: "DUNOLLY HS",
      },
      {
        name: "DUNOLLY HU",
      },
    ],
  },
  {
    name: "Dunrobin",
    variations: [
      {
        name: "DUNR",
      },
    ],
  },
  {
    name: "Durham Ox",
    variations: [
      {
        name: "DURH",
      },
      {
        name: "DU RH",
      },
      {
        name: "DURHAMGP",
      },
      {
        name: "DURHAM O",
      },
    ],
  },
  {
    name: "Dutson",
    variations: [
      {
        name: "DUTS",
      },
    ],
  },
  {
    name: "Eaglemont",
    variations: [
      {
        name: "EAGL",
      },
      {
        name: "EAGLEHAWK",
      },
      {
        name: "EMONT",
      },
    ],
  },
  {
    name: "East Kew",
    variations: [
      {
        name: "EAST",
      },
      {
        name: "EKEW",
      },
      {
        name: "EKFW",
      },
    ],
  },
  {
    name: "East Malvern",
    variations: [
      {
        name: "EAST",
      },
      {
        name: "EMAL",
      },
      {
        name: "EMALV",
      },
      {
        name: "E MALV",
      },
    ],
  },
  {
    name: "Eastern View",
    variations: [
      {
        name: "EAST",
      },
    ],
  },
  {
    name: "East Ballarat",
    variations: [
      {
        name: "E BALLT",
      },
    ],
  },
  {
    name: "Ebden",
    variations: [
      {
        name: "EBDE",
      },
    ],
  },
  {
    name: "Ebden's Station",
    variations: [
      {
        name: "EBDENS STN",
      },
    ],
  },
  {
    name: "East Bentleigh",
    variations: [
      {
        name: "EBEN",
      },
    ],
  },
  {
    name: "East Brunswick",
    variations: [
      {
        name: "EBRU",
      },
    ],
  },
  {
    name: "East Burwood",
    variations: [
      {
        name: "EBUR",
      },
      {
        name: "E BURWOOD",
      },
    ],
  },
  {
    name: "Echuca Hospital",
    variations: [
      {
        name: "ECHUCA H",
      },
      {
        name: "ECHUCA HOS",
      },
      {
        name: "ECHUCA HOSP",
      },
      {
        name: "ECHUCA HSP",
      },
    ],
  },
  {
    name: "Ecklin",
    variations: [
      {
        name: "ECKL",
      },
    ],
  },
  {
    name: "Ecklin South",
    variations: [
      {
        name: "ECKL",
      },
    ],
  },
  {
    name: "East Colac",
    variations: [
      {
        name: "ECOL",
      },
    ],
  },
  {
    name: "East Collingwood",
    variations: [
      {
        name: "E CWOOD",
      },
    ],
  },
  {
    name: "Eden Park",
    variations: [
      {
        name: "EDEN",
      },
      {
        name: "EDEN PK",
      },
    ],
  },
  {
    name: "Edi Upper",
    variations: [
      {
        name: "EDIU",
      },
    ],
  },
  {
    name: "East Doncaster",
    variations: [
      {
        name: "EDON",
      },
    ],
  },
  {
    name: "Edward River",
    variations: [
      {
        name: "EDWA",
      },
    ],
  },
  {
    name: "East Geelong",
    variations: [
      {
        name: "EGEE",
      },
    ],
  },
  {
    name: "Eglington",
    variations: [
      {
        name: "EGLI",
      },
      {
        name: "EG LI",
      },
    ],
  },
  {
    name: "East Hawthorn",
    variations: [
      {
        name: "EHAW",
      },
    ],
  },
  {
    name: "East Hotham",
    variations: [
      {
        name: "E HOTH",
      },
      {
        name: "E HOTHAM",
      },
    ],
  },
  {
    name: "East Hotham Ben Asylum",
    variations: [
      {
        name: "E HOTH B A",
      },
    ],
  },
  {
    name: "East Ivanhoe",
    variations: [
      {
        name: "E IHOE",
      },
      {
        name: "E IVAN",
      },
      {
        name: "E IVANHOE",
      },
    ],
  },
  {
    name: "Eildon",
    variations: [
      {
        name: "EILD",
      },
    ],
  },
  {
    name: "East Keilor",
    variations: [
      {
        name: "EKEI",
      },
    ],
  },
  {
    name: "Eldorado Flat",
    variations: [
      {
        name: "ELDORADO F",
      },
    ],
  },
  {
    name: "Elephant Bridge",
    variations: [
      {
        name: "ELEP",
      },
      {
        name: "ELEPHANT B",
      },
    ],
  },
  {
    name: "Elgar's Special Survey",
    variations: [
      {
        name: "ELGARS SUR",
      },
      {
        name: "ELGARS SURVEY",
      },
      {
        name: "ELGARS SVY",
      },
      {
        name: "SPEC",
      },
    ],
  },
  {
    name: "Elingamite",
    variations: [
      {
        name: "ELIN",
      },
    ],
  },
  {
    name: "Ellaswood",
    variations: [
      {
        name: "ELLA",
      },
    ],
  },
  {
    name: "Ellesmere",
    variations: [
      {
        name: "ELLE",
      },
      {
        name: "EL LE",
      },
    ],
  },
  {
    name: "Elmhurst",
    variations: [
      {
        name: "ELMH",
      },
      {
        name: "EL MH",
      },
      {
        name: "ELMS",
      },
    ],
  },
  {
    name: "Elmsford",
    variations: [
      {
        name: "ELMS",
      },
    ],
  },
  {
    name: "Eltham North",
    variations: [
      {
        name: "ELTH",
      },
    ],
  },
  {
    name: "East Melbourne Benevolent",
    variations: [
      {
        name: "E MELB B A",
      },
    ],
  },
  {
    name: "East Melbourne Hospital",
    variations: [
      {
        name: "E MELB H",
      },
      {
        name: "E MELB HO",
      },
      {
        name: "EMELB HOS",
      },
      {
        name: "E MELB HOS",
      },
      {
        name: "EMELBHOSP",
      },
      {
        name: "EMELB HOSP",
      },
      {
        name: "E MELB HSP",
      },
      {
        name: "E MEL HO",
      },
      {
        name: "E MEL HOS",
      },
      {
        name: "E MEL HOSP",
      },
      {
        name: "E MLB HOSP",
      },
      {
        name: "PMELBHOSP",
      },
    ],
  },
  {
    name: "East Melbourne Lunatic Asylum",
    variations: [
      {
        name: "E MELB L A",
      },
    ],
  },
  {
    name: "Emerald",
    variations: [
      {
        name: "EMER",
      },
    ],
  },
  {
    name: "Emu Creek",
    variations: [
      {
        name: "EMUC",
      },
    ],
  },
  {
    name: "Endeavour Hills",
    variations: [
      {
        name: "ENDE",
      },
    ],
  },
  {
    name: "Enochs Point",
    variations: [
      {
        name: "ENOC",
      },
      {
        name: "EN OC",
      },
    ],
  },
  {
    name: "Ensay",
    variations: [
      {
        name: "ENSA",
      },
    ],
  },
  {
    name: "Ensay North",
    variations: [
      {
        name: "ENSA",
      },
    ],
  },
  {
    name: "Ensay South",
    variations: [
      {
        name: "ENSA",
      },
    ],
  },
  {
    name: "Eppalock",
    variations: [
      {
        name: "EPPA",
      },
    ],
  },
  {
    name: "Ercildoune",
    variations: [
      {
        name: "ERCI",
      },
    ],
  },
  {
    name: "Erica",
    variations: [
      {
        name: "ERIC",
      },
    ],
  },
  {
    name: "East Ringwood",
    variations: [
      {
        name: "ERIN",
      },
    ],
  },
  {
    name: "Erinbank",
    variations: [
      {
        name: "ERIN",
      },
    ],
  },
  {
    name: "Eskdale",
    variations: [
      {
        name: "ESKD",
      },
    ],
  },
  {
    name: "Esmond",
    variations: [
      {
        name: "ESMO",
      },
    ],
  },
  {
    name: "Essendon North",
    variations: [
      {
        name: "ESSE",
      },
    ],
  },
  {
    name: "Essendon West",
    variations: [
      {
        name: "ESSE",
      },
    ],
  },
  {
    name: "East St Kilda",
    variations: [
      {
        name: "ESTK",
      },
      {
        name: "E ST K",
      },
      {
        name: "EST ST K",
      },
      {
        name: "S ST K",
      },
    ],
  },
  {
    name: "Eumemmerring",
    variations: [
      {
        name: "EUME",
      },
    ],
  },
  {
    name: "Eumerella",
    variations: [
      {
        name: "EUME",
      },
    ],
  },
  {
    name: "Euroa",
    variations: [
      {
        name: "EUR",
      },
      {
        name: "EURO",
      },
      {
        name: "EU RO",
      },
    ],
  },
  {
    name: "Eurack",
    variations: [
      {
        name: "EURA",
      },
    ],
  },
  {
    name: "Eureka",
    variations: [
      {
        name: "EURE",
      },
    ],
  },
  {
    name: "Eurobin",
    variations: [
      {
        name: "EURO",
      },
    ],
  },
  {
    name: "Europe Gully",
    variations: [
      {
        name: "EUROPE GLY",
      },
    ],
  },
  {
    name: "East Wandin",
    variations: [
      {
        name: "EWAN",
      },
    ],
  },
  {
    name: "North Williamstown",
    variations: [
      {
        name: "E WTOWN",
      },
      {
        name: "NTH WMSTN",
      },
      {
        name: "NTH WSTOWN",
      },
      {
        name: "NTH WTN",
      },
      {
        name: "NTH WTOWN",
      },
      {
        name: "NWIL",
      },
      {
        name: "N WSTOWN",
      },
      {
        name: "N WTOWN",
      },
    ],
  },
  {
    name: "Exford Station",
    variations: [
      {
        name: "EXFORD STN",
      },
    ],
  },
  {
    name: "Fairfield",
    variations: [
      {
        name: "FAIR",
      },
      {
        name: "FA IR",
      },
      {
        name: "FFIELD",
      },
      {
        name: "FFLD",
      },
      {
        name: "PIIMM",
      },
    ],
  },
  {
    name: "Fairhaven",
    variations: [
      {
        name: "FAIR",
      },
    ],
  },
  {
    name: "Fairy Dell",
    variations: [
      {
        name: "FAIR",
      },
    ],
  },
  {
    name: "Falls Creek",
    variations: [
      {
        name: "FALL",
      },
    ],
  },
  {
    name: "Fishermans Bend",
    variations: [
      {
        name: "F BEND",
      },
      {
        name: "FISH",
      },
      {
        name: "FISH BEND",
      },
      {
        name: "FISHERMANS",
      },
      {
        name: "FISHERMENS B",
      },
    ],
  },
  {
    name: "Ferguson",
    variations: [
      {
        name: "FERG",
      },
    ],
  },
  {
    name: "Fernbank",
    variations: [
      {
        name: "FERN",
      },
    ],
  },
  {
    name: "Fernihurst",
    variations: [
      {
        name: "FERN",
      },
      {
        name: "FE RN",
      },
    ],
  },
  {
    name: "Fernshaw",
    variations: [
      {
        name: "FERN",
      },
    ],
  },
  {
    name: "Ferny Creek",
    variations: [
      {
        name: "FERN",
      },
    ],
  },
  {
    name: "Fingal",
    variations: [
      {
        name: "FING",
      },
    ],
  },
  {
    name: "Fish Creek",
    variations: [
      {
        name: "FISH",
      },
      {
        name: "FISH CK",
      },
      {
        name: "FISH CR",
      },
    ],
  },
  {
    name: "Fiskville",
    variations: [
      {
        name: "FISK",
      },
    ],
  },
  {
    name: "Fitzroy North",
    variations: [
      {
        name: "FITA N",
      },
      {
        name: "FITZN",
      },
      {
        name: "FROY N",
      },
    ],
  },
  {
    name: "Fitzroy South Convent",
    variations: [
      {
        name: "FITZ S CONVENT",
      },
    ],
  },
  {
    name: "Five Flags",
    variations: [
      {
        name: "FIVE FLAGS",
      },
    ],
  },
  {
    name: "Flaggy Creek",
    variations: [
      {
        name: "FLAG",
      },
    ],
  },
  {
    name: "Flagstaff",
    variations: [
      {
        name: "FLAG",
      },
    ],
  },
  {
    name: "Yarra Flats??",
    variations: [
      {
        name: "FLAT",
      },
    ],
  },
  {
    name: "Flemington & Kensington",
    variations: [
      {
        name: "FLEMINGTON-KENS",
      },
      {
        name: "FTONANDKTON",
      },
      {
        name: "FTON AND KTON",
      },
      {
        name: "FTON KTO",
      },
      {
        name: "FTONKTON",
      },
      {
        name: "FTON KTON",
      },
    ],
  },
  {
    name: "Flora Hill",
    variations: [
      {
        name: "FLOR",
      },
    ],
  },
  {
    name: "Flowerdale",
    variations: [
      {
        name: "FLOW",
      },
    ],
  },
  {
    name: "Flemington (& Kensington?)",
    variations: [
      {
        name: "FLTON BAN",
      },
    ],
  },
  {
    name: "Flemington Hill",
    variations: [
      {
        name: "FLTON HIL",
      },
    ],
  },
  {
    name: "Flemington Hospital",
    variations: [
      {
        name: "FLTON HOSP",
      },
    ],
  },
  {
    name: "Flynn",
    variations: [
      {
        name: "FLYN",
      },
    ],
  },
  {
    name: "Flynns Creek",
    variations: [
      {
        name: "FLYN",
      },
    ],
  },
  {
    name: "Forest Hill",
    variations: [
      {
        name: "FORE",
      },
    ],
  },
  {
    name: "Forest Station",
    variations: [
      {
        name: "FOREST STN",
      },
    ],
  },
  {
    name: "Forge Creek",
    variations: [
      {
        name: "FORG",
      },
    ],
  },
  {
    name: "Forrest",
    variations: [
      {
        name: "FORR",
      },
    ],
  },
  {
    name: "Fosterville",
    variations: [
      {
        name: "FOST",
      },
      {
        name: "FVILLE",
      },
      {
        name: "F VILLE",
      },
      {
        name: "P VILLE",
      },
    ],
  },
  {
    name: "Four Mile Flat",
    variations: [
      {
        name: "FOUR MILE",
      },
      {
        name: "FOUR MLE F",
      },
    ],
  },
  {
    name: "Fran???",
    variations: [
      {
        name: "FRAN",
      },
      {
        name: "FR AN",
      },
    ],
  },
  {
    name: "Franklinford",
    variations: [
      {
        name: "FRAN",
      },
      {
        name: "FR AN",
      },
    ],
  },
  {
    name: "Frenchmans",
    variations: [
      {
        name: "FREN",
      },
      {
        name: "FR EN",
      },
    ],
  },
  {
    name: "Friars Creek",
    variations: [
      {
        name: "FRIA",
      },
      {
        name: "FRIARS CRK",
      },
    ],
  },
  {
    name: "Friars Town",
    variations: [
      {
        name: "FRIA",
      },
      {
        name: "FRIARS TWN",
      },
    ],
  },
  {
    name: "Ferntree Gully",
    variations: [
      {
        name: "FRNT GLY",
      },
      {
        name: "F T G",
      },
      {
        name: "FTGULLY",
      },
      {
        name: "F T GULLY",
      },
      {
        name: "FTREE",
      },
      {
        name: "FTREE G",
      },
      {
        name: "FTREE GUL",
      },
      {
        name: "FTREE GULLY",
      },
      {
        name: "GTREE GLY",
      },
    ],
  },
  {
    name: "Fitzroy South",
    variations: [
      {
        name: "FROY S",
      },
    ],
  },
  {
    name: "Fryers Creek",
    variations: [
      {
        name: "FRYE",
      },
      {
        name: "FR YE",
      },
      {
        name: "FRYERS CK",
      },
    ],
  },
  {
    name: "Fryers Forest",
    variations: [
      {
        name: "FRYE",
      },
    ],
  },
  {
    name: "Fulham",
    variations: [
      {
        name: "FULH",
      },
    ],
  },
  {
    name: "Fumina",
    variations: [
      {
        name: "FUMI",
      },
    ],
  },
  {
    name: "Fumina South",
    variations: [
      {
        name: "FUMI",
      },
    ],
  },
  {
    name: "Fyans Creek",
    variations: [
      {
        name: "FYAN",
      },
    ],
  },
  {
    name: "Gaffneys Creek",
    variations: [
      {
        name: "GAFF",
      },
      {
        name: "GA FF",
      },
      {
        name: "GAFF CK",
      },
      {
        name: "GAFF CREEK",
      },
      {
        name: "GAFFNEYS C",
      },
      {
        name: "GAFFNEYS CK",
      },
      {
        name: "GAFFNEYS CRK",
      },
    ],
  },
  {
    name: "Gannawarra",
    variations: [
      {
        name: "GANN",
      },
    ],
  },
  {
    name: "Gapsted",
    variations: [
      {
        name: "GAPS",
      },
    ],
  },
  {
    name: "Gardenvale",
    variations: [
      {
        name: "GARD",
      },
      {
        name: "GVALE",
      },
    ],
  },
  {
    name: "Gardiner",
    variations: [
      {
        name: "GARD",
      },
      {
        name: "GA RD",
      },
    ],
  },
  {
    name: "Gardiners Creek",
    variations: [
      {
        name: "GARD",
      },
    ],
  },
  {
    name: "Garfield",
    variations: [
      {
        name: "GARF",
      },
    ],
  },
  {
    name: "Gatum",
    variations: [
      {
        name: "GATU",
      },
    ],
  },
  {
    name: "Gazette",
    variations: [
      {
        name: "GAZE",
      },
    ],
  },
  {
    name: "Geelong Hospital",
    variations: [
      {
        name: "GEELONG HO",
      },
      {
        name: "GEELONG HOS",
      },
      {
        name: "GEELONG HOSP",
      },
      {
        name: "G HOSP",
      },
      {
        name: "GLNG HOSP",
      },
      {
        name: "GLONG H",
      },
      {
        name: "G LONG H",
      },
      {
        name: "GLONG HOS",
      },
      {
        name: "G LONG HOS",
      },
      {
        name: "GLONGHOSP",
      },
      {
        name: "GLONG HOSP",
      },
      {
        name: "G LONG HOSP",
      },
      {
        name: "GLONG HOSPL",
      },
      {
        name: "GLONG HSP",
      },
    ],
  },
  {
    name: "Geelong West",
    variations: [
      {
        name: "GEELONG W",
      },
      {
        name: "GEEL W",
      },
      {
        name: "G LONG W",
      },
    ],
  },
  {
    name: "Glen Eira",
    variations: [
      {
        name: "G EIRA",
      },
    ],
  },
  {
    name: "Gelantipy",
    variations: [
      {
        name: "GELA",
      },
    ],
  },
  {
    name: "Gellibrand",
    variations: [
      {
        name: "GELL",
      },
    ],
  },
  {
    name: "Gelliondale",
    variations: [
      {
        name: "GELL",
      },
    ],
  },
  {
    name: "Gerangamete",
    variations: [
      {
        name: "GERA",
      },
    ],
  },
  {
    name: "Gerang Gerung",
    variations: [
      {
        name: "GERA",
      },
    ],
  },
  {
    name: "Glenferrie",
    variations: [
      {
        name: "GFERRIE",
      },
    ],
  },
  {
    name: "Gheringhap",
    variations: [
      {
        name: "GHER",
      },
      {
        name: "GH ER",
      },
    ],
  },
  {
    name: "Ghin Ghin",
    variations: [
      {
        name: "GHIN",
      },
    ],
  },
  {
    name: "Glenhuntly",
    variations: [
      {
        name: "GHUNTLY",
      },
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Giffard West",
    variations: [
      {
        name: "GIFF",
      },
    ],
  },
  {
    name: "Gilderoy",
    variations: [
      {
        name: "GILD",
      },
    ],
  },
  {
    name: "Gipsy Point",
    variations: [
      {
        name: "GIPS",
      },
    ],
  },
  {
    name: "Girgarre",
    variations: [
      {
        name: "GIRG",
      },
    ],
  },
  {
    name: "Glen Iris",
    variations: [
      {
        name: "GIRI",
      },
      {
        name: "G IRIS",
      },
      {
        name: "GLEN",
      },
      {
        name: "GLEN I",
      },
      {
        name: "GL I",
      },
    ],
  },
  {
    name: "Gladstone Park",
    variations: [
      {
        name: "GLAD",
      },
    ],
  },
  {
    name: "Gladysdale",
    variations: [
      {
        name: "GLAD",
      },
    ],
  },
  {
    name: "Glenaladale",
    variations: [
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Glenalbyn",
    variations: [
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Glenaroua",
    variations: [
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Glenbervie",
    variations: [
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Glenburn",
    variations: [
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Glendonald",
    variations: [
      {
        name: "GLEN",
      },
      {
        name: "GL EN",
      },
    ],
  },
  {
    name: "Glenelg River",
    variations: [
      {
        name: "GLEN",
      },
      {
        name: "GLENELG",
      },
      {
        name: "GLENELG R",
      },
      {
        name: "GLENELG RI",
      },
      {
        name: "GLENELG RV",
      },
    ],
  },
  {
    name: "Glenelg Station",
    variations: [
      {
        name: "GLEN",
      },
      {
        name: "GLENELG",
      },
    ],
  },
  {
    name: "Glenfalloch",
    variations: [
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Glenfyne",
    variations: [
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Glengarry",
    variations: [
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Glengarry North",
    variations: [
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Glengarry West",
    variations: [
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Glengower",
    variations: [
      {
        name: "GLEN",
      },
      {
        name: "GL EN",
      },
    ],
  },
  {
    name: "Glenhope",
    variations: [
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Glenloth",
    variations: [
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Glenlyon",
    variations: [
      {
        name: "GLEN",
      },
      {
        name: "GL EN",
      },
      {
        name: "GLYON",
      },
    ],
  },
  {
    name: "Glenmaggie",
    variations: [
      {
        name: "GLEN",
      },
      {
        name: "GL EN",
      },
      {
        name: "GMAGGIE",
      },
    ],
  },
  {
    name: "Glenormiston",
    variations: [
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Glenormiston North",
    variations: [
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Glenormiston South",
    variations: [
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Glenorchy",
    variations: [
      {
        name: "GLEN",
      },
      {
        name: "GL EN",
      },
      {
        name: "GORCHY",
      },
    ],
  },
  {
    name: "Glenorchy Station",
    variations: [
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Glenrowan",
    variations: [
      {
        name: "GLEN",
      },
      {
        name: "GL EN",
      },
    ],
  },
  {
    name: "Glen Waverley",
    variations: [
      {
        name: "GLEN",
      },
    ],
  },
  {
    name: "Glendinning Station",
    variations: [
      {
        name: "GLENDENNIN",
      },
      {
        name: "GLENDINNIN",
      },
    ],
  },
  {
    name: "Glengyle Estate (or Farm)",
    variations: [
      {
        name: "GLENGYLE",
      },
    ],
  },
  {
    name: "Glenlivet Station",
    variations: [
      {
        name: "GLENLIVET",
      },
    ],
  },
  {
    name: "Geelong Benevolent Asylum",
    variations: [
      {
        name: "GLONG B A",
      },
    ],
  },
  {
    name: "Geelong Convent",
    variations: [
      {
        name: "GLONG CONVENT",
      },
      {
        name: "G LONG CONVENT",
      },
    ],
  },
  {
    name: "Geelong Gaol",
    variations: [
      {
        name: "GLONG G",
      },
      {
        name: "GLONG GAO",
      },
      {
        name: "GLONG GAOL",
      },
      {
        name: "G LONG GAO",
      },
      {
        name: "G LONG GAOL",
      },
      {
        name: "GLONG GAV",
      },
      {
        name: "GLONG GL",
      },
      {
        name: "GLONG GOA",
      },
      {
        name: "GLONG GOAL",
      },
    ],
  },
  {
    name: "Golden Gully",
    variations: [
      {
        name: "GOLD",
      },
      {
        name: "GOLDEN G",
      },
      {
        name: "GOLDEN GLY",
      },
      {
        name: "GOLDEN GUL",
      },
      {
        name: "GOLDEN GY",
      },
    ],
  },
  {
    name: "Goldsborough",
    variations: [
      {
        name: "GOLD",
      },
      {
        name: "GO LD",
      },
    ],
  },
  {
    name: "Gonn Crossing",
    variations: [
      {
        name: "GONN",
      },
    ],
  },
  {
    name: "Gooleys Creek",
    variations: [
      {
        name: "GOOLEYS C",
      },
    ],
  },
  {
    name: "Goomalibee",
    variations: [
      {
        name: "GOOM",
      },
    ],
  },
  {
    name: "Gormandale",
    variations: [
      {
        name: "GO OM",
      },
      {
        name: "GORM",
      },
      {
        name: "GO RM",
      },
      {
        name: "GORN",
      },
    ],
  },
  {
    name: "Goongerah",
    variations: [
      {
        name: "GOON",
      },
    ],
  },
  {
    name: "Goon Nure",
    variations: [
      {
        name: "GOON",
      },
    ],
  },
  {
    name: "Goornong",
    variations: [
      {
        name: "GOON",
      },
      {
        name: "GOONBONG",
      },
      {
        name: "GOOR",
      },
      {
        name: "GO OR",
      },
    ],
  },
  {
    name: "Gooram",
    variations: [
      {
        name: "GOOR",
      },
    ],
  },
  {
    name: "Goorambat",
    variations: [
      {
        name: "GOOR",
      },
    ],
  },
  {
    name: "Gorae",
    variations: [
      {
        name: "GORA",
      },
    ],
  },
  {
    name: "Gordon",
    variations: [
      {
        name: "GORD",
      },
      {
        name: "GO RD",
      },
    ],
  },
  {
    name: "Goschen",
    variations: [
      {
        name: "GOSC",
      },
    ],
  },
  {
    name: "Goughs Bay",
    variations: [
      {
        name: "GOUG",
      },
    ],
  },
  {
    name: "Goulburn",
    variations: [
      {
        name: "GOUL",
      },
    ],
  },
  {
    name: "Goulburn Weir",
    variations: [
      {
        name: "GOUL",
      },
    ],
  },
  {
    name: "Gould",
    variations: [
      {
        name: "GOUL",
      },
    ],
  },
  {
    name: "Gowangardie",
    variations: [
      {
        name: "GOWA",
      },
    ],
  },
  {
    name: "Gowar East",
    variations: [
      {
        name: "GOWA",
      },
    ],
  },
  {
    name: "Grahamvale",
    variations: [
      {
        name: "GRAH",
      },
    ],
  },
  {
    name: "Grange",
    variations: [
      {
        name: "GRAN",
      },
    ],
  },
  {
    name: "Granite Rock",
    variations: [
      {
        name: "GRAN",
      },
    ],
  },
  {
    name: "Grant",
    variations: [
      {
        name: "GRAN",
      },
      {
        name: "GR AN",
      },
      {
        name: "GRANT",
      },
    ],
  },
  {
    name: "Granton",
    variations: [
      {
        name: "GRAN",
      },
    ],
  },
  {
    name: "Grantville",
    variations: [
      {
        name: "GRAN",
      },
      {
        name: "GR AN",
      },
      {
        name: "GVILLE",
      },
    ],
  },
  {
    name: "Granya",
    variations: [
      {
        name: "GRAN",
      },
      {
        name: "GR AN",
      },
    ],
  },
  {
    name: "Grassdale",
    variations: [
      {
        name: "GRAS",
      },
      {
        name: "GR AS",
      },
    ],
  },
  {
    name: "Grassmere",
    variations: [
      {
        name: "GRAS",
      },
    ],
  },
  {
    name: "Greenvale",
    variations: [
      {
        name: "GRE",
      },
      {
        name: "GREE",
      },
      {
        name: "GR EE",
      },
    ],
  },
  {
    name: "Gredgwin",
    variations: [
      {
        name: "GRED",
      },
    ],
  },
  {
    name: "Greendale",
    variations: [
      {
        name: "GREE",
      },
      {
        name: "GR EE",
      },
    ],
  },
  {
    name: "Greenhill",
    variations: [
      {
        name: "GREE",
      },
    ],
  },
  {
    name: "Greens Creek",
    variations: [
      {
        name: "GREE",
      },
    ],
  },
  {
    name: "Greenwald",
    variations: [
      {
        name: "GREE",
      },
      {
        name: "GR EE",
      },
    ],
  },
  {
    name: "Gre Gre",
    variations: [
      {
        name: "GREG",
      },
      {
        name: "GR EG",
      },
    ],
  },
  {
    name: "Greta South",
    variations: [
      {
        name: "GRET",
      },
    ],
  },
  {
    name: "Greta West",
    variations: [
      {
        name: "GRET",
      },
    ],
  },
  {
    name: "Greythorn",
    variations: [
      {
        name: "GREY",
      },
    ],
  },
  {
    name: "Gringegalgona",
    variations: [
      {
        name: "GRIN",
      },
    ],
  },
  {
    name: "Grovedale",
    variations: [
      {
        name: "GROV",
      },
    ],
  },
  {
    name: "Gruyere",
    variations: [
      {
        name: "GRUY",
      },
    ],
  },
  {
    name: "Gulf Station",
    variations: [
      {
        name: "GULF STN",
      },
    ],
  },
  {
    name: "Gundowring",
    variations: [
      {
        name: "GUND",
      },
    ],
  },
  {
    name: "Gunis Station",
    variations: [
      {
        name: "GUNIS STN",
      },
    ],
  },
  {
    name: "Guys Forest",
    variations: [
      {
        name: "GUYS",
      },
    ],
  },
  {
    name: "Guys Hill",
    variations: [
      {
        name: "GUYS",
      },
    ],
  },
  {
    name: "Great Britain (Ship)",
    variations: [
      {
        name: "GT BRITAIN",
      },
    ],
  },
  {
    name: "Great Western Diggings",
    variations: [
      {
        name: "GT WEST D",
      },
      {
        name: "GT WEST DG",
      },
      {
        name: "GT WEST DI",
      },
      {
        name: "GT WESTN D",
      },
      {
        name: "GT WST DIG",
      },
      {
        name: "GT WSTN DG",
      },
    ],
  },
  {
    name: "Gymbowen",
    variations: [
      {
        name: "GYMB",
      },
      {
        name: "GY MB",
      },
    ],
  },
  {
    name: "Hadfield",
    variations: [
      {
        name: "HADF",
      },
    ],
  },
  {
    name: "Half-way Diggings",
    variations: [
      {
        name: "HALF",
      },
    ],
  },
  {
    name: "Hallam",
    variations: [
      {
        name: "HALL",
      },
    ],
  },
  {
    name: "Hallora",
    variations: [
      {
        name: "HALL",
      },
    ],
  },
  {
    name: "Halls Gap",
    variations: [
      {
        name: "HALL",
      },
    ],
  },
  {
    name: "Hallston",
    variations: [
      {
        name: "HALL",
      },
    ],
  },
  {
    name: "Hamilton Hospital",
    variations: [
      {
        name: "HAMILTON H",
      },
      {
        name: "HTON C H",
      },
      {
        name: "HTON H",
      },
      {
        name: "HTON HOPL",
      },
      {
        name: "HTON HOS",
      },
      {
        name: "HTON HOSH",
      },
      {
        name: "HTON HOSP",
      },
      {
        name: "H TON HOSP",
      },
      {
        name: "HTON HSP",
      },
    ],
  },
  {
    name: "Hamlyn Heights",
    variations: [
      {
        name: "HAML",
      },
    ],
  },
  {
    name: "Hampton Park",
    variations: [
      {
        name: "HAMP",
      },
    ],
  },
  {
    name: "Hansonville",
    variations: [
      {
        name: "HANS",
      },
    ],
  },
  {
    name: "Hard Hills",
    variations: [
      {
        name: "HARD",
      },
    ],
  },
  {
    name: "Harkaway",
    variations: [
      {
        name: "HARK",
      },
    ],
  },
  {
    name: "Harmers Haven",
    variations: [
      {
        name: "HARM",
      },
    ],
  },
  {
    name: "Harston",
    variations: [
      {
        name: "HARS",
      },
    ],
  },
  {
    name: "Hattah",
    variations: [
      {
        name: "HATT",
      },
    ],
  },
  {
    name: "Havelock Flat",
    variations: [
      {
        name: "HAVELOCK F",
      },
    ],
  },
  {
    name: "Hawkesdale",
    variations: [
      {
        name: "HAWK",
      },
      {
        name: "HA WK",
      },
      {
        name: "HDALE",
      },
    ],
  },
  {
    name: "Hawksburn",
    variations: [
      {
        name: "HAWK",
      },
    ],
  },
  {
    name: "Hazeldene",
    variations: [
      {
        name: "HAZE",
      },
    ],
  },
  {
    name: "Hazel Park",
    variations: [
      {
        name: "HAZE",
      },
    ],
  },
  {
    name: "Hazelwood",
    variations: [
      {
        name: "HAZE",
      },
      {
        name: "HA ZE",
      },
      {
        name: "HAZL",
      },
    ],
  },
  {
    name: "Hazelwood North",
    variations: [
      {
        name: "HAZE",
      },
    ],
  },
  {
    name: "Heidelberg Austin Hospital",
    variations: [
      {
        name: "HBERG A H",
      },
      {
        name: "HBERG A HOS",
      },
      {
        name: "HBERG A HOSP",
      },
      {
        name: "H BERG A HOSP",
      },
      {
        name: "HBERG AUS H",
      },
      {
        name: "HBERG AUS HOS",
      },
      {
        name: "HBERG AUS HOSP",
      },
      {
        name: "H BERG AUS HOSP",
      },
      {
        name: "H BERG AUSTIN HO",
      },
      {
        name: "HBERG AUSTIN HOS",
      },
      {
        name: "H BERG AUSTIN HOS",
      },
      {
        name: "HBERG AUSTIN HOSP",
      },
      {
        name: "HEIDELBERG A H",
      },
      {
        name: "HEIDELBERG A HOSP",
      },
    ],
  },
  {
    name: "Heidelberg Hospital",
    variations: [
      {
        name: "HBERG H",
      },
      {
        name: "H BERG H",
      },
      {
        name: "HBERG HO",
      },
      {
        name: "HBERG HOS",
      },
      {
        name: "H BERG HOS",
      },
      {
        name: "HBERG HOSP",
      },
      {
        name: "H BERG HOSP",
      },
    ],
  },
  {
    name: "Heidelberg Immigrants Hospital",
    variations: [
      {
        name: "HBERG IMM H",
      },
    ],
  },
  {
    name: "Thornbury",
    variations: [
      {
        name: "HBURY",
      },
      {
        name: "TBURY",
      },
      {
        name: "THOR",
      },
    ],
  },
  {
    name: "Heathcote Hospital",
    variations: [
      {
        name: "HCOTE H",
      },
      {
        name: "HCOTE HOS",
      },
      {
        name: "HCOTEHOSP",
      },
      {
        name: "HCOTE HOSP",
      },
      {
        name: "HEATHCOTE H",
      },
    ],
  },
  {
    name: "Hughesdale",
    variations: [
      {
        name: "HDALE",
      },
      {
        name: "HUGH",
      },
    ],
  },
  {
    name: "Heart Station",
    variations: [
      {
        name: "HEART ST",
      },
    ],
  },
  {
    name: "Heathcote Junction",
    variations: [
      {
        name: "HEAT",
      },
    ],
  },
  {
    name: "Heatherton",
    variations: [
      {
        name: "HEAT",
      },
    ],
  },
  {
    name: "Heathmere",
    variations: [
      {
        name: "HEAT",
      },
    ],
  },
  {
    name: "Heathmont",
    variations: [
      {
        name: "HEAT",
      },
    ],
  },
  {
    name: "Hedley",
    variations: [
      {
        name: "HEDL",
      },
    ],
  },
  {
    name: "Henty",
    variations: [
      {
        name: "HENT",
      },
    ],
  },
  {
    name: "Herne Hill",
    variations: [
      {
        name: "HERN",
      },
    ],
  },
  {
    name: "Hernes Oak",
    variations: [
      {
        name: "HERN",
      },
    ],
  },
  {
    name: "Hesse",
    variations: [
      {
        name: "HESS",
      },
    ],
  },
  {
    name: "Heyington",
    variations: [
      {
        name: "HEYI",
      },
    ],
  },
  {
    name: "Heyington or Hawthorn",
    variations: [
      {
        name: "HEYI",
      },
    ],
  },
  {
    name: "Hiawatha",
    variations: [
      {
        name: "HIAW",
      },
    ],
  },
  {
    name: "High Camp",
    variations: [
      {
        name: "HIGH",
      },
    ],
  },
  {
    name: "Highett",
    variations: [
      {
        name: "HIGH",
      },
    ],
  },
  {
    name: "Hilgay",
    variations: [
      {
        name: "HILG",
      },
    ],
  },
  {
    name: "Hill End",
    variations: [
      {
        name: "HILL",
      },
    ],
  },
  {
    name: "Hillside",
    variations: [
      {
        name: "HILL",
      },
    ],
  },
  {
    name: "Hinds",
    variations: [
      {
        name: "HIND",
      },
    ],
  },
  {
    name: "Hinnomunjie",
    variations: [
      {
        name: "HINN",
      },
    ],
  },
  {
    name: "Hiscock's Gully",
    variations: [
      {
        name: "HISC",
      },
    ],
  },
  {
    name: "Hobsons Bay",
    variations: [
      {
        name: "HOBS",
      },
      {
        name: "HOBSON",
      },
      {
        name: "HOBSONS BA",
      },
      {
        name: "HOBSONS BY",
      },
    ],
  },
  {
    name: "Hochkirk",
    variations: [
      {
        name: "HOCH",
      },
      {
        name: "HO CH",
      },
      {
        name: "HOCK",
      },
    ],
  },
  {
    name: "Holmesglen",
    variations: [
      {
        name: "HOLM",
      },
    ],
  },
  {
    name: "Homerton",
    variations: [
      {
        name: "HOME",
      },
    ],
  },
  {
    name: "Homewood",
    variations: [
      {
        name: "HOME",
      },
    ],
  },
  {
    name: "Hopetoun",
    variations: [
      {
        name: "HOPE",
      },
      {
        name: "HO PE",
      },
      {
        name: "HTOUN",
      },
      {
        name: "HTOWN",
      },
    ],
  },
  {
    name: "Hope's Station",
    variations: [
      {
        name: "HOPES STN",
      },
    ],
  },
  {
    name: "Hopkins River",
    variations: [
      {
        name: "HOPK",
      },
    ],
  },
  {
    name: "Hoppers Crossing",
    variations: [
      {
        name: "HOPP",
      },
    ],
  },
  {
    name: "Hordern Vale",
    variations: [
      {
        name: "HORD",
      },
    ],
  },
  {
    name: "Horfield",
    variations: [
      {
        name: "HORF",
      },
    ],
  },
  {
    name: "Hotham West Ben Asylum",
    variations: [
      {
        name: "HORH W B A",
      },
      {
        name: "HOTHAM WEST B A",
      },
      {
        name: "HOTH W A ASY",
      },
      {
        name: "HOTH W BA",
      },
      {
        name: "HOTH W B A",
      },
      {
        name: "HOTH W B ASSY",
      },
      {
        name: "HOTH W B ASY",
      },
      {
        name: "HOTH W BEN ASSY",
      },
      {
        name: "HOTH WBEN ASY",
      },
      {
        name: "HOTH W BENASY",
      },
      {
        name: "HOTH W BEN ASY",
      },
      {
        name: "HOTH W BEN ASLYM",
      },
      {
        name: "HOTH W BENT ASY",
      },
      {
        name: "HOTH W BEN ASYLM",
      },
      {
        name: "HOTH WBW",
      },
    ],
  },
  {
    name: "Horsham Hospital",
    variations: [
      {
        name: "HORSHAM H",
      },
      {
        name: "HORSHAM HO",
      },
      {
        name: "HORSHAM HOSP",
      },
      {
        name: "HORSHAM HS",
      },
      {
        name: "HORSH H",
      },
      {
        name: "HORSH HOS",
      },
      {
        name: "HORSH HOSP",
      },
      {
        name: "HORS HOSP",
      },
    ],
  },
  {
    name: "Hospital Ballarat",
    variations: [
      {
        name: "HOSP BALLT",
      },
    ],
  },
  {
    name: "Hotham Benevolent Asylum",
    variations: [
      {
        name: "HOTHAM B A",
      },
      {
        name: "HOTH B A",
      },
    ],
  },
  {
    name: "Hotham North",
    variations: [
      {
        name: "HOTHAM N",
      },
      {
        name: "HOTH N",
      },
    ],
  },
  {
    name: "Hotham West",
    variations: [
      {
        name: "HOTHAM W",
      },
      {
        name: "HOTH WE",
      },
      {
        name: "HOTH WEST",
      },
      {
        name: "HOTH WM",
      },
      {
        name: "HOTH WW",
      },
    ],
  },
  {
    name: "Hotham Hill",
    variations: [
      {
        name: "HOTH H",
      },
    ],
  },
  {
    name: "Hotham Hill Ben Asylum",
    variations: [
      {
        name: "HOTH H B A",
      },
    ],
  },
  {
    name: "Hotham North Ben Asylum",
    variations: [
      {
        name: "HOTH N B A",
      },
    ],
  },
  {
    name: "Hotham West Asylum",
    variations: [
      {
        name: "HOTH W ASL",
      },
    ],
  },
  {
    name: "Hotham West Benevolent",
    variations: [
      {
        name: "HOTH W BEN",
      },
    ],
  },
  {
    name: "Hotham West Hospital Ben Asy",
    variations: [
      {
        name: "HOTH W HOSP BEN A",
      },
    ],
  },
  {
    name: "Hotham West Lunatic Asylum",
    variations: [
      {
        name: "HOTH W LUN ASY",
      },
    ],
  },
  {
    name: "Hovells Creek",
    variations: [
      {
        name: "HOVE",
      },
      {
        name: "HOVELLS",
      },
      {
        name: "HOVELLS C",
      },
      {
        name: "HOVELLS CK",
      },
      {
        name: "HOVELLS CR",
      },
      {
        name: "HOWALLA CR",
      },
    ],
  },
  {
    name: "Howes Creek",
    variations: [
      {
        name: "HOWE",
      },
    ],
  },
  {
    name: "Howqua",
    variations: [
      {
        name: "HOWQ",
      },
      {
        name: "HO WQ",
      },
    ],
  },
  {
    name: "Hume River",
    variations: [
      {
        name: "HUME",
      },
      {
        name: "HUME RIV",
      },
      {
        name: "HUME RIVER",
      },
    ],
  },
  {
    name: "Humevale",
    variations: [
      {
        name: "HUME",
      },
    ],
  },
  {
    name: "Huntingdale",
    variations: [
      {
        name: "HUNT",
      },
    ],
  },
  {
    name: "Hurdle Flat or Creek",
    variations: [
      {
        name: "HURDLE",
      },
    ],
  },
  {
    name: "Hurdle Creek",
    variations: [
      {
        name: "HURDLE CK",
      },
      {
        name: "HURDLE CRK",
      },
    ],
  },
  {
    name: "Hurstbridge",
    variations: [
      {
        name: "HURS",
      },
    ],
  },
  {
    name: "Hustlers Reef",
    variations: [
      {
        name: "HUSTLERS",
      },
      {
        name: "HUSTLERS R",
      },
    ],
  },
  {
    name: "Healesville",
    variations: [
      {
        name: "HVILLE",
      },
      {
        name: "H VILLE",
      },
    ],
  },
  {
    name: "Icy Creek",
    variations: [
      {
        name: "ICYC",
      },
    ],
  },
  {
    name: "Illowa",
    variations: [
      {
        name: "ILLO",
      },
    ],
  },
  {
    name: "Melbourne Immigrants Home",
    variations: [
      {
        name: "IMM H MELB",
      },
      {
        name: "MELB IMM H",
      },
      {
        name: "MELB IMM HOME",
      },
    ],
  },
  {
    name: "Ingliston",
    variations: [
      {
        name: "INGL",
      },
    ],
  },
  {
    name: "Inglewood Hospital",
    variations: [
      {
        name: "INGLEWOOD HOSP",
      },
      {
        name: "INGLEWOOD HOSPITA",
      },
      {
        name: "IWOOD H",
      },
      {
        name: "IWOOD HO",
      },
      {
        name: "IWOOD HOS",
      },
      {
        name: "I WOOD HOS",
      },
      {
        name: "IWOODHOSP",
      },
      {
        name: "IWOOD HOSP",
      },
      {
        name: "I WOOD HOSP",
      },
      {
        name: "IWOOD HOSPL",
      },
      {
        name: "I WOOD HOSPL",
      },
      {
        name: "IWOOD HSP",
      },
    ],
  },
  {
    name: "Invergordon",
    variations: [
      {
        name: "INVE",
      },
    ],
  },
  {
    name: "Inverloch",
    variations: [
      {
        name: "INVE",
      },
    ],
  },
  {
    name: "Invermay",
    variations: [
      {
        name: "INVE",
      },
    ],
  },
  {
    name: "Iraak",
    variations: [
      {
        name: "IRAA",
      },
    ],
  },
  {
    name: "Irishtown",
    variations: [
      {
        name: "IRIS",
      },
      {
        name: "IR IS",
      },
    ],
  },
  {
    name: "Ironbark",
    variations: [
      {
        name: "IRON",
      },
      {
        name: "IR ON",
      },
    ],
  },
  {
    name: "Ironbark Hill",
    variations: [
      {
        name: "IRONBARK H",
      },
      {
        name: "IRON BK H",
      },
      {
        name: "IRON BK HL",
      },
    ],
  },
  {
    name: "Irrewillipe",
    variations: [
      {
        name: "IRRE",
      },
    ],
  },
  {
    name: "Irrewillipe East",
    variations: [
      {
        name: "IRRE",
      },
    ],
  },
  {
    name: "Irymple",
    variations: [
      {
        name: "IRYM",
      },
    ],
  },
  {
    name: "Jackass Flat",
    variations: [
      {
        name: "JACK",
      },
    ],
  },
  {
    name: "Jack River",
    variations: [
      {
        name: "JACK",
      },
    ],
  },
  {
    name: "Jacksons Creek",
    variations: [
      {
        name: "JACK",
      },
      {
        name: "JACKSON CK",
      },
      {
        name: "JACKSONS C",
      },
    ],
  },
  {
    name: "Jacksons Gully",
    variations: [
      {
        name: "JACK",
      },
      {
        name: "JACKSON GY",
      },
    ],
  },
  {
    name: "Jancourt",
    variations: [
      {
        name: "JANC",
      },
    ],
  },
  {
    name: "Jancourt East",
    variations: [
      {
        name: "JANC",
      },
    ],
  },
  {
    name: "Janefield (Colony/Training Centre)",
    variations: [
      {
        name: "JANE",
      },
    ],
  },
  {
    name: "Jan Juc",
    variations: [
      {
        name: "JANJ",
      },
    ],
  },
  {
    name: "Jarklin",
    variations: [
      {
        name: "JARK",
      },
    ],
  },
  {
    name: "Jarrahmond",
    variations: [
      {
        name: "JARR",
      },
    ],
  },
  {
    name: "Jeeralang",
    variations: [
      {
        name: "JEER",
      },
    ],
  },
  {
    name: "Jeeralang Junction",
    variations: [
      {
        name: "JEER",
      },
    ],
  },
  {
    name: "Jeetho",
    variations: [
      {
        name: "JEET",
      },
    ],
  },
  {
    name: "Jeparit",
    variations: [
      {
        name: "JEP",
      },
      {
        name: "JEPA",
      },
      {
        name: "JE PA",
      },
    ],
  },
  {
    name: "Jericho",
    variations: [
      {
        name: "JERI",
      },
    ],
  },
  {
    name: "Jeruk",
    variations: [
      {
        name: "JERU",
      },
      {
        name: "JE RU",
      },
    ],
  },
  {
    name: "Janefield (Colony)",
    variations: [
      {
        name: "JFIELD",
      },
    ],
  },
  {
    name: "Jika Jika",
    variations: [
      {
        name: "JIKA",
      },
      {
        name: "JI KA",
      },
    ],
  },
  {
    name: "Jindivick",
    variations: [
      {
        name: "JIND",
      },
    ],
  },
  {
    name: "Joel Joel",
    variations: [
      {
        name: "JOEL",
      },
    ],
  },
  {
    name: "Johanna",
    variations: [
      {
        name: "JOHA",
      },
    ],
  },
  {
    name: "Johnsonville",
    variations: [
      {
        name: "JOHN",
      },
    ],
  },
  {
    name: "Jones Creek",
    variations: [
      {
        name: "JONE",
      },
      {
        name: "JO NE",
      },
      {
        name: "JONES CK",
      },
      {
        name: "JONES CRK",
      },
    ],
  },
  {
    name: "Jordan River",
    variations: [
      {
        name: "JORD",
      },
      {
        name: "JO RD",
      },
      {
        name: "JORDAN",
      },
    ],
  },
  {
    name: "Jordanville",
    variations: [
      {
        name: "JORD",
      },
    ],
  },
  {
    name: "Joyces Creek",
    variations: [
      {
        name: "JOYC",
      },
      {
        name: "JOYCES CK",
      },
      {
        name: "JOYCES CRE",
      },
      {
        name: "JOYCES CRK",
      },
    ],
  },
  {
    name: "Jumbuk",
    variations: [
      {
        name: "JUMB",
      },
    ],
  },
  {
    name: "Jung",
    variations: [
      {
        name: "JUNG",
      },
      {
        name: "JU NG",
      },
    ],
  },
  {
    name: "Junortoun",
    variations: [
      {
        name: "JUNO",
      },
    ],
  },
  {
    name: "Kadnook",
    variations: [
      {
        name: "KADN",
      },
    ],
  },
  {
    name: "Kalimna",
    variations: [
      {
        name: "KALI",
      },
    ],
  },
  {
    name: "Kalimna Heights",
    variations: [
      {
        name: "KALI",
      },
    ],
  },
  {
    name: "Kalimna West",
    variations: [
      {
        name: "KALI",
      },
    ],
  },
  {
    name: "Kalkee",
    variations: [
      {
        name: "KALK",
      },
    ],
  },
  {
    name: "Kallista",
    variations: [
      {
        name: "KALL",
      },
    ],
  },
  {
    name: "Kalorama",
    variations: [
      {
        name: "KALO",
      },
    ],
  },
  {
    name: "Kancoona",
    variations: [
      {
        name: "KANC",
      },
    ],
  },
  {
    name: "Kaneira",
    variations: [
      {
        name: "KANEIRA",
      },
    ],
  },
  {
    name: "Kangaroo Ground",
    variations: [
      {
        name: "KANG",
      },
      {
        name: "KA NG",
      },
      {
        name: "KANGAROO G",
      },
      {
        name: "KANGAROO GD",
      },
      {
        name: "KANG GD",
      },
      {
        name: "KANG GR",
      },
      {
        name: "KANG GRD",
      },
      {
        name: "KANG GRND",
      },
      {
        name: "KANG GROUN",
      },
      {
        name: "KANG GROUND",
      },
      {
        name: "KANG GROUNDS",
      },
      {
        name: "KROO G",
      },
      {
        name: "KROO GD",
      },
      {
        name: "KROO GR",
      },
      {
        name: "KROO GRD",
      },
      {
        name: "KROO GRND",
      },
      {
        name: "KROO GRNDS",
      },
    ],
  },
  {
    name: "Kangaroo Gully",
    variations: [
      {
        name: "KANG GULLY",
      },
    ],
  },
  {
    name: "Kanyapella",
    variations: [
      {
        name: "KANY",
      },
    ],
  },
  {
    name: "Karadoc",
    variations: [
      {
        name: "KARA",
      },
    ],
  },
  {
    name: "Kara Kara",
    variations: [
      {
        name: "KARA",
      },
    ],
  },
  {
    name: "Karamomus",
    variations: [
      {
        name: "KARA",
      },
      {
        name: "KA RA",
      },
      {
        name: "KARR",
      },
    ],
  },
  {
    name: "Kardella",
    variations: [
      {
        name: "KARD",
      },
    ],
  },
  {
    name: "Karkarooc",
    variations: [
      {
        name: "KARK",
      },
    ],
  },
  {
    name: "Rosebery",
    variations: [
      {
        name: "KARK",
      },
      {
        name: "ROSE",
      },
      {
        name: "RO SE",
      },
    ],
  },
  {
    name: "Karingal",
    variations: [
      {
        name: "KARI",
      },
    ],
  },
  {
    name: "Karnak",
    variations: [
      {
        name: "KARN",
      },
    ],
  },
  {
    name: "Katamatite",
    variations: [
      {
        name: "KATA",
      },
      {
        name: "KA TA",
      },
    ],
  },
  {
    name: "Katandra West",
    variations: [
      {
        name: "KATA",
      },
    ],
  },
  {
    name: "Katunga",
    variations: [
      {
        name: "KATU",
      },
    ],
  },
  {
    name: "Kawarren",
    variations: [
      {
        name: "KAWA",
      },
    ],
  },
  {
    name: "Kingsbury",
    variations: [
      {
        name: "KBURY",
      },
      {
        name: "KING",
      },
      {
        name: "XING",
      },
    ],
  },
  {
    name: "Kealba",
    variations: [
      {
        name: "KEAL",
      },
    ],
  },
  {
    name: "Keelbundora",
    variations: [
      {
        name: "KEEL",
      },
      {
        name: "KEELA",
      },
      {
        name: "KEELBANDOR",
      },
      {
        name: "KEELBUNDA",
      },
      {
        name: "KEELBUNDOR",
      },
      {
        name: "KEELDORA",
      },
    ],
  },
  {
    name: "Keilor Downs",
    variations: [
      {
        name: "KEIL",
      },
    ],
  },
  {
    name: "Keilor East",
    variations: [
      {
        name: "KEIL",
      },
    ],
  },
  {
    name: "Keilor Park",
    variations: [
      {
        name: "KEIL",
      },
    ],
  },
  {
    name: "Kelvin View",
    variations: [
      {
        name: "KELV",
      },
    ],
  },
  {
    name: "Kensington Hill",
    variations: [
      {
        name: "KENH",
      },
      {
        name: "KENHILL",
      },
      {
        name: "KEN HILL",
      },
      {
        name: "KHILL",
      },
      {
        name: "K HILL",
      },
      {
        name: "KTON HILL",
      },
      {
        name: "R HILL",
      },
    ],
  },
  {
    name: "Kennedys Creek",
    variations: [
      {
        name: "KENN",
      },
    ],
  },
  {
    name: "Kennington",
    variations: [
      {
        name: "KENN",
      },
    ],
  },
  {
    name: "Kennys Ford",
    variations: [
      {
        name: "KENN",
      },
    ],
  },
  {
    name: "Kennedys Flat",
    variations: [
      {
        name: "KENNEDYS F",
      },
    ],
  },
  {
    name: "Kensington",
    variations: [
      {
        name: "KENS",
      },
      {
        name: "KE NS",
      },
      {
        name: "KENTON",
      },
      {
        name: "KOTH",
      },
      {
        name: "KTON",
      },
      {
        name: "XENS",
      },
    ],
  },
  {
    name: "Keon Park",
    variations: [
      {
        name: "KEON",
      },
    ],
  },
  {
    name: "Kergunyah",
    variations: [
      {
        name: "KERG",
      },
    ],
  },
  {
    name: "Kergunyah South",
    variations: [
      {
        name: "KERG",
      },
    ],
  },
  {
    name: "Kernot",
    variations: [
      {
        name: "KERN",
      },
    ],
  },
  {
    name: "Kerrie",
    variations: [
      {
        name: "KERR",
      },
    ],
  },
  {
    name: "Kerrisdale",
    variations: [
      {
        name: "KERR",
      },
    ],
  },
  {
    name: "Kerrit Bareet",
    variations: [
      {
        name: "KERR",
      },
    ],
  },
  {
    name: "Kevington",
    variations: [
      {
        name: "KEVI",
      },
    ],
  },
  {
    name: "Kevington?",
    variations: [
      {
        name: "KE VI",
      },
    ],
  },
  {
    name: "Kew",
    variations: [
      {
        name: "KEW",
      },
      {
        name: "KE W",
      },
      {
        name: "XEW",
      },
      {
        name: "XFW",
      },
    ],
  },
  {
    name: "Kew Asylum",
    variations: [
      {
        name: "KEW ASSYL",
      },
      {
        name: "KEW ASY",
      },
      {
        name: "KEW ASYL",
      },
      {
        name: "KEW ASYLU",
      },
    ],
  },
  {
    name: "Kew Benevolent Asylum",
    variations: [
      {
        name: "KEW B A",
      },
      {
        name: "KEW BEN AS",
      },
    ],
  },
  {
    name: "Kewell",
    variations: [
      {
        name: "KEWE",
      },
    ],
  },
  {
    name: "Kew East",
    variations: [
      {
        name: "KEW E",
      },
    ],
  },
  {
    name: "Kew Road",
    variations: [
      {
        name: "KEW RD",
      },
    ],
  },
  {
    name: "Keysborough",
    variations: [
      {
        name: "KEYS",
      },
      {
        name: "KE YS",
      },
    ],
  },
  {
    name: "Korweinguboora",
    variations: [
      {
        name: "KGUBOORA",
      },
      {
        name: "KORB",
      },
      {
        name: "KORN",
      },
      {
        name: "KORW",
      },
      {
        name: "KO RW",
      },
    ],
  },
  {
    name: "Khulls Range",
    variations: [
      {
        name: "KHUL",
      },
      {
        name: "KHULLS RAN",
      },
      {
        name: "KHULLS RGE",
      },
    ],
  },
  {
    name: "Kialla East",
    variations: [
      {
        name: "KIAL",
      },
    ],
  },
  {
    name: "Kialla West",
    variations: [
      {
        name: "KIAL",
      },
    ],
  },
  {
    name: "Kilcunda",
    variations: [
      {
        name: "KILC",
      },
      {
        name: "XILC",
      },
    ],
  },
  {
    name: "Killara",
    variations: [
      {
        name: "KILL",
      },
    ],
  },
  {
    name: "Killawarra",
    variations: [
      {
        name: "KILL",
      },
    ],
  },
  {
    name: "Killeen Station",
    variations: [
      {
        name: "KILLEEN",
      },
    ],
  },
  {
    name: "Kilmany",
    variations: [
      {
        name: "KILM",
      },
    ],
  },
  {
    name: "Kilmore Hospital",
    variations: [
      {
        name: "KILMORE H",
      },
      {
        name: "KILMORE HO",
      },
      {
        name: "KILMORE HOSP",
      },
      {
        name: "KMORE H",
      },
      {
        name: "KMORE HOS",
      },
      {
        name: "K MORE HOS",
      },
      {
        name: "KMOREHOSP",
      },
      {
        name: "KMORE HOSP",
      },
      {
        name: "K MORE HOSP",
      },
      {
        name: "KMORE HSP",
      },
    ],
  },
  {
    name: "Kilsyth",
    variations: [
      {
        name: "KILS",
      },
      {
        name: "XILS",
      },
    ],
  },
  {
    name: "Kinglake",
    variations: [
      {
        name: "KING",
      },
    ],
  },
  {
    name: "Kinglake West",
    variations: [
      {
        name: "KING",
      },
    ],
  },
  {
    name: "Kingsville",
    variations: [
      {
        name: "KING",
      },
    ],
  },
  {
    name: "Kingsville South",
    variations: [
      {
        name: "KING",
      },
    ],
  },
  {
    name: "King Valley",
    variations: [
      {
        name: "KING",
      },
    ],
  },
  {
    name: "King Parrot Creek",
    variations: [
      {
        name: "KING PARRT",
      },
    ],
  },
  {
    name: "Kinlochewe",
    variations: [
      {
        name: "KINL",
      },
    ],
  },
  {
    name: "Kinnabulla",
    variations: [
      {
        name: "KINN",
      },
    ],
  },
  {
    name: "Kirwans Bridge",
    variations: [
      {
        name: "KIRW",
      },
    ],
  },
  {
    name: "Katandra???",
    variations: [
      {
        name: "KLIU",
      },
    ],
  },
  {
    name: "Knebsworth",
    variations: [
      {
        name: "KNEB",
      },
    ],
  },
  {
    name: "Knowsley",
    variations: [
      {
        name: "KNOW",
      },
    ],
  },
  {
    name: "Knoxfield",
    variations: [
      {
        name: "KNOX",
      },
    ],
  },
  {
    name: "Koroit",
    variations: [
      {
        name: "KO",
      },
      {
        name: "KORO",
      },
      {
        name: "KO RO",
      },
    ],
  },
  {
    name: "Koallah",
    variations: [
      {
        name: "KOAL",
      },
    ],
  },
  {
    name: "Koetong",
    variations: [
      {
        name: "KOET",
      },
    ],
  },
  {
    name: "Konagaderra",
    variations: [
      {
        name: "KONA",
      },
    ],
  },
  {
    name: "Kongwak",
    variations: [
      {
        name: "KONG",
      },
    ],
  },
  {
    name: "Koo Wee Rup",
    variations: [
      {
        name: "KOO",
      },
      {
        name: "KRUP",
      },
      {
        name: "K RUP",
      },
      {
        name: "KWEERUP",
      },
      {
        name: "KWRUP",
      },
      {
        name: "K W RUP",
      },
    ],
  },
  {
    name: "Kooloonong",
    variations: [
      {
        name: "KOOL",
      },
    ],
  },
  {
    name: "Koonwarra",
    variations: [
      {
        name: "KOON",
      },
    ],
  },
  {
    name: "Koorlong",
    variations: [
      {
        name: "KOOR",
      },
    ],
  },
  {
    name: "Koornalla",
    variations: [
      {
        name: "KOOR",
      },
    ],
  },
  {
    name: "Koorooman",
    variations: [
      {
        name: "KOOR",
      },
    ],
  },
  {
    name: "Kooyong",
    variations: [
      {
        name: "KOOY",
      },
      {
        name: "KYONG",
      },
    ],
  },
  {
    name: "Korong Vale",
    variations: [
      {
        name: "KORN",
      },
      {
        name: "KORO",
      },
      {
        name: "KO RO",
      },
      {
        name: "KORONG V",
      },
      {
        name: "KOR VALE",
      },
      {
        name: "KVALE",
      },
      {
        name: "K VALE",
      },
      {
        name: "XORO",
      },
    ],
  },
  {
    name: "Mt Korong",
    variations: [
      {
        name: "KORO",
      },
      {
        name: "KO RO",
      },
    ],
  },
  {
    name: "Korrine",
    variations: [
      {
        name: "KORR",
      },
    ],
  },
  {
    name: "Kororoit Creek",
    variations: [
      {
        name: "KORRONOT C",
      },
    ],
  },
  {
    name: "Kotupna",
    variations: [
      {
        name: "KOTU",
      },
    ],
  },
  {
    name: "Koyuga",
    variations: [
      {
        name: "KOYU",
      },
    ],
  },
  {
    name: "Krowera",
    variations: [
      {
        name: "KROW",
      },
    ],
  },
  {
    name: "Kyneton or Kensington?",
    variations: [
      {
        name: "KTON ALMS HOUSE",
      },
    ],
  },
  {
    name: "Kensington and Flemington",
    variations: [
      {
        name: "KTON AND F",
      },
    ],
  },
  {
    name: "Kensington and Kensington Hill?",
    variations: [
      {
        name: "KTON AND K",
      },
      {
        name: "KTON AND KTO",
      },
    ],
  },
  {
    name: "Kyneton Convent",
    variations: [
      {
        name: "KTON CONVENT",
      },
      {
        name: "KYTON CONVENT",
      },
    ],
  },
  {
    name: "Kyneton Hospital",
    variations: [
      {
        name: "KTON H",
      },
      {
        name: "KTON HOS",
      },
      {
        name: "KTON HOSP",
      },
      {
        name: "K TON HOSP",
      },
      {
        name: "K TON HOSP L",
      },
      {
        name: "KTON HSP",
      },
      {
        name: "KYNETON HO",
      },
      {
        name: "KYNETON HOSP",
      },
      {
        name: "KYTON H",
      },
      {
        name: "KYTON HOS",
      },
      {
        name: "KYTON HOSP",
      },
    ],
  },
  {
    name: "Kulwin",
    variations: [
      {
        name: "KULW",
      },
    ],
  },
  {
    name: "Kurting",
    variations: [
      {
        name: "KURT",
      },
    ],
  },
  {
    name: "Kyvalley",
    variations: [
      {
        name: "KYVA",
      },
    ],
  },
  {
    name: "Laang",
    variations: [
      {
        name: "LAAN",
      },
      {
        name: "LA AN",
      },
    ],
  },
  {
    name: "Labertouche",
    variations: [
      {
        name: "LABE",
      },
    ],
  },
  {
    name: "Laburnum",
    variations: [
      {
        name: "LABU",
      },
    ],
  },
  {
    name: "Ladys Pass",
    variations: [
      {
        name: "LADY",
      },
    ],
  },
  {
    name: "Lagoon Farm",
    variations: [
      {
        name: "LAGOON FRM",
      },
    ],
  },
  {
    name: "Lagoon Station",
    variations: [
      {
        name: "LAGOON STN",
      },
    ],
  },
  {
    name: "Lah",
    variations: [
      {
        name: "LAH",
      },
    ],
  },
  {
    name: "Laharum",
    variations: [
      {
        name: "LAHA",
      },
    ],
  },
  {
    name: "Lake Boga",
    variations: [
      {
        name: "LAKE",
      },
      {
        name: "L BOGA",
      },
    ],
  },
  {
    name: "Lake Bunga",
    variations: [
      {
        name: "LAKE",
      },
    ],
  },
  {
    name: "Lake Charm",
    variations: [
      {
        name: "LAKE",
      },
      {
        name: "LA KE",
      },
    ],
  },
  {
    name: "Lake Goldsmith",
    variations: [
      {
        name: "LAKE",
      },
    ],
  },
  {
    name: "Lake Mundi",
    variations: [
      {
        name: "LAKE",
      },
    ],
  },
  {
    name: "Lake Condah",
    variations: [
      {
        name: "LA KE",
      },
    ],
  },
  {
    name: "Lalbert",
    variations: [
      {
        name: "LALB",
      },
    ],
  },
  {
    name: "Lal Lal",
    variations: [
      {
        name: "LALL",
      },
      {
        name: "LA LL",
      },
    ],
  },
  {
    name: "Lal Lal Station",
    variations: [
      {
        name: "LAL LAL ST",
      },
    ],
  },
  {
    name: "Lalor",
    variations: [
      {
        name: "LALO",
      },
    ],
  },
  {
    name: "Langkoop",
    variations: [
      {
        name: "LANG",
      },
    ],
  },
  {
    name: "Lang Lang",
    variations: [
      {
        name: "LANG",
      },
      {
        name: "LA NG",
      },
    ],
  },
  {
    name: "Langwarrin",
    variations: [
      {
        name: "LANG",
      },
    ],
  },
  {
    name: "Langdons Hill",
    variations: [
      {
        name: "LANGDONS H",
      },
    ],
  },
  {
    name: "Larpent Station",
    variations: [
      {
        name: "LARPENT ST",
      },
    ],
  },
  {
    name: "Larundel",
    variations: [
      {
        name: "LARU",
      },
    ],
  },
  {
    name: "Lascelles",
    variations: [
      {
        name: "LASC",
      },
    ],
  },
  {
    name: "Launching Place",
    variations: [
      {
        name: "LAUN",
      },
      {
        name: "LA UN",
      },
    ],
  },
  {
    name: "Lavers Hill",
    variations: [
      {
        name: "LAVE",
      },
    ],
  },
  {
    name: "Laverton",
    variations: [
      {
        name: "LAVE",
      },
    ],
  },
  {
    name: "Laverton North",
    variations: [
      {
        name: "LAVE",
      },
    ],
  },
  {
    name: "Lower Cape Bridgewater",
    variations: [
      {
        name: "L CAPE BRIDGEWATE",
      },
      {
        name: "L CAPE BRIDGEWATER",
      },
      {
        name: "LOWE",
      },
      {
        name: "LR CAPE BRDGWATER",
      },
      {
        name: "LR CAPE BGEWATER",
      },
      {
        name: "LWR CAPE BRDGWTR",
      },
      {
        name: "LWR CAPE BRGWATER",
      },
      {
        name: "LWR CAPE BRIDGEWATER",
      },
    ],
  },
  {
    name: "Leaghur",
    variations: [
      {
        name: "LEAG",
      },
      {
        name: "LE AG",
      },
      {
        name: "LEAU",
      },
    ],
  },
  {
    name: "Leigh Creek",
    variations: [
      {
        name: "LEIG",
      },
    ],
  },
  {
    name: "Leigh Road",
    variations: [
      {
        name: "LEIG",
      },
      {
        name: "LEIGH RD",
      },
      {
        name: "LEIGHROAD",
      },
      {
        name: "LEIGH ROAD",
      },
    ],
  },
  {
    name: "Leitchville",
    variations: [
      {
        name: "LEIT",
      },
      {
        name: "LE IT",
      },
    ],
  },
  {
    name: "Lemnos",
    variations: [
      {
        name: "LEMN",
      },
    ],
  },
  {
    name: "Leneva",
    variations: [
      {
        name: "LENE",
      },
    ],
  },
  {
    name: "Leonards Hill",
    variations: [
      {
        name: "LEON",
      },
    ],
  },
  {
    name: "Leopold",
    variations: [
      {
        name: "LEOP",
      },
    ],
  },
  {
    name: "Leslie Manor",
    variations: [
      {
        name: "LESL",
      },
    ],
  },
  {
    name: "Long Gully",
    variations: [
      {
        name: "L GLY",
      },
      {
        name: "LGULLY",
      },
      {
        name: "L GULLY",
      },
      {
        name: "L HULLY",
      },
      {
        name: "LNG GLY",
      },
      {
        name: "LONG",
      },
      {
        name: "LO NG",
      },
      {
        name: "LONG G",
      },
      {
        name: "LONG GLY",
      },
      {
        name: "LONG GU",
      },
      {
        name: "LONG GY",
      },
    ],
  },
  {
    name: "Licola",
    variations: [
      {
        name: "LICO",
      },
    ],
  },
  {
    name: "Lillimur",
    variations: [
      {
        name: "LILL",
      },
      {
        name: "LI LL",
      },
    ],
  },
  {
    name: "Lima",
    variations: [
      {
        name: "LIMA",
      },
    ],
  },
  {
    name: "Lima South",
    variations: [
      {
        name: "LIMA",
      },
    ],
  },
  {
    name: "Lima Station",
    variations: [
      {
        name: "LIMA STN",
      },
    ],
  },
  {
    name: "Limestone",
    variations: [
      {
        name: "LIME",
      },
    ],
  },
  {
    name: "Lindenow",
    variations: [
      {
        name: "LIND",
      },
    ],
  },
  {
    name: "Lindenow South",
    variations: [
      {
        name: "LIND",
      },
    ],
  },
  {
    name: "Linga",
    variations: [
      {
        name: "LING",
      },
    ],
  },
  {
    name: "Linlithgow",
    variations: [
      {
        name: "LINL",
      },
    ],
  },
  {
    name: "Linton",
    variations: [
      {
        name: "LINT",
      },
      {
        name: "LI NT",
      },
    ],
  },
  {
    name: "Liparoo",
    variations: [
      {
        name: "LIPA",
      },
    ],
  },
  {
    name: "Little River",
    variations: [
      {
        name: "LITT",
      },
      {
        name: "LI TT",
      },
      {
        name: "LT RIVER",
      },
      {
        name: "ST RIVER",
      },
    ],
  },
  {
    name: "Lake Corangamite",
    variations: [
      {
        name: "LK CORANG",
      },
    ],
  },
  {
    name: "Llowalong",
    variations: [
      {
        name: "LLOW",
      },
    ],
  },
  {
    name: "Loch",
    variations: [
      {
        name: "LOCH",
      },
    ],
  },
  {
    name: "Loch Sport",
    variations: [
      {
        name: "LOCH",
      },
    ],
  },
  {
    name: "Locksley",
    variations: [
      {
        name: "LOCK",
      },
    ],
  },
  {
    name: "Loddon Junction",
    variations: [
      {
        name: "LODDEN JUN",
      },
      {
        name: "LODDON JCN",
      },
      {
        name: "LODDON JCT",
      },
      {
        name: "LODDON JT",
      },
      {
        name: "LODDON JTN",
      },
      {
        name: "LODDON JUN",
      },
    ],
  },
  {
    name: "Loddon River",
    variations: [
      {
        name: "LODDEN RV",
      },
      {
        name: "LODDEN RVR",
      },
      {
        name: "LODDON CK",
      },
      {
        name: "LODDON RIV",
      },
      {
        name: "LODDON RV",
      },
      {
        name: "LODDON RVR",
      },
    ],
  },
  {
    name: "Loddon Plains",
    variations: [
      {
        name: "LODDON PL",
      },
      {
        name: "LODDON PLA",
      },
    ],
  },
  {
    name: "Loddon Valley",
    variations: [
      {
        name: "LODDON V",
      },
      {
        name: "LODDON VAL",
      },
      {
        name: "LODDON VY",
      },
    ],
  },
  {
    name: "Logan",
    variations: [
      {
        name: "LOGA",
      },
    ],
  },
  {
    name: "Londrigan",
    variations: [
      {
        name: "LOND",
      },
    ],
  },
  {
    name: "Longlea",
    variations: [
      {
        name: "LONG",
      },
    ],
  },
  {
    name: "Longwarry",
    variations: [
      {
        name: "LONG",
      },
      {
        name: "LO NG",
      },
      {
        name: "LWARRY",
      },
    ],
  },
  {
    name: "Longwarry North",
    variations: [
      {
        name: "LONG",
      },
    ],
  },
  {
    name: "Lorquon",
    variations: [
      {
        name: "LORQ",
      },
    ],
  },
  {
    name: "Lovely Banks",
    variations: [
      {
        name: "LOVE",
      },
    ],
  },
  {
    name: "Lower Plenty",
    variations: [
      {
        name: "LOWE",
      },
      {
        name: "LO WE",
      },
      {
        name: "LPLE",
      },
      {
        name: "L PLENTY",
      },
    ],
  },
  {
    name: "Lower Templestowe",
    variations: [
      {
        name: "LOWE",
      },
    ],
  },
  {
    name: "Lower Loddon District",
    variations: [
      {
        name: "LOWER LODD",
      },
    ],
  },
  {
    name: "Lower Tarwin",
    variations: [
      {
        name: "LOWER TARW",
      },
    ],
  },
  {
    name: "Loy Yang",
    variations: [
      {
        name: "LOYY",
      },
    ],
  },
  {
    name: "Stratford",
    variations: [
      {
        name: "LPATFORD",
      },
      {
        name: "SFORD",
      },
      {
        name: "ST AR",
      },
      {
        name: "STFORD",
      },
      {
        name: "STRA",
      },
      {
        name: "ST RA",
      },
      {
        name: "STRFORD",
      },
    ],
  },
  {
    name: "Lucerne Grove",
    variations: [
      {
        name: "LUCE",
      },
    ],
  },
  {
    name: "Lucky Womans (Diggings)",
    variations: [
      {
        name: "LUCK",
      },
      {
        name: "LUCK WOMA",
      },
    ],
  },
  {
    name: "Lurg",
    variations: [
      {
        name: "LURG",
      },
    ],
  },
  {
    name: "Lynot's Station",
    variations: [
      {
        name: "LYNOTS STN",
      },
    ],
  },
  {
    name: "Lyonville",
    variations: [
      {
        name: "LYON",
      },
    ],
  },
  {
    name: "Moorabbin",
    variations: [
      {
        name: "MABBIN",
      },
      {
        name: "MBBIN",
      },
      {
        name: "MOOR",
      },
      {
        name: "MO OR",
      },
      {
        name: "MOORAB",
      },
    ],
  },
  {
    name: "Macclesfield",
    variations: [
      {
        name: "MACC",
      },
    ],
  },
  {
    name: "Mansfield??",
    variations: [
      {
        name: "MACC",
      },
    ],
  },
  {
    name: "MacIntyre's (Ranges)",
    variations: [
      {
        name: "MACI",
      },
    ],
  },
  {
    name: "Macleod",
    variations: [
      {
        name: "MACL",
      },
    ],
  },
  {
    name: "Macorna",
    variations: [
      {
        name: "MACO",
      },
      {
        name: "MA CO",
      },
    ],
  },
  {
    name: "Madalya",
    variations: [
      {
        name: "MADA",
      },
    ],
  },
  {
    name: "Mafeking",
    variations: [
      {
        name: "MAFE",
      },
    ],
  },
  {
    name: "Magpie Creek",
    variations: [
      {
        name: "MAGP",
      },
    ],
  },
  {
    name: "Maiden Gully",
    variations: [
      {
        name: "MAID",
      },
    ],
  },
  {
    name: "Mailers Flat",
    variations: [
      {
        name: "MAILERS F",
      },
      {
        name: "MAILERS FL",
      },
      {
        name: "MAILERS FT",
      },
    ],
  },
  {
    name: "Main Ridge",
    variations: [
      {
        name: "MAIN",
      },
    ],
  },
  {
    name: "Maldon Hospital",
    variations: [
      {
        name: "MALDON H",
      },
      {
        name: "MALDON HOS",
      },
      {
        name: "MALDONHOSP",
      },
      {
        name: "MALDON HOSP",
      },
    ],
  },
  {
    name: "Malvern East",
    variations: [
      {
        name: "MALV E",
      },
    ],
  },
  {
    name: "Mallacoota",
    variations: [
      {
        name: "MALL",
      },
    ],
  },
  {
    name: "Mambourin",
    variations: [
      {
        name: "MAMB",
      },
      {
        name: "NAMBOURIN",
      },
    ],
  },
  {
    name: "Manangatang",
    variations: [
      {
        name: "MANA",
      },
      {
        name: "MGATANG",
      },
    ],
  },
  {
    name: "Manifold Heights",
    variations: [
      {
        name: "MANI",
      },
    ],
  },
  {
    name: "Mannibadar",
    variations: [
      {
        name: "MANN",
      },
    ],
  },
  {
    name: "Manns Beach",
    variations: [
      {
        name: "MANN",
      },
    ],
  },
  {
    name: "Manor",
    variations: [
      {
        name: "MANO",
      },
    ],
  },
  {
    name: "Mansfield Hospital",
    variations: [
      {
        name: "MANSFIELD H",
      },
      {
        name: "MFIELD H",
      },
      {
        name: "MFIELD HO",
      },
      {
        name: "MFIELD HOS",
      },
      {
        name: "MFIELD HOSP",
      },
    ],
  },
  {
    name: "Marcus",
    variations: [
      {
        name: "MARC",
      },
    ],
  },
  {
    name: "Marcus Hill",
    variations: [
      {
        name: "MARC",
      },
    ],
  },
  {
    name: "Mardan",
    variations: [
      {
        name: "MARD",
      },
    ],
  },
  {
    name: "Marengo",
    variations: [
      {
        name: "MARE",
      },
    ],
  },
  {
    name: "Maribyrnong",
    variations: [
      {
        name: "MARI",
      },
    ],
  },
  {
    name: "Markwood",
    variations: [
      {
        name: "MARK",
      },
    ],
  },
  {
    name: "Marlo",
    variations: [
      {
        name: "MARL",
      },
    ],
  },
  {
    name: "Marnoo",
    variations: [
      {
        name: "MARN",
      },
      {
        name: "MA RN",
      },
      {
        name: "MARR",
      },
    ],
  },
  {
    name: "Maroona",
    variations: [
      {
        name: "MARO",
      },
    ],
  },
  {
    name: "Yarrambat",
    variations: [
      {
        name: "MARR",
      },
      {
        name: "YARR",
      },
    ],
  },
  {
    name: "Marshall",
    variations: [
      {
        name: "MARS",
      },
    ],
  },
  {
    name: "Marungi",
    variations: [
      {
        name: "MARU",
      },
      {
        name: "MA RU",
      },
    ],
  },
  {
    name: "Maryborough Hospital",
    variations: [
      {
        name: "MARYBORO H",
      },
      {
        name: "MARYBORO HOSP",
      },
      {
        name: "MARYBOROUGH HOSP",
      },
      {
        name: "MBOROH",
      },
      {
        name: "MBORO H",
      },
      {
        name: "MBORO HO",
      },
      {
        name: "MBOROHOS",
      },
      {
        name: "MBORO HOS",
      },
      {
        name: "M BORO HOS",
      },
      {
        name: "MBOROHOSP",
      },
      {
        name: "MBORO HOSP",
      },
      {
        name: "M BORO HOSP",
      },
      {
        name: "MBORO HSP",
      },
    ],
  },
  {
    name: "Melbourne Hospital",
    variations: [
      {
        name: "MBNE HOSP",
      },
      {
        name: "MELBHOSP",
      },
      {
        name: "MELB HOSP",
      },
      {
        name: "MELBOURNE HOSP",
      },
    ],
  },
  {
    name: "Warrnambool Hospital",
    variations: [
      {
        name: "MBOOL H",
      },
      {
        name: "WARNAMBOOL HOSP",
      },
      {
        name: "WARRNAMBOOL HOSP",
      },
      {
        name: "WBOOL H",
      },
      {
        name: "W BOOL H",
      },
      {
        name: "WBOOL HOS",
      },
      {
        name: "W BOOL HOS",
      },
      {
        name: "WBOOL HOSOP",
      },
      {
        name: "WBOOL HOSP",
      },
      {
        name: "W BOOL HOSP",
      },
    ],
  },
  {
    name: "Moorabool West",
    variations: [
      {
        name: "MBOOL W",
      },
    ],
  },
  {
    name: "Maryborough Diggings",
    variations: [
      {
        name: "MBORO DIG",
      },
      {
        name: "MBORO DIGG",
      },
    ],
  },
  {
    name: "Middle Brighton",
    variations: [
      {
        name: "M BRIGHT",
      },
      {
        name: "M BRIGHTON",
      },
      {
        name: "M BRITON",
      },
      {
        name: "M BTN",
      },
      {
        name: "M BTON",
      },
      {
        name: "MIDD BIGH",
      },
      {
        name: "MIDD BRIGH",
      },
      {
        name: "MIDDLE BRIGH",
      },
    ],
  },
  {
    name: "McCallum(s) Creek",
    variations: [
      {
        name: "MCCA",
      },
      {
        name: "MCCALLUM",
      },
      {
        name: "MCCALLUM C",
      },
      {
        name: "MCCALLUMS",
      },
      {
        name: "MCCALLUMS CRK",
      },
    ],
  },
  {
    name: "McCrae",
    variations: [
      {
        name: "MCCR",
      },
    ],
  },
  {
    name: "McCullum(s) Creek",
    variations: [
      {
        name: "MCCU",
      },
      {
        name: "MCCULLUM",
      },
      {
        name: "MCCULLUM C",
      },
      {
        name: "MCCULLUMS",
      },
    ],
  },
  {
    name: "Murrayville",
    variations: [
      {
        name: "MCILLE",
      },
      {
        name: "MURR",
      },
      {
        name: "MURRAYVLE",
      },
      {
        name: "MVILLE",
      },
    ],
  },
  {
    name: "McIntyre",
    variations: [
      {
        name: "MCIN",
      },
    ],
  },
  {
    name: "McIvor",
    variations: [
      {
        name: "MCIV",
      },
    ],
  },
  {
    name: "McKenzie Creek",
    variations: [
      {
        name: "MCKE",
      },
    ],
  },
  {
    name: "Mckenzie Hill",
    variations: [
      {
        name: "MCKE",
      },
    ],
  },
  {
    name: "McKinnon",
    variations: [
      {
        name: "MCKI",
      },
    ],
  },
  {
    name: "McLoughlins Beach",
    variations: [
      {
        name: "MCLO",
      },
    ],
  },
  {
    name: "McMillans",
    variations: [
      {
        name: "MCMI",
      },
    ],
  },
  {
    name: "Mainsdample",
    variations: [
      {
        name: "MDAMPLE",
      },
    ],
  },
  {
    name: "Mead",
    variations: [
      {
        name: "MEAD",
      },
    ],
  },
  {
    name: "Meadow Creek",
    variations: [
      {
        name: "MEAD",
      },
    ],
  },
  {
    name: "Meadow Heights",
    variations: [
      {
        name: "MEAD",
      },
    ],
  },
  {
    name: "Meatian",
    variations: [
      {
        name: "MEAT",
      },
    ],
  },
  {
    name: "Meeniyan",
    variations: [
      {
        name: "MEEN",
      },
      {
        name: "MNYAN",
      },
      {
        name: "MYAN",
      },
    ],
  },
  {
    name: "Meerlieu",
    variations: [
      {
        name: "MEER",
      },
    ],
  },
  {
    name: "Melbourne Alfred",
    variations: [
      {
        name: "MELB A",
      },
      {
        name: "MELB AE",
      },
    ],
  },
  {
    name: "Melbourne Alfred Hospital",
    variations: [
      {
        name: "MELB A H",
      },
      {
        name: "MELB ALFH",
      },
    ],
  },
  {
    name: "Melbourne East Ch Hospital",
    variations: [
      {
        name: "MELB E CH HOSP",
      },
    ],
  },
  {
    name: "Melbourne East Gaol",
    variations: [
      {
        name: "MELB E GAOL",
      },
    ],
  },
  {
    name: "Melbourne East Hospital",
    variations: [
      {
        name: "MELBEHOSP",
      },
      {
        name: "MELBE HOSP",
      },
      {
        name: "MELB E HOSP",
      },
      {
        name: "MELBOURNE E HOSP",
      },
      {
        name: "MEL E HOSP",
      },
    ],
  },
  {
    name: "Melb East Immigrants Home",
    variations: [
      {
        name: "MELB E IMMGB HOME",
      },
      {
        name: "MELB E IMMGH HOME",
      },
      {
        name: "MELB E IMM HOME",
      },
    ],
  },
  {
    name: "Melb East Immigrants Hospital",
    variations: [
      {
        name: "MELB E IMM HOSP",
      },
      {
        name: "MELBOURNE E IMM H",
      },
    ],
  },
  {
    name: "Melbourne East Lunatic Asylum",
    variations: [
      {
        name: "MELB E L A",
      },
    ],
  },
  {
    name: "North Melb? North of Melb?",
    variations: [
      {
        name: "MELB NTH",
      },
    ],
  },
  {
    name: "Melbourne Road",
    variations: [
      {
        name: "MELB RD",
      },
      {
        name: "MELB ROAD",
      },
    ],
  },
  {
    name: "Melbourne Sth Homeopath H",
    variations: [
      {
        name: "MELB S H HOSP",
      },
      {
        name: "MELB S HO HOSP",
      },
      {
        name: "MELB S HOM HOSP",
      },
      {
        name: "MELB S HOMEO HOSP",
      },
    ],
  },
  {
    name: "South Melbourne Homeopathic",
    variations: [
      {
        name: "MELB S HOMOEPATH",
      },
      {
        name: "S MELB HH",
      },
      {
        name: "S MELB H H",
      },
      {
        name: "S MELB H HOSP",
      },
      {
        name: "S MELB HOMOEOPATH",
      },
      {
        name: "S MELB HOMOEPATHI",
      },
      {
        name: "S MELB HOMOEP HOS",
      },
    ],
  },
  {
    name: "Melton South",
    variations: [
      {
        name: "MELT",
      },
    ],
  },
  {
    name: "Melville Forest",
    variations: [
      {
        name: "MELV",
      },
    ],
  },
  {
    name: "Meningorot",
    variations: [
      {
        name: "MENI",
      },
    ],
  },
  {
    name: "Mentone",
    variations: [
      {
        name: "MENT",
      },
    ],
  },
  {
    name: "Menzies Creek",
    variations: [
      {
        name: "MENZ",
      },
      {
        name: "MENZIES CK",
      },
    ],
  },
  {
    name: "Mepunga East",
    variations: [
      {
        name: "MEPU",
      },
    ],
  },
  {
    name: "Mepunga West",
    variations: [
      {
        name: "MEPU",
      },
    ],
  },
  {
    name: "Merbein",
    variations: [
      {
        name: "MERB",
      },
    ],
  },
  {
    name: "Meringur",
    variations: [
      {
        name: "MERI",
      },
    ],
  },
  {
    name: "Merino Downs Station",
    variations: [
      {
        name: "MERINO D",
      },
      {
        name: "MERINO DN",
      },
      {
        name: "MERINO DOW",
      },
      {
        name: "MERINO DWN",
      },
      {
        name: "MERINO DWS",
      },
    ],
  },
  {
    name: "Merino Water Holes",
    variations: [
      {
        name: "MERINO WAT",
      },
    ],
  },
  {
    name: "Merlynston",
    variations: [
      {
        name: "MERL",
      },
    ],
  },
  {
    name: "Mernda",
    variations: [
      {
        name: "MERN",
      },
    ],
  },
  {
    name: "Merrang Station",
    variations: [
      {
        name: "MERR",
      },
      {
        name: "MERRANG ST",
      },
    ],
  },
  {
    name: "Merriang",
    variations: [
      {
        name: "MERR",
      },
    ],
  },
  {
    name: "Merricks",
    variations: [
      {
        name: "MERR",
      },
    ],
  },
  {
    name: "Merrigum",
    variations: [
      {
        name: "MERR",
      },
      {
        name: "ME RR",
      },
    ],
  },
  {
    name: "Merrijig",
    variations: [
      {
        name: "MERR",
      },
    ],
  },
  {
    name: "Merrinee",
    variations: [
      {
        name: "MERR",
      },
    ],
  },
  {
    name: "Metung",
    variations: [
      {
        name: "METU",
      },
    ],
  },
  {
    name: "Mewburn Park Estate",
    variations: [
      {
        name: "MEWBURNE",
      },
      {
        name: "MEWBURN PK",
      },
    ],
  },
  {
    name: "Monegeetta",
    variations: [
      {
        name: "MGETTA",
      },
      {
        name: "MONE",
      },
    ],
  },
  {
    name: "Middleton(s) Creek",
    variations: [
      {
        name: "MID CK",
      },
      {
        name: "MIDD",
      },
    ],
  },
  {
    name: "Middleton",
    variations: [
      {
        name: "MIDD",
      },
    ],
  },
  {
    name: "Middle Park",
    variations: [
      {
        name: "MIDD",
      },
      {
        name: "MIDDLE P",
      },
      {
        name: "MIDDLE PK",
      },
      {
        name: "MIDD PARK",
      },
      {
        name: "MID PARK",
      },
      {
        name: "M PARK",
      },
    ],
  },
  {
    name: "Middle Tarwin",
    variations: [
      {
        name: "MIDD",
      },
    ],
  },
  {
    name: "Middle Gully",
    variations: [
      {
        name: "MIDDLE GY",
      },
    ],
  },
  {
    name: "Miepoll",
    variations: [
      {
        name: "MIEP",
      },
    ],
  },
  {
    name: "Miga Lake",
    variations: [
      {
        name: "MIGA",
      },
    ],
  },
  {
    name: "Milawa",
    variations: [
      {
        name: "MILA",
      },
    ],
  },
  {
    name: "Mildura Hospital",
    variations: [
      {
        name: "MILDURA H",
      },
      {
        name: "MILDURA HOS",
      },
      {
        name: "MILDURA HOSP",
      },
    ],
  },
  {
    name: "Milkmaids Flat",
    variations: [
      {
        name: "MILK",
      },
      {
        name: "MILKMAID F",
      },
      {
        name: "MILKMAIDS",
      },
    ],
  },
  {
    name: "Milkmans Flat",
    variations: [
      {
        name: "MILK",
      },
      {
        name: "MILKMAN FL",
      },
      {
        name: "MILKMAN FT",
      },
      {
        name: "MILKMANS F",
      },
      {
        name: "MILKMNS FL",
      },
    ],
  },
  {
    name: "Milkmans Creek",
    variations: [
      {
        name: "MILKMANS C",
      },
    ],
  },
  {
    name: "Millgrove",
    variations: [
      {
        name: "MILL",
      },
    ],
  },
  {
    name: "Mill Park",
    variations: [
      {
        name: "MILL",
      },
    ],
  },
  {
    name: "Milnes Bridge",
    variations: [
      {
        name: "MILN",
      },
    ],
  },
  {
    name: "Mimamiluke Station",
    variations: [
      {
        name: "MIMAMALUKE",
      },
      {
        name: "MIMAMILUKE",
      },
    ],
  },
  {
    name: "Mingilla Farm",
    variations: [
      {
        name: "MINGILLA",
      },
    ],
  },
  {
    name: "Minhamite",
    variations: [
      {
        name: "MINH",
      },
    ],
  },
  {
    name: "Minimay",
    variations: [
      {
        name: "MINI",
      },
    ],
  },
  {
    name: "Mininera",
    variations: [
      {
        name: "MINI",
      },
    ],
  },
  {
    name: "Minjah",
    variations: [
      {
        name: "MINJ",
      },
    ],
  },
  {
    name: "Minmindie",
    variations: [
      {
        name: "MINM",
      },
    ],
  },
  {
    name: "Minyah Station",
    variations: [
      {
        name: "MINYAH STN",
      },
    ],
  },
  {
    name: "Miram",
    variations: [
      {
        name: "MIRA",
      },
    ],
  },
  {
    name: "Mirimbah",
    variations: [
      {
        name: "MIRI",
      },
    ],
  },
  {
    name: "Mirranatwa",
    variations: [
      {
        name: "MIRR",
      },
    ],
  },
  {
    name: "Mitchellstown",
    variations: [
      {
        name: "MITC",
      },
    ],
  },
  {
    name: "Mittyack",
    variations: [
      {
        name: "MITT",
      },
    ],
  },
  {
    name: "Mt Moriac",
    variations: [
      {
        name: "M MORIAC",
      },
    ],
  },
  {
    name: "Mockinya",
    variations: [
      {
        name: "MOCK",
      },
    ],
  },
  {
    name: "Moggs Creek",
    variations: [
      {
        name: "MOGG",
      },
    ],
  },
  {
    name: "Moglonemby",
    variations: [
      {
        name: "MOGL",
      },
    ],
  },
  {
    name: "Mollongghip",
    variations: [
      {
        name: "MOLL",
      },
    ],
  },
  {
    name: "Mologa",
    variations: [
      {
        name: "MOLO",
      },
      {
        name: "MO LO",
      },
    ],
  },
  {
    name: "Molyullah",
    variations: [
      {
        name: "MOLY",
      },
    ],
  },
  {
    name: "Monbulk",
    variations: [
      {
        name: "MONB",
      },
    ],
  },
  {
    name: "Monival Station",
    variations: [
      {
        name: "MONIVAL ST",
      },
    ],
  },
  {
    name: "Monomeith",
    variations: [
      {
        name: "MONO",
      },
    ],
  },
  {
    name: "Mont Albert",
    variations: [
      {
        name: "MONT",
      },
      {
        name: "MTAL",
      },
      {
        name: "MT ALBERT",
      },
    ],
  },
  {
    name: "Montmorency",
    variations: [
      {
        name: "MONT",
      },
    ],
  },
  {
    name: "Montrose",
    variations: [
      {
        name: "MONT",
      },
    ],
  },
  {
    name: "Moomba Park",
    variations: [
      {
        name: "MOOM",
      },
    ],
  },
  {
    name: "Moorabool River",
    variations: [
      {
        name: "MOOR",
      },
      {
        name: "MO OR",
      },
      {
        name: "MOORABOOL",
      },
    ],
  },
  {
    name: "Moorilim",
    variations: [
      {
        name: "MOOR",
      },
      {
        name: "MO OR",
      },
    ],
  },
  {
    name: "Mooroolbark",
    variations: [
      {
        name: "MOOR",
      },
      {
        name: "MOOROOLBRK",
      },
    ],
  },
  {
    name: "Mooroopna Hospital",
    variations: [
      {
        name: "MOOROOPNA HOS",
      },
      {
        name: "MOOROOPNA HOSP",
      },
      {
        name: "MPNA H",
      },
      {
        name: "MPNA HOS",
      },
      {
        name: "MPNA HOSP",
      },
      {
        name: "M PNA HOSP",
      },
      {
        name: "MPNA HOSPL",
      },
    ],
  },
  {
    name: "Moorpanyal",
    variations: [
      {
        name: "MOORPANYAL",
      },
    ],
  },
  {
    name: "South Morang",
    variations: [
      {
        name: "MORA",
      },
      {
        name: "SMOR",
      },
    ],
  },
  {
    name: "Moreland",
    variations: [
      {
        name: "MORE",
      },
    ],
  },
  {
    name: "Morgiana",
    variations: [
      {
        name: "MORG",
      },
    ],
  },
  {
    name: "Morgiana Station",
    variations: [
      {
        name: "MORGIAN ST",
      },
    ],
  },
  {
    name: "Moriac",
    variations: [
      {
        name: "MORI",
      },
    ],
  },
  {
    name: "Morrisons",
    variations: [
      {
        name: "MORR",
      },
      {
        name: "MO RR",
      },
    ],
  },
  {
    name: "Morses Creek",
    variations: [
      {
        name: "MORS",
      },
      {
        name: "MO RS",
      },
      {
        name: "MORSE",
      },
      {
        name: "MORSES CK",
      },
    ],
  },
  {
    name: "Mossiface",
    variations: [
      {
        name: "MOSS",
      },
    ],
  },
  {
    name: "Mountain View",
    variations: [
      {
        name: "MOUN",
      },
    ],
  },
  {
    name: "Mount Beauty",
    variations: [
      {
        name: "MOUN",
      },
      {
        name: "MTBE",
      },
    ],
  },
  {
    name: "Mount Bute",
    variations: [
      {
        name: "MOUN",
      },
      {
        name: "MTBU",
      },
    ],
  },
  {
    name: "Mount Eliza",
    variations: [
      {
        name: "MOUN",
      },
      {
        name: "MTEL",
      },
    ],
  },
  {
    name: "Mount Martha",
    variations: [
      {
        name: "MOUN",
      },
      {
        name: "MTMA",
      },
      {
        name: "MT MA",
      },
    ],
  },
  {
    name: "Mount Waverley",
    variations: [
      {
        name: "MOUN",
      },
      {
        name: "MTWA",
      },
      {
        name: "WAVE",
      },
    ],
  },
  {
    name: "Moyreisk",
    variations: [
      {
        name: "MOYR",
      },
    ],
  },
  {
    name: "Mount Alexander",
    variations: [
      {
        name: "MTAL",
      },
      {
        name: "MT AL",
      },
      {
        name: "MT ALEX",
      },
      {
        name: "MT ALEXAND",
      },
      {
        name: "MT ALEXR",
      },
    ],
  },
  {
    name: "Port Albert",
    variations: [
      {
        name: "MT ALBERT",
      },
      {
        name: "MT ALBURT",
      },
      {
        name: "PORT",
      },
      {
        name: "PO RT",
      },
      {
        name: "PTAL",
      },
      {
        name: "PT AL",
      },
      {
        name: "PT ALB",
      },
      {
        name: "PTALBERT",
      },
      {
        name: "PT ALBERT",
      },
    ],
  },
  {
    name: "Mountain Creek",
    variations: [
      {
        name: "MTAN CK",
      },
      {
        name: "MT CK",
      },
      {
        name: "MT CREEK",
      },
    ],
  },
  {
    name: "Mount Arapiles",
    variations: [
      {
        name: "MTAR",
      },
      {
        name: "MT AR",
      },
      {
        name: "MT ARAPILE",
      },
    ],
  },
  {
    name: "Mount Beaufort?",
    variations: [
      {
        name: "MT BEAUFOR",
      },
    ],
  },
  {
    name: "Mount Buffalo",
    variations: [
      {
        name: "MTBU",
      },
    ],
  },
  {
    name: "Mount Buller",
    variations: [
      {
        name: "MTBU",
      },
    ],
  },
  {
    name: "Mount Cameron",
    variations: [
      {
        name: "MTCA",
      },
    ],
  },
  {
    name: "Mount Cann",
    variations: [
      {
        name: "MTCA",
      },
    ],
  },
  {
    name: "Mount Clear",
    variations: [
      {
        name: "MTCL",
      },
      {
        name: "MT CL",
      },
    ],
  },
  {
    name: "Mount Clarendon?",
    variations: [
      {
        name: "MT CL",
      },
    ],
  },
  {
    name: "Mount Cole",
    variations: [
      {
        name: "MTCO",
      },
      {
        name: "MT CO",
      },
    ],
  },
  {
    name: "Mount Cottrell?",
    variations: [
      {
        name: "MT CO",
      },
    ],
  },
  {
    name: "Mount Dandenong",
    variations: [
      {
        name: "MT D",
      },
      {
        name: "MTDA",
      },
      {
        name: "MT DA",
      },
      {
        name: "MT DAND",
      },
      {
        name: "MTDO",
      },
    ],
  },
  {
    name: "Mount Donna Buang",
    variations: [
      {
        name: "MTDO",
      },
    ],
  },
  {
    name: "Mount Dryden",
    variations: [
      {
        name: "MTDR",
      },
    ],
  },
  {
    name: "Mount Emu Station",
    variations: [
      {
        name: "MT EMU STN",
      },
    ],
  },
  {
    name: "Mt Erica (Hotel)",
    variations: [
      {
        name: "MTER",
      },
    ],
  },
  {
    name: "Mount Franklin",
    variations: [
      {
        name: "MTFR",
      },
      {
        name: "MT FR",
      },
      {
        name: "MT FRANKL",
      },
      {
        name: "MT FRANKLI",
      },
      {
        name: "MT FRANKLN",
      },
      {
        name: "MT FRKLYN",
      },
    ],
  },
  {
    name: "Mt Gisborne",
    variations: [
      {
        name: "MT GISBORN",
      },
    ],
  },
  {
    name: "Mount Glasgow",
    variations: [
      {
        name: "MTGL",
      },
    ],
  },
  {
    name: "Mount Helen",
    variations: [
      {
        name: "MTHE",
      },
    ],
  },
  {
    name: "Mount Hesse",
    variations: [
      {
        name: "MTHE",
      },
      {
        name: "MT HE",
      },
    ],
  },
  {
    name: "Mount Jeffcott North",
    variations: [
      {
        name: "MTJE",
      },
      {
        name: "MT JEFFCOTT N",
      },
    ],
  },
  {
    name: "Mount Lonarch",
    variations: [
      {
        name: "MTLO",
      },
    ],
  },
  {
    name: "Mount Lookout",
    variations: [
      {
        name: "MTLO",
      },
      {
        name: "MT LO",
      },
    ],
  },
  {
    name: "Mount Mitchell",
    variations: [
      {
        name: "MT MITCHEL",
      },
      {
        name: "MT MITSHEL",
      },
    ],
  },
  {
    name: "Point Nepean",
    variations: [
      {
        name: "MT NEPEAN",
      },
      {
        name: "NEPE",
      },
      {
        name: "N NEPEAN",
      },
      {
        name: "POIN",
      },
      {
        name: "PO IN",
      },
      {
        name: "POINTNEPEA",
      },
      {
        name: "PTNE",
      },
      {
        name: "PT NE",
      },
      {
        name: "PT NEPEAN",
      },
    ],
  },
  {
    name: "Mount Pleasant",
    variations: [
      {
        name: "MTPL",
      },
      {
        name: "MT PLEANSA",
      },
      {
        name: "MT PLEASAN",
      },
    ],
  },
  {
    name: "Mount Pleasant Run",
    variations: [
      {
        name: "MT PLEASAN",
      },
    ],
  },
  {
    name: "Mount Pleasant (Property)",
    variations: [
      {
        name: "MT PLEASAN",
      },
    ],
  },
  {
    name: "Mount Pleasant Station",
    variations: [
      {
        name: "MT PLEAST",
      },
    ],
  },
  {
    name: "Mount Prospect",
    variations: [
      {
        name: "MT PORSP",
      },
      {
        name: "MTPR",
      },
      {
        name: "MT PR",
      },
      {
        name: "MT PRCT",
      },
      {
        name: "MT PROPCT",
      },
      {
        name: "MT PROSP",
      },
      {
        name: "MT PROSPE",
      },
      {
        name: "MT PROSPEC",
      },
      {
        name: "MT PROSPT",
      },
    ],
  },
  {
    name: "Mount Rowan",
    variations: [
      {
        name: "MTRO",
      },
    ],
  },
  {
    name: "Mount Sabine",
    variations: [
      {
        name: "MTSA",
      },
    ],
  },
  {
    name: "Mount Taylor",
    variations: [
      {
        name: "MTTA",
      },
    ],
  },
  {
    name: "Mount Wallace",
    variations: [
      {
        name: "MTWA",
      },
    ],
  },
  {
    name: "Mount Wallace?",
    variations: [
      {
        name: "MT WA",
      },
    ],
  },
  {
    name: "Muddy Creek",
    variations: [
      {
        name: "MUDD",
      },
      {
        name: "MUDDY CK",
      },
      {
        name: "MUDDY CRK",
      },
    ],
  },
  {
    name: "Muddy Water Holes",
    variations: [
      {
        name: "MUDD",
      },
    ],
  },
  {
    name: "Mumbannar",
    variations: [
      {
        name: "MUMB",
      },
    ],
  },
  {
    name: "Murchison East",
    variations: [
      {
        name: "MURC",
      },
    ],
  },
  {
    name: "Murchison North",
    variations: [
      {
        name: "MURC",
      },
    ],
  },
  {
    name: "Murndal Station",
    variations: [
      {
        name: "MURNDAL ST",
      },
    ],
  },
  {
    name: "Murrabit",
    variations: [
      {
        name: "MURR",
      },
    ],
  },
  {
    name: "Murray River",
    variations: [
      {
        name: "MURR",
      },
      {
        name: "MU RR",
      },
    ],
  },
  {
    name: "Murrindal",
    variations: [
      {
        name: "MURR",
      },
    ],
  },
  {
    name: "Murrindindi",
    variations: [
      {
        name: "MURR",
      },
      {
        name: "MU RR",
      },
    ],
  },
  {
    name: "Nurrabiel",
    variations: [
      {
        name: "MU RR",
      },
      {
        name: "NURR",
      },
      {
        name: "NU RR",
      },
    ],
  },
  {
    name: "Musk",
    variations: [
      {
        name: "MUSK",
      },
    ],
  },
  {
    name: "Musk Creek",
    variations: [
      {
        name: "MUSK",
      },
      {
        name: "MU SK",
      },
    ],
  },
  {
    name: "Muskerry East",
    variations: [
      {
        name: "MUSK",
      },
    ],
  },
  {
    name: "Muston's Creek",
    variations: [
      {
        name: "MUST",
      },
    ],
  },
  {
    name: "Malvern Convent",
    variations: [
      {
        name: "MVERN CONVENT",
      },
    ],
  },
  {
    name: "Myall",
    variations: [
      {
        name: "MYAL",
      },
    ],
  },
  {
    name: "Myamyn",
    variations: [
      {
        name: "MYAM",
      },
      {
        name: "MY AM",
      },
    ],
  },
  {
    name: "Myers Flat",
    variations: [
      {
        name: "MYER",
      },
    ],
  },
  {
    name: "Myola",
    variations: [
      {
        name: "MYOL",
      },
    ],
  },
  {
    name: "Myrrhee",
    variations: [
      {
        name: "MYRR",
      },
    ],
  },
  {
    name: "Myrtlebank",
    variations: [
      {
        name: "MYRT",
      },
    ],
  },
  {
    name: "Mystic Park",
    variations: [
      {
        name: "MYST",
      },
    ],
  },
  {
    name: "Mywee",
    variations: [
      {
        name: "MYWE",
      },
    ],
  },
  {
    name: "Nalangil",
    variations: [
      {
        name: "NALA",
      },
    ],
  },
  {
    name: "Nalinga",
    variations: [
      {
        name: "NALI",
      },
    ],
  },
  {
    name: "North Altona",
    variations: [
      {
        name: "NALT",
      },
    ],
  },
  {
    name: "Nambrok",
    variations: [
      {
        name: "NAMB",
      },
    ],
  },
  {
    name: "Nandaly",
    variations: [
      {
        name: "NAND",
      },
    ],
  },
  {
    name: "Nangeela",
    variations: [
      {
        name: "NANG",
      },
    ],
  },
  {
    name: "Nangiloc",
    variations: [
      {
        name: "NANG",
      },
    ],
  },
  {
    name: "Nanneella",
    variations: [
      {
        name: "NANN",
      },
    ],
  },
  {
    name: "Napoleons",
    variations: [
      {
        name: "NAPO",
      },
      {
        name: "NA PO",
      },
    ],
  },
  {
    name: "Narre Warren",
    variations: [
      {
        name: "NAR",
      },
      {
        name: "NARR",
      },
      {
        name: "NWAR",
      },
      {
        name: "N WARREN",
      },
    ],
  },
  {
    name: "Narbethong",
    variations: [
      {
        name: "NARB",
      },
    ],
  },
  {
    name: "Nareen",
    variations: [
      {
        name: "NARE",
      },
    ],
  },
  {
    name: "Nareeb Nareeb Station",
    variations: [
      {
        name: "NAREEB ST",
      },
    ],
  },
  {
    name: "Nariel",
    variations: [
      {
        name: "NARI",
      },
    ],
  },
  {
    name: "Nariel Creek",
    variations: [
      {
        name: "NARI",
      },
    ],
  },
  {
    name: "Nariel Upper",
    variations: [
      {
        name: "NARI",
      },
    ],
  },
  {
    name: "Narioka",
    variations: [
      {
        name: "NARI",
      },
      {
        name: "NA RI",
      },
    ],
  },
  {
    name: "Narioka?",
    variations: [
      {
        name: "NARO",
      },
    ],
  },
  {
    name: "Naroghid",
    variations: [
      {
        name: "NARO",
      },
    ],
  },
  {
    name: "Narracan",
    variations: [
      {
        name: "NARR",
      },
      {
        name: "NA RR",
      },
    ],
  },
  {
    name: "Narrawong",
    variations: [
      {
        name: "NARR",
      },
      {
        name: "NA RR",
      },
    ],
  },
  {
    name: "Narre Warren East",
    variations: [
      {
        name: "NARR",
      },
    ],
  },
  {
    name: "Narre Warren North",
    variations: [
      {
        name: "NARR",
      },
    ],
  },
  {
    name: "Natimuk",
    variations: [
      {
        name: "NATI",
      },
      {
        name: "NA TI",
      },
      {
        name: "N MUK",
      },
    ],
  },
  {
    name: "Natya",
    variations: [
      {
        name: "NATY",
      },
    ],
  },
  {
    name: "Navigators",
    variations: [
      {
        name: "NAVI",
      },
    ],
  },
  {
    name: "Nayook",
    variations: [
      {
        name: "NAYO",
      },
    ],
  },
  {
    name: "North Balwyn",
    variations: [
      {
        name: "NBAL",
      },
      {
        name: "N BALW",
      },
      {
        name: "N BALWYN",
      },
      {
        name: "NTH BWYN",
      },
    ],
  },
  {
    name: "North Bayswater",
    variations: [
      {
        name: "NBAY",
      },
    ],
  },
  {
    name: "North Beaconsfield",
    variations: [
      {
        name: "N BFIELD",
      },
    ],
  },
  {
    name: "North Blackburn",
    variations: [
      {
        name: "NBLA",
      },
    ],
  },
  {
    name: "North Boweya",
    variations: [
      {
        name: "N BOWEY",
      },
      {
        name: "N BOWEYA",
      },
    ],
  },
  {
    name: "North Box Hill",
    variations: [
      {
        name: "NBOX",
      },
      {
        name: "NTH BOX H",
      },
    ],
  },
  {
    name: "North Brighton",
    variations: [
      {
        name: "NBRI",
      },
      {
        name: "NBTON",
      },
      {
        name: "N BTON",
      },
      {
        name: "NTH BGHTN",
      },
      {
        name: "NTH BGTN",
      },
      {
        name: "NTH BTN",
      },
    ],
  },
  {
    name: "Northcote?",
    variations: [
      {
        name: "N CAN",
      },
    ],
  },
  {
    name: "North Cannum",
    variations: [
      {
        name: "N CANNUM",
      },
      {
        name: "N CANNURN",
      },
    ],
  },
  {
    name: "North Carlton",
    variations: [
      {
        name: "NCAR",
      },
      {
        name: "NCARL",
      },
      {
        name: "N CARL",
      },
      {
        name: "N CARLT",
      },
      {
        name: "N CARLTON",
      },
      {
        name: "N CTON",
      },
      {
        name: "NTH CARL",
      },
      {
        name: "NTH CRLTN",
      },
      {
        name: "NTH CRTON",
      },
      {
        name: "NTH CTN",
      },
      {
        name: "NTH CTON",
      },
    ],
  },
  {
    name: "North Caulfield",
    variations: [
      {
        name: "NCAU",
      },
      {
        name: "NTH CFIELD",
      },
      {
        name: "NTH CFLD",
      },
    ],
  },
  {
    name: "North Cheltenham",
    variations: [
      {
        name: "NCHE",
      },
    ],
  },
  {
    name: "New Chum Gully",
    variations: [
      {
        name: "NCHUM GLY",
      },
      {
        name: "N CHUM GLY",
      },
      {
        name: "N CHUM GUL",
      },
      {
        name: "NEW CHUM G",
      },
    ],
  },
  {
    name: "Northcote Asylum",
    variations: [
      {
        name: "NCOTE A",
      },
      {
        name: "NCOTE ASY",
      },
      {
        name: "N COTE ASY",
      },
    ],
  },
  {
    name: "Northcote Benevolent Asylum",
    variations: [
      {
        name: "NCOTE B A",
      },
    ],
  },
  {
    name: "Northcote Convent",
    variations: [
      {
        name: "NCOTE CONVENT",
      },
      {
        name: "N COTE CONVENT",
      },
    ],
  },
  {
    name: "Northcote Hospital",
    variations: [
      {
        name: "N COTE HOS",
      },
    ],
  },
  {
    name: "Northcote Lunatic Asylum",
    variations: [
      {
        name: "NCOTE L A",
      },
      {
        name: "N COTE L A",
      },
      {
        name: "N-COTE L A",
      },
      {
        name: "NCOTR L A",
      },
    ],
  },
  {
    name: "North Clayton",
    variations: [
      {
        name: "NCLA",
      },
    ],
  },
  {
    name: "North Coburg",
    variations: [
      {
        name: "NCOB",
      },
      {
        name: "NTH COBG",
      },
    ],
  },
  {
    name: "North Croydon",
    variations: [
      {
        name: "NCRO",
      },
    ],
  },
  {
    name: "North Dandenong",
    variations: [
      {
        name: "NDAN",
      },
    ],
  },
  {
    name: "Neates Station",
    variations: [
      {
        name: "NEATES STN",
      },
    ],
  },
  {
    name: "Neds Corner",
    variations: [
      {
        name: "NEDS",
      },
    ],
  },
  {
    name: "Neerim East",
    variations: [
      {
        name: "NEERIM E",
      },
    ],
  },
  {
    name: "Neerim Junction",
    variations: [
      {
        name: "NEERIM J",
      },
    ],
  },
  {
    name: "Neerim South",
    variations: [
      {
        name: "NEERIM S",
      },
    ],
  },
  {
    name: "Nelson",
    variations: [
      {
        name: "NELS",
      },
    ],
  },
  {
    name: "North Eltham",
    variations: [
      {
        name: "NELT",
      },
    ],
  },
  {
    name: "Nerrena",
    variations: [
      {
        name: "NERR",
      },
    ],
  },
  {
    name: "Nerrin Nerrin",
    variations: [
      {
        name: "NERR",
      },
      {
        name: "NERIM NERI",
      },
    ],
  },
  {
    name: "Nerrina",
    variations: [
      {
        name: "NERR",
      },
    ],
  },
  {
    name: "Netherby",
    variations: [
      {
        name: "NETH",
      },
      {
        name: "NE TH",
      },
    ],
  },
  {
    name: "New Bendigo",
    variations: [
      {
        name: "NEW BEND",
      },
      {
        name: "NEW BENDIG",
      },
      {
        name: "NEW BGO",
      },
    ],
  },
  {
    name: "New Brighton",
    variations: [
      {
        name: "NEW BGTO",
      },
    ],
  },
  {
    name: "Newburn Park Estate",
    variations: [
      {
        name: "NEWBURNPAR",
      },
      {
        name: "NEWBURN PK",
      },
    ],
  },
  {
    name: "Newcomb",
    variations: [
      {
        name: "NEWC",
      },
    ],
  },
  {
    name: "Newlyn",
    variations: [
      {
        name: "NEWL",
      },
    ],
  },
  {
    name: "Newlyn North",
    variations: [
      {
        name: "NEWL",
      },
    ],
  },
  {
    name: "Newmerella",
    variations: [
      {
        name: "NEWM",
      },
    ],
  },
  {
    name: "Newport",
    variations: [
      {
        name: "NEWP",
      },
      {
        name: "NE WP",
      },
      {
        name: "NPORT",
      },
      {
        name: "N PORT",
      },
    ],
  },
  {
    name: "Newtown Hill",
    variations: [
      {
        name: "NEW TOWN H",
      },
      {
        name: "NEWTOWN HL",
      },
      {
        name: "N TOWN HIL",
      },
      {
        name: "N TOWN HLL",
      },
    ],
  },
  {
    name: "New Year's Flat",
    variations: [
      {
        name: "NEW YR FT",
      },
      {
        name: "NEW YR PT",
      },
      {
        name: "N Y FLAT",
      },
    ],
  },
  {
    name: "New Zealand Gully",
    variations: [
      {
        name: "NEW ZEALAN",
      },
      {
        name: "NEW ZEALAND",
      },
      {
        name: "NEW ZEALD",
      },
      {
        name: "NEW Z GY",
      },
      {
        name: "NEW ZLD GY",
      },
      {
        name: "N Z",
      },
      {
        name: "N ZE",
      },
      {
        name: "N ZEALAND",
      },
      {
        name: "N Z GLY",
      },
    ],
  },
  {
    name: "North Frankston",
    variations: [
      {
        name: "NFRA",
      },
    ],
  },
  {
    name: "North Geelong",
    variations: [
      {
        name: "NGEE",
      },
    ],
  },
  {
    name: "Nhill Hospital",
    variations: [
      {
        name: "NHILL H",
      },
      {
        name: "NHILL HOS",
      },
      {
        name: "NHILL HOSP",
      },
    ],
  },
  {
    name: "North Hotham",
    variations: [
      {
        name: "N HOTH",
      },
      {
        name: "N HOTHAM",
      },
    ],
  },
  {
    name: "North Hamilton",
    variations: [
      {
        name: "N HTON",
      },
      {
        name: "NTH HTON",
      },
    ],
  },
  {
    name: "Niagaroon",
    variations: [
      {
        name: "NIAG",
      },
    ],
  },
  {
    name: "Nicholson",
    variations: [
      {
        name: "NICH",
      },
    ],
  },
  {
    name: "Nichols Point",
    variations: [
      {
        name: "NICH",
      },
    ],
  },
  {
    name: "Niddrie",
    variations: [
      {
        name: "NIDD",
      },
    ],
  },
  {
    name: "Nintingbool",
    variations: [
      {
        name: "NIII",
      },
    ],
  },
  {
    name: "Ninda",
    variations: [
      {
        name: "NIND",
      },
    ],
  },
  {
    name: "Nine Mile Creek",
    variations: [
      {
        name: "NINE",
      },
      {
        name: "NI NE",
      },
      {
        name: "N M CREEK",
      },
    ],
  },
  {
    name: "Nirranda East",
    variations: [
      {
        name: "NIRR",
      },
    ],
  },
  {
    name: "Nirranda South",
    variations: [
      {
        name: "NIRR",
      },
    ],
  },
  {
    name: "North Kew",
    variations: [
      {
        name: "NKEW",
      },
    ],
  },
  {
    name: "North Lancefield",
    variations: [
      {
        name: "N LANCEFD",
      },
      {
        name: "N LANCEFIE",
      },
      {
        name: "N LANCEFL",
      },
      {
        name: "N LANCEFLD",
      },
      {
        name: "N LFIELD",
      },
      {
        name: "NTH LANCE",
      },
      {
        name: "NTH LANCEF",
      },
      {
        name: "NTH LANCFE",
      },
      {
        name: "NTH LANCFI",
      },
      {
        name: "NTH LFIEL",
      },
      {
        name: "NTH LFLD",
      },
    ],
  },
  {
    name: "North Laverton",
    variations: [
      {
        name: "NLAV",
      },
    ],
  },
  {
    name: "North Melbourne",
    variations: [
      {
        name: "N MEL",
      },
      {
        name: "N MELBOURN",
      },
      {
        name: "NRTH MELB",
      },
      {
        name: "NTH EMLB",
      },
      {
        name: "NTH MELB",
      },
      {
        name: "NTH MELBRNE",
      },
      {
        name: "NTH MLBREN",
      },
      {
        name: "NTH MLBRNE",
      },
    ],
  },
  {
    name: "North Melbourne Hotham",
    variations: [
      {
        name: "N MELB HOT",
      },
    ],
  },
  {
    name: "North Mirboo",
    variations: [
      {
        name: "N MIRBOO",
      },
    ],
  },
  {
    name: "North Muckleford",
    variations: [
      {
        name: "N MUCKLEFD",
      },
      {
        name: "NTH MFORD",
      },
    ],
  },
  {
    name: "North Mysia",
    variations: [
      {
        name: "N MYSIA",
      },
    ],
  },
  {
    name: "North Noble Park",
    variations: [
      {
        name: "NNOB",
      },
    ],
  },
  {
    name: "Noble Park",
    variations: [
      {
        name: "NOBL",
      },
      {
        name: "N PARK",
      },
    ],
  },
  {
    name: "Noojee",
    variations: [
      {
        name: "NOOJ",
      },
    ],
  },
  {
    name: "Noorinbee",
    variations: [
      {
        name: "NOOR",
      },
    ],
  },
  {
    name: "Noorinbee North",
    variations: [
      {
        name: "NOOR",
      },
    ],
  },
  {
    name: "Norlane",
    variations: [
      {
        name: "NORL",
      },
    ],
  },
  {
    name: "North Shore",
    variations: [
      {
        name: "NORT",
      },
    ],
  },
  {
    name: "Notting Hill",
    variations: [
      {
        name: "NOTT",
      },
    ],
  },
  {
    name: "Nowa Nowa",
    variations: [
      {
        name: "NOWA",
      },
    ],
  },
  {
    name: "Nowhere Creek",
    variations: [
      {
        name: "NOWH",
      },
    ],
  },
  {
    name: "Nowingi",
    variations: [
      {
        name: "NOWI",
      },
    ],
  },
  {
    name: "North Portland",
    variations: [
      {
        name: "NPOR",
      },
    ],
  },
  {
    name: "North Port Railway Station",
    variations: [
      {
        name: "N PT RAILW STN",
      },
    ],
  },
  {
    name: "Near Ballarat",
    variations: [
      {
        name: "NR BALLT",
      },
    ],
  },
  {
    name: "North Richmond",
    variations: [
      {
        name: "NRIC",
      },
      {
        name: "NRMOND",
      },
      {
        name: "N RMOND",
      },
      {
        name: "NTH RICHD",
      },
      {
        name: "NTH RMND",
      },
      {
        name: "NTH RMOND",
      },
    ],
  },
  {
    name: "North Ringwood",
    variations: [
      {
        name: "NRIN",
      },
    ],
  },
  {
    name: "North Scoresby",
    variations: [
      {
        name: "N SCRSBY",
      },
    ],
  },
  {
    name: "North Springvale",
    variations: [
      {
        name: "NSPR",
      },
    ],
  },
  {
    name: "North Sunshine",
    variations: [
      {
        name: "NSUN",
      },
    ],
  },
  {
    name: "North Ballarat",
    variations: [
      {
        name: "NTH BRAT",
      },
    ],
  },
  {
    name: "North Brunswick",
    variations: [
      {
        name: "NTH BRUNS",
      },
      {
        name: "NTH BWICK",
      },
    ],
  },
  {
    name: "North Campbellfield",
    variations: [
      {
        name: "NTH CBLFLD",
      },
    ],
  },
  {
    name: "North Chilwell, Geelong",
    variations: [
      {
        name: "NTH CHIL",
      },
    ],
  },
  {
    name: "North Footscray",
    variations: [
      {
        name: "NTH FCRAY",
      },
    ],
  },
  {
    name: "North Gippsland",
    variations: [
      {
        name: "NTH GIPPS",
      },
      {
        name: "NTH GLAND",
      },
    ],
  },
  {
    name: "North Parade, Creswick",
    variations: [
      {
        name: "NTH PARADE",
      },
    ],
  },
  {
    name: "North Port, Port Melbourne",
    variations: [
      {
        name: "NTH PORT",
      },
    ],
  },
  {
    name: "North Wharf Melbourne",
    variations: [
      {
        name: "NTH WHARF MELB",
      },
    ],
  },
  {
    name: "Nug Nug",
    variations: [
      {
        name: "NUGN",
      },
    ],
  },
  {
    name: "Nulla Vale",
    variations: [
      {
        name: "NULL",
      },
    ],
  },
  {
    name: "Nullawarre",
    variations: [
      {
        name: "NULL",
      },
    ],
  },
  {
    name: "Nullawil",
    variations: [
      {
        name: "NULL",
      },
    ],
  },
  {
    name: "Nungurner",
    variations: [
      {
        name: "NUNG",
      },
    ],
  },
  {
    name: "Nurcoung",
    variations: [
      {
        name: "NURC",
      },
    ],
  },
  {
    name: "Nutfield",
    variations: [
      {
        name: "NUTF",
      },
    ],
  },
  {
    name: "North Wandin",
    variations: [
      {
        name: "NWAN",
      },
    ],
  },
  {
    name: "North Warrendyte",
    variations: [
      {
        name: "NWAR",
      },
    ],
  },
  {
    name: "North Wangaratta",
    variations: [
      {
        name: "N WAT",
      },
      {
        name: "N WATTA",
      },
      {
        name: "N WGTTA",
      },
    ],
  },
  {
    name: "Nyah",
    variations: [
      {
        name: "NYAH",
      },
    ],
  },
  {
    name: "Nyah West",
    variations: [
      {
        name: "NYAH",
      },
    ],
  },
  {
    name: "Nyora",
    variations: [
      {
        name: "NYOR",
      },
    ],
  },
  {
    name: "Oaklands Junction",
    variations: [
      {
        name: "OAKL",
      },
    ],
  },
  {
    name: "Oakleigh East",
    variations: [
      {
        name: "OAKL",
      },
    ],
  },
  {
    name: "Oakleigh South",
    variations: [
      {
        name: "OAKL",
      },
    ],
  },
  {
    name: "Oak Park",
    variations: [
      {
        name: "OAKP",
      },
    ],
  },
  {
    name: "Officer",
    variations: [
      {
        name: "OFFI",
      },
    ],
  },
  {
    name: "Old Dunolly",
    variations: [
      {
        name: "OLDD",
      },
      {
        name: "OLD DUNNOL",
      },
      {
        name: "OLD DUNOLL",
      },
      {
        name: "OLD DUNOLLY",
      },
      {
        name: "OLD DUNOLY",
      },
    ],
  },
  {
    name: "Old Mans Gully",
    variations: [
      {
        name: "OLD MANS G",
      },
      {
        name: "OLDMANSGLY",
      },
      {
        name: "OLDMANS GY",
      },
    ],
  },
  {
    name: "Olinda",
    variations: [
      {
        name: "OLIN",
      },
    ],
  },
  {
    name: "Ombersley",
    variations: [
      {
        name: "OMBE",
      },
    ],
  },
  {
    name: "Omeo",
    variations: [
      {
        name: "OM EO",
      },
      {
        name: "OWES",
      },
    ],
  },
  {
    name: "One Mile Gully",
    variations: [
      {
        name: "ONE EYE G",
      },
      {
        name: "ONE EYE GU",
      },
    ],
  },
  {
    name: "On Way To Melbourne",
    variations: [
      {
        name: "ON WAY TO MELB",
      },
    ],
  },
  {
    name: "On Way To Parkville",
    variations: [
      {
        name: "ON WAY TO PVILLE",
      },
    ],
  },
  {
    name: "Orbost",
    variations: [
      {
        name: "ORBO",
      },
      {
        name: "OR BO",
      },
    ],
  },
  {
    name: "Orrvale",
    variations: [
      {
        name: "ORRV",
      },
    ],
  },
  {
    name: "Osbornes Flat",
    variations: [
      {
        name: "OSBO",
      },
      {
        name: "OS BO",
      },
    ],
  },
  {
    name: "Outtrim",
    variations: [
      {
        name: "OUTT",
      },
      {
        name: "OUTTM",
      },
    ],
  },
  {
    name: "Ovens",
    variations: [
      {
        name: "OVEN",
      },
    ],
  },
  {
    name: "Ovens & Murray District",
    variations: [
      {
        name: "OVEN",
      },
      {
        name: "OVENS",
      },
      {
        name: "OWEN",
      },
    ],
  },
  {
    name: "Ovens Creek",
    variations: [
      {
        name: "OVENS CREE",
      },
    ],
  },
  {
    name: "Ovens Crossing",
    variations: [
      {
        name: "OVENS CROS",
      },
    ],
  },
  {
    name: "Ovens Diggings",
    variations: [
      {
        name: "OVENS DIGG",
      },
    ],
  },
  {
    name: "Ovens District",
    variations: [
      {
        name: "OVENS DIST",
      },
    ],
  },
  {
    name: "Owensville",
    variations: [
      {
        name: "OWEN",
      },
    ],
  },
  {
    name: "Oxley Flats",
    variations: [
      {
        name: "OXLE",
      },
      {
        name: "OX LE",
      },
    ],
  },
  {
    name: "Ozenkadnook",
    variations: [
      {
        name: "OZEN",
      },
    ],
  },
  {
    name: "Paaratte",
    variations: [
      {
        name: "PAAR",
      },
    ],
  },
  {
    name: "Pakenham Upper",
    variations: [
      {
        name: "PAKE",
      },
    ],
  },
  {
    name: "Palmers Gully",
    variations: [
      {
        name: "PALM",
      },
      {
        name: "PALMERS GL",
      },
    ],
  },
  {
    name: "Panitya",
    variations: [
      {
        name: "PANI",
      },
    ],
  },
  {
    name: "Panton Hill",
    variations: [
      {
        name: "PANT",
      },
      {
        name: "PA NT",
      },
      {
        name: "P HILL",
      },
    ],
  },
  {
    name: "Park Orchards",
    variations: [
      {
        name: "PARK",
      },
    ],
  },
  {
    name: "Park Hill Station",
    variations: [
      {
        name: "PARK HL ST",
      },
    ],
  },
  {
    name: "Parwan",
    variations: [
      {
        name: "PARW",
      },
    ],
  },
  {
    name: "Paschendale",
    variations: [
      {
        name: "PASC",
      },
    ],
  },
  {
    name: "Pascoe Vale South",
    variations: [
      {
        name: "PASC",
      },
    ],
  },
  {
    name: "Pascoeville",
    variations: [
      {
        name: "PASC",
      },
    ],
  },
  {
    name: "Pastoria",
    variations: [
      {
        name: "PAST",
      },
    ],
  },
  {
    name: "Patchewollock",
    variations: [
      {
        name: "PATC",
      },
    ],
  },
  {
    name: "Patho",
    variations: [
      {
        name: "PATH",
      },
    ],
  },
  {
    name: "Patterson Lakes",
    variations: [
      {
        name: "PATT",
      },
    ],
  },
  {
    name: "Patyah",
    variations: [
      {
        name: "PATY",
      },
    ],
  },
  {
    name: "Powlett River",
    variations: [
      {
        name: "P CREEK",
      },
    ],
  },
  {
    name: "Pearcedale",
    variations: [
      {
        name: "PEAR",
      },
    ],
  },
  {
    name: "Pearsondale",
    variations: [
      {
        name: "PEAR",
      },
    ],
  },
  {
    name: "Peechelba East",
    variations: [
      {
        name: "PEEC",
      },
    ],
  },
  {
    name: "Pella",
    variations: [
      {
        name: "PELL",
      },
    ],
  },
  {
    name: "Pennyroyal",
    variations: [
      {
        name: "PENN",
      },
    ],
  },
  {
    name: "Penola South Australia",
    variations: [
      {
        name: "PENO",
      },
      {
        name: "PENOLA",
      },
      {
        name: "PENOLA SA",
      },
      {
        name: "PENOLA S A",
      },
    ],
  },
  {
    name: "Pentridge Prison Hospital",
    variations: [
      {
        name: "PENT",
      },
    ],
  },
  {
    name: "Perry Bridge",
    variations: [
      {
        name: "PERR",
      },
    ],
  },
  {
    name: "Peterborough",
    variations: [
      {
        name: "PETE",
      },
    ],
  },
  {
    name: "Peters Diggings",
    variations: [
      {
        name: "PETE",
      },
    ],
  },
  {
    name: "Pettiford(s) Hill",
    variations: [
      {
        name: "PETT",
      },
    ],
  },
  {
    name: "Port Fairy",
    variations: [
      {
        name: "PFAI",
      },
      {
        name: "P FAIRY",
      },
      {
        name: "PORT",
      },
      {
        name: "PO RT",
      },
      {
        name: "PTFAIRY",
      },
      {
        name: "PT FAIRY",
      },
    ],
  },
  {
    name: "Piangil",
    variations: [
      {
        name: "PIAN",
      },
    ],
  },
  {
    name: "Picnic Point",
    variations: [
      {
        name: "PICN",
      },
      {
        name: "PICNIC PT",
      },
    ],
  },
  {
    name: "Pier Milan",
    variations: [
      {
        name: "PIER",
      },
    ],
  },
  {
    name: "Pigeon Ponds",
    variations: [
      {
        name: "PIGE",
      },
    ],
  },
  {
    name: "Pine Lodge",
    variations: [
      {
        name: "PINE",
      },
    ],
  },
  {
    name: "Pipers Creek",
    variations: [
      {
        name: "PIPE",
      },
    ],
  },
  {
    name: "Pira",
    variations: [
      {
        name: "PIRA",
      },
    ],
  },
  {
    name: "Piries",
    variations: [
      {
        name: "PIRI",
      },
    ],
  },
  {
    name: "Pirron Yallock",
    variations: [
      {
        name: "PIRR",
      },
      {
        name: "P YA",
      },
      {
        name: "P YALOOK",
      },
    ],
  },
  {
    name: "Pitfield Plains",
    variations: [
      {
        name: "PITF",
      },
      {
        name: "PI TF",
      },
    ],
  },
  {
    name: "Portland Benevolent Asylum",
    variations: [
      {
        name: "PLAND B A",
      },
      {
        name: "PLANT B A",
      },
      {
        name: "PORTLAND B A",
      },
    ],
  },
  {
    name: "Portland Hospital",
    variations: [
      {
        name: "PLAND H",
      },
      {
        name: "PLAND HOS",
      },
    ],
  },
  {
    name: "Portland H M Gaol",
    variations: [
      {
        name: "PLAND H M GAOL",
      },
    ],
  },
  {
    name: "Plenty River",
    variations: [
      {
        name: "PLENTY",
      },
      {
        name: "PLENTY RIR",
      },
      {
        name: "PLENTY RIV",
      },
    ],
  },
  {
    name: "Plenty Bridge",
    variations: [
      {
        name: "PLENTY BDG",
      },
    ],
  },
  {
    name: "Point Cook",
    variations: [
      {
        name: "POIN",
      },
    ],
  },
  {
    name: "Point Henry",
    variations: [
      {
        name: "POIN",
      },
    ],
  },
  {
    name: "Point Lonsdale",
    variations: [
      {
        name: "POIN",
      },
      {
        name: "PTLO",
      },
      {
        name: "PT LONSDAL",
      },
      {
        name: "PT LONSDALE",
      },
    ],
  },
  {
    name: "Polwarth",
    variations: [
      {
        name: "POLW",
      },
    ],
  },
  {
    name: "Pomborneit North",
    variations: [
      {
        name: "POMB",
      },
    ],
  },
  {
    name: "Pomonal",
    variations: [
      {
        name: "POMO",
      },
    ],
  },
  {
    name: "Poolaijelo",
    variations: [
      {
        name: "POOL",
      },
    ],
  },
  {
    name: "Pootilla",
    variations: [
      {
        name: "POOT",
      },
    ],
  },
  {
    name: "Poowong East",
    variations: [
      {
        name: "POOW",
      },
    ],
  },
  {
    name: "Porcupine Ridge",
    variations: [
      {
        name: "PORC",
      },
    ],
  },
  {
    name: "Portsea",
    variations: [
      {
        name: "PORT",
      },
      {
        name: "PO RT",
      },
    ],
  },
  {
    name: "Pottery Flat",
    variations: [
      {
        name: "POTT",
      },
    ],
  },
  {
    name: "Pound Creek",
    variations: [
      {
        name: "POUN",
      },
    ],
  },
  {
    name: "Powelltown",
    variations: [
      {
        name: "POWE",
      },
    ],
  },
  {
    name: "Powers Creek",
    variations: [
      {
        name: "POWE",
      },
    ],
  },
  {
    name: "Powlett's Plains Station",
    variations: [
      {
        name: "POWLETTS P",
      },
    ],
  },
  {
    name: "Prahran Alfred Hospital",
    variations: [
      {
        name: "PRAHRAN ALF HOSP",
      },
      {
        name: "PRNALFHOSP",
      },
      {
        name: "PRN ALF H",
      },
      {
        name: "PRN ALF HOSP",
      },
    ],
  },
  {
    name: "Preston South",
    variations: [
      {
        name: "PRESTON S",
      },
    ],
  },
  {
    name: "Preston West",
    variations: [
      {
        name: "PRESTON W",
      },
    ],
  },
  {
    name: "Pentridge Gaol",
    variations: [
      {
        name: "PRIDGE",
      },
    ],
  },
  {
    name: "Prince Consort (Ship)",
    variations: [
      {
        name: "PRIN",
      },
    ],
  },
  {
    name: "Prince Of The Seas (Ship)",
    variations: [
      {
        name: "PRIN",
      },
    ],
  },
  {
    name: "Prince Of Wales (Ship)",
    variations: [
      {
        name: "PRIN",
      },
    ],
  },
  {
    name: "Prahran or Prince Alfred",
    variations: [
      {
        name: "PRIN",
      },
    ],
  },
  {
    name: "Princes Hill",
    variations: [
      {
        name: "PRIN",
      },
    ],
  },
  {
    name: "Princetown",
    variations: [
      {
        name: "PRIN",
      },
    ],
  },
  {
    name: "Princes Bridge",
    variations: [
      {
        name: "PRINCES BGE",
      },
    ],
  },
  {
    name: "Prahran Hospital",
    variations: [
      {
        name: "PRN HOSP",
      },
    ],
  },
  {
    name: "Port Fairy Hospital",
    variations: [
      {
        name: "PT FAIRY H",
      },
      {
        name: "PT FAIRY HOS",
      },
      {
        name: "PT FAIRY HOSP",
      },
      {
        name: "PT FAIRY HSP",
      },
    ],
  },
  {
    name: "Puckapunyal",
    variations: [
      {
        name: "PUCK",
      },
    ],
  },
  {
    name: "Puebla",
    variations: [
      {
        name: "PUEB",
      },
    ],
  },
  {
    name: "Puralka",
    variations: [
      {
        name: "PURA",
      },
    ],
  },
  {
    name: "Portland Bay",
    variations: [
      {
        name: "PTLAND BAY",
      },
    ],
  },
  {
    name: "Queenstown",
    variations: [
      {
        name: "QSTOWN",
      },
      {
        name: "QTOWN",
      },
      {
        name: "QUEE",
      },
      {
        name: "QU EE",
      },
      {
        name: "QUTOWN",
      },
    ],
  },
  {
    name: "Quantong",
    variations: [
      {
        name: "QUAN",
      },
    ],
  },
  {
    name: "Rainbow",
    variations: [
      {
        name: "RAIN",
      },
      {
        name: "RBOW",
      },
      {
        name: "RHOW",
      },
    ],
  },
  {
    name: "Ranceby",
    variations: [
      {
        name: "RANC",
      },
    ],
  },
  {
    name: "Rawson",
    variations: [
      {
        name: "RAWS",
      },
    ],
  },
  {
    name: "Red Hill",
    variations: [
      {
        name: "RED",
      },
      {
        name: "REDH",
      },
      {
        name: "RED H",
      },
    ],
  },
  {
    name: "Redan",
    variations: [
      {
        name: "REDA",
      },
    ],
  },
  {
    name: "Red Bluff",
    variations: [
      {
        name: "REDB",
      },
    ],
  },
  {
    name: "Red Cliffs",
    variations: [
      {
        name: "REDC",
      },
    ],
  },
  {
    name: "Reedy Creek",
    variations: [
      {
        name: "REDD",
      },
      {
        name: "REED",
      },
      {
        name: "RE ED",
      },
      {
        name: "REEDY C",
      },
      {
        name: "REEDY CK",
      },
      {
        name: "REEDY CR",
      },
      {
        name: "REEDY CRK",
      },
    ],
  },
  {
    name: "Riddells Creek",
    variations: [
      {
        name: "REDD",
      },
      {
        name: "RIDD",
      },
      {
        name: "RI DD",
      },
      {
        name: "RIDDEL C",
      },
      {
        name: "RIDDELLS C",
      },
      {
        name: "RIDDELLS CK",
      },
      {
        name: "RIDDELLS CR",
      },
      {
        name: "RIDDELLS CRK",
      },
    ],
  },
  {
    name: "Reefton",
    variations: [
      {
        name: "REEF",
      },
    ],
  },
  {
    name: "Regent",
    variations: [
      {
        name: "REGE",
      },
    ],
  },
  {
    name: "Reids Creek",
    variations: [
      {
        name: "REID",
      },
    ],
  },
  {
    name: "Research",
    variations: [
      {
        name: "RESE",
      },
    ],
  },
  {
    name: "Retreat Station",
    variations: [
      {
        name: "RETREAD ST",
      },
    ],
  },
  {
    name: "Queen Of The North",
    variations: [
      {
        name: "QHEEN OF T",
      },
    ],
  },
  {
    name: "Richmond (Paddock?)",
    variations: [
      {
        name: "RICHARDCK",
      },
    ],
  },
  {
    name: "Richmond South",
    variations: [
      {
        name: "RICHD S",
      },
      {
        name: "RMD STH",
      },
      {
        name: "RMOND S",
      },
    ],
  },
  {
    name: "Richmond Flats",
    variations: [
      {
        name: "RICHMOND F",
      },
      {
        name: "RMOND FLA",
      },
      {
        name: "RMOND FLT",
      },
      {
        name: "RMOND FT",
      },
    ],
  },
  {
    name: "Rifle Downs Station",
    variations: [
      {
        name: "RIFLE DWNS",
      },
    ],
  },
  {
    name: "Rifle Ranges Station",
    variations: [
      {
        name: "RIFLE RNGE",
      },
    ],
  },
  {
    name: "Ringwood East",
    variations: [
      {
        name: "RING",
      },
    ],
  },
  {
    name: "Ripley",
    variations: [
      {
        name: "RIPL",
      },
    ],
  },
  {
    name: "Ripponlea",
    variations: [
      {
        name: "RIPP",
      },
    ],
  },
  {
    name: "River Plenty",
    variations: [
      {
        name: "RIVE",
      },
      {
        name: "RVR PLENTY",
      },
    ],
  },
  {
    name: "Riverslea",
    variations: [
      {
        name: "RIVE",
      },
    ],
  },
  {
    name: "River Exe Station",
    variations: [
      {
        name: "RIVER EX",
      },
    ],
  },
  {
    name: "River Station (Roadnight, owner)",
    variations: [
      {
        name: "RIVER STN",
      },
      {
        name: "RIV STN",
      },
    ],
  },
  {
    name: "Royal Park",
    variations: [
      {
        name: "RL PARK",
      },
      {
        name: "ROYA",
      },
      {
        name: "ROYAL PK",
      },
      {
        name: "RPARK",
      },
      {
        name: "R PARK",
      },
      {
        name: "RYL PARK",
      },
    ],
  },
  {
    name: "Richmond North",
    variations: [
      {
        name: "RMD N",
      },
      {
        name: "RMOND N",
      },
    ],
  },
  {
    name: "Richmond & Fitzroy Between",
    variations: [
      {
        name: "RMOND & FROY BET",
      },
    ],
  },
  {
    name: "Richmond Asylum",
    variations: [
      {
        name: "RMOND ASY",
      },
    ],
  },
  {
    name: "Richmond C? C?",
    variations: [
      {
        name: "RMOND C C",
      },
    ],
  },
  {
    name: "Richmond East",
    variations: [
      {
        name: "RMOND E",
      },
    ],
  },
  {
    name: "Richmond Paddock",
    variations: [
      {
        name: "RMOND PDCK",
      },
    ],
  },
  {
    name: "Richmond West",
    variations: [
      {
        name: "RMOND W",
      },
    ],
  },
  {
    name: "Royal Mail Ship (Ship name)",
    variations: [
      {
        name: "RMS (SHIP NAME)",
      },
    ],
  },
  {
    name: "Robinvale",
    variations: [
      {
        name: "ROBI",
      },
    ],
  },
  {
    name: "Rockbank",
    variations: [
      {
        name: "ROCK",
      },
    ],
  },
  {
    name: "Rocklyn",
    variations: [
      {
        name: "ROCK",
      },
    ],
  },
  {
    name: "Rocky Lead",
    variations: [
      {
        name: "ROCK",
      },
      {
        name: "RO CK",
      },
      {
        name: "ROCKY L",
      },
      {
        name: "ROCKY LD",
      },
    ],
  },
  {
    name: "Rokeby",
    variations: [
      {
        name: "ROKE",
      },
    ],
  },
  {
    name: "Rokewood Juction",
    variations: [
      {
        name: "ROKE",
      },
    ],
  },
  {
    name: "Rosanna",
    variations: [
      {
        name: "ROSA",
      },
    ],
  },
  {
    name: "Rosebrook",
    variations: [
      {
        name: "ROSE",
      },
    ],
  },
  {
    name: "Rosebud",
    variations: [
      {
        name: "ROSE",
      },
    ],
  },
  {
    name: "Rosewhite",
    variations: [
      {
        name: "ROSE",
      },
    ],
  },
  {
    name: "Rossbridge",
    variations: [
      {
        name: "ROSS",
      },
    ],
  },
  {
    name: "Ross Creek",
    variations: [
      {
        name: "ROSS",
      },
      {
        name: "RO SS",
      },
      {
        name: "ROSS C",
      },
      {
        name: "ROSS CK",
      },
      {
        name: "ROSS CRK",
      },
    ],
  },
  {
    name: "Rostron",
    variations: [
      {
        name: "ROST",
      },
    ],
  },
  {
    name: "Mt Rouse",
    variations: [
      {
        name: "ROUS",
      },
    ],
  },
  {
    name: "River Station",
    variations: [
      {
        name: "ROVE (RIVE)",
      },
    ],
  },
  {
    name: "Rowville",
    variations: [
      {
        name: "ROWV",
      },
    ],
  },
  {
    name: "Rubicon",
    variations: [
      {
        name: "RUBI",
      },
    ],
  },
  {
    name: "Ruffy",
    variations: [
      {
        name: "RUFF",
      },
    ],
  },
  {
    name: "Pupanyup",
    variations: [
      {
        name: "RU PA",
      },
    ],
  },
  {
    name: "Russells Creek",
    variations: [
      {
        name: "RUSS",
      },
      {
        name: "RU SS",
      },
      {
        name: "RUSSELL C",
      },
      {
        name: "RUSSELL CK",
      },
      {
        name: "RUSSELLS C",
      },
    ],
  },
  {
    name: "Ruthvenfield",
    variations: [
      {
        name: "RUTH",
      },
    ],
  },
  {
    name: "Ryanston",
    variations: [
      {
        name: "RYAN",
      },
    ],
  },
  {
    name: "Ryries Station",
    variations: [
      {
        name: "RYRIES STN",
      },
    ],
  },
  {
    name: "Rythdale",
    variations: [
      {
        name: "RYTH",
      },
    ],
  },
  {
    name: "Safety Beach",
    variations: [
      {
        name: "SAFE",
      },
    ],
  },
  {
    name: "Sailors Creek",
    variations: [
      {
        name: "SAIL",
      },
      {
        name: "SA IL",
      },
    ],
  },
  {
    name: "Sailors Falls",
    variations: [
      {
        name: "SAIL",
      },
    ],
  },
  {
    name: "Sailors Hill",
    variations: [
      {
        name: "SAIL",
      },
      {
        name: "SA IL",
      },
    ],
  },
  {
    name: "Sailors Home",
    variations: [
      {
        name: "SAIL",
      },
      {
        name: "SAILORS HOME",
      },
    ],
  },
  {
    name: "St Albans??",
    variations: [
      {
        name: "SALB",
      },
    ],
  },
  {
    name: "Sale",
    variations: [
      {
        name: "SALE",
      },
      {
        name: "SA LE",
      },
      {
        name: "S LE",
      },
    ],
  },
  {
    name: "Sale Hospital",
    variations: [
      {
        name: "SALE H",
      },
      {
        name: "SALE HOS",
      },
      {
        name: "SALEHOSP",
      },
      {
        name: "SALE HOSP",
      },
      {
        name: "SALE HSP",
      },
    ],
  },
  {
    name: "Salisbury",
    variations: [
      {
        name: "SALI",
      },
    ],
  },
  {
    name: "Saltwater River",
    variations: [
      {
        name: "SALT",
      },
      {
        name: "SA LT",
      },
      {
        name: "SALTWATER",
      },
      {
        name: "SALT WATER",
      },
      {
        name: "SALT WAT R",
      },
      {
        name: "SALT WTR R",
      },
    ],
  },
  {
    name: "Salt Pans",
    variations: [
      {
        name: "SALT PANS",
      },
      {
        name: "SALT PAUS",
      },
    ],
  },
  {
    name: "Salt Plains Station",
    variations: [
      {
        name: "SALT PLAIN",
      },
    ],
  },
  {
    name: "Sandford",
    variations: [
      {
        name: "SAND",
      },
      {
        name: "SA ND",
      },
      {
        name: "SANDHURST",
      },
      {
        name: "SFORD",
      },
      {
        name: "S FORD",
      },
    ],
  },
  {
    name: "Sandon",
    variations: [
      {
        name: "SANDON",
      },
    ],
  },
  {
    name: "San Remo",
    variations: [
      {
        name: "SANR",
      },
      {
        name: "SA NR",
      },
      {
        name: "S REMO",
      },
    ],
  },
  {
    name: "Sassafras",
    variations: [
      {
        name: "SASS",
      },
    ],
  },
  {
    name: "South Braybrook",
    variations: [
      {
        name: "S BBROOK",
      },
      {
        name: "S BRAYBROO",
      },
    ],
  },
  {
    name: "South Brighton",
    variations: [
      {
        name: "S BGTON",
      },
      {
        name: "SBRI",
      },
      {
        name: "S BTON",
      },
      {
        name: "STH BRIGH",
      },
      {
        name: "STH BTON",
      },
    ],
  },
  {
    name: "South Blackburn",
    variations: [
      {
        name: "SBLA",
      },
    ],
  },
  {
    name: "South Box Hill",
    variations: [
      {
        name: "SBOX",
      },
    ],
  },
  {
    name: "Sherbrooke",
    variations: [
      {
        name: "S BROOKE",
      },
      {
        name: "SHER",
      },
    ],
  },
  {
    name: "Sunbury Asylum",
    variations: [
      {
        name: "SBURY A",
      },
      {
        name: "SBURY ASY",
      },
      {
        name: "SUNBURY A",
      },
      {
        name: "SUNBURY AS",
      },
    ],
  },
  {
    name: "Sunbury Lunatic Asylum",
    variations: [
      {
        name: "SBURY L A",
      },
      {
        name: "SUNBURY LA",
      },
      {
        name: "SUNBURY L A",
      },
      {
        name: "SUNBURY L ASY",
      },
      {
        name: "SUNBURY LUN ASY",
      },
    ],
  },
  {
    name: "South Caulfield",
    variations: [
      {
        name: "SCAU",
      },
      {
        name: "STH CAUL",
      },
      {
        name: "STH CFIELD",
      },
      {
        name: "STH CFLD",
      },
    ],
  },
  {
    name: "Scotchmans Lead",
    variations: [
      {
        name: "SCHMANS LD",
      },
      {
        name: "SCOT",
      },
      {
        name: "SCOTCHMAN",
      },
      {
        name: "SCOTCHMANS",
      },
    ],
  },
  {
    name: "Schnapper Point",
    variations: [
      {
        name: "SCHN",
      },
      {
        name: "SC HN",
      },
      {
        name: "SCHNAPPER P",
      },
      {
        name: "SCHNAPPER PT",
      },
      {
        name: "SCHN POINT",
      },
      {
        name: "SCHN PT",
      },
      {
        name: "SHAPPER PT",
      },
      {
        name: "SNAP",
      },
      {
        name: "SNAPPER P",
      },
      {
        name: "SNAPPER POINT",
      },
      {
        name: "SNAPPER PT",
      },
      {
        name: "SNPT",
      },
      {
        name: "SN PT",
      },
    ],
  },
  {
    name: "South Clayton",
    variations: [
      {
        name: "SCLA",
      },
    ],
  },
  {
    name: "Scotsburn",
    variations: [
      {
        name: "SCOT",
      },
    ],
  },
  {
    name: "Scotts Creek",
    variations: [
      {
        name: "SCOT",
      },
    ],
  },
  {
    name: "South Cranbourne",
    variations: [
      {
        name: "SCRA",
      },
    ],
  },
  {
    name: "Southern Cross",
    variations: [
      {
        name: "S CROSS",
      },
      {
        name: "SOUT",
      },
      {
        name: "SO UT",
      },
      {
        name: "SOUTH CROSS",
      },
      {
        name: "SOUTHERN C",
      },
      {
        name: "STH CROSS",
      },
      {
        name: "STHRN CROS",
      },
    ],
  },
  {
    name: "South Dandenong",
    variations: [
      {
        name: "SDAN",
      },
    ],
  },
  {
    name: "Strathdownie",
    variations: [
      {
        name: "SDOWNIE",
      },
      {
        name: "S DOWNIE",
      },
      {
        name: "ST RA",
      },
    ],
  },
  {
    name: "At Sea onboard 'Drumpark'",
    variations: [
      {
        name: "S DUNNPARK",
      },
    ],
  },
  {
    name: "Sea Lake",
    variations: [
      {
        name: "SEA",
      },
      {
        name: "SEAL",
      },
      {
        name: "S LAKE",
      },
    ],
  },
  {
    name: "Seabank",
    variations: [
      {
        name: "SEAB",
      },
    ],
  },
  {
    name: "Seaholme",
    variations: [
      {
        name: "SEAH",
      },
    ],
  },
  {
    name: "Seaspray",
    variations: [
      {
        name: "SEAS",
      },
    ],
  },
  {
    name: "Seaview",
    variations: [
      {
        name: "SEAV",
      },
    ],
  },
  {
    name: "Sebastian",
    variations: [
      {
        name: "SEBA",
      },
    ],
  },
  {
    name: "Sebastopol",
    variations: [
      {
        name: "SEBA",
      },
      {
        name: "SE BA",
      },
      {
        name: "SEVA",
      },
      {
        name: "SPOL",
      },
      {
        name: "S POL",
      },
      {
        name: "SPOOL",
      },
    ],
  },
  {
    name: "Seddon",
    variations: [
      {
        name: "SEDD",
      },
    ],
  },
  {
    name: "Sedgwick",
    variations: [
      {
        name: "SEDG",
      },
    ],
  },
  {
    name: "Selby",
    variations: [
      {
        name: "SELB",
      },
    ],
  },
  {
    name: "Serviceton",
    variations: [
      {
        name: "SERV",
      },
      {
        name: "SE RV",
      },
    ],
  },
  {
    name: "Swan Hill",
    variations: [
      {
        name: "SEVEN HILL",
      },
      {
        name: "S HILL",
      },
      {
        name: "SWAN",
      },
      {
        name: "SW AN",
      },
      {
        name: "SWAN H",
      },
      {
        name: "SWAN HL",
      },
    ],
  },
  {
    name: "Seven Hills Station/Estate",
    variations: [
      {
        name: "SEVEN HLS",
      },
    ],
  },
  {
    name: "Seville",
    variations: [
      {
        name: "SEVI",
      },
    ],
  },
  {
    name: "Seymour and (Tallarook)",
    variations: [
      {
        name: "SEYMORE AND",
      },
    ],
  },
  {
    name: "Seymour and Tallarook",
    variations: [
      {
        name: "SEYMOUR ANDT",
      },
    ],
  },
  {
    name: "South Fitzroy",
    variations: [
      {
        name: "S FITZ",
      },
      {
        name: "S FIZ",
      },
      {
        name: "S FROY",
      },
      {
        name: "STH FITZ",
      },
      {
        name: "STH FROY",
      },
    ],
  },
  {
    name: "South Geelong",
    variations: [
      {
        name: "SGEE",
      },
      {
        name: "S GEEL",
      },
    ],
  },
  {
    name: "South Gippsland",
    variations: [
      {
        name: "S GIPPS",
      },
      {
        name: "S GIPPSLAN",
      },
      {
        name: "STH GIPPS",
      },
      {
        name: "STH GIPPSL",
      },
      {
        name: "STH GLAND",
      },
    ],
  },
  {
    name: "South Gisborne",
    variations: [
      {
        name: "SGIS",
      },
    ],
  },
  {
    name: "South Glenormiston",
    variations: [
      {
        name: "SGLE",
      },
    ],
  },
  {
    name: "South Grant",
    variations: [
      {
        name: "S GRANT",
      },
    ],
  },
  {
    name: "Sailors Gully",
    variations: [
      {
        name: "S GULLY",
      },
    ],
  },
  {
    name: "Mt Shadwell",
    variations: [
      {
        name: "SHAD",
      },
    ],
  },
  {
    name: "Shady Creek",
    variations: [
      {
        name: "SHAD",
      },
    ],
  },
  {
    name: "South Hamilton",
    variations: [
      {
        name: "S HAMILTO",
      },
      {
        name: "S HAMTON",
      },
      {
        name: "S HTON",
      },
      {
        name: "STH HAMILT",
      },
      {
        name: "STH HAMTO",
      },
      {
        name: "STH HTON",
      },
    ],
  },
  {
    name: "Sheans Creek",
    variations: [
      {
        name: "SHEA",
      },
    ],
  },
  {
    name: "Sheep Hills",
    variations: [
      {
        name: "SHEE",
      },
      {
        name: "SH EE",
      },
      {
        name: "SHEEP H",
      },
    ],
  },
  {
    name: "Shellback Gully",
    variations: [
      {
        name: "SHELL BACK",
      },
      {
        name: "SHELL BK G",
      },
    ],
  },
  {
    name: "She Oaks",
    variations: [
      {
        name: "SHEO",
      },
    ],
  },
  {
    name: "Shepherds Flat",
    variations: [
      {
        name: "SHEP",
      },
      {
        name: "SH EP",
      },
      {
        name: "SHEP FLAT",
      },
      {
        name: "SHEPHERDS",
      },
      {
        name: "SHEPHERDS F",
      },
      {
        name: "SHEPHERS F",
      },
      {
        name: "SHEPH FLAT",
      },
      {
        name: "SHPHRDS FT",
      },
      {
        name: "SPHERDS F",
      },
    ],
  },
  {
    name: "Surrey Hills",
    variations: [
      {
        name: "S HILLS",
      },
      {
        name: "STH HILLS",
      },
      {
        name: "SURR",
      },
      {
        name: "SU RR",
      },
      {
        name: "SURREY H",
      },
      {
        name: "SURREY HL",
      },
      {
        name: "SURREY HLS",
      },
      {
        name: "SY H",
      },
      {
        name: "SY HILLS",
      },
    ],
  },
  {
    name: "Shoreham",
    variations: [
      {
        name: "SHOR",
      },
    ],
  },
  {
    name: "Sandhurst Asylum",
    variations: [
      {
        name: "S HURST AS",
      },
    ],
  },
  {
    name: "Sandhurst Benevolent Asylum",
    variations: [
      {
        name: "SHURST B A",
      },
    ],
  },
  {
    name: "Sandhurst Hospital",
    variations: [
      {
        name: "SHURST H",
      },
      {
        name: "SHURST HO",
      },
      {
        name: "S HURST HO",
      },
      {
        name: "SHURST HOS",
      },
      {
        name: "SHURSTHOSP",
      },
    ],
  },
  {
    name: "SS or Ship Iberia",
    variations: [
      {
        name: "S IBERIA",
      },
    ],
  },
  {
    name: "Sidonia",
    variations: [
      {
        name: "SIDO",
      },
    ],
  },
  {
    name: "Silvan",
    variations: [
      {
        name: "SILV",
      },
      {
        name: "SYLV",
      },
    ],
  },
  {
    name: "Silver Creek",
    variations: [
      {
        name: "SILV",
      },
    ],
  },
  {
    name: "Simpson",
    variations: [
      {
        name: "SIMP",
      },
    ],
  },
  {
    name: "Simpsons Creek",
    variations: [
      {
        name: "SIMP",
      },
    ],
  },
  {
    name: "??? Simpson's Hotel?",
    variations: [
      {
        name: "SI MP",
      },
    ],
  },
  {
    name: "Simpsons Reef",
    variations: [
      {
        name: "SIMPSONS R",
      },
    ],
  },
  {
    name: "Simpsons Road, Richmond",
    variations: [
      {
        name: "SIMPSONS ROAD",
      },
    ],
  },
  {
    name: "Sinnot(t)'s Station or Diggings",
    variations: [
      {
        name: "SINNOT",
      },
      {
        name: "SINNOTS",
      },
      {
        name: "SINNOTTS",
      },
    ],
  },
  {
    name: "Sinnot(t)'s Diggings",
    variations: [
      {
        name: "SINNOTTS D",
      },
    ],
  },
  {
    name: "Six Mile Creek",
    variations: [
      {
        name: "SIXM",
      },
      {
        name: "SIX MILE C",
      },
      {
        name: "SIX ML CRK",
      },
    ],
  },
  {
    name: "6th White Hill (Encampment)",
    variations: [
      {
        name: "SIXTH WHITE HILL",
      },
    ],
  },
  {
    name: "Skenes Creek",
    variations: [
      {
        name: "SKEN",
      },
    ],
  },
  {
    name: "South Kingsville",
    variations: [
      {
        name: "SKIN",
      },
      {
        name: "STH KVILLE",
      },
    ],
  },
  {
    name: "Slattery Creek",
    variations: [
      {
        name: "SLAT",
      },
    ],
  },
  {
    name: "South Melbourne",
    variations: [
      {
        name: "SMEL",
      },
      {
        name: "SMELB",
      },
      {
        name: "S MELBE",
      },
      {
        name: "S MELBN",
      },
      {
        name: "S MELBNE",
      },
      {
        name: "S MELBOURN",
      },
      {
        name: "S MELBOURNE",
      },
      {
        name: "S MELD",
      },
      {
        name: "S MELV",
      },
      {
        name: "SOUTH MELB",
      },
      {
        name: "STH MEL",
      },
      {
        name: "STH MELB",
      },
      {
        name: "STH MELBNE",
      },
      {
        name: "STH MELBOU",
      },
      {
        name: "STH MLBRE",
      },
      {
        name: "STH MLBRNE",
      },
      {
        name: "STH MLEB",
      },
    ],
  },
  {
    name: "South Melbourne Gaol",
    variations: [
      {
        name: "S MELB GL",
      },
    ],
  },
  {
    name: "(South?) Melbourne Gaol",
    variations: [
      {
        name: "SMELB GO",
      },
      {
        name: "S MELB GOA",
      },
    ],
  },
  {
    name: "South Melbourne Hospital",
    variations: [
      {
        name: "S MELB HO",
      },
      {
        name: "S MELB HOS",
      },
      {
        name: "SMELB HOSP",
      },
    ],
  },
  {
    name: "Strathmerton",
    variations: [
      {
        name: "SMERTON",
      },
      {
        name: "STMERTON",
      },
      {
        name: "STRA",
      },
      {
        name: "ST RA",
      },
    ],
  },
  {
    name: "Smiths Gully",
    variations: [
      {
        name: "SMIT",
      },
    ],
  },
  {
    name: "Smokeytown",
    variations: [
      {
        name: "SMOK",
      },
    ],
  },
  {
    name: "Smoko",
    variations: [
      {
        name: "SMOK",
      },
    ],
  },
  {
    name: "South Muckleford",
    variations: [
      {
        name: "S MUCKLE",
      },
      {
        name: "STH MFORD",
      },
    ],
  },
  {
    name: "South Murchison",
    variations: [
      {
        name: "S MURCHSN",
      },
    ],
  },
  {
    name: "Smythes Creek",
    variations: [
      {
        name: "SMYT",
      },
    ],
  },
  {
    name: "Snake Ridge Station",
    variations: [
      {
        name: "SNAKE RID",
      },
      {
        name: "SNAKE RIDG",
      },
      {
        name: "SNAKE RIV",
      },
    ],
  },
  {
    name: "South Nirranda",
    variations: [
      {
        name: "SNIR",
      },
    ],
  },
  {
    name: "South Oakleigh",
    variations: [
      {
        name: "SOAK",
      },
      {
        name: "S OAK",
      },
      {
        name: "STH OAK",
      },
      {
        name: "STH OAKL",
      },
    ],
  },
  {
    name: "Somers",
    variations: [
      {
        name: "SOME",
      },
    ],
  },
  {
    name: "Somerton",
    variations: [
      {
        name: "SOME",
      },
    ],
  },
  {
    name: "Somerville",
    variations: [
      {
        name: "SOME",
      },
    ],
  },
  {
    name: "Ship Otterspool",
    variations: [
      {
        name: "S OTTERSPO",
      },
      {
        name: "STH OTTERS",
      },
    ],
  },
  {
    name: "Spargo Creek",
    variations: [
      {
        name: "SPAR",
      },
    ],
  },
  {
    name: "South Pascoe Vale",
    variations: [
      {
        name: "SPAS",
      },
    ],
  },
  {
    name: "Spring Creek",
    variations: [
      {
        name: "SP CK",
      },
      {
        name: "SPRI",
      },
      {
        name: "SP RI",
      },
    ],
  },
  {
    name: "Specimen Hill",
    variations: [
      {
        name: "SPEC",
      },
      {
        name: "SPECIMAN HILL",
      },
      {
        name: "SPECIMANS HILL",
      },
      {
        name: "SPECIMEN",
      },
      {
        name: "SPECIMEN H",
      },
    ],
  },
  {
    name: "Speed",
    variations: [
      {
        name: "SPEE",
      },
    ],
  },
  {
    name: "Speewa",
    variations: [
      {
        name: "SPEE",
      },
    ],
  },
  {
    name: "Springhurst",
    variations: [
      {
        name: "SPHURST",
      },
      {
        name: "SPRI",
      },
      {
        name: "SP RI",
      },
      {
        name: "SPRING",
      },
      {
        name: "SPRINGHST",
      },
    ],
  },
  {
    name: "South Portland",
    variations: [
      {
        name: "S PLAND",
      },
      {
        name: "S PORT",
      },
      {
        name: "STH PLAND",
      },
    ],
  },
  {
    name: "Spring Gully",
    variations: [
      {
        name: "SPRI",
      },
      {
        name: "SPRING",
      },
    ],
  },
  {
    name: "Spring Hill",
    variations: [
      {
        name: "SPRI",
      },
      {
        name: "SP RI",
      },
    ],
  },
  {
    name: "Springvale",
    variations: [
      {
        name: "SPRI",
      },
      {
        name: "SPRING",
      },
    ],
  },
  {
    name: "Springvale South",
    variations: [
      {
        name: "SPRI",
      },
    ],
  },
  {
    name: "The Springs",
    variations: [
      {
        name: "SPRI",
      },
      {
        name: "SP RI",
      },
      {
        name: "SPRINGS",
      },
      {
        name: "THES",
      },
      {
        name: "TH ES",
      },
      {
        name: "THESPRINGS",
      },
      {
        name: "THE SPRING",
      },
    ],
  },
  {
    name: "Springs",
    variations: [
      {
        name: "SPRING",
      },
    ],
  },
  {
    name: "South Quambatook",
    variations: [
      {
        name: "S QTOOK",
      },
    ],
  },
  {
    name: "Steam Ship (Ship name)",
    variations: [
      {
        name: "SS (SHIP NAME)",
      },
      {
        name: "S S (SHIP NAME)",
      },
    ],
  },
  {
    name: "South Springfield",
    variations: [
      {
        name: "S SFIELD",
      },
      {
        name: "S SPFIELD",
      },
      {
        name: "S SPRFIELD",
      },
      {
        name: "S SPRFLD",
      },
    ],
  },
  {
    name: "South Springvale",
    variations: [
      {
        name: "SSPR",
      },
    ],
  },
  {
    name: "Staceys Bridge",
    variations: [
      {
        name: "STAC",
      },
    ],
  },
  {
    name: "St Albans",
    variations: [
      {
        name: "STAL",
      },
    ],
  },
  {
    name: "Stanhope",
    variations: [
      {
        name: "STAN",
      },
    ],
  },
  {
    name: "St Arnaud Hospital",
    variations: [
      {
        name: "ST A H",
      },
      {
        name: "ST A HOS",
      },
      {
        name: "ST A HOSP",
      },
      {
        name: "ST ARNAUD HOS",
      },
      {
        name: "ST ARNAUD HOSP",
      },
      {
        name: "ST ARNAUD HOSPL",
      },
    ],
  },
  {
    name: "St Arnaud Immigrants Home",
    variations: [
      {
        name: "ST ARNAUD IMM HOM",
      },
    ],
  },
  {
    name: "Stawell Hospital",
    variations: [
      {
        name: "STAWELL H",
      },
      {
        name: "STAWELL HO",
      },
      {
        name: "STAWELL HOS",
      },
      {
        name: "STAWELL HOSP",
      },
      {
        name: "STAWELL HOSPL",
      },
      {
        name: "STAWELL HS",
      },
    ],
  },
  {
    name: "St Clair",
    variations: [
      {
        name: "STCL",
      },
    ],
  },
  {
    name: "Steels Creek",
    variations: [
      {
        name: "STEE",
      },
    ],
  },
  {
    name: "South Bank (of Yarra)",
    variations: [
      {
        name: "STH BANK",
      },
    ],
  },
  {
    name: "South Camberwell",
    variations: [
      {
        name: "STH CWELL",
      },
    ],
  },
  {
    name: "St Helens",
    variations: [
      {
        name: "STHE",
      },
    ],
  },
  {
    name: "St Helens Plains",
    variations: [
      {
        name: "STHE",
      },
    ],
  },
  {
    name: "St Heliers",
    variations: [
      {
        name: "STHE",
      },
    ],
  },
  {
    name: "South Hawthorn",
    variations: [
      {
        name: "STH HAW",
      },
    ],
  },
  {
    name: "South Kensington",
    variations: [
      {
        name: "STH KEN",
      },
    ],
  },
  {
    name: "Strathbogie (Shire)",
    variations: [
      {
        name: "STH MLB",
      },
    ],
  },
  {
    name: "South Northcote",
    variations: [
      {
        name: "STH NCOTE",
      },
    ],
  },
  {
    name: "South Preston",
    variations: [
      {
        name: "STH PRESTO",
      },
    ],
  },
  {
    name: "South Richmond",
    variations: [
      {
        name: "STH RMOND",
      },
    ],
  },
  {
    name: "South Wangaratta",
    variations: [
      {
        name: "STH WANG",
      },
    ],
  },
  {
    name: "South Wanganella, NSW",
    variations: [
      {
        name: "STH WANGAL",
      },
    ],
  },
  {
    name: "South Wharf?",
    variations: [
      {
        name: "STH WHARF",
      },
    ],
  },
  {
    name: "St Kilda Hill",
    variations: [
      {
        name: "ST K HILL",
      },
    ],
  },
  {
    name: "St Kilda Railway Station",
    variations: [
      {
        name: "ST KILDA RLY STN",
      },
    ],
  },
  {
    name: "St Leonards",
    variations: [
      {
        name: "STLE",
      },
    ],
  },
  {
    name: "Stonehaven",
    variations: [
      {
        name: "STON",
      },
    ],
  },
  {
    name: "Stonyford",
    variations: [
      {
        name: "STON",
      },
    ],
  },
  {
    name: "Stony Creek",
    variations: [
      {
        name: "STON",
      },
    ],
  },
  {
    name: "Stony Point",
    variations: [
      {
        name: "STON",
      },
    ],
  },
  {
    name: "Strangways",
    variations: [
      {
        name: "STRA",
      },
      {
        name: "ST RA",
      },
      {
        name: "SWAYS",
      },
    ],
  },
  {
    name: "Strathallan",
    variations: [
      {
        name: "STRA",
      },
    ],
  },
  {
    name: "Strathbogie North",
    variations: [
      {
        name: "STRA",
      },
      {
        name: "ST RA",
      },
    ],
  },
  {
    name: "Strath Creek",
    variations: [
      {
        name: "STRA",
      },
    ],
  },
  {
    name: "Strathewen",
    variations: [
      {
        name: "STRA",
      },
    ],
  },
  {
    name: "Strathkellar",
    variations: [
      {
        name: "STRA",
      },
    ],
  },
  {
    name: "Strathlea",
    variations: [
      {
        name: "STRA",
      },
    ],
  },
  {
    name: "Strathmore",
    variations: [
      {
        name: "STRA",
      },
    ],
  },
  {
    name: "Strathmore Heights",
    variations: [
      {
        name: "STRA",
      },
    ],
  },
  {
    name: "Strathloddon Station",
    variations: [
      {
        name: "STRATHLOD",
      },
      {
        name: "STRATH LOD",
      },
      {
        name: "STRATHLODD",
      },
      {
        name: "STRATHLODDON",
      },
      {
        name: "STRATHLODN",
      },
    ],
  },
  {
    name: "Stringers Creek",
    variations: [
      {
        name: "STRI",
      },
    ],
  },
  {
    name: "Strzelecki",
    variations: [
      {
        name: "STRZ",
      },
    ],
  },
  {
    name: "Sugarloaf Creek",
    variations: [
      {
        name: "SUGA",
      },
    ],
  },
  {
    name: "Sunbury Lunatic",
    variations: [
      {
        name: "SUNBURY L",
      },
      {
        name: "SUNBURY LU",
      },
    ],
  },
  {
    name: "Sunshine North",
    variations: [
      {
        name: "SUNS",
      },
    ],
  },
  {
    name: "Sutherland (Plains)",
    variations: [
      {
        name: "SUTH",
      },
      {
        name: "SUTHERLAND",
      },
    ],
  },
  {
    name: "Sutherlands Creek",
    variations: [
      {
        name: "SUTH",
      },
      {
        name: "SUTHERLAND",
      },
    ],
  },
  {
    name: "South Wantirna",
    variations: [
      {
        name: "SWAN",
      },
    ],
  },
  {
    name: "Swan Marsh",
    variations: [
      {
        name: "SWAN",
      },
    ],
  },
  {
    name: "Swanpool",
    variations: [
      {
        name: "SWAN",
      },
    ],
  },
  {
    name: "Swan Reach",
    variations: [
      {
        name: "SWAN",
      },
      {
        name: "SW AN",
      },
      {
        name: "SWAN R",
      },
      {
        name: "SWAN RCH",
      },
    ],
  },
  {
    name: "Swanwater",
    variations: [
      {
        name: "SWAN",
      },
      {
        name: "SW AN",
      },
    ],
  },
  {
    name: "Swan Hill Hospital",
    variations: [
      {
        name: "SWAN HILL H",
      },
      {
        name: "SWAN HILL HOS",
      },
      {
        name: "SWAN HILL HOSP",
      },
    ],
  },
  {
    name: "South Werribee",
    variations: [
      {
        name: "SWER",
      },
    ],
  },
  {
    name: "Swifts Creek",
    variations: [
      {
        name: "SWIF",
      },
    ],
  },
  {
    name: "South Winchelsea",
    variations: [
      {
        name: "SWIN",
      },
    ],
  },
  {
    name: "Switzerland",
    variations: [
      {
        name: "SWIT",
      },
    ],
  },
  {
    name: "South Wonwondah",
    variations: [
      {
        name: "S WONDAH",
      },
    ],
  },
  {
    name: "Sydenham",
    variations: [
      {
        name: "SYDE",
      },
      {
        name: "SYDN",
      },
    ],
  },
  {
    name: "South Yarra (De?)",
    variations: [
      {
        name: "SY DE",
      },
    ],
  },
  {
    name: "Sydney (NSW)",
    variations: [
      {
        name: "SYDN",
      },
    ],
  },
  {
    name: "Sydney Road (Vic)",
    variations: [
      {
        name: "SYDN",
      },
    ],
  },
  {
    name: "Sydney Flat",
    variations: [
      {
        name: "SYDN",
      },
    ],
  },
  {
    name: "South Yarra (Dn?)",
    variations: [
      {
        name: "SY DN",
      },
    ],
  },
  {
    name: "Syndal",
    variations: [
      {
        name: "SYND",
      },
    ],
  },
  {
    name: "Tacoma",
    variations: [
      {
        name: "TACO",
      },
    ],
  },
  {
    name: "Taggerty",
    variations: [
      {
        name: "TAGG",
      },
    ],
  },
  {
    name: "Tahara Bridge",
    variations: [
      {
        name: "TAHA",
      },
    ],
  },
  {
    name: "Talbot Amherst",
    variations: [
      {
        name: "TALBOT A",
      },
      {
        name: "TALBOT AM",
      },
      {
        name: "TALBOT AMH",
      },
      {
        name: "TALBOT AMKERD",
      },
      {
        name: "TALBOT AMKUEL",
      },
    ],
  },
  {
    name: "Talbot Amherst Hospital",
    variations: [
      {
        name: "TALBOT A H",
      },
      {
        name: "TALBOT AMHERST H",
      },
      {
        name: "TALBOT AMHERST HO",
      },
    ],
  },
  {
    name: "Talbot and Amherst",
    variations: [
      {
        name: "TALBOT AND A",
      },
      {
        name: "TALBOT AND AMHERS",
      },
    ],
  },
  {
    name: "Talbot and Amherst Hospital",
    variations: [
      {
        name: "TALBOT & A HOS",
      },
    ],
  },
  {
    name: "Talbot and Caralulup?",
    variations: [
      {
        name: "TALBOT & C",
      },
      {
        name: "TALBOT AND C",
      },
    ],
  },
  {
    name: "Talbot and Caralulup? Hospital",
    variations: [
      {
        name: "TALBOT AND C HOSP",
      },
    ],
  },
  {
    name: "Talbot Caralulup?",
    variations: [
      {
        name: "TALBOT C",
      },
    ],
  },
  {
    name: "Talbot-Caralulup?",
    variations: [
      {
        name: "TALBOT -C",
      },
    ],
  },
  {
    name: "Talbot-Caralulup? Hospital",
    variations: [
      {
        name: "TALBOT -C HSP",
      },
    ],
  },
  {
    name: "?",
    variations: [
      {
        name: "TALBOT CK",
      },
      {
        name: "TALBOT CO",
      },
      {
        name: "TALBOT E",
      },
      {
        name: "TALBOT EC",
      },
      {
        name: "TALBOT E -C",
      },
      {
        name: "TALBOT ETC",
      },
      {
        name: "TALBOT N",
      },
      {
        name: "TALBOT R",
      },
      {
        name: "TALBOT RC",
      },
      {
        name: "TALBOT S A",
      },
      {
        name: "TALBOT STEPH",
      },
      {
        name: "TALBOT VA",
      },
      {
        name: "TALBOT W",
      },
    ],
  },
  {
    name: "Talbot (E?) Hospital",
    variations: [
      {
        name: "TALBOT E H",
      },
    ],
  },
  {
    name: "Talbot (Ete?) Hospital",
    variations: [
      {
        name: "TALBOT ETE HOSP",
      },
    ],
  },
  {
    name: "Talbot H? Richmond House?",
    variations: [
      {
        name: "TALBOT H",
      },
    ],
  },
  {
    name: "Talbot (H?) Hospital",
    variations: [
      {
        name: "TALBOT H H",
      },
      {
        name: "TALBOT H HOSP",
      },
    ],
  },
  {
    name: "Talbot Hospital",
    variations: [
      {
        name: "TALBOT HOS",
      },
      {
        name: "TALBOTHOSP",
      },
      {
        name: "TALBOT HOSP",
      },
      {
        name: "TALBOT HSP",
      },
    ],
  },
  {
    name: "Talbot (N?) Hospital",
    variations: [
      {
        name: "TALBOT N H",
      },
      {
        name: "TALBOT N HOS",
      },
      {
        name: "TALBOT N HOSP",
      },
    ],
  },
  {
    name: "Talbot (St?) Hospital",
    variations: [
      {
        name: "TALBOT ST HOSP",
      },
    ],
  },
  {
    name: "Talbot (Ste?) Hospital",
    variations: [
      {
        name: "TALBOT STE HOSP",
      },
    ],
  },
  {
    name: "Talbot South",
    variations: [
      {
        name: "TALBOT STH",
      },
    ],
  },
  {
    name: "Talbot Talbot County?",
    variations: [
      {
        name: "TALBOT TC",
      },
    ],
  },
  {
    name: "Talbot Talbot County? Hospital",
    variations: [
      {
        name: "TALBOT TC HOS",
      },
      {
        name: "TALBOT TC HOSP",
      },
    ],
  },
  {
    name: "Talbot (Vc?) Hospital",
    variations: [
      {
        name: "TALBOT VC HOS",
      },
    ],
  },
  {
    name: "Talbot (V?) Hospital",
    variations: [
      {
        name: "TALBOT V HOSPL",
      },
    ],
  },
  {
    name: "Tallandoon",
    variations: [
      {
        name: "TALL",
      },
    ],
  },
  {
    name: "Tallangatta",
    variations: [
      {
        name: "TALL",
      },
      {
        name: "TA LL",
      },
      {
        name: "TGATTA",
      },
    ],
  },
  {
    name: "Tallangatta East",
    variations: [
      {
        name: "TALL",
      },
    ],
  },
  {
    name: "Tallangatta Valley",
    variations: [
      {
        name: "TALL",
      },
    ],
  },
  {
    name: "Tallygaroopna",
    variations: [
      {
        name: "TALL",
      },
      {
        name: "TA LL",
      },
    ],
  },
  {
    name: "Tambo Crossing",
    variations: [
      {
        name: "TAMB",
      },
    ],
  },
  {
    name: "Tambo Upper",
    variations: [
      {
        name: "TAMB",
      },
    ],
  },
  {
    name: "Tamleugh",
    variations: [
      {
        name: "TAML",
      },
    ],
  },
  {
    name: "Tandarook",
    variations: [
      {
        name: "TAND",
      },
    ],
  },
  {
    name: "Tandarra",
    variations: [
      {
        name: "TAND",
      },
    ],
  },
  {
    name: "Tangambalanga",
    variations: [
      {
        name: "TANG",
      },
    ],
  },
  {
    name: "Tangil",
    variations: [
      {
        name: "TANG",
      },
      {
        name: "TA NG",
      },
    ],
  },
  {
    name: "Tanjil Bren",
    variations: [
      {
        name: "TANJ",
      },
    ],
  },
  {
    name: "Tanjil South",
    variations: [
      {
        name: "TANJ",
      },
    ],
  },
  {
    name: "Tantaraboo",
    variations: [
      {
        name: "TANT",
      },
    ],
  },
  {
    name: "Tanwood",
    variations: [
      {
        name: "TANW",
      },
    ],
  },
  {
    name: "Tanybryn",
    variations: [
      {
        name: "TANY",
      },
    ],
  },
  {
    name: "Tarcombe",
    variations: [
      {
        name: "TARC",
      },
    ],
  },
  {
    name: "Tarneit",
    variations: [
      {
        name: "TARN",
      },
    ],
  },
  {
    name: "Tarrone",
    variations: [
      {
        name: "TARO",
      },
      {
        name: "TARR",
      },
    ],
  },
  {
    name: "Taroon",
    variations: [
      {
        name: "TARO",
      },
    ],
  },
  {
    name: "Tarranyurk",
    variations: [
      {
        name: "TARR",
      },
    ],
  },
  {
    name: "Tarrenlea",
    variations: [
      {
        name: "TARR",
      },
    ],
  },
  {
    name: "Tarra Creek",
    variations: [
      {
        name: "TARRA CK",
      },
      {
        name: "TARRA CRK",
      },
    ],
  },
  {
    name: "Tarrengower",
    variations: [
      {
        name: "TARRANGOWE",
      },
      {
        name: "TARRENGOWE",
      },
    ],
  },
  {
    name: "Tarranginnie",
    variations: [
      {
        name: "TARRANJINN",
      },
    ],
  },
  {
    name: "Tarra Tarra",
    variations: [
      {
        name: "TARRA SERV",
      },
      {
        name: "TARRA T",
      },
      {
        name: "TARRA TA",
      },
      {
        name: "TARRA TARR",
      },
      {
        name: "YARRA TARR",
      },
    ],
  },
  {
    name: "Tarwin",
    variations: [
      {
        name: "TARW",
      },
    ],
  },
  {
    name: "Tarwin Lower",
    variations: [
      {
        name: "TARW",
      },
    ],
  },
  {
    name: "Tatong",
    variations: [
      {
        name: "TATO",
      },
    ],
  },
  {
    name: "Tawonga",
    variations: [
      {
        name: "TAWO",
      },
    ],
  },
  {
    name: "Taylors Lakes",
    variations: [
      {
        name: "TAYL",
      },
    ],
  },
  {
    name: "Teal Point",
    variations: [
      {
        name: "TEAL",
      },
    ],
  },
  {
    name: "Teddywaddy",
    variations: [
      {
        name: "TEDD",
      },
    ],
  },
  {
    name: "Telford",
    variations: [
      {
        name: "TELF",
      },
    ],
  },
  {
    name: "Telopea Downs",
    variations: [
      {
        name: "TELO",
      },
    ],
  },
  {
    name: "Templestowe Lower",
    variations: [
      {
        name: "TEMP",
      },
    ],
  },
  {
    name: "Tempy",
    variations: [
      {
        name: "TEMP",
      },
    ],
  },
  {
    name: "Tenby Point",
    variations: [
      {
        name: "TENB",
      },
    ],
  },
  {
    name: "Terip Terip",
    variations: [
      {
        name: "TERI",
      },
    ],
  },
  {
    name: "Was a Property/Station",
    variations: [
      {
        name: "TERINELLUM",
      },
    ],
  },
  {
    name: "Terrappee",
    variations: [
      {
        name: "TERR",
      },
    ],
  },
  {
    name: "Terrick Terrick",
    variations: [
      {
        name: "TERR",
      },
      {
        name: "TE RR",
      },
    ],
  },
  {
    name: "Terrick Terrick East",
    variations: [
      {
        name: "TERR",
      },
    ],
  },
  {
    name: "Tesbury",
    variations: [
      {
        name: "TESB",
      },
    ],
  },
  {
    name: "Tetoora Road",
    variations: [
      {
        name: "TETO",
      },
    ],
  },
  {
    name: "Thalia",
    variations: [
      {
        name: "THAL",
      },
    ],
  },
  {
    name: "The Basin",
    variations: [
      {
        name: "THEB",
      },
    ],
  },
  {
    name: "The Gap",
    variations: [
      {
        name: "THEG",
      },
    ],
  },
  {
    name: "The Gurdies ???",
    variations: [
      {
        name: "THEG",
      },
    ],
  },
  {
    name: "The Loddon District",
    variations: [
      {
        name: "THE LODDON",
      },
    ],
  },
  {
    name: "The Patch",
    variations: [
      {
        name: "THEP",
      },
    ],
  },
  {
    name: "Theresaville ?",
    variations: [
      {
        name: "THER",
      },
    ],
  },
  {
    name: "The Sisters",
    variations: [
      {
        name: "THES",
      },
    ],
  },
  {
    name: "W Creek or West Creek",
    variations: [
      {
        name: "THE W CK",
      },
      {
        name: "W CR",
      },
      {
        name: "WCRE",
      },
      {
        name: "W CRK",
      },
      {
        name: "W CREEK",
      },
    ],
  },
  {
    name: "Thologolong",
    variations: [
      {
        name: "THOL",
      },
    ],
  },
  {
    name: "Three Bridges",
    variations: [
      {
        name: "THRE",
      },
    ],
  },
  {
    name: "Timboon",
    variations: [
      {
        name: "TIMB",
      },
    ],
  },
  {
    name: "Timmering",
    variations: [
      {
        name: "TIMM",
      },
    ],
  },
  {
    name: "Tinamba",
    variations: [
      {
        name: "TINA",
      },
      {
        name: "TI NA",
      },
    ],
  },
  {
    name: "Tullamarine",
    variations: [
      {
        name: "TMARINE",
      },
      {
        name: "T MARINE",
      },
      {
        name: "TRINE",
      },
      {
        name: "TULL",
      },
      {
        name: "TULLA",
      },
    ],
  },
  {
    name: "Tongio West",
    variations: [
      {
        name: "TOBGIO W",
      },
      {
        name: "TONG",
      },
      {
        name: "TONGIO W",
      },
    ],
  },
  {
    name: "To St Vincents Hospital ??",
    variations: [
      {
        name: "TO CENT HOSP",
      },
    ],
  },
  {
    name: "Tallangatta?",
    variations: [
      {
        name: "TOLL",
      },
    ],
  },
  {
    name: "Toolleen",
    variations: [
      {
        name: "TOLL",
      },
      {
        name: "TOOL",
      },
      {
        name: "TO OL",
      },
      {
        name: "TOOLLEEU",
      },
    ],
  },
  {
    name: "Tolmie",
    variations: [
      {
        name: "TOLM",
      },
    ],
  },
  {
    name: "Tol Tol",
    variations: [
      {
        name: "TOLT",
      },
    ],
  },
  {
    name: "Toorak",
    variations: [
      {
        name: "TOMAK",
      },
      {
        name: "TOOR",
      },
      {
        name: "TO OR",
      },
    ],
  },
  {
    name: "Tonghi Creek",
    variations: [
      {
        name: "TONG",
      },
    ],
  },
  {
    name: "Tongio",
    variations: [
      {
        name: "TONG",
      },
    ],
  },
  {
    name: "Tongeo Station",
    variations: [
      {
        name: "TONGEO STN",
      },
    ],
  },
  {
    name: "Tonimbuk",
    variations: [
      {
        name: "TONI",
      },
    ],
  },
  {
    name: "Tooborac",
    variations: [
      {
        name: "TOOB",
      },
    ],
  },
  {
    name: "Toolamba",
    variations: [
      {
        name: "TOOL",
      },
      {
        name: "TO OL",
      },
    ],
  },
  {
    name: "Toolangi",
    variations: [
      {
        name: "TOOL",
      },
    ],
  },
  {
    name: "Toolern Vale",
    variations: [
      {
        name: "TOOL",
      },
      {
        name: "TO OL",
      },
    ],
  },
  {
    name: "Toolong",
    variations: [
      {
        name: "TOOL",
      },
    ],
  },
  {
    name: "Toora",
    variations: [
      {
        name: "TOOR",
      },
      {
        name: "TO OR",
      },
    ],
  },
  {
    name: "Tooronga",
    variations: [
      {
        name: "TOOR",
      },
    ],
  },
  {
    name: "Torquay",
    variations: [
      {
        name: "TORG",
      },
      {
        name: "TORQ",
      },
    ],
  },
  {
    name: "Torrita",
    variations: [
      {
        name: "TORR",
      },
    ],
  },
  {
    name: "Tostaree",
    variations: [
      {
        name: "TOST",
      },
    ],
  },
  {
    name: "Tottenham",
    variations: [
      {
        name: "TOTT",
      },
    ],
  },
  {
    name: "Towong",
    variations: [
      {
        name: "TOWA",
      },
      {
        name: "TOWO",
      },
      {
        name: "TO WO",
      },
    ],
  },
  {
    name: "Tower Hill",
    variations: [
      {
        name: "TOWE",
      },
      {
        name: "TO WE",
      },
    ],
  },
  {
    name: "Towong Upper",
    variations: [
      {
        name: "TOWO",
      },
    ],
  },
  {
    name: "Trafalgar East",
    variations: [
      {
        name: "TRAF",
      },
    ],
  },
  {
    name: "Trafalgar South",
    variations: [
      {
        name: "TRAF",
      },
    ],
  },
  {
    name: "Tragowel",
    variations: [
      {
        name: "TRAG",
      },
    ],
  },
  {
    name: "Trewalla?",
    variations: [
      {
        name: "TRAV",
      },
    ],
  },
  {
    name: "Trawalla Creek",
    variations: [
      {
        name: "TRAW",
      },
    ],
  },
  {
    name: "Trawool",
    variations: [
      {
        name: "TRAW",
      },
    ],
  },
  {
    name: "Tremont",
    variations: [
      {
        name: "TREM",
      },
    ],
  },
  {
    name: "Trentham",
    variations: [
      {
        name: "TREM",
      },
      {
        name: "TREN",
      },
      {
        name: "TR EN",
      },
    ],
  },
  {
    name: "Tresco",
    variations: [
      {
        name: "TRES",
      },
    ],
  },
  {
    name: "Trida",
    variations: [
      {
        name: "TRID",
      },
    ],
  },
  {
    name: "Truganina",
    variations: [
      {
        name: "TRUG",
      },
    ],
  },
  {
    name: "Tubbut",
    variations: [
      {
        name: "TUBB",
      },
    ],
  },
  {
    name: "Turriff",
    variations: [
      {
        name: "TURR",
      },
    ],
  },
  {
    name: "Tutye",
    variations: [
      {
        name: "TUTY",
      },
    ],
  },
  {
    name: "Two Acre Village",
    variations: [
      {
        name: "TWO ACRE V",
      },
    ],
  },
  {
    name: "Tyers",
    variations: [
      {
        name: "TYER",
      },
    ],
  },
  {
    name: "Tynong",
    variations: [
      {
        name: "TYNO",
      },
    ],
  },
  {
    name: "Tynong North",
    variations: [
      {
        name: "TYNO",
      },
    ],
  },
  {
    name: "Tyntynder Central",
    variations: [
      {
        name: "TYNT",
      },
    ],
  },
  {
    name: "Tyrrell Downs",
    variations: [
      {
        name: "TYRR",
      },
    ],
  },
  {
    name: "Unknown",
    variations: [
      {
        name: "U",
      },
      {
        name: "UNK",
      },
      {
        name: "XXX",
      },
    ],
  },
  {
    name: "Ultima",
    variations: [
      {
        name: "ULTI",
      },
    ],
  },
  {
    name: "Ulupna",
    variations: [
      {
        name: "ULUP",
      },
    ],
  },
  {
    name: "Underbool",
    variations: [
      {
        name: "UNDE",
      },
    ],
  },
  {
    name: "Union Jack Creek",
    variations: [
      {
        name: "UNION JACK",
      },
    ],
  },
  {
    name: "Unknown (solved)",
    variations: [
      {
        name: "UNK",
      },
    ],
  },
  {
    name: "Upfield",
    variations: [
      {
        name: "UPFI",
      },
    ],
  },
  {
    name: "Upper Hawthorn",
    variations: [
      {
        name: "UP HTHORN",
      },
    ],
  },
  {
    name: "Upper Beaconsfield",
    variations: [
      {
        name: "UPPE",
      },
    ],
  },
  {
    name: "Upper Gundowring",
    variations: [
      {
        name: "UPPE",
      },
    ],
  },
  {
    name: "Upper Lurg",
    variations: [
      {
        name: "UPPE",
      },
    ],
  },
  {
    name: "Upper Geelong (Road)",
    variations: [
      {
        name: "UP PE",
      },
    ],
  },
  {
    name: "Upwey",
    variations: [
      {
        name: "UPWE",
      },
    ],
  },
  {
    name: "Valencia Creek",
    variations: [
      {
        name: "VALE",
      },
    ],
  },
  {
    name: "Vectis",
    variations: [
      {
        name: "VECT",
      },
      {
        name: "VE CT",
      },
    ],
  },
  {
    name: "Ventnor",
    variations: [
      {
        name: "VENT",
      },
    ],
  },
  {
    name: "Venus Bay",
    variations: [
      {
        name: "VENU",
      },
    ],
  },
  {
    name: "Vermont",
    variations: [
      {
        name: "VERM",
      },
    ],
  },
  {
    name: "Vervale",
    variations: [
      {
        name: "VERV",
      },
    ],
  },
  {
    name: "Victoria Survey",
    variations: [
      {
        name: "VICT SURV",
      },
    ],
  },
  {
    name: "Viewbank",
    variations: [
      {
        name: "VIEW",
      },
    ],
  },
  {
    name: "View Street?",
    variations: [
      {
        name: "VIEW",
      },
    ],
  },
  {
    name: "Vinifera",
    variations: [
      {
        name: "VINI",
      },
    ],
  },
  {
    name: "Vite Vite",
    variations: [
      {
        name: "VITE",
      },
    ],
  },
  {
    name: "Vite Vite North",
    variations: [
      {
        name: "VITE",
      },
    ],
  },
  {
    name: "Waaia",
    variations: [
      {
        name: "WAAI",
      },
      {
        name: "WA AI",
      },
      {
        name: "WAAR",
      },
    ],
  },
  {
    name: "Waarre",
    variations: [
      {
        name: "WAAR",
      },
    ],
  },
  {
    name: "Waggarandall",
    variations: [
      {
        name: "WAGG",
      },
    ],
  },
  {
    name: "Wairewa",
    variations: [
      {
        name: "WAIR",
      },
    ],
  },
  {
    name: "Waitchie",
    variations: [
      {
        name: "WAIT",
      },
    ],
  },
  {
    name: "Walpeup",
    variations: [
      {
        name: "WAL",
      },
      {
        name: "WALP",
      },
    ],
  },
  {
    name: "Walwa",
    variations: [
      {
        name: "WAL",
      },
      {
        name: "WALW",
      },
    ],
  },
  {
    name: "Walkerville",
    variations: [
      {
        name: "WALK",
      },
    ],
  },
  {
    name: "Wallacedale",
    variations: [
      {
        name: "WALL",
      },
    ],
  },
  {
    name: "Wallaloo",
    variations: [
      {
        name: "WALL",
      },
    ],
  },
  {
    name: "Wallaloo East",
    variations: [
      {
        name: "WALL",
      },
    ],
  },
  {
    name: "Wallan",
    variations: [
      {
        name: "WALL",
      },
      {
        name: "WA LL",
      },
      {
        name: "WALLEN",
      },
    ],
  },
  {
    name: "Wallinduc",
    variations: [
      {
        name: "WALL",
      },
    ],
  },
  {
    name: "Wallup",
    variations: [
      {
        name: "WALL",
      },
    ],
  },
  {
    name: "Wallan Wallan",
    variations: [
      {
        name: "WALLAN W",
      },
      {
        name: "WALLAN WAL",
      },
    ],
  },
  {
    name: "Walpa",
    variations: [
      {
        name: "WALP",
      },
    ],
  },
  {
    name: "Wal Wal",
    variations: [
      {
        name: "WALW",
      },
    ],
  },
  {
    name: "Wanalta",
    variations: [
      {
        name: "WANA",
      },
    ],
  },
  {
    name: "Warragul?",
    variations: [
      {
        name: "WA NA",
      },
    ],
  },
  {
    name: "Wandiligong",
    variations: [
      {
        name: "WAND",
      },
      {
        name: "WA ND",
      },
      {
        name: "WANDELIGON",
      },
      {
        name: "WGONG",
      },
      {
        name: "W GONG",
      },
    ],
  },
  {
    name: "Wandin Yallock",
    variations: [
      {
        name: "WAND",
      },
      {
        name: "WA ND",
      },
      {
        name: "WANDIN Y",
      },
      {
        name: "WANDIN YAL",
      },
      {
        name: "WANDINYALL",
      },
      {
        name: "WANDIN YALLOAK",
      },
    ],
  },
  {
    name: "Wandin East",
    variations: [
      {
        name: "WAND",
      },
    ],
  },
  {
    name: "Wandin North",
    variations: [
      {
        name: "WAND",
      },
    ],
  },
  {
    name: "Wondong",
    variations: [
      {
        name: "WAND",
      },
    ],
  },
  {
    name: "Wangandary",
    variations: [
      {
        name: "WANG",
      },
    ],
  },
  {
    name: "Wangaratta Hospital",
    variations: [
      {
        name: "WANGARATTA HOSP",
      },
      {
        name: "WANGARATTA HOSPIT",
      },
      {
        name: "WANGHOSP",
      },
      {
        name: "W ATT HOSP",
      },
      {
        name: "WATTA H",
      },
      {
        name: "WATTA HOS",
      },
      {
        name: "WATTA HOSP",
      },
      {
        name: "W ATTA HOSP",
      },
      {
        name: "WATTA HOSPL",
      },
      {
        name: "WATTA HSP",
      },
    ],
  },
  {
    name: "Wannon",
    variations: [
      {
        name: "WANN",
      },
      {
        name: "WA NN",
      },
    ],
  },
  {
    name: "Wantirna",
    variations: [
      {
        name: "WANT",
      },
    ],
  },
  {
    name: "Wantirna South",
    variations: [
      {
        name: "WANT",
      },
      {
        name: "WANTIRNA S",
      },
    ],
  },
  {
    name: "Warburton",
    variations: [
      {
        name: "WARB",
      },
      {
        name: "WA RB",
      },
      {
        name: "WTON",
      },
    ],
  },
  {
    name: "Warcool Creek",
    variations: [
      {
        name: "WARCOOL CK",
      },
    ],
  },
  {
    name: "Wardy Yallock",
    variations: [
      {
        name: "WARD",
      },
      {
        name: "WARDY Y",
      },
      {
        name: "WARDY YALL",
      },
      {
        name: "WARDY YL",
      },
      {
        name: "WARDY YLCK",
      },
      {
        name: "WARDY YLK",
      },
    ],
  },
  {
    name: "Wargan",
    variations: [
      {
        name: "WARG",
      },
    ],
  },
  {
    name: "Warncoort",
    variations: [
      {
        name: "WARN",
      },
    ],
  },
  {
    name: "Warneet",
    variations: [
      {
        name: "WARN",
      },
    ],
  },
  {
    name: "Warranwood",
    variations: [
      {
        name: "WARR",
      },
    ],
  },
  {
    name: "Warrenbayne",
    variations: [
      {
        name: "WARR",
      },
    ],
  },
  {
    name: "Warrion",
    variations: [
      {
        name: "WARR",
      },
    ],
  },
  {
    name: "Warrong",
    variations: [
      {
        name: "WARR",
      },
    ],
  },
  {
    name: "Warrenheip Station",
    variations: [
      {
        name: "WARRBL ST",
      },
    ],
  },
  {
    name: "Wartook",
    variations: [
      {
        name: "WART",
      },
    ],
  },
  {
    name: "Watchem",
    variations: [
      {
        name: "WATC",
      },
      {
        name: "WA TC",
      },
    ],
  },
  {
    name: "Watchupga",
    variations: [
      {
        name: "WATC",
      },
    ],
  },
  {
    name: "Waterloo",
    variations: [
      {
        name: "WATE",
      },
      {
        name: "WA TE",
      },
      {
        name: "WLOO",
      },
    ],
  },
  {
    name: "Yatmerone",
    variations: [
      {
        name: "WATM",
      },
      {
        name: "YATM",
      },
    ],
  },
  {
    name: "Watsonia",
    variations: [
      {
        name: "WATS",
      },
    ],
  },
  {
    name: "Watsons Hill",
    variations: [
      {
        name: "WATS",
      },
    ],
  },
  {
    name: "Wattle Glen",
    variations: [
      {
        name: "WATT",
      },
    ],
  },
  {
    name: "Wattle Hill",
    variations: [
      {
        name: "WATT",
      },
    ],
  },
  {
    name: "Waubra",
    variations: [
      {
        name: "WAUB",
      },
      {
        name: "WA UB",
      },
    ],
  },
  {
    name: "Waurn Ponds",
    variations: [
      {
        name: "WAUR",
      },
    ],
  },
  {
    name: "Waygara",
    variations: [
      {
        name: "WAYG",
      },
    ],
  },
  {
    name: "West Ballarat",
    variations: [
      {
        name: "W BALLT",
      },
    ],
  },
  {
    name: "Warracknabeal Hospital",
    variations: [
      {
        name: "WBEAL H",
      },
      {
        name: "WBEAL HOS",
      },
      {
        name: "W BEAL HOS",
      },
      {
        name: "WBEAL HOSP",
      },
    ],
  },
  {
    name: "Wirrimbirchip",
    variations: [
      {
        name: "WBIRCHIP",
      },
      {
        name: "W BIRCHIP",
      },
      {
        name: "WIRR",
      },
    ],
  },
  {
    name: "Willenabrina",
    variations: [
      {
        name: "WBRINA",
      },
      {
        name: "WILL",
      },
      {
        name: "WI LL",
      },
      {
        name: "WILLEN",
      },
    ],
  },
  {
    name: "West Brunswick",
    variations: [
      {
        name: "WBRU",
      },
      {
        name: "W BWICK",
      },
      {
        name: "W B WICK",
      },
    ],
  },
  {
    name: "Wedderburn(e)",
    variations: [
      {
        name: "WBURN",
      },
      {
        name: "WBURNE",
      },
    ],
  },
  {
    name: "Wedderburn Junction",
    variations: [
      {
        name: "WEDD",
      },
    ],
  },
  {
    name: "Weeaproinah",
    variations: [
      {
        name: "WEEA",
      },
    ],
  },
  {
    name: "Weering",
    variations: [
      {
        name: "WEER",
      },
    ],
  },
  {
    name: "Weerite",
    variations: [
      {
        name: "WEER",
      },
    ],
  },
  {
    name: "Wee Wee Rup",
    variations: [
      {
        name: "WEEW",
      },
    ],
  },
  {
    name: "Wellsford Street",
    variations: [
      {
        name: "WELL",
      },
    ],
  },
  {
    name: "Wemen",
    variations: [
      {
        name: "WEME",
      },
    ],
  },
  {
    name: "Werrap",
    variations: [
      {
        name: "WERR",
      },
    ],
  },
  {
    name: "Werribee South",
    variations: [
      {
        name: "WERR",
      },
    ],
  },
  {
    name: "Werrimull",
    variations: [
      {
        name: "WERR",
      },
      {
        name: "WMULL",
      },
    ],
  },
  {
    name: "Wesburn",
    variations: [
      {
        name: "WESB",
      },
    ],
  },
  {
    name: "West Essendon",
    variations: [
      {
        name: "WESS",
      },
      {
        name: "WEST",
      },
    ],
  },
  {
    name: "Westall",
    variations: [
      {
        name: "WEST",
      },
    ],
  },
  {
    name: "Westgarth",
    variations: [
      {
        name: "WEST",
      },
    ],
  },
  {
    name: "Westmeadows",
    variations: [
      {
        name: "WEST",
      },
    ],
  },
  {
    name: "West Footscray",
    variations: [
      {
        name: "WFOO",
      },
    ],
  },
  {
    name: "Woodford",
    variations: [
      {
        name: "WFORD",
      },
      {
        name: "WOOD",
      },
      {
        name: "WO OD",
      },
      {
        name: "WOOFYARD",
      },
    ],
  },
  {
    name: "West Geelong",
    variations: [
      {
        name: "WGEE",
      },
    ],
  },
  {
    name: "Wheelers Hill",
    variations: [
      {
        name: "WHEE",
      },
    ],
  },
  {
    name: "West Heidelberg",
    variations: [
      {
        name: "WHEI",
      },
    ],
  },
  {
    name: "White Hills",
    variations: [
      {
        name: "WHILLS",
      },
      {
        name: "W HILLS",
      },
      {
        name: "WHIT",
      },
      {
        name: "WH IT",
      },
      {
        name: "WHITE H",
      },
    ],
  },
  {
    name: "Whipstick",
    variations: [
      {
        name: "WHIP",
      },
      {
        name: "WH IP",
      },
      {
        name: "W ST",
      },
      {
        name: "WSTICK",
      },
    ],
  },
  {
    name: "Whitfield",
    variations: [
      {
        name: "WHIT",
      },
    ],
  },
  {
    name: "Whitlands",
    variations: [
      {
        name: "WHIT",
      },
    ],
  },
  {
    name: "Whittington",
    variations: [
      {
        name: "WHIT",
      },
    ],
  },
  {
    name: "White's Station",
    variations: [
      {
        name: "WHITE STN",
      },
    ],
  },
  {
    name: "Whittlesea-Upper Plenty",
    variations: [
      {
        name: "WHITTLESEA-U PLEN",
      },
    ],
  },
  {
    name: "Whorouly South",
    variations: [
      {
        name: "WHOR",
      },
    ],
  },
  {
    name: "Womens Hospital",
    variations: [
      {
        name: "W HOSP",
      },
    ],
  },
  {
    name: "West Hotham",
    variations: [
      {
        name: "W HOTH",
      },
      {
        name: "W HOTHAM",
      },
    ],
  },
  {
    name: "West Hotham Ben Asylum",
    variations: [
      {
        name: "W HOTH B A",
      },
    ],
  },
  {
    name: "Wickliffe",
    variations: [
      {
        name: "WICK",
      },
      {
        name: "WI CK",
      },
    ],
  },
  {
    name: "Willow Grove",
    variations: [
      {
        name: "WIL",
      },
      {
        name: "WILL",
      },
    ],
  },
  {
    name: "Wilby",
    variations: [
      {
        name: "WILB",
      },
    ],
  },
  {
    name: "Wild Dog Valley",
    variations: [
      {
        name: "WILD",
      },
    ],
  },
  {
    name: "Wild Duck Creek",
    variations: [
      {
        name: "WILD DUCK",
      },
      {
        name: "WILDDUCK C",
      },
      {
        name: "WILD DUCK CK",
      },
    ],
  },
  {
    name: "Wilkur",
    variations: [
      {
        name: "WILK",
      },
    ],
  },
  {
    name: "Willatook",
    variations: [
      {
        name: "WILL",
      },
    ],
  },
  {
    name: "Willaura",
    variations: [
      {
        name: "WILL",
      },
    ],
  },
  {
    name: "Willung",
    variations: [
      {
        name: "WILL",
      },
      {
        name: "WI LL",
      },
      {
        name: "WILL I",
      },
    ],
  },
  {
    name: "Willung South",
    variations: [
      {
        name: "WILL",
      },
    ],
  },
  {
    name: "Willlow Grove",
    variations: [
      {
        name: "WILLOW GR",
      },
    ],
  },
  {
    name: "Will Will Rook",
    variations: [
      {
        name: "WILL ROOK",
      },
      {
        name: "WILL WILL",
      },
      {
        name: "WILL-WILL-",
      },
      {
        name: "W W ROOK",
      },
    ],
  },
  {
    name: "Wilsons Hill",
    variations: [
      {
        name: "WILS",
      },
    ],
  },
  {
    name: "Wimmera River",
    variations: [
      {
        name: "WIMM",
      },
    ],
  },
  {
    name: "Windermere",
    variations: [
      {
        name: "WIND",
      },
      {
        name: "WI ND",
      },
    ],
  },
  {
    name: "Wingeel",
    variations: [
      {
        name: "WING",
      },
    ],
  },
  {
    name: "Winlaton",
    variations: [
      {
        name: "WINL",
      },
    ],
  },
  {
    name: "Winnap",
    variations: [
      {
        name: "WINN",
      },
    ],
  },
  {
    name: "Winnindoo",
    variations: [
      {
        name: "WINN",
      },
    ],
  },
  {
    name: "Winton",
    variations: [
      {
        name: "WINT",
      },
      {
        name: "WI NT",
      },
    ],
  },
  {
    name: "Winton North",
    variations: [
      {
        name: "WINT",
      },
    ],
  },
  {
    name: "Wirrimbirchip?",
    variations: [
      {
        name: "WKNOP",
      },
    ],
  },
  {
    name: "Woomalang",
    variations: [
      {
        name: "WLANG",
      },
    ],
  },
  {
    name: "West Melton",
    variations: [
      {
        name: "WMEL",
      },
    ],
  },
  {
    name: "Woomelang",
    variations: [
      {
        name: "WMELANG",
      },
      {
        name: "WOOM",
      },
    ],
  },
  {
    name: "West Preston",
    variations: [
      {
        name: "WPRE",
      },
      {
        name: "W PRESN",
      },
      {
        name: "W PREST",
      },
      {
        name: "W PRESTN",
      },
      {
        name: "W PRESTON",
      },
    ],
  },
  {
    name: "Wollert",
    variations: [
      {
        name: "WOLL",
      },
    ],
  },
  {
    name: "Wombat Creek",
    variations: [
      {
        name: "WOMB",
      },
    ],
  },
  {
    name: "Wombat Flat",
    variations: [
      {
        name: "WOMB",
      },
      {
        name: "WO MB",
      },
      {
        name: "WOMBAT FT",
      },
    ],
  },
  {
    name: "Wombelano",
    variations: [
      {
        name: "WOMB",
      },
    ],
  },
  {
    name: "Wondo (Vale) Station",
    variations: [
      {
        name: "WONDO STN",
      },
    ],
  },
  {
    name: "Lake Wonga??",
    variations: [
      {
        name: "WONG",
      },
    ],
  },
  {
    name: "Wadonga",
    variations: [
      {
        name: "WONG",
      },
      {
        name: "WO NG",
      },
      {
        name: "WONGA",
      },
    ],
  },
  {
    name: "Wonga Park",
    variations: [
      {
        name: "WONG",
      },
    ],
  },
  {
    name: "Wongarra",
    variations: [
      {
        name: "WONG",
      },
    ],
  },
  {
    name: "Wonnangatta",
    variations: [
      {
        name: "WONN",
      },
      {
        name: "WO NN",
      },
    ],
  },
  {
    name: "Wonthaggi",
    variations: [
      {
        name: "WONT",
      },
    ],
  },
  {
    name: "Wonwondah",
    variations: [
      {
        name: "WONW",
      },
      {
        name: "WO NW",
      },
    ],
  },
  {
    name: "Wonwondah North",
    variations: [
      {
        name: "WONW",
      },
    ],
  },
  {
    name: "Won Wron",
    variations: [
      {
        name: "WONW",
      },
    ],
  },
  {
    name: "Wonyip",
    variations: [
      {
        name: "WONY",
      },
    ],
  },
  {
    name: "Woodend",
    variations: [
      {
        name: "WOOD",
      },
      {
        name: "WO OD",
      },
      {
        name: "WPPD",
      },
    ],
  },
  {
    name: "Woodfield",
    variations: [
      {
        name: "WOOD",
      },
    ],
  },
  {
    name: "Woodglen",
    variations: [
      {
        name: "WOOD",
      },
    ],
  },
  {
    name: "Woodleigh",
    variations: [
      {
        name: "WOOD",
      },
    ],
  },
  {
    name: "Woodside",
    variations: [
      {
        name: "WOOD",
      },
    ],
  },
  {
    name: "Woods Point",
    variations: [
      {
        name: "WOOD",
      },
      {
        name: "WO OD",
      },
      {
        name: "WOODS POIN",
      },
      {
        name: "WOODSPT",
      },
      {
        name: "WOODS PT",
      },
      {
        name: "WPOINT",
      },
    ],
  },
  {
    name: "Woodstock",
    variations: [
      {
        name: "WOOD",
      },
      {
        name: "WO OD",
      },
      {
        name: "WO OL",
      },
    ],
  },
  {
    name: "Woodvale",
    variations: [
      {
        name: "WOOD",
      },
    ],
  },
  {
    name: "Woods Point Hospital",
    variations: [
      {
        name: "WOODSPOINT HOS",
      },
      {
        name: "WOODSPOINT HOSP",
      },
      {
        name: "WOODS PT H",
      },
      {
        name: "WOODS PT HOS",
      },
      {
        name: "WOODS PT HOSP",
      },
    ],
  },
  {
    name: "Woohlpooer",
    variations: [
      {
        name: "WOOH",
      },
    ],
  },
  {
    name: "Woolamai",
    variations: [
      {
        name: "WOOL",
      },
    ],
  },
  {
    name: "Woolert",
    variations: [
      {
        name: "WOOL",
      },
    ],
  },
  {
    name: "Wool Wool",
    variations: [
      {
        name: "WOOL",
      },
    ],
  },
  {
    name: "Woolshed",
    variations: [
      {
        name: "WOOLSHED",
      },
    ],
  },
  {
    name: "Woolshed Creek",
    variations: [
      {
        name: "WOOLSHED C",
      },
    ],
  },
  {
    name: "Wooragee East",
    variations: [
      {
        name: "WOOR",
      },
    ],
  },
  {
    name: "Woorak",
    variations: [
      {
        name: "WOOR",
      },
      {
        name: "WO OR",
      },
      {
        name: "WORR",
      },
    ],
  },
  {
    name: "Woorak West",
    variations: [
      {
        name: "WOOR",
      },
    ],
  },
  {
    name: "Woorarra West",
    variations: [
      {
        name: "WOOR",
      },
    ],
  },
  {
    name: "Wooreen",
    variations: [
      {
        name: "WOOR",
      },
    ],
  },
  {
    name: "Woori Yallock",
    variations: [
      {
        name: "WOOR",
      },
      {
        name: "WORR",
      },
    ],
  },
  {
    name: "Woorinen",
    variations: [
      {
        name: "WOOR",
      },
    ],
  },
  {
    name: "Woorinen North",
    variations: [
      {
        name: "WOOR",
      },
    ],
  },
  {
    name: "Woorinen South",
    variations: [
      {
        name: "WOOR",
      },
    ],
  },
  {
    name: "Woorndoo",
    variations: [
      {
        name: "WOOR",
      },
      {
        name: "WO OR",
      },
    ],
  },
  {
    name: "Wooroonook",
    variations: [
      {
        name: "WOOR",
      },
      {
        name: "WO OR",
      },
    ],
  },
  {
    name: "Woosang",
    variations: [
      {
        name: "WOOS",
      },
    ],
  },
  {
    name: "Wootong Vale",
    variations: [
      {
        name: "WOOTONG VA",
      },
    ],
  },
  {
    name: "Warrenbayne?",
    variations: [
      {
        name: "WORR",
      },
    ],
  },
  {
    name: "Welshpool",
    variations: [
      {
        name: "WPOOL",
      },
    ],
  },
  {
    name: "West Richmond",
    variations: [
      {
        name: "WRIC",
      },
    ],
  },
  {
    name: "West Sunshine",
    variations: [
      {
        name: "WSUN",
      },
    ],
  },
  {
    name: "Wanthaggi",
    variations: [
      {
        name: "WTHAGGI",
      },
    ],
  },
  {
    name: "Wuk Wuk",
    variations: [
      {
        name: "WUK",
      },
    ],
  },
  {
    name: "Wulgulmerang",
    variations: [
      {
        name: "WULG",
      },
    ],
  },
  {
    name: "Wunghnu",
    variations: [
      {
        name: "WUNG",
      },
    ],
  },
  {
    name: "Wurruk",
    variations: [
      {
        name: "WURR",
      },
    ],
  },
  {
    name: "Wychitella",
    variations: [
      {
        name: "WYCH",
      },
      {
        name: "WY CH",
      },
    ],
  },
  {
    name: "Wyelangta",
    variations: [
      {
        name: "WYEL",
      },
    ],
  },
  {
    name: "Wye River",
    variations: [
      {
        name: "WYER",
      },
    ],
  },
  {
    name: "Wyndam",
    variations: [
      {
        name: "WYND",
      },
      {
        name: "WY ND",
      },
    ],
  },
  {
    name: "Wyuna?",
    variations: [
      {
        name: "WY NN",
      },
    ],
  },
  {
    name: "Wyuna East",
    variations: [
      {
        name: "WYUN",
      },
    ],
  },
  {
    name: "Wy Yung",
    variations: [
      {
        name: "WYYU",
      },
      {
        name: "WY YU",
      },
    ],
  },
  {
    name: "Yabba North",
    variations: [
      {
        name: "YABB",
      },
    ],
  },
  {
    name: "Yalca",
    variations: [
      {
        name: "YALC",
      },
      {
        name: "YA LC",
      },
    ],
  },
  {
    name: "Yallambie",
    variations: [
      {
        name: "YALL",
      },
    ],
  },
  {
    name: "Yallook",
    variations: [
      {
        name: "YALL",
      },
      {
        name: "YA LL",
      },
      {
        name: "ZALL",
      },
    ],
  },
  {
    name: "Yallourn",
    variations: [
      {
        name: "YALL",
      },
    ],
  },
  {
    name: "Yallourn North",
    variations: [
      {
        name: "YALL",
      },
    ],
  },
  {
    name: "Yanac",
    variations: [
      {
        name: "YANA",
      },
      {
        name: "YA NA",
      },
    ],
  },
  {
    name: "Yanakie",
    variations: [
      {
        name: "YANA",
      },
    ],
  },
  {
    name: "Anakie (South)",
    variations: [
      {
        name: "YANE KIE S",
      },
    ],
  },
  {
    name: "Yangardook",
    variations: [
      {
        name: "YANG",
      },
    ],
  },
  {
    name: "Yangery",
    variations: [
      {
        name: "YANG",
      },
      {
        name: "YA NG",
      },
    ],
  },
  {
    name: "Yankee Creek",
    variations: [
      {
        name: "YANK",
      },
    ],
  },
  {
    name: "Yannathan",
    variations: [
      {
        name: "YANN",
      },
    ],
  },
  {
    name: "Yarck",
    variations: [
      {
        name: "YARC",
      },
    ],
  },
  {
    name: "Yarraberb",
    variations: [
      {
        name: "YARR",
      },
    ],
  },
  {
    name: "Yarragon",
    variations: [
      {
        name: "YARR",
      },
      {
        name: "YA RR",
      },
    ],
  },
  {
    name: "Yarra Junction",
    variations: [
      {
        name: "YARR",
      },
      {
        name: "YARRA J",
      },
      {
        name: "Y JUNC",
      },
      {
        name: "Y JUNCT",
      },
    ],
  },
  {
    name: "Yarram",
    variations: [
      {
        name: "YARR",
      },
      {
        name: "YA RR",
      },
    ],
  },
  {
    name: "Yarrawalla",
    variations: [
      {
        name: "YARR",
      },
    ],
  },
  {
    name: "Yarroweyah",
    variations: [
      {
        name: "YARR",
      },
      {
        name: "YA RR",
      },
    ],
  },
  {
    name: "Yarra Bank",
    variations: [
      {
        name: "YARRA BNK",
      },
    ],
  },
  {
    name: "Yarra Falls",
    variations: [
      {
        name: "YARRA FALL",
      },
    ],
  },
  {
    name: "Yarram Yarram",
    variations: [
      {
        name: "YARRAM Y",
      },
      {
        name: "YARRAM YAR",
      },
      {
        name: "YARRAM YM",
      },
    ],
  },
  {
    name: "Yarrow",
    variations: [
      {
        name: "YARROW",
      },
    ],
  },
  {
    name: "Yarrow Flats",
    variations: [
      {
        name: "YARROW FLA",
      },
    ],
  },
  {
    name: "Yawong Hill(s)",
    variations: [
      {
        name: "YAWO",
      },
      {
        name: "YA WO",
      },
      {
        name: "YAWONG",
      },
    ],
  },
  {
    name: "Yarra Bend Asylum",
    variations: [
      {
        name: "Y B ASYLUM",
      },
      {
        name: "Y BEND ASY",
      },
    ],
  },
  {
    name: "Yarra Bend Lunatic Asylum",
    variations: [
      {
        name: "Y BEND L A",
      },
    ],
  },
  {
    name: "Yearan Station",
    variations: [
      {
        name: "YEARAN ST",
      },
    ],
  },
  {
    name: "Yelta",
    variations: [
      {
        name: "YELT",
      },
    ],
  },
  {
    name: "Yeodene",
    variations: [
      {
        name: "YEOD",
      },
    ],
  },
  {
    name: "Yeungroon",
    variations: [
      {
        name: "YEUN",
      },
    ],
  },
  {
    name: "Yinnar",
    variations: [
      {
        name: "YINN",
      },
      {
        name: "YI NN",
      },
    ],
  },
  {
    name: "Yinnar South",
    variations: [
      {
        name: "YINN",
      },
    ],
  },
  {
    name: "Youanmite",
    variations: [
      {
        name: "YOUA",
      },
      {
        name: "YO UA",
      },
    ],
  },
  {
    name: "Yulecart",
    variations: [
      {
        name: "YULE",
      },
    ],
  },
  {
    name: "Yundool",
    variations: [
      {
        name: "YUND",
      },
    ],
  },
  {
    name: "Yuroke",
    variations: [
      {
        name: "YURO",
      },
    ],
  },
  {
    name: "Yuulong",
    variations: [
      {
        name: "YUUL",
      },
    ],
  },
  {
    name: "Yea",
    variations: [
      {
        name: "ZEA",
      },
    ],
  },
  {
    name: "Zulu Creek?",
    variations: [
      {
        name: "ZULU",
      },
    ],
  },
];

function mapRealPlaceNameToVicBdmPlaceNames(placeName) {
  if (!placeName) {
    return [];
  }

  let abbrevs = [];

  for (let place of placeNameData) {
    if (place.name == placeName) {
      for (let variation of place.variations) {
        if (!abbrevs.includes(variation.name)) {
          abbrevs.push(variation.name);
        }
      }
      break;
    }
  }

  return abbrevs;
}

function mapVicbdmPlaceNameToRealPlaceNames(placeName) {
  //console.log("mapVicbdmPlaceNameToRealPlaceNames, placeName = " + placeName);

  if (!placeName) {
    return [];
  }

  let fullNames = [];
  function addFullName(fullName) {
    if (!fullNames.includes(fullName)) {
      fullNames.push(fullName);
    }
  }

  let abbrev = placeName.toUpperCase();

  for (let place of placeNameData) {
    for (let variation of place.variations) {
      if (variation.name == abbrev) {
        addFullName(place.name);
        break;
      }
    }
  }

  fullNames.sort();

  return fullNames;
}

export { mapVicbdmPlaceNameToRealPlaceNames, mapRealPlaceNameToVicBdmPlaceNames };
