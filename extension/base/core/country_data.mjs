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

const CountryData = [
  {
    stdName: "England",
    matches: ["England", "England, United Kingdom", "England, UK", "England, U.K."],
    partOf: ["United Kingdom", "England and Wales"],
    usesMiddleNames: true,
  },
  {
    stdName: "Wales",
    matches: ["Wales", "Wales, United Kingdom", "Wales, UK", "Wales, U.K.", "Cymru"],
    partOf: ["United Kingdom", "England and Wales"],
    usesMiddleNames: true,
  },
  {
    stdName: "Scotland",
    matches: ["Scotland", "Scotland, United Kingdom", "Scotland, UK", "Scotland, U.K.", "Alba"],
    partOf: ["United Kingdom"],
    usesMiddleNames: true,
  },
  {
    stdName: "England and Wales",
    matches: [
      "England and Wales",
      "England & Wales",
      "England and Wales, United Kingdom",
      "England & Wales, United Kingdom",
      "England and Wales, UK",
      "England & Wales, UK",
      "England and Wales, U.K.",
      "England & Wales, U.K.",
    ],
    partOf: ["United Kingdom"],
    invalidCountryName: true, // we never want to use this as a country name in a placename or a search
    usesMiddleNames: true,
  },
  {
    stdName: "Guernsey",
    matches: [
      "Guernsey",
      "Guernsey, United Kingdom",
      "Guernsey, UK",
      "Guernsey, U.K.",
      "Guernsey, Channel Islands",
      "Guernsey, Channel Islands, United Kingdom",
      "Guernsey, Channel Islands, UK",
      "Guernsey, Channel Islands, U.K.",
      "Bailiwick of Guernsey",
      "the Bailiwick of Guernsey",
      "Bailiwick of Guernsey, Channel Islands",
      "the Bailiwick of Guernsey, Channel Islands",
    ],
    partOf: ["United Kingdom", "Channel Islands"],
  },
  {
    stdName: "Jersey",
    matches: [
      "Jersey",
      "Jersey, United Kingdom",
      "Jersey, UK",
      "Jersey, U.K.",
      "Jersey, Channel Islands",
      "Jersey, Channel Islands, United Kingdom",
      "Jersey, Channel Islands, UK",
      "Jersey, Channel Islands, U.K.",
      "Bailiwick of Jersey",
      "the Bailiwick of Jersey",
      "Bailiwick of Jersey, Channel Islands",
      "the Bailiwick of Jersey, Channel Islands",
    ],
    partOf: ["United Kingdom", "Channel Islands"],
  },
  {
    stdName: "Channel Islands",
    matches: ["Channel Islands", "Channel Islands, United Kingdom", "Channel Islands, UK", "Channel Islands, U.K."],
    partOf: ["United Kingdom"],
  },

  {
    stdName: "United Kingdom",
    matches: ["United Kingdom", "U.K.", "UK", "Great Britain"],
    usesMiddleNames: true,
  }, // must come after ones it contains

  { stdName: "Ireland", matches: ["Ireland", "Éire"], usesMiddleNames: true },
  { stdName: "France", matches: ["France"] },
  { stdName: "Germany", matches: ["Germany"] },
  { stdName: "Austria", matches: ["Austria"] },
  { stdName: "Italy", matches: ["Italy"] },
  { stdName: "Netherlands", matches: ["Netherlands"] },
  { stdName: "Belgium", matches: ["Belgium"] },
  { stdName: "Luxembourg", matches: ["Luxembourg"] },

  { stdName: "Sweden", matches: ["Sweden", "Sverige"] },
  { stdName: "Denmark", matches: ["Denmark"] },
  { stdName: "Norway", matches: ["Norway", "Norge"] },
  { stdName: "Finland", matches: ["Finland", "Suomi"] },
  { stdName: "Iceland", matches: ["Iceland", "Ísland"] },

  { stdName: "Czechoslovakia", matches: ["Czechoslovakia"] },
  { stdName: "Czechia", matches: ["Czechia"], partOf: ["Czechoslovakia"] },
  { stdName: "Slovakia", matches: ["Slovakia"], partOf: ["Czechoslovakia"] },

  { stdName: "Hungary", matches: ["Hungary"] },
  { stdName: "Romania", matches: ["Romania"] },
  { stdName: "Bulgaria", matches: ["Bulgaria", "България"] },
  { stdName: "Poland", matches: ["Poland", "Polska"] },
  { stdName: "Ukraine", matches: ["Ukraine", "Україна"] },
  { stdName: "Belarus", matches: ["Belarus", "Беларусь"] },
  { stdName: "Moldova", matches: ["Moldova"] },

  { stdName: "Lithuania", matches: ["Lithuania", "Lietuva"] },
  { stdName: "Latvia", matches: ["Latvia"] },
  { stdName: "Estonia", matches: ["Estonia", "Eesti"] },

  { stdName: "Yugoslavia", matches: ["Yugoslavia"] },
  { stdName: "Slovenia", matches: ["Slovenia"], partOf: ["Yugoslavia"] },
  {
    stdName: "Bosnia and Herzegovina",
    matches: ["Bosnia and Herzegovina", "Bosna i Hercegovina"],
    partOf: ["Yugoslavia"],
  },
  { stdName: "Croatia", matches: ["Croatia", "Hrvatska"], partOf: ["Yugoslavia"] },
  { stdName: "Serbia", matches: ["Serbia", "Србија"], partOf: ["Yugoslavia"] },
  { stdName: "Montenegro", matches: ["Montenegro", "Црна Гора"], partOf: ["Yugoslavia"] },
  { stdName: "Kosovo", matches: ["Kosovo"], partOf: ["Yugoslavia"] },
  { stdName: "North Macedonia", matches: ["North Macedonia", "Северна Македонија"], partOf: ["Yugoslavia"] },

  { stdName: "Albania", matches: ["Albania", "Shqipëria"] },

  { stdName: "Russia", matches: ["Russia"] },

  { stdName: "Greece", matches: ["Greece", "Ελλάδα"] },
  { stdName: "Turkey", matches: ["Turkey"] },

  {
    stdName: "United States",
    matches: ["United States", "USA", "US", "U.S.", "U.S.A.", "U.S", "U.S.A", "United States of America"],
    hasStates: true,
    usesMiddleNames: true,
  },
  {
    stdName: "Canada",
    matches: ["Canada"],
    hasStates: true,
    usesMiddleNames: true,
  },
  { stdName: "Mexico", matches: ["Mexico"], hasStates: true },

  {
    stdName: "Australia",
    matches: ["Australia"],
    hasStates: true,
    usesMiddleNames: true,
  },
  { stdName: "New Zealand", matches: ["New Zealand"], usesMiddleNames: true },
  { stdName: "South Africa", matches: ["South Africa"] },
];

