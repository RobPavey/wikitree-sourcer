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

class EggsaGrvsCommon {
  static searchAreas = [
    { name: "Eastern Province", searchUrl: EggsaGrvsCommon.formUrl("graveseastcape", "ecsearchGraves") },
    { name: "Free State", searchUrl: EggsaGrvsCommon.formUrl("gravesfreestate", "fssearchGraves") },
    { name: "Gauteng", searchUrl: EggsaGrvsCommon.formUrl("gravesgauteng", "ggsearchGraves") },
    { name: "Kwazulu-Natal", searchUrl: EggsaGrvsCommon.formUrl("natalgraves", "kwasearchGraves") },
    { name: "Limpopo", searchUrl: EggsaGrvsCommon.formUrl("graveslimpopo", "limsearchGraves") },
    { name: "Mpumalanga", searchUrl: EggsaGrvsCommon.formUrl("gravesmpumalanga", "new_mpsearchGraves") },
    { name: "Northern Cape", searchUrl: EggsaGrvsCommon.formUrl("gravesnortherncape", "new_ncsearchGraves") },
    { name: "Northwest", searchUrl: EggsaGrvsCommon.formUrl("gravesnorthwest", "new_nwsearchGraves") },
    { name: "Western Cape", searchUrl: EggsaGrvsCommon.formUrl("graveswcape", "wcsearchGraves") },
    { name: "Worldwide", searchUrl: EggsaGrvsCommon.formUrl("gravesworld", "wosearchGraves") },
  ];

  static formUrl(urlStart, urlPart) {
    return `https://${urlStart}.eggsa.org/Search/${urlPart}.htm`;
  }
}
export { EggsaGrvsCommon };
