import { test, expect } from '@playwright/test'

test.describe('Terminal Command Completion (Tab)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('#app')
    await page.waitForTimeout(500)
  })

  test('setCommonCommands and setLocalCommands via appTo1C bridge', async ({ page }) => {
    await page.evaluate(() => {
      const appTo1C = (window as any).appTo1C
      appTo1C.setCommonCommands(JSON.stringify(['git', 'npm', 'node']))
      appTo1C.setLocalCommands(JSON.stringify(['build', 'deploy']))
    })

    const common = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.commonCommands
    })
    expect(common).toEqual(['git', 'npm', 'node'])

    const local = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.localCommands
    })
    expect(local).toEqual(['build', 'deploy'])
  })

  test('Tab with no matching commands does not change buffer', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setCommonCommands(['git', 'npm'])
      term.setInput('xyz')
      term.handleTab()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('xyz')
  })

  test('Tab with empty command lists does not change buffer', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('git')
      term.handleTab()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('git')
  })

  test('Tab completes to single match from common commands', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setCommonCommands(['docker', 'docker-compose', 'git'])
      term.setInput('doc')
      term.handleTab()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('docker')
  })

  test('Tab completes to single match from local commands', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setLocalCommands(['build', 'deploy'])
      term.setInput('dep')
      term.handleTab()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('deploy')
  })

  test('Tab with multiple matches completes to LCP', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setCommonCommands(['docker', 'docker-compose'])
      term.setInput('dock')
      term.handleTab()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('docker')
  })

  test('Tab with multiple matches uses LCP from mixed common+local', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setCommonCommands(['build-app', 'build-web'])
      term.setLocalCommands(['build-api'])
      term.setInput('bui')
      term.handleTab()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('build-')
  })

  test('Tab does nothing when arguments already present (space in buffer)', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setCommonCommands(['git'])
      term.setInput('git commit')
      term.handleTab()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('git commit')
  })

  test('Tab with exact match does not change buffer', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setCommonCommands(['npm'])
      term.setInput('npm')
      term.handleTab()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('npm')
  })

  test('Tab preserves cursor at end of completed word', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setCommonCommands(['node'])
      term.setInput('nod')
      term.handleTab()
    })

    const pos = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.cursorPosition
    })
    expect(pos).toBe(4)
  })

  test('Tab with empty buffer completes to LCP of all commands', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setCommonCommands(['docker', 'docker-compose', 'dockerd'])
      term.handleTab()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('docker')
  })

  test('case-insensitive matching', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setCommonCommands(['Docker', 'docker-compose'])
      term.setInput('DOC')
      term.handleTab()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('Docker')
  })

  test('double Tab with >1 matches shows filtered commands and resets buffer', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setCommonCommands(['docker', 'docker-compose', 'dockerd', 'git'])
      term.setInput('doc')
      // simulate double-tab
      term.lastTabTime = Date.now() - 50
      term.handleTab()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('')
  })

  test('double Tab with exactly 1 match does not show list, completes normally', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setCommonCommands(['docker', 'git'])
      term.setInput('git')
      term.lastTabTime = Date.now() - 50
      term.handleTab()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    // single match completes it (already exact match, so unchanged)
    expect(buffer).toBe('git')
  })

  test('double Tab with 0 matches does nothing', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setCommonCommands(['docker', 'git'])
      term.setInput('xyz')
      term.lastTabTime = Date.now() - 50
      term.handleTab()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('xyz')
  })

  test('double Tab with >40 matches shows count message instead of list', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      const manyCommands = Array.from({ length: 50 }, (_, i) => 'cmd' + (i + 1))
      term.setCommonCommands(manyCommands)
      term.setInput('cmd')
      term.lastTabTime = Date.now() - 50
      term.handleTab()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('')
  })

  test('double Tab with 41 matches shows count message', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      const manyCommands = Array.from({ length: 41 }, (_, i) => 'tool-' + (i + 1))
      term.setCommonCommands(manyCommands)
      term.setInput('tool')
      term.lastTabTime = Date.now() - 50
      term.handleTab()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('')
  })

  test('double Tab with 40 matches shows the list', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      const manyCommands = Array.from({ length: 40 }, (_, i) => 'item-' + (i + 1))
      term.setCommonCommands(manyCommands)
      term.setInput('item')
      term.lastTabTime = Date.now() - 50
      term.handleTab()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('')
  })

  test('double Tab with empty command lists does nothing', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('test')
      term.lastTabTime = Date.now() - 50
      term.handleTab()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('test')
  })
})
