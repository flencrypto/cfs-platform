import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatNumber(
  number: number,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale).format(number)
}

export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  return `${value.toFixed(decimals)}%`
}

export function formatDate(
  date: Date | string,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(dateObj)
}

export function formatDateTime(
  date: Date | string,
  locale: string = 'en-US'
): string {
  return formatDate(date, locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(
  date: Date | string,
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  return formatDate(dateObj, locale)
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substr(2, 8).toUpperCase()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength).trim() + '...'
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidWalletAddress(address: string): boolean {
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
  return ethAddressRegex.test(address)
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  
  // Fallback for older browsers
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  
  try {
    document.execCommand('copy')
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(err)
  } finally {
    document.body.removeChild(textArea)
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

export function isOver18(birthDate: Date): boolean {
  return calculateAge(birthDate) >= 18
}

export function getTimeUntil(date: Date): string {
  const now = new Date()
  const diffInMs = date.getTime() - now.getTime()
  
  if (diffInMs <= 0) {
    return 'Started'
  }
  
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  
  if (diffInDays > 0) {
    return `${diffInDays}d ${diffInHours % 24}h`
  } else if (diffInHours > 0) {
    return `${diffInHours}h ${diffInMinutes % 60}m`
  } else {
    return `${diffInMinutes}m`
  }
}

export function getContestStatusColor(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'text-gray-500'
    case 'ACTIVE':
      return 'text-green-500'
    case 'LOCKED':
      return 'text-yellow-500'
    case 'SETTLED':
      return 'text-blue-500'
    case 'CANCELLED':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'text-yellow-500'
    case 'PROCESSING':
      return 'text-blue-500'
    case 'COMPLETED':
      return 'text-green-500'
    case 'FAILED':
      return 'text-red-500'
    case 'REFUNDED':
      return 'text-gray-500'
    default:
      return 'text-gray-500'
  }
}

export function getKycStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'text-yellow-500'
    case 'IN_PROGRESS':
      return 'text-blue-500'
    case 'APPROVED':
      return 'text-green-500'
    case 'REJECTED':
      return 'text-red-500'
    case 'EXPIRED':
      return 'text-gray-500'
    default:
      return 'text-gray-500'
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  return fn().catch(err => {
    if (retries > 0) {
      return sleep(delay).then(() => retry(fn, retries - 1, delay * 2))
    }
    throw err
  })
}

export function parseError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }
  return 'An unknown error occurred'
}
