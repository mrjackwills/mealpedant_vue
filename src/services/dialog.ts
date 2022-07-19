
import { dialogModule } from '@/store';
import { TDialogData } from '@/types';

export const dialoger = (data: TDialogData): void => {
	const DialogStore = dialogModule();
	DialogStore.set_confirmButton(data.buttonText);
	DialogStore.set_message(data.message);
	DialogStore.set_icon(data.icon);
	DialogStore.set_passwordRequired(data.passwordRequired);
	DialogStore.set_confirmFunction(data.confirmFunction);
	DialogStore.set_title(data.title);
	if (data.timeout) DialogStore.set_timeout(data.timeout);
	DialogStore.set_visible(data.visible ?? true);

};