import { pwnedPassword } from 'hibp';

/// Check given password in hibp db
export async function passwordCheck (password: string): Promise<boolean> {
	if (!password) return false;
	const number = await pwnedPassword(password);
	return number >= 1;
}