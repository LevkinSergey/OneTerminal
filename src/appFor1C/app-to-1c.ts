import { OneTerminalOptions } from '@/app/OneTerminal'

export interface AppTo1C {
  setBaseUrl: (url: string) => void
  close: () => void
  endOperation: (log: string) => void
  init: (options?: OneTerminalOptions) => void
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
  window.terminal.init(options || {})
}

const endOperation = (log: string) => {
  // if (!window.terminalstream) {
  //   return
  // }
  // window.terminalstream.write('asdlasjdjasld')
  // window.terminalstream.close()
  // window.terminalstream = undefined
}

window.appTo1C = {
  setBaseUrl,
  close,
  endOperation,
  init
}
