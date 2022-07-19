import { mdiAlertCircle, mdiCheckCircleOutline } from '@mdi/js';
import { snackbarModule } from '@/store';
import { PV, TSnack } from '@/types';

const snacker = async (data: TSnack): PV => {
	const SnackStore = snackbarModule();
	SnackStore.$reset();
	await Promise.all([
		SnackStore.set_closable(!!data.closable),
		SnackStore.set_color(data.type),
		SnackStore.set_icon(data.icon),
		SnackStore.set_message(data.message),
		SnackStore.set_loading(!!data.loading),
		SnackStore.set_position({ x: data.x, y: data.y }),
		SnackStore.set_timeout(data.timeout),
		SnackStore.set_visible(true),
	]);
};

export const snackSuccess = async ({ message = 'Success', icon = mdiCheckCircleOutline, timeout=5000, x=undefined, y=undefined, type='success', closable=true, loading=false }: TSnack): PV=> {
	snacker({ message, icon, timeout, x, y, type, closable, loading });
	
};

// TODO need custom error, with response.data.r, and status
export const snackError = async ({ message = 'error', icon = mdiAlertCircle, timeout=7500, x=undefined, y=undefined, type='error', closable=true }: TSnack): PV => {
	snacker({ message, icon, timeout, x, y, type, closable });
};
