<template>
	<v-row class='ma-0 pa-0' justify='center'>
		<v-col cols='12' lg='8' class='ma-0 pa-0'>
			<v-icon size='x-small' :icon='mdiCircle' class='mr-1' /> Ensure you have an authenticator app installed on your cell
			phone (other authenticator apps are available)
		</v-col>
		<v-col cols='12' lg='8' class='ma-0 pa-0'>
			<v-row align='center' class='' justify='center'>
				<v-col v-for='(item, index) of appLinks' :key='index' cols='auto' class=''>
					<a :href='item.href' rel='noopener noreferrer' target='_blank'>
						<v-btn rounded variant='flat'>
							<v-icon>{{ item.icon }}</v-icon>
							{{ item.platform }}
						</v-btn>
					</a>
				</v-col>
			</v-row>
		</v-col>
	</v-row>
	<v-row class='ma-0 pa-0' justify='center'>
		<v-col cols='12' lg='8' class='ma-0 pa-0'>
			<v-icon size='x-small' :icon='mdiCircle' class='mr-1' />Use the authenticator app to scan the following qr code (or
			manually enter the secret)
		</v-col>
	</v-row>
	<v-row class='ma-0 pa-0 my-2' justify='center'>
		<v-col cols='auto' class='text-center ma-0 pa-0'>
			<QrCode :value='qrCode' :size='size' level='H' render-as='svg' />
			<v-row class='' justify='center'>
				<v-col cols='auto' class='pa-0 text-caption mt-3'>
					secret: {{ secret }}
				</v-col>
			</v-row>
		</v-col>
	</v-row>
	<v-row class='ma-0 pa-0' justify='center'>
		<v-col cols='12' lg='8' class='ma-0 pa-0'>
			<v-icon size='x-small' :icon='mdiCircle' class='mr-1' />
			Enter the six digit code generated by the authenticator app into the box below and verify that the code
			is correct
		</v-col>
	</v-row>
	<v-row justify='center' class='ma-0 pa-0 my-2'>
		<v-col cols='12' lg='2' class='ma-0 pa-0'>
			<v-text-field v-model='userToken' @keydown.enter='verify' :autofocus='true'
				:density='smAndDown ? "compact" : "comfortable"' :error-messages='errorMessage'
				:prepend-inner-icon='mdiCellphoneInformation' class='mb-n6' label='app generated code'
				variant='underlined'
				required />
		</v-col>
	</v-row>
	<v-row align='center' justify='center' class='ma-0 pa-0'>
		<v-col cols='auto'>
			<v-btn @click='cancel' color='error' variant='flat' rounded>
				<v-icon :icon='mdiClose' />
				cancel
			</v-btn>

		</v-col>
		<v-col cols='auto'>
			<v-btn @click='verify' :disabled='!userToken' :variant='!userToken ? "outlined" : "flat"'
				rounded
				:color='!userToken ? "black" : "secondary"'>
				<v-icon :icon='mdiCheck' />
				verify
			</v-btn>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { axios_authenticatedUser } from '@/services/axios';
import { mdiApple, mdiClose, mdiCheck, mdiCircle, mdiCellphoneInformation, mdiGooglePlay } from '@mdi/js';
import { snackSuccess } from '@/services/snack';
import type { PV, su } from '@/types';
import QrCode from 'qrcode.vue';
import { useDisplay } from 'vuetify';
const { smAndDown, mdAndUp } = useDisplay();

onBeforeUnmount(() => {
	cancel();
});

const secret = computed(() => twoFAModule().secret);
const email = computed(() => userModule().email);
const qrCode = computed(() => `otpauth://totp/mealpedant:${email.value}?secret=${secret.value}&issuer=mealpedant&digits=6&period=30`);
const size = computed(() => mdAndUp.value ? 200 : 125);

const errorMessage = ref(undefined as su);
const userToken = ref(undefined as su);
const appLinks = [
	{
		href: 'https://apps.apple.com/us/app/microsoft-authenticator/id983156458',
		icon: mdiApple,
		platform: 'iOS'
	},
	{
		href: 'https://play.google.com/store/apps/details?id=com.azure.authenticator&hl=en_US',
		icon: mdiGooglePlay,
		platform: 'android'
	}
];

const cancel = async (): PV => {
	twoFAModule().set_secret(undefined);
	twoFAModule().set_setupProcessStarted(false);
	await axios_authenticatedUser.setupTwoFA_delete();
};

const verify = async (): PV => {
	if (!userToken.value) {
		errorMessage.value = 'code required';
		return;
	} else if (!(/^[0-9]{6}$/).test(userToken.value.replace(/\s/g, ''))) {
		errorMessage.value = 'code invalid';
		return;
	}
	const response = await axios_authenticatedUser.setupTwoFA_post({ token: userToken.value });
	if (response) {
		Promise.all([
			axios_authenticatedUser.setupTwoFA_delete(),
			twoFAModule().set_active(true),
			twoFAModule().set_secret(undefined),
			twoFAModule().set_setupProcessStarted(false)
		]);
		snackSuccess({ message: 'two factor authentication activated' });
	}
};

watch(userToken, (i) => {
	if (!i) errorMessage.value = undefined;
});

</script>
