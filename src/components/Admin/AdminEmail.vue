<template>
	<v-row justify='center'>
		<v-col cols='12' sm='8' md='6' grow>
			<v-form
				v-on:submit.prevent>
				<v-row wrap justify='space-between' class='no-gutters'>
					<v-col cols='9' class='ma-0 pa-0'>
						<v-select
							v-model='email.emails'
							@blur='touch(`emails`)'
							@input='touch(`emails`)'
							:disabled='confirm'
							:error-messages='errorMessages.emails'
							:items='emailAddresses'
							:prepend-icon='mdiEmail'
							hint='send to'
							label='email address'
							variant='underlined'
							chips
							clearable
							multiple
						>
						</v-select>
					</v-col>
					<v-col cols='auto'  justify='end' class='ma-0 pa-0 mt-4'>
						<v-switch
							v-model='all'
							@change='allToggle()'
							:disabled='confirm'
							density='compact'
							color='primary'
							label='all'
						/>
					</v-col>
					<v-col cols='12' v-for='(item, index) in lineRows' :key='index' class='ma-0 pa-0'>
						<v-textarea
							v-model='email[item.model]'
							@blur='touch(item.name)'
							@input='touch(item.name)'
							:auto-grow='true'
							:disabled='confirm'
							:error='errors[item.name]'
							:error-messages='errorMessages[item.name]'
							:label='item.label'
							:name='item.name'
							:prepend-icon='item.icon'
							variant='underlined'
							rows='1'
							clearable
						/>
					</v-col>
				</v-row>
			</v-form>

			<v-row justify='space-around'>
				<v-col cols='auto' class='mt-3'>
					<div class='text-center'>
						<v-btn
							@click='sendButton'
							:disabled='localLoading || errors.button_text || errors.link || buttonAndLink || v$.$invalid '
							:class='{"elevation-0": localLoading || v$.$invalid || errors.button_text || errors.link || buttonAndLink}'
							:color='localLoading || errors.button_text || errors.link || buttonAndLink || v$.$invalid? "black": computedSendColor'
							:variant='localLoading || errors.button_text || errors.link || buttonAndLink || v$.$invalid?"outlined":"flat"'
							size='large'
						>
							<ButtonIcon :icon='computedSendIcon' :color='localLoading || errors.button_text || errors.link || buttonAndLink || v$.$invalid?"black":""' />
							{{ computedSendtext }}
						</v-btn>
					</div>
				</v-col>
				<v-col cols='auto' class='mt-3' v-if='confirm'>
					<div class='text-center'>
						<v-btn
							@click='confirmButton'
							:class='{"elevation-0": localLoading || disabled || errors.button_text || errors.link || buttonAndLink }'
							:disabled='localLoading || disabled || errors.button_text || errors.link || buttonAndLink'
							:color='localLoading || disabled || errors.button_text || errors.link || buttonAndLink? "black": "primary"'
							:variant='localLoading || disabled || errors.button_text || errors.link || buttonAndLink?"outlined":"flat"'
							size='large'
						>
							<ButtonIcon v-if='!countdown' :icon='mdiEmail' color='black'/>
							<span v-if='countdown' class='mr-1 monospace-font'>({{ countdown }})</span> Confirm
						</v-btn>
					</div>
				</v-col>
			</v-row>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { axios_admin } from '@/services/axios';
import { mdiClose, mdiCommentTextOutline, mdiCommentTextMultipleOutline, mdiEmail, mdiFormatTitle, mdiLink, mdiTagTextOutline } from '@mdi/js';
import { snackSuccess } from '@/services/snack';
import type { su } from '@/types';
import useVuelidate from '@vuelidate/core';
import { minLength, required } from '@vuelidate/validators';

onBeforeUnmount(() => {
	clearTimeout(disabledTimeout.value);
	clearInterval(countdownInterval.value);
});

// COMPUTED

const buttonAndLink = computed((): boolean => {
	return email.value.button_text && email.value.link || !email.value.button_text && !email.value.link? false : true;
});
const computedSendColor = computed((): string => {
	return confirm.value ? 'error' : 'secondary';
});
const computedSendIcon = computed((): string => {
	return confirm.value ? mdiClose: mdiEmail;
});
const computedSendtext = computed((): string => {
	return confirm.value ? 'cancel' : 'send';
});
const emailAddresses = computed((): Array<string> => {
	return adminModule().email;
});
// const emailErrors = computed((): Array<string> => {
// 	const errors: Array<string>= [];
// 	if (!v$.value.emails?.$dirty) return errors;
// 	!v$.value.emails.required && errors.push('Email is required');
// 	return errors;
// });

const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});

const watcher_button_text = computed((): su => {
	return email.value.button_text;
});
const watcher_title = computed((): su => {
	return email.value.title;
});
const watcher_line_one = computed((): su => {
	return email.value.line_one;
});
const watcher_link = computed((): su => {
	return email.value.link;
});
const watch_emails = computed((): undefined | Array<string> => {
	return email.value.emails;
});

const all = ref(false);
const confirm = ref(false);
const countdown = ref(0);
const countdownInterval = ref(0);
const email = ref({
	emails: [] as Array<string>,
	title: '',
	line_one: '',
	line_two: undefined as su,
	button_text: undefined as su,
	link: undefined as su,
});
// const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const errorMessages = ref({
	emails: undefined as su,
	title: undefined as su,
	line_one: undefined as su,
	line_two: undefined as su,
	button_text: undefined as su,
	link: undefined as su,
});
const errors = ref({
	emails: false,
	title: false,
	line_one: false,
	line_two: false,
	button_text: false,
	link: false,
});
const disabled = ref(true);
const disabledTimeout = ref(0);
const lineRows = [
	{
		icon: mdiFormatTitle,
		model: 'title' as const,
		name: 'title' as const,
		hint: 'title' as const,
		label: 'email title' as const,
		type: 'text',
	},
	{
		icon: mdiCommentTextOutline,
		model: 'line_one' as const,
		name: 'line_one' as const,
		hint: 'line one' as const,
		label: 'line one' as const,
		type: 'text',
	},
	{
		icon: mdiCommentTextMultipleOutline,
		model: 'line_two' as const,
		name: 'line_two' as const,
		hint: 'line two' as const,
		label: 'line two' as const,
		type: 'text',
	},
	{
		icon: mdiTagTextOutline,
		model: 'button_text' as const,
		name: 'button_text' as const,
		hint: 'button text' as const,
		label: 'button text' as const,
		type: 'text',
	},
	{
		icon: mdiLink,
		model: 'link' as const,
		name: 'link' as const,
		hint: 'button link' as const,
		label: 'button hyperlink' as const,
		type: 'text',
	},
] as const;
const localLoading = ref(false);

const allToggle = (): void => {
	if (all.value) email.value.emails = emailAddresses.value;
	else email.value.emails = [];
};
const confirmButton = async (): Promise<void> => {

	if (v$.value.$invalid || errors.value.button_text || errors.value.link || email.value.emails?.length === 0) return;
	if (!email.value.title || !email.value.line_one) return;
	// Still not happy with this
	loading.value = true;
	localLoading.value = true;
	for (const i of email.value.emails) if (!emailRegex.test(i)) throw new Error(`Email address invalid - ${i}`);
	const response = await axios_admin.email_post(email.value);
	if (response) {
		const emailPlural = email.value.emails.length > 1 ? 's have' : ' has';
		snackSuccess({ message: `The email${emailPlural} been sent`, icon: mdiEmail, type: 'success' });
		v$.value.$reset();
		email.value = {
			emails: [],
			title: '',
			line_one: '',
			line_two: undefined,
			button_text: undefined,
			link: undefined,
		};
	}
	[ loading.value, localLoading.value, confirm.value, disabled.value ] = [ false, false, false, false ];

};
const sendButton = (): void => {
	disabled.value = true;
	confirm.value = !confirm.value;
	if (confirm.value) {
		countdown.value = 5;
		disabledTimeout.value = window.setTimeout(()=>{
			disabled.value = false;
		}, 5000);
		countdownInterval.value = window.setInterval(()=>{
			if (countdown.value > 0) countdown.value -= 1;
			if (countdown.value === 0) clearInterval(countdownInterval.value);
		}, 1000);

	} else {
		clearInterval(countdownInterval.value);
		clearTimeout(disabledTimeout.value);
		disabled.value = true;
	}
};
const touch = (name: string): void => {
	v$.value[name]?.$touch();
};

const rules = {
	emails: {
		required
	},
	line_one: {
		required,
		minLen: minLength(10)
	},
	title: {
		required,
		minLen: minLength(10)
	},
	line_two: {},
	button_text: {},
	link: {}
};
const v$ = useVuelidate(rules, email);

watch(watch_emails, (_) => {
	if (email.value.emails?.length === emailAddresses.value.length) all.value = true;
	if (email.value.emails?.length === 0) all.value = false;
});

watch(watcher_button_text, (i) => {
	if (!i && !email.value.link) {
		errors.value.link = false;
		errors.value.button_text = false;
		delete errorMessages.value.button_text;
		delete errorMessages.value.link;
		return;
	}
	else if (i && !email.value.link) errorMessages.value.link = 'Link required';
	else if (!i && email.value.link) errorMessages.value.button_text = 'Button text required';
	else if (i) {
		if (errorMessages.value.link === 'Button text required') {
			errors.value.link = false;
			errorMessages.value.link = undefined;
		}
		delete errorMessages.value.button_text;
		errors.value.button_text = false;
	}
});

watch(watcher_link, (i) => {
	if (i) email.value.link = i.toLowerCase().trim();

	if (!i && !email.value.button_text) {
		delete errorMessages.value.button_text;
		errors.value.link = false;
		errors.value.button_text = false;
		delete errorMessages.value.link;
		return;
	}
	if (!i && email.value.button_text) {
		errors.value.link = true;
		errorMessages.value.button_text = 'Link required';
		return;
	}

	const domainRegex = /^http(s)?:\/\/([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}(\/.*)?$/;
	if (!i) return;
	const regexTest = domainRegex.test(i);
	if (i && !regexTest) {
		errors.value.link = true;
		errorMessages.value.link = 'invalid link';
	}
	if (regexTest && !email.value.button_text) {
		errors.value.link = true;
		errorMessages.value.button_text = 'Button text required';
	}
	if (regexTest) {
		errors.value.link = false;
		delete errorMessages.value.link;
	}
});

watch(watcher_title, (_) => {
	if (!v$.value.title?.$invalid) delete errorMessages.value.title;
	else if (!v$.value.title?.$dirty) return;
	else if (!v$.value.title?.required) errorMessages.value.title = 'Email title invalid';
	else if (!v$.value.title?.minLength) errorMessages.value.title = '12 characters minimum';
});

watch(watcher_line_one, (i) => {
	if (!i) v$.value.line_one?.$reset();
	else if (!v$.value.line_one?.$invalid) delete errorMessages.value.line_one;
	else if (!v$.value.line_one?.$dirty) return;
	else if (!v$.value.line_one?.required) errorMessages.value.line_one = 'Line one invalid';
	else if (!v$.value.line_one?.minLength) errorMessages.value.line_one = '12 characters minimum';
});

</script>
