/// <reference path="../../node_modules/xterm/typings/xterm.d.ts"/>

import { Terminal } from 'xterm'
// import { AttachAddon } from 'xterm-addon-attach'
// import { SearchAddon, ISearchOptions } from 'xterm-addon-search'
// import { WebLinksAddon } from 'xterm-addon-web-links'

// import * as fit from '../lib/addons/fit/fit'

// Pulling in the module's types relies on the <reference> above, it's looks a
// little weird here as we're importing "this" module

// Terminal.applyAddon(fit)



window.terminal = new Terminal({
  convertEol: true,
  rightClickSelectsWord: true
  // disableStdin: true
})
window.terminal.open(document.getElementById('app') as HTMLElement)
window.terminal.focus()
let term: Terminal
// let searchAddon: SearchAddon
let protocol
// let socketURL
// let socket
// let pid

// const terminalContainer = document.getElementById('app')

function createTerminal(): void {
  // Clean terminal
  // while (terminalContainer?.children.length) {
  //   terminalContainer.removeChild(terminalContainer.children[0])
  // }

  // const isWindows = ['Windows', 'Win16', 'Win32', 'WinCE'].indexOf(navigator.platform) >= 0
  // term = new Terminal({
  //   windowsMode: isWindows
  // } as ITerminalOptions)

  // // Load addons
  // const typedTerm = term as TerminalType
  // typedTerm.loadAddon(new WebLinksAddon())
  // searchAddon = new SearchAddon()
  // typedTerm.loadAddon(searchAddon)

  // window.term = term // Expose `term` to window for debugging purposes
  // term.onResize((size: { cols: number; rows: number }) => {
  //   if (!pid) {
  //     return
  //   }
  //   const cols = size.cols
  //   const rows = size.rows
  //   const url = '/terminals/' + pid + '/size?cols=' + cols + '&rows=' + rows

  //   fetch(url, { method: 'POST' })
  // })
  // protocol = location.protocol === 'https:' ? 'wss://' : 'ws://'
  // socketURL = protocol + location.hostname + (location.port ? ':' + location.port : '') + '/terminals/'

  term.open(terminalContainer as HTMLElement)
  // term.fit()
  term.focus()

  // addDomListener(paddingElement, 'change', setPadding)

  // addDomListener(actionElements.findNext, 'keyup', e => {
  //   const searchOptions = getSearchOptions()
  //   searchOptions.incremental = e.key !== `Enter`
  //   searchAddon.findNext(actionElements.findNext.value, searchOptions)
  // })

  // addDomListener(actionElements.findPrevious, 'keyup', e => {
  //   if (e.key === `Enter`) {
  //     searchAddon.findPrevious(actionElements.findPrevious.value, getSearchOptions())
  //   }
  // })

  // fit is called within a setTimeout, cols and rows need this.
  // setTimeout(() => {
  //   // initOptions(term)
  //   // TODO: Clean this up, opt-cols/rows doesn't exist anymore
  //   // ;(<HTMLInputElement>document.getElementById(`opt-cols`)).value = term.cols
  //   // ;(<HTMLInputElement>document.getElementById(`opt-rows`)).value = term.rows
  //   // paddingElement.value = '0'
  //   // Set terminal size again to set the specific dimensions on the demo
  //   // updateTerminalSize()
  //   //   fetch('/terminals?cols=' + term.cols + '&rows=' + term.rows, { method: 'POST' }).then(res => {
  //   //     res.text().then(processId => {
  //   //       pid = processId
  //   //       socketURL += processId
  //   //       socket = new WebSocket(socketURL)
  //   //       socket.onopen = runRealTerminal
  //   //       socket.onclose = runFakeTerminal
  //   //       socket.onerror = runFakeTerminal
  //   //     })
  //   //   })
  // }, 0)
}

const prompt = () => {
  window.terminal.write('\r\n типо папка:$ ')
}

function runFakeTerminal(): void {
  if (!window.terminal) {
    return
  }

  window.terminal.writeln('Welcome to xterm.js')
  window.terminal.writeln('This is a local terminal emulation, without a real terminal in the back-end.')
  window.terminal.writeln('Type some keys and commands to play around.')
  window.terminal.writeln('')
  prompt()

  window.terminal.onKey((e: { key: string; domEvent: KeyboardEvent }) => {
    const ev = e.domEvent as KeyboardEvent
    const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey

    const key = ev.key
    if (key === 'Enter') {
      setTimeout(() => {
        prompt()
      }, 2000)
    } else if (key === 'ArrowUp') {
    } else if (key === 'ArrowDown') {
    } else if (printable) {
      window.terminal.write(e.key)
    }
  })

  window.terminal.onCursorMove(e => {
    console.log(e)
    console.log(window.terminal)
  })

  window.terminal.onLineFeed(data => {
    console.log('onLineFeed', data)
  })

  window.terminal.registerCharacterJoiner(data => {
    console.log('registerCharacterJoiner', data)
    return []
  })
}
// createTerminal()
runFakeTerminal()
