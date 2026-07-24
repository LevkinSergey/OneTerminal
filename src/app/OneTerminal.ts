import { Terminal } from 'xterm'

export interface OneTerminalOptions {}

export class OneTerminal {
  private terminal: Terminal
  private path: string = ''
  private separator: string = '$'
  private initilized: boolean = false

  constructor() {
    this.terminal = new Terminal({
      convertEol: true,
      rightClickSelectsWord: true
      // disableStdin: true
    })
    this.path = ''
  }

  init(options: OneTerminalOptions) {
    if (this.initilized) {
      return
    }

    this.terminal.open(document.getElementById('app') as HTMLElement)
    this.terminal.onKey(this.onKey.bind(this))
    this.terminal.onLineFeed(this.onLineFeed.bind(this))
    this.terminal.onData(this.onData.bind(this))
    this.terminal.onResize(this.onResize.bind(this))
    this.terminal.onTitleChange(this.onTitleChange.bind(this))
    this.terminal.onCursorMove(this.onCursorMove.bind(this))

    this.terminal.focus()
    this.initilized = true
  }

  prompt() {
    this.terminal.write('\r\n типо папка:$ ')
  }

  write(data: string) {
    this.terminal.write(data)
  }

  clear() {
    this.terminal.clear()
    this.prompt()
  }

  private onData(data: string) {
    console.log('onData', data)
  }

  private onCursorMove() {
    console.log('onCursorMove')
  }

  private onTitleChange(title: string) {
    console.log('onTitleChange', title)
  }

  private onResize(ev: { cols: number; rows: number }) {
    console.log('onResize', ev)
  }

  private onKey(e: { key: string; domEvent: KeyboardEvent }) {
    console.log('onKey', e)

    const ev = e.domEvent as KeyboardEvent
    const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey

    const key = ev.key
    if (key === 'Enter') {
      setTimeout(() => {
        window.terminal.prompt()
      }, 2000)
    } else if (key === 'ArrowUp') {
    } else if (key === 'ArrowDown') {
    } else if (printable) {
      window.terminal.write(e.key)
    }
  }
  private onLineFeed() {
    console.log('onLineFeed')
  }
}
