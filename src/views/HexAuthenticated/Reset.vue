<template>
	<v-container container--fluid fill-height>
		<v-row align='center' justify='center' wrap>
			<v-col cols='12' md='9'>
				<p class='text-center' :class='fontSize' >Please enter a new password</p>
				<v-row align='center' justify='center' wrap>
					<v-col cols='12' sm='8' md='4'>
						<v-form
							v-on:submit.prevent
							method='post'
						>
							<v-text-field
								v-for='(item, index) in textFields'
								:key='index'
								v-model='user[item.model]'
								v-on:keyup.enter='reset'
								@blur='touch(item.model)'
								@input='touch(item.model)'
								:error='errors[item.model]'
								:error-messages='errorMessages[item.model]'
								:disabled='loading || completed'
								:label='item.label'
								:prepend-icon='item.icon'
								:type='item.type'
								autocomplete='new-password'
							>
							</v-text-field>
							<v-expand-transition>
								<app-password-contains-email v-if='errors.new_password && !passNum' />
								<app-hibp-message v-if='passNum' :passNum='passNum' />
							</v-expand-transition>
							<section v-if='twoFA_active'>
								<v-text-field
									v-for='item in tokenFields'
									v-model='user[item.model]'
									@blur='touch(item.model)'
									@input='touch(item.model)'
									:dense='$vuetify.breakpoint.smAndDown'
									:disabled='loading || completed'
									:error='errors[item.model]'
									:error-messages='errorMessages[item.model]'
									:key='item.model'
									:label='item.label'
									:prepend-icon='item.icon'
									required
								/>
							</section>
						</v-form>
						<div class='text-center mt-1'>
							<v-btn
								@click='reset'
								:class='{"elevation-0": loading || $v.$invalid || completed || errors.new_password }'
								:disabled='loading || $v.$invalid || completed || errors.new_password || disabled'
								class='elevation-2'
								color='secondary'
								dark
								large
							>
								<app-button-icon :icon='mdiCached' />
								Change
							</v-btn>
						</div>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</v-container>
</template>

<script lang='ts'>
import { axios_incognito } from '@/services/axios';
import { env } from '@/vanillaTS/env';
import { loadingModule, resetPasswordModule } from '@/store';
import { mapStores } from 'pinia';
import { mdiCached, mdiLock, mdiLockReset, mdiEyeOff, mdiEye, mdiCellphoneInformation } from '@mdi/js';
import { MetaInfo } from 'vue-meta';
import { minLength, required } from 'vuelidate/lib/validators';
import { passwordCheck } from '@/vanillaTS/hibp';
import { snackSuccess } from '@/services/snack';
import { TResetPassword } from '@/types';
import ButtonIcon from '@/components/ButtonIcon.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'app-reset-password',

	beforeDestroy () {
		resetPasswordModule().$reset();

	},

	components: {
		// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
		AppHibpMessage: () => import(/* webpackChunkName: "hibp-message" */ /* webpackMode: "lazy" */ '@/components/HibpMessage.vue'),
		// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
		AppPasswordContainsEmail: () => import(/* webpackChunkName: "password-contains-email-message" */ /* webpackMode: "lazy" */ '@/components/PasswordContainsEmail.vue'),
		appButtonIcon: ButtonIcon,
	},

	computed: {
		...mapStores(resetPasswordModule),

		disabled (): boolean {
			return this.twoFA_active && !this.user.token;
		},

		fontSize (): string {
			return this.$vuetify.breakpoint.mdAndDown ? 'text-subtitle-1': 'text-h5';
		},
		loading: {
			get: function (): boolean {
				return loadingModule().loading;
			},
			set: function (b: boolean): void {
				loadingModule().set_loading(b);
			}
		},
		resetId (): string|undefined {
			return resetPasswordModule().id;
		},
		twoFA_active (): boolean {
			return this.resetPasswordStore.two_fa_active;
		},
		textFields () :Array<TResetPassword> {
			return [
				{
					autocomplete: 'new-password',
					icon: mdiLock,
					label: 'new password',
					model: 'new_password' as const,
					type: this.new_passwordVisible? 'text' : 'password',
					appendIcon: this.new_passwordVisible ? mdiEyeOff : mdiEye,
				},
			];
		},
		watcherPassword (): string {
			return this.user.new_password;
		},
		watcherToken (): string|undefined {
			return this.user.token;
		},
	},

	data: () => ({
		completed: false,
		errorMessages: {
			new_password: '',
			token: ''
		},
		errors: {
			new_password: false,
			token: false
		},
		mdiCached,
		mdiLockReset,
		new_passwordVisible: false,
		passNum: false,
		pageTitle: 'Password Reset',
		tokenFields: [
			{
				clearable: true,
				icon: mdiCellphoneInformation,
				label: '2FA code',
				model: 'token' as const,
			},
		],
		user: {
			new_password: '',
			token: undefined,
		},
	}),

	metaInfo (): MetaInfo {
		return {
			title: this.pageTitle,
			link: [
				{ rel: 'canonical', href: `${env.domain_www}${this.$route.path}` }
			]
		};
	},

	methods: {
		touch (name: string): void {
			this.$v.user?.[name]?.$touch();
		},
		async reset (): Promise<void> {
			if (this.$v.$invalid || !this.resetId) return;
			if (this.twoFA_active && !this.user.token) return;
			this.loading = true;
			this.passNum = await passwordCheck(this.user.new_password);
			if (this.passNum) {
				this.errors.new_password = true;
				this.loading = false;
				return;
			}

			// This is rubbish
			this.errorMessages = {
				token: '',
				new_password: ''
			};
			this.errors = {
				token: false,
				new_password: false
			};
			const success = await axios_incognito.reset_patch({ resetId: this.resetId, password: this.user.new_password, token: this.user.token });
			this.loading = false;
			if (success) {
				this.completed = true;
				this.$router.push('/signin');
				snackSuccess({ message: 'Password changed', timeout: 10000, icon: mdiLockReset });
			}
			else {
				this.user.new_password = '';
				if (this.twoFA_active) {
					this.user.token = undefined;
					this.errorMessages.token = 'invalid token';
				}
			}
		}
	},
	
	watch: {
		watcherPassword (): void {
			this.passNum = false;
			this.errors.new_password = false;
			if (!this.$v.user?.new_password?.$invalid && !this.passNum) this.errorMessages.new_password = '';
			else if (!this.$v.user?.new_password?.$dirty) return;
			else if (!this.$v.user?.new_password?.required) this.errorMessages.new_password = 'password required';
			else if (!this.$v.user?.new_password?.minLength) this.errorMessages.new_password = '12 characters minimum';
		},
	},
	
	validations: {
		user: {
			new_password: {
				required,
				minLen: minLength(12)
			},
		}
	}
});
</script>