import { Terminal } from 'xterm'
import { fit } from 'xterm/lib/addons/fit/fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { Ctrl, Cursor, Erase, Style } from './terminal-control'
import { emitEventTo1C } from '@/appFor1C/eventDispatcherTo1C'
import { ONE_TERMINAL_EVENT_START_COMMAND } from '@/appFor1C/eventNamesTo1C'

export interface OneTerminalOptions {
  path?: string
  separator?: string
}

export class OneTerminal {
  private terminal: Terminal
  private path: string = ''
  private separator: string = '$'
  private initilized: boolean = false

  private inputBuffer: string = ''
  private commandHistory: string[] = []
  private historyIndex: number = -1
  private cursorPosition: number = 0

  private commonCommands: string[] = []
  private localCommands: string[] = []

  private terminalCursorX: number = 0
  private terminalCursorY: number = 0

  private displayRowCount: number = 1
  private lastCursorRow: number = 0

  private isComposing: boolean = false

  private lastTabTime: number = 0

  constructor() {
    this.terminal = new Terminal({
      windowsMode: false,
      rightClickSelectsWord: true
    })

    this.terminal.attachCustomKeyEventHandler(() => false)

    this.terminal.loadAddon(
      new WebLinksAddon((event, url) => {
        event.preventDefault()
        console.log('link', url)
      })
    )

    this.terminal.onLineFeed(this.onLineFeed.bind(this))
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

    this.attachDirectInputHandlers()

    this.fit()
    this.terminal.focus()
    this.initilized = true

    this.prompt()
  }

  setPath(path: string) {
    this.path = path
    this.redrawInput()
  }

  setCommonCommands(commands: string[]) {
    this.commonCommands = commands
  }

  setLocalCommands(commands: string[]) {
    this.localCommands = commands
  }

  private attachDirectInputHandlers() {
    const textarea = this.terminal.textarea

    textarea.addEventListener('compositionstart', () => {
      this.isComposing = true
    })

    textarea.addEventListener('compositionend', () => {
      this.isComposing = false
    })

    textarea.addEventListener('keydown', (event: KeyboardEvent) => {
      if (this.handleKeydown(event)) {
        event.preventDefault()
      }
    })

    textarea.addEventListener('input', () => {
      if (this.isComposing) return
      const value = textarea.value
      if (value) {
        this.insertText(value)
        textarea.value = ''
      }
    })
  }

  private handleKeydown(event: KeyboardEvent): boolean {
    const key = event.key
    const keyCode = event.keyCode

    if (key === 'Enter' || keyCode === 13) {
      this.handleEnter()
      return true
    }
    if (key === 'ArrowLeft' || keyCode === 37) {
      this.handleArrowLeft()
      return true
    }
    if (key === 'ArrowRight' || keyCode === 39) {
      this.handleArrowRight()
      return true
    }
    if (key === 'ArrowUp' || keyCode === 38) {
      this.handleArrowUp()
      return true
    }
    if (key === 'ArrowDown' || keyCode === 40) {
      this.handleArrowDown()
      return true
    }
    if (key === 'Backspace' || keyCode === 8) {
      this.handleBackspace()
      return true
    }
    if (key === 'Delete' || keyCode === 46) {
      this.handleDelete()
      return true
    }
    if (key === 'Home' || keyCode === 36) {
      this.handleHome()
      return true
    }
    if (key === 'End' || keyCode === 35) {
      this.handleEnd()
      return true
    }
    if (key === 'Tab' || keyCode === 9) {
      this.handleTab()
      return true
    }
    if (key === 'Insert' || keyCode === 45 || key === 'PageUp' || keyCode === 33 || key === 'PageDown' || keyCode === 34) {
      return true
    }

    return false
  }

  fit() {
    fit(this.terminal)
  }

  prompt() {
    const promptText = this.getPromptText()
    this.terminal.write(Ctrl.CRLF + promptText)
    this.terminal.write(this.inputBuffer.replace(/\n/g, '\r\n'))
    this.displayRowCount = this.getDisplayRowCount()
    this.lastCursorRow = 0
  }

  private getPromptText(): string {
    return ' ' + Style.bold + Style.Fg.blue + this.path + Style.Fg.green + this.separator + Style.reset + Style.Fg.default_ + ' '
  }

  private getPromptLength(): number {
    return this.getPromptText().length
  }

  private getDisplayPosition(pos: number): { row: number; col: number } {
    const promptLength = this.getPromptLength()
    const cols = this.terminal.cols
    let row = 0
    let col = promptLength

    for (let i = 0; i < pos; i++) {
      if (this.inputBuffer[i] === '\n') {
        row++
        col = 0
      } else {
        col++
        if (col >= cols) {
          col = 0
          row++
        }
      }
    }

    return { row, col }
  }

  private getDisplayRowCount(): number {
    return this.getDisplayPosition(this.inputBuffer.length).row + 1
  }

  private redrawInput() {
    const promptText = this.getPromptText()

    if (this.lastCursorRow > 0) {
      this.terminal.write(Cursor.up(this.lastCursorRow))
    }
    this.terminal.write(Ctrl.CR)
    this.terminal.write(Erase.displayToEnd)

    this.terminal.write(promptText)
    this.terminal.write(this.inputBuffer.replace(/\n/g, '\r\n'))

    this.displayRowCount = this.getDisplayRowCount()
    this.moveCursorToCursorPos()
  }

