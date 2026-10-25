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

import { generalizeData } from "../../extension/site/prdh/core/prdh_generalize_data.mjs";
import { buildCitation } from "../../extension/site/prdh/core/prdh_build_citation.mjs";
import assert from "node:assert/strict";
import { readInputFile } from "../test_utils/ref_file_utils.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "baptism_1790_duclos_joseph",
    url: "https://www.prdh-igd.com/Membership/en/PRDH/Acte/474795",
  },
  {
    caseName: "burial_1832_duclos_joseph",
    url: "https://www.prdh-igd.com/Membership/en/PRDH/Acte/4645450",
  },
  {
    caseName: "marriage_1816_duclos_carrier",
    url: "https://www.prdh-igd.com/Membership/en/PRDH/Acte/5710099",
  },
  {
    caseName: "family_1816_duclos_carrier",
    url: "https://www.prdh-igd.com/Membership/en/PRDH/Famille/129417",
  },
  {
    caseName: "individual_duclos_joseph",
    url: "https://www.prdh-igd.com/Membership/en/PRDH/Individu/633835",
  },
  {
    caseName: "marriage_150026",
    url: "https://www.prdh-igd.com/Membership/en/PRDH/Acte/150026",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("prdh", regressionData, testManager);

  await runGeneralizeDataTests("prdh", generalizeData, regressionData, testManager);
  let marriageData = readInputFile(
    "prdh",
    "extracted_data",
    regressionData.find((test) => test.caseName == "marriage_1816_duclos_carrier"),
    undefined
  );
  let marriageGeneralizedData = generalizeData({ extractedData: marriageData });
  assert.equal(
    marriageGeneralizedData.spouses[0].parents.father.name.inferFullName(),
    "Jean Baptiste Carrier"
  );
  assert.equal(marriageGeneralizedData.spouses[0].parents.mother.name.inferFullName(), "Marie Anne Poire");

  let burialTest = regressionData.find((test) => test.caseName == "burial_1832_duclos_joseph");
  let burialData = readInputFile("prdh", "extracted_data", burialTest, undefined);
  let burialGeneralizedData = generalizeData({ extractedData: burialData });
  assert.equal(burialGeneralizedData.eventPlace.placeString, burialData.parish);
  let burialCitation = await buildCitation({
    extractedData: burialData,
    generalizedData: burialGeneralizedData,
    runDate: new Date("6 May 2021"),
    options: testManager.options,
    type: "inline",
  });
  assert.ok(burialCitation.citation.includes("MRC: Lévis"));
  assert.ok(burialCitation.citation.includes("Région: Chaudière-Appalaches"));
  assert.ok(
    burialCitation.citation.includes(
      "in Lauzon (St-Joseph-de-la-Pointe-Lévy). MRC: Lévis; Région: Chaudière-Appalaches"
    )
  );

  let detailedMarriage = regressionData.find((test) => test.caseName == "marriage_150026");
  let detailedMarriageData = readInputFile("prdh", "extracted_data", detailedMarriage, undefined);
  let detailedMarriageGeneralizedData = generalizeData({ extractedData: detailedMarriageData });
  let detailedMarriageCitation = await buildCitation({
    extractedData: detailedMarriageData,
    generalizedData: detailedMarriageGeneralizedData,
    runDate: new Date("6 May 2021"),
    options: testManager.options,
    type: "inline",
  });
  assert.ok(detailedMarriageCitation.citation.includes("Other individuals listed:"));
  assert.ok(detailedMarriageCitation.citation.includes("Complementary information:"));
  assert.ok(detailedMarriageCitation.citation.includes("Arrondissement: Ville-Marie"));
  assert.ok(
    detailedMarriageCitation.citation.includes(
      "Honore Michel DEVILLEBOIS DELAROUVILIERE's occupation: ECUYER, COMMISSAIRE ORDONNATEUR DANS TOUT LE CANADA"
    )
  );

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("prdh", functions, regressionData, testManager);
}

export { runTests };
