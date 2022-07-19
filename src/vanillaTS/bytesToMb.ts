export const bytes_to_mb = (x: number): string => {
	return (x / (1024 * 1024)).toFixed(2);
};