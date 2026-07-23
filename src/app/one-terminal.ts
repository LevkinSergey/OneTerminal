import { Terminal, Stream } from 'web-termjs'

window.terminal = new Terminal({
  welcome: '',
  separator: '$',
  prompt: '',
  theme: 'dark'
})
window.terminal.openIn(document.getElementById('app'))

const closeTerminal = () => {
  window.terminal.close()
}

const onCommand = (cmd: string, args: string[], stream: Stream): void => {
  window.terminalstream = stream
  if (cmd === 'exit') {
    stream.close()
    return closeTerminal()
  }
  if (cmd === 'clear') {
    window.terminal.clear()
    stream.close()
  }
}

window.terminal.onCommand(onCommand)
