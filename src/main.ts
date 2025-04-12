import {
  App,
  Debouncer,
  MarkdownView,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  addIcon,
  debounce,
  requestUrl,
} from 'obsidian'
import { v4 as uuidv4 } from 'uuid'

import { ObsiPulseIcon } from './assets/ObsiPulseIcon'
import { DataviewCompiler } from './compilers/DataViewCompiler'
import { VIEW_TYPE_STATS_TRACKER } from './constants'
import { createProfileUrl } from './helpers/createProfileUrl'
import { Encryption } from './helpers/Encryption'
import { getLocalTodayDate } from './helpers/getLocalTodayDate'
import { listAllPlugins } from './helpers/listAllPlugins'
import './styles.css'

const getTimezone = (): string | undefined => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (e) {
    console.error('--error getting timezone', e)
    return undefined
  }
}

const getLeaderBoardUser = (
  userId: string,
): Promise<{
  user: { ranking: number; userId: string; vaults: { name: string; ranking: number }[] } | undefined
  totalCount: number
}> => {
  return new Promise((resolve, reject) => {
    requestUrl({
      method: 'GET',
      url: `https://www.yourpulse.cc/app/api/leaderboard?date=${getLocalTodayDate()}`,
      headers: {
        'content-type': 'application/json',
      },
    })
      .then((result) => {
        if (result?.status === 200) {
          const response = JSON.parse(JSON.stringify(result))?.json
          resolve({
            user: response?.rankings.find((user: any) => user.userId === userId),
            totalCount: response?.rankings?.length || 0,
          })
        } else {
          reject(new Error('Invalid status'))
        }
      })
      .catch(reject)
  })
}

class YourPulseSettingTab extends PluginSettingTab {
  plugin: YourPulse

  constructor(app: App, plugin: YourPulse) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()

    new Setting(containerEl)
      .setName('Private Mode')
      .setDesc('Hide your profile from public view and leaderboards')
      .addToggle((toggle) => {
        toggle
          // .setValue(this.plugin.settings.privateMode)
          .setValue(false)
          .setDisabled(true)
        // .onChange(async (value) => {
        //   this.plugin.settings.privateMode = value
        //   await this.plugin.saveSettings()
        // })
      })
      .setClass('private-mode-setting')
      .descEl.createEl('div', {
        text: '⚠️ This feature requires a valid license. Please purchase a license to enable private mode.',
        cls: 'setting-item-description',
      })

    const licenceOptions = new Setting(containerEl)
      .setName('License key')
      .setDesc('Get access to premium features including private mode')
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

    if (!this.plugin.settings.key) {
      licenceOptions.addButton((button) => {
        button
          .setButtonText('Request License')
          .setCta()
          .onClick(() => {
            window.open('mailto:sifalda.jiri@gmail.com?subject=YourPulse%20License%20Request', '_blank')
          })
      })
    }

    new Setting(containerEl)
      .setName('Files to be published')
      .setDesc('List of files to be shared publicly via YourPulse.com profile (one per line)')
      .addTextArea((textArea) =>
        textArea
          .setPlaceholder('public-path.md\n/public-dir\n!/public-dir/not-public-path.md')
          .setValue(this.plugin.settings.publicPaths.join('\n'))
          .onChange(async (value) => {
            this.plugin.settings.publicPaths = value.split('\n')
            await this.plugin.saveData(this.plugin.settings)
          }),
      )

    new Setting(containerEl).setName('Version').setDesc(this.plugin.manifest.version)
    new Setting(containerEl).setName('User ID').setDesc(this.plugin.settings.userId)

    new Setting(containerEl)
      .setName('Contact Me')
      .setDesc(
        'If you have any questions regarding this plugin, please contact me directly on x.com, or open an issue on GitHub',
      )
      .addButton((button) => {
        button
          .setButtonText('Contact Me on X')
          .setCta()
          .onClick(() => {
            window.open('https://jsifalda.link/ZfxF9yv', '_blank')
          })
      })
      .addButton((button) => {
        button
          .setButtonText('Open Github')
          .setCta()
          .onClick(() => {
            window.open('https://jsifalda.link/VGTiZNX', '_blank')
          })
      })
  }
}

interface WordCount {
  initial: number
  current: number
}

interface YourPulseSettings {
  dayCounts: Record<string, number>
  todaysWordCount: Record<string, WordCount>

  userId: string

  key?: string
  publicPaths?: string[]
  timezone: string
  // privateMode: boolean
}

const DEFAULT_SETTINGS: YourPulseSettings = {
  dayCounts: {},
  todaysWordCount: {},
  userId: uuidv4(),
  publicPaths: [],
  timezone: getTimezone(),
  // privateMode: false,
}

interface ParsedLicenseKey {
  key: string
  userId: string
}

const parseLicenseKey = (key: string) => {
  const parsedKey = Encryption().decrypt(key)

  try {
    const value = JSON.parse(parsedKey) as ParsedLicenseKey
    // console.log({ value })
    return value
  } catch (e) {
    console.error('--error decrypting key', e)
  }
}

