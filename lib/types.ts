export interface WordCount {
  initial: number
  current: number
}

export interface DeviceData {
  dayCounts: Record<string, number>
  todaysWordCount: Record<string, WordCount>
}

export interface YourPulseSettings {
  devices: Record<string, DeviceData>
  userId: string
  key?: string
  publicPaths?: string[]
  timezone: string
  privateMode: boolean
  statusBarStats?: boolean
  linkedNotesEnabled?: boolean
  linkedNotesMaxDepth?: number
  linkedNotesMaxContentSize?: number
}

export interface DailyCountItem {
  key: string
  value: number
  date: Date
}
