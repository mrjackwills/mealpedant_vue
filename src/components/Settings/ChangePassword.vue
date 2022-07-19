<template>
	<section>
		<v-row justify='start' class='ma-0 pa-0 my-0'>
			<v-col cols='auto' class='ma-0 pa-0' :class='{"ml-8": $vuetify.breakpoint.mdAndUp}'>
				<div class='' :class='headingSize'>Change Password</div>
			</v-col>
		</v-row>
		<v-row justify='center' class='my-0'>
			<v-col cols='12' sm='8' md='6'>
				<v-form
					v-on:submit.prevent
					method='post'
				>
					<v-row wrap justify='center'>
						<v-col cols='12' md='7' v-for='(item, index) in textFields' :key='index' class='pa-1'>
							<v-text-field
								:value='user[item.model]'
								@click:append='appendClick(item.model)'
								@input='valueTouch(item.model, $event)'
								@focus='focusMethod(item.model)'
								@keydown.enter='submit'
								:append-icon='item.appendIcon'
								:autocomplete='item.autocomplete'
								:disabled='loading'
								:dense='$vuetify.breakpoint.smAndDown'
								:error-messages='errorMessages[item.model]'
								:error='errorMessages[item.model]? true : false'
								:label='item.label'
								:prepend-icon='item.icon'
								:type='item.type'
								required
							/>
						</v-col>
						<v-col cols='12' class='pa-0 mt-n2'>
							<v-expand-transition>
								<app-password-contains-email v-if='errors.new_password && !passwordCompromised' />
								<app-hibp-message v-if='passwordCompromised' :passNum.sync='passwordCompromised' />
							</v-expand-transition>
						</v-col>
						<v-col cols='12' md='7' class='pa-1' v-if='twoFA_always_required'>
							<v-text-field
								v-for='item in tokenFields'
								v-model='user[item.model]'
								@focus='focusMethod(item.model)'
								v-on:keyup.enter='submit'
								:dense='$vuetify.breakpoint.smAndDown'
								:key='item.model'
								:label='item.label'
								:prepend-icon='item.icon'
								required
							/>
						</v-col>
					</v-row>
				</v-form>
			</v-col>
			<v-col cols='12'>
				<div class='text-center'>
					<v-btn
						@click='cancel'
						:large='$vuetify.breakpoint.lgAndUp'
						:class='{"elevation-0": !this.user.current_password && !this.user.new_password || loading}'
						:disabled='!this.user.current_password && !this.user.new_password || loading'
						:small='$vuetify.breakpoint.mdAndDown'
						class='elevation-2 mr-4'
						color='error'
						dark
					>
						<app-button-icon :icon='mdiClose' />
						cancel
					</v-btn>
					<v-btn
						@click='submit'
						:class='{"elevation-0": loading || $v.$invalid || errors.new_password || errors.current_password}'
						:disabled='disabled'
						:large='$vuetify.breakpoint.lgAndUp'
						:small='$vuetify.breakpoint.mdAndDown'
						class='elevation-2 black--text'
						color='primary'
						dark
					>
						<app-button-icon :icon='mdiCached' color='black' />
						Update Password
					</v-btn>
				</div>
			</v-col>
		</v-row>
	</section>
</template>

