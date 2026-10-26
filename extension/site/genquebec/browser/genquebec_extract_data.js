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

  function getText(element) {
    if (!element) {
      return "";
    }
    let clone = element.cloneNode(true);
    for (let child of clone.querySelectorAll("a, svg, script, style")) {
      child.remove();
    }
    return clone.textContent.replace(/\s+/g, " ").trim();
  }

  function addAdministrativeAreas(fields, text) {
    let areaRegex = /(?:^|\/)\s*(MRC|Région|Region|Arrondissement)\s*:\s*([^/]+)/gi;
    let match;
    while ((match = areaRegex.exec(text))) {
      fields[match[1]] = match[2].trim();
    }
  }

  function getPanelValue(panel, selector, labels) {
    let value = getText(panel.querySelector(selector));
    if (labels) {
      value = value.replace(labels, "");
    }
    return value.trim();
  }

  function formatMentionName(name) {
    let commaIndex = name.indexOf(",");
    return commaIndex < 0
      ? name
      : (name.slice(commaIndex + 1).trim() + " " + name.slice(0, commaIndex).trim()).trim();
  }

  let membershipHeader = document.querySelector("[id$='ActeListView_ctrl0_ActeHeaderPanel']");
  if (membershipHeader) {
    let type = getText(membershipHeader.querySelector("h1"));
    let recordIdMatch = document.title.match(/-\s*(\d+)(?:\s*-|$)/);
    if (!type || !recordIdMatch) {
      return result;
    }

    let normalizedType = type.toLowerCase();
    let indexType = normalizedType == "baptism" ? "Birth" : normalizedType == "burial" ? "Death" : type;
    result.pageType = "membership-lafrance";
    result.recordId = recordIdMatch[1];
    result.indexHeader = indexType + ", LaFrance";

    let parish = getText(membershipHeader.querySelector("a.paroisse"));
    let administrativeAreas = [
      getText(membershipHeader.querySelector("[id$='ArrondissementPanel']")),
      getText(membershipHeader.querySelector("[id$='MrcPanel']")),
    ].join(" / ");
    let location = parish;

    let headerDate = getText(membershipHeader.querySelector("[id$='DatePanel']"));
    let eventDateText = getText(membershipHeader.querySelector("[id$='DateEvenementPanel']"));
    let eventDate = eventDateText.replace(/^.*?:\s*/, "");
    let imageLink = membershipHeader.querySelector("[id$='ImageHyperLink']");
    let fields = {};
    addAdministrativeAreas(fields, administrativeAreas);
    let mentions = [];
    for (let panel of document.querySelectorAll("div[id*='ListViewMentions_ctrl'][id$='_MentionPanel']")) {
      let role = getText(panel.querySelector("[id$='_RolePanel'] span.role"));
      let name = getText(panel.querySelector(".mention .nom"));
      if (!role || !name) {
        if (!name) {
          continue;
        }
      }
      let mention = { role: role.toLowerCase(), name: name };
      for (let [key, selector] of [
        ["age", "[id$='_AgePanel'] strong"],
        ["sex", "[id$='_SexePanel'] strong"],
        ["civilStatus", "[id$='_EtatCivilPanel'] strong"],
      ]) {
        let valueElement = panel.querySelector(selector);
        let value = valueElement ? getText(valueElement) : "";
        if (value && value != role && value != name) {
          mention[key] = value;
        }
      }
      for (let [key, selector, labelPattern] of [
        ["occupation", "[id$='_ProfessionPanel']", /^(Occupation|Profession)\s*:\s*/i],
        ["residence", "[id$='_ResidencePanel']", /^Residence\s*:\s*/i],
        ["origin", "[id$='_OriginePanel']", /^Origin\s*:\s*/i],
        ["status", "[id$='_DecesPanel']", /^death\s*/i],
      ]) {
        let value = getPanelValue(panel, selector, labelPattern);
        if (value) {
          mention[key] = value;
        }
      }
      mentions.push(mention);
    }

    if (normalizedType == "marriage") {
      let subjects = mentions.filter((mention) => mention.role == "subject");
      if (subjects[0]) {
        fields.Husband = subjects[0].name;
        fields["Husband's age"] = subjects[0].age || "";
        fields["Husband's civil status"] = subjects[0].civilStatus || "";
        fields["Husband's occupation"] = subjects[0].occupation || "";
        fields["Husband's residence"] = subjects[0].residence || "";
        fields["Husband's origin"] = subjects[0].origin || "";
      }
      if (subjects[1]) {
        fields.Wife = subjects[1].name;
        fields["Wife's age"] = subjects[1].age || "";
        fields["Wife's civil status"] = subjects[1].civilStatus || "";
        fields["Wife's occupation"] = subjects[1].occupation || "";
        fields["Wife's residence"] = subjects[1].residence || "";
        fields["Wife's origin"] = subjects[1].origin || "";
      }
      fields["Marriage date"] = headerDate;
      fields["Marriage location"] = location;
      let otherIndividuals = [];
      for (let mention of mentions) {
        let roleMatch = mention.role.match(/^(father|mother) of the (groom|bride)$/);
        if (roleMatch) {
          let partner = roleMatch[2] == "groom" ? "Husband" : "Wife";
          let parent = roleMatch[1] == "father" ? "father" : "mother";
          fields[partner + "'s " + parent] = mention.name;
          if (mention.occupation) {
            fields[partner + "'s " + parent + "'s occupation"] = mention.occupation;
          }
          if (mention.residence) {
            fields[partner + "'s " + parent + "'s residence"] = mention.residence;
          }
          if (mention.status) {
            fields[partner + "'s " + parent + "'s status"] = mention.status;
          }
        } else if (mention.role != "subject") {
          otherIndividuals.push(formatMentionName(mention.name));
          for (let key of ["occupation", "residence", "origin", "status"]) {
            if (mention[key]) {
              fields[formatMentionName(mention.name) + "'s " + key] = mention[key];
            }
          }
        }
      }
      if (otherIndividuals.length > 0) {
        fields["Other individuals listed"] = otherIndividuals.join(", ");
      }
    } else {
      let subject = mentions.find((mention) => mention.role == "subject");
      if (subject) {
        fields.Name = subject.name;
        fields.Gender = /^f/i.test(subject.sex || "") ? "female" : /^m/i.test(subject.sex || "") ? "male" : "";
        fields.Age = subject.age || "";
        for (let [key, label] of [
          ["occupation", "Occupation"],
          ["residence", "Residence"],
          ["origin", "Origin"],
          ["status", "Status"],
        ]) {
          if (subject[key]) {
            fields[label] = subject[key];
          }
        }
      }
      let father = mentions.find((mention) => mention.role == "father");
      let mother = mentions.find((mention) => mention.role == "mother");
      if (father) {
        fields.Father = father.name;
        if (father.occupation) {
          fields["Father's occupation"] = father.occupation;
        }
      }
      if (mother) {
        fields.Mother = mother.name;
        if (mother.occupation) {
          fields["Mother's occupation"] = mother.occupation;
        }
      }
      let otherIndividuals = [];
      for (let mention of mentions) {
        if (["subject", "father", "mother"].includes(mention.role)) {
          continue;
        }
        otherIndividuals.push(formatMentionName(mention.name));
        if (mention.role) {
          fields[formatMentionName(mention.name) + "'s role"] = mention.role;
        }
        for (let key of ["occupation", "residence", "origin", "status"]) {
          if (mention[key]) {
            fields[formatMentionName(mention.name) + "'s " + key] = mention[key];
          }
        }
      }
      if (otherIndividuals.length > 0) {
        fields["Other individuals listed"] = otherIndividuals.join(", ");
      }

      if (normalizedType == "baptism") {
        fields["Baptism date"] = headerDate;
        fields["Baptism location"] = location;
        fields["Birth date"] = eventDate;
      } else {
        fields["Burial date"] = headerDate;
        fields["Burial location"] = location;
        fields["Death date"] = eventDate;
      }
    }

    let complementaryInfo = [...document.querySelectorAll("[id*='ActeCommentaireListView'] li")].map(getText);
    if (complementaryInfo.length == 0) {
      let infoElement = Array.from(document.querySelectorAll("[id], [class]")).find((element) =>
        /complementary|compl[eé]ment/i.test(element.id + " " + element.className)
      );
      if (infoElement) {
        complementaryInfo.push(getText(infoElement).replace(/^Complementary information\s*:?\s*/i, ""));
      }
    }
    let info = complementaryInfo.filter(Boolean).join("; ");
    if (info) {
      fields["Complementary information"] = info;
    }

    result.recordData = fields;
    result.heading = mentions
      .filter((mention) => mention.role == "subject")
      .map((mention) => mention.name)
      .join(" and ");
    result.originalSource = "Drouin Institute, LAFRANCE";
    if (imageLink) {
      result.imageUrl = imageLink.getAttribute("href");
    }
    result.success = true;
    return result;
  }

  const rows = document.querySelectorAll(".detailed-result-row");
  if (rows.length < 1) {
    return result;
  }

  // The details are a list of label/value rows, the label depends on the type of record
  let fields = {};
  let prdhIndividualIds = {};
  for (let row of rows) {
    let labelElement = row.querySelector(".detailed-result-row-left");
    let valueElement = row.querySelector(".detailed-result-row-right");
    if (!labelElement || !valueElement) {
      continue;
    }
    let label = getText(labelElement);
    let value = getText(valueElement);
    if (label == "Other individuals listed") {
      value = value
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .join(", ");
    }
    if (label && value) {
      fields[label] = value;
    }

    let prdhLink = valueElement.querySelector("a[href*='prdh-igd.com']");
    if (label && prdhLink) {
      let match = prdhLink.getAttribute("href").match(/\/Individu\/(\d+)/i);
      if (match) {
        prdhIndividualIds[label] = match[1];
      }
    }
  }
  result.recordData = fields;
  if (Object.keys(prdhIndividualIds).length > 0) {
    result.prdhIndividualIds = prdhIndividualIds;
  }

  let canonicalElement = document.querySelector("link[rel='canonical']");
  if (canonicalElement && canonicalElement.getAttribute("href")) {
    result.url = canonicalElement.getAttribute("href");
  }

  let headingElement = document.querySelector(".details-page-header h1");
  if (headingElement) {
    result.heading = getText(headingElement);
  }

  // e.g. "Death, LaFrance"
  let indexElement = document.querySelector("[id$='indexHeader']");
  if (indexElement) {
    result.indexHeader = getText(indexElement);
  }

  let sourceElement = document.querySelector(".source-texte-bottom, [id$='sourceTexteBottom']");
  if (sourceElement) {
    let lines = sourceElement.innerHTML.split(/<br\s*\/?>/i).map((line) => line.replace(/<[^>]*>/g, "").trim());
    let index = lines.findIndex((line) => line == "Original source");
    if (index != -1 && lines[index + 1]) {
      result.originalSource = lines[index + 1];
    }
  }

  let originalDocumentLink = document.querySelector("a[href*='/Membership/LAFRANCE/img/acte/']");
  if (originalDocumentLink) {
    result.imageUrl = originalDocumentLink.getAttribute("href");
  }

  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
