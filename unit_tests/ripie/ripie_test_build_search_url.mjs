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

import { buildSearchUrl } from "../../extension/site/ripie/core/ripie_build_search_url.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_utils.mjs";

// RIP.ie searches by the date a notice was PUBLISHED, so the search uses a window around the death date. With no
// usable death date it searches the whole archive (otherwise RIP.ie only searches the last month). The search
// builder uses runDate (not the real current date) to decide when the window reaches "today", so the cases that
// need that set their own runDate. Otherwise the test harness uses 1 December 2023.
//
// typeOfSearch is not set because RIP.ie only has one kind of search.
const regressionData = [
  // death date with day, month and year, window ends in the past
  {
    caseName: "death_date_exact_window_in_past",
    inputPath: "wikitree/generalized_data/ref/craft-31_read",
    runDate: new Date("1 July 2025"),
  },
  // same profile but the window would end after the run date so the end date becomes "today"
  {
    caseName: "death_date_exact_window_reaches_today",
    inputPath: "wikitree/generalized_data/ref/craft-31_read",
    runDate: new Date("10 April 2025"),
  },
  // death date with only a month and year
  {
    caseName: "death_date_month_only",
    inputPath: "ripie/search_inputs/death_month_only_2015",
  },
  // death date with only a year
  {
    caseName: "death_date_year_only",
    inputPath: "ripie/search_inputs/death_year_only_2015",
  },
  // maiden name (the nee parameter) and a death date, using data generated from a RIP.ie notice
  {
    caseName: "maiden_name_with_death_date",
    inputPath: "ripie/generalized_data/ref/notice_2010_two_counties_1",
  },
  // death just after the archive starts
  {
    caseName: "death_date_near_archive_start",
    inputPath: "ripie/generalized_data/ref/notice_2006_maiden_name_and_nickname",
  },
  // no death date so the whole archive is searched
  {
    caseName: "no_death_date",
    inputPath: "wikitree/generalized_data/ref/brewster-4830_read",
  },
  // no death date and a maiden name
  {
    caseName: "no_death_date_maiden_name",
    inputPath: "wikitree/generalized_data/ref/gibson-24132_read",
  },
  // preferred name (Guillaume's preferred name is William). The death is before the archive starts so the whole
  // archive is searched.
  {
    caseName: "preferred_name_death_before_2006",
    inputPath: "wikitree/generalized_data/ref/saulnier-848_manager_no_marriage_location_2025",
  },
  // preferred name plus a maiden name (Elizabeth McDonald, preferred name Lizzie, later Almand)
  {
    caseName: "preferred_name_and_maiden_name_death_before_2006",
    inputPath: "wikitree/generalized_data/ref/mcdonald-1168_read",
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("ripie", buildSearchUrl, regressionData, testManager);
}

export { runTests };
