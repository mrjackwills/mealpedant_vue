<template>
	<v-dialog
		:max-width='maxWidth'
		:overlay-opacity='.5'
		:value='visible'
		overlay-color='#929892'
		width='100%'
		eager
		persistent
	>
		<v-card v-intersect='onIntersect'>
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
									v-for='item in textFields'
									v-model='user[item.model]'
									@click:append='passwordVisible = !passwordVisible'
									@keydown.enter='click'
									@focus='focusMethod(item.model)'
									:append-icon='item.appendIcon'
									:autocomplete='item.autocomplete'
									:dense='$vuetify.breakpoint.smAndDown'
									:disabled='loading'
									:key='item.model'
									:label='item.label'
									:prepend-inner-icon='item.icon'
									:type='item.type'
									class='mb-n3'
									outlined
									required
								/>
							</template>
							<template v-if='passwordRequired && twoFA_always_required'>
								<v-text-field
									v-for='item in tokenFields'
									v-model='user[item.model]'
									@focus='focusMethod(item.model)'
									v-on:keyup.enter='click'
									:dense='$vuetify.breakpoint.smAndDown'
									:key='item.model'
									:label='item.label'
									:prepend-inner-icon='item.icon'
									outlined
									required
								/>
							</template>
						</v-form>
					</v-col>
				</v-row>
			</section>

			<v-card-actions>
				<v-row class='ma-0 pa-0' justify='center' align='center'>
					<v-col cols='12' md='8' lg='6' class='ma-0 pa-0' >
						<v-row align='center' justify='space-around' class='ma-0 pa-0 mb-4'>
							<v-col cols='auto' class='ma-0 pa-0'>
								<v-btn
									@click='cancel'
									:small='$vuetify.breakpoint.smAndDown'
									color='error'
								>
									<app-button-icon :icon='mdiClose' />
									cancel
								</v-btn>
							</v-col>
							<v-spacer />
							<v-col cols='auto' class='ma-0 pa-0'>
								<v-btn
									@click='click'
									:disabled='disabled'
									:small='$vuetify.breakpoint.smAndDown'
									color='secondary'
								>
									<div class='white--text' :class='{"monospace-font":monospace, "font-weight-black":monospace}'>{{ timeout_text }}</div>
									
									<app-button-icon
										v-if='!monospace'
										:disabled.sync='disabled'
										:icon.sync='timeout_icon'
										
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

