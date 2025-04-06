<template>
	<v-dialog :model-value='visible' :max-width='maxWidth' scroll-strategy='none' persistent eager>
		<v-card v-intersect='onIntersect'>
			<v-progress-linear :active='loading' :indeterminate='loading' color='primary' width='100%' absolute />
			<v-card-title class='text-mealtype text-uppercase text-h6'>{{ title }}</v-card-title>
			<v-card-text class=''>{{ message }}</v-card-text>

			<section v-if='passwordRequired || twoFA_always_required'>
				<v-row align='center' justify='center' class='ma-0 pa-0 mt-n4'>
					<v-col cols='11' md='9' lg='6' class='ma-0 pa-0'>
						<v-form v-on:submit.prevent autocomplete='off'>

							<template v-if='passwordRequired'>
								<v-text-field v-for='item in textFields' v-model='user[item.model]'
									@click:append-inner='passwordVisible = !passwordVisible' @keydown.enter='click'
									@focus='focusMethod(item.model)' :append-inner-icon='item.appendIcon'
									:autocomplete='item.autocomplete' :dense='smAndDown' :disabled='loading'
									:key='item.model' :label='item.label' :prepend-inner-icon='item.icon'
									:type='item.type' class='mb-n3' variant='underlined' required />
								<template v-if='twoFA_always_required'>
									<v-text-field v-for='item in tokenFields' v-model='user[item.model]'
										@focus='focusMethod(item.model)' v-on:keyup.enter='click' :dense='smAndDown'
										:key='item.model' :label='item.label' :prepend-inner-icon='item.icon'
										variant='underlined' required />
								</template>
							</template>
						</v-form>
					</v-col>
				</v-row>
			</section>

			<v-card-actions>
				<v-row class='ma-0 pa-0 mb-2' justify='center' align='center'>
					<v-col cols='12' md='8' class='ma-0 pa-0'>
						<v-row align='center' justify='space-around' class='ma-0 pa-0'>
							<v-col cols='6' class='ma-0 pa-0 text-center'>
								<v-btn @click='cancel' :small='smAndDown' color='error' variant='flat' rounded>
									<ButtonIcon :icon='mdiClose' />
									cancel
								</v-btn>
							</v-col>
							<v-col cols='6' class='ma-0 pa-0 text-center'>
								<v-btn @click='click' :disabled='disabled' :small='smAndDown' color='secondary' rounded
									:variant='disabled ? "outlined" : "flat"'>
									<span class='text-white'>
										{{ timeout_text }}
									</span>
									<ButtonIcon v-if='!monospace' v-model:disabled='disabled' :icon='timeout_icon'
										color='white' margin='ml-2' />
								</v-btn>
							</v-col>
						</v-row>
					</v-col>
				</v-row>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script setup lang='ts'>
import { mdiCellphoneInformation, mdiCheck, mdiClose, mdiEye, mdiEyeOff, mdiLock } from '@mdi/js';
import { useDisplay } from 'vuetify';
import { zeroPad } from '@/vanillaTS/helpers';
const { mdAndUp, smAndDown } = useDisplay();

const dialogStore = dialogModule();

const confirmFunction = computed(() => dialogStore.confirmFunction);

const confirmButton = computed(() => dialogStore.confirmButton ?? 'confirm');

const disabled = computed(() => loading.value
	|| timeout.value
	|| passwordRequired.value && !user.value.password
	|| passwordRequired.value && twoFA_always_required.value && !user.value.token
	|| twoFA_always_required.value && passwordRequired.value && tokenLength.value < 6
	|| passwordRequired.value && passwordLength.value < 10
	? true : false);

