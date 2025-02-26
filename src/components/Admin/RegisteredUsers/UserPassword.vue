<template>
	<div v-if='passwordResetDate'>
		<v-row justify='start' align='center' class='ma-0 pa-0' dense>
			<v-col cols='12' class='ma-0 pa-0'>
				<span class='smalltext'>{{ password_creation_ip }}</span>
			</v-col>
			<v-col cols='12' class='ma-0 pa-0'>
				<span class='smalltext'>{{ passwordResetDate }}</span>
			</v-col>
		</v-row>
		<v-row justify='start' align='center' class='ma-0 pa-0'>
			<v-col cols='auto' class='pa-0 ma-0'>
				<v-btn
					@click='copyString'
					class='ma-0 pa-0 fab-fix mr-6 black--text'
					color='primary'
					size='small'
					variant='text'
				>
					<v-icon size='x-small' color='primary' :icon='mdiContentCopy' />
					<span class='text-overline ml-1 text-primary'>copy</span>
				</v-btn>
			</v-col>
			<v-col cols='auto' class='pa-0 ma-0'>
				<v-btn
					@click='revoke'
					class='ma-0 pa-0 fab-fix'
					color='secondary'
					size='small'
					variant='text'
				>
					<v-icon size='small' :icon='mdiClose' />
					<span class='text-overline ml-1 text-secondary'>revoke</span>
				</v-btn>
			</v-col>
		</v-row>
	</div>
	<div v-else>
		<v-row justify='start' align='center' class='ma-0 pa-0'>
			<v-col cols='auto' class='pa-0 ma-0 mr-6'>
				<v-btn
					@click='force'
					class='ma-0 pa-0 fab-fix'
					color='mealtype'
					variant='text'
				>
					<v-icon size='small' :icon='mdiLockReset' />
					<span class='ml-1 text-mealtype'>force reset</span>
				</v-btn>
			</v-col>
		</v-row>
		<v-row justify='start' align='center' class='ma-0 pa-0 mt-n4'>
			<v-col cols='auto' class='pa-0 ma-0'>
				<v-switch
					v-model='withEmail'
					:color='withEmail?"mealtype":""'
				>
					<template v-slot:label>
						<span class='text-overline'>send email</span>
					</template>
				</v-switch>
			</v-col>
		</v-row>
	</div>
</template>

<script setup lang='ts'>
import { axios_admin } from '@/services/axios';
import { env } from '@/vanillaTS/env';
import { useClipboard } from '@vueuse/core';
import {
	mdiClose,
	mdiContentCopy,
	mdiLockReset
} from '@mdi/js';

const withEmail = ref(false);

const copyString = (): void => {
	useClipboard().copy(`${env.domain_www}/user/reset/${props.reset_string}`);
};
const force = async (): Promise<void> => {
	if (!props.password_reset_id) {
		await axios_admin.user_patch({
			patch: { reset: true },
			email: props.email 
		});
		await axios_admin.user_get();
	}
};
const revoke = async (): Promise<void> => {
	if (props.password_reset_id) {
		await axios_admin.user_patch({
			patch: { password_reset_id: props.password_reset_id },
			email: props.email 
		});
		await axios_admin.user_get();
	}
};

const props = defineProps<{
	passwordResetDate?: string;
	password_reset_id?: number;
	password_creation_ip?: string;
	reset_string?: string;
	email: string;
}>();

</script>