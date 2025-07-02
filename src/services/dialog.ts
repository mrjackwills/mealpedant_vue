import type { TDialogData } from '@/types';

export const dialoger = (data: TDialogData): void => {
	const dialog_store = dialogModule();
	dialog_store.set_confirmButton(data.buttonText);
	dialog_store.set_message(data.message);
	dialog_store.set_icon(data.icon);
	dialog_store.set_passwordRequired(data.passwordRequired);
	dialog_store.set_confirmFunction(data.confirmFunction);
	dialog_store.set_title(data.title);
	if (data.timeout) dialog_store.set_timeout(data.timeout);
	dialog_store.set_visible(data.visible ?? true);
};
