import { DailyCountItem } from './types'
import { isValidDate, parseDateString } from './utils'

export const parseDailyCounts = (v: Record<string, any>) => {
  const r = Object.keys(v)
    .map((key) => {
      return { date: parseDateString(key), key, value: v[key] } as DailyCountItem
    })
    .filter((d) => isValidDate(d.date) && Number(d.value))
    .reduce((o, d) => {
      o[d.key] = d
      return o
    }, {} as Record<any, any>) as DailyCountItem[]
  // console.log('---filtering data', v, r)
  return r
}

function isConsecutiveDay(date1: Date, date2: Date) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const timeDiff = d2.getTime() - d1.getTime()
  const dayDiff = timeDiff / (1000 * 3600 * 24)
  return dayDiff === 1
}

export function calculateStreak(dailyCounts: DailyCountItem[]) {
  let currentStreak = 0
  let maxStreak = 0

  // Sort the dailyCounts array by date
  dailyCounts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  for (let i = 0; i < dailyCounts.length; i++) {
    if (dailyCounts[i].value > 0) {
      if (i === 0 || isConsecutiveDay(dailyCounts[i - 1].date, dailyCounts[i]?.date)) {
        currentStreak++
      } else {
        currentStreak = 1
      }
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  return currentStreak
}

export const calculateInLastXDays = (dailyCounts: DailyCountItem[], days: number): number => {
  const today = new Date()
  const daysAgo = new Date(today)
  daysAgo.setDate(today.getDate() - days)

  const totalCount = dailyCounts
    .filter((d) => new Date(d.date) >= daysAgo)
    .reduce((acc, d) => acc + d.value, 0)

  return totalCount
}

export const calculateDailyAverage = (dailyCounts: DailyCountItem[]) => {
  const values = dailyCounts.map((d) => d.value).filter(Boolean)
  return values.length ? Math.round(values.reduce((a, b) => a + b) / values.length) : 0
}
