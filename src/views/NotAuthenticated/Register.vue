<template>
	<v-container container--fluid fill-height>
		<v-row align='center' justify='center' wrap>
			<v-col cols='12' sm='8' md='4'>
				<v-form
					v-on:submit.prevent
					method='post'
				>
					<div v-for='(item, index) in textFields'
						:key='index'>
						<v-expand-transition>
							<app-password-contains-email v-if='item.label === "INVITE" && errors.password && !passNum' />
							<app-hibp-message v-if='item.label === "INVITE" && passNum' :passNum='passNum' />
						</v-expand-transition>
						<v-text-field
							v-model='user[item.model]'
							v-on:keyup.enter='register'
							@input='touch(item.model)'
							@blur='touch(item.model)'
							:autocomplete='item.autocomplete'
							:disabled='loading || completed'
							:error='errors[item.model]'
							:error-messages='errorMessages[item.model]'
							:label='item.label'
							:prepend-icon='item.icon'
							:type='item.type'
						>
						</v-text-field>
					</div>
				</v-form>
				<div class='text-center mt-1'>
					<v-btn
						@click='$router.push("/")'
						:class='{"elevation-0": $v.$invalid || loading || completed}'
						:disabled='loading || completed'
						class='elevation-2 mr-4'
						color='error'
						dark
						large
					>
						<app-button-icon :icon='mdiClose' />
						cancel
					</v-btn>
					<v-btn
						@click='register'
						:class='{"elevation-0": loading || $v.$invalid || errors.password || completed}'
						:disabled='loading || $v.$invalid || errors.password || completed'
						class='elevation-2'
						color='secondary'
						dark
						large
					>
						<app-button-icon :icon='mdiAccountPlus' />
						Register
					</v-btn>
				</div>
			</v-col>
		</v-row>
	</v-container>
</template>

<script lang='ts'>

import { axios_incognito } from '@/services/axios';
import { email, minLength, required } from 'vuelidate/lib/validators';
import { env } from '@/vanillaTS/env';
import { loadingModule } from '@/store';
import {
	mdiAccount,
	mdiAccountPlus,
	mdiClose,
	mdiEmail,
	mdiLock,
	mdiKeyboard,
} from '@mdi/js';
import { MetaInfo } from 'vue-meta';
import { passwordCheck } from '@/vanillaTS/hibp';
import { snackSuccess } from '@/services/snack';
import ButtonIcon from '@/components/ButtonIcon.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'register-page',
	components: {
		appButtonIcon: ButtonIcon,
		// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
		AppHibpMessage: () => import(/* webpackChunkName: "hibp-message" */ /* webpackMode: "lazy" */ '@/components/HibpMessage.vue'),
		// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
		AppPasswordContainsEmail: () => import(/* webpackChunkName: "password-contains-email-message" */ /* webpackMode: "lazy" */ '@/components/PasswordContainsEmail.vue'),
	},

	computed: {
		inputInvalid (): boolean {
			return true;
		},
		loading: {
			get (): boolean {
				return loadingModule().loading;
			},
			set (b: boolean): void {
				loadingModule().set_loading(b);
			}
		},
		watcher_email (): string {
			return this.user.email;
		},
		watcher_full_name (): string {
			return this.user.full_name;
		},
		watcher_invite (): string {
			return this.user.invite;
		},
		watcher_password (): string {
			return this.user.password;
		},
	},
	
	data: () => ({
		completed: false,
		errorMessages: {
			email: '',
			full_name: '',
			password: '',
			invite: '',
		},
		errors: {
			email: false,
			full_name: false,
			password: false,
			invite: false,
		},
		mdiAccountPlus,
		mdiClose,
		passNum: false,
		pageTitle: 'Register',
		textFields: [
			{
				autocomplete: 'full_name',
				icon: mdiAccount,
				label: 'FULL NAME',
				model: 'full_name' as const,
				type: 'text',
			},
			{
				autocomplete: 'email',
				icon: mdiEmail,
				label: 'EMAIL',
				model: 'email' as const,
				type: 'text',
			},
			{
				autocomplete: 'new-password',
				icon: mdiLock,
				label: 'PASSWORD',
				model: 'password' as const,
				type: 'password',
			},
			{
				autocomplete: 'invite',
				icon: mdiKeyboard,
				label: 'INVITE',
				model: 'invite' as const,
				type: 'text',
			},
		],
		user: {
			email: '',
			full_name: '',
			invite: '',
			password: '',
		},
	}),

	metaInfo (): MetaInfo {
		return {
			title: this.pageTitle,
			meta: [
				{ name: 'description', content: `Meal Pedant - Register for an account in order to gain access to the daily log of ingestion` }
			],
			link: [
				{ rel: 'canonical', href: `${env.domain_www}${this.$route.path}` }
			]
		};
	},
	
	methods: {

		touch (name: string): void {
			this.$v.email?.[name]?.$touch();
		},
		async register (): Promise<void> {
			if (this.$v.$invalid) return;
			if (this.user.password.toLowerCase().includes(this.user.email.toLowerCase().trim())) {
				this.errors.password = true;
				return;
			}
			this.loading = true;
			this.passNum = await passwordCheck(this.user.password);
			if (this.passNum) {
				this.errors.password = true;
				return;
			}
			const registerRequest = await axios_incognito.register_post(this.user);
			if (registerRequest) {
				this.completed = true;
				snackSuccess({ message: registerRequest, timeout: 20000, closable: false, type: 'success' });
			}
			this.loading = false;
		}
	},

	validations: {
		user: {
			email: {
				email,
				required,
			},
			full_name: {
				required,
			},
			invite: {
				required,
			},
			password: {
				required,
				minLen: minLength(12)
			}
		}
	},

	watch: {
		watcher_email (): void {
			this.user.email = this.user.email.toLowerCase().trim();
			if (!this.$v.user?.email?.$invalid) this.errorMessages.email = '';
			else if (!this.$v.user?.email?.$dirty) return;
			else if (!this.$v.user?.email?.required) this.errorMessages.email = 'email required';
			else if (!this.$v.user?.email?.email) this.errorMessages.email = 'email invalid';
		},
		watch_full_name (): void {
			if (!this.$v.user?.firstName?.$invalid) this.errorMessages.full_name = '';
			else if (!this.$v.user?.firstName?.$dirty) return;
			else if (!this.$v.user?.firstName?.required) this.errorMessages.full_name = 'full name required';
		},
		watcher_invite (): void {
			this.user.invite = this.user.invite.toLowerCase().trim();
			if (!this.$v.user?.invite?.$invalid) this.errorMessages.invite = '';
			else if (!this.$v.user?.invite?.$dirty) return;
			else if (!this.$v.user?.invite?.required) this.errorMessages.invite = 'invite required';
		},
		watcher_password (): void {
			this.passNum = false;
			this.errors.password = false;
			if (this.user.email && this.user.password.toLowerCase().includes(this.user.email.toLowerCase().trim())) this.errors.password = true;
			else if (this.user.email && this.user.password) {
				const a = this.user.email.toLowerCase().trim().split('@')[0];
				if (a && this.user.password.toLowerCase().includes(a)) this.errors.password = true;
			}
			else if (!this.$v.user?.password?.$invalid && !this.passNum) this.errorMessages.password = '';
			else if (!this.$v.user?.password?.$dirty) return;
			else if (!this.$v.user?.password?.required) this.errorMessages.password = 'password required';
			else if (!this.$v.user?.password?.minLength) this.errorMessages.password = '12 characters minimum';
		},
	},
});
</script>
