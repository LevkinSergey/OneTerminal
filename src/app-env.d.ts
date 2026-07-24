import { OneTerminal } from './app/OneTerminal'
import { AppTo1C } from './appFor1C/app-to-1c'

declare global {
  interface Window {
    appTo1C: AppTo1C
    isWebClient: boolean
    terminal: OneTerminal
  }
}

declare module '*.scss' {
  const content: { [className: string]: string }
  export default content
}
