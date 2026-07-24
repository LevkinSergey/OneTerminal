import { test, expect } from '@playwright/test'

test.describe('Terminal Command History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('#app')
    await page.waitForTimeout(500)
  })

  test('handleEnter adds to history and clears input', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('first command')
      term.handleEnter()
    })

    const history = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.commandHistory
    })
    expect(history).toContain('first command')
    expect(history.length).toBe(1)

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('')
  })

  test('ArrowUp navigates to previous command', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('cmd1')
      term.handleEnter()
      term.setInput('cmd2')
      term.handleEnter()
      term.setInput('cmd3')
      term.handleArrowUp()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('cmd2')
  })

  test('multiple ArrowUp goes further back', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('cmd1')
      term.handleEnter()
      term.setInput('cmd2')
      term.handleEnter()
      term.setInput('cmd3')
      term.handleArrowUp()
      term.handleArrowUp()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('cmd1')
  })

  test('ArrowLeft/Right moves cursor', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('test')
      term.handleArrowLeft()
      term.handleArrowLeft()
    })

    const pos = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.cursorPosition
    })
    expect(pos).toBe(2)
  })

  test('Home/End moves cursor to start/end', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('test')
      term.handleHome()
    })

    let pos = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.cursorPosition
    })
    expect(pos).toBe(0)

    await page.evaluate(() => {
      const term = (window as any).terminal
      term.handleEnd()
    })

    pos = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.cursorPosition
    })
    expect(pos).toBe(4)
  })

  test('Backspace removes character before cursor', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('test')
      term.handleBackspace()
    })

    let buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('tes')
  })

  test('Delete removes character at cursor', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('test')
      term.cursorPosition = 2
      term.handleDelete()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('tet')
  })
})