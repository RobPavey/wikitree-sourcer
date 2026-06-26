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

// NOTE: Chrome does not support dynamic module import. But we want to keep the site details out
// of the core code as much as possible.
import * as ancestryContextModule from "../../../site/ancestry/core/ancestry_context.mjs";
import * as fgContextModule from "../../../site/fg/core/fg_context.mjs";
import * as fmpContextModule from "../../../site/fmp/core/fmp_context.mjs";
import * as fsContextModule from "../../../site/fs/core/fs_context.mjs";
import * as gensauContextModule from "../../../site/gensau/core/gensau_context.mjs";
import * as nswbdmContextModule from "../../../site/nswbdm/core/nswbdm_context.mjs";
import * as nzbdmContextModule from "../../../site/nzbdm/core/nzbdm_context.mjs";
import * as scotpContextModule from "../../../site/scotp/core/scotp_context.mjs";
import * as thegenContextModule from "../../../site/thegen/core/thegen_context.mjs";
import * as npContextModule from "../../../site/np/core/np_context.mjs";
import * as vicbdmContextModule from "../../../site/vicbdm/core/vicbdm_context.mjs";
import * as wikitreeContextModule from "../../../site/wikitree/core/wikitree_context.mjs";

let contextModules = {
  ancestry: ancestryContextModule,
  fg: fgContextModule,
  fmp: fmpContextModule,
  fs: fsContextModule,
  gensau: gensauContextModule,
  np: npContextModule,
  nswbdm: nswbdmContextModule,
  nzbdm: nzbdmContextModule,
  scotp: scotpContextModule,
  thegen: thegenContextModule,
  vicbdm: vicbdmContextModule,
  wikitree: wikitreeContextModule,
};

export { contextModules };
