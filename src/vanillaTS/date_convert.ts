interface Months {
	[key: string]: string
  }
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
	Dec: '12'
} as const;

export const convert_date = (x: string): string => {
	return `${x.slice(11, 15)}-${months[x.slice(4, 7)]}-${x.slice(8, 10)}`;
};