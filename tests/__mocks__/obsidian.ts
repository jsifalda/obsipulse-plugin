import { vi } from 'vitest'

// --- Mock Types ---
export class TFile {
  path: string
  name: string
  basename: string
  extension: string = 'md'
  stat: { mtime: number; ctime: number; size: number }

  constructor(path: string) {
    this.path = path
    this.name = path.split('/').pop() || ''
    this.basename = this.name.replace(/\.[^.]+$/, '')
    this.stat = { mtime: Date.now(), ctime: Date.now(), size: 100 }
  }
}

export class TFolder {
  path: string
  name: string
  constructor(path: string) {
    this.path = path
    this.name = path.split('/').pop() || ''
  }
}

// --- Mock Vault ---
export const createMockVault = (files: Map<string, string> = new Map()) => ({
  read: vi.fn(async (file: TFile) => files.get(file.path) || ''),
  cachedRead: vi.fn(async (file: TFile) => files.get(file.path) || ''),
  modify: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  getMarkdownFiles: vi.fn(() => Array.from(files.keys()).map((path) => new TFile(path))),
  adapter: {
    getName: vi.fn(() => 'test-vault'),
    read: vi.fn(),
    write: vi.fn(),
  },
  on: vi.fn(() => ({ unload: vi.fn() })),
})

// --- Mock Workspace ---
export const createMockWorkspace = () => ({
  getActiveViewOfType: vi.fn(),
  getLeavesOfType: vi.fn(() => []),
  on: vi.fn(() => ({ unload: vi.fn() })),
  layoutReady: true,
})

// --- Mock App ---
export const createMockApp = (files: Map<string, string> = new Map()) => ({
  vault: createMockVault(files),
  workspace: createMockWorkspace(),
  plugins: {
    enabledPlugins: new Set<string>(),
    plugins: {},
  },
  internalPlugins: {
    plugins: {
      sync: {
        instance: {
          deviceName: 'test-device',
          getDefaultDeviceName: () => 'test-device',
        },
      },
    },
  },
  metadataCache: {
    getFileCache: vi.fn(),
    on: vi.fn(() => ({ unload: vi.fn() })),
  },
})

// --- Exported Classes ---
export class App {}

export class Plugin {
  app: ReturnType<typeof createMockApp>
  manifest: { version: string; id: string; name: string }

  constructor() {
    this.app = createMockApp()
    this.manifest = { version: '1.0.0', id: 'test-plugin', name: 'Test Plugin' }
  }

  loadData = vi.fn(async () => ({}))
  saveData = vi.fn(async () => {})
  addCommand = vi.fn()
  addSettingTab = vi.fn()
  addStatusBarItem = vi.fn(() => ({
    setText: vi.fn(),
    setAttribute: vi.fn(),
    remove: vi.fn(),
    classList: { add: vi.fn() },
  }))
  addRibbonIcon = vi.fn()
  registerEvent = vi.fn()
  registerInterval = vi.fn()
  registerDomEvent = vi.fn()
}

export class PluginSettingTab {
  app: ReturnType<typeof createMockApp>
  containerEl: HTMLElement

  constructor(app: any, plugin: any) {
    this.app = app
    this.containerEl = document.createElement('div')
  }

  display = vi.fn()
  hide = vi.fn()
}

export class Modal {
  app: any
  contentEl: HTMLElement

  constructor(app: any) {
    this.app = app
    this.contentEl = document.createElement('div')
  }

  open = vi.fn()
  close = vi.fn()
}

export class Notice {
  constructor(message: string, timeout?: number) {}
}

export class MarkdownView {}

export class Component {
  load = vi.fn()
  unload = vi.fn()
}

export class Setting {
  settingEl: HTMLElement
  nameEl: HTMLElement
  descEl: HTMLElement

  constructor(containerEl: HTMLElement) {
    this.settingEl = document.createElement('div')
    this.nameEl = document.createElement('div')
    this.descEl = document.createElement('div')
    containerEl.appendChild(this.settingEl)
  }

  setName = vi.fn().mockReturnThis()
  setDesc = vi.fn().mockReturnThis()
  setClass = vi.fn().mockReturnThis()
  addText = vi.fn().mockReturnThis()
  addTextArea = vi.fn().mockReturnThis()
  addToggle = vi.fn().mockReturnThis()
  addSlider = vi.fn().mockReturnThis()
  addButton = vi.fn().mockReturnThis()
}

// --- Utility Functions ---
export const debounce = vi.fn((fn: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
})

export const addIcon = vi.fn()

export const requestUrl = vi.fn(async (options: any) => ({
  status: 200,
  json: {},
}))

export type Debouncer<A extends unknown[], R> = ((...args: A) => R) & {
  cancel(): void
}