  private moveCursorToCursorPos() {
    const endPos = this.getDisplayPosition(this.inputBuffer.length)
    const targetPos = this.getDisplayPosition(this.cursorPosition)

    this.lastCursorRow = targetPos.row

    if (endPos.row === targetPos.row && endPos.col === targetPos.col) {
      this.terminalCursorX = this.getPromptLength() + this.cursorPosition
      return
    }

    const rowDiff = endPos.row - targetPos.row
    if (rowDiff > 0) {
      this.terminal.write(Cursor.up(rowDiff))
    } else if (rowDiff < 0) {
      this.terminal.write(Cursor.down(-rowDiff))
    }

    const colDiff = targetPos.col - endPos.col
    if (colDiff < 0) {
      this.terminal.write(Ctrl.BS.repeat(-colDiff))
    } else if (colDiff > 0) {
      this.terminal.write(Cursor.forward(colDiff))
    }

    this.terminalCursorX = this.getPromptLength() + this.cursorPosition
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
    this.redrawInput()
  }

  insertText(text: string) {
    this.inputBuffer = this.inputBuffer.slice(0, this.cursorPosition) + text + this.inputBuffer.slice(this.cursorPosition)
    this.cursorPosition += text.length
    this.redrawInput()
  }

  clearInput() {
    this.setInput('')
  }

  private onCursorMove() {
    this.terminalCursorX = this.terminal.buffer.cursorX
    this.terminalCursorY = this.terminal.buffer.cursorY
  }

  private onTitleChange(title: string) {
    console.log('onTitleChange', title)
  }

  private onResize(ev: { cols: number; rows: number }) {}

  private handleArrowLeft() {
    if (this.cursorPosition > 0) {
      this.cursorPosition--
      this.redrawInput()
    }
  }

  private handleArrowRight() {
    if (this.cursorPosition < this.inputBuffer.length) {
      this.cursorPosition++
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

  private moveCursorToEnd() {
    const endPos = this.getDisplayPosition(this.inputBuffer.length)
    const curPos = this.getDisplayPosition(this.cursorPosition)
    const rowDiff = endPos.row - curPos.row
    if (rowDiff > 0) {
      this.terminal.write(Cursor.down(rowDiff))
    } else if (rowDiff < 0) {
      this.terminal.write(Cursor.up(-rowDiff))
    }
    const colDiff = endPos.col - curPos.col
    if (colDiff > 0) {
      this.terminal.write(Cursor.forward(colDiff))
    } else if (colDiff < 0) {
      this.terminal.write(Ctrl.BS.repeat(-colDiff))
    }
  }

  startOperation() {
    this.commandHistory.push(this.inputBuffer)
    this.historyIndex = -1

    this.moveCursorToEnd()
    let executeLocal: boolean = false
    if (this.inputBuffer.trim() === 'clear') {
      this.terminal.clear()
      executeLocal = true
    } else {
      emitEventTo1C(ONE_TERMINAL_EVENT_START_COMMAND, this.inputBuffer)
    }
    this.terminal.write(Ctrl.CRLF)

    this.inputBuffer = ''
    this.cursorPosition = 0
    if (executeLocal) {
      this.endOperation()
    }
  }

  endOperation(log?: string) {
    if (log) {
      this.terminal.write(log.replace(/\n/g, Ctrl.CRLF) + Ctrl.CRLF)
    }
    this.prompt()
  }

  private handleTab() {
    const now = Date.now()
    const isDoubleTab = now - this.lastTabTime < 500
    this.lastTabTime = now

    const allCommands = [...this.commonCommands, ...this.localCommands]
    if (allCommands.length === 0) return

    const spaceIndex = this.inputBuffer.indexOf(' ')
    if (spaceIndex !== -1) return

    const prefix = this.inputBuffer
    const matches = allCommands.filter(cmd => cmd.toLowerCase().startsWith(prefix.toLowerCase()))
    if (matches.length === 0) return

    if (isDoubleTab && matches.length > 1) {
      if (matches.length > 40) {
        this.terminal.write(Ctrl.CRLF + '(слишком много подобрано команд: ' + matches.length + ')' + Ctrl.CRLF)
      } else {
        this.terminal.write(Ctrl.CRLF + matches.join('  ') + Ctrl.CRLF)
      }
      this.inputBuffer = ''
      this.cursorPosition = 0
      this.prompt()
      return
    }

    if (matches.length === 1) {
      this.replaceFirstWord(matches[0])
      return
    }

    const lcp = this.longestCommonPrefix(matches)
    if (lcp && lcp !== prefix) {
      this.replaceFirstWord(lcp)
    }
  }

  private replaceFirstWord(newWord: string) {
    const spaceIndex = this.inputBuffer.indexOf(' ')
    const rest = spaceIndex === -1 ? '' : this.inputBuffer.slice(spaceIndex)
    this.inputBuffer = newWord + rest
    this.cursorPosition = this.inputBuffer.length
    this.redrawInput()
  }

  private longestCommonPrefix(strings: string[]): string {
    if (strings.length === 0) return ''
    let prefix = strings[0]
    for (let i = 1; i < strings.length; i++) {
      while (strings[i].indexOf(prefix) !== 0) {
        prefix = prefix.slice(0, -1)
        if (prefix === '') return ''
      }
    }
    return prefix
  }

  private handleEnter() {
    this.startOperation()
  }
  private onLineFeed() {
    console.log('onLineFeed')
  }
}
