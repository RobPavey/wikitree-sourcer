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

  if (!url || !/^https?:\/\/collections\.archives\.govt\.nz\//i.test(url)) {
    return result;
  }

  const itemCodeMatch = url.match(/#\/(?:entity|item)\/aims-archive\/(R\d+)(?:\/|$)/i);
  const titleElement = document.querySelector("h1");
  if (!itemCodeMatch || !titleElement || !titleElement.textContent.trim()) {
    return result;
  }

  function readFields(container, excludedSection) {
    const fields = {};
    if (!container) {
      return fields;
    }

    for (const row of container.querySelectorAll(".arena-basic-info-field")) {
      if (excludedSection && excludedSection.contains(row)) {
        continue;
      }

      const labelElement = row.querySelector('.arena-field-label, [data-test-id="arena-field-label"]');
      const valueElement = row.querySelector('.arena-field-value, [data-test-id="arena-field-value"]');
      if (!labelElement || !valueElement) {
        continue;
      }

      const label = labelElement.textContent.replace(/:\s*$/, "").trim();
      const link = valueElement.querySelector("a.arena-field-link");
      const value = (link ? link.textContent : valueElement.textContent).trim();
      if (label && value) {
        fields[label] = value;
      }
      if (label === "View online" && link && link.href) {
        result.imageUrl = link.href;
      }
    }

    return fields;
  }

  const seriesHeading = [...document.querySelectorAll("h2")].find(
    (heading) => heading.textContent.trim().toLowerCase() === "series"
  );
  const seriesSection = seriesHeading ? seriesHeading.closest(".arena-basic-info-section") : null;
  const allFields = readFields(document, seriesSection);
  const seriesFields = readFields(seriesSection);

  result.title = titleElement.textContent.trim();
  result.code = itemCodeMatch[1].toUpperCase();
  result.itemFields = allFields;
  result.seriesFields = seriesFields;
  result.success = true;

  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
