import {
  App,
  Debouncer,
  MarkdownView,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  debounce,
  requestUrl,
} from 'obsidian'
import { DataviewCompiler } from './compilers/DataViewCompiler'
import { VIEW_TYPE_STATS_TRACKER } from './constants'
import { Encryption } from './helpers/Encryption'
import { formatDateToYYYYMMDD } from './helpers/formatDateToYYYYMMDD'
import { listAllPlugins } from './helpers/listAllPlugins'

class ObsiPulseSettingTab extends PluginSettingTab {
  plugin: ObsiPulse

  constructor(app: App, plugin: ObsiPulse) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()
    containerEl.createEl('h2', { text: 'ObsiPulse Settings' })
    containerEl.createEl('strong', { text: `Vault name: ${this.app.vault.adapter.getName()}` })
    containerEl.createEl('br')
    containerEl.createEl('span', { text: `Version: ${this.plugin.manifest.version}` })

    new Setting(containerEl)
      .setName('License Key')
      .setDesc('Enter your license key to activate ObsiPulse plugin')
      .addText((text) =>
        text
          .setPlaceholder('Your license key here...')
          .setValue(this.plugin.settings.key || '')
          .onChange(async (value) => {
            this.plugin.settings.key = value
            await this.plugin.saveSettings()

            const parsedKey = parseLicenseKey(value)
            this.plugin.settings.userId = parsedKey.userId
            this.plugin.updatePluginList()
          }),
      )

    new Setting(containerEl)
      .setName('Files to be published')
      .setDesc('List of files to be shared publicly via obsidian profile')
      .addTextArea((textArea) =>
        textArea
          .setPlaceholder('public-path.md\n/public-dir\n!/public-dir/not-public-path.md')
          .setValue(this.plugin.settings.publicPaths.join('\n'))
          .onChange(async (value) => {
            this.plugin.settings.publicPaths = value.split('\n')
            await this.plugin.saveData(this.plugin.settings)
          }),
      )
  }
}

interface WordCount {
  initial: number
  current: number
}

interface ObsiPulseSettings {
  dayCounts: Record<string, number>
  todaysWordCount: Record<string, WordCount>

  userId?: string

  key?: string
  publicPaths?: string[]
}

const DEFAULT_SETTINGS: ObsiPulseSettings = {
  dayCounts: {},
  todaysWordCount: {},
  userId: null,
  publicPaths: [],
}

interface ParsedLicenseKey {
  key: string
  userId: string
}

const parseLicenseKey = (key: string) => {
  // console.log('--parsing key', key)
  const parsedKey = Encryption().decrypt(key)
  // console.log({ parsedKey })
  try {
    const value = JSON.parse(parsedKey) as ParsedLicenseKey
    console.log({ value })
    return value
  } catch (e) {
    console.error('--error decrypting key', e)
  }
}

export default class ObsiPulse extends Plugin {
  settings: ObsiPulseSettings
  statusBarEl: HTMLElement
  currentWordCount: number
  today: string
  debouncedUpdate?: Debouncer<[contents: string, filepath: string], void>

  debouncedUpdateDb?: Debouncer<[key: string, value: string], Promise<any>>

  private hasCountChanged: boolean = false

  private previousPlugins: Set<string> = new Set()

