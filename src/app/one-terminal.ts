/// <reference path="../../node_modules/xterm/typings/xterm.d.ts"/>

import { OneTerminal } from './OneTerminal'

window.terminal = new OneTerminal()
window.addEventListener('resize', () => window.terminal.fit())

function runFakeTerminal(): void {
  window.terminal.init({})
}
// createTerminal()
runFakeTerminal()
