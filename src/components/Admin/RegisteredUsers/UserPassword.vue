<template>
	<div v-if='passwordResetDate'>
		<v-row align='center' class='ma-0 pa-0' dense justify='start'>
			<v-col class='ma-0 pa-0' cols='12'>
				<span class='smalltext'>{{ passwordCreationIp }}</span>
			</v-col>
			<v-col class='ma-0 pa-0' cols='12'>
				<span class='smalltext'>{{ passwordResetDate }}</span>
			</v-col>
		</v-row>
		<v-row align='center' class='ma-0 pa-0' justify='start'>
			<v-col class='pa-0 ma-0' cols='auto'>
				<v-btn
					class='ma-0 pa-0 fab-fix mr-6 text-black'
					color='primary'
					size='small'
					variant='text'
					@click='copyString'
				>
					<v-icon color='primary' :icon='mdiContentCopy' size='x-small' />
					<span class='text-overline ml-1 text-primary'>copy</span>
				</v-btn>
			</v-col>
			<v-col class='pa-0 ma-0' cols='auto'>
				<v-btn
					class='ma-0 pa-0 fab-fix'
					color='secondary'
					size='small'
					variant='text'
					@click='revoke'
				>
					<v-icon :icon='mdiClose' size='small' />
					<span class='text-overline ml-1 text-secondary'>revoke</span>
				</v-btn>
			</v-col>
		</v-row>
	</div>
	<div v-else>
		<v-row align='center' class='ma-0 pa-0' justify='start'>
			<v-col class='pa-0 ma-0 mr-6' cols='auto'>
				<v-btn class='ma-0 pa-0 fab-fix' color='mealtype' variant='text' @click='force'>
					<v-icon :icon='mdiLockReset' size='small' />
					<span class='ml-1 text-mealtype'>force reset</span>
				</v-btn>
			</v-col>
		</v-row>
		<v-row align='center' class='ma-0 pa-0 mt-n4' justify='start'>
			<v-col class='pa-0 ma-0' cols='auto'>
				<v-switch v-model='withEmail' :color='withEmail ? "mealtype" : ""'>
					<template #label>
						<span class='text-overline'>send email</span>
					</template>
				</v-switch>
			</v-col>
		</v-row>
	</div>
</template>

<script setup lang='ts'>
import type { PV } from '@/types'
import {
	mdiClose,
	mdiContentCopy,
	mdiLockReset,
} from '@mdi/js'
import { useClipboard } from '@vueuse/core'
import { axios_admin } from '@/services/axios'
import { env } from '@/vanillaTS/env'

const withEmail = ref(false)

function copyString (): void {
	useClipboard().copy(`${env.domain_www}/user/reset/${props.resetString}`)
}

async function force (): PV {
	if (!props.passwordResetId) {
		await axios_admin.user_patch({
			patch: { reset: true },
			email: props.email,
		})
		await axios_admin.user_get()
	}
}
async function revoke (): PV {
	if (props.passwordResetId) {
		await axios_admin.user_patch({
			patch: { password_reset_id: props.passwordResetId },
			email: props.email,
		})
		await axios_admin.user_get()
	}
}

const props = defineProps<{
	passwordResetDate?: string
	passwordResetId?: number
	passwordCreationIp?: string
	resetString?: string
	email: string
}>()

</script>