  async onload() {
    console.log('ObsiPulse Plugin Loaded, v:', this.manifest.version)
    // console.log({
    //   dir: this.app.vault.configDir,
    //   root: this.app.vault.getRoot(),
    //   dirname: __dirname,
    //   name: this.app.vault.adapter.getName(),
    //   path: this.app.vault.adapter.basePath,
    //   id: this.app.appId,
    // })

    await this.loadSettings()

    // const key = Encryption().encrypt(
    //   JSON.stringify({ key: 'pipX0t3I12V47y7wXVbIH4X42A84nB', userId: '9Sd3j0JMV0I4VtRt' }),
    // )
    // console.log({ key, l: key.length })
    // const testKey = Encryption().decrypt(key)
    // console.log({ testKey })
    // parseLicenseKey(key)

    if (this.settings.key) {
      try {
        const parsedKey = parseLicenseKey(this.settings.key)
        this.settings.userId = parsedKey.userId
        this.updatePluginList()
      } catch (e) {
        console.error('--error parsing key', e, this.settings.key)
        new Notice('Invalid licence key for ObsiPulse plugin')
      }
    } else {
      new Notice('Missing licence key for ObsiPulse plugin')
    }

    this.statusBarEl = this.addStatusBarItem()
    this.updateDate()
    this.previousPlugins = new Set(this.app.plugins.enabledPlugins)

    this.debouncedUpdate = debounce(
      (contents: string, filepath: string) => {
        this.updateWordCount(contents, filepath)
      },
      // 400,
      1000,
      false,
    )

    if (this.settings.dayCounts.hasOwnProperty(this.today)) {
      this.updateCounts()
    } else {
      this.currentWordCount = 0
    }

    this.registerEvent(this.app.workspace.on('quick-preview', this.onQuickPreview.bind(this)))

    this.registerInterval(
      window.setInterval(() => {
        if (this.settings.userId) {
          this.statusBarEl.setText(this.currentWordCount + ' words today ')
          this.statusBarEl.onclick = () => {
            this.openObsiPulseProfile()
          }
          this.statusBarEl.setAttribute('style', 'cursor: pointer')
        } else {
          this.statusBarEl.setText('No License Key for ObsiPulse')
          this.statusBarEl.setAttribute('style', 'color: red')
        }
      }, 2000),
    )

    this.registerInterval(
      window.setInterval(() => {
        this.updateDate()
        this.saveSettings()
      }, 5000),
    )

    this.registerInterval(
      window.setInterval(() => {
        this.checkForPluginChanges()
      }, 60000),
    )

    if (this.app.workspace.layoutReady) {
      this.initLeaf()
    } else {
      this.registerEvent(this.app.workspace.on('layout-ready', this.initLeaf.bind(this)))
    }

    this.addCommand({
      id: 'open-obsipulse',
      name: 'Open ObsiPulse Profile',
      callback: () => {
        this.openObsiPulseProfile()
      },
    })

    this.addSettingTab(new ObsiPulseSettingTab(this.app, this))

    this.registerEvent(
      this.app.workspace.on('file-open', (file: TFile) => {
        if (this.hasCountChanged) {
          this.hasCountChanged = false
          if (this.settings.userId) {
            this.updateDb(
              `user/${this.settings.userId}/vault/${this.app.vault.adapter.getName()}/daily-counts`,
              JSON.stringify(this.settings.dayCounts),
            )
          } else {
            console.log('--no db update', this.settings.userId, this.debouncedUpdateDb)
          }
        }
      }),
    )

    // this.registerEvent(
    //   this.app.vault.on('modify', () => {
    //     if (this.hasCountChanged) {
    //       this.hasCountChanged = false
    //       if (this.settings.userId) {
    //         this.updateDb(
    //           `user/${this.settings.userId}/vault/${this.app.vault.adapter.getName()}/daily-counts`,
    //           JSON.stringify(this.settings.dayCounts),
    //         )
    //       } else {
    //         console.log('--no db update', this.settings.userId, this.debouncedUpdateDb)
    //       }
    //     }
    //   }),
    // )

    this.registerEvent(
      this.app.vault.on('modify', async (file: TFile) => {
        // console.log(
        //   '--file',
        //   file.path,
        //   this.settings.publicPaths,
        //   this.settings.publicPaths.includes(file.path),
        // )

        if (this.settings.publicPaths.includes(file.path)) {
          const dataviewCompiler = new DataviewCompiler()
          const fileContent = await this.app.vault.read(file)
          console.time('compile')
          const compiledFile = await dataviewCompiler.compile(file)(fileContent)
          console.timeEnd('compile')

          const hash = encodeURIComponent(file.path)
          const toSync = { stat: file.stat, content: compiledFile, path: file.path }
          // console.log('---filesToSync---', file.path, hash, toSync)
          this.updateDb(
            `user/${this.settings.userId}/vault/${this.app.vault.adapter.getName()}/files/${hash}`,
            JSON.stringify(toSync),
          )
        }
      }),
    )
  }

