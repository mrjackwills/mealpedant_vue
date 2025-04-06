<template>
	<v-container fluid class='fill-height'>
		<v-row align='center' justify='center' wrap>
			<v-col cols='12' md='9'>
				<p class='text-center mb-2' :class='fontSize'>Enter your email address to receive instructions on how to
					reset your password</p>
				<v-row align='center' justify='center' wrap>
					<v-col cols='12' sm='8' md='4'>
						<v-form ref='form' v-on:submit.prevent>
							<v-text-field v-model='user.email' v-on:keyup.enter='forgot' @input='touch' @blur='touch()'
								:disabled='loading || completed' :error-messages='emailErrors' :prepend-inner-icon='mdiEmail'
								name='login' label='email' type='email'
								variant='underlined'
							/>
						</v-form>
						<div class='text-center mt-1'>
							<v-btn @click='goback' :disabled='loading || completed'
								rounded
								:color='loading || completed ? "" : "error"'
								:variant='loading || completed ? "outlined" : "flat"' class='elevation-0 mr-4' dark large>
								<ButtonIcon :icon='mdiClose' />
								cancel
							</v-btn>
							<v-btn @click='forgot' class='elevation-0' :disabled='send_disabled'
								:color='send_disabled?"":"secondary"'
								rounded
								:variant='send_disabled ? "outlined" : "flat"' dark
								large>
								send
								<ButtonIcon :icon='mdiSend' :margin='"ml-2"' />
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
import { email, required } from '@vuelidate/validators';
import { mdiClose, mdiEmail, mdiSend } from '@mdi/js';
import { snackSuccess } from '@/services/snack';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import useVuelidate from '@vuelidate/core';

const { mdAndDown } = useDisplay();

const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});

const send_disabled = computed(() => v$.value.$invalid || loading.value || completed.value);

const emailErrors = computed((): Array<string> => {
	const errors: Array<string> = [];
	if (!v$.value.user?.email?.$dirty) return errors;
	if (!v$.value.user?.email?.$dirty) errors.push('email invalid');
	if (!v$.value.email?.required) errors.push('email required');
	return errors;
});

const fontSize = computed(() => mdAndDown ? 'text-subtitle-1' : 'text-h5');

const completed = ref(false);
const user = ref({ email: '' });

const router = useRouter();
const touch = (): void => {
	v$.value.user?.email?.$touch();
};

const goback = (): void => {
	router.back();
};

/// ALWAYS sends a forgotten password axios request, and snack success
const forgot = async (): Promise<void> => {
	if (v$.value.$invalid) return;
	loading.value = true;
	const resetRequest = await axios_incognito.resetPassword_post(user.value.email);
	if (resetRequest) snackSuccess({
		message: resetRequest,
		icon: mdiEmail,
		type: 'success',
		timeout: 15000
	});
	completed.value = true;
	loading.value = false;
};

onMounted(() => {
	const browserStore = browserModule();
	browserStore.set_pageTitle('Forgot Password');
	browserStore.set_description('Meal Pedant - Reset you user account password');
});

const rules = {
	email: {
		email,
		required
	}
};
const v$ = useVuelidate(rules, user);

</script>