export default class YourPulse extends Plugin {
  settings: YourPulseSettings
  statusBarEl: HTMLElement
  leaderboardPosition = ''
  currentWordCount: number
  today: string
  debouncedUpdate?: Debouncer<[contents: string, filepath: string], void>

  debouncedUpdateDb?: Debouncer<[key: string, value: string], Promise<any>>

  private hasCountChanged: boolean = false

  private previousPlugins: Set<string> = new Set()

  async onload() {
    console.log('YourPulse Plugin Loaded', this.manifest.version)

    addIcon(ObsiPulseIcon.name, ObsiPulseIcon.html)

    await this.loadSettings()

    this.addRibbonIcon(ObsiPulseIcon.name, 'Open YourPulse Profile', () => {
      this.openYourPulseProfile('obsidian-plugin-ribbon')
    })

    if (this.settings.key) {
      try {
        const parsedKey = parseLicenseKey(this.settings.key)
        this.settings.userId = parsedKey.userId
      } catch (e) {
        console.error('--error parsing key', e, this.settings.key)
        new Notice('Invalid license key for YourPulse plugin')
      }
    }
    // else {
    //   new Notice('Missing license key for YourPulse plugin')
    // }

    this.updatePluginList()

    this.initStatusBar()

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
      id: 'obsipulse-open-profile',
      name: 'Open public profile',
      callback: () => {
        this.openYourPulseProfile('obsidian-plugin-command')
      },
    })

    this.addSettingTab(new YourPulseSettingTab(this.app, this))

    this.registerEvent(
      this.app.workspace.on('file-open', (file: TFile) => {
        if (this.hasCountChanged) {
          this.hasCountChanged = false
          if (this.settings.userId) {
            this.updateDb(
              `user/${this.settings.userId}/vault/${this.app.vault.adapter.getName()}/daily-counts`,
              JSON.stringify(this.settings.dayCounts),
            )
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
          this.updateDb(
            `user/${this.settings.userId}/vault/${this.app.vault.adapter.getName()}/files/${hash}`,
            JSON.stringify(toSync),
          )
        }
      }),
    )
  }

  onunload(): void {
    console.log('--YourPulse Plugin Unloaded')
  }

  initStatusBar() {
    this.statusBarEl = this.addStatusBarItem()
    this.statusBarEl.setAttribute('style', 'cursor: pointer')

    this.statusBarEl.onclick = () => {
      this.openYourPulseProfile('obsidian-plugin-statusbar')
    }

    const initDailyCount = () => {
      this.statusBarEl.setText(
        `YourPulse Rank: #${this.leaderboardPosition} (${this.currentWordCount || 0} words today)`,
      )
      this.statusBarEl.setAttribute(
        'title',
        `You rank #${this.leaderboardPosition} users today. (Click to open YourPulse profile)`,
      )
    }

    this.registerInterval(
      window.setInterval(() => {
        initDailyCount()
      }, 4000),
    )

    const initLeaderboard = () => {
      getLeaderBoardUser(this.settings.userId)
        .then(({ totalCount, user }) => {
          if (user) {
            this.leaderboardPosition = `${user.ranking} out of ${totalCount}`
          }
        })
        .catch(console.error)
    }

    initLeaderboard()

    this.registerInterval(
      window.setInterval(() => {
        initLeaderboard()
      }, 60 * 1000 * 5), // 5 minutes
    )
  }

  openYourPulseProfile(ref: string) {
    window.open(createProfileUrl(this.settings.userId, ref), '_blank')
  }

  updatePluginList() {
    if (this.settings.userId) {
      const plugins = listAllPlugins(this.app)
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
    return words
  }

  updateWordCount(contents: string, filepath: string) {
    const curr = this.getWordCount(contents)

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
    this.today = getLocalTodayDate()

    //reset count if new day happen
    if (this.settings.dayCounts[this.today] === undefined) {
      this.settings.dayCounts[this.today] = 0
      this.settings.todaysWordCount = {}
    }
  }

  updateCounts() {
    this.currentWordCount = Object.values(this.settings.todaysWordCount)
      .map((wordCount) => Math.max(0, wordCount.current - wordCount.initial))
      .reduce((a, b) => a + b, 0)
    this.settings.dayCounts[this.today] = this.currentWordCount

    // console.log('---word count updated', this.currentWordCount, this.settings.dayCounts, this.settings)

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
    const body = JSON.stringify({ key, value })

    return (
      requestUrl({
        method: 'POST',
        url: `https://mypi.one/webhook/424317ea-705c-41e4-b97b-441337d46f59`,
        headers: {
          'content-type': 'application/json',
        },
        body,
      })
        // .then((result) => {
        //   console.log('--db update done', result?.status, { key, value })
        // })
        .catch(console.error)
    )
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    this.settings.timezone = getTimezone() // always override timezone with current
  }

  async saveSettings() {
    if (Object.keys(this.settings).length > 0) {
      // if (Object.keys(this.settings.dayCounts).length > 0) {
      await this.saveData(this.settings)
    }
  }
}
