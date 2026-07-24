import { Terminal } from 'xterm'
import { fit } from 'xterm/lib/addons/fit/fit'
import { WebLinksAddon } from 'xterm-addon-web-links'

export interface OneTerminalOptions {
  path?: string
  separator?: string
}

export class OneTerminal {
  private terminal: Terminal
  private path: string = ''
  private separator: string = '$'
  private initilized: boolean = false

  private dataDisabled: boolean = false

  constructor() {
    this.terminal = new Terminal({
      windowsMode: false,
      // convertEol: true,
      rightClickSelectsWord: true
      // disableStdin: true
    })
    this.path = ''

    this.terminal.loadAddon(
      new WebLinksAddon((event, url) => {
        event.preventDefault()
        console.log('link', url)
      })
    )

    this.terminal.onKey(this.onKey.bind(this))
    this.terminal.onLineFeed(this.onLineFeed.bind(this))
    this.terminal.onData(this.onData.bind(this))
    this.terminal.onResize(this.onResize.bind(this))
    this.terminal.onTitleChange(this.onTitleChange.bind(this))
    this.terminal.onCursorMove(this.onCursorMove.bind(this))
  }

  init(options: OneTerminalOptions) {
    if (this.initilized) {
      return
    }
    this.path = options.path || ''
    this.separator = options.separator || '$'

    this.terminal.open(document.getElementById('app') as HTMLElement)

    this.fit()
    this.terminal.focus()
    this.initilized = true

    this.prompt()
  }

  fit() {
    fit(this.terminal)
  }

  prompt() {
    this.terminal.write(`\r\n ${this.path}${this.separator} `)
  }

  write(data: string) {
    this.terminal.write(data)
  }

  clear() {
    this.terminal.clear()
    this.prompt()
  }

  private onData(data: string) {
    if (this.dataDisabled) {
      return
    }
    console.log('onData', data)
    this.terminal.write(data)
  }

  private onCursorMove() {
    console.log('onCursorMove')
  }

  private onTitleChange(title: string) {
    console.log('onTitleChange', title)
  }

  private onResize(ev: { cols: number; rows: number }) {}

  private onKey(e: { key: string; domEvent: KeyboardEvent }) {
    console.log('onKey', e)
    this.dataDisabled = true

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
      this.dataDisabled = false
      // window.terminal.write(e.key)
    }
  }
  private onLineFeed() {
    console.log('onLineFeed')
  }
}
