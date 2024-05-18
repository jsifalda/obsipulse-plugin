import { App } from 'obsidian'

export function listAllPlugins(app: App) {
  const plugins = Object.values(app.plugins.plugins).map((plugin) => ({
    id: plugin.manifest.id,
    name: plugin.manifest.name,
    version: plugin.manifest.version,
  }))
  return plugins
}
