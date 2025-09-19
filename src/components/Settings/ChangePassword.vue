<template>
	<section>
		<v-row justify='start' class='ma-0 pa-0 my-0'>
			<v-col cols='auto' class='ma-0 pa-0' :class='[{ "ml-8": mdAndUp },headingSize]'>
				Change Password
			</v-col>
		</v-row>
		<v-row justify='center' class='my-0'>
			<v-col cols='12' sm='8' md='6'>
				<v-form v-on:submit.prevent method='post'>
					<v-text-field
						v-show='false'
						label='email'
						type='email'
						autocomplete='email'
					/>
					<v-row wrap justify='center'>
						<v-col cols='12' v-for='(item, index) in textFields' :key='index' class='pa-1'>
							<v-text-field :value='user[item.model]' @click:append-inner='appendClick(item.model)'
								@update:modelValue='valueTouch(item.model, $event)' @focus='focusMethod(item.model)'
								@keydown.enter='submit' :append-inner-icon='item.appendIcon' :autocomplete='item.autocomplete'
								:disabled='loading' :dense='smAndDown' :error-messages='errorMessages[item.model]'
								:error='errorMessages[item.model] ? true : false' :label='item.label'
								:prepend-inner-icon='item.icon' :type='item.type' required density='comfortable'
								variant='underlined'/>
						</v-col>
						<v-col cols='12' class='pa-0 mt-n2'>
							<v-expand-transition>
								<PasswordContainsEmail v-if='errors.new_password && !passwordCompromised' />
								<HibpMessage v-if='passwordCompromised' v-model='passwordCompromised' />
							</v-expand-transition>
						</v-col>
						<v-col cols='12' md='7' class='pa-1' v-if='twoFA_always_required'>
							<v-text-field v-for='item in tokenFields' v-model='user[item.model]'
								@focus='focusMethod(item.model)' v-on:keyup.enter='submit' :dense='smAndDown'
								:key='item.model' :label='item.label' :prepend-inner-icon='item.icon' required
								variant='underlined'
							/>
						</v-col>
					</v-row>
				</v-form>
			</v-col>
			<v-col class='ma-0 pa-0 mt-2' cols='12'>
				<v-row class='ma-a pa- 0' align='center' justify='center'>

					<v-col class='ma-0 pa-0' cols='auto'>
						<v-btn @click='cancel'
							:disabled='!user.current_password && !user.new_password || loading' :size='buttonSize'
							:variant='!user.current_password && !user.new_password || loading ? "outlined" : "flat"'
							class='elevation-0 mr-4' color='error' density='compact' dark rounded>
							<ButtonIcon :icon='mdiClose'
								:color='!user.current_password && !user.new_password || loading ? "red" : "white"' />
							cancel
						</v-btn>
					</v-col>

					<v-col class='ma-0 pa-0' cols='auto'>
						<v-btn @click='submit'
							density='compact'
							:disabled :size='buttonSize' :variant='disabled ? "outlined" : "flat"'
							class='elevation-0 text-black' color='primary' dark rounded>
							<ButtonIcon :icon='mdiCached' :color='disabled ? "primary" : "black"' />
							Update Password
						</v-btn>
					</v-col>


				</v-row>
				<v-row class='ma-0 pa-0 mt-4' align='center' justify='center'>
					<v-col class='ma-0 pa-0' cols='auto'>
						<v-checkbox v-model='user.remove_sessions' color=''
							density='compact' hide-details>
							<template v-slot:label>
								<span class='text-body-2'>remove other sessions</span>
							</template>
						</v-checkbox>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</section>
</template>

<script setup lang='ts'>
import { axios_authenticatedUser } from '@/services/axios';
import { mdiCached, mdiCellphoneInformation, mdiClose, mdiEye, mdiEyeOff, mdiLock, mdiLockOpenOutline } from '@mdi/js';
import { passwordCheck } from '@/vanillaTS/hibp';
import useVuelidate from '@vuelidate/core';
import { minLength, required } from '@vuelidate/validators';
import { snackSuccess } from '@/services/snack';
import type { PV, su, TChangePassword } from '@/types';
import { useDisplay } from 'vuetify';
const { lgAndUp, mdAndUp, mdAndDown, smAndDown } = useDisplay();

const buttonSize = computed(() => lgAndUp.value ? 'large' : mdAndDown.value ? 'small' : '');

const currentEmail = computed(() => userModule().email);
const disabled = computed(() => v$.value.$invalid ||
  errorMessages.value.new_password ||
  errorMessages.value.current_password ||
  passwordCompromised.value ||
  !user.value.new_password ||
  !user.value.current_password ||
  loading.value ||
  twoFA_always_required.value && !user.value.token ||
  twoFA_always_required.value && user.value.token && user.value.token.length < 6
	? true
	: false);
const headingSize = computed(() => mdAndDown.value ? 'text-h5' : 'text-h4');

const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});
const textFields = computed((): Array<TChangePassword> => {
	return [
		{
			autocomplete: 'new-password',
			icon: mdiLockOpenOutline,
			label: 'current password',
			model: 'current_password' as const,
			type: current_password_visible.value ? 'text' : 'password',
			appendIcon: current_password_visible.value ? mdiEyeOff : mdiEye
		},
		{
			autocomplete: 'new-password',
			icon: mdiLock,
			label: 'new password',
			model: 'new_password' as const,
			type: new_password_visible.value ? 'text' : 'password',
			appendIcon: new_password_visible.value ? mdiEyeOff : mdiEye
		}
	];
});
const twoFA_always_required = computed(() => twoFAModule().alwaysRequired);
const watcher_current_password = computed(() => user.value.current_password);
const watcher_new_password = computed(() => user.value.new_password);

const errorMessages = ref({
	current_password: '',
	new_password: ''
});
const errors = ref({
	current_password: '',
	new_password: ''
});
const current_password_visible = ref(false);
const passwordCompromised = ref(false);
const new_password_visible = ref(false);
const tokenFields = ref([
	{
		clearable: true,
		icon: mdiCellphoneInformation,
		label: '2FA code',
		model: 'token' as const
	}
]);
const user = ref({
	current_password: '',
	new_password: '',
	token: undefined as su,
	remove_sessions: false
});

// Set the password field visible
const appendClick = (model: string): void => {
	if (model === 'current_password') current_password_visible.value = !current_password_visible.value;
	else if (model === 'new_password') new_password_visible.value = !new_password_visible.value;
};

// Reset data, clear form
const cancel = (): void => {
	errorMessages.value.current_password = '';
	errorMessages.value.new_password = '';
	current_password_visible.value = false;
	new_password_visible.value = false;
	user.value.current_password = '';
	user.value.new_password = '';
	user.value.token = undefined;
	user.value.remove_sessions = false;
	v$.value.user?.$reset();
};

/*
 * set the this.focus to the currently in focus text field
 * If the in focus field ISN't the password field, then set current_password_visible to false
 * @param {String} model - current model/textfield name
 */
const focusMethod = (model: 'current_password' | 'new_password' | 'token'): void => {
	if (model === 'new_password') new_password_visible.value = false;
	if (model === 'current_password') current_password_visible.value = false;
	else [new_password_visible.value, current_password_visible.value] = [false, false];
};

/*
 * Instead of v-model, use this to change the value, and also touch the $v object
 * @param {String} model - current model/textfield name
 * @param {any} value - current values of the model
 */
const valueTouch = (model: 'current_password' | 'new_password' | 'token', value: string): void => {
	switch (model) {
		case 'current_password':
			user.value.current_password = value;
			v$.value.user?.current_password?.$touch();
			break;
		case 'new_password':
			user.value.new_password = value;
			v$.value.user?.new_password?.$touch();
			break;
		case 'token':
			user.value.token = value;
			v$.value.user?.token?.$touch();
			break;
	}
};

// store axios request to patch password
const submit = async (): PV => {
	if (v$.value?.$invalid || passwordCompromised.value || errorMessages.value.new_password || errorMessages.value.current_password ||
	  loading.value || disabled.value || !user.value.new_password || !user.value.current_password) return;
	loading.value = true;
	[new_password_visible.value, current_password_visible.value] = [false, false];

	passwordCompromised.value = await passwordCheck(user.value.new_password);
	if (passwordCompromised.value) {
		errorMessages.value.new_password = 'unsafe password';
		loading.value = false;
		return;
	}
	const changed = await axios_authenticatedUser.password_patch({
		current_password: user.value.current_password,
		new_password: user.value.new_password,
		token: user.value.token,
		remove_sessions: user.value.remove_sessions
	});
	if (changed) snackSuccess({ message: 'password changed' });
	loading.value = false;
	cancel();
};

// common watcher method, for new and current password watcher
const watch_password_common = (): void => {
	const i = user.value.new_password;
	passwordCompromised.value = false;
	if (i && user.value.current_password && i === user.value.current_password) errorMessages.value.new_password = 'no change in password';
	else if (user.value.current_password && i?.includes(user.value.current_password)) errorMessages.value.new_password = 'new password cannot contain old password';
	else if (!user.value.new_password) {
		v$.value.user?.new_password?.$reset();
		new_password_visible.value = false;
	} else if (currentEmail.value && i?.toLowerCase().includes(currentEmail.value.toLowerCase().trim()) || currentEmail.value && i?.toLowerCase().includes(currentEmail.value.toLowerCase().trim())) {
		errorMessages.value.new_password = 'password cannot contain email';
	} else if (!v$.value.user?.new_password?.$invalid && !passwordCompromised.value) errorMessages.value.new_password = '';
	else if (!v$.value.user?.new_password?.$dirty) return;
	else if (!v$.value.user?.new_password?.required) errorMessages.value.new_password = 'a password is required';
	else if (!v$.value.user?.new_password.minLen) errorMessages.value.new_password = `${12} characters minimum`;
};

const rules = {
	current_password: {
		required,
		minLen: minLength(12)
	},
	new_password: {
		required,
		minLen: minLength(12)
	}
};
const v$ = useVuelidate(rules, user);

watch(watcher_new_password, () => {
	errorMessages.value.new_password = '';
	watch_password_common();
});

watch(watcher_current_password, () => {
	errorMessages.value.current_password = '';
	watch_password_common();
});

</script>
