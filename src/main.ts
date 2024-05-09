import { Debouncer, MarkdownView, Plugin, TFile, debounce, requestUrl } from 'obsidian'
import { VIEW_TYPE_STATS_TRACKER } from './constants'

function formatDateToYYYYMMDD(date: Date) {
  // Extracting individual components
  const year = date.getFullYear()
  let month = String(date.getMonth() + 1) // Months are zero-based!
  let day = String(date.getDate())

  // Ensuring two-digit formats for month and day
  if (+month < 10) {
    month = '0' + month
  }

  if (+day < 10) {
    day = '0' + day
  }

  // Concatenating components in YYYY-MM-DD format
  return `${year}-${month}-${day}`
}

interface WordCount {
  initial: number
  current: number
}

interface DailyStatsSettings {
  dayCounts: Record<string, number>
  todaysWordCount: Record<string, WordCount>
}

const DEFAULT_SETTINGS: DailyStatsSettings = {
  dayCounts: {},
  todaysWordCount: {},
}

export default class DailyStats extends Plugin {
  settings: DailyStatsSettings
  statusBarEl: HTMLElement
  currentWordCount: number
  today: string
  debouncedUpdate: Debouncer<[contents: string, filepath: string], void>

  debouncedUpdateDb: Debouncer<[key: string, value: string], Promise<any>>

  async onload() {
    console.log('--Obsidian Export Stats Plugin Loaded')
    // console.log({
    //   dir: this.app.vault.configDir,
    //   root: this.app.vault.getRoot(),
    //   dirname: __dirname,
    //   name: this.app.vault.adapter.getName()
    //   path: this.app.vault.adapter.basePath
    // })
    await this.loadSettings()

    this.statusBarEl = this.addStatusBarItem()
    this.updateDate()
    if (this.settings.dayCounts.hasOwnProperty(this.today)) {
      this.updateCounts()
    } else {
      this.currentWordCount = 0
    }

    this.debouncedUpdate = debounce(
      (contents: string, filepath: string) => {
        this.updateWordCount(contents, filepath)
      },
      // 400,
      1000,
      false,
    )

    this.debouncedUpdateDb = debounce(
      (key: string, value: string) => {
        this.updateDb(key, value)
      },
      1000,
      false,
    )

    this.registerEvent(this.app.workspace.on('quick-preview', this.onQuickPreview.bind(this)))

    this.registerInterval(
      window.setInterval(() => {
        this.statusBarEl.setText(this.currentWordCount + ' words today ')
      }, 200),
    )

    this.registerInterval(
      window.setInterval(() => {
        this.updateDate()
        this.saveSettings()
      }, 1000),
    )

    if (this.app.workspace.layoutReady) {
      this.initLeaf()
    } else {
      this.registerEvent(this.app.workspace.on('layout-ready', this.initLeaf.bind(this)))
    }
  }

  initLeaf(): void {
    if (this.app.workspace.getLeavesOfType(VIEW_TYPE_STATS_TRACKER).length) {
      return
    }
    this.app.workspace.getRightLeaf(false).setViewState({
      type: VIEW_TYPE_STATS_TRACKER,
    })
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
    this.today = formatDateToYYYYMMDD(new Date())
  }

  updateCounts() {
    this.currentWordCount = Object.values(this.settings.todaysWordCount)
      .map((wordCount) => Math.max(0, wordCount.current - wordCount.initial))
      .reduce((a, b) => a + b, 0)
    this.settings.dayCounts[this.today] = this.currentWordCount
    console.log('---word count updated', this.currentWordCount, this.settings.dayCounts, this.settings)
    if (this.debouncedUpdateDb) {
      this.debouncedUpdateDb(
        `user/1/vault/${this.app.vault.adapter.getName()}/daily-counts`,
        JSON.stringify(this.settings.dayCounts),
      )
    }
  }

  async updateDb(key: string, value: any) {
    console.log('---calling update db')
    return requestUrl({
      method: 'POST',
      url: `https://mypi.one/webhook/424317ea-705c-41e4-b97b-441337d46f59`,
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        key,
        value,
      }),
    })
      .then((result) => {
        console.log('--db update done', result)
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
