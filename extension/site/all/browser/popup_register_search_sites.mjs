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

// Importing each of these site modules causes them to register their search menu items

// We have options to control which search items appear in the menu and in which order
// so the order of imports here does not affect that - unless two sites have the same
// priority set, in that case the order of import would probably control their order
import "/site/ancestry/browser/ancestry_popup_search.mjs";
import "/site/bg/browser/bg_popup_search.mjs";
import "/site/cwgc/browser/cwgc_popup_search.mjs";
import "/site/fmp/browser/fmp_popup_search.mjs";
import "/site/fs/browser/fs_popup_search.mjs";
import "/site/fg/browser/fg_popup_search.mjs";
import "/site/gro/browser/gro_popup_search.mjs";
import "/site/freebmd/browser/freebmd_popup_search.mjs";
import "/site/freecen/browser/freecen_popup_search.mjs";
import "/site/freereg/browser/freereg_popup_search.mjs";
import "/site/geneteka/browser/geneteka_popup_search.mjs";
import "/site/irishg/browser/irishg_popup_search.mjs";
import "/site/naie/browser/naie_popup_search.mjs";
import "/site/np/browser/np_popup_search.mjs";
import "/site/ppnz/browser/ppnz_popup_search.mjs";
import "/site/scotp/browser/scotp_popup_search.mjs";
import "/site/trove/browser/trove_popup_search.mjs";
import "/site/wikitree/browser/wikitree_popup_search.mjs";
import "/site/nli/browser/nli_popup_search.mjs";
import "/site/psuk/browser/psuk_popup_search.mjs";