<script lang='ts'>
import { dialogModule, twoFAModule } from '@/store';
import { mapStores } from 'pinia';
import { mdiCellphoneInformation, mdiCheck, mdiClose, mdiEye, mdiEyeOff, mdiLock } from '@mdi/js';
import { su, u, TConfirmFunction, TDialogTextField } from '@/types';
import ButtonIcon from '@/components/ButtonIcon.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'the-dialog',

	components: {
		appButtonIcon: ButtonIcon
	},

	computed: {
		...mapStores(dialogModule),

		confirmFunction (): u<TConfirmFunction> {
			return this.dialogStore.confirmFunction;
		},
		
		confirmButton (): string {
			return this.dialogStore.confirmButton ?? 'confirm';
		},
		disabled (): boolean {
			return this.loading
				|| this.timeout
				|| this.passwordRequired && !this.user.password
				|| this.passwordRequired && this.twoFA_always_required && !this.user.token
				|| this.twoFA_always_required && this.passwordRequired && this.tokenLength <6
				|| this.passwordRequired && this.passwordLength < 10
				? true: false;
		},
		logout (): string {
			return this.title.toLowerCase() ?? 'logout';
		},
		maxWidth (): string {
			return 	this.$vuetify.breakpoint.mdAndUp? '60vw' : '100vw';
		},
		message (): su {
			return this.dialogStore.message;
		},
		messageSize (): string {
			return this.$vuetify.breakpoint.mdAndUp? 'text-h5' : 'text-subtitle-1';
		},
		monospace (): boolean {
			return this.timeout > 0 ? true : false;
		},
		passwordRequired (): boolean {
			return this.dialogStore.passwordRequired;
		},
		passwordLength (): number {
			return this.user.password ? this.user.password.length: 0;
		},
		textFields (): TDialogTextField {
			return [
				{
					autocomplete: 'new-password',
					icon: mdiLock,
					label: 'password',
					model: 'password' as const,
					type: this.passwordVisible? 'text' : 'password',
					appendIcon: this.user.password ? this.passwordVisible ? mdiEyeOff : mdiEye : '',
				},
			];
		},
		timeout: {
			get (): number {
				return this.dialogStore.timeout;
			},
			set (n: number): void {
				this.dialogStore.set_timeout(n);
			},
		},

		timeout_text (): string {
			return this.timeout ?
				`${String(this.timeout).padStart(2, '0')}` : this.passwordRequired && !this.user.password || this.passwordRequired && this.passwordLength < 10
					? 'password required ' : this.passwordRequired && this.twoFA_always_required && !this.user.token || this.passwordRequired && this.twoFA_always_required && this.tokenLength <6
						? 'token required' : this.confirmButton;
		},
		timeout_icon (): string {
			return this.timeout ? '' : this.passwordRequired && !this.user.password|| this.passwordRequired && this.passwordLength < 10
				? mdiLock : this.passwordRequired && this.twoFA_always_required && !this.user.token || this.passwordRequired && this.twoFA_always_required && this.tokenLength <6
					? mdiCellphoneInformation: this.dialogStore.icon?? mdiCheck;
		},
		title (): string {
			return this.dialogStore.title ?? 'warning';
		},
		titleSize (): string {
			return this.$vuetify.breakpoint.mdAndUp? 'text-h4' : 'text-h6';
		},
		tokenLength (): number {
			return this.user.token ? this.user.token.length: 0;

		},
		twoFA_always_required (): boolean {
			return twoFAModule().alwaysRequired;
		},
		twoFABackup_enabled (): boolean {
			return twoFAModule().backup_count > 0;
		},

		visible: {
			get (): boolean {
				return this.dialogStore.visible;
			},
			set (b: boolean): void {
				this.dialogStore.set_visible(b);
			}
		},
	},
	data: () => ({
		isIntersecting: false,
		loading: false,
		localDisabled: false,
		mdiCellphoneInformation,
		mdiCheck,
		mdiClose,
		passwordVisible: false,
		timeoutInterval: 0,
		tokenFields: [
			{
				clearable: true,
				icon: mdiCellphoneInformation,
				label: '2FA code',
				model: 'token' as const,
			},
		],
		user: {
			password: '',
			token: undefined as string | undefined,
		}
	}),
	methods: {
		cancel (): void {
			this.visible = false;
		},
		clearTimeouts (): void {
			clearInterval(this.timeoutInterval);
			this.localDisabled =false;
			this.timeout = 0;
		},
		async click (): Promise<void> {
			if (this.passwordRequired && !this.user.password || this.timeout > 0) return;
			this.passwordVisible = false;
			this.visible = false;
			if (!this.confirmFunction) return;

			const data = {
				password: this.user.password,
				token: this.user.token,
			};
			await this.confirmFunction(data);
			this.dialogStore.$reset();
		},
		/**
		 ** set the this.focus to the currently in focus text field
		 ** If the in focus field ISN't the password field, then set passwordVisible to false
		 * @param {String} model - current model/textfield name
		 */
		focusMethod (model: string): void {
			if (model !== 'password') this.passwordVisible = false;
		},
		/**
		 ** When visible, set a timeout for the button, if params are met
		 */
		mountedTimeout (): void {
			if (!this.isIntersecting) return ;
			if (!this.timeout) return;
			this.timeoutInterval = setInterval(() => {
				this.timeout = this.timeout > 0 ? this.timeout -= 1: this.timeout;
				if (this.timeout < 1) clearInterval(this.timeoutInterval);
			}, 1000);
		},
		/**
		 ** update this.isIntersectin when visible & not
		 */
		onIntersect (entries: Array<IntersectionObserverEntry>, _observer: IntersectionObserver): void {
			this.isIntersecting = !!entries[0]?.isIntersecting;
		},
	},
	mounted () {
		this.mountedTimeout();
	},
	watch: {
		isIntersecting (i): void {
			if (i) this.mountedTimeout();
			else {
				this.user.password = '';
				this.user.token = undefined;
				this.clearTimeouts();
				this.dialogStore.$reset();
			}
		},
	}
});
</script>

<style>

.countdown{
	font-feature-settings: 'tnum' 1;
	font-feature-settings: "tnum";
	font-family: 'Hammersmith One', monospace !important;
}
</style>