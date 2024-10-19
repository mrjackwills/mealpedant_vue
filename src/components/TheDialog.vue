<template>
	<v-dialog
		:model-value='visible'
		:max-width='maxWidth'
		scroll-strategy='none'
		persistent
		eager
	>
		<v-card v-intersect='onIntersect' >
			<v-progress-linear
				:active='loading'
				:indeterminate='loading'
				color='primary'
				width='100%'
				absolute
			/>
			<v-card-title class='mealtype--text text-uppercase text-h6'>{{ title }}</v-card-title>
			<v-card-text class=''>{{ message }}</v-card-text>

			<section v-if='passwordRequired || twoFA_always_required'>
				<v-row align='center' justify='center' class='ma-0 pa-0 mt-2'>
					<v-col cols='11' md='9' lg='6' class='ma-0 pa-0'>
						<v-form
							v-on:submit.prevent
							autocomplete='off'
						>
						
							<template v-if='passwordRequired'>
								<v-text-field
									v-show='false'
									label='EMAIL'
									type='email'
									autocomplete='email'
								/>
								<v-text-field
									v-for='item in textFields'
									v-model='user[item.model]'
									@click:append-inner='passwordVisible = !passwordVisible'
									@keydown.enter='click'
									@focus='focusMethod(item.model)'
									:append-inner-icon='item.appendIcon'
									:autocomplete='item.autocomplete'
									:dense='smAndDown'
									:disabled='loading'
									:key='item.model'
									:label='item.label'
									:prepend-inner-icon='item.icon'
									:type='item.type'
									class='mb-n3'
									variant='underlined'
									required
								/>
							</template>
							<template v-if='passwordRequired && twoFA_always_required'>
								<v-text-field
									v-for='item in tokenFields'
									v-model='user[item.model]'
									@focus='focusMethod(item.model)'
									v-on:keyup.enter='click'
									:dense='smAndDown'
									:key='item.model'
									:label='item.label'
									:prepend-inner-icon='item.icon'
									variant='underlined'
									required
								/>
							</template>
						</v-form>
					</v-col>
				</v-row>
			</section>

			<v-card-actions >
				<v-row class='ma-0 pa-0' justify='center' align='center'>
					<v-col cols='12' md='8' lg='6' class='ma-0 pa-0' >
						<v-row align='center' justify='space-around' class='ma-0 pa-0 mb-4'>
							<v-col cols='auto' class='ma-0 pa-0'>
								<v-btn
									@click='cancel'
									:small='smAndDown'
									color='error'
									variant='flat'
								>
									<ButtonIcon :icon='mdiClose' />
									cancel
								</v-btn>
							</v-col>
							<v-spacer />
							<v-col cols='auto' class='ma-0 pa-0'>
								<v-btn
									@click='click'
									:disabled='disabled'
									:small='smAndDown'
									color='secondary'
									:variant='disabled?"outlined":"flat"'
								>
									<div class='white--text' :class='{"monospace-font":monospace, "font-weight-black":monospace}'>{{ timeout_text }}</div>
									
									<ButtonIcon
										v-if='!monospace'
										v-model:disabled='disabled'
										:icon='timeout_icon'
										color='white'
										margin='ml-2'
									/>
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
import type { su, u, TConfirmFunction, TDialogTextField } from '@/types';
import { useDisplay } from 'vuetify';
import { zeroPad } from '@/vanillaTS/zeropad';
const { mdAndUp, smAndDown } = useDisplay();

const dialogStore = dialogModule();

const confirmFunction = computed((): u<TConfirmFunction> => {
	return dialogStore.confirmFunction;
});
		
const confirmButton = computed((): string => {
	return dialogStore.confirmButton ?? 'confirm';
});

