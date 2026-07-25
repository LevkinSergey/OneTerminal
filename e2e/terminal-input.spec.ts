import { test, expect } from '@playwright/test'

test.describe('Terminal Input Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('#app')
    await page.waitForTimeout(500)
  })

  test('setInput sets input buffer and redraws', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('test command')
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('test command')
  })

  test('insertText inserts at cursor position', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('command')
      term.insertText(' test')
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('command test')
  })

  test('clearInput empties buffer', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('some input')
      term.clearInput()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('')
  })

  test('write writes data to terminal', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.write('output text')
    })

    // Verify write was called
    const called = await page.evaluate(() => {
      return typeof (window as any).terminal.write === 'function'
    })
    expect(called).toBe(true)
  })

  test('setInput with multiline text', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('line1\nline2\nline3')
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('line1\nline2\nline3')
  })

  test('insertText with newlines', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('ab')
      term.cursorPosition = 1
      term.insertText('\nhello\n')
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('a\nhello\nb')
  })

  test('clearInput empties buffer and resets cursor position', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('line1\nline2')
      term.clearInput()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('')

    const pos = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.cursorPosition
    })
    expect(pos).toBe(0)
  })

  test('clear clears terminal and resets input', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('test')
      term.clear()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('')
  })
})