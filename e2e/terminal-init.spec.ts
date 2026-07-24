import { test, expect } from '@playwright/test'

test.describe('Terminal Initialization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('#app')
    await page.waitForTimeout(500)
  })

  test('terminal renders in #app element', async ({ page }) => {
    const terminal = page.locator('#app .xterm')
    await expect(terminal).toBeVisible()
  })

  test('terminal is focused after init', async ({ page }) => {
    const focused = await page.evaluate(() => document.activeElement?.classList.contains('xterm-helper-textarea'))
    expect(focused).toBeTruthy()
  })

  test('fit() is called on resize', async ({ page }) => {
    const fitCalled = await page.evaluate(() => {
      const term = (window as any).terminal
      const originalFit = term.fit
      let called = false
      term.fit = () => { called = true }
      window.dispatchEvent(new Event('resize'))
      term.fit = originalFit
      return called
    })
    expect(fitCalled).toBeTruthy()
  })

  test('window.terminal has core methods accessible', async ({ page }) => {
    const terminal = await page.evaluate(() => (window as any).terminal)
    expect(terminal).toBeDefined()
    expect(terminal.initilized).toBe(true)

    // Verify methods work by calling them
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('test')
      term.insertText('ing')
      term.clearInput()
      term.write('output')
      term.clear()
      term.fit()
    })
    // If no errors thrown, methods exist and work
    expect(true).toBe(true)
  })

  test('window.appTo1C has all methods accessible', async ({ page }) => {
    const appTo1C = await page.evaluate(() => (window as any).appTo1C)
    expect(appTo1C).toBeDefined()

    // Verify methods work by calling them
    await page.evaluate(() => {
      const api = (window as any).appTo1C
      api.setInput('test')
      api.insertText('ing')
      api.clearInput()
      api.setBaseUrl('http://test.com/')
      api.close()
      api.endOperation('test')
    })
    expect(true).toBe(true)
  })
})