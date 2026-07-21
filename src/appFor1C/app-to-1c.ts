export interface AppTo1C {
  setBaseUrl: (url: string) => void
  close: () => void
  commandRegister?: (name: string, descriptions: string) => void
  setExecutables?: (name: string) => void
  addCommangLog?: (log: string) => void
  lock?: (lock: boolean) => void
}

const setBaseUrl = (url: string): void => {
  const elems = document.getElementsByTagName('base')

  if (elems.length > 0) {
    elems[0].href = url
  }
}

const close = () => {
  console.log('close')
}

window.appTo1C = {
  setBaseUrl,
  close
}
