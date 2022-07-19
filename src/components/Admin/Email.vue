<template>
	<v-row justify='center'>
		<v-col cols='12' sm='8' md='6' grow>
			<v-form
				v-on:submit.prevent>
				<v-row wrap justify='space-between' class='no-gutters'>
					<v-col cols='9' md='10'>
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
							chips
							clearable
							multiple
						>
						</v-select>
					</v-col>
					<v-spacer />
					<v-col cols='2' md='1' justify='end'>
						<div class='text-right'>
							<v-switch
								v-model='all'
								@change='allToggle()'
								:disabled='confirm'
								color='primary'
								label='all'
							>
							</v-switch>
						</div>
					</v-col>
					<v-col cols='12' v-for='(item, index) in lineRows' :key='index'>
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
							:disabled='localLoading || errors.button_text || errors.link || buttonAndLink || $v.$invalid '
							:class='{"elevation-0": localLoading || $v.$invalid || errors.button_text || errors.link || buttonAndLink}'
							:color='computedSendColor'
							class='elevation-2'
							large
						>
							<app-button-icon :icon='computedSendIcon' />
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
							class='elevation-2 black--text'
							color='primary'
							large
						>
							<app-button-icon v-if='!countdown' :icon='mdiEmail' color='black'/>
							<span v-if='countdown' class='mr-1 monospace-font'>({{ countdown }})</span> Confirm
						</v-btn>
					</div>
				</v-col>
			</v-row>
		</v-col>
	</v-row>
</template>

<script lang='ts'>
import { adminModule, loadingModule } from '@/store';
import { axios_admin } from '@/services/axios';
import { mdiClose, mdiCommentTextOutline, mdiCommentTextMultipleOutline, mdiEmail, mdiFormatTitle, mdiLink, mdiTagTextOutline } from '@mdi/js';
import { minLength, required } from 'vuelidate/lib/validators';
import { snackSuccess } from '@/services/snack';
import { su } from '@/types';
import ButtonIcon from '@/components/ButtonIcon.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'admin-registered-email-component',

	components: {
		appButtonIcon: ButtonIcon
	},

	beforeDestroy () {
		clearTimeout(this.disabledTimeout);
		clearInterval(this.countdownInterval);
	},

	computed: {
		buttonAndLink (): boolean {
			return this.email.button_text && this.email.link || !this.email.button_text && !this.email.link? false : true;
		},
		computedSendColor (): string {
			return this.confirm ? 'error' : 'secondary';
		},
		computedSendIcon (): string {
			return this.confirm ? mdiClose: mdiEmail;
		},
		computedSendtext (): string {
			return this.confirm ? 'cancel' : 'send';
		},
		emailAddresses (): Array<string> {
			return adminModule().email;
		},
		emailErrors (): Array<string> {
			const errors: Array<string>= [];
			if (!this.$v.email?.emails?.$dirty) return errors;
			!this.$v.email.emails.required && errors.push('Email is required');
			return errors;
		},
		loading: {
			get: function (): boolean {
				return loadingModule().loading;
			},
			set: function (b: boolean): void {
				loadingModule().set_loading(b);
			}
		},
		watcher_button_text (): su {
			return this.email.button_text;
		},
		watcher_title (): su {
			return this.email.title;
		},
		watcher_line_one (): su {
			return this.email.line_one;
		},
		watcher_link (): su {
			return this.email.link;
		},
		watch_emails (): undefined | Array<string> {
			return this.email.emails;
		},
	},

	data: () => ({
		all: false,
		confirm: false,
		countdown: 0,
		countdownInterval: 0,
		email: {
			emails: [] as Array<string>,
			title: '',
			line_one: '',
			line_two: undefined as su,
			button_text: undefined as su,
			link: undefined as su,
		},
		emailRegex: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		errorMessages: {
			emails: undefined as su,
			title: undefined as su,
			line_one: undefined as su,
			line_two: undefined as su,
			button_text: undefined as su,
			link: undefined as su,
		},
		errors: {
			emails: false,
			title: false,
			line_one: false,
			line_two: false,
			button_text: false,
			link: false,
		},
		disabled: true,
		disabledTimeout: 0,
		lineRows: [
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
				name: 'button' as const,
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
		],
		localLoading: false,
		mdiEmail,
	}),

	methods: {
		allToggle (): void {
			if (this.all) this.email.emails = this.emailAddresses;
			else this.email.emails = [];
		},
		async confirmButton (): Promise<void> {

			if (this.$v.$invalid || this.errors.button_text || this.errors.link || this.email.emails?.length === 0) return;
			if (!this.email.title || !this.email.line_one) return;
			// Still not happy with this
			this.loading = true;
			this.localLoading = true;
			for (const i of this.email.emails) if (!this.emailRegex.test(i)) throw new Error(`Email address invalid - ${i}`);
			const response = await axios_admin.email_post(this.email);
			if (response) {
				const emailPlural = this.email.emails.length > 1 ? 's have' : ' has';
				snackSuccess({ message: `The email${emailPlural} been sent`, icon: mdiEmail, type: 'success' });
				this.$v.email?.$reset();
				this.email = {
					emails: [],
					title: '',
					line_one: '',
					line_two: undefined,
					button_text: undefined,
					link: undefined,
				};
			}
			[ this.loading, this.localLoading, this.confirm, this.disabled ] = [ false, false, false, false ];

		},
		sendButton (): void {
			this.disabled = true;
			this.confirm = !this.confirm;
			if (this.confirm) {
				this.countdown = 5;
				this.disabledTimeout = setTimeout(()=>{
					this.disabled = false;
				}, 5000);
				this.countdownInterval = setInterval(()=>{
					if (this.countdown > 0) this.countdown -= 1;
					if (this.countdown === 0) clearInterval(this.countdownInterval);
				}, 1000);

			} else {
				clearInterval(this.countdownInterval);
				clearTimeout(this.disabledTimeout);
				this.disabled = true;
			}
		},
		touch (name: string): void {
			this.$v.email?.[name]?.$touch();

		}
	},

	validations: {
		email: {
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
		}
	},

	watch: {
		watch_emails (): void {
			if (this.email.emails?.length === this.emailAddresses.length) this.all = true;
			if (this.email.emails?.length === 0) this.all = false;
		},
		watcher_button_text (i): void {
			if (!i && !this.email.link) {
				this.errors.link = false;
				this.errors.button = false;
				delete this.errorMessages.button;
				delete this.errorMessages.link;
				return;
			}
			else if (i && !this.email.link) this.errorMessages.link = 'Link required';
			else if (!i && this.email.link) this.errorMessages.button = 'Button text required';
			else if (i) {
				if (this.errorMessages.link === 'Button text required') {
					this.errors.link = false;
					this.errorMessages.link = undefined;
				}
				delete this.errorMessages.button;
				this.errors.button = false;
			}
		},
		watcher_link (i: su): void {
			if (i) this.email.link = i.toLowerCase().trim();

			if (!i && !this.email.button_text) {
				delete this.errorMessages.button_text;
				this.errors.link = false;
				this.errors.button_text = false;
				delete this.errorMessages.link;
				return;
			}
			if (!i && this.email.button_text) {
				this.errors.link = true;
				this.errorMessages.button_text = 'Link required';
				return;
			}

			const domainRegex = /^http(s)?:\/\/([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}(\/.*)?$/;
			if (!i) return;
			const regexTest = domainRegex.test(i);
			if (i && !regexTest) {
				this.errors.link = true;
				this.errorMessages.link = 'invalid link';
			}
			if (regexTest && !this.email.button_text) {
				this.errors.link = true;
				this.errorMessages.button_text = 'Button text required';
			}
			if (regexTest) {
				this.errors.link = false;
				delete this.errorMessages.link;
			}
		},
		watcher_title (): void {
			if (!this.$v.email?.title?.$invalid) delete this.errorMessages.title;
			else if (!this.$v.email?.title?.$dirty) return;
			else if (!this.$v.email?.title?.required) this.errorMessages.title = 'Email title invalid';
			else if (!this.$v.email?.title?.minLength) this.errorMessages.title = '12 characters minimum';
		},
		watcher_line_one (i: su): void {
			if (!i) this.$nextTick(() => this.$v.email?.line_one?.$reset());
			else if (!this.$v.email?.line_one?.$invalid) delete this.errorMessages.line_one;
			else if (!this.$v.email?.line_one?.$dirty) return;
			else if (!this.$v.email?.line_one?.required) this.errorMessages.line_one = 'Line one invalid';
			else if (!this.$v.email?.line_one?.minLength) this.errorMessages.line_one = '12 characters minimum';
		},
	},

});
</script>
