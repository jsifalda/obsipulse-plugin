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
import { getLeaderBoardUser } from './helpers/getLeaderBoardUser'
import { getLocalTodayDate } from './helpers/getLocalTodayDate'
import { hasYpPublishFileProperty } from './helpers/isYpPublish'
import { listAllPlugins } from './helpers/listAllPlugins'
import './styles.css'
import { ApiInterceptor } from './utils/apiInterceptor'

const getTimezone = (): string | undefined => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (e) {
    console.error('--error getting timezone', e)
    return undefined
  }
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

    // Check if license key is valid
    const isValidLicense = this.plugin.settings.key && parseLicenseKey(this.plugin.settings.key)

    new Setting(containerEl)
      .setName('Private Mode')
      .setDesc('Hide your profile from public view and leaderboards')
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.privateMode)
          .setDisabled(!isValidLicense)
          .onChange(async (value) => {
            this.plugin.settings.privateMode = value
            await this.plugin.saveSettings()
          })
      })
      .setClass('private-mode-setting')
      .descEl.createEl('div', {
        text: isValidLicense
          ? '✅ Private mode is available with your license key.'
          : '⚠️ This feature requires a valid license. Please purchase a license to enable private mode.',
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
            if (parsedKey) {
              this.plugin.settings.userId = parsedKey.userId
              this.plugin.updatePluginList()
              // Refresh the settings display to update private mode toggle
              this.display()
            }
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
      .setDesc(
        'List of files to be shared publicly via YourPulse.com profile (one per line). You can also mark a note for publishing by adding `yp-publish: true` to its file properties (frontmatter).',
      )
      .addTextArea((textArea) =>
        textArea
          .setPlaceholder('public-path.md\n/public-dir\n!/public-dir/not-public-path.md')
          .setValue(this.plugin.settings.publicPaths.join('\n'))
          .onChange(async (value) => {
            this.plugin.settings.publicPaths = value.split('\n')
            await this.plugin.saveData(this.plugin.settings)
          }),
      )

    new Setting(containerEl)
      .setName('Hide Status Bar Stats')
      .setDesc(
        'Hide the status bar stats for this plugin. Useful if you want to keep your workspace clean and distraction-free.',
      )
      .addToggle((toggle) => {
        toggle.setValue(!this.plugin.settings.statusBarStats).onChange(async (value) => {
          this.plugin.settings.statusBarStats = !value
          this.plugin.updateStatusBarIfNeeded()
          await this.plugin.saveSettings()
        })
      })

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

interface DeviceData {
  dayCounts: Record<string, number>
  todaysWordCount: Record<string, WordCount>
}

interface YourPulseSettings {
  devices: Record<string, DeviceData>
  userId: string
  key?: string
  publicPaths?: string[]
  timezone: string
  privateMode: boolean
  statusBarStats?: boolean
}

const DEFAULT_SETTINGS: YourPulseSettings = {
  devices: {},
  userId: uuidv4(),
  publicPaths: [],
  timezone: getTimezone(),
  privateMode: false,
  statusBarStats: true,
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

  private deviceName: string

  private apiInterceptor: ApiInterceptor

  private getDeviceName(): string {
    if (this.deviceName) {
      return this.deviceName
    }

    // @ts-ignore
    const syncPlugin = this.app.internalPlugins.plugins['sync'].instance
    this.deviceName = syncPlugin.deviceName ? syncPlugin.deviceName : syncPlugin.getDefaultDeviceName()

    if (!this.deviceName) {
      this.deviceName = this.app.vault.adapter.getName() || uuidv4()
    }

    console.log('[yourpulse] device name:', this.deviceName)

    return this.deviceName
  }

  private ensureDeviceExists(): void {
    if (!this.settings.devices) {
      this.settings.devices = {}
    }

    const deviceName = this.getDeviceName()
    if (!this.settings.devices[deviceName]) {
      this.settings.devices[deviceName] = {
        dayCounts: {},
        todaysWordCount: {},
      }
    }
    this.deviceName = deviceName
  }

  private getLocalData(): DeviceData {
    this.ensureDeviceExists()
    return this.settings.devices[this.deviceName]
  }

  private getFlattenedDayCountsForDb(): Record<string, number> {
    // Combine counts from all devices
    const combined: Record<string, number> = {}

    // For each device
    Object.values(this.settings.devices).forEach((deviceData) => {
      // For each day in this device
      Object.entries(deviceData.dayCounts).forEach(([day, count]) => {
        // Add count to the total for this day
        combined[day] = (combined[day] || 0) + count
      })
    })

    return combined
  }

  async onload() {
    console.log('[yourpulse] Plugin Loaded', this.manifest.version)

    addIcon(ObsiPulseIcon.name, ObsiPulseIcon.html)

    await this.loadSettings()

    // Initialize API interceptor for private mode
    this.apiInterceptor = new ApiInterceptor({ plugin: this })

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

    // @ts-ignore
    this.previousPlugins = new Set(this.app.plugins.enabledPlugins)

    this.debouncedUpdate = debounce(
      (contents: string, filepath: string) => {
        this.updateWordCount(contents, filepath)
      },
      // 400,
      1000,
      false,
    )
    this.ensureDeviceExists()
    const deviceData = this.getLocalData()
    if (deviceData.dayCounts.hasOwnProperty(this.today)) {
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
      // @ts-ignore
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
              JSON.stringify(this.getFlattenedDayCountsForDb()),
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

        if (
          this.settings.publicPaths.includes(file.path) ||
          (await hasYpPublishFileProperty(file, this.app))
        ) {
          const dataviewCompiler = new DataviewCompiler()
          const fileContent = await this.app.vault.read(file)
          console.time('compile')
          const compiledFile = await dataviewCompiler.compile(file)(fileContent)
          console.timeEnd('compile')

          const hash = encodeURIComponent(file.path)
          const toSync = { stat: file.stat, content: compiledFile, path: file.path }
          this.updateFilesDb(
            `user/${this.settings.userId}/vault/${this.app.vault.adapter.getName()}/files/${hash}`,
            JSON.stringify(toSync),
          )
        }
      }),
    )
  }

  onunload(): void {
    console.log('[yourpulse] Plugin Unloaded')
  }

  updateStatusBarIfNeeded() {
    console.log('[yourpulse] updating statusbar', this.settings.statusBarStats)

    if (this.settings.statusBarStats) {
      if (!this.statusBarEl) {
        this.addStatusBar()
      }
    } else {
      if (this.statusBarEl) {
        this.statusBarEl.remove()
        this.statusBarEl = undefined
        // console.log('[yourpulse] status bar stats removed')
      }
    }
  }

  addStatusBar() {
    this.statusBarEl = this.addStatusBarItem()
    this.statusBarEl.setAttribute('style', 'cursor: pointer')

    this.statusBarEl.onclick = () => {
      this.openYourPulseProfile('obsidian-plugin-statusbar')
    }

    this.updateStatusBarText()
    console.log('[yourpulse] status bar stats initialized')
  }

  updateStatusBarText() {
    if (this.statusBarEl) {
      this.statusBarEl.setText(
        `YourPulse Rank: #${this.leaderboardPosition} (${this.currentWordCount || 0} words today)`,
      )
      this.statusBarEl.setAttribute(
        'title',
        `You rank #${this.leaderboardPosition} users today. (Click to open YourPulse profile)`,
      )
    }
  }

  initStatusBar() {
    this.registerInterval(
      window.setInterval(() => {
        this.updateStatusBarText()
      }, 4000),
    )

    const initLeaderboard = () => {
      getLeaderBoardUser(this.settings.userId, this)
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
      }, 60 * 1000 * 15), // 15 minutes
    )

    if (this.settings.statusBarStats) {
      this.addStatusBar()
    }
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
    this.ensureDeviceExists()
    const deviceData = this.getLocalData()
    const curr = this.getWordCount(contents)

    if (deviceData.dayCounts.hasOwnProperty(this.today)) {
      if (deviceData.todaysWordCount.hasOwnProperty(filepath)) {
        //updating existing file
        deviceData.todaysWordCount[filepath].current = curr
      } else {
        //created new file during session
        deviceData.todaysWordCount[filepath] = { initial: curr, current: curr }
      }
    } else {
      //new day, flush the cache
      deviceData.todaysWordCount = {}
      deviceData.todaysWordCount[filepath] = { initial: curr, current: curr }
    }
    this.updateCounts()
  }

  updateDate() {
    this.today = getLocalTodayDate()
    this.ensureDeviceExists()
    const deviceData = this.getLocalData()

    //reset count if new day happen
    if (deviceData.dayCounts[this.today] === undefined) {
      deviceData.dayCounts[this.today] = 0
      deviceData.todaysWordCount = {}
    }
  }

  updateCounts() {
    this.ensureDeviceExists()
    const deviceData = this.getLocalData()

    this.currentWordCount = Object.values(deviceData.todaysWordCount)
      .map((wordCount) => Math.max(0, wordCount.current - wordCount.initial))
      .reduce((a, b) => a + b, 0)
    deviceData.dayCounts[this.today] = this.currentWordCount

    this.hasCountChanged = true
  }
  checkForPluginChanges() {
    // @ts-ignore - App type definition issue
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
    return this.apiInterceptor.executeIfAllowed(async () => {
      const body = JSON.stringify({ key, value })

      return requestUrl({
        method: 'POST',
        url: `https://mypi.one/webhook/424317ea-705c-41e4-b97b-441337d46f59`,
        headers: {
          'content-type': 'application/json',
        },
        body,
      }).catch(console.error)
    })
  }
  async updateFilesDb(key: string, value: any) {
    return this.apiInterceptor.executeIfAllowed(async () => {
      const body = JSON.stringify({ key, value })

      return requestUrl({
        method: 'POST',
        url: `https://mypi.one/webhook/9e631d01-6a29-4752-99c3-9fea9244b163`,
        headers: {
          'content-type': 'application/json',
        },
        body,
      }).catch(console.error)
    })
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    this.settings.timezone = getTimezone() // always override timezone with current

    // Migrate old data format to new nested structure if needed
    this.ensureDeviceExists()

    // If we have old data format, migrate it to the device-based structure
    if ('dayCounts' in this.settings || 'todaysWordCount' in this.settings) {
      const deviceName = this.getDeviceName()

      // @ts-ignore - Handling old format migration
      if (this.settings.dayCounts) {
        if (!this.settings.devices[deviceName]) {
          this.settings.devices[deviceName] = {
            dayCounts: {},
            todaysWordCount: {},
          }
        }
        // @ts-ignore - Handling old format migration
        this.settings.devices[deviceName].dayCounts = this.settings.dayCounts
      }

      // @ts-ignore - Handling old format migration
      if (this.settings.todaysWordCount) {
        if (!this.settings.devices[deviceName]) {
          this.settings.devices[deviceName] = {
            dayCounts: {},
            todaysWordCount: {},
          }
        }
        // @ts-ignore - Handling old format migration
        this.settings.devices[deviceName].todaysWordCount = this.settings.todaysWordCount
      }

      // // @ts-ignore - Cleanup old format
      // delete this.settings.dayCounts
      // // @ts-ignore - Cleanup old format
      // delete this.settings.todaysWordCount
    }
  }

  async saveSettings() {
    if (Object.keys(this.settings).length > 0) {
      // console.time('[yourpulse] saveSettings')

      if (this.settings.devices && Object.keys(this.settings.devices).length > 0) {
        try {
          // check for another device in data, and merge it with current one
          const tempt = await this.loadData()
          if (tempt && tempt.devices) {
            delete tempt.devices[this.deviceName]

            if (Object.keys(tempt.devices).length > 0) {
              const devices = Object.keys(tempt.devices)
              devices.forEach((device) => {
                this.settings.devices[device] = {
                  ...(tempt.devices[device] || {}),
                  ...(this.settings.devices[device] || {}),
                }
              })

              // console.log('--merged devices', this.settings.devices)
            }
          }
        } catch (e) {
          console.error('[yourpulse] error merging devices settings', e)
        }
      }

      await this.saveData(this.settings)
      // console.timeEnd('[yourpulse] saveSettings')
    }
  }
}
