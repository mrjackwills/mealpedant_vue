import type { TPerson } from '@/types';
import { HttpCode } from './const_http';

export const isId = <T>(arg: unknown): arg is T => !isNaN(Number(arg)) && Number(arg) > 0;

export const isPerson = (arg: string): arg is TPerson => arg === 'Jack' || arg === 'Dave';

export const isHttpCode = (arg: number | string): arg is HttpCode => Object.values(HttpCode).includes(arg as HttpCode);
