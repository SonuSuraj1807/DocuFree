import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen - 3) + '...'
}

export const ACCEPTED_FILE_TYPES: Record<string, string[]> = {
  'application/pdf':                                                      ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword':                                                   ['.doc'],
  'image/png':                                                            ['.png'],
  'image/jpeg':                                                           ['.jpg', '.jpeg'],
  'image/gif':                                                            ['.gif'],
  'image/webp':                                                           ['.webp'],
  'text/plain':                                                           ['.txt'],
}

export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100 MB
