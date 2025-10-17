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

import { setupSimplePopupMenu } from "/base/browser/popup/popup_simple_base.mjs";
import { initPopup } from "/base/browser/popup/popup_init.mjs";
import { generalizeData } from "../core/arolsenarchives_generalize_data.mjs";
import { buildCitation } from "../core/arolsenarchives_build_citation.mjs";

async function getPersonData(extractData) {
  // if (extractData.doc_internal_id == null) {
  //   let request = await fetch("https://collections-server.arolsen-archives.org/ITS-WS.asmx/GetTreeNodeByDocId", {
  //     "credentials": "include",
  //     "headers": {
  //       "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0",
  //       "Accept": "application/json, text/plain, */*",
  //       "Accept-Language": "de,en-US;q=0.7,en;q=0.3",
  //       "Content-Type": "application/json",
  //       "Sec-Fetch-Dest": "empty",
  //       "Sec-Fetch-Mode": "cors",
  //       "Sec-Fetch-Site": "same-site",
  //       "Sec-GPC": "1"
  //     },
  //     "referrer": "https://collections.arolsen-archives.org/",
  //     "body": JSON.stringify({"id": extractData.doc_id}),
  //     "method": "POST",
  //     "mode": "cors"
  //   });
  //   let data = await request.json();
  //   extractData.doc_internal_id = data["d"];
  // }

  let request = await fetch("https://collections-server.arolsen-archives.org/ITS-WS.asmx/GetPersonListByDocId", {
    credentials: "include",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "de,en-US;q=0.7,en;q=0.3",
      "Content-Type": "application/json",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      "Sec-GPC": "1",
    },
    referrer: "https://collections.arolsen-archives.org/",
    body: JSON.stringify({ lang: "en", docId: extractData.doc_id }),
    method: "POST",
    mode: "cors",
  });
  extractData.person_data_list = (await request.json())["d"];

  if (extractData.person_data_list.length == 1) {
    extractData.person_data = extractData.person_data_list[0];
  } else if (extractData.person_index != null) {
    extractData.person_data = extractData.person_data_list[extractData.person_index];
  }
}

async function setupArolsenarchivesPopupMenu(extractedData) {
  if (extractedData.person_data == null) {
    await getPersonData(extractedData);
  }

  let input = {
    extractedData: extractedData,
    extractFailedMessage: "It looks like a Arolsen Archives page but not a record page.",
    generalizeFailedMessage: "It looks like a Arolsen Archives page but does not contain the required data.",
    generalizeDataFunction: generalizeData,
    buildCitationFunction: buildCitation,
    siteNameToExcludeFromSearch: "arolsenarchives",
  };
  setupSimplePopupMenu(input);
}

initPopup("arolsenarchives", setupArolsenarchivesPopupMenu);
