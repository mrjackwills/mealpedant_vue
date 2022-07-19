<template>
	<v-container container--fluid fill-height>
		<v-row align='center' justify='center' wrap>
			<v-col cols='12' md='9'>
				<p class='text-center' :class='fontSize' >Enter your email address to receive instuctions on how to reset your password</p>
				<v-row align='center' justify='center' wrap>
					<v-col cols='12' sm='8' md='4'>
						<v-form
							ref='form'
							v-on:submit.prevent>
							<v-text-field
								v-model='user.email'
								@input='touch(`email`)'
								@blur='touch(`email`)'
								v-on:keyup.enter='forgot'
								:disabled='loading || completed'
								:error-messages='emailErrors'
								:prepend-icon='mdiEmail'
								name='login'
								label='EMAIL'
								type='email'
							>
							</v-text-field>
						</v-form>
						<div class='text-center mt-1'>
							<v-btn
								@click='goback'
								:disabled='loading || completed'
								:class='{"elevation-0": $v.$invalid || loading || completed }'
								dark
								large
								class='elevation-2 mr-4'
								color='error'
							>
								<app-button-icon :icon='mdiClose' />
								cancel
							</v-btn>
							<v-btn
								@click='forgot'
								class='elevation-2'
								:disabled='$v.$invalid || loading || completed'
								:class='{"elevation-0": $v.$invalid || loading || completed }'
								color='secondary'
								dark
								large
							>
								send
								<app-button-icon :icon='mdiSend' :margin='"ml-2"' />
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
import { email, required } from 'vuelidate/lib/validators';
import { env } from '@/vanillaTS/env';
import { loadingModule } from '@/store';
import { mdiClose, mdiEmail, mdiSend } from '@mdi/js';
import { MetaInfo } from 'vue-meta';
import { snackSuccess } from '@/services/snack';
import ButtonIcon from '@/components/ButtonIcon.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'app-forgot-password',

	components: {
		appButtonIcon: ButtonIcon,
	},

	computed: {
		emailErrors (): Array<string> {
			const errors: Array<string> = [];
			if (!this.$v.user?.email?.$dirty) return errors;
			!this.$v.user?.email?.email && errors.push('email invalid');
			!this.$v.user?.email?.required && errors.push('email required');
			return errors;
		},
		fontSize (): string {
			return this.$vuetify.breakpoint.mdAndDown? 'text-subtitle-1': 'text-h5';
		},
		loading: {
			get: function (): boolean {
				return loadingModule().loading;
			},
			set: function (b: boolean): void {
				loadingModule().set_loading(b);
			}
		}
	},

	data: () => ({
		completed: false,
		mdiClose,
		mdiEmail,
		mdiSend,
		pageTitle: 'Forgot password',
		user: {
			email: '',
		},
	}),

	methods: {
		touch (name: string): void {
			this.$v.user?.[name]?.$touch();
		},

		goback (): void {
			this.$router.back();

		},
		/**
		 ** ALWAYS sends a forgotten password axios request, and snack success
		 */
		async forgot (): Promise<void> {
			if (this.$v.$invalid) return;
			this.loading = true;
			const resetRequest = await axios_incognito.resetPassword_post(this.user.email);
			if (resetRequest) snackSuccess({ message: resetRequest, icon: mdiEmail, type: 'success', timeout: 15000 });
			this.completed = true;
			this.loading = false;
		},
	},
	
	metaInfo (): MetaInfo {
		return {
			title: this.pageTitle,
			link: [
				{ rel: 'canonical', href: `${env.domain_www}${this.$route.path}` }
			]
		};
	},
	
	validations: {
		user: {
			email: {
				email,
				required,
			},
		}
	},

});
</script>