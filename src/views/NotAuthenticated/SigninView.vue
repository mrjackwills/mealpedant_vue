
<template>
	<v-container fluid class='fill-height' >
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
							@click:append-inner='appendClick()'
							@input='touch(item.model)'
							:append-inner-icon='item.appendIcon'
							:disabled='loading || twoFARequired'
							:autocomplete='item.autocomplete'
							:error-messages='errorMessages[item.model]'
							:label='item.label'
							:prepend-inner-icon='item.icon'
							:type='item.type'
							variant='underlined'
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
									:autofocus='mdAndUp'
									:disabled='loading'
									:hint='"Your 2FA code is required to sign in"'
									:prepend-icon='mdiCellphoneLock'
									inputmode='numeric'
									label='2FA code'
									variant='underlined'
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
						<ButtonIcon :icon='mdiClose' />
						cancel
					</v-btn>
					<v-btn
						@click='signin'
						:class='{"elevation-0": signin_disabled}'
						:disabled='signin_disabled'
						class='elevation-2'
						:variant='signin_disabled?"outlined":"flat"'
						large
						:color='signin_disabled?"":"secondary"'
					>
						<ButtonIcon :icon='mdiLogin' />
						sign-in
					</v-btn>
				</div>
				<p class='cl text-center mt-4' v-if='!twoFARequired' @click='goforgot'>forgot password</p>
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup lang='ts'>

// let loadingStore = loadingModule();

import { axios_incognito, axios_authenticatedUser } from '@/services/axios';
import { mdiCellphoneLock, mdiClose, mdiEmail, mdiEye, mdiEyeOff, mdiLockOpenOutline, mdiLogin } from '@mdi/js';
import type { su } from '@/types';
import useVuelidate from '@vuelidate/core';
import { minLength, email, required } from '@vuelidate/validators';
import { FrontEndRoutes } from '@/types/const_routes';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { HttpCode } from '@/types/const_http';
const { mdAndUp } = useDisplay();

const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});
const pwa = computed((): boolean => {
	return browserModule().pwa;
});
const watcher_email = computed((): su => {
	return user.value.email;
});
const watcher_password = computed((): su => {
	return user.value.password;
});

const signin_disabled = computed((): boolean => {
	return loading.value || v$.value.$invalid || twoFARequired.value && !user.value.token;
});

const passwordVisible = ref(false);

/**
** Set the password visible
**/
const appendClick = (): void => {
	if (loading.value) return;
	passwordVisible.value = !passwordVisible.value;
};

const authed = ref(false);
const errorMessages = ref({
	email: undefined as su,
	password: undefined as su
});
const otpBackupEnabled = ref(false);
const textFields = computed(() => {
	return [
		{
			icon: mdiEmail,
			model: 'email' as const,
			label: 'EMAIL',
			type: 'email',
			appendIcon: '',
			autocomplete: 'username'
		},
		{
			icon: mdiLockOpenOutline,
			model: 'password' as const,
			label: 'PASSWORD',
			appendIcon: passwordVisible.value ? mdiEyeOff : mdiEye,
			type: passwordVisible.value ? 'text' : 'password',
			autocomplete: 'password'
		}
	]; 
});

const twoFARequired = ref(false);

const user = ref({
	email: '',
	password: '',
	token: '',
	remember: false
});

const router = useRouter();

onMounted(() => {
	const browserStore = browserModule();
	browserStore.set_pageTitle('Signin');
	browserStore.set_description('Meal Pedant - Sign in to your Meal Pedant account in order to explore the comprehensive daily log of ingestion');
});

const touch = (name: string): void => {
	v$.value.user?.[name]?.$touch();
};

/**
** On 2fa screen reset user data nad go back to blank signin page
*/
const cancel = (): void => {
	twoFARequired.value = false;
	user.value = {
		email: '',
		password: '',
		token: '',
		remember: false 
	};
	otpBackupEnabled.value = false;
};

/**
** go to forgotpassword page
*/
const goforgot = (): void => {
	router.push(FrontEndRoutes.FORGOTPASSWORD);
};

/**
** axios method to sign in user, works with both 2fa and non 2fa users
*/
const signin = async (): Promise<void> => {
	if (v$.value.$invalid) return;
	if (!user.value.email) return;
	if (!user.value.password) return;
	if (twoFARequired.value && !user.value.token) return;
	if (pwa.value) user.value.remember = true;
	loading.value = true;
	const authObject = {
		email: user.value.email.toLowerCase(),
		password: user.value.password,
		token: user.value.token ? user.value.token.replace(/\s/g, '') : undefined,
		remember: user.value.remember
	};
	passwordVisible.value = false;
	const loginRequest = await axios_incognito.signin_post(authObject);
	if (loginRequest?.status === HttpCode.OK) {
		authed.value = true;
		 
		user.value.email = '';
		 
		user.value.password = '';
		snackbarModule().$reset();
		userModule().set_authenticated(true);
		await axios_authenticatedUser.authenticated_get();
		router.push(FrontEndRoutes.BASE);
	} else if (loginRequest?.status === HttpCode.ACCEPTED) {
		 
		twoFARequired.value = true;
		otpBackupEnabled.value = loginRequest.response.twoFABackup;
		snackbarModule().$reset();
	} else {
		cancel();
	}
	loading.value = false;
};

const rules = {
	email: {
		email,
		required
	},
	password: {
		required,
		minLen: minLength(12)
	}
};
const v$ = useVuelidate(rules, user);

watch(watcher_email, () => {
	if (!user.value.email) {
		[ twoFARequired.value, user.value.password ] = [ false, '' ];
		v$.value.user?.email?.$reset();
		return;
	}
	user.value.email = user.value.email.trim().toLowerCase();
	if (!v$.value.user?.email?.$invalid) errorMessages.value.email = undefined;
	else if (!v$.value.user?.email?.$dirty) return;
	else if (!v$.value.user?.email?.required) errorMessages.value.email = 'email required';
	else if (!v$.value.user?.email?.email) errorMessages.value.email = 'email invalid';

});

watch(watcher_password, () => {
	if (user.value.password) {
		v$.value.user?.password?.$reset();
		return;
	}
	if (!v$.value.user?.password?.$invalid) errorMessages.value.password = undefined;
	else if (!v$.value.user?.password?.$dirty) return;
	else if (!v$.value.user?.password?.required) errorMessages.value.password = 'password required';
});
</script>