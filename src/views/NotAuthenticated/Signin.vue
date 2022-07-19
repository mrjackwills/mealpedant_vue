
<template>
	<v-container container--fluid fill-height>
		<v-row align='center' justify='center' wrap v-if='!authed'>
			<v-col cols='12' sm='8' md='4'>
				<v-form
					v-if='!twoFARequired'
					v-on:submit.prevent
					method='post'
				>
					<div v-for='(item, index) in textFields' :key='index'>
						<v-text-field
							v-model='user[item.model]'
							v-on:keyup.enter='signin'
							@blur='touch(item.model)'
							@input='touch(item.model)'
							:disabled='loading || twoFARequired'
							:error-messages='errorMessages[item.model]'
							:label='item.label'
							:prepend-icon='item.icon'
							:type='item.type'
						>
						</v-text-field>
					</div>
					<v-col cols='12' class='pa-0' v-if='!pwa'>
						<v-row justify='center' >
							<v-col cols='auto' class='pa-0'>
								<div class='text-center'>
									<v-checkbox
										v-model='user.remember'
										:disabled='loading || twoFARequired'
										class='mt-0'
										color='primary'
										label='stay signed in'
									>
									</v-checkbox>
								</div>
							</v-col>
						</v-row>
					</v-col>
				</v-form>

				<v-expand-transition>
					<div class='text-center mb-5' v-if='twoFARequired'>
						<v-row justify='center' >
							<v-col cols='12' md='9'>
								<v-text-field
									v-model='user.token'
									v-on:keyup.enter='signin'
									:autofocus='$vuetify.breakpoint.mdAndUp'
									:disabled='loading'
									:hint='"Your 2FA code is required to sign in"'
									:prepend-icon='mdiCellphoneLock'
									inputmode='numeric'
									label='2FA code'
									pattern='[0-9]*'
									persistent-hint
								>
								</v-text-field>
							</v-col>
						</v-row>
					</div>
				</v-expand-transition>
				
				<div class='text-center mt-3'>
					<v-btn
						v-if='twoFARequired'
						@click='cancel'
						:class='{"elevation-0": loading}'
						:disabled='loading'
						class='elevation-2 mr-4'
						color='error'
						dark
						large
					>
						<app-button-icon :icon='mdiClose' />
						cancel
					</v-btn>
					<v-btn
						@click='signin'
						:class='{"elevation-0": loading || $v.$invalid || twoFARequired && !user.token}'
						:disabled='loading || $v.$invalid || twoFARequired && !user.token'
						class='elevation-2'
						color='secondary'
						large
					>
						<app-button-icon :icon='mdiLogin' />
						sign-in
					</v-btn>
				</div>
				<p class='cl text-center mt-4' v-if='!twoFARequired' @click='goforgot'>forgot password</p>
			</v-col>
		</v-row>
	</v-container>
</template>

<script lang='ts'>
import { axios_incognito, axios_authenticatedUser } from '@/services/axios';
import { browserModule, loadingModule, snackbarModule, userModule } from '@/store';
import { email, minLength, required } from 'vuelidate/lib/validators';
import { env } from '@/vanillaTS/env';
import { mdiCellphoneLock, mdiClose, mdiEmail, mdiLockOpenOutline, mdiLogin } from '@mdi/js';
import { MetaInfo } from 'vue-meta';
import { su } from '@/types';
import ButtonIcon from '@/components/ButtonIcon.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'app-sign-in',

	components: {
		appButtonIcon: ButtonIcon
	},

	computed: {
		loading: {
			get: function (): boolean {
				return loadingModule().loading;
			},
			set: function (b: boolean): void {
				loadingModule().set_loading(b);
			}
		},
		pwa (): boolean {
			return browserModule().pwa;
		},
		watcher_email (): su {
			return this.user.email;
		},
		watcher_password (): su {
			return this.user.password;
		},
	},

	data: () => ({
		authed: false,
		errorMessages: {
			email: undefined as su,
			password: undefined as su
		},
		mdiCellphoneLock,
		mdiClose,
		mdiLogin,
		otpBackupEnabled: false,
		pageTitle: 'Sign-In',
		textFields: [
			{ icon: mdiEmail, model: 'email' as const, label: 'EMAIL', type: 'email' },
			{ icon: mdiLockOpenOutline, model: 'password' as const, label: 'PASSWORD', type: 'password' }
		],
		twoFARequired: false,
		user: {
			email: undefined as su,
			password: undefined as su,
			token: undefined as su,
			remember: false
		},
	}),

	metaInfo (): MetaInfo {
		return {
			title: this.pageTitle,
			meta: [
				{ name: 'description', content: `Meal Pedant - Sign in to your Meal Pedant account in order to explore the comprehensive daily log of ingestion.` }
			],
			link: [
				{ rel: 'canonical', href: `${env.domain_www}${this.$route.path}` }
			]
		};
	},

	methods: {
		touch (name: string): void {
			this.$v.user?.[name]?.$touch();
		},
		/**
		 ** On 2fa screen reset user data nad go back to blank signin page
		 */
		cancel (): void {
			this.twoFARequired = false;
			this.user = { email: undefined, password: undefined, token: undefined, remember: false };
			this.otpBackupEnabled = false;
		},

		/**
		 ** go to forgotpassword page
		*/
		goforgot (): void {
			this.$router.push('/forgotpassword');
		},

		/**
		 ** axios method to sign in user, works with both 2fa and non 2fa users
		*/
		async signin (): Promise<void> {
			if (this.$v.$invalid) return;
			if (!this.user.email) return;
			if (!this.user.password) return;
			if (this.twoFARequired && !this.user.token) return;
			if (this.pwa) this.user.remember = true;
			this.loading = true;
			const authObject = {
				email: this.user.email.toLowerCase(),
				password: this.user.password,
				token: this.user.token? this.user.token.replace(/\s/g, ''): undefined,
				remember: this.user.remember
			};
			const loginRequest = await axios_incognito.signin_post(authObject);
			if (loginRequest?.status === 200) {
				this.authed = true;
				this.user.email = undefined;
				this.user.password = undefined;
				snackbarModule().$reset();
				userModule().set_authenticated(true);
				await axios_authenticatedUser.authenticated_get();
				await this.$router.push('/meals');
			}
			else if (loginRequest?.status === 202) {
				this.twoFARequired = true;
				this.otpBackupEnabled = loginRequest.response.twoFABackup;
				snackbarModule().$reset();
			}
			else {
				this.cancel();
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
			password: {
				required,
				minLen: minLength(12)
			},
		}
	},

	watch: {
		watcher_email (): void {
			if (!this.user.email) {
				[ this.twoFARequired, this.user.password ] = [ false, undefined ];
				this.$nextTick(() => this.$v.user?.email?.$reset());
				return;
			}
			this.user.email = this.user.email.trim().toLowerCase();
			if (!this.$v.user?.email?.$invalid) this.errorMessages.email = undefined;
			else if (!this.$v.user?.email?.$dirty) return;
			else if (!this.$v.user?.email?.required) this.errorMessages.email = 'email required';
			else if (!this.$v.user?.email?.email) this.errorMessages.email = 'email invalid';
		},
		watcher_password (): void {
			if (!this.user.password) {
				this.$nextTick(() => this.$v.user?.password?.$reset());
				return;
			}
			if (!this.$v.user?.password?.$invalid) this.errorMessages.password = undefined;
			else if (!this.$v.user?.password?.$dirty) return;
			else if (!this.$v.user?.password?.required) this.errorMessages.password = 'password required';
		},
	},
});
</script>