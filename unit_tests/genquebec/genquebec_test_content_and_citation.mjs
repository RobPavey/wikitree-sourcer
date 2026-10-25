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

import { generalizeData } from "../../extension/site/genquebec/core/genquebec_generalize_data.mjs";
import { buildCitation } from "../../extension/site/genquebec/core/genquebec_build_citation.mjs";
import assert from "node:assert/strict";
import { readInputFile } from "../test_utils/ref_file_utils.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "lafrance_birth_1822_duclos_pierre_nazaire",
    url: "https://www.genealogiequebec.com/en/lafrance_naissances/2713307",
  },
  {
    caseName: "lafrance_death_1832_duclos_joseph",
    url: "https://www.genealogiequebec.com/en/lafrance_deces/4645450",
  },
  {
    caseName: "lafrance_marriage_1842_duclos_desrues",
    url: "https://www.genealogiequebec.com/en/lafrance_mariages/13385869",
  },
  {
    caseName: "abcd_marriage_1841_duclos_samson",
    url: "https://www.genealogiequebec.com/en/abcd_mariages/6296723",
  },
  {
    caseName: "membership_lafrance_baptism_2960930",
    url: "https://www.genealogiequebec.com/Membership/LAFRANCE/acte/2960930",
  },
  {
    caseName: "membership_lafrance_burial_5470196",
    url: "https://www.genealogiequebec.com/Membership/LAFRANCE/acte/5470196",
  },
  {
    caseName: "membership_lafrance_marriage_13496435",
    url: "https://www.genealogiequebec.com/Membership/LAFRANCE/acte/13496435",
  },
  {
    caseName: "lafrance_marriage_150026_old",
    pageFile: "./unit_tests/genquebec/saved_pages/lafrance_marriage_150026_old.html",
    url: "https://www.genealogiequebec.com/Membership/LAFRANCE/acte/150026",
  },
  {
    caseName: "lafrance_marriage_150026_new",
    pageFile: "./unit_tests/genquebec/saved_pages/lafrance_marriage_150026_new.html",
    url: "https://www.genealogiequebec.com/en/lafrance_mariages/150026",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("genquebec", regressionData, testManager);

  await runGeneralizeDataTests("genquebec", generalizeData, regressionData, testManager);
  let marriageData = readInputFile(
    "genquebec",
    "extracted_data",
    regressionData.find((test) => test.caseName == "lafrance_marriage_1842_duclos_desrues"),
    undefined
  );
  let marriageGeneralizedData = generalizeData({ extractedData: marriageData });
  assert.equal(marriageGeneralizedData.spouses[0].parents.father.name.inferFullName(), "Michel Desrues");
  assert.equal(
    marriageGeneralizedData.spouses[0].parents.mother.name.inferFullName(),
    "Catherine Sabourin"
  );
  let membershipBaptismTest = regressionData.find(
    (test) => test.caseName == "membership_lafrance_baptism_2960930"
  );
  let membershipBaptismData = readInputFile("genquebec", "extracted_data", membershipBaptismTest, undefined);
  let membershipBaptismGeneralizedData = generalizeData({ extractedData: membershipBaptismData });
  assert.equal(
    membershipBaptismGeneralizedData.eventPlace.placeString,
    "St-François-du-Lac (St-François-Xavier)"
  );
  assert.ok(membershipBaptismData.recordData["Région"]);
  let membershipBaptismCitation = await buildCitation({
    extractedData: membershipBaptismData,
    generalizedData: membershipBaptismGeneralizedData,
    runDate: new Date("6 May 2021"),
    options: testManager.options,
    type: "inline",
  });
  assert.ok(
    membershipBaptismCitation.citation.includes(
      "in St-François-du-Lac (St-François-Xavier). MRC: Nicolet-Yamaska; Région: Centre-du-Québec."
    )
  );

  for (let testCase of ["lafrance_marriage_150026_old", "lafrance_marriage_150026_new"]) {
    let testData = regressionData.find((test) => test.caseName == testCase);
    let extractedData = readInputFile("genquebec", "extracted_data", testData, undefined);
    let generalizedData = generalizeData({ extractedData: extractedData });
    let citation = await buildCitation({
      extractedData: extractedData,
      generalizedData: generalizedData,
      runDate: new Date("6 May 2021"),
      options: testManager.options,
      type: "inline",
    });
    assert.ok(citation.citation.includes("Other individuals listed:"));
    assert.ok(citation.citation.includes("Complementary information:"));
    assert.ok(citation.citation.includes("View original document"));
    if (testCase.endsWith("_old")) {
      assert.ok(citation.citation.includes("DAILLEBOUT DARGENTEUIL, Jean's occupation: ECUYER"));
      assert.ok(citation.citation.includes("Arrondissement: Ville-Marie"));
    }
  }

  let coupleFileGeneralizedData = generalizeData({
    extractedData: {
      success: true,
      pageType: "record",
      indexHeader: "Couple file",
      recordData: {
        Husband: "Jean Dupont",
        Wife: "Marie Tremblay",
        "Marriage location": "Québec",
        "Wife's father": "Pierre Tremblay",
        "Wife's mother": "Anne Roy",
      },
    },
  });
  assert.equal(coupleFileGeneralizedData.recordType, "Marriage");
  assert.equal(coupleFileGeneralizedData.spouses[0].parents.father.name.inferFullName(), "Pierre Tremblay");
  let coupleFileWithMarriageDate = generalizeData({
    extractedData: {
      success: true,
      indexHeader: "Couple file",
      recordData: {
        Husband: "Jean Dupont",
        Wife: "Marie Tremblay",
        "Marriage date": "12 May 1880",
      },
    },
  });
  assert.equal(coupleFileWithMarriageDate.recordType, "Marriage");
  let nonMarriageCoupleFile = generalizeData({
    extractedData: {
      success: true,
      indexHeader: "Couple file",
      recordData: { Husband: "Jean Dupont", Wife: "Marie Tremblay" },
    },
  });
  assert.notEqual(nonMarriageCoupleFile.recordType, "Marriage");

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("genquebec", functions, regressionData, testManager);
}

export { runTests };
