export function emitEventTo1C(name: string, data?: unknown, nativeEvent?: Event): boolean {
  if (nativeEvent) {
    nativeEvent.preventDefault()
    nativeEvent.stopPropagation()
  }

  const detail: { name: string; data?: string } = { name }
  if (data !== undefined) {
    detail.data = typeof data === 'object' ? JSON.stringify(data) : String(data)
  }

  const event = new CustomEvent('click', {
    bubbles: true,
    cancelable: true,
    detail
  })

  event.preventDefault()
  return document.dispatchEvent(event)
}
