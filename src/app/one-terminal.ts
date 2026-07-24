/// <reference path="../../node_modules/xterm/typings/xterm.d.ts"/>

import { Terminal } from 'xterm'
import { OneTerminal } from './OneTerminal'
// import { AttachAddon } from 'xterm-addon-attach'
// import { SearchAddon, ISearchOptions } from 'xterm-addon-search'
// import { WebLinksAddon } from 'xterm-addon-web-links'

// import * as fit from '../lib/addons/fit/fit'

// Pulling in the module's types relies on the <reference> above, it's looks a
// little weird here as we're importing "this" module

// Terminal.applyAddon(fit)

window.terminal = new OneTerminal()

function runFakeTerminal(): void {
  window.terminal.init({})
}
// createTerminal()
runFakeTerminal()