<script lang='ts'>
import { axios_authenticatedUser } from '@/services/axios';
import { loadingModule, twoFAModule, userModule } from '@/store';
import { mdiCached, mdiCellphoneInformation, mdiCheckOutline, mdiClose, mdiEye, mdiEyeOff, mdiLock, mdiLockOpenOutline, } from '@mdi/js';
import { passwordCheck } from '@/vanillaTS/hibp';
import { required, minLength } from 'vuelidate/lib/validators';
import { snackSuccess } from '@/services/snack';
import { su, TChangePassword } from '@/types';
import ButtonIcon from '@/components/ButtonIcon.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'change-password-component',
	components: {
		// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
		AppHibpMessage: () => import(/* webpackChunkName: "hibp-message" */ /* webpackMode: "lazy" */ '@/components/HibpMessage.vue'),
		// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
		AppPasswordContainsEmail: () => import(/* webpackChunkName: "password-contains-email-message" */ /* webpackMode: "lazy" */ '@/components/PasswordContainsEmail.vue'),
		appButtonIcon: ButtonIcon,
	},

	computed: {
		currentEmail (): su {
			return userModule().email;
		},
		disabled (): boolean {
			// return true;
			return this.$v.user?.$invalid ||
				this.errorMessages.new_password ||
				this.errorMessages.current_password ||
				this.passwordCompromised ||
				this.loading ||
				this.twoFA_always_required && !this.user.token ||
				this.twoFA_always_required && this.user.token && this.user.token.length < 6
				? true : false;
		},
		headingSize (): string {
			return this.$vuetify.breakpoint.mdAndDown? 'text-h5':'text-h4';
		},
		loading: {
			get: function (): boolean {
				return loadingModule().loading;
			},
			set: function (b: boolean): void {
				loadingModule().set_loading(b);
			}
		},
		pSize (): string {
			return this.$vuetify.breakpoint.mdAndDown? 'text-body-1':'text-h6';
		},
		textFields () :Array<TChangePassword> {
			return [
				{
					autocomplete: 'new-password',
					icon: mdiLockOpenOutline,
					label: 'current password',
					model: 'current_password' as const,
					type: this.current_password_visible? 'text' : 'password',
					appendIcon: this.current_password_visible ? mdiEyeOff : mdiEye,
				},
				{
					autocomplete: 'new-password',
					icon: mdiLock,
					label: 'new password',
					model: 'new_password' as const,
					type: this.new_password_visible? 'text' : 'password',
					appendIcon: this.new_password_visible ? mdiEyeOff : mdiEye,
				},
			];
		},
		twoFA_always_required (): boolean {
			return twoFAModule().alwaysRequired;
		},
		watcher_current_password () : su {
			return this.user.current_password;
		},
		watcher_new_password (): su {
			return this.user.new_password;
		},
	},

	data: () => ({
		completed: false,
		confirm: false,
		errorMessages: {
			current_password: undefined as su,
			new_password: undefined as su
		},
		errors: {
			current_password: undefined as su,
			new_password: undefined as su
		},
		current_password_visible: false,
		passwordCompromised: false,
		mdiCached,
		mdiCellphoneInformation,
		mdiCheckOutline,
		mdiClose,
		new_password_visible: false,
		tokenFields: [
			{
				clearable: true,
				icon: mdiCellphoneInformation,
				label: '2FA code',
				model: 'token' as const,
			},
		],
		user: {
			current_password: undefined as su,
			new_password: undefined as su,
			token: undefined as su,
		},
	}),

	methods: {
		/**
		 ** Set the password field visible
		 * */
		// password' | 'new_password
		appendClick (model: string): void {
			if (model === 'current_password') this.current_password_visible = !this.current_password_visible;
			else if (model === 'new_password') this.new_password_visible = !this.new_password_visible;
		},
		/**
		 ** Reset data, clear form
		 */
		cancel (): void {

			this.errorMessages.current_password = undefined;
			this.errorMessages.new_password = undefined;
			this.current_password_visible = false;
			this.new_password_visible = false;
			this.user.current_password = undefined;
			this.user.new_password = undefined;
			this.user.token = undefined;
			this.$v.user?.$reset();

		},
		/**
		 ** set the this.focus to the currently in focus text field
		 ** If the in focus field ISN't the password field, then set current_password_visible to false
		 * @param {String} model - current model/textfield name
		 */
		focusMethod (model: 'current_password' | 'new_password' | 'token'): void {
			if (model === 'new_password') this.new_password_visible = false;
			if (model === 'current_password') this.current_password_visible = false;
			else [ this.new_password_visible, this.current_password_visible ] = [ false, false ];
		},
		/**
		 ** Instead of v-model, use this to change the value, and also touch the $v object
		 * @param {String} model - current model/textfield name
		 * @param {any} value - current values of the model
		 * */
		// keyof TPasswordChange
		valueTouch (model: 'current_password' | 'new_password' | 'token', value: string): void {
			switch (model) {
			case 'current_password':
				this.user.current_password = value;
				this.$v?.user?.current_password?.$touch();
				break;
			case 'new_password':
				this.user.new_password = value;
				this.$v?.user?.new_password?.$touch();
				break;
			case 'token':
				this.user.token = value;
				this.$v?.user?.token?.$touch();
				break;
			}
		},
		/**
		 ** store axios request to patch password
		 */
		async submit (): Promise<void> {
			// todo token required but not present or under 6 length
			if (this.$v?.$invalid || this.passwordCompromised || this.errorMessages.new_password || this.errorMessages.current_password || this.loading) return;
			if (this.disabled) return;
			if (!this.user.new_password || !this.user.current_password) return;
			this.loading = true;
			[ this.new_password_visible, this.current_password_visible ] = [ false, false ];
			this.passwordCompromised = await passwordCheck(this.user.new_password);
			if (this.passwordCompromised) {
				this.errorMessages.new_password = 'unsafe password';
				this.loading = false;
				return;
			}
			const changed = await axios_authenticatedUser.password_patch({
				current_password: this.user.current_password,
				new_password: this.user.new_password,
				token: this.user.token
			});
			if (changed) snackSuccess({ message: 'Password changed' });
			this.loading = false;
			this.cancel();
		},
		/**
		 ** common watcher method, for new and current password watcher
		 */
		watch_password_common (): void {
			const i = this.user.new_password;
			if (i && this.user.current_password && i === this.user.current_password) this.errorMessages.new_password = 'no change in password';
			else if (this.user.current_password && i?.includes(this.user.current_password)) this.errorMessages.new_password = 'new password cannot contain old password';
			else if (!this.user.new_password) {
				this.$v.user?.new_password?.$reset();
				this.new_password_visible = false;
			}
			else if (this.currentEmail && i?.toLowerCase().includes(this.currentEmail.toLowerCase().trim()) || this.currentEmail && i?.toLowerCase().includes(this.currentEmail.toLowerCase().trim())) {
				this.errorMessages.new_password = 'password cannot contain email';
			}
			else if (!this.$v.user?.new_password?.$invalid && !this.passwordCompromised) this.errorMessages.new_password = '';
			else if (!this.$v.user?.new_password?.$dirty) return;
			else if (!this.$v.user?.new_password?.required) this.errorMessages.new_password = 'a password is required';
			else if (!this.$v.user?.new_password.minLen) this.errorMessages.new_password = `${12} characters minimum`;
		}
	},

	validations: {
		user: {
			current_password: {
				required,
				minLen: minLength(12)
			},
			new_password: {
				required,
				minLen: minLength(12)
			}
		}
	},

	watch: {
		watcher_password (): void {
			this.passwordCompromised = false;
			this.errorMessages.current_password = '';
			this.watch_password_common();
		},
		watcher_new_password (): void {
			this.passwordCompromised = false;
			this.errorMessages.new_password = '';
			this.watch_password_common();
		}
	},

});
</script>