  onunload(): void {
    console.log('--ObsiPulse Plugin Unloaded')
  }

  openObsiPulseProfile() {
    if (!this.settings.userId) {
      return new Notice('Missing licence key for ObsiPulse plugin')
    }

    window.open(`https://www.obsipulse.com/app/profile/${this.settings.userId}`, '_blank')
  }

  updatePluginList() {
    if (this.settings.userId) {
      const plugins = listAllPlugins(this.app)
      // console.log('---updating plugin list', plugins.length)
      this.updateDb(
        `user/${this.settings.userId}/vault/${this.app.vault.adapter.getName()}/plugins`,
        JSON.stringify(plugins),
      )
    }
  }

  initLeaf(): void {
    if (this.app.workspace.getLeavesOfType(VIEW_TYPE_STATS_TRACKER).length) {
      return
    }
  }

  onQuickPreview(file: TFile, contents: string) {
    if (this.app.workspace.getActiveViewOfType(MarkdownView)) {
      this.debouncedUpdate(contents, file.path)
    }
  }

  //Credit: better-word-count by Luke Leppan (https://github.com/lukeleppan/better-word-count)
  getWordCount(text: string) {
    let words: number = 0

    const matches = text.match(
      /[a-zA-Z0-9_\u0392-\u03c9\u00c0-\u00ff\u0600-\u06ff]+|[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af]+/gm,
    )

    if (matches) {
      for (let i = 0; i < matches.length; i++) {
        if (matches[i].charCodeAt(0) > 19968) {
          words += matches[i].length
        } else {
          words += 1
        }
      }
    }
    // console.log('text----', text, words, text?.length)
    return words
  }

  updateWordCount(contents: string, filepath: string) {
    // console.time('wordCount')
    const curr = this.getWordCount(contents)
    // console.timeEnd('wordCount')

    if (this.settings.dayCounts.hasOwnProperty(this.today)) {
      if (this.settings.todaysWordCount.hasOwnProperty(filepath)) {
        //updating existing file
        this.settings.todaysWordCount[filepath].current = curr
      } else {
        //created new file during session
        this.settings.todaysWordCount[filepath] = { initial: curr, current: curr }
      }
    } else {
      //new day, flush the cache
      this.settings.todaysWordCount = {}
      this.settings.todaysWordCount[filepath] = { initial: curr, current: curr }
    }
    this.updateCounts()
  }

  updateDate() {
    this.today = formatDateToYYYYMMDD(new Date())
  }

  updateCounts() {
    this.currentWordCount = Object.values(this.settings.todaysWordCount)
      .map((wordCount) => Math.max(0, wordCount.current - wordCount.initial))
      .reduce((a, b) => a + b, 0)
    this.settings.dayCounts[this.today] = this.currentWordCount

    console.log('---word count updated', this.currentWordCount, this.settings.dayCounts, this.settings)

    this.hasCountChanged = true
  }

  checkForPluginChanges() {
    const currentPlugins = new Set<string>(this.app.plugins.enabledPlugins)
    let pluginListHasChanged = false
    // Check for newly enabled plugins
    for (const plugin of currentPlugins) {
      if (!this.previousPlugins.has(plugin)) {
        pluginListHasChanged = true
        break
      }
    }

    // Check for disabled plugins
    for (const plugin of this.previousPlugins) {
      if (!currentPlugins.has(plugin)) {
        pluginListHasChanged = true
        break
      }
    }

    if (pluginListHasChanged) {
      this.updatePluginList()
    }

    // Update the previousPlugins set
    this.previousPlugins = currentPlugins
  }

  async updateDb(key: string, value: any) {
    // console.log('---calling update db')
    const body = JSON.stringify({ key, value })

    return requestUrl({
      method: 'POST',
      url: `https://mypi.one/webhook/424317ea-705c-41e4-b97b-441337d46f59`,
      headers: {
        'content-type': 'application/json',
      },
      body,
    })
      .then((result) => {
        console.log('--db update done', result?.status, { key, value })
      })
      .catch(console.error)
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    if (Object.keys(this.settings.dayCounts).length > 0) {
      //ensuring we never reset the data by accident
      await this.saveData(this.settings)
    }
  }
}
