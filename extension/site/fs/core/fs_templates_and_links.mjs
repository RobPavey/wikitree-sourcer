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

import { CitationBuilder } from "../../../base/core/citation_builder.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { DataString } from "../../../base/core/data_string.mjs";

function extractIdFromFsUrl(url, prefixList, terminatorList) {
  // the recordUrl should look like:
  // https://www.familysearch.org/ark:/61903/1:1:XZDY-NHM

  if (url) {
    for (let prefix of prefixList) {
      let prefixIndex = url.indexOf(prefix);
      if (prefixIndex != -1) {
        let id = url.substring(prefixIndex + prefix.length);
        for (let terminator of terminatorList) {
          let terminatorIndex = id.indexOf(terminator);
          if (terminatorIndex != -1) {
            id = id.substring(0, terminatorIndex);
          }
        }
        return id;
      }
    }
  }

  return ""; // no prefix found
}

function buildFsRecordLinkOrTemplate(recordUrl) {
  if (!recordUrl) {
    return "";
  }

  // start with the old format link and then try to replace with template
  let recordLinkOrTemplate = "[" + recordUrl + " FamilySearch" + "]";

  // the recordUrl should look like:
  // https://www.familysearch.org/ark:/61903/1:1:XZDY-NHM
  let recordId = extractIdFromFsUrl(recordUrl, ["ark:/61903/1:1:"], ["/", "?"]);

  if (recordId.length > 5) {
    recordLinkOrTemplate = "{{FamilySearch Record|" + recordId + "}}";
  }

  return recordLinkOrTemplate;
}

function buildFsImageLinkOrTemplate(imageUrl) {
  if (!imageUrl) {
    return "";
  }

  // start with the old format link and then try to replace with template
  let imageLinkOrTemplate = "[" + imageUrl + " FamilySearch Image]";

  // the recordUrl should look like one of these:
  // https://www.familysearch.org/ark:/61903/3:1:33S7-9BSH-9W9B?i=7&cc=1473181
  // https://www.familysearch.org/ark:/61903/3:1:33S7-9P2P-9D2F?i=1179&cc=1307272&personaUrl=%2Fark%3A%2F61903%2F1%3A1%3AXZDY-NHM
  let imageId = extractIdFromFsUrl(imageUrl, ["ark:/61903/3:1:"], ["/", "?"]);

  if (imageId.length > 5) {
    imageLinkOrTemplate = "{{FamilySearch Image|" + imageId + "}}";
  } else {
    // There are also examples like: https://www.familysearch.org/ark:/61903/3:2:77T2-KFDJ
    imageId = extractIdFromFsUrl(imageUrl, ["ark:/61903/3:2:", "ark:/61903/3:3:", "ark:/61903/3:4:"], ["/", "?"]);
    if (imageId.length > 5) {
      let secondNumber = imageUrl.replace(/^.*ark:\/61903\/3:(\d):.*$/, "$1");
      if (secondNumber && secondNumber.length == 1) {
        imageLinkOrTemplate = "{{FamilySearch Image|" + imageId + "|" + secondNumber + "}}";
      }
    }
  }

  return imageLinkOrTemplate;
}

function buildExternalLinkOrTemplate(digitalArtifact) {
  if (digitalArtifact) {
    // Find A Grave example:   "digitalArtifact": "http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=30569834",
    let url = digitalArtifact;
    const idParam = "&GRid=";
    if (url.includes("//www.findagrave.com/cgi-bin") && url.includes(idParam)) {
      let paramIndex = url.indexOf(idParam);
      if (paramIndex != -1) {
        let nextParamIndex = url.indexOf("&", paramIndex + idParam.length);
        if (nextParamIndex == -1) {
          nextParamIndex = url.length;
        }

        let memorialId = url.substring(paramIndex + idParam.length, nextParamIndex);
        return "{{FindAGrave|" + memorialId + "}}";
      }
    } else {
      return url;
    }
  }
}

export { buildFsRecordLinkOrTemplate, buildFsImageLinkOrTemplate, buildExternalLinkOrTemplate };
