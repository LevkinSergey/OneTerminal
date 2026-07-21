import { Terminal } from '@xterm/xterm'
import { emitEventTo1C } from '../appFor1C/eventDispatcherTo1C'
import { TERMINAL_COMMAND_EXECUTED } from '../appFor1C/eventNames'

export interface CommandExecuteInfo {
  name: string
  description: string
  args: string[]
  fullText: string
  timestamp: number
  details?: string
}

export interface CommandConfig {
  description: string
  details?: string
  onExecute: (info: CommandExecuteInfo) => void
}

export class OneTerminal {
  private terminal: Terminal
  private command: string = ''
  private commands: Record<string, CommandConfig> = {}
  private history: string[] = []
  private historyIndex: number = -1
  private savedCommand: string = ''
  private readonly maxHistory: number = 100
  private isReadOnly: boolean = false
  private cursorPosition: number = 0
  private currentDir: string = '/home/user'
  private readonly maxPathLength: number = 50

  constructor() {
    this.terminal = new Terminal({
      cursorBlink: true,
      allowProposedApi: true,
      convertEol: true,
      cursorStyle: 'underline',
      cursorInactiveStyle: 'outline',
      disableStdin: true
    })

    this.commands = {
      help: {
        description: 'Prints this help message',
        onExecute: () => {
          const padding = 10
          const formatMessage = (name: string, description: string) => {
            const maxLength = this.terminal.cols - padding - 3
            let remaining = description
            const d = []
            while (remaining.length > 0) {
              remaining = remaining.trimStart()
              if (remaining.length < maxLength) {
                d.push(remaining)
                remaining = ''
              } else {
                let splitIndex = -1
                if (remaining[maxLength] === ' ') {
                  splitIndex = maxLength
                } else {
                  for (let i = maxLength - 1; i >= 0; i--) {
                    if (remaining[i] === ' ') {
                      splitIndex = i
                      break
                    }
                  }
                }
                d.push(remaining.substring(0, splitIndex))
                remaining = remaining.substring(splitIndex)
              }
            }
            return `  \x1b[36;1m${name.padEnd(padding)}\x1b[0m ${d[0]}` + d.slice(1).map(e => `\r\n  ${' '.repeat(padding)} ${e}`)
          }
          this.terminal.writeln(['Welcome to xterm.js! Try some of the commands below.', '', ...Object.keys(this.commands).map(e => formatMessage(e, this.commands[e].description))].join('\n\r'))
          this.prompt()
        }
      },
      ls: {
        description: 'Prints a fake directory structure',
        onExecute: () => {
          this.terminal.writeln(['a', 'bunch', 'of', 'fake', 'files'].join('\r\n'))
          this.prompt()
        }
      },
      clear: {
        description: 'Clears the terminal screen',
        onExecute: () => {
          this.terminal.clear()
          this.prompt()
        }
      },
      blure: {
        description: 'Blurs the terminal screen',
        onExecute: () => {
          this.isReadOnly = true
          this.prompt()
        }
      },
       cd: {
        description: 'Change the working directory',
        onExecute: info => {
          const dir = info.args[0] || '~'
          if (dir === '~') {
            this.currentDir = '/home/user'
          } else {
            this.currentDir = dir.startsWith('/') ? dir : `${this.currentDir}/${dir}`
          }
          this.terminal.writeln(`Changed to ${this.currentDir}`)
          this.prompt()
        }
      },
      echo: {
        description: 'Display a line of text',
        onExecute: info => {
          console.log(info)
          this.terminal.writeln(info.args.join(' '))
          this.prompt()
        }
      },
       pwd: {
        description: 'Print name of current/working directory',
        onExecute: () => {
          this.terminal.writeln(this.currentDir)
          this.prompt()
        }
      },
      date: {
        description: 'Print or set the system date and time',
        onExecute: () => {
          this.terminal.writeln(new Date().toString())
          this.prompt()
        }
      },
      whoami: {
        description: 'Print effective userid',
        onExecute: () => {
          this.terminal.writeln('user')
          this.prompt()
        }
      },
      env: {
        description: 'Print environment',
        onExecute: () => {
          this.terminal.writeln(['PATH=/usr/local/bin', 'HOME=/home/user', 'USER=user'].join('\r\n'))
          this.prompt()
        }
      }
    }
  }

  registerCommand(name: string, config: CommandConfig): void {
    this.commands[name] = config
  }

  getCommands(): Record<string, CommandConfig> {
    return { ...this.commands }
  }

