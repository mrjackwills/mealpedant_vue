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
					x-small
					text
				>
					<v-icon small color='primary'> {{ mdiContentCopy }}</v-icon>
					<span class='text-overline ml-1 primary--text'>copy</span>
				</v-btn>
			</v-col>
			<v-col cols='auto' class='pa-0 ma-0'>
				<v-btn
					@click='revoke'
					class='ma-0 pa-0 fab-fix'
					color='secondary'
					small
					text
				>
					<v-icon small> {{ mdiClose }}</v-icon>
					<span class='text-overline ml-1 secondary--text'>revoke</span>
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
					text
				>
					<v-icon small> {{ mdiLockReset }}</v-icon>
					<span class='ml-1 mealtype--text'>force reset</span>
				</v-btn>
			</v-col>
		</v-row>
		<v-row justify='start' align='center' class='ma-0 pa-0 mt-n4'>
			<v-col cols='auto' class='pa-0 ma-0'>
				<v-switch
					v-model='withEmail'
					color='mealtype'
				>
					<span slot='label' class='text-overline'>send email</span>

				</v-switch>
			</v-col>
		</v-row>
	</div>
</template>

<script lang='ts'>
import Vue from 'vue';

import { axios_admin } from '@/services/axios';
import copy from 'clipboard-copy';
import { env } from '@/vanillaTS/env';
import {
	mdiClose,
	mdiContentCopy,
	mdiLockReset
} from '@mdi/js';

export default Vue.extend({
	name: 'user-table-password-column',
	computed: {},

	data: () => ({
		mdiClose,
		mdiContentCopy,
		mdiLockReset,
		withEmail: false
	}),

	methods: {
		copyString (): void {
			copy(`${env.domain_www}/user/reset/${this.reset_string}`);
		},
		async force (): Promise<void> {
			await axios_admin.user_patch({ patch: { reset: this.withEmail }, email: this.email });
			await axios_admin.user_get();
			this.withEmail = false;
		},
		async revoke (): Promise<void> {
			await axios_admin.user_patch({ patch: { password_reset_id: this.password_reset_id }, email: this.email });
			await axios_admin.user_get();
		}
	},

	props: {
		email: {
			type: String,
			required: true
		},
		password_creation_ip: {
			type: String,
			default: ''
		},
		passwordResetDate: {
			type: String,
			default: ''
		},
		password_reset_id: {
			type: Number,
		},
		reset_string: {
			type: String,
			default: ''
		}
	}
});
</script>