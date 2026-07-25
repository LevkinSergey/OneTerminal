import { test, expect } from '@playwright/test'

test.describe('Terminal 1C Bridge (appTo1C)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('#app')
    await page.waitForTimeout(500)
  })

  test('appTo1C.setInput delegates to terminal', async ({ page }) => {
    await page.evaluate(() => {
      const appTo1C = (window as any).appTo1C
      appTo1C.setInput('from 1c')
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('from 1c')
  })

  test('appTo1C.setInput with multiline text', async ({ page }) => {
    await page.evaluate(() => {
      const appTo1C = (window as any).appTo1C
      appTo1C.setInput('multi\nline\ninput')
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('multi\nline\ninput')
  })

  test('appTo1C.insertText delegates to terminal', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('hello')
    })

    await page.evaluate(() => {
      const appTo1C = (window as any).appTo1C
      appTo1C.insertText(' world')
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('hello world')
  })

  test('appTo1C.clearInput delegates to terminal', async ({ page }) => {
    await page.evaluate(() => {
      const appTo1C = (window as any).appTo1C
      appTo1C.setInput('to clear')
      appTo1C.clearInput()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('')
  })

  test('appTo1C.setBaseUrl updates base href when base exists', async ({ page }) => {
    await page.evaluate(() => {
      const base = document.createElement('base')
      base.href = 'http://original.com/'
      document.head.appendChild(base)
    })

    await page.evaluate(() => {
      const appTo1C = (window as any).appTo1C
      appTo1C.setBaseUrl('https://example.com/path/')
    })

    const href = await page.evaluate(() => {
      const base = document.querySelector('base')
      return base?.getAttribute('href')
    })
    expect(href).toBe('https://example.com/path/')
  })

  test('appTo1C.close is callable', async ({ page }) => {
    await expect(page.evaluate(() => {
      const appTo1C = (window as any).appTo1C
      appTo1C.close()
    })).resolves.toBeUndefined()
  })

  test('appTo1C.endOperation is callable', async ({ page }) => {
    await expect(page.evaluate(() => {
      const appTo1C = (window as any).appTo1C
      appTo1C.endOperation('test')
    })).resolves.toBeUndefined()
  })
})