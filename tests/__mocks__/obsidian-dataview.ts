import { vi } from 'vitest'

export const getAPI = vi.fn(() => ({
  settings: {
    dataviewJsKeyword: 'dataviewjs',
    inlineQueryPrefix: '=',
    inlineJsQueryPrefix: '$=',
  },
  tryQueryMarkdown: vi.fn(async () => '| Result |\n|---|\n| Mock data |'),
  tryEvaluate: vi.fn(() => ({ toString: () => 'mock-result' })),
  executeJs: vi.fn(async () => {}),
  page: vi.fn(() => ({})),
}))

export type DataviewApi = ReturnType<typeof getAPI>
