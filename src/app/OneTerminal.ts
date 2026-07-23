import { Terminal } from 'xterm'

export class OneTerminal {
  private terminal: Terminal

  constructor() {
    this.terminal = new Terminal({
      convertEol: true,
      rightClickSelectsWord: true
      // disableStdin: true
    })
  }
}
