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

  private inputBuffer: string = ''
  private commandHistory: string[] = []
  private historyIndex: number = -1
  private cursorPosition: number = 0
  private isMultiline: boolean = false

  private terminalCursorX: number = 0
  private terminalCursorY: number = 0

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
    const promptText = ` ${this.path}${this.separator} `
    this.terminal.write(`\r\n${promptText}${this.inputBuffer}`)
  }

  private redrawInput() {
    this.terminal.write(`\r${' '.repeat(this.terminal.cols)}\r`)
    this.terminal.write(` ${this.path}${this.separator} ${this.inputBuffer}`)
    this.terminalCursorX = ` ${this.path}${this.separator} `.length + this.inputBuffer.length
    this.moveCursorToCursorPos()
  }

  private moveCursorToCursorPos() {
    const promptLength = ` ${this.path}${this.separator} `.length
    const targetX = promptLength + this.cursorPosition
    const diff = targetX - this.terminalCursorX
    if (diff > 0) {
      this.terminal.write(' '.repeat(diff))
      this.terminalCursorX = targetX
    } else if (diff < 0) {
      this.terminal.write('\b'.repeat(-diff))
      this.terminalCursorX = targetX
    }
  }

  private moveCursorToPosition(position: number) {
    const promptLength = ` ${this.path}${this.separator} `.length
    const currentX = this.terminal.buffer.cursorX
    const targetX = promptLength + position
    const diff = targetX - currentX
    if (diff > 0) {
      this.terminal.write(' '.repeat(diff))
    } else if (diff < 0) {
      this.terminal.write('\b'.repeat(-diff))
    }
  }

  write(data: string) {
    this.terminal.write(data)
  }

  clear() {
    this.terminal.clear()
    this.inputBuffer = ''
    this.cursorPosition = 0
    this.prompt()
  }

  setInput(input: string) {
    this.inputBuffer = input
    this.cursorPosition = input.length
    this.terminalCursorX = ` ${this.path}${this.separator} `.length + input.length
    this.redrawInput()
  }

  insertText(text: string) {
    this.inputBuffer = this.inputBuffer.slice(0, this.cursorPosition) + text + this.inputBuffer.slice(this.cursorPosition)
    this.cursorPosition += text.length
    this.redrawInput()
  }

  clearInput() {
    this.inputBuffer = ''
    this.cursorPosition = 0
    this.terminalCursorX = ` ${this.path}${this.separator} `.length
    this.redrawInput()
  }

  private onData(data: string) {
    if (this.dataDisabled) {
      return
    }
    console.log('onData', data)
    this.terminal.write(data)
  }

  private onCursorMove() {
    this.terminalCursorX = this.terminal.buffer.cursorX
    this.terminalCursorY = this.terminal.buffer.cursorY
  }

  private onTitleChange(title: string) {
    console.log('onTitleChange', title)
  }

  private onResize(ev: { cols: number; rows: number }) {}

  private onKey(e: { key: string; domEvent: KeyboardEvent }) {
    this.dataDisabled = true

    const ev = e.domEvent as KeyboardEvent
    const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey

    const key = ev.key

    if (key === 'Enter') {
      this.handleEnter()
    } else if (key === 'ArrowLeft') {
      this.handleArrowLeft()
    } else if (key === 'ArrowRight') {
      this.handleArrowRight()
    } else if (key === 'ArrowUp') {
      this.handleArrowUp()
    } else if (key === 'ArrowDown') {
      this.handleArrowDown()
    } else if (key === 'Backspace') {
      this.handleBackspace()
    } else if (key === 'Delete') {
      this.handleDelete()
    } else if (key === 'Tab' || key === 'Insert' || key === 'PageUp' || key === 'PageDown') {
    } else if (key === 'Home') {
      this.handleHome()
    } else if (key === 'End') {
      this.handleEnd()
    } else if (printable) {
      this.handleCharacterInput(e.key)
    }
  }

  private handleCharacterInput(char: string) {
    this.inputBuffer = this.inputBuffer.slice(0, this.cursorPosition) + char + this.inputBuffer.slice(this.cursorPosition)
    this.cursorPosition++
    this.redrawInput()
  }

  private handleArrowLeft() {
    if (this.cursorPosition > 0) {
      this.cursorPosition--
      this.terminalCursorX--
      this.redrawInput()
    }
  }

  private handleArrowRight() {
    if (this.cursorPosition < this.inputBuffer.length) {
      this.cursorPosition++
      this.terminalCursorX++
      this.redrawInput()
    }
  }

  private handleArrowUp() {
    if (this.commandHistory.length > 0) {
      if (this.historyIndex === -1) {
        this.historyIndex = this.commandHistory.length - 1
      } else if (this.historyIndex > 0) {
        this.historyIndex--
      }
      this.inputBuffer = this.commandHistory[this.historyIndex]
      this.cursorPosition = this.inputBuffer.length
      this.redrawInput()
    }
  }

  private handleArrowDown() {
    if (this.commandHistory.length > 0 && this.historyIndex >= 0) {
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++
        this.inputBuffer = this.commandHistory[this.historyIndex]
        this.cursorPosition = this.inputBuffer.length
        this.redrawInput()
      } else {
        this.historyIndex = -1
        this.inputBuffer = ''
        this.cursorPosition = 0
        this.redrawInput()
      }
    }
  }

  private handleBackspace() {
    if (this.cursorPosition > 0) {
      this.inputBuffer = this.inputBuffer.slice(0, this.cursorPosition - 1) + this.inputBuffer.slice(this.cursorPosition)
      this.cursorPosition--
      this.terminalCursorX--
      this.redrawInput()
    }
  }

  private handleDelete() {
    if (this.cursorPosition < this.inputBuffer.length) {
      this.inputBuffer = this.inputBuffer.slice(0, this.cursorPosition) + this.inputBuffer.slice(this.cursorPosition + 1)
      this.redrawInput()
    }
  }

  private handleHome() {
    this.cursorPosition = 0
    this.redrawInput()
  }

  private handleEnd() {
    this.cursorPosition = this.inputBuffer.length
    this.redrawInput()
  }

  private handleEnter() {
    this.commandHistory.push(this.inputBuffer)
    this.historyIndex = -1
    this.terminal.write('\r\n')
    this.inputBuffer = ''
    this.cursorPosition = 0
    this.prompt()
  }
  private onLineFeed() {
    console.log('onLineFeed')
  }
}
