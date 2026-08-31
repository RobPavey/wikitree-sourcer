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

function transformLink(linkText, phase, options) {
  // http://missions.huntington.org/MarriageData.aspx?ID=6097
  // https://ecpp.ucr.edu/ecpp/app/user/view/records/marriage/6097

  // http://missions.huntington.org/BaptismalData.aspx?ID=84159
  // https://ecpp.ucr.edu/ecpp/app/user/view/records/baptismal/84159

  if (phase != 1) {
    return "";
  }

  if (/ecpp\.ucr\.edu/i.test(linkText)) {
    return linkText;
  }

  if (!/missions\.huntington\.org/i.test(linkText)) {
    return "";
  }

  // http://missions.huntington.org/MarriageData.aspx?ID=6097
  const fullOldUrlRegex = /^.*missions\.huntington\.org\/(\w+)Data\.aspx\?ID\=(\d+).*$/i;

  if (fullOldUrlRegex.test(linkText)) {
    let type = linkText.replace(fullOldUrlRegex, "$1");
    if (type && type != linkText) {
      type = type.trim();
      type = type.toLowerCase();

      let id = linkText.replace(fullOldUrlRegex, "$2");
      if (id && id != linkText) {
        id = id.trim();

        // https://ecpp.ucr.edu/ecpp/app/user/view/records/marriage/6097
        let link = `https://ecpp.ucr.edu/ecpp/app/user/view/records/${type}/${id}`;
        return link;
      }
    }
  } else {
    // could be a partial link
    let link = `https://ecpp.ucr.edu/`;
    return link;
  }

  return "";
}

export { transformLink };