const CountyData = {
  England: [
    { stdName: "Avon", matches: ["Avon"] },
    { stdName: "Bedfordshire", matches: ["Bedfordshire", "Beds"] },
    { stdName: "Berkshire", matches: ["Berkshire", "Berks"] },
    { stdName: "Bristol", matches: ["Bristol"] },
    { stdName: "Buckinghamshire", matches: ["Buckinghamshire", "Bucks"] },
    {
      stdName: "Cambridgeshire",
      matches: ["Cambridgeshire", "Cambs", "Isle of Ely"],
    },
    { stdName: "Cheshire", matches: ["Cheshire"] },
    { stdName: "Cleveland", matches: ["Cleveland"] },
    { stdName: "Cornwall", matches: ["Cornwall"] },
    { stdName: "Cumberland", matches: ["Cumberland"] },
    { stdName: "Cumbria", matches: ["Cumbria"] },
    { stdName: "Derbyshire", matches: ["Derbyshire"] },
    { stdName: "Devon", matches: ["Devon"] },
    { stdName: "Dorset", matches: ["Dorset"] },
    { stdName: "Durham", matches: ["County Durham", "Durham"] },
    { stdName: "Essex", matches: ["Essex"] },
    { stdName: "Gloucestershire", matches: ["Gloucestershire", "Glos"] },
    { stdName: "Hampshire", matches: ["Hampshire", "Isle of Wight"] },
    { stdName: "Herefordshire", matches: ["Herefordshire"] },
    { stdName: "Hertfordshire", matches: ["Hertfordshire"] },
    { stdName: "Huntingdonshire", matches: ["Huntingdonshire"] },
    { stdName: "Humberside", matches: ["Humberside"] },
    { stdName: "Kent", matches: ["Kent"] },
    { stdName: "Lancashire", matches: ["Lancashire"] },
    { stdName: "Leicestershire", matches: ["Leicestershire"] },
    { stdName: "Lincolnshire", matches: ["Lincolnshire"] },
    { stdName: "Leicestershire", matches: ["Leicestershire"] },
    {
      stdName: "London",
      matches: ["London", "Greater London", "London (City)"],
    },
    {
      stdName: "London & Middlesex",
      matches: ["London & Middlesex", "London and Middlesex", "London, Middlesex"],
    },
    {
      stdName: "London & Surrey",
      matches: ["London & Surrey", "London and Surrey", "London, Surrey"],
    },
    { stdName: "London (City)", matches: ["London (City)"] },
    { stdName: "Middlesex", matches: ["Middlesex"] },
    { stdName: "Norfolk", matches: ["Norfolk"] },
    { stdName: "Northamptonshire", matches: ["Northamptonshire"] },
    { stdName: "Northumberland", matches: ["Northumberland"] },
    { stdName: "Nottinghamshire", matches: ["Nottinghamshire"] },
    { stdName: "Oxfordshire", matches: ["Oxfordshire"] },
    { stdName: "Rutland", matches: ["Rutland"] },
    { stdName: "Shropshire", matches: ["Shropshire"] },
    { stdName: "Somerset", matches: ["Somerset"] },
    { stdName: "Staffordshire", matches: ["Staffordshire"] },
    { stdName: "Suffolk", matches: ["Suffolk"] },
    { stdName: "Surrey", matches: ["Surrey"] },
    { stdName: "Sussex", matches: ["Sussex", "East Sussex", "West Sussex"] },
    { stdName: "Warwickshire", matches: ["Warwickshire"] },
    { stdName: "Westmorland", matches: ["Westmorland"] },
    { stdName: "Wiltshire", matches: ["Wiltshire"] },
    { stdName: "Worcestershire", matches: ["Worcestershire"] },
    { stdName: "Yorkshire", matches: ["Yorkshire"] },
    { stdName: "Yorkshire, East Riding", matches: ["Yorkshire, East Riding"] },
    {
      stdName: "Yorkshire, North Riding",
      matches: ["Yorkshire, North Riding"],
    },
    { stdName: "Yorkshire, West Riding", matches: ["Yorkshire, West Riding"] },
  ],
  Wales: [
    { stdName: "Anglesey", matches: ["Anglesey"] },
    { stdName: "Breconshire", matches: ["Breconshire"] },
    { stdName: "Caernarvonshire", matches: ["Caernarvonshire"] },
    { stdName: "Cardiganshire", matches: ["Cardiganshire"] },
    { stdName: "Carmarthenshire", matches: ["Carmarthenshire"] },
    { stdName: "Denbighshire", matches: ["Denbighshire"] },
    { stdName: "Flintshire", matches: ["Flintshire"] },
    { stdName: "Glamorgan", matches: ["Glamorgan"] },
    { stdName: "Merionethshire", matches: ["Merionethshire"] },
    { stdName: "Monmouthshire", matches: ["Monmouthshire"] },
    { stdName: "Montgomeryshire", matches: ["Montgomeryshire"] },
    { stdName: "Pembrokeshire", matches: ["Pembrokeshire"] },
    { stdName: "Radnorshire", matches: ["Radnorshire"] },
    // post 1996
    { stdName: "Clwyd", matches: ["Clwyd"] },
    { stdName: "Dyfed", matches: ["Dyfed"] },
    { stdName: "Gwent", matches: ["Gwent"] },
    { stdName: "Gwynedd", matches: ["Gwynedd"] },
    { stdName: "Mid Glamorgan", matches: ["Mid Glamorgan"] },
    { stdName: "Powys", matches: ["Powys"] },
    { stdName: "South Glamorgan", matches: ["South Glamorgan"] },
    { stdName: "West Glamorgan", matches: ["West Glamorgan"] },
  ],
  Scotland: [
    { stdName: "Aberdeenshire", matches: ["Aberdeenshire", "Aberdeen"] },
    { stdName: "Angus", matches: ["Angus"] },
    { stdName: "Argyllshire", matches: ["Argyllshire", "Argyll"] },
    { stdName: "Ayrshire", matches: ["Ayrshire", "Ayr"] },
    { stdName: "Banffshire", matches: ["Banffshire", "Banff"] },
    { stdName: "Berwickshire", matches: ["Berwickshire", "Berwick"] },
    { stdName: "Bute", matches: ["Bute"] },
    { stdName: "Caithness", matches: ["Caithness"] },
    {
      stdName: "Clackmannanshire",
      matches: ["Clackmannanshire", "Clackmannan"],
    },
    {
      stdName: "Dunbartonshire",
      matches: ["Dunbartonshire", "Dunbarton", "Dumbartonshire", "Dumbarton"],
    },
    { stdName: "Dumfriesshire", matches: ["Dumfriesshire", "Dumfries"] },
    { stdName: "East Lothian", matches: ["East Lothian"] },
    { stdName: "Edinburgh", matches: ["Edinburgh", "Edinburghshire"] },
    { stdName: "Fife", matches: ["Fife"] },
    { stdName: "Forfarshire", matches: ["Forfarshire", "Forfar"] },
    {
      stdName: "Inverness-shire",
      matches: ["Inverness-shire", "Invernesshire", "Invernessshire", , "Inverneshire", "Inverness"],
    },
    { stdName: "Kincardineshire", matches: ["Kincardineshire", "Kincardine"] },
    {
      stdName: "Kinross-shire",
      matches: ["Kinross-shire", "Kinrossshire", "Kinrosshire", "Kinroshire", "Kinross"],
    },
    {
      stdName: "Kirkcudbrightshire",
      matches: ["Kirkcudbrightshire", "Kirkcudbright"],
    },
    { stdName: "Lanarkshire", matches: ["Lanarkshire", "Lanark"] },
    { stdName: "Midlothian", matches: ["Midlothian"] },
    { stdName: "Moray", matches: ["Moray"] },
    { stdName: "Nairnshire", matches: ["Nairnshire", "Nairn"] },
    { stdName: "Orkney", matches: ["Orkney"] },
    {
      stdName: "Peeblesshire",
      matches: ["Peeblesshire", "Peebleshire", "Peebles-shire", "Peebles"],
    },
    { stdName: "Perthshire", matches: ["Perthshire", "Perth"] },
    { stdName: "Renfrewshire", matches: ["Renfrewshire", "Renfrew"] },
    {
      stdName: "Ross and Cromarty",
      matches: ["Ross and Cromarty", "Ross & Cromarty"],
    },
    { stdName: "Roxburghshire", matches: ["Roxburghshire", "Roxburgh"] },
    { stdName: "Selkirkshire", matches: ["Selkirkshire", "Selkirk"] },
    { stdName: "Shetland", matches: ["Shetland", "Zetland"] },
    { stdName: "Stirlingshire", matches: ["Stirlingshire", "Stirling"] },
    { stdName: "Sutherland", matches: ["Sutherland"] },
    { stdName: "West Lothian", matches: ["West Lothian"] },
    { stdName: "Wigtownshire", matches: ["Wigtownshire", "Wigtown"] },
    // post 1996
    { stdName: "Borders", matches: ["Borders"] },
    { stdName: "Central", matches: ["Central"] },
    { stdName: "Dumfries and Galloway", matches: ["Dumfries and Galloway"] },
    { stdName: "Grampian", matches: ["Grampian"] },
    { stdName: "Highland", matches: ["Highland"] },
    { stdName: "Lothian", matches: ["Lothian"] },
    { stdName: "Strathclyde", matches: ["Strathclyde"] },
    { stdName: "Tayside", matches: ["Tayside"] },
    { stdName: "Western Isles", matches: ["Western Isles"] },
  ],
  Ireland: [],
};

