import type { TPerson } from '@/types';

export const isId = <T>(arg: unknown): arg is T =>!isNaN(Number(arg)) && Number(arg) >0;

export const isPerson = (arg: string): arg is TPerson => arg === 'Jack' || arg === 'Dave';