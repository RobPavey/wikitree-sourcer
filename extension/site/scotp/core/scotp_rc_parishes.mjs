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

const rc_parishes = [
  { mp_code: "IM", mp_no: "1", rc_parish: "ABERDEEN", county: "Aberdeen" },
  {
    mp_code: "MP",
    mp_no: "10",
    rc_parish: "ABERDEEN, ST MARY'S WITH ST PETER'S",
    county: "Aberdeen",
  },
  {
    mp_code: "MP",
    mp_no: "116",
    rc_parish: "ABERLOUR, THE SACRED HEART",
    county: "Banff",
  },
  {
    mp_code: "MP",
    mp_no: "107",
    rc_parish: "ABOYNE, ST MARGARET'S",
    county: "Aberdeen",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "ADEN, KHORMAKSAR",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "1",
    rc_parish: "AIRDRIE, ST MARGARET'S",
    county: "Lanark",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "ALDERSHOT, GENERAL REGISTRY",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "ALDERSHOT, NORTH CAMP MILITARY CEMETERY",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "ALDERSHOT, SAINTS MICHAEL AND SEBASTIAN",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "ALDERSHOT, SOUTH CAMP MILITARY CEMETERY",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "ALDERSHOT, ST LUDOVICS",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "ALDERSHOT, ST MICHAEL AND ST SEBASTIAN",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "ALDERSHOT, ST PATRICK'S",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "ALEXANDRIA, CHAPLAINCY OF ENGLISH FORCES",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "106",
    rc_parish: "ANNAN, ST COLUMBA'S",
    county: "Dumfries",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "ANTRIM, LISBURN, HQ NORTHERN IRELAND DISTRICT",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "90",
    rc_parish: "ARBROATH, ST THOMAS'",
    county: "Angus",
  },
  {
    mp_code: "MP",
    mp_no: "43",
    rc_parish: "ARDKENNETH, ST MICHAEL'S",
    county: "Inverness",
  },
  {
    mp_code: "MP",
    mp_no: "44",
    rc_parish: "ARISAIG, ST MARY'S",
    county: "Inverness",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "AUSTRIA, GRAZ",
    county: "Military or outside Scotland",
  },
  { mp_code: "IM", mp_no: "2", rc_parish: "AYR", county: "Ayr" },
  {
    mp_code: "MP",
    mp_no: "51",
    rc_parish: "AYR, ST MARGARET'S",
    county: "Ayr",
  },
  { mp_code: "MP", mp_no: "88", rc_parish: "AYRSHIRE", county: "Ayr" },
  {
    mp_code: "MP",
    mp_no: "11",
    rc_parish: "BALLATER, ST NATHALAN",
    county: "Aberdeen",
  },
  {
    mp_code: "MP",
    mp_no: "12",
    rc_parish: "BALLOGIE, ST MICHAEL'S",
    county: "Aberdeen",
  },
  {
    mp_code: "MP",
    mp_no: "42",
    rc_parish: "BANFF, OUR LADY OF MOUNT CARMEL",
    county: "Banff",
  },
  {
    mp_code: "MP",
    mp_no: "73",
    rc_parish: "BARRHEAD, ST JOHN'S",
    county: "Renfrew",
  },
  {
    mp_code: "MP",
    mp_no: "95",
    rc_parish: "BATHGATE, THE IMMACULATE CONCEPTION",
    county: "West Lothian",
  },
  {
    mp_code: "MP",
    mp_no: "13",
    rc_parish: "BEAULY, ST MARY'S",
    county: "Inverness",
  },
  { mp_code: "IM", mp_no: "5", rc_parish: "BELLIE", county: "Banff" },
  { mp_code: "MP", mp_no: "97", rc_parish: "BELLIE", county: "Banff" },
  {
    mp_code: "B",
    mp_no: "4",
    rc_parish: "BISHOP ALEXANDER PATERSON, EASTERN VICARIATE",
    county: "Banff",
  },
  {
    mp_code: "MP",
    mp_no: "37",
    rc_parish: "BLAIRGOWRIE, ST STEPHEN'S",
    county: "Perth",
  },
  {
    mp_code: "MP",
    mp_no: "14",
    rc_parish: "BLAIRS, ST MARY'S WITH SCALAN",
    county: "Moray",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "BORDON WITH LONGMOOR, SACRED HEART",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "BORDON, MILITARY CEMETERY",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "BORDON, SACRED HEART",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "45",
    rc_parish: "BORNISH, ST MARY'S",
    county: "Inverness",
  },
  {
    mp_code: "MP",
    mp_no: "15",
    rc_parish: "BRAEMAR, ST ANDREW'S",
    county: "Aberdeen",
  },
  {
    mp_code: "IM",
    mp_no: "34",
    rc_parish: "BUCHAN (STRICHEN; BYTH; FOGGYLOAN; TURRIFF)",
    county: "Aberdeen",
  },
  { mp_code: "IM", mp_no: "7", rc_parish: "BUCKIE", county: "Banff" },
  {
    mp_code: "MP",
    mp_no: "16",
    rc_parish: "BUCKIE, ST PETER'S",
    county: "Banff",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "BULFORD, OUR LADY OF VICTORIES",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "BULFORD, SOUTHERN COMMAND",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "BULLFORD, BLESSED VIRGIN MARY AND ST ANTHONY OF PADUA",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "CAIRO, MILITARY VICARIATE",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "CALAFRANA",
    county: "Military or outside Scotland",
  },
  { mp_code: "CC", mp_no: "2", rc_parish: "CANON CLAPPERTON", county: "" },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "CARDINGTON [R.A.F.]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "2",
    rc_parish: "CARLUKE, ST ATHANASIUS'",
    county: "Lanark",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "CATTERICK, SAINTS JOSEPH AND JOAN OF ARC",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "CATTERICK, ST JOAN OF ARC",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "CHANGI [R.A.F.]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "17",
    rc_parish: "CHAPELTOWN, OUR LADY OF PERPETUAL SUCCOUR",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "CHATHAM [R.N. BARRACKS]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "112",
    rc_parish: "COATBRIDGE, ST AUGUSTINE'S",
    county: "Lanark",
  },
  {
    mp_code: "MP",
    mp_no: "3",
    rc_parish: "COATBRIDGE, ST PATRICK'S",
    county: "Lanark",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "COLCHESTER, CHRIST THE KING",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "50",
    rc_parish: "CRAIGSTON, BARRA, ST BRENDAN'S",
    county: "Inverness",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "CRANWELL, ST PETER'S [R.A.F.]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "38",
    rc_parish: "CRIEFF, ST FILLAN'S",
    county: "Perth",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "CYPRUS [R.A.F.]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "CYPRUS, RAF AKROTIRI, CHRIST THE KING",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "52",
    rc_parish: "DALBEATTIE, ST PETER'S",
    county: "Kircudbright",
  },
  {
    mp_code: "MP",
    mp_no: "76",
    rc_parish: "DALKEITH, ST DAVID'S",
    county: "Midlothian",
  },
  {
    mp_code: "MP",
    mp_no: "53",
    rc_parish: "DALRY, ST PALLADIUS'",
    county: "Ayr",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "DEEPCUT AND BLACKDOWN",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "DEEPCUT, ST OSWALD'S",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "18",
    rc_parish: "DORNIE, ST DUTHAC",
    county: "Ross and Cromerty",
  },
  {
    mp_code: "MP",
    mp_no: "46",
    rc_parish: "DRIMNIN, ST COLUMBA'S",
    county: "Argyll",
  },
  {
    mp_code: "MP",
    mp_no: "19",
    rc_parish: "DUFFTOWN, OUR LADY OF THE ASSUMPTION",
    county: "Banff",
  },
  {
    mp_code: "MP",
    mp_no: "71",
    rc_parish: "DUMBARTON, ST PATRICK'S",
    county: "Dunbarton",
  },
  {
    mp_code: "MP",
    mp_no: "54",
    rc_parish: "DUMFRIES, ST ANDREW'S",
    county: "Dumfries",
  },
  {
    mp_code: "MP",
    mp_no: "39",
    rc_parish: "DUNDEE, ST ANDREW'S",
    county: "Angus",
  },
  {
    mp_code: "MP",
    mp_no: "109",
    rc_parish: "DUNDEE, ST MARY, OUR LADY OF VICTORIES",
    county: "Angus",
  },
  {
    mp_code: "MP",
    mp_no: "108",
    rc_parish: "DUNDEE, ST MARY'S [LOCHEE]",
    county: "Angus",
  },
  {
    mp_code: "MP",
    mp_no: "83",
    rc_parish: "DUNFERMLINE, ST MARGARET'S",
    county: "Fife",
  },
  {
    mp_code: "MP",
    mp_no: "63",
    rc_parish: "DUNTOCHER, ST MARY'S",
    county: "Dunbarton",
  },
  { mp_code: "IM", mp_no: "12", rc_parish: "EDINBURGH", county: "Midlothian" },
  {
    mp_code: "MP",
    mp_no: "89",
    rc_parish: "EDINBURGH, ST JOHN'S PORTOBELLO",
    county: "Midlothian",
  },
  {
    mp_code: "MP",
    mp_no: "74",
    rc_parish: "EDINBURGH, ST MARY'S CATHEDRAL",
    county: "Midlothian",
  },
  {
    mp_code: "MP",
    mp_no: "85",
    rc_parish: "EDINBURGH, ST MARY'S LEITH",
    county: "Midlothian",
  },
  {
    mp_code: "MP",
    mp_no: "87",
    rc_parish: "EDINBURGH, ST PATRICK'S",
    county: "Midlothian",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "EGYPT, CAIRO",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "EGYPT, MOASCAR CAMP",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "115",
    rc_parish: "EIGG, ST DONNAN",
    county: "Inverness",
  },
  {
    mp_code: "PL",
    mp_no: "3",
    rc_parish: "ELGIN, PRESHOME LETTERS: NORTHERN DISTRICT VICARIATE",
    county: "Moray",
  },
  {
    mp_code: "MP",
    mp_no: "20",
    rc_parish: "ELGIN, ST SYLVESTER'S",
    county: "Moray",
  },
  {
    mp_code: "MP",
    mp_no: "21",
    rc_parish: "ESKADALE, ST MARY'S",
    county: "Inverness",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "F.A.R.E.L.F. [ARMY]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "F.E.A.F. [R.A.F.]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "F.E.A.L.F., SINGAPORE",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "77",
    rc_parish: "FALKIRK, ST FRANCIS XAVIER'S",
    county: "Stirling",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "FAR EAST, FAR EAST AIR FORCES HQ",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "22",
    rc_parish: "FETTERNEAR, OUR LADY OF THE GARIOCH AND ST. JOHN THE EVANGELIST",
    county: "Aberdeen",
  },
  {
    mp_code: "MP",
    mp_no: "23",
    rc_parish: "FOCHABERS, ST MARY'S",
    county: "Banff",
  },
  {
    mp_code: "MP",
    mp_no: "24",
    rc_parish: "FORT AUGUSTUS, ST PETER AND ST BENEDICT",
    county: "Inverness",
  },
  {
    mp_code: "MP",
    mp_no: "47",
    rc_parish: "FORT WILLIAM, THE IMMACULATE CONCEPTION",
    county: "Inverness",
  },
  {
    mp_code: "MP",
    mp_no: "78",
    rc_parish: "GALASHIELS, OUR LADY AND ST ANDREW",
    county: "Roxburgh",
  },
  {
    mp_code: "MP",
    mp_no: "105",
    rc_parish: "GALSTON, ST SOPHIA'S",
    county: "Ayr",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "GERMANY [ARMY, R.N., R.A.F.]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "GERMANY, R.A.F. COMMAND",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "GERMANY, RAF COMMAND",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "55",
    rc_parish: "GIRVAN, THE SACRED HEARTS OF JESUS AND MARY",
    county: "Ayr",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "GLAMORGANSHIRE, ST ATHAN'S [R.A.F.]",
    county: "Military or outside Scotland",
  },
  { mp_code: "IM", mp_no: "14", rc_parish: "GLASGOW", county: "Lanark" },
  {
    mp_code: "MP",
    mp_no: "69",
    rc_parish: "GLASGOW, IMMACULATE CONCEPTION",
    county: "Lanark",
  },
  {
    mp_code: "COD",
    mp_no: "1",
    rc_parish: "GLASGOW, OLD DALBETH CEMETERY",
    county: "Lanark",
  },
  {
    mp_code: "MP",
    mp_no: "72",
    rc_parish: "GLASGOW, ST ALOYSIUS'",
    county: "Lanark",
  },
  {
    mp_code: "MP",
    mp_no: "64",
    rc_parish: "GLASGOW, ST ALPHONSUS'",
    county: "Lanark",
  },
  {
    mp_code: "MP",
    mp_no: "62",
    rc_parish: "GLASGOW, ST ANDREW'S",
    county: "Lanark",
  },
  {
    mp_code: "MP",
    mp_no: "92",
    rc_parish: "GLASGOW, ST JOHN'S",
    county: "Lanark",
  },
  {
    mp_code: "MP",
    mp_no: "65",
    rc_parish: "GLASGOW, ST JOSEPH'S",
    county: "Lanark",
  },
  {
    mp_code: "MP",
    mp_no: "70",
    rc_parish: "GLASGOW, ST MARY IMMACULATE",
    county: "Lanark",
  },
  {
    mp_code: "MP",
    mp_no: "66",
    rc_parish: "GLASGOW, ST MARY'S",
    county: "Lanark",
  },
  {
    mp_code: "MP",
    mp_no: "67",
    rc_parish: "GLASGOW, ST MUNGO'S",
    county: "Lanark",
  },
  {
    mp_code: "MP",
    mp_no: "68",
    rc_parish: "GLASGOW, ST PATRICK'S",
    county: "Lanark",
  },
  {
    mp_code: "MP",
    mp_no: "96",
    rc_parish: "GLASGOW, ST PAUL'S",
    county: "Lanark",
  },
  {
    mp_code: "CSP",
    mp_no: "1",
    rc_parish: "GLASGOW, ST PETER'S DALBETH CEMETERY",
    county: "Lanark",
  },
  {
    mp_code: "MP",
    mp_no: "114",
    rc_parish: "GLENFINNAN, SAINTS MARY AND FINNAN",
    county: "Inverness",
  },
  { mp_code: "IM", mp_no: "16", rc_parish: "GLENLIVET", county: "Banff" },
  {
    mp_code: "MP",
    mp_no: "32",
    rc_parish: "GLENMORISTON AND STRATHERRICK, THE IMMACULATE CONCEPTION",
    county: "Inverness",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "GOSPORT, ROYAL NAVAL HOSPITAL HASLAR",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "6",
    rc_parish: "GREENOCK, ST MARY'S",
    county: "Renfrew",
  },
  {
    mp_code: "MP",
    mp_no: "86",
    rc_parish: "HADDINGTON, ST MARY'S",
    county: "East Lothian",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "HALTON [R.A.F.]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "HALTON, SAINTS MARY AND JOSEPH",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "4",
    rc_parish: "HAMILTON, ST MARY'S",
    county: "Lanark",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "HARROGATE, NORTHERN AREA",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "79",
    rc_parish: "HAWICK, SS MARY AND DAVID",
    county: "Roxburgh",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "HENLOW, ST MICHAEL'S [R.A.F.]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "HIGH WYCOMBE, ST THERESA",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "100",
    rc_parish: "HIGHVALLEYFIELD, ST SERF'S",
    county: "Fife or Perth",
  },
  {
    mp_code: "MP",
    mp_no: "7",
    rc_parish: "HOUSTON, ST FILLAN'S",
    county: "Renfrew",
  },
  {
    mp_code: "MP",
    mp_no: "25",
    rc_parish: "HUNTLY, ST MARGARET'S",
    county: "Aberdeen",
  },
  {
    mp_code: "MP",
    mp_no: "104",
    rc_parish: "HURLFORD, ST PAUL'S",
    county: "Ayr",
  },
  {
    mp_code: "MP",
    mp_no: "26",
    rc_parish: "INVERNESS, ST MARY'S",
    county: "Inverness",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "IRAQ, HABBANYA",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "27",
    rc_parish: "KEITH, ST THOMAS'",
    county: "Banff",
  },
  {
    mp_code: "MP",
    mp_no: "99",
    rc_parish: "KELSO, THE IMMACULATE CONCEPTION",
    county: "Roxburgh",
  },
  {
    mp_code: "MP",
    mp_no: "56",
    rc_parish: "KILMARNOCK, ST JOSEPH'S",
    county: "Ayr",
  },
  {
    mp_code: "BL",
    mp_no: "10",
    rc_parish: "KIRK MICHAEL, BLAIRS LETTERS",
    county: "Aberdeen",
  },
  {
    mp_code: "MP",
    mp_no: "84",
    rc_parish: "KIRKCALDY, OUR LADY OF PERPETUAL SUCCOUR",
    county: "Fife",
  },
  {
    mp_code: "MP",
    mp_no: "57",
    rc_parish: "KIRKCONNEL, ST CONAL",
    county: "Dumfries",
  },
  {
    mp_code: "MP",
    mp_no: "101",
    rc_parish: "KIRKWALL, OUR LADY AND ST JOSEPH'S",
    county: "Orkney",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "LARKHILL, ST ANTHONY OF PADUA",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "LEBANON, NORTH LEVANT",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "80",
    rc_parish: "LENNOXTOWN, ST MACHAN'S",
    county: "Dunbarton",
  },
  {
    mp_code: "MP",
    mp_no: "94",
    rc_parish: "LINLITHGOW, ST MICHAEL'S",
    county: "West Lothian",
  },
  {
    mp_code: "MP",
    mp_no: "103",
    rc_parish: "LOCHGELLY, ST PATRICK'S",
    county: "Fife",
  },
  {
    mp_code: "MP",
    mp_no: "102",
    rc_parish: "LOCHORE, ST KENNETH'S",
    county: "Fife",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "LOSSIEMOUTH, OUR LADY STAR OF THE SEA",
    county: "Moray",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "M.E.A.F. [R.A.F.]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "M.E.L.F. [ARMY]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "MALLACA [R.A.F., ARMY, R.N.]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "MALTA",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "MALTA, MILITARY VICARIATE",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "MALTA, ROYAL NAVY",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "28",
    rc_parish: "MARYDALE, OUR LADY & ST BEAN",
    county: "Inverness",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "MIDDLE EAST, MIDDLE EAST AIR FORCES, CHRIST THE KING, KASFAREET WITH SAINTS MARY AND JOSEPH, HALTON",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "48",
    rc_parish: "MINGARRY, OUR LADY OF THE ANGELS",
    county: "Argyll",
  },
  {
    mp_code: "MP",
    mp_no: "93",
    rc_parish: "MORAR, OUR LADY OF PERPETUAL SUCCOUR",
    county: "Inverness",
  },
  {
    mp_code: "MP",
    mp_no: "113",
    rc_parish: "MULL AND DISTRICT",
    county: "Argyll",
  },
  {
    mp_code: "MP",
    mp_no: "58",
    rc_parish: "MUNCHES, DOMESTIC CHAPEL",
    county: "Kircudbright",
  },
  {
    mp_code: "MP",
    mp_no: "40",
    rc_parish: "MURTHLY CASTLE, CHAPEL",
    county: "Perth",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "NETLEY, ST JOSEPH'S",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "IM",
    mp_no: "23",
    rc_parish: "NEW ABBEY",
    county: "Kirkcudbright",
  },
  {
    mp_code: "MP",
    mp_no: "98",
    rc_parish: "NEW ABBEY, ST MARY'S",
    county: "Kircudbright",
  },
  {
    mp_code: "MP",
    mp_no: "59",
    rc_parish: "NEWTON STEWART, OUR LADY AND ST NINIAN",
    county: "Wigtown",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "NORTHERN COMMAND [R.A.F.]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "111",
    rc_parish: "OBAN, ST COLUMBA'S",
    county: "Argyll",
  },
  { mp_code: "IM", mp_no: "24", rc_parish: "PAISLEY", county: "Renfrew" },
  {
    mp_code: "MP",
    mp_no: "8",
    rc_parish: "PAISLEY, ST MIRIN'S",
    county: "Renfrew",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "PALESTINE [ARMY]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "81",
    rc_parish: "PEEBLES, ST JOSEPH'S",
    county: "Peebles",
  },
  { mp_code: "IM", mp_no: "25", rc_parish: "PERTH", county: "Perth" },
  {
    mp_code: "MP",
    mp_no: "41",
    rc_parish: "PERTH, ST JOHN THE BAPTIST",
    county: "Perth",
  },
  {
    mp_code: "MP",
    mp_no: "29",
    rc_parish: "PETERHEAD, ST MARY'S",
    county: "Aberdeen",
  },
  {
    mp_code: "MP",
    mp_no: "9",
    rc_parish: "PORT GLASGOW, ST JOHN'S",
    county: "Renfrew",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "PORTSMOUTH, ST CAMILLE'S [R.N.]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "30",
    rc_parish: "PORTSOY, THE ANNUNCIATION",
    county: "Banff",
  },
  { mp_code: "IM", mp_no: "28", rc_parish: "PRESHOME", county: "Banff" },
  {
    mp_code: "MP",
    mp_no: "31",
    rc_parish: "PRESHOME, ST GREGORY'S",
    county: "Banff",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "R.A.F. SOUTHERN AREA",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "R.A.F. STAFFORD",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "49",
    rc_parish: "ROTHESAY, ST ANDREW'S",
    county: "Bute",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "ROYAL NAVY",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "75",
    rc_parish: "ROYBRIDGE, ST MARGARET'S",
    county: "Inverness",
  },
  {
    mp_code: "MP",
    mp_no: "5",
    rc_parish: "RUTHERGLEN, ST COLUMBKILLE'S",
    county: "Lanark",
  },
  {
    mp_code: "MP",
    mp_no: "60",
    rc_parish: "SALTCOATS, ST MARY'S",
    county: "Ayr",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "SCOTLAND [R.A.F., ARMY, R.N.]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "SHORNCLIFF, ARCHANGEL MICHAEL",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "SHORNCLIFFE, THE NAME OF JESUS",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "SHORNECLIFFE [ARMY]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "SHRIVENHAM, ST MARY'S [OR ST PATRICK'S]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "SHRIVENHAM, ST PATRICK",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "SINGAPORE, CHANGI",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "SOUTHERN AREA [R.A.F.]",
    county: "Military or outside Scotland",
  },
  { mp_code: "IM", mp_no: "4", rc_parish: "STIRLING", county: "Stirling" },
  {
    mp_code: "MP",
    mp_no: "82",
    rc_parish: "STIRLING, ST MARY'S",
    county: "Stirling",
  },
  {
    mp_code: "MP",
    mp_no: "61",
    rc_parish: "STRANRAER, ST JOSEPH'S",
    county: "Wigtown",
  },
  { mp_code: "MP", mp_no: "33", rc_parish: "STRICHEN", county: "Aberdeen" },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "THORNEY ISLAND [R.A.F.]",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "TIDWORTH, MILITARY CEMETERY",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "TIDWORTH, SAINTS GEORGE AND PATRICK",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "TIDWORTH, SAINTS PATRICK AND GEORGE",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "34",
    rc_parish: "TOMBAE, THE INCARNATION",
    county: "Banff",
  },
  { mp_code: "IM", mp_no: "29", rc_parish: "TOMINTOUL", county: "Banff" },
  { mp_code: "MP", mp_no: "35", rc_parish: "TOMINTOUL", county: "Banff" },
  {
    mp_code: "MP",
    mp_no: "110",
    rc_parish: "TRANENT, ST MARTIN OF TOURS",
    county: "East Lothian",
  },
  {
    mp_code: "MP",
    mp_no: "36",
    rc_parish: "TYNET, ST NINIAN'S",
    county: "Banff",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "UXBRIDGE, HILLINGDON CEMETERY",
    county: "Military or outside Scotland",
  },
  {
    mp_code: "MP",
    mp_no: "91",
    rc_parish: "WICK, ST JOACHIM",
    county: "Caithness",
  },
  {
    mp_code: "BF",
    mp_no: "1",
    rc_parish: "YATEBURY [R.A.F.]",
    county: "Military or outside Scotland",
  },
];

