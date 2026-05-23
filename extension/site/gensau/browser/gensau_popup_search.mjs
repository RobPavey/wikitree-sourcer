/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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

import { registerSearchMenuItemFromConfig } from "/base/browser/popup/popup_search_config.mjs";

/*
BDM Registrations
Birth Registrations	1837 to 1928	727,659	17 Dec 2020	
Death Registrations	1842 to 1996	847,239	30 Mar 2026	
Marriage Registrations	1842 to 1951	313,507	27 Mar 2026	
Newspaper Notices
Newspaper Births# **	1839 to 2018	1,376,128	22 May 2026	
  Includes Birthdays and Birthday memoriam (some incomplete years).	1967 to 2018			
Newspaper Death Notices#	1852 to 2020	1,896,251	19 Nov 2025	
  Includes Deaths, Funerals, In Memoriam, Lest We Forget and Return thanks.				
Newspaper Marriages#	1852, 1859 to 2018	421,752	24 Mar 2026	
  Includes Matrimonial Petitions	1859 to 1893			
  Includes Engagements, Approaching Marriages, Marriages and Wedding Anniversaries	1852, 1889 to 2018			
Newspaper Divorces	1859 to 1954	14,744	20 Dec 2023	
Cemeteries Burial Records
South Australia Cemeteries#	1802 onwards	606,269	17 Dec 2020	
  Includes Adelaide Catholic burials and some Funeral Directors.				
Church Records
South Australian Church records - Burials#	1847 onwards	12,884	16 Dec 2025	
South Australian Church records - Baptisms#	1839 onwards	51,606	13 Jan 2026	
South Australian Church records - Marriages#	1842 onwards	41,384	13 Jan 2026	
South Australian Church Records - Other#	1863 onwards	29,846	21 Apr 2026	
Admission Records
South Australian School Admissions#	1847 to 1996	232,664	22 May 2026	
Hospital, Asylum and Lying-in Home Admissions#	1839 to 1970	350,488	21 Jul 2025	
Other Records
All Other Records#	1836 onwards	2,785,560	16 Feb 2026	
Biographical Index of South Australians#	1836 to 1885	197,191	17 Dec 2020	
Biographical Index of South Australians - Supplementary#	1836 to 1885	7,160	25 Mar 2025	
  Supplementary information for people included in the Biographical Index of South Australia (BISA) 1836-1885 dataset. It also includes previously unpublished records.				
Certificates-Australia and Overseas#	1763 onwards	12,243	21 Apr 2026	
Irish Born South Australians (IBSA)#		36,194	18 Dec 2020	
  Not all people found in IBSA are Irish, however, people in the dataset are connected with an Irish born person.				
Ship Passenger Arrivals in South Australia#	1836 to 1952	277,959	02 Dec 2024	
Ships to South Australia#	1836 to 1910	14,822	17 Dec 2020	
Shipping Passenger Departures from South Australia#	1836 to 1940	131,782	14 Apr 2026	
South Australian Public Trustees/Deceased Estates#	1841 to 2023	234,592	19 Aug 2024
  Includes Adelaide Catholic burials and some Funeral Directors.
*/

//////////////////////////////////////////////////////////////////////////////////////////
// Configuration
//////////////////////////////////////////////////////////////////////////////////////////

const searchMenuConfig = {
  siteName: "gensau",
  siteDisplayName: "Genealogy SA",
  siteConstraints: {
    startYear: 1835,
    dateTestType: "bmd",
    countryList: ["Australia", "Colony of South Australia"],
  },
  includeDefaultSearch: true,
  includeSearchSubmenu: true,
  submenuConfig: {
    includeSameCollection: true,
    includeSearchWithParameters: true,
    searchWithParametersData: "GensauData",
    submenuOtherSearches: [
      {
        menuItemText: "Search Birth Registrations",
        typeOfSearch: "bdmBirths",
        constraints: {
          startYear: 1837,
          endYear: 1928,
          dateTestType: "born",
        },
      },
      {
        menuItemText: "Search Death Registrations",
        typeOfSearch: "bdmDeaths",
        constraints: {
          startYear: 1842,
          endYear: 1996,
          dateTestType: "died",
        },
      },
      {
        menuItemText: "Search Marriage Registrations",
        typeOfSearch: "bdmMarriages",
        constraints: {
          startYear: 1842,
          endYear: 1951,
          dateTestType: "bdm",
        },
      },
    ],
  },
};

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFromConfig(searchMenuConfig);
