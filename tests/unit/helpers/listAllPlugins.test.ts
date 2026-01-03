import { describe, it, expect } from 'vitest'
import { listAllPlugins } from '@/src/helpers/listAllPlugins'

describe('listAllPlugins', () => {
  const createMockApp = (plugins: Record<string, any>) => ({
    plugins: {
      plugins,
    },
  })

  describe('basic functionality', () => {
    it('should return empty array when no plugins are installed', () => {
      const app = createMockApp({})

      const result = listAllPlugins(app as any)

      expect(result).toEqual([])
    })

    it('should return single plugin info', () => {
      const app = createMockApp({
        'my-plugin': {
          manifest: {
            id: 'my-plugin',
            name: 'My Plugin',
            version: '1.0.0',
          },
        },
      })

      const result = listAllPlugins(app as any)

      expect(result).toEqual([
        {
          id: 'my-plugin',
          name: 'My Plugin',
          version: '1.0.0',
        },
      ])
    })

    it('should return multiple plugins info', () => {
      const app = createMockApp({
        'plugin-a': {
          manifest: {
            id: 'plugin-a',
            name: 'Plugin A',
            version: '1.0.0',
          },
        },
        'plugin-b': {
          manifest: {
            id: 'plugin-b',
            name: 'Plugin B',
            version: '2.1.0',
          },
        },
        'plugin-c': {
          manifest: {
            id: 'plugin-c',
            name: 'Plugin C',
            version: '0.5.3',
          },
        },
      })

      const result = listAllPlugins(app as any)

      expect(result).toHaveLength(3)
      expect(result).toContainEqual({
        id: 'plugin-a',
        name: 'Plugin A',
        version: '1.0.0',
      })
      expect(result).toContainEqual({
        id: 'plugin-b',
        name: 'Plugin B',
        version: '2.1.0',
      })
      expect(result).toContainEqual({
        id: 'plugin-c',
        name: 'Plugin C',
        version: '0.5.3',
      })
    })
  })

  describe('data transformation', () => {
    it('should only extract id, name, and version from manifest', () => {
      const app = createMockApp({
        'full-plugin': {
          manifest: {
            id: 'full-plugin',
            name: 'Full Plugin',
            version: '1.2.3',
            description: 'A description that should be ignored',
            author: 'Author Name',
            authorUrl: 'https://example.com',
            minAppVersion: '0.15.0',
          },
          someOtherProperty: 'ignored',
        },
      })

      const result = listAllPlugins(app as any)

      expect(result).toEqual([
        {
          id: 'full-plugin',
          name: 'Full Plugin',
          version: '1.2.3',
        },
      ])
      expect(result[0]).not.toHaveProperty('description')
      expect(result[0]).not.toHaveProperty('author')
    })

    it('should handle plugins with various version formats', () => {
      const app = createMockApp({
        'semver-plugin': {
          manifest: {
            id: 'semver-plugin',
            name: 'Semver Plugin',
            version: '1.2.3-beta.1',
          },
        },
        'simple-plugin': {
          manifest: {
            id: 'simple-plugin',
            name: 'Simple Plugin',
            version: '1.0',
          },
        },
      })

      const result = listAllPlugins(app as any)

      expect(result).toContainEqual({
        id: 'semver-plugin',
        name: 'Semver Plugin',
        version: '1.2.3-beta.1',
      })
      expect(result).toContainEqual({
        id: 'simple-plugin',
        name: 'Simple Plugin',
        version: '1.0',
      })
    })
  })
})
