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

// We tried making these dynamic imports using the siteNames list.
// But dynamic imports throw an error when used from a service worker.
// The options are used in the background script - there is a "getOptions"
// message that can be sent to the background from a content script.

// Importing each of these site modules causes them to register their options
// The order of these lines does not matter since the options screen sorts them
// by label.
import "../../ameranc/core/ameranc_options.mjs";
import "../../ancestry/core/ancestry_options.mjs";
import "../../archion/core/archion_options.mjs";
import "../../archive/core/archive_options.mjs";
import "../../baclac/core/baclac_options.mjs";
import "../../bg/core/bg_options.mjs";
import "../../cwgc/core/cwgc_options.mjs";
import "../../eggsabdm/core/eggsabdm_options.mjs";
import "../../eggsagrvs/core/eggsagrvs_options.mjs";
import "../../fmp/core/fmp_options.mjs";
import "../../fs/core/fs_options.mjs";
import "../../fg/core/fg_options.mjs";
import "../../freebmd/core/freebmd_options.mjs";
import "../../freecen/core/freecen_options.mjs";
import "../../freereg/core/freereg_options.mjs";
import "../../geneteka/core/geneteka_options.mjs";
import "../../gro/core/gro_options.mjs";
import "../../gbooks/core/gbooks_options.mjs";
import "../../hathi/core/hathi_options.mjs";
import "../../irishg/core/irishg_options.mjs";
import "../../jstor/core/jstor_options.mjs";
import "../../matricula/core/matricula_options.mjs";
import "../../mh/core/mh_options.mjs";
import "../../naie/core/naie_options.mjs";
import "../../nli/core/nli_options.mjs";
import "../../noda/core/noda_options.mjs";
import "../../np/core/np_options.mjs";
import "../../npa/core/npa_options.mjs";
import "../../nsvr/core/nsvr_options.mjs";
import "../../nswbdm/core/nswbdm_options.mjs";
import "../../nzash/core/nzash_options.mjs";
import "../../nzbdm/core/nzbdm_options.mjs";
import "../../opccorn/core/opccorn_options.mjs";
import "../../openarch/core/openarch_options.mjs";
import "../../ppnz/core/ppnz_options.mjs";
import "../../psuk/core/psuk_options.mjs";
import "../../scotp/core/scotp_options.mjs";
import "../../taslib/core/taslib_options.mjs";
import "../../thegen/core/thegen_options.mjs";
import "../../trove/core/trove_options.mjs";
import "../../vicbdm/core/vicbdm_options.mjs";
import "../../wiewaswie/core/wiewaswie_options.mjs";
import "../../wikitree/core/wikitree_options.mjs";
import "../../wikipedia/core/wikipedia_options.mjs";
import "../../mdz/core/mdz_options.mjs";
import "../../basrhin/core/basrhin_options.mjs";
import "../../dfgviewer/core/dfgviewer_options.mjs";
import "../../arolsenarchives/core/arolsenarchives_options.mjs";
import "../../sosmogov/core/sosmogov_options.mjs";
