const categories = [
  {
    "value": "all",
    "text": "All Categories"
  },
  {
    "value": "ft",
    "text": "Censuses"
  },
  {
    "value": "mt",
    "text": "Censuses (male register)"
  },
  {
    "value": "kb",
    "text": "Church books/Parish registers"
  },
  {
    "value": "em",
    "text": "Emigration records"
  },
  {
    "value": "sk",
    "text": "Probate records"
  },
  {
    "value": "ru",
    "text": "Seamen rolls and military rolls"
  },
  {
    "value": "el",
    "text": "School records"
  },
  {
    "value": "hm",
    "text": "Health care records"
  },
  {
    "value": "fv",
    "text": "Poverty matters"
  },
  {
    "value": "rs",
    "text": "Accounts and tax lists"
  },
  {
    "value": "tl",
    "text": "Deed registration records"
  },
  {
    "value": "ma",
    "text": "Landed property tax records"
  },
  {
    "value": "as",
    "text": "Insurance records"
  },
  {
    "value": "rg",
    "text": "Legal proceedings and sanctions"
  },
  {
    "value": "ga",
    "text": "Clerical archives"
  },
  {
    "value": "sm",
    "text": "Transport records"
  },
  {
    "value": "db",
    "text": "Miscellaneous sources"
  }
];

