import { genesisDate } from './globalConst'

// Convert bytes to x.xx in megabytes
export const bytes_to_mb = (x: number): string => (x / (1024 * 1024)).toFixed(2)

type Months = Record<string, string>
const months: Months = {
	Jan: `01`,
	Feb: `02`,
	Mar: `03`,
	Apr: `04`,
	May: `05`,
	Jun: `06`,
	Jul: `07`,
	Aug: `08`,
	Sep: `09`,
	Oct: `10`,
	Nov: `11`,
	Dec: '12',
} as const

/*
 * Convert a date string to format yyyy-mm-dd
 * e,g, Sat May 09 2015 01:00:00 GMT+0100 (British Summer Time) -> 2015-05-09
 */
export const convert_date = (x: string): string => `${x.slice(11, 15)}-${months[x.slice(4, 7)]}-${x.slice(8, 10)}`

// Uppercase the first letter of every word in a string
export function formatCategoryName (categoryName: string): string {
	return categoryName
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ')
}

// zeropad numbers, 00-99
export const zeroPad = (unit: number): string => String(unit).padStart(2, '0')

// Convert seconds to a human readable format
export function secondsToText (s: number, short = true): string {
	const second = zeroPad(Math.trunc(s % 60))
	const minute = zeroPad(Math.floor(s / 60 % 60))
	const hour = Math.floor(s / 60 / 60 % 24)
	const day = Math.floor(s / 60 / 60 / 24)

	let result = ''

	if (day > 0) {
		result += short ? `${day}d, ` : `${day} day${day === 1 ? '' : 's'}, `
	}
	if (hour > 0) {
		result += short ? `${hour}h, ` : `${hour} hour${hour === 1 ? '' : 's'}, `
	}

	result += short
		? `${minute}m, ${second}s`
		: `${minute} minute${minute === '01' ? '' : 's'}, ${second} seconds`
	return result
}

// Todays date as string yyyy-mm-dd
export function todayDateString (): string {
	return new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}

// Genesis date as string yyyy-mm-dd
export function genesisDateString (): string {
	return new Date(genesisDate).toISOString().slice(0, 10)
}
