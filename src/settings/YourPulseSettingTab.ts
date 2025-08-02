import { App, PluginSettingTab, Setting } from 'obsidian'

export class YourPulseSettingTab extends PluginSettingTab {
  plugin: YourPulse

  constructor(app: App, plugin: YourPulse) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()

    // Check if license key is valid
    const isValidLicense = !!(this.plugin.settings.key && parseLicenseKey(this.plugin.settings.key))

    const privateModeSetting = new Setting(containerEl)
      .setName('Private Mode')
      .setDesc('Hide your profile from public view and leaderboards')
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.privateMode)
          .setDisabled(!isValidLicense)
          .onChange(async (value) => {
            this.plugin.settings.privateMode = value

            await this.plugin.saveSettings()
            this.display()
          })
      })

    if (!isValidLicense) {
      privateModeSetting.setClass('private-mode-setting')
    }

    privateModeSetting.descEl.createEl('div', {
      text: isValidLicense
        ? '✅ Private mode is available with your license key.'
        : '⚠️ This feature requires a valid license. Please purchase a license to enable private mode.',
      cls: 'setting-item-description',
    })

    const licenceOptions = new Setting(containerEl)
      .setName('License key')
      .setDesc('Get access to premium features including private mode!')

    licenceOptions.descEl.createEl('div', {
      text: '(Please restart Obsidian after changing the key!!)',
      cls: 'setting-item-description',
    })

    licenceOptions.addText((text) =>
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

    if (!this.plugin.settings.privateMode) {
      const filesOptions = new Setting(containerEl)
        .setName('Files to be published')
        .setDesc('List of files to be shared publicly via YourPulse.com profile (one per line).')
      filesOptions.descEl.createEl('div', {
        text: 'You can also mark a note for publishing by adding `yp-publish: true` to its file properties (frontmatter)',
        cls: 'setting-item-description',
      })
      filesOptions.addTextArea((textArea) =>
        textArea
          .setPlaceholder('public-path.md\n/public-dir\n!/public-dir/not-public-path.md')
          .setValue(this.plugin.settings.publicPaths.join('\n'))
          .onChange(async (value) => {
            this.plugin.settings.publicPaths = value.split('\n')
            await this.plugin.saveData(this.plugin.settings)
          }),
      )
    }

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

    new Setting(containerEl)
      .setName('Linked Notes Resolution')
      .setDesc('Enable resolution of linked notes (![[note]]) before file upload')
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.linkedNotesEnabled ?? true).onChange(async (value) => {
          this.plugin.settings.linkedNotesEnabled = value
          await this.plugin.saveSettings()
        })
      })

    if (this.plugin.settings.linkedNotesEnabled !== false) {
      new Setting(containerEl)
        .setName('Max Resolution Depth')
        .setDesc('Maximum depth for resolving nested linked notes (default: 3)')
        .addSlider((slider) => {
          slider
            .setLimits(1, 10, 1)
            .setValue(this.plugin.settings.linkedNotesMaxDepth ?? 3)
            .setDynamicTooltip()
            .onChange(async (value) => {
              this.plugin.settings.linkedNotesMaxDepth = value
              await this.plugin.saveSettings()
            })
        })

      new Setting(containerEl)
        .setName('Max Content Size (MB)')
        .setDesc('Maximum size for resolved note content in megabytes (default: 1MB)')
        .addSlider((slider) => {
          slider
            .setLimits(0.1, 10, 0.1)
            .setValue((this.plugin.settings.linkedNotesMaxContentSize ?? 1000000) / 1000000)
            .setDynamicTooltip()
            .onChange(async (value) => {
              this.plugin.settings.linkedNotesMaxContentSize = Math.round(value * 1000000)
              await this.plugin.saveSettings()
            })
        })
    }

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
