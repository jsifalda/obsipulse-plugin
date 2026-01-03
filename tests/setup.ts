import { vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock global DOM functions used by Obsidian
declare global {
  function createEl(tag: string, options?: { text?: string; cls?: string }): HTMLElement
  function createDiv(options?: { text?: string; cls?: string }): HTMLDivElement
  function createSpan(options?: { text?: string; cls?: string }): HTMLSpanElement
  function sleep(ms: number): Promise<void>
}

globalThis.createEl = vi.fn((tag: string, options?: { text?: string; cls?: string }) => {
  const el = document.createElement(tag)
  if (options?.text) el.textContent = options.text
  if (options?.cls) el.className = options.cls
  return el
})

globalThis.createDiv = vi.fn((options?: { text?: string; cls?: string }) => {
  return globalThis.createEl('div', options) as HTMLDivElement
})

globalThis.createSpan = vi.fn((options?: { text?: string; cls?: string }) => {
  return globalThis.createEl('span', options) as HTMLSpanElement
})

globalThis.sleep = vi.fn((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)))

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})