  init(element: HTMLElement) {
    this.terminal.open(element)

    this.terminal.onKey(({ key, domEvent }) => {
      if (this.isReadOnly) {
        return
      }
      const { cursorX } = this.terminal.buffer.active

      switch (domEvent.key) {
        case 'ArrowUp':
          domEvent.preventDefault()
          if (this.history.length === 0) return
          if (this.historyIndex === -1) {
            this.savedCommand = this.command
            this.historyIndex = this.history.length - 1
          } else if (this.historyIndex > 0) {
            this.historyIndex--
          } else {
            return
          }
          this.setCommandFromHistory()
          break

        case 'ArrowDown':
          domEvent.preventDefault()
          if (this.historyIndex === -1) return
          if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++
            this.setCommandFromHistory()
          } else {
            this.historyIndex = -1
            this.command = this.savedCommand
            this.redrawInput()
          }
          break

        case 'Enter':
          this.runCommand(this.command)
          this.command = ''
          this.historyIndex = -1
          this.cursorPosition = 0
          break

        case 'Backspace':
          if (cursorX > 2) {
            this.terminal.write('\b \b')
            this.command = this.command.slice(0, -1)
            this.cursorPosition = Math.max(0, this.cursorPosition - 1)
          }
          break

        case 'ArrowLeft':
          domEvent.preventDefault()
          if (this.cursorPosition > 0) {
            this.terminal.write('\x1b[D')
            this.cursorPosition--
          }
          break

        case 'ArrowRight':
          domEvent.preventDefault()
          if (this.cursorPosition < this.command.length) {
            this.terminal.write('\x1b[C')
            this.cursorPosition++
          }
          break

        case 'Home':
          domEvent.preventDefault()
          while (this.cursorPosition > 0) {
            this.terminal.write('\x1b[D')
            this.cursorPosition--
          }
          break

        case 'End':
          domEvent.preventDefault()
          while (this.cursorPosition < this.command.length) {
            this.terminal.write('\x1b[C')
            this.cursorPosition++
          }
          break

        case 'Delete':
          domEvent.preventDefault()
          if (this.cursorPosition < this.command.length) {
            this.command = this.command.slice(0, this.cursorPosition) + this.command.slice(this.cursorPosition + 1)
            this.redrawInput()
          }
          break

        case 'Tab':
          domEvent.preventDefault()
          this.autocompleteCommand()
          break

        default:
          if (key.length === 1) {
            if (domEvent.ctrlKey && key === 'c') {
              this.terminal.write('^C')
              this.command = ''
              this.historyIndex = -1
              this.cursorPosition = 0
              this.prompt()
            } else if (domEvent.ctrlKey && key === 'a') {
              domEvent.preventDefault()
              while (this.cursorPosition > 0) {
                this.terminal.write('\x1b[D')
                this.cursorPosition--
              }
            } else if (domEvent.ctrlKey && key === 'e') {
              domEvent.preventDefault()
              while (this.cursorPosition < this.command.length) {
                this.terminal.write('\x1b[C')
                this.cursorPosition++
              }
            } else if (domEvent.ctrlKey && key === 'u') {
              domEvent.preventDefault()
              this.command = ''
              this.cursorPosition = 0
              this.redrawInput()
            } else if (domEvent.ctrlKey && key === 'k') {
              domEvent.preventDefault()
              this.command = this.command.slice(0, this.cursorPosition)
              this.cursorPosition = this.command.length
              this.redrawInput()
            } else if (domEvent.ctrlKey && key === 'v') {
              this.handlePaste()
            } else if (!domEvent.ctrlKey && !domEvent.altKey && !domEvent.metaKey) {
              this.command = this.command.slice(0, this.cursorPosition) + key + this.command.slice(this.cursorPosition)
              this.terminal.write(key)
              this.cursorPosition++
            }
          }
      }
    })

    this.prompt()
  }

  private setCommandFromHistory(): void {
    this.command = this.history[this.historyIndex]
    this.cursorPosition = this.command.length
    this.redrawInput()
  }

  private redrawInput(): void {
    this.terminal.write('\r\x1b[K$ ' + this.command)
    const cursorMove = this.cursorPosition
    for (let i = 0; i < cursorMove; i++) {
      this.terminal.write('\x1b[C')
    }
  }

  private autocompleteCommand(): void {
    if (this.command.trim().length === 0) return
    const parts = this.command.trim().split(/\s+/)
    const lastPart = parts[parts.length - 1]
    const prefix = parts.slice(0, -1).join(' ')

    const matches = Object.keys(this.commands).filter(cmd => cmd.startsWith(lastPart))
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0]
      this.command = parts.join(' ')
      this.cursorPosition = this.command.length
      this.redrawInput()
    } else if (matches.length > 1) {
      this.terminal.writeln('')
      this.terminal.writeln(matches.join('  '))
      this.prompt()
    }
  }

  private handlePaste(): void {
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard
        .readText()
        .then(text => {
          this.command = this.command.slice(0, this.cursorPosition) + text + this.command.slice(this.cursorPosition)
          this.terminal.write(text)
          this.cursorPosition += text.length
        })
        .catch(() => {
          this.terminal.writeln('Clipboard access not available')
          this.prompt()
        })
    }
  }

  setReadOnly(isReadOnly: boolean): void {
    this.isReadOnly = isReadOnly
  }

  getCommandLine(): string {
    return this.command
  }

  setCommandLine(command: string): void {
    this.command = command
    this.cursorPosition = command.length
    this.redrawInput()
  }

  writeln(text: string): void {
    this.terminal.writeln(text)
  }

  prompt() {
    const pathToDisplay = this.currentDir.length > this.maxPathLength ? '...' + this.currentDir.slice(-this.maxPathLength + 3) : this.currentDir
    this.terminal.write(`\r\n[${pathToDisplay}] $ `)
  }

  runCommand(text: string) {
    const trimmed = text.trim()
    const parts = trimmed.split(/\s+/)
    const name = parts[0]
    if (name.length > 0) {
      this.terminal.writeln('')
      if (trimmed && (this.history.length === 0 || this.history[this.history.length - 1] !== trimmed)) {
        this.history.push(trimmed)
        if (this.history.length > this.maxHistory) {
          this.history.shift()
        }
      }
      const config = this.commands[name]
      if (config) {
        const info: CommandExecuteInfo = {
          name,
          description: config.description,
          details: config.details,
          args: parts.slice(1),
          fullText: trimmed,
          timestamp: Date.now()
        }
        config.onExecute(info)
        emitEventTo1C(TERMINAL_COMMAND_EXECUTED, info)
        return
      }
      this.terminal.writeln(`${name}: command not found`)
    }
    this.prompt()
  }
}
