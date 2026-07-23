export function emitEventTo1C(name: string, data: any, event?: Event | UIEvent) {
  //отключаем стандартную обработку события
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  let eventData = data
  if (typeof eventData === 'object') {
    eventData = JSON.stringify(eventData)
  }
  let lastEvent = new CustomEvent('click', {
    bubbles: true,
    cancelable: true,
    composed: false,
    detail: {
      name: name,
      data: eventData
    }
  })
  lastEvent.preventDefault()
  return document.dispatchEvent(lastEvent)
}
