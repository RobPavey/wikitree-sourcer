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

// No imports or requires allowed. See docs/dev_notes/extract_data_design

function extractData(document, url) {
  let result = { url: url, success: false };

  function text(root, selector) {
    let element = root.querySelector(selector);
    return element ? element.textContent.replace(/\s+/g, " ").trim() : "";
  }

  // The page title is like "Baptism - 474795 - PRDH-IGD"
  let titleMatch = document.title.trim().match(/^(\w+)\s+-\s+(\d+)\s+-/);
  if (!titleMatch) {
    return result;
  }
  let pageType = titleMatch[1].toLowerCase();
  result.pageType = pageType;
  result.recordId = titleMatch[2];

  if (pageType == "baptism" || pageType == "burial" || pageType == "marriage") {
    if (!document.querySelector("[id$='ActeTable']")) {
      return result;
    }

    // e.g. "Baptism #" or "Marriage couple #"
    result.recordTypeLabel = text(document, "[id$='ActeListView_TypeLabel_0']").replace(/\s*#$/, "");
    result.eventDate = text(document, "[id$='ActeListView_DateTableCell_0']");
    result.mrc = text(document, "[id$='ActeListView_MrcTableRow_0']");
    result.birthOrDeathLabel = text(document, "[id$='ActeListView_DateEvtLabel_0']").replace(/\s*:$/, "");
    result.birthOrDeathDate = text(document, "[id$='ActeListView_DateEvenementLabel_0']");

    let imageLink = document.querySelector("[id$='ActeListView_ImageTagHyperLink_0']");
    if (imageLink) {
      result.imageUrl = imageLink.getAttribute("href");
    }
    result.parish = text(document, "a.lieu");

    let mentions = [];
    for (let row of document.querySelectorAll("tr[id*='MentionsListView_ItemTemplateTr_']")) {
      let mention = {};
      mention.rank = text(row, "[id*='MentionsListView_RangLabel_']");
      let nameLink = row.querySelector("a.nomSujetMention, a.nomMention");
      mention.name = nameLink ? nameLink.textContent.replace(/\s+/g, " ").trim() : "";
      if (!mention.rank || !mention.name) {
        continue;
      }
      let individualMatch = nameLink.getAttribute("href").match(/Individu\/(\d+)/i);
      if (individualMatch) {
        mention.individualId = individualMatch[1];
      }
      mention.age = text(row, "[id*='MentionsListView_AgeLabel_']");
      mention.maritalStatus = text(row, "[id*='MentionsListView_EtatMatrimonialLabel_']");
      mention.presence = text(row, "[id*='MentionsListView_PresenceLabel_']");
      // e.g. "f DU CHOLÉRA." the first letter is the sex and the rest is a note from the record
      mention.sex = text(row, "[id*='MentionsListView_SexeLabel_']");

      let relations = [];
      for (let relationLabel of row.querySelectorAll("[id*='CodeLabelLabel_']")) {
        let relationPanel = relationLabel.parentElement;
        let rankElement = relationPanel ? relationPanel.querySelector("[id*='RangParentLabel_']") : undefined;
        relations.push({
          type: relationLabel.textContent.replace(/\s+/g, " ").trim(),
          rank: rankElement ? rankElement.textContent.trim() : "",
        });
      }
      if (relations.length > 0) {
        mention.relations = relations;
      }
      mentions.push(mention);
    }
    if (mentions.length < 1) {
      return result;
    }
    result.mentions = mentions;
  } else if (pageType == "individual") {
    if (!document.querySelector("[id$='IndividuTable']")) {
      return result;
    }
    result.forenames = text(document, "[id$='IndividuListView_PrenomLabel_0']");
    result.lastName = text(document, "[id$='IndividuListView_NomLabel_0']");
    result.fatherForenames = text(document, "[id$='IndividuListView_PrenomPereLabel_0']");
    result.fatherLastName = text(document, "[id$='IndividuListView_NomPereLabel_0']");
    result.motherForenames = text(document, "[id$='IndividuListView_PrenomMereLabel_0']");
    result.motherLastName = text(document, "[id$='IndividuListView_NomMereLabel_0']");
    result.birthDate = text(document, "[id$='IndividuListView_DateNaissanceLabel_0']");
    result.birthPlace = text(document, "[id$='IndividuListView_LieuNaissanceLabel_0']");
    // The rows are like "Baptism : 20-Dec-1790 Lauzon (St-Joseph-de-la-Pointe-Lévy)"
    result.baptism = text(document, "[id$='IndividuListView_BaptemeTableRow_0']");
    result.deathDate = text(document, "[id$='IndividuListView_DateDecesLabel_0']");
    result.deathPlace = text(document, "[id$='IndividuListView_LieuDecesLabel_0']");
    result.death = text(document, "[id$='IndividuListView_DecesTableRow_0']");
    result.burial = text(document, "[id$='IndividuListView_SepultureTableRow_0']");

    let unions = [];
    for (let unionLink of document.querySelectorAll("a[id*='UnionsListView_UnionHyperLink_']")) {
      let index = unionLink.id.match(/_(\d+)$/)[1];
      let union = {};
      let unionPanel = unionLink.parentElement;
      union.marriageDate = text(unionPanel, "a.date");
      union.marriagePlace = text(unionPanel, "a.lieu");
      // e.g. "First marriage"
      union.marriage = unionLink.textContent.replace(/\s+/g, " ").trim();
      let unionHref = unionLink.getAttribute("href");
      let unionIdMatch = unionHref ? unionHref.match(/(\d+)$/) : undefined;
      if (unionIdMatch) {
        union.familyId = unionIdMatch[1];
      }
      union.spouseForenames = text(document, "[id$='UnionsListView_PrenomConjointLabel_" + index + "']");
      union.spouseLastName = text(document, "[id$='UnionsListView_NomConjointLabel_" + index + "']");
      union.spouseFatherForenames = text(document, "[id$='UnionsListView_PrenomPereConjointLabel_" + index + "']");
      union.spouseFatherLastName = text(document, "[id$='UnionsListView_NomPereConjointLabel_" + index + "']");
      union.spouseMotherForenames = text(document, "[id$='UnionsListView_PrenomMereConjointLabel_" + index + "']");
      union.spouseMotherLastName = text(document, "[id$='UnionsListView_NomMereConjointLabel_" + index + "']");
      unions.push(union);
    }
    if (unions.length > 0) {
      result.unions = unions;
    }
  } else if (pageType == "family") {
    if (!document.querySelector("[id$='FamilleTable']")) {
      return result;
    }
    let spouseLinks = document.querySelectorAll("a.nomConjoint");
    let spouseTexts = [...spouseLinks].map((link) => link.textContent.replace(/\s+/g, " ").trim());
    result.husband = spouseTexts[0] ? spouseTexts[0] : "";
    result.wife = spouseTexts[1] ? spouseTexts[1] : "";
    // e.g. "Father : Joseph DUCLOS Mother : Louise FORTIER Family"
    result.husbandParents = text(document, "[id$='FamilleListView_ParentsHommeTableRow_0']");
    result.wifeParents = text(document, "[id$='FamilleListView_ParentsFemmeTableRow_0']");
    // e.g. "Marriage : 29-Oct-1816"
    let marriageCell = document.querySelector("[id$='FamilleListView_MariageLabel_0']");
    if (marriageCell) {
      // e.g. "Marriage : 29-Oct-1816 Lauzon (St-Joseph-de-la-Pointe-Lévy)"
      result.marriageDate = text(marriageCell.parentElement, "a.date");
      result.marriagePlace = text(marriageCell.parentElement, "a.lieu");
    }

    let children = [];
    for (let row of document.querySelectorAll("tr[id*='EnfantsListView_ItemTemplateTr_']")) {
      let child = {};
      child.sexAndDates = text(row, "[id*='EnfantsListView_SexeEnfantLabel_']");
      let nameLink = row.querySelector("a[id*='EnfantsListView_PrenomEnfantHyperLink_']");
      if (nameLink) {
        child.forenames = nameLink.textContent.replace(/\s+/g, " ").trim();
      }
      children.push(child);
    }
    if (children.length > 0) {
      result.children = children;
    }
  } else {
    return result;
  }

  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
