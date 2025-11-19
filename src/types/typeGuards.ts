import type { TPerson } from '@/types'
import { HttpCode } from '@/types/const_http'

export const isId = <T>(arg: unknown): arg is T => !Number.isNaN(Number(arg)) && Number(arg) > 0

export const isPerson = (arg: string): arg is TPerson => arg === 'Jack' || arg === 'Dave'

export const isHttpCode = (arg: number | string): arg is (typeof HttpCode)[keyof typeof HttpCode] => Object.values(HttpCode).includes(arg as (typeof HttpCode)[keyof typeof HttpCode])