const disabled = computed((): boolean => {
	return loading.value
		|| timeout.value
		|| passwordRequired.value && !user.value.password
		|| passwordRequired.value && twoFA_always_required.value && !user.value.token
		|| twoFA_always_required.value && passwordRequired.value && tokenLength.value <6
		|| passwordRequired.value && passwordLength.value < 10
		? true: false;
});
const maxWidth = computed((): string => {
	return 	mdAndUp.value? '60vw' : '100vw';
});
const message = computed((): su => {
	return dialogStore.message;
});
const monospace = computed((): boolean => {
	return timeout.value > 0 ? true : false;
});
const passwordRequired = computed((): boolean => {
	return dialogStore.passwordRequired;
});
const passwordLength = computed((): number => {
	return user.value.password ? user.value.password.length: 0;
});
const textFields = computed((): TDialogTextField => {
	return [
		{
			autocomplete: 'new-password',
			icon: mdiLock,
			label: 'password',
			model: 'password' as const,
			type: passwordVisible.value? 'text' : 'password',
			appendIcon: user.value.password ? passwordVisible.value ? mdiEyeOff : mdiEye : '',
		},
	];
});
const timeout = computed({
	get (): number {
		return dialogStore.timeout;
	},
	set (n: number): void {
		dialogStore.set_timeout(n);
	},
});

const timeout_text = computed((): string => {
	return timeout.value ?
		`${zeroPad(timeout.value)}` : passwordRequired.value && !user.value.password || passwordRequired.value && passwordLength.value < 10
			? 'password required ' : passwordRequired.value && twoFA_always_required.value && !user.value.token || passwordRequired.value && twoFA_always_required.value && tokenLength.value <6
				? 'token required' : confirmButton.value;
});
const timeout_icon = computed((): string => {
	return timeout.value ? '' : passwordRequired.value && !user.value.password|| passwordRequired.value && passwordLength.value < 10
		? mdiLock : passwordRequired.value && twoFA_always_required.value && !user.value.token || passwordRequired.value && twoFA_always_required.value && tokenLength.value <6
			? mdiCellphoneInformation: dialogStore.icon? mdiCheck: mdiCheck;
});
const title = computed((): string => {
	return dialogStore.title ?? 'warning';
});
const tokenLength = computed((): number => {
	return user.value.token ? user.value.token.length: 0;
});
const twoFA_always_required = computed((): boolean => {
	return twoFAModule().alwaysRequired;
});

const visible = computed({
	get (): boolean {
		return dialogStore.visible;
	},
	set (b: boolean): void {
		dialogStore.set_visible(b);
	}
});

const isIntersecting = ref(false);
const loading =ref(false);
const localDisabled = ref(false);
const passwordVisible = ref(false);
const timeoutInterval= ref(0);
const tokenFields = [
	{
		clearable: true,
		icon: mdiCellphoneInformation,
		label: '2FA code',
		model: 'token' as const,
	},
];
const user = ref({
	password: '',
	token: undefined as string | undefined,
});

const cancel = (): void => {
	user.value.password = '';
	user.value.token = undefined;
	clearTimeouts();
	dialogStore.$reset();
	visible.value = false;
};
		
const clearTimeouts = (): void => {
	clearInterval(timeoutInterval.value);
	localDisabled.value = false;
	timeout.value = 0;
};

const click = async (): Promise<void> => {
	if (passwordRequired.value && !user.value.password || timeout.value > 0) return;
	passwordVisible.value = false;
	visible.value = false;
	if (!confirmFunction.value) return;
	const data = {
		password: user.value.password,
		token: user.value.token,
	};
	await confirmFunction.value(data);
	dialogStore.$reset();
};

/**
 ** set the focus to the currently in focus text field
 ** If the in focus field ISN't the password field, then set passwordVisible to false
 * @param {String} model - current model/textfield name
 */
const focusMethod = (model: string): void => {
	if (model !== 'password') passwordVisible.value = false;
};

/**
 ** When visible, set a timeout for the button, if params are met
 */
const mountedTimeout = (): void => {
	if (!isIntersecting.value) return ;
	if (!timeout.value) return;
	timeoutInterval.value = window.setInterval(() => {
		timeout.value = timeout.value > 0 ? timeout.value -= 1: timeout.value;
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

.countdown{
	font-feature-settings: 'tnum' 1;
	font-feature-settings: "tnum";
	font-family: 'Hammersmith One', monospace !important;
}
</style>