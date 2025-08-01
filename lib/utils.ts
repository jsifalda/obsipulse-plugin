import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const convertObjectToArray = (obj: Record<string, any>) => {
  return Object.entries(obj).map(([key, value]) => value)
}

export function isValidDate(d: any) {
  return d instanceof Date && !isNaN(d as any)
}

export const parseDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}