const maxWidth = computed(() => mdAndUp.value ? '60vw' : '100vw');
const message = computed(() => dialogStore.message);
const monospace = computed(() => timeout.value > 0 ? true : false);
const passwordRequired = computed(() => dialogStore.passwordRequired);
const passwordLength = computed(() => user.value.password ? user.value.password.length : 0);
const textFields = computed(() => [
	{
		autocomplete: 'new-password',
		icon: mdiLock,
		label: 'password',
		model: 'password' as const,
		type: passwordVisible.value ? 'text' : 'password',
		appendIcon: user.value.password ? passwordVisible.value ? mdiEyeOff : mdiEye : ''
	}
]);
const timeout = computed({
	get (): number {
		return dialogStore.timeout;
	},
	set (n: number): void {
		dialogStore.set_timeout(n);
	}
});

const timeout_text = computed(() =>
	timeout.value ?
		`${zeroPad(timeout.value)}` : passwordRequired.value && !user.value.password || passwordRequired.value && passwordLength.value < 10
			? 'password required ' : passwordRequired.value && twoFA_always_required.value && !user.value.token || passwordRequired.value && twoFA_always_required.value && tokenLength.value < 6
				? 'token required' : confirmButton.value
);
const timeout_icon = computed(() => timeout.value ? '' : passwordRequired.value && !user.value.password || passwordRequired.value && passwordLength.value < 10
	? mdiLock : passwordRequired.value && twoFA_always_required.value && !user.value.token || passwordRequired.value && twoFA_always_required.value && tokenLength.value < 6
		? mdiCellphoneInformation : dialogStore.icon ? mdiCheck : mdiCheck);

const title = computed(() => dialogStore.title ?? 'warning');
const tokenLength = computed(() => user.value.token ? user.value.token.length : 0);
const twoFA_always_required = computed(() => twoFAModule().alwaysRequired);

const visible = computed({
	get (): boolean {
		return dialogStore.visible;
	},
	set (b: boolean): void {
		dialogStore.set_visible(b);
	}
});

const isIntersecting = ref(false);
const loading = ref(false);
const localDisabled = ref(false);
const passwordVisible = ref(false);
const timeoutInterval = ref(0);
const tokenFields = [
	{
		clearable: true,
		icon: mdiCellphoneInformation,
		label: '2FA code',
		model: 'token' as const
	}
];
const user = ref({
	password: '',
	token: undefined as string | undefined
});

const dialogClearTimeout = ref(0);

const cancel = (): void => {
	user.value.password = '';
	user.value.token = undefined;
	clearTimeouts();
	visible.value = false;
	dialogClearTimeout.value = window.setTimeout(() => dialogStore.$reset(), 500);
};

const clearTimeouts = (): void => {
	clearInterval(timeoutInterval.value);
	clearTimeout(dialogClearTimeout.value);
	localDisabled.value = false;
	timeout.value = 0;
};

const click = async (): Promise<void> => {
	if (passwordRequired.value && !user.value.password || timeout.value > 0 || !confirmFunction.value) return;
	passwordVisible.value = false;
	visible.value = false;
	const data = {
		password: user.value.password,
		token: user.value.token
	};
	await confirmFunction.value(data);
	dialogStore.$reset();
};

/// set the focus to the currently in focus text field
/// If the in focus field ISN't the password field, then set passwordVisible to false
/// @param {String} model - current model/textfield name
const focusMethod = (model: string): void => {
	if (model !== 'password') passwordVisible.value = false;
};

/// When visible, set a timeout for the button, if params are met
const mountedTimeout = (): void => {
	if (!isIntersecting.value || !timeout.value) return;
	timeoutInterval.value = window.setInterval(() => {
		timeout.value = timeout.value > 0 ? timeout.value -= 1 : timeout.value;
		if (timeout.value < 1) clearInterval(timeoutInterval.value);
	}, 1000);
};

const onIntersect = (is_i: boolean, _entries: Array<IntersectionObserverEntry>, _observer: IntersectionObserver): void => {
	isIntersecting.value = is_i;
};

onMounted(() => {
	mountedTimeout();
});

watch(isIntersecting, (i) => {
	if (i) mountedTimeout();
	else cancel();
});
</script>

<style>
.countdown {
	font-feature-settings: 'tnum' 1;
	font-feature-settings: "tnum";
	font-family: 'Hammersmith One', monospace !important;
}
</style>