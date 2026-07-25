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

  test('ArrowLeft/Right navigates across lines in multiline buffer', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('ab\ncd')
    })

    // start at end (pos 5: after 'd')
    let pos = await page.evaluate(() => {
      const term = (window as any).terminal
      term.handleArrowLeft()
      return term.cursorPosition
    })
    expect(pos).toBe(4) // before 'd'

    pos = await page.evaluate(() => {
      const term = (window as any).terminal
      term.handleArrowLeft()
      return term.cursorPosition
    })
    expect(pos).toBe(3) // before 'c'

    // one more left crosses the newline boundary
    pos = await page.evaluate(() => {
      const term = (window as any).terminal
      term.handleArrowLeft()
      return term.cursorPosition
    })
    expect(pos).toBe(2) // before '\n'

    pos = await page.evaluate(() => {
      const term = (window as any).terminal
      term.handleArrowLeft()
      return term.cursorPosition
    })
    expect(pos).toBe(1) // before 'b'

    // now go right
    pos = await page.evaluate(() => {
      const term = (window as any).terminal
      term.handleArrowRight()
      return term.cursorPosition
    })
    expect(pos).toBe(2) // after 'b', back at '\n'

    pos = await page.evaluate(() => {
      const term = (window as any).terminal
      term.handleArrowRight()
      return term.cursorPosition
    })
    expect(pos).toBe(3) // after '\n', at 'c'
  })

  test('Home/End with multiline buffer', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('abc\nde')
    })

    await page.evaluate(() => {
      const term = (window as any).terminal
      term.cursorPosition = 4 // on 'd'
      term.handleHome()
    })

    const startPos = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.cursorPosition
    })
    expect(startPos).toBe(0)

    await page.evaluate(() => {
      const term = (window as any).terminal
      term.handleEnd()
    })

    const endPos = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.cursorPosition
    })
    expect(endPos).toBe(6)
  })

  test('Backspace with multiline buffer', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('ab\ncd')
      term.cursorPosition = 5 // after 'd'
      term.handleBackspace()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('ab\nc')

    const pos = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.cursorPosition
    })
    expect(pos).toBe(4)
  })

  test('Delete with multiline buffer', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('ab\ncd')
      term.cursorPosition = 2 // at '\n'
      term.handleDelete()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('abcd')
  })

  test('Enter adds multiline command to history', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('line1\nline2')
      term.handleEnter()
    })

    const history = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.commandHistory
    })
    expect(history).toContain('line1\nline2')
    expect(history.length).toBe(1)

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('')
  })

  test('ArrowUp retrieves multiline command from history', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('multi\nline\ncmd')
      term.handleEnter()
      term.handleArrowUp()
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('multi\nline\ncmd')

    const pos = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.cursorPosition
    })
    expect(pos).toBe(14) // length of 'multi\nline\ncmd'
  })

  test('handleEnter with cursor in middle of multiline buffer stores full command', async ({ page }) => {
    // cursor at position 2 (middle of first line)
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('aa\nbb\ncc')
      term.cursorPosition = 2
      term.handleEnter()
    })

    const history = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.commandHistory
    })
    // full buffer should be stored, not just from cursor position
    expect(history).toContain('aa\nbb\ncc')

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

  test('handleEnter with cursor at beginning of multiline buffer stores full command', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('aa\nbb\ncc')
      term.cursorPosition = 0
      term.handleEnter()
    })

    const history = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.commandHistory
    })
    expect(history).toContain('aa\nbb\ncc')
    expect(history.length).toBe(1)
  })

  test('handleEnter with cursor on newline character stores full multiline command', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('aa\nbb')
      term.cursorPosition = 2 // on the '\n'
      term.handleEnter()
    })

    const history = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.commandHistory
    })
    expect(history).toContain('aa\nbb')
  })

  test('multiple sequential multiline commands in history', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('cmd1\npart2')
      term.handleEnter()
      term.setInput('cmd3\npart4\npart5')
      term.handleEnter()
    })

    const history = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.commandHistory
    })
    expect(history.length).toBe(2)
    expect(history[0]).toBe('cmd1\npart2')
    expect(history[1]).toBe('cmd3\npart4\npart5')
  })

  test('handleCharacterInput after multiline Enter starts fresh buffer', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('multi\nline')
      term.handleEnter()
    })

    // type a new command
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.handleCharacterInput('n')
      term.handleCharacterInput('e')
      term.handleCharacterInput('w')
    })

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('new')

    const pos = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.cursorPosition
    })
    expect(pos).toBe(3)
  })

  test('ArrowLeft/Right crossing newline boundaries updates cursor correctly', async ({ page }) => {
    // ArrowLeft from end to first line, then ArrowRight back to end
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('ab\ncd')
    })

    // ArrowLeft through all positions from end
    let pos = await page.evaluate(() => {
      const term = (window as any).terminal
      term.handleArrowLeft() // before 'd' (pos 4)
      term.handleArrowLeft() // before 'c' (pos 3)
      term.handleArrowLeft() // before '\n' (pos 2)
      term.handleArrowLeft() // before 'b' (pos 1)
      term.handleArrowLeft() // before 'a' (pos 0)
      return term.cursorPosition
    })
    expect(pos).toBe(0)

    // ArrowRight all the way back
    pos = await page.evaluate(() => {
      const term = (window as any).terminal
      term.handleArrowRight() // after 'a' (pos 1)
      term.handleArrowRight() // after 'b', before '\n' (pos 2)
      term.handleArrowRight() // after '\n', before 'c' (pos 3)
      term.handleArrowRight() // after 'c', before 'd' (pos 4)
      term.handleArrowRight() // after 'd' (pos 5)
      return term.cursorPosition
    })
    expect(pos).toBe(5)
  })

  test('handleEnter preserves multiline command regardless of cursor line', async ({ page }) => {
    // cursor on second line of a 3-line command
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('lineA\nlineB\nlineC')
      term.cursorPosition = 8 // middle of second line "lineB"
      term.handleEnter()
    })

    const history = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.commandHistory
    })
    expect(history).toContain('lineA\nlineB\nlineC')
    expect(history.length).toBe(1)

    const buffer = await page.evaluate(() => {
      const term = (window as any).terminal
      return term.inputBuffer
    })
    expect(buffer).toBe('')
  })

  test('ArrowLeft/ArrowRight on single-line buffer still works after refactor', async ({ page }) => {
    await page.evaluate(() => {
      const term = (window as any).terminal
      term.setInput('hello')
    })

    let pos = await page.evaluate(() => {
      const term = (window as any).terminal
      term.handleArrowLeft()
      term.handleArrowLeft()
      term.handleArrowLeft()
      return term.cursorPosition
    })
    expect(pos).toBe(2)

    pos = await page.evaluate(() => {
      const term = (window as any).terminal
      term.handleArrowRight()
      return term.cursorPosition
    })
    expect(pos).toBe(3)
  })
})