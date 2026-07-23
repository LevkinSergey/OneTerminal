export interface AppTo1C {
  setBaseUrl: (url: string) => void
  close: () => void
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

window.appTo1C = {
  setBaseUrl,
  close
}
