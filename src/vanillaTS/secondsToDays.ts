/**
 * Convert ms to day, hour, minute, second string
 * @param s number - time in ms
 */
export const secondsToDays = (s: number): string => {
	// TODO type check that s is indeed a number
	const second = Math.trunc(s % 60);
	const minute = Math.floor(s / 60 % 60);
	const hour = Math.floor(s / 60 / 60 % 24);
	const day = Math.floor(s / 60 / 60 / 24);
	return `${day > 0 ? `${day}d`: ``}${day>0 ? ', ':''}${hour > 0 ? `${hour}h`: ``}${hour>0 ? ', ':''}${minute > 0 ? `${minute}m`: ``}${minute>0 && second > 0? ', ':''}${second > 0 ? `${second}s`: ``}`;
};