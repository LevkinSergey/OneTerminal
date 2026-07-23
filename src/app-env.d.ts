import { AppTo1C } from './appFor1C/app-to-1c'
import { Stream, Terminal } from 'web-termjs'

declare global {
  interface Window {
    appTo1C: AppTo1C
    isWebClient: boolean
    terminal: Terminal
    terminalstream?: Stream
  }
}
