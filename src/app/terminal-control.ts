export const Ctrl = {
  NUL: '\x00',
  SOH: '\x01',
  STX: '\x02',
  ETX: '\x03',
  EOT: '\x04',
  ENQ: '\x05',
  ACK: '\x06',
  BEL: '\x07',
  BS: '\x08',
  TAB: '\x09',
  LF: '\x0a',
  VT: '\x0b',
  FF: '\x0c',
  CR: '\x0d',
  SO: '\x0e',
  SI: '\x0f',
  ESC: '\x1b',
  DEL: '\x7f',
  CRLF: '\r\n',
  SPC: ' '
} as const

export namespace Cursor {
  export const up = (n = 1) => `\x1b[${n}A`
  export const down = (n = 1) => `\x1b[${n}B`
  export const forward = (n = 1) => `\x1b[${n}C`
  export const back = (n = 1) => `\x1b[${n}D`
  export const nextLine = (n = 1) => `\x1b[${n}E`
  export const prevLine = (n = 1) => `\x1b[${n}F`
  export const column = (col: number) => `\x1b[${col}G`
  export const position = (row: number, col: number) => `\x1b[${row};${col}H`
  export const save = '\x1b[s'
  export const restore = '\x1b[u'
  export const show = '\x1b[?25h'
  export const hide = '\x1b[?25l'
}

export namespace Erase {
  export const displayToEnd = '\x1b[0J'
  export const displayFromStart = '\x1b[1J'
  export const displayAll = '\x1b[2J'
  export const displaySaved = '\x1b[3J'
  export const lineToEnd = '\x1b[0K'
  export const lineFromStart = '\x1b[1K'
  export const lineAll = '\x1b[2K'
}

export namespace Scroll {
  export const up = (n = 1) => `\x1b[${n}S`
  export const down = (n = 1) => `\x1b[${n}T`
}

export namespace Style {
  export const reset = '\x1b[0m'
  export const bold = '\x1b[1m'
  export const dim = '\x1b[2m'
  export const italic = '\x1b[3m'
  export const underline = '\x1b[4m'
  export const blink = '\x1b[5m'
  export const inverse = '\x1b[7m'
  export const hidden = '\x1b[8m'
  export const strikethrough = '\x1b[9m'

  export namespace Fg {
    export const black = '\x1b[30m'
    export const red = '\x1b[31m'
    export const green = '\x1b[32m'
    export const yellow = '\x1b[33m'
    export const blue = '\x1b[34m'
    export const magenta = '\x1b[35m'
    export const cyan = '\x1b[36m'
    export const white = '\x1b[37m'
    export const color256 = (n: number) => `\x1b[38;5;${n}m`
    export const rgb = (r: number, g: number, b: number) =>
      `\x1b[38;2;${r};${g};${b}m`
    export const default_ = '\x1b[39m'
  }

  export namespace Bg {
    export const black = '\x1b[40m'
    export const red = '\x1b[41m'
    export const green = '\x1b[42m'
    export const yellow = '\x1b[43m'
    export const blue = '\x1b[44m'
    export const magenta = '\x1b[45m'
    export const cyan = '\x1b[46m'
    export const white = '\x1b[47m'
    export const color256 = (n: number) => `\x1b[48;5;${n}m`
    export const rgb = (r: number, g: number, b: number) =>
      `\x1b[48;2;${r};${g};${b}m`
    export const default_ = '\x1b[49m'
  }
}
