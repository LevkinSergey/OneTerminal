import { AppTo1C } from './appFor1C/app-to-1c'
import { Terminal } from 'xterm'

declare global {
  interface Window {
    appTo1C: AppTo1C
    isWebClient: boolean
    terminal: Terminal
  }
}
