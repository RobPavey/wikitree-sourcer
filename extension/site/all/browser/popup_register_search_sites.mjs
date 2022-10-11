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

// Currently the order that they are imported is the order that they appear in the menu
// We may have options at some point to control which items appear
import "/site/ancestry/browser/ancestry_popup_search.mjs";
import "/site/fmp/browser/fmp_popup_search.mjs";
import "/site/fs/browser/fs_popup_search.mjs";
import "/site/fg/browser/fg_popup_search.mjs";
import "/site/gro/browser/gro_popup_search.mjs";
import "/site/freebmd/browser/freebmd_popup_search.mjs";
import "/site/freecen/browser/freecen_popup_search.mjs";
import "/site/freereg/browser/freereg_popup_search.mjs";
import "/site/scotp/browser/scotp_popup_search.mjs";
import "/site/wikitree/browser/wikitree_popup_search.mjs";
import "/site/np/browser/np_popup_search.mjs"