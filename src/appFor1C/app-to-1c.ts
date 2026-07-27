import { OneTerminalOptions } from '@/app/OneTerminal'

export interface AppTo1C {
  setBaseUrl: (url: string) => void
  close: () => void
  endOperation: (log?: string) => void
  init: (options: string | OneTerminalOptions) => void
  setInput: (input: string) => void
  insertText: (text: string) => void
  clearInput: () => void
  startOperation: () => void
  setPath: (path: string) => void
  setCommonCommands: (commands: string) => void
  setLocalCommands: (commands: string) => void
}

const setBaseUrl = (url: string): void => {
  setTimeout(() => {
    const elems = document.getElementsByTagName('base')

    if (elems.length > 0) {
      elems[0].href = url
    }
  }, 0)
}

const close = () => {
  setTimeout(() => {
    console.log('close')
  }, 0)
}

const init: AppTo1C['init'] = options => {
  window.terminal.init(serialiseText<OneTerminalOptions>(options || {}))
}

const startOperation = (): void => {
  setTimeout(() => {
    window.terminal.startOperation()
  }, 0)
}

const endOperation = (log?: string) => {
  setTimeout(() => {
    window.terminal.endOperation(log)
  }, 0)
}

const setInput = (input: string): void => {
  setTimeout(() => {
    window.terminal.setInput(input)
  }, 0)
}

const insertText = (text: string): void => {
  setTimeout(() => {
    window.terminal.insertText(text)
  }, 0)
}

const clearInput = (): void => {
  setTimeout(() => {
    window.terminal.clearInput()
  }, 0)
}

const setPath: AppTo1C['setPath'] = path => {
  setTimeout(() => {
    window.terminal.setPath(path)
  }, 0)
}

const setCommonCommands: AppTo1C['setCommonCommands'] = commands => {
  setTimeout(() => {
    window.terminal.setCommonCommands(serialiseText<string[]>(commands))
  }, 0)
}

const setLocalCommands: AppTo1C['setLocalCommands'] = commands => {
  setTimeout(() => {
    window.terminal.setLocalCommands(serialiseText<string[]>(commands))
  }, 0)
}

window.appTo1C = {
  setBaseUrl,
  close,
  endOperation,
  init,
  setInput,
  insertText,
  clearInput,
  startOperation,
  setPath,
  setCommonCommands,
  setLocalCommands
}

const serialiseText = <T>(text: T | string): T => {
  if (typeof text === 'string') {
    return JSON.parse(text) as T
  }
  return text
}
