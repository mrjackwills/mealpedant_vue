<template>
	<v-container container--fluid fill-height>
		<v-row align='center' justify='center' wrap>
			<v-col cols='12' md='9'>
				<p class='text-center' :class='fontSize' >Please enter a new password</p>
				<v-row align='center' justify='center' wrap>
					<v-col cols='12' sm='8' md='5'>
						<v-form
							v-on:submit.prevent
							method='post'
						>
							<v-text-field
								v-show='false'
								label='EMAIL'
								type='email'
								autocomplete='email'
							/>
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
								variant='underlined'
							>
							</v-text-field>
							<v-expand-transition>
								<PasswordContainsEmail v-if='errors.new_password && !passNum' />
								<HibpMessage v-if='passNum' :passNum='passNum' />
							</v-expand-transition>
							<section v-if='twoFA_active'>
								<v-text-field
									v-for='item in tokenFields'
									v-model='user[item.model]'
									@blur='touch(item.model)'
									@input='touch(item.model)'
									:dense='smAndDown'
									:disabled='loading || completed'
									:error='errors[item.model]'
									:error-messages='errorMessages[item.model]'
									:key='item.model'
									:label='item.label'
									:prepend-icon='item.icon'
									variant='underlined'
									required
								/>
							</section>
						</v-form>
						<div class='text-center mt-1'>
							<v-btn
								@click='reset'
								:class='{"elevation-0": loading || v$.$invalid || completed || errors.new_password }'
								:color='loading || v$.$invalid || completed || errors.new_password || disabled?"":"secondary"'
								:disabled='loading || v$.$invalid || completed || errors.new_password || disabled'
								:variant='loading || v$.$invalid || completed || errors.new_password || disabled?"outlined":"flat"'
								size='large'
							>
								<ButtonIcon :icon='mdiCached' />
								Change
							</v-btn>
						</div>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup lang='ts'>
import { axios_incognito } from '@/services/axios';
import { FrontEndRoutes } from '@/types/enum_routes';
import { mdiCached, mdiLock, mdiLockReset, mdiEyeOff, mdiEye, mdiCellphoneInformation } from '@mdi/js';
import { minLength, required } from '@vuelidate/validators';
import { passwordCheck } from '@/vanillaTS/hibp';
import { snackSuccess } from '@/services/snack';
import { useDisplay } from 'vuetify';
import { useRouter } from 'vue-router';
import type { TResetPassword, u } from '@/types';
import useVuelidate from '@vuelidate/core';
const { mdAndDown, smAndDown } = useDisplay();

onBeforeUnmount(() => {
	resetPasswordModule().$reset();
});

const disabled = computed((): boolean => {
	return twoFA_active.value && !user.value.token;
});

const fontSize = computed((): string => {
	return mdAndDown.value ? 'text-subtitle-1': 'text-h5';
});
const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});
const resetId = computed((): string|undefined => {
	return resetPasswordModule().id;
});
const twoFA_active = computed((): boolean => {
	return resetPasswordModule().two_fa_active;
});
const textFields = computed(() :Array<TResetPassword> => {
	return [
		{
			autocomplete: 'new-password',
			icon: mdiLock,
			label: 'new password',
			model: 'new_password' as const,
			type: new_passwordVisible.value? 'text' : 'password',
			appendIcon: new_passwordVisible.value ? mdiEyeOff : mdiEye,
		},
	];
});
const watcher_password = computed((): string =>{
	return user.value.new_password;
});

const completed = ref(false);
const errorMessages = ref({
	new_password: '',
	token: ''
});
const errors = ref({
	new_password: false,
	token: false
});
const new_passwordVisible = ref(false);
const passNum = ref(false);
const tokenFields = ref([
	{
		clearable: true,
		icon: mdiCellphoneInformation,
		label: '2FA code',
		model: 'token' as const,
	},
]);
const user = ref({
	new_password: '',
	token: undefined as u<string>,
});

onMounted(() => {
	const browserStore = browserModule();
	browserStore.set_pageTitle('Reset Password');
	browserStore.set_description('Meal Pedant - Reset your password');
});

const router = useRouter();

const touch = (name: string): void => {
	v$.value[name]?.$touch();
};

const reset = async (): Promise<void> => {
	if (v$.value.$invalid || !resetId.value) return;
	if (twoFA_active.value && !user.value.token) return;
	loading.value = true;
	passNum.value = await passwordCheck(user.value.new_password);
	if (passNum.value) {
		errors.value.new_password = true;
		loading.value = false;
		return;
	}

	// This is rubbish
	errorMessages.value = {
		token: '',
		new_password: ''
	};
	errors.value = {
		token: false,
		new_password: false
	};
	const success = await axios_incognito.reset_patch({ resetId: resetId.value, password: user.value.new_password, token: user.value.token });
	loading.value = false;
	if (success) {
		completed.value = true;
		router.push(FrontEndRoutes.SIGNIN);
		router;
		snackSuccess({ message: 'Password changed', timeout: 10000, icon: mdiLockReset });
	}
	else {
		// eslint-disable-next-line require-atomic-updates
		user.value.new_password = '';
		if (twoFA_active.value) {
			// eslint-disable-next-line require-atomic-updates
			user.value.token = '';
			errorMessages.value.token = 'invalid token';
		}
	}
};
	
watch(watcher_password, () => {
	passNum.value = false;
	errors.value.new_password = false;
	if (!v$.value.user?.new_password?.$invalid && !passNum.value) errorMessages.value.new_password = '';
	else if (!v$.value.user?.new_password?.$dirty) return;
	else if (!v$.value.user?.new_password?.required) errorMessages.value.new_password = 'password required';
	else if (!v$.value.user?.new_password?.minLength) errorMessages.value.new_password = '12 characters minimum';
});
	
const rules ={
	new_password: {
		required,
		minLen: minLength(12)
	}
};
const v$ = useVuelidate(rules, user);
</script>