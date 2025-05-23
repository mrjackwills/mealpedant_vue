<template>
	<v-container fluid class='fill-height'>
		<v-row align='center' justify='center' wrap>
			<v-col cols='12' sm='8' md='4'>
				<v-form v-on:submit.prevent method='post'>
					<div v-for='(item, index) in textFields' :key='index'>
						<v-expand-transition>
							<PasswordContainsEmail v-if='item.label === "invite" && errors.password && !passNum' />
							<HibpMessage v-if='item.label === "invite" && passNum' :passNum='passNum' />
						</v-expand-transition>
						<v-text-field v-model='user[item.model]' v-on:keyup.enter='register' @input='touch(item.model)'
							@blur='touch(item.model)' :autocomplete='item.autocomplete' :disabled='loading || completed'
							@click:append-inner='appendClick(item.model)'
							:append-inner-icon='item.appendIcon'

							:error='errors[item.model]' :error-messages='errorMessages[item.model]' :label='item.label'
							:prepend-inner-icon='item.icon' :type='item.type' variant='underlined' />
					</div>
				</v-form>
				<div class='text-center mt-1'>
					<v-btn @click='cancel' :disabled='loading || completed'
						:variant='loading || completed ? "outlined" : "flat"' class='elevation-0 mr-4'
						:color='loading || completed ? "" : "error"' dark large
						rounded>
						<ButtonIcon :icon='mdiClose' />
						cancel
					</v-btn>
					<v-btn @click='register' :disabled='loading || v$.$invalid || errors.password || completed'
						:variant='loading || v$.$invalid || errors.password || completed ? "outlined" : "flat"'
						class='elevation-0'
						:color='loading || v$.$invalid || errors.password || completed ? "" : "secondary"' dark large
						rounded>
						<ButtonIcon :icon='mdiAccountPlus' />
						Register
					</v-btn>
				</div>
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup lang='ts'>

import { axios_incognito } from '@/services/axios';
import { email, minLength, required } from '@vuelidate/validators';
import {
	mdiAccount,
	mdiAccountPlus,
	mdiClose,
	mdiEmail,
	mdiLock,
	mdiEye, 
	mdiEyeOff,
	mdiKeyboard
} from '@mdi/js';
import { passwordCheck } from '@/vanillaTS/hibp';
import { snackSuccess } from '@/services/snack';
import useVuelidate from '@vuelidate/core';
import { FrontEndRoutes } from '@/types/const_routes';
import { PV } from '@/types';

const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});

const watcher_email = computed(() => user.value.email);
const watcher_full_name = computed(() => user.value.full_name);
const watcher_invite = computed(() => user.value.invite);
const watcher_password = computed(() => user.value.password);

const password_visible = ref(false);

/// Set the password field visible
const appendClick = (model: string): void => {
	if (model === 'password') password_visible.value = !password_visible.value;
};

const completed = ref(false);
const errorMessages = ref({
	email: '',
	full_name: '',
	password: '',
	invite: ''
});
const errors = ref({
	email: false,
	full_name: false,
	password: false,
	invite: false
});
const passNum = ref(false);
const textFields = computed(() => [
	{
		autocomplete: 'full_name',
		icon: mdiAccount,
		label: 'full name',
		model: 'full_name' as const,
		type: 'text'
	},
	{
		autocomplete: 'email',
		icon: mdiEmail,
		label: 'email',
		model: 'email' as const,
		type: 'text'
	},
	{
		autocomplete: 'new-password',
		icon: mdiLock,
		label: 'password',
		model: 'password' as const,
		type: password_visible.value ? 'text' : 'password',
		appendIcon: password_visible.value ? mdiEyeOff : mdiEye
	},
	{
		autocomplete: 'invite',
		icon: mdiKeyboard,
		label: 'invite',
		model: 'invite' as const,
		type: 'text'
	}
]);
const user = ref({
	email: '',
	full_name: '',
	invite: '',
	password: ''
});

onMounted(() => {
	const browserStore = browserModule();
	browserStore.set_pageTitle('Register');
	browserStore.set_description('Meal Pedant - Register for an account in order to gain access to the daily log of ingestion');
});

const router = useRouter();

/// On cancel button press, either go to base page, or meal page, depedning if meal page has already been visited
const cancel = async (): PV => {
	if (mealModule().meals_length > 0) await router.push(FrontEndRoutes.MEALS);
	else await router.push(FrontEndRoutes.BASE);
};

const touch = (name: string): void => {
	v$.value[name]?.$touch();
};
const register = async (): PV => {
	if (v$.value.$invalid) return;
	if (user.value.password.toLowerCase().includes(user.value.email.toLowerCase().trim())) {
		errors.value.password = true;
		return;
	}
	loading.value = true;
	passNum.value = await passwordCheck(user.value.password);
	if (passNum.value) {
		errors.value.password = true;
		loading.value = false;
		return;
	}
	password_visible.value = false;
	const registerRequest = await axios_incognito.register_post(user.value);
	if (registerRequest) {
		completed.value = true;
		snackSuccess({
			message: registerRequest,
			timeout: 20000,
			closable: false,
			type: 'success'
		});
	}
	loading.value = false;
};

const rules = {
	email: {
		email,
		required
	},
	full_name: { required },
	invite: { required },
	password: {
		required,
		minLen: minLength(12)
	}
};
const v$ = useVuelidate(rules, user);

watch(watcher_email, () => {
	user.value.email = user.value.email.toLowerCase().trim();
	if (!v$.value.user?.email?.$invalid) errorMessages.value.email = '';
	else if (!v$.value.user?.email?.$dirty) return;
	else if (!v$.value.user?.email?.required) errorMessages.value.email = 'email required';
	else if (!v$.value.user?.email?.email) errorMessages.value.email = 'email invalid';

});

watch(watcher_full_name, () => {
	if (!v$.value.user?.firstName?.$invalid) errorMessages.value.full_name = '';
	else if (!v$.value.user?.firstName?.$dirty) return;
	else if (!v$.value.user?.firstName?.required) errorMessages.value.full_name = 'full name required';
});

watch(watcher_invite, () => {
	user.value.invite = user.value.invite.toLowerCase().trim();
	if (!v$.value.user?.invite?.$invalid) errorMessages.value.invite = '';
	else if (!v$.value.user?.invite?.$dirty) return;
	else if (!v$.value.user?.invite?.required) errorMessages.value.invite = 'invite required';
});

watch(watcher_password, () => {
	passNum.value = false;
	errors.value.password = false;
	if (user.value.email && user.value.password.toLowerCase().includes(user.value.email.toLowerCase().trim())) errors.value.password = true;
	else if (user.value.email && user.value.password) {
		const a = user.value.email.toLowerCase().trim().split('@')[0];
		if (a && user.value.password.toLowerCase().includes(a)) errors.value.password = true;
	} else if (!v$.value.user?.password?.$invalid && !passNum.value) errorMessages.value.password = '';
	else if (!v$.value.user?.password?.$dirty) return;
	else if (!v$.value.user?.password?.required) errorMessages.value.password = 'password required';
	else if (!v$.value.user?.password?.minLength) errorMessages.value.password = '12 characters minimum';
});

</script>
