import { zeroPad } from '@/vanillaTS/zeropad';

export const secondsToText = (s: number, short = true): string => {
	const second = zeroPad(Math.trunc(s % 60));
	const minute = zeroPad(Math.floor(s / 60 % 60));
	const hour = Math.floor(s / 60 / 60 % 24);
	const day = Math.floor(s / 60 / 60 / 24);

	let result = '';

	if (day > 0) {
		result += short ? `${day}d, ` : `${day} day${day === 1 ? '' : 's'}, `;
	}

	if (hour > 0) {
		result += short ? `${hour}h, ` : `${hour} hour${hour === 1 ? '' : 's'}, `;
	}

	result += short ?
		`${minute}m, ${second}s` :
		`${minute} minute${minute === '01' ? '' : 's'}, ${second} seconds`;
	return result;
};