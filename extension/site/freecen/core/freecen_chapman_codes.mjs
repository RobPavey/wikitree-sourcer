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

// This is compiled from two sources: https://www.genuki.org.uk/big/Regions/Codes
// and the FreeCen search page

const countyMap = {
  // Sorted the way they appear in the FreeCen list

  // Scotland
  BDF: { country: "England", names: ["Bedfordshire", "Beds"] },
  BRK: { country: "England", names: ["Berkshire", "Berks"] },
  BKM: { country: "England", names: ["Buckinghamshire", "Bucks"] },
  CAM: { country: "England", names: ["Cambridgeshire", "Cambs"] },
  CHS: { country: "England", names: ["Cheshire"] },
  CON: { country: "England", names: ["Cornwall"] },
  CUL: { country: "England", names: ["Cumberland"] },
  DBY: { country: "England", names: ["Derbyshire"] },
  DEV: { country: "England", names: ["Devon"] },
  DOR: { country: "England", names: ["Dorset"] },
  DUR: { country: "England", names: ["Durham"] },
  ESS: { country: "England", names: ["Essex"] },
  GLS: { country: "England", names: ["Gloucestershire"] },
  HAM: { country: "England", names: ["Hampshire"] },
  HEF: { country: "England", names: ["Herefordshire"] },
  HRT: { country: "England", names: ["Hertfordshire"] },
  HUN: { country: "England", names: ["Huntingdonshire"] },
  IOW: { country: "England", names: ["Isle of Wight"] },
  KEN: { country: "England", names: ["Kent"] },
  LAN: { country: "England", names: ["Lancashire"] },
  LEI: { country: "England", names: ["Leicestershire"] },
  LIN: { country: "England", names: ["Lincolnshire"] },
  LND: { country: "England", names: ["London (City)"] },
  MDX: { country: "England", names: ["Middlesex"] },
  NFK: { country: "England", names: ["Norfolk"] },
  NTH: { country: "England", names: ["Northamptonshire"] },
  NBL: { country: "England", names: ["Northumberland"] },
  NTT: { country: "England", names: ["Nottinghamshire"] },
  OXF: { country: "England", names: ["Oxfordshire"] },
  RUT: { country: "England", names: ["Rutland"] },
  SAL: { country: "England", names: ["Shropshire"] },
  SOM: { country: "England", names: ["Somerset"] },
  STS: { country: "England", names: ["Staffordshire"] },
  SFK: { country: "England", names: ["Suffolk"] },
  SRY: { country: "England", names: ["Surrey"] },
  SSX: { country: "England", names: ["Sussex"] },
  WAR: { country: "England", names: ["Warwickshire"] },
  WES: { country: "England", names: ["Westmorland"] },
  WIL: { country: "England", names: ["Wiltshire"] },
  WOR: { country: "England", names: ["Worcestershire"] },
  YKS: { country: "England", names: ["Yorkshire"] },
  ERY: { country: "England", names: ["Yorkshire, East Riding"] },
  NRY: { country: "England", names: ["Yorkshire, North Riding"] },
  WRY: { country: "England", names: ["Yorkshire, West Riding"] },

  // Ireland
  ARM: { country: "Ireland", names: ["County Armagh", "Co. Armagh", "Armagh"] },
  CAR: { country: "Ireland", names: ["County Carlow", "Co. Carlow", "Carlow"] },
  CAV: { country: "Ireland", names: ["County Cavan", "Co. Cavan", "Cavan"] },
  CLA: { country: "Ireland", names: ["County Clare", "Co. Clare", "Clare"] },
  COR: { country: "Ireland", names: ["County Cork", "Co. Cork", "Cork"] },
  DON: {
    country: "Ireland",
    names: ["County Donegal", "Co. Donegal", "Donegal"],
  },
  DOW: { country: "Ireland", names: ["County Down", "Co. Down", "Down"] },
  DUB: { country: "Ireland", names: ["County Dublin", "Co. Dublin", "Dublin"] },
  FER: {
    country: "Ireland",
    names: ["County Fermanagh", "Co. Fermanagh", "Fermanagh"],
  },
  GAL: { country: "Ireland", names: ["County Galway", "Co. Galway", "Galway"] },
  KER: { country: "Ireland", names: ["County Kerry", "Co. Kerry", "Kerry"] },
  KID: {
    country: "Ireland",
    names: ["County Kildare", "Co. Kildare", "Kildare"],
  },
  KIK: {
    country: "Ireland",
    names: ["County Kilkenny", "Co. Kilkenny", "Kilkenny"],
  },
  LET: {
    country: "Ireland",
    names: ["County Leitrim", "Co. Leitrim", "Leitrim"],
  },
  LEX: { country: "Ireland", names: ["County Laois", "Co. Laois", "Laois"] },
  LIM: {
    country: "Ireland",
    names: ["County Limerick", "Co. Limerick", "Limerick"],
  },
  LDY: { country: "Ireland", names: ["County Londonderry "] },
  LOG: {
    country: "Ireland",
    names: ["County Longford", "Co. Longford", "Longford"],
  },
  LOU: { country: "Ireland", names: ["County Louth", "Co. Louth", "Louth"] },
  MAY: { country: "Ireland", names: ["County Mayo", "Co. Mayo", "Mayo"] },
  MEA: { country: "Ireland", names: ["County Meath", "Co. Meath", "Meath"] },
  MOG: {
    country: "Ireland",
    names: ["County Monaghan", "Co. Monaghan", "Monaghan"],
  },
  OFF: { country: "Ireland", names: ["County Offaly", "Co. Offaly", "Offaly"] },
  ROS: {
    country: "Ireland",
    names: ["County Roscommon", "Co. Roscommon", "Roscommon"],
  },
  SLI: { country: "Ireland", names: ["County Sligo", "Co. Sligo", "Sligo"] },
  TIP: {
    country: "Ireland",
    names: ["County Tipperary", "Co. Tipperary", "Tipperary"],
  },
  TYR: { country: "Ireland", names: ["County Tyrone", "Co. Tyrone", "Tyrone"] },
  WAT: {
    country: "Ireland",
    names: ["County Waterford", "Co. Waterford", "Waterford"],
  },
  WEM: {
    country: "Ireland",
    names: ["County Westmeath", "Co. Westmeath", "Westmeath"],
  },
  WEX: {
    country: "Ireland",
    names: ["County Wexford", "Co. Wexford", "Wexford"],
  },
  WIC: {
    country: "Ireland",
    names: ["County Wicklow", "Co. Wicklow", "Wicklow"],
  },

  // Islands
  CHI: { country: "Channel Islands", names: ["Channel Islands"] },
  IOM: { country: "Isle of Man", names: ["Isle of Man"] },

  // Scotland
  ANS: { country: "Scotland", names: ["Angus", "Forfarshire"] },
  ARL: { country: "Scotland", names: ["Argyllshire"] },
  AYR: { country: "Scotland", names: ["Ayrshire"] },
  BAN: { country: "Scotland", names: ["Banffshire"] },
  BEW: { country: "Scotland", names: ["Berwickshire"] },
  BUT: { country: "Scotland", names: ["Bute"] },
  CAI: { country: "Scotland", names: ["Caithness"] },
  CLK: { country: "Scotland", names: ["Clackmannanshire"] },
  DFS: { country: "Scotland", names: ["Dumfriesshire"] },
  DNB: { country: "Scotland", names: ["Dunbartonshire"] },
  ELN: { country: "Scotland", names: ["East Lothian"] },
  FIF: { country: "Scotland", names: ["Fife"] },
  INV: { country: "Scotland", names: ["Inverness-shire"] },
  KCD: { country: "Scotland", names: ["Kincardineshire"] },
  KRS: { country: "Scotland", names: ["Kinross-shire"] },
  KKD: { country: "Scotland", names: ["Kirkcudbrightshire"] },
  LKS: { country: "Scotland", names: ["Lanarkshire"] },
  MLN: { country: "Scotland", names: ["Midlothian"] },
  MOR: { country: "Scotland", names: ["Morayshire"] },
  NAI: { country: "Scotland", names: ["Nairnshire"] },
  OKI: { country: "Scotland", names: ["Orkney Isles"] },
  PEE: { country: "Scotland", names: ["Peeblesshire"] },
  PER: { country: "Scotland", names: ["Perthshire"] },
  RFW: { country: "Scotland", names: ["Renfrewshire"] },
  ROC: { country: "Scotland", names: ["Ross and Cromarty"] },
  ROX: { country: "Scotland", names: ["Roxburghshire"] },
  SEL: { country: "Scotland", names: ["Selkirkshire"] },
  SHI: { country: "Scotland", names: ["Shetland Isles"] },
  STI: { country: "Scotland", names: ["Stirlingshire"] },
  SUT: { country: "Scotland", names: ["Sutherland"] },
  WLN: { country: "Scotland", names: ["West Lothian"] },
  WIS: { country: "Scotland", names: ["Western Isles"] },
  WIG: { country: "Scotland", names: ["Wigtownshire"] },

  // Wales
  BRE: { country: "Wales", names: ["Brecknockshire"] },
  CAE: { country: "Wales", names: ["Caernarfonshire"] },
  CGN: { country: "Wales", names: ["Cardiganshire"] },
  CMN: { country: "Wales", names: ["Carmarthenshire"] },
  DEN: { country: "Wales", names: ["Denbighshire"] },
  FLN: { country: "Wales", names: ["Flintshire"] },
  GLA: { country: "Wales", names: ["Glamorgan"] },
  MER: { country: "Wales", names: ["Merionethshire"] },
  MON: { country: "Wales", names: ["Monmouthshire"] },
  MGY: { country: "Wales", names: ["Montgomeryshire"] },
  PEM: { country: "Wales", names: ["Pembrokeshire"] },
  RAD: { country: "Wales", names: ["Radnorshire"] },

  // Special
  EWS: { country: "", names: ["England and Wales Shipping"] },
  OUC: { country: "", names: ["Out of County"] },
  OVB: { country: "", names: ["Overseas British"] },
  BRE: { country: "", names: ["Overseas Foreign"] },
  OVF: { country: "", names: ["Brecknockshire"] },
  SCS: { country: "Scotland", names: ["Scottish Shipping"] },
  OTH: { country: "", names: ["Other Locations"] },
  RNS: { country: "", names: ["Royal Navy Ships"] },
  MIL: { country: "", names: ["Military"] },
};

function countyNameToCountyCode(county, excludeCountries) {
  if (!county) {
    return "";
  }

  for (let code in countyMap) {
    let entry = countyMap[code];
    for (let name of entry.names) {
      if (name == county) {
        let exclude = false;
        if (excludeCountries) {
          for (let country of excludeCountries) {
            if (entry.country == country) {
              exclude = true;
              break;
            }
          }
        }

        if (!exclude) {
          return code;
        }
      }
    }
  }

  return "";
}

function getCountryFromCountyCode(countyCode) {
  let country = "";
  let entry = countyMap[countyCode];
  if (entry) {
    country = entry.country;
  }
  return country;
}

function getCountryFromCountyName(countyName) {
  let code = countyNameToCountyCode(countyName);
  if (code) {
    return getCountryFromCountyCode(code);
  }
  return "";
}

export {
  countyNameToCountyCode,
  getCountryFromCountyCode,
  getCountryFromCountyName,
  countyMap,
};
