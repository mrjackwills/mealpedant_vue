import { TPerson, type TPersonVal } from '@/types'
import { HttpCode } from '@/types/const_http'

export const isPerson = (arg: string): arg is TPersonVal => arg === TPerson.DAVE || arg === TPerson.JACK

export const isHttpCode = (arg: number | string): arg is (typeof HttpCode)[keyof typeof HttpCode] => Object.values(HttpCode).includes(arg as (typeof HttpCode)[keyof typeof HttpCode])