function getRcParishDataFromNameAndCongregation(parishName, congregationName) {
  if (!parishName) {
    return [];
  }

  let ucParishName = parishName.trim().toUpperCase();

  let ucParishNamePlusCongregation = "";

  if (congregationName) {
    congregationName = congregationName.trim().toUpperCase();
    congregationName = congregationName.replace(/^ST\.\s*/, "ST ");

    // remove special case endings (not sure if I did this for Other churches?)
    congregationName = congregationName.replace(/\s*UNITED SECESSION$/, "");

    ucParishNamePlusCongregation = ucParishName + ", " + congregationName;
  }

  const result = rc_parishes.filter((parish) => {
    if (ucParishNamePlusCongregation && ucParishNamePlusCongregation == parish.rc_parish) {
      return true;
    } else if (ucParishName == parish.rc_parish) {
      return true;
    }
    return false;
  });

  return result;
}

function getRcParishDataFromParishNameOnly(parishName) {
  if (!parishName) {
    return [];
  }

  let ucParishName = parishName.trim().toUpperCase();

  const result = rc_parishes.filter((parish) => {
    let parishNameOnly = parish.rc_parish;
    parishNameOnly = parishNameOnly.replace(/\,.*$/, "");

    if (ucParishName == parishNameOnly) {
      return true;
    }
    return false;
  });

  return result;
}

export { getRcParishDataFromNameAndCongregation, getRcParishDataFromParishNameOnly };