const collections = [
  {
    "value": "all",
    "text": "All Collections"
  },
  {
    "value": "jt_436",
    "text": "1960 census",
    "category": "ft"
  },
  {
    "value": "jt_18",
    "text": "1920 Census",
    "category": "ft"
  },
  {
    "value": "jt_19",
    "text": "1910 Census",
    "category": "ft"
  },
  {
    "value": "jt_2",
    "text": "1900 Census",
    "category": "ft"
  },
  {
    "value": "jt_3",
    "text": "1891 Census",
    "category": "ft"
  },
  {
    "value": "jt_4",
    "text": "1885 Census",
    "category": "ft"
  },
  {
    "value": "jt_5",
    "text": "1875 Census",
    "category": "ft"
  },
  {
    "value": "jt_6",
    "text": "1870 Census",
    "category": "ft"
  },
  {
    "value": "jt_7",
    "text": "1865 Census",
    "category": "ft"
  },
  {
    "value": "jt_8",
    "text": "1855 Census",
    "category": "ft"
  },
  {
    "value": "jt_9",
    "text": "1845 Census",
    "category": "ft"
  },
  {
    "value": "jt_10",
    "text": "1835 Census",
    "category": "ft"
  },
  {
    "value": "jt_11",
    "text": "1825 Census",
    "category": "ft"
  },
  {
    "value": "jt_12",
    "text": "1815 Census",
    "category": "ft"
  },
  {
    "value": "jt_13",
    "text": "1801 Census",
    "category": "ft"
  },
  {
    "value": "jt_14",
    "text": "1769 Census",
    "category": "ft"
  },
  {
    "value": "jt_15",
    "text": "Municipal censuses",
    "category": "ft"
  },
  {
    "value": "jt_16",
    "text": "Local censuses",
    "category": "ft"
  },
  {
    "value": "jt_17",
    "text": "American censuses",
    "category": "ft"
  },
  {
    "value": "jt_38",
    "text": "1701 Male census",
    "category": "mt"
  },
  {
    "value": "jt_39",
    "text": "1663-1666 Church male census",
    "category": "mt"
  },
  {
    "value": "jt_40",
    "text": "N/A - ekisterte ikke",
    "category": "mt"
  },
  {
    "value": "jt_41",
    "text": "Voter register",
    "category": "mt"
  },
  {
    "value": "jt_42",
    "text": "Uncategorised male censuses",
    "category": "mt"
  },
  {
    "value": "sc_kb",
    "text": "Church books/Parish registers",
    "category": "kb"
  },
  {
    "value": "lt_dp",
    "text": "Born and baptised",
    "category": "kb"
  },
  {
    "value": "lt_dp",
    "text": "Born and baptised",
    "category": "kb"
  },
  {
    "value": "lt_ub",
    "text": "Illegitimate born and baptised",
    "category": "kb"
  },
  {
    "value": "lt_kf",
    "text": "Confirmation",
    "category": "kb"
  },
  {
    "value": "lt_vi",
    "text": "Married",
    "category": "kb"
  },
  {
    "value": "lt_gr",
    "text": "Deceased and buried",
    "category": "kb"
  },
  {
    "value": "lt_if",
    "text": "In-migrated",
    "category": "kb"
  },
  {
    "value": "lt_uf",
    "text": "Out-migrated",
    "category": "kb"
  },
  {
    "value": "lt_fl",
    "text": "In- and out-migrated",
    "category": "kb"
  },
  {
    "value": "lt_df",
    "text": "Stillborn",
    "category": "kb"
  },
  {
    "value": "lt_tr",
    "text": "Engaged",
    "category": "kb"
  },
  {
    "value": "lt_ly",
    "text": "Wedding banns",
    "category": "kb"
  },
  {
    "value": "lt_va",
    "text": "Vaccinated",
    "category": "kb"
  },
  {
    "value": "lt_im",
    "text": "Joiners of the State Church",
    "category": "kb"
  },
  {
    "value": "lt_um",
    "text": "Leavers of the State Church",
    "category": "kb"
  },
  {
    "value": "lt_in",
    "text": "Introduced women",
    "category": "kb"
  },
  {
    "value": "lt_pa",
    "text": "Public confessions (publice absolverede)",
    "category": "kb"
  },
  {
    "value": "lt_ko",
    "text": "Communicants",
    "category": "kb"
  },
  {
    "value": "lt_fd",
    "text": "Born of dissenters",
    "category": "kb"
  },
  {
    "value": "lt_vd",
    "text": "Married dissenters",
    "category": "kb"
  },
  {
    "value": "lt_dd",
    "text": "Dead dissenters",
    "category": "kb"
  },
  {
    "value": "lt_id",
    "text": "Joiners (dissenters)",
    "category": "kb"
  },
  {
    "value": "lt_md",
    "text": "Members (dissenters)",
    "category": "kb"
  },
  {
    "value": "lt_ud",
    "text": "Leavers (dissenters)",
    "category": "kb"
  },
  {
    "value": "lt_bv",
    "text": "Civil married",
    "category": "kb"
  },
  {
    "value": "lt_bl",
    "text": "Civil wedding banns",
    "category": "kb"
  },
  {
    "value": "lt_fo",
    "text": "Statement of best man",
    "category": "kb"
  },
  {
    "value": "lt_bi",
    "text": "Other funeral service (bisettelse)",
    "category": "kb"
  },
  {
    "value": "lt_sj",
    "text": "Parish members (sjeleregister)",
    "category": "kb"
  },
  {
    "value": "lt_kr",
    "text": "Chronological list",
    "category": "kb"
  },
  {
    "value": "lt_dr",
    "text": "Journal",
    "category": "kb"
  },
  {
    "value": "lt_jf",
    "text": "Comparing index (jevnførelsesregister)",
    "category": "kb"
  },
  {
    "value": "lt_al",
    "text": "Other list",
    "category": "kb"
  },
  {
    "value": "lt_xx",
    "text": "not divided into lists",
    "category": "kb"
  },
  {
    "value": "lt_as",
    "text": "title pages, index pages, printed pages etc.",
    "category": "kb"
  },
  {
    "value": "st_MINI",
    "text": "Parish register (official)",
    "category": "kb"
  },
  {
    "value": "st_MINI",
    "text": "Parish register (official)",
    "category": "kb"
  },
  {
    "value": "st_KLOK",
    "text": "Parish register (copy)",
    "category": "kb"
  },
  {
    "value": "st_FREG",
    "text": "Birth register",
    "category": "kb"
  },
  {
    "value": "st_DÅPB",
    "text": "Baptism register",
    "category": "kb"
  },
  {
    "value": "st_VAKS",
    "text": "Vaccination register",
    "category": "kb"
  },
  {
    "value": "st_KOMM",
    "text": "Communicants register",
    "category": "kb"
  },
  {
    "value": "st_FORL",
    "text": "Best man's statements",
    "category": "kb"
  },
  {
    "value": "st_LYSN",
    "text": "Banns register",
    "category": "kb"
  },
  {
    "value": "st_DREG",
    "text": "Diary records",
    "category": "kb"
  },
  {
    "value": "st_RESK",
    "text": "Curate's parish register",
    "category": "kb"
  },
  {
    "value": "st_KLAD",
    "text": "Parish register draft",
    "category": "kb"
  },
  {
    "value": "st_AVSK",
    "text": "Parish register transcript",
    "category": "kb"
  },
  {
    "value": "st_DISS",
    "text": "Dissenter register",
    "category": "kb"
  },
  {
    "value": "st_VIGB",
    "text": "Marriage register (dissenter)",
    "category": "kb"
  },
  {
    "value": "st_DIVR",
    "text": "Other parish register",
    "category": "kb"
  },
  {
    "value": "st_VIGR",
    "text": "Marriage register",
    "category": "kb"
  },
  {
    "value": "st_UTEN",
    "text": "Uspesifisert kirkeboktype",
    "category": "kb"
  },
  {
    "value": "sc_em",
    "text": "Emigration records",
    "category": "em"
  },
  {
    "value": "st_EMIP",
    "text": "Emigration register",
    "category": "em"
  },
  {
    "value": "st_EMIR",
    "text": "Index to emigration register",
    "category": "em"
  },
  {
    "value": "st_UTVA",
    "text": "List of emigrants",
    "category": "em"
  },
  {
    "value": "st_PASS",
    "text": "Passport register",
    "category": "em"
  },
  {
    "value": "st_PALI",
    "text": "List of ship passengers",
    "category": "em"
  },
  {
    "value": "sc_sk",
    "text": "Probate records",
    "category": "sk"
  },
  {
    "value": "st_SKIK",
    "text": "Probate index cards",
    "category": "sk"
  },
  {
    "value": "st_SKRG",
    "text": "Probate register",
    "category": "sk"
  },
  {
    "value": "st_SKPR",
    "text": "Probate records",
    "category": "sk"
  },
  {
    "value": "st_SKRE",
    "text": "Probate registration records",
    "category": "sk"
  },
  {
    "value": "st_SKFO",
    "text": "Probate proceedings records",
    "category": "sk"
  },
  {
    "value": "st_SKUT",
    "text": "Probate division records",
    "category": "sk"
  },
  {
    "value": "st_SKBO",
    "text": "Probate folders",
    "category": "sk"
  },
  {
    "value": "st_SKSL",
    "text": "Probate documents",
    "category": "sk"
  },
  {
    "value": "st_SKLI",
    "text": "Probate list (probate journal)",
    "category": "sk"
  },
  {
    "value": "st_SKDE",
    "text": "Probate designations",
    "category": "sk"
  },
  {
    "value": "st_SKKO",
    "text": "Probate drafts",
    "category": "sk"
  },
  {
    "value": "st_SKMI",
    "text": "Military probate records",
    "category": "sk"
  },
  {
    "value": "st_SKDI",
    "text": "Other probate records",
    "category": "sk"
  },
  {
    "value": "st_SKDP",
    "text": "Death register",
    "category": "sk"
  },
  {
    "value": "st_SKDM",
    "text": "Death reports",
    "category": "sk"
  },
  {
    "value": "st_SKDJ",
    "text": "Death journal",
    "category": "sk"
  },
  {
    "value": "st_SKDR",
    "text": "Index to death register",
    "category": "sk"
  },
  {
    "value": "sc_ru",
    "text": "Seamen rolls and military rolls",
    "category": "ru"
  },
  {
    "value": "st_RULL",
    "text": "Roll",
    "category": "ru"
  },
  {
    "value": "st_ELRU",
    "text": "Older roll",
    "category": "ru"
  },
  {
    "value": "st_HORU",
    "text": "Main roll",
    "category": "ru"
  },
  {
    "value": "st_ANRU",
    "text": "Young seamen roll (annotasjonsrulle)",
    "category": "ru"
  },
  {
    "value": "st_MØRU",
    "text": "Journal of ships with sign on/off (mønstringsjournal)",
    "category": "ru"
  },
  {
    "value": "st_SKRU",
    "text": "Skipper and mate roll",
    "category": "ru"
  },
  {
    "value": "st_MARU",
    "text": "Engineer and stoker roll",
    "category": "ru"
  },
  {
    "value": "st_USRU",
    "text": "Enlistment roll",
    "category": "ru"
  },
  {
    "value": "st_UTRU",
    "text": "Enlistment register roll",
    "category": "ru"
  },
  {
    "value": "st_UNRU",
    "text": "Youth roll",
    "category": "ru"
  },
  {
    "value": "st_EKRU",
    "text": "Extra roll",
    "category": "ru"
  },
  {
    "value": "st_DIRU",
    "text": "Miscellaneous roll",
    "category": "ru"
  },
  {
    "value": "st_RERU",
    "text": "Roll index",
    "category": "ru"
  },
  {
    "value": "st_MIRU",
    "text": "Military roll",
    "category": "ru"
  },
  {
    "value": "st_NAVY",
    "text": "Naval roll",
    "category": "ru"
  },
  {
    "value": "st_LERU",
    "text": "Military quarters records",
    "category": "ru"
  },
  {
    "value": "sc_el",
    "text": "School records",
    "category": "el"
  },
  {
    "value": "st_ELEV",
    "text": "Pupil register",
    "category": "el"
  },
  {
    "value": "st_KARA",
    "text": "School grade register",
    "category": "el"
  },
  {
    "value": "sc_hm",
    "text": "Health care records",
    "category": "hm"
  },
  {
    "value": "st_PAPR",
    "text": "Patient register",
    "category": "hm"
  },
  {
    "value": "st_PASI",
    "text": "Patient records",
    "category": "hm"
  },
  {
    "value": "st_VALI",
    "text": "Vaccination records",
    "category": "hm"
  },
  {
    "value": "sc_fv",
    "text": "Poverty matters",
    "category": "fv"
  },
  {
    "value": "st_FATL",
    "text": "Records of paupers",
    "category": "fv"
  },
  {
    "value": "st_FAMA",
    "text": "Pauper register",
    "category": "fv"
  },
  {
    "value": "st_HEIM",
    "text": "Register of place of origin (hjemstavnprotokoll)",
    "category": "fv"
  },
  {
    "value": "st_FARE",
    "text": "Protocol index",
    "category": "fv"
  },
  {
    "value": "st_FVDV",
    "text": "Miscellaneous poverty matters",
    "category": "fv"
  },
  {
    "value": "sc_rs",
    "text": "Accounts and tax lists",
    "category": "rs"
  },
  {
    "value": "st_LERE",
    "text": "Account books for feudal overlords (lensregnskap)",
    "category": "rs"
  },
  {
    "value": "st_SARE",
    "text": "Account books for county account office (stiftamstueregnskap)",
    "category": "rs"
  },
  {
    "value": "st_FORE",
    "text": "Account books for bailiffs",
    "category": "rs"
  },
  {
    "value": "st_BYRE",
    "text": "Account books for cities",
    "category": "rs"
  },
  {
    "value": "st_KIRE",
    "text": "Kirkeregnskap",
    "category": "rs"
  },
  {
    "value": "st_SKMA",
    "text": "Tax Census",
    "category": "rs"
  },
  {
    "value": "st_SKAL",
    "text": "Tax list",
    "category": "rs"
  },
  {
    "value": "st_LIPR",
    "text": "Tax assessment protocol",
    "category": "rs"
  },
  {
    "value": "st_FLIG",
    "text": "Assessment of poverty tax",
    "category": "rs"
  },
  {
    "value": "st_EKST",
    "text": "Extra tax",
    "category": "rs"
  },
  {
    "value": "st_KOPP",
    "text": "Poll",
    "category": "rs"
  },
  {
    "value": "st_KRIG",
    "text": "Wartime tax",
    "category": "rs"
  },
  {
    "value": "st_SKAA",
    "text": "Other tax list",
    "category": "rs"
  },
  {
    "value": "st_SØLV",
    "text": "Silvertax 1816",
    "category": "rs"
  },
  {
    "value": "st_FORM",
    "text": "Wealth tax 1789",
    "category": "rs"
  },
  {
    "value": "st_OPPE",
    "text": "Collection register (oppebørselbok)",
    "category": "rs"
  },
  {
    "value": "st_KABO",
    "text": "Cash book",
    "category": "rs"
  },
  {
    "value": "st_TOLL",
    "text": "Customs records",
    "category": "rs"
  },
  {
    "value": "sc_tl",
    "text": "Deed registration records",
    "category": "tl"
  },
  {
    "value": "st_PREG",
    "text": "Mortgage register",
    "category": "tl"
  },
  {
    "value": "st_PBOK",
    "text": "Mortgage book",
    "category": "tl"
  },
  {
    "value": "st_UTSK",
    "text": "Register of land consolidation (utskiftningsregister)",
    "category": "tl"
  },
  {
    "value": "sc_ma",
    "text": "Landed property tax records",
    "category": "ma"
  },
  {
    "value": "st_MATR",
    "text": "Landed property index",
    "category": "ma"
  },
  {
    "value": "st_MAFO",
    "text": "Preparings to landed property index",
    "category": "ma"
  },
  {
    "value": "st_JORD",
    "text": "Rent roll for landed property",
    "category": "ma"
  },
  {
    "value": "sc_as",
    "text": "Insurance records",
    "category": "as"
  },
  {
    "value": "st_BRTA",
    "text": "Fire assessment documents",
    "category": "as"
  },
  {
    "value": "sc_rg",
    "text": "Legal proceedings and sanctions",
    "category": "rg"
  },
  {
    "value": "st_TBOK",
    "text": "Court journal",
    "category": "rg"
  },
  {
    "value": "st_RÅDP",
    "text": "Magistrate court records (rådstuerett)",
    "category": "rg"
  },
  {
    "value": "st_FOPR",
    "text": "Register of proceedings",
    "category": "rg"
  },
  {
    "value": "st_EKRP",
    "text": "Extraordinary court records",
    "category": "rg"
  },
  {
    "value": "st_STOR",
    "text": "Register of largescale land consolidation (storskifte)",
    "category": "rg"
  },
  {
    "value": "st_AVSO",
    "text": "Verdict records (avsikt)",
    "category": "rg"
  },
  {
    "value": "st_DOMP",
    "text": "Court case records",
    "category": "rg"
  },
  {
    "value": "st_AVSP",
    "text": "Verdict records (avsikt)",
    "category": "rg"
  },
  {
    "value": "st_VOTP",
    "text": "Court voting records",
    "category": "rg"
  },
  {
    "value": "st_SADO",
    "text": "Documents",
    "category": "rg"
  },
  {
    "value": "st_EKSP",
    "text": "Extract records",
    "category": "rg"
  },
  {
    "value": "st_FHPR",
    "text": "Preliminary court journal",
    "category": "rg"
  },
  {
    "value": "st_FLPR",
    "text": "Settlement records",
    "category": "rg"
  },
  {
    "value": "st_STEV",
    "text": "Register of summons",
    "category": "rg"
  },
  {
    "value": "st_DOMA",
    "text": "Sentences",
    "category": "rg"
  },
  {
    "value": "st_DOMB",
    "text": "Court case journal",
    "category": "rg"
  },
  {
    "value": "st_SLST",
    "text": "Criminal proceedings",
    "category": "rg"
  },
  {
    "value": "st_ANKE",
    "text": "Appeals",
    "category": "rg"
  },
  {
    "value": "st_REGI",
    "text": "Index",
    "category": "rg"
  },
  {
    "value": "st_RERG",
    "text": "Index to legal procedure records",
    "category": "rg"
  },
  {
    "value": "st_REBO",
    "text": "Other court journal",
    "category": "rg"
  },
  {
    "value": "st_JOSP",
    "text": "Register of land consolidation",
    "category": "rg"
  },
  {
    "value": "st_JODO",
    "text": "Land consolidation documents",
    "category": "rg"
  },
  {
    "value": "st_JOKA",
    "text": "Land consolidation maps",
    "category": "rg"
  },
  {
    "value": "st_FANG",
    "text": "Prison register",
    "category": "rg"
  },
  {
    "value": "sc_ga",
    "text": "Clerical archives",
    "category": "ga"
  },
  {
    "value": "st_EKTE",
    "text": "Marriage licences",
    "category": "ga"
  },
  {
    "value": "st_SJEL",
    "text": "Register of literacy and religion (sjeleregister)",
    "category": "ga"
  },
  {
    "value": "st_KIST",
    "text": "Church account book (kirkestol)",
    "category": "ga"
  },
  {
    "value": "st_KALL",
    "text": "Parish notes (kallsbok)",
    "category": "ga"
  },
  {
    "value": "st_ANNP",
    "text": "Other minister archives",
    "category": "ga"
  },
  {
    "value": "st_GRAV",
    "text": "Headstones",
    "category": "ga"
  },
  {
    "value": "sc_sm",
    "text": "Transport records",
    "category": "sm"
  },
  {
    "value": "st_SMPR",
    "text": "Driving licence records",
    "category": "sm"
  },
  {
    "value": "st_SMKR",
    "text": "Vehicle records",
    "category": "sm"
  },
  {
    "value": "st_SMMR",
    "text": "Fishing boad records",
    "category": "sm"
  },
  {
    "value": "st_SMSR",
    "text": "Boat/ship records",
    "category": "sm"
  },
  {
    "value": "st_SKSS",
    "text": "Shuttle",
    "category": "sm"
  },
  {
    "value": "sc_db",
    "text": "Miscellaneous sources",
    "category": "db"
  },
  {
    "value": "st_FULL",
    "text": "Full text transcriptions",
    "category": "db"
  },
  {
    "value": "st_DODR",
    "text": "Deaths",
    "category": "db"
  },
  {
    "value": "st_VAMA",
    "text": "Register of voters",
    "category": "db"
  },
  {
    "value": "st_VERK",
    "text": "Enterprise register",
    "category": "db"
  },
  {
    "value": "st_VIBO",
    "text": "Marriage register (civil)",
    "category": "db"
  },
  {
    "value": "st_VIRE",
    "text": "Index to marriage register (civil)",
    "category": "db"
  },
  {
    "value": "st_LYBO",
    "text": "Banns register (civil)",
    "category": "db"
  },
  {
    "value": "st_NOPR",
    "text": "Public notary register",
    "category": "db"
  },
  {
    "value": "st_AVST",
    "text": "Referendum",
    "category": "db"
  },
  {
    "value": "st_SKOF",
    "text": "Public guardian register",
    "category": "db"
  },
  {
    "value": "st_FOLN",
    "text": "Population Register - Name cards",
    "category": "db"
  },
  {
    "value": "st_FOLR",
    "text": "Population Register - Index cards",
    "category": "db"
  },
  {
    "value": "st_FOLF",
    "text": "Population Register - Birth register",
    "category": "db"
  },
  {
    "value": "st_FOLV",
    "text": "Population Register - Marriage register",
    "category": "db"
  },
  {
    "value": "st_FOLD",
    "text": "Population Register - Death register",
    "category": "db"
  },
  {
    "value": "st_FOBE",
    "text": "Population Statistics",
    "category": "db"
  },
  {
    "value": "st_GSAM",
    "text": "Genealogical collection",
    "category": "db"
  },
  {
    "value": "st_BORG",
    "text": "Citizenship roll",
    "category": "db"
  },
  {
    "value": "st_HAUG",
    "text": "Haugianer letters",
    "category": "db"
  },
  {
    "value": "st_DIPL",
    "text": "Medieval and Post-Medieval documents and fragments",
    "category": "db"
  },
  {
    "value": "st_PERE",
    "text": "Person register",
    "category": "db"
  },
  {
    "value": "st_PELI",
    "text": "List of persons",
    "category": "db"
  },
  {
    "value": "st_ADBO",
    "text": "Address books",
    "category": "db"
  },
  {
    "value": "st_FLYT",
    "text": "Records of in/out-migration",
    "category": "db"
  },
  {
    "value": "st_STAT",
    "text": "Statistics births married deaths",
    "category": "db"
  },
  {
    "value": "st_FREM",
    "text": "Immigration protocol",
    "category": "db"
  },
  {
    "value": "st_OPPM",
    "text": "Survey book",
    "category": "db"
  },
  {
    "value": "st_ERAP",
    "text": "Intelligence reports",
    "category": "db"
  },
  {
    "value": "st_LSAK",
    "text": "Trials of treatury",
    "category": "db"
  },
  {
    "value": "st_MINN",
    "text": "July 22, 2011 memory material",
    "category": "db"
  },
  {
    "value": "st_JOUR",
    "text": "Journal",
    "category": "db"
  },
  {
    "value": "st_SAKA",
    "text": "Records archive",
    "category": "db"
  },
  {
    "value": "st_KOBO",
    "text": "Copies of outgoing letters",
    "category": "db"
  },
  {
    "value": "st_MØBO",
    "text": "Minutes",
    "category": "db"
  },
  {
    "value": "st_VÅFA",
    "text": "Our Fallen",
    "category": "db"
  },
  {
    "value": "st_HOMA",
    "text": "Master's Theses",
    "category": "db"
  },
  {
    "value": "st_FOTO",
    "text": "Photographies",
    "category": "db"
  },
  {
    "value": "st_TEGN",
    "text": "Drawings",
    "category": "db"
  },
  {
    "value": "st_KART",
    "text": "Maps",
    "category": "db"
  },
  {
    "value": "st_LYDO",
    "text": "Sound recording",
    "category": "db"
  },
  {
    "value": "st_VIDE",
    "text": "Video",
    "category": "db"
  },
  {
    "value": "st_REGR",
    "text": "Index",
    "category": "db"
  },
  {
    "value": "st_MISC",
    "text": "Other source",
    "category": "db"
  },
  {
    "value": "st_JORE",
    "text": "Journal index",
    "category": "db"
  },
  {
    "value": "st_POPA",
    "text": "Political parties",
    "category": "db"
  },
  {
    "value": "st_NORE",
    "text": "Danish Chancellery,  Norwegian Registers",
    "category": "db"
  },
  {
    "value": "st_NOTE",
    "text": "Danish Chancellery, Norwegian Signatures",
    "category": "db"
  },
  {
    "value": "st_NOSU",
    "text": "Danish Chancellery, Norwegian Petitions",
    "category": "db"
  },
  {
    "value": "st_NOIN",
    "text": "Danish Chancellery, Norwegian Inserts",
    "category": "db"
  },
  {
    "value": "st_INTE",
    "text": "Interviews",
    "category": "db"
  },
  {
    "value": "st_JOBO",
    "text": "Jew estates",
    "category": "db"
  },
  {
    "value": "st_PUBL",
    "text": "Publications",
    "category": "db"
  }
];