const CD = {
  matchCountryFromPlaceName: function (placeName) {
    for (let country of CountryData) {
      for (let match of country.matches) {
        if (placeName == match) {
          return country;
        }
        let ending = ", " + match;
        if (placeName.endsWith(ending)) {
          return country;
        }
      }
    }
  },

  extractCountryFromPlaceName: function (placeName) {
    if (!placeName) {
      return undefined;
    }
    for (let country of CountryData) {
      for (let match of country.matches) {
        if (placeName == match) {
          return { country: country, remainder: "", originalCountryString: placeName };
        }
        let ending = ", " + match;
        if (placeName.endsWith(ending)) {
          let remainder = placeName.substring(0, placeName.length - ending.length);
          return { country: country, remainder: remainder, originalCountryString: match };
        }
      }
    }
  },

  isPartOf: function (ownedCountryName, owningCountryName) {
    for (let country of CountryData) {
      if (country.stdName == ownedCountryName) {
        if (country.partOf != undefined) {
          for (let owner of country.partOf) {
            if (owner == owningCountryName) {
              return true;
            }
          }
        }
        break;
      }
    }
    return false;
  },

  isValidCountryForPlaceName: function (countryName) {
    for (let country of CountryData) {
      if (country.stdName == countryName) {
        if (country.invalidCountryName) {
          return false;
        } else {
          return true;
        }
      }
    }
    return false;
  },

  buildCountryArrayFromPlaceArray: function (placeNames) {
    let countrySet = new Set();
    for (let placeName of placeNames) {
      let country = CD.matchCountryFromPlaceName(placeName);
      if (country) {
        countrySet.add(country.stdName);
      }
    }

    let foundInvalidCountryContainedByValidCountry = false;

    // we now have a set of unique country names but some may be part of others in the list
    // if so we want to remove the more general ones and use the specific ones
    if (countrySet.size > 0) {
      let finalCountries = [];

      if (countrySet.size == 1) {
        finalCountries.push(countrySet.values().next().value);
      } else {
        for (let country of countrySet) {
          // see if this country contains one of the other countries
          let containsOtherCountry = false;
          for (let otherCountry of countrySet) {
            if (otherCountry != country) {
              if (CD.isPartOf(otherCountry, country)) {
                if (CD.isValidCountryForPlaceName(otherCountry)) {
                  containsOtherCountry = true;
                } else {
                  foundInvalidCountryContainedByValidCountry = true;
                }
              }
            }
          }
          if (!containsOtherCountry) {
            finalCountries.push(country);
          }
        }
      }

      // we could still have an invalid country (like England & Wales) in the list,
      // if there is also a containing country (like United Kingdom) in the list
      // then remove the contained invalid country
      // Otherwise it gets left in list and may get broken into its parts later -
      // for example in adaptCountryArrayForFamilySearch
      if (foundInvalidCountryContainedByValidCountry) {
        let currentCountries = finalCountries;
        finalCountries = [];

        for (let country of currentCountries) {
          if (!CD.isValidCountryForPlaceName(country)) {
            let isContained = false;
            for (let otherCountry of currentCountries) {
              if (otherCountry != country) {
                if (CD.isPartOf(country, otherCountry)) {
                  isContained = true;
                  break;
                }
              }
            }
            if (!isContained) {
              finalCountries.push(country);
            }
          } else {
            finalCountries.push(country);
          }
        }
      }

      return finalCountries;
    }

    return undefined;
  },

  getContainingCountries: function (stdName) {
    let containingCountries = [];

    for (let country of CountryData) {
      if (country.stdName == stdName) {
        let parentCountries = country.partOf;
        if (parentCountries) {
          for (let containingCountry of parentCountries) {
            containingCountries.push(containingCountry);
          }
        }
        break;
      }
    }

    return containingCountries;
  },

  standardizeCountryName: function (countryName) {
    for (let country of CountryData) {
      for (let match of country.matches) {
        if (countryName == match) {
          return country.stdName;
        }
      }
    }
  },

  standardizeCountyNameForCountry: function (countyName, country) {
    // country is a country object
    let countyArray = CountyData[country.stdName];
    if (!countyArray || countyArray.length < 1) {
      return undefined;
    }

    for (let county of countyArray) {
      for (let match of county.matches) {
        if (countyName == match) {
          return county.stdName;
        }
      }
    }

    return undefined;
  },

  usesMiddleNames: function (countryName) {
    let stdName = CD.standardizeCountryName(countryName);

    for (let country of CountryData) {
      if (country.stdName == stdName) {
        if (country.usesMiddleNames) {
          return true;
        }
        break;
      }
    }
    return false;
  },
};

export { CD